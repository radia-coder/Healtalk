"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ChatbotInterface } from "@/components/screening/ChatbotInterface";
import { ScreeningResults } from "@/components/screening/ScreeningResults";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, PenTool, Sparkles, Zap, Compass, Send, Brain } from "lucide-react";
import { format } from "date-fns";

interface Assessment {
  id: string;
  completedAt: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRISIS";
  aiSummary: string;
  createdAt: string;
}

type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRISIS";

interface AssessmentResult {
  riskLevel: RiskLevel;
  aiSummary: string;
  recommendedActions: string[];
}

interface RawAssessmentResult {
  riskLevel: string;
  aiSummary: string;
  recommendedActions: string[];
}

const VALID_RISK_LEVELS = new Set<RiskLevel>(["LOW", "MEDIUM", "HIGH", "CRISIS"]);

const normalizeRiskLevel = (riskLevel: string): RiskLevel =>
  VALID_RISK_LEVELS.has(riskLevel as RiskLevel)
    ? (riskLevel as RiskLevel)
    : "MEDIUM";

const riskDotStyles: Record<RiskLevel, string> = {
  LOW: "bg-[var(--dash-success)]",
  MEDIUM: "bg-[var(--dash-warning)]",
  HIGH: "bg-[var(--dash-danger)]",
  CRISIS: "bg-[var(--dash-danger)]",
};

export default function PatientScreeningPage() {
  const [view, setView] = useState<"list" | "chat" | "results">("list");
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [currentResults, setCurrentResults] = useState<AssessmentResult | null>(null);
  const [query, setQuery] = useState("");
  const [initialMessage, setInitialMessage] = useState<string | null>(null);

  const chips = [
    {
      id: "quick",
      label: "Quick Check",
      icon: Zap,
      message: "I want a quick mental health check-in.",
    },
    {
      id: "indepth",
      label: "In-Depth",
      icon: Sparkles,
      message: "I want a deeper mental health assessment.",
    },
    {
      id: "mood",
      label: "Mood Review",
      icon: Brain,
      message: "Help me review my recent mood and stress levels.",
    },
    {
      id: "journal",
      label: "Journal Prompt",
      icon: PenTool,
      message: "Give me a guided journal-style mental health check.",
    },
  ];

  async function refreshAssessments() {
    try {
      const res = await fetch("/api/screening");
      if (res.ok) {
        const data = await res.json();
        setAssessments(data.assessments || []);
      }
    } catch (error) {
      console.error("Error fetching assessments:", error);
    }
  }

  useEffect(() => {
    let isMounted = true;

    fetch("/api/screening")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data) return;
        setAssessments(data.assessments || []);
      })
      .catch((error) => {
        console.error("Error fetching assessments:", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAssessmentComplete = (data: RawAssessmentResult) => {
    setCurrentResults({
      aiSummary: data.aiSummary,
      recommendedActions: data.recommendedActions,
      riskLevel: normalizeRiskLevel(data.riskLevel),
    });
    setView("results");
    void refreshAssessments();
  };

  const handleStartNewAssessment = (message = "") => {
    const trimmedMessage = message.trim();
    setInitialMessage(trimmedMessage ? trimmedMessage : null);
    setView("chat");
    setCurrentResults(null);
    setQuery("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 min-h-[calc(100vh-150px)]">
        {view === "list" && (
          <>
            <section className="dash-card p-6 md:p-8">
              <div className="max-w-3xl">
                <h1 className="text-3xl md:text-4xl font-bold dash-heading tracking-tight">
                  Mental Health Screening
                </h1>
                <p className="dash-muted mt-2 text-base md:text-lg">
                  Start an AI-assisted check-in to understand your emotional state and get practical next steps.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {chips.map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => handleStartNewAssessment(chip.message)}
                    className="group inline-flex items-center gap-2 rounded-full border border-[var(--dash-border)] bg-[var(--dash-surface-elev)] px-4 py-2 text-sm font-medium text-[var(--dash-text)] transition-colors hover:border-[var(--dash-border-strong)] hover:bg-[var(--dash-chip)]"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--dash-primary-soft)] text-[var(--dash-primary)]">
                      <chip.icon size={14} />
                    </span>
                    {chip.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="dash-card p-4 md:p-5">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Tell HealTalk AI what you want help with..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleStartNewAssessment(query);
                    }
                  }}
                  className="dash-input h-12 pr-14 text-base"
                />
                <Button
                  size="icon"
                  onClick={() => handleStartNewAssessment(query)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg dash-btn-primary"
                >
                  <Send size={16} />
                </Button>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-xs dash-muted">
                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--dash-border)] px-3 py-1 bg-[var(--dash-surface-elev)]">
                    <Compass size={12} /> Guided prompts
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--dash-border)] px-3 py-1 bg-[var(--dash-surface-elev)]">
                    <Brain size={12} /> Personalized insights
                  </span>
                </div>
                <span className="text-xs dash-muted tabular-nums">{query.length}/3000</span>
              </div>
            </section>

            <section className="dash-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold dash-heading">Recent Check-ins</h2>
                {assessments.length > 0 && (
                  <span className="text-xs dash-muted">Latest {Math.min(assessments.length, 6)}</span>
                )}
              </div>

              {assessments.length === 0 ? (
                <div className="dash-card-elev p-6 text-center">
                  <p className="dash-muted text-sm">No assessments yet. Start your first screening above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {assessments.slice(0, 6).map((assessment) => (
                    <div
                      key={assessment.id}
                      className="dash-card-elev p-4 transition-colors hover:border-[var(--dash-border-strong)]"
                    >
                      <div className="flex items-start gap-3">
                        <span className={`mt-1 h-2.5 w-2.5 rounded-full ${riskDotStyles[assessment.riskLevel]}`} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium dash-heading line-clamp-2">
                            {assessment.aiSummary}
                          </p>
                          <p className="text-xs dash-muted mt-2">
                            {format(new Date(assessment.completedAt), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {view === "chat" && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <Button
                onClick={() => setView("list")}
                variant="ghost"
                className="rounded-full gap-2 text-[var(--dash-text-muted)] hover:bg-[var(--dash-surface-elev)] hover:text-[var(--dash-text)]"
              >
                <ArrowLeft size={18} />
                Back
              </Button>
              <h2 className="text-xl font-bold dash-heading">Assessment</h2>
              <div className="w-20" />
            </div>

            <div className="dash-card p-2 md:p-4 h-[calc(100vh-230px)] min-h-[540px]">
              <ChatbotInterface
                onComplete={handleAssessmentComplete}
                initialUserMessage={initialMessage}
              />
            </div>
          </section>
        )}

        {view === "results" && currentResults && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <Button
                onClick={() => setView("list")}
                variant="ghost"
                className="rounded-full gap-2 text-[var(--dash-text-muted)] hover:bg-[var(--dash-surface-elev)] hover:text-[var(--dash-text)]"
              >
                <ArrowLeft size={18} />
                Home
              </Button>
              <h2 className="text-xl font-bold dash-heading">Results</h2>
              <div className="w-20" />
            </div>

            <div className="dash-card p-4 md:p-6">
              <ScreeningResults
                riskLevel={currentResults.riskLevel}
                aiSummary={currentResults.aiSummary}
                recommendedActions={currentResults.recommendedActions}
              />
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
