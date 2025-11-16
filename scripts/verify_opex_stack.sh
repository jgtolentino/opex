#!/usr/bin/env bash
set -euo pipefail

###############################################
# OpEx Stack Verification Script
# Platforms: Vercel + Supabase + Rocket.Chat
# Date: 2025-11-16
###############################################

echo "🔍 OpEx Stack Verification (Vercel + Supabase + Rocket.Chat)"
echo "============================================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track test results
PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

# Helper functions
pass() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((PASS_COUNT++))
}

fail() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    ((FAIL_COUNT++))
}

warn() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
    ((WARN_COUNT++))
}

info() {
    echo -e "ℹ️  $1"
}

###############################################
# 1. Environment Variables Check
###############################################
echo "1️⃣  Checking Environment Variables..."
echo "-----------------------------------"

# Supabase
if [[ -n "${NEXT_PUBLIC_SUPABASE_URL:-}" ]]; then
    pass "NEXT_PUBLIC_SUPABASE_URL set"
else
    fail "NEXT_PUBLIC_SUPABASE_URL not set"
fi

if [[ -n "${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" ]]; then
    pass "NEXT_PUBLIC_SUPABASE_ANON_KEY set"
else
    fail "NEXT_PUBLIC_SUPABASE_ANON_KEY not set"
fi

if [[ -n "${opex_SUPABASE_SERVICE_ROLE_KEY:-}" ]]; then
    pass "opex_SUPABASE_SERVICE_ROLE_KEY set (backend only)"
else
    warn "opex_SUPABASE_SERVICE_ROLE_KEY not set (required for Edge Functions)"
fi

# Rocket.Chat (optional - may not be in env)
if [[ -n "${ROCKETCHAT_WEBHOOK_URL:-}" ]]; then
    pass "ROCKETCHAT_WEBHOOK_URL set"
else
    warn "ROCKETCHAT_WEBHOOK_URL not set (optional for webhook integration)"
fi

# OpenAI (for Edge Functions)
if [[ -n "${OPENAI_API_KEY:-}" ]]; then
    pass "OPENAI_API_KEY set (for Edge Functions)"
else
    warn "OPENAI_API_KEY not set (required for RAG queries)"
fi

echo ""

###############################################
# 2. Supabase Connectivity
###############################################
echo "2️⃣  Testing Supabase Connectivity..."
echo "-----------------------------------"

SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-https://ublqmilcjtpnflofprkr.supabase.co}"

# Test public API endpoint
if curl -s -f "${SUPABASE_URL}/rest/v1/" -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" > /dev/null 2>&1; then
    pass "Supabase REST API reachable"
else
    fail "Supabase REST API not reachable at ${SUPABASE_URL}"
fi

# Test database connection (if psql available and POSTGRES_URL set)
if command -v psql >/dev/null 2>&1 && [[ -n "${opex_POSTGRES_URL:-}" ]]; then
    if psql "${opex_POSTGRES_URL}" -c "SELECT 1;" > /dev/null 2>&1; then
        pass "PostgreSQL database connection successful"
    else
        fail "PostgreSQL database connection failed"
    fi
else
    warn "psql not available or POSTGRES_URL not set - skipping direct DB test"
fi

echo ""

###############################################
# 3. Edge Functions Status
###############################################
echo "3️⃣  Checking Edge Functions..."
echo "-----------------------------------"

# Check if Edge Functions are deployed
EDGE_FUNCTION_URL="${SUPABASE_URL}/functions/v1"

# Test opex-rag-query endpoint (expect 400 or 200, not 404)
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    "${EDGE_FUNCTION_URL}/opex-rag-query" \
    -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" \
    -H "Content-Type: application/json" \
    -d '{}' 2>/dev/null || echo "000")

if [[ "$HTTP_STATUS" == "200" ]] || [[ "$HTTP_STATUS" == "400" ]]; then
    pass "opex-rag-query Edge Function deployed"
elif [[ "$HTTP_STATUS" == "404" ]]; then
    fail "opex-rag-query Edge Function NOT deployed (404)"
else
    warn "opex-rag-query Edge Function status unclear (HTTP $HTTP_STATUS)"
fi

# Test ingest-document endpoint
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    "${EDGE_FUNCTION_URL}/ingest-document" \
    -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" 2>/dev/null || echo "000")

if [[ "$HTTP_STATUS" == "200" ]] || [[ "$HTTP_STATUS" == "400" ]]; then
    pass "ingest-document Edge Function deployed"
elif [[ "$HTTP_STATUS" == "404" ]]; then
    fail "ingest-document Edge Function NOT deployed (404)"
