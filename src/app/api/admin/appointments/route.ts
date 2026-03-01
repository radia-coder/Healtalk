import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { parseSearchParams } from "@/lib/validation";
import { requireRateLimit } from "@/lib/rate-limit";
import { Prisma } from "@prisma/client";
import { AppointmentStatus, AppointmentType } from "@prisma/client";

const querySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(15),
});

const ALLOWED_STATUSES = ["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"];
const ALLOWED_TYPES = ["VIDEO", "AUDIO", "IN_PERSON"];

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
    key: "admin:appointments:list",
    limit: 120,
    window: "1 m",
  });
  if (rateLimit) return rateLimit;

  const { data, error } = parseSearchParams(request, querySchema);
  if (error) return error;

  const { search, status, type, page, limit } = data;

  const where: Prisma.AppointmentWhereInput = {};

  if (status && status !== "ALL" && ALLOWED_STATUSES.includes(status)) {
    where.status = status as AppointmentStatus;
  }

  if (type && type !== "ALL" && ALLOWED_TYPES.includes(type)) {
    where.type = type as AppointmentType;
  }

  if (search) {
    where.OR = [
      {
        patient: {
          user: { name: { contains: search, mode: "insensitive" } },
        },
      },
      {
        psychologist: {
          user: { name: { contains: search, mode: "insensitive" } },
        },
      },
    ];
  }

  const [appointments, total] = await prisma.$transaction([
    prisma.appointment.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
        type: true,
        duration: true,
        status: true,
        price: true,
        notes: true,
        createdAt: true,
        patient: {
          select: {
            id: true,
            user: { select: { name: true, email: true, image: true } },
          },
        },
        psychologist: {
          select: {
            id: true,
            user: { select: { name: true, email: true, image: true } },
          },
        },
        payment: {
          select: { status: true, paymentMethod: true, amount: true },
        },
      },
    }),
    prisma.appointment.count({ where }),
  ]);

  return NextResponse.json({
    appointments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
