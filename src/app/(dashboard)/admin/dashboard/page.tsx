"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Users, Building, Calendar, TrendingUp, CheckCircle, ArrowUpRight } from "lucide-react";
import Link from "next/link";

type TopPsychologist = {
  id: string;
  name: string;
  appointments: number;
};

type ActivityItem = {
  id: string;
  startTime: string;
  status: string;
  type: string;
  patientName: string;
  psychologistName: string;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
  }).format(new Date(value));

const statusStyles: Record<string, string> = {
  SCHEDULED: "bg-yellow-500/10 border border-yellow-500/30 text-yellow-300",
  COMPLETED: "bg-green-500/10 border border-green-500/30 text-green-300",
  CANCELLED: "bg-red-500/10 border border-red-500/30 text-red-300",
  NO_SHOW: "bg-gray-700/50 border border-gray-600 text-gray-300",
};

export default function AdminDashboardHome() {
  const [metrics, setMetrics] = useState({
    totalPsychologists: 0,
    activePsychologists: 0,
    pendingApprovals: 0,
    totalPatients: 0,
    activePatients: 0,
    totalHospitals: 0,
    totalAppointments: 0,
    thisMonthAppointments: 0,
    totalRevenue: 0,
    thisMonthRevenue: 0,
  });
  const [topPsychologists, setTopPsychologists] = useState<TopPsychologist[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activityError, setActivityError] = useState<string | null>(null);

  useEffect(() => {
    const loadMetrics = async () => {
      setIsLoading(true);
      setError(null);
      setActivityError(null);
      try {
        const [metricsRes, analyticsRes, activityRes] = await Promise.allSettled([
          fetch("/api/admin/metrics"),
          fetch("/api/admin/analytics?range=6"),
          fetch("/api/admin/activity"),
        ]);

        if (metricsRes.status === "fulfilled") {
          const res = metricsRes.value;
          if (res.ok) {
            const data = await res.json();
            setMetrics(data);
          } else {
            const data = await res.json().catch(() => null);
            setError(data?.error || "Failed to load metrics.");
          }
        } else {
          setError("Failed to load metrics.");
        }

        if (analyticsRes.status === "fulfilled") {
          const res = analyticsRes.value;
          if (res.ok) {
            const data = await res.json();
            setTopPsychologists(data?.topPsychologists || []);
          }
        }

        if (activityRes.status === "fulfilled") {
          const res = activityRes.value;
          if (res.ok) {
            const data = await res.json();
            setRecentActivity(data?.items || []);
          } else {
            const data = await res.json().catch(() => null);
            setActivityError(data?.error || "Failed to load activity.");
          }
        } else {
          setActivityError("Failed to load activity.");
        }
      } catch {
        setError("Failed to load metrics.");
      } finally {
        setIsLoading(false);
      }
    };

    loadMetrics();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Platform overview and management</p>
            {isLoading && <p className="text-xs text-gray-500 mt-2">Loading metrics...</p>}
            {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
          </div>
          <Link
            href="/admin/dashboard/reports"
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
          >
            <TrendingUp className="w-4 h-4" />
            View Reports
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/dashboard/psychologists"
            className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400">Psychologists</span>
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-red-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{metrics.totalPsychologists.toLocaleString()}</p>
            <p className="text-xs text-green-400 mt-2 inline-flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              {metrics.activePsychologists} active
            </p>
          </Link>

          <Link
            href="/admin/dashboard/patients"
            className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400">Patients</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{metrics.totalPatients.toLocaleString()}</p>
            <p className="text-xs text-green-400 mt-2 inline-flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              {metrics.activePatients} active this month
            </p>
          </Link>

          <Link
            href="/admin/dashboard/hospitals"
            className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400">Hospitals</span>
              <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Building className="w-4 h-4 text-yellow-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{metrics.totalHospitals.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">Partner hospitals</p>
          </Link>

          <Link
            href="/admin/dashboard/appointments"
            className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400">Appointments</span>
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-green-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{metrics.totalAppointments.toLocaleString()}</p>
            <p className="text-xs text-green-400 mt-2 inline-flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              {metrics.thisMonthAppointments} this month
            </p>
          </Link>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Platform Revenue</p>
                <p className="text-2xl font-bold text-white">
                  ₺{(metrics.totalRevenue / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-gray-500">This Month</p>
                <p className="text-lg font-semibold text-white">
                  ₺{(metrics.thisMonthRevenue / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Growth</p>
                <p className="text-lg font-semibold text-green-400">{metrics.totalRevenue ? "+0%" : "—"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Top Psychologists</h2>
              <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">Last 6 months</span>
            </div>
            {topPsychologists.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-500">No top psychologists yet.</div>
            ) : (
              <div className="space-y-4">
                {topPsychologists.map((psychologist, index) => (
                  <div key={psychologist.id} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{index + 1}. {psychologist.name}</p>
                      <p className="text-xs text-gray-500">{psychologist.appointments} appointments</p>
                    </div>
                    <Link
                      href="/admin/dashboard/psychologists"
                      className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-6">Recent Activity</h2>
            {activityError && <p className="mb-4 text-sm text-red-400">{activityError}</p>}
            {recentActivity.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-500">No recent activity yet.</div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {item.patientName} → {item.psychologistName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.type.replace("_", " ")} · {formatDate(item.startTime)}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusStyles[item.status] || "bg-gray-700/50 border border-gray-600 text-gray-300"}`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
