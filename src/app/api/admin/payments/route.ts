import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { parseSearchParams } from "@/lib/validation";
import { requireRateLimit } from "@/lib/rate-limit";
import { Prisma } from "@prisma/client";
import { PaymentStatus } from "@prisma/client";

const querySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  method: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(15),
});

const ALLOWED_STATUSES = ["PENDING", "PAID", "REFUNDED", "FAILED"];

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
    key: "admin:payments:list",
    limit: 120,
    window: "1 m",
  });
  if (rateLimit) return rateLimit;

  const { data, error } = parseSearchParams(request, querySchema);
  if (error) return error;

  const { search, status, method, page, limit } = data;

  const where: Prisma.PaymentWhereInput = {};

  if (status && status !== "ALL" && ALLOWED_STATUSES.includes(status)) {
    where.status = status as PaymentStatus;
  }

  if (method && method !== "ALL") {
    where.paymentMethod = method;
  }

  if (search) {
    where.OR = [
      {
        patient: {
          user: { name: { contains: search, mode: "insensitive" } },
        },
      },
      { invoiceNumber: { contains: search, mode: "insensitive" } },
    ];
  }

  const [payments, total] = await prisma.$transaction([
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        amount: true,
        status: true,
        paymentMethod: true,
        invoiceNumber: true,
        transactionId: true,
        createdAt: true,
        patient: {
          select: {
            user: { select: { name: true, email: true } },
          },
        },
        appointment: {
          select: {
            type: true,
            duration: true,
            date: true,
            psychologist: {
              select: {
                user: { select: { name: true } },
              },
            },
          },
        },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  // Compute totals
  const totals = await prisma.payment.aggregate({
    where: { status: "PAID" },
    _sum: { amount: true },
  });

  return NextResponse.json({
    payments,
    totalRevenue: totals._sum.amount || 0,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
