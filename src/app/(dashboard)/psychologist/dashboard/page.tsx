import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { KPIGrid } from "@/components/dashboard/home/KPIGrid";
import { PatientsOverviewChart } from "@/components/dashboard/home/PatientsOverviewChart";
import { UpcomingAppointments } from "@/components/dashboard/home/UpcomingAppointmentsCard";
import { AppointmentRequests } from "@/components/dashboard/home/AppointmentRequests";

export default function PsychologistDashboardHome() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold dash-heading">Dashboard</h1>
          <p className="text-sm dash-muted mt-1">Overview of your practice activity and appointments.</p>
        </div>

        <div className="flex flex-col xl:flex-row gap-6">
          <div className="flex-1 space-y-6 min-w-0">
            <KPIGrid />
            <UpcomingAppointments />
          </div>

          <div className="w-full xl:w-[380px] space-y-6 flex flex-col">
            <div className="h-[340px]">
              <PatientsOverviewChart />
            </div>
            <div className="flex-1 min-h-[400px]">
              <AppointmentRequests />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
