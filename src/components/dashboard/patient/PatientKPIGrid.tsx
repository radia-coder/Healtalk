"use client";

import { Users, Calendar, Clock, Activity, Heart, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppointments } from "@/hooks/useAppointments";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));

const formatTime = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

export function PatientKPIGrid() {
  const { appointments } = useAppointments();
  const now = new Date();
  const upcoming = appointments
    .filter((appointment) => appointment.status === "SCHEDULED")
    .filter((appointment) => new Date(appointment.startTime) >= now)
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  const nextAppointment = upcoming[0];
  const psychologistCount = new Set(
    appointments.map((appointment) => appointment.psychologist?.id).filter(Boolean)
  ).size;
  const minutesSpent = appointments
    .filter((appointment) => appointment.status === "COMPLETED")
    .reduce((sum, appointment) => sum + (appointment.duration || 0), 0);

  const stats = [
    {
      label: "Total Sessions",
      value: `${appointments.length}`,
      trend: "All time",
      trendUp: true,
      last: "Sessions",
      icon: Users,
      color: "text-[#5B6CFF]",
      bg: "bg-[#EEF0FF]",
    },
    {
      label: "Next Appointment",
      value: nextAppointment ? formatDate(nextAppointment.startTime) : "—",
      trend: nextAppointment ? formatTime(nextAppointment.startTime) : "Not scheduled",
      trendUp: true,
      last: "Upcoming",
      icon: Calendar,
      color: "text-[#20C997]",
      bg: "bg-[#E6F8F3]",
    },
    {
      label: "Psychologists",
      value: `${psychologistCount}`,
      trend: psychologistCount ? "Connected" : "None yet",
      trendUp: true,
      last: "Specialists",
      icon: Heart,
      color: "text-[#FF9F43]",
      bg: "bg-[#FFF5EB]",
    },
    {
      label: "Minutes Spent",
      value: `${minutesSpent}`,
      trend: minutesSpent ? "Completed" : "No sessions yet",
      trendUp: true,
      last: "Total",
      icon: Clock,
      color: "text-[#FF6B6B]",
      bg: "bg-[#FFEEEE]",
    },
    {
      label: "Mood Entry",
      value: "—",
      trend: "No data yet",
      trendUp: true,
      last: "Last 7 days",
      icon: Activity,
      color: "text-[#20C997]",
      bg: "bg-[#E6F8F3]",
    },
    {
      label: "Goals Reached",
      value: "—",
      trend: "No data yet",
      trendUp: true,
      last: "Completion",
      icon: Award,
      color: "text-[#5B6CFF]",
      bg: "bg-[#EEF0FF]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {stats.map((stat, i) => (
        <div 
          key={i} 
          className="bg-white rounded-[16px] border border-[#E6EAF2] p-5 shadow-[0_8px_24px_rgba(17,24,39,0.02)] hover:shadow-[0_8px_24px_rgba(17,24,39,0.06)] transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
             <div className={cn("w-10 h-10 rounded-[10px] flex items-center justify-center", stat.bg)}>
               <stat.icon size={20} className={stat.color} />
             </div>
          </div>
          
          <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.label}</h3>
          
          <div className="flex items-end justify-between">
             <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
             <div className="flex items-center gap-1 text-xs">
               <span className="text-gray-400">{stat.last}</span>
               {stat.trend && (
                 <span className={cn(
                   "font-medium px-1.5 py-0.5 rounded",
                   stat.trendUp ? "text-[#20C997] bg-[#E6F8F3]" : "text-[#FF6B6B] bg-[#FFEEEE]"
                 )}>
                   {stat.trend}
                 </span>
               )}
             </div>
          </div>
        </div>
      ))}
    </div>
  );
}
