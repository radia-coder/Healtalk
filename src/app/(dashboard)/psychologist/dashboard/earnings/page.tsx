"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Users,
  Loader2,
  Clock,
} from "lucide-react";

interface EarningsSummary {
  totalEarnings: number;
  completedSessions: number;
  averageSessionRate: number;
  thisMonthEarnings: number;
}

interface EarningDetail {
  id: string;
  patientName: string;
  date: Date;
  duration: number;
  amount: number;
}

interface CompletedAppointment {
  id: string;
  startTime: string;
  duration: number;
  price?: number | null;
  patient?: {
    user?: {
      name?: string | null;
    } | null;
  } | null;
}

const CENTS_IN_DOLLAR = 100;

export default function EarningsPage() {
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [earnings, setEarnings] = useState<EarningDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEarnings() {
      try {
        const res = await fetch("/api/appointments?status=COMPLETED");
        if (!res.ok) throw new Error("Failed to fetch earnings");

        const appointments = (await res.json()) as CompletedAppointment[];

        if (appointments.length === 0) {
          setSummary({
            totalEarnings: 0,
            completedSessions: 0,
            averageSessionRate: 0,
            thisMonthEarnings: 0,
          });
          setEarnings([]);
          return;
        }

        // Calculate summary
        const totalEarnings = appointments.reduce(
          (sum, appointment) => sum + (appointment.price || 0),
          0
        ) / CENTS_IN_DOLLAR; // Convert cents to dollars

        const completedSessions = appointments.length;

        const averageSessionRate = totalEarnings / completedSessions;

        // This month earnings
        const now = new Date();
        const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthEarnings =
          appointments
            .filter((appointment) => new Date(appointment.startTime) >= firstOfMonth)
            .reduce((sum, appointment) => sum + (appointment.price || 0), 0) /
          CENTS_IN_DOLLAR;

        setSummary({
          totalEarnings,
          completedSessions,
          averageSessionRate,
          thisMonthEarnings,
        });

        // Map earnings details
        const earningsList = appointments
          .sort(
            (a, b) =>
              new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
          )
          .map((appointment) => ({
            id: appointment.id,
            patientName: appointment.patient?.user?.name || "Patient",
            date: new Date(appointment.startTime),
            duration: appointment.duration,
            amount: (appointment.price || 0) / CENTS_IN_DOLLAR,
          }));

        setEarnings(earningsList);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchEarnings();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Earnings & Analytics
          </h1>
          <p className="text-gray-500">
            Track your income and financial performance
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 bg-white border border-dashed border-gray-200 rounded-[24px]">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white border border-red-200 rounded-[24px]">
            <p className="text-red-600">Error: {error}</p>
          </div>
        ) : !summary || summary.completedSessions === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-[24px] p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="text-gray-300" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No earnings yet
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Earnings will appear here after your sessions are completed.
            </p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Earnings */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-[24px] p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <DollarSign size={24} />
                  </div>
                  <TrendingUp size={20} className="text-green-200" />
                </div>
                <p className="text-green-100 text-sm mb-1">Total Earnings</p>
                <h2 className="text-3xl font-bold">
                  ${summary.totalEarnings.toFixed(2)}
                </h2>
              </div>

              {/* This Month */}
              <div className="bg-white border border-gray-200 rounded-[24px] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                    <Calendar size={24} className="text-blue-600" />
                  </div>
                </div>
                <p className="text-gray-500 text-sm mb-1">This Month</p>
                <h2 className="text-3xl font-bold text-gray-900">
                  ${summary.thisMonthEarnings.toFixed(2)}
                </h2>
              </div>

              {/* Completed Sessions */}
              <div className="bg-white border border-gray-200 rounded-[24px] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
                    <Users size={24} className="text-purple-600" />
                  </div>
                </div>
                <p className="text-gray-500 text-sm mb-1">Completed Sessions</p>
                <h2 className="text-3xl font-bold text-gray-900">
                  {summary.completedSessions}
                </h2>
              </div>

              {/* Average Rate */}
              <div className="bg-white border border-gray-200 rounded-[24px] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
                    <TrendingUp size={24} className="text-orange-600" />
                  </div>
                </div>
                <p className="text-gray-500 text-sm mb-1">Avg. Session Rate</p>
                <h2 className="text-3xl font-bold text-gray-900">
                  ${summary.averageSessionRate.toFixed(0)}
                </h2>
              </div>
            </div>

            {/* Earnings List */}
            <div className="bg-white border border-gray-200 rounded-[24px] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">
                  Recent Transactions
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {earnings.map((earning) => (
                      <tr key={earning.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <Users size={20} className="text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {earning.patientName}
                              </p>
                              <p className="text-xs text-gray-500">Session</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">
                            {earning.date.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {earning.date.toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-900">
                            <Clock size={14} className="text-gray-400" />
                            {earning.duration} min
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-sm font-semibold text-green-600">
                            +${earning.amount.toFixed(2)}
                          </p>
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
