# OpEx Master Integrator Audit Report

**Date**: 2025-11-16
**Auditor**: Master Integrator AI
**Scope**: Full automation landscape (n8n, Rocket.Chat, Edge Functions, CI/CD, Cron)

---

## Executive Summary

The OpEx platform operates a **mature, multi-tier automation architecture** combining:
- **4 n8n workflows** (webhook + cron-driven orchestration)
- **6 Supabase Edge Functions** (serverless RAG + alerting)
- **3 GitHub Actions pipelines** (CI/CD + health monitoring)
- **Rocket.Chat integration** (ChatOps notifications via alert-notifier)
- **Mattermost RAG service** (containerized bot + slash commands)

### Top 5 Strengths
1. **Clean separation of concerns**: n8n (orchestration) → Edge Functions (RAG logic) → OpenAI (inference)
2. **Self-healing RAG**: Daily BIR document sync + embedding maintenance with staleness detection
3. **Multi-channel alerting**: Rocket.Chat, Mattermost, Slack, GitHub Issues
4. **Production-grade health monitoring**: Service health checks every 10 min + daily embedding audits
5. **Event-driven architecture**: Webhooks over polling, with proper retry + backoff

### Top 5 Risks
1. **Missing Rocket.Chat config in n8n**: Workflows reference `MATTERMOST_WEBHOOK_URL` but Rocket.Chat alerting is via Edge Function only
2. **No correlation IDs**: Cannot trace requests across n8n → Edge Function → OpenAI
3. **Silent failures**: n8n workflows lack error branches for Edge Function failures
4. **Credential sprawl**: Supabase keys, webhook URLs, API keys scattered across 3+ systems
5. **No unified observability**: Logs split across n8n UI, Supabase dashboard, GitHub Actions, and local files

---

## Automation Landscape Overview

