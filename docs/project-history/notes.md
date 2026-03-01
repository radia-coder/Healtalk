# HealTalk — private, supportive therapy, on your schedule.

HealTalk is a Next.js App Router website for a calm, modern online therapy experience. It includes a public marketing site, onboarding flow, auth pages, psychologist listings and profiles, and role-based dashboards.

Design inspiration: fruitful.com patterns and sagehill.co hero/CTA style (from project request; verify in code).

---

## Screenshots / Demo (placeholders)

- `public/screenshots/hero.png` (add later)
- `public/screenshots/home-sections.png` (add later)
- `public/screenshots/find-psychologists.png` (add later)
- `public/screenshots/onboarding-step-1.png` (add later)
- `public/screenshots/dashboard-patient.png` (add later)

Video notes (from code):

- Home hero background uses two looping videos: `public/videos/Hero1.mp4` and `public/videos/Hero2.mp4` (`src/components/home/HeroSection.tsx`).
- CTA background uses looping video: `public/videos/CTA.mp4` (`src/components/home/CTASection.tsx`).

---

## Features (from the code)

- Home hero with two background videos that alternate on end (`Hero1.mp4` → `Hero2.mp4` → `Hero1.mp4`) and fade between them (`src/components/home/HeroSection.tsx`).
- Glass pill CTA button (“Get Connected”) and multiple CTA buttons reusing the same style (`src/components/home/HeroSection.tsx`, `src/components/home/CTASection.tsx`, `src/components/home/FeaturedPsychologists.tsx`, `src/components/home/PricingSection.tsx`).
- Accordion “Why Choose HealTalk” with image preview that changes by active item (`src/components/home/FeaturesAccordion.tsx`).
- Testimonial carousel with left/right pill navigation, Framer Motion transitions (`src/components/home/Testimonials.tsx`).
- Featured psychologist grid with hover effects and profile links (`src/components/home/FeaturedPsychologists.tsx`).
- Find Psychologists page with search, filters, sort, grid/list view toggle, and pagination (`src/app/(public)/find-psychologists/page.tsx`).
- Psychologist profile page with hero banner, about section, education/certifications, reviews, and booking widget (`src/app/(public)/psychologist/[id]/page.tsx`).
- Multi-step onboarding flow with “Choose up to 4” selection limit per step and animated “Next” button (`src/app/onboarding/(steps)/step-1/page.tsx` etc.).
- Final onboarding “Choose your therapist” grid with modal details and next/prev browsing (`src/app/onboarding/final/page.tsx`).
- Role-based dashboards (Patient, Psychologist, Admin) with protected routes via middleware (`src/components/dashboard/DashboardLayout.tsx`, `src/middleware.ts`).
- NextAuth authentication with Prisma adapter and credential + OAuth providers (`src/lib/auth.ts`).

---

## Tech Stack (versions from `package.json`)

- Framework: Next.js `16.1.4`
- UI: React `19.2.3`
- Language: TypeScript `^5`
- Styling: Tailwind CSS `^4` with `@tailwindcss/postcss` (`postcss.config.mjs`)
- UI primitives: Radix UI (`@radix-ui/react-*`)
- Component system: shadcn/ui config in `components.json` (New York style)
- Icons: `lucide-react` `^0.563.0`
- Animations: `framer-motion` `^12.29.0`, `motion` `^11.18.2`
- Auth: `next-auth` `^4.24.11`
- Database ORM: Prisma `^6.6.0`
- Testing: Jest `^30.2.0`, Testing Library, Playwright `^1.58.0` (no Playwright script yet)
- Utilities: `clsx`, `tailwind-merge`, `class-variance-authority`

---

## Project Structure

```
src/
  app/
    (public)/            # Public routes + layout (navbar + footer)
    (auth)/              # Auth routes (no navbar/footer)
    (dashboard)/         # Role-based dashboards
    onboarding/          # Onboarding steps + final page
    api/                 # Next.js route handlers
    globals.css          # Tailwind v4 + theme tokens
    layout.tsx           # Root layout + fonts + SessionProvider
  components/
    about/               # About page sections
    dashboard/           # Shared dashboard layout
    home/                # Home page sections
    layout/              # Navbar/Footer shell components
    onboarding/          # Onboarding UI components
    profile/             # Psychologist profile sections
    psychologists/       # Find psychologists UI
    ui/                  # Reusable UI primitives
  lib/
    auth.ts              # NextAuth config
    data.ts              # Mock data
    prisma.ts            # Prisma client
    utils.ts             # cn() helper
  providers/
    SessionProvider.tsx  # NextAuth provider wrapper
prisma/
  schema.prisma          # Data models
  migrations/            # DB migrations
  seed.ts                # Seed script
public/
  videos/                # Hero + CTA videos
  images/                # Logos, portraits, about slides
  fonts/                 # Local fonts (Lastik, Switzer)
```

