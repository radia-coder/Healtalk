"use client";

import Link from "next/link";
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

export function PatientUpcomingAppointments() {
  const { appointments, isLoading } = useAppointments();
  const now = new Date();
  const upcoming = appointments
    .filter((appointment) => appointment.status === "SCHEDULED")
    .filter((appointment) => new Date(appointment.startTime) >= now)
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    )
    .slice(0, 5);

  return (
    <div className="dash-card p-6 relative">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold dash-heading text-lg">My Appointments</h3>
        <Link
          href="/patient/dashboard/appointments"
          className="text-sm font-medium transition-colors text-[var(--dash-primary)] hover:opacity-80"
        >
          View all
        </Link>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-gray-500">
          Loading appointments...
        </div>
      ) : upcoming.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-500">
          You don&apos;t have any upcoming appointments yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead className="text-xs uppercase font-medium bg-[var(--dash-surface-elev)] text-[var(--dash-text-muted)]">
              <tr>
                <th className="py-3 px-4">
                  Psychologist
                </th>
                <th className="py-3 px-4">
                  Date
                </th>
                <th className="py-3 px-4">
                  Time
                </th>
                <th className="py-3 px-4">
                  Type
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--dash-border)]">
              {upcoming.map((appointment) => (
                <tr key={appointment.id} className="transition-colors hover:bg-[var(--dash-surface-elev)]">
                  <td className="py-4 px-4 text-sm font-medium text-[var(--dash-text)]">
                    {appointment.psychologist?.user?.name || "Psychologist"}
                  </td>
                  <td className="py-4 px-4 text-sm text-[var(--dash-text-muted)]">
                    {formatDate(appointment.startTime)}
                  </td>
                  <td className="py-4 px-4 text-sm text-[var(--dash-text-muted)]">
                    {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                  </td>
                  <td className="py-4 px-4 text-sm text-[var(--dash-text-muted)]">
                    {appointment.type.replace("_", " ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
