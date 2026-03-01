import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireRateLimit } from "@/lib/rate-limit";
import { getOrSetServerCache } from "@/lib/server-cache";
import { ADMIN_CACHE_TTL_MS } from "@/lib/constants";

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
    key: "admin:metrics",
    limit: 120,
    window: "1 m",
  });
  if (rateLimit) return rateLimit;

  // Cache the aggregated metrics for ADMIN_CACHE_TTL_MS to avoid hammering the DB
  // on every dashboard refresh. The ":v1" suffix lets us bust the cache by bumping
  // the version if the shape of the payload ever changes.
  const payload = await getOrSetServerCache("admin:metrics:v1", ADMIN_CACHE_TTL_MS, async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalPsychologists,
      approvedPsychologists,
      pendingPsychologists,
      totalPatients,
      totalHospitals,
      totalAppointments,
      thisMonthAppointments,
      paidRevenue,
      monthRevenue,
      activePatientGroups,
    ] = await prisma.$transaction([
      prisma.psychologist.count(),
      prisma.psychologist.count({ where: { status: "APPROVED" } }),
      prisma.psychologist.count({ where: { status: "PENDING" } }),
      prisma.patient.count(),
      prisma.hospital.count(),
      prisma.appointment.count(),
      prisma.appointment.count({
        where: { startTime: { gte: startOfMonth } },
      }),
      prisma.payment.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { status: "PAID", createdAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.appointment.findMany({
        where: { startTime: { gte: startOfMonth } },
        select: { patientId: true },
        distinct: ["patientId"],
      }),
    ]);

    return {
      totalPsychologists,
      activePsychologists: approvedPsychologists,
      pendingApprovals: pendingPsychologists,
      totalPatients,
      activePatients: activePatientGroups.length,
      totalHospitals,
      totalAppointments,
      thisMonthAppointments,
      totalRevenue: paidRevenue._sum.amount ?? 0,
      thisMonthRevenue: monthRevenue._sum.amount ?? 0,
    };
  });

  return NextResponse.json(payload);
}
