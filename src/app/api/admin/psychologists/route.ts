import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { parseSearchParams } from "@/lib/validation";
import { requireRateLimit } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { PsychologistStatus } from "@prisma/client";

const ALLOWED_STATUSES = ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"];
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
    key: "admin:psychologists:list",
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

  const where: Prisma.PsychologistWhereInput = {};

  if (status && status !== "ALL" && ALLOWED_STATUSES.includes(status)) {
    where.status = status as PsychologistStatus;
  }

  if (search) {
    where.OR = [
      { user: { is: { name: { contains: search, mode: "insensitive" } } } },
      { user: { is: { email: { contains: search, mode: "insensitive" } } } },
      { licenseNumber: { contains: search, mode: "insensitive" } },
    ];
  }

  const [psychologists, total] = await prisma.$transaction([
    prisma.psychologist.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        credentials: true,
        licenseNumber: true,
        experience: true,
        specializations: true,
        status: true,
        approvedAt: true,
        rejectedAt: true,
        rejectionReason: true,
        createdAt: true,
        credentialDocumentKey: true,
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        hospital: {
          select: { name: true, location: true },
        },
      },
    }),
    prisma.psychologist.count({ where }),
  ]);

  const psychologistsData = psychologists.map(({ credentialDocumentKey, ...rest }) => ({
    ...rest,
    hasCredentialDocument: Boolean(credentialDocumentKey),
  }));

  return NextResponse.json({
    psychologists: psychologistsData,
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
    key: "admin:psychologists:create",
    limit: 20,
    window: "1 m",
  });
  if (rateLimit) return rateLimit;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const firstName = typeof body.firstName === "string" ? body.firstName : "";
  const lastName = typeof body.lastName === "string" ? body.lastName : "";
  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";
  const bio = typeof body.bio === "string" ? body.bio : "";
  const licenseNumber = typeof body.licenseNumber === "string" ? body.licenseNumber : "";
  const experience =
    typeof body.experience === "number" || typeof body.experience === "string"
      ? Number(body.experience)
      : 0;
  const specializations = Array.isArray(body.specializations)
    ? body.specializations.filter((item): item is string => typeof item === "string")
    : [];
  const price60 =
    typeof body.price60 === "number" || typeof body.price60 === "string"
      ? Number(body.price60)
      : 0;
  const price90 =
    typeof body.price90 === "number" || typeof body.price90 === "string"
      ? Number(body.price90)
      : 0;
  const hospitalId = typeof body.hospitalId === "string" ? body.hospitalId : "";
  const image = typeof body.image === "string" ? body.image : "";
  const status = typeof body.status === "string" ? body.status : "";

  if (!firstName?.trim() || !lastName?.trim()) {
    return NextResponse.json({ error: "First and last name are required" }, { status: 400 });
  }
  if (!email?.trim()) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }
  if (!licenseNumber?.trim()) {
    return NextResponse.json({ error: "License number is required" }, { status: 400 });
  }

  // Check for duplicate email or license
  const [existingUser, existingLicense] = await Promise.all([
    prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } }),
    prisma.psychologist.findUnique({ where: { licenseNumber: licenseNumber.trim() } }),
  ]);

  if (existingUser) {
    return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
  }
  if (existingLicense) {
    return NextResponse.json({ error: "This license number is already registered" }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name: `${firstName.trim()} ${lastName.trim()}`,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: "PSYCHOLOGIST",
      emailVerified: new Date(),
      image: image?.trim() || null,
      psychologist: {
        create: {
          credentials: bio?.trim() || "",
          licenseNumber: licenseNumber.trim(),
          experience: Number.isFinite(experience) ? experience : 0,
          bio: bio?.trim() || "",
          specializations,
          price60: Number.isFinite(price60) ? price60 : 0,
          price90: Number.isFinite(price90) ? price90 : 0,
          status: status === "APPROVED" ? "APPROVED" : "PENDING",
          approvedAt: status === "APPROVED" ? new Date() : null,
          hospitalId: hospitalId?.trim() || null,
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      psychologist: {
        select: { id: true, status: true, licenseNumber: true },
      },
    },
  });

  return NextResponse.json({ user }, { status: 201 });
}
