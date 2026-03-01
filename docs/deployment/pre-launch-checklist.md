# Pre-Launch Checklist - Critical Items

## ⚠️ MUST FIX BEFORE GOING LIVE

### 🔐 Security (Critical)

- [ ] **Add rate limiting to all API routes**
  ```typescript
  // Create src/lib/rate-limit.ts
  import { Ratelimit } from "@upstash/ratelimit";
  import { Redis } from "@upstash/redis";

  export const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "10 s"),
  });
  ```

- [ ] **Add input validation to ALL API routes**
  - ✅ Already using Zod in some routes - extend to ALL
  - ✅ Example in `/api/agora/token/route.ts` is good - replicate

- [ ] **Add security headers**
  ```typescript
  // In next.config.mjs, add:
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  }
  ```

- [ ] **Verify .env is NOT committed**
  ```bash
  git log --all --full-history -- .env
  # If it shows history, you need to remove it from git history!
  ```

- [ ] **Rotate all API keys/secrets**
  - Generate new NEXTAUTH_SECRET: `openssl rand -base64 32`
  - Don't reuse development keys in production

- [ ] **Add CSRF protection** (NextAuth handles this, but verify)

### 📄 Legal Pages (Required)

- [ ] **Create Privacy Policy page**
  ```bash
  # Create src/app/(public)/privacy/page.tsx
  # Use generator: https://www.termsfeed.com/privacy-policy-generator/
  ```

- [ ] **Create Terms of Service page**
  ```bash
  # Create src/app/(public)/terms/page.tsx
  ```

- [ ] **Create Cookie Policy page**
  ```bash
  # Create src/app/(public)/cookies/page.tsx
  ```

- [ ] **Add HIPAA Notice** (if serving US patients)
  ```bash
  # Create src/app/(public)/hipaa/page.tsx
  ```

- [ ] **Add links to Footer component**
  ```typescript
  // In src/components/layout/Footer.tsx, add:
  <Link href="/privacy">Privacy Policy</Link>
  <Link href="/terms">Terms of Service</Link>
  <Link href="/hipaa">HIPAA Notice</Link>
  ```

### 🧪 Testing Required

- [ ] **Test patient flow end-to-end:**
  1. Register → Verify email → Complete profile
  2. Browse psychologists → Book appointment → Pay
  3. Send message before appointment
  4. Join video call at appointment time
  5. Leave review after appointment

- [ ] **Test psychologist flow:**
  1. Register → Upload credentials → Wait for approval
  2. Get approved → Set availability
  3. Receive booking → Confirm
  4. Send message to patient
  5. Join video call

- [ ] **Test on mobile devices:**
  - Video calls on mobile
  - Messaging on mobile
  - Booking flow on mobile

- [ ] **Test payment failures:**
  - Card declined
  - Network error during payment
  - Payment succeeds but webhook fails

### 💳 Payment Integration

- [ ] **Set up Stripe**
  ```bash
  npm install stripe @stripe/stripe-js
  ```

- [ ] **Create Stripe checkout API route**
  ```typescript
  // Create src/app/api/stripe/checkout/route.ts
  ```

- [ ] **Add webhook handler**
  ```typescript
  // Create src/app/api/stripe/webhook/route.ts
  // Handle payment_intent.succeeded, etc.
  ```

- [ ] **Test in Stripe test mode thoroughly**

- [ ] **Add payment confirmation emails**

### 📧 Email System

- [ ] **Verify Resend domain**
  - Add DNS records in Hostinger
  - Use your custom domain for emails

- [ ] **Create email templates:**
  ```bash
  # Create src/emails/
  # - WelcomeEmail.tsx
  # - AppointmentConfirmation.tsx
  # - AppointmentReminder.tsx
  # - PsychologistApproved.tsx
  # - PsychologistRejected.tsx
  ```

- [ ] **Implement appointment reminders**
  ```typescript
  // Create a cron job or use Vercel Cron
  // src/app/api/cron/send-reminders/route.ts
  ```

