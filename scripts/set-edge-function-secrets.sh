#!/bin/bash
# ============================================================================
# set-edge-function-secrets.sh
# Set Edge Function environment variables for opex-rag-query
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_REF="ublqmilcjtpnflofprkr"
ACCESS_TOKEN="${SUPABASE_ACCESS_TOKEN:-sbp_5d3b419ed91215372f8a8fb7b0a478cc1ec90eca}"

echo "================================================================"
echo "OpEx RAG Edge Function - Secret Configuration"
echo "================================================================"

# Check if required environment variables are set
echo -e "\n${YELLOW}Checking required environment variables...${NC}"

MISSING_VARS=()

if [ -z "$OPENAI_API_KEY" ]; then
  echo -e "${RED}✗${NC} OPENAI_API_KEY is not set"
  MISSING_VARS+=("OPENAI_API_KEY")
else
  echo -e "${GREEN}✓${NC} OPENAI_API_KEY is set (${OPENAI_API_KEY:0:15}...)"
fi

if [ -z "$VS_POLICIES_ID" ]; then
  echo -e "${YELLOW}⚠${NC} VS_POLICIES_ID is not set (optional, but required for full functionality)"
  MISSING_VARS+=("VS_POLICIES_ID")
else
  echo -e "${GREEN}✓${NC} VS_POLICIES_ID is set ($VS_POLICIES_ID)"
fi

if [ -z "$VS_SOPS_WORKFLOWS_ID" ]; then
  echo -e "${YELLOW}⚠${NC} VS_SOPS_WORKFLOWS_ID is not set (optional, but required for full functionality)"
  MISSING_VARS+=("VS_SOPS_WORKFLOWS_ID")
else
  echo -e "${GREEN}✓${NC} VS_SOPS_WORKFLOWS_ID is set ($VS_SOPS_WORKFLOWS_ID)"
fi

if [ -z "$VS_EXAMPLES_SYSTEMS_ID" ]; then
  echo -e "${YELLOW}⚠${NC} VS_EXAMPLES_SYSTEMS_ID is not set (optional, but required for full functionality)"
  MISSING_VARS+=("VS_EXAMPLES_SYSTEMS_ID")
else
  echo -e "${GREEN}✓${NC} VS_EXAMPLES_SYSTEMS_ID is set ($VS_EXAMPLES_SYSTEMS_ID)"
fi

# If critical variables are missing, show instructions
if [ ${#MISSING_VARS[@]} -gt 0 ]; then
  echo -e "\n${YELLOW}Missing environment variables:${NC}"
  for var in "${MISSING_VARS[@]}"; do
    echo "  - $var"
  done

  echo -e "\n${YELLOW}To set missing variables:${NC}"
  echo "  export OPENAI_API_KEY=\"your_openai_api_key\""
  echo "  export VS_POLICIES_ID=\"vs_xxx\""
  echo "  export VS_SOPS_WORKFLOWS_ID=\"vs_yyy\""
  echo "  export VS_EXAMPLES_SYSTEMS_ID=\"vs_zzz\""

  echo -e "\n${YELLOW}To create vector stores (if they don't exist):${NC}"
  echo "  cd /path/to/finance-rag-project"
  echo "  export OPENAI_API_KEY=\"your_key\""
  echo "  pnpm rag:setup"

  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Set secrets via Supabase Management API
echo -e "\n${YELLOW}Setting Edge Function secrets...${NC}"

# Function to set a secret
set_secret() {
  local name=$1
  local value=$2

  if [ -z "$value" ]; then
    echo -e "${YELLOW}⚠${NC} Skipping $name (not set)"
    return
  fi

  echo -n "Setting $name... "

  response=$(curl -s -X POST \
    "https://api.supabase.com/v1/projects/$PROJECT_REF/secrets" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\": \"$name\", \"value\": \"$value\"}")

  # Check if response contains error
  if echo "$response" | grep -q "error"; then
    echo -e "${RED}FAILED${NC}"
    echo "  Error: $response"
  else
    echo -e "${GREEN}OK${NC}"
  fi
}

# Set each secret
set_secret "OPENAI_API_KEY" "$OPENAI_API_KEY"
set_secret "VS_POLICIES_ID" "$VS_POLICIES_ID"
set_secret "VS_SOPS_WORKFLOWS_ID" "$VS_SOPS_WORKFLOWS_ID"
set_secret "VS_EXAMPLES_SYSTEMS_ID" "$VS_EXAMPLES_SYSTEMS_ID"

# Verify secrets were set
echo -e "\n${YELLOW}Verifying secrets...${NC}"

secrets=$(curl -s -X GET \
  "https://api.supabase.com/v1/projects/$PROJECT_REF/secrets" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "$secrets" | jq '.[] | {name, updated_at}'

echo -e "\n${GREEN}✓ Secret configuration complete!${NC}"

echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Test Edge Function: ./scripts/test-edge-function.sh"
echo "2. Run smoke test: npx tsx scripts/test-opex-rag.ts"
echo "3. Verify query logging: psql \"\$OPEX_POSTGRES_URL\" -c \"SELECT * FROM opex.rag_queries;\""
