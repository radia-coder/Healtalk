# Troubleshooting

## Build fails on DigitalOcean

- Check missing env vars first.
- Check Prisma migration status.
- Check route compile errors from logs.

## AI chat fails

- Check `OPENROUTER_API_KEY`.
- Check model name values.
- Check fallback provider key.

## Google login fails

- Check Google OAuth redirect URIs.
- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

## Email not sending

- Check `RESEND_API_KEY`.
- Check `EMAIL_FROM` uses verified domain.
