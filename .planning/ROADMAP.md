# Roadmap: HealTalk Mental Health Platform

## Overview

Transform HealTalk from a university project prototype into a production-ready mental health consultation platform. The journey progresses from foundational infrastructure (database, auth, environment setup) through core features (video calls, messaging, payments), security hardening, comprehensive testing, and finally production deployment. Each phase builds upon previous work, with all services using free tiers to maintain zero monthly costs until revenue generation.

## Domain Expertise

None (general full-stack web development with Next.js, React, and PostgreSQL)

## Phases

- [x] **Phase 1: Foundation & Environment** - Set up production infrastructure and dependencies
- [x] **Phase 2: Authentication System** - Implement Google OAuth and email verification
- [x] **Phase 3: Data Migration** - Move from mock data to PostgreSQL database
- [x] **Phase 4: File Upload System** - Profile pictures and document uploads
- [x] **Phase 5: Email Notifications** - Appointment confirmations and reminders
- [x] **Phase 6: Video Consultations** - Agora.io integration for live sessions
- [x] **Phase 7: Real-time Messaging** - Socket.io chat between patients and psychologists
- [ ] **Phase 8: Payment Processing** - Stripe integration for bookings and payouts
- [x] **Phase 9: Admin Panel** - Psychologist approval and content management
- [x] **Phase 10: Security Hardening** - Rate limiting, validation, and protection
- [ ] **Phase 11: Testing & QA** - Comprehensive test coverage for critical paths
- [ ] **Phase 12: Production Deployment** - Vercel deployment with monitoring

## Phase Details

### Phase 1: Foundation & Environment
**Goal**: Establish production-ready infrastructure with database connection, environment configuration, and all third-party service accounts created and configured.

**Depends on**: Nothing (first phase)

**Research**: Likely (multiple new service integrations)

**Research topics**:
- Neon PostgreSQL setup and connection pooling for serverless
- Vercel environment variable management
- Service account creation workflow (Agora, Resend, Uploadthing, Stripe, Sentry)
- Database migration best practices for Prisma
- Development vs production environment configuration

**Plans**: TBD

Plans:
- [ ] 01-01: Set up Neon PostgreSQL and configure connection string
- [ ] 01-02: Create service accounts (Agora, Resend, Uploadthing, Stripe, Sentry)
- [ ] 01-03: Configure environment variables and secrets management
- [ ] 01-04: Update database schema and run migrations

---

### Phase 2: Authentication System
**Goal**: Implement complete authentication with Google OAuth, email verification, password reset, and secure session management using NextAuth.js.

**Depends on**: Phase 1

**Research**: Likely (OAuth configuration and email verification flow)

**Research topics**:
- Google OAuth setup (Google Cloud Console, callback URLs)
- NextAuth.js v4 Google provider configuration
- Email verification token generation and expiration
- Password reset flow with secure tokens
- NextAuth callbacks and session customization for roles

**Plans**: TBD

Plans:
- [ ] 02-01: Configure Google OAuth (Google Console + NextAuth provider)
- [ ] 02-02: Implement email verification on registration
- [ ] 02-03: Build password reset flow with email tokens
- [ ] 02-04: Add role-based session data and middleware protection

---

### Phase 3: Data Migration
**Goal**: Migrate all mock data (psychologists, hospitals, specializations) from TypeScript files to PostgreSQL database and update all components to fetch from API routes.

**Depends on**: Phase 1

**Research**: Unlikely (straightforward data migration with existing schema)

**Plans**: TBD

Plans:
- [x] 03-01: Create database seeding script with mock psychologist data
- [x] 03-02: Update psychologist listing page to fetch from database
- [x] 03-03: Update individual profile pages to use database queries
- [x] 03-04: Migrate blog, guides, and podcast data to database

---

### Phase 4: File Upload System
**Goal**: Implement secure file uploads for profile pictures, psychologist credentials, and appointment documents using Uploadthing with size and type validation.

**Depends on**: Phase 2 (needs authentication)

**Research**: Likely (new service integration)

