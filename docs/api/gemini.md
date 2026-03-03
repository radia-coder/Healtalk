# Gemini Setup (Legacy / Optional)

Gemini key exists in old docs and test routes.

## Current status in this project

- Main AI chat now uses OpenRouter.
- Gemini is not the current main provider for patient AI chat.
- You may still keep Gemini for tests or future use.

## Env var

```bash
GEMINI_API_KEY=your_key
```

## Step by step: get Gemini key

1. Go to https://makersuite.google.com/app/apikey
2. Create API key.
3. Copy key.
4. Add to `.env` and production only if you use Gemini.

## Should you add it now?

- If you only use OpenRouter + Groq fallback, Gemini is not required.
