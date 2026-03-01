# Database Overview — HealTalk

HealTalk uses **PostgreSQL** with **Prisma ORM**. The schema lives at `prisma/schema.prisma`.

## Tech

- Database: PostgreSQL 15+
- ORM: Prisma (with migrations)
- Hosted: Google Cloud SQL or local PostgreSQL for dev

## Main Models

### User
Base model for all users. Has a `role` field: `PATIENT`, `PSYCHOLOGIST`, or `ADMIN`.

### Patient
Extends User. Stores mood logs, progress goals, screening results, payment history.

### Psychologist
Extends User. Stores credentials, specializations, languages, hourly rate, availability schedule, approval status.

### Appointment
Links Patient and Psychologist. Fields: date, time, status (PENDING, CONFIRMED, COMPLETED, CANCELLED), session type (VIDEO), notes, payment status.

### Message
Direct messages between a patient and psychologist. Grouped by conversation.

### Notification
In-app notifications. Linked to a user, has a type and read status.

### MoodLog
Daily mood entry by a patient (score 1–10, notes, date).

### ProgressGoal
Goals set by a patient. Has title, description, target date, completion status.

### ScreeningResult
Results of PHQ-9 or GAD-7 questionnaire. Stored with score and interpretation.

### Hospital
Partner hospitals managed by admin.

### Review
Patient reviews of psychologists. Rating (1–5) and text.

## Common Prisma Commands

```bash
# Generate client after schema change
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name <name>

# Apply migrations in production
npx prisma migrate deploy

# Seed the database
npx prisma db seed

# Open Prisma Studio (GUI)
npx prisma studio

# Reset database (dev only — wipes all data)
npx prisma migrate reset
```

## Files

- `README.md` — Full backend setup guide (PostgreSQL install, Prisma init, auth setup)
- `prisma-overview.md` — This file (models overview and common commands)
