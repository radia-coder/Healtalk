# HealTalk Deployment Plan

## Phase 1: Pre-Deployment Checklist (1-2 weeks)

### Critical Security & Compliance
- [ ] Add Privacy Policy page (`/privacy`)
- [ ] Add Terms of Service page (`/terms`)
- [ ] Add HIPAA Notice page (`/hipaa-notice`)
- [ ] Implement rate limiting on all API routes
- [ ] Add Content Security Policy headers
- [ ] Enable HTTPS-only (HSTS headers)
- [ ] Implement API request validation with Zod (partially done ✅)
- [ ] Add error boundaries for all pages
- [ ] Set up error logging (Sentry)

### Payment Integration
- [ ] Set up Stripe account (test mode first)
- [ ] Implement Stripe payment flow
- [ ] Add webhook handlers for payment events
- [ ] Test payment flows thoroughly
- [ ] Add refund handling

### Email System
- [ ] Configure Resend with custom domain
- [ ] Create email templates:
  - [ ] Appointment confirmation
  - [ ] 24h reminder
  - [ ] 1h reminder
  - [ ] Psychologist approval/rejection
  - [ ] Password reset
- [ ] Set up email cron jobs

### Database & Data
- [ ] Review all database migrations
- [ ] Add database backups (automated daily)
- [ ] Seed initial data (specializations, hospitals)
- [ ] Test data migration scripts
- [ ] Add database connection pooling

### Testing
- [ ] Manual test all user flows:
  - [ ] Patient registration → booking → video call → payment
  - [ ] Psychologist registration → approval → session
  - [ ] Messaging between patient/psychologist
  - [ ] AI screening flow
  - [ ] Group sessions
- [ ] Load test video calling (simulate 10+ concurrent calls)
- [ ] Test on mobile devices (iOS/Android)
- [ ] Cross-browser testing (Chrome, Safari, Firefox)

### Performance Optimization
- [ ] Optimize images (use Next.js Image component everywhere)
- [ ] Add loading states for all async operations
- [ ] Implement proper error handling
- [ ] Add database query optimization
- [ ] Set up CDN for static assets

### Monitoring & Analytics
- [ ] Set up Sentry for error tracking
- [ ] Add analytics (PostHog or Plausible for privacy)
- [ ] Set up uptime monitoring (UptimeRobot free tier)
- [ ] Add logging for critical operations
- [ ] Set up performance monitoring

### SEO & Marketing
- [ ] Generate sitemap.xml
- [ ] Add meta tags to all pages
- [ ] Create OpenGraph images
- [ ] Add structured data (JSON-LD)
- [ ] Create robots.txt
- [ ] Set up Google Search Console

## Phase 2: Infrastructure Setup (2-3 days)

### Recommended Setup: Vercel + Managed Database

**Frontend/Backend (Vercel):**
```bash
# 1. Create Vercel account and connect GitHub
# 2. Import your repo
# 3. Configure build settings:
#    - Build Command: npm run build
#    - Output Directory: .next
#    - Install Command: npm install
```

**Database (Choose one):**

Option A: **Neon** (Serverless PostgreSQL - FREE tier available)
- ✅ Serverless Postgres
- ✅ Auto-scaling
- ✅ Generous free tier (0.5GB storage, 3 projects)
- URL: https://neon.tech

Option B: **Supabase** (PostgreSQL + extras)
- ✅ PostgreSQL + Auth + Storage
- ✅ Free tier: 500MB database, 1GB file storage
- URL: https://supabase.com

Option C: **Railway** (All-in-one)
- ✅ PostgreSQL + Redis + Apps
- ✅ $5/month free credit
- URL: https://railway.app

**Recommended:** Use **Neon** for database + **Vercel** for app

### Domain Setup (Hostinger)

1. In Hostinger, point your domain to Vercel:
   ```
   Type: A Record
   Name: @
   Points to: 76.76.19.19 (Vercel IP)

   Type: CNAME
   Name: www
   Points to: cname.vercel-dns.com
   ```

2. In Vercel, add your custom domain
3. Vercel will automatically provision SSL certificate

### Environment Variables (Vercel)

Set these in Vercel Dashboard → Settings → Environment Variables:

```bash
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="[generate with: openssl rand -base64 32]"

# Agora
AGORA_APP_ID="..."
AGORA_APP_CERTIFICATE="..."

# Gemini (Free AI)
GEMINI_API_KEY="..."

# Resend (Email)
RESEND_API_KEY="..."

# UploadThing
UPLOADTHING_SECRET="..."
UPLOADTHING_APP_ID="..."

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."

# Stripe
STRIPE_SECRET_KEY="..."
STRIPE_WEBHOOK_SECRET="..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="..."

# Monitoring
SENTRY_DSN="..." (optional)

# App
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

## Phase 3: Alternative Google Cloud VM Setup

If you prefer self-hosting on Google Cloud VM:

### VM Setup (Ubuntu 22.04)

```bash
# 1. SSH into your VM
ssh username@your-vm-ip

# 2. Update system
sudo apt update && sudo apt upgrade -y

# 3. Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 4. Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# 5. Install Redis
sudo apt install -y redis-server

# 6. Install PM2 (process manager)
sudo npm install -g pm2

# 7. Install Nginx
sudo apt install -y nginx

# 8. Install Certbot (for SSL)
sudo apt install -y certbot python3-certbot-nginx
```

### Database Setup

```bash
# Create database and user
sudo -u postgres psql

