import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireRateLimit } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { z } from "zod";
import { parseJson } from "@/lib/validation";
import { Prisma } from "@prisma/client";

const createProgressSchema = z.object({
  mood: z.enum(["great", "good", "okay", "bad", "terrible"]),
  notes: z.string().optional().nullable(),
  goals: z.array(z.object({
    title: z.string(),
    completed: z.boolean(),
  })).optional().nullable(),
});

const getSessionUserId = (user: unknown): string | null => {
  if (!user || typeof user !== "object") return null;
  const candidate = (user as { id?: unknown }).id;
  return typeof candidate === "string" ? candidate : null;
};

// GET /api/progress - Get user's progress entries
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await requireRateLimit({
      request,
      key: "progress:list",
      limit: 120,
      window: "1 m",
    });
    if (rateLimit) return rateLimit;

    const userId = getSessionUserId(session.user);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get patient profile
    const patient = await prisma.patient.findUnique({
      where: { userId },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient profile not found" }, { status: 404 });
    }

    // Get progress entries
    const progress = await prisma.progress.findMany({
      where: { patientId: patient.id },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}

// POST /api/progress - Create progress entry
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await requireRateLimit({
      request,
      key: "progress:create",
      limit: 60,
      window: "1 m",
    });
    if (rateLimit) return rateLimit;

    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const { data: body, error } = await parseJson(request, createProgressSchema);
    if (error) return error;

    const { mood, notes, goals } = body;
    const userId = getSessionUserId(session.user);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create patient profile
    let patient = await prisma.patient.findUnique({
      where: { userId },
    });

    if (!patient) {
      patient = await prisma.patient.create({
        data: { userId },
      });
    }

    // Create progress entry
    const progress = await prisma.progress.create({
      data: {
        patientId: patient.id,
        mood,
        notes,
        goals: goals ?? Prisma.JsonNull,
      },
    });

    return NextResponse.json(progress, { status: 201 });
  } catch (error) {
    console.error("Error creating progress:", error);
    return NextResponse.json(
      { error: "Failed to create progress entry" },
      { status: 500 }
    );
  }
}