---

## How It Works (high level)

- **Routing** uses the Next.js App Router under `src/app/`. Public pages live in `src/app/(public)`, auth pages in `src/app/(auth)`, onboarding in `src/app/onboarding`, and dashboards in `src/app/(dashboard)`.
- **Layouts**:
  - Public pages include the navbar and footer (`src/app/(public)/layout.tsx`).
  - Auth pages have a centered layout without the main navbar/footer (`src/app/(auth)/layout.tsx`).
  - Onboarding pages use a separate layout for spacing and progress UI (`src/app/onboarding/(steps)/layout.tsx`).
- **Data** on the public pages is mostly mocked in `src/lib/data.ts` and in local arrays inside page components.
- **Auth** uses NextAuth with Prisma adapter (`src/lib/auth.ts`), and dashboards are role-protected via middleware (`src/middleware.ts`).

---

## Routes / Pages Inventory (all pages found)

| Route | File | Status | What it does |
|---|---|---|---|
| `/` | `src/app/(public)/page.tsx` | USED | Home landing page with hero video and sections |
| `/about` | `src/app/(public)/about/page.tsx` | USED | About page with slideshow, logos, team, values |
| `/contact` | `src/app/(public)/contact/page.tsx` | USED | Contact info and CTAs |
| `/find-psychologists` | `src/app/(public)/find-psychologists/page.tsx` | USED | Search/filter/sort psychologist listings |
| `/privacy` | `src/app/(public)/privacy/page.tsx` | USED | Privacy policy page |
| `/terms` | `src/app/(public)/terms/page.tsx` | USED | Terms of service page |
| `/psychologist/[id]` | `src/app/(public)/psychologist/[id]/page.tsx` | USED | Psychologist profile details |
| `/login` | `src/app/(auth)/login/page.tsx` | USED | Sign in page |
| `/signup` | `src/app/(auth)/signup/page.tsx` | USED | Sign up page |
| `/forgot-password` | `src/app/(auth)/forgot-password/page.tsx` | USED | Request password reset link |
| `/reset-password` | `src/app/(auth)/reset-password/page.tsx` | USED (via email link) | Set a new password |
| `/onboarding/step-1` | `src/app/onboarding/(steps)/step-1/page.tsx` | USED | Onboarding step 1 |
| `/onboarding/step-2` | `src/app/onboarding/(steps)/step-2/page.tsx` | USED | Onboarding step 2 |
| `/onboarding/step-3` | `src/app/onboarding/(steps)/step-3/page.tsx` | USED | Onboarding step 3 |
| `/onboarding/step-4` | `src/app/onboarding/(steps)/step-4/page.tsx` | USED | Onboarding step 4 |
| `/onboarding/final` | `src/app/onboarding/final/page.tsx` | USED | Choose therapist + modal |
| `/patient/dashboard` | `src/app/(dashboard)/patient/dashboard/page.tsx` | USED | Patient dashboard home |
| `/patient/dashboard/appointments` | `src/app/(dashboard)/patient/dashboard/appointments/page.tsx` | USED | Patient appointments |
| `/patient/dashboard/messages` | `src/app/(dashboard)/patient/dashboard/messages/page.tsx` | USED | Patient messages |
| `/patient/dashboard/favorites` | `src/app/(dashboard)/patient/dashboard/favorites/page.tsx` | USED | Saved psychologists |
| `/patient/dashboard/progress` | `src/app/(dashboard)/patient/dashboard/progress/page.tsx` | USED | Mood + goals tracking |
| `/patient/dashboard/payments` | `src/app/(dashboard)/patient/dashboard/payments/page.tsx` | USED | Payment history + cards |
| `/patient/dashboard/settings` | `src/app/(dashboard)/patient/dashboard/settings/page.tsx` | USED | Patient settings |
| `/psychologist/dashboard` | `src/app/(dashboard)/psychologist/dashboard/page.tsx` | USED | Psychologist dashboard home |
| `/psychologist/dashboard/appointments` | `src/app/(dashboard)/psychologist/dashboard/appointments/page.tsx` | USED | Psychologist appointments |
| `/psychologist/dashboard/messages` | `src/app/(dashboard)/psychologist/dashboard/messages/page.tsx` | USED | Psychologist messages |
| `/psychologist/dashboard/patients` | `src/app/(dashboard)/psychologist/dashboard/patients/page.tsx` | USED | Patient list |
| `/psychologist/dashboard/earnings` | `src/app/(dashboard)/psychologist/dashboard/earnings/page.tsx` | USED | Earnings + analytics |
| `/psychologist/dashboard/profile` | `src/app/(dashboard)/psychologist/dashboard/profile/page.tsx` | USED | Profile + availability |
| `/admin/dashboard` | `src/app/(dashboard)/admin/dashboard/page.tsx` | USED | Admin overview |
| `/admin/dashboard/psychologists` | `src/app/(dashboard)/admin/dashboard/psychologists/page.tsx` | USED | Approvals + management |
| `/admin/dashboard/hospitals` | `src/app/(dashboard)/admin/dashboard/hospitals/page.tsx` | USED | Hospital management |

