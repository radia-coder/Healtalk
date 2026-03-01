"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, AlertTriangle, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ASSESSMENT_QUESTION_THRESHOLD,
  CRISIS_KEYWORDS,
  EMERGENCY_NUMBERS,
} from "@/lib/constants";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatbotInterfaceProps {
  onComplete?: (data: {
    responses: Message[];
    aiSummary: string;
    riskLevel: string;
    recommendedActions: string[];
  }) => void;
  initialUserMessage?: string | null;
}

function detectRiskLevel(summary: string): "LOW" | "MEDIUM" | "HIGH" | "CRISIS" {
  const lower = summary.toLowerCase();
  if (
    lower.includes("crisis") ||
    lower.includes("immediate") ||
    lower.includes("emergency")
  ) {
    return "CRISIS";
  }
  if (
    lower.includes("severe") ||
    lower.includes("high risk") ||
    lower.includes("strongly recommend")
  ) {
    return "HIGH";
  }
  if (
    lower.includes("mild") ||
    lower.includes("low risk") ||
    lower.includes("benefit from")
  ) {
    return "LOW";
  }
  return "MEDIUM";
}

function getCrisisResources(riskLevel: string): string[] {
  switch (riskLevel) {
    case "CRISIS":
      return [
        `Contact National Suicide Prevention Lifeline: ${EMERGENCY_NUMBERS.crisis}`,
        "Visit nearest emergency room",
        `Call ${EMERGENCY_NUMBERS.emergency} if in immediate danger`,
      ];
    case "HIGH":
      return [
        "Schedule appointment with therapist within 1 week",
        "Consider medication evaluation",
        "Join support group",
      ];
    case "LOW":
      return [
        "Consider therapy for personal growth",
        "Practice stress management",
        "Maintain healthy habits",
      ];
    default:
      return [
        "Schedule appointment with therapist",
        "Practice self-care techniques",
        "Monitor symptoms",
      ];
  }
}

function messageContainsCrisisKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((keyword) => lower.includes(keyword));
}

