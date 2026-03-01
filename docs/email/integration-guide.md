# Email Integration Guide

## ✅ What's Been Set Up

You now have a professional email system with:
- ✉️ **Beautiful HTML email templates** with your brand colors
- 📧 **10+ pre-built email types** (welcome, appointment reminders, etc.)
- 🔄 **Automated cron job** for appointment reminders
- 🎨 **Consistent branding** across all emails

## 📁 New Files Created

```
src/lib/email/
├── resend.ts          # Resend client & helper functions
├── templates.ts       # All email HTML templates
└── service.ts         # Easy-to-use EmailService class

src/app/api/cron/
└── send-reminders/
    └── route.ts       # Automated appointment reminders
```

## 🔗 How to Use in Your Code

### 1. Replace Welcome Emails

**Current code** in `src/app/api/auth/register/route.ts` (lines 170-184):

```typescript
// ❌ OLD - Basic email
await sendEmail({
  to: email,
  subject: "Verify your HealTalk email",
  text: `Welcome to HealTalk! Verify your email: ${verifyUrl}`,
  html: `
    <p>Welcome to HealTalk!</p>
    <p>Please verify your email to activate your account:</p>
    <p><a href="${verifyUrl}">Verify my email</a></p>
  `,
});
```

**Replace with:**

```typescript
// ✅ NEW - Professional branded email
import { EmailService } from '@/lib/email/service';

// After user creation, send welcome email based on role
if (role === 'PATIENT') {
  await EmailService.sendWelcomePatient(email, fullName);
} else if (role === 'PSYCHOLOGIST') {
  await EmailService.sendWelcomePsychologist(email, fullName);
}

// Then send verification email separately
await sendEmail({
  to: email,
  subject: "Verify your HealTalk email",
  html: `...verification email...`
});
```

### 2. Send Appointment Confirmation

When an appointment is booked, add this to your appointment creation API:

```typescript
// In src/app/api/appointments/route.ts (or wherever appointments are created)
import { EmailService, formatEmailDate, formatEmailTime, formatEmailPrice } from '@/lib/email/service';

// After creating appointment
const appointment = await prisma.appointment.create({
  data: { /* appointment data */ },
  include: {
    patient: { include: { user: true } },
    psychologist: { include: { user: true } },
  },
});

// Send confirmation email
await EmailService.sendAppointmentConfirmation(
  appointment.patient.user.email,
  {
    patientName: appointment.patient.user.name,
    psychologistName: appointment.psychologist.user.name,
    date: formatEmailDate(appointment.startTime),
    time: formatEmailTime(appointment.startTime),
    duration: appointment.duration,
    price: formatEmailPrice(appointment.price),
    appointmentId: appointment.id,
  }
);
```

### 3. Send Psychologist Approval/Rejection

When admin approves/rejects a psychologist:

```typescript
// In admin approval API
import { EmailService } from '@/lib/email/service';

// When approving
const psychologist = await prisma.psychologist.update({
  where: { id: psychologistId },
  data: {
    status: 'APPROVED',
    approvedAt: new Date(),
  },
  include: { user: true },
});

await EmailService.sendPsychologistApproved(
  psychologist.user.email,
  psychologist.user.name
);

// When rejecting
const psychologist = await prisma.psychologist.update({
  where: { id: psychologistId },
  data: {
    status: 'REJECTED',
    rejectedAt: new Date(),
    rejectionReason: reason,
  },
  include: { user: true },
});

await EmailService.sendPsychologistRejected(
  psychologist.user.email,
  psychologist.user.name,
  reason
);
```

### 4. Send Password Reset Email

In your password reset API:

```typescript
import { EmailService } from '@/lib/email/service';

const resetToken = createToken('reset-password');
// ... save token to database ...

await EmailService.sendPasswordReset(
  user.email,
  user.name,
  resetToken
);
```

### 5. Send Cancellation Email

When appointment is cancelled:

```typescript
import { EmailService, formatEmailDate, formatEmailTime, formatEmailPrice } from '@/lib/email/service';

// Calculate refund based on cancellation policy
const refundAmount = calculateRefund(appointment);

// Send to patient
await EmailService.sendAppointmentCancelled(
  appointment.patient.user.email,
  {
    recipientName: appointment.patient.user.name,
    psychologistName: appointment.psychologist.user.name,
    date: formatEmailDate(appointment.startTime),
    time: formatEmailTime(appointment.startTime),
    cancelledBy: 'patient', // or 'psychologist'
    refundAmount: refundAmount ? formatEmailPrice(refundAmount) : undefined,
  }
);

// Optionally send to psychologist too
await EmailService.sendAppointmentCancelled(
  appointment.psychologist.user.email,
  {
    recipientName: appointment.psychologist.user.name,
    psychologistName: appointment.psychologist.user.name,
    date: formatEmailDate(appointment.startTime),
    time: formatEmailTime(appointment.startTime),
    cancelledBy: 'patient',
    // No refund amount for psychologist
  }
);
```

### 6. Send New Message Notification

When a message is sent:

