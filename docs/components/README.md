# Components — HealTalk

This folder documents the major UI components built for HealTalk. All components are in `src/components/` and use shadcn/ui as the base library with Tailwind CSS v4.

## Component Groups

### Layout (`src/components/layout/`)
- `Navbar` — sticky top nav, transparent on hero scroll, solid white after scroll
- `Footer` — 4-column dark footer with links and social icons

### Home (`src/components/home/`)
- Hero section with background video, headline, CTA buttons
- Features section (what HealTalk offers)
- How It Works steps
- Psychologist spotlight carousel
- Testimonials infinite carousel
- FAQ accordion

### Psychologists (`src/components/psychologists/`)
- Search and filter bar (specialization, price, language, rating)
- Psychologist card grid
- Profile page sections (bio, credentials, availability, reviews)

### Dashboard (`src/components/dashboard/`)
- Shared dashboard layout with sidebar nav
- Patient tabs: Overview, Appointments, Mood Tracker, Progress, Messages, Sessions, Settings
- Psychologist tabs: Overview, Appointments, Patients, Earnings, Availability, Messages, Profile
- Admin tabs: Overview, Psychologist Approvals, Hospitals, Analytics

### Auth (`src/components/auth/`)
- Login form, Signup form (with role selection: patient or psychologist)
- Forgot password and reset password forms
- Email verification notice

### Video (`src/components/video/`)
- Agora RTC video call room
- Camera/mic toggle controls
- Session timer, end call button

### Chatbot (`src/components/chatbot/`)
- Floating chatbot widget
- Chat history display
- AI-powered mental health support chat (Gemini / Groq)

### Onboarding (`src/components/onboarding/`)
- Multi-step onboarding for new psychologists
- Upload credentials, set availability, set rates

### UI (`src/components/ui/`)
- All shadcn/ui primitives: Button, Card, Dialog, Input, Select, Tabs, Badge, etc.

## Specific Component Docs

- `carousel.md` — Specs for the psychologist spotlight carousel
- `infinite-carousel.md` — Testimonials infinite auto-scroll carousel
- `accordion.md` — FAQ accordion integration
- `draggable.md` — Draggable component (profile image positioning)
- `hydration-fix.md` — How we fixed React hydration errors
- `performance-fixes.md` — Performance optimizations applied
