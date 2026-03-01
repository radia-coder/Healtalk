import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as HTTPServer } from "http";
import type { Socket as NetSocket } from "net";
import { Server as IOServer } from "socket.io";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export const config = {
  api: {
    bodyParser: false,
  },
};

type SocketServer = HTTPServer & { io?: IOServer };

type NextApiResponseWithSocket = NextApiResponse & {
  socket: NetSocket & { server: SocketServer };
};

const onlineUsersByRoom = new Map<string, Set<string>>();
const APPOINTMENT_ROOM_PREFIX = "appointment:";

const getAppointmentIdFromRoom = (room: string) => {
  if (!room.startsWith(APPOINTMENT_ROOM_PREFIX)) return null;
  const appointmentId = room.slice(APPOINTMENT_ROOM_PREFIX.length).trim();
  return appointmentId || null;
};

const canAccessRoom = async (userId: string, room: string) => {
  const appointmentId = getAppointmentIdFromRoom(room);
  if (!appointmentId) return false;

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: {
      patient: { select: { userId: true } },
      psychologist: { select: { userId: true } },
    },
  });

  if (!appointment) return false;

  return (
    appointment.patient?.userId === userId ||
    appointment.psychologist?.userId === userId
  );
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (!res.socket.server.io) {
    const io = new IOServer(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
    });

    io.use(async (socket, next) => {
      try {
        const token = await getToken({
          req: socket.request as NextApiRequest,
          secret: process.env.NEXTAUTH_SECRET,
        });

        if (!token?.id) {
          return next(new Error("Unauthorized"));
        }

        socket.data.userId = token.id;
        socket.data.role = token.role;
        next();
      } catch {
        next(new Error("Unauthorized"));
      }
    });

    const emitPresence = (room: string) => {
      const users = onlineUsersByRoom.get(room);
      io.to(room).emit("presence:update", {
        room,
        onlineUserIds: users ? Array.from(users) : [],
      });
    };

    io.on("connection", (socket) => {
      socket.on(
        "join",
        async (
          room: string,
          callback?: (response: { ok: boolean; error?: string }) => void
        ) => {
          if (typeof room !== "string" || !room.trim()) {
            callback?.({ ok: false, error: "Invalid room" });
            return;
          }

          const userId = socket.data.userId as string;
          if (!userId) {
            callback?.({ ok: false, error: "Unauthorized" });
            return;
          }

          const canAccess = await canAccessRoom(userId, room);
          if (!canAccess) {
            callback?.({ ok: false, error: "Forbidden" });
            socket.emit("join:error", { room, error: "Forbidden" });
            return;
          }

          socket.join(room);
          const users = onlineUsersByRoom.get(room) || new Set<string>();
          users.add(userId);
          onlineUsersByRoom.set(room, users);
          emitPresence(room);
          callback?.({ ok: true });
        }
      );

      socket.on("leave", (room: string) => {
        socket.leave(room);
        const userId = socket.data.userId as string;
        if (userId) {
          const users = onlineUsersByRoom.get(room);
          if (users) {
            users.delete(userId);
            if (users.size === 0) {
              onlineUsersByRoom.delete(room);
            }
            emitPresence(room);
          }
        }
      });

      socket.on("typing:start", (room: string) => {
        if (!socket.rooms.has(room)) return;
        const userId = socket.data.userId as string;
        socket.to(room).emit("typing", { userId, isTyping: true });
      });

      socket.on("typing:stop", (room: string) => {
        if (!socket.rooms.has(room)) return;
        const userId = socket.data.userId as string;
        socket.to(room).emit("typing", { userId, isTyping: false });
      });

      socket.on(
        "message:send",
        async (
          payload: {
            appointmentId: string;
            content?: string;
            attachment?: {
              url?: string;
              key?: string;
              type?: string;
              name?: string;
            };
          },
          callback?: (response: {
            ok: boolean;
            message?: {
              id: string;
              content: string;
              senderId: string;
              createdAt: Date;
              attachmentUrl: string | null;
              attachmentType: string | null;
              attachmentName: string | null;
            };
            error?: string;
          }) => void
        ) => {
          try {
            const { appointmentId, content, attachment } = payload || {};
            const trimmed = content?.trim() || "";
            const hasAttachment = Boolean(attachment?.url);
            if (!appointmentId || (!trimmed && !hasAttachment)) {
              callback?.({ ok: false, error: "Invalid payload" });
              return;
            }

            const appointment = await prisma.appointment.findUnique({
              where: { id: appointmentId },
              include: {
                patient: { select: { id: true, userId: true, user: { select: { name: true } } } },
                psychologist: {
                  select: { id: true, userId: true, user: { select: { name: true } } },
                },
              },
            });

            if (!appointment) {
              callback?.({ ok: false, error: "Appointment not found" });
              return;
            }

            const senderId = socket.data.userId as string;
            const isParticipant =
              appointment.patient?.userId === senderId ||
              appointment.psychologist?.userId === senderId;

            if (!isParticipant) {
              callback?.({ ok: false, error: "Forbidden" });
              return;
            }

            const message = await prisma.message.create({
              data: {
                patientId: appointment.patient.id,
                psychologistId: appointment.psychologist.id,
                senderId,
                content: trimmed || (hasAttachment ? "Attachment" : ""),
                attachmentUrl: attachment?.url,
                attachmentKey: attachment?.key,
                attachmentType: attachment?.type,
                attachmentName: attachment?.name,
              },
            });

            const response = {
              id: message.id,
              content: message.content,
              senderId: message.senderId,
              createdAt: message.createdAt,
              attachmentUrl: message.attachmentUrl,
              attachmentType: message.attachmentType,
              attachmentName: message.attachmentName,
            };

            const room = `appointment:${appointmentId}`;
            io.to(room).emit("message:new", response);
            callback?.({ ok: true, message: response });
          } catch {
            callback?.({ ok: false, error: "Failed to send message" });
          }
        }
      );

      socket.on("disconnect", () => {
        const userId = socket.data.userId as string;
        if (!userId) return;
        const rooms = Array.from(socket.rooms).filter(
          (room) => room !== socket.id
        );
        rooms.forEach((room) => {
          const users = onlineUsersByRoom.get(room);
          if (users) {
            users.delete(userId);
            if (users.size === 0) {
              onlineUsersByRoom.delete(room);
            }
            emitPresence(room);
          }
        });
      });
    });

    res.socket.server.io = io;
  }

  res.end();
}
