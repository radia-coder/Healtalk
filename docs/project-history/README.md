# Project History — HealTalk

This folder tracks the history of the HealTalk project — phases, reviews, presentations, and key decisions.

## Project Timeline

### Phase 1 — Foundation
- Next.js 15 app setup with TypeScript and Tailwind CSS v4
- shadcn/ui component library integrated
- Homepage built: hero, features, how it works, testimonials (infinite carousel), FAQ (accordion)
- Authentication pages: login, signup, forgot password
- Find Psychologists page with search and filters
- Psychologist profile page
- Basic patient and psychologist dashboards (UI only)

### Phase 2 — Backend Integration
- PostgreSQL + Prisma schema created
- Full auth system: NextAuth, email verification, Google OAuth
- Appointment booking API and flow
- Agora RTC video call integration
- Messaging system between patient and psychologist
- Email system with Resend (templates for all email types)
- AI chatbot with Google Gemini
- Mood tracker and progress goals APIs
- Mental health screening (PHQ-9, GAD-7)
- Admin dashboard APIs

### Phase 3 — Polish and Deployment
- Performance fixes (code splitting, lazy loading)
- Hydration error fixes
- Sentry error monitoring added
- Deployment to Google Cloud VM with PM2 and Nginx
- Pre-launch checklist completed

## Files in This Folder

- `README.md` — This file (timeline overview)
- `phase-2-review.md` — Detailed review of Phase 2 work
- `implementation-summary.md` — What was built in each phase
- `report.md` — Full project report (academic/graduation)
- `requirements.md` — Original requirements document
- `graduation-presentation.md` — Presentation outline for graduation
- `notes.md` — Miscellaneous notes from development
