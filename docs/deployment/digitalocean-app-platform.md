# DigitalOcean App Platform — Step by Step

This is our main production deployment flow.

## 1. Connect Repository

1. Open DigitalOcean App Platform.
2. Click Create App.
3. Connect GitHub repository.
4. Choose branch `main`.
5. Keep Autodeploy ON.

## 2. Build and Run

Set these in App settings:

- Build Command: `npm run build`
- Run Command: `npm run start`
- HTTP Port: `8080` (or the port your app expects in DO setup)

## 3. Add Environment Variables

At minimum add:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `AGORA_APP_ID`
- `AGORA_APP_CERTIFICATE`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `OPENROUTER_API_KEY`

Recommended:

- `OPENROUTER_MODEL`
- `OPENROUTER_FALLBACK_MODEL`
- `GROQ_API_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `CRON_SECRET`
- `CSRF_SECRET`

## 4. Deploy

1. Click Deploy.
2. Watch logs until build completes.
3. Open live URL and test critical pages.

## 5. Post-Deploy Smoke Test

- Login/signup works
- Book appointment works
- Message flow works
- Video call token route works
- AI Assistant chat works
- Email verification/resend works

## Common Failure Causes

- Missing env vars
- Wrong OAuth redirect URLs
- Prisma migration baseline issue on existing database
- Wrong repository/branch selected in DO app settings
