import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma, TherapySessionStatus, TherapySessionType } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireRateLimit } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { parseJson, parseSearchParams } from "@/lib/validation";
import { z } from "zod";
import { parseDate, calculateDurationMinutes } from "@/lib/api-utils";

const listSchema = z.object({
  type: z.nativeEnum(TherapySessionType).optional(),
  psychologistId: z.string().min(1).optional(),
  status: z.nativeEnum(TherapySessionStatus).optional(),
  fromDate: z.string().optional(),
});

const createSessionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  type: z.nativeEnum(TherapySessionType),
  maxParticipants: z.coerce.number().int().min(1).max(10),
  date: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  duration: z.coerce.number().int().positive(),
  pricePerPerson: z.coerce.number().int().min(0),
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

// GET /api/sessions - List sessions with filters
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await requireRateLimit({
      request,
      key: "sessions:list",
      limit: 60,
      window: "1 m",
    });
    if (rateLimit) return rateLimit;

    const { data, error } = parseSearchParams(request, listSchema);
    if (error) return error;

    const where: Prisma.TherapySessionWhereInput = {};
    if (data.type) where.type = data.type;
    if (data.psychologistId) where.psychologistId = data.psychologistId;
    if (data.status) where.status = data.status;

    if (data.fromDate) {
      const parsed = parseDateField(data.fromDate, "fromDate");
      if (parsed.error) return parsed.error;
      where.date = { gte: parsed.date as Date };
    }

    const sessions = await prisma.therapySession.findMany({
      where,
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
      orderBy: { startTime: "asc" },
    });

    const sessionsWithAvailability = sessions.map((item) => ({
      ...item,
      availableSpots: item.maxParticipants - item._count.participants,
      isFull: item._count.participants >= item.maxParticipants,
    }));

    return NextResponse.json({ sessions: sessionsWithAvailability });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

// POST /api/sessions - Create new session (psychologist only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "PSYCHOLOGIST") {
      return NextResponse.json(
        { error: "Only psychologists can create sessions" },
        { status: 403 }
      );
    }

    const rateLimit = await requireRateLimit({
      request,
      key: "sessions:create",
      limit: 10,
      window: "1 h",
    });
    if (rateLimit) return rateLimit;

    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const { data, error } = await parseJson(request, createSessionSchema);
    if (error) return error;

    const parsedDate = parseDateField(data.date, "date");
    if (parsedDate.error) return parsedDate.error;
    const parsedStart = parseDateField(data.startTime, "startTime");
    if (parsedStart.error) return parsedStart.error;
    const parsedEnd = parseDateField(data.endTime, "endTime");
    if (parsedEnd.error) return parsedEnd.error;

    const date = parsedDate.date as Date;
    const startTime = parsedStart.date as Date;
    const endTime = parsedEnd.date as Date;

    if (startTime >= endTime) {
      return NextResponse.json(
        { error: "Session end time must be after start time" },
        { status: 400 }
      );
    }

    if (startTime < new Date()) {
      return NextResponse.json(
        { error: "Sessions must be scheduled in the future" },
        { status: 400 }
      );
    }

    // Verify that duration field matches the actual gap between start and end times.
    const durationMinutes = calculateDurationMinutes(startTime, endTime);
    if (durationMinutes !== data.duration) {
      return NextResponse.json(
        { error: "Duration must match start and end time" },
        { status: 400 }
      );
    }

    if (data.type === "ONE_ON_ONE" && data.maxParticipants !== 1) {
      return NextResponse.json(
        { error: "One-on-one sessions must have exactly 1 participant" },
        { status: 400 }
      );
    }

    if (data.type === "GROUP" && data.maxParticipants < 2) {
      return NextResponse.json(
        { error: "Group sessions must allow at least 2 participants" },
        { status: 400 }
      );
    }

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
        { error: "Only approved psychologists can create sessions" },
        { status: 403 }
      );
    }

    const newSession = await prisma.therapySession.create({
      data: {
        psychologistId: psychologist.id,
        title: data.title.trim(),
        description: data.description?.trim() || null,
        type: data.type,
        maxParticipants: data.maxParticipants,
        date,
        startTime,
        endTime,
        duration: data.duration,
        pricePerPerson: data.pricePerPerson,
        status: "SCHEDULED",
      },
      include: {
        psychologist: {
          include: {
            user: {
              select: { name: true, image: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ session: newSession }, { status: 201 });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
