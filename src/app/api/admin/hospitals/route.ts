import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { parseSearchParams } from "@/lib/validation";
import { requireRateLimit } from "@/lib/rate-limit";
import { Prisma } from "@prisma/client";

const querySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
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
    key: "admin:hospitals",
    limit: 120,
    window: "1 m",
  });
  if (rateLimit) return rateLimit;

  const { data, error } = parseSearchParams(request, querySchema);
  if (error) return error;
  const search = data.search || "";
  const status = data.status || "";
  const page = data.page;
  const limit = data.limit;

  const where: Prisma.HospitalWhereInput = {};

  if (status && status !== "ALL") {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { location: { contains: search, mode: "insensitive" } },
      { address: { contains: search, mode: "insensitive" } },
    ];
  }

  const [hospitals, total] = await prisma.$transaction([
    prisma.hospital.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: { select: { psychologists: true } },
      },
    }),
    prisma.hospital.count({ where }),
  ]);

  return NextResponse.json({
    hospitals: hospitals.map((hospital) => ({
      id: hospital.id,
      name: hospital.name,
      location: hospital.location,
      address: hospital.address,
      status: hospital.status,
      createdAt: hospital.createdAt,
      psychologistCount: hospital._count.psychologists,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rateLimit = await requireRateLimit({
    request,
    key: "admin:hospitals:create",
    limit: 30,
    window: "1 m",
  });
  if (rateLimit) return rateLimit;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "Hospital name is required" }, { status: 400 });
  }
  if (typeof body.location !== "string" || !body.location.trim()) {
    return NextResponse.json({ error: "Location is required" }, { status: 400 });
  }

  const hospital = await prisma.hospital.create({
    data: {
      name: body.name.trim(),
      location: body.location.trim(),
      address: typeof body.address === "string" ? body.address.trim() : "",
      status: body.status === "inactive" ? "inactive" : "active",
    },
  });

  return NextResponse.json({ hospital }, { status: 201 });
}
