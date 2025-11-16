#!/usr/bin/env bash
set -euo pipefail

# Test RAG Alerts System
echo "🧪 Testing RAG Alerts System..."
echo "================================"
echo ""

# Load environment variables
if [[ -f .env.local ]]; then
  source .env.local
fi

POSTGRES_URL="postgres://postgres.ublqmilcjtpnflofprkr:1G8TRd5wE7b9szBH@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
SERVICE_ROLE_KEY="${opex_SUPABASE_SERVICE_ROLE_KEY:-}"
SUPABASE_URL="${SUPABASE_URL:-https://ublqmilcjtpnflofprkr.supabase.co}"

if [[ -z "$SERVICE_ROLE_KEY" ]]; then
  echo "❌ ERROR: opex_SUPABASE_SERVICE_ROLE_KEY not set"
  echo "Please set it in .env.local or export it"
  exit 1
fi

# Clean up old test alerts
echo "🧹 Cleaning up old test alerts..."
psql "$POSTGRES_URL" -c "DELETE FROM opex.rag_alerts WHERE details->>'test' = 'true';" 2>/dev/null || true
psql "$POSTGRES_URL" -c "DELETE FROM opex.rag_queries WHERE user_id = 'test-alerts-user';" 2>/dev/null || true
echo ""

# Test 1: Error Alert (failed query)
echo "Test 1: Error Alert (success = false)"
echo "--------------------------------------"

