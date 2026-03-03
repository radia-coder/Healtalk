import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { requireRateLimit } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { parseJson } from "@/lib/validation";
import { CRISIS_KEYWORDS, EMERGENCY_NUMBERS } from "@/lib/constants";

const SYSTEM_PROMPT = `You are HealTalk AI, a supportive mental health assistant.

Rules:
1. Use simple and warm English.
2. Ask one short follow-up question at a time.
3. Give practical coping ideas (breathing, grounding, sleep routine, journaling, gentle planning).
4. Do NOT diagnose medical conditions and do NOT prescribe medication.
5. Keep responses short (3-6 lines).
6. Validate feelings without judgement.

Safety:
- If the user mentions self-harm, suicide, or immediate danger, stop normal chat.
- Tell the user to contact crisis resources immediately.
- Include:
  - National Suicide Prevention Lifeline: ${EMERGENCY_NUMBERS.crisis}
  - Crisis Text Line: Text HOME to ${EMERGENCY_NUMBERS.text}
  - Emergency: ${EMERGENCY_NUMBERS.emergency}

Opening style:
- Be conversational and calm.
- End each response with one gentle next-step question.`;

const chatPayloadSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      })
    )
    .min(1)
    .max(80),
});

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

const detectCrisisInMessage = (text: string): boolean => {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((keyword) => lower.includes(keyword));
};

const buildCrisisResponse = (): NextResponse => {
  const message = `I'm really glad you told me this. Your safety comes first.

Please contact support right now:
- National Suicide Prevention Lifeline: ${EMERGENCY_NUMBERS.crisis}
- Crisis Text Line: Text HOME to ${EMERGENCY_NUMBERS.text}
- Emergency: ${EMERGENCY_NUMBERS.emergency}

If you are in immediate danger, call ${EMERGENCY_NUMBERS.emergency} now or go to the nearest emergency room.`;

  return NextResponse.json({ content: message, isCrisis: true });
};

const getAssistantText = (payload: unknown): string | null => {
  if (!payload || typeof payload !== "object") return null;
  const parsed = payload as {
    choices?: Array<{
      message?: {
        content?: string | Array<{ type?: string; text?: string }>;
      };
    }>;
  };

  const content = parsed.choices?.[0]?.message?.content;
  if (typeof content === "string" && content.trim()) return content;

  if (Array.isArray(content)) {
    const joined = content
      .map((item) => (item?.type === "text" ? item.text || "" : ""))
      .join("")
      .trim();
    return joined || null;
  }

  return null;
};

const openRouterChat = async (options: {
  apiKey: string;
  baseUrl: string;
  model: string;
  messages: ChatMessage[];
}) => {
  const response = await fetch(`${options.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: options.model,
      messages: options.messages,
      temperature: 0.6,
      max_tokens: 500,
    }),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const errorMessage =
      (payload as { error?: { message?: string } | string } | null)?.error;
    const message =
      typeof errorMessage === "string"
        ? errorMessage
        : errorMessage?.message || "OpenRouter request failed";
    throw new Error(message);
  }

  const text = getAssistantText(payload);
  if (!text) {
    throw new Error("OpenRouter returned an empty response");
  }
  return text;
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await requireRateLimit({
      request,
      key: "screening:chat",
      limit: 10,
      window: "1 m",
    });
    if (rateLimit) return rateLimit;

    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const { data, error } = await parseJson(request, chatPayloadSchema);
    if (error) return error;

    const openRouterApiKey = process.env.OPENROUTER_API_KEY?.trim();
    if (!openRouterApiKey) {
      return NextResponse.json(
        { error: "AI service is not configured" },
        { status: 500 }
      );
    }

    const openRouterBaseUrl =
      process.env.OPENROUTER_BASE_URL?.trim() ||
      "https://openrouter.ai/api/v1";
    const primaryModel =
      process.env.OPENROUTER_MODEL?.trim() ||
      "meta-llama/llama-3.3-70b-instruct:free";
    const fallbackModel =
      process.env.OPENROUTER_FALLBACK_MODEL?.trim() ||
      "meta-llama/llama-3.1-8b-instruct:free";

    const lastUserMessage =
      data.messages.filter((m) => m.role === "user").slice(-1)[0]?.content ?? "";

    if (detectCrisisInMessage(lastUserMessage)) {
      return buildCrisisResponse();
    }

    const modelMessages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...data.messages,
    ];

    let assistantText: string;
    try {
      assistantText = await openRouterChat({
        apiKey: openRouterApiKey,
        baseUrl: openRouterBaseUrl,
        model: primaryModel,
        messages: modelMessages,
      });
    } catch (primaryError) {
      if (!fallbackModel || fallbackModel === primaryModel) {
        throw primaryError;
      }

      assistantText = await openRouterChat({
        apiKey: openRouterApiKey,
        baseUrl: openRouterBaseUrl,
        model: fallbackModel,
        messages: modelMessages,
      });
    }

    return new Response(assistantText, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Screening chat error:", message);
    return NextResponse.json(
      { error: "Failed to process AI chat request" },
      { status: 500 }
    );
  }
}
