"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Users, Calendar, CheckCircle, Clock, Mail, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Patient {
  id: string;
  userId: string;
  name: string;
  image: string | null;
  email: string;
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
  lastSessionDate: string | null;
  nextSessionDate: string | null;
  lastAppointmentId: string | null;
  nextAppointmentId: string | null;
}

export default function PsychologistPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPatients() {
      try {
        const response = await fetch("/api/psychologist/patients");
        if (!response.ok) {
          throw new Error("Failed to fetch patients");
        }
        const data = await response.json();
        setPatients(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchPatients();
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Patients</h1>
          <p className="text-gray-500">
            {loading
              ? "Loading patients..."
              : patients.length > 0
              ? `Manage ${patients.length} patient ${patients.length === 1 ? "record" : "records"} and sessions`
              : "Patient profiles will appear here after your first bookings"}
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
        ) : patients.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-[24px]">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-gray-300" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No patients yet</h3>
            <p className="text-gray-500">
              Patient profiles will appear here after your first bookings.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {patients.map((patient) => (
              <div
                key={patient.id}
                className="bg-white border border-gray-200 rounded-[24px] p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    {patient.image ? (
                      <Image
                        src={patient.image}
                        alt={patient.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Users className="text-gray-400" size={24} />
                      </div>
                    )}
                  </div>

                  {/* Patient Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {patient.name}
                      </h3>
                      {patient.upcomingSessions > 0 && (
                        <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                      <Mail size={14} />
                      <span className="truncate">{patient.email}</span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="text-gray-400" size={16} />
                        <div>
                          <p className="text-xs text-gray-500">Total Sessions</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {patient.totalSessions}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <CheckCircle className="text-green-500" size={16} />
                        <div>
                          <p className="text-xs text-gray-500">Completed</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {patient.completedSessions}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="text-blue-500" size={16} />
                        <div>
                          <p className="text-xs text-gray-500">Upcoming</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {patient.upcomingSessions}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="text-purple-500" size={16} />
                        <div>
                          <p className="text-xs text-gray-500">
                            {patient.nextSessionDate ? "Next Session" : "Last Session"}
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatDate(patient.nextSessionDate || patient.lastSessionDate) || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {(patient.nextAppointmentId || patient.lastAppointmentId) ? (
                      <Link
                        href={`/psychologist/dashboard/messages?appointmentId=${patient.nextAppointmentId || patient.lastAppointmentId}`}
                        className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
                      >
                        Message
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="px-4 py-2 text-sm font-medium text-gray-400 border border-gray-300 rounded-lg cursor-not-allowed opacity-50"
                      >
                        Message
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
