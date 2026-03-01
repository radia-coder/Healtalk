"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ScreeningResultsProps {
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRISIS";
  aiSummary: string;
  recommendedActions: string[];
}

const riskConfig = {
  LOW: {
    icon: CheckCircle2,
    title: "Low Risk",
    description: "You are experiencing mild symptoms.",
    iconClass: "text-[var(--dash-success)]",
    surfaceClass: "bg-[var(--dash-success-soft)]",
  },
  MEDIUM: {
    icon: Info,
    title: "Moderate Risk",
    description: "Moderate symptoms detected.",
    iconClass: "text-[var(--dash-warning)]",
    surfaceClass: "bg-[var(--dash-warning-soft)]",
  },
  HIGH: {
    icon: AlertCircle,
    title: "High Risk",
    description: "Severe symptoms detected.",
    iconClass: "text-[var(--dash-danger)]",
    surfaceClass: "bg-[var(--dash-danger-soft)]",
  },
  CRISIS: {
    icon: AlertTriangle,
    title: "Crisis Level",
    description: "Immediate support is recommended.",
    iconClass: "text-[var(--dash-danger)]",
    surfaceClass: "bg-[var(--dash-danger-soft)]",
  },
};

export function ScreeningResults({
  riskLevel,
  aiSummary,
  recommendedActions,
}: ScreeningResultsProps) {
  const router = useRouter();
  const config = riskConfig[riskLevel];
  const Icon = config.icon;

  return (
    <div className="space-y-5">
      <div className={cn("dash-card p-5", config.surfaceClass)}>
        <div className="flex items-start gap-3">
          <Icon size={20} className={config.iconClass} />
          <div>
            <h3 className="font-semibold dash-heading">{config.title}</h3>
            <p className="text-sm dash-muted mt-1">{config.description}</p>
          </div>
        </div>
      </div>

      <div className="dash-card p-6">
        <h4 className="font-semibold dash-heading mb-3">AI Summary</h4>
        <div className="text-sm dash-muted whitespace-pre-wrap leading-relaxed">
          {aiSummary}
        </div>
      </div>

      <div className="dash-card p-6">
        <h4 className="font-semibold dash-heading mb-3">Recommended Next Steps</h4>
        <ul className="space-y-2">
          {recommendedActions.map((action, i) => (
            <li
              key={i}
              className="dash-card-elev p-3 text-sm text-[var(--dash-text)] flex items-start gap-3"
            >
              <span className="w-5 h-5 rounded-full bg-[var(--dash-surface)] border border-[var(--dash-border)] text-xs font-medium flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <span>{action}</span>
            </li>
          ))}
        </ul>
      </div>

      {riskLevel === "CRISIS" && (
        <div className="dash-card p-4 bg-[var(--dash-danger-soft)] border-[var(--dash-danger)]">
          <p className="text-sm text-[var(--dash-danger)] font-semibold">
            Immediate assistance is recommended. If you are in danger, call 911 or 988 now.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => router.push("/find-psychologists")}
          className="dash-btn-primary rounded-xl"
        >
          Find a Therapist
        </Button>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="dash-btn-outline rounded-xl"
        >
          Retake Assessment
        </Button>
      </div>
    </div>
  );
}
