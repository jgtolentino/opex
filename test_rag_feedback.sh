#!/usr/bin/env bash
set -euo pipefail

# Test RAG Feedback API
echo "🧪 Testing RAG Feedback API..."
echo "============================="
echo ""

# Load environment variables
if [[ -f .env.local ]]; then
  source .env.local
fi

FEEDBACK_URL="https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/rag-feedback"
SERVICE_ROLE_KEY="${opex_SUPABASE_SERVICE_ROLE_KEY:-}"

if [[ -z "$SERVICE_ROLE_KEY" ]]; then
  echo "❌ ERROR: opex_SUPABASE_SERVICE_ROLE_KEY not set"
  echo "Please set it in .env.local or export it"
  exit 1
fi

# First, get a query ID from the database to test with
echo "📋 Fetching a recent query ID for testing..."
QUERY_ID=$(psql "postgres://postgres.ublqmilcjtpnflofprkr:1G8TRd5wE7b9szBH@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require" \
  -tAc "SELECT id FROM opex.rag_queries ORDER BY created_at DESC LIMIT 1;" 2>/dev/null || echo "")

if [[ -z "$QUERY_ID" ]]; then
  echo "⚠️ No queries found in database. Creating a test query first..."

  # Create a test query
  QUERY_ID=$(psql "postgres://postgres.ublqmilcjtpnflofprkr:1G8TRd5wE7b9szBH@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require" \
    -tAc "INSERT INTO opex.rag_queries (question, answer, user_id, channel, meta)
          VALUES ('Test question for feedback', 'Test answer', 'test-user', 'test', '{\"test\": true}'::jsonb)
          RETURNING id;" 2>/dev/null || echo "")

  if [[ -z "$QUERY_ID" ]]; then
    echo "❌ Failed to create test query"
    exit 1
  fi

  echo "✅ Created test query: $QUERY_ID"
fi

echo "✅ Using query ID: $QUERY_ID"
echo ""

# Test 1: Submit rating with feedback
echo "Test 1: Submit rating (5 stars) with feedback..."
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  "$FEEDBACK_URL" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"queryId\": \"$QUERY_ID\",
    \"rating\": 5,
    \"feedback\": \"Excellent response! Very helpful.\",
    \"evaluationMetadata\": {
      \"test_run\": true,
      \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
    }
  }")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')

echo "HTTP Status: $HTTP_CODE"
if [[ "$HTTP_CODE" == "200" ]]; then
  echo "✅ PASS: Feedback submitted successfully"
  echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
else
  echo "❌ FAIL: Feedback submission failed"
  echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
fi
echo ""

# Test 2: Verify rating was saved in database
echo "Test 2: Verify rating saved in database..."
RATING_CHECK=$(psql "postgres://postgres.ublqmilcjtpnflofprkr:1G8TRd5wE7b9szBH@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require" \
  -tAc "SELECT rating, feedback FROM opex.rag_queries WHERE id = '$QUERY_ID';" 2>/dev/null || echo "")

if [[ -n "$RATING_CHECK" ]]; then
  echo "✅ PASS: Rating found in database"
  echo "   $RATING_CHECK"
else
  echo "❌ FAIL: Rating not found in database"
fi
echo ""

# Test 3: Query evaluation metrics view
echo "Test 3: Query evaluation metrics view..."
METRICS=$(psql "postgres://postgres.ublqmilcjtpnflofprkr:1G8TRd5wE7b9szBH@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require" \
  -c "SELECT * FROM opex.rag_evaluation_metrics LIMIT 3;" 2>/dev/null || echo "")

if [[ -n "$METRICS" ]]; then
  echo "✅ PASS: Evaluation metrics view accessible"
  echo "$METRICS"
else
  echo "❌ FAIL: Could not query evaluation metrics"
fi
echo ""

# Test 4: Invalid rating (should fail)
echo "Test 4: Test invalid rating (should reject)..."
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  "$FEEDBACK_URL" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"queryId\": \"$QUERY_ID\",
    \"rating\": 6
  }")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')

echo "HTTP Status: $HTTP_CODE"
if [[ "$HTTP_CODE" == "400" ]]; then
  echo "✅ PASS: Invalid rating correctly rejected"
  echo "$BODY" | jq -r '.error' 2>/dev/null || echo "$BODY"
else
  echo "⚠️ WARN: Expected 400 status for invalid rating, got $HTTP_CODE"
fi
echo ""

# Summary
echo "============================="
echo "🎯 Test Summary"
echo "============================="
echo "Test Query ID: $QUERY_ID"
echo "Feedback API: $FEEDBACK_URL"
echo ""
echo "Next steps:"
echo "1. Check ratings in database: SELECT * FROM opex.rag_queries WHERE rating IS NOT NULL;"
echo "2. View metrics: SELECT * FROM opex.rag_evaluation_metrics;"
echo "3. Update INTEGRATION_GUIDE.md with feedback API usage"
