# API Keys and Services Guide

This folder explains every API key and secret used by HealTalk.

Goal: easy English, step by step, and clear setup for local + production.

## First: What is Required for Production

You must set these before going live:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `AGORA_APP_ID`
- `AGORA_APP_CERTIFICATE`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `NEXT_PUBLIC_APP_URL`
- `OPENROUTER_API_KEY` (recommended) or `GROQ_API_KEY`

Strongly recommended:

- `OPENROUTER_MODEL`
- `OPENROUTER_FALLBACK_MODEL`
- `GROQ_API_KEY` (fallback)
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `CSRF_SECRET`
- `CRON_SECRET`
- UploadThing key (`UPLOADTHING_TOKEN` or `UPLOADTHING_SECRET`)

Optional (only if you use Supabase auth migration):

- `SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## What Each Service Does

- OpenRouter/Groq/Gemini: AI chat support.
- Google OAuth: sign in with Google.
- Resend: verification and reminder emails.
- UploadThing: upload files and profile images.
- Agora: video call tokens.
- Upstash Redis: production rate limiting.
- NextAuth + security secrets: login sessions and request protection.
- Supabase: optional auth migration support.

## Files in This Folder

- `openrouter.md` - Main AI provider setup
- `groq.md` - AI fallback provider setup
- `grok.md` - Alias file that points to Groq setup
- `gemini.md` - Legacy/optional AI key notes
- `google-oauth.md` - Google login setup
- `resend.md` - Email setup
- `uploadthing.md` - File upload setup
- `agora.md` - Video call token setup
- `upstash-redis.md` - Rate limit setup
- `nextauth.md` - Auth secrets setup
- `security-secrets.md` - CSRF and cron secrets
- `supabase.md` - Optional Supabase keys setup
- `routes/README.md` - One markdown file per API route in `src/app/api`

## Quick Missing-Keys Check

Use this command locally:

```bash
for v in DATABASE_URL NEXTAUTH_URL NEXTAUTH_SECRET GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET AGORA_APP_ID AGORA_APP_CERTIFICATE RESEND_API_KEY EMAIL_FROM NEXT_PUBLIC_APP_URL OPENROUTER_API_KEY; do
  if [ -z "${!v}" ]; then echo "MISSING: $v"; else echo "OK: $v"; fi
done
```

If any required key shows `MISSING`, add it in local `.env` and in DigitalOcean App Settings.
