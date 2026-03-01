"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, User, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import Image from "next/image";

interface RecentBooking {
  id: string;
  patientName: string;
  patientImage: string | null;
  startTime: Date;
  duration: number;
  createdAt: Date;
}

interface AppointmentApiItem {
  id: string;
  startTime: string;
  createdAt?: string | null;
  duration: number;
  patient?: {
    user?: {
      name?: string | null;
      image?: string | null;
    } | null;
  } | null;
}

const RECENT_DAYS = 7;
const RECENT_LIMIT = 5;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

const toBookingDate = (appointment: AppointmentApiItem) =>
  new Date(appointment.createdAt || appointment.startTime);

export function AppointmentRequests() {
  const [bookings, setBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentBookings() {
      try {
        const res = await fetch("/api/appointments?status=SCHEDULED");
        if (!res.ok) throw new Error("Failed to fetch appointments");

        const appointments = (await res.json()) as AppointmentApiItem[];

        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - RECENT_DAYS * DAY_IN_MS);

        const recent = appointments
          .filter((appointment) => toBookingDate(appointment) >= sevenDaysAgo)
          .sort(
            (a, b) =>
              toBookingDate(b).getTime() - toBookingDate(a).getTime()
          )
          .slice(0, RECENT_LIMIT)
          .map((apt) => ({
            id: apt.id,
            patientName: apt.patient?.user?.name || "Patient",
            patientImage: apt.patient?.user?.image ?? null,
            startTime: new Date(apt.startTime),
            duration: apt.duration,
            createdAt: toBookingDate(apt),
          }));

        setBookings(recent);
      } catch (err) {
        console.error("Error fetching recent bookings:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentBookings();
  }, []);

  return (
    <div className="dash-card p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold dash-heading text-lg">Recent Bookings</h3>
        <Link
          href="/psychologist/dashboard/appointments"
          className="text-sm font-medium text-[var(--dash-primary)] hover:opacity-80 transition-opacity"
        >
          See All
        </Link>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-[var(--dash-primary)]" size={24} />
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm dash-muted">
          No recent bookings in the last 7 days.
        </div>
      ) : (
        <div className="space-y-4 flex-1 overflow-y-auto pr-1">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="dash-card-elev flex items-start gap-3 p-3 transition-colors hover:border-[var(--dash-border-strong)]"
            >
              <div className="w-10 h-10 rounded-full bg-[var(--dash-surface)] border border-[var(--dash-border)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                {booking.patientImage ? (
                  <Image
                    src={booking.patientImage}
                    alt={booking.patientName}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={20} className="dash-muted" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold dash-heading truncate">
                  {booking.patientName}
                </p>
                <div className="flex items-center gap-2 text-xs dash-muted mt-1">
                  <Calendar size={12} />
                  <span>{booking.startTime.toLocaleDateString()}</span>
                  <Clock size={12} className="ml-1" />
                  <span>{booking.duration} min</span>
                </div>
                <p className="text-xs dash-muted mt-1">
                  Booked {formatDistanceToNow(booking.createdAt, { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
