import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireRateLimit } from "@/lib/rate-limit";

type ConversationRow = {
  id: string;
  appointmentId: string;
  name: string;
  image: string | null;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Groups a flat list of appointments by the "other party" ID (patient or psychologist),
 * keeping only the most-recent appointment per party (appointments are already ordered
 * by startTime desc from the query).
 */
function buildLatestAppointmentMap<T extends { patientId: string; psychologistId: string }>(
  appointments: T[],
  groupByKey: "patientId" | "psychologistId"
): Map<string, T> {
  const map = new Map<string, T>();
  for (const appt of appointments) {
    const key = appt[groupByKey];
    if (!map.has(key)) map.set(key, appt);
  }
  return map;
}

/**
 * Builds the conversation list given:
 * - a map of the latest appointment per contact
 * - a map of the last message per contact
 * - a function that extracts the display name and image from an appointment
 */
function buildConversations<
  A extends { id: string; patientId: string; psychologistId: string; createdAt: Date },
  M extends { patientId: string; psychologistId: string; content: string; createdAt: Date }
>(
  contactIds: string[],
  latestAppointmentByContact: Map<string, A>,
  lastMessageByContact: Map<string, M>,
  getName: (appt: A) => string,
  getImage: (appt: A) => string | null
): ConversationRow[] {
  return contactIds.map((contactId) => {
    const appointment = latestAppointmentByContact.get(contactId);
    const lastMessage = lastMessageByContact.get(contactId);

    return {
      id: appointment?.id ?? contactId,
      appointmentId: appointment?.id ?? contactId,
      name: appointment ? getName(appointment) : "Unknown",
      image: appointment ? getImage(appointment) : null,
      lastMessage: lastMessage?.content ?? "No messages yet",
      lastMessageTime: lastMessage?.createdAt ?? appointment?.createdAt ?? new Date(),
      // TODO: implement real unread count by tracking which messages the viewer has seen.
      unreadCount: 0,
    };
  });
}

// ─── Route ────────────────────────────────────────────────────────────────────

// GET /api/messages/conversations - Get list of all conversations for the current user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await requireRateLimit({
      request,
      key: "messages:conversations",
      limit: 120,
      window: "1 m",
    });
    if (rateLimit) return rateLimit;

    const userId = session.user.id;
    const role = session.user.role;

    let patient = await prisma.patient.findUnique({
      where: { userId },
      select: { id: true },
    });

    const psychologist = await prisma.psychologist.findUnique({
      where: { userId },
      select: { id: true },
    });

    // If neither profile exists, create a Patient record for PATIENT-role users.
    if (!patient && !psychologist) {
      if (role === "PATIENT") {
        patient = await prisma.patient.create({
          data: { userId },
          select: { id: true },
        });
      } else if (role === "PSYCHOLOGIST") {
        return NextResponse.json([]);
      } else {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
      }
    }

    // ── Patient path: show all psychologists the patient has booked ──────────
    if (patient) {
      const appointments = await prisma.appointment.findMany({
        where: {
          patientId: patient.id,
          status: { in: ["SCHEDULED", "COMPLETED"] },
        },
        include: {
          psychologist: {
            include: { user: { select: { name: true, image: true } } },
          },
        },
        orderBy: { startTime: "desc" },
      });

      const latestByPsychologist = buildLatestAppointmentMap(appointments, "psychologistId");
      const psychologistIds = Array.from(latestByPsychologist.keys());

      const messages = psychologistIds.length
        ? await prisma.message.findMany({
            where: { patientId: patient.id, psychologistId: { in: psychologistIds } },
            orderBy: { createdAt: "desc" },
          })
        : [];

      const lastMessageByPsychologist = new Map<string, (typeof messages)[number]>();
      for (const msg of messages) {
        if (!lastMessageByPsychologist.has(msg.psychologistId)) {
          lastMessageByPsychologist.set(msg.psychologistId, msg);
        }
      }

      const conversations = buildConversations(
        psychologistIds,
        latestByPsychologist,
        lastMessageByPsychologist,
        (appt) => appt.psychologist?.user?.name ?? "Psychologist",
        (appt) => appt.psychologist?.user?.image ?? null
      );

      return NextResponse.json(conversations);
    }

    // ── Psychologist path: show all patients the psychologist has seen ────────
    if (!psychologist) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        psychologistId: psychologist.id,
        status: { in: ["SCHEDULED", "COMPLETED"] },
      },
      include: {
        patient: {
          include: { user: { select: { name: true, image: true } } },
        },
      },
      orderBy: { startTime: "desc" },
    });

    const latestByPatient = buildLatestAppointmentMap(appointments, "patientId");
    const patientIds = Array.from(latestByPatient.keys());

    const messages = patientIds.length
      ? await prisma.message.findMany({
          where: { psychologistId: psychologist.id, patientId: { in: patientIds } },
          orderBy: { createdAt: "desc" },
        })
      : [];

    const lastMessageByPatient = new Map<string, (typeof messages)[number]>();
    for (const msg of messages) {
      if (!lastMessageByPatient.has(msg.patientId)) {
        lastMessageByPatient.set(msg.patientId, msg);
      }
    }

    const conversations = buildConversations(
      patientIds,
      latestByPatient,
      lastMessageByPatient,
      (appt) => appt.patient?.user?.name ?? "Patient",
      (appt) => appt.patient?.user?.image ?? null
    );

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}
