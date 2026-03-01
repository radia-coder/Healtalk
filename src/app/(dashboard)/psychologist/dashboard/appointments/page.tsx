"use client";

import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Calendar, Clock, Video, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAppointments } from "@/hooks/useAppointments";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

const formatTime = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

export default function PsychologistAppointmentsPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed">(
    "upcoming"
  );
  const { appointments, isLoading } = useAppointments();
  const now = new Date();

  const upcomingAppointments = appointments
    .filter((appointment) => appointment.status === "SCHEDULED")
    .filter((appointment) => new Date(appointment.startTime) >= now)
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

  const completedAppointments = appointments
    .filter((appointment) => appointment.status === "COMPLETED")
    .sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );

  const list =
    activeTab === "upcoming" ? upcomingAppointments : completedAppointments;

  return (
    <DashboardLayout>
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Appointments
            </h1>
            <p className="text-gray-500">Manage your schedule and history</p>
          </div>
          <Link href="/psychologist/dashboard/profile">
            <Button className="bg-[#5B6CFF] hover:bg-[#4a5ae0] shadow-lg shadow-blue-500/20 rounded-[12px] h-11 px-6">
              <Calendar className="mr-2" size={18} />
              Update Availability
            </Button>
          </Link>
        </div>

        <div className="flex gap-2 p-1 bg-gray-100/50 rounded-xl w-fit border border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={cn(
              "px-6 py-2.5 text-sm font-semibold rounded-lg transition-all",
              activeTab === "upcoming"
                ? "bg-white text-[#5B6CFF] shadow-sm border border-gray-100"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            )}
          >
            Upcoming ({upcomingAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={cn(
              "px-6 py-2.5 text-sm font-semibold rounded-lg transition-all",
              activeTab === "completed"
                ? "bg-white text-[#5B6CFF] shadow-sm border border-gray-100"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            )}
          >
            Completed ({completedAppointments.length})
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-[24px]">
            <div className="text-gray-500">Loading appointments...</div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {list.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-white border border-[#E6EAF2] rounded-[16px] p-6 hover:shadow-[0_8px_24px_rgba(17,24,39,0.04)] transition-all group"
                >
                  <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                    <div className="flex items-start gap-5 w-full md:w-auto">
                      <div className="w-16 h-16 rounded-[16px] bg-[#EEF0FF] flex items-center justify-center flex-shrink-0 text-[#5B6CFF] text-2xl font-bold">
                        {(appointment.patient?.user?.name || "P")[0]}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-bold text-gray-900">
                            {appointment.patient?.user?.name || "Patient"}
                          </h3>
                          <span className={cn(
                            "px-2 py-0.5 text-[11px] font-bold rounded-full uppercase tracking-wide",
                            appointment.status === "SCHEDULED"
                              ? "bg-[#E6F8F3] text-[#20C997]"
                              : "bg-gray-100 text-gray-500"
                          )}>
                            {appointment.status.toLowerCase()}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 mt-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-700 font-medium">
                            <Calendar size={16} className="text-[#5B6CFF]" />
                            {formatDate(appointment.startTime)}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock size={16} className="text-[#5B6CFF]" />
                            {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Video size={16} className="text-gray-400" />
                            {appointment.type.replace("_", " ")}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 md:pl-6 md:border-l">
                      {activeTab === "upcoming" ? (
                        <>
                          <Link href={`/shared/call/${appointment.id}`}>
                            <Button className="w-full sm:w-auto bg-[#5B6CFF] hover:bg-[#4a5ae0] shadow-md shadow-blue-500/20 rounded-[12px] h-10 px-6">
                              Start Session
                            </Button>
                          </Link>
                          <Link href={`/psychologist/dashboard/messages?appointmentId=${appointment.id}&action=reschedule`}>
                            <Button variant="outline" className="w-full sm:w-auto rounded-[12px] border-gray-200 text-gray-600 h-10">
                              Reschedule
                            </Button>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link href="/psychologist/dashboard/report">
                            <Button variant="outline" className="w-full sm:w-auto rounded-[12px] border-gray-200 text-gray-600 h-10 gap-2">
                              <FileText size={16} /> View Notes
                            </Button>
                          </Link>
                          <Link href={`/psychologist/dashboard/messages?appointmentId=${appointment.id}`}>
                            <Button variant="ghost" className="w-full sm:w-auto rounded-[12px] text-[#5B6CFF] hover:bg-[#EEF0FF] h-10">
                              Follow Up
                            </Button>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {list.length === 0 && (
              <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-[24px]">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="text-gray-300" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No {activeTab} appointments
                </h3>
                <p className="text-gray-500">
                  {activeTab === "upcoming"
                    ? "Your upcoming sessions will appear here."
                    : "Completed sessions will appear here once finished."}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
