# Project: HealTalk Mental Health Platform

## Core Value

**Transform HealTalk from a university project prototype into a production-ready mental health consultation platform where patients can securely connect with licensed psychologists through real video consultations, messaging, and appointment management.**

## Project Summary

HealTalk is a modern mental health consultation platform built with Next.js 14+, TypeScript, and PostgreSQL. Currently a frontend prototype with mock data, it needs to become a fully functional production application with:

- **Real authentication** (Google OAuth + Email/Password)
- **Live video consultations** (Agora.io integration)
- **Real-time messaging** between patients and psychologists
- **Payment processing** for bookings
- **Database-driven** (migrate from mock data to PostgreSQL)
- **Email notifications** for appointments, reminders
- **Admin panel** for managing psychologists, content, analytics
- **Production deployment** on Vercel with proper monitoring

**Target Timeline:** 2-3 months (MVP launch)
**Budget:** Minimal ($0-50/month using free tiers)

## Current State

### What's Implemented (Frontend - 90%)
- ✅ Complete responsive UI for all user types (Patient, Psychologist, Admin)
- ✅ Homepage, about, contact, resources (blog, guides, podcasts)
- ✅ Psychologist search/filtering with 30+ mock psychologists
- ✅ Individual psychologist profiles with booking UI
- ✅ Dashboard layouts for Patient, Psychologist, Admin (7-8 pages each)
- ✅ Booking calendar component with date/time selection
- ✅ Authentication pages (login, signup, forgot password)
- ✅ Checkout page UI
- ✅ 4-step onboarding flow
- ✅ Tailwind CSS v4 with custom design system
- ✅ shadcn/ui component library (20+ components)

### What's Partially Implemented (Backend - 40%)
- ⚠️ Database schema (Prisma - 15 models defined)
- ⚠️ NextAuth.js configured (Credentials + Google/Facebook OAuth)
- ⚠️ Middleware protection for dashboard routes
- ⚠️ Basic API routes (auth, psychologists, appointments)
- ⚠️ Database seeding script (creates bootstrap users)

### What's Missing (Critical - 0%)
- ❌ Video consultation system (Agora.io not integrated)
- ❌ Real-time messaging (no WebSocket/Socket.io)
- ❌ Payment processing (Stripe configured but not integrated)
- ❌ Email notifications (Nodemailer installed but unused)
- ❌ File upload (profile pictures, documents)
- ❌ Migration from mock data to database
- ❌ Production error handling and logging
- ❌ Security hardening (rate limiting, CSRF, validation)
- ❌ Testing (minimal test coverage <5%)
- ❌ Monitoring and analytics

## Tech Stack

### Frontend
- Next.js 16.1.4 (App Router)
- React 19.2.3
- TypeScript 5+
- Tailwind CSS v4
- shadcn/ui (Radix primitives)
- Framer Motion (animations)

### Backend
- Next.js API Routes
- PostgreSQL (Prisma ORM 6.19.2)
- NextAuth.js 4.24.11
- bcryptjs (password hashing)

### Third-Party Services (To Integrate)
- Agora.io (video calls)
- Vercel (hosting)
- Neon/Supabase (PostgreSQL - free tier)
- Resend (email - free tier 3k/month)
- Uploadthing (file uploads - free tier)
- Stripe (payments)

## Requirements

### Functional Requirements

**Authentication & User Management**
- Email/password registration and login
- Google OAuth integration
- Password reset via email
- Role-based access (PATIENT, PSYCHOLOGIST, ADMIN)
- Profile management (upload photo, update bio, credentials)
- Email verification for new accounts

**Video Consultations**
- 1-on-1 video calls using Agora.io
- Screen sharing capability
- Call quality indicators
- Recording capability (optional, with consent)
- Waiting room before sessions
- Session timer with warnings

**Appointment System**
- Psychologist availability calendar
- Patient booking with date/time selection
- Appointment status (pending, confirmed, completed, cancelled)
- Cancellation policy enforcement (24-hour notice)
- Automated reminders (24h, 1h before appointment)
- Psychologist approval workflow

**Real-time Messaging**
- Direct messaging between patient and psychologist
- Message threading per appointment
- Online/offline status
- Typing indicators
- Read receipts
- File attachments (documents, images)

**Payment Processing**
- Stripe integration for bookings
- Multiple payment methods (card, bank transfer)
- Invoice generation
- Refund processing
- Payment history
- Psychologist earnings tracking

**Search & Discovery**
- Filter by location, language, specialization, insurance
- Price range filtering
- Availability filtering
- Sort by rating, price, experience
- Psychologist verification badges

**Reviews & Ratings**
- Patients can review after completed sessions
- 5-star rating system
- Verified reviews only
- Psychologist response to reviews
- Moderation for inappropriate content

**Admin Panel**
- Approve/reject psychologist applications
- Manage hospitals and credentials
- Content moderation (reviews, blog posts)
- Analytics dashboard (bookings, revenue, users)
- User management (ban, delete, edit)
- System settings and configuration