```typescript
import { EmailService } from '@/lib/email/service';

const message = await prisma.message.create({
  data: { /* message data */ },
  include: {
    patient: { include: { user: true } },
    psychologist: { include: { user: true } },
  },
});

// Determine recipient
const isPatientSender = message.senderId === message.patient.userId;
const recipient = isPatientSender ? message.psychologist.user : message.patient.user;
const sender = isPatientSender ? message.patient.user : message.psychologist.user;

// Send notification
await EmailService.sendNewMessage(
  recipient.email,
  {
    recipientName: recipient.name,
    senderName: sender.name,
    messagePreview: message.content,
    conversationId: `${message.patientId}-${message.psychologistId}`,
  }
);
```

## 🤖 Automated Appointment Reminders

The cron job at `/api/cron/send-reminders` automatically sends:
- **24-hour reminder**: 24 hours before appointment
- **1-hour reminder**: 1 hour before appointment

### Setting Up the Cron Job

#### Option 1: Google Cloud VM (Manual Cron)

```bash
# On your server, create the cron job
crontab -e

# Add this line to run every hour:
0 * * * * curl -X GET -H "Authorization: Bearer YOUR_CRON_SECRET" https://yourdomain.com/api/cron/send-reminders >> /var/log/healtalk-cron.log 2>&1
```

#### Option 2: External Cron Service (cron-job.org)

1. Go to https://cron-job.org (free)
2. Create new cron job:
   - **URL**: `https://yourdomain.com/api/cron/send-reminders`
   - **Schedule**: Every hour (0 * * * *)
   - **Add Header**: `Authorization: Bearer YOUR_CRON_SECRET`

#### Option 3: Vercel Cron (if you switch to Vercel)

Create `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-reminders",
      "schedule": "0 * * * *"
    }
  ]
}
```

## 🎨 Customizing Email Templates

To customize templates, edit `src/lib/email/templates.ts`:

```typescript
// Change brand color
const BRAND_COLOR = '#4A90A4'; // Your primary color

// Modify any template
export function welcomePatientEmail(name: string) {
  const content = `
    <h2>Welcome to HealTalk, ${name}! 👋</h2>
    <p>Add your custom message here...</p>
    // ... rest of template
  `;

  return {
    subject: 'Your custom subject',
    html: emailLayout(content),
    text: 'Plain text version'
  };
}
```

## 🔒 Security

**Important**: Add these to your `.env`:

```env
# Generate a secure random string for cron job authentication
CRON_SECRET="your_random_secure_string_here"

# Email configuration
EMAIL_FROM="HealTalk <noreply@yourdomain.com>"
EMAIL_REPLY_TO="support@yourdomain.com"
```

Generate secure CRON_SECRET:
```bash
openssl rand -base64 32
```

## 📊 Monitoring Email Delivery

### Check Resend Dashboard

1. Go to https://resend.com/emails
2. View all sent emails
3. Check delivery status, opens, clicks
4. View bounce/complaint rates

### Check Application Logs

```bash
# On your server
pm2 logs healtalk | grep -i email

# Check cron job logs
tail -f /var/log/healtalk-cron.log
```

### Test Email Sending

Create a test API route: `src/app/api/test/email/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { EmailService } from '@/lib/email/service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  try {
    await EmailService.sendWelcomePatient(email, 'Test User');
    return NextResponse.json({ success: true, message: 'Test email sent!' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
```

Test it: `https://yourdomain.com/api/test/email?email=your@email.com`

## 🐛 Troubleshooting

### Emails Not Sending

1. **Check Resend API key**:
   ```bash
   echo $RESEND_API_KEY
   ```

2. **Verify domain in Resend**:
   - Go to Resend dashboard
   - Check domain verification status
   - Ensure DNS records are correct

3. **Check application logs**:
   ```bash
   pm2 logs healtalk --lines 100 | grep -i email
   ```

### Cron Job Not Running

1. **Check crontab**:
   ```bash
   crontab -l
   ```

2. **Test manually**:
   ```bash
   curl -X GET \
     -H "Authorization: Bearer YOUR_CRON_SECRET" \
     https://yourdomain.com/api/cron/send-reminders
   ```

3. **Check cron logs**:
   ```bash
   tail -f /var/log/healtalk-cron.log
   ```

### Emails Going to Spam

1. **Verify SPF, DKIM, DMARC records** in Hostinger DNS
2. **Use your domain** (not noreply@healtalk.com)
3. **Avoid spam trigger words** in subject lines
4. **Include unsubscribe link** in footer (already added)

## 📈 Free Tier Limits

**Resend Free Tier:**
- 3,000 emails/month
- 100 emails/day
- All features included

**Estimate for 100 patients:**
- Welcome emails: 100
- Appointment confirmations: ~200/month
- 24h reminders: ~200/month
- 1h reminders: ~200/month
- Misc (password resets, messages): ~100/month
- **Total: ~800 emails/month** ✅ Well within free tier!

## 🎉 You're All Set!

Your email system is production-ready. Just:
1. ✅ Add `RESEND_API_KEY` to your `.env`
2. ✅ Verify your domain in Resend
3. ✅ Set up the cron job
4. ✅ Start integrating into your API routes

**Need help?** Check the examples above or the templates file for more details!
