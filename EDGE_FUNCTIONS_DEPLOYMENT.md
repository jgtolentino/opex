# Edge Functions Deployment Checklist

**Project**: OpEx RAG System
**Database**: ublqmilcjtpnflofprkr.supabase.co

## Edge Functions Status

### 1. opex-rag-query
**Location**: `supabase/functions/opex-rag-query/index.ts`
**Purpose**: Query OpEx or PH Tax Assistant with RAG using OpenAI Assistants API
**Status**: ⏳ **NEEDS DEPLOYMENT**

**Required Secrets**:
```bash
OPENAI_API_KEY=<openai-api-key>
VS_POLICIES_ID=<vector-store-id>
VS_SOPS_WORKFLOWS_ID=<vector-store-id>
VS_EXAMPLES_SYSTEMS_ID=<vector-store-id>
SUPABASE_URL=https://ublqmilcjtpnflofprkr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

**Deployment Command**:
```bash
# Option A: Supabase CLI (requires valid access token)
export SUPABASE_ACCESS_TOKEN="your_access_token"
supabase functions deploy opex-rag-query --project-ref ublqmilcjtpnflofprkr

# Option B: Supabase Dashboard
# 1. Go to https://supabase.com/dashboard/project/ublqmilcjtpnflofprkr/functions
# 2. Click "Create Function" or select existing "opex-rag-query"
# 3. Paste contents from supabase/functions/opex-rag-query/index.ts
# 4. Click "Deploy"
```

**Test Payload**:
```json
{
  "assistant": "opex",
  "question": "What is Operational Excellence?",
  "domain": "knowledge_base",
  "userId": "test-user-123",
  "userEmail": "test@example.com"
}
```

**Expected Response**:
```json
{
  "answer": "...",
  "citations": [],
  "metadata": {
    "assistantId": "asst_5KOX6w8iqnQq48JxRGBop06c",
    "threadId": "thread_...",
    "runId": "run_...",
    "tokensUsed": { "prompt": 100, "completion": 50, "total": 150 },
    "responseTimeMs": 2500
  }
}
```

---

### 2. ingest-document
**Location**: `supabase/functions/ingest-document/index.ts`
**Purpose**: Upload documents to OpenAI Vector Stores for RAG
**Status**: ⏳ **NEEDS DEPLOYMENT**

**Required Secrets**:
```bash
OPENAI_API_KEY=<openai-api-key>
VS_POLICIES_ID=<vector-store-id>
VS_SOPS_WORKFLOWS_ID=<vector-store-id>
VS_EXAMPLES_SYSTEMS_ID=<vector-store-id>
SUPABASE_URL=https://ublqmilcjtpnflofprkr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

**Deployment Command**:
```bash
# Option A: Supabase CLI
supabase functions deploy ingest-document --project-ref ublqmilcjtpnflofprkr

# Option B: Supabase Dashboard
# Same steps as opex-rag-query
```

**Test with curl** (after deployment):
```bash
# Create test file
echo "This is a test policy document" > test-policy.txt

# Upload
curl -X POST https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/ingest-document \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -F "file=@test-policy.txt" \
  -F "userId=test-user" \
  -F "userEmail=test@example.com" \
  -F "category=policies" \
  -F "domain=hr"
```

---

### 3. ingest-upload
**Location**: `supabase/functions/ingest-upload/`
**Purpose**: Legacy upload function (may be deprecated)
**Status**: ℹ️ **REVIEW NEEDED** - Determine if still needed

---

### 4. embedding-worker
**Location**: `supabase/functions/embedding-worker/`
**Purpose**: Process documents and generate embeddings
**Status**: ℹ️ **REVIEW NEEDED** - Check if required for pgvector approach

---

### 5. embedding-maintenance
**Location**: `supabase/functions/embedding-maintenance/`
**Purpose**: Maintenance tasks for embeddings
**Status**: ℹ️ **REVIEW NEEDED** - Check if required

---

## Deployment Steps

### Step 1: Create OpenAI Vector Stores

Visit https://platform.openai.com/storage/vector_stores and create 3 stores:

