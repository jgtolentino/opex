#!/bin/bash

# OpEx RAG Edge Function Deployment Script
# Requires: Personal Access Token with Edge Functions deployment permissions

set -e

echo "🚀 OpEx RAG Edge Function Deployment"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -d "supabase/functions/opex-rag-query" ]; then
    echo "❌ Error: Must run from /Users/tbwa/opex directory"
    exit 1
fi

# Check if Supabase CLI is authenticated
echo "📋 Step 1: Checking Supabase CLI authentication..."
if ! supabase projects list &>/dev/null; then
    echo "⚠️  Not authenticated. You need a Personal Access Token."
    echo ""
    echo "To generate a new token:"
    echo "1. Go to: https://supabase.com/dashboard/account/tokens"
    echo "2. Click 'Generate New Token'"
    echo "3. Name: 'Edge Functions Deployment'"
    echo "4. Enable these scopes:"
    echo "   ✅ Edge Functions: Read, Write"
    echo "   ✅ Projects: Read"
    echo "5. Copy the token (starts with sbp_)"
    echo ""
    read -p "Paste your new Personal Access Token: " NEW_TOKEN
    echo "$NEW_TOKEN" | supabase login
    echo "✅ Logged in successfully"
else
    echo "✅ Already authenticated"
fi

echo ""
echo "📦 Step 2: Deploying opex-rag-query function..."
echo "Project: ublqmilcjtpnflofprkr"
echo "JWT Verification: Disabled"
echo ""

# Deploy the function
supabase functions deploy opex-rag-query \
    --no-verify-jwt \
    --project-ref ublqmilcjtpnflofprkr

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""

    # Wait for function to boot
    echo "⏳ Waiting 15 seconds for function to boot..."
    sleep 15

    # Test the function
    echo ""
    echo "🧪 Step 3: Testing deployed function..."
    echo ""

    RESPONSE=$(curl -s -X POST "https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/opex-rag-query" \
        -H 'Content-Type: application/json' \
        -d '{"assistant":"opex","question":"test"}')

    if echo "$RESPONSE" | grep -q "BOOT_ERROR"; then
        echo "❌ Function is returning BOOT_ERROR"
        echo "Response: $RESPONSE"
        echo ""
        echo "Check logs at: https://supabase.com/dashboard/project/ublqmilcjtpnflofprkr/functions/opex-rag-query/logs"
        exit 1
    elif echo "$RESPONSE" | grep -q "answer"; then
        echo "✅ Function is working!"
        echo ""
        echo "Response preview:"
        echo "$RESPONSE" | jq -r '.answer' 2>/dev/null || echo "$RESPONSE"
        echo ""
        echo "🎉 Deployment complete and verified!"
        echo ""
        echo "Next steps:"
        echo "1. Check query logging: psql \$opex_POSTGRES_URL -c \"SELECT * FROM opex.rag_queries LIMIT 1;\""
        echo "2. Test with Next.js client: lib/opex/ragClient.ts"
        echo "3. Upload documents to vector stores"
    else
        echo "⚠️  Unexpected response:"
        echo "$RESPONSE"
    fi
else
    echo ""
    echo "❌ Deployment failed"
    echo ""
    echo "Common issues:"
    echo "1. Token lacks Edge Functions permissions"
    echo "   → Generate new token with correct scopes"
    echo "2. Docker not running"
    echo "   → Start Docker Desktop"
    echo "3. Network issues"
    echo "   → Check internet connection"
    exit 1
fi