---

## API Endpoints (current)

- `POST /api/auth/register` → `src/app/api/auth/register/route.ts`
- `POST /api/auth/forgot-password` → `src/app/api/auth/forgot-password/route.ts`
- `POST /api/auth/reset-password` → `src/app/api/auth/reset-password/route.ts`
- `GET|POST /api/auth/[...nextauth]` → `src/app/api/auth/[...nextauth]/route.ts`
- `GET /api/psychologists` → `src/app/api/psychologists/route.ts` (not wired to UI yet)
- `GET|POST /api/appointments` → `src/app/api/appointments/route.ts` (not wired to UI yet)

---

## Used vs Unused (quick map)

### Used in the UI

- Navbar and footer layout: `src/components/layout/Navbar.tsx`, `src/components/layout/AppFooter.tsx`
- Home sections: `src/components/home/HeroSection.tsx`, `FeaturesAccordion.tsx`, `Testimonials.tsx`, `FeaturedPsychologists.tsx`, `WhyChoosePsyConnect.tsx`, `PricingSection.tsx`, `CTASection.tsx`
- About sections: `src/components/about/AboutSlideshow.tsx`, `WhoAreWeSection.tsx`, `CoreValuesSection.tsx`, `InfiniteLogoCarousel.tsx`
- Find psychologists UI: `src/components/psychologists/SearchBar.tsx`, `FilterSidebar.tsx`, `PsychologistCard.tsx`
- Profile sections: `src/components/profile/ProfileHero.tsx`, `AboutSection.tsx`, `EducationSection.tsx`, `ReviewsSection.tsx`, `BookingWidget.tsx`
- Onboarding UI: `src/components/onboarding/OnboardingHeader.tsx`, `SelectionCard.tsx`, `NextButton.tsx`, `GuideCard.tsx`, `GuideDetailModal.tsx`
- Dashboard layout: `src/components/dashboard/DashboardLayout.tsx`

### Unused / not referenced right now

- Home sections: `src/components/home/HowItWorks.tsx`, `Statistics.tsx`, `WhyChoose.tsx`
- About sections: `src/components/about/AboutHero.tsx`, `AboutStory.tsx`, `AboutLeaders.tsx`, `TrustedLogosCarousel.tsx`
- Layout section: `src/components/layout/CTASection.tsx`
- Other sections: `src/components/TrustedSection.tsx`
- UI components: `src/components/ui/footer-section.tsx`, `src/components/ui/minimal-footer.tsx`, `src/components/ui/language-switcher.tsx`, `src/components/ui/select.tsx`
- Assets not referenced in UI: `public/assets/hero-video.mp4`, `public/assets/video/hero-video.mp4`, `public/assets/hero-video-poster.jpg`, `public/images/logo.png`, `public/images/Muuse.png`, `public/flags/*`

---

## Sections + Cards Documentation (by page)

### Home (`/`)

- **Navbar** — `src/components/layout/Navbar.tsx` → `src/components/ui/simple-header.tsx`
  - Fixed bar, width `947px`, height `78px`.
  - Links: `/`, `/find-psychologists`, `/about`.
  - Auth actions: `/login`, `/onboarding/step-1`.
