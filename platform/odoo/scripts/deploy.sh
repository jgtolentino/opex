#!/usr/bin/env bash
# InsightPulse Odoo - Deployment Script
# Handles deployment to staging or production environments

set -euo pipefail

# Configuration
ENVIRONMENT="${1:-staging}"  # staging | prod
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

function log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

function log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

function log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

function log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "prod" ]]; then
    log_error "Invalid environment: ${ENVIRONMENT}"
    echo "Usage: $0 [staging|prod]"
    exit 1
fi

log_info "🚀 Deploying Odoo to ${ENVIRONMENT} environment"
log_info "Project root: ${PROJECT_ROOT}"

# Set compose files based on environment
COMPOSE_BASE="${PROJECT_ROOT}/docker/docker-compose.base.yml"
COMPOSE_ENV="${PROJECT_ROOT}/docker/docker-compose.${ENVIRONMENT}.yml"

if [ ! -f "$COMPOSE_BASE" ]; then
    log_error "Base compose file not found: ${COMPOSE_BASE}"
    exit 1
fi

if [ ! -f "$COMPOSE_ENV" ]; then
    log_error "Environment compose file not found: ${COMPOSE_ENV}"
    exit 1
fi

COMPOSE_FILES="-f ${COMPOSE_BASE} -f ${COMPOSE_ENV}"
export COMPOSE_FILES

# Step 1: Pull latest images
log_step "1/5 Pulling latest Docker images..."
if docker compose ${COMPOSE_FILES} pull; then
    log_info "✅ Images pulled successfully"
else
    log_error "Failed to pull images"
    exit 1
fi

# Step 2: Backup database (production only)
if [ "$ENVIRONMENT" == "prod" ]; then
    log_step "2/5 Creating database backup..."
    BACKUP_DIR="${PROJECT_ROOT}/backups"
    mkdir -p "${BACKUP_DIR}"
    BACKUP_FILE="${BACKUP_DIR}/odoo_$(date +%Y%m%d_%H%M%S).sql.gz"

    if docker compose ${COMPOSE_FILES} exec -T db pg_dump -U odoo odoo | gzip > "${BACKUP_FILE}"; then
        log_info "✅ Database backup created: ${BACKUP_FILE}"
    else
        log_error "Database backup failed"
        exit 1
    fi
else
    log_step "2/5 Skipping backup (staging environment)"
fi

# Step 3: Stop services
log_step "3/5 Stopping services..."
if docker compose ${COMPOSE_FILES} down; then
    log_info "✅ Services stopped"
else
    log_warn "Failed to stop services gracefully"
fi

# Step 4: Start services
log_step "4/5 Starting services..."
if docker compose ${COMPOSE_FILES} up -d; then
    log_info "✅ Services started"
else
    log_error "Failed to start services"
    exit 1
fi

# Wait for services to be ready
log_info "Waiting for services to initialize..."
sleep 10

# Check database health
log_info "Checking database health..."
RETRY=0
MAX_RETRY=30
while [ $RETRY -lt $MAX_RETRY ]; do
    if docker compose ${COMPOSE_FILES} exec -T db pg_isready -U odoo > /dev/null 2>&1; then
        log_info "✅ Database is ready"
        break
    fi
    RETRY=$((RETRY+1))
    echo -n "."
    sleep 2
done

if [ $RETRY -eq $MAX_RETRY ]; then
    log_error "Database failed to become ready"
    exit 1
fi

# Step 5: Update/install modules
log_step "5/5 Installing/upgrading modules..."

# Set DB_NAME based on environment
if [ "$ENVIRONMENT" == "staging" ]; then
    export DB_NAME="staging"
else
    export DB_NAME="odoo"
fi

if "${SCRIPT_DIR}/install_modules.sh" upgrade; then
    log_info "✅ Modules upgraded successfully"
else
    log_error "Module upgrade failed"
    log_warn "Check logs with: docker compose ${COMPOSE_FILES} logs -f odoo"
    exit 1
fi

# Final health check
log_info "Performing final health check..."
sleep 5

if docker compose ${COMPOSE_FILES} exec -T odoo curl -f http://localhost:8069/web/health > /dev/null 2>&1; then
    log_info "✅ Odoo is healthy and responding"
else
    log_warn "⚠️  Odoo health check failed"
    log_info "View logs with: docker compose ${COMPOSE_FILES} logs -f odoo"
fi

# Summary
echo ""
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "✅ Deployment to ${ENVIRONMENT} complete!"
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
log_info "Access Odoo at:"
if [ "$ENVIRONMENT" == "prod" ]; then
    log_info "  https://erp.insightpulseai.net"
else
    log_info "  http://staging-odoo.insightpulseai.net"
    log_info "  or http://DROPLET_IP:8069"
fi
echo ""
log_info "Useful commands:"
log_info "  View logs:    docker compose ${COMPOSE_FILES} logs -f"
log_info "  Restart:      docker compose ${COMPOSE_FILES} restart"
log_info "  Stop:         docker compose ${COMPOSE_FILES} down"
log_info "  Shell:        docker compose ${COMPOSE_FILES} exec odoo bash"
echo ""
