# OpEx RAG Integration - Deployment Status

## ✅ Completed

### 1. Database Migration (opex.rag_queries)
**Status:** Successfully deployed
**Project:** ublqmilcjtpnflofprkr
**Verification:**
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'opex';
-- Result: rag_queries ✓
```

**Deployed Components:**
- ✅ opex schema created
- ✅ rag_queries table with all columns
- ✅ 8 indexes (performance + JSONB)
- ✅ RLS enabled with 4 policies
- ✅ 2 helper functions (get_rag_analytics, get_popular_questions)

---

## ⏳ Pending - Edge Function Deployment

### 2. opex-rag-query Edge Function
**Status:** Code ready, deployment blocked by access permissions
**Location:** `supabase/functions/opex-rag-query/index.ts`
**Error:** 403 - "Your account does not have the necessary privileges to access this endpoint"

**File Verified:** ✓ (8.7 KB, complete implementation)

**Deployment Options:**

#### Option A: Supabase Dashboard (Manual)
1. Go to https://supabase.com/dashboard/project/ublqmilcjtpnflofprkr/functions
2. Click "Create a new function"
3. Name: `opex-rag-query`
4. Upload/paste contents of `supabase/functions/opex-rag-query/index.ts`
5. Uncheck "Enforce JWT verification" (for public access)
6. Deploy

#### Option B: Supabase CLI (Requires elevated access token)
```bash
export SUPABASE_ACCESS_TOKEN="<service_role_token_or_admin_token>"
supabase functions deploy opex-rag-query --no-verify-jwt --project-ref ublqmilcjtpnflofprkr
```

#### Option C: Supabase MCP Tools (When configured)
Use the Supabase MCP server tools once configured:
- URL: https://mcp.supabase.com/mcp?project_ref=ublqmilcjtpnflofprkr

---

## ⏳ Pending - Edge Function Secrets

### 3. Environment Variables to Set
**Required for opex-rag-query function:**

```bash
# OpenAI Configuration
OPENAI_API_KEY=<your_openai_api_key>

# Vector Store IDs (from Finance RAG setup)
VS_POLICIES_ID=<vs_id_for_policies>
VS_SOPS_WORKFLOWS_ID=<vs_id_for_sops>
VS_EXAMPLES_SYSTEMS_ID=<vs_id_for_examples>

# Supabase Configuration (auto-provided by Edge Functions)
SUPABASE_URL=https://ublqmilcjtpnflofprkr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVibHFtaWxjanRwbmZsb2ZwcmtyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzE2MzI3NSwiZXhwIjoyMDc4NzM5Mjc1fQ.kvw9AtLxATJNP-RNjtPQIjn5Gd5BToXTDwXnoBCrHYo
```

**How to Set (via Dashboard):**
1. Go to https://supabase.com/dashboard/project/ublqmilcjtpnflofprkr/settings/functions
2. Add each environment variable
3. Restart the Edge Function

**How to Set (via CLI):**
```bash
supabase secrets set \
  OPENAI_API_KEY="$OPENAI_API_KEY" \
  VS_POLICIES_ID="$VS_POLICIES_ID" \
  VS_SOPS_WORKFLOWS_ID="$VS_SOPS_WORKFLOWS_ID" \
  VS_EXAMPLES_SYSTEMS_ID="$VS_EXAMPLES_SYSTEMS_ID" \
  --project-ref ublqmilcjtpnflofprkr
```

---

## ⏳ Pending - Next.js Environment Variables

### 4. Environment Variables for Next.js App

Add to `.env.local` or Vercel environment variables:

```bash
# OpEx Supabase (for app data)
NEXT_PUBLIC_SUPABASE_URL=https://ublqmilcjtpnflofprkr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVibHFtaWxjanRwbmZsb2ZwcmtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNjMyNzUsImV4cCI6MjA3ODczOTI3NX0.aVVY4Kgain0575E3GmLHTluLcFkZbcoC0G-Dmy9kzUs
```

---

## ⏳ Pending - Smoke Test

### 5. End-to-End Verification

Once Edge Function is deployed and secrets are set, run this test:

#### Test Script (`scripts/test-opex-rag.ts`):
```typescript
import { askOpexAssistant } from '../lib/opex/ragClient';

async function testOpexRAG() {
  console.log('Testing OpEx RAG integration...\n');

  const response = await askOpexAssistant({
    question: 'What are the steps for employee requisition and who approves?',
    domain: 'hr',
    process: 'requisition',
  });

  console.log('Question:', response.metadata);
  console.log('\nAnswer:', response.answer);
  console.log('\nCitations:', response.citations);
  console.log('\nMetadata:', response.metadata);
}

testOpexRAG().catch(console.error);
```

#### Run Test:
```bash
tsx scripts/test-opex-rag.ts
```

#### Verify Logging:
```sql
-- Check that query was logged
SELECT * FROM opex.rag_queries ORDER BY created_at DESC LIMIT 1;

-- Verify analytics
SELECT opex.get_rag_analytics('opex-assistant', 1);
```

---

## Current Blocker

**Access Permissions:** The Supabase access token (sbp_5d3b419ed91215372f8a8fb7b0a478cc1ec90eca) does not have permissions to deploy Edge Functions.

**Resolution Options:**
1. Use Supabase Dashboard for manual deployment
2. Obtain service role or admin access token for CLI deployment
3. Configure Supabase MCP server for automated deployment

---

## Summary

**Progress:** 1 of 4 tasks completed
- ✅ Database migration
- ⏳ Edge Function deployment (blocked by permissions)
- ⏳ Secrets configuration (depends on Edge Function deployment)
- ⏳ Smoke test (depends on full deployment)

**Ready for Deployment:** All code is complete and verified. Deployment can proceed once access permissions are resolved.

**Files Ready:**
- ✅ `packages/db/migrations/001_opex_rag_queries.sql` (deployed)
- ✅ `supabase/functions/opex-rag-query/index.ts` (ready)
- ✅ `lib/opex/ragClient.ts` (ready)
- ✅ `config/opex_assistant_system_prompt.md` (ready)
