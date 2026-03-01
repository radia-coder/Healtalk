import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type AuditPayload = {
  actorId?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown> | null;
};

export const createAuditLog = async ({
  actorId,
  action,
  targetType,
  targetId,
  metadata,
}: AuditPayload) => {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: actorId ?? null,
        action,
        targetType: targetType ?? null,
        targetId: targetId ?? null,
        metadata: metadata ? (metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
    });
  } catch (error) {
    console.error("Audit log error:", error);
  }
};