**Notifications**
- Email notifications (appointment confirmations, reminders, cancellations)
- In-app notifications
- SMS notifications (optional, future phase)

### Non-Functional Requirements

**Performance**
- Page load time < 2 seconds
- Video call latency < 300ms
- Database queries optimized (indexes, caching)
- Image optimization (Next.js Image, WebP/AVIF)
- API response time < 500ms

**Security**
- HTTPS enforcement
- Password hashing (bcrypt, 12 rounds)
- JWT session management
- CSRF protection
- XSS prevention
- SQL injection protection (Prisma ORM)
- Rate limiting (prevent DDoS)
- Input validation (Zod schemas)
- Secure file upload (size limits, type validation)
- HIPAA/GDPR considerations (data encryption, privacy)

**Scalability**
- Horizontal scaling capability
- Database connection pooling
- Static asset CDN
- Efficient database queries
- Background job queue for emails

**Reliability**
- Error logging (Sentry or similar)
- Uptime monitoring
- Database backups
- Graceful error handling
- Offline state management

**Usability**
- WCAG 2.1 AA compliance
- Mobile-responsive design
- Clear error messages
- Loading states
- Empty states
- Intuitive navigation

## Constraints

### Technical Constraints
- Must use existing Next.js 14+ App Router architecture
- Must maintain current UI/UX design language
- Database must be PostgreSQL (Prisma ORM)
- Deployment platform: Vercel
- Must support mobile browsers (iOS Safari, Chrome Android)

### Business Constraints
- Budget: $0-50/month for services (use free tiers)
- Timeline: 2-3 months to MVP launch
- Must support multi-country operation (Turkey, US, UK, etc.)
- Must handle multiple currencies (TRY, USD, EUR, GBP)
- Must support multiple languages (Turkish, English initially)

### Compliance Constraints
- Data privacy (GDPR for EU users)
- Healthcare data sensitivity (HIPAA considerations for US)
- Payment security (PCI DSS via Stripe)
- Video call encryption (end-to-end)
- Data retention policies

## Success Criteria

### MVP Launch (2-3 months)
- [ ] Real authentication working (Email + Google OAuth)
- [ ] Video calls functional (Agora.io integrated)
- [ ] Real-time messaging working
- [ ] Payment processing live (Stripe)
- [ ] All mock data migrated to database
- [ ] Email notifications sending
- [ ] Admin panel functional (approve psychologists, view analytics)
- [ ] Deployed to production (Vercel)
- [ ] Basic error logging (Sentry free tier)
- [ ] 10+ real psychologists onboarded

### Quality Metrics
- [ ] Test coverage > 60% (critical paths)
- [ ] Lighthouse performance score > 90
- [ ] Zero critical security vulnerabilities
- [ ] API response times < 500ms (p95)
- [ ] Video call success rate > 95%
- [ ] Page load time < 2 seconds

### User Metrics (Post-Launch)
- [ ] 100+ registered users in first month
- [ ] 50+ appointments booked
- [ ] Average rating > 4.5 stars
- [ ] < 5% appointment cancellation rate
- [ ] < 3% support ticket rate

## Key Decisions

| ID | Decision | Rationale | Date | Phase |
|----|----------|-----------|------|-------|
| DEC-001 | Use Agora.io for video calls | Already configured, excellent quality, good free tier (10k minutes/month), easier integration than Twilio | 2026-02-01 | Planning |
| DEC-002 | Use Resend for email notifications | Free tier (3k emails/month), modern API, better deliverability than SMTP, Next.js friendly | 2026-02-01 | Planning |
| DEC-003 | Use Uploadthing for file uploads | Free tier (2GB), Next.js integration, automatic image optimization, no S3 config needed | 2026-02-01 | Planning |
| DEC-004 | Use Neon PostgreSQL | Generous free tier (0.5GB, autoscaling), serverless, Vercel integration, no cold starts | 2026-02-01 | Planning |
| DEC-005 | Google OAuth only (initially) | Most users prefer Google, simplifies scope. Can add Facebook later if needed | 2026-02-01 | Planning |
| DEC-006 | Use Socket.io for real-time messaging | Industry standard, easy integration, fallback support, good documentation | 2026-02-01 | Planning |
| DEC-007 | Use Zod for validation | Type-safe, integrates with TypeScript, prevents injection attacks, clear error messages | 2026-02-01 | Planning |
| DEC-008 | Use Sentry for error logging | Industry standard, free tier (5k events/month), source map support, performance monitoring | 2026-02-01 | Planning |

## Risks & Mitigations

### Technical Risks

**Risk:** Video call quality issues across different networks
- **Impact:** High - core feature failure
- **Mitigation:** Use Agora.io quality presets, implement network quality indicators, fallback to audio-only

