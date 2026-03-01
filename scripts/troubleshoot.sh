#!/bin/bash

#####################################################################
# PsyConnect Troubleshooting Script
#
# Automatically diagnoses and suggests fixes for common issues
#
# Usage: ./scripts/troubleshoot.sh [issue]
#
# Issues:
#   blog          - Blog page shows no content
#   doctors       - No doctors/psychologists showing
#   images        - Images not loading
#   database      - Database connection issues
#   all           - Run all diagnostics (default)
#####################################################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

error() { echo -e "${RED}❌ $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
fix() { echo -e "${CYAN}🔧 FIX: $1${NC}"; }

ISSUE="${1:-all}"

echo "╔════════════════════════════════════════════════════════╗"
echo "║        PsyConnect Troubleshooting Assistant           ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

#####################################################################
# Helper Functions
#####################################################################

run_fix() {
    local cmd="$1"
    local desc="$2"

    echo ""
    read -p "$(echo -e ${CYAN}Run this fix? ${NC}${desc}) (y/N): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        eval "$cmd"
        if [ $? -eq 0 ]; then
            success "Fix applied successfully"
        else
            error "Fix failed - check output above"
        fi
    else
        info "Skipped"
    fi
}

#####################################################################
# Issue 1: Blog Page Empty
#####################################################################

diagnose_blog() {
    echo "🔍 Diagnosing: Blog page showing no content"
    echo "─────────────────────────────────────────────────────────"

    # Check 1: API endpoint
    info "Checking /api/blog endpoint..."
    BLOG_API_RESPONSE=$(curl -s http://localhost:3000/api/blog 2>/dev/null)

    if echo "$BLOG_API_RESPONSE" | grep -q "error"; then
        error "API returned error"
        echo "$BLOG_API_RESPONSE"

        fix "Check database connection and Prisma schema"

    elif echo "$BLOG_API_RESPONSE" | grep -q '"posts":\[\]'; then
        error "API returns empty posts array"

        # Check database
        info "Checking database for blog posts..."
        BLOG_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"BlogPost\";" 2>/dev/null | tail -1 | tr -d '() ')

        if [ "$BLOG_COUNT" = "0" ] || [ -z "$BLOG_COUNT" ]; then
            error "No blog posts in database"

            fix "Run database seed:"
            echo "    npm run db:seed"
            echo ""

            run_fix "npm run db:seed" "Seed database with sample blog posts"

        else
            warning "Database has $BLOG_COUNT posts but API returns empty"

            info "Checking published status..."
            PUBLISHED_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"BlogPost\" WHERE published = true;" 2>/dev/null | tail -1 | tr -d '() ')

            if [ "$PUBLISHED_COUNT" = "0" ]; then
                error "No published blog posts"

                fix "Publish all blog posts:"
                echo "    npx prisma db execute --stdin <<< \"UPDATE \\\"BlogPost\\\" SET published = true;\""
                echo ""

                run_fix "npx prisma db execute --stdin <<< \"UPDATE \\\"BlogPost\\\" SET published = true;\"" "Publish all blog posts"
            fi
        fi

    elif echo "$BLOG_API_RESPONSE" | grep -q '"posts":\['; then
        success "API returns blog posts"

        # Check if page renders them
        info "Checking if blog page renders posts..."

        if curl -s http://localhost:3000/resources/blog | grep -q "blog\|Blog"; then
            success "Blog page is accessible"

            warning "If you still don't see posts, check:"
            echo "    1. Browser console for JavaScript errors"
            echo "    2. NEXT_PUBLIC_APP_URL matches your domain"
            echo "    3. Clear browser cache and hard reload (Ctrl+Shift+R)"
        else
            error "Blog page not rendering properly"
            fix "Restart the application:"
            echo "    pm2 restart psyconnect"
        fi
    else
        warning "Unexpected API response"
        echo "$BLOG_API_RESPONSE" | head -20
    fi

    echo ""
}

#####################################################################
# Issue 2: No Doctors/Psychologists
#####################################################################