export function ChatbotInterface({ onComplete, initialUserMessage }: ChatbotInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm here to help match you with the right therapist. I'll ask a few questions about how you've been feeling. This will only take 5 minutes. Shall we begin?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCrisisResources, setShowCrisisResources] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initialMessageSentRef = useRef(false);

  const messagesRef = useRef<Message[]>(messages);
  const isLoadingRef = useRef(isLoading);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  const completeAssessment = useCallback(
    async (allMessages: Message[], finalSummary: string) => {
      const riskLevel = detectRiskLevel(finalSummary);
      const recommendedActions = getCrisisResources(riskLevel);

      const assessmentData = {
        responses: allMessages,
        aiSummary: finalSummary,
        riskLevel,
        recommendedActions,
      };

      try {
        await fetch("/api/screening/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(assessmentData),
        });
      } catch (err) {
        console.error("Failed to save assessment:", err);
      }

      setIsComplete(true);
      onComplete?.(assessmentData);
    },
    [onComplete]
  );

  const streamAIResponse = async (
    newMessages: Message[],
    response: Response
  ): Promise<string> => {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let assistantMessage = "";

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantMessage += chunk;

        setMessages([
          ...newMessages,
          { role: "assistant", content: assistantMessage },
        ]);
      }
    }

    return assistantMessage;
  };

  const sendMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim() || isLoadingRef.current) return;

      const userMessage: Message = { role: "user", content: messageText.trim() };
      const newMessages = [...messagesRef.current, userMessage];
      setMessages(newMessages);
      messagesRef.current = newMessages;
      setInput("");
      setIsLoading(true);
      isLoadingRef.current = true;

      const nextQuestionCount = newMessages.filter((m) => m.role === "user").length;
      setQuestionCount(nextQuestionCount);

      try {
        if (messageContainsCrisisKeyword(messageText)) {
          setShowCrisisResources(true);
        }

        const res = await fetch("/api/screening/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newMessages }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to get response");
        }

        const contentType = res.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          const data = await res.json();
          if (data.isCrisis) {
            setMessages([...newMessages, { role: "assistant", content: data.content }]);
            setShowCrisisResources(true);
            return;
          }
        }

        const assistantMessage = await streamAIResponse(newMessages, res);

        if (nextQuestionCount >= ASSESSMENT_QUESTION_THRESHOLD) {
          await completeAssessment(newMessages, assistantMessage);
        }
      } catch (err: unknown) {
        console.error("Error sending message:", err);
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: "I'm sorry, I encountered an error. Please try again.",
          },
        ]);
      } finally {
        isLoadingRef.current = false;
        setIsLoading(false);
      }
    },
    [completeAssessment]
  );

  useEffect(() => {
    if (initialUserMessage && !initialMessageSentRef.current) {
      initialMessageSentRef.current = true;
      void sendMessage(initialUserMessage);
    }
  }, [initialUserMessage, sendMessage]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void sendMessage(input);
  }

  const completedQuestions = Math.min(questionCount, ASSESSMENT_QUESTION_THRESHOLD);
  const progress = completedQuestions * (100 / ASSESSMENT_QUESTION_THRESHOLD);

  return (
    <div className="flex flex-col h-full bg-[var(--dash-surface)] rounded-[12px]">
      {showCrisisResources && (
        <div className="bg-[var(--dash-danger-soft)] border border-[var(--dash-danger)] rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-[var(--dash-danger)] flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-[var(--dash-danger)] mb-2">Crisis Resources Available 24/7</h3>
              <div className="space-y-1 text-sm text-[var(--dash-text)]">
                <p className="flex items-center gap-2">
                  <Phone size={14} />
                  <strong>National Suicide Prevention Lifeline:</strong> {EMERGENCY_NUMBERS.crisis}
                </p>
                <p>
                  <strong>Crisis Text Line:</strong> Text HOME to {EMERGENCY_NUMBERS.text}
                </p>
                <p>
                  <strong>Emergency:</strong> {EMERGENCY_NUMBERS.emergency}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isComplete && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm dash-muted mb-2">
            <span>Question {completedQuestions} of {ASSESSMENT_QUESTION_THRESHOLD}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-2 bg-[var(--dash-surface-elev)] rounded-full overflow-hidden border border-[var(--dash-border)]">
            <div
              className="h-full bg-[var(--dash-primary)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-1">
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[84%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap",
                message.role === "user"
                  ? "bg-[var(--dash-primary)] text-white"
                  : "bg-[var(--dash-surface-elev)] text-[var(--dash-text)] border border-[var(--dash-border)]"
              )}
            >
              {message.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[var(--dash-surface-elev)] border border-[var(--dash-border)] rounded-2xl px-4 py-3">
              <Loader2 className="animate-spin text-[var(--dash-text-muted)]" size={20} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {!isComplete && (
        <form onSubmit={handleSubmit} className="pt-3 border-t border-[var(--dash-border)]">
          <div className="flex items-end gap-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-elev)] px-4 py-3">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Message HealTalk..."
              className="min-h-[44px] max-h-40 flex-1 resize-none border-0 bg-transparent p-0 text-sm text-[var(--dash-text)] placeholder:text-[var(--dash-text-muted)] focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
              rows={1}
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="h-9 w-9 rounded-lg dash-btn-primary"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            </Button>
          </div>
        </form>
      )}

      {isComplete && (
        <div className="text-center py-6 bg-[var(--dash-success-soft)] rounded-xl border border-[var(--dash-border)]">
          <p className="text-[var(--dash-success)] font-semibold mb-2">Assessment Complete!</p>
          <p className="text-sm dash-muted">
            Thank you for sharing. Your results have been saved.
          </p>
        </div>
      )}
    </div>
  );
}
