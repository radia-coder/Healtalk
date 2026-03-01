"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { TrendingUp, Loader2, Smile, Meh, Frown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProgressEntry {
  id: string;
  date: Date;
  mood: string;
  notes: string | null;
  goals: ProgressGoal[];
}

interface ProgressGoal {
  title: string;
  completed: boolean;
}

interface ProgressApiEntry {
  id: string;
  date: string;
  mood: string;
  notes: string | null;
  goals?: unknown;
}

const toProgressGoals = (value: unknown): ProgressGoal[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (goal): goal is ProgressGoal =>
        typeof goal === "object" &&
        goal !== null &&
        "title" in goal &&
        "completed" in goal &&
        typeof (goal as ProgressGoal).title === "string" &&
        typeof (goal as ProgressGoal).completed === "boolean"
    )
    .map((goal) => ({ title: goal.title, completed: goal.completed }));
};

export default function ProgressPage() {
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProgress();
  }, []);

  async function fetchProgress() {
    try {
      const res = await fetch("/api/progress");
      if (!res.ok) throw new Error("Failed to fetch progress");

      const data = (await res.json()) as ProgressApiEntry[];
      setEntries(data.map((entry) => ({
        ...entry,
        date: new Date(entry.date),
        goals: toProgressGoals(entry.goals),
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case "great":
      case "good":
        return <Smile className="text-green-500" size={24} />;
      case "okay":
        return <Meh className="text-yellow-500" size={24} />;
      case "bad":
      case "terrible":
        return <Frown className="text-red-500" size={24} />;
      default:
        return <Meh className="text-gray-400" size={24} />;
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case "great": return "bg-green-100 text-green-700";
      case "good": return "bg-green-50 text-green-600";
      case "okay": return "bg-yellow-50 text-yellow-600";
      case "bad": return "bg-orange-50 text-orange-600";
      case "terrible": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  // Calculate mood statistics
  const moodCounts = entries.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalEntries = entries.length;
  const positiveEntries = (moodCounts["great"] || 0) + (moodCounts["good"] || 0);
  const positivePercentage = totalEntries > 0 ? Math.round((positiveEntries / totalEntries) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Progress</h1>
            <p className="text-gray-500">
              {loading
                ? "Loading progress..."
                : entries.length > 0
                ? `${entries.length} mood entr${entries.length !== 1 ? "ies" : "y"} logged`
                : "Track your mental health journey"}
            </p>
          </div>
          <Button
            onClick={() => alert("Add mood entry feature coming soon!")}
            className="bg-[#5B6CFF] hover:bg-[#4a5ae0]"
          >
            Log Mood
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 bg-white border border-dashed border-gray-200 rounded-[24px]">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white border border-red-200 rounded-[24px]">
            <p className="text-red-600">Error: {error}</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-[24px] p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="text-gray-300" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No progress data yet</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Start tracking your mood and mental health journey. Log your first entry to see your progress over time.
            </p>
            <Button
              onClick={() => alert("Add mood entry feature coming soon!")}
              className="bg-[#5B6CFF] hover:bg-[#4a5ae0]"
            >
              Log Your First Mood
            </Button>
          </div>
        ) : (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-[24px] p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500 font-medium">Total Entries</p>
                  <TrendingUp size={20} className="text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{totalEntries}</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-[24px] p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500 font-medium">Positive Days</p>
                  <Smile size={20} className="text-green-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{positiveEntries}</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-[24px] p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500 font-medium">Positive Rate</p>
                  <TrendingUp size={20} className="text-green-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{positivePercentage}%</p>
              </div>
            </div>

            {/* Mood Entries */}
            <div className="bg-white border border-gray-200 rounded-[24px] p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Mood History</h3>
              <div className="space-y-4">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getMoodIcon(entry.mood)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getMoodColor(entry.mood)}`}>
                          {entry.mood}
                        </span>
                        <span className="text-sm text-gray-500">
                          {entry.date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      {entry.notes && (
                        <p className="text-sm text-gray-700">{entry.notes}</p>
                      )}
                      {entry.goals.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {entry.goals.map((goal, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <div className={`w-4 h-4 rounded border ${goal.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                                {goal.completed && <span className="text-white text-xs">✓</span>}
                              </div>
                              <span className={goal.completed ? "text-gray-500 line-through" : "text-gray-700"}>
                                {goal.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
