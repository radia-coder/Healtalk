# NextAuth and Core App Secrets

These values are required for login sessions and secure auth flow.

## Env vars

```bash
NEXTAUTH_URL=https://finalproject.app
NEXTAUTH_SECRET=long_random_secret
DATABASE_URL=postgresql://...
```

## What each one does

- `NEXTAUTH_URL`: your app base URL.
- `NEXTAUTH_SECRET`: signs/encrypts auth tokens.
- `DATABASE_URL`: where users/sessions/data are stored.

## Step by step

1. Set `NEXTAUTH_URL` to your real domain in production.
2. Generate `NEXTAUTH_SECRET` (long random string).
3. Set correct `DATABASE_URL`.
4. Add all 3 in local `.env` and DigitalOcean env vars.

## Generate secret example

```bash
openssl rand -base64 32
```

## How it helps this project

- Users stay logged in safely.
- Auth callbacks work with correct domain.
- All app data persists in the database.
