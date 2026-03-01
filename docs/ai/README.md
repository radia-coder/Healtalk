# AI Integration — HealTalk

HealTalk includes an AI-powered mental health chatbot that gives users supportive, non-medical responses. This folder covers AI setup, providers, and alternatives.

## Primary AI Provider: Google Gemini

- Model: `gemini-1.5-flash` (free tier available)
- Used for: chatbot responses, mental health support conversation
- API key: `GEMINI_API_KEY` in `.env`

```bash
# Test Gemini endpoint
curl http://localhost:3000/api/test-gemini
```

## Fallback / Alternative Providers

See `alternatives.md` for full details. Options include:

| Provider   | Model              | Free Tier | Notes                      |
|------------|--------------------|-----------|----------------------------|
| Gemini     | gemini-1.5-flash   | Yes       | Primary choice             |
| Groq       | llama-3.1-8b       | Yes       | Very fast inference        |
| OpenRouter | Various            | Yes       | Routes to multiple models  |
| Hugging Face | mistral-7b       | Yes       | Self-hostable              |
| Cohere     | command-r          | Yes       | Good for conversation      |

## Chatbot API Route

Located at: `src/app/api/chatbot/route.ts`

The chatbot:
- Accepts user messages via POST
- Adds a system prompt defining its role as a mental health support assistant
- Clearly states it is not a licensed therapist and cannot give medical advice
- Returns a helpful, empathetic response

## System Prompt

The chatbot is instructed to:
- Be empathetic and supportive
- Listen actively and validate feelings
- Suggest professional help when topics are serious
- Never diagnose or prescribe
- Keep responses clear and concise

## Files in This Folder

- `README.md` — This file (AI overview)
- `free-setup.md` — Step-by-step guide to set up free AI APIs
- `alternatives.md` — Comparison of all alternative AI providers
