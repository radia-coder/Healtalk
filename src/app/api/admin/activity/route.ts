import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireRateLimit } from "@/lib/rate-limit";
import { getOrSetServerCache } from "@/lib/server-cache";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rateLimit = await requireRateLimit({
    request,
    key: "admin:activity",
    limit: 120,
    window: "1 m",
  });
  if (rateLimit) return rateLimit;

  const payload = await getOrSetServerCache("admin:activity:v1", 15_000, async () => {
    const appointments = await prisma.appointment.findMany({
      orderBy: { startTime: "desc" },
      take: 6,
      include: {
        patient: { select: { user: { select: { name: true } } } },
        psychologist: { select: { user: { select: { name: true } } } },
      },
    });

    return {
      items: appointments.map((appointment) => ({
        id: appointment.id,
        startTime: appointment.startTime,
        status: appointment.status,
        type: appointment.type,
        patientName: appointment.patient.user?.name || "Patient",
        psychologistName: appointment.psychologist.user?.name || "Psychologist",
      })),
    };
  });

  return NextResponse.json(payload);
}
