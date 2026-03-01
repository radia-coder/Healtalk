# Deployment Overview — HealTalk

HealTalk is deployed on **Google Cloud Platform (GCP)** with a VM running Node.js + PM2, and uses **Hostinger** as an alternative option.

## Hosting Options Used

### Google Cloud VM (Primary)
- VM with Node.js 18+, PM2, PostgreSQL
- Nginx as reverse proxy on port 80/443
- SSL via Let's Encrypt (Certbot)
- Domain pointed to VM's external IP

### Hostinger (Alternative)
- VPS option if GCP costs are a concern
- Same stack: Node.js, PM2, PostgreSQL, Nginx

## Quick Steps to Deploy

```bash
# 1. Make deploy script executable
chmod +x deploy.sh scripts/*.sh

# 2. Copy and fill in environment variables
cp .env.example .env
nano .env

# 3. Run pre-deployment checks
./deploy.sh --check-only

# 4. Deploy to GCP
./deploy.sh gcp

# 5. Update existing deployment (skip DB seeding)
./deploy.sh gcp --skip-db
```

## Files in This Folder

- `README.md` — Full deployment guide (original DEPLOYMENT.md)
- `cheatsheet.md` — Quick reference for common deployment commands
- `plan.md` — Step-by-step deployment plan
- `google-cloud.md` — GCP-specific setup guide
- `pre-launch-checklist.md` — Everything to check before going live
- `overview.md` — This file

## Environment Variables Required for Production

```
NODE_ENV=production
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://yourdomain.com
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
AGORA_APP_ID=
AGORA_APP_CERTIFICATE=
GEMINI_API_KEY=
RESEND_API_KEY=
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=
SENTRY_DSN=
```

## Process Manager

HealTalk uses **PM2** to keep the Next.js server running:

```bash
pm2 start npm --name healtalk -- start
pm2 save
pm2 startup
```
