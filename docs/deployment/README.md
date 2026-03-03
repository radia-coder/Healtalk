# Deployment Docs

We deploy HealTalk mainly on **DigitalOcean App Platform**.
This folder explains what we use in production and how we deploy safely.

## Files

- `digitalocean-app-platform.md` — main step-by-step deployment guide
- `env-vars.md` — production environment variables checklist
- `pre-launch-checklist.md` — final checks before launch
- `SUPABASE_MIGRATION_GUIDE.md` — auth/database migration notes
- `cheatsheet.md` — quick command reference
- `overview.md` — high-level deployment summary
- `plan.md` — older detailed plan
- `google-cloud.md` — legacy/alternative hosting notes

## Current Production Direction

- We use GitHub `main` branch as deploy source.
- We set all env vars in DigitalOcean App settings.
- We run build command from app settings and verify logs before going live.
