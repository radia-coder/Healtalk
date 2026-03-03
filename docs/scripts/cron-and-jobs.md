# Cron and Scheduled Jobs

## Reminder Job

We send appointment reminders using cron route:

- `/api/cron/send-reminders`

## Security

We protect cron calls using `CRON_SECRET`.

## Suggested Schedule

- Run every hour in production.
