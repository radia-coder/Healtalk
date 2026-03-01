# Deployment Cheat Sheet

Quick reference for common deployment tasks.

## 🚀 First Time Deployment

```bash
# 1. Setup environment
cp .env.example .env
nano .env  # Edit with production values

# 2. Make scripts executable
chmod +x deploy.sh scripts/*.sh

# 3. Deploy
./deploy.sh gcp
```

## 🔄 Update Existing Deployment

```bash
# Quick update (pull + install + build + restart)
./scripts/quick-deploy.sh update

# Or step by step:
git pull origin main
npm ci
npm run build
pm2 restart psyconnect
```

## 🩺 Troubleshooting

```bash
# Run full diagnostics
./scripts/troubleshoot.sh all

# Fix specific issues
./scripts/troubleshoot.sh blog        # Blog page empty
./scripts/troubleshoot.sh doctors     # No psychologists
./scripts/troubleshoot.sh images      # Images not loading
./scripts/troubleshoot.sh database    # DB connection

# Health check
./scripts/health-check.sh
./scripts/health-check.sh --verbose   # Detailed
```

## 🗃️ Database Commands

```bash
# Seed database
npm run db:seed

# Run migrations
npm run db:push

# Open database GUI
npx prisma studio

# Approve all psychologists
npx prisma db execute --stdin <<< "UPDATE \"Psychologist\" SET status = 'APPROVED';"

# Publish all blog posts
npx prisma db execute --stdin <<< "UPDATE \"BlogPost\" SET published = true;"
```

## 📊 Monitoring

```bash
# View logs
pm2 logs psyconnect
pm2 logs psyconnect --lines 100

# Check status
pm2 status
pm2 info psyconnect

# Monitor resources
pm2 monit

# Restart app
pm2 restart psyconnect
```

## 🔧 Quick Fixes

```bash
# Blog page shows no content
npm run db:seed
./scripts/quick-deploy.sh publish-blogs

# No doctors showing
npm run db:seed
./scripts/quick-deploy.sh approve-psychs

# Images missing
./scripts/troubleshoot.sh images  # Interactive fix

# Port 3000 in use
sudo lsof -ti:3000 | xargs kill -9
pm2 restart psyconnect

# Can't connect to database
# Check .env DATABASE_URL
sudo systemctl status postgresql
```

## 📁 File Locations

```
Logs:          ~/.pm2/logs/psyconnect-*.log
Backups:       ./backups/
Environment:   ./.env
Build:         ./.next/
Static files:  ./public/
Database:      Configured in DATABASE_URL
```

## 🌐 Test Endpoints

```bash
# Homepage
curl http://localhost:3000

# Blog API
curl http://localhost:3000/api/blog | jq

# Psychologists API
curl http://localhost:3000/api/psychologists | jq

# Health check
curl http://localhost:3000/health
```

## 🆘 Emergency Recovery

```bash
# Rollback to previous deployment
./deploy.sh --rollback

# Restore from backup
cp backups/latest/.env .env
cp -r backups/latest/.next .next
pm2 restart psyconnect

# Full reset (last resort)
./deploy.sh gcp  # Redeploy from scratch
```

## 📞 Quick Commands Reference

```bash
./deploy.sh gcp                    # Full deployment
./deploy.sh --check-only           # Check configuration
./deploy.sh --rollback             # Rollback deployment
./scripts/quick-deploy.sh update   # Update app
./scripts/quick-deploy.sh logs     # View logs
./scripts/quick-deploy.sh health   # Health check
./scripts/troubleshoot.sh all      # Diagnose issues
pm2 restart psyconnect             # Restart app
pm2 logs psyconnect                # View logs
npm run db:seed                    # Seed database
```

---

**For full documentation, see:** [DEPLOYMENT.md](./DEPLOYMENT.md)
