# Alternative AI API Integration Code

Quick reference for switching between different AI providers.

---

## Current Setup: Google Gemini ✅

Already configured and ready to use!

**Just add to `.env`:**
```bash
GEMINI_API_KEY=AIzaSy...
```

---

## Switch to Groq (Very Fast & Free)

### 1. Install Package
```bash
npm install groq-sdk
```

### 2. Get API Key
https://console.groq.com/keys

### 3. Update `.env`
```bash
GROQ_API_KEY=gsk_...
```

### 4. Replace Code in `/src/app/api/screening/chat/route.ts`

```typescript
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

// In POST function, replace the Gemini code with:
const completion = await groq.chat.completions.create({
  messages: [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages,
  ],
  model: "llama-3.1-8b-instant",
  temperature: 0.7,
  max_tokens: 500,
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
      controller.error(error);
    }
  },
});

return new Response(stream, {
  headers: {
    "Content-Type": "text/plain; charset=utf-8",
  },
});
```

---

## Switch to Hugging Face (Unlimited Free)

### 1. Install Package
```bash
npm install @huggingface/inference
```

### 2. Get API Key
https://huggingface.co/settings/tokens

### 3. Update `.env`
```bash
HUGGINGFACE_API_KEY=hf_...
```

### 4. Replace Code in `/src/app/api/screening/chat/route.ts`

```typescript
import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || "");

// In POST function, replace with:
const stream = hf.chatCompletionStream({
  model: "mistralai/Mistral-7B-Instruct-v0.2",
  messages: [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages,
  ],
  max_tokens: 500,
  temperature: 0.7,
});

// Stream response
const encoder = new TextEncoder();
const readableStream = new ReadableStream({
  async start(controller) {
    try {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || "";
        if (text) {
          controller.enqueue(encoder.encode(text));
        }
      }
      controller.close();
    } catch (error) {
      controller.error(error);
    }
  },
});

return new Response(readableStream, {
  headers: {
    "Content-Type": "text/plain; charset=utf-8",
  },
});
```

---

## Switch to OpenAI (Paid, High Quality)

### 1. Install Package (already installed)
```bash
npm install openai ai
```

### 2. Get API Key
https://platform.openai.com/api-keys

### 3. Update `.env`
```bash
OPENAI_API_KEY=sk-...
```

### 4. Replace Code in `/src/app/api/screening/chat/route.ts`

```typescript
import { OpenAI } from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// In POST function, replace with:
const response = await openai.chat.completions.create({
  model: "gpt-4o-mini", // or "gpt-4" for better quality
  messages: [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages,
  ],
  temperature: 0.7,
  max_tokens: 500,
  stream: true,
});

const stream = OpenAIStream(response);
return new StreamingTextResponse(stream);
```

---

## Switch to Anthropic Claude (High Quality)

### 1. Install Package
```bash
npm install @anthropic-ai/sdk
```

### 2. Get API Key
https://console.anthropic.com/

### 3. Update `.env`
```bash
ANTHROPIC_API_KEY=sk-ant-...
```

### 4. Replace Code in `/src/app/api/screening/chat/route.ts`

```typescript
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

// In POST function, replace with:
const stream = await anthropic.messages.stream({
  model: "claude-3-haiku-20240307",
  max_tokens: 500,
  system: SYSTEM_PROMPT,
  messages: messages.map(m => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: m.content,
  })),
});

// Stream response
const encoder = new TextEncoder();
const readableStream = new ReadableStream({
  async start(controller) {
    try {
      for await (const chunk of stream) {
        if (chunk.type === "content_block_delta") {
          const text = chunk.delta.text || "";
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
      }
      controller.close();
    } catch (error) {
      controller.error(error);
    }
  },
});

return new Response(readableStream, {
  headers: {
    "Content-Type": "text/plain; charset=utf-8",
  },
});
```

---

## Quick Comparison

| Provider | Speed | Quality | Free Limit | Best For |
|----------|-------|---------|------------|----------|
| **Gemini** ✅ | Fast | Excellent | 60/min | Current setup (recommended) |
| **Groq** | Very Fast | Good | 30/min | Speed-critical apps |
| **Hugging Face** | Moderate | Good | Unlimited | High volume, low budget |
| **OpenAI** | Fast | Excellent | $5 credit | Production (paid) |
| **Claude** | Fast | Excellent | Limited | Complex reasoning |

---

## Model Recommendations

### For Mental Health Screening:

1. **Best Free:** Gemini 1.5 Flash (current)
2. **Fastest Free:** Groq Llama 3.1
3. **Unlimited Free:** Hugging Face Mistral
4. **Best Paid:** OpenAI GPT-4o or Claude Sonnet

### By Use Case:

- **Testing/Development:** Gemini (current setup)
- **Production (free):** Gemini
- **Production (paid):** OpenAI GPT-4o
- **High volume:** Hugging Face
- **Low latency:** Groq

---

## Full Integration Example (All Providers)

Create `/src/lib/ai-providers.ts`:

```typescript
// AI Provider Factory Pattern
type AIProvider = "gemini" | "groq" | "openai" | "huggingface";

export async function streamAIResponse(
  messages: any[],
  systemPrompt: string,
  provider: AIProvider = "gemini"
) {
  switch (provider) {
    case "gemini":
      return await streamGemini(messages, systemPrompt);
    case "groq":
      return await streamGroq(messages, systemPrompt);
    case "openai":
      return await streamOpenAI(messages, systemPrompt);
    case "huggingface":
      return await streamHuggingFace(messages, systemPrompt);
    default:
      throw new Error("Unsupported AI provider");
  }
}

async function streamGemini(messages: any[], systemPrompt: string) {
  // Your current Gemini implementation
}

// ... other providers
```

Then in your route:

```typescript
const provider = process.env.AI_PROVIDER as AIProvider || "gemini";
return await streamAIResponse(messages, SYSTEM_PROMPT, provider);
```

---

## Testing Different Providers

Add to `.env`:
```bash
# Choose one
AI_PROVIDER=gemini     # Current (recommended)
# AI_PROVIDER=groq     # Uncomment to use Groq
# AI_PROVIDER=openai   # Uncomment to use OpenAI
```

---

## Cost Calculator

For **1,000 mental health screenings** (10 messages each):

| Provider | Total Cost | Per Screening |
|----------|------------|---------------|
| Gemini | **$0.00** | $0.00 |
| Groq | **$0.00** | $0.00 |
| Hugging Face | **$0.00** | $0.00 |
| OpenAI GPT-4o-mini | $15 | $0.015 |
| OpenAI GPT-4 | $50 | $0.05 |
| Claude Haiku | $12 | $0.012 |
| Claude Sonnet | $30 | $0.03 |

---

## Recommendation

**Stick with Google Gemini!** It's:
- ✅ Free forever
- ✅ High quality
- ✅ Fast enough
- ✅ Already configured
- ✅ Reliable (Google infrastructure)

Only switch if you need:
- **Groq:** Extreme speed (10x faster)
- **OpenAI:** Absolute best quality (paid)
- **Hugging Face:** Unlimited free requests

---

**Current Status:** Your app is using **Gemini** (best free option). Just add the API key and you're ready!
