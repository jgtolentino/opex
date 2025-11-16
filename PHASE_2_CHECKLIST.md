# OpEx RAG - Phase 2 Production Readiness Checklist

**Status**: Backend production-ready | Eval + monitoring needed
**Target**: Production-grade RAG assistant platform
**Timeline**: This week (eval + monitoring) → Next sprint (MCP tools)

---

## 📍 Current State (One-Liner)

✅ **OpEx RAG stack is production-ready at the DB + Edge Function layer** (schemas, RLS, DNS, edge functions all pass)
⚠️ **Missing**: Eval framework, monitoring/alerting, MCP/tool routing

---

## ⏰ This Week - Immediate Actions

### 1. Wire Up Evaluation Framework

**Objective**: Track query quality and user satisfaction

- [ ] **Database Migration**: Add rating + feedback columns
  ```sql
  ALTER TABLE opex.rag_queries
  ADD COLUMN rating integer CHECK (rating >= 1 AND rating <= 5),
  ADD COLUMN feedback text,
  ADD COLUMN evaluation_metadata jsonb DEFAULT '{}'::jsonb;
  ```

- [ ] **Create Metrics View**: `opex.rag_evaluation_metrics`
  ```sql
  CREATE OR REPLACE VIEW opex.rag_evaluation_metrics AS
  SELECT
    DATE_TRUNC('day', created_at) as eval_date,
    COUNT(*) as total_queries,
    ROUND(AVG(rating), 2) as avg_rating,
    COUNT(*) FILTER (WHERE rating >= 4) as positive_ratings,
    ROUND(100.0 * COUNT(*) FILTER (WHERE rating >= 4) / NULLIF(COUNT(rating), 0), 2) as satisfaction_rate
  FROM opex.rag_queries
  GROUP BY eval_date
  ORDER BY eval_date DESC;
  ```
  **Implementation**: See `RAG_AGENTS_AUDIT_REPORT.md` lines 425-468

- [ ] **Deploy Edge Function**: `rag-feedback`
  ```bash
  supabase functions deploy rag-feedback --project-ref ublqmilcjtpnflofprkr
  ```
  **Implementation**: See `RAG_AGENTS_AUDIT_REPORT.md` lines 471-522

- [ ] **Test Feedback Flow**
  ```bash
  curl -X POST "https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/rag-feedback" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -d '{"queryId":"uuid-here","rating":5,"feedback":"Excellent response!"}'
  ```

**Success Criteria**:
- ✅ Users can rate responses 1-5 stars
- ✅ Feedback stored in database
- ✅ Analytics view shows avg rating, satisfaction rate
- ✅ Metrics queryable via SQL or Edge Function

---

### 2. Add Monitoring + Alerting

**Objective**: Proactive error detection and performance monitoring

- [ ] **Create Alerts Table**
  ```sql
  CREATE TABLE IF NOT EXISTS opex.rag_alerts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type text NOT NULL, -- 'error_rate', 'slow_query', 'low_rating'
    severity text NOT NULL, -- 'critical', 'warning', 'info'
    message text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
  );
  ```
  **Implementation**: See `RAG_AGENTS_AUDIT_REPORT.md` lines 538-545

- [ ] **Create Alert Trigger**
  ```sql
  CREATE OR REPLACE FUNCTION opex.check_rag_alerts()
  RETURNS trigger AS $$
  -- Checks error rate, slow queries, low ratings
  -- Inserts into rag_alerts on threshold breach
  ```
  **Implementation**: See `RAG_AGENTS_AUDIT_REPORT.md` lines 547-594

- [ ] **Deploy Alert Notifier**: `alert-notifier` Edge Function
  ```bash
  supabase functions deploy alert-notifier --project-ref ublqmilcjtpnflofprkr
  ```
  **Implementation**: See `RAG_AGENTS_AUDIT_REPORT.md` lines 608-650

- [ ] **Configure Supabase Database Webhook**
  - Go to: Supabase Dashboard → Database → Webhooks
  - Table: `opex.rag_alerts`
  - Events: INSERT
  - URL: `https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/alert-notifier`
  - Headers: `Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY`

- [ ] **Set SLACK_WEBHOOK_URL Secret**
  ```bash
  supabase secrets set SLACK_WEBHOOK_URL="https://hooks.slack.com/..." \
    --project-ref ublqmilcjtpnflofprkr
  ```

**Success Criteria**:
- ✅ Alerts fire on error rate > 10%
- ✅ Alerts fire on response time > 10 seconds
- ✅ Slack notifications received
- ✅ Alert history queryable in `rag_alerts` table

---

### 3. Run Full Stack Verification

**Objective**: Ensure all systems operational after changes

- [ ] **Load Environment**
  ```bash
  source .env.local
  ```

