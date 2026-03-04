import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { parseJson } from "@/lib/validation";
import { requireRateLimit } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { createAuditLog } from "@/lib/audit";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  isSupabaseAuthMigrationEnabled,
  updateSupabaseUserPassword,
} from "@/lib/supabase-auth";

const updateSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "SUSPENDED"]),
  rejectionReason: z.string().optional(),
});

const editSchema = z.object({
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  bio: z.string().optional(),
  licenseNumber: z.string().trim().min(1).optional(),
  experience: z.number().int().min(0).optional(),
  location: z.string().optional().nullable(),
  languages: z.array(z.string().trim().min(1)).optional(),
  education: z
    .array(
      z.object({
        degree: z.string().trim().min(1),
        institution: z.string().trim().min(1),
        year: z.union([z.string().trim().min(1), z.number().int().min(0)]).optional(),
      })
    )
    .optional(),
  certifications: z
    .array(
      z.object({
        name: z.string().trim().min(1),
        issuer: z.string().trim().min(1),
        year: z.union([z.string().trim().min(1), z.number().int().min(0)]).optional(),
      })
    )
    .optional(),
  specializations: z.array(z.string().trim().min(1)).optional(),
  price60: z.number().int().min(0).optional(),
  price90: z.number().int().min(0).optional(),
  hospitalId: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "SUSPENDED"]).optional(),
  rejectionReason: z.string().optional(),
});

const applyStatusChange = (
  data: Prisma.PsychologistUpdateInput,
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED",
  rejectionReason: string
) => {
  data.status = status;

  if (status === "APPROVED") {
    data.approvedAt = new Date();
    data.rejectedAt = null;
    data.rejectionReason = null;
  }

  if (status === "REJECTED") {
    data.rejectedAt = new Date();
    data.rejectionReason = rejectionReason || null;
    data.approvedAt = null;
  }

  if (status === "PENDING") {
    data.approvedAt = null;
    data.rejectedAt = null;
    data.rejectionReason = null;
  }

  if (status === "SUSPENDED") {
    data.rejectedAt = null;
    data.rejectionReason = null;
  }
};

