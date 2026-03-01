# Supabase — HealTalk Database Guide

## What is Supabase?

Supabase is an open-source platform that gives you a **hosted PostgreSQL database** plus a bunch of extra tools built on top of it — like authentication, file storage, and real-time updates.

Think of it as: **PostgreSQL + a nice dashboard + extra features**, all in one place, without you having to manage any servers.

> In simple terms: instead of setting up and running your own database server, Supabase hosts it for you and gives you a web dashboard to see and manage your data.

---

## Why We Use Supabase in HealTalk

Before Supabase, the project needed a self-hosted PostgreSQL database — meaning you'd have to:
- Install PostgreSQL locally or on a server
- Manage it yourself
- Set up backups manually
- Have no visual way to see your data

With Supabase, all of that is handled for you. You just connect and go.

### Benefits for HealTalk

| What | Without Supabase | With Supabase |
|------|-----------------|---------------|
| Database hosting | Self-managed PostgreSQL | Hosted, managed for you |
| Viewing data | Only via terminal/SQL | Visual dashboard in browser |
| Backups | Manual setup | Automatic |
| Auth (future) | NextAuth only | Can use Supabase Auth too |
| File storage (future) | UploadThing | Supabase Storage option |
| Real-time (future) | Socket.io only | Built-in real-time subscriptions |
| Setup difficulty | Complex | Just copy a connection string |

---

## What Supabase Does for HealTalk Right Now

Currently, Supabase is used as our **database host**. All 23 database tables (users, appointments, psychologists, patients, messages, payments, etc.) live inside Supabase's PostgreSQL.

Our code (Prisma ORM) talks to Supabase exactly the same way it would talk to any PostgreSQL database — **zero code changes were needed**.

### Our 23 Tables in Supabase
- `User` — all platform users
- `Patient` — patient-specific data
- `Psychologist` — psychologist profiles & credentials
- `Admin` — admin users
- `Appointment` — booked sessions
- `Message` — real-time messages
- `Payment` — payment records
- `Review` — patient reviews
- `Progress` — mood tracking
- `Availability` — psychologist schedules
- `TherapySession` — group therapy sessions
- `SessionParticipant` — group session attendees
- `ScreeningAssessment` — AI mental health screening results
- `Favorite` — saved psychologists
- `Hospital` — partner hospitals
- `BlogPost`, `BlogAuthor`, `BlogContent` — blog system
- `Guide` — therapy guides
- `PodcastEpisode` — podcast episodes
- `Account`, `Session`, `VerificationToken` — auth tables
- `AuditLog` — admin audit trail

---

## How We Connected HealTalk to Supabase

### Step 1 — Created a Supabase Project
- Went to [supabase.com](https://supabase.com)
- Created a new project called **HealTalk**
- Set a strong database password
- Selected the closest region (Asia South 1)

### Step 2 — Got the Connection Strings
From **Supabase Dashboard → Settings → Database**, we copied two URLs:

1. **DATABASE_URL** (connection pooling, port 6543) — used for all normal app queries
2. **DIRECT_URL** (direct connection, port 5432) — used only for database migrations

### Step 3 — Updated the `.env` File
We added both URLs to the project's `.env` file:

```env
DATABASE_URL="postgresql://postgres.xxxx:[PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxx:[PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
```

> **Important:** If your password contains special characters like `#`, they must be URL-encoded. For example, `#` becomes `%23`. Otherwise Prisma will fail to parse the connection string.

### Step 4 — Pushed the Schema
We ran one command to create all 23 tables inside Supabase:

```bash
npx prisma db push
```

Output:
```
🚀  Your database is now in sync with your Prisma schema. Done in 32.91s
```

### Step 5 — Seeded the Database (optional)
To populate the database with demo data (psychologists, patients, blog posts, etc.):

```bash
npx prisma db seed
```

---

## How the Two URLs Work

| URL | Port | Used For |
|-----|------|----------|
| `DATABASE_URL` (pooled) | 6543 | All app queries (reads, writes) |
| `DIRECT_URL` (direct) | 5432 | Schema migrations only (`prisma db push`, `prisma migrate`) |

This is a Supabase requirement — connection pooling (PgBouncer) doesn't support migration commands, so migrations always use the direct connection.

---

## Where to See Your Data

1. Go to [supabase.com](https://supabase.com) and open your project
2. Click **Table Editor** in the left sidebar
3. You'll see all your tables and can browse, filter, and edit data visually

You can also run raw SQL queries from **SQL Editor** in the dashboard.

---

## Prisma + Supabase = No Code Changes

This is the most important thing to understand:

> **We did not change a single line of application code.**

Prisma (our database ORM) just needed the connection string updated. Everything else — all 23 models, all API routes, all queries — stayed exactly the same. Supabase is 100% compatible with Prisma because it's just PostgreSQL under the hood.

---

## What Supabase Can Replace in the Future

As HealTalk grows, Supabase can replace more services:

| Current Service | Supabase Replacement | Status |
|----------------|---------------------|--------|
| NextAuth.js | Supabase Auth | In progress (hybrid mode) |
| UploadThing | Supabase Storage | Future option |
| Socket.io (some features) | Supabase Realtime | Future option |
| Custom audit logs | Supabase logs | Future option |

The auth migration is already partially set up — see `AUTH_CUTOVER_MODE` in `.env` and `src/lib/auth-cutover.ts`.

---

## Common Issues & Fixes

### `#` in password breaks the URL
**Problem:** Special characters in the database password cause URL parsing errors.
**Fix:** URL-encode the character. `#` → `%23`, `@` → `%40`, `$` → `%24`

### Old DIRECT_URL overriding the new one
**Problem:** If there are duplicate environment variable keys in `.env`, the last one wins.
**Fix:** Make sure `DATABASE_URL` and `DIRECT_URL` only appear once in `.env`.

### `P1001: Can't reach database server`
**Problem:** Wrong connection string or old project URL still in `.env`.
**Fix:** Double-check both URLs point to your current Supabase project ID.

### Supabase project paused (free tier)
**Problem:** On the free plan, Supabase pauses your database after 1 week of inactivity.
**Fix:** Log into Supabase dashboard and click **"Restore project"**, or upgrade to a paid plan.

---

## Free Tier Limits

| Resource | Free Limit |
|----------|-----------|
| Database size | 500 MB |
| Bandwidth | 5 GB/month |
| Inactivity pause | After 1 week |
| Projects | 2 active |

For a production app or university demo, the free tier is more than enough.

---

## Summary

- Supabase hosts our PostgreSQL database — no server setup needed
- We connected it by updating two lines in `.env`
- All 23 HealTalk tables were created with one command: `npx prisma db push`
- Zero application code was changed
- We get a visual dashboard to manage our data
- In the future, Supabase Auth will fully replace NextAuth

## Video Calls — Agora Only

`VideoCallPanel` (`src/components/dashboard/messages/VideoCallPanel.tsx`) was updated to
use **Agora WebRTC** exclusively. The previous Jitsi iframe integration was removed because:

1. Jitsi was a third-party dependency with no integration to our token/auth system.
2. Mute/video controls in the Jitsi iframe panel had no effect on the actual Jitsi session.
3. Agora is already the established video provider for all other call flows in the app.

The panel now shows a **"Join Call"** button that navigates the user to `/call/[appointmentId]`,
where the full Agora-powered call UI lives.
