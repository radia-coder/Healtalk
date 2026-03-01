# Features — HealTalk

This folder documents all major features implemented in HealTalk, their integration points, and current status.

## Core Features

### User Roles
Three distinct roles with separate dashboards:
- **Patient** — books appointments, tracks mood, messages psychologist
- **Psychologist** — manages schedule, confirms appointments, views earnings
- **Admin** — approves psychologists, manages hospitals, views platform analytics

### Authentication
- Email/password signup with email verification
- Google OAuth login
- Forgot password with reset email
- Protected routes per role (middleware)

### Find a Psychologist
- Search by name, specialization, language, price range
- Filter and sort results
- View detailed profiles with credentials, reviews, availability

### Video Consultations
- Agora RTC for real-time video calls
- Camera and microphone controls
- Session timer, end call, session notes

### Secure Messaging
- Real-time-like chat between patient and psychologist
- Conversation history, read status

### Appointment Booking
- Patient selects date and time slot from psychologist's availability
- Psychologist confirms or cancels
- Both parties get email notifications

### Mood Tracker
- Patient logs daily mood (1–10 scale) with optional notes
- Chart shows mood history over time

### Progress Goals
- Patient sets personal goals with target dates
- Mark goals as complete, track progress

### Mental Health Screening
- PHQ-9 (depression) and GAD-7 (anxiety) questionnaires
- Results stored, can be shared with psychologist

### AI Chatbot
- Floating chatbot on all pages
- Powered by Google Gemini
- Mental health support — not medical advice

### Notifications
- In-app: appointment updates, new messages, approvals
- Email: via Resend (see `email/` docs)

### Psychologist Onboarding
- Multi-step form: upload credentials, set specializations, set schedule and rate
- Admin reviews and approves before psychologist can accept patients

### Admin Panel
- Approve/reject psychologist applications
- Add/remove hospitals
- View platform-wide stats: total users, revenue, appointments

## Files in This Folder

- `README.md` — This file (features overview)
- `implementation-complete.md` — What was fully implemented
- `implementation-summary.md` — Summary of implementation phases
- `integration-summary.md` — How all features connect to each other
