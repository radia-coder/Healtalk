"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PatientUpcomingAppointments } from "@/components/dashboard/patient/PatientUpcomingAppointments";
import { PatientQuickActions } from "@/components/dashboard/patient/PatientQuickActions";
import { PatientRecentActivity } from "@/components/dashboard/patient/PatientRecentActivity";
import { PatientNextAppointmentCard } from "@/components/dashboard/patient/PatientNextAppointmentCard";
import { useSession } from "next-auth/react";

const getFirstName = (value?: string | null) => {
  if (!value) return "there";
  return value.trim().split(" ")[0] || "there";
};

export default function PatientDashboardHome() {
  const { data: session } = useSession();
  const firstName = getFirstName(session?.user?.name || session?.user?.email);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold dash-heading">Welcome back, {firstName}</h1>
          <p className="text-sm dash-muted mt-1">Here&apos;s what&apos;s happening with your mental health journey.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
          <div className="xl:col-span-8">
            <PatientQuickActions />
          </div>
          <div className="xl:col-span-4 h-full">
            <PatientNextAppointmentCard />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
          <div className="xl:col-span-8">
            <PatientUpcomingAppointments />
          </div>
          <div className="xl:col-span-4">
            <PatientRecentActivity />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
