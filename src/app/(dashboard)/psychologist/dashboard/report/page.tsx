"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  FileText,
  Users,
  Calendar,
  TrendingUp,
  Clock,
  DollarSign,
  Loader2,
} from "lucide-react";

interface ReportData {
  totalSessions: number;
  completedSessions: number;
  scheduledSessions: number;
  totalPatients: number;
  activePatients: number;
  totalEarnings: number;
  averageSessionDuration: number;
  completionRate: number;
  thisMonthSessions: number;
  lastMonthSessions: number;
  growthRate: number;
}

interface AppointmentReportItem {
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  price: number | null;
  duration: number;
  startTime: string;
}

interface PsychologistPatientReportItem {
  upcomingSessions: number;
}

const EMPTY_REPORT: ReportData = {
  totalSessions: 0,
  completedSessions: 0,
  scheduledSessions: 0,
  totalPatients: 0,
  activePatients: 0,
  totalEarnings: 0,
  averageSessionDuration: 0,
  completionRate: 0,
  thisMonthSessions: 0,
  lastMonthSessions: 0,
  growthRate: 0,
};

export default function ReportPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReportData() {
      try {
        const [appointmentsRes, patientsRes] = await Promise.all([
          fetch("/api/appointments"),
          fetch("/api/psychologist/patients"),
        ]);

        if (!appointmentsRes.ok || !patientsRes.ok) {
          throw new Error("Failed to fetch report data");
        }

        const appointments = await appointmentsRes.json();
        const patients = await patientsRes.json();
        const appointmentItems = appointments as AppointmentReportItem[];
        const patientItems = patients as PsychologistPatientReportItem[];

        if (appointmentItems.length === 0) {
          setReport(EMPTY_REPORT);
          return;
        }

        // Calculate statistics
        const totalSessions = appointmentItems.length;
        const completedSessions = appointmentItems.filter(
          (appointment) => appointment.status === "COMPLETED"
        ).length;
        const scheduledSessions = appointmentItems.filter(
          (appointment) => appointment.status === "SCHEDULED"
        ).length;

        const totalPatients = patientItems.length;
        const activePatients = patientItems.filter(
          (patient) => patient.upcomingSessions > 0
        ).length;

        const totalEarnings =
          appointmentItems
            .filter((appointment) => appointment.status === "COMPLETED")
            .reduce((sum, appointment) => sum + (appointment.price || 0), 0) / 100;

        const avgDuration =
          appointmentItems.reduce((sum, appointment) => sum + (appointment.duration || 0), 0) /
          appointmentItems.length;

        const completionRate = totalSessions > 0
          ? Math.round((completedSessions / totalSessions) * 100)
          : 0;

        // This month vs last month
        const now = new Date();
        const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const thisMonthSessions = appointmentItems.filter((appointment) => {
          const date = new Date(appointment.startTime);
          return date >= firstOfThisMonth;
        }).length;

        const lastMonthSessions = appointmentItems.filter((appointment) => {
          const date = new Date(appointment.startTime);
          return date >= firstOfLastMonth && date < firstOfThisMonth;
        }).length;

        const growthRate = lastMonthSessions > 0
          ? Math.round(((thisMonthSessions - lastMonthSessions) / lastMonthSessions) * 100)
          : thisMonthSessions > 0 ? 100 : 0;

        setReport({
          totalSessions,
          completedSessions,
          scheduledSessions,
          totalPatients,
          activePatients,
          totalEarnings,
          averageSessionDuration: Math.round(avgDuration),
          completionRate,
          thisMonthSessions,
          lastMonthSessions,
          growthRate,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchReportData();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Reports & Analytics
          </h1>
          <p className="text-gray-500">
            Track your performance and practice growth
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
        ) : !report || report.totalSessions === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-[24px] p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-gray-300" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No reports yet
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Reports will be generated once you have completed sessions.
            </p>
          </div>
        ) : (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white border border-gray-200 rounded-[24px] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                    <Calendar size={24} className="text-blue-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 font-medium mb-1">Total Sessions</p>
                <p className="text-3xl font-bold text-gray-900">{report.totalSessions}</p>
                <p className="text-xs text-gray-400 mt-2">All time</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-[24px] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                    <Users size={24} className="text-green-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 font-medium mb-1">Total Patients</p>
                <p className="text-3xl font-bold text-gray-900">{report.totalPatients}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {report.activePatients} active
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-[24px] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
                    <DollarSign size={24} className="text-purple-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 font-medium mb-1">Total Earnings</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${report.totalEarnings.toFixed(0)}
                </p>
                <p className="text-xs text-gray-400 mt-2">All time</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-[24px] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
                    <TrendingUp size={24} className="text-orange-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 font-medium mb-1">Completion Rate</p>
                <p className="text-3xl font-bold text-gray-900">{report.completionRate}%</p>
                <p className="text-xs text-gray-400 mt-2">
                  {report.completedSessions} of {report.totalSessions}
                </p>
              </div>
            </div>

            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Session Breakdown */}
              <div className="bg-white border border-gray-200 rounded-[24px] p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Session Breakdown</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Calendar size={20} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Completed</p>
                        <p className="text-xs text-gray-500">Sessions finished</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {report.completedSessions}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Clock size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Scheduled</p>
                        <p className="text-xs text-gray-500">Upcoming sessions</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {report.scheduledSessions}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <Clock size={20} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Avg. Duration</p>
                        <p className="text-xs text-gray-500">Per session</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {report.averageSessionDuration} min
                    </p>
                  </div>
                </div>
              </div>

              {/* Growth Metrics */}
              <div className="bg-white border border-gray-200 rounded-[24px] p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Growth Metrics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-gray-900">This Month</p>
                      <p className="text-xs text-gray-500">Sessions this month</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {report.thisMonthSessions}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Last Month</p>
                      <p className="text-xs text-gray-500">Previous month</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {report.lastMonthSessions}
                    </p>
                  </div>

                  <div className={`flex items-center justify-between p-4 rounded-xl ${
                    report.growthRate >= 0 ? "bg-green-50" : "bg-red-50"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        report.growthRate >= 0 ? "bg-green-100" : "bg-red-100"
                      }`}>
                        <TrendingUp size={20} className={
                          report.growthRate >= 0 ? "text-green-600" : "text-red-600"
                        } />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Growth Rate</p>
                        <p className="text-xs text-gray-500">Month over month</p>
                      </div>
                    </div>
                    <p className={`text-2xl font-bold ${
                      report.growthRate >= 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      {report.growthRate >= 0 ? "+" : ""}{report.growthRate}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
