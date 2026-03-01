import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { requireRateLimit } from "@/lib/rate-limit";
import { parseJson } from "@/lib/validation";
import { z } from "zod";

const SYSTEM_PROMPT = `You are a helpful AI assistant for HealTalk, a mental health platform that connects people with licensed therapists.

Your role:
- Answer questions about mental health, therapy, and when to seek help
- Be warm, empathetic, and non-judgmental
- Provide general information and guidance
- Encourage users to book appointments with therapists for professional help
- Keep responses concise (2-4 sentences)
- Never provide medical diagnoses or treatment advice

Important:
- If someone mentions self-harm or suicide, immediately provide crisis resources:
  * National Suicide Prevention Lifeline: 988
  * Crisis Text Line: Text HOME to 741741
  * Emergency: 911
- Always remind users that you're an AI assistant, not a therapist
- Encourage booking an appointment at /find-psychologists for professional help

Be conversational, supportive, and helpful!`;

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

export async function POST(request: Request) {
  try {
    const rateLimit = await requireRateLimit({
      request,
      key: "chatbot:public",
      limit: 20,
      window: "1 m",
    });
    if (rateLimit) return rateLimit;

    const { data, error } = await parseJson(request, chatPayloadSchema);
    if (error) return error;

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return NextResponse.json(
        { error: "AI service is not configured" },
        { status: 500 }
      );
    }
    const groq = new Groq({ apiKey: groqApiKey });

    // Check for crisis keywords
    const lastUserMessage =
      data.messages
        .filter((m) => m.role === "user")
        .slice(-1)[0]
        ?.content?.toLowerCase() || "";
    const crisisKeywords = ["suicide", "kill myself", "end my life", "hurt myself", "self-harm", "die"];
    const hasCrisisKeyword = crisisKeywords.some(keyword => lastUserMessage.includes(keyword));

    if (hasCrisisKeyword) {
      return NextResponse.json({
        content: `I'm very concerned about what you've shared. Your safety is the top priority. Please reach out to these resources immediately:

📞 National Suicide Prevention Lifeline: 988 (available 24/7)
💬 Crisis Text Line: Text HOME to 741741
🚨 Emergency: 911

If you're in immediate danger, please call 911 or go to your nearest emergency room. You don't have to face this alone.`,
        isCrisis: true,
      });
    }

    // Create chat with Groq
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...data.messages,
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 300,
      stream: true,
    });

    // Stream response
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
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
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
    console.error("Public chatbot error:", message);

    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
