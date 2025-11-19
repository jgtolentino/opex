#!/bin/bash
#
# Disable IAP Modules Script
#
# This script disables all IAP (In-App Purchase) related modules in Odoo.
# Run this after initial database setup to ensure complete isolation from odoo.com.
#
# Usage:
#   ./disable-iap.sh <database_name>
#
# Example:
#   ./disable-iap.sh production

set -euo pipefail

# Configuration
DB_NAME="${1:-}"
ODOO_CONTAINER="${ODOO_CONTAINER:-ipai_odoo}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ -z "$DB_NAME" ]; then
    echo -e "${RED}Error: Database name required${NC}"
    echo "Usage: $0 <database_name>"
    exit 1
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}IAP Module Disabling Tool${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Database: ${DB_NAME}${NC}"
echo ""

# SQL commands to disable IAP
SQL_COMMANDS=$(cat <<'EOF'
-- Disable IAP account entries
UPDATE iap_account SET account_token = account_token || '+disabled' WHERE account_token NOT LIKE '%+disabled';

-- Uninstall IAP-related modules (if installed)
UPDATE ir_module_module SET state = 'uninstalled' WHERE name LIKE 'iap%' AND state != 'uninstalled';

-- Disable IAP-related scheduled actions
UPDATE ir_cron SET active = FALSE WHERE name ILIKE '%iap%';

-- Disable update notification cron
UPDATE ir_cron SET active = FALSE WHERE name ILIKE '%update%notification%';

-- Disable publisher warranty cron
UPDATE ir_cron SET active = FALSE WHERE name ILIKE '%publisher%';

-- Set database as neutralized (prevents phone-home)
INSERT INTO ir_config_parameter (key, value, create_uid, create_date, write_uid, write_date)
VALUES ('database.is_neutralized', 'True', 1, NOW(), 1, NOW())
ON CONFLICT (key) DO UPDATE SET value = 'True';

-- Confirm changes
SELECT
    COUNT(*) as disabled_accounts,
    (SELECT COUNT(*) FROM ir_module_module WHERE name LIKE 'iap%' AND state = 'uninstalled') as uninstalled_modules,
    (SELECT COUNT(*) FROM ir_cron WHERE active = FALSE AND name ILIKE '%iap%') as disabled_crons
FROM iap_account
WHERE account_token LIKE '%+disabled';
EOF
)

echo -e "${YELLOW}Executing IAP cleanup SQL...${NC}"
echo ""

# Execute SQL via docker
docker exec -i "${ODOO_CONTAINER}" psql -U odoo -d "${DB_NAME}" <<< "$SQL_COMMANDS"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}IAP Disabling Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}What was done:${NC}"
echo "✓ Disabled all IAP account tokens"
echo "✓ Uninstalled IAP-related modules"
echo "✓ Disabled IAP scheduled actions"
echo "✓ Disabled update notification checks"
echo "✓ Set database as neutralized"
echo ""
echo -e "${YELLOW}Recommended next steps:${NC}"
echo "1. Restart Odoo: docker-compose restart odoo"
echo "2. Clear browser cache and log back in"
echo "3. Verify no odoo.com links remain in the UI"
echo "4. Check System Parameters: Settings → Technical → Parameters"
echo "   - Confirm web.base.url is set to your domain"
echo "   - Confirm web.base.url.freeze = True"
echo ""
