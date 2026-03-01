#!/bin/bash

#####################################################################
# PsyConnect Production Deployment Script
#
# Usage:
#   ./deploy.sh [environment] [options]
#
# Environments:
#   gcp       - Google Cloud VM deployment
#   hostinger - Hostinger VPS deployment
#   both      - Deploy to both servers
#
# Options:
#   --skip-db       Skip database migrations/seeding
#   --skip-build    Skip build step (use existing build)
#   --check-only    Only run pre-deployment checks
#   --rollback      Rollback to previous deployment
#
# Examples:
#   ./deploy.sh gcp
#   ./deploy.sh hostinger --skip-db
#   ./deploy.sh both --check-only
#####################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
BACKUP_DIR="$PROJECT_DIR/backups"
LOG_FILE="$PROJECT_DIR/deploy-$(date +%Y%m%d-%H%M%S).log"

# Default options
SKIP_DB=false
SKIP_BUILD=false
CHECK_ONLY=false
ROLLBACK=false
ENVIRONMENT=""

# Required Node version
REQUIRED_NODE_VERSION="18"

#####################################################################
# Utility Functions
#####################################################################

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

confirm() {
    read -p "$(echo -e ${YELLOW}$1${NC}) (y/N): " -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]]
}

#####################################################################
# Pre-deployment Checks
#####################################################################

check_node_version() {
    log "Checking Node.js version..."

    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
        exit 1
    fi

    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)

    if [ "$NODE_VERSION" -lt "$REQUIRED_NODE_VERSION" ]; then
        error "Node.js version $REQUIRED_NODE_VERSION+ required, found v$NODE_VERSION"
        exit 1
    fi

    success "Node.js version: $(node -v)"
}