### 🗄️ Database

- [ ] **Set up production database** (Neon/Supabase/Railway)

- [ ] **Run all migrations**
  ```bash
  npx prisma migrate deploy
  ```

- [ ] **Seed initial data**
  ```bash
  npx prisma db seed
  ```

- [ ] **Set up automated backups**
  - Neon has automatic backups ✅
  - Or set up pg_dump cron job

- [ ] **Add database connection pooling**
  ```typescript
  // In src/lib/prisma.ts, use:
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
    directUrl = env("DIRECT_URL") // For migrations
  }
  ```

### 🎨 UI/UX Polish

- [ ] **Add loading states everywhere**
  - Button loading spinners
  - Page skeleton loaders
  - Suspense boundaries

- [ ] **Add error boundaries**
  ```typescript
  // Create src/app/error.tsx
  // Create src/app/global-error.tsx
  ```

- [ ] **Add proper error messages**
  - User-friendly error messages
  - No technical jargon
  - Actionable guidance

- [ ] **Test accessibility**
  - Keyboard navigation
  - Screen reader compatibility
  - Color contrast (WCAG AA)

### 📊 Monitoring

- [ ] **Set up Sentry**
  ```bash
  npm install @sentry/nextjs
  npx @sentry/wizard@latest -i nextjs
  ```

- [ ] **Add analytics** (PostHog or Plausible)
  ```bash
  npm install posthog-js
  ```

- [ ] **Set up uptime monitoring**
  - Create free UptimeRobot account
  - Monitor: https://yourdomain.com/api/health

- [ ] **Create health check endpoint**
  ```typescript
  // src/app/api/health/route.ts
  export async function GET() {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ status: 'ok' });
  }
  ```

### 🔍 SEO

- [ ] **Add meta tags to all pages**
  ```typescript
  export const metadata = {
    title: 'HealTalk - Mental Health Consultations',
    description: '...',
    openGraph: {
      title: '...',
      description: '...',
      images: ['/og-image.jpg'],
    },
  };
  ```

- [ ] **Create sitemap**
  ```typescript
  // Create src/app/sitemap.ts
  export default function sitemap() {
    return [
      { url: 'https://yourdomain.com', lastModified: new Date() },
      { url: 'https://yourdomain.com/find-psychologists' },
      // ... all public pages
    ];
  }
  ```

- [ ] **Create robots.txt**
  ```typescript
  // Create src/app/robots.ts
  export default function robots() {
    return {
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: '/api/',
      },
      sitemap: 'https://yourdomain.com/sitemap.xml',
    };
  }
  ```

- [ ] **Optimize images**
  - Use Next.js Image component everywhere
  - Compress images with TinyPNG
  - Use WebP format

### 🚀 Performance

- [ ] **Enable Next.js Image Optimization**
  ```typescript
  // In next.config.mjs
  images: {
    domains: ['lh3.googleusercontent.com', 'your-upload-domain.com'],
    formats: ['image/avif', 'image/webp'],
  }
  ```

- [ ] **Add Suspense boundaries for async components**

- [ ] **Lazy load non-critical components**
  ```typescript
  const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
    loading: () => <Spinner />,
  });
  ```

- [ ] **Optimize bundle size**
  ```bash
  npm run build
  # Check .next/analyze for large bundles
  ```

### 🔄 CI/CD

- [ ] **Set up GitHub Actions** (if using VM)
  ```yaml
  # .github/workflows/deploy.yml
  name: Deploy
  on:
    push:
      branches: [main]
  jobs:
    deploy:
      # ... deployment steps
  ```

- [ ] **Add pre-commit hooks**
  ```bash
  npm install -D husky lint-staged
  npx husky init
  ```

### 🧪 Load Testing

- [ ] **Test video call capacity**
  ```bash
  # Use k6 or Artillery to simulate users
  # Test 10-20 concurrent video calls
  ```

- [ ] **Test database under load**
  ```bash
  # Simulate 100+ concurrent bookings
  ```

