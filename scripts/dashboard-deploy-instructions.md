# Dashboard Deployment - OpEx RAG Edge Function

The function code is ready and correct in `/Users/tbwa/opex/supabase/functions/opex-rag-query/index.ts`

## Quick Deployment via Dashboard

### 1. Open Function Editor
**URL**: https://supabase.com/dashboard/project/ublqmilcjtpnflofprkr/functions/opex-rag-query

### 2. Go to Code Tab
Click the **"Code"** tab in the function editor

### 3. Copy & Paste the Function Code

The corrected code is in:
```
/Users/tbwa/opex/supabase/functions/opex-rag-query/index.ts
```

Or run this command to copy it to clipboard:
```bash
cat /Users/tbwa/opex/supabase/functions/opex-rag-query/index.ts | pbcopy
```

### 4. Verify Settings
- ✅ **Verify JWT**: Should be **UNCHECKED** (disabled)

### 5. Deploy
Click the **"Deploy"** button and wait ~30 seconds

### 6. Test
```bash
curl -X POST https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/opex-rag-query \
  -H 'Content-Type: application/json' \
  -d '{"assistant":"opex","question":"test"}' | jq
```

**Expected**: JSON response with `answer`, `citations`, `metadata`
**Failure**: `{"code":"BOOT_ERROR",...}` means code wasn't deployed properly

---

## Why This Works

The Dashboard deployment uses a different pipeline than the API/CLI:
- Dashboard → Direct deployment (proven to work)
- API → Has been causing BOOT_ERROR
- CLI → Requires specific access token scopes

The code is already correct with the schema configuration fix (line 27-29).

---

## Next: Verify Query Logging

After successful deployment:
```bash
# Run a test query
curl -X POST https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/opex-rag-query \
  -H 'Content-Type: application/json' \
  -d '{"assistant":"opex","question":"What is the employee onboarding process?","domain":"hr"}'

# Check if it was logged
psql "postgres://postgres.ublqmilcjtpnflofprkr:1G8TRd5wE7b9szBH@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require" \
  -c "SELECT question, domain, success, created_at FROM opex.rag_queries ORDER BY created_at DESC LIMIT 1;"
```
