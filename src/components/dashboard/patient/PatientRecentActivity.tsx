"use client";

import { useEffect, useState } from "react";
import { Calendar, MessageSquare, CheckCircle, Clock, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: string;
  type: "APPOINTMENT" | "MESSAGE" | "COMPLETED";
  title: string;
  description: string;
  timestamp: Date;
  icon: "calendar" | "message" | "check" | "clock";
}

interface AppointmentActivityItem {
  id: string;
  status: string;
  startTime: string;
  endTime?: string;
  createdAt?: string;
  updatedAt?: string;
  psychologist?: {
    user?: {
      name?: string | null;
    } | null;
  } | null;
}

export function PatientRecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivity() {
      try {
        // Fetch recent appointments
        const appointmentsRes = await fetch("/api/appointments");

        // 401 = not logged in, 404 = no patient profile yet — both are normal, just show empty
        if (appointmentsRes.status === 401 || appointmentsRes.status === 404) {
          setActivities([]);
          return;
        }

        if (!appointmentsRes.ok) throw new Error("Failed to fetch appointments");

        const appointments = (await appointmentsRes.json()) as AppointmentActivityItem[];

        // Convert appointments to activities
        const recentActivities: Activity[] = appointments
          .slice(0, 5)
          .map((appointment) => {
            const psychologistName = appointment.psychologist?.user?.name || "Psychologist";
            const status = appointment.status;

            if (status === "COMPLETED") {
              return {
                id: appointment.id,
                type: "COMPLETED",
                title: "Session Completed",
                description: `Completed session with ${psychologistName}`,
                timestamp: new Date(appointment.endTime || appointment.startTime),
                icon: "check" as const,
              };
            } else if (status === "SCHEDULED") {
              return {
                id: appointment.id,
                type: "APPOINTMENT",
                title: "Appointment Scheduled",
                description: `Upcoming session with ${psychologistName}`,
                timestamp: new Date(appointment.createdAt || appointment.startTime),
                icon: "calendar" as const,
              };
            } else {
              return {
                id: appointment.id,
                type: "APPOINTMENT",
                title: "Appointment Updated",
                description: `${status} - ${psychologistName}`,
                timestamp: new Date(appointment.updatedAt || appointment.startTime),
                icon: "clock" as const,
              };
            }
          });

        setActivities(recentActivities);
      } catch (err) {
        console.error("Error fetching activity:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchActivity();
  }, []);

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case "calendar": return <Calendar size={16} className="text-[var(--dash-primary)]" />;
      case "message": return <MessageSquare size={16} className="text-[var(--dash-accent)]" />;
      case "check": return <CheckCircle size={16} className="text-[var(--dash-success)]" />;
      case "clock": return <Clock size={16} className="text-[var(--dash-warning)]" />;
      default: return <Calendar size={16} className="text-gray-400" />;
    }
  };

  return (
    <div className="dash-card p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold dash-heading text-lg">Recent Activity</h3>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-10">
          <Loader2 className="animate-spin text-[var(--dash-primary)]" size={24} />
        </div>
      ) : activities.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-10 text-center text-sm text-gray-500">
          No recent activity yet.
        </div>
      ) : (
        <div className="space-y-4 flex-1 overflow-y-auto">
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-3 pb-4 border-b border-[var(--dash-border)] last:border-0">
              <div className="flex-shrink-0 mt-1">
                {getIcon(activity.icon)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--dash-text)] truncate">
                  {activity.title}
                </p>
                <p className="text-xs text-[var(--dash-text-muted)] truncate">
                  {activity.description}
                </p>
                <p className="text-xs text-[var(--dash-text-muted)] opacity-80 mt-1">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
