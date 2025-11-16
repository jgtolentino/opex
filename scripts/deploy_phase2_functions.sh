#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# Phase 2 Edge Functions Deployment Script
# Deploys rag-feedback and alert-notifier Edge Functions
# ============================================================================

PROJECT_REF="ublqmilcjtpnflofprkr"
SUPABASE_URL="https://ublqmilcjtpnflofprkr.supabase.co"

# Check for access token
if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "❌ ERROR: SUPABASE_ACCESS_TOKEN not set"
  echo ""
  echo "Please regenerate your Supabase access token:"
  echo "1. Go to: https://supabase.com/dashboard/account/tokens"
  echo "2. Click 'Generate new token'"
  echo "3. Copy the token (starts with sbp_)"
  echo "4. Run: export SUPABASE_ACCESS_TOKEN=\"sbp_YOUR_TOKEN\""
  echo "5. Re-run this script"
  exit 1
fi

echo "🚀 Deploying Phase 2 Edge Functions..."
echo "======================================"
echo ""

# Deploy rag-feedback
echo "📦 Deploying rag-feedback..."
if supabase functions deploy rag-feedback --project-ref "$PROJECT_REF"; then
  echo "✅ rag-feedback deployed successfully"
else
  echo "❌ rag-feedback deployment failed"
  exit 1
fi
echo ""

# Deploy alert-notifier
echo "📦 Deploying alert-notifier..."
if supabase functions deploy alert-notifier --project-ref "$PROJECT_REF"; then
  echo "✅ alert-notifier deployed successfully"
else
  echo "❌ alert-notifier deployment failed"
  exit 1
fi
echo ""

# List deployed functions
echo "📋 Deployed Functions:"
echo "---------------------"
supabase functions list --project-ref "$PROJECT_REF"
echo ""

# Test rag-feedback
echo "🧪 Testing rag-feedback..."
echo "-------------------------"

# Create test query
QUERY_ID=$(psql "postgres://postgres.ublqmilcjtpnflofprkr:1G8TRd5wE7b9szBH@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require" -tAc "
INSERT INTO opex.rag_queries (question, answer, success, user_id, channel)
VALUES ('Deployment test query', 'Test answer', true, 'deployment-test', 'test')
RETURNING id;
" 2>/dev/null)

if [[ -n "$QUERY_ID" ]]; then
  echo "✅ Test query created: $QUERY_ID"

  # Test feedback submission
  SERVICE_ROLE_KEY="${opex_SUPABASE_SERVICE_ROLE_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVibHFtaWxjanRwbmZsb2ZwcmtyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyODQyNzI4OSwiZXhwIjoyMDQ0MDAzMjg5fQ.rN0YpnHR0RLtRN8aGKJqt_E2WxFvhL2eHm6ZWy4Hk3A}"

  FEEDBACK_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
    "$SUPABASE_URL/functions/v1/rag-feedback" \
    -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"queryId\": \"$QUERY_ID\",
      \"rating\": 5,
      \"feedback\": \"Deployment test successful\"
    }")

  HTTP_CODE=$(echo "$FEEDBACK_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)

  if [[ "$HTTP_CODE" == "200" ]]; then
    echo "✅ rag-feedback API test PASSED"
  else
    echo "❌ rag-feedback API test FAILED (HTTP $HTTP_CODE)"
    echo "$FEEDBACK_RESPONSE" | sed '/HTTP_CODE/d'
  fi
fi
echo ""

# Test alert-notifier (requires Slack webhook setup)
echo "🧪 Testing alert-notifier..."
echo "----------------------------"
echo "⚠️  Requires SLACK_WEBHOOK_URL secret in Supabase"
echo "⚠️  Requires Database Webhook configured"
echo ""
echo "To complete setup:"
echo "1. Set SLACK_WEBHOOK_URL secret: https://supabase.com/dashboard/project/$PROJECT_REF/settings/vault"
echo "2. Configure Database Webhook: https://supabase.com/dashboard/project/$PROJECT_REF/database/webhooks"
echo "3. Run: ./test_rag_alerts.sh"
echo ""

echo "✅ Phase 2 Edge Functions Deployment Complete!"
echo "=============================================="
echo ""
echo "Next steps:"
echo "1. Run full tests: ./test_rag_feedback.sh && ./test_rag_alerts.sh"
echo "2. Configure Slack webhook for alert-notifier"
echo "3. Set up Database Webhook for rag_alerts table"