const splitName = (name: string | null) => {
  const safe = (name || "").trim();
  if (!safe) {
    return { firstName: "", lastName: "" };
  }

  const parts = safe.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }

  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts[parts.length - 1],
  };
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rateLimit = await requireRateLimit({
    request,
    key: "admin:psychologists:update",
    limit: 60,
    window: "1 m",
  });
  if (rateLimit) return rateLimit;

  const csrfError = validateCsrf(request);
  if (csrfError) return csrfError;

  const { data: body, error } = await parseJson(request, updateSchema);
  if (error) return error;
  const status = body.status;
  const rejectionReason = body.rejectionReason?.trim() || "";

  const existing = await prisma.psychologist.findUnique({
    where: { id: id },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Psychologist not found" }, { status: 404 });
  }

  const data: Prisma.PsychologistUpdateInput = {};
  applyStatusChange(data, status, rejectionReason);

  const updated = await prisma.psychologist.update({
    where: { id: id },
    data,
    select: {
      id: true,
      status: true,
      approvedAt: true,
      rejectedAt: true,
      rejectionReason: true,
    },
  });

  await createAuditLog({
    actorId: session.user.id,
    action: "ADMIN_PSYCHOLOGIST_UPDATE",
    targetType: "Psychologist",
    targetId: updated.id,
    metadata: {
      status: updated.status,
      rejectionReason: updated.rejectionReason ?? null,
    },
  });

  return NextResponse.json(updated);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rateLimit = await requireRateLimit({
    request,
    key: "admin:psychologists:edit",
    limit: 30,
    window: "1 m",
  });
  if (rateLimit) return rateLimit;

  const csrfError = validateCsrf(request);
  if (csrfError) return csrfError;

  const { data: body, error } = await parseJson(request, editSchema);
  if (error) return error;

  const hasAnyField = Object.values(body).some((value) => value !== undefined);
  if (!hasAnyField) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const existing = await prisma.psychologist.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          authProvider: true,
          supabaseAuthId: true,
        },
      },
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Psychologist not found" }, { status: 404 });
  }

  const nextEmail =
    body.email?.trim().toLowerCase() || existing.user?.email?.toLowerCase() || "";
  if (!nextEmail) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  if (nextEmail !== existing.user?.email?.toLowerCase()) {
    const duplicateEmailUser = await prisma.user.findFirst({
      where: {
        email: nextEmail,
        id: { not: existing.userId },
      },
      select: { id: true },
    });
    if (duplicateEmailUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }
  }

  const nextLicense = body.licenseNumber?.trim() || existing.licenseNumber;
  if (nextLicense !== existing.licenseNumber) {
    const duplicateLicense = await prisma.psychologist.findFirst({
      where: {
        licenseNumber: nextLicense,
        id: { not: existing.id },
      },
      select: { id: true },
    });
    if (duplicateLicense) {
      return NextResponse.json(
        { error: "This license number is already registered" },
        { status: 409 }
      );
    }
  }

  const userNameParts = splitName(existing.user?.name || "");
  const firstName = body.firstName?.trim() || userNameParts.firstName;
  const lastName = body.lastName?.trim() || userNameParts.lastName;
  if (!firstName || !lastName) {
    return NextResponse.json(
      { error: "First and last name are required" },
      { status: 400 }
    );
  }

  const userData: Prisma.UserUpdateInput = {
    name: `${firstName} ${lastName}`.trim(),
    email: nextEmail,
  };

  if (body.image !== undefined) {
    userData.image = body.image?.trim() || null;
  }

  if (body.password) {
    userData.password = await bcrypt.hash(body.password, 12);
  }

  const psychologistData: Prisma.PsychologistUpdateInput = {};
  if (body.bio !== undefined) {
    const bio = body.bio?.trim() || "";
    psychologistData.bio = bio;
    psychologistData.credentials = bio;
  }
  if (body.licenseNumber !== undefined) {
    psychologistData.licenseNumber = nextLicense;
  }
  if (body.experience !== undefined) {
    psychologistData.experience = Number.isFinite(body.experience)
      ? body.experience
      : 0;
  }
  if (body.location !== undefined) {
    psychologistData.location = body.location?.trim() || null;
  }
  if (body.languages !== undefined) {
    psychologistData.languages = body.languages;
  }
  if (body.education !== undefined) {
    psychologistData.education = body.education as Prisma.InputJsonValue;
  }
  if (body.certifications !== undefined) {
    psychologistData.certifications = body.certifications as Prisma.InputJsonValue;
  }
  if (body.specializations !== undefined) {
    psychologistData.specializations = body.specializations;
  }
  if (body.price60 !== undefined) {
    psychologistData.price60 = Number.isFinite(body.price60) ? body.price60 : 0;
  }
  if (body.price90 !== undefined) {
    psychologistData.price90 = Number.isFinite(body.price90) ? body.price90 : 0;
  }
  if (body.hospitalId !== undefined) {
    const hospitalId = body.hospitalId?.trim() || null;
    psychologistData.hospital = hospitalId
      ? { connect: { id: hospitalId } }
      : { disconnect: true };
  }

  const nextStatus = body.status;
  if (nextStatus) {
    applyStatusChange(
      psychologistData,
      nextStatus,
      body.rejectionReason?.trim() || ""
    );
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: existing.userId },
      data: userData,
    });

    return tx.psychologist.update({
      where: { id },
      data: psychologistData,
      select: {
        id: true,
        status: true,
        approvedAt: true,
        rejectedAt: true,
        rejectionReason: true,
        licenseNumber: true,
        experience: true,
        location: true,
        languages: true,
        education: true,
        certifications: true,
        specializations: true,
        price60: true,
        price90: true,
        credentials: true,
        bio: true,
        hospitalId: true,
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
  });

  if (
    body.password &&
    isSupabaseAuthMigrationEnabled() &&
    existing.user?.supabaseAuthId
  ) {
    const sync = await updateSupabaseUserPassword(
      existing.user.supabaseAuthId,
      body.password
    );

    if (!sync.ok && sync.error) {
      console.warn("Supabase password sync failed:", sync.error);
    } else if (existing.user.authProvider === "NEXTAUTH") {
      await prisma.user.update({
        where: { id: existing.userId },
        data: { authProvider: "HYBRID" },
      });
    }
  }

  await createAuditLog({
    actorId: session.user.id,
    action: "ADMIN_PSYCHOLOGIST_EDIT",
    targetType: "Psychologist",
    targetId: updated.id,
    metadata: {
      status: updated.status,
      email: updated.user.email,
      licenseNumber: updated.licenseNumber,
    },
  });

  return NextResponse.json(updated);
}
