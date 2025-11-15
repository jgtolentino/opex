# Deploy OpEx RAG Edge Function - CLI Method

**Issue**: Current Management API token lacks Edge Function deployment permissions
**Solution**: Use Personal Access Token with proper scopes OR deploy via Dashboard

---

## Option 1: CLI Deployment with Personal Access Token (Recommended)

### Step 1: Generate Personal Access Token

1. Go to https://supabase.com/dashboard/account/tokens
2. Click "Generate New Token"
3. Name: "Edge Functions Deployment"
4. Scopes: Select **ALL** or at minimum:
   - ✅ Edge Functions: Read, Write
   - ✅ Projects: Read
5. Copy the token (starts with `sbp_`)

### Step 2: Login to Supabase CLI

```bash
# Paste your Personal Access Token when prompted
supabase login
```

### Step 3: Deploy the Function

```bash
cd /Users/tbwa/opex

# Deploy with JWT verification disabled
supabase functions deploy opex-rag-query \
  --no-verify-jwt \
  --project-ref ublqmilcjtpnflofprkr
```

### Step 4: Test the Deployment

```bash
curl -X POST https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/opex-rag-query \
  -H 'Content-Type: application/json' \
  -d '{"assistant":"opex","question":"test"}' | jq
```

---

## Option 2: Dashboard Deployment (Fallback)

### Navigate to Function Editor

1. Go to https://supabase.com/dashboard/project/ublqmilcjtpnflofprkr/functions
2. Click on "opex-rag-query"
3. Click the "Code" tab

### Upload the Function Code

Copy the entire content from:
```
/Users/tbwa/opex/supabase/functions/opex-rag-query/index.ts
```

### Deploy

1. Ensure "Verify JWT" is **UNCHECKED**
2. Click "Deploy"
3. Wait for deployment to complete (~30 seconds)

---

## Verification Steps

### Test 1: Basic Health Check
```bash
curl -X POST https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/opex-rag-query \
  -H 'Content-Type: application/json' \
  -d '{"assistant":"opex","question":"test"}'
```

**Expected**: JSON response with `answer`, `citations`, `metadata`
**Failure**: `{"code":"BOOT_ERROR",...}` means deployment didn't work

### Test 2: HR Query
```bash
curl -X POST https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/opex-rag-query \
  -H 'Content-Type: application/json' \
  -d '{
    "assistant": "opex",
    "question": "What is the employee onboarding process?",
    "domain": "hr",
    "process": "onboarding"
  }' | jq
```

### Test 3: Verify Query Logging
```bash
psql "postgres://postgres.ublqmilcjtpnflofprkr:1G8TRd5wE7b9szBH@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require" \
  -c "SELECT question, domain, success, created_at FROM opex.rag_queries ORDER BY created_at DESC LIMIT 3;"
```

---

## Current Status

- ✅ Database migration deployed
- ✅ Vector stores created and configured
- ✅ Edge Function secrets set
- ⏳ Edge Function deployment pending (needs proper token OR Dashboard upload)

---

## Why CLI Deployment Failed

The current token (`sbp_5d3b419ed91215372f8a8fb7b0a478cc1ec90eca`) is a **Management API token** with limited scopes:
- ✅ Can create/update function via API
- ✅ Can set secrets
- ❌ Cannot deploy via CLI
- ❌ Cannot access logs

**Solution**: Generate a **Personal Access Token** with Edge Functions deployment permissions.

---

## Next Steps

1. Choose Option 1 (CLI) or Option 2 (Dashboard)
2. Deploy the function
3. Run all 3 verification tests
4. Confirm query logging works
5. Integration ready for Next.js!
