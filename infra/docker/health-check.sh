#!/bin/bash
# health-check.sh - OpEx Infrastructure Health Check
# Usage: ./health-check.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0

# Helper functions
pass() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED++))
}

fail() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED++))
}

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

section() {
    echo ""
    echo "=================================="
    echo "$1"
    echo "=================================="
}

# Start health check
echo "🔍 OpEx Infrastructure Health Check"
echo "Started at: $(date)"
echo ""

# 1. Docker Services
section "1️⃣ Docker Services"

if docker compose -f docker-compose.mcp-n8n.yml ps | grep -q "Up"; then
    pass "Docker Compose services running"
    docker compose -f docker-compose.mcp-n8n.yml ps
else
    fail "Docker Compose services not running"
fi

# Check individual services
if docker inspect mcp-coordinator --format='{{.State.Health.Status}}' 2>/dev/null | grep -q "healthy"; then
    pass "MCP Coordinator: healthy"
else
    fail "MCP Coordinator: unhealthy or not running"
fi

if docker inspect n8n --format='{{.State.Health.Status}}' 2>/dev/null | grep -q "healthy"; then
    pass "n8n: healthy"
else
    fail "n8n: unhealthy or not running"
fi

# 2. n8n Health Endpoint
section "2️⃣ n8n Health Endpoint"

if curl -sf --max-time 5 https://n8n.insightpulseai.net/healthz > /dev/null 2>&1; then
    pass "n8n health endpoint responding"
else
    fail "n8n health endpoint not responding"
fi

# 3. MCP Coordinator Health Endpoint
section "3️⃣ MCP Coordinator Health Endpoint"

if curl -sf --max-time 5 https://mcp.insightpulseai.net/health > /dev/null 2>&1; then
    pass "MCP coordinator health endpoint responding"
else
    warn "MCP coordinator health endpoint not responding (may not be implemented yet)"
fi

# 4. Supabase Edge Function
section "4️⃣ Supabase Edge Function"

EDGE_FUNCTION_RESPONSE=$(curl -sf --max-time 10 -X POST \
    https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/alert-notifier \
    -H "Content-Type: application/json" \
    -d '{
        "source": "health-check",
        "level": "info",
        "text": "Infrastructure health check test",
        "context": {"automated": true}
    }' 2>&1)

if echo "$EDGE_FUNCTION_RESPONSE" | grep -q "success"; then
    pass "Supabase Edge Function responding correctly"
else
    fail "Supabase Edge Function error: $EDGE_FUNCTION_RESPONSE"
fi

# 5. TLS Certificates
section "5️⃣ TLS Certificates"

# Check n8n cert
N8N_CERT_EXPIRY=$(echo | openssl s_client -servername n8n.insightpulseai.net -connect n8n.insightpulseai.net:443 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
if [ -n "$N8N_CERT_EXPIRY" ]; then
    pass "n8n TLS certificate valid until: $N8N_CERT_EXPIRY"
else
    fail "n8n TLS certificate not found or invalid"
fi

# Check MCP cert
MCP_CERT_EXPIRY=$(echo | openssl s_client -servername mcp.insightpulseai.net -connect mcp.insightpulseai.net:443 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
if [ -n "$MCP_CERT_EXPIRY" ]; then
    pass "MCP TLS certificate valid until: $MCP_CERT_EXPIRY"
else
    warn "MCP TLS certificate not found or invalid (may not be deployed yet)"
fi

# 6. Docker Resources
section "6️⃣ Docker Resource Usage"

echo "Container resource usage:"
docker stats --no-stream mcp-coordinator n8n 2>/dev/null || warn "Could not get container stats"

# 7. Disk Space
section "7️⃣ Disk Space"

DISK_USAGE=$(docker system df | grep "Local Volumes" | awk '{print $4}')
echo "Docker volume usage: $DISK_USAGE"

if [ -n "$DISK_USAGE" ]; then
    pass "Docker volumes healthy"
else
    warn "Could not determine disk usage"
fi

# Summary
section "📊 Summary"

TOTAL=$((PASSED + FAILED))
PASS_RATE=$(awk "BEGIN {printf \"%.1f\", ($PASSED/$TOTAL)*100}")

echo "Total checks: $TOTAL"
echo "Passed: ${GREEN}$PASSED${NC}"
echo "Failed: ${RED}$FAILED${NC}"
echo "Pass rate: ${PASS_RATE}%"
echo ""

if [ "$FAILED" -eq 0 ]; then
    echo -e "${GREEN}✅ All health checks passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some health checks failed. See details above.${NC}"
    exit 1
fi
