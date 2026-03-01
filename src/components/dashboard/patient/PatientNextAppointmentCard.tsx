"use client";

import Link from "next/link";
import { Calendar, Clock, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppointments } from "@/hooks/useAppointments";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(value));

const formatTime = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

export function PatientNextAppointmentCard() {
    const { appointments, isLoading } = useAppointments();
    const now = new Date();
    const upcoming = appointments
      .filter((appointment) => appointment.status === "SCHEDULED")
      .filter((appointment) => new Date(appointment.startTime) >= now)
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
    const nextAppointment = upcoming[0];

  return (
    <div className="dash-card p-5 relative overflow-hidden h-full flex flex-col justify-between">
      <div className="absolute top-[-24px] right-[-24px] w-28 h-28 bg-[var(--dash-primary-soft)] rounded-full blur-2xl" />
      <div className="absolute bottom-[-18px] left-[-18px] w-24 h-24 bg-[var(--dash-accent-soft)] rounded-full blur-2xl" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-sm dash-muted font-medium mb-1">Next Appointment</div>
            <h3 className="text-2xl font-bold dash-heading">
              {isLoading
                ? "Loading..."
                : nextAppointment?.psychologist?.user?.name || "No upcoming appointments"}
            </h3>
          </div>
          <div className="w-10 h-10 bg-[var(--dash-primary-soft)] border border-[var(--dash-primary)] rounded-full flex items-center justify-center">
            <Video size={20} className="text-[var(--dash-primary)]" />
          </div>
        </div>

        {nextAppointment ? (
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm bg-[var(--dash-surface-elev)] border border-[var(--dash-border)] px-3 py-1.5 rounded-lg text-[var(--dash-text)]">
              <Calendar size={14} />
              <span>{formatDate(nextAppointment.startTime)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm bg-[var(--dash-surface-elev)] border border-[var(--dash-border)] px-3 py-1.5 rounded-lg text-[var(--dash-text)]">
              <Clock size={14} />
              <span>
                {formatTime(nextAppointment.startTime)} - {formatTime(nextAppointment.endTime)}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm dash-muted mb-4">
            {isLoading ? "Checking schedule..." : "Book your first session to get started."}
          </p>
        )}
      </div>

      <div className="flex gap-3 relative z-10 mt-auto">
        {nextAppointment ? (
          <>
            <Link href={`/shared/call/${nextAppointment.id}`} className="flex-1">
              <Button className="w-full dash-btn-primary font-semibold shadow-sm" size="sm">
                Join Session
              </Button>
            </Link>
            <Link href="/patient/dashboard/sessions" className="flex-1">
              <Button className="w-full dash-btn-outline font-semibold shadow-sm" size="sm">
                Reschedule
              </Button>
            </Link>
          </>
        ) : (
          <Link href="/find-psychologists" className="flex-1">
            <Button className="w-full dash-btn-primary font-semibold shadow-sm" size="sm">
              Find a Psychologist
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
