# OpEx Stack Integration Guide

**Platforms**: Vercel + Supabase + Rocket.Chat
**Date**: 2025-11-16
**Status**: Production-Ready Database ✅

---

## Overview

This guide covers the complete integration of:

1. **Vercel** - Frontend deployment (Next.js RAG interface)
2. **Supabase** - Database + Edge Functions (RAG backend)
3. **Rocket.Chat** - Chat interface with slash commands

---

## Architecture

```
Rocket.Chat Slash Command (/ask)
          ↓
    Webhook Trigger
          ↓
  Supabase Edge Function (opex-rag-query)
          ↓
    OpenAI Assistants API + Vector Stores
          ↓
    Log to opex.rag_queries
          ↓
    Response back to Rocket.Chat
```

---

## Prerequisites

✅ **Completed**:
- [x] PostgreSQL database with pgvector extension
- [x] opex schema with rag_queries and document_uploads tables
- [x] RLS policies configured for Edge Functions
- [x] Embedding infrastructure (opex_embedding_sources, opex_document_embeddings)

⏳ **Pending**:
- [ ] OpenAI vector stores created
- [ ] Supabase secrets configured
- [ ] Edge Functions deployed
- [ ] Vercel environment variables configured
- [ ] Rocket.Chat webhook integration

---

## 1. Supabase Edge Function Deployment

### Option A: Automated Deployment Script

```bash
# Set required environment variables
export SUPABASE_URL="https://ublqmilcjtpnflofprkr.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
export OPENAI_API_KEY="your_openai_api_key"

# Run deployment script
./deploy_opex_rag.sh
```

The script will:
1. Create 3 OpenAI vector stores
2. Configure Supabase secrets
3. Deploy opex-rag-query Edge Function
4. Deploy ingest-document Edge Function
5. Run optional smoke tests

### Option B: Manual Deployment

See `EDGE_FUNCTIONS_DEPLOYMENT.md` for step-by-step manual deployment via Supabase Dashboard.

### Verify Deployment

```bash
# Test opex-rag-query endpoint
curl -X POST "https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/opex-rag-query" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "assistant": "opex",
    "question": "What is OpEx?",
    "userId": "test-user"
  }'

# Expected: JSON response with answer and metadata
```

---

## 2. Vercel Frontend Deployment

### Environment Variables

Add these to your Vercel project settings:

#### Public Variables (exposed to client)
```
NEXT_PUBLIC_SUPABASE_URL=https://ublqmilcjtpnflofprkr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Server-side Only Variables
```
opex_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
opex_POSTGRES_URL=postgres://postgres.ublqmilcjtpnflofprkr:...
OPENAI_API_KEY=sk-...
```

#### Auth0 Configuration (if using Auth0)
```
AUTH0_SECRET=use-openssl-rand-hex-32-for-production
AUTH0_BASE_URL=https://your-app.vercel.app
AUTH0_ISSUER_BASE_URL=https://YOUR_DOMAIN.auth0.com
AUTH0_CLIENT_ID=YOUR_AUTH0_CLIENT_ID
AUTH0_CLIENT_SECRET=YOUR_AUTH0_CLIENT_SECRET
```

### Deploy Command

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Deploy to production
vercel --prod

# Or configure auto-deployment from GitHub
# Go to Vercel dashboard → Import Git Repository
```

### Verify Deployment

```bash
curl https://your-app.vercel.app
# Should return Next.js homepage

curl https://your-app.vercel.app/api/health
# Should return health check status
```

---

## 3. Rocket.Chat Integration

### Create Slash Command

1. **Go to Rocket.Chat Admin** → Integrations → New Integration → Outgoing Webhook

2. **Configure Webhook**:
   ```
   Event Trigger: Slash Command
   Command: ask
   URLs: https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/opex-rag-query
   Method: POST
   ```

3. **Add Authorization Header**:
   ```
   Authorization: Bearer YOUR_SUPABASE_SERVICE_ROLE_KEY
   ```

4. **Script** (optional - for formatting response):
   ```javascript
   class Script {
     process_outgoing_request({ request }) {
       // Transform Rocket.Chat data to Edge Function format
       return {
         content: {
           assistant: "opex",
           question: request.data.text,
           userId: request.data.user_id,
           userEmail: request.data.user_name + "@yourcompany.com",
           channel: "rocketchat"
         }
       };
     }

     process_incoming_response({ response }) {
       // Format Edge Function response for Rocket.Chat
       const data = JSON.parse(response.content);
       return {
         content: {
           text: data.answer || "Sorry, I couldn't generate a response.",
           attachments: data.citations ? [{
             title: "Sources",
             text: data.citations.map(c => `- ${c.title}`).join('\n')
           }] : []
         }
       };
     }
   }
   ```

5. **Enable** the webhook and **Save**

### Test Slash Command

In any Rocket.Chat channel:
```
/ask What is Operational Excellence?
```

Expected response:
```
Operational Excellence (OpEx) is a systematic approach to...

Sources:
- OpEx Policies - Policy Document v1.2
- SOPs - Standard Operating Procedures
```

---

## 4. End-to-End Testing

### Run Verification Script

```bash
# Load environment variables
source .env.local

# Run verification
./scripts/verify_opex_stack.sh
```

Expected output:
```
🔍 OpEx Stack Verification (Vercel + Supabase + Rocket.Chat)
============================================================

1️⃣  Checking Environment Variables...
✅ PASS: NEXT_PUBLIC_SUPABASE_URL set
✅ PASS: NEXT_PUBLIC_SUPABASE_ANON_KEY set
✅ PASS: opex_SUPABASE_SERVICE_ROLE_KEY set

2️⃣  Testing Supabase Connectivity...
✅ PASS: Supabase REST API reachable
✅ PASS: PostgreSQL database connection successful

3️⃣  Checking Edge Functions...
✅ PASS: opex-rag-query Edge Function deployed
✅ PASS: ingest-document Edge Function deployed

4️⃣  Verifying Database Schema...
✅ PASS: pgvector extension installed
✅ PASS: opex schema exists
✅ PASS: opex.rag_queries table exists
✅ PASS: opex.document_uploads table exists

🎉 All critical checks passed!
```

