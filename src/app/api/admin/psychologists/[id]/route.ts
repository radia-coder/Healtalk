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

const updateSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "SUSPENDED"]),
  rejectionReason: z.string().optional(),
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

  const data: Prisma.PsychologistUpdateInput = { status };

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
