# Resend Setup (Email)

Resend sends emails from HealTalk.

## What emails use it

- Verify email after signup
- Resend verification email
- Appointment/cancellation notifications
- Reminder emails (cron route)

## Env vars

```bash
RESEND_API_KEY=re_...
EMAIL_FROM=HealTalk <noreply@finalproject.app>
EMAIL_REPLY_TO=support@finalproject.app
```

## Step by step: get Resend key

1. Go to https://resend.com and sign in.
2. Open API Keys.
3. Create API key.
4. Copy key and add as `RESEND_API_KEY`.

## Step by step: verify your domain

1. In Resend, go to Domains -> Add Domain.
2. Add `finalproject.app`.
3. Resend gives DNS records (TXT/MX/CNAME).
4. Add these records where your domain DNS is managed.
5. Wait until status shows verified.
6. Set `EMAIL_FROM` using verified domain.

## How it helps this project

Users receive real emails instead of missing important actions.

## Common issue

If email does not arrive:
- check domain verification status
- check `EMAIL_FROM` is from verified domain
- check deployment logs for resend errors
