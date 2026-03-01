"use client";

import { useEffect, useState } from "react";
import { Users, TrendingUp, Calendar, Loader2 } from "lucide-react";

interface PatientStats {
  totalPatients: number;
  activePatients: number;
  newThisMonth: number;
  upcomingSessions: number;
}

interface PsychologistPatient {
  upcomingSessions?: number;
}

interface AppointmentSummary {
  status: string;
  startTime: string;
  createdAt?: string | null;
}

export function PatientsOverviewChart() {
  const [stats, setStats] = useState<PatientStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [patientsRes, appointmentsRes] = await Promise.all([
          fetch("/api/psychologist/patients"),
          fetch("/api/appointments"),
        ]);

        if (!patientsRes.ok || !appointmentsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const patients = (await patientsRes.json()) as PsychologistPatient[];
        const appointments = (await appointmentsRes.json()) as AppointmentSummary[];

        // Calculate stats
        const totalPatients = patients.length;
        const activePatients = patients.filter((patient) => (patient.upcomingSessions || 0) > 0).length;

        // New patients this month (simplified - count patients with first appointment this month)
        const now = new Date();
        const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const newThisMonth = appointments.filter((appointment) => {
          const createdAt = new Date(appointment.createdAt || appointment.startTime);
          return createdAt >= firstOfMonth;
        }).length;

        const upcomingSessions = appointments.filter(
          (appointment) => appointment.status === "SCHEDULED"
        ).length;

        setStats({
          totalPatients,
          activePatients,
          newThisMonth,
          upcomingSessions,
        });
      } catch (err) {
        console.error("Error fetching patient stats:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="dash-card p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-bold dash-heading text-lg">Patients Overview</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-[var(--dash-primary)]" size={32} />
        </div>
      </div>
    );
  }

  if (!stats || stats.totalPatients === 0) {
    return (
      <div className="dash-card p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-bold dash-heading text-lg">Patients Overview</h3>
        </div>
        <div className="flex-1 min-h-[250px] w-full flex items-center justify-center">
          <div className="text-sm dash-muted">No patient data yet.</div>
        </div>
      </div>
    );
  }

  const activePercentage = stats.totalPatients > 0
    ? Math.round((stats.activePatients / stats.totalPatients) * 100)
    : 0;

  return (
    <div className="dash-card p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-bold dash-heading text-lg">Patients Overview</h3>
      </div>

      <div className="space-y-6 flex-1">
        <div className="flex items-center justify-between p-4 rounded-xl border bg-[var(--dash-primary-soft)] border-[var(--dash-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--dash-surface)] flex items-center justify-center">
              <Users size={20} className="text-[var(--dash-primary)]" />
            </div>
            <div>
              <p className="text-xs dash-muted font-medium">Total Patients</p>
              <p className="text-2xl font-bold dash-heading">{stats.totalPatients}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border bg-[var(--dash-success-soft)] border-[var(--dash-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--dash-surface)] flex items-center justify-center">
              <TrendingUp size={20} className="text-[var(--dash-success)]" />
            </div>
            <div>
              <p className="text-xs dash-muted font-medium">Active Patients</p>
              <p className="text-2xl font-bold dash-heading">{stats.activePatients}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs dash-muted">of total</p>
            <p className="text-sm font-bold text-[var(--dash-success)]">{activePercentage}%</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border bg-[var(--dash-accent-soft)] border-[var(--dash-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--dash-surface)] flex items-center justify-center">
              <Calendar size={20} className="text-[var(--dash-accent)]" />
            </div>
            <div>
              <p className="text-xs dash-muted font-medium">Upcoming Sessions</p>
              <p className="text-2xl font-bold dash-heading">{stats.upcomingSessions}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
