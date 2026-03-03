# Supabase Auth Cutover

We control auth behavior with these env vars:

- `SUPABASE_AUTH_MIGRATION_ENABLED`
- `AUTH_CUTOVER_MODE`
- `NEXT_PUBLIC_AUTH_CUTOVER_MODE`

## Modes

- `nextauth` — keep NextAuth primary
- `hybrid` — allow mixed flow
- `supabase_first` — prefer Supabase flow

## Recommendation

Use `nextauth` until all migration checks pass in production.