check_dependencies() {
    log "Checking required dependencies..."

    local missing_deps=()

    # Check for required commands
    for cmd in npm git curl; do
        if ! command -v $cmd &> /dev/null; then
            missing_deps+=($cmd)
        fi
    done

    if [ ${#missing_deps[@]} -ne 0 ]; then
        error "Missing dependencies: ${missing_deps[*]}"
        exit 1
    fi

    success "All required dependencies installed"
}

check_env_file() {
    log "Checking environment configuration..."

    if [ ! -f "$PROJECT_DIR/.env" ]; then
        error ".env file not found!"
        echo ""
        echo "Please create .env file from .env.example:"
        echo "  cp .env.example .env"
        echo "  nano .env  # Edit with your production values"
        exit 1
    fi

    # Check critical environment variables
    source "$PROJECT_DIR/.env"

    local missing_vars=()

    if [ -z "$DATABASE_URL" ]; then
        missing_vars+=("DATABASE_URL")
    fi

    if [ -z "$NEXT_PUBLIC_APP_URL" ]; then
        missing_vars+=("NEXT_PUBLIC_APP_URL")
    fi

    if [ -z "$NEXTAUTH_SECRET" ]; then
        missing_vars+=("NEXTAUTH_SECRET")
    fi

    if [ ${#missing_vars[@]} -ne 0 ]; then
        error "Missing required environment variables: ${missing_vars[*]}"
        exit 1
    fi

    success "Environment configuration valid"
    log "  DATABASE_URL: ${DATABASE_URL:0:20}..."
    log "  NEXT_PUBLIC_APP_URL: $NEXT_PUBLIC_APP_URL"
}

check_database_connection() {
    log "Testing database connection..."

    if ! npx prisma db execute --stdin <<< "SELECT 1;" &> /dev/null; then
        error "Cannot connect to database"
        echo ""
        echo "Please check:"
        echo "  1. DATABASE_URL is correct in .env"
        echo "  2. Database server is running"
        echo "  3. Network/firewall allows connection"
        exit 1
    fi

    success "Database connection successful"
}

check_disk_space() {
    log "Checking disk space..."

    AVAILABLE_SPACE=$(df -BG "$PROJECT_DIR" | tail -1 | awk '{print $4}' | sed 's/G//')

    if [ "$AVAILABLE_SPACE" -lt 2 ]; then
        error "Insufficient disk space: ${AVAILABLE_SPACE}GB available (2GB required)"
        exit 1
    fi

    success "Disk space: ${AVAILABLE_SPACE}GB available"
}

run_preflight_checks() {
    log "Running pre-deployment checks..."
    echo ""

    check_node_version
    check_dependencies
    check_env_file
    check_database_connection
    check_disk_space

    echo ""
    success "All pre-deployment checks passed!"
}

#####################################################################
# Backup Functions
#####################################################################

create_backup() {
    log "Creating backup..."

    mkdir -p "$BACKUP_DIR"

    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

    mkdir -p "$BACKUP_PATH"

    # Backup .env
    if [ -f "$PROJECT_DIR/.env" ]; then
        cp "$PROJECT_DIR/.env" "$BACKUP_PATH/.env"
    fi

    # Backup build (if exists)
    if [ -d "$PROJECT_DIR/.next" ]; then
        cp -r "$PROJECT_DIR/.next" "$BACKUP_PATH/.next"
    fi

    # Backup database
    if command -v pg_dump &> /dev/null && [ -n "$DATABASE_URL" ]; then
        log "Backing up database..."
        npx prisma db execute --stdin <<< "\copy (SELECT * FROM \"User\") TO '$BACKUP_PATH/users.csv' WITH CSV HEADER;" 2>/dev/null || true
    fi

    echo "$BACKUP_NAME" > "$BACKUP_DIR/latest"

    success "Backup created: $BACKUP_NAME"

    # Keep only last 5 backups
    cd "$BACKUP_DIR"
    ls -t | tail -n +6 | xargs -r rm -rf
}

rollback_deployment() {
    log "Rolling back to previous deployment..."

    if [ ! -f "$BACKUP_DIR/latest" ]; then
        error "No backup found to rollback to"
        exit 1
    fi

    LATEST_BACKUP=$(cat "$BACKUP_DIR/latest")
    BACKUP_PATH="$BACKUP_DIR/$LATEST_BACKUP"

    if [ ! -d "$BACKUP_PATH" ]; then
        error "Backup directory not found: $LATEST_BACKUP"
        exit 1
    fi

    log "Restoring from backup: $LATEST_BACKUP"

    # Restore .env
    if [ -f "$BACKUP_PATH/.env" ]; then
        cp "$BACKUP_PATH/.env" "$PROJECT_DIR/.env"
        success "Restored .env"
    fi

    # Restore build
    if [ -d "$BACKUP_PATH/.next" ]; then
        rm -rf "$PROJECT_DIR/.next"
        cp -r "$BACKUP_PATH/.next" "$PROJECT_DIR/.next"
        success "Restored build"
    fi

    success "Rollback completed!"
}

#####################################################################
# Database Functions
#####################################################################

setup_database() {
    if [ "$SKIP_DB" = true ]; then
        warning "Skipping database setup (--skip-db flag)"
        return
    fi

    log "Setting up database..."

    # Generate Prisma Client
    log "Generating Prisma Client..."
    npm run db:generate

    # Check if migrations exist
    if [ -d "$PROJECT_DIR/prisma/migrations" ]; then
        log "Running database migrations..."
        npm run db:migrate deploy 2>/dev/null || npm run db:push
    else
        log "Pushing Prisma schema to database..."
        npm run db:push
    fi

    # Check if database is empty
    RECORD_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"User\";" 2>/dev/null | tail -1 | tr -d ' ' || echo "0")

    if [ "$RECORD_COUNT" = "0" ] || [ "$RECORD_COUNT" = "(0)" ]; then
        log "Database is empty, running seed..."
        npm run db:seed
        success "Database seeded successfully"
    else
        log "Database already contains data (skipping seed)"
    fi

    # Verify critical tables have data
    log "Verifying database content..."
    npx prisma db execute --stdin <<< "
        SELECT 'BlogPost' as table_name, COUNT(*) as count FROM \"BlogPost\"
        UNION ALL
        SELECT 'Psychologist', COUNT(*) FROM \"Psychologist\"
        UNION ALL
        SELECT 'User', COUNT(*) FROM \"User\";
    " | tee -a "$LOG_FILE"

    success "Database setup completed"
}

#####################################################################
# Build Functions
#####################################################################

install_dependencies() {
    log "Installing dependencies..."

    # Clean install for production
    npm ci --production=false

    success "Dependencies installed"
}

build_application() {
    if [ "$SKIP_BUILD" = true ]; then
        warning "Skipping build (--skip-build flag)"
        return
    fi

    log "Building application for production..."

    # Set production environment
    export NODE_ENV=production

    # Build Next.js app
    npm run build

    # Verify build output
    if [ ! -d "$PROJECT_DIR/.next" ]; then
        error "Build failed: .next directory not found"
        exit 1
    fi

    success "Application built successfully"

    # Show build info
    if [ -f "$PROJECT_DIR/.next/build-manifest.json" ]; then
        BUILD_SIZE=$(du -sh "$PROJECT_DIR/.next" | cut -f1)
        log "Build size: $BUILD_SIZE"
    fi
}

#####################################################################
# Server Configuration
#####################################################################

setup_pm2() {
    log "Setting up PM2 process manager..."

    # Check if PM2 is installed
    if ! command -v pm2 &> /dev/null; then
        log "Installing PM2 globally..."
        npm install -g pm2
    fi

    # Create PM2 ecosystem file
    cat > "$PROJECT_DIR/ecosystem.config.js" <<'EOF'
module.exports = {
  apps: [{
    name: 'psyconnect',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: process.cwd(),
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: process.env.PORT || 3000
    },
    error_file: 'logs/pm2-error.log',
    out_file: 'logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF

    success "PM2 configuration created"

    # Create logs directory
    mkdir -p "$PROJECT_DIR/logs"

    # Stop existing process
    pm2 stop psyconnect 2>/dev/null || true
    pm2 delete psyconnect 2>/dev/null || true

    # Start application
    log "Starting application with PM2..."
    pm2 start ecosystem.config.js

    # Save PM2 configuration
    pm2 save

    # Setup PM2 startup script
    if confirm "Setup PM2 to auto-start on system boot?"; then
        STARTUP_SCRIPT=$(pm2 startup | tail -1)
        eval "$STARTUP_SCRIPT" || warning "Could not setup PM2 startup (may need sudo)"
    fi

    success "PM2 setup completed"
}

setup_nginx() {
    log "Setting up Nginx configuration..."

    if ! command -v nginx &> /dev/null; then
        warning "Nginx not installed, skipping configuration"
        echo "Install with: sudo apt install nginx (Ubuntu/Debian) or sudo yum install nginx (CentOS)"
        return
    fi

    # Get domain from environment
    source "$PROJECT_DIR/.env"
    DOMAIN=$(echo "$NEXT_PUBLIC_APP_URL" | sed -e 's|^[^/]*//||' -e 's|/.*$||')

    # Create Nginx configuration
    NGINX_CONFIG="/tmp/psyconnect-nginx.conf"

    cat > "$NGINX_CONFIG" <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Increase body size for uploads
    client_max_body_size 10M;

    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Cache static files
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }

    # Cache images
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000";
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3000;
        access_log off;
    }
}
EOF

    success "Nginx configuration generated: $NGINX_CONFIG"
    echo ""
    echo "To apply Nginx configuration:"
    echo "  sudo cp $NGINX_CONFIG /etc/nginx/sites-available/psyconnect"
    echo "  sudo ln -sf /etc/nginx/sites-available/psyconnect /etc/nginx/sites-enabled/"
    echo "  sudo nginx -t"
    echo "  sudo systemctl restart nginx"
    echo ""

    if confirm "Apply Nginx configuration now? (requires sudo)"; then
        sudo cp "$NGINX_CONFIG" /etc/nginx/sites-available/psyconnect
        sudo ln -sf /etc/nginx/sites-available/psyconnect /etc/nginx/sites-enabled/

        if sudo nginx -t; then
            sudo systemctl restart nginx
            success "Nginx configured and restarted"
        else
            error "Nginx configuration test failed"
        fi
    fi
}

#####################################################################
# Health Checks
#####################################################################

wait_for_server() {
    log "Waiting for server to start..."

    MAX_ATTEMPTS=30
    ATTEMPT=0

    while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
        if curl -s http://localhost:3000 > /dev/null; then
            success "Server is responding"
            return 0
        fi

        ATTEMPT=$((ATTEMPT + 1))
        echo -n "."
        sleep 2
    done

    error "Server failed to start within 60 seconds"
    return 1
}

run_health_checks() {
    log "Running post-deployment health checks..."
    echo ""

    # Test homepage
    log "Testing homepage..."
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
        success "Homepage: OK"
    else
        error "Homepage: FAILED"
    fi

    # Test API endpoints
    log "Testing API endpoints..."

    BLOG_COUNT=$(curl -s http://localhost:3000/api/blog | grep -o '"posts":\[' | wc -l)
    if [ "$BLOG_COUNT" -gt 0 ]; then
        success "Blog API: OK"
    else
        warning "Blog API: No posts found"
    fi

    PSYCH_COUNT=$(curl -s http://localhost:3000/api/psychologists | grep -o '"psychologists":\[' | wc -l)
    if [ "$PSYCH_COUNT" -gt 0 ]; then
        success "Psychologists API: OK"
    else
        warning "Psychologists API: No psychologists found"
    fi

    # Test static files
    log "Testing static files..."
    if curl -s -I http://localhost:3000/images/logo.png | grep -q "200"; then
        success "Static files: OK"
    else
        warning "Static files: Check failed"
    fi

    # Check PM2 status
    log "Checking PM2 status..."
    pm2 status

    echo ""
    success "Health checks completed!"
}

#####################################################################
# Image Setup
#####################################################################

setup_missing_images() {
    log "Checking for missing images..."

    IMAGE_DIR="$PROJECT_DIR/public/images"
    mkdir -p "$IMAGE_DIR"

    # Check if doctor images exist
    MISSING_IMAGES=()
    for i in {1..4}; do
        if [ ! -f "$IMAGE_DIR/doctor-$i.jpg" ]; then
            MISSING_IMAGES+=("doctor-$i.jpg")
        fi
    done

    if [ ${#MISSING_IMAGES[@]} -eq 0 ]; then
        success "All doctor images present"
        return
    fi

    warning "Missing doctor images: ${MISSING_IMAGES[*]}"

    if confirm "Download placeholder doctor images from Unsplash?"; then
        log "Downloading placeholder images..."

        # Doctor images from Unsplash
        curl -s "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop" -o "$IMAGE_DIR/doctor-1.jpg"
        curl -s "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop" -o "$IMAGE_DIR/doctor-2.jpg"
        curl -s "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop" -o "$IMAGE_DIR/doctor-3.jpg"
        curl -s "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop" -o "$IMAGE_DIR/doctor-4.jpg"

        # Set proper permissions
        chmod 644 "$IMAGE_DIR"/doctor-*.jpg

        success "Placeholder images downloaded"
    fi
}

#####################################################################
# Main Deployment Flow
#####################################################################

deploy() {
    echo ""
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║                                                        ║"
    echo "║           PsyConnect Production Deployment            ║"
    echo "║                                                        ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo ""
    log "Deployment started: $(date)"
    log "Environment: $ENVIRONMENT"
    log "Project directory: $PROJECT_DIR"
    echo ""

    # Pre-flight checks
    run_preflight_checks

    if [ "$CHECK_ONLY" = true ]; then
        success "Check-only mode: All checks passed!"
        exit 0
    fi

    echo ""
    if ! confirm "Continue with deployment?"; then
        warning "Deployment cancelled by user"
        exit 0
    fi

    # Create backup
    echo ""
    create_backup

    # Install dependencies
    echo ""
    install_dependencies

    # Setup database
    echo ""
    setup_database

    # Setup missing images
    echo ""
    setup_missing_images

    # Build application
    echo ""
    build_application

    # Setup PM2
    echo ""
    setup_pm2

    # Wait for server
    echo ""
    wait_for_server

    # Run health checks
    echo ""
    run_health_checks

    # Setup Nginx (optional)
    echo ""
    setup_nginx

    # Final summary
    echo ""
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║                                                        ║"
    echo "║            🎉 Deployment Completed! 🎉                 ║"
    echo "║                                                        ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo ""
    success "Deployment log: $LOG_FILE"
    echo ""
    echo "Next steps:"
    echo "  1. Test your application: $NEXT_PUBLIC_APP_URL"
    echo "  2. Monitor logs: pm2 logs psyconnect"
    echo "  3. Check status: pm2 status"
    echo ""
    echo "Useful commands:"
    echo "  pm2 restart psyconnect  - Restart app"
    echo "  pm2 logs psyconnect     - View logs"
    echo "  pm2 monit               - Monitor resources"
    echo "  ./deploy.sh --rollback  - Rollback deployment"
    echo ""
}

#####################################################################
# Main Entry Point
#####################################################################

main() {
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            gcp|hostinger|both)
                ENVIRONMENT=$1
                shift
                ;;
            --skip-db)
                SKIP_DB=true
                shift
                ;;
            --skip-build)
                SKIP_BUILD=true
                shift
                ;;
            --check-only)
                CHECK_ONLY=true
                shift
                ;;
            --rollback)
                ROLLBACK=true
                shift
                ;;
            -h|--help)
                cat << EOF
PsyConnect Deployment Script

Usage: $0 [environment] [options]

Environments:
  gcp       Deploy to Google Cloud VM
  hostinger Deploy to Hostinger VPS
  both      Deploy to both servers

Options:
  --skip-db       Skip database migrations and seeding
  --skip-build    Skip build step (use existing build)
  --check-only    Only run pre-deployment checks
  --rollback      Rollback to previous deployment
  -h, --help      Show this help message

Examples:
  $0 gcp
  $0 hostinger --skip-db
  $0 both --check-only
  $0 --rollback

EOF
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done

    # Set default environment if not specified
    if [ -z "$ENVIRONMENT" ] && [ "$ROLLBACK" = false ]; then
        ENVIRONMENT="gcp"
        warning "No environment specified, defaulting to: $ENVIRONMENT"
    fi

    # Handle rollback
    if [ "$ROLLBACK" = true ]; then
        rollback_deployment
        exit 0
    fi

    # Run deployment
    deploy
}

# Run main function
main "$@"
