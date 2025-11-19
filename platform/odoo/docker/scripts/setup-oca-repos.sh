#!/bin/bash
#
# OCA Repository Setup Script
#
# This script clones OCA repositories for Odoo 18.0 and sets them up
# for use with the InsightPulse Odoo deployment.
#
# Usage:
#   ./setup-oca-repos.sh [branch]
#
# Example:
#   ./setup-oca-repos.sh 18.0

set -euo pipefail

# Configuration
OCA_BRANCH="${1:-18.0}"
OCA_BASE_DIR="$(dirname "$0")/../oca-addons"
OCA_BASE_URL="https://github.com/OCA"

# OCA repositories to clone
# These are the most commonly used OCA repos for production deployments
OCA_REPOS=(
    "server-tools"        # Server environment, database tools, etc.
    "server-ux"          # User experience improvements
    "web"                # Web client enhancements
    "reporting-engine"   # Report templates and engines
    "server-brand"       # Branding removal tools (similar to our module)
    "server-auth"        # Authentication extensions
    "account-financial-tools" # Accounting utilities
    "partner-contact"    # Contact/partner management
    "queue"              # Job queue for async tasks
    "rest-framework"     # REST API framework
)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}OCA Repository Setup for Odoo ${OCA_BRANCH}${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Create OCA addons directory if it doesn't exist
if [ ! -d "$OCA_BASE_DIR" ]; then
    echo -e "${YELLOW}Creating OCA addons directory: ${OCA_BASE_DIR}${NC}"
    mkdir -p "$OCA_BASE_DIR"
fi

cd "$OCA_BASE_DIR"

# Clone/update each repository
for repo in "${OCA_REPOS[@]}"; do
    echo ""
    echo -e "${GREEN}Processing: ${repo}${NC}"

    if [ -d "$repo" ]; then
        echo -e "${YELLOW}Repository already exists, pulling latest changes...${NC}"
        cd "$repo"

        # Check if we're on the right branch
        current_branch=$(git rev-parse --abbrev-ref HEAD)
        if [ "$current_branch" != "$OCA_BRANCH" ]; then
            echo -e "${YELLOW}Switching from ${current_branch} to ${OCA_BRANCH}${NC}"
            git fetch origin
            git checkout "$OCA_BRANCH"
        fi

        # Pull latest changes
        git pull origin "$OCA_BRANCH"
        cd ..
    else
        echo -e "${YELLOW}Cloning ${repo}...${NC}"
        git clone -b "$OCA_BRANCH" --depth 1 "${OCA_BASE_URL}/${repo}.git"
    fi

    echo -e "${GREEN}✓ ${repo} is ready${NC}"
done

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}OCA Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Review the cloned repositories in: ${OCA_BASE_DIR}"
echo "2. Add specific modules to your odoo.conf addons_path if needed"
echo "3. Update your Odoo modules list: Apps → Update Apps List"
echo "4. Install the OCA modules you need"
echo ""
echo -e "${GREEN}Commonly useful OCA modules:${NC}"
echo "  - base_tier_validation (Approval workflows)"
echo "  - web_responsive (Mobile-friendly interface)"
echo "  - web_environment_ribbon (Environment indicator)"
echo "  - auth_session_timeout (Session security)"
echo "  - date_range (Date range management)"
echo "  - sql_request_abstract (SQL query builder)"
echo ""