| Flow Name | Entry Point | Trigger | Tools | Owner | Status |
|-----------|-------------|---------|-------|-------|--------|
| **Ask OpEx Assistant** | n8n webhook | HTTP POST (Mattermost slash) | n8n → opex-rag-query → OpenAI | Finance/HR Teams | ✅ Active |
| **Tax Deadline Notifier** | n8n cron | Daily 8 AM | n8n → Supabase RPC → Mattermost | Finance Team | ✅ Active |
| **Service Health Monitor** | n8n cron | Every 10 min | n8n → HTTP checks → Mattermost/GitHub | DevOps | ✅ Active |
| **BIR Document Sync** | n8n cron | Daily 3 AM | n8n → embedding-worker → OpenAI | Auto (unowned) | ✅ Active |
| **RAG Query** | Edge Function | HTTP POST | opex-rag-query → OpenAI Assistants | App/n8n | ✅ Active |
| **Alert Notification** | Edge Function | Webhook (DB trigger) | alert-notifier → Rocket.Chat | Alert system | ⚠️ Partial |
| **Embedding Worker** | Edge Function | HTTP POST (n8n/manual) | embedding-worker → OpenAI embeddings | n8n/scheduled | ✅ Active |
| **Embedding Maintenance** | Edge Function | Scheduled (implied) | embedding-maintenance → Slack | Auto | ⚠️ Undocumented trigger |
| **Embedding Health Check** | GitHub Action | Daily 3 AM UTC | Python audit → GitHub Issue/Slack | CI/CD | ✅ Active |
| **Deploy Docs** | GitHub Action | Push to main (docs/**) | pnpm build → GitHub Pages | CI/CD | ✅ Active |
| **Mattermost RAG Bot** | Docker container | Slash commands | rag-service → Supabase/OpenRouter | Mattermost users | ⚠️ Partial (config incomplete) |

---

## Signavio-Style Pillar Analysis

### 1. PEOPLE

**Current State**:
- **Finance users**: Interact via Mattermost slash commands (`/opex`) → n8n → RAG
- **Developers**: Manually trigger n8n workflows, check Supabase logs
- **Ops team**: Receive health alerts in Mattermost, GitHub Issues for critical failures
- **End users**: Self-service RAG queries (no admin intervention)

**Pain Points**:
- **No visibility into workflow status** for non-technical users
- **Manual approval loops** missing (e.g., BIR filing confirmation before auto-submission)
- **Alert fatigue**: Health checks every 10 min may generate noise

**Opportunities**:
- **ChatOps approvals** in Rocket.Chat (interactive buttons for "approve/reject")
- **User-friendly status dashboard** showing n8n execution history
- **Role-based routing**: Finance queries → `opex-assistant`, Tax queries → `ph-tax-assistant`

**Target State**:
- All operational alerts consolidated in Rocket.Chat with action buttons
- Users can query workflow status via `/status <workflow-name>` in chat
- Approval flows for high-risk automations (e.g., tax filing)

---

### 2. PROCESSES

**Current State**:
```
End-to-End Flow: "User asks HR question"
1. User types `/opex What is the onboarding process?` in Mattermost
2. Mattermost sends webhook to n8n (ask-opex-assistant)
3. n8n extracts question, domain, process
4. n8n POSTs to opex-rag-query Edge Function
5. Edge Function creates OpenAI thread, runs assistant with file_search
6. Assistant queries 3 vector stores (policies, SOPs, examples)
7. Edge Function logs query to rag_queries table
8. Edge Function returns answer + citations
9. n8n extracts answer, returns to webhook response
10. Mattermost displays answer to user
```

**Bottlenecks**:
- **No retry logic in n8n** if opex-rag-query times out
- **Single-threaded processing**: Batch queries would block
- **No caching**: Identical questions hit OpenAI every time

**Error Paths**:
- **Edge Function failure → silent 500 error** to user
- **OpenAI rate limit → no retry or backoff**
- **No fallback**: If assistant fails, no degraded mode

**Target State**:
- Add n8n error branch: retry 3x with exponential backoff, then notify Rocket.Chat
- Implement query caching (Redis): Check if identical question asked in last 1 hour
- Add queue for batch processing during high load

---

### 3. APPLICATIONS

**Architecture Map**:
```
┌─────────────────┐
│   Mattermost    │ Slash commands, user interface
│  (port 8065)    │
└────────┬────────┘
         │
         ↓ Webhook POST
┌─────────────────┐
│   n8n Workflows │ Orchestration hub
│ (n8n.insightpu  │ - ask-opex-assistant
│  lseai.net)     │ - tax-deadline-notifier
└────────┬────────┘ - health-check-monitor
         │          - document-sync-rag
         ↓ HTTP POST
┌─────────────────┐
│ Supabase Edge   │ Serverless functions
│   Functions     │ - opex-rag-query
│ (Deno runtime)  │ - embedding-worker
└────────┬────────┘ - embedding-maintenance
         │          - alert-notifier
         ↓ API Calls
┌─────────────────┐
│   OpenAI API    │ - Assistants (opex, ph-tax)
│                 │ - Vector stores (3)
└─────────────────┘ - Embeddings (text-embedding-3-small)
         ↑
         │ Alerts
┌─────────────────┐
│  Rocket.Chat    │ Incoming webhooks
│ (alert-notifier)│ Notification delivery
└─────────────────┘
```

**Integration Gaps**:
- **Rocket.Chat partially wired**: alert-notifier exists, but n8n workflows still use `MATTERMOST_WEBHOOK_URL`
- **No MCP coordinator integration**: docker-compose.mcp-n8n.yml defines MCP service, but no workflows call it
- **Mattermost RAG service isolated**: Separate Docker stack, no connection to main n8n/Supabase flows

**Duplication**:
- **Two chat platforms**: Mattermost (slash commands) + Rocket.Chat (alerts) serving similar roles
- **Two RAG entry points**: n8n webhook + Mattermost RAG service (both hit Supabase)

**Target State**:
- Consolidate on **Rocket.Chat** as primary ChatOps interface (move slash commands from Mattermost)
- Deprecate Mattermost RAG service, route all queries through n8n → Supabase
- Wire MCP coordinator for advanced agentic workflows (multi-step tasks)

---

### 4. DATA

**Observability Assets**:
- **n8n execution logs**: UI-only, not exportable
- **Supabase Edge Function logs**: CLI (`supabase functions logs`)
- **rag_queries table**: Query history, tokens, response time
- **rag_alerts table**: Triggered alerts (severity, type)
- **embedding_sources table**: Document sync status
- **GitHub Actions artifacts**: embedding-audit-report JSON

**Missing Telemetry**:
- **No correlation IDs** linking n8n execution → Edge Function → OpenAI thread
- **No distributed tracing** (Jaeger, OpenTelemetry)
- **No aggregated metrics dashboard** (Grafana, Datadog)

**Data Quality Issues**:
- **Stale embeddings**: 30-day threshold, but no SLA enforcement
- **Failed sources**: Retry 3x then mark failed, no auto-recovery
- **No query deduplication**: Same question asked multiple times = wasted tokens

**Target State**:
- Add `correlation_id` to all requests (generated in n8n, passed to Edge Functions)
- Export n8n logs to Supabase for unified analytics
- Build Grafana dashboard: Query volume, latency P95, error rate, token usage
- Implement semantic caching: Hash query embedding, return cached answer if cosine similarity > 0.95

---

## Critical Process Flows (Textual BPMN)

### Flow 1: CI → Deploy → Notify

**Name**: Docs Deployment Pipeline
**Scope**: Deploy Docusaurus site on docs/** changes

**Start Event**: Git push to `main` branch (paths: `docs/**`)

**Activities**:
1. **Checkout repository** (GitHub Actions)
2. **Setup Node.js 20** (with pnpm cache)
3. **Install pnpm** globally
4. **Install dependencies** (`pnpm install` in docs/)
5. **Build Docusaurus site** (`pnpm build`)
6. **Upload artifact** (Pages artifact)
7. **Deploy to GitHub Pages** (deploy-pages action)

**End Event**: Site live at GitHub Pages URL

**Swimlanes**:
- GitHub Actions (all activities)
- GitHub Pages (deployment)

**Failure Paths**:
- Build failure → Job fails, no notification
- **GAP**: No Rocket.Chat/Slack alert on failure

**Recommendations**:
- Add post-failure step: POST to Rocket.Chat webhook with build log link
- Add deployment status badge to README

---

### Flow 2: Error Handling in Edge Functions

**Name**: RAG Query Error Recovery
**Scope**: opex-rag-query failure handling

**Start Event**: User query arrives at Edge Function

**Activities**:
1. **Parse request** (assistant, question, domain, process)
2. **Create OpenAI thread**
3. **Add user message** to thread
4. **Run assistant** with vector stores
5. **Poll for completion** (1s intervals, max 60s)
6. **Extract answer** from assistant message
7. **Log to rag_queries** (success/failure)
8. **Return response** to n8n

**Gateway 1**: Assistant run completed?
- **Yes** → Extract answer
- **No** (timeout/failed) → **GAP**: No retry, immediate error

**Gateway 2**: Query logging successful?
- **Yes** → Return answer
- **No** → **GAP**: Silent failure, no alert

**End Event**: Answer returned OR error thrown

**Swimlanes**:
- Edge Function (Deno)
- OpenAI API
- Supabase (logging)

**Failure Paths**:
- OpenAI timeout → 500 error → n8n receives error → **GAP**: User sees "No answer returned"
- Rate limit → No retry with backoff
- DB logging fails → Answer returned but not logged

**Recommendations**:
- Add exponential backoff retry (3x) for OpenAI API
- Add circuit breaker: If 5 failures in 1 min, return cached answers only
- Add alert-notifier call on persistent failures

---

### Flow 3: Nightly Data Sync via n8n + Cron

**Name**: BIR Document Sync to RAG
**Scope**: Daily discovery and embedding of new BIR PDFs

**Start Event**: Cron trigger (3 AM Asia/Manila)

**Activities**:
1. **Fetch BIR sitemap** (HTTP GET sitemap.xml)
2. **Parse document URLs** (regex extract .pdf links)
3. **Query existing sources** (Supabase REST: embedding_sources table)
4. **Filter new documents** (set difference)
5. **Split into batches** (5 docs per batch)
6. **FOR EACH batch**:
   a. **Download document** (HTTP GET PDF)
   b. **Call embedding-worker** (POST to Edge Function with content)
   c. **Wait 2 seconds** (rate limiting)
7. **Aggregate results**
8. **Format summary** (docs processed count)
9. **Post to Mattermost** (ops-notifications channel)

**End Event**: Notification sent with summary

**Swimlanes**:
- n8n (orchestration)
- BIR Website (source)
- Supabase (storage + Edge Function)
- OpenAI (embeddings)
- Mattermost (notification)

**Failure Paths**:
- Sitemap fetch fails → Workflow stops, no retry
- Document download fails → Batch fails, continues to next batch (**resilient**)
- embedding-worker times out → **GAP**: No alert, silent skip

**Recommendations**:
- Add error notification: If >50% of batch fails, alert Rocket.Chat
- Add idempotency check: Skip documents already in vector store (by content hash)
- Add monitoring: Track daily sync success rate in rag_queries table

---

## Concrete Change Plan (Developer-Ready)

| ID | Summary | Component | Files Affected | Effort | Impact |
|----|---------|-----------|----------------|--------|--------|
| **C1** | Add correlation IDs across all flows | n8n + Edge Functions | all workflows, all functions/index.ts | M | High |
| **C2** | Consolidate chat platform to Rocket.Chat | n8n + Docker | workflows/*.json, docker-compose*.yml | L | High |
| **C3** | Add n8n error branches with retries | n8n | ask-opex-assistant.json | S | High |
| **C4** | Implement semantic query caching | Edge Functions | opex-rag-query/index.ts | M | Med |
| **C5** | Add Grafana observability dashboard | New | /infra/grafana/ | L | Med |
| **C6** | Wire MCP coordinator for agentic workflows | n8n + Docker | new workflow, docker-compose | L | Low |
| **C7** | Add deployment failure alerts | GitHub Actions | deploy-docs.yml | S | Med |
| **C8** | Unify secrets in Supabase Vault | All | n8n credentials, .env files | M | High |

---

### Top Priority: C1 - Add Correlation IDs

**Problem**: Cannot trace requests across system boundaries.

**Solution**: Generate UUID in n8n, propagate via headers.

**Changes**:

**File**: `workflows/n8n/ask-opex-assistant.json`
```json
{
  "id": "Generate_CorrelationID",
  "name": "Generate Correlation ID",
  "type": "n8n-nodes-base.set",
  "position": [400, 300],
  "parameters": {
    "values": {
      "string": [
        {
          "name": "correlationId",
          "value": "={{$now.toMillis()}}-{{$workflow.id}}-{{$execution.id}}"
        }
      ]
    }
  }
}
```

**File**: `supabase/functions/opex-rag-query/index.ts`
```typescript
// Extract correlation ID from header
const correlationId = req.headers.get('x-correlation-id') || crypto.randomUUID();

console.log(`[${correlationId}] Starting RAG query...`);

// Log to rag_queries with correlation_id
await supabase.from('rag_queries').insert({
  correlation_id: correlationId,
  question: request.question,
  // ...
});
```

**File**: `packages/db/sql/migrations/add_correlation_ids.sql`
```sql
ALTER TABLE opex.rag_queries
ADD COLUMN correlation_id TEXT;

CREATE INDEX idx_rag_queries_correlation
ON opex.rag_queries(correlation_id);
```

**Testing**:
```bash
# Trigger n8n workflow
curl -X POST https://n8n.insightpulseai.net/webhook/ask-opex-assistant \
  -H "Content-Type: application/json" \
  -d '{"text": "test correlation"}'

# Check logs
supabase functions logs opex-rag-query --limit 1
# Should show: [<timestamp>-<workflow>-<execution>] Starting RAG query...

# Query database
psql $POSTGRES_URL -c "SELECT correlation_id, question FROM opex.rag_queries ORDER BY created_at DESC LIMIT 1;"
```

---

### High Priority: C3 - Add Error Branches to n8n

**Problem**: Edge Function failures result in silent errors to users.

**Solution**: Add IF node checking HTTP status, retry on 5xx, alert on persistent failure.

**n8n Workflow Changes** (ask-opex-assistant.json):

**New Nodes**:
1. **Check Response Status** (IF node after HTTP_AskAssistant)
   - Condition: `{{$json.statusCode >= 500}}`
   - True → Retry branch
   - False → Extract Answer

2. **Retry with Backoff** (Loop node)
   - Max iterations: 3
   - Wait: `{{2^($iteration)}}` seconds

3. **Alert Failure** (HTTP Request to Rocket.Chat)
   - Body: `{"text": "🚨 RAG query failed after 3 retries: {{$json.error}}"}`

**Effort**: 1 hour (edit workflow JSON, test)

---

### Medium Priority: C2 - Consolidate to Rocket.Chat

**Problem**: Mattermost + Rocket.Chat duplication, fragmented user experience.

**Solution**: Migrate all slash commands to Rocket.Chat, deprecate Mattermost.

**Steps**:
1. Configure Rocket.Chat slash command `/opex` → n8n webhook
2. Update n8n workflows: Replace `MATTERMOST_WEBHOOK_URL` → `ROCKETCHAT_WEBHOOK_URL`
3. Test all notification flows
4. Announce migration, deprecate Mattermost RAG service
5. Remove `packages/mattermost-rag/` after 30-day grace period

**Files**:
- `workflows/n8n/*.json` (all webhook URLs)
- `infra/docker/docker-compose.mcp-n8n.yml` (remove Mattermost service)
- `README.md` (update chat platform documentation)

---

## Continuous Improvement Loop

**Proposed Architecture**:

```
┌──────────────────────────────────────────┐
│ 1. Metrics Collection (Always On)       │
│  - n8n execution logs → Supabase table   │
│  - Edge Function logs → Supabase table   │
│  - OpenAI usage → daily sync script      │
└───────────────┬──────────────────────────┘
                │
                ↓
┌──────────────────────────────────────────┐
│ 2. Aggregation (Daily Cron - 4 AM)      │
│  - GitHub Action: aggregate-metrics.yml  │
│  - Queries: Success rate, P95 latency    │
│  - Output: JSON report to S3/Supabase    │
└───────────────┬──────────────────────────┘
                │
                ↓
┌──────────────────────────────────────────┐
│ 3. Anomaly Detection (Python script)    │
│  - Compare today vs 7-day average        │
│  - Thresholds:                           │
│    • Error rate > 5%                     │
│    • P95 latency > 10s                   │
│    • Token usage > 2x avg                │
└───────────────┬──────────────────────────┘
                │
                ↓ (if anomaly detected)
┌──────────────────────────────────────────┐
│ 4. Alert & Triage                        │
│  - Rocket.Chat notification              │
│  - GitHub Issue (auto-created)           │
│  - Escalation: @ops-team mention         │
└───────────────┬──────────────────────────┘
                │
                ↓
┌──────────────────────────────────────────┐
│ 5. Feedback Loop (Weekly Review)        │
│  - Team reviews GitHub Issues            │
│  - Updates thresholds/workflows          │
│  - Commits changes → triggers CI/CD      │
└──────────────────────────────────────────┘
```

**Re-Audit Trigger**:
- **Scheduled**: Monthly (1st of month, automated)
- **Event-driven**: After major deployment, infrastructure change, or 3+ critical alerts in 1 week

---

## Summary

**System Maturity**: 7/10 (Production-grade, needs observability + error handling)

**Key Strengths**: Clean architecture, event-driven, self-healing RAG

**Critical Gaps**:
1. No end-to-end request tracing
2. Silent failures in n8n workflows
3. Fragmented chat platforms
4. No centralized observability

**Next Steps**:
1. Implement correlation IDs (C1) - **PRIORITY 1**
2. Add n8n error handling (C3) - **PRIORITY 2**
3. Consolidate to Rocket.Chat (C2) - **PRIORITY 3**
4. Build Grafana dashboard (C5) - **PRIORITY 4**

**Estimated Effort**: 2-3 weeks (1 senior engineer)

---

**Report End**
