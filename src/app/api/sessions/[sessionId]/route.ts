import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import {
  Prisma,
  TherapySessionStatus,
  TherapySessionType,
} from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireRateLimit } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { parseJson } from "@/lib/validation";
import { z } from "zod";
import { parseDate, calculateDurationMinutes } from "@/lib/api-utils";

const updateSessionSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    type: z.nativeEnum(TherapySessionType).optional(),
    maxParticipants: z.coerce.number().int().min(1).max(10).optional(),
    date: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    duration: z.coerce.number().int().positive().optional(),
    pricePerPerson: z.coerce.number().int().min(0).optional(),
    status: z.nativeEnum(TherapySessionStatus).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

/** Wraps the shared parseDate helper into the {date, error} shape used by this route. */
const parseDateField = (value: string, field: string) => {
  const date = parseDate(value);
  if (!date) {
    return {
      date: null,
      error: NextResponse.json({ error: `Invalid ${field}` }, { status: 400 }),
    };
  }
  return { date, error: null };
};

// GET /api/sessions/[sessionId] - Get session details
export async function GET(
  request: Request,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await requireRateLimit({
      request,
      key: "sessions:get",
      limit: 60,
      window: "1 m",
    });
    if (rateLimit) return rateLimit;

    const { sessionId } = await context.params;

    const therapySession = await prisma.therapySession.findUnique({
      where: { id: sessionId },
      include: {
        psychologist: {
          include: {
            user: {
              select: { name: true, image: true },
            },
          },
        },
        participants: {
          include: {
            patient: {
              include: {
                user: {
                  select: { name: true, image: true },
                },
              },
            },
          },
        },
        _count: {
          select: { participants: true },
        },
      },
    });

    if (!therapySession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const availableSpots =
      therapySession.maxParticipants - therapySession._count.participants;
    const isFull =
      therapySession._count.participants >= therapySession.maxParticipants;

    return NextResponse.json({
      session: {
        ...therapySession,
        availableSpots,
        isFull,
      },
    });
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}

// PATCH /api/sessions/[sessionId] - Update session (psychologist only)
export async function PATCH(
  request: Request,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "PSYCHOLOGIST") {
      return NextResponse.json(
        { error: "Only psychologists can update sessions" },
        { status: 403 }
      );
    }

    const rateLimit = await requireRateLimit({
      request,
      key: "sessions:update",
      limit: 20,
      window: "1 h",
    });
    if (rateLimit) return rateLimit;

    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const { data, error } = await parseJson(request, updateSessionSchema);
    if (error) return error;

    const { sessionId } = await context.params;
    const psychologist = await prisma.psychologist.findUnique({
      where: { userId: session.user.id },
      select: { id: true, status: true },
    });

    if (!psychologist) {
      return NextResponse.json(
        { error: "Psychologist profile not found" },
        { status: 404 }
      );
    }

    if (psychologist.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Only approved psychologists can update sessions" },
        { status: 403 }
      );
    }

    const existingSession = await prisma.therapySession.findUnique({
      where: { id: sessionId },
    });

    if (!existingSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (existingSession.psychologistId !== psychologist.id) {
      return NextResponse.json(
        { error: "You can only update your own sessions" },
        { status: 403 }
      );
    }

    const nextType = data.type ?? existingSession.type;
    const nextMaxParticipants =
      data.maxParticipants ?? existingSession.maxParticipants;

    if (nextType === "ONE_ON_ONE" && nextMaxParticipants !== 1) {
      return NextResponse.json(
        { error: "One-on-one sessions must have exactly 1 participant" },
        { status: 400 }
      );
    }

    if (nextType === "GROUP" && nextMaxParticipants < 2) {
      return NextResponse.json(
        { error: "Group sessions must allow at least 2 participants" },
        { status: 400 }
      );
    }

    const parsedDate = data.date ? parseDateField(data.date, "date") : null;
    if (parsedDate?.error) return parsedDate.error;
    const parsedStart = data.startTime
      ? parseDateField(data.startTime, "startTime")
      : null;
    if (parsedStart?.error) return parsedStart.error;
    const parsedEnd = data.endTime ? parseDateField(data.endTime, "endTime") : null;
    if (parsedEnd?.error) return parsedEnd.error;

    const nextStartTime = (parsedStart?.date as Date) ?? existingSession.startTime;
    const nextEndTime = (parsedEnd?.date as Date) ?? existingSession.endTime;
    const nextDuration = data.duration ?? existingSession.duration;

    if (nextStartTime >= nextEndTime) {
      return NextResponse.json(
        { error: "Session end time must be after start time" },
        { status: 400 }
      );
    }

    if (nextStartTime < new Date()) {
      return NextResponse.json(
        { error: "Sessions must be scheduled in the future" },
        { status: 400 }
      );
    }

    // Verify duration field matches the actual gap between start and end times.
    const durationMinutes = calculateDurationMinutes(nextStartTime, nextEndTime);
    if (durationMinutes !== nextDuration) {
      return NextResponse.json(
        { error: "Duration must match start and end time" },
        { status: 400 }
      );
    }

    const updateData: Prisma.TherapySessionUpdateInput = {};
    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.description !== undefined) {
      updateData.description = data.description?.trim() || null;
    }
    if (data.type !== undefined) updateData.type = data.type;
    if (data.maxParticipants !== undefined) {
      updateData.maxParticipants = data.maxParticipants;
    }
    if (parsedDate?.date) updateData.date = parsedDate.date as Date;
    if (parsedStart?.date) updateData.startTime = parsedStart.date as Date;
    if (parsedEnd?.date) updateData.endTime = parsedEnd.date as Date;
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.pricePerPerson !== undefined) {
      updateData.pricePerPerson = data.pricePerPerson;
    }
    if (data.status !== undefined) updateData.status = data.status;

    const updatedSession = await prisma.therapySession.update({
      where: { id: sessionId },
      data: updateData,
      include: {
        psychologist: {
          include: {
            user: {
              select: { name: true, image: true },
            },
          },
        },
        participants: {
          include: {
            patient: {
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

    return NextResponse.json({ session: updatedSession });
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}

// DELETE /api/sessions/[sessionId] - Cancel session (psychologist only)
export async function DELETE(
  request: Request,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "PSYCHOLOGIST") {
      return NextResponse.json(
        { error: "Only psychologists can cancel sessions" },
        { status: 403 }
      );
    }

    const rateLimit = await requireRateLimit({
      request,
      key: "sessions:delete",
      limit: 10,
      window: "1 h",
    });
    if (rateLimit) return rateLimit;

    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const { sessionId } = await context.params;
    const psychologist = await prisma.psychologist.findUnique({
      where: { userId: session.user.id },
      select: { id: true, status: true },
    });

    if (!psychologist) {
      return NextResponse.json(
        { error: "Psychologist profile not found" },
        { status: 404 }
      );
    }

    if (psychologist.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Only approved psychologists can cancel sessions" },
        { status: 403 }
      );
    }

    const existingSession = await prisma.therapySession.findUnique({
      where: { id: sessionId },
      select: { id: true, psychologistId: true, status: true },
    });

    if (!existingSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (existingSession.psychologistId !== psychologist.id) {
      return NextResponse.json(
        { error: "You can only cancel your own sessions" },
        { status: 403 }
      );
    }

    if (existingSession.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Completed sessions cannot be cancelled" },
        { status: 400 }
      );
    }

    const cancelledSession = await prisma.therapySession.update({
      where: { id: sessionId },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({
      message: "Session cancelled successfully",
      session: cancelledSession,
    });
  } catch (error) {
    console.error("Error cancelling session:", error);
    return NextResponse.json(
      { error: "Failed to cancel session" },
      { status: 500 }
    );
  }
}
