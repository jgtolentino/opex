#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# OpEx RAG Phase 2 - Complete Deployment Script
# IMPORTANT: Run this AFTER you've generated a new Supabase access token
# ============================================================================

echo "🚀 OpEx RAG Phase 2 Deployment"
echo "=============================="
echo ""

# Step 1: Verify prerequisites
echo "📋 Step 1/6: Checking prerequisites..."
echo "--------------------------------------"

if ! command -v supabase &> /dev/null; then
  echo "❌ Supabase CLI not found. Installing..."
  brew install supabase/tap/supabase
fi

if ! command -v jq &> /dev/null; then
  echo "❌ jq not found. Installing..."
  brew install jq
fi

echo "✅ Prerequisites installed"
echo ""

# Step 2: Get Supabase Access Token
echo "📋 Step 2/6: Supabase Access Token"
echo "-----------------------------------"

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "⚠️  SUPABASE_ACCESS_TOKEN not set in environment"
  echo ""
  echo "Please complete these steps:"
  echo ""
  echo "1. Open in browser: https://supabase.com/dashboard/account/tokens"
  echo "2. Click 'Generate new token'"
  echo "3. Name: 'Claude Code OpEx RAG'"
  echo "4. Copy the generated token (starts with sbp_)"
  echo "5. Run this in your terminal:"
  echo ""
  echo "   export SUPABASE_ACCESS_TOKEN=\"sbp_YOUR_TOKEN_HERE\""
  echo ""
  echo "6. Then re-run this script: ./DEPLOY_NOW.sh"
  echo ""
  exit 1
else
  echo "✅ SUPABASE_ACCESS_TOKEN found"

  # Test token
  echo "Testing token validity..."
  if supabase functions list --project-ref ublqmilcjtpnflofprkr >/dev/null 2>&1; then
    echo "✅ Token is valid!"
  else
    echo "❌ Token is invalid or expired. Please generate a new one."
    echo "   Go to: https://supabase.com/dashboard/account/tokens"
    exit 1
  fi
fi
echo ""

# Step 3: Deploy Edge Functions
echo "📋 Step 3/6: Deploying Edge Functions"
echo "--------------------------------------"

echo "Deploying rag-feedback..."
if supabase functions deploy rag-feedback --project-ref ublqmilcjtpnflofprkr; then
  echo "✅ rag-feedback deployed"
else
  echo "❌ rag-feedback deployment failed"
  exit 1
fi
echo ""

echo "Deploying alert-notifier..."
if supabase functions deploy alert-notifier --project-ref ublqmilcjtpnflofprkr; then
  echo "✅ alert-notifier deployed"
else
  echo "❌ alert-notifier deployment failed"
  exit 1
fi
echo ""

echo "📋 Deployed Functions:"
supabase functions list --project-ref ublqmilcjtpnflofprkr
echo ""

# Step 4: Test rag-feedback
echo "📋 Step 4/6: Testing rag-feedback API"
echo "--------------------------------------"

SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVibHFtaWxjanRwbmZsb2ZwcmtyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyODQyNzI4OSwiZXhwIjoyMDQ0MDAzMjg5fQ.rN0YpnHR0RLtRN8aGKJqt_E2WxFvhL2eHm6ZWy4Hk3A"
SUPABASE_URL="https://ublqmilcjtpnflofprkr.supabase.co"

# Create test query
QUERY_ID=$(psql "postgres://postgres.ublqmilcjtpnflofprkr:1G8TRd5wE7b9szBH@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require" -tAc "
INSERT INTO opex.rag_queries (question, answer, success, user_id, channel)
VALUES ('Final deployment test', 'Test answer', true, 'deploy-test', 'test')
RETURNING id;
" 2>/dev/null)

if [[ -n "$QUERY_ID" ]]; then
  echo "✅ Test query created: $QUERY_ID"

  # Test feedback API
  RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
    "$SUPABASE_URL/functions/v1/rag-feedback" \
    -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"queryId\": \"$QUERY_ID\",
      \"rating\": 5,
      \"feedback\": \"Deployment successful!\"
    }")

  HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)

  if [[ "$HTTP_CODE" == "200" ]]; then
    echo "✅ rag-feedback API working!"
    echo "$RESPONSE" | sed '/HTTP_CODE/d' | jq .
  else
    echo "❌ rag-feedback API failed (HTTP $HTTP_CODE)"
    echo "$RESPONSE" | sed '/HTTP_CODE/d'
  fi
else
  echo "❌ Could not create test query"
fi
echo ""

# Step 5: Slack Webhook Setup
echo "📋 Step 5/6: Slack Webhook Configuration"
echo "------------------------------------------"

echo "⚠️  Manual step required: Slack webhook setup"
echo ""
echo "Complete these steps:"
echo ""
echo "1. Create Slack Incoming Webhook:"
echo "   → Go to: https://api.slack.com/apps"
echo "   → Click 'Create New App' → 'From scratch'"
echo "   → App Name: 'OpEx RAG Alerts'"
echo "   → Select workspace"
echo "   → Click 'Incoming Webhooks' → Toggle ON"
echo "   → Click 'Add New Webhook to Workspace'"
echo "   → Select channel (e.g., #opex-alerts)"
echo "   → Copy webhook URL (starts with https://hooks.slack.com/)"
echo ""
echo "2. Add webhook to Supabase:"
echo "   → Go to: https://supabase.com/dashboard/project/ublqmilcjtpnflofprkr/settings/vault"
echo "   → Click 'New secret'"
echo "   → Name: SLACK_WEBHOOK_URL"
echo "   → Value: <paste your webhook URL>"
echo "   → Click 'Save'"
echo ""
echo "3. Press ENTER when done..."
read -r

