#!/usr/bin/env bash
# InsightPulse Odoo - Database Restore Script
# Restores a PostgreSQL backup from compressed file

set -euo pipefail

# Configuration
BACKUP_FILE="${1:-}"
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

function log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

function log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validate backup file
if [ -z "$BACKUP_FILE" ]; then
    log_error "Backup file not specified"
    echo "Usage: $0 <backup_file.sql.gz>"
    echo ""
    echo "Available backups:"
    ls -lh backups/odoo_*.sql.gz 2>/dev/null || echo "  No backups found"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    log_error "Backup file not found: ${BACKUP_FILE}"
    exit 1
fi

# Confirmation
log_warn "⚠️  WARNING: This will REPLACE the current database: ${DB_NAME}"
log_warn "⚠️  All current data will be LOST"
echo ""
log_info "Backup file: ${BACKUP_FILE}"
log_info "Target database: ${DB_NAME}"
echo ""
read -p "Are you sure you want to continue? (type 'yes' to confirm): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    log_error "Restore cancelled"
    exit 1
fi

# Stop Odoo to prevent database access
log_info "Stopping Odoo services..."
docker compose ${COMPOSE_FILES} stop odoo

# Drop existing database
log_info "Dropping existing database..."
docker compose ${COMPOSE_FILES} exec -T db psql -U odoo postgres <<EOF
DROP DATABASE IF EXISTS ${DB_NAME};
CREATE DATABASE ${DB_NAME} OWNER odoo;
EOF

# Restore from backup
log_info "Restoring database from backup..."
if gunzip -c "${BACKUP_FILE}" | docker compose ${COMPOSE_FILES} exec -T db psql -U odoo "${DB_NAME}"; then
    log_info "✅ Database restored successfully"
else
    log_error "Database restore failed"
    exit 1
fi

# Restart Odoo
log_info "Restarting Odoo services..."
docker compose ${COMPOSE_FILES} start odoo

# Wait for Odoo to be ready
log_info "Waiting for Odoo to initialize..."
sleep 10

# Health check
if docker compose ${COMPOSE_FILES} exec -T odoo curl -f http://localhost:8069/web/health > /dev/null 2>&1; then
    log_info "✅ Odoo is healthy"
else
    log_warn "⚠️  Odoo health check failed - check logs"
fi

log_info "✅ Restore complete!"
