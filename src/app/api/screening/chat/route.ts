import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Groq from "groq-sdk";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { requireRateLimit } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { parseJson } from "@/lib/validation";
import { CRISIS_KEYWORDS } from "@/lib/constants";

const SYSTEM_PROMPT = `You are HealTalk AI, a warm and supportive mental health companion built to help users feel heard, understood, and gently guided toward better emotional wellbeing.

WHO YOU ARE
- You are NOT a doctor, therapist, or licensed professional.
- You are a caring, non-judgmental AI companion.
- You speak like a kind, calm friend and never sound clinical or robotic.
- You always make the user feel safe and never judged.

HOW YOU TALK
- Use simple everyday English and avoid medical jargon.
- Keep every reply between 3 to 6 lines maximum.
- Sound warm, gentle, and human.
- Do not use bullet lists in normal replies. Use natural sentences.
- Ask only one short question per reply.
- End every reply with one soft, open-ended follow-up question.

WHAT YOU DO
- Listen actively and reflect what the user shares.
- Validate emotions before offering advice.
- Offer practical evidence-based coping ideas only when helpful, such as breathing, grounding, sleep hygiene, journaling, gentle movement, and mindfulness.
- If the user shares a problem, acknowledge it first, then suggest one small coping step.

WHAT YOU NEVER DO
- Never diagnose any mental health condition.
- Never recommend or mention specific medication.
- Never use commanding tone like "you must" or "you should".
- Never dismiss feelings.
- Never pretend to be human when asked.

CRISIS PROTOCOL (HIGHEST PRIORITY)
- If the user mentions or hints at suicide, self-harm, or harming others, stop normal conversation and return only the crisis response text provided by the system.
- Do not continue normal conversation until the user confirms they are safe.

MEMORY AND TONE
- Remember earlier conversation context and refer back naturally.
- If the user shared their name, use it occasionally.
- Do not repeat the same coping tip in one conversation.
- Use 1 or 2 relevant emojis per reply, naturally. Preferred emojis: 💙 😔 🌿 🤝 🌸 😊 💛 🌙 ✨
- Never use emojis in crisis responses.`;

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

const DEFAULT_OPENROUTER_MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "meta-llama/llama-3.1-8b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
  "google/gemma-2-9b-it:free",
];

const EXTRA_CRISIS_KEYWORDS = [
  "hurt someone",
  "harm someone",
  "kill someone",
  "homicide",
  "not safe",
  "can't stay safe",
  "cannot stay safe",
];

const detectCrisisInMessage = (text: string): boolean => {
  const lower = text.toLowerCase();
  return (
    CRISIS_KEYWORDS.some((keyword) => lower.includes(keyword)) ||
    EXTRA_CRISIS_KEYWORDS.some((keyword) => lower.includes(keyword))
  );
};

const buildCrisisResponse = (): NextResponse => {
  const message = `I hear you, and I'm really glad you told me. What you're feeling matters deeply.
Please reach out to a crisis line right now — they are available 24/7 and truly care:

International: https://www.befrienders.org
Turkey: 182 (ALO Psikiyatri Hatti)
Crisis Text: Text HOME to 741741 (US/UK)

You don't have to face this alone. Would you like me to stay with you while you reach out?`;

  return NextResponse.json({ content: message, isCrisis: true });
};