**Research topics**:
- Uploadthing setup and API key configuration
- Next.js App Router file upload patterns
- Client-side upload components and progress indicators
- File type validation and security (prevent malicious uploads)
- Image optimization and thumbnail generation

**Plans**: TBD

Plans:
- [x] 04-01: Set up Uploadthing and create upload endpoints
- [x] 04-02: Build profile picture upload component
- [x] 04-03: Add psychologist credential document upload
- [x] 04-04: Implement file validation and error handling

---

### Phase 5: Email Notification System
**Goal**: Implement automated email notifications for appointment confirmations, reminders (24h, 1h before), cancellations, and account verification using Resend.

**Depends on**: Phase 2 (needs user emails)

**Research**: Likely (new service integration and template design)

**Research topics**:
- Resend API setup and domain verification
- React email templates with @react-email/components
- Email scheduling patterns (cron jobs vs database triggers)
- Transactional email best practices (deliverability, unsubscribe)
- Background job processing for email queue

**Plans**: TBD

Plans:
- [x] 05-01: Set up Resend and create email templates
- [x] 05-02: Implement appointment confirmation emails
- [x] 05-03: Build reminder system (24h and 1h before appointments)
- [x] 05-04: Add cancellation and rescheduling notifications

---

### Phase 6: Video Consultations
**Goal**: Integrate Agora.io for live 1-on-1 video consultations with screen sharing, call quality indicators, waiting room, and session timer.

**Depends on**: Phase 3 (needs appointments from database)

**Research**: Likely (complex external API integration)

**Research topics**:
- Agora Web SDK 4.x setup and initialization
- Token generation for secure channel access (server-side)
- Camera/microphone permissions handling
- Network quality monitoring and adaptive bitrate
- Screen sharing implementation
- Call recording (optional, with consent management)
- Waiting room UI patterns for healthcare

**Plans**: TBD

Plans:
- [x] 06-01: Set up Agora SDK and token generation API
- [x] 06-02: Build video call UI component with controls
- [x] 06-03: Implement waiting room and session timer
- [x] 06-04: Add screen sharing and call quality indicators
- [x] 06-05: Test call handling (reconnection, errors, end session)

---

### Phase 7: Real-time Messaging
**Goal**: Implement real-time chat between patients and psychologists using Socket.io with message threading, online status, typing indicators, and file attachments.

**Depends on**: Phase 4 (needs file uploads for attachments)

**Research**: Likely (Socket.io integration with Next.js App Router)

**Research topics**:
- Socket.io v4 server setup with Next.js custom server
- Socket.io client connection and authentication
- Message persistence patterns (save to DB, then broadcast)
- Online/offline presence tracking
- Typing indicators implementation
- File attachment handling with Socket.io
- Message pagination and infinite scroll

**Plans**: TBD

Plans:
- [x] 07-01: Set up Socket.io server and client connections
- [x] 07-02: Build message UI and real-time message delivery
- [x] 07-03: Implement online status and typing indicators
- [x] 07-04: Add file attachments and message threading
- [x] 07-05: Add read receipts and notification badges

---

### Phase 8: Payment Processing
**Goal**: Integrate Stripe for appointment payments, invoice generation, refund processing, and psychologist earnings tracking with automatic payouts.

**Depends on**: Phase 3 (needs appointments and pricing data)

**Research**: Likely (Stripe API and webhook handling)

**Research topics**:
- Stripe Checkout vs Payment Intents for booking flow
- Stripe webhook setup and signature verification
- Connected Accounts for psychologist payouts
- Refund policy enforcement (24-hour cancellation)
- Invoice generation with Stripe Invoicing API
- Handling failed payments and retry logic
- PCI compliance considerations

**Plans**: TBD

Plans:
- [ ] 08-01: Set up Stripe and create checkout flow
- [ ] 08-02: Implement webhook handling for payment events
- [ ] 08-03: Build refund processing and cancellation policies
- [ ] 08-04: Add psychologist earnings dashboard and payout tracking
- [ ] 08-05: Generate invoices and payment receipts

---

### Phase 9: Admin Panel Implementation
**Goal**: Build fully functional admin panel for approving psychologists, managing content, viewing analytics, and moderating reviews.

