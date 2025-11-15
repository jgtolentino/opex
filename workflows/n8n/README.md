# n8n Workflows for OpEx

Production-ready n8n workflows for automating OpEx operations, finance processes, and infrastructure monitoring.

## 📚 Available Workflows

### 1. Ask OpEx / PH Tax Assistant (`ask-opex-assistant.json`)
**Purpose**: Webhook-based RAG query handler for Mattermost integration

**Features**:
- Exposes webhook endpoint for Mattermost slash commands
- Routes questions to Supabase Edge Function (`opex-rag-query`)
- Returns AI-generated answers from OpEx and PH Tax assistants
- Automatic domain detection (HR, Finance, Ops, Tax)

**Trigger**: Webhook POST (Mattermost slash command `/opex`)

**Use Cases**:
- Quick policy lookups from Mattermost
- Employee self-service for HR/Finance questions
- Tax form guidance and BIR compliance queries

---

### 2. PH Tax Deadline Notifier (`tax-deadline-notifier.json`)
**Purpose**: Automated BIR deadline reminders for multi-agency operations

**Features**:
- Daily check for upcoming tax deadlines (7-day window)
- Agency-specific notifications (RIM, CKVC, BOM, JPAL, JLI, JAP, LAS, RMQB)
- Form type detection (1601-C, 2550Q, 1702-RT, etc.)
- Mattermost channel routing

**Trigger**: Cron (Daily at 8 AM Philippine Time)

**Use Cases**:
- Prevent missed BIR filing deadlines
- Multi-agency finance coordination
- Compliance risk mitigation

---

### 3. Service Health Check Monitor (`health-check-monitor.json`)
**Purpose**: Continuous monitoring of critical infrastructure services

**Features**:
- Checks 4 services: MCP, ERP (Odoo), OCR Service, n8n itself
- Response time monitoring (<500ms threshold)
- Mattermost alerts for downtime or performance degradation
- Optional GitHub issue creation for persistent failures

**Trigger**: Cron (Every 10 minutes)

**Use Cases**:
- Proactive incident detection
- SRE-lite monitoring without full stack
- Service availability dashboards

---

### 4. BIR Document Sync to RAG (`document-sync-rag.json`)
**Purpose**: Automatic discovery and ingestion of new BIR documents

**Features**:
- Fetches BIR website sitemap for new PDFs
- Compares against existing sources in Supabase
- Downloads and processes new documents
- Calls `embedding-worker` Edge Function for RAG updates
- Batched processing with rate limiting

**Trigger**: Cron (Daily at 3 AM Philippine Time)

**Use Cases**:
- Self-healing RAG knowledge base
- Automatic compliance document updates
- Zero-manual-effort knowledge management

---

## 🚀 Quick Start

### Prerequisites

1. **n8n Instance Running**: https://ipa.insightpulseai.net
2. **Credentials Configured**:
   - Supabase (service role key for admin operations)
   - Mattermost (incoming webhook URL)
   - GitHub (personal access token for issue creation)

### Import Workflows

1. Open n8n: https://ipa.insightpulseai.net
2. Click **"Workflows"** → **"Import from File"**
3. Select a workflow JSON file from this directory
4. Click **"Import"**
5. Configure credentials (see `docs/CREDENTIALS.md`)
6. **Save** and **Activate** the workflow

### Test Workflows

**Ask OpEx Assistant**:
```bash
# Get webhook URL from n8n
WEBHOOK_URL="https://ipa.insightpulseai.net/webhook/ask-opex-assistant"

# Test with curl
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"text": "What are the steps for employee onboarding?"}'
```

**Tax Deadline Notifier**:
```bash
# Manually trigger the workflow in n8n UI
# Or wait for next 8 AM trigger
```

**Health Check Monitor**:
```bash
# Manually trigger to see current service status
# Or wait for next 10-minute interval
```

**Document Sync**:
```bash
# Manually trigger to sync new BIR documents
# Or wait for next 3 AM trigger
```

---

## 📖 Documentation

- **Setup Guide**: [`docs/SETUP.md`](docs/SETUP.md) - n8n + credential configuration
- **Mattermost Integration**: [`docs/MATTERMOST_CONFIG.md`](docs/MATTERMOST_CONFIG.md) - Slash command setup
- **Credentials Guide**: [`docs/CREDENTIALS.md`](docs/CREDENTIALS.md) - Supabase, Mattermost, GitHub credentials

