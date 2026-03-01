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

const ALLOWED_ROLES = ["PATIENT", "PSYCHOLOGIST", "ADMIN"];
const ALLOWED_STATUSES = ["ACTIVE", "SUSPENDED", "BANNED"];
const updateSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  role: z.enum(["PATIENT", "PSYCHOLOGIST", "ADMIN"]).optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "BANNED"]).optional(),
});

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
    key: "admin:users:update",
    limit: 60,
    window: "1 m",
  });
  if (rateLimit) return rateLimit;

  const csrfError = validateCsrf(request);
  if (csrfError) return csrfError;

  const { data: body, error } = await parseJson(request, updateSchema);
  if (error) return error;
  const name = body.name?.trim() || "";
  const email = body.email?.trim().toLowerCase() || "";
  const phone = body.phone?.trim() || "";
  const role = body.role || "";
  const status = body.status || "";

  const user = await prisma.user.findUnique({
    where: { id: id },
    select: { id: true, email: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (email && email !== user.email) {
    const existingEmail = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingEmail) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }
  }

  const data: Prisma.UserUpdateInput = {};

  if (name) data.name = name;
  if (email) data.email = email;
  if (phone) data.phone = phone;
  if (role && ALLOWED_ROLES.includes(role)) data.role = role;

  if (status && ALLOWED_STATUSES.includes(status)) {
    data.status = status;
    if (status === "ACTIVE") {
      data.suspendedAt = null;
      data.bannedAt = null;
    }
    if (status === "SUSPENDED") {
      data.suspendedAt = new Date();
      data.bannedAt = null;
    }
    if (status === "BANNED") {
      data.bannedAt = new Date();
      data.suspendedAt = null;
    }
  }

  const updated = await prisma.user.update({
    where: { id: id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      phone: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  await createAuditLog({
    actorId: session.user.id,
    action: "ADMIN_USER_UPDATE",
    targetType: "User",
    targetId: updated.id,
    metadata: {
      role: updated.role,
      status: updated.status,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
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
    key: "admin:users:delete",
    limit: 30,
    window: "1 m",
  });
  if (rateLimit) return rateLimit;

  const csrfError = validateCsrf(request);
  if (csrfError) return csrfError;

  await prisma.user.delete({ where: { id: id } });

  await createAuditLog({
    actorId: session.user.id,
    action: "ADMIN_USER_DELETE",
    targetType: "User",
    targetId: id,
  });

  return NextResponse.json({ ok: true });
}
