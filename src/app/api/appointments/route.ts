import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { appointmentConfirmationEmail } from "@/lib/appointment-emails";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { parseJson, parseSearchParams } from "@/lib/validation";
import { requireRateLimit } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";

const appointmentQuerySchema = z.object({
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
});

const createAppointmentSchema = z.object({
  psychologistId: z.string().min(1),
  date: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  duration: z.coerce.number().int().positive(),
  type: z.enum(["VIDEO", "AUDIO", "IN_PERSON"]).optional().default("VIDEO"),
  notes: z.string().optional().nullable(),
});

// GET /api/appointments - Get user's appointments
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await requireRateLimit({
      request,
      key: "appointments:list",
      limit: 120,
      window: "1 m",
    });
    if (rateLimit) return rateLimit;

    const userId = session.user.id;
    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { data: query, error } = parseSearchParams(request, appointmentQuerySchema);
    if (error) return error;
    const status = query.status;

    // Get patient or psychologist profile
    const patient = await prisma.patient.findUnique({
      where: { userId },
    });

    const psychologist = await prisma.psychologist.findUnique({
      where: { userId },
    });

    const where: Prisma.AppointmentWhereInput = {};
    if (status) {
      where.status = status;
    }

    let appointments;

    if (patient) {
      appointments = await prisma.appointment.findMany({
        where: { ...where, patientId: patient.id },
        include: {
          psychologist: {
            include: {
              user: {
                select: { name: true, image: true },
              },
              hospital: true,
            },
            // Include credentials field for display on UI
          },
        },
        orderBy: { startTime: "desc" },
      });
    } else if (psychologist) {
      appointments = await prisma.appointment.findMany({
        where: { ...where, psychologistId: psychologist.id },
        include: {
          patient: {
            include: {
              user: {
                select: { name: true, image: true },
              },
            },
          },
        },
        orderBy: { startTime: "desc" },
      });
    } else {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

// POST /api/appointments - Create new appointment
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await requireRateLimit({
      request,
      key: "appointments:create",
      limit: 30,
      window: "1 m",
    });
    if (rateLimit) return rateLimit;

    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const { data: body, error } = await parseJson(request, createAppointmentSchema);
    if (error) return error;
    const { psychologistId, date, startTime, endTime, duration, type, notes } = body;
    const parsedDate = new Date(date);
    const parsedStart = new Date(startTime);
    const parsedEnd = new Date(endTime);

    if ([parsedDate, parsedStart, parsedEnd].some((value) => Number.isNaN(value.getTime()))) {
      return NextResponse.json({ error: "Invalid appointment date/time" }, { status: 400 });
    }

    if (parsedStart >= parsedEnd) {
      return NextResponse.json(
        { error: "Appointment end time must be after start time" },
        { status: 400 }
      );
    }

    if (parsedStart < new Date()) {
      return NextResponse.json(
        { error: "Appointments must be scheduled in the future" },
        { status: 400 }
      );
    }

    const actualDuration = Math.round(
      (parsedEnd.getTime() - parsedStart.getTime()) / 60000
    );
    if (actualDuration !== duration) {
      return NextResponse.json(
        { error: "Duration must match start and end time" },
        { status: 400 }
      );
    }

    if (![60, 90].includes(duration)) {
      return NextResponse.json(
        { error: "Duration must be either 60 or 90 minutes" },
        { status: 400 }
      );
    }

    if (parsedDate.toDateString() !== parsedStart.toDateString()) {
      return NextResponse.json(
        { error: "Date must match appointment start time" },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let patient = await prisma.patient.findUnique({
      where: { userId },
    });

    if (!patient) {
      const role = session.user.role;
      if (role && role !== "PATIENT") {
        return NextResponse.json(
          { error: "Only patients can book appointments." },
          { status: 403 }
        );
      }

      patient = await prisma.patient.create({
        data: { userId },
      });
    }

    const psychologist = await prisma.psychologist.findUnique({
      where: { id: psychologistId },
    });

    if (!psychologist) {
      return NextResponse.json({ error: "Psychologist not found" }, { status: 404 });
    }

    if (psychologist.status !== "APPROVED") {
      return NextResponse.json(
        { error: "This psychologist is not available for booking" },
        { status: 400 }
      );
    }

    const [psychologistConflict, patientConflict] = await Promise.all([
      prisma.appointment.findFirst({
        where: {
          psychologistId,
          status: "SCHEDULED",
          startTime: { lt: parsedEnd },
          endTime: { gt: parsedStart },
        },
        select: { id: true },
      }),
      prisma.appointment.findFirst({
        where: {
          patientId: patient.id,
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

    const price = duration === 90 ? psychologist.price90 : psychologist.price60;

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        psychologistId,
        date: parsedStart,
        startTime: parsedStart,
        endTime: parsedEnd,
        duration,
        type,
        price,
        notes,
        status: "SCHEDULED",
      },
      include: {
        psychologist: {
          include: {
            user: {
              select: { name: true, email: true },
            },
            hospital: true,
          },
        },
        patient: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
    });

    try {
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.NEXTAUTH_URL ||
        "http://localhost:3000";

      const payload = {
        patientName: appointment.patient?.user?.name || "Patient",
        psychologistName: appointment.psychologist?.user?.name || "Psychologist",
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        type: appointment.type,
      };

      const patientEmail = appointment.patient?.user?.email;
      const psychologistEmail = appointment.psychologist?.user?.email;

      if (patientEmail) {
        const message = appointmentConfirmationEmail({
          ...payload,
          appUrl: `${appUrl}/patient/dashboard/appointments`,
        });
        await sendEmail({ to: patientEmail, ...message });
      }

      if (psychologistEmail) {
        const message = appointmentConfirmationEmail({
          ...payload,
          appUrl: `${appUrl}/psychologist/dashboard/appointments`,
        });
        await sendEmail({ to: psychologistEmail, ...message });
      }
    } catch (emailError) {
      console.error("Appointment confirmation email error:", emailError);
    }

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}
