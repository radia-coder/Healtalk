"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, AlertTriangle, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { CRISIS_KEYWORDS, EMERGENCY_NUMBERS } from "@/lib/constants";
import { fetchCsrfToken } from "@/lib/client-security";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatbotInterfaceProps {
  initialUserMessage?: string | null;
}

function messageContainsCrisisKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((keyword) => lower.includes(keyword));
}

export function ChatbotInterface({ initialUserMessage }: ChatbotInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi, I’m HealTalk AI. I’m here to support you with stress, mood, anxiety, sleep, and daily coping steps. What’s been hardest for you lately?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCrisisResources, setShowCrisisResources] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
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

  const streamAIResponse = async (
    newMessages: Message[],
    response: Response
  ): Promise<void> => {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let assistantMessage = "";

    if (!reader) return;

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
  };

  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || isLoadingRef.current) return;

    const userMessage: Message = { role: "user", content: messageText.trim() };
    const newMessages = [...messagesRef.current, userMessage];
    setMessages(newMessages);
    messagesRef.current = newMessages;
    setInput("");
    setIsLoading(true);
    isLoadingRef.current = true;

    try {
      if (messageContainsCrisisKeyword(messageText)) {
        setShowCrisisResources(true);
      }

      const csrfToken = await fetchCsrfToken();
      if (!csrfToken) {
        throw new Error("Security token missing");
      }

      const res = await fetch("/api/screening/chat", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to get response");
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

      await streamAIResponse(newMessages, res);
    } catch (err: unknown) {
      console.error("Error sending message:", err);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "I had a connection issue. Please try again.",
        },
      ]);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, []);

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

      <form onSubmit={handleSubmit} className="pt-3 border-t border-[var(--dash-border)]">
        <div className="flex items-end gap-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-elev)] px-4 py-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Message HealTalk AI..."
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
    </div>
  );
}