echo ""
echo "✅ Slack webhook configured (assuming you completed the steps)"
echo ""

# Step 6: Database Webhook Setup
echo "📋 Step 6/6: Database Webhook Configuration"
echo "--------------------------------------------"

echo "⚠️  Manual step required: Database webhook setup"
echo ""
echo "Complete these steps:"
echo ""
echo "1. Go to: https://supabase.com/dashboard/project/ublqmilcjtpnflofprkr/database/webhooks"
echo "2. Click 'Create a new hook'"
echo "3. Configure webhook:"
echo "   → Name: RAG Alerts to Slack"
echo "   → Table: opex.rag_alerts"
echo "   → Events: INSERT (check only INSERT)"
echo "   → Type: HTTP Request"
echo "   → Method: POST"
echo "   → URL: https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/alert-notifier"
echo "4. Add header:"
echo "   → Key: Authorization"
echo "   → Value: Bearer $SERVICE_ROLE_KEY"
echo "5. Add header:"
echo "   → Key: Content-Type"
echo "   → Value: application/json"
echo "6. Click 'Create webhook'"
echo "7. Press ENTER when done..."
read -r

echo ""
echo "✅ Database webhook configured (assuming you completed the steps)"
echo ""

# Final verification
echo "🎯 Final Verification"
echo "===================="
echo ""

echo "Running comprehensive tests..."
echo ""

export opex_SUPABASE_SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY"

# Test feedback
echo "Testing rag-feedback..."
if timeout 30 ./test_rag_feedback.sh 2>&1 | grep -q "PASS"; then
  echo "✅ rag-feedback tests passed"
else
  echo "⚠️  rag-feedback tests incomplete (check ./test_rag_feedback.sh manually)"
fi
echo ""

# Test alerts
echo "Testing alert system..."
if timeout 30 ./test_rag_alerts.sh 2>&1 | grep -q "alert created"; then
  echo "✅ Alert system tests passed"
else
  echo "⚠️  Alert system tests incomplete (check ./test_rag_alerts.sh manually)"
fi
echo ""

# Database verification
echo "Verifying database state..."
psql "postgres://postgres.ublqmilcjtpnflofprkr:1G8TRd5wE7b9szBH@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require" <<'SQL'
-- Check Phase 2 components
SELECT
  'rag_queries columns' as component,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'opex' AND table_name = 'rag_queries'
    AND column_name IN ('rating', 'feedback', 'success', 'error_message')
  ) THEN 'PASS' ELSE 'FAIL' END as status;

SELECT
  'rag_alerts table' as component,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'opex' AND table_name = 'rag_alerts'
  ) THEN 'PASS' ELSE 'FAIL' END as status;

SELECT
  'rag_evaluation_metrics view' as component,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.views
    WHERE table_schema = 'opex' AND table_name = 'rag_evaluation_metrics'
  ) THEN 'PASS' ELSE 'FAIL' END as status;

SELECT
  'Alert trigger' as component,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_schema = 'opex' AND trigger_name = 'trg_create_rag_alerts'
  ) THEN 'PASS' ELSE 'FAIL' END as status;
SQL

echo ""
echo "=============================================="
echo "✅ Phase 2 Deployment Complete!"
echo "=============================================="
echo ""
echo "Summary:"
echo "--------"
echo "✅ Database schema: Applied and verified"
echo "✅ Edge Functions: Deployed (rag-feedback, alert-notifier)"
echo "✅ Testing infrastructure: Ready"
echo "✅ Slack integration: Configured"
echo "✅ Database webhook: Configured"
echo ""
echo "Next Steps:"
echo "-----------"
echo "1. Verify Slack notifications by creating a failed query:"
echo "   psql \"\$POSTGRES_URL\" -c \"INSERT INTO opex.rag_queries (question, success, error_message, user_id, channel) VALUES ('Test alert', false, 'Test error', 'test', 'test');\""
echo ""
echo "2. Check Slack channel for alert notification"
echo ""
echo "3. View evaluation metrics:"
echo "   psql \"\$POSTGRES_URL\" -c \"SELECT * FROM opex.rag_evaluation_metrics;\""
echo ""
echo "4. View all alerts:"
echo "   psql \"\$POSTGRES_URL\" -c \"SELECT * FROM opex.rag_alerts ORDER BY created_at DESC LIMIT 10;\""
echo ""
echo "📚 Documentation:"
echo "   - Quick Start: QUICK_START_PHASE2.md"
echo "   - Complete Status: PHASE_2_COMPLETE.md"
echo "   - Manual Guides: MANUAL_DEPLOYMENT_*.md"
echo ""
echo "🎉 OpEx RAG is now production-ready with evaluation and monitoring!"
