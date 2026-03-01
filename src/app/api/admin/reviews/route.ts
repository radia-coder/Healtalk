import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { parseSearchParams } from "@/lib/validation";
import { requireRateLimit } from "@/lib/rate-limit";
import { Prisma } from "@prisma/client";
import { ReviewStatus } from "@prisma/client";

const ALLOWED_STATUSES = ["APPROVED", "PENDING", "REJECTED"];
const querySchema = z.object({
  status: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

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
    key: "admin:reviews:list",
    limit: 120,
    window: "1 m",
  });
  if (rateLimit) return rateLimit;

  const { data, error } = parseSearchParams(request, querySchema);
  if (error) return error;
  const status = data.status || "";
  const search = data.search || "";
  const page = data.page;
  const limit = data.limit;

  const where: Prisma.ReviewWhereInput = {};

  if (status && status !== "ALL" && ALLOWED_STATUSES.includes(status)) {
    where.status = status as ReviewStatus;
  }

  if (search) {
    where.OR = [
      { comment: { contains: search, mode: "insensitive" } },
      { patient: { user: { name: { contains: search, mode: "insensitive" } } } },
      { psychologist: { user: { name: { contains: search, mode: "insensitive" } } } },
    ];
  }

  const [reviews, total] = await prisma.$transaction([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        rating: true,
        comment: true,
        status: true,
        moderatedAt: true,
        createdAt: true,
        patient: { select: { user: { select: { name: true, email: true } } } },
        psychologist: { select: { user: { select: { name: true, email: true } } } },
      },
    }),
    prisma.review.count({ where }),
  ]);

  return NextResponse.json({
    reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
