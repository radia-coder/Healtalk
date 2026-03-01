# Google Cloud VM + Hostinger Deployment Guide

This guide will help you deploy HealTalk to Google Cloud VM and configure your Hostinger domain.

## Prerequisites

- Google Cloud account with billing enabled
- Hostinger domain
- Resend account for emails (free tier: 3k emails/month)
- All required API keys (see .env.example)

## Part 1: Set Up Google Cloud VM

### 1. Create a VM Instance

```bash
# In Google Cloud Console:
# 1. Go to Compute Engine > VM instances
# 2. Click "Create Instance"
# 3. Configure:

Name: healtalk-prod
Region: us-central1 (or closest to your users)
Zone: us-central1-a
Machine type: e2-medium (2 vCPU, 4GB RAM) - $30/month
            # Start with e2-small ($15/month) if budget constrained
Boot disk: Ubuntu 22.04 LTS, 30GB SSD
Firewall: ✅ Allow HTTP traffic
          ✅ Allow HTTPS traffic
```

### 2. Connect to Your VM

```bash
# Click "SSH" in Google Cloud Console, or use gcloud CLI:
gcloud compute ssh healtalk-prod --zone=us-central1-a
```

### 3. Install Required Software

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version

# Install PostgreSQL 15
sudo apt install -y postgresql postgresql-contrib

# Install Redis
sudo apt install -y redis-server

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx (web server)
sudo apt install -y nginx

# Install Certbot (SSL certificates)
sudo apt install -y certbot python3-certbot-nginx

# Install Git
sudo apt install -y git
```

### 4. Configure PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user (in psql prompt)
CREATE DATABASE healtalk_prod;
CREATE USER healtalk_user WITH ENCRYPTED PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE healtalk_prod TO healtalk_user;
\q

# Enable remote connections (if needed)
sudo nano /etc/postgresql/15/main/postgresql.conf
# Find: #listen_addresses = 'localhost'
# Change to: listen_addresses = 'localhost'

# Configure authentication
sudo nano /etc/postgresql/15/main/pg_hba.conf
# Add this line:
# local   healtalk_prod   healtalk_user   md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 5. Configure Redis

```bash
# Edit Redis config
sudo nano /etc/redis/redis.conf

# Find and update:
# supervised no
# Change to:
supervised systemd

# Restart Redis
sudo systemctl restart redis
sudo systemctl enable redis
```

## Part 2: Deploy Your Application

### 1. Clone Your Repository

```bash
# Create app directory
sudo mkdir -p /var/www
cd /var/www

# Clone your repo
sudo git clone https://github.com/yourusername/psyconnect.git healtalk
cd healtalk

# Set permissions
sudo chown -R $USER:$USER /var/www/healtalk
```

### 2. Configure Environment Variables

```bash
# Create production .env file
nano .env

# Add all your environment variables:
```

```env
# Database
DATABASE_URL="postgresql://healtalk_user:your_secure_password_here@localhost:5432/healtalk_prod"

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="generate_with_openssl_rand_base64_32"

# Agora (Video Calling)
AGORA_APP_ID="your-agora-app-id"
AGORA_APP_CERTIFICATE="your-agora-certificate"

# Google Gemini (AI Chatbot) - FREE
GEMINI_API_KEY="your-gemini-api-key"

# Resend (Email)
RESEND_API_KEY="re_your_resend_key"
EMAIL_FROM="HealTalk <noreply@yourdomain.com>"
EMAIL_REPLY_TO="support@yourdomain.com"

# UploadThing (File Uploads)
UPLOADTHING_SECRET="sk_your_uploadthing_secret"
UPLOADTHING_APP_ID="your_app_id"

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL="https://your-redis-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_token"

# Cron Job Secret (generate a random string)
CRON_SECRET="generate_random_secure_string_here"

# App URL
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# Node Environment
NODE_ENV="production"
```

### 3. Install Dependencies and Build

```bash
# Install dependencies
npm install

# Run database migrations
npx prisma generate
npx prisma migrate deploy

# Seed database (optional)
npm run seed  # If you have a seed script

# Build for production
npm run build
```

### 4. Start with PM2

```bash
# Start the app
pm2 start npm --name "healtalk" -- start

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
# Run the command that PM2 outputs

# Check status
pm2 status
pm2 logs healtalk
```

## Part 3: Configure Nginx

### 1. Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/healtalk
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect to HTTPS (will be configured by Certbot)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates (will be added by Certbot)
    # ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Client max body size (for file uploads)
    client_max_body_size 10M;

    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts for long connections (video calls)
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Cache static files
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Logging
    access_log /var/log/nginx/healtalk_access.log;
    error_log /var/log/nginx/healtalk_error.log;
}
```

### 2. Enable Site and Test

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/healtalk /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Part 4: Configure Domain (Hostinger)

### 1. Point Domain to Google Cloud VM

```bash
# Get your VM's external IP:
gcloud compute instances describe healtalk-prod --zone=us-central1-a \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'

# Or find it in Google Cloud Console > VM instances
```

In **Hostinger DNS Management:**

```
Type: A Record
Name: @
Points to: [Your VM External IP]
TTL: 14400

Type: A Record
Name: www
Points to: [Your VM External IP]
TTL: 14400
```

**Wait 15-30 minutes for DNS propagation**

### 2. Set Up SSL Certificate

```bash
# Once DNS is propagated, run Certbot:
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts:
# - Enter email address
# - Agree to terms
# - Choose whether to redirect HTTP to HTTPS (choose Yes)

# Test automatic renewal
sudo certbot renew --dry-run
```

## Part 5: Configure Email (Resend)

### 1. Verify Domain in Resend