diagnose_doctors() {
    echo "🔍 Diagnosing: No doctors/psychologists showing"
    echo "─────────────────────────────────────────────────────────"

    # Check 1: API endpoint
    info "Checking /api/psychologists endpoint..."
    PSYCH_API_RESPONSE=$(curl -s http://localhost:3000/api/psychologists 2>/dev/null)

    if echo "$PSYCH_API_RESPONSE" | grep -q "error"; then
        error "API returned error"
        echo "$PSYCH_API_RESPONSE"

    elif echo "$PSYCH_API_RESPONSE" | grep -q '"psychologists":\[\]'; then
        error "API returns empty psychologists array"

        # Check database
        info "Checking database for psychologists..."
        PSYCH_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"Psychologist\";" 2>/dev/null | tail -1 | tr -d '() ')

        if [ "$PSYCH_COUNT" = "0" ] || [ -z "$PSYCH_COUNT" ]; then
            error "No psychologists in database"

            fix "Run database seed:"
            echo "    npm run db:seed"
            echo ""

            run_fix "npm run db:seed" "Seed database with sample psychologists"

        else
            warning "Database has $PSYCH_COUNT psychologists but API returns empty"

            info "Checking approval status..."
            APPROVED_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"Psychologist\" WHERE status = 'APPROVED';" 2>/dev/null | tail -1 | tr -d '() ')

            if [ "$APPROVED_COUNT" = "0" ]; then
                error "No APPROVED psychologists (API only shows approved)"

                fix "Approve all psychologists:"
                echo "    npx prisma db execute --stdin <<< \"UPDATE \\\"Psychologist\\\" SET status = 'APPROVED';\""
                echo ""

                run_fix "npx prisma db execute --stdin <<< \"UPDATE \\\"Psychologist\\\" SET status = 'APPROVED';\"" "Approve all psychologists"
            fi
        fi

    elif echo "$PSYCH_API_RESPONSE" | grep -q '"psychologists":\['; then
        success "API returns psychologists"

        # Check images
        info "Checking if psychologists have profile images..."
        NULL_IMAGES=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"User\" u JOIN \"Psychologist\" p ON u.id = p.\"userId\" WHERE u.image IS NULL;" 2>/dev/null | tail -1 | tr -d '() ')

        if [ "$NULL_IMAGES" != "0" ]; then
            warning "$NULL_IMAGES psychologists have no profile image"
            info "They will use placeholder avatars"
        fi

        warning "If you still don't see psychologists, check:"
        echo "    1. Browser console for JavaScript errors"
        echo "    2. Network tab for failed API calls"
        echo "    3. Clear filters on the page"
    else
        warning "Unexpected API response"
        echo "$PSYCH_API_RESPONSE" | head -20
    fi

    echo ""
}

#####################################################################
# Issue 3: Images Not Loading
#####################################################################

