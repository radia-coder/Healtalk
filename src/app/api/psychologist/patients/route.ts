import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireRateLimit } from "@/lib/rate-limit";

const getSessionUserId = (user: unknown): string | null => {
  if (!user || typeof user !== "object") return null;
  const candidate = (user as { id?: unknown }).id;
  return typeof candidate === "string" ? candidate : null;
};

// GET /api/psychologist/patients - Get unique patients from appointments
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await requireRateLimit({
      request,
      key: "psychologist:patients",
      limit: 60,
      window: "1 m",
    });
    if (rateLimit) return rateLimit;

    const userId = getSessionUserId(session.user);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is a psychologist
    const psychologist = await prisma.psychologist.findUnique({
      where: { userId },
    });

    if (!psychologist) {
      return NextResponse.json(
        { error: "Only psychologists can access this endpoint" },
        { status: 403 }
      );
    }

    // Get unique patients from appointments
    const appointments = await prisma.appointment.findMany({
      where: {
        psychologistId: psychologist.id,
        status: { in: ["SCHEDULED", "COMPLETED"] } // Exclude cancelled/no-show
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { startTime: "desc" },
    });

    // Extract unique patients with their statistics
    const patientMap = new Map();

    appointments.forEach((appointment) => {
      const patientId = appointment.patient.id;

      if (!patientMap.has(patientId)) {
        patientMap.set(patientId, {
          id: patientId,
          userId: appointment.patient.userId,
          name: appointment.patient.user.name,
          image: appointment.patient.user.image,
          email: appointment.patient.user.email,
          totalSessions: 0,
          completedSessions: 0,
          upcomingSessions: 0,
          lastSessionDate: null,
          nextSessionDate: null,
          lastAppointmentId: null,
          nextAppointmentId: null,
        });
      }

      const patient = patientMap.get(patientId);
      patient.totalSessions++;

      if (appointment.status === "COMPLETED") {
        patient.completedSessions++;
        if (!patient.lastSessionDate || appointment.startTime > patient.lastSessionDate) {
          patient.lastSessionDate = appointment.startTime;
          patient.lastAppointmentId = appointment.id;
        }
      }

      if (appointment.status === "SCHEDULED") {
        patient.upcomingSessions++;
        if (!patient.nextSessionDate || appointment.startTime < patient.nextSessionDate) {
          patient.nextSessionDate = appointment.startTime;
          patient.nextAppointmentId = appointment.id;
        }
      }
    });

    const patients = Array.from(patientMap.values()).sort((a, b) => {
      // Sort by next session date (upcoming patients first), then by last session
      if (a.nextSessionDate && b.nextSessionDate) {
        return new Date(a.nextSessionDate).getTime() - new Date(b.nextSessionDate).getTime();
      }
      if (a.nextSessionDate) return -1;
      if (b.nextSessionDate) return 1;
      if (a.lastSessionDate && b.lastSessionDate) {
        return new Date(b.lastSessionDate).getTime() - new Date(a.lastSessionDate).getTime();
      }
      return 0;
    });

    return NextResponse.json(patients);
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { error: "Failed to fetch patients" },
      { status: 500 }
    );
  }
}
