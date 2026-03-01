#!/bin/bash

#####################################################################
# Quick Deploy Script - Common deployment tasks
#
# Usage: ./scripts/quick-deploy.sh [command]
#####################################################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

success() { echo -e "${GREEN}✅ $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

COMMAND="${1:-help}"

case "$COMMAND" in

    pull)
        echo "Pulling latest code from git..."
        git pull origin main
        success "Code updated"
        ;;

    update)
        echo "Updating application (pull + install + build + restart)..."
        git pull origin main && \
        npm ci && \
        npm run build && \
        pm2 restart psyconnect
        success "Application updated and restarted"
        ;;

    restart)
        echo "Restarting application..."
        pm2 restart psyconnect
        pm2 logs psyconnect --lines 20
        ;;

    logs)
        echo "Showing application logs (Ctrl+C to exit)..."
        pm2 logs psyconnect
        ;;

    status)
        echo "Application status:"
        pm2 status
        echo ""
        pm2 info psyconnect
        ;;

    rebuild)
        echo "Rebuilding application..."
        npm run build
        pm2 restart psyconnect
        success "Rebuild complete"
        ;;

    seed)
        echo "Seeding database..."
        npm run db:seed
        success "Database seeded"
        ;;

    migrate)
        echo "Running database migrations..."
        npm run db:push
        success "Migrations complete"
        ;;

    reset-db)
        echo -e "${YELLOW}⚠️  WARNING: This will DELETE ALL DATA!${NC}"
        read -p "Are you sure? Type 'yes' to confirm: " -r
        if [[ $REPLY == "yes" ]]; then
            npx prisma migrate reset --force
            npm run db:seed
            success "Database reset and seeded"
        else
            info "Cancelled"
        fi
        ;;

    backup)
        echo "Creating backup..."
        BACKUP_DIR="backups"
        mkdir -p "$BACKUP_DIR"

        # Backup .env
        cp .env "$BACKUP_DIR/.env.$(date +%Y%m%d-%H%M%S)"

        # Backup database (if pg_dump available)
        if command -v pg_dump &> /dev/null && [ -n "$DATABASE_URL" ]; then
            pg_dump "$DATABASE_URL" > "$BACKUP_DIR/db-$(date +%Y%m%d-%H%M%S).sql"
            success "Backup created in $BACKUP_DIR/"
        else
            warning "pg_dump not available, only .env backed up"
        fi
        ;;

    health)
        echo "Running health check..."
        ./scripts/health-check.sh
        ;;

    fix-blog)
        echo "Fixing blog page..."
        ./scripts/troubleshoot.sh blog
        ;;

    fix-doctors)
        echo "Fixing doctors page..."
        ./scripts/troubleshoot.sh doctors
        ;;

    fix-images)
        echo "Fixing images..."
        ./scripts/troubleshoot.sh images
        ;;

    approve-psychs)
        echo "Approving all psychologists..."
        npx prisma db execute --stdin <<< "UPDATE \"Psychologist\" SET status = 'APPROVED';"
        success "All psychologists approved"
        ;;

    publish-blogs)
        echo "Publishing all blog posts..."
        npx prisma db execute --stdin <<< "UPDATE \"BlogPost\" SET published = true;"
        success "All blog posts published"
        ;;

    clean)
        echo "Cleaning up build files..."
        rm -rf .next
        rm -rf node_modules/.cache
        success "Cleanup complete"
        ;;

    full-deploy)
        echo "Running full deployment..."
        ./deploy.sh gcp
        ;;

    help|*)
        cat << EOF

╔════════════════════════════════════════════════════════╗
║           PsyConnect Quick Deploy Commands            ║
╚════════════════════════════════════════════════════════╝

Application Management:
  update          Pull code, install deps, build, restart
  restart         Restart application
  rebuild         Rebuild and restart
  logs            View real-time logs
  status          Show PM2 status

Database:
  seed            Seed database with sample data
  migrate         Run database migrations
  reset-db        ⚠️  Reset database (deletes all data!)
  backup          Create backup of .env and database

Fixes:
  fix-blog        Fix blog page not showing
  fix-doctors     Fix doctors/psychologists not showing
  fix-images      Fix missing images
  approve-psychs  Approve all psychologists
  publish-blogs   Publish all blog posts

Utilities:
  health          Run health check
  clean           Clean build cache
  full-deploy     Run full deployment script
  pull            Git pull latest code

Examples:
  ./scripts/quick-deploy.sh update
  ./scripts/quick-deploy.sh logs
  ./scripts/quick-deploy.sh health

EOF
        ;;
esac
