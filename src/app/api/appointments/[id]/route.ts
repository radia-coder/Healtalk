import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import {
  appointmentCancellationEmail,
  appointmentRescheduleEmail,
} from "@/lib/appointment-emails";
import { z } from "zod";
import { parseJson } from "@/lib/validation";
import { requireRateLimit } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { createAuditLog } from "@/lib/audit";

const updateAppointmentSchema = z.object({
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  date: z.string().optional(),
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

  const rateLimit = await requireRateLimit({
    request,
    key: "appointments:update",
    limit: 60,
    window: "1 m",
  });
  if (rateLimit) return rateLimit;

  const csrfError = validateCsrf(request);
  if (csrfError) return csrfError;

  const appointment = await prisma.appointment.findUnique({
    where: { id: id },
    include: {
      patient: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
      psychologist: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!appointment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isAdmin = session.user.role === "ADMIN";
  const isParticipant =
    appointment.patient?.user?.id === session.user.id ||
    appointment.psychologist?.user?.id === session.user.id;

  if (!isAdmin && !isParticipant) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: body, error } = await parseJson(request, updateAppointmentSchema);
  if (error) return error;
  const { status, startTime, endTime, date } = body;

  const updateData: {
    status?: typeof status;
    startTime?: Date;
    endTime?: Date;
    date?: Date;
  } = {};

  if (status) {
    updateData.status = status;
  }

  if (startTime) {
    const parsed = new Date(startTime);
    if (Number.isNaN(parsed.getTime())) {
      return NextResponse.json({ error: "Invalid start time" }, { status: 400 });
    }
    updateData.startTime = parsed;
    updateData.date = parsed;
  }

  if (endTime) {
    const parsed = new Date(endTime);
    if (Number.isNaN(parsed.getTime())) {
      return NextResponse.json({ error: "Invalid end time" }, { status: 400 });
    }
    updateData.endTime = parsed;
  }

  if (date && !startTime) {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }
    updateData.date = parsed;
  }

  const updated = await prisma.appointment.update({
    where: { id: appointment.id },
    data: updateData,
    include: {
      patient: {
        include: { user: { select: { name: true, email: true } } },
      },
      psychologist: {
        include: { user: { select: { name: true, email: true } } },
      },
    },
  });

  await createAuditLog({
    actorId: session.user.id,
    action: "APPOINTMENT_UPDATE",
    targetType: "Appointment",
    targetId: updated.id,
    metadata: {
      status: updateData.status ?? null,
      startTime: updateData.startTime?.toISOString() ?? null,
      endTime: updateData.endTime?.toISOString() ?? null,
      date: updateData.date?.toISOString() ?? null,
    },
  });

  try {
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";

    const payload = {
      patientName: updated.patient?.user?.name || "Patient",
      psychologistName: updated.psychologist?.user?.name || "Psychologist",
      startTime: updated.startTime,
      endTime: updated.endTime,
      type: updated.type,
    };

    const patientEmail = updated.patient?.user?.email;
    const psychologistEmail = updated.psychologist?.user?.email;

    if (updateData.status === "CANCELLED") {
      if (patientEmail) {
        const message = appointmentCancellationEmail({
          ...payload,
          appUrl: `${appUrl}/patient/dashboard/appointments`,
        });
        await sendEmail({ to: patientEmail, ...message });
      }
      if (psychologistEmail) {
        const message = appointmentCancellationEmail({
          ...payload,
          appUrl: `${appUrl}/psychologist/dashboard/appointments`,
        });
        await sendEmail({ to: psychologistEmail, ...message });
      }
    } else if (updateData.startTime || updateData.endTime) {
      const previous = {
        startTime: appointment.startTime,
        endTime: appointment.endTime,
      };

      if (patientEmail) {
        const message = appointmentRescheduleEmail(
          { ...payload, appUrl: `${appUrl}/patient/dashboard/appointments` },
          previous
        );
        await sendEmail({ to: patientEmail, ...message });
      }

      if (psychologistEmail) {
        const message = appointmentRescheduleEmail(
          {
            ...payload,
            appUrl: `${appUrl}/psychologist/dashboard/appointments`,
          },
          previous
        );
        await sendEmail({ to: psychologistEmail, ...message });
      }
    }
  } catch (emailError) {
    console.error("Appointment update email error:", emailError);
  }

  return NextResponse.json(updated);
}
