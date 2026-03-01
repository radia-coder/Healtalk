#!/bin/bash

#####################################################################
# PsyConnect Health Check Script
#
# Performs comprehensive health checks on the deployed application
#
# Usage: ./scripts/health-check.sh [--verbose]
#####################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

VERBOSE=false
if [[ "$1" == "--verbose" ]]; then
    VERBOSE=true
fi

# Load environment variables
if [ -f .env ]; then
    source .env
fi

APP_URL="${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"
LOCALHOST_URL="http://localhost:3000"

success() { echo -e "${GREEN}✅ $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

echo "╔════════════════════════════════════════════════════════╗"
echo "║         PsyConnect Health Check Report                ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

#####################################################################
# 1. Environment Check
#####################################################################

echo "📋 Environment Configuration"
echo "─────────────────────────────────────────────────────────"

if [ -f .env ]; then
    success ".env file exists"

    # Check critical variables
    if [ -n "$DATABASE_URL" ]; then
        success "DATABASE_URL configured"
        [ "$VERBOSE" = true ] && info "  ${DATABASE_URL:0:30}..."
    else
        error "DATABASE_URL not set"
    fi

    if [ -n "$NEXT_PUBLIC_APP_URL" ]; then
        success "NEXT_PUBLIC_APP_URL: $NEXT_PUBLIC_APP_URL"
    else
        warning "NEXT_PUBLIC_APP_URL not set (using default)"
    fi

    if [ -n "$NEXTAUTH_SECRET" ]; then
        success "NEXTAUTH_SECRET configured"
    else
        error "NEXTAUTH_SECRET not set"
    fi

else
    error ".env file not found"
fi

echo ""

#####################################################################
# 2. Database Check
#####################################################################

echo "🗄️  Database Status"
echo "─────────────────────────────────────────────────────────"

if npx prisma db execute --stdin <<< "SELECT 1;" &> /dev/null; then
    success "Database connection successful"

    # Count records
    if [ "$VERBOSE" = true ]; then
        echo ""
        info "Record counts:"
        npx prisma db execute --stdin <<< "
            SELECT 'Users' as table_name, COUNT(*)::text as count FROM \"User\"
            UNION ALL SELECT 'Psychologists', COUNT(*)::text FROM \"Psychologist\"
            UNION ALL SELECT 'Blog Posts', COUNT(*)::text FROM \"BlogPost\"
            UNION ALL SELECT 'Appointments', COUNT(*)::text FROM \"Appointment\";
        " 2>/dev/null | grep -v "table_name" | while read -r line; do
            info "  $line"
        done
    else
        PSYCH_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"Psychologist\";" 2>/dev/null | tail -1 | tr -d '() ')
        BLOG_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"BlogPost\";" 2>/dev/null | tail -1 | tr -d '() ')

        if [ "$PSYCH_COUNT" -gt 0 ]; then
            success "Psychologists: $PSYCH_COUNT"
        else
            warning "No psychologists in database"
        fi

        if [ "$BLOG_COUNT" -gt 0 ]; then
            success "Blog posts: $BLOG_COUNT"
        else
            warning "No blog posts in database"
        fi
    fi
else
    error "Database connection failed"
fi

echo ""

#####################################################################
# 3. Application Server Check
#####################################################################

echo "🚀 Application Server"
echo "─────────────────────────────────────────────────────────"

# Check if PM2 is running
if command -v pm2 &> /dev/null; then
    PM2_STATUS=$(pm2 jlist 2>/dev/null | grep -o '"name":"psyconnect"' || echo "")

    if [ -n "$PM2_STATUS" ]; then
        success "PM2 process running"

        if [ "$VERBOSE" = true ]; then
            pm2 info psyconnect
        fi
    else
        warning "PM2 installed but psyconnect not running"
        echo "    Start with: pm2 start ecosystem.config.js"
    fi
else
    info "PM2 not installed (using direct node?)"
fi

# Check if server is responding
if curl -s -o /dev/null -w "%{http_code}" "$LOCALHOST_URL" | grep -q "200\|301\|302"; then
    success "Server responding on localhost:3000"
else
    error "Server not responding on localhost:3000"
fi

echo ""

#####################################################################
# 4. API Endpoints Check
#####################################################################

echo "🔌 API Endpoints"
echo "─────────────────────────────────────────────────────────"

# Test Blog API
BLOG_RESPONSE=$(curl -s "$LOCALHOST_URL/api/blog" 2>/dev/null)
if echo "$BLOG_RESPONSE" | grep -q '"posts"'; then
    BLOG_POST_COUNT=$(echo "$BLOG_RESPONSE" | grep -o '"posts":\[' | wc -l)
    if [ "$BLOG_POST_COUNT" -gt 0 ]; then
        success "Blog API (/api/blog) - OK"
        [ "$VERBOSE" = true ] && echo "$BLOG_RESPONSE" | grep -o '"total":[0-9]*' | sed 's/.*:/    Posts: /'
    else
        warning "Blog API responding but no posts"
    fi
else
    error "Blog API (/api/blog) - FAILED"
    [ "$VERBOSE" = true ] && echo "    Response: ${BLOG_RESPONSE:0:100}"
fi

