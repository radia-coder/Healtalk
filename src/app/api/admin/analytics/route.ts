import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { parseSearchParams } from "@/lib/validation";
import { requireRateLimit } from "@/lib/rate-limit";
import { getOrSetServerCache } from "@/lib/server-cache";

const MONTH_RANGE_OPTIONS = [6, 12];
const querySchema = z.object({
  range: z.coerce.number().int().optional(),
});

const getMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const buildMonths = (count: number) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (count - 1), 1);
  const months = [] as Array<{
    key: string;
    label: string;
    appointments: number;
    revenue: number;
    users: number;
    patients: number;
    psychologists: number;
  }>;

  for (let i = 0; i < count; i += 1) {
    const date = new Date(start.getFullYear(), start.getMonth() + i, 1);
    months.push({
      key: getMonthKey(date),
      label: date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      appointments: 0,
      revenue: 0,
      users: 0,
      patients: 0,
      psychologists: 0,
    });
  }

  return { months, start };
};

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
    key: "admin:analytics",
    limit: 120,
    window: "1 m",
  });
  if (rateLimit) return rateLimit;

  const { data, error } = parseSearchParams(request, querySchema);
  if (error) return error;
  const rangeParam = Number(data.range ?? 6);
  const rangeMonths = MONTH_RANGE_OPTIONS.includes(rangeParam) ? rangeParam : 6;

  const payload = await getOrSetServerCache(
    `admin:analytics:${rangeMonths}:v1`,
    30_000,
    async () => {
      const { months, start } = buildMonths(rangeMonths);
      const monthMap = new Map(months.map((month) => [month.key, month]));

      const [
        appointments,
        payments,
        users,
        totalAppointments,
        totalRevenue,
        totalUsers,
        totalPatients,
        totalPsychologists,
        topGroups,
      ] = await Promise.all([
        prisma.appointment.findMany({
          where: { startTime: { gte: start } },
          select: { startTime: true },
        }),
        prisma.payment.findMany({
          where: { status: "PAID", createdAt: { gte: start } },
          select: { amount: true, createdAt: true },
        }),
        prisma.user.findMany({
          where: {
            role: { in: ["PATIENT", "PSYCHOLOGIST"] },
            createdAt: { gte: start },
          },
          select: { createdAt: true, role: true },
        }),
        prisma.appointment.count(),
        prisma.payment.aggregate({
          where: { status: "PAID" },
          _sum: { amount: true },
        }),
        prisma.user.count({ where: { role: { in: ["PATIENT", "PSYCHOLOGIST"] } } }),
        prisma.user.count({ where: { role: "PATIENT" } }),
        prisma.user.count({ where: { role: "PSYCHOLOGIST" } }),
        prisma.appointment.groupBy({
          by: ["psychologistId"],
          where: { startTime: { gte: start } },
          _count: { _all: true },
          orderBy: { psychologistId: "desc" },
          take: 5,
        }),
      ]);

      appointments.forEach((appointment) => {
        const key = getMonthKey(appointment.startTime);
        const bucket = monthMap.get(key);
        if (bucket) bucket.appointments += 1;
      });

      payments.forEach((payment) => {
        const key = getMonthKey(payment.createdAt);
        const bucket = monthMap.get(key);
        if (bucket) bucket.revenue += payment.amount || 0;
      });

      users.forEach((user) => {
        const key = getMonthKey(user.createdAt);
        const bucket = monthMap.get(key);
        if (!bucket) return;
        bucket.users += 1;
        if (user.role === "PATIENT") bucket.patients += 1;
        if (user.role === "PSYCHOLOGIST") bucket.psychologists += 1;
      });

      const psychologistIds = topGroups.map((group) => group.psychologistId);
      const psychologists = psychologistIds.length
        ? await prisma.psychologist.findMany({
            where: { id: { in: psychologistIds } },
            select: { id: true, user: { select: { name: true } } },
          })
        : [];
      const psychologistMap = new Map(
        psychologists.map((item) => [item.id, item.user?.name || "Psychologist"])
      );

      const topPsychologists = topGroups.map((group) => ({
        id: group.psychologistId,
        name: psychologistMap.get(group.psychologistId) || "Psychologist",
        appointments: group._count._all,
      }));

      return {
        rangeMonths,
        months,
        totals: {
          totalAppointments,
          totalRevenue: totalRevenue._sum.amount ?? 0,
          totalUsers,
          totalPatients,
          totalPsychologists,
        },
        topPsychologists,
      };
    }
  );

  return NextResponse.json(payload);
}
