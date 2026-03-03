# Security Secrets (CSRF and Cron)

These are not external API keys, but they are important secrets.

## Env vars

```bash
CSRF_SECRET=long_random_secret
CRON_SECRET=long_random_secret
```

## What they do

- `CSRF_SECRET`: protects POST actions from fake cross-site requests.
- `CRON_SECRET`: protects cron endpoint so only trusted jobs can call it.

## Step by step

1. Generate two random strings.
2. Put one in `CSRF_SECRET`.
3. Put another in `CRON_SECRET`.
4. Add both to local `.env` and DigitalOcean env vars.

## Generate random strings

```bash
openssl rand -base64 32
```

## How it helps this project

- Blocks unsafe requests.
- Secures scheduled reminder jobs.
