import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Groq from "groq-sdk";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { requireRateLimit } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { parseJson } from "@/lib/validation";
import { CRISIS_KEYWORDS, EMERGENCY_NUMBERS } from "@/lib/constants";

// ─── System prompt ────────────────────────────────────────────────────────────
// This is sent as the hidden "system" message to the AI on every request.
// It defines the chatbot's persona, the screening flow, and risk levels.
const SYSTEM_PROMPT = `You are a compassionate mental health screening assistant for HealTalk, a teletherapy platform.

Your role:
1. Ask 8-10 screening questions to assess the user's mental health
2. Ask one question at a time
3. Be warm, non-judgmental, and empathetic
4. Cover these areas: mood, anxiety, sleep, relationships, stress, trauma history, substance use, suicidal thoughts
5. After all questions, provide a brief summary and risk level assessment

Risk Levels:
- LOW: Mild symptoms, can benefit from therapy
- MEDIUM: Moderate symptoms, therapy recommended
- HIGH: Severe symptoms, therapy strongly recommended
- CRISIS: Immediate risk, provide crisis resources

Important:
- If user mentions self-harm or suicide, immediately provide crisis resources
- Keep responses concise (2-3 sentences)
- Be conversational, not clinical
- Validate feelings without minimizing concerns
- After 8-10 questions, summarize and provide risk assessment

Crisis Resources:
- National Suicide Prevention Lifeline: ${EMERGENCY_NUMBERS.crisis}
- Crisis Text Line: Text HOME to ${EMERGENCY_NUMBERS.text}
- Emergency: ${EMERGENCY_NUMBERS.emergency}

Keep track of which questions you've asked. Start with: "Hi! I'm here to help match you with the right therapist. I'll ask a few questions about how you've been feeling. This will only take 5 minutes. Shall we begin?"`;

// ─── Schema ───────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns true if the message text contains any crisis keyword.
 * We check the most-recent user message so we can short-circuit with a safe response.
 */
function detectCrisisInMessage(text: string): boolean {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((keyword) => lower.includes(keyword));
}

/**
 * Builds the pre-canned crisis response that bypasses the AI entirely.
 * This guarantees a fast, safe reply when a user is in distress.
 */
function buildCrisisResponse(): NextResponse {
  const message = `I'm very concerned about what you've shared. Your safety is the top priority. Please reach out to these resources immediately:

📞 National Suicide Prevention Lifeline: ${EMERGENCY_NUMBERS.crisis} (available 24/7)
💬 Crisis Text Line: Text HOME to ${EMERGENCY_NUMBERS.text}
🚨 Emergency: ${EMERGENCY_NUMBERS.emergency}

If you're in immediate danger, please call ${EMERGENCY_NUMBERS.emergency} or go to your nearest emergency room. You don't have to face this alone.`;

  return NextResponse.json({ content: message, isCrisis: true });
}

// ─── Route ────────────────────────────────────────────────────────────────────

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

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return NextResponse.json(
        { error: "AI service is not configured" },
        { status: 500 }
      );
    }

    // Check the last user message for crisis keywords before hitting the AI.
    // If detected, return a pre-written safe response immediately.
    const lastUserMessage =
      data.messages.filter((m) => m.role === "user").slice(-1)[0]?.content ?? "";

    if (detectCrisisInMessage(lastUserMessage)) {
      return buildCrisisResponse();
    }

    // Stream the AI response back to the client so the UI can render it token-by-token.
    const groq = new Groq({ apiKey: groqApiKey });
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...data.messages,
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 500,
      stream: true,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (streamError) {
          console.error("Screening stream error:", streamError);
          controller.error(streamError);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Screening chat error:", message);
    return NextResponse.json(
      { error: "Failed to process screening chat request" },
      { status: 500 }
    );
  }
}
