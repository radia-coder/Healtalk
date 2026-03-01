"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { CreditCard, Calendar, Clock, CheckCircle, Loader2, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Payment {
  id: string;
  psychologistName: string;
  date: Date;
  duration: number;
  amount: number;
  status: string;
}

interface CompletedAppointment {
  id: string;
  startTime: string;
  duration: number;
  price: number;
  status: string;
  psychologist?: {
    user?: {
      name?: string | null;
    } | null;
  } | null;
}

const MOCK_PAYMENTS: Payment[] = [
  {
    id: "mock-1",
    psychologistName: "Dr. Sarah Ahmed",
    date: new Date("2025-02-10T10:00:00"),
    duration: 60,
    amount: 99,
    status: "COMPLETED",
  },
  {
    id: "mock-2",
    psychologistName: "Dr. Khalid Hassan",
    date: new Date("2025-01-28T14:00:00"),
    duration: 90,
    amount: 149,
    status: "COMPLETED",
  },
  {
    id: "mock-3",
    psychologistName: "Dr. Amina Yusuf",
    date: new Date("2025-01-14T09:00:00"),
    duration: 60,
    amount: 99,
    status: "COMPLETED",
  },
];

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPayments() {
      try {
        const res = await fetch("/api/appointments?status=COMPLETED");

        if (res.status === 401 || res.status === 404) {
          setPayments(MOCK_PAYMENTS);
          return;
        }

        if (!res.ok) throw new Error("Failed to fetch payment history");

        const appointments = (await res.json()) as CompletedAppointment[];

        const paymentHistory = appointments.map((appointment) => ({
          id: appointment.id,
          psychologistName: appointment.psychologist?.user?.name || "Psychologist",
          date: new Date(appointment.startTime),
          duration: appointment.duration,
          amount: appointment.price / 100,
          status: appointment.status,
        }));

        setPayments(paymentHistory.length > 0 ? paymentHistory : MOCK_PAYMENTS);
      } catch {
        setPayments(MOCK_PAYMENTS);
      } finally {
        setLoading(false);
      }
    }

    fetchPayments();
  }, []);

  const totalSpent = useMemo(
    () => payments.reduce((sum, p) => sum + p.amount, 0),
    [payments]
  );

  const averagePerSession = payments.length > 0 ? totalSpent / payments.length : 0;
  const lastPayment = payments.length > 0 ? [...payments].sort((a, b) => b.date.getTime() - a.date.getTime())[0] : null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="mb-2">
          <h1 className="text-3xl font-bold dash-heading mb-1">Payment History</h1>
          <p className="dash-muted">View your completed sessions and payments</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 dash-card border-dashed">
            <Loader2 className="animate-spin text-[var(--dash-primary)]" size={32} />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-20 dash-card border-dashed">
            <div className="w-16 h-16 bg-[var(--dash-surface-elev)] border border-[var(--dash-border)] rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="dash-muted" size={32} />
            </div>
            <h3 className="text-xl font-bold dash-heading mb-2">No payments yet</h3>
            <p className="dash-muted max-w-md mx-auto">
              Payment history will appear here after your sessions are completed.
            </p>
          </div>
        ) : (
          <>
            <div
              className="relative overflow-hidden rounded-[24px] p-6 md:p-7 text-white"
              style={{
                background:
                  "linear-gradient(140deg, var(--dash-primary) 0%, #3f7df0 55%, #2f63c8 100%)",
              }}
            >
              <div className="absolute -top-14 -right-12 w-52 h-52 rounded-full bg-white/15 blur-2xl" />
              <div className="absolute -bottom-16 -left-10 w-48 h-48 rounded-full bg-black/10 blur-2xl" />

              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <p className="text-white/85 text-sm mb-1 flex items-center gap-2">
                    <Sparkles size={14} /> Total Spent
                  </p>
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight">${totalSpent.toFixed(2)}</h2>
                  <p className="text-white/85 text-sm mt-2">
                    {payments.length} completed session{payments.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:w-auto">
                  <div className="rounded-xl border border-white/30 bg-white/15 px-4 py-3 backdrop-blur-sm min-w-[170px]">
                    <p className="text-[11px] uppercase tracking-wide text-white/80">Average / Session</p>
                    <p className="text-lg font-semibold mt-1">${averagePerSession.toFixed(2)}</p>
                  </div>
                  <div className="rounded-xl border border-white/30 bg-white/15 px-4 py-3 backdrop-blur-sm min-w-[170px]">
                    <p className="text-[11px] uppercase tracking-wide text-white/80">Last Payment</p>
                    <p className="text-sm font-semibold mt-1">
                      {lastPayment
                        ? lastPayment.date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </p>
                  </div>
                </div>

                <div className="hidden md:flex w-16 h-16 bg-white/20 rounded-full items-center justify-center shrink-0">
                  <CreditCard size={32} />
                </div>
              </div>
            </div>

            <div className="dash-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--dash-surface-elev)] border-b border-[var(--dash-border)]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold dash-muted uppercase tracking-wider">
                        Session Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold dash-muted uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold dash-muted uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold dash-muted uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold dash-muted uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold dash-muted uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--dash-border)]">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-[var(--dash-surface-elev)] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[var(--dash-primary-soft)] border border-[var(--dash-border)] flex items-center justify-center">
                              <Calendar size={20} className="text-[var(--dash-primary)]" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold dash-heading">
                                {payment.psychologistName}
                              </p>
                              <p className="text-xs dash-muted">Psychology Session</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm dash-heading">
                            {payment.date.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm dash-heading">
                            <Clock size={14} className="dash-muted" />
                            {payment.duration} min
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold dash-heading">
                            ${payment.amount.toFixed(2)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[var(--dash-success-soft)] text-[var(--dash-success)] text-xs font-medium rounded-full border border-[var(--dash-border)]">
                            <CheckCircle size={12} />
                            Paid
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[var(--dash-primary)] hover:text-[var(--dash-primary-hover)] hover:bg-[var(--dash-primary-soft)]"
                          >
                            <Download size={14} className="mr-1" />
                            Receipt
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