- **Hero** — `src/components/home/HeroSection.tsx`
  - Height `835px`, sequential videos (`/videos/Hero1.mp4`, `/videos/Hero2.mp4`).
  - Dark gradient overlay and subtle blur.
  - CTA pill button (height `53px`) linking to `/find-psychologists`.
- **Features Accordion** — `src/components/home/FeaturesAccordion.tsx`
  - Accordion list left, image preview right.
  - Uses default items with Unsplash images.
- **Testimonials** — `src/components/home/Testimonials.tsx`
  - Large card (`1209px` wide, min height `530px`).
  - Overlay navigation pill with left/right arrows.
- **Featured Psychologists** — `src/components/home/FeaturedPsychologists.tsx`
  - 4-card grid, grayscale images on hover.
  - Links to `/psychologist/[id]`.
- **Why Choose HealTalk** — `src/components/home/WhyChoosePsyConnect.tsx`
  - 4 cards with hard-coded pastel colors (e.g., `#ffc7f2`, `#c4eab2`).
- **Pricing** — `src/components/home/PricingSection.tsx` → `src/components/ui/pricing-cards.tsx`
  - Two tiers: `SELF` and `ONGOING` with CTA to `/signup`.
- **CTA Video Footer** — `src/components/home/CTASection.tsx`
  - Full screen-ish CTA (`h-[834px]`) with `/videos/CTA.mp4`.
- **Footer** — `src/components/layout/Footer.tsx`
  - Links to `/about`, `/find-psychologists`, `/contact`, `/privacy`, `/terms`, `/login`, `/signup`.

### About (`/about`)

- **Hero Title** — `src/app/(public)/about/page.tsx`
  - Large logo-style title using `Lastik` font.
- **Hero Slideshow** — `src/components/about/AboutSlideshow.tsx`
  - 4 slides with progress bars and timed transitions.
- **Infinite Logo Carousel** — `src/components/InfiniteLogoCarousel.tsx`
  - Drag to scroll with inertia.
- **Story + Video** — `src/app/(public)/about/page.tsx`
  - Centered paragraph and a large video card (remote video source).
- **Leaders Grid** — `src/app/(public)/about/page.tsx`
  - Hover/active expands card bottom panel with role.
- **Who Are We** — `src/components/about/WhoAreWeSection.tsx`
  - Illustration + stats cards.
- **Core Values** — `src/components/about/CoreValuesSection.tsx`
  - Horizontal scroll of large value cards.

### Find Psychologists (`/find-psychologists`)

- **Search bar** — `src/components/psychologists/SearchBar.tsx`
- **Filter sidebar** — `src/components/psychologists/FilterSidebar.tsx`
  - Location, specialization, rating, availability, hospital, price range, languages.
- **Cards** — `src/components/psychologists/PsychologistCard.tsx`
  - Rating, tags, hospital, languages, next available, price.
- **View toggle** — grid/list modes.
- **Pagination** — controlled locally.

### Psychologist Profile (`/psychologist/[id]`)

- **Profile Hero** — `src/components/profile/ProfileHero.tsx`
- **About + Specializations** — `src/components/profile/AboutSection.tsx`
- **Education + Certifications** — `src/components/profile/EducationSection.tsx`
- **Reviews** — `src/components/profile/ReviewsSection.tsx`
  - Rating breakdown bars and helpful buttons.
- **Booking Widget** — `src/components/profile/BookingWidget.tsx`
  - Date placeholder, time slots, duration, session type, price.

### Contact / Privacy / Terms

- **Single-column content pages**:
  - `src/app/(public)/contact/page.tsx`
  - `src/app/(public)/privacy/page.tsx`
  - `src/app/(public)/terms/page.tsx`

### Onboarding (`/onboarding/step-1` → `/onboarding/final`)

- **Header with progress** — `src/components/onboarding/OnboardingHeader.tsx`
  - Track color `#c7c7ff`, fill `#9393ff`.
- **Selection cards** — `src/components/onboarding/SelectionCard.tsx`
  - Multi-select, max 4, strong selected state.
- **Animated Next button** — `src/components/onboarding/NextButton.tsx`
- **Final therapist grid** — `src/components/onboarding/GuideCard.tsx`
- **Modal** — `src/components/onboarding/GuideDetailModal.tsx`
  - Body scroll locked when open; prev/next arrows.

### Auth Pages

- **Login** — `src/app/(auth)/login/page.tsx`
  - Large centered card (`800px x 696px`), focus border becomes black.
- **Signup** — `src/app/(auth)/signup/page.tsx`
  - Similar layout, creates account via API.
