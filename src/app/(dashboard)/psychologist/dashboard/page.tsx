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
          <h1 className="text-2xl font-bold dash-heading">Overview</h1>
          <p className="text-sm dash-muted mt-1">Overview of your practice activity and appointments.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start">
          <div className="space-y-6 min-w-0">
            <KPIGrid />
            <UpcomingAppointments />
          </div>

          <div className="w-full xl:w-[380px] min-w-0 space-y-6">
            <PatientsOverviewChart />
            <AppointmentRequests />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