# Test Psychologists API
PSYCH_RESPONSE=$(curl -s "$LOCALHOST_URL/api/psychologists" 2>/dev/null)
if echo "$PSYCH_RESPONSE" | grep -q '"psychologists"'; then
    PSYCH_COUNT=$(echo "$PSYCH_RESPONSE" | grep -o '"psychologists":\[' | wc -l)
    if [ "$PSYCH_COUNT" -gt 0 ]; then
        success "Psychologists API (/api/psychologists) - OK"
        [ "$VERBOSE" = true ] && echo "$PSYCH_RESPONSE" | grep -o '"total":[0-9]*' | sed 's/.*:/    Psychologists: /'
    else
        warning "Psychologists API responding but no data"
    fi
else
    error "Psychologists API (/api/psychologists) - FAILED"
    [ "$VERBOSE" = true ] && echo "    Response: ${PSYCH_RESPONSE:0:100}"
fi

echo ""

#####################################################################
# 5. Static Files Check
#####################################################################

echo "📁 Static Files"
echo "─────────────────────────────────────────────────────────"

# Check logo
if curl -s -I "$LOCALHOST_URL/images/logo.png" | grep -q "200"; then
    success "Logo image accessible"
else
    warning "Logo image not accessible"
fi

# Check for doctor images
DOCTOR_IMAGES_EXIST=0
for i in {1..4}; do
    if [ -f "public/images/doctor-$i.jpg" ]; then
        DOCTOR_IMAGES_EXIST=$((DOCTOR_IMAGES_EXIST + 1))
    fi
done

if [ $DOCTOR_IMAGES_EXIST -eq 4 ]; then
    success "All doctor images present ($DOCTOR_IMAGES_EXIST/4)"
elif [ $DOCTOR_IMAGES_EXIST -gt 0 ]; then
    warning "Some doctor images missing ($DOCTOR_IMAGES_EXIST/4)"
else
    warning "No doctor images found (will use placeholders)"
fi

# Check blog images
BLOG_IMAGES_EXIST=0
for i in {1..3}; do
    if [ -f "public/images/Blog$i.png" ]; then
        BLOG_IMAGES_EXIST=$((BLOG_IMAGES_EXIST + 1))
    fi
done

if [ $BLOG_IMAGES_EXIST -eq 3 ]; then
    success "All blog images present ($BLOG_IMAGES_EXIST/3)"
else
    warning "Some blog images missing ($BLOG_IMAGES_EXIST/3)"
fi

echo ""

#####################################################################
# 6. Page Rendering Check
#####################################################################

echo "🌐 Page Rendering"
echo "─────────────────────────────────────────────────────────"

# Homepage
if curl -s "$LOCALHOST_URL" | grep -q "HealTalk\|PsyConnect"; then
    success "Homepage renders correctly"
else
    warning "Homepage may have rendering issues"
fi

# Blog page
if curl -s "$LOCALHOST_URL/resources/blog" | grep -q "blog\|Blog"; then
    success "Blog page accessible"
else
    warning "Blog page may have issues"
fi

# Find Psychologists page
if curl -s "$LOCALHOST_URL/find-psychologists" | grep -q "psychologist\|therapist"; then
    success "Find Psychologists page accessible"
else
    warning "Find Psychologists page may have issues"
fi

echo ""

#####################################################################
# 7. Build Check
#####################################################################

echo "🔨 Build Status"
echo "─────────────────────────────────────────────────────────"

if [ -d ".next" ]; then
    success ".next build directory exists"

    BUILD_SIZE=$(du -sh .next 2>/dev/null | cut -f1)
    [ "$VERBOSE" = true ] && info "  Build size: $BUILD_SIZE"

    if [ -f ".next/BUILD_ID" ]; then
        BUILD_ID=$(cat .next/BUILD_ID)
        info "  Build ID: $BUILD_ID"
    fi
else
    error ".next build directory not found"
    echo "    Run: npm run build"
fi

echo ""

#####################################################################
# 8. System Resources
#####################################################################

echo "💻 System Resources"
echo "─────────────────────────────────────────────────────────"

# CPU and Memory
if command -v free &> /dev/null; then
    MEMORY_USAGE=$(free -m | awk 'NR==2{printf "%.0f%%", $3*100/$2 }')
    info "Memory usage: $MEMORY_USAGE"
fi

# Disk space
DISK_USAGE=$(df -h . | awk 'NR==2{print $5}')
DISK_AVAIL=$(df -h . | awk 'NR==2{print $4}')
info "Disk usage: $DISK_USAGE (Available: $DISK_AVAIL)"

# Node processes
NODE_PROCS=$(ps aux | grep -c "[n]ode" || echo "0")
info "Node processes: $NODE_PROCS"

echo ""

#####################################################################
# Summary
#####################################################################

echo "╔════════════════════════════════════════════════════════╗"
echo "║                   Health Check Complete               ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Generate quick summary
TOTAL_CHECKS=0
PASSED_CHECKS=0

# Simple check results tracking would go here
# For now, just show timestamp
echo "Report generated: $(date)"
echo ""
echo "For detailed logs, run with --verbose flag:"
echo "  ./scripts/health-check.sh --verbose"
echo ""