### Manual End-to-End Test

1. **Upload Document** (via Vercel frontend):
   - Navigate to `https://your-app.vercel.app/upload`
   - Upload a PDF policy document
   - Verify upload appears in `opex.document_uploads` table

2. **Query RAG** (via Rocket.Chat):
   - Type `/ask What is the expense approval policy?`
   - Verify response appears in chat
   - Check `opex.rag_queries` for logged query

3. **Check Database Logs**:
   ```sql
   -- Recent queries
   SELECT question, answer IS NOT NULL as has_answer,
          meta->>'assistant_name' as assistant, created_at
   FROM opex.rag_queries
   ORDER BY created_at DESC
   LIMIT 10;

   -- Recent uploads
   SELECT filename, category, domain, status, created_at
   FROM opex.document_uploads
   ORDER BY created_at DESC
   LIMIT 10;
   ```

---

## 5. Monitoring & Maintenance

### Database Queries for Monitoring

```sql
-- Query success rate (last 24 hours)
SELECT
  COUNT(*) as total_queries,
  COUNT(*) FILTER (WHERE answer IS NOT NULL) as successful,
  COUNT(*) FILTER (WHERE answer IS NULL) as failed,
  ROUND(100.0 * COUNT(*) FILTER (WHERE answer IS NOT NULL) / COUNT(*), 2) as success_rate
FROM opex.rag_queries
WHERE created_at > now() - interval '24 hours';

-- Most common questions
SELECT
  question,
  COUNT(*) as times_asked,
  AVG((meta->>'response_time_ms')::integer) as avg_response_ms
FROM opex.rag_queries
WHERE created_at > now() - interval '7 days'
GROUP BY question
ORDER BY times_asked DESC
LIMIT 10;

-- Document upload stats by category
SELECT
  category,
  domain,
  COUNT(*) as upload_count,
  SUM(bytes) as total_bytes,
  COUNT(*) FILTER (WHERE status = 'completed') as completed,
  COUNT(*) FILTER (WHERE status = 'failed') as failed
FROM opex.document_uploads
GROUP BY category, domain
ORDER BY category, domain;
```

### Supabase Dashboard Monitoring

1. **Go to**: https://supabase.com/dashboard/project/ublqmilcjtpnflofprkr
2. **Check**:
   - Database → Logs (for errors)
   - Edge Functions → Logs (for function errors)
   - Database → Performance (for slow queries)
   - Settings → API → Key usage

### Rocket.Chat Integration Health

1. **Go to**: Rocket.Chat Admin → Integrations
2. **Check**:
   - Outgoing webhook status (enabled/disabled)
   - Recent webhook calls log
   - Error rate

---

## Troubleshooting

### Edge Function Returns 500 Error

**Check**:
1. Supabase secrets are configured correctly
2. OpenAI API key is valid and has credits
3. Vector store IDs exist in OpenAI
4. Edge Function logs in Supabase dashboard

**Common fixes**:
```bash
# Re-deploy Edge Functions
supabase functions deploy opex-rag-query --project-ref ublqmilcjtpnflofprkr

# Verify secrets
supabase secrets list --project-ref ublqmilcjtpnflofprkr
```

### Rocket.Chat Slash Command Not Responding

**Check**:
1. Webhook is enabled in Rocket.Chat
2. Authorization header is set correctly
3. Edge Function URL is correct
4. Script is processing request/response correctly

**Test directly**:
```bash
# Test Edge Function directly (bypass Rocket.Chat)
curl -X POST "https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/opex-rag-query" \
  -H "Authorization: Bearer $opex_SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "assistant": "opex",
    "question": "Test question",
    "userId": "test",
    "channel": "rocketchat"
  }'
```

### No Logs Appearing in Database

**Check**:
1. RLS policies allow service_role to INSERT
2. Edge Function is using correct table name
3. Connection string is correct

**Verify**:
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE schemaname = 'opex' AND tablename = 'rag_queries';

-- Test manual insert
INSERT INTO opex.rag_queries (question, answer, user_id, channel)
VALUES ('Test', 'Test answer', 'manual-test', 'test')
RETURNING id, created_at;
```

### Vercel Deployment Fails

**Common issues**:
1. Missing environment variables → Add in Vercel dashboard
2. Build errors → Check Vercel deployment logs
3. API routes not working → Verify file structure matches Next.js conventions

---

## Next Steps

1. ✅ **Database verified** - Production-ready
2. ⏳ **Deploy Edge Functions** - Run `./deploy_opex_rag.sh`
3. ⏳ **Configure Vercel** - Add environment variables
4. ⏳ **Setup Rocket.Chat** - Create slash command webhook
5. ⏳ **Test end-to-end** - Run verification script
6. ⏳ **Monitor production** - Setup alerts and dashboards

---

## Support Resources

- **Deployment Audit**: `DEPLOYMENT_AUDIT_REPORT.md`
- **Edge Functions Guide**: `EDGE_FUNCTIONS_DEPLOYMENT.md`
- **Database Schema**: `supabase/SCHEMA.md`
- **Deployment Script**: `deploy_opex_rag.sh`
- **Verification Script**: `scripts/verify_opex_stack.sh`

For questions or issues, review the troubleshooting section or check Supabase/Vercel logs.
