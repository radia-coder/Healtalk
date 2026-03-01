"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

interface AnalyticsMonth {
  key: string;
  label: string;
  appointments: number;
  revenue: number;
  users: number;
  patients: number;
  psychologists: number;
}

interface AnalyticsResponse {
  rangeMonths: number;
  months: AnalyticsMonth[];
  totals: {
    totalAppointments: number;
    totalRevenue: number;
    totalUsers: number;
    totalPatients: number;
    totalPsychologists: number;
  };
  topPsychologists: { id: string; name: string; appointments: number }[];
}

const ranges = [
  { label: "6 Months", value: 6 },
  { label: "12 Months", value: 12 },
];

const formatCurrency = (value: number) =>
  `₺${(value / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function AdminReportsPage() {
  const [range, setRange] = useState(6);
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/analytics?range=${range}`);
        if (!res.ok) {
          const payload = await res.json().catch(() => null);
          throw new Error(payload?.error || "Failed to load analytics.");
        }
        const payload = await res.json();
        setData(payload);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analytics.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [range]);

  const chartData = useMemo(() => data?.months || [], [data]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Reports</h1>
            <p className="text-gray-500">Track bookings, revenue, and user growth.</p>
          </div>
          <div className="flex items-center gap-2">
            {ranges.map((item) => (
              <button
                key={item.value}
                onClick={() => setRange(item.value)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-semibold border transition-colors",
                  range === item.value
                    ? "bg-[#5B6CFF] text-white border-[#5B6CFF]"
                    : "bg-white text-gray-600 border-[#E6EAF2] hover:border-[#5B6CFF]"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-100 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-[24px] py-20 text-center text-gray-500">
            Loading analytics...
          </div>
        ) : !data ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-[24px] py-20 text-center text-gray-500">
            No analytics available.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <div className="bg-white border border-[#E6EAF2] rounded-[16px] p-6">
                <div className="text-sm text-gray-500 mb-2">Total Users</div>
                <div className="text-3xl font-bold text-gray-900">
                  {data.totals.totalUsers.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {data.totals.totalPatients} patients · {data.totals.totalPsychologists} psychologists
                </div>
              </div>
              <div className="bg-white border border-[#E6EAF2] rounded-[16px] p-6">
                <div className="text-sm text-gray-500 mb-2">Total Appointments</div>
                <div className="text-3xl font-bold text-gray-900">
                  {data.totals.totalAppointments.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-2">All-time bookings</div>
              </div>
              <div className="bg-white border border-[#E6EAF2] rounded-[16px] p-6">
                <div className="text-sm text-gray-500 mb-2">Total Revenue</div>
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(data.totals.totalRevenue)}
                </div>
                <div className="text-xs text-gray-500 mt-2">Paid transactions</div>
              </div>
              <div className="bg-white border border-[#E6EAF2] rounded-[16px] p-6">
                <div className="text-sm text-gray-500 mb-2">Active Range</div>
                <div className="text-3xl font-bold text-gray-900">
                  {data.rangeMonths} months
                </div>
                <div className="text-xs text-gray-500 mt-2">Reporting window</div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-white border border-[#E6EAF2] rounded-[16px] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Appointments</h2>
                </div>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="appointments" stroke="#5B6CFF" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white border border-[#E6EAF2] rounded-[16px] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Revenue</h2>
                </div>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `₺${(value / 100).toLocaleString("en-US")}`}
                      />
                      <Tooltip formatter={(value: number | undefined) => value ? formatCurrency(Number(value)) : '₺0.00'} />
                      <Legend />
                      <Bar dataKey="revenue" fill="#20C997" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="bg-white border border-[#E6EAF2] rounded-[16px] p-6 xl:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">User Growth</h2>
                </div>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="users" stroke="#FF9F43" strokeWidth={2} />
                      <Line type="monotone" dataKey="patients" stroke="#5B6CFF" strokeWidth={2} />
                      <Line type="monotone" dataKey="psychologists" stroke="#20C997" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white border border-[#E6EAF2] rounded-[16px] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Top Psychologists</h2>
                </div>
                {data.topPsychologists.length === 0 ? (
                  <div className="text-sm text-gray-500 py-10 text-center">
                    No activity yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.topPsychologists.map((psychologist, index) => (
                      <div
                        key={psychologist.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div>
                          <div className="font-semibold text-gray-900">
                            {index + 1}. {psychologist.name}
                          </div>
                          <div className="text-xs text-gray-500">{psychologist.appointments} appointments</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