diagnose_images() {
    echo "🔍 Diagnosing: Images not loading"
    echo "─────────────────────────────────────────────────────────"

    # Check 1: Static files directory
    info "Checking public/images directory..."

    if [ -d "public/images" ]; then
        IMAGE_COUNT=$(find public/images -type f \( -name "*.jpg" -o -name "*.png" -o -name "*.svg" \) | wc -l)
        success "public/images exists with $IMAGE_COUNT images"

        # List images
        echo ""
        info "Images found:"
        find public/images -type f \( -name "*.jpg" -o -name "*.png" \) | sort | sed 's/^/    /'
        echo ""

        # Check for doctor images
        MISSING_DOCTORS=()
        for i in {1..4}; do
            if [ ! -f "public/images/doctor-$i.jpg" ]; then
                MISSING_DOCTORS+=("doctor-$i.jpg")
            fi
        done

        if [ ${#MISSING_DOCTORS[@]} -gt 0 ]; then
            warning "Missing doctor images: ${MISSING_DOCTORS[*]}"

            fix "Download placeholder doctor images:"
            echo "    cd public/images"
            echo "    curl -o doctor-1.jpg 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop'"
            echo "    curl -o doctor-2.jpg 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop'"
            echo "    curl -o doctor-3.jpg 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop'"
            echo "    curl -o doctor-4.jpg 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop'"
            echo ""

            run_fix "cd public/images && curl -s -o doctor-1.jpg 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop' && curl -s -o doctor-2.jpg 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop' && curl -s -o doctor-3.jpg 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop' && curl -s -o doctor-4.jpg 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop' && cd ../.." "Download all doctor placeholder images"
        fi

    else
        error "public/images directory not found"
        fix "Create directory: mkdir -p public/images"
    fi

    # Check 2: File permissions
    info "Checking file permissions..."
    UNREADABLE=$(find public/images -type f ! -perm -444 2>/dev/null | wc -l)

    if [ "$UNREADABLE" -gt 0 ]; then
        warning "$UNREADABLE images have incorrect permissions"

        fix "Fix permissions:"
        echo "    chmod -R 644 public/images/*.{jpg,png,svg}"
        echo ""

        run_fix "chmod -R 644 public/images/*" "Fix all image permissions"
    else
        success "Image permissions are correct"
    fi

    # Check 3: Test serving
    info "Testing image serving..."

    if curl -s -I http://localhost:3000/images/logo.png | grep -q "200"; then
        success "Static files being served correctly"
    else
        error "Static files not accessible"

        fix "Restart the application:"
        echo "    pm2 restart psyconnect"
        echo ""

        run_fix "pm2 restart psyconnect" "Restart application"
    fi

    # Check 4: Remote patterns (for UploadThing/external images)
    info "Checking next.config.ts for remote image patterns..."

    if grep -q "utfs.io" next.config.ts && grep -q "unsplash.com" next.config.ts; then
        success "Remote image patterns configured"
    else
        warning "Remote image patterns may need updating in next.config.ts"
    fi

    echo ""
}

#####################################################################
# Issue 4: Database Connection
#####################################################################

diagnose_database() {
    echo "🔍 Diagnosing: Database connection issues"
    echo "─────────────────────────────────────────────────────────"

    # Check 1: .env file
    info "Checking .env configuration..."

    if [ ! -f ".env" ]; then
        error ".env file not found"

        fix "Create .env file:"
        echo "    cp .env.example .env"
        echo "    nano .env  # Edit with your database credentials"
        echo ""

        run_fix "cp .env.example .env" "Create .env from template"
        return
    fi

    success ".env file exists"

    # Check DATABASE_URL
    source .env

    if [ -z "$DATABASE_URL" ]; then
        error "DATABASE_URL not set in .env"

        fix "Add DATABASE_URL to .env:"
        echo '    DATABASE_URL="postgresql://user:password@localhost:5432/psyconnect?schema=public"'
        echo ""
        return
    fi

    success "DATABASE_URL is set"
    info "  ${DATABASE_URL:0:30}..."

    # Check 2: Connection test
    info "Testing database connection..."

    if npx prisma db execute --stdin <<< "SELECT 1;" &> /dev/null; then
        success "Database connection successful"

        # Check tables exist
        info "Checking database schema..."
        TABLE_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null | tail -1 | tr -d '() ')

        if [ "$TABLE_COUNT" -gt 0 ]; then
            success "Database has $TABLE_COUNT tables"
        else
            warning "Database exists but no tables found"

            fix "Run migrations:"
            echo "    npm run db:push"
            echo ""

            run_fix "npm run db:push" "Create database tables"
        fi

    else
        error "Cannot connect to database"

        info "Checking likely causes:"
        echo ""

        # Parse DATABASE_URL
        DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\).*/\1/p')
        DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')

        info "Database host: $DB_HOST"
        info "Database port: $DB_PORT"
        echo ""

        # Check if PostgreSQL is running
        if command -v pg_isready &> /dev/null; then
            if pg_isready -h "$DB_HOST" -p "$DB_PORT" &> /dev/null; then
                success "PostgreSQL server is running"
                warning "Connection fails - check credentials in DATABASE_URL"
            else
                error "PostgreSQL server not reachable"

                fix "Start PostgreSQL:"
                echo "    sudo systemctl start postgresql  # Linux"
                echo "    brew services start postgresql   # macOS"
            fi
        else
            warning "pg_isready not installed - cannot check PostgreSQL status"
        fi

        echo ""
        fix "Verify DATABASE_URL format:"
        echo '    postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?schema=public'
        echo ""
        echo "Common issues:"
        echo "  - Wrong username/password"
        echo "  - Database doesn't exist (create it first)"
        echo "  - PostgreSQL not running"
        echo "  - Firewall blocking port $DB_PORT"
    fi

    echo ""
}

#####################################################################
# Main Diagnostic Router
#####################################################################

case "$ISSUE" in
    blog)
        diagnose_blog
        ;;
    doctors|psychologists)
        diagnose_doctors
        ;;
    images)
        diagnose_images
        ;;
    database|db)
        diagnose_database
        ;;
    all)
        diagnose_database
        echo ""
        diagnose_blog
        echo ""
        diagnose_doctors
        echo ""
        diagnose_images
        ;;
    *)
        error "Unknown issue: $ISSUE"
        echo ""
        echo "Usage: $0 [issue]"
        echo ""
        echo "Available diagnostics:"
        echo "  blog       - Blog page shows no content"
        echo "  doctors    - No doctors/psychologists showing"
        echo "  images     - Images not loading"
        echo "  database   - Database connection issues"
        echo "  all        - Run all diagnostics (default)"
        echo ""
        exit 1
        ;;
esac

echo "╔════════════════════════════════════════════════════════╗"
echo "║              Troubleshooting Complete                 ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "If issues persist:"
echo "  1. Run full health check: ./scripts/health-check.sh --verbose"
echo "  2. Check application logs: pm2 logs psyconnect"
echo "  3. Check browser console for JavaScript errors"
echo "  4. Check Network tab for failed API requests"
echo ""