1. Go to Resend Dashboard: https://resend.com/domains
2. Click "Add Domain"
3. Enter your domain: `yourdomain.com`

### 2. Add DNS Records in Hostinger

Resend will provide DNS records to add. In Hostinger DNS Management, add:

```
Type: TXT
Name: _resend
Value: [Provided by Resend]
TTL: 14400

Type: MX
Name: @
Points to: feedback-smtp.us-east-1.amazonses.com
Priority: 10
TTL: 14400

Type: TXT
Name: @
Value: "v=spf1 include:amazonses.com ~all"
TTL: 14400

Type: CNAME
Name: [random]._domainkey
Points to: [random].dkim.amazonses.com
TTL: 14400
```

### 3. Verify Domain

After adding DNS records, click "Verify" in Resend dashboard (may take 15-30 minutes).

## Part 6: Set Up Cron Jobs (Email Reminders)

### 1. Create Cron Job Script

```bash
# Create script
nano /var/www/healtalk/scripts/send-reminders.sh
```

```bash
#!/bin/bash
curl -X GET \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://yourdomain.com/api/cron/send-reminders
```

```bash
# Make executable
chmod +x /var/www/healtalk/scripts/send-reminders.sh
```

### 2. Add to Crontab

```bash
# Edit crontab
crontab -e

# Add this line to run every hour:
0 * * * * /var/www/healtalk/scripts/send-reminders.sh >> /var/log/healtalk-cron.log 2>&1
```

## Part 7: Monitoring & Maintenance

### 1. Set Up Log Rotation

```bash
sudo nano /etc/logrotate.d/healtalk
```

```
/var/log/nginx/healtalk_*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
```

### 2. Set Up Database Backups

```bash
# Create backup script
nano /var/www/healtalk/scripts/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/healtalk"
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U healtalk_user -h localhost healtalk_prod | gzip > $BACKUP_DIR/healtalk_$DATE.sql.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "healtalk_*.sql.gz" -mtime +7 -delete

echo "Backup completed: healtalk_$DATE.sql.gz"
```

```bash
# Make executable
chmod +x /var/www/healtalk/scripts/backup-db.sh

# Add to crontab (daily at 3 AM)
crontab -e
# Add:
0 3 * * * /var/www/healtalk/scripts/backup-db.sh >> /var/log/healtalk-backup.log 2>&1
```

### 3. Monitor Application

```bash
# View PM2 logs
pm2 logs healtalk

# Monitor resources
pm2 monit

# Check application status
pm2 status

# View Nginx logs
sudo tail -f /var/log/nginx/healtalk_error.log
sudo tail -f /var/log/nginx/healtalk_access.log

# Check database connections
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'healtalk_prod';"
```

## Part 8: Updating Your Application

### 1. Create Update Script

```bash
nano /var/www/healtalk/scripts/update.sh
```

```bash
#!/bin/bash
cd /var/www/healtalk

echo "Pulling latest changes..."
git pull

echo "Installing dependencies..."
npm install

echo "Running migrations..."
npx prisma migrate deploy

echo "Building application..."
npm run build

echo "Restarting PM2..."
pm2 restart healtalk

echo "Update complete!"
pm2 logs healtalk --lines 50
```

```bash
# Make executable
chmod +x /var/www/healtalk/scripts/update.sh

# To update in the future:
/var/www/healtalk/scripts/update.sh
```

## Part 9: Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Check status
sudo ufw status
```

## Part 10: Monitoring with Uptime Robot (Free)

1. Go to https://uptimerobot.com
2. Sign up (free tier: 50 monitors)
3. Add HTTP(s) monitor:
   - URL: https://yourdomain.com
   - Monitoring interval: 5 minutes
   - Email alerts when down

## Troubleshooting

### Application Won't Start

```bash
# Check PM2 logs
pm2 logs healtalk --lines 100

# Check if port 3000 is in use
sudo lsof -i :3000

# Restart application
pm2 restart healtalk
```

### Nginx Errors

```bash
# Check Nginx configuration
sudo nginx -t

# View error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check if database exists
sudo -u postgres psql -l | grep healtalk

# Test connection
psql -U healtalk_user -h localhost -d healtalk_prod
```

### Email Not Sending

```bash
# Check Resend domain verification
# Check DNS records in Hostinger
# Verify API key in .env
# Check application logs for email errors
pm2 logs healtalk | grep -i email
```

### SSL Certificate Issues

```bash
# Renew certificate manually
sudo certbot renew

# Check certificate status
sudo certbot certificates

# Test SSL configuration
curl -I https://yourdomain.com
```

## Cost Estimate

### Google Cloud VM
- e2-small (2 vCPU, 2GB RAM): ~$15/month
- e2-medium (2 vCPU, 4GB RAM): ~$30/month
- 30GB SSD storage: ~$5/month
- Network egress: ~$5-10/month
- **Total: $25-45/month**

### External Services (Free Tiers)
- Hostinger domain: ~$10/year
- Resend email: Free (3k emails/month)
- Agora video: Free (10k minutes/month)
- Gemini AI: Free
- UploadThing: Free (2GB storage)
- Upstash Redis: Free tier

## Next Steps

1. ✅ Deploy application to Google Cloud VM
2. ✅ Configure domain and SSL
3. ✅ Set up email system
4. ✅ Configure cron jobs
5. ✅ Set up backups
6. ✅ Test all functionality
7. 🚀 Go live!

## Support

For issues:
- Check logs: `pm2 logs healtalk`
- Google Cloud Console: https://console.cloud.google.com
- Resend Dashboard: https://resend.com
- Community forums and documentation

Good luck with your deployment! 🚀
