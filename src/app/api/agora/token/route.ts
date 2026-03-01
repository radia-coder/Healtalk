import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RtcRole, RtcTokenBuilder } from "agora-token";
import { z } from "zod";
import { parseJson } from "@/lib/validation";
import { requireRateLimit } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { AGORA_TOKEN_TTL_SECONDS } from "@/lib/constants";

const tokenSchema = z.object({
  appointmentId: z.string().min(1).optional(),
  sessionId: z.string().min(1).optional(),
}).refine(data => data.appointmentId || data.sessionId, {
  message: "Either appointmentId or sessionId must be provided",
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await requireRateLimit({
    request,
    key: "agora:token",
    limit: 60,
    window: "1 m",
  });
  if (rateLimit) return rateLimit;

  const csrfError = validateCsrf(request);
  if (csrfError) return csrfError;

  const { data, error } = await parseJson(request, tokenSchema);
  if (error) return error;
  const { appointmentId, sessionId } = data;

  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  if (!appId || !appCertificate) {
    return NextResponse.json(
      { error: "Agora configuration missing" },
      { status: 500 }
    );
  }

  let channelName: string;
  let isAuthorized = false;
  let isHost = false;

  // Handle appointment-based calls
  if (appointmentId) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: { select: { userId: true } },
        psychologist: { select: { userId: true } },
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    isAuthorized =
      appointment.patient?.userId === session.user.id ||
      appointment.psychologist?.userId === session.user.id;

    isHost = appointment.psychologist?.userId === session.user.id;
    channelName = appointment.id;
  }
  // Handle session-based calls
  else if (sessionId) {
    const therapySession = await prisma.therapySession.findUnique({
      where: { id: sessionId },
      include: {
        psychologist: { select: { userId: true } },
        participants: {
          include: {
            patient: { select: { userId: true } },
          },
        },
      },
    });

    if (!therapySession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Check if user is the psychologist (host)
    if (therapySession.psychologist?.userId === session.user.id) {
      isAuthorized = true;
      isHost = true;
    }
    // Check if user is a registered participant
    else {
      const isParticipant = therapySession.participants.some(
        (p) => p.patient.userId === session.user.id && p.status === "REGISTERED"
      );
      isAuthorized = isParticipant;
      isHost = false;
    }

    channelName = therapySession.id;
  } else {
    return NextResponse.json(
      { error: "Either appointmentId or sessionId required" },
      { status: 400 }
    );
  }

  if (!isAuthorized) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const account = session.user.id;
  const role = RtcRole.PUBLISHER;

  // Build a token valid for AGORA_TOKEN_TTL_SECONDS from now.
  // Both privilege expire times use the same value (join channel + publish).
  const token = RtcTokenBuilder.buildTokenWithUserAccount(
    appId,
    appCertificate,
    channelName,
    account,
    role,
    AGORA_TOKEN_TTL_SECONDS,
    AGORA_TOKEN_TTL_SECONDS
  );

  return NextResponse.json({
    appId,
    token,
    channelName,
    expiresIn: AGORA_TOKEN_TTL_SECONDS,
    isHost,
  });
}
