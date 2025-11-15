#!/bin/bash
# ============================================================================
# test-edge-function.sh
# Test opex-rag-query Edge Function directly
# ============================================================================

set -e

# Configuration
FUNCTION_URL="https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/opex-rag-query"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "================================================================"
echo "OpEx RAG Edge Function - Direct Test"
echo "================================================================"

# Test 1: OpEx Assistant - HR Onboarding
echo -e "\n${YELLOW}Test 1: OpEx Assistant - HR Onboarding${NC}"
echo "Question: What are the steps for employee onboarding?"

response=$(curl -s -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "assistant": "opex",
    "question": "What are the steps for employee onboarding?",
    "domain": "hr",
    "process": "onboarding"
  }')

if echo "$response" | jq -e '.error' > /dev/null 2>&1; then
  echo -e "${RED}✗ FAILED${NC}"
  echo "$response" | jq '.error'
else
  echo -e "${GREEN}✓ SUCCESS${NC}"
  echo "Answer length: $(echo "$response" | jq -r '.answer' | wc -c) characters"
  echo "Citations: $(echo "$response" | jq '.citations | length')"
  echo "Response time: $(echo "$response" | jq -r '.metadata.responseTimeMs')ms"
fi

# Test 2: PH Tax Assistant - 2550M Deadline
echo -e "\n${YELLOW}Test 2: PH Tax Assistant - 2550M Deadline${NC}"
echo "Question: When is the deadline for filing BIR Form 2550M for January 2025?"

response=$(curl -s -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "assistant": "ph-tax",
    "question": "When is the deadline for filing BIR Form 2550M for January 2025?",
    "domain": "tax",
    "process": "month_end"
  }')

if echo "$response" | jq -e '.error' > /dev/null 2>&1; then
  echo -e "${RED}✗ FAILED${NC}"
  echo "$response" | jq '.error'
else
  echo -e "${GREEN}✓ SUCCESS${NC}"
  echo "Answer length: $(echo "$response" | jq -r '.answer' | wc -c) characters"
  echo "Citations: $(echo "$response" | jq '.citations | length')"
  echo "Response time: $(echo "$response" | jq -r '.metadata.responseTimeMs')ms"
fi

# Test 3: Invalid Request (should return 400)
echo -e "\n${YELLOW}Test 3: Invalid Request (empty question)${NC}"

response=$(curl -s -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "assistant": "opex",
    "question": ""
  }')

if echo "$response" | jq -e '.error' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Correctly rejected empty question${NC}"
  echo "Error: $(echo "$response" | jq -r '.error')"
else
  echo -e "${RED}✗ Should have returned error for empty question${NC}"
fi

echo -e "\n${GREEN}================================================================${NC}"
echo -e "${GREEN}Edge Function Tests Complete${NC}"
echo -e "${GREEN}================================================================${NC}"

echo -e "\n${YELLOW}Next: Verify query logs in database${NC}"
echo "psql \"\$OPEX_POSTGRES_URL\" -c \"SELECT question, domain, success, created_at FROM opex.rag_queries ORDER BY created_at DESC LIMIT 3;\""
