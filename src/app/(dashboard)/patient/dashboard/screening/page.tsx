"use client";

import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ChatbotInterface } from "@/components/screening/ChatbotInterface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Sparkles, Zap, Compass, Send, Brain, HeartHandshake } from "lucide-react";

export default function PatientAIAssistantPage() {
  const [view, setView] = useState<"list" | "chat">("list");
  const [query, setQuery] = useState("");
  const [initialMessage, setInitialMessage] = useState<string | null>(null);

  const chips = [
    {
      id: "stress",
      label: "Stress Help",
      icon: Zap,
      message: "I feel stressed and overwhelmed. Help me calm down.",
    },
    {
      id: "anxiety",
      label: "Anxiety Support",
      icon: Brain,
      message: "I have anxiety and overthinking. What can I do right now?",
    },
    {
      id: "sleep",
      label: "Sleep Routine",
      icon: Sparkles,
      message: "My sleep is bad. Give me a simple routine for tonight.",
    },
    {
      id: "talk",
      label: "Talk It Out",
      icon: HeartHandshake,
      message: "I just need someone to talk to right now.",
    },
  ];

  const handleStartChat = (message = "") => {
    const trimmedMessage = message.trim();
    setInitialMessage(trimmedMessage ? trimmedMessage : null);
    setView("chat");
    setQuery("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 min-h-[calc(100dvh-150px)]">
        {view === "list" && (
          <>
            <section className="dash-card p-6 md:p-8">
              <div className="max-w-3xl">
                <h1 className="text-3xl md:text-4xl font-bold dash-heading tracking-tight">
                  AI Assistant
                </h1>
                <p className="dash-muted mt-2 text-base md:text-lg">
                  Talk with HealTalk AI for emotional support, coping steps, and daily mental wellness guidance.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {chips.map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => handleStartChat(chip.message)}
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
                  placeholder="Tell HealTalk AI what you need help with..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleStartChat(query);
                    }
                  }}
                  className="dash-input h-12 pr-14 text-base"
                />
                <Button
                  size="icon"
                  onClick={() => handleStartChat(query)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg dash-btn-primary"
                >
                  <Send size={16} />
                </Button>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-xs dash-muted">
                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--dash-border)] px-3 py-1 bg-[var(--dash-surface-elev)]">
                    <Compass size={12} /> Guided support
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--dash-border)] px-3 py-1 bg-[var(--dash-surface-elev)]">
                    <Brain size={12} /> Practical coping tips
                  </span>
                </div>
                <span className="text-xs dash-muted tabular-nums">{query.length}/3000</span>
              </div>
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
              <h2 className="text-xl font-bold dash-heading">AI Chat</h2>
              <div className="w-20" />
            </div>

            <div className="dash-card p-2 md:p-4 h-[70dvh] min-h-[420px] md:h-[calc(100dvh-230px)] md:min-h-[540px]">
              <ChatbotInterface initialUserMessage={initialMessage} />
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
