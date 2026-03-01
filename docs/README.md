# HealTalk — Documentation

A complete mental health consultation platform connecting patients with licensed psychologists through secure video consultations and messaging.

**Tech Stack**: Next.js 15 · TypeScript · Tailwind CSS v4 · shadcn/ui · PostgreSQL · Prisma · NextAuth · Agora RTC · Google Gemini · Resend

---

## Docs Folders

| Folder            | What's Inside                                               |
|-------------------|-------------------------------------------------------------|
| `api/`            | All API routes — auth, appointments, messages, AI, admin   |
| `components/`     | UI components — navbar, dashboard, video, chatbot, carousel |
| `database/`       | PostgreSQL + Prisma setup, schema models, common commands   |
| `deployment/`     | Deploy to GCP, Hostinger, PM2, Nginx, SSL setup             |
| `design/`         | Color palette, typography, layout specs, component styles   |
| `ai/`             | Gemini chatbot setup, alternative AI providers              |
| `email/`          | Resend email system, templates, cron reminders              |
| `testing/`        | Jest unit tests, manual flow tests, test results            |
| `features/`       | All features — booking, video, messaging, mood, screening   |
| `guides/`         | Getting started, env vars, third-party service setup        |
| `pages/`          | Every page/route in the app and what it does                |
| `project-history/`| Phase reviews, implementation summaries, graduation report  |
| `scripts/`        | deploy.sh, npm scripts, cron jobs                           |
| `future/`         | Planned features and ideas for future versions              |

---

## Quick Start

```bash
npm install
cp .env.example .env   # fill in your keys
npx prisma migrate dev --name init
npm run dev
```

See `guides/README.md` for full setup instructions.