**Risk:** Real-time messaging scalability with Socket.io
- **Impact:** Medium - performance degradation at scale
- **Mitigation:** Start with Socket.io, plan migration to Pusher/Ably if growth exceeds free tier

**Risk:** Database query performance as data grows
- **Impact:** Medium - slow page loads
- **Mitigation:** Add indexes early, implement pagination, use Redis caching for hot paths

**Risk:** Free tier limits exceeded
- **Impact:** Medium - service interruptions
- **Mitigation:** Monitor usage closely, implement usage caps, plan paid upgrade path

### Business Risks

**Risk:** Psychologist onboarding slow (need verification)
- **Impact:** High - no supply = no bookings
- **Mitigation:** Streamline approval process, create waitlist, offer early adopter incentives

**Risk:** Payment processing issues (fraud, chargebacks)
- **Impact:** High - revenue loss, trust issues
- **Mitigation:** Use Stripe Radar, implement refund policy, require session confirmation

**Risk:** HIPAA/GDPR compliance gaps
- **Impact:** High - legal liability
- **Mitigation:** Implement data encryption, consent forms, data deletion workflows, privacy policy

**Risk:** Low user adoption
- **Impact:** High - project failure
- **Mitigation:** Beta testing with university network, social media marketing, referral program

## Out of Scope (Future Milestones)

### Version 1.1 (Post-MVP)
- Multi-language support (i18n)
- Mobile apps (React Native)
- Group therapy sessions
- Insurance integration (verify coverage)
- Advanced analytics dashboard
- A/B testing framework
- Referral system
- Calendar integration (Google Calendar, iCal)

### Version 2.0 (Growth Phase)
- AI-powered psychologist matching
- Mental health assessments (PHQ-9, GAD-7)
- Progress tracking and journaling
- Prescription management
- Family/couples therapy
- Teletherapy for children (with parental consent)
- Integration with EHR systems
- White-label solution for hospitals

## References

### Documentation
- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [NextAuth.js Docs](https://next-auth.js.org/)
- [Prisma Docs](https://www.prisma.io/docs)
- [Agora.io Web SDK](https://docs.agora.io/en/video-calling/get-started/get-started-sdk)
- [Socket.io Docs](https://socket.io/docs/v4/)
- [Stripe Docs](https://stripe.com/docs)
- [Resend Docs](https://resend.com/docs)
- [Uploadthing Docs](https://docs.uploadthing.com/)

### Existing Project Files
- `/CLAUDE.md` - Project instructions for Claude
- `/BACKEND_SETUP.md` - Database setup guide
- `/README.md` - Project overview
- `/prisma/schema.prisma` - Database schema (15 models)
- `/src/lib/mock-data.ts` - Mock psychologist data (30+ entries)
- `/src/lib/mock-blog-data.ts` - Mock blog posts (15 entries)

### Key Files to Review
- `/src/middleware.ts` - Route protection (already implemented)
- `/src/app/api/auth/[...nextauth]/route.ts` - NextAuth config
- `/prisma/seed.ts` - Database seeding script
- `/src/components/psychologists/BookingCalendar.tsx` - Booking UI
- `/src/components/dashboard/` - Dashboard components

## Notes

### Bootstrap Users (Development)
The seed script creates test users:
- **Psychologist:** `ahmet@example.com` / `password123`
- **Patient:** `john@example.com` / `password123`
- **Admin:** `admin@example.com` / `password123`

### Environment Variables Required
```env
# Database
DATABASE_URL="postgresql://..." # Neon PostgreSQL

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="[generate with: openssl rand -base64 32]"
GOOGLE_CLIENT_ID="[from Google Console]"
GOOGLE_CLIENT_SECRET="[from Google Console]"

# Video Calls
AGORA_APP_ID="[from Agora.io]"
AGORA_APP_CERTIFICATE="[from Agora.io]"

# Email
RESEND_API_KEY="[from Resend]"
EMAIL_FROM="noreply@healtalk.com"

# Payments
STRIPE_PUBLIC_KEY="[from Stripe]"
STRIPE_SECRET_KEY="[from Stripe]"
STRIPE_WEBHOOK_SECRET="[from Stripe CLI]"

# File Upload
UPLOADTHING_SECRET="[from Uploadthing]"
UPLOADTHING_APP_ID="[from Uploadthing]"

# Error Tracking
SENTRY_DSN="[from Sentry]"
```

### Design Tokens (Tailwind)
- Primary (Teal): `#4A90A4`
- Secondary (Coral): `#FF9B85`
- Accent (Purple): `#B4A5D5`
- Success (Green): `#81C784`

### Current Database Tables
User, Patient, Psychologist, Admin, Appointment, Message, Favorite, Review, Payment, Progress, Hospital, Availability, Account, Session, VerificationToken

---

**Last Updated:** 2026-02-01
**Project Status:** Planning Phase
**Next Step:** Create roadmap with phase breakdown
