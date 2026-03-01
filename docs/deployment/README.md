# PsyConnect Deployment Guide

Complete guide for deploying PsyConnect to production servers (Google Cloud VM & Hostinger).

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Deployment Scripts](#deployment-scripts)
- [Troubleshooting](#troubleshooting)
- [Server-Specific Guides](#server-specific-guides)

---

## 🚀 Quick Start

**First time deployment:**

```bash
# 1. Make scripts executable
chmod +x deploy.sh scripts/*.sh

# 2. Create and configure .env
cp .env.example .env
nano .env  # Edit with your production values

# 3. Run pre-deployment checks
./deploy.sh --check-only

# 4. Deploy
./deploy.sh gcp
```

**Already deployed? Update existing deployment:**

```bash
./deploy.sh gcp --skip-db  # Skip database seeding
```

---

## 📦 Prerequisites

### Required Software

1. **Node.js 18+**
   ```bash
   node -v  # Should show v18 or higher
   ```

2. **PostgreSQL 12+**
   ```bash
   psql --version
   ```

3. **PM2** (process manager)
   ```bash
   npm install -g pm2
   ```

4. **Nginx** (optional but recommended)
   ```bash
   nginx -v
   ```

### Required Accounts/Services

- [ ] PostgreSQL database (local or cloud)
- [ ] Domain name (for production)
- [ ] Agora account (for video calls) - https://console.agora.io
- [ ] Google Gemini API key (for AI chatbot) - https://makersuite.google.com/app/apikey
- [ ] Resend API key (for emails) - https://resend.com
- [ ] UploadThing account (for file uploads) - https://uploadthing.com
- [ ] Upstash Redis (for rate limiting) - https://upstash.com

---

## ⚙️ Initial Setup

### 1. Environment Configuration

Create `.env` file from template:

```bash
cp .env.example .env
```

**Edit `.env` with your production values:**

```bash
# === CRITICAL - MUST SET ===

# Database connection string
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# Your production domain (IMPORTANT!)
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# NextAuth (generate secret with: openssl rand -base64 32)
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="<your-generated-secret>"

# === REQUIRED FOR FEATURES ===

# Agora (video consultations)
AGORA_APP_ID="your-agora-app-id"
AGORA_APP_CERTIFICATE="your-agora-certificate"

# Google Gemini (AI mental health screening) - FREE
GEMINI_API_KEY="AIza..."  # Get from https://makersuite.google.com/app/apikey

# Resend (email notifications)
RESEND_API_KEY="re_..."

# UploadThing (file uploads)
UPLOADTHING_SECRET="sk_..."
UPLOADTHING_APP_ID="..."

# Upstash Redis (rate limiting)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

**Security checklist:**

- ✅ `.env` file permissions are 600 (not readable by others)
- ✅ `.env` is in `.gitignore` (never commit secrets!)
- ✅ Use different secrets for dev and production
- ✅ Generate strong NEXTAUTH_SECRET (32+ characters)

### 2. Database Setup

**Option A: Local PostgreSQL**

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib  # Ubuntu/Debian
# OR
brew install postgresql@14  # macOS

# Create database and user
sudo -u postgres psql
CREATE DATABASE psyconnect_prod;
CREATE USER psyconnect WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE psyconnect_prod TO psyconnect;
\q

# Update DATABASE_URL in .env
DATABASE_URL="postgresql://psyconnect:your-secure-password@localhost:5432/psyconnect_prod?schema=public"
```

**Option B: Cloud Database (Recommended)**

Use managed PostgreSQL from:
- [Supabase](https://supabase.com) (Free tier available)
- [Neon](https://neon.tech) (Free tier available)
- [Railway](https://railway.app)
- Google Cloud SQL
- AWS RDS

Copy connection string to `DATABASE_URL` in `.env`.

### 3. Get API Keys

**Agora (Video Calls):**
1. Sign up at https://console.agora.io
2. Create project → Get App ID & Certificate
3. Add to `.env`

**Google Gemini (AI - FREE):**
1. Visit https://makersuite.google.com/app/apikey
2. Create API key
3. Add `GEMINI_API_KEY` to `.env`

**Resend (Emails - 100 free/day):**
1. Sign up at https://resend.com
2. Create API key
3. Add domain for sending emails
4. Add `RESEND_API_KEY` to `.env`

**UploadThing (File Uploads):**
1. Sign up at https://uploadthing.com
2. Create app → Get secret & app ID
3. Add to `.env`

---

## 🎯 Deployment Scripts

### Main Deployment Script

**`./deploy.sh [environment] [options]`**

**Environments:**
- `gcp` - Deploy to Google Cloud VM
- `hostinger` - Deploy to Hostinger VPS
- `both` - Deploy to both servers

**Options:**
- `--skip-db` - Skip database migrations/seeding
- `--skip-build` - Skip build step (use existing)
- `--check-only` - Only run pre-deployment checks
- `--rollback` - Rollback to previous deployment

**Examples:**

```bash
# First deployment (full setup)
./deploy.sh gcp

# Update deployment (skip seeding)
./deploy.sh gcp --skip-db

# Check configuration before deploying
./deploy.sh gcp --check-only

# Rollback if something went wrong
./deploy.sh --rollback
```

**What the script does:**

1. ✅ Checks Node.js version, dependencies
2. ✅ Validates `.env` configuration
3. ✅ Tests database connection
4. ✅ Creates backup of current deployment
5. ✅ Installs npm dependencies
6. ✅ Runs database migrations
7. ✅ Seeds database (if empty)
8. ✅ Builds Next.js application
9. ✅ Sets up PM2 process manager
10. ✅ Configures Nginx (optional)
11. ✅ Runs health checks
12. ✅ Shows status and next steps

### Health Check Script

**`./scripts/health-check.sh [--verbose]`**

Checks if everything is working correctly:

```bash
# Quick health check
./scripts/health-check.sh

# Detailed report
./scripts/health-check.sh --verbose
```

**Checks:**
- Environment variables
- Database connection & data
- Application server status
- API endpoints
- Static files
- Page rendering
- System resources

### Troubleshooting Script

**`./scripts/troubleshoot.sh [issue]`**

Automatically diagnoses and fixes common issues:

```bash
# Diagnose specific issue
./scripts/troubleshoot.sh blog       # Blog not showing
./scripts/troubleshoot.sh doctors    # No psychologists
./scripts/troubleshoot.sh images     # Images not loading
./scripts/troubleshoot.sh database   # DB connection issues

# Run all diagnostics
./scripts/troubleshoot.sh all
```

**Features:**
- Automatic problem detection
- Suggested fixes
- Interactive repair (asks before applying fixes)

---

## 🐛 Troubleshooting

### Blog Page Shows No Content

**Diagnosis:**
```bash
./scripts/troubleshoot.sh blog
```

**Common causes:**

1. **Database not seeded**
   ```bash
   npm run db:seed
   ```

2. **Blog posts not published**
   ```bash
   npx prisma db execute --stdin <<< "UPDATE \"BlogPost\" SET published = true;"
   ```

3. **NEXT_PUBLIC_APP_URL wrong**
   - Check `.env` - must match your domain exactly
   - Restart app after changing: `pm2 restart psyconnect`

### No Doctors/Psychologists Showing

**Diagnosis:**
```bash
./scripts/troubleshoot.sh doctors
```

**Common causes:**

1. **Database not seeded**
   ```bash
   npm run db:seed
   ```

2. **Psychologists not approved**
   ```bash
   # API only returns APPROVED psychologists
   npx prisma db execute --stdin <<< "UPDATE \"Psychologist\" SET status = 'APPROVED';"
   ```

3. **Check API directly**
   ```bash
   curl http://localhost:3000/api/psychologists | jq
   ```

### Images Not Loading

**Diagnosis:**
```bash
./scripts/troubleshoot.sh images
```

**Common causes:**

1. **Doctor images missing**
   ```bash
   cd public/images/
   curl -o doctor-1.jpg "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop"
   curl -o doctor-2.jpg "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop"
   curl -o doctor-3.jpg "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop"
   curl -o doctor-4.jpg "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop"
   cd ../..
   ```

2. **File permissions wrong**
   ```bash
   chmod 644 public/images/*.{jpg,png}
   ```

3. **Case-sensitivity (Linux)**
   ```bash
   # URLs are case-sensitive on Linux!
   # Wrong: /Images/logo.png
   # Right: /images/logo.png
   ```

### Database Connection Failed

**Diagnosis:**
```bash
./scripts/troubleshoot.sh database
```

**Common causes:**

1. **PostgreSQL not running**
   ```bash
   sudo systemctl start postgresql    # Linux
   brew services start postgresql@14  # macOS
   ```

2. **Wrong DATABASE_URL**
   - Check username, password, host, port, database name
   - Test: `psql "postgresql://user:pass@host:5432/dbname"`

3. **Firewall blocking**
   ```bash
   sudo ufw allow 5432/tcp  # Ubuntu/Debian
   ```

### Application Won't Start

**Check logs:**
```bash
pm2 logs psyconnect --lines 100
```

**Common issues:**

1. **Port 3000 already in use**
   ```bash
   # Kill process on port 3000
   sudo lsof -ti:3000 | xargs kill -9
   pm2 restart psyconnect
   ```

2. **Build failed**
   ```bash
   npm run build  # Check for errors
   ```

3. **Missing dependencies**
   ```bash
   npm ci
   ```

---

## 🖥️ Server-Specific Guides

### Google Cloud VM Deployment

**1. SSH into your VM:**

```bash
ssh username@your-vm-ip
```

**2. Install prerequisites:**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2

# Install Git (if needed)
sudo apt install -y git
```

**3. Clone repository:**

```bash
cd /var/www
sudo git clone https://github.com/yourusername/psyconnect.git
sudo chown -R $USER:$USER psyconnect
cd psyconnect
```

**4. Deploy:**

```bash
chmod +x deploy.sh scripts/*.sh
cp .env.example .env
nano .env  # Configure production values
./deploy.sh gcp
```

**5. Configure firewall:**

```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

**6. Setup SSL (optional but recommended):**

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Hostinger VPS Deployment

**Requirements:**
- Hostinger VPS plan (shared hosting doesn't support Node.js)
- SSH access enabled

**1. SSH into Hostinger:**

```bash
ssh u123456789@your-hostinger-ip
```

**2. Install Node.js:**

```bash
# Hostinger may have Node.js, check version
node -v

# If not installed or old version:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

**3. Setup database:**

Hostinger usually provides MySQL, but you need PostgreSQL:

**Option A: Use external database** (Recommended)
- Sign up for free PostgreSQL at Supabase/Neon
- Use connection string in `.env`

**Option B: Install PostgreSQL on VPS**
```bash
# May require sudo access (contact Hostinger support)
sudo apt install postgresql
```

**4. Deploy:**

```bash
cd ~/domains/yourdomain.com/public_html
git clone https://github.com/yourusername/psyconnect.git .
chmod +x deploy.sh scripts/*.sh
cp .env.example .env
nano .env
./deploy.sh hostinger
```

**5. Configure with Hostinger panel:**

- Use Hostinger control panel to point domain to Node.js app
- Set port to 3000
- Enable SSL via panel

### Common Hosting Platform Setup

**Vercel (Recommended for easy deployment):**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Add environment variables in Vercel dashboard
```

**Note:** Vercel requires serverless-compatible database (Supabase, Neon, PlanetScale).

**Railway:**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

---

## 📊 Monitoring & Maintenance

### Check Application Status

```bash
# PM2 status
pm2 status

# View logs
pm2 logs psyconnect

# Monitor resources
pm2 monit

# Restart app
pm2 restart psyconnect

# Stop app
pm2 stop psyconnect
```

### Database Maintenance

```bash
# Backup database
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# View database stats
npx prisma studio  # Opens GUI on port 5555

# Run migrations
npm run db:migrate

# Reset database (CAUTION: deletes all data!)
npx prisma migrate reset
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Update dependencies
npm ci

# Rebuild
npm run build

# Restart
pm2 restart psyconnect
```

---

## 🔒 Security Checklist

Before going live:

- [ ] `.env` file has 600 permissions (`chmod 600 .env`)
- [ ] Strong NEXTAUTH_SECRET (32+ random characters)
- [ ] Database uses strong password
- [ ] SSL certificate installed (HTTPS)
- [ ] Firewall configured (only ports 22, 80, 443 open)
- [ ] Regular database backups scheduled
- [ ] Rate limiting enabled (Upstash Redis configured)
- [ ] CORS properly configured in API routes
- [ ] CSP headers enabled (check `next.config.ts`)
- [ ] Sentry error tracking configured (optional)

---

## 📞 Getting Help

**Scripts failed?**
```bash
./scripts/troubleshoot.sh all
./scripts/health-check.sh --verbose
pm2 logs psyconnect --lines 200
```

**Still stuck?**
1. Check logs in `deploy-[timestamp].log`
2. Check PM2 logs: `~/.pm2/logs/psyconnect-*.log`
3. Check Nginx logs: `/var/log/nginx/error.log`
4. Check browser console for frontend errors

**Resources:**
- Next.js Deployment: https://nextjs.org/docs/deployment
- Prisma Deployment: https://www.prisma.io/docs/guides/deployment
- PM2 Documentation: https://pm2.keymetrics.io/docs/usage/quick-start/

---

## 🎉 Post-Deployment

After successful deployment:

1. **Test all features:**
   - [ ] Homepage loads
   - [ ] Blog page shows posts
   - [ ] Find Psychologists shows doctors
   - [ ] Images load correctly
   - [ ] User registration works
   - [ ] Login works
   - [ ] Video calls work (Agora)
   - [ ] Email notifications work (Resend)
   - [ ] File uploads work (UploadThing)

2. **Set up monitoring:**
   ```bash
   pm2 save          # Save PM2 config
   pm2 startup       # Auto-start on boot
   ```

3. **Schedule backups:**
   ```bash
   # Add to crontab (runs daily at 2 AM)
   crontab -e
   # Add line:
   0 2 * * * pg_dump $DATABASE_URL > /backups/psyconnect-$(date +\%Y\%m\%d).sql
   ```

4. **Share your app:**
   - Your production URL: `$NEXT_PUBLIC_APP_URL`
   - Test thoroughly before announcing!

---

**Good luck with your deployment! 🚀**

If you encounter any issues not covered here, run:
```bash
./scripts/troubleshoot.sh all
```
