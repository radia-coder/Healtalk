"use client";

import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Calendar, Clock, Video, CheckCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAppointments } from "@/hooks/useAppointments";

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

export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const { appointments, isLoading } = useAppointments();
  const now = new Date();

  const upcomingAppointments = appointments
    .filter((appointment) => appointment.status === "SCHEDULED")
    .filter((appointment) => new Date(appointment.startTime) >= now)
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

  const pastAppointments = appointments
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
                          >
                            Reschedule
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full text-[var(--dash-danger)] hover:bg-[var(--dash-danger-soft)] justify-start lg:justify-center"
                          >
                            Cancel Appointment
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            className="w-full dash-btn-outline"
                          >
                            View Details
                          </Button>
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
                            className="w-full border-[var(--dash-primary)] text-[var(--dash-primary)] hover:bg-[var(--dash-primary-soft)]"
                          >
                            Book Again
                          </Button>
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
      </div>
    </DashboardLayout>
  );
}
