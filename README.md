# HealTalk - Mental Health Consultation Platform

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2015-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)](https://tailwindcss.com/)

A comprehensive mental health consultation platform connecting patients with licensed psychologists through secure video consultations and messaging.

## 🌟 Features

### For Patients

- 🔍 **Browse & Search** - Find psychologists by specialization, location, rating, and price
- 👤 **Detailed Profiles** - View psychologist credentials, reviews, and availability
- 📅 **Book Appointments** - Schedule video consultations with ease
- 💬 **Secure Messaging** - Chat with your psychologist
- 📈 **Progress Tracking** - Mood tracker and goal setting
- 💳 **Payment Management** - Secure payment processing and history

### For Psychologists

- 📊 **Professional Dashboard** - Track appointments, patients, and earnings
- 💰 **Earnings Analytics** - Revenue tracking and 6-month trends
- ⏰ **Availability Management** - Set your weekly schedule
- 💼 **Profile Customization** - Update credentials, bio, and pricing
- 👥 **Patient Management** - View patient history and notes

### For Administrators

- 🏢 **Platform Overview** - Monitor total users, appointments, and revenue
- ✅ **Psychologist Approval** - Review and approve new psychologist applications
- 🏥 **Hospital Management** - Add and manage partner hospitals
- 📈 **Analytics Dashboard** - Track platform performance and growth

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Animations**: Framer Motion

## 📦 Project Structure

```
psyconnect/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── (auth)/              # Authentication routes
│   │   │   ├── signup/
│   │   │   ├── login/
│   │   │   └── forgot-password/
│   │   ├── patient/dashboard/   # Patient dashboard (7 tabs)
│   │   ├── psychologist/dashboard/ # Psychologist dashboard
│   │   ├── admin/dashboard/     # Admin dashboard
│   │   ├── find-psychologists/  # Search page
│   │   ├── psychologist/[id]/   # Profile page
│   │   └── page.tsx             # Homepage
│   ├── components/
│   │   ├── layout/              # Navbar, Footer
│   │   ├── home/                # Homepage sections
│   │   ├── psychologists/       # Search & filter components
│   │   ├── profile/             # Profile page components
│   │   ├── dashboard/           # Dashboard layout
│   │   └── ui/                  # shadcn/ui components
│   └── lib/
│       ├── data.ts              # Placeholder data
│       └── utils.ts             # Utility functions
├── public/                      # Static assets
└── package.json
```

## 🛠️ Installation

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

1. **Clone the repository**

   ```bash
   cd /Users/maahir/Downloads/New/psyconnect
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run development server**

   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📱 Available Routes

### Public Routes

- `/` - Homepage
- `/find-psychologists` - Browse psychologists
- `/psychologist/[id]` - Psychologist profile
- `/signup` - Sign up (patient/psychologist)
- `/login` - Login
- `/forgot-password` - Password reset

### Patient Routes (Protected)

- `/patient/dashboard` - Dashboard home
- `/patient/dashboard/appointments` - Appointments
- `/patient/dashboard/messages` - Messages
- `/patient/dashboard/favorites` - Favorites
- `/patient/dashboard/progress` - Progress tracker
- `/patient/dashboard/payments` - Payments
- `/patient/dashboard/settings` - Settings

### Psychologist Routes (Protected)

- `/psychologist/dashboard` - Dashboard home
- `/psychologist/dashboard/earnings` - Earnings
- `/psychologist/dashboard/profile` - Profile settings

### Admin Routes (Protected)

- `/admin/dashboard` - Platform overview
- `/admin/dashboard/psychologists` - Psychologist management
- `/admin/dashboard/hospitals` - Hospital management

## 🎨 Design System

### Colors

- **Primary**: `#4A90A4` (Soft Teal) - Trust & Calm
- **Secondary**: `#FF9B85` (Warm Coral) - Care
- **Accent**: `#B4A5D5` (Gentle Purple) - Healing
- **Success**: `#81C784` (Soft Green) - Success

### Typography

- **Font**: Inter
- **Headings**: Bold (700)
- **Body**: Regular (400)

## 🔧 Scripts

```bash
# Development
npm run dev         # Start dev server at localhost:3000

# Production
npm run build       # Build for production
npm start          # Start production server

# Code Quality
npm run lint       # Run ESLint
```

## 📊 Project Status

**Completion: 100%** ✅

All 6 phases complete:

1. ✅ Homepage (7 sections)
2. ✅ Find Psychologists & Profiles
3. ✅ Authentication System
4. ✅ Patient Dashboard (7 tabs)
5. ✅ Psychologist Dashboard (3 pages)
6. ✅ Admin Dashboard (3 pages)

## 🚧 Next Steps for Production

To make this production-ready, you'll need to:

1. **Database Integration**
   - Set up PostgreSQL/MongoDB
   - Create database schemas
   - Connect ORM (Prisma/Drizzle)

2. **Authentication**
   - Implement NextAuth.js or Clerk
   - Add JWT tokens
   - Role-based access control

3. **Real-time Features**
   - Video consultations (WebRTC/Agora/Twilio)
   - Real-time messaging (Socket.io/Pusher)

4. **Payment Integration**
   - Stripe/PayPal integration
   - Payment gateway setup
   - Invoice generation

5. **Email Service**
   - Appointment confirmations
   - Password reset emails
   - Notification emails

6. **Deployment**
   - Deploy to Vercel/Netlify
   - Set up CI/CD
   - Environment variables
   - Domain configuration

## 📝 License

This project is a demonstration/educational project.

## 👥 Contributors

Built by the HealTalk team.

---

**Note**: This is currently a frontend demonstration with placeholder data. All data is stored in `/src/lib/data.ts` and needs to be connected to a real database for production use.
