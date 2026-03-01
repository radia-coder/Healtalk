# Design — HealTalk

This folder covers the visual design system for HealTalk.

## Color Palette

| Name        | Hex       | Use                          |
|-------------|-----------|------------------------------|
| Primary     | `#4A90A4` | Soft teal — trust and calm   |
| Secondary   | `#FF9B85` | Warm coral — care and warmth |
| Accent      | `#B4A5D5` | Gentle purple — healing      |
| Background  | `#F8F9FA` | Off-white page background    |
| Success     | `#81C784` | Soft green for confirmations |
| Text Primary| `#2C3E50` | Dark slate                   |
| Text Secondary| `#7F8C8D`| Gray subtitles               |
| Border      | `#E8EAED` | Light gray borders           |
| Footer BG   | `#2C3E50` | Dark footer background       |

## Typography

- **Headings**: Inter or Poppins — bold, professional
- **Body**: Inter or Open Sans — readable, friendly
- **Font scale**: 14px (small labels) → 56px (hero headline)

## Design Principles

- Clean, spacious layouts with generous white space
- Soft rounded corners: `8px` for cards, `6px` for buttons
- Subtle shadows — no harsh drop shadows
- Smooth transitions: `300ms ease-in-out`
- Glassmorphism effects where appropriate
- Mobile-first responsive design
- Accessibility: WCAG 2.1 AA compliant

## Page Layout Specs

### Navbar (Sticky)
- Height: 80px
- Transparent on hero, solid white with shadow on scroll
- Mobile: hamburger menu on the right
- Buttons: Ghost-style Login, solid teal Get Started

### Hero Section
- Full viewport height
- Looping muted background video
- Gradient overlay: `rgba(44, 62, 80, 0.7)` → `rgba(74, 144, 164, 0.5)`
- Headline: 56px bold white
- Two CTA buttons below headline

### Footer
- 4-column layout: About, Quick Links, For Professionals, Contact
- Dark background `#2C3E50`, white text at 0.8 opacity
- 60px top/bottom padding

## Component Style Guide

- Cards: `rounded-lg shadow-sm border border-[#E8EAED] bg-white`
- Primary button: `bg-[#4A90A4] text-white rounded-md px-6 py-2`
- Ghost button: `border border-[#4A90A4] text-[#4A90A4] rounded-md px-6 py-2`
- Input fields: `border border-[#E8EAED] rounded-md focus:ring-[#4A90A4]`