1. **OpEx Policies**
   - Name: "OpEx Policies"
   - Description: "Company policies and procedures"
   - Copy ID to `VS_POLICIES_ID`

2. **OpEx SOPs & Workflows**
   - Name: "OpEx SOPs & Workflows"
   - Description: "Standard Operating Procedures and workflow documentation"
   - Copy ID to `VS_SOPS_WORKFLOWS_ID`

3. **OpEx Examples & Systems**
   - Name: "OpEx Examples & Systems"
   - Description: "System documentation and examples"
   - Copy ID to `VS_EXAMPLES_SYSTEMS_ID`

### Step 2: Configure Supabase Secrets

Go to https://supabase.com/dashboard/project/ublqmilcjtpnflofprkr/settings/vault

Add these secrets:
- `OPENAI_API_KEY` (from https://platform.openai.com/api-keys)
- `VS_POLICIES_ID` (from Step 1)
- `VS_SOPS_WORKFLOWS_ID` (from Step 1)
- `VS_EXAMPLES_SYSTEMS_ID` (from Step 1)
- `SUPABASE_URL` = `https://ublqmilcjtpnflofprkr.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` (from Supabase dashboard > Settings > API)

### Step 3: Deploy Edge Functions

**Option A: CLI (if you have valid access token)**
```bash
export SUPABASE_ACCESS_TOKEN="your_token"
supabase functions deploy opex-rag-query --project-ref ublqmilcjtpnflofprkr
supabase functions deploy ingest-document --project-ref ublqmilcjtpnflofprkr
```

**Option B: Dashboard (recommended)**
1. Visit https://supabase.com/dashboard/project/ublqmilcjtpnflofprkr/functions
2. For each function:
   - Click "Create Function" or select existing
   - Copy/paste code from `supabase/functions/<function-name>/index.ts`
   - Click "Deploy"

### Step 4: Verify Deployment

**Test opex-rag-query**:
```bash
curl -X POST https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/opex-rag-query \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "assistant": "opex",
    "question": "What is OpEx?",
    "userId": "deployment-test"
  }'
```

**Expected**: JSON response with answer and metadata

**Test ingest-document**:
```bash
echo "Test document" > test.txt
curl -X POST https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/ingest-document \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -F "file=@test.txt" \
  -F "userId=test" \
  -F "userEmail=test@example.com"
```

**Expected**: JSON response with fileId, vectorStoreFileId

### Step 5: Verify Database Logging

```bash
psql "$POSTGRES_URL" -c "SELECT * FROM opex.rag_queries ORDER BY created_at DESC LIMIT 5;"
psql "$POSTGRES_URL" -c "SELECT * FROM opex.document_uploads ORDER BY created_at DESC LIMIT 5;"
```

**Expected**: See test queries/uploads logged

---

## Troubleshooting

### Function deployment fails
- Check Supabase access token is valid
- Verify project ref is correct (ublqmilcjtpnflofprkr)
- Use dashboard deployment as fallback

### "Secrets not found" error
- Verify all secrets are configured in Supabase Vault
- Check secret names match exactly (case-sensitive)
- Redeploy function after adding secrets

### Database insert fails
- Verify RLS policies allow service_role
- Check table schema matches insert payload
- Review function logs in Supabase dashboard

### OpenAI API errors
- Verify OPENAI_API_KEY is valid
- Check vector store IDs exist
- Ensure API key has access to Assistants API

---

## Production Checklist

Before going live:

- [ ] All 3 vector stores created in OpenAI
- [ ] All required secrets configured in Supabase Vault
- [ ] opex-rag-query function deployed successfully
- [ ] ingest-document function deployed successfully
- [ ] Test query logs to opex.rag_queries correctly
- [ ] Test upload logs to opex.document_uploads correctly
- [ ] Auth0 configured in Vercel
- [ ] Frontend deployed to Vercel
- [ ] End-to-end test: Login → Upload → Query → View logs

---

## Function URLs (After Deployment)

- **opex-rag-query**: `https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/opex-rag-query`
- **ingest-document**: `https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/ingest-document`