- **Forgot Password** — `src/app/(auth)/forgot-password/page.tsx`
  - Sends reset link via API.
- **Reset Password** — `src/app/(auth)/reset-password/page.tsx`
  - Validates token from URL query.

### Dashboards (all roles)

Shared layout:

- **Dashboard layout + sidebar** — `src/components/dashboard/DashboardLayout.tsx`
  - Sidebar navigation changes by role.
  - Mobile menu with open/close.

Patient:

- Home, appointments, messages, favorites, progress, payments, settings (`src/app/(dashboard)/patient/dashboard/*`).

Psychologist:

- Home, appointments, messages, patients, earnings, profile (`src/app/(dashboard)/psychologist/dashboard/*`).

Admin:

- Home, psychologists approval, hospitals management (`src/app/(dashboard)/admin/dashboard/*`).

### Dev/Test


---

## Key UI/UX Behavior Notes

- Hero videos alternate on `onEnded` with fade transitions (`src/components/home/HeroSection.tsx`).
- CTA video loops (`src/components/home/CTASection.tsx`).
- Features accordion changes the right-side image based on the active item (`src/components/home/FeaturesAccordion.tsx`).
- Testimonials card transitions use Framer Motion (`src/components/home/Testimonials.tsx`).
- Infinite logo carousel supports drag + inertia (`src/components/InfiniteLogoCarousel.tsx`).
- Onboarding limits selections to 4 and shows a sticky “Next” button only when at least one choice is selected (`src/app/onboarding/(steps)/step-1/page.tsx` etc).
- Onboarding progress bar fill is controlled by a numeric `progress` prop (`src/components/onboarding/OnboardingHeader.tsx`).
- Guide modal prevents body scrolling while open and supports prev/next (`src/components/onboarding/GuideDetailModal.tsx`).
- Auth inputs use custom focus border changes (black) (`src/app/(auth)/login/page.tsx`, `src/app/(auth)/signup/page.tsx`).
- Role-based route protection happens in middleware (`src/middleware.ts`).

---

## Setup / Install / Run (step-by-step)

### 1) Prerequisites

- Node version is **not specified** in the repo (verify in `package.json`).
- A PostgreSQL database is expected (see `prisma/schema.prisma`).

### 2) Install

```bash
npm install
```

### 3) Environment variables

Copy `.env.example` to `.env` and fill values.

Required keys (from `.env.example`):

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

Optional keys:

- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`
- `EMAIL_SERVER`, `EMAIL_FROM`
- `AGORA_APP_ID`, `AGORA_APP_CERTIFICATE`
- `STRIPE_PUBLIC_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

### 4) Database (Prisma)

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 5) Run the app

```bash
npm run dev
```

Open `http://localhost:3000`.

### 6) Build and start

```bash
npm run build
npm start
```

---

## How Auth Works (from code)

- **Auth engine**: NextAuth with Prisma adapter (`src/lib/auth.ts`).
- **Providers**:
  - Credentials (email + password).
  - Google and Facebook OAuth (env-based).
- **Storage**: Users are stored in Postgres via Prisma (`prisma/schema.prisma`).
- **Session**: JWT strategy; role is added to token and session.
- **Registration**: `POST /api/auth/register` creates users and hashes passwords (`src/app/api/auth/register/route.ts`).
- **Forgot Password**:
  - Creates a `VerificationToken` and logs a reset link to the server console (mock email) (`src/app/api/auth/forgot-password/route.ts`).
- **Reset Password**:
  - Validates token, hashes new password, and deletes the token (`src/app/api/auth/reset-password/route.ts`).
- **Role gating**:
  - Middleware blocks dashboard routes if role is wrong (`src/middleware.ts`).

---

## Testing / Linting / Formatting

Scripts in `package.json`:

- `npm run lint`
- `npm run test`
- `npm run test:watch`
- `npm run test:coverage`

Notes:

- Playwright is installed but no script is defined (verify in `package.json`).
- No formatting script found. Consider adding Prettier (see Roadmap).

---

## Accessibility + Performance + SEO (quick audit)

### Accessibility (from code)

- Many buttons include text and `aria-label` (good).
- Some clickable cards are `div`/`button` combos; check keyboard focus and `aria` coverage (verify in `src/app/(public)/about/page.tsx` and `src/components/onboarding/GuideCard.tsx`).
- Videos have no captions (expected for background video, but add `aria-hidden` and fallbacks).

