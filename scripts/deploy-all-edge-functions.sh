#!/bin/bash
# Deploy all OpEx Supabase Edge Functions
# This script deploys all Edge Functions with proper security configurations

set -e

echo "🚀 OpEx Edge Functions Deployment Script"
echo "=========================================="
echo ""

# Check for required environment variables
if [ -z "$SUPABASE_PROJECT_REF" ]; then
  echo "❌ Error: SUPABASE_PROJECT_REF environment variable not set"
  echo "   Please set: export SUPABASE_PROJECT_REF=your_project_ref"
  exit 1
fi

# Optional: Check for Supabase access token
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
  echo "⚠️  Warning: SUPABASE_ACCESS_TOKEN not set"
  echo "   You may need to use the Supabase Dashboard for manual deployment"
  echo "   Or set: export SUPABASE_ACCESS_TOKEN=your_access_token"
  echo ""
fi

# List of Edge Functions to deploy
FUNCTIONS=(
  "opex-rag-query"
  "rag-ask-tax"
  "ingest-document"
  "embedding-worker"
  "embedding-maintenance"
  "alert-notifier"
  "rag-feedback"
  "odoo-expense-get"
)

# Deploy each function
for func in "${FUNCTIONS[@]}"; do
  echo "📦 Deploying $func..."

  # Check if function directory exists
  if [ ! -d "supabase/functions/$func" ]; then
    echo "   ⚠️  Function not found: $func"
    continue
  fi

  # Deploy function (no JWT verification for public access)
  supabase functions deploy "$func" \
    --no-verify-jwt \
    --project-ref "$SUPABASE_PROJECT_REF" \
    2>&1 | tee "logs/deploy-$func.log"

  if [ $? -eq 0 ]; then
    echo "   ✅ $func deployed successfully"
  else
    echo "   ❌ $func deployment failed (check logs/deploy-$func.log)"
  fi

  echo ""
done

echo "=========================================="
echo "✅ Deployment complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Set Edge Function secrets (OpenAI API key, vector store IDs)"
echo "   Run: bash scripts/set-edge-function-secrets.sh"
echo ""
echo "2. Test deployed functions"
echo "   Run: bash scripts/test-edge-functions.sh"
echo ""
echo "3. Monitor function logs in Supabase Dashboard"
echo "   URL: https://supabase.com/dashboard/project/$SUPABASE_PROJECT_REF/functions"
