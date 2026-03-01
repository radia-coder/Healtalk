# Guides — HealTalk

Step-by-step setup and how-to guides for working on HealTalk locally or in production.

## Getting Started (Local Dev)

```bash
# 1. Clone the repo
git clone <repo-url>
cd HealTalk

# 2. Install dependencies
npm install

# 3. Copy and fill in environment variables
cp .env.example .env
# Fill in DATABASE_URL, NEXTAUTH_SECRET, API keys...

# 4. Set up the database
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed   # optional: adds sample data

# 5. Start the development server
npm run dev
# Visit http://localhost:3000
```

## Environment Variables Quickstart

| Variable              | Where to Get It                                  |
|-----------------------|--------------------------------------------------|
| `DATABASE_URL`        | Local PostgreSQL or Google Cloud SQL             |
| `NEXTAUTH_SECRET`     | Run: `openssl rand -base64 32`                   |
| `NEXTAUTH_URL`        | `http://localhost:3000` for dev                  |
| `GOOGLE_CLIENT_ID`    | Google Cloud Console → OAuth 2.0 credentials    |
| `GOOGLE_CLIENT_SECRET`| Same as above                                    |
| `AGORA_APP_ID`        | Agora Console → create a new project             |
| `AGORA_APP_CERTIFICATE`| Agora Console → project settings               |
| `GEMINI_API_KEY`      | Google AI Studio (aistudio.google.com)           |
| `RESEND_API_KEY`      | resend.com → API Keys                            |
| `UPLOADTHING_SECRET`  | uploadthing.com → dashboard                      |
| `UPLOADTHING_APP_ID`  | uploadthing.com → dashboard                      |
| `SENTRY_DSN`          | sentry.io → project settings (optional)          |

## Third-Party Services Used

| Service       | Purpose                        | Free Tier  |
|---------------|--------------------------------|------------|
| PostgreSQL     | Primary database              | Self-hosted|
| Prisma         | ORM and migrations            | Free       |
| NextAuth.js    | Authentication                | Free       |
| Google OAuth   | Social login                  | Free       |
| Agora RTC      | Video calls                   | 10k min/mo |
| Google Gemini  | AI chatbot                    | Yes        |
| Resend         | Transactional emails          | 3k/mo free |
| UploadThing    | File/image uploads            | 2GB free   |
| Sentry         | Error monitoring              | Free tier  |

## Common Dev Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm test             # Run Jest tests
npx prisma studio    # Open database GUI
npx prisma migrate dev --name <name>  # Create migration
```
