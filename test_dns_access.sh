#!/usr/bin/env bash
set -euo pipefail

# Test public DNS access to OpEx RAG Edge Function
echo "🔍 Testing public DNS access to Edge Function..."
echo "URL: https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/opex-rag-query"
echo ""

ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVibHFtaWxjanRwbmZsb2ZwcmtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNjMyNzUsImV4cCI6MjA3ODczOTI3NX0.aVVY4Kgain0575E3GmLHTluLcFkZbcoC0G-Dmy9kzUs"

RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  "https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/opex-rag-query" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"assistant":"opex","question":"What is Operational Excellence?","userId":"dns-health-check"}')

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')

echo "HTTP Status: $HTTP_CODE"
echo ""

if [[ "$HTTP_CODE" == "200" ]]; then
  echo "✅ DNS ACCESS SUCCESSFUL"
  echo ""
  echo "Response preview:"
  echo "$BODY" | jq -r '.answer' 2>/dev/null | head -5 || echo "$BODY"
elif [[ "$HTTP_CODE" == "400" ]]; then
  echo "⚠️ DNS accessible, but request validation failed"
  echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
elif [[ "$HTTP_CODE" == "401" ]]; then
  echo "⚠️ DNS accessible, but authentication failed"
  echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
else
  echo "❌ DNS ACCESS FAILED"
  echo "Response: $BODY"
fi
