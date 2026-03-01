"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CreditCard, TrendingUp } from "lucide-react";

interface PaymentRow {
  id: string;
  amount: number;
  status: "PENDING" | "PAID" | "REFUNDED" | "FAILED";
  paymentMethod: string;
  invoiceNumber: string;
  transactionId: string | null;
  createdAt: string;
  patient: {
    user: { name: string | null; email: string | null };
  };
  appointment: {
    type: string;
    duration: number;
    date: string;
    psychologist: { user: { name: string | null } };
  } | null;
}

const statusTabs = [
  { label: "All", value: "ALL" },
  { label: "Paid", value: "PAID" },
  { label: "Pending", value: "PENDING" },
  { label: "Refunded", value: "REFUNDED" },
  { label: "Failed", value: "FAILED" },
];

const statusStyles: Record<string, string> = {
  PAID: "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  REFUNDED: "bg-gray-100 text-gray-700",
  FAILED: "bg-red-100 text-red-700",
};

const methodStyles: Record<string, string> = {
  card: "bg-blue-100 text-blue-700",
  cash: "bg-green-100 text-green-700",
  insurance: "bg-purple-100 text-purple-700",
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));

const formatPrice = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

export default function PaymentsPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const limit = 15;

  const loadPayments = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);

    const params = new URLSearchParams({
      status: statusFilter,
      search: search.trim(),
      page: String(page),
      limit: String(limit),
    });

    try {
      const res = await fetch(`/api/admin/payments?${params.toString()}`);
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || "Failed to load payments.");
      }
      const payload = await res.json();
      setPayments(payload.payments || []);
      setTotalPages(payload.pagination?.totalPages || 1);
      setTotal(payload.pagination?.total || 0);
      setTotalRevenue(payload.totalRevenue || 0);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load payments.");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => loadPayments(), 250);
    return () => clearTimeout(timer);
  }, [loadPayments]);

  const summary = useMemo(() => {
    if (total === 0) return "No payments";
    return `${total} transaction${total === 1 ? "" : "s"}`;
  }, [total]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Payments</h1>
          <p className="text-gray-500">
            Track all transactions and monitor platform revenue.
          </p>
        </div>

        {/* Revenue card */}
        <div className="bg-white border border-[#E6EAF2] rounded-[20px] p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-[14px] bg-green-50 flex items-center justify-center">
              <TrendingUp size={22} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Revenue (Paid)</p>
              <p className="text-3xl font-bold text-gray-900">{formatPrice(totalRevenue)}</p>
            </div>
          </div>
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
              placeholder="Search by patient or invoice #"
              value={search}
              onChange={(e) => { setPage(1); setSearch(e.target.value); }}
              className="w-full lg:w-[300px]"
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
            Loading payments...
          </div>
        ) : payments.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-[24px] py-20 text-center text-gray-500">
            <CreditCard size={40} className="mx-auto mb-3 text-gray-300" />
            <p>No payments found for this filter.</p>
          </div>
        ) : (
          <div className="bg-white border border-[#E6EAF2] rounded-[20px] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E6EAF2] bg-gray-50/50">
                    <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Invoice</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Patient</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Doctor</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Date</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Method</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Status</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-gray-600">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6EAF2]">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-mono text-xs text-gray-600">{payment.invoiceNumber}</p>
                        {payment.transactionId && (
                          <p className="text-[11px] text-gray-400 mt-0.5 truncate max-w-[120px]">
                            {payment.transactionId}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#EEF0FF] flex items-center justify-center text-[#5B6CFF] font-semibold text-xs flex-shrink-0">
                            {(payment.patient.user.name || "P").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 truncate max-w-[120px]">
                              {payment.patient.user.name || "Unknown"}
                            </p>
                            <p className="text-[11px] text-gray-400 truncate max-w-[120px]">
                              {payment.patient.user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-gray-700 truncate max-w-[140px]">
                          {payment.appointment?.psychologist.user.name || "—"}
                        </p>
                        {payment.appointment && (
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {payment.appointment.type.replace("_", " ")} · {payment.appointment.duration} min
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {formatDate(payment.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold capitalize", methodStyles[payment.paymentMethod] || "bg-gray-100 text-gray-700")}>
                          {payment.paymentMethod}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", statusStyles[payment.status])}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="font-semibold text-gray-900">{formatPrice(payment.amount)}</span>
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
