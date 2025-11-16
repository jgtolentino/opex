#!/usr/bin/env bash
set -euo pipefail

###############################################
# OpEx RAG – One-Shot Deployment Script
# Requirements:
#   - supabase CLI logged in
#   - openai CLI installed & logged in
#   - jq installed
#   - Run from repo root (where supabase/config.toml lives)
###############################################

### ── EDIT THESE BEFORE RUNNING ──────────────

# Your Supabase project ref (from dashboard URL)
PROJECT_REF="${PROJECT_REF:-ublqmilcjtpnflofprkr}"   # <-- CHANGE IF NEEDED

# Core env – must be set in your shell before running
: "${SUPABASE_URL:?SUPABASE_URL must be set}"
: "${SUPABASE_SERVICE_ROLE_KEY:?SUPABASE_SERVICE_ROLE_KEY must be set}"
: "${OPENAI_API_KEY:?OPENAI_API_KEY must be set}"

# Vector store display names
VS_POLICIES_NAME="OpEx Policies"
VS_SOPS_NAME="OpEx SOPs & Workflows"
VS_EXAMPLES_NAME="OpEx Examples & Systems"

###############################################
echo "▶ OpEx RAG deployment starting…"
echo "   Project:  $PROJECT_REF"
echo

# 0) Sanity checks
for cmd in supabase openai jq curl; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "❌ Missing dependency: $cmd" >&2
    exit 1
  fi
done

echo "✔ CLI dependencies found."
echo

# 1) Ensure project is linked
echo "▶ Linking Supabase project (if not already)…"
supabase link --project-ref "$PROJECT_REF" >/dev/null 2>&1 || true
echo "✔ Project linked."
echo

# 2) Create OpenAI vector stores
echo "▶ Creating OpenAI vector stores…"

POLICIES_JSON=$(OPENAI_API_KEY="$OPENAI_API_KEY" openai vector-stores create \
  -d "$VS_POLICIES_NAME" -m "gpt-4o-mini")
VS_POLICIES_ID=$(echo "$POLICIES_JSON" | jq -r '.id')

SOPS_JSON=$(OPENAI_API_KEY="$OPENAI_API_KEY" openai vector-stores create \
  -d "$VS_SOPS_NAME" -m "gpt-4o-mini")
VS_SOPS_WORKFLOWS_ID=$(echo "$SOPS_JSON" | jq -r '.id')

EXAMPLES_JSON=$(OPENAI_API_KEY="$OPENAI_API_KEY" openai vector-stores create \
  -d "$VS_EXAMPLES_NAME" -m "gpt-4o-mini")
VS_EXAMPLES_SYSTEMS_ID=$(echo "$EXAMPLES_JSON" | jq -r '.id')

echo "✔ Vector stores created:"
echo "   VS_POLICIES_ID          = $VS_POLICIES_ID"
echo "   VS_SOPS_WORKFLOWS_ID    = $VS_SOPS_WORKFLOWS_ID"
echo "   VS_EXAMPLES_SYSTEMS_ID  = $VS_EXAMPLES_SYSTEMS_ID"
echo

# 3) Push secrets into Supabase
echo "▶ Setting Supabase secrets…"

supabase secrets set \
  OPENAI_API_KEY="$OPENAI_API_KEY" \
  VS_POLICIES_ID="$VS_POLICIES_ID" \
  VS_SOPS_WORKFLOWS_ID="$VS_SOPS_WORKFLOWS_ID" \
  VS_EXAMPLES_SYSTEMS_ID="$VS_EXAMPLES_SYSTEMS_ID" \
  SUPABASE_URL="$SUPABASE_URL" \
  SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
  --project-ref "$PROJECT_REF"

echo "✔ Secrets configured."
echo

# 4) Deploy Edge Functions
echo "▶ Deploying Edge Functions…"

supabase functions deploy opex-rag-query --project-ref "$PROJECT_REF"
supabase functions deploy ingest-document --project-ref "$PROJECT_REF"

echo
echo "✔ Functions deployed:"
supabase functions list --project-ref "$PROJECT_REF"
echo

# 5) Optional smoke tests
echo "▶ Running optional smoke tests (if test.txt exists)…"
if [[ -f test.txt ]]; then
  echo " - Calling ingest-document…"
  curl -sS -X POST "$SUPABASE_URL/functions/v1/ingest-document" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    -F "file=@test.txt" \
    -F "userId=deployment-test-user" | jq . || true
else
  echo "   (No test.txt file found, skipping ingest-document smoke test.)"
fi

echo
echo " - Example call for opex-rag-query (not executed):"
cat <<EOF
curl -X POST "$SUPABASE_URL/functions/v1/opex-rag-query" \\
  -H "Authorization: Bearer \$SUPABASE_SERVICE_ROLE_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"assistant":"opex","question":"What is OpEx?"}'
EOF

echo
echo "✅ OpEx RAG deployment script completed."
echo "   Next: verify responses, then mark deployment 100% in DEPLOYMENT_AUDIT_REPORT.md."
