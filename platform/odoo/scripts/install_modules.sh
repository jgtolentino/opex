#!/usr/bin/env bash
# InsightPulse Odoo - Module Installation Script
# Install or upgrade IPAI custom modules

set -euo pipefail

# Configuration
DB_NAME="${DB_NAME:-odoo}"
COMPOSE_FILES="${COMPOSE_FILES:--f docker/docker-compose.base.yml -f docker/docker-compose.prod.yml}"

# IPAI modules to install/upgrade
MODULES="ipai_docs,ipai_docs_project,ipai_cash_advance,ipai_expense,ipai_equipment,ipai_ocr_expense,ipai_finance_ppm,ipai_finance_monthly_closing,ipai_finance_ssc,ipai_ppm_monthly_close,tbwa_spectra_integration"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Parse command line arguments
MODE="${1:-install}"  # install | upgrade | uninstall

case "$MODE" in
    install)
        log_info "Installing IPAI modules in database: ${DB_NAME}"
        ODOO_ARGS="-i ${MODULES}"
        ;;
    upgrade)
        log_info "Upgrading IPAI modules in database: ${DB_NAME}"
        ODOO_ARGS="-u ${MODULES}"
        ;;
    uninstall)
        log_warn "Uninstalling IPAI modules from database: ${DB_NAME}"
        log_warn "This will REMOVE ALL DATA from these modules!"
        read -p "Are you sure? (type 'yes' to confirm): " CONFIRM
        if [ "$CONFIRM" != "yes" ]; then
            log_error "Uninstall cancelled"
            exit 1
        fi
        ODOO_ARGS="--uninstall ${MODULES}"
        ;;
    *)
        log_error "Invalid mode: ${MODE}"
        echo "Usage: $0 [install|upgrade|uninstall]"
        exit 1
        ;;
esac

# Check if Odoo container is running
if ! docker compose ${COMPOSE_FILES} ps odoo | grep -q "Up"; then
    log_error "Odoo container is not running"
    log_info "Start it with: docker compose ${COMPOSE_FILES} up -d"
    exit 1
fi

# Execute module operation
log_info "Executing: odoo -d ${DB_NAME} ${ODOO_ARGS} --stop-after-init"
docker compose ${COMPOSE_FILES} exec odoo odoo \
    -d "${DB_NAME}" \
    ${ODOO_ARGS} \
    --stop-after-init

if [ $? -eq 0 ]; then
    log_info "Module operation completed successfully"
    log_info "Restarting Odoo services..."
    docker compose ${COMPOSE_FILES} restart odoo
    log_info "✅ Done! Odoo is restarting."
else
    log_error "Module operation failed"
    exit 1
fi

# Wait a few seconds for Odoo to start
sleep 5

# Check Odoo health
log_info "Checking Odoo health..."
if docker compose ${COMPOSE_FILES} exec odoo curl -f http://localhost:8069/web/health > /dev/null 2>&1; then
    log_info "✅ Odoo is healthy"
else
    log_warn "⚠️  Odoo health check failed - check logs"
    log_info "View logs with: docker compose ${COMPOSE_FILES} logs -f odoo"
fi
