"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Calendar, Clock, Video, CheckCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AppointmentRecord, useAppointments } from "@/hooks/useAppointments";
import { fetchCsrfToken } from "@/lib/client-security";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

const formatTime = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

const pad = (value: number) => value.toString().padStart(2, "0");

const toDateInputValue = (value: Date) =>
  `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;

const toTimeInputValue = (value: Date) =>
  `${pad(value.getHours())}:${pad(value.getMinutes())}`;

const buildLocalDateTime = (date: string, time: string) => {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes)
  ) {
    return null;
  }

  const next = new Date(year, month - 1, day, hours, minutes, 0, 0);
  return Number.isNaN(next.getTime()) ? null : next;
};

export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const { appointments, isLoading, error } = useAppointments();

  const [visibleAppointments, setVisibleAppointments] = useState<AppointmentRecord[]>([]);
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isUpdatingAppointmentId, setIsUpdatingAppointmentId] = useState<string | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<AppointmentRecord | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  const now = new Date();
  const todayDateInputValue = toDateInputValue(now);
  const minTimeToday = toTimeInputValue(now);
  const isRescheduleToday = rescheduleDate === todayDateInputValue;

  useEffect(() => {
    setVisibleAppointments(appointments);
  }, [appointments]);

  const upcomingAppointments = visibleAppointments
    .filter((appointment) => appointment.status === "SCHEDULED")
    .filter((appointment) => new Date(appointment.startTime) >= now)
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

  const pastAppointments = visibleAppointments
    .filter(
      (appointment) =>
        appointment.status !== "SCHEDULED" ||
        new Date(appointment.startTime) < now
    )
    .sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );

  const list =
    activeTab === "upcoming" ? upcomingAppointments : pastAppointments;

  const openRescheduleModal = (appointment: AppointmentRecord) => {
    const startDate = new Date(appointment.startTime);
    setRescheduleTarget(appointment);
    setRescheduleDate(toDateInputValue(startDate));
    setRescheduleTime(toTimeInputValue(startDate));
    setRescheduleError(null);
    setActionMessage(null);
  };

  const closeRescheduleModal = () => {
    setRescheduleTarget(null);
    setRescheduleError(null);
    setRescheduleDate("");
    setRescheduleTime("");
  };

  const handleCancelAppointment = async (appointment: AppointmentRecord) => {
    if (isUpdatingAppointmentId) return;

    const confirmed = window.confirm("Do you want to cancel this appointment?");
    if (!confirmed) return;

    setActionMessage(null);
    setIsUpdatingAppointmentId(appointment.id);

    try {
      const csrfToken = await fetchCsrfToken();
      if (!csrfToken) {
        setActionMessage({
          type: "error",
          text: "Security check failed. Refresh and try again.",
        });
        return;
      }

      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      const payload = (await response.json().catch(() => null)) as
        | AppointmentRecord
        | { error?: string }
        | null;

      if (!response.ok) {
        setActionMessage({
          type: "error",
          text:
            (payload as { error?: string } | null)?.error ||
            "Failed to cancel appointment.",
        });
        return;
      }

      setVisibleAppointments((previous) =>
        previous.map((item) =>
          item.id === appointment.id
            ? {
                ...item,
                status: "CANCELLED",
              }
            : item
        )
      );
      setActionMessage({
        type: "success",
        text: "Appointment cancelled successfully.",
      });
    } catch {
      setActionMessage({
        type: "error",
        text: "Failed to cancel appointment.",
      });
    } finally {
      setIsUpdatingAppointmentId(null);
    }
  };

  const handleRescheduleAppointment = async () => {
    if (!rescheduleTarget || isUpdatingAppointmentId) return;

    setRescheduleError(null);
    setActionMessage(null);

    if (!rescheduleDate || !rescheduleTime) {
      setRescheduleError("Please choose both date and time.");
      return;
    }

    const nextStart = buildLocalDateTime(rescheduleDate, rescheduleTime);
    if (!nextStart) {
      setRescheduleError("Invalid date/time selection.");
      return;
    }

    if (nextStart.getTime() <= Date.now()) {
      setRescheduleError("Please choose a future date/time.");
      return;
    }

    const currentStart = new Date(rescheduleTarget.startTime);
    const currentEnd = new Date(rescheduleTarget.endTime);
    const currentDurationMs = Math.max(
      currentEnd.getTime() - currentStart.getTime(),
      (rescheduleTarget.duration || 60) * 60 * 1000
    );
    const nextEnd = new Date(nextStart.getTime() + currentDurationMs);

    setIsUpdatingAppointmentId(rescheduleTarget.id);
    try {
      const csrfToken = await fetchCsrfToken();
      if (!csrfToken) {
        setRescheduleError("Security check failed. Refresh and try again.");
        return;
      }

      const response = await fetch(`/api/appointments/${rescheduleTarget.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({
          date: nextStart.toISOString(),
          startTime: nextStart.toISOString(),
          endTime: nextEnd.toISOString(),
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | AppointmentRecord
        | { error?: string }
        | null;

      if (!response.ok) {
        setRescheduleError(
          (payload as { error?: string } | null)?.error ||
            "Failed to reschedule appointment."
        );
        return;
      }

      const updatedAppointment = payload as AppointmentRecord;
      setVisibleAppointments((previous) =>
        previous.map((item) =>
          item.id === updatedAppointment.id ? { ...item, ...updatedAppointment } : item
        )
      );
      closeRescheduleModal();
      setActionMessage({
        type: "success",
        text: "Appointment rescheduled successfully.",
      });
    } catch {
      setRescheduleError("Failed to reschedule appointment.");
    } finally {
      setIsUpdatingAppointmentId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold dash-heading mb-1">
              My Appointments
            </h1>
            <p className="dash-muted">
              Manage your upcoming and past sessions
            </p>
          </div>
          <Link href="/find-psychologists">
            <Button className="dash-btn-primary rounded-xl">
              <Calendar className="mr-2" size={18} />
              Book New Appointment
            </Button>
          </Link>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {actionMessage && (
          <div
            className={cn(
              "rounded-xl border px-4 py-3 text-sm",
              actionMessage.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            )}
          >
            {actionMessage.text}
          </div>
        )}

        <div className="flex gap-2 p-1 rounded-xl w-fit border bg-[var(--dash-surface-elev)] border-[var(--dash-border)]">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={cn(
              "px-6 py-2.5 text-sm font-semibold rounded-lg transition-all",
              activeTab === "upcoming"
                ? "bg-[var(--dash-surface)] text-[var(--dash-primary)] shadow-sm border border-[var(--dash-border)]"
                : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-chip)]"
            )}
          >
            Upcoming ({upcomingAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={cn(
              "px-6 py-2.5 text-sm font-semibold rounded-lg transition-all",
              activeTab === "past"
                ? "bg-[var(--dash-surface)] text-[var(--dash-primary)] shadow-sm border border-[var(--dash-border)]"
                : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-chip)]"
            )}
          >
            Past ({pastAppointments.length})
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-20 dash-card border-dashed">
            <div className="dash-muted">Loading appointments...</div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {list.map((appointment) => (
                <div
                  key={appointment.id}
                  className="dash-card p-6 transition-colors group hover:border-[var(--dash-border-strong)]"
                >
                  <div className="flex flex-col lg:flex-row items-start gap-6">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-16 h-16 rounded-[16px] bg-[var(--dash-primary-soft)] flex items-center justify-center flex-shrink-0 border border-[var(--dash-border)]">
                        <span className="text-2xl font-bold text-[var(--dash-primary)]">
                          {(appointment.psychologist?.user?.name || "P")[0]}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-xl font-bold dash-heading truncate">
                            {appointment.psychologist?.user?.name || "Psychologist"}
                          </h3>
                          {appointment.status === "SCHEDULED" ? (
                            <span className="px-2 py-0.5 bg-[var(--dash-success-soft)] text-[var(--dash-success)] text-[10px] font-bold rounded-full uppercase tracking-wide flex items-center gap-1 border border-[var(--dash-border)]">
                              <CheckCircle size={10} /> Scheduled
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-[var(--dash-chip)] text-[var(--dash-text-muted)] text-[10px] font-bold rounded-full uppercase tracking-wide flex items-center gap-1 border border-[var(--dash-border)]">
                              <CheckCircle size={10} /> {appointment.status.toLowerCase()}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[var(--dash-primary)] font-medium mb-4">
                          {appointment.psychologist?.credentials || "Psychologist"}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                          <div className="flex items-center gap-3 text-sm dash-muted">
                            <div className="w-8 h-8 rounded-full bg-[var(--dash-surface-elev)] border border-[var(--dash-border)] flex items-center justify-center">
                              <Calendar size={16} />
                            </div>
                            <span className="font-medium dash-heading">
                              {formatDate(appointment.startTime)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm dash-muted">
                            <div className="w-8 h-8 rounded-full bg-[var(--dash-surface-elev)] border border-[var(--dash-border)] flex items-center justify-center">
                              <Clock size={16} />
                            </div>
                            <span className="font-medium dash-heading">
                              {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm dash-muted">
                            <div className="w-8 h-8 rounded-full bg-[var(--dash-surface-elev)] border border-[var(--dash-border)] flex items-center justify-center">
                              <Video size={16} />
                            </div>
                            <span>{appointment.type.replace("_", " ")}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-52 pt-4 lg:pt-0 lg:border-l lg:border-[var(--dash-border)] lg:pl-6">
                      {activeTab === "upcoming" ? (
                        <>
                          <Link href={`/shared/call/${appointment.id}`} className="w-full">
                            <Button className="w-full dash-btn-primary">
                              Join Session
                            </Button>
                          </Link>
                          <Link href={`/patient/dashboard/messages?appointmentId=${appointment.id}`} className="w-full">
                            <Button
                              variant="outline"
                              className="w-full dash-btn-outline"
                            >
                              <MessageCircle size={16} className="mr-2" />
                              Send Message
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            className="w-full dash-btn-outline"
                            onClick={() => openRescheduleModal(appointment)}
                            disabled={isUpdatingAppointmentId === appointment.id}
                          >
                            Reschedule
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full text-[var(--dash-danger)] hover:bg-[var(--dash-danger-soft)] justify-start lg:justify-center"
                            onClick={() => handleCancelAppointment(appointment)}
                            disabled={isUpdatingAppointmentId === appointment.id}
                          >
                            {isUpdatingAppointmentId === appointment.id
                              ? "Updating..."
                              : "Cancel Appointment"}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Link
                            href={
                              appointment.psychologist?.id
                                ? `/psychologists/${appointment.psychologist.id}`
                                : "/find-psychologists"
                            }
                            className="w-full"
                          >
                            <Button
                              variant="outline"
                              className="w-full dash-btn-outline"
                            >
                              View Details
                            </Button>
                          </Link>
                          <Link href={`/patient/dashboard/messages?appointmentId=${appointment.id}`} className="w-full">
                            <Button
                              variant="outline"
                              className="w-full dash-btn-outline"
                            >
                              <MessageCircle size={16} className="mr-2" />
                              Send Message
                            </Button>
                          </Link>
                          <Link
                            href={
                              appointment.psychologist?.id
                                ? `/psychologists/${appointment.psychologist.id}`
                                : "/find-psychologists"
                            }
                            className="w-full"
                          >
                            <Button
                              variant="outline"
                              className="w-full border-[var(--dash-primary)] text-[var(--dash-primary)] hover:bg-[var(--dash-primary-soft)]"
                            >
                              Book Again
                            </Button>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {list.length === 0 && (
              <div className="text-center py-20 dash-card border-dashed">
                <div className="w-16 h-16 bg-[var(--dash-surface-elev)] border border-[var(--dash-border)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="dash-muted" size={32} />
                </div>
                <h3 className="text-xl font-bold dash-heading mb-2">
                  No {activeTab} appointments
                </h3>
                <p className="dash-muted mb-8 max-w-sm mx-auto">
                  {activeTab === "upcoming"
                    ? "You don't have any upcoming sessions scheduled. Book a new appointment to get started."
                    : "Your completed appointment history will appear here once you finish your sessions."}
                </p>
                {activeTab === "upcoming" && (
                  <Link href="/find-psychologists">
                    <Button className="dash-btn-primary h-11 px-8 rounded-xl">
                      Find a Psychologist
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </>
        )}

        <Dialog
          open={Boolean(rescheduleTarget)}
          onOpenChange={(open) => {
            if (!open) closeRescheduleModal();
          }}
        >
          <DialogContent className="sm:max-w-[440px]">
            <DialogHeader>
              <DialogTitle>Reschedule Appointment</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">New Date</label>
                <Input
                  type="date"
                  value={rescheduleDate}
                  min={todayDateInputValue}
                  onChange={(event) => setRescheduleDate(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">New Time</label>
                <Input
                  type="time"
                  value={rescheduleTime}
                  min={isRescheduleToday ? minTimeToday : undefined}
                  onChange={(event) => setRescheduleTime(event.target.value)}
                />
              </div>
              {rescheduleError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {rescheduleError}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={closeRescheduleModal}
                disabled={Boolean(isUpdatingAppointmentId)}
              >
                Keep Original
              </Button>
              <Button
                className="dash-btn-primary"
                onClick={handleRescheduleAppointment}
                disabled={Boolean(isUpdatingAppointmentId)}
              >
                {isUpdatingAppointmentId ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
