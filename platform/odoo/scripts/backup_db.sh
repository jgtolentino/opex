#!/usr/bin/env bash
# InsightPulse Odoo - Database Backup Script
# Creates compressed PostgreSQL backups with rotation

set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/opt/odoo/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
DB_NAME="${DB_NAME:-odoo}"
COMPOSE_FILES="${COMPOSE_FILES:--f docker/docker-compose.base.yml -f docker/docker-compose.prod.yml}"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

function log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

function log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create backup directory
mkdir -p "${BACKUP_DIR}"

# Generate backup filename with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/odoo_${DB_NAME}_${TIMESTAMP}.sql.gz"

log_info "Starting database backup..."
log_info "Database: ${DB_NAME}"
log_info "Backup file: ${BACKUP_FILE}"

# Create backup
if docker compose ${COMPOSE_FILES} exec -T db pg_dump -U odoo "${DB_NAME}" | gzip > "${BACKUP_FILE}"; then
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    log_info "✅ Backup completed successfully (${BACKUP_SIZE})"
else
    log_error "Backup failed"
    exit 1
fi

# Verify backup file
if [ ! -s "${BACKUP_FILE}" ]; then
    log_error "Backup file is empty"
    exit 1
fi

# Remove old backups
log_info "Removing backups older than ${RETENTION_DAYS} days..."
DELETED=$(find "${BACKUP_DIR}" -name "odoo_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete -print | wc -l)
if [ "$DELETED" -gt 0 ]; then
    log_info "Removed ${DELETED} old backup(s)"
else
    log_info "No old backups to remove"
fi

# List recent backups
log_info "Recent backups:"
ls -lh "${BACKUP_DIR}"/odoo_*.sql.gz | tail -5

log_info "✅ Backup process complete"
