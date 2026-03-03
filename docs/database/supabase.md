# Supabase in Our Database Layer

We use Supabase as the hosted PostgreSQL provider for HealTalk.

## Why We Use Supabase

- We get managed PostgreSQL hosting.
- We can see data in a clean dashboard.
- We keep Prisma workflow the same with almost no app code changes.

## How We Connect It

We use two environment variables:

```bash
DATABASE_URL=postgresql://...pooler...:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://...pooler...:5432/postgres
```

- We use `DATABASE_URL` for normal app queries.
- We use `DIRECT_URL` for Prisma migrations.

## Important Notes

- We URL-encode special password characters.
- We keep only one value per env key to avoid override mistakes.
- We do not expose sensitive server keys in frontend code.

## Related Docs

- Main Supabase guide: [/Users/maahir/Downloads/HealTalk/docs/supabase/supabase.md](/Users/maahir/Downloads/HealTalk/docs/supabase/supabase.md)
- Migration guide: [/Users/maahir/Downloads/HealTalk/docs/deployment/SUPABASE_MIGRATION_GUIDE.md](/Users/maahir/Downloads/HealTalk/docs/deployment/SUPABASE_MIGRATION_GUIDE.md)
