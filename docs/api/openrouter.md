# OpenRouter Setup

OpenRouter is the main AI provider for HealTalk AI Assistant.

## Why we use it

- It powers the patient AI chat.
- We can choose free models.
- If one model fails, we can try another model.

## Env vars

```bash
OPENROUTER_API_KEY=your_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free
OPENROUTER_FALLBACK_MODEL=meta-llama/llama-3.1-8b-instruct:free
NEXT_PUBLIC_APP_URL=https://finalproject.app
```

## Step by step: get OpenRouter key

1. Go to https://openrouter.ai
2. Create account and sign in.
3. Open Keys page.
4. Create a new API key.
5. Copy key and put it in `.env` as `OPENROUTER_API_KEY`.
6. Add the same key in DigitalOcean app env vars.

## How it helps this project

- User sends message from patient dashboard AI chat.
- API route `/api/screening/chat` sends request to OpenRouter.
- AI returns short supportive response using your system prompt.

## Common errors

- `Failed to process AI chat request`: invalid key or model failed.
- `AI service is not configured`: key is missing.

## Quick test

1. Run `npm run dev`
2. Open `/patient/dashboard/screening`
3. Send: `I feel anxious today`
4. You should get AI response in chat.
