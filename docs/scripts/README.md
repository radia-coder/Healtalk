# Scripts — HealTalk

This folder documents the scripts used in HealTalk for deployment, database management, and maintenance.

## Deployment Script (`deploy.sh`)

Located at the root of the project. Handles building and deploying HealTalk to a server.

```bash
# Full deployment to GCP
./deploy.sh gcp

# Skip database seeding on re-deploy
./deploy.sh gcp --skip-db

# Run checks only (no deploy)
./deploy.sh --check-only
```

## Scripts Folder (`scripts/`)

Located at `scripts/` in the project root. Contains helper shell scripts called by `deploy.sh`:

- Build validation scripts
- Environment check scripts
- Database migration runners
- PM2 setup scripts

## Fix Script (`fix-all-params.js`)

A one-off JavaScript script at the root that was used to fix a Next.js route parameter issue across multiple page files. Run with:

```bash
node fix-all-params.js
```

## Cron Jobs

The cron job for appointment reminders is an API route, not a shell script:
- Route: `src/app/api/cron/send-reminders/route.ts`
- Call this route on a schedule using an external scheduler (Vercel Cron, GitHub Actions, etc.)

## Common npm Scripts

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # ESLint check
npm test          # Run Jest tests
```
