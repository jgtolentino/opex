# OpEx RAG Integration - Manual Deployment Guide

## Current Status

✅ **Completed:**
- Database migration deployed to OpEx Supabase (ublqmilcjtpnflofprkr)
- All code files created and ready

⏳ **Pending:**
- Edge Function deployment (blocked by access permissions)
- Secrets configuration
- End-to-end testing

---

## Step-by-Step Manual Deployment

### Step 1: Deploy Edge Function via Supabase Dashboard

1. **Navigate to Functions:**
   - Go to https://supabase.com/dashboard/project/ublqmilcjtpnflofprkr/functions
   - Click "Create a new function"

2. **Create opex-rag-query function:**
   - **Function name:** `opex-rag-query`
   - **Upload file:** `supabase/functions/opex-rag-query/index.ts`
   - **Uncheck:** "Enforce JWT verification" (for public access from Next.js)
   - Click "Deploy"

3. **Verify deployment:**
   - Function should appear in the Functions list
   - Status should be "Deployed"
   - Note the Function URL (will be used in Next.js)

**Expected URL:**
```
https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/opex-rag-query
```

---

### Step 2: Configure Edge Function Secrets

1. **Navigate to Function Settings:**
   - Go to https://supabase.com/dashboard/project/ublqmilcjtpnflofprkr/settings/functions
   - Click on "opex-rag-query" function

2. **Add Environment Variables:**

   Click "Add new secret" for each:

   **OpenAI Configuration:**
   ```
   Name: OPENAI_API_KEY
   Value: <your_openai_api_key>
   ```

   **Vector Store IDs (from Finance RAG setup):**

   These need to be obtained from the Finance RAG Supabase project:
   ```
   Name: VS_POLICIES_ID
   Value: vs_<id_for_policies_vector_store>

   Name: VS_SOPS_WORKFLOWS_ID
   Value: vs_<id_for_sops_vector_store>

   Name: VS_EXAMPLES_SYSTEMS_ID
   Value: vs_<id_for_examples_vector_store>
   ```

   **Supabase Configuration (Auto-provided):**
   These are automatically available in Edge Functions:
   - `SUPABASE_URL` (auto)
   - `SUPABASE_SERVICE_ROLE_KEY` (auto)

3. **Save and Restart:**
   - Save all secrets
   - Restart the Edge Function

---

### Step 3: Get Vector Store IDs

If you haven't run the Finance RAG setup yet, you need to:

1. **Navigate to Finance RAG project:**
   - Project: xkxyvboeubffxxbebsll (Finance RAG Supabase)

2. **Run the RAG setup script:**
   ```bash
   cd /path/to/finance-rag-project
   export OPENAI_API_KEY="<your_openai_api_key>"
   pnpm rag:setup
   ```

3. **Copy Vector Store IDs:**
   - The script will create `config/vector_store_ids.json`
   - Copy the IDs to use in Step 2 above

**Alternative:** If vector stores already exist in OpenAI:
```bash
# List vector stores via OpenAI API
curl https://api.openai.com/v1/vector_stores \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "OpenAI-Beta: assistants=v2" | jq '.data[] | {id, name}'
```

---

### Step 4: Configure Next.js Environment Variables

Add to `.env.local` (for local development):

```bash
# OpEx Supabase (for app data and RAG queries)
NEXT_PUBLIC_SUPABASE_URL=https://ublqmilcjtpnflofprkr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVibHFtaWxjanRwbmZsb2ZwcmtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNjMyNzUsImV4cCI6MjA3ODczOTI3NX0.aVVY4Kgain0575E3GmLHTluLcFkZbcoC0G-Dmy9kzUs
```

Or add to Vercel environment variables (for production):
1. Go to Vercel dashboard → Project Settings → Environment Variables
2. Add the same variables above
3. Redeploy the Next.js app

---

### Step 5: Run Smoke Test

Once Steps 1-4 are complete:

**Test the Edge Function directly:**
```bash
curl -X POST "https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/opex-rag-query" \
  -H "Content-Type: application/json" \
  -d '{
    "assistant": "opex",
    "question": "What are the steps for employee onboarding?",
    "domain": "hr",
    "process": "onboarding"
  }'
```

**Expected Response:**
```json
{
  "answer": "According to the Employee Onboarding SOP...",
  "citations": [...],
  "metadata": {
    "assistantId": "asst_...",
    "threadId": "thread_...",
    "runId": "run_...",
    "responseTimeMs": 1234
  }
}
```

**Test via Next.js client:**
```bash
# Run the smoke test script
npx tsx scripts/test-opex-rag.ts
```

**Verify query logging:**
```bash
export OPEX_POSTGRES_URL="postgres://postgres.ublqmilcjtpnflofprkr:1G8TRd5wE7b9szBH@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"

# Check recent queries
psql "$OPEX_POSTGRES_URL" -c "SELECT * FROM opex.rag_queries ORDER BY created_at DESC LIMIT 5;"

# Check analytics
psql "$OPEX_POSTGRES_URL" -c "SELECT opex.get_rag_analytics(NULL, 1);"
```

---

### Step 6: Integrate into Next.js Pages

**Example Page Integration:**

```typescript
// app/hr/onboarding/page.tsx
import { askOnboardingQuestion } from '@/lib/opex/ragClient';

export default async function OnboardingPage() {
  const response = await askOnboardingQuestion(
    'What are the steps for employee onboarding?'
  );

  return (
    <div>
      <h1>Employee Onboarding</h1>
      <div className="prose">
        {response.answer}
      </div>
    </div>
  );
}
```

**Example React Component:**

```typescript
'use client';

import { useState } from 'react';
import { askHRQuestion } from '@/lib/opex/ragClient';

export function HRAssistant() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    setLoading(true);
    try {
      const response = await askHRQuestion(question);
      setAnswer(response.answer);
    } catch (error) {
      console.error('RAG query failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask about HR policies..."
      />
      <button onClick={handleAsk} disabled={loading}>
        {loading ? 'Asking...' : 'Ask'}
      </button>
      {answer && <div>{answer}</div>}
    </div>
  );
}
```

---

## Troubleshooting

### Edge Function Deployment Fails
- **Issue:** 403 Forbidden or access denied
- **Solution:** Use Supabase Dashboard instead of CLI
- **Alternative:** Upgrade access token or use service role token

### Edge Function Returns 500
- **Check:** Function logs in Supabase Dashboard
- **Verify:** All secrets are set correctly
- **Test:** OpenAI API key is valid
- **Confirm:** Vector store IDs are correct

### No Query Logs Appearing
- **Check:** RLS policies in opex.rag_queries table
- **Verify:** Edge Function has SUPABASE_SERVICE_ROLE_KEY
- **Test:** Direct database insert to confirm connectivity

### Slow Response Times
- **Monitor:** OpenAI Assistant API response times
- **Optimize:** Reduce file_search complexity with metadata filters
- **Cache:** Consider caching frequent questions

---

## Next Steps

After successful deployment:

1. **Content Upload:**
   - Upload HR policies to vs_policies
   - Upload Finance SOPs to vs_sops_workflows
   - Upload templates to vs_examples_systems

2. **Feedback System:**
   - Implement feedback UI in Next.js
   - Track ratings in rag_queries table

3. **Analytics Dashboard:**
   - Build dashboard using get_rag_analytics()
   - Monitor popular questions
   - Track success rates

4. **Advanced Features:**
   - Multi-language support
   - Conversation history
   - User-specific personalization

---

## Support

If you encounter issues:

1. Check DEPLOYMENT_STATUS.md for current state
2. Review function logs in Supabase Dashboard
3. Verify all secrets are configured
4. Test Edge Function directly with curl
5. Check database query logs

---

**Deployment Date:** 2025-11-15
**Version:** 1.0
**Status:** Ready for manual deployment (CLI deployment blocked by permissions)