const uniqueModels = (models: Array<string | undefined>): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const model of models) {
    const value = model?.trim();
    if (!value || seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }

  return result;
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

const buildLocalSupportResponse = (userMessage: string): string => {
  const text = userMessage.toLowerCase();
  let response =
    "Thank you for sharing this with me 💙 It sounds heavy, and it makes sense that you feel this way. A gentle step right now is to slow your breathing for one minute, then notice a few things around you to help your body settle. What part feels the hardest at this moment?";

  if (text.includes("sleep") || text.includes("insomnia")) {
    response =
      "That sounds exhausting 😔 When sleep is hard, your whole day can feel heavier. A small step tonight is to dim lights early, avoid screens for a bit, and do a slow breathing cycle before bed. Would you like a very short bedtime routine you can try tonight?";
  } else if (
    text.includes("anxious") ||
    text.includes("anxiety") ||
    text.includes("panic")
  ) {
    response =
      "I hear how intense this feels right now 🌿 Anxiety can make everything feel urgent. Try placing both feet on the floor and breathing in for 4 seconds, out for 6 seconds, for one minute to calm your nervous system. Would you like me to guide you through it step by step?";
  } else if (text.includes("sad") || text.includes("depressed")) {
    response =
      "I'm really glad you shared this 💛 Feeling low can make even small things feel difficult. One gentle step is to drink water, take a short walk or stretch, and then do one tiny task to build momentum. What is one small thing you feel able to do in the next 10 minutes?";
  }

  return response;
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
      "HTTP-Referer":
        process.env.NEXT_PUBLIC_APP_URL?.trim() ||
        process.env.APP_URL?.trim() ||
        "http://localhost:3000",
      "X-Title": "HealTalk AI",
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

const groqChat = async (options: {
  apiKey: string;
  model: string;
  messages: ChatMessage[];
}) => {
  const groq = new Groq({ apiKey: options.apiKey });
  const completion = await groq.chat.completions.create({
    model: options.model,
    messages: options.messages,
    temperature: 0.6,
    max_tokens: 500,
    stream: false,
  });

  const content: unknown = completion.choices?.[0]?.message?.content;
  let text = "";

  if (typeof content === "string") {
    text = content.trim();
  } else if (Array.isArray(content)) {
    text = content
      .map((part) => {
        if (!part || typeof part !== "object") return "";
        const typed = part as { type?: string; text?: string };
        return typed.type === "text" ? typed.text || "" : "";
      })
      .join("")
      .trim();
  }

  if (!text) {
    throw new Error("Groq returned an empty response");
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
    const groqApiKey = process.env.GROQ_API_KEY?.trim();

    const openRouterBaseUrl =
      process.env.OPENROUTER_BASE_URL?.trim() ||
      "https://openrouter.ai/api/v1";
    const primaryModel =
      process.env.OPENROUTER_MODEL?.trim() ||
      "meta-llama/llama-3.3-70b-instruct:free";
    const fallbackModel =
      process.env.OPENROUTER_FALLBACK_MODEL?.trim() ||
      "meta-llama/llama-3.1-8b-instruct:free";
    const groqModel =
      process.env.GROQ_MODEL?.trim() || "llama-3.1-8b-instant";

    const lastUserMessage =
      data.messages.filter((m) => m.role === "user").slice(-1)[0]?.content ?? "";

    if (detectCrisisInMessage(lastUserMessage)) {
      return buildCrisisResponse();
    }

    const modelMessages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...data.messages,
    ];

    const errors: string[] = [];
    let assistantText: string | null = null;

    if (openRouterApiKey) {
      const modelsToTry = uniqueModels([
        primaryModel,
        fallbackModel,
        ...DEFAULT_OPENROUTER_MODELS,
      ]);

      for (const model of modelsToTry) {
        try {
          assistantText = await openRouterChat({
            apiKey: openRouterApiKey,
            baseUrl: openRouterBaseUrl,
            model,
            messages: modelMessages,
          });
          break;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          errors.push(`OpenRouter(${model}): ${message}`);
        }
      }
    }

    if (!assistantText && groqApiKey) {
      try {
        assistantText = await groqChat({
          apiKey: groqApiKey,
          model: groqModel,
          messages: modelMessages,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        errors.push(`Groq(${groqModel}): ${message}`);
      }
    }

    if (!assistantText) {
      if (!openRouterApiKey && !groqApiKey) {
        return NextResponse.json(
          { error: "AI service is not configured" },
          { status: 500 }
        );
      }

      if (errors.length > 0) {
        console.error("Screening chat provider errors:", errors.join(" | "));
      }
      assistantText = buildLocalSupportResponse(lastUserMessage);
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