- [ ] **Test API rate limits**

### 📱 Mobile App Preparation (Future)

- [ ] **Add PWA support**
  ```bash
  npm install next-pwa
  ```

- [ ] **Create manifest.json**

- [ ] **Add service worker**

## Post-Launch Monitoring

### First 24 Hours

- [ ] Monitor error rates (Sentry)
- [ ] Check server resources (CPU, memory)
- [ ] Watch for payment issues
- [ ] Monitor video call success rate
- [ ] Check email delivery rate

### First Week

- [ ] Collect user feedback
- [ ] Fix critical bugs immediately
- [ ] Monitor conversion rates
- [ ] Check for performance bottlenecks
- [ ] Review security logs

### First Month

- [ ] Analyze user behavior (analytics)
- [ ] A/B test key features
- [ ] Optimize slow queries
- [ ] Review and improve onboarding flow
- [ ] Collect psychologist feedback

## Quick Wins (Can be done after launch)

- [ ] Add dark mode
- [ ] Add multiple languages
- [ ] Add chat support (Intercom, Crisp)
- [ ] Add blog for SEO
- [ ] Add testimonials from real users
- [ ] Add before/after success stories
- [ ] Create social media presence
- [ ] Add referral program
- [ ] Add email newsletter

## Compliance Checklist (If serving US patients)

- [ ] **HIPAA Compliance:**
  - [ ] Signed Business Associate Agreements (BAAs) with:
    - [ ] Hosting provider (Vercel)
    - [ ] Database provider (Neon)
    - [ ] Video provider (Agora)
    - [ ] Email provider (Resend)
  - [ ] Encrypt data at rest and in transit ✅
  - [ ] Implement access controls ✅
  - [ ] Audit logging ✅ (AuditLog model exists)
  - [ ] Data breach notification procedures
  - [ ] Patient rights documentation

- [ ] **Professional Licensing:**
  - [ ] Verify psychologist licenses in their jurisdiction
  - [ ] Check for cross-state practice laws
  - [ ] Ensure psychologists have malpractice insurance
  - [ ] Implement license verification workflow

## Emergency Procedures

Create a runbook with:

1. **How to rollback a deployment**
   ```bash
   # Vercel: Go to Deployments → Click previous → Promote to Production
   ```

2. **How to restore database from backup**
   ```bash
   # If using Neon: Use their dashboard
   # If using VM: pg_restore -U user -d database backup.sql
   ```

3. **How to disable a feature flag**
   ```bash
   # Create feature flags in environment variables
   # Disable without redeployment
   ```

4. **Emergency contacts:**
   - Vercel support: https://vercel.com/support
   - Your team members
   - Database provider support

## Cost Tracking

Set up billing alerts:
- Vercel: Set to alert at 80% of plan
- Database: Set storage/compute alerts
- Agora: Set video minutes alerts
- Email: Track email usage

## Marketing Preparation

- [ ] Create social media accounts (Twitter, LinkedIn, Instagram)
- [ ] Prepare launch announcement
- [ ] Reach out to psychology communities
- [ ] Submit to directories (Psychology Today, etc.)
- [ ] Create explainer video
- [ ] Prepare press kit
- [ ] Create FAQ page

## Legal Protection

- [ ] Get professional liability insurance
- [ ] Consult with healthcare lawyer
- [ ] Review terms with legal expert
- [ ] Document data security measures
- [ ] Create incident response plan

---

## PRIORITY ORDER

If you only have limited time, do these in this order:

1. ✅ Security headers & rate limiting
2. ✅ Privacy Policy & Terms pages
3. ✅ Payment integration (Stripe)
4. ✅ Email system setup
5. ✅ End-to-end testing
6. ✅ Deploy to Vercel with production database
7. ✅ Set up monitoring (Sentry + UptimeRobot)
8. ✅ Test on mobile
9. ✅ Verify all environment variables
10. ✅ Launch! 🚀
