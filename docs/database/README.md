# Database Docs

We use PostgreSQL + Prisma in HealTalk.
This folder explains setup, models, Supabase hosting, and migration safety.

## Files

- `prisma-overview.md` — high-level model and command overview
- `supabase.md` — how we use Supabase as hosted PostgreSQL
- `migration-baseline.md` — how we handle non-empty production DB (`P3005`)

## Local Setup

1. Set `DATABASE_URL` in `.env`
2. Run `npx prisma generate`
3. Run `npx prisma migrate dev`

## Production Rule

We always test migrations in a safe environment before production deploy.
