"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { SessionCard } from "@/components/sessions/SessionCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, Filter } from "lucide-react";

type SessionListItem = {
  id: string;
  title: string;
  description?: string;
  type: string;
  maxParticipants: number;
  startTime: string;
  duration: number;
  pricePerPerson: number;
  status: string;
  psychologist: {
    user: {
      name: string;
      image: string | null;
    };
  };
  _count?: {
    participants: number;
  };
  availableSpots?: number;
  isFull?: boolean;
};

export default function PatientSessionsPage() {
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningSessionId, setJoiningSessionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("DATE");

  useEffect(() => {
    fetchSessions();
  }, []);

  async function fetchSessions() {
    try {
      const params = new URLSearchParams();
      params.append("status", "SCHEDULED");

      const today = new Date();
      params.append("fromDate", today.toISOString());

      const res = await fetch(`/api/sessions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const normalizedSessions: SessionListItem[] = (data.sessions || []).map(
          (session: SessionListItem & { description?: string | null }) => ({
            ...session,
            description: session.description ?? undefined,
          })
        );
        setSessions(normalizedSessions);
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinSession(sessionId: string) {
    setJoiningSessionId(sessionId);

    try {
      const res = await fetch(`/api/sessions/${sessionId}/join`, {
        method: "POST",
      });

      if (res.ok) {
        alert("Successfully registered for session! 🎉");
        await fetchSessions();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to join session");
      }
    } catch (err) {
      console.error("Error joining session:", err);
      alert("Failed to join session. Please try again.");
    } finally {
      setJoiningSessionId(null);
    }
  }

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.psychologist.user.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === "ALL" || session.type === typeFilter;

    return matchesSearch && matchesType;
  });

  if (sortBy === "DATE") {
    filteredSessions.sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  } else if (sortBy === "PRICE") {
    filteredSessions.sort((a, b) => a.pricePerPerson - b.pricePerPerson);
  } else if (sortBy === "SPOTS") {
    filteredSessions.sort((a, b) => (b.availableSpots || 0) - (a.availableSpots || 0));
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold dash-heading mb-1">Discover Sessions</h1>
          <p className="dash-muted">Find and join group therapy sessions</p>
        </div>

        <div className="dash-card p-5">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[240px]">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 dash-muted"
                  size={18}
                />
                <Input
                  placeholder="Search sessions, topics, or psychologists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 dash-input"
                />
              </div>
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[190px] border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text)]">
                <Filter size={16} className="mr-2 dash-muted" />
                <SelectValue placeholder="Session Type" />
              </SelectTrigger>
              <SelectContent className="border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text)]">
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="GROUP">Group Only</SelectItem>
                <SelectItem value="ONE_ON_ONE">One-on-One</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[190px] border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text)]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text)]">
                <SelectItem value="DATE">Date (Soonest)</SelectItem>
                <SelectItem value="PRICE">Price (Low to High)</SelectItem>
                <SelectItem value="SPOTS">Available Spots</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 dash-card">
            <Loader2 className="animate-spin text-[var(--dash-primary)]" size={32} />
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-12 dash-card border-dashed">
            <p className="dash-muted mb-2">
              {searchQuery || typeFilter !== "ALL"
                ? "No sessions match your filters"
                : "No upcoming sessions available"}
            </p>
            <p className="text-sm dash-muted">Check back later for new sessions</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm dash-muted">
                {filteredSessions.length} session{filteredSessions.length !== 1 ? "s" : ""}{" "}
                available
              </p>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
              {filteredSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onJoin={handleJoinSession}
                  showJoinButton={true}
                  isLoading={joiningSessionId === session.id}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
