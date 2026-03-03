# Upstash Redis Setup (Rate Limiting)

Upstash Redis is used for production rate limiting.

## Env vars

```bash
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

## Step by step

1. Go to https://upstash.com
2. Create Redis database.
3. Open REST API tab.
4. Copy URL and token.
5. Add both to `.env` and DigitalOcean.

## How it helps this project

- Protects auth/chat/api endpoints from spam and abuse.
- Keeps system stable under heavy traffic.

## Important note

- In local/dev, rate limit is relaxed.
- In production, rate limit is enforced.
- If Upstash keys are missing, code uses in-memory fallback (works, but less strong).
