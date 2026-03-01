import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const patient = await prisma.patient.findUnique({
    where: { userId },
    select: { id: true },
  });

  const psychologist = await prisma.psychologist.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!patient && !psychologist) {
    return NextResponse.json({ count: 0 });
  }

  const where: Prisma.MessageWhereInput = {
    read: false,
    senderId: { not: userId },
  };

  if (patient) {
    where.patientId = patient.id;
  }

  if (psychologist) {
    where.psychologistId = psychologist.id;
  }

  const count = await prisma.message.count({ where });

  return NextResponse.json({ count });
}