### Individual Workflow Docs

- [`docs/workflows/ask-opex-assistant.md`](docs/workflows/ask-opex-assistant.md)
- [`docs/workflows/tax-deadline-notifier.md`](docs/workflows/tax-deadline-notifier.md)
- [`docs/workflows/health-check-monitor.md`](docs/workflows/health-check-monitor.md)
- [`docs/workflows/document-sync-rag.md`](docs/workflows/document-sync-rag.md)

---

## 🔧 Architecture

```
┌─────────────────┐
│   Mattermost    │  /opex command
│   (Slack/Chat)  │
└────────┬────────┘
         │
         │ HTTP POST
         ↓
┌─────────────────┐
│   n8n Workflow  │  ask-opex-assistant.json
│   (Orchestrator)│
└────────┬────────┘
         │
         │ POST /functions/v1/opex-rag-query
         ↓
┌─────────────────┐
│ Supabase Edge   │  OpEx RAG Query
│   Functions     │
└────────┬────────┘
         │
         │ Query OpenAI Assistants API
         ↓
┌─────────────────┐
│   OpenAI API    │  gpt-4-turbo with file_search
│ (3 Vector Stores│
└─────────────────┘
```

---

## 🛡️ Security

- **Service Role Key**: Only for admin operations (embedding-worker, tax queries)
- **Anon Key**: Safe for public RAG queries (RLS enforced)
- **Webhook Security**: Consider adding authentication tokens
- **Rate Limiting**: Built into Supabase Edge Functions
- **Secrets**: All credentials stored in n8n credential manager (not in workflow JSONs)

---

## 📊 Monitoring

### Workflow Execution Logs
- View in n8n: **Executions** tab
- Filter by workflow name
- Check success/failure rates

### RAG Query Analytics
```sql
-- View recent queries
SELECT
  created_at,
  assistant,
  domain,
  success,
  tokens_used,
  response_time_ms
FROM opex.rag_queries
ORDER BY created_at DESC
LIMIT 20;

-- Analytics by domain
SELECT
  domain,
  COUNT(*) as queries,
  AVG(response_time_ms) as avg_response_time,
  SUM(tokens_used::int) as total_tokens
FROM opex.rag_queries
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY domain;
```

---

## 🔄 Updates & Maintenance

### Updating Workflows

1. Edit the JSON file locally
2. Import updated version into n8n
3. Test with manual execution
4. Commit changes to repository
5. Deploy to production

### Adding New Workflows

1. Create workflow in n8n UI
2. Export as JSON
3. Save to `workflows/n8n/`
4. Create documentation in `docs/workflows/`
5. Update this README
6. Commit to repository

---

## 🆘 Troubleshooting

### Workflow Not Triggering

**Cron Workflows**:
- Check workflow is **Activated** (toggle in n8n)
- Verify timezone is set to `Asia/Manila`
- Check n8n server time: `date` in container

**Webhook Workflows**:
- Get webhook URL from workflow
- Test with `curl` (see examples above)
- Check Mattermost slash command configuration

### Supabase Errors

**401 Unauthorized**:
- Verify credential is configured in n8n
- Check API key is correct (service role or anon)
- Ensure `apikey` header is being sent

**500 Internal Server Error**:
- Check Supabase Edge Function logs
- Verify function is deployed: `supabase functions list`
- Test function directly with `curl`

### Mattermost Not Receiving Messages

- Verify webhook URL is correct
- Check channel name matches (e.g., `finance-alerts`)
- Test webhook with `curl`:
  ```bash
  curl -X POST $MATTERMOST_WEBHOOK_URL \
    -H "Content-Type: application/json" \
    -d '{"channel": "test", "text": "Hello from n8n"}'
  ```

---

## 📞 Support

- **Documentation**: [`docs/`](docs/)
- **GitHub Issues**: [jgtolentino/opex/issues](https://github.com/jgtolentino/opex/issues)
- **Mattermost**: `#ops-automation` channel

---

## 📜 License

Part of the OpEx project. See root LICENSE file for details.
