import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireRateLimit } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { parseJson } from "@/lib/validation";
import { sendEmail } from "@/lib/email";
import { createAuditLog } from "@/lib/audit";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const saveAssessmentSchema = z.object({
  responses: z.array(z.unknown()).min(1),
  aiSummary: z.string().optional().nullable(),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRISIS"]),
  recommendedActions: z.array(z.string()).optional().nullable(),
});

// POST /api/screening/save - Save completed assessment
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const role = session.user.role;

    if (role !== "PATIENT") {
      return NextResponse.json(
        { error: "Only patients can save screening assessments" },
        { status: 403 }
      );
    }

    const rateLimit = await requireRateLimit({
      request,
      key: "screening:save",
      limit: 3,
      window: "1 d",
    });
    if (rateLimit) return rateLimit;

    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    // Get or create patient profile
    let patient = await prisma.patient.findUnique({
      where: { userId },
    });

    if (!patient) {
      patient = await prisma.patient.create({
        data: { userId },
      });
    }

    const { data, error } = await parseJson(request, saveAssessmentSchema);
    if (error) return error;
    const { responses, aiSummary, riskLevel, recommendedActions } = data;

    // Create assessment record
    const assessment = await prisma.screeningAssessment.create({
      data: {
        patientId: patient.id,
        completedAt: new Date(),
        responses: responses as Prisma.InputJsonValue,
        aiSummary: aiSummary || null,
        riskLevel,
        recommendedActions: recommendedActions || [],
      },
    });

    if (riskLevel === "CRISIS") {
      const adminUsers = await prisma.user.findMany({
        where: { role: "ADMIN", status: "ACTIVE" },
        select: { id: true, email: true, name: true },
      });

      const recipients = adminUsers
        .map((admin) => admin.email)
        .filter((value): value is string => Boolean(value));

      if (recipients.length > 0) {
        const appUrl =
          process.env.NEXT_PUBLIC_APP_URL ||
          process.env.NEXTAUTH_URL ||
          "http://localhost:3000";
        await sendEmail({
          to: recipients,
          subject: "Urgent: Crisis Screening Assessment",
          text: `A patient submitted a CRISIS risk screening assessment.\nAssessment ID: ${assessment.id}\nPatient ID: ${patient.id}\nReview immediately in the admin dashboard: ${appUrl}/admin/dashboard/reports`,
          html: `
            <p><strong>Urgent:</strong> A patient submitted a <strong>CRISIS</strong> risk screening assessment.</p>
            <p><strong>Assessment ID:</strong> ${assessment.id}</p>
            <p><strong>Patient ID:</strong> ${patient.id}</p>
            <p><a href="${appUrl}/admin/dashboard/reports">Open admin reports dashboard</a></p>
          `,
        });
      }

      await createAuditLog({
        actorId: userId,
        action: "SCREENING_CRISIS_ALERT",
        targetType: "ScreeningAssessment",
        targetId: assessment.id,
        metadata: {
          riskLevel,
          patientId: patient.id,
          notifiedAdminCount: recipients.length,
        },
      });
    }

    return NextResponse.json({
      message: "Assessment saved successfully",
      assessment: {
        id: assessment.id,
        riskLevel: assessment.riskLevel,
        completedAt: assessment.completedAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error saving assessment:", error);
    return NextResponse.json(
      { error: "Failed to save assessment" },
      { status: 500 }
    );
  }
}
