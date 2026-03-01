"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar, Video, Mic, MapPin, Clock } from "lucide-react";

interface AppointmentRow {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  type: "VIDEO" | "AUDIO" | "IN_PERSON";
  duration: number;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  price: number;
  notes: string | null;
  createdAt: string;
  patient: {
    id: string;
    user: { name: string | null; email: string | null; image: string | null };
  };
  psychologist: {
    id: string;
    user: { name: string | null; email: string | null; image: string | null };
  };
  payment: { status: string; paymentMethod: string; amount: number } | null;
}

const statusTabs = [
  { label: "All", value: "ALL" },
  { label: "Scheduled", value: "SCHEDULED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "No Show", value: "NO_SHOW" },
];

const statusStyles: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  NO_SHOW: "bg-amber-100 text-amber-700",
};

const typeIcons: Record<string, React.ReactNode> = {
  VIDEO: <Video size={14} />,
  AUDIO: <Mic size={14} />,
  IN_PERSON: <MapPin size={14} />,
};

const typeStyles: Record<string, string> = {
  VIDEO: "bg-purple-100 text-purple-700",
  AUDIO: "bg-teal-100 text-teal-700",
  IN_PERSON: "bg-orange-100 text-orange-700",
};

const paymentStatusStyles: Record<string, string> = {
  PAID: "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  REFUNDED: "bg-gray-100 text-gray-700",
  FAILED: "bg-red-100 text-red-700",
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));

const formatTime = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const formatPrice = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

export default function AppointmentsPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const limit = 15;

  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);

    const params = new URLSearchParams({
      status: statusFilter,
      search: search.trim(),
      page: String(page),
      limit: String(limit),
    });

    try {
      const res = await fetch(`/api/admin/appointments?${params.toString()}`);
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || "Failed to load appointments.");
      }
      const payload = await res.json();
      setAppointments(payload.appointments || []);
      setTotalPages(payload.pagination?.totalPages || 1);
      setTotal(payload.pagination?.total || 0);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load appointments.");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => loadAppointments(), 250);
    return () => clearTimeout(timer);
  }, [loadAppointments]);

  const summary = useMemo(() => {
    if (total === 0) return "No appointments";
    return `${total} appointment${total === 1 ? "" : "s"}`;
  }, [total]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Appointments</h1>
          <p className="text-gray-500">
            View and monitor all patient–doctor appointments across the platform.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => { setPage(1); setStatusFilter(tab.value); }}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-semibold border transition-colors",
                  statusFilter === tab.value
                    ? "bg-[#5B6CFF] text-white border-[#5B6CFF]"
                    : "bg-white text-gray-600 border-[#E6EAF2] hover:border-[#5B6CFF]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search by patient or doctor name"
              value={search}
              onChange={(e) => { setPage(1); setSearch(e.target.value); }}
              className="w-full lg:w-[320px]"
            />
            <span className="text-sm text-gray-500 whitespace-nowrap">{summary}</span>
          </div>
        </div>

        {message && (
          <div className="bg-red-50 text-red-700 border border-red-100 rounded-xl px-4 py-3 text-sm">
            {message}
          </div>
        )}

        {/* Table */}
        {isLoading ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-[24px] py-20 text-center text-gray-500">
            Loading appointments...
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-[24px] py-20 text-center text-gray-500">
            <Calendar size={40} className="mx-auto mb-3 text-gray-300" />
            <p>No appointments found for this filter.</p>
          </div>
        ) : (
          <div className="bg-white border border-[#E6EAF2] rounded-[20px] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E6EAF2] bg-gray-50/50">
                    <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Patient</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Doctor</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Date & Time</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Type</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Status</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Payment</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-gray-600">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6EAF2]">
                  {appointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#EEF0FF] flex items-center justify-center text-[#5B6CFF] font-semibold text-xs flex-shrink-0">
                            {(appt.patient.user.name || "P").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 truncate max-w-[130px]">
                              {appt.patient.user.name || "Unknown"}
                            </p>
                            <p className="text-xs text-gray-400 truncate max-w-[130px]">
                              {appt.patient.user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-xs flex-shrink-0">
                            {(appt.psychologist.user.name || "D").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 truncate max-w-[130px]">
                              {appt.psychologist.user.name || "Unknown"}
                            </p>
                            <p className="text-xs text-gray-400 truncate max-w-[130px]">
                              {appt.psychologist.user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">{formatDate(appt.date)}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                          <Clock size={11} />
                          {formatTime(appt.startTime)} · {appt.duration} min
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", typeStyles[appt.type])}>
                          {typeIcons[appt.type]}
                          {appt.type.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", statusStyles[appt.status])}>
                          {appt.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {appt.payment ? (
                          <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", paymentStatusStyles[appt.payment.status])}>
                            {appt.payment.status}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="font-semibold text-gray-900">{formatPrice(appt.price)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
