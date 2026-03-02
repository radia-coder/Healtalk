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
  const hasStartTime = typeof startTime === "string";
  const hasEndTime = typeof endTime === "string";
  const isReschedule = hasStartTime || hasEndTime;
  const hasStatusUpdate = typeof status === "string";

  const updateData: {
    status?: typeof status;
    startTime?: Date;
    endTime?: Date;
    date?: Date;
  } = {};

  if (!hasStatusUpdate && !isReschedule) {
    return NextResponse.json(
      { error: "No valid appointment updates were provided." },
      { status: 400 }
    );
  }

  if (hasStatusUpdate && isReschedule) {
    return NextResponse.json(
      { error: "Submit either a status update or a reschedule, not both." },
      { status: 400 }
    );
  }

  if (hasStatusUpdate) {
    if (!isAdmin && status !== "CANCELLED") {
      return NextResponse.json(
        { error: "Only admins can set this appointment status." },
        { status: 403 }
      );
    }

    if (status === "CANCELLED") {
      if (appointment.status !== "SCHEDULED") {
        return NextResponse.json(
          { error: "Only scheduled appointments can be cancelled." },
          { status: 400 }
        );
      }

      if (appointment.startTime <= new Date()) {
        return NextResponse.json(
          { error: "Cannot cancel an appointment that already started." },
          { status: 400 }
        );
      }
    }

    updateData.status = status;
  }

  if (isReschedule) {
    if (!hasStartTime || !hasEndTime) {
      return NextResponse.json(
        { error: "Both start time and end time are required to reschedule." },
        { status: 400 }
      );
    }

    if (appointment.status !== "SCHEDULED") {
      return NextResponse.json(
        { error: "Only scheduled appointments can be rescheduled." },
        { status: 400 }
      );
    }

    const parsedStart = new Date(startTime);
    const parsedEnd = new Date(endTime);

    if (Number.isNaN(parsedStart.getTime()) || Number.isNaN(parsedEnd.getTime())) {
      return NextResponse.json(
        { error: "Invalid reschedule date/time." },
        { status: 400 }
      );
    }

    if (parsedStart >= parsedEnd) {
      return NextResponse.json(
        { error: "Appointment end time must be after start time." },
        { status: 400 }
      );
    }

    if (parsedStart <= new Date()) {
      return NextResponse.json(
        { error: "Appointments must be scheduled in the future." },
        { status: 400 }
      );
    }

    const originalDuration = Math.round(
      (appointment.endTime.getTime() - appointment.startTime.getTime()) / 60000
    );
    const nextDuration = Math.round(
      (parsedEnd.getTime() - parsedStart.getTime()) / 60000
    );
    if (nextDuration !== originalDuration) {
      return NextResponse.json(
        { error: `Rescheduled duration must stay ${originalDuration} minutes.` },
        { status: 400 }
      );
    }

    if (date) {
      const parsedDate = new Date(date);
      if (Number.isNaN(parsedDate.getTime())) {
        return NextResponse.json({ error: "Invalid date" }, { status: 400 });
      }
      if (parsedDate.toDateString() !== parsedStart.toDateString()) {
        return NextResponse.json(
          { error: "Date must match appointment start time." },
          { status: 400 }
        );
      }
    }

    const [psychologistConflict, patientConflict] = await Promise.all([
      prisma.appointment.findFirst({
        where: {
          id: { not: appointment.id },
          psychologistId: appointment.psychologistId,
          status: "SCHEDULED",
          startTime: { lt: parsedEnd },
          endTime: { gt: parsedStart },
        },
        select: { id: true },
      }),
      prisma.appointment.findFirst({
        where: {
          id: { not: appointment.id },
          patientId: appointment.patientId,
          status: "SCHEDULED",
          startTime: { lt: parsedEnd },
          endTime: { gt: parsedStart },
        },
        select: { id: true },
      }),
    ]);

    if (psychologistConflict) {
      return NextResponse.json(
        { error: "Selected time is no longer available." },
        { status: 409 }
      );
    }

    if (patientConflict) {
      return NextResponse.json(
        { error: "You already have another appointment at this time." },
        { status: 409 }
      );
    }

    updateData.startTime = parsedStart;
    updateData.endTime = parsedEnd;
    updateData.date = parsedStart;
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