QUERY_1=$(psql "$POSTGRES_URL" -tAc "
INSERT INTO opex.rag_queries (question, success, error_message, user_id, channel, meta)
VALUES (
  'Test error query',
  false,
  'Test error: Failed to retrieve documents',
  'test-alerts-user',
  'test',
  jsonb_build_object('test', true, 'response_time_ms', 5000)
)
RETURNING id;
" 2>/dev/null)

if [[ -n "$QUERY_1" ]]; then
  echo "✅ Created failed query: $QUERY_1"

  # Check if error alert was created
  sleep 1
  ERROR_ALERT=$(psql "$POSTGRES_URL" -tAc "
    SELECT id FROM opex.rag_alerts
    WHERE query_id = '$QUERY_1' AND alert_type = 'error'
    LIMIT 1;
  " 2>/dev/null)

  if [[ -n "$ERROR_ALERT" ]]; then
    echo "✅ PASS: Error alert created (ID: ${ERROR_ALERT:0:8})"
  else
    echo "❌ FAIL: Error alert not created"
  fi
else
  echo "❌ FAIL: Could not create test query"
fi
echo ""

# Test 2: Slow Query Alert (response_time_ms > 10000)
echo "Test 2: Slow Query Alert (> 10s)"
echo "---------------------------------"

QUERY_2=$(psql "$POSTGRES_URL" -tAc "
INSERT INTO opex.rag_queries (question, answer, success, user_id, channel, meta)
VALUES (
  'Test slow query',
  'Test answer',
  true,
  'test-alerts-user',
  'test',
  jsonb_build_object('test', true, 'response_time_ms', 15000)
)
RETURNING id;
" 2>/dev/null)

if [[ -n "$QUERY_2" ]]; then
  echo "✅ Created slow query: $QUERY_2"

  # Check if latency alert was created
  sleep 1
  LATENCY_ALERT=$(psql "$POSTGRES_URL" -tAc "
    SELECT id FROM opex.rag_alerts
    WHERE query_id = '$QUERY_2' AND alert_type = 'latency'
    LIMIT 1;
  " 2>/dev/null)

  if [[ -n "$LATENCY_ALERT" ]]; then
    echo "✅ PASS: Latency alert created (ID: ${LATENCY_ALERT:0:8})"
  else
    echo "❌ FAIL: Latency alert not created"
  fi
else
  echo "❌ FAIL: Could not create test query"
fi
echo ""

# Test 3: Low Rating Alert (rating <= 2)
echo "Test 3: Low Rating Alert (<= 2)"
echo "--------------------------------"

QUERY_3=$(psql "$POSTGRES_URL" -tAc "
INSERT INTO opex.rag_queries (question, answer, success, rating, feedback, user_id, channel, meta)
VALUES (
  'Test low rating query',
  'Test answer',
  true,
  2,
  'Not helpful at all',
  'test-alerts-user',
  'test',
  jsonb_build_object('test', true, 'response_time_ms', 3000)
)
RETURNING id;
" 2>/dev/null)

if [[ -n "$QUERY_3" ]]; then
  echo "✅ Created low rating query: $QUERY_3"

  # Check if rating alert was created
  sleep 1
  RATING_ALERT=$(psql "$POSTGRES_URL" -tAc "
    SELECT id FROM opex.rag_alerts
    WHERE query_id = '$QUERY_3' AND alert_type = 'rating'
    LIMIT 1;
  " 2>/dev/null)

  if [[ -n "$RATING_ALERT" ]]; then
    echo "✅ PASS: Rating alert created (ID: ${RATING_ALERT:0:8})"
  else
    echo "❌ FAIL: Rating alert not created"
  fi
else
  echo "❌ FAIL: Could not create test query"
fi
echo ""

# Test 4: Multiple alerts on single query
echo "Test 4: Multiple Alerts (error + slow)"
echo "---------------------------------------"

QUERY_4=$(psql "$POSTGRES_URL" -tAc "
INSERT INTO opex.rag_queries (question, success, error_message, user_id, channel, meta)
VALUES (
  'Test multi-alert query',
  false,
  'Test error: Timeout',
  'test-alerts-user',
  'test',
  jsonb_build_object('test', true, 'response_time_ms', 12000)
)
RETURNING id;
" 2>/dev/null)

if [[ -n "$QUERY_4" ]]; then
  echo "✅ Created error + slow query: $QUERY_4"

  # Check if both alerts were created
  sleep 1
  ALERT_COUNT=$(psql "$POSTGRES_URL" -tAc "
    SELECT COUNT(*) FROM opex.rag_alerts
    WHERE query_id = '$QUERY_4';
  " 2>/dev/null)

  if [[ "$ALERT_COUNT" == "2" ]]; then
    echo "✅ PASS: Both error and latency alerts created"
  else
    echo "❌ FAIL: Expected 2 alerts, got $ALERT_COUNT"
  fi
else
  echo "❌ FAIL: Could not create test query"
fi
echo ""

# Test 5: View all test alerts
echo "Test 5: Query All Test Alerts"
echo "------------------------------"

ALERTS=$(psql "$POSTGRES_URL" -c "
SELECT
  id,
  alert_type,
  severity,
  message,
  status,
  created_at
FROM opex.rag_alerts
WHERE details->>'test' = 'true'
ORDER BY created_at DESC
LIMIT 10;
" 2>/dev/null || echo "")

if [[ -n "$ALERTS" ]]; then
  echo "$ALERTS"
else
  echo "⚠️ No test alerts found"
fi
echo ""

# Test 6: Test alert-notifier Edge Function (manual call)
echo "Test 6: Alert Notifier Edge Function"
echo "-------------------------------------"

# Get first test alert for notification
ALERT_ID=$(psql "$POSTGRES_URL" -tAc "
SELECT id FROM opex.rag_alerts
WHERE details->>'test' = 'true' AND notified_at IS NULL
LIMIT 1;
" 2>/dev/null)

if [[ -n "$ALERT_ID" ]]; then
  echo "📢 Testing Slack notification for alert: ${ALERT_ID:0:8}"

  # Get full alert details
  ALERT_JSON=$(psql "$POSTGRES_URL" -tAc "
    SELECT row_to_json(t)
    FROM (
      SELECT id, query_id, alert_type, severity, message, details, created_at
      FROM opex.rag_alerts
      WHERE id = '$ALERT_ID'
    ) t;
  " 2>/dev/null)

  if [[ -n "$ALERT_JSON" ]]; then
    echo "Alert payload: $ALERT_JSON"

    # Call alert-notifier Edge Function
    RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
      "$SUPABASE_URL/functions/v1/alert-notifier" \
      -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
      -H "Content-Type: application/json" \
      -d "{\"record\": $ALERT_JSON}" 2>/dev/null || echo "HTTP_CODE:000")

    HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
    BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')

    echo "HTTP Status: $HTTP_CODE"

    if [[ "$HTTP_CODE" == "200" ]]; then
      echo "✅ PASS: Slack notification sent"
      echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
    elif [[ "$HTTP_CODE" == "000" ]]; then
      echo "⚠️ WARN: Could not reach alert-notifier function (not deployed yet)"
    else
      echo "❌ FAIL: Notification failed"
      echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
    fi
  fi
else
  echo "⚠️ No unnotified alerts found for testing"
fi
echo ""

# Summary
echo "================================"
echo "🎯 Test Summary"
echo "================================"

TOTAL_ALERTS=$(psql "$POSTGRES_URL" -tAc "
SELECT COUNT(*) FROM opex.rag_alerts
WHERE details->>'test' = 'true';
" 2>/dev/null || echo "0")

echo "Total test alerts created: $TOTAL_ALERTS"
echo ""

ALERT_BREAKDOWN=$(psql "$POSTGRES_URL" -c "
SELECT
  alert_type,
  severity,
  COUNT(*) as count
FROM opex.rag_alerts
WHERE details->>'test' = 'true'
GROUP BY alert_type, severity
ORDER BY alert_type, severity;
" 2>/dev/null || echo "")

if [[ -n "$ALERT_BREAKDOWN" ]]; then
  echo "Alert breakdown:"
  echo "$ALERT_BREAKDOWN"
fi
echo ""

echo "Next steps:"
echo "1. Deploy alert-notifier Edge Function via Supabase Dashboard"
echo "2. Set SLACK_WEBHOOK_URL secret in Supabase"
echo "3. Configure Database Webhook in Supabase Dashboard:"
echo "   - Table: opex.rag_alerts"
echo "   - Events: INSERT"
echo "   - URL: $SUPABASE_URL/functions/v1/alert-notifier"
echo "   - Headers: Authorization: Bearer \$SUPABASE_SERVICE_ROLE_KEY"
echo "4. Test by creating a new failed query and checking Slack"
echo ""

echo "Cleanup command (run when done testing):"
echo "psql \"\$POSTGRES_URL\" -c \"DELETE FROM opex.rag_alerts WHERE details->>'test' = 'true';\""
echo "psql \"\$POSTGRES_URL\" -c \"DELETE FROM opex.rag_queries WHERE user_id = 'test-alerts-user';\""
