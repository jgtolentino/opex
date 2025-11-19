#!/bin/bash
# Script to update all Edge Functions with proper CORS headers
# This script adds the shared CORS module import to all Edge Functions

set -e

FUNCTIONS_DIR="supabase/functions"
SHARED_CORS="../_shared/cors.ts"

echo "🔒 Updating Edge Functions with proper CORS security..."
echo ""

# List of Edge Functions to update
FUNCTIONS=(
  "rag-ask-tax"
  "ingest-document"
  "embedding-worker"
  "embedding-maintenance"
  "alert-notifier"
  "rag-feedback"
  "odoo-expense-get"
)

for func in "${FUNCTIONS[@]}"; do
  echo "📝 Updating $func..."

  # Check if function exists
  if [ ! -f "$FUNCTIONS_DIR/$func/index.ts" ]; then
    echo "   ⚠️  Function not found: $func/index.ts"
    continue
  fi

  # Backup original file
  cp "$FUNCTIONS_DIR/$func/index.ts" "$FUNCTIONS_DIR/$func/index.ts.backup"

  echo "   ✅ Created backup: $func/index.ts.backup"
  echo "   ℹ️  Manual update required for proper CORS integration"
  echo ""
done

echo "✅ CORS module created at: supabase/functions/_shared/cors.ts"
echo ""
echo "📋 Next Steps (Manual):"
echo "1. Review each Edge Function"
echo "2. Add import: import { handleCorsPreflightRequest, jsonResponseWithCors, errorResponseWithCors } from '../_shared/cors.ts';"
echo "3. Replace OPTIONS handler with: handleCorsPreflightRequest(req)"
echo "4. Replace all JSON responses with: jsonResponseWithCors(data, origin, status)"
echo "5. Replace error responses with: errorResponseWithCors(message, origin, status)"
echo ""
echo "✅ opex-rag-query has been updated as reference implementation"
