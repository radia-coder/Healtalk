import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { appointmentReminderEmail } from "@/lib/appointment-emails";
import { z } from "zod";
import { parseSearchParams } from "@/lib/validation";

const requireCronSecret = (request: Request) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return {
      ok: false,
      status: 500,
      error: "Cron secret is not configured",
    } as const;
  }
  const header = request.headers.get("x-cron-secret");
  const bearer = request.headers.get("authorization");
  if (header === secret) return { ok: true } as const;
  if (bearer === `Bearer ${secret}`) return { ok: true } as const;
  return { ok: false, status: 401, error: "Unauthorized" } as const;
};

const WINDOW_CONFIG = {
  "24h": {
    minMinutes: 23 * 60,
    maxMinutes: 25 * 60,
    field: "reminder24hSentAt" as const,
  },
  "1h": {
    minMinutes: 45,
    maxMinutes: 75,
    field: "reminder1hSentAt" as const,
  },
};

type WindowKey = keyof typeof WINDOW_CONFIG;
const querySchema = z.object({
  window: z.enum(["24h", "1h", "all"]).optional(),
});

export async function GET(request: Request) {
  const cronAuth = requireCronSecret(request);
  if (!cronAuth.ok) {
    return NextResponse.json(
      { error: cronAuth.error },
      { status: cronAuth.status }
    );
  }

  const { data, error } = parseSearchParams(request, querySchema);
  if (error) return error;
  const windowParam = data.window || "all";

  const now = new Date();
  const windows: WindowKey[] =
    windowParam === "all" ? ["24h", "1h"] : [windowParam];

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000";

  const results: Record<string, number> = {};

  for (const windowKey of windows) {
    const config = WINDOW_CONFIG[windowKey];
    const start = new Date(now.getTime() + config.minMinutes * 60 * 1000);
    const end = new Date(now.getTime() + config.maxMinutes * 60 * 1000);

    const appointments = await prisma.appointment.findMany({
      where: {
        status: "SCHEDULED",
        startTime: { gte: start, lte: end },
        [config.field]: null,
      },
      include: {
        patient: { include: { user: { select: { name: true, email: true } } } },
        psychologist: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
    });

    let sent = 0;

    for (const appointment of appointments) {
      const payload = {
        patientName: appointment.patient?.user?.name || "Patient",
        psychologistName:
          appointment.psychologist?.user?.name || "Psychologist",
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        type: appointment.type,
      };

      try {
        const patientEmail = appointment.patient?.user?.email;
        const psychologistEmail = appointment.psychologist?.user?.email;

        if (patientEmail) {
          const message = appointmentReminderEmail(
            { ...payload, appUrl: `${appUrl}/patient/dashboard/appointments` },
            windowKey
          );
          await sendEmail({ to: patientEmail, ...message });
        }

        if (psychologistEmail) {
          const message = appointmentReminderEmail(
            {
              ...payload,
              appUrl: `${appUrl}/psychologist/dashboard/appointments`,
            },
            windowKey
          );
          await sendEmail({ to: psychologistEmail, ...message });
        }

        await prisma.appointment.update({
          where: { id: appointment.id },
          data: { [config.field]: new Date() },
        });

        sent += 1;
      } catch (error) {
        console.error("Reminder email error:", error);
      }
    }

    results[windowKey] = sent;
  }

  return NextResponse.json({ ok: true, sent: results });
}
