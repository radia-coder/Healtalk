# Supabase Migration Guide (Easy English)

This project now supports a safe 2-phase migration:

1. Phase 1: Move database to Supabase Postgres (keep current login working)
2. Phase 2: Link users to Supabase Auth gradually (no sudden cutover)

## Phase 1: Move Database to Supabase (Safe)

### 1) Create Supabase project
- Go to https://supabase.com
- Click `New project`
- Choose organization, project name, region, and strong DB password
- Wait until project is ready

### 2) Get connection strings
- Open your Supabase project
- Go to `Project Settings` -> `Database`
- Copy:
  - Pooler connection string (Transaction mode): use for `DATABASE_URL`
  - Direct connection string: use for `DIRECT_URL`

### 3) Update your `.env`
Set:

```env
DATABASE_URL="your-supabase-pooler-url"
DIRECT_URL="your-supabase-direct-url"
```

Notes:
- `DATABASE_URL` should be the pooled URL for app runtime.
- `DIRECT_URL` should be the direct URL for Prisma migrations.

### 4) Push schema and seed
Run:

```bash
npm run db:generate
npx prisma migrate deploy
npm run db:seed
```

If this is a fresh DB and no migrations were applied before:

```bash
npm run db:push
npm run db:seed
```

### 5) Start app and test
```bash
npm run dev
```

Test:
- login
- dashboard pages
- find psychologists page
- create appointment/session

At this point, your auth is still NextAuth, but data is on Supabase Postgres.

---

## Phase 2: Controlled Supabase Auth Migration

### 1) Enable email auth in Supabase
- Go to `Authentication` -> `Providers`
- Enable `Email` (and Google if needed)
- Configure redirect URLs if you use magic link/OAuth

### Email setup (your normal email)
- If you are okay with default test email sender, you can use Supabase default mail for testing.
- For production, use your own SMTP:
  - Go to `Authentication` -> `Settings` -> `SMTP Settings`
  - Turn on custom SMTP
  - Fill SMTP host, port, username, password, and sender email
  - Save and send a test email
- For Gmail SMTP:
  - Use 2-Step Verification
  - Create an App Password in Google account
  - Use:
    - Host: `smtp.gmail.com`
    - Port: `587` (TLS)
    - Username: your Gmail
    - Password: Gmail App Password

### Google auth setup in Supabase
- Go to Google Cloud Console -> APIs & Services -> Credentials
- Create OAuth Client ID (Web application)
- Add authorized redirect URI:
  - `https://<your-project-ref>.supabase.co/auth/v1/callback`
- In Supabase:
  - Go to `Authentication` -> `Providers` -> `Google`
  - Paste Google Client ID and Client Secret
  - Enable provider and save
- If you use local app callback for frontend flow, add local app URL in allowed redirect URLs.

### 2) Copy auth keys
- Go to `Project Settings` -> `API`
- Copy:
  - `Project URL` -> `SUPABASE_URL`
  - `anon public key` -> `SUPABASE_ANON_KEY`
  - `service_role key` -> `SUPABASE_SERVICE_ROLE_KEY` (server/scripts only)

### 3) Update `.env`
```env
SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-publishable-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SUPABASE_AUTH_MIGRATION_ENABLED="true"
AUTH_CUTOVER_MODE="supabase_first"
NEXT_PUBLIC_AUTH_CUTOVER_MODE="supabase_first"
```

### 4) Apply new migration fields
Run:

```bash
npx prisma migrate deploy
```

This adds:
- `User.authProvider`
- `User.supabaseAuthId`
- `User.supabaseLinkedAt`

### 5) Link users gradually
You have 2 ways:

- API (logged in user links self):
  - `POST /api/auth/migration/supabase/link`
  - body: `{ "accessToken": "<supabase_access_token>" }`
- Script (manual admin link):
  - `npm run supabase:migration:link-user -- --email=user@example.com --supabase-id=<uuid>`

Check progress:

```bash
npm run supabase:migration:status
```

### 6) Verify status endpoint
- `GET /api/auth/migration/supabase/status` (for logged-in user)
- shows if current account is linked

---

## Recommended Cutover Strategy

1. Keep NextAuth live during migration.
2. Link active users first.
3. Monitor `supabase:migration:status`.
4. When most users are linked, start switching login UI to Supabase.
5. Keep fallback login path until migration is complete.

---

## Important Security Notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code.
- Keep `SUPABASE_AUTH_MIGRATION_ENABLED=false` until you are ready.
- Use HTTPS in production.
