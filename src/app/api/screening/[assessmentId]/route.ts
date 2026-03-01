import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireRateLimit } from "@/lib/rate-limit";

// GET /api/screening/[assessmentId] - Retrieve assessment results
export async function GET(
  request: Request,
  context: { params: Promise<{ assessmentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await requireRateLimit({
      request,
      key: "screening:get",
      limit: 30,
      window: "1 m",
    });
    if (rateLimit) return rateLimit;

    const { assessmentId } = await context.params;
    const userId = session.user.id;

    const assessment = await prisma.screeningAssessment.findUnique({
      where: { id: assessmentId },
      include: {
        patient: {
          select: { userId: true },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Verify ownership (patient can only view their own assessments)
    if (assessment.patient.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json({ assessment });
  } catch (error) {
    console.error("Error fetching assessment:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessment" },
      { status: 500 }
    );
  }
}
