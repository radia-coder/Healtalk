# AI Assistant Overview (Current Setup)

This file explains what we changed in HealTalk AI, how it works now, and how to run it.

Everything below is written for the current app state (OpenRouter + fallback logic).

## What We Built

We changed the patient `Screening` area into an **AI Assistant chat**.

Main goals:
- Warm, human-style support chat
- Clear safety rules (no diagnosis, no medication advice)
- Crisis response for dangerous messages
- Better reliability (fallbacks if one AI provider fails)

## Where It Works In The App

- Patient page: `/patient/dashboard/screening` (now AI Assistant experience)
- Chat API route: `src/app/api/screening/chat/route.ts`
- Chat UI: `src/components/screening/ChatbotInterface.tsx`

## Step-by-Step: How A Message Is Processed

1. User writes a message in the AI chat UI.
2. Frontend gets CSRF token and sends POST request to `/api/screening/chat`.
3. Backend checks:
   - user is logged in
   - rate limit
   - CSRF token
   - request body format
4. Backend checks crisis keywords first.
5. If crisis is detected, backend returns the crisis message immediately.
6. If not crisis, backend tries OpenRouter models in order.
7. If OpenRouter fails, backend tries Groq (if key exists).
8. If both fail, backend returns a safe local fallback support message.
9. UI shows assistant response in chat.

## AI Provider Order (Failover)

Primary:
- `OPENROUTER_MODEL` (or default: `meta-llama/llama-3.3-70b-instruct:free`)

Then fallback:
- `OPENROUTER_FALLBACK_MODEL` (or default: `meta-llama/llama-3.1-8b-instruct:free`)
- Extra defaults:
  - `mistralai/mistral-7b-instruct:free`
  - `google/gemma-2-9b-it:free`

Then provider fallback:
- Groq model (`GROQ_MODEL` or `llama-3.1-8b-instant`) if `GROQ_API_KEY` is present.

Final safety fallback:
- Local supportive response (so chat does not fully break).

## Environment Variables You Need

Add these to `.env` (local) and DigitalOcean App env vars (production):

```bash
# Required for OpenRouter
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free
OPENROUTER_FALLBACK_MODEL=meta-llama/llama-3.1-8b-instruct:free

# App URL (used in headers for OpenRouter)
NEXT_PUBLIC_APP_URL=https://finalproject.app

# Optional provider fallback (recommended)
GROQ_API_KEY=your_groq_key
GROQ_MODEL=llama-3.1-8b-instant
```

If `OPENROUTER_API_KEY` is missing and `GROQ_API_KEY` is also missing, API returns:
- `AI service is not configured`

## System Prompt (Behavior Rules)

The AI is configured to:
- talk in simple English
- stay warm and non-judgmental
- keep replies short
- ask one question at a time
- avoid diagnosis/medication advice
- use crisis-only response when safety risk appears

This prompt is inside:
- `src/app/api/screening/chat/route.ts`

## Crisis Protocol

When user message includes suicide/self-harm/harm-others signals:
- normal chat stops
- assistant sends a dedicated crisis help response
- assistant should not continue normal guidance until user safety is confirmed

## Quick Local Test

1. Set env vars in `.env`
2. Run:

```bash
npm run dev
```

3. Open:
- `http://localhost:3000/patient/dashboard/screening`

4. Test normal message:
- `I feel anxious and cannot sleep`

5. Test crisis detection carefully (for validation only):
- `I want to hurt myself`

## Deploy Test (DigitalOcean)

1. Confirm app source is correct repo + `main` branch.
2. Confirm env vars are added in DigitalOcean App settings.
3. Trigger redeploy.
4. Test AI Assistant in production.
5. If error appears, check runtime logs for `/api/screening/chat`.

## Troubleshooting

If chat says `Failed to process AI chat request`:
- check if `OPENROUTER_API_KEY` is valid
- check model name is correct
- check app URL env var exists
- check deploy logs for provider errors

If chat responds but quality is poor:
- change `OPENROUTER_MODEL` to another available model
- keep fallback model enabled

If users are logged out in chat:
- verify session/cookie setup and auth in production domain

## Files In This Folder

- `README.md` — current AI architecture and setup (this file)
- `free-setup.md` — older guide for free providers
- `alternatives.md` — provider comparison/options
- `system-prompt.md` — where prompt rules live and how we update safely
