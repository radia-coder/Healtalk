import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireRateLimit } from "@/lib/rate-limit";
import { Prisma } from "@prisma/client";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rateLimit = await requireRateLimit({
    request,
    key: "admin:hospitals:update",
    limit: 60,
    window: "1 m",
  });
  if (rateLimit) return rateLimit;

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const existing = await prisma.hospital.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
  }

  const updateData: Prisma.HospitalUpdateInput = {};
  if (typeof body.name === "string" && body.name.trim()) updateData.name = body.name.trim();
  if (typeof body.location === "string" && body.location.trim()) updateData.location = body.location.trim();
  if (typeof body.address === "string") updateData.address = body.address.trim();
  if (typeof body.status === "string" && ["active", "inactive"].includes(body.status)) {
    updateData.status = body.status;
  }

  const hospital = await prisma.hospital.update({ where: { id }, data: updateData });

  return NextResponse.json({ hospital });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rateLimit = await requireRateLimit({
    request,
    key: "admin:hospitals:delete",
    limit: 20,
    window: "1 m",
  });
  if (rateLimit) return rateLimit;

  const { id } = await params;

  const existing = await prisma.hospital.findUnique({
    where: { id },
    include: { _count: { select: { psychologists: true } } },
  });

  if (!existing) {
    return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
  }

  if (existing._count.psychologists > 0) {
    return NextResponse.json(
      {
        error: `Cannot delete: ${existing._count.psychologists} psychologist(s) are assigned to this hospital.`,
      },
      { status: 409 }
    );
  }

  await prisma.hospital.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
