#!/bin/bash

# n8n Workflow Setup Script
# Automates workflow import, credential configuration, and activation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
N8N_URL="https://ipa.insightpulseai.net"
WORKFLOWS_DIR="workflows/n8n"

# Check if running from project root
if [ ! -d "$WORKFLOWS_DIR" ]; then
  echo -e "${RED}Error: Must run from project root${NC}"
  echo "Current directory: $(pwd)"
  exit 1
fi

echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}n8n Workflow Setup Automation${NC}"
echo -e "${GREEN}======================================${NC}"
echo

# Step 1: Check for n8n API key
echo -e "${YELLOW}Step 1: Checking n8n API access...${NC}"

if [ -z "$N8N_API_KEY" ]; then
  echo -e "${YELLOW}N8N_API_KEY not found in environment.${NC}"
  echo
  echo "To complete automated setup, you need an n8n API key:"
  echo
  echo "1. Open: $N8N_URL"
  echo "2. Go to: Settings → API → Create API Key"
  echo "3. Copy the API key"
  echo "4. Run: export N8N_API_KEY='your-api-key'"
  echo "5. Re-run this script"
  echo
  echo -e "${YELLOW}Manual Setup Instructions:${NC}"
  echo "For now, follow the manual setup guide:"
  echo "  cat $WORKFLOWS_DIR/docs/SETUP.md"
  echo
  exit 0
fi

echo -e "${GREEN}✓ N8N_API_KEY found${NC}"
echo

# Step 2: Test n8n API connection
echo -e "${YELLOW}Step 2: Testing n8n API connection...${NC}"

API_TEST=$(curl -s -w "%{http_code}" -o /dev/null \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  "$N8N_URL/api/v1/workflows")

if [ "$API_TEST" != "200" ]; then
  echo -e "${RED}✗ Failed to connect to n8n API (HTTP $API_TEST)${NC}"
  echo "Check your N8N_API_KEY and n8n instance URL"
  exit 1
fi

echo -e "${GREEN}✓ n8n API connection successful${NC}"
echo

# Step 3: Check for Supabase credentials
echo -e "${YELLOW}Step 3: Checking Supabase credentials...${NC}"

if [ -z "$OPEX_SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo -e "${RED}✗ OPEX_SUPABASE_SERVICE_ROLE_KEY not found${NC}"
  echo "Run: source ~/.zshrc"
  exit 1
fi

if [ -z "$OPEX_SUPABASE_URL" ]; then
  echo -e "${RED}✗ OPEX_SUPABASE_URL not found${NC}"
  echo "Run: source ~/.zshrc"
  exit 1
fi

echo -e "${GREEN}✓ Supabase credentials found${NC}"
echo

# Step 4: Check for Mattermost credentials
echo -e "${YELLOW}Step 4: Checking Mattermost credentials...${NC}"

if [ -z "$MATTERMOST_WEBHOOK_URL" ]; then
  echo -e "${YELLOW}⚠ MATTERMOST_WEBHOOK_URL not set${NC}"
  echo "Workflows will be imported but Mattermost notifications won't work"
  echo "Set via: export MATTERMOST_WEBHOOK_URL='https://your-mattermost.com/hooks/xxx'"
  echo
fi

echo -e "${GREEN}✓ Mattermost credentials check complete${NC}"
echo

# Step 5: Create credentials in n8n
echo -e "${YELLOW}Step 5: Creating credentials in n8n...${NC}"

# Create Supabase credential
echo "Creating Supabase (Service Role) credential..."
SUPABASE_CRED=$(cat <<EOF
{
  "name": "Supabase OpEx (Service Role)",
  "type": "httpHeaderAuth",
  "data": {
    "name": "apikey",
    "value": "$OPEX_SUPABASE_SERVICE_ROLE_KEY"
  }
}
EOF
)

SUPABASE_CRED_ID=$(curl -s -X POST \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$SUPABASE_CRED" \
  "$N8N_URL/api/v1/credentials" | jq -r '.id // empty')

if [ -n "$SUPABASE_CRED_ID" ]; then
  echo -e "${GREEN}✓ Supabase credential created (ID: $SUPABASE_CRED_ID)${NC}"
else
  echo -e "${YELLOW}⚠ Supabase credential may already exist or failed to create${NC}"
fi

# Create Mattermost webhook credential (if URL provided)
if [ -n "$MATTERMOST_WEBHOOK_URL" ]; then
  echo "Creating Mattermost webhook credential..."
  MATTERMOST_CRED=$(cat <<EOF
{
  "name": "Mattermost Webhook",
  "type": "httpRequest",
  "data": {
    "url": "$MATTERMOST_WEBHOOK_URL"
  }
}
EOF
)

  MATTERMOST_CRED_ID=$(curl -s -X POST \
    -H "X-N8N-API-KEY: $N8N_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$MATTERMOST_CRED" \
    "$N8N_URL/api/v1/credentials" | jq -r '.id // empty')

  if [ -n "$MATTERMOST_CRED_ID" ]; then
    echo -e "${GREEN}✓ Mattermost credential created (ID: $MATTERMOST_CRED_ID)${NC}"
  else
    echo -e "${YELLOW}⚠ Mattermost credential may already exist or failed to create${NC}"
  fi
fi

echo

# Step 6: Import workflows
echo -e "${YELLOW}Step 6: Importing workflows...${NC}"

for workflow_file in "$WORKFLOWS_DIR"/*.json; do
  workflow_name=$(basename "$workflow_file" .json)
  echo "Importing: $workflow_name..."

  WORKFLOW_DATA=$(cat "$workflow_file")

  WORKFLOW_ID=$(curl -s -X POST \
    -H "X-N8N-API-KEY: $N8N_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$WORKFLOW_DATA" \
    "$N8N_URL/api/v1/workflows" | jq -r '.id // empty')

  if [ -n "$WORKFLOW_ID" ]; then
    echo -e "${GREEN}✓ Imported: $workflow_name (ID: $WORKFLOW_ID)${NC}"
  else
    echo -e "${RED}✗ Failed to import: $workflow_name${NC}"
  fi
done

echo

# Step 7: Activate workflows
echo -e "${YELLOW}Step 7: Activating workflows...${NC}"
echo "Note: Workflows need credential configuration before activation"
echo "Manual step required: Open n8n and configure credentials in each workflow"
echo

echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}======================================${NC}"
echo
echo "Next steps:"
echo "1. Open n8n: $N8N_URL"
echo "2. Configure credentials in each workflow node"
echo "3. Test each workflow manually"
echo "4. Activate workflows"
echo
echo "For detailed instructions, see:"
echo "  $WORKFLOWS_DIR/docs/SETUP.md"
echo
