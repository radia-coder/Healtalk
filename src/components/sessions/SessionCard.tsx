"use client";

import { Calendar, Clock, Users, DollarSign, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { format } from "date-fns";

interface SessionCardProps {
  session: {
    id: string;
    title: string;
    description?: string;
    type: string;
    maxParticipants: number;
    startTime: Date | string;
    duration: number;
    pricePerPerson: number;
    status: string;
    psychologist: {
      user: {
        name: string;
        image: string | null;
      };
    };
    _count?: {
      participants: number;
    };
    availableSpots?: number;
    isFull?: boolean;
  };
  onJoin?: (sessionId: string) => void;
  showJoinButton?: boolean;
  isLoading?: boolean;
}

export function SessionCard({ session, onJoin, showJoinButton = true, isLoading = false }: SessionCardProps) {
  const startTime = new Date(session.startTime);
  const participantCount = session._count?.participants || 0;
  const availableSpots = session.availableSpots ?? (session.maxParticipants - participantCount);
  const isFull = session.isFull ?? (participantCount >= session.maxParticipants);

  return (
    <div className="dash-card p-6 hover:border-[var(--dash-border-strong)] transition-colors h-full flex flex-col">
      <div className="flex items-start gap-4 mb-4">
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[var(--dash-surface-elev)] border border-[var(--dash-border)] flex-shrink-0">
          {session.psychologist.user.image ? (
            <Image
              src={session.psychologist.user.image}
              alt={session.psychologist.user.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Users className="dash-muted" size={20} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-lg dash-heading mb-1">{session.title}</h3>
            {session.type === "GROUP" && (
              <span className="px-3 py-1 bg-[var(--dash-primary-soft)] text-[var(--dash-primary)] text-xs font-medium rounded-full flex-shrink-0 border border-[var(--dash-border)]">
                Group
              </span>
            )}
          </div>
          <p className="text-sm dash-muted">with {session.psychologist.user.name}</p>
        </div>
      </div>

      {session.description && (
        <p className="text-sm dash-muted mb-4 line-clamp-2">{session.description}</p>
      )}

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm dash-muted">
          <Calendar size={16} className="dash-muted" />
          <span>{format(startTime, "EEEE, MMMM d, yyyy")}</span>
        </div>
        <div className="flex items-center gap-2 text-sm dash-muted">
          <Clock size={16} className="dash-muted" />
          <span>
            {format(startTime, "h:mm a")} • {session.duration} minutes
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm dash-muted">
          <Users size={16} className="dash-muted" />
          <span>
            {participantCount} / {session.maxParticipants} participants
            {availableSpots > 0 && (
              <span className="text-[var(--dash-success)] ml-1">
                ({availableSpots} spot{availableSpots !== 1 ? "s" : ""} left)
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <DollarSign size={16} className="dash-muted" />
          <span className="font-semibold dash-heading">
            ${(session.pricePerPerson / 100).toFixed(2)} per person
          </span>
        </div>
      </div>

      {participantCount > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <div className="flex -space-x-2">
            {[...Array(Math.min(participantCount, 3))].map((_, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-[var(--dash-surface-elev)] border-2 border-[var(--dash-surface)]"
              />
            ))}
          </div>
          {participantCount > 3 && (
            <span className="text-xs dash-muted">+{participantCount - 3} more</span>
          )}
        </div>
      )}

      <div className="mt-auto">
        {showJoinButton && session.status === "SCHEDULED" && (
          <Button
            onClick={() => onJoin?.(session.id)}
            disabled={isFull || isLoading}
            className="w-full rounded-xl dash-btn-primary"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Joining...
              </>
            ) : isFull ? (
              "Session Full"
            ) : (
              "Join Session"
            )}
          </Button>
        )}

        {session.status === "CANCELLED" && (
          <div className="text-center py-2 text-[var(--dash-danger)] font-medium">Cancelled</div>
        )}
      </div>
    </div>
  );
}