else
    warn "ingest-document Edge Function status unclear (HTTP $HTTP_STATUS)"
fi

echo ""

###############################################
# 4. Database Schema Verification
###############################################
echo "4️⃣  Verifying Database Schema..."
echo "-----------------------------------"

if command -v psql >/dev/null 2>&1 && [[ -n "${opex_POSTGRES_URL:-}" ]]; then
    # Check pgvector extension
    if psql "${opex_POSTGRES_URL}" -tAc "SELECT extname FROM pg_extension WHERE extname = 'vector';" 2>/dev/null | grep -q vector; then
        pass "pgvector extension installed"
    else
        fail "pgvector extension NOT installed"
    fi

    # Check opex schema
    if psql "${opex_POSTGRES_URL}" -tAc "SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'opex';" 2>/dev/null | grep -q opex; then
        pass "opex schema exists"
    else
        fail "opex schema NOT found"
    fi

    # Check rag_queries table
    if psql "${opex_POSTGRES_URL}" -tAc "SELECT table_name FROM information_schema.tables WHERE table_schema = 'opex' AND table_name = 'rag_queries';" 2>/dev/null | grep -q rag_queries; then
        pass "opex.rag_queries table exists"
    else
        fail "opex.rag_queries table NOT found"
    fi

    # Check document_uploads table
    if psql "${opex_POSTGRES_URL}" -tAc "SELECT table_name FROM information_schema.tables WHERE table_schema = 'opex' AND table_name = 'document_uploads';" 2>/dev/null | grep -q document_uploads; then
        pass "opex.document_uploads table exists"
    else
        fail "opex.document_uploads table NOT found"
    fi
else
    warn "Skipping database schema checks (psql or POSTGRES_URL not available)"
fi

echo ""

###############################################
# 5. Vercel Deployment Status (if applicable)
###############################################
echo "5️⃣  Checking Vercel Deployment..."
echo "-----------------------------------"

# This section assumes you have a Vercel deployment URL
VERCEL_URL="${VERCEL_URL:-}"

if [[ -n "$VERCEL_URL" ]]; then
    if curl -s -f "$VERCEL_URL" > /dev/null 2>&1; then
        pass "Vercel deployment reachable at $VERCEL_URL"
    else
        fail "Vercel deployment NOT reachable at $VERCEL_URL"
    fi
else
    warn "VERCEL_URL not set - skipping Vercel deployment check"
    info "Set VERCEL_URL env var to test Vercel deployment"
fi

echo ""

###############################################
# 6. Rocket.Chat Integration (optional)
###############################################
echo "6️⃣  Checking Rocket.Chat Integration..."
echo "-----------------------------------"

if [[ -n "${ROCKETCHAT_WEBHOOK_URL:-}" ]]; then
    # Test webhook endpoint is reachable
    if curl -s -f "${ROCKETCHAT_WEBHOOK_URL}" -X POST -H "Content-Type: application/json" -d '{"text":"Health check"}' > /dev/null 2>&1; then
        pass "Rocket.Chat webhook endpoint reachable"
    else
        warn "Rocket.Chat webhook endpoint may not be reachable (could be auth protected)"
    fi
else
    warn "ROCKETCHAT_WEBHOOK_URL not set - skipping Rocket.Chat check"
    info "Rocket.Chat integration is optional but recommended"
fi

echo ""

###############################################
# Summary
###############################################
echo "============================================================"
echo "📊 Verification Summary"
echo "============================================================"
echo -e "${GREEN}✅ Passed: ${PASS_COUNT}${NC}"
echo -e "${YELLOW}⚠️  Warnings: ${WARN_COUNT}${NC}"
echo -e "${RED}❌ Failed: ${FAIL_COUNT}${NC}"
echo ""

if [[ $FAIL_COUNT -eq 0 ]]; then
    echo -e "${GREEN}🎉 All critical checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Deploy Edge Functions: ./deploy_opex_rag.sh"
    echo "2. Configure Rocket.Chat webhook (if needed)"
    echo "3. Deploy frontend to Vercel"
    echo "4. Test end-to-end flow"
    exit 0
else
    echo -e "${RED}⚠️  Some checks failed. Review issues above.${NC}"
    echo ""
    echo "Common fixes:"
    echo "- Missing env vars → Check .env.local and Vercel environment"
    echo "- Edge Functions not deployed → Run ./deploy_opex_rag.sh"
    echo "- Database issues → Review DEPLOYMENT_AUDIT_REPORT.md"
    exit 1
fi
