import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { parseJson } from "@/lib/validation";
import { requireRateLimit } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";

const messageSchema = z.object({
  content: z.string().min(1),
});

interface RouteParams {
  params: Promise<{ appointmentId: string }>;
}

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

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: { select: { id: true, userId: true, user: { select: { name: true } } } },
      psychologist: { select: { id: true, userId: true, user: { select: { name: true } } } },
    },
  });

  if (!appointment) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  }

  const isParticipant =
    appointment.patient?.userId === session.user.id ||
    appointment.psychologist?.userId === session.user.id;

  if (!isParticipant) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.message.updateMany({
    where: {
      patientId: appointment.patient.id,
      psychologistId: appointment.psychologist.id,
      read: false,
      senderId: { not: session.user.id },
    },
    data: { read: true },
  });

  const messages = await prisma.message.findMany({
    where: {
      patientId: appointment.patient.id,
      psychologistId: appointment.psychologist.id,
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    appointment: {
      id: appointment.id,
      patientName: appointment.patient.user?.name || "Patient",
      psychologistName: appointment.psychologist.user?.name || "Psychologist",
      patientUserId: appointment.patient.userId,
      psychologistUserId: appointment.psychologist.userId,
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

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: { select: { id: true, userId: true } },
      psychologist: { select: { id: true, userId: true } },
    },
  });

  if (!appointment) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  }

  const isParticipant =
    appointment.patient?.userId === session.user.id ||
    appointment.psychologist?.userId === session.user.id;

  if (!isParticipant) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await parseJson(request, messageSchema);
  if (error) return error;
  const content = data.content.trim();

  const message = await prisma.message.create({
    data: {
      patientId: appointment.patient.id,
      psychologistId: appointment.psychologist.id,
      senderId: session.user.id,
      content,
    },
  });

  return NextResponse.json(message, { status: 201 });
}
