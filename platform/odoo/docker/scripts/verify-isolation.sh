#!/bin/bash
#
# Verify Odoo Isolation Script
#
# This script checks that your Odoo instance is completely isolated from odoo.com
# and reports any remaining connections or branding.
#
# Usage:
#   ./verify-isolation.sh <database_name>
#
# Example:
#   ./verify-isolation.sh production

set -euo pipefail

# Configuration
DB_NAME="${1:-}"
ODOO_CONTAINER="${ODOO_CONTAINER:-ipai_odoo}"
ODOO_URL="${ODOO_URL:-http://localhost:8069}"

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
echo -e "${GREEN}Odoo Isolation Verification Tool${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Database: ${DB_NAME}${NC}"
echo ""

ISSUES=0

# Check 1: System Parameters
echo -e "${YELLOW}[1/6] Checking System Parameters...${NC}"
SQL_CHECK_PARAMS=$(cat <<'EOF'
SELECT
    key,
    value,
    CASE
        WHEN key = 'web.base.url' AND value NOT LIKE '%odoo.com%' THEN '✓'
        WHEN key = 'web.base.url.freeze' AND value = 'True' THEN '✓'
        WHEN key = 'iap.endpoint' AND (value = '' OR value IS NULL) THEN '✓'
        WHEN key = 'database.is_neutralized' AND value = 'True' THEN '✓'
        ELSE '✗'
    END as status
FROM ir_config_parameter
WHERE key IN ('web.base.url', 'web.base.url.freeze', 'iap.endpoint', 'database.is_neutralized')
ORDER BY key;
EOF
)

docker exec -i "${ODOO_CONTAINER}" psql -U odoo -d "${DB_NAME}" -t <<< "$SQL_CHECK_PARAMS" | while read line; do
    if [[ "$line" == *"✗"* ]]; then
        echo -e "${RED}  ${line}${NC}"
        ((ISSUES++)) || true
    else
        echo -e "${GREEN}  ${line}${NC}"
    fi
done

# Check 2: IAP Modules
echo ""
echo -e "${YELLOW}[2/6] Checking IAP Modules...${NC}"
SQL_CHECK_IAP=$(cat <<'EOF'
SELECT name, state
FROM ir_module_module
WHERE name LIKE 'iap%'
ORDER BY name;
EOF
)

IAP_MODULES=$(docker exec -i "${ODOO_CONTAINER}" psql -U odoo -d "${DB_NAME}" -t <<< "$SQL_CHECK_IAP")
if [ -z "$IAP_MODULES" ]; then
    echo -e "${GREEN}  ✓ No IAP modules found${NC}"
else
    while read -r line; do
        if [[ "$line" == *"installed"* ]]; then
            echo -e "${RED}  ✗ ${line}${NC}"
            ((ISSUES++)) || true
        else
            echo -e "${GREEN}  ✓ ${line}${NC}"
        fi
    done <<< "$IAP_MODULES"
fi

# Check 3: Scheduled Actions
echo ""
echo -e "${YELLOW}[3/6] Checking Phone-Home Scheduled Actions...${NC}"
SQL_CHECK_CRON=$(cat <<'EOF'
SELECT name, active
FROM ir_cron
WHERE (
    name ILIKE '%iap%' OR
    name ILIKE '%update%notification%' OR
    name ILIKE '%publisher%'
)
ORDER BY name;
EOF
)

ACTIVE_CRONS=$(docker exec -i "${ODOO_CONTAINER}" psql -U odoo -d "${DB_NAME}" -t <<< "$SQL_CHECK_CRON")
if [ -z "$ACTIVE_CRONS" ]; then
    echo -e "${GREEN}  ✓ No phone-home cron jobs found${NC}"
else
    while read -r line; do
        if [[ "$line" == *"t"* ]]; then  # 't' means active=True in psql
            echo -e "${RED}  ✗ Active: ${line}${NC}"
            ((ISSUES++)) || true
        else
            echo -e "${GREEN}  ✓ Disabled: ${line}${NC}"
        fi
    done <<< "$ACTIVE_CRONS"
fi

# Check 4: Network connectivity to odoo.com
echo ""
echo -e "${YELLOW}[4/6] Checking Network Connectivity to odoo.com...${NC}"
if docker exec "${ODOO_CONTAINER}" timeout 5 curl -s -o /dev/null https://www.odoo.com 2>/dev/null; then
    echo -e "${RED}  ✗ Container CAN reach odoo.com${NC}"
    echo -e "${YELLOW}    Recommendation: Block *.odoo.com at firewall/DNS level${NC}"
    ((ISSUES++)) || true
else
    echo -e "${GREEN}  ✓ Container CANNOT reach odoo.com (good!)${NC}"
fi

# Check 5: ipai_branding_cleaner module
echo ""
echo -e "${YELLOW}[5/6] Checking ipai_branding_cleaner Module...${NC}"
SQL_CHECK_MODULE=$(cat <<'EOF'
SELECT name, state
FROM ir_module_module
WHERE name = 'ipai_branding_cleaner';
EOF
)

MODULE_STATUS=$(docker exec -i "${ODOO_CONTAINER}" psql -U odoo -d "${DB_NAME}" -t <<< "$SQL_CHECK_MODULE")
if [[ "$MODULE_STATUS" == *"installed"* ]]; then
    echo -e "${GREEN}  ✓ ipai_branding_cleaner is installed${NC}"
else
    echo -e "${RED}  ✗ ipai_branding_cleaner is NOT installed${NC}"
    echo -e "${YELLOW}    Action: Install the module from Apps menu${NC}"
    ((ISSUES++)) || true
fi

# Check 6: Web UI Check (if curl is available)
echo ""
echo -e "${YELLOW}[6/6] Checking Web UI for odoo.com References...${NC}"
if command -v curl &> /dev/null; then
    UI_HTML=$(curl -s "${ODOO_URL}/web/login")
    ODOO_COUNT=$(echo "$UI_HTML" | grep -o "odoo\.com" | wc -l)

    if [ "$ODOO_COUNT" -eq 0 ]; then
        echo -e "${GREEN}  ✓ No odoo.com references found in login page${NC}"
    else
        echo -e "${RED}  ✗ Found ${ODOO_COUNT} odoo.com references in login page${NC}"
        echo -e "${YELLOW}    Action: Check ipai_branding_cleaner JavaScript console logs${NC}"
        ((ISSUES++)) || true
    fi
else
    echo -e "${YELLOW}  ⊘ Skipping (curl not available)${NC}"
fi

# Summary
echo ""
echo -e "${GREEN}========================================${NC}"
if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo -e "${GREEN}Your Odoo instance is fully isolated from odoo.com${NC}"
else
    echo -e "${RED}✗ Found ${ISSUES} issue(s)${NC}"
    echo -e "${YELLOW}Please review the recommendations above${NC}"
fi
echo -e "${GREEN}========================================${NC}"
echo ""

exit $ISSUES
