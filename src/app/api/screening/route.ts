import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireRateLimit } from "@/lib/rate-limit";

// GET /api/screening - List all assessments for current patient
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await requireRateLimit({
      request,
      key: "screening:list",
      limit: 30,
      window: "1 m",
    });
    if (rateLimit) return rateLimit;

    const userId = session.user.id;

    const patient = await prisma.patient.findUnique({
      where: { userId },
    });

    if (!patient) {
      return NextResponse.json({ assessments: [] });
    }

    const assessments = await prisma.screeningAssessment.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        completedAt: true,
        riskLevel: true,
        aiSummary: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ assessments });
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessments" },
      { status: 500 }
    );
  }
}