**Depends on**: Phase 3 (needs database content to manage)

**Research**: Unlikely (internal CRUD operations with existing UI)

**Plans**: TBD

Plans:
- [x] 09-01: Build psychologist approval workflow and verification
- [x] 09-02: Create analytics dashboard with charts (bookings, revenue, users)
- [x] 09-03: Implement content moderation (reviews, blog posts)
- [x] 09-04: Add user management (ban, delete, edit profiles)

---

### Phase 10: Security Hardening
**Goal**: Implement comprehensive security measures including rate limiting, input validation with Zod, CSRF protection, XSS prevention, and error handling.

**Depends on**: Phase 8 (all features implemented before hardening)

**Research**: Likely (security best practices and library choices)

**Research topics**:
- Rate limiting strategies for Next.js API routes (upstash/ratelimit)
- Zod schema validation patterns for all API endpoints
- CSRF protection for Next.js App Router
- Security headers configuration (CSP, HSTS, X-Frame-Options)
- Error boundary implementation for React 19
- Sentry integration for error tracking
- HIPAA/GDPR compliance checklist

**Plans**: TBD

Plans:
- [x] 10-01: Add Zod validation to all API routes
- [x] 10-02: Implement rate limiting for authentication and API endpoints
- [x] 10-03: Configure security headers and CSRF protection
- [x] 10-04: Set up error boundaries and Sentry error tracking
- [x] 10-05: Add audit logging for sensitive operations

---

### Phase 11: Testing & Quality Assurance
**Goal**: Achieve 60%+ test coverage with unit tests, integration tests, and E2E tests for critical user journeys (signup, booking, video call, payment).

**Depends on**: Phase 10 (all features complete)

**Research**: Unlikely (Jest and Playwright already configured)

**Plans**: TBD

Plans:
- [ ] 11-01: Write unit tests for utility functions and API routes
- [ ] 11-02: Create integration tests for authentication flow
- [ ] 11-03: Build E2E tests for booking and payment journey
- [ ] 11-04: Test video call and messaging functionality
- [ ] 11-05: Run accessibility audit and fix WCAG violations

---

### Phase 12: Production Deployment
**Goal**: Deploy to Vercel production with environment variables, database migrations, monitoring setup, performance optimization, and launch checklist completion.

**Depends on**: Phase 11 (testing complete)

**Research**: Likely (production deployment best practices)

**Research topics**:
- Vercel production deployment workflow
- Database migration strategy for production (Prisma)
- Environment variable management in Vercel
- Custom domain setup and SSL
- Performance monitoring and logging setup
- Sentry production configuration
- Post-deployment smoke tests
- Rollback strategy

**Plans**: TBD

Plans:
- [ ] 12-01: Configure Vercel project and environment variables
- [ ] 12-02: Run production database migrations
- [ ] 12-03: Set up monitoring (Sentry, Vercel Analytics)
- [ ] 12-04: Performance optimization (bundle size, caching, images)
- [ ] 12-05: Launch checklist and go-live preparation

---

## Progress

**Execution Order:**
Phases execute sequentially: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Environment | 4/4 | ✅ Complete | 2026-02-02 |
| 2. Authentication System | 4/4 | ✅ Complete | 2026-02-01 |
| 3. Data Migration | 4/4 | ✅ Complete | 2026-02-02 |
| 4. File Upload System | 4/4 | ✅ Complete | 2026-02-02 |
| 5. Email Notifications | 4/4 | ✅ Complete | 2026-02-02 |
| 6. Video Consultations | 5/5 | ✅ Complete | 2026-02-02 |
| 7. Real-time Messaging | 5/5 | ✅ Complete | 2026-02-02 |
| 8. Payment Processing | 0/5 | Not started | - |
| 9. Admin Panel | 4/4 | ✅ Complete | 2026-02-02 |
| 10. Security Hardening | 0/5 | Not started | - |
| 11. Testing & QA | 0/5 | Not started | - |
| 12. Production Deployment | 0/5 | Not started | - |

**Total Plans**: 54 plans across 12 phases
**Estimated Timeline**: 2-3 months (MVP launch)
**Budget**: $0/month (all free tiers)
