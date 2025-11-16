# Manual Deployment: rag-feedback Edge Function

**Note**: Automated deployment via Supabase CLI requires a valid access token. This guide provides manual deployment via Supabase Dashboard.

---

## Option 1: Supabase Dashboard (Recommended)

### Step 1: Navigate to Edge Functions

1. Go to: https://supabase.com/dashboard/project/ublqmilcjtpnflofprkr/functions
2. Click **"Create Function"** button

### Step 2: Configure Function

- **Function Name**: `rag-feedback`
- **Function Code**: Copy the entire contents from `supabase/functions/rag-feedback/index.ts`

### Step 3: Deploy

1. Paste the code into the editor
2. Click **"Deploy"** button
3. Wait for deployment to complete (~30 seconds)

### Step 4: Verify Deployment

Run the test script:
```bash
chmod +x test_rag_feedback.sh
./test_rag_feedback.sh
```

Expected output:
```
✅ PASS: Feedback submitted successfully
✅ PASS: Rating found in database
✅ PASS: Evaluation metrics view accessible
✅ PASS: Invalid rating correctly rejected
```

---

## Option 2: Fix Supabase CLI Authentication

### Get New Access Token

1. Go to: https://supabase.com/dashboard/account/tokens
2. Click **"Generate new token"**
3. Copy the token
4. Update `.env.local`:
   ```bash
   SUPABASE_ACCESS_TOKEN="sbp_NEW_TOKEN_HERE"
   ```
5. Update `~/.zshrc`:
   ```bash
   export SUPABASE_ACCESS_TOKEN="sbp_NEW_TOKEN_HERE"
   ```
6. Reload shell: `source ~/.zshrc`

### Deploy via CLI

```bash
export SUPABASE_ACCESS_TOKEN="sbp_NEW_TOKEN_HERE"
supabase functions deploy rag-feedback --project-ref ublqmilcjtpnflofprkr
```

---

## Option 3: Update Deployment Script

Add `rag-feedback` to `deploy_opex_rag.sh`:

```bash
# Line 90 - add after ingest-document
supabase functions deploy rag-feedback --project-ref "$PROJECT_REF"
```

Then run:
```bash
./deploy_opex_rag.sh
```

---

## Verification Steps

### 1. Check Function Deployed

```bash
# Via Dashboard
https://supabase.com/dashboard/project/ublqmilcjtpnflofprkr/functions

# Via CLI (if auth fixed)
supabase functions list --project-ref ublqmilcjtpnflofprkr
```

### 2. Test Feedback API

```bash
./test_rag_feedback.sh
```

### 3. Verify Database

```sql
-- Check ratings
SELECT id, question, rating, feedback, created_at
FROM opex.rag_queries
WHERE rating IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;

-- Check metrics
SELECT * FROM opex.rag_evaluation_metrics LIMIT 7;
```

---

## Next Steps After Deployment

1. ✅ Run `./test_rag_feedback.sh` to verify API
2. ✅ Run `./scripts/verify_opex_stack.sh` for full verification
3. ✅ Update `INTEGRATION_GUIDE.md` with feedback API usage
4. ✅ Add rating UI to frontend (Vercel)
5. ✅ Add feedback button to Rocket.Chat responses

---

## Troubleshooting

### Function not found (404)
- **Solution**: Redeploy via Dashboard or fix CLI auth

### Unauthorized (401)
- **Solution**: Regenerate Supabase access token

### Database errors
- **Solution**: Verify schema changes applied:
  ```sql
  \d opex.rag_queries
  -- Should show: rating, feedback, evaluation_metadata columns
  ```

### Test script fails
- **Solution**: Check `opex_SUPABASE_SERVICE_ROLE_KEY` in `.env.local`

---

**Status**: Ready for manual deployment
**Estimated Time**: 5-10 minutes via Dashboard
