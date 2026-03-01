import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireRateLimit } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { z } from "zod";
import { parseJson } from "@/lib/validation";

const addFavoriteSchema = z.object({
  psychologistId: z.string().min(1),
});

const getSessionUserId = (user: unknown): string | null => {
  if (!user || typeof user !== "object") return null;
  const candidate = (user as { id?: unknown }).id;
  return typeof candidate === "string" ? candidate : null;
};

// GET /api/favorites - Get user's favorite psychologists
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await requireRateLimit({
      request,
      key: "favorites:list",
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

    // Get favorites with psychologist details
    const favorites = await prisma.favorite.findMany({
      where: { patientId: patient.id },
      include: {
        psychologist: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
            hospital: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(favorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 }
    );
  }
}

// POST /api/favorites - Add psychologist to favorites
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await requireRateLimit({
      request,
      key: "favorites:add",
      limit: 30,
      window: "1 m",
    });
    if (rateLimit) return rateLimit;

    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const { data: body, error } = await parseJson(request, addFavoriteSchema);
    if (error) return error;

    const { psychologistId } = body;
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

    // Check if psychologist exists
    const psychologist = await prisma.psychologist.findUnique({
      where: { id: psychologistId },
    });

    if (!psychologist) {
      return NextResponse.json({ error: "Psychologist not found" }, { status: 404 });
    }

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        patientId_psychologistId: {
          patientId: patient.id,
          psychologistId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Already in favorites" }, { status: 400 });
    }

    // Add to favorites
    const favorite = await prisma.favorite.create({
      data: {
        patientId: patient.id,
        psychologistId,
      },
      include: {
        psychologist: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    console.error("Error adding favorite:", error);
    return NextResponse.json(
      { error: "Failed to add favorite" },
      { status: 500 }
    );
  }
}

// DELETE /api/favorites - Remove psychologist from favorites
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await requireRateLimit({
      request,
      key: "favorites:remove",
      limit: 60,
      window: "1 m",
    });
    if (rateLimit) return rateLimit;

    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const { data: body, error } = await parseJson(request, addFavoriteSchema);
    if (error) return error;

    const { psychologistId } = body;
    const userId = getSessionUserId(session.user);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const patient = await prisma.patient.findUnique({
      where: { userId },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient profile not found" }, { status: 404 });
    }

    // Remove from favorites
    await prisma.favorite.delete({
      where: {
        patientId_psychologistId: {
          patientId: patient.id,
          psychologistId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing favorite:", error);
    return NextResponse.json(
      { error: "Failed to remove favorite" },
      { status: 500 }
    );
  }
}
