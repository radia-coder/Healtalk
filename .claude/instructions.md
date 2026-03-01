# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**HealTalk** is a modern mental health consultation platform built with Next.js 14+ (App Router), TypeScript, and Tailwind CSS. The application connects patients with licensed psychologists for video consultations. It's a static/client-side application using placeholder data from `src/lib/data.ts`.

## Development Commands

```bash
# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Project Structure

```
psyconnect/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── layout.tsx               # Root layout with Navbar/Footer
│   │   ├── page.tsx                 # Homepage (landing page)
│   │   ├── find-psychologists/      # Psychologist listing page
│   │   │   └── page.tsx            # Client component with filtering/search
│   │   └── psychologist/[id]/       # Dynamic psychologist profile pages
│   │       └── page.tsx
│   ├── components/
│   │   ├── ui/                      # shadcn/ui components (Button, Card, Input, Select)
│   │   ├── layout/                  # Navbar and Footer
│   │   ├── home/                    # Homepage sections (Hero, HowItWorks, Testimonials, etc.)
│   │   ├── psychologists/           # Search/filter components for listing page
│   │   └── profile/                 # Psychologist profile page components
│   └── lib/
│       ├── data.ts                  # Mock data (psychologists, testimonials, reviews, etc.)
│       └── utils.ts                 # Utility functions (cn for className merging)
```

## Architecture & Key Patterns

### Component Organization
- **Page components** (`src/app/`) are composed of smaller section components
- **Section components** (`src/components/home/`, `src/components/profile/`) contain UI logic for specific page sections
- **UI components** (`src/components/ui/`) are reusable shadcn/ui primitives

### Data Flow
- All data is currently static and imported from `src/lib/data.ts`
- No backend API or database - this is a frontend prototype
- Data includes: psychologists, testimonials, reviews, statistics, specializations, hospitals, cities

### Styling System
- **Tailwind CSS v4** with custom design tokens in `src/app/globals.css`
- Custom color palette:
  - Primary (Teal): `#4A90A4` - `--primary`
  - Secondary (Coral): `#FF9B85` - `--secondary`
  - Accent (Purple): `#B4A5D5` - `--accent`
  - Success (Green): `#81C784` - `--success`
- Use the `cn()` utility from `@/lib/utils` for conditional className merging
- shadcn/ui components configured with "new-york" style and CSS variables

### Client vs Server Components
- Most pages are **client components** (`"use client"`) due to interactive features (filters, sorting, search)
- Layout (`layout.tsx`) is a server component
- Follow Next.js App Router patterns for client/server boundaries

### TypeScript Configuration
- Path alias `@/*` maps to `src/*`
- Strict mode enabled
- All components should use TypeScript

### shadcn/ui Integration
- Configured via `components.json`
- Component aliases: `@/components/ui`, `@/lib/utils`
- Add new shadcn components with proper path resolution

## Design Principles

### Color & Theme
- Calming, trustworthy aesthetic for mental health platform
- Soft, rounded corners (8px cards, 6px buttons via `--radius: 0.5rem`)
- Subtle shadows, no harsh effects
- Generous white space in layouts
- Dark mode supported (defined in `globals.css`)

### Responsive Design
- Mobile-first approach
- Test breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Grid layouts should collapse gracefully on mobile

### Accessibility
- Target WCAG 2.1 AA compliance
- Use semantic HTML
- Ensure proper ARIA labels for interactive elements
- Maintain sufficient color contrast

## Key Features & Routes

1. **Homepage** (`/`) - Landing page with hero, how it works, featured psychologists, testimonials, statistics
2. **Find Psychologists** (`/find-psychologists`) - Filterable/sortable list with grid/list view toggle, pagination
3. **Psychologist Profile** (`/psychologist/[id]`) - Individual profile with booking widget, reviews, education, about sections

## Common Tasks

### Adding a New shadcn/ui Component
```bash
npx shadcn@latest add [component-name]
```
Components will be added to `src/components/ui/` with proper path aliases.

### Modifying Mock Data
Edit `src/lib/data.ts` to add/update psychologists, testimonials, or other data structures.

### Creating New Pages
1. Add a new directory under `src/app/` (e.g., `src/app/about/`)
2. Create `page.tsx` inside the directory
3. Use `"use client"` directive if the page needs interactivity
4. Import and compose section components

### Styling New Components
- Use Tailwind utility classes
- Reference design tokens from `globals.css` (e.g., `text-primary`, `bg-secondary`)
- Use `cn()` for conditional classes: `cn("base-classes", condition && "conditional-classes")`

## Tech Stack Summary

- **Framework**: Next.js 16.1.4 (App Router)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS v4 with PostCSS
- **UI Library**: shadcn/ui (Radix UI primitives)
- **Icons**: lucide-react
- **Animation**: framer-motion, tw-animate-css
- **Utilities**: clsx, tailwind-merge (via `cn()`)

## Important Notes

- This is a **prototype/demo application** - no backend, authentication, or real booking system
- All psychologist data, reviews, and testimonials are mock data
- Video consultation functionality is not implemented
- Payment processing is not implemented
- The `/psychologist/[id]` route uses static IDs (1-4) from mock data