### Performance (from code)

- Home page lazy-loads below-the-fold sections (`src/app/(public)/page.tsx`).
- Large video backgrounds are used in hero and CTA. Consider:
  - `poster` images.
  - `preload="metadata"` for videos.
- Many images use `<img>` instead of `next/image` (see `src/components/home/FeaturedPsychologists.tsx`, `src/components/home/FeaturesAccordion.tsx`).

### SEO (from code)

- Metadata exists in `src/app/layout.tsx` and some pages (`/login`, `/about`, `/find-psychologists`, etc).
- Many dashboard pages have no metadata (not critical but easy to add).

---

## Deployment

Typical Next.js deploy steps (Vercel/Netlify):

1. Set env vars from `.env.example` in your hosting provider.
2. Build command: `npm run build`
3. Start command: `npm start`

Notes:

- Video files in `public/videos` are large; consider compression and caching.
- Make sure the database is reachable from the deployment environment.

---

## Improvement Roadmap (actionable)

### P0 — Must Fix

1) **Broken admin sidebar links**  
   - **What**: Sidebar lists routes that do not exist (`/admin/dashboard/patients`, `/admin/dashboard/reports`, `/admin/dashboard/settings`).  
   - **Where**: `src/components/dashboard/DashboardLayout.tsx` (admin nav config).  
   - **Why**: These links will 404.

2) **Case-sensitive image path mismatch**  
   - **What**: About page uses `/images/ciro.png` and `/images/koonfur.png` but files are `public/images/Ciro.png` and `public/images/Koonfur.png`.  
   - **Where**: `src/app/(public)/about/page.tsx` and `public/images/*`.  
   - **Why**: Breaks in Linux/production file systems.

3) **Missing image files referenced in data**  
   - **What**: `src/lib/data.ts` references `/images/doctor-1.jpg`, `/images/patient-1.jpg`, etc. These files are not in `public/images` (verify in `public/images`).  
   - **Where**: `src/lib/data.ts`.  
   - **Why**: Broken images when those fields are used.

### P1 — Should Do

1) **Wire UI to API**  
   - **What**: Use real API data for psychologists and appointments.  
   - **Where**: `src/app/(public)/find-psychologists/page.tsx`, `src/app/(dashboard)/patient/dashboard/appointments/page.tsx`, `src/app/api/psychologists/route.ts`.  
   - **Why**: Current UI uses mock arrays.

2) **Persist onboarding selections**  
   - **What**: Store onboarding answers in DB or local storage.  
   - **Where**: `src/app/onboarding/(steps)/step-*.tsx`.  
   - **Why**: Currently selections are lost on refresh.

3) **Email sending for password reset**  
   - **What**: Replace console log with real email sending.  
   - **Where**: `src/app/api/auth/forgot-password/route.ts`.  
   - **Why**: Users will not receive real reset emails.

### P2 — Nice to Have

1) **Add formatting and lint fixes**
   - **Where**: add Prettier config and script in `package.json`.
   - **Why**: Consistent code style.

2) **Add tests for key pages**
   - **Where**: `src/components/*` and `src/app/*`.
   - **Why**: Prevent regressions.

3) **Add Open Graph / social metadata**
   - **Where**: `src/app/layout.tsx` or per-route `metadata`.
   - **Why**: Better sharing previews.

---

## Known Issues

- **Admin links to missing routes**: `/admin/dashboard/patients`, `/admin/dashboard/reports`, `/admin/dashboard/settings` are referenced but no pages exist (`src/components/dashboard/DashboardLayout.tsx`).
- **Case-sensitive image paths**: `/images/ciro.png` and `/images/koonfur.png` do not match file names in `public/images/`.
- **Mock data used widely**: Many dashboards and listing pages use in-file arrays and `src/lib/data.ts`.
- **Unused components/assets**: Several components and assets are not used (see “Used vs Unused” section).

---

## Appendix: Design Tokens (from `src/app/globals.css`)

- Primary colors (examples):
  - `--primary: #FC7D45`
  - `--foreground: #131E0D`
  - `--background: #F5F1E8`
- Fonts:
  - `Lastik` (logo font) — `public/fonts/Lastik-Regular.ttf`
  - `Switzer` (heading) — `public/fonts/Switzer-*.otf`
  - `Figtree` (Google font) — `src/app/layout.tsx`
  - `Inter` is referenced in CSS but not imported (verify in `src/app/globals.css`)
