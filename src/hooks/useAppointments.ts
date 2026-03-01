/**
 * useAppointments — fetches the current user's appointments from the API.
 *
 * Optionally filters by status (e.g. "SCHEDULED"). Returns the appointment
 * list plus loading/error state so callers can render appropriate UI.
 */
import { useEffect, useState } from "react";

type AppointmentType = "VIDEO" | "AUDIO" | "IN_PERSON";
type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

export type AppointmentRecord = {
  id: string;
  startTime: string;
  endTime: string;
  date: string;
  duration: number;
  type: AppointmentType;
  status: AppointmentStatus;
  createdAt?: string;
  psychologist?: {
    id: string;
    credentials?: string;
    user?: { name: string | null; image: string | null };
  } | null;
  patient?: {
    id: string;
    user?: { name: string | null; image: string | null };
  } | null;
};

export function useAppointments(status?: AppointmentStatus) {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadAppointments = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const query = status ? `?status=${status}` : "";
        const res = await fetch(`/api/appointments${query}`);
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          if (isMounted) {
            // Provide specific messages for common error codes.
            const message =
              res.status === 401
                ? "You must be logged in to view appointments."
                : res.status === 403
                ? "You don't have permission to view these appointments."
                : data?.error || "Failed to load appointments.";
            setError(message);
            setAppointments([]);
          }
          return;
        }

        const data = (await res.json()) as AppointmentRecord[];
        if (isMounted) {
          setAppointments(data || []);
        }
      } catch {
        if (isMounted) {
          // Network error — the API never responded.
          setError("Network error: could not reach the server. Please check your connection.");
          setAppointments([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAppointments();

    return () => {
      isMounted = false;
    };
  }, [status]);

  return { appointments, isLoading, error };
}
