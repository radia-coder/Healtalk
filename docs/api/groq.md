# Groq Setup (AI Fallback)

Groq is used as fallback for AI chat when OpenRouter fails.

## Why we use it

- Gives extra reliability.
- If OpenRouter is down, chat can still work.

## Env vars

```bash
GROQ_API_KEY=your_key
GROQ_MODEL=llama-3.1-8b-instant
```

## Step by step: get Groq key

1. Go to https://console.groq.com/keys
2. Sign in or create account.
3. Create API key.
4. Copy key and add to `.env` and DigitalOcean.

## How it helps this project

- In `/api/screening/chat`, after OpenRouter attempts fail, API tries Groq.
- This reduces failed chats for users.

## Note

Groq is optional, but recommended for production stability.
