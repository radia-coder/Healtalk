# Testing Guide - Group Sessions & AI Screening

## 🚀 Quick Start

### 1. Environment Setup

Add to your `.env` file:
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

Get your OpenAI API key from: https://platform.openai.com/api-keys

### 2. Test Accounts

**Psychologist:**
- Email: `ahmet@example.com`
- Password: `password123`

**Patient:**
- Email: `john@example.com`
- Password: `password123`

### 3. Seed Data

Test data has been created:
- ✅ 3 group therapy sessions
- ✅ Patient registered for 1 session
- ✅ 2 screening assessments (7 days and 30 days ago)

---

## 📋 Feature Testing Checklist

### Group Therapy Sessions

#### As Psychologist:

1. **View Sessions Dashboard**
   - Navigate to `/psychologist/dashboard/sessions` (or click "Sessions" in sidebar)
   - You should see 3 upcoming sessions created by seed data

2. **Create New Session**
   - Click "Create Session" button
   - Fill in the form:
     - Title: "Stress Management Workshop"
     - Description: "Learn practical stress reduction techniques"
     - Type: Group
     - Max Participants: 5
     - Date: Tomorrow
     - Time: 2:00 PM
     - Duration: 60 minutes
     - Price: $45.00
   - Submit and verify it appears in the list

3. **Manage Session**
   - View participant count on session cards
   - See available spots remaining

#### As Patient:

1. **Discover Sessions**
   - Navigate to `/patient/dashboard/sessions` (or click "Sessions" in sidebar)
   - You should see all available sessions

2. **Filter & Search**
   - Use search bar to find "Anxiety"
   - Filter by session type (Group/One-on-One)
   - Sort by date, price, or available spots

3. **Join Session**
   - Click "Join Session" on any available session
   - Should see success message
   - Session should show updated participant count

4. **View Registered Sessions**
   - You should already be registered for "Anxiety Support Group" (from seed data)
   - Try joining it again - should show error "Already registered"

5. **Cancel Registration**
   - For sessions >24 hours away, you can cancel
   - For sessions <24 hours away, cancellation is blocked

6. **Join Video Call**
   - Click on a registered session
   - Click "Join Call" button when session time arrives
   - Navigate to `/shared/call/session/[sessionId]`
   - Should see video call interface with:
     - Your video feed
     - Audio/video toggle buttons
     - Screen share (host only)
     - Participant counter
     - Leave button

#### Multi-User Video Testing:

1. Open two browser windows (use incognito for second)
2. Log in as psychologist in first window
3. Log in as patient in second window
4. Both join the same session video call
5. Verify:
   - Both users can see each other
   - Audio/video controls work
   - Psychologist can screen share
   - Participant count updates
   - Grid layout adjusts (2x2 for 4 people, 3x3 for 9)

---

### AI Mental Health Screening

#### As Patient:

1. **Access Screening Dashboard**
   - Navigate to `/patient/dashboard/screening` (or click "Screening" in sidebar)
   - Should see 2 past assessments from seed data

2. **Start New Assessment**
   - Click "Start Assessment" or "Take New Assessment"
   - Should see chat interface with AI greeting

3. **Complete Assessment**
   - Answer 8-10 questions from the AI
   - Questions should cover:
     - Current mood
     - Sleep patterns
     - Anxiety levels
     - Relationships
     - Stress levels
     - Past trauma
     - Substance use
     - Self-harm thoughts
   - Progress bar should update (0% → 100%)

4. **Crisis Detection Test**
   - Start a new assessment
   - When asked, respond with: "I've been thinking about hurting myself"
   - Should immediately see:
     - Red crisis banner
     - National Suicide Prevention Lifeline: 988
     - Crisis Text Line
     - Emergency: 911

5. **View Results**
   - After 10 questions, assessment completes
   - Should see:
     - Risk level badge (LOW/MEDIUM/HIGH/CRISIS)
     - AI-generated summary
     - Recommended next steps
     - Action buttons (Find Therapist, Go to Dashboard)

6. **Review Past Assessments**
   - Return to screening dashboard
   - Should see list of all completed assessments
   - Each shows date, summary, and risk level
   - Seed data includes:
     - MEDIUM risk assessment from 7 days ago
     - LOW risk assessment from 30 days ago

---

## 🐛 Common Issues & Solutions

### Issue: "Failed to get Agora token"
**Solution:** Check that AGORA_APP_ID and AGORA_APP_CERTIFICATE are set in .env

### Issue: "OpenAI API key is invalid"
**Solution:**
1. Verify OPENAI_API_KEY in .env
2. Check key is active at https://platform.openai.com/api-keys
3. Ensure you have API credits available

### Issue: "Session not found"
**Solution:** Run seed script again: `npm run db:seed-sessions`

### Issue: Video call not connecting
**Solution:**
1. Check browser permissions for camera/microphone
2. Try a different browser (Chrome recommended)
3. Check Agora quota at https://console.agora.io

### Issue: Navigation links not showing
**Solution:** Clear browser cache and refresh

---

## 📊 Database Inspection

### View Sessions:
```bash
npm run db:studio
```
Then navigate to:
- `TherapySession` table
- `SessionParticipant` table
- `ScreeningAssessment` table

### Check Data via Prisma:
```typescript
// In Node.js console or script
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// List all sessions
await prisma.therapySession.findMany();

// List all assessments
await prisma.screeningAssessment.findMany();
```

---

## 🎯 Success Criteria

### Group Sessions:
- ✅ Psychologist can create sessions with 2-10 participants
- ✅ Patients can discover and filter sessions
- ✅ Patients can join available sessions
- ✅ Video call supports 3+ users simultaneously
- ✅ Grid layout adapts to participant count
- ✅ Host has screen share capability
- ✅ Audio/video controls work for all participants

### AI Screening:
- ✅ Chatbot asks 8-10 relevant questions
- ✅ Responses stream in real-time
- ✅ Crisis keywords trigger emergency resources
- ✅ Assessment saves with correct risk level
- ✅ Results display with recommendations
- ✅ Past assessments viewable in dashboard

---

## 📝 Notes

- Sessions created by seed data are scheduled for tomorrow, next week, and 2 weeks from now
- Patient is pre-registered for "Anxiety Support Group"
- Screening assessments from seed data show historical progress
- All test data can be cleared by resetting the database: `npx prisma migrate reset`

---

## 🆘 Support

If you encounter issues:
1. Check console logs (F12 → Console)
2. Check server logs (terminal running `npm run dev`)
3. Verify all environment variables are set
4. Ensure database migrations are up to date: `npx prisma migrate dev`
5. Regenerate Prisma client: `npm run db:generate`

---

**Happy Testing! 🎉**
