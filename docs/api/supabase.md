# Supabase Keys (Optional Migration Mode)

Use these keys only if you are using Supabase auth migration/hybrid mode.

## Env vars

```bash
SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_AUTH_MIGRATION_ENABLED=false
AUTH_CUTOVER_MODE=nextauth
NEXT_PUBLIC_AUTH_CUTOVER_MODE=nextauth
```

## Which keys are safe on frontend

Frontend-safe:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Server-only (never expose in frontend):
- `SUPABASE_SERVICE_ROLE_KEY`

## Step by step

1. Open your Supabase project.
2. Copy Project URL.
3. Copy anon key and publishable key.
4. Copy service role key (server only).
5. Add keys to `.env` and DigitalOcean.
6. Keep migration flags aligned with your auth strategy.

## How it helps this project

- Supports linking existing users with Supabase.
- Enables phased move from NextAuth-only to hybrid/supabase-first.