- [ ] **Run Verification Script**
  ```bash
  ./scripts/verify_opex_stack.sh
  ```

- [ ] **Confirm All Checks Pass**
  - ✅ Supabase: Environment variables set
  - ✅ Supabase: REST API reachable
  - ✅ Supabase: PostgreSQL connection successful
  - ✅ Edge Functions: opex-rag-query deployed
  - ✅ Edge Functions: ingest-document deployed
  - ✅ Edge Functions: rag-feedback deployed
  - ✅ Edge Functions: alert-notifier deployed
  - ✅ Database: pgvector extension installed
  - ✅ Database: opex schema exists
  - ✅ Database: rag_queries, rag_alerts tables exist
  - ✅ Vercel: Frontend deployment reachable (if VERCEL_URL set)
  - ✅ Rocket.Chat: Webhook integration configured (once wired)

**Troubleshooting**:
- Failures → Check `INTEGRATION_GUIDE.md` troubleshooting section
- Missing tables → Run migrations in `supabase/migrations/`
- Edge Function 404 → Redeploy via `./deploy_opex_rag.sh`

---

## 🚀 Deployment Steps (Standard Runbook)

### When You're Ready to Deploy Changes

#### 1. Deploy Edge Functions

**Option A: Automated Script**
```bash
./deploy_opex_rag.sh
```

**Option B: Manual via Supabase CLI**
```bash
supabase functions deploy opex-rag-query --project-ref ublqmilcjtpnflofprkr
supabase functions deploy ingest-document --project-ref ublqmilcjtpnflofprkr
supabase functions deploy rag-feedback --project-ref ublqmilcjtpnflofprkr
supabase functions deploy alert-notifier --project-ref ublqmilcjtpnflofprkr
```

**Option C: Supabase Dashboard**
- See `EDGE_FUNCTIONS_DEPLOYMENT.md` for manual deployment steps

---

#### 2. Configure Vercel

