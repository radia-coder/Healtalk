# Migration Baseline (P3005)

We use this when Prisma shows:

- `Error: P3005`
- Database schema is not empty

## Why It Happens

Prisma migration history is not aligned with an existing database that already has tables.

## Safe Flow

1. Back up database first.
2. Confirm current schema state.
3. Mark initial migration as applied with `prisma migrate resolve`.
4. Run `prisma migrate deploy` again.

## Important

We do this carefully in production and we never run destructive reset commands on live data.
