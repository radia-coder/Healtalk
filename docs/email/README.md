# Email System — HealTalk

HealTalk sends transactional emails using **Resend** with custom HTML templates that match the brand colors.

## Provider: Resend

- Website: resend.com
- Free tier: 3,000 emails/month
- API key: `RESEND_API_KEY` in `.env`
- From address: configure a verified domain in Resend dashboard

## Email Types

| Type                        | Trigger                                       |
|-----------------------------|-----------------------------------------------|
| Welcome email               | New patient or psychologist registers         |
| Email verification          | After signup — must verify before login       |
| Password reset              | User requests forgot password                 |
| Appointment confirmation    | Patient books, psychologist confirms          |
| Appointment reminder        | Sent 24hrs before appointment (via cron job)  |
| Appointment cancellation    | Either party cancels                          |
| Session complete            | After video session ends                      |
| Psychologist approval       | Admin approves a psychologist application     |
| New message notification    | When a new message arrives                    |

## File Structure

```
src/lib/email/
├── resend.ts        # Resend client setup and helper functions
├── templates.ts     # All HTML email templates with brand styling
└── service.ts       # EmailService class — easy to call from API routes

src/app/api/cron/
└── send-reminders/
    └── route.ts     # Automated appointment reminder emails (runs on schedule)
```

## Automated Reminders (Cron)

The route `/api/cron/send-reminders` is designed to be called by an external cron service (e.g. Vercel Cron, GitHub Actions, or a cloud scheduler) every hour or daily.

It finds all appointments happening within the next 24 hours and sends reminder emails to both the patient and psychologist.

## Files in This Folder

- `README.md` — This file (email overview)
- `integration-guide.md` — How to integrate email service into API routes
- `setup-complete.md` — Summary of what was set up and how to use EmailService
