#!/bin/bash
# Set environment variables/secrets for Supabase Edge Functions

set -e

echo "🔐 OpEx Edge Functions - Set Secrets"
echo "====================================="
echo ""

# Check for required environment variables
if [ -z "$SUPABASE_PROJECT_REF" ]; then
  echo "❌ Error: SUPABASE_PROJECT_REF environment variable not set"
  echo "   Please set: export SUPABASE_PROJECT_REF=your_project_ref"
  exit 1
fi

# Load environment variables from .env if exists
if [ -f ".env" ]; then
  echo "📄 Loading environment variables from .env file..."
  set -a
  source .env
  set +a
  echo "✅ Environment variables loaded"
  echo ""
fi

# Check for required secrets
REQUIRED_SECRETS=(
  "OPENAI_API_KEY"
  "VS_POLICIES_ID"
  "VS_SOPS_WORKFLOWS_ID"
  "VS_EXAMPLES_SYSTEMS_ID"
)

echo "🔍 Checking required secrets..."
MISSING_SECRETS=()

for secret in "${REQUIRED_SECRETS[@]}"; do
  if [ -z "${!secret}" ]; then
    MISSING_SECRETS+=("$secret")
    echo "   ❌ Missing: $secret"
  else
    echo "   ✅ Found: $secret"
  fi
done

echo ""

if [ ${#MISSING_SECRETS[@]} -gt 0 ]; then
  echo "❌ Error: Missing required secrets:"
  for secret in "${MISSING_SECRETS[@]}"; do
    echo "   - $secret"
  done
  echo ""
  echo "Please set these in your .env file or environment variables"
  exit 1
fi

echo "📤 Setting Supabase secrets..."
echo ""

# Set secrets using Supabase CLI
supabase secrets set \
  OPENAI_API_KEY="$OPENAI_API_KEY" \
  VS_POLICIES_ID="$VS_POLICIES_ID" \
  VS_SOPS_WORKFLOWS_ID="$VS_SOPS_WORKFLOWS_ID" \
  VS_EXAMPLES_SYSTEMS_ID="$VS_EXAMPLES_SYSTEMS_ID" \
  --project-ref "$SUPABASE_PROJECT_REF"

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Secrets set successfully!"
  echo ""
  echo "📋 Next Steps:"
  echo "1. Restart Edge Functions to pick up new secrets"
  echo "2. Test functions: bash scripts/test-edge-functions.sh"
else
  echo ""
  echo "❌ Failed to set secrets"
  echo "   You may need to set them manually via Supabase Dashboard:"
  echo "   https://supabase.com/dashboard/project/$SUPABASE_PROJECT_REF/settings/functions"
fi