CREATE DATABASE healtalk;
CREATE USER healtalk_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE healtalk TO healtalk_user;
\q
```

### Application Deployment

```bash
# 1. Clone your repo
cd /var/www
sudo git clone https://github.com/yourusername/psyconnect.git
cd psyconnect

# 2. Install dependencies
npm install

# 3. Create .env file
sudo nano .env
# Add all environment variables

# 4. Run migrations
npx prisma migrate deploy

# 5. Build application
npm run build

# 6. Start with PM2
pm2 start npm --name "healtalk" -- start
pm2 startup
pm2 save
```

### Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/healtalk
```

```nginx
server {
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site and restart Nginx
sudo ln -s /etc/nginx/sites-available/healtalk /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Set up SSL
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Firewall Configuration

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Auto-Deployment with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to VM

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VM_HOST }}
          username: ${{ secrets.VM_USERNAME }}
          key: ${{ secrets.VM_SSH_KEY }}
          script: |
            cd /var/www/psyconnect
            git pull
            npm install
            npm run build
            npx prisma migrate deploy
            pm2 restart healtalk
```

## Phase 4: Post-Deployment (Ongoing)

### Monitoring Setup

1. **Uptime Monitoring:**
   - UptimeRobot: Free 50 monitors
   - Ping your domain every 5 minutes

2. **Error Tracking:**
   - Sentry: Free tier for error monitoring
   - Set up alerts for critical errors

3. **Performance:**
   - Google Analytics or PostHog
   - Monitor page load times
   - Track user flows

### Backup Strategy

**If using managed database (Neon/Supabase):**
- Automatic backups included ✅

**If using Google Cloud VM:**
```bash
# Daily backup cron job
sudo crontab -e

# Add this line (backup at 3 AM daily):
0 3 * * * pg_dump -U healtalk_user healtalk > /var/backups/healtalk_$(date +\%Y\%m\%d).sql
```

### Maintenance Checklist

**Weekly:**
- [ ] Check error logs
- [ ] Review analytics
- [ ] Test critical paths

**Monthly:**
- [ ] Update dependencies
- [ ] Review security alerts
- [ ] Database cleanup (old sessions)
- [ ] Review backup integrity

**Quarterly:**
- [ ] Penetration testing
- [ ] Compliance audit
- [ ] Performance optimization review

## Phase 5: Scaling (When You Grow)

### Immediate Scaling (0-1000 users)
- Vercel handles this automatically ✅
- Upgrade database tier as needed

### Medium Scaling (1000-10000 users)
- Enable Redis caching
- Add database read replicas
- Implement CDN (Cloudflare)
- Optimize expensive queries

### Large Scaling (10000+ users)
- Microservices architecture
- Separate video infrastructure
- Load balancing
- Multi-region deployment

## Cost Estimates

### Budget Option (Free tier + minimal costs)
- **Hosting:** Vercel (Free)
- **Database:** Neon (Free tier: $0)
- **Redis:** Upstash (Free tier: $0)
- **Email:** Resend (Free: 3k emails/month)
- **Storage:** UploadThing (Free: 2GB)
- **Domain:** Hostinger (~$10/year)
- **AI:** Google Gemini (Free)
- **Video:** Agora (Free: 10k minutes/month)

**Total: ~$1-2/month** (until you hit limits)

### Production Option ($30-50/month)
- Vercel Pro: $20/month (better limits)
- Neon Pro: $19/month (more storage/compute)
- Upstash: $10/month (more Redis)
- Resend: $20/month (50k emails)
- Domain: $10/year
- Monitoring: Free tiers

### Google Cloud VM Option ($20-40/month)
- e2-small VM: ~$15/month
- Storage: ~$5/month
- Bandwidth: ~$5-10/month
- Domain: $10/year

## Quick Start: Deploy in 1 Hour

**Fastest path to production:**

```bash
# 1. Create accounts (10 min)
# - Vercel: vercel.com
# - Neon: neon.tech
# - Get API keys for: Gemini, Agora, Resend, Upstash

# 2. Set up database (5 min)
# - Create Neon project
# - Copy DATABASE_URL

# 3. Deploy to Vercel (15 min)
npm i -g vercel
vercel
# Add all environment variables in dashboard

# 4. Run migrations (2 min)
# In Vercel, go to Settings > Functions > Add a command:
npx prisma migrate deploy

# 5. Configure domain (15 min)
# Add your Hostinger domain in Vercel
# Update DNS records in Hostinger

# 6. Test everything (15 min)
# - Sign up as patient
# - Sign up as psychologist
# - Book appointment
# - Send message
# - Try video call
```

## Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Neon Docs:** https://neon.tech/docs
- **Prisma Deployment:** https://www.prisma.io/docs/guides/deployment

## Legal Requirements Before Launch

1. **Privacy Policy** - Use a generator:
   - https://www.termsfeed.com/privacy-policy-generator/
   - Specify HIPAA compliance (if US)
   - Mention data encryption, storage, retention

2. **Terms of Service** - Cover:
   - User responsibilities
   - Liability disclaimers
   - Service limitations
   - Termination policies

3. **HIPAA Business Associate Agreements** (if US):
   - With Vercel, Neon, Agora
   - Document data handling procedures

4. **Professional Liability Insurance**:
   - For platform liability
   - Require psychologists to have malpractice insurance

## Emergency Contacts

After deployment, create a runbook with:
- How to rollback deployments
- How to restore from backup
- Emergency contact for your hosting providers
- Incident response procedures
