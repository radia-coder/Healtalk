import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { parseJson } from "@/lib/validation";
import { requireRateLimit } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { buildDirectConversationId, parseDirectConversationId } from "@/lib/messaging";

const messageSchema = z
  .object({
    content: z.string().optional().default(""),
    attachment: z
      .object({
        url: z.string().url(),
        type: z.string().max(255).nullable().optional(),
        name: z.string().max(255).nullable().optional(),
      })
      .nullable()
      .optional(),
  })
  .superRefine((data, ctx) => {
    const hasContent = Boolean(data.content?.trim());
    const hasAttachment = Boolean(data.attachment?.url);
    if (!hasContent && !hasAttachment) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["content"],
        message: "Message content or attachment is required",
      });
    }
  });

interface RouteParams {
  params: Promise<{ appointmentId: string }>;
}

type ConversationContext = {
  id: string;
  patientId: string;
  psychologistId: string;
  patientUserId: string;
  psychologistUserId: string;
  patientName: string;
  psychologistName: string;
};

const resolveConversation = async (
  conversationId: string,
  currentUserId: string
): Promise<
  | { ok: true; context: ConversationContext }
  | { ok: false; status: number; error: string }
> => {
  const directConversation = parseDirectConversationId(conversationId);
  if (directConversation) {
    const [patient, psychologist] = await Promise.all([
      prisma.patient.findUnique({
        where: { id: directConversation.patientId },
        include: { user: { select: { id: true, name: true } } },
      }),
      prisma.psychologist.findUnique({
        where: { id: directConversation.psychologistId },
        include: { user: { select: { id: true, name: true } } },
      }),
    ]);

    if (!patient || !psychologist) {
      return { ok: false, status: 404, error: "Conversation not found" };
    }

    const isParticipant =
      patient.userId === currentUserId || psychologist.userId === currentUserId;
    if (!isParticipant) {
      return { ok: false, status: 403, error: "Forbidden" };
    }

    return {
      ok: true,
      context: {
        id: buildDirectConversationId(patient.id, psychologist.id),
        patientId: patient.id,
        psychologistId: psychologist.id,
        patientUserId: patient.userId,
        psychologistUserId: psychologist.userId,
        patientName: patient.user?.name || "Patient",
        psychologistName: psychologist.user?.name || "Psychologist",
      },
    };
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: conversationId },
    include: {
      patient: { select: { id: true, userId: true, user: { select: { name: true } } } },
      psychologist: { select: { id: true, userId: true, user: { select: { name: true } } } },
    },
  });

  if (!appointment) {
    return { ok: false, status: 404, error: "Appointment not found" };
  }

  const isParticipant =
    appointment.patient?.userId === currentUserId ||
    appointment.psychologist?.userId === currentUserId;

  if (!isParticipant) {
    return { ok: false, status: 403, error: "Forbidden" };
  }

  return {
    ok: true,
    context: {
      id: appointment.id,
      patientId: appointment.patient.id,
      psychologistId: appointment.psychologist.id,
      patientUserId: appointment.patient.userId,
      psychologistUserId: appointment.psychologist.userId,
      patientName: appointment.patient.user?.name || "Patient",
      psychologistName: appointment.psychologist.user?.name || "Psychologist",
    },
  };
};

export async function GET(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await requireRateLimit({
    request,
    key: "messages:read",
    limit: 120,
    window: "1 m",
  });
  if (rateLimit) return rateLimit;

  const { appointmentId } = await params;
  const resolved = await resolveConversation(appointmentId, session.user.id);
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }
  const context = resolved.context;

  await prisma.message.updateMany({
    where: {
      patientId: context.patientId,
      psychologistId: context.psychologistId,
      read: false,
      senderId: { not: session.user.id },
    },
    data: { read: true },
  });

  const messages = await prisma.message.findMany({
    where: {
      patientId: context.patientId,
      psychologistId: context.psychologistId,
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    appointment: {
      id: context.id,
      patientName: context.patientName,
      psychologistName: context.psychologistName,
      patientUserId: context.patientUserId,
      psychologistUserId: context.psychologistUserId,
    },
    messages,
  });
}

export async function POST(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await requireRateLimit({
    request,
    key: "messages:send",
    limit: 60,
    window: "1 m",
  });
  if (rateLimit) return rateLimit;

  const csrfError = validateCsrf(request);
  if (csrfError) return csrfError;

  const { appointmentId } = await params;
  const resolved = await resolveConversation(appointmentId, session.user.id);
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }
  const context = resolved.context;

  const { data, error } = await parseJson(request, messageSchema);
  if (error) return error;
  const content = data.content.trim();
  const attachment = data.attachment ?? null;

  const message = await prisma.message.create({
    data: {
      patientId: context.patientId,
      psychologistId: context.psychologistId,
      senderId: session.user.id,
      content: content || (attachment ? "Attachment" : ""),
      attachmentUrl: attachment?.url || null,
      attachmentType: attachment?.type || null,
      attachmentName: attachment?.name || null,
    },
  });

  return NextResponse.json(message, { status: 201 });
}