- [ ] **Add Environment Variables** (Vercel Dashboard → Project → Settings → Environment Variables)
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://ublqmilcjtpnflofprkr.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
  opex_SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
  opex_POSTGRES_URL=postgres://postgres.ublqmilcjtpnflofprkr:...
  OPENAI_API_KEY=sk-...
  ```

- [ ] **Deploy Frontend**
  ```bash
  vercel --prod
  ```

- [ ] **Verify Public URL + CORS**
  ```bash
  ./test_dns_access.sh
  ```

**Expected Output**:
```
✅ DNS ACCESS SUCCESSFUL
HTTP Status: 200
Response preview: "Operational Excellence is..."
```

---

#### 3. Configure Rocket.Chat Slash Command

- [ ] **Create Slash Command**
  - Go to: Rocket.Chat Admin → Integrations → New Integration → Outgoing Webhook
  - Event Trigger: `Slash Command`
  - Command: `ask`
  - URLs: `https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/opex-rag-query`
  - Method: `POST`

- [ ] **Add Authorization Header**
  ```
  Authorization: Bearer YOUR_SUPABASE_SERVICE_ROLE_KEY
  ```

- [ ] **Add Request/Response Transform Script**
  ```javascript
  class Script {
    process_outgoing_request({ request }) {
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
  **Full script**: See `docs/INTEGRATION_GUIDE.md` lines 171-199

- [ ] **Enable Webhook** and **Save**

- [ ] **Test Slash Command**
  - In Rocket.Chat channel: `/ask What is OpEx?`
  - Verify response appears
  - Check database: `SELECT * FROM opex.rag_queries ORDER BY created_at DESC LIMIT 5;`

**Success Criteria**:
- ✅ `/ask` command returns answer
- ✅ Citations shown in attachments
- ✅ Query logged in `opex.rag_queries`
- ✅ User can rate response (future: add rating button)

---

## 📅 Next Sprint - Short-Term Enhancements

### Once Core is Stable

#### 4. Custom Retriever (Optional - Implement if OpenAI quality insufficient)

- [ ] **Implement Hybrid Search** (BM25 + vector)
  - Create SQL functions: `match_documents`, `bm25_search`
  - Deploy `custom-retriever` Edge Function
  - Add full-text search index on `opex_document_embeddings`

- [ ] **Add Query Rewriting**
  - Expand user questions for better retrieval
  - Use LLM to generate multiple query variations
  - Merge results with reciprocal rank fusion

- [ ] **Configurable Top-k**
  - Allow users to specify number of results
  - Adjust similarity thresholds per domain

**Implementation**: See `RAG_AGENTS_AUDIT_REPORT.md` lines 665-800

---

#### 5. Reranker Module (Optional - Add if retrieval quality issues)

- [ ] **Integrate Cohere Rerank API**
  - Deploy `reranker` Edge Function
  - Add `COHERE_API_KEY` secret
  - Benchmark against non-reranked results

- [ ] **Alternative: Cross-encoder Model**
  - If offline/private deployment needed
  - Higher latency but more control

**Implementation**: See `RAG_AGENTS_AUDIT_REPORT.md` lines 804-845

---

#### 6. MCP Tool Routing (Required for Agent Workflows)

**Objective**: Enable custom function calling beyond Q&A

- [ ] **Design MCP Tools Spec**
  ```typescript
  // Tools to expose:
  - query_database (execute SQL)
  - create_task (Supabase task queue)
  - send_notification (email/Slack)
  - get_user_profile (user data)
  - update_policy (document management)
  ```

- [ ] **Implement Tool Router**
  ```typescript
  // supabase/functions/opex-rag-query/tools.ts
  export const tools: MCPTool[] = [
    { name: 'query_database', execute: async (params) => {...} },
    { name: 'create_task', execute: async (params) => {...} }
  ];
  ```

- [ ] **Integrate with Assistants API**
  ```typescript
  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistantId,
    tools: [
      { type: 'file_search' },
      { type: 'function', function: { name: 'query_database', ... } },
      { type: 'function', function: { name: 'create_task', ... } }
    ]
  });
  ```

- [ ] **Handle Tool Calls**
  - Poll for `requires_action` status
  - Route tool calls to `routeToolCall()`
  - Submit tool outputs back to thread

**Implementation**: See `RAG_AGENTS_AUDIT_REPORT.md` lines 310-377

**Use Cases**:
- "Create a task for reviewing the expense policy"
- "Query the database for all pending approvals"
- "Send a notification to Finance team about month-end deadline"

---

## 📁 Reference Files (Single Source of Truth)

| File | Purpose |
|------|---------|
| `RAG_AGENTS_AUDIT_REPORT.md` | **Complete architecture + all implementation code** |
| `DEPLOYMENT_AUDIT_REPORT.md` | DB + RLS verification results |
| `scripts/verify_opex_stack.sh` | End-to-end validator (270 lines) |
| `test_dns_access.sh` | DNS + edge reachability test |
| `docs/INTEGRATION_GUIDE.md` | Supabase + Vercel + Rocket.Chat wiring (500 lines) |
| `deploy_opex_rag.sh` | Automated deployment script |
| `EDGE_FUNCTIONS_DEPLOYMENT.md` | Manual deployment guide |

---

## 🎯 Success Metrics

### Before Phase 2
- Queries logged: 1
- Success rate: 100%
- Avg response time: N/A
- User ratings: **None**
- Monitoring: **None**

### After Phase 2 (Target)
- Success rate: **≥95%**
- Avg response time: **<5 seconds**
- P95 response time: **<10 seconds**
- User satisfaction: **≥80% positive ratings (≥4 stars)**
- Error rate: **<5%**
- Alert coverage: **100%** (errors, slow queries, high error rate)

### After Phase 3 (Advanced)
- Custom retrieval: ✅ Hybrid search available
- Reranking: ✅ Optional quality boost
- MCP tools: ✅ Agent workflows enabled
- Evaluation: ✅ Regression test suite

---

## 📞 Support & Troubleshooting

### Common Issues

**Edge Function 500 Error**:
- Check: Supabase secrets configured
- Check: OpenAI API key valid and has credits
- Check: Vector store IDs exist
- Logs: Supabase Dashboard → Edge Functions → Logs

**Rocket.Chat Not Responding**:
- Check: Webhook enabled in Rocket.Chat
- Check: Authorization header correct
- Check: Edge Function URL correct
- Test: Direct curl to Edge Function (bypass Rocket.Chat)

**No Logs in Database**:
- Check: RLS policies allow service_role to INSERT
- Check: Edge Function using correct table name
- Verify: Run manual INSERT test
- Check: Connection string correct

### Where to Get Help

1. **Troubleshooting Guide**: `docs/INTEGRATION_GUIDE.md` lines 347-406
2. **Deployment Issues**: `EDGE_FUNCTIONS_DEPLOYMENT.md` lines 214-236
3. **Database Issues**: `DEPLOYMENT_AUDIT_REPORT.md` Section 10
4. **Architecture Questions**: `RAG_AGENTS_AUDIT_REPORT.md`

---

## ✅ Final Status

You're in a **strong position**: backend is truly production-ready. Now it's just:
1. **Eval framework** (track quality)
2. **Monitoring** (detect issues)
3. **MCP tools** (enable agent workflows)

...to turn this from "working RAG endpoint" into a full **OpEx assistant platform**.

**Next Action**: Start with Task 1.1 (add rating columns) → Deploy → Test → Iterate

---

**Last Updated**: 2025-11-16
**Owner**: OpEx Team
**Status**: Phase 1 Complete ✅ | Phase 2 In Progress ⏳
