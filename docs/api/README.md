# API Routes — HealTalk

This folder documents every API endpoint in the HealTalk platform. HealTalk uses Next.js App Router API routes located in `src/app/api/`.

## API Groups

### Authentication (`/api/auth`)
- Register new users (patient or psychologist)
- Login with email/password or OAuth (Google)
- Forgot password, reset password, email verification
- NextAuth session handling

### Appointments (`/api/appointments`)
- Create, read, update, cancel appointments
- Appointment status: pending → confirmed → completed / cancelled
- Patient books with psychologist, psychologist confirms

### Sessions / Video (`/api/sessions`, `/api/agora`)
- Agora RTC token generation for video calls
- Start and end session records
- Session notes and summaries

### Psychologists (`/api/psychologists`, `/api/psychologist`)
- List and filter psychologists (specialization, price, rating, location)
- Get single psychologist profile
- Psychologist applies for approval, admin approves

### Messages (`/api/messages`)
- Send and receive messages between patient and psychologist
- Conversation threads, read receipts
- Real-time via polling or WebSocket

### User (`/api/user`)
- Get and update user profile
- Upload profile picture (UploadThing)
- Change password

### Admin (`/api/admin`)
- Approve/reject psychologist applications
- Platform stats: total users, appointments, revenue
- Manage hospitals

### AI Chatbot (`/api/chatbot`)
- Mental health chatbot powered by Google Gemini (or fallback to Groq/OpenRouter)
- Provides supportive responses, not medical advice

### Notifications (`/api/notifications`)
- In-app notifications for appointment updates, messages
- Cron job for appointment reminder emails (`/api/cron/send-reminders`)

### Progress (`/api/progress`)
- Mood tracking data (patient logs daily mood)
- Goal setting and progress records

### Screening (`/api/screening`)
- Mental health screening questionnaires (PHQ-9, GAD-7)
- Results stored per patient

### Uploads (`/api/uploads`, `/api/uploadthing`)
- File uploads via UploadThing
- Profile images, psychologist certificates

## Environment Variables Needed

```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
AGORA_APP_ID=
AGORA_APP_CERTIFICATE=
GEMINI_API_KEY=
RESEND_API_KEY=
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=
```
