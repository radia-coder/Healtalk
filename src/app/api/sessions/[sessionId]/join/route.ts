import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireRateLimit } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";

class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// POST /api/sessions/[sessionId]/join - Register for session
export async function POST(
  request: Request,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "PATIENT") {
      return NextResponse.json(
        { error: "Only patients can join sessions" },
        { status: 403 }
      );
    }

    const rateLimit = await requireRateLimit({
      request,
      key: "sessions:join",
      limit: 20,
      window: "1 h",
    });
    if (rateLimit) return rateLimit;

    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const { sessionId } = await context.params;

    let patient = await prisma.patient.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!patient) {
      patient = await prisma.patient.create({
        data: { userId: session.user.id },
        select: { id: true },
      });
    }

    const participant = await prisma.$transaction(
      async (tx) => {
        // Lock the session row to prevent overbooking under concurrent joins.
        await tx.$executeRaw`SELECT 1 FROM "TherapySession" WHERE id = ${sessionId} FOR UPDATE`;

        const therapySession = await tx.therapySession.findUnique({
          where: { id: sessionId },
          include: {
            _count: {
              select: { participants: true },
            },
          },
        });

        if (!therapySession) {
          throw new HttpError(404, "Session not found");
        }

        if (therapySession.status !== "SCHEDULED") {
          throw new HttpError(400, "Cannot join this session");
        }

        if (therapySession.startTime < new Date()) {
          throw new HttpError(400, "Cannot join a session that already started");
        }

        if (therapySession._count.participants >= therapySession.maxParticipants) {
          throw new HttpError(400, "Session is full");
        }

        const existingParticipant = await tx.sessionParticipant.findUnique({
          where: {
            sessionId_patientId: {
              sessionId,
              patientId: patient.id,
            },
          },
        });

        if (existingParticipant) {
          throw new HttpError(400, "Already registered for this session");
        }

        return tx.sessionParticipant.create({
          data: {
            sessionId,
            patientId: patient.id,
            status: "REGISTERED",
          },
          include: {
            session: {
              include: {
                psychologist: {
                  include: {
                    user: {
                      select: { name: true, image: true },
                    },
                  },
                },
              },
            },
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    return NextResponse.json(
      {
        message: "Successfully registered for session",
        participant,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Already registered for this session" },
        { status: 400 }
      );
    }

    console.error("Error joining session:", error);
    return NextResponse.json(
      { error: "Failed to join session" },
      { status: 500 }
    );
  }
}

// DELETE /api/sessions/[sessionId]/join - Leave/cancel registration
export async function DELETE(
  request: Request,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "PATIENT") {
      return NextResponse.json(
        { error: "Only patients can leave sessions" },
        { status: 403 }
      );
    }

    const rateLimit = await requireRateLimit({
      request,
      key: "sessions:leave",
      limit: 20,
      window: "1 h",
    });
    if (rateLimit) return rateLimit;

    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const { sessionId } = await context.params;

    const patient = await prisma.patient.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient profile not found" },
        { status: 404 }
      );
    }

    const participant = await prisma.sessionParticipant.findUnique({
      where: {
        sessionId_patientId: {
          sessionId,
          patientId: patient.id,
        },
      },
      include: {
        session: true,
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "Not registered for this session" },
        { status: 404 }
      );
    }

    if (participant.session.status !== "SCHEDULED") {
      return NextResponse.json(
        { error: "Cannot leave a session that has already started or completed" },
        { status: 400 }
      );
    }

    const hoursUntilSession =
      (participant.session.startTime.getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntilSession < 24) {
      return NextResponse.json(
        { error: "Cannot cancel within 24 hours of session start" },
        { status: 400 }
      );
    }

    await prisma.sessionParticipant.delete({
      where: {
        sessionId_patientId: {
          sessionId,
          patientId: patient.id,
        },
      },
    });

    return NextResponse.json({
      message: "Successfully cancelled registration",
    });
  } catch (error) {
    console.error("Error leaving session:", error);
    return NextResponse.json(
      { error: "Failed to leave session" },
      { status: 500 }
    );
  }
}
