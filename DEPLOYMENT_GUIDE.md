# Deployment Guide - Self-Healing RAG Pipeline

Complete deployment guide for the Finance + PH Tax RAG knowledge base with self-healing capabilities.

## Prerequisites

### Required Accounts
- [x] OpenAI account with API access
- [x] Supabase project created
- [x] GitHub repository setup
- [x] Slack workspace (optional, for notifications)

### Required Tools
```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Install PostgreSQL client
brew install postgresql

# Install Python dependencies
pip install psycopg2-binary tabulate

# Install Node.js dependencies
pnpm install
```

### Environment Variables

Create `.env` file in project root:
```bash
# OpenAI
OPENAI_API_KEY=sk-proj-...

# Supabase
SUPABASE_URL=https://xkxyvboeubffxxbebsll.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
SUPABASE_ACCESS_TOKEN=sbp_5d3b419ed91215372f8a8fb7b0a478cc1ec90eca
POSTGRES_URL=postgresql://postgres.xkxyvboeubffxxbebsll:xxx@aws-1-us-east-1.pooler.supabase.com:6543/postgres

# Vector Store IDs (will be created in Step 2)
VS_POLICIES_ID=vs_...
VS_SOPS_WORKFLOWS_ID=vs_...
VS_EXAMPLES_SYSTEMS_ID=vs_...

# Optional: Slack notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

## Deployment Steps

### Step 1: Deploy Database Schema

```bash
# Connect to Supabase database
psql "$POSTGRES_URL"

# Run the schema migration
\i packages/db/sql/embedding_sources.sql

# Verify tables created
\dt

# Check initial seed data
SELECT source_url, status FROM embedding_sources;

# Exit
\q
```

**Expected Output:**
```
CREATE TABLE
CREATE INDEX
CREATE FUNCTION
...
INSERT 0 9
```

**Verification:**
```sql
-- Should show 9 pending sources
SELECT COUNT(*) FROM embedding_sources WHERE status = 'pending';
```

### Step 2: Create Vector Stores and Upload Files

```bash
# Ensure OpenAI API key is set
export OPENAI_API_KEY=sk-proj-...

# Run vector store setup
pnpm rag:setup
```

**Expected Output:**
```
📦 Creating vector stores...

✅ vs_policies created: vs_abc123...
✅ vs_sops_workflows created: vs_def456...
✅ vs_examples_systems created: vs_ghi789...

📤 Uploading files to vector stores...

   Uploading: bir_1601c_instructions_html
   ✅ bir_1601c_instructions_html → vs_policies
   ...

📊 Upload Summary:
   ✅ Success: 9
   ❌ Errors: 0
   📁 Total: 9

💾 Vector store IDs saved to .env file

✅ Setup complete!
```

**Verification:**
```bash
# Check .env file updated
grep "VS_" .env

# Should show 3 vector store IDs
```

### Step 3: Create OpenAI Assistant

```bash
# Create the assistant
pnpm rag:assistant
```

**Expected Output:**
```
Creating PH Tax Assistant...
✅ Assistant created: asst_xyz789...
   Name: PH Month-End & Tax Copilot
   Model: gpt-4-turbo-preview
   Vector Stores: 3

🧪 Testing assistant with sample query...

Query: "I am the Finance Supervisor. I just finished preparing the 1601-C for this month. What is my next step before filing?"

📝 Assistant Response:

Based on the month-end close workflows, after preparing Form 1601-C, the next step is:

**Report Approval (Senior Finance Manager)**
...

✅ Test completed successfully

💾 Save this assistant ID for future use: asst_xyz789...
```

**Save the assistant ID:**
```bash
# Add to .env
echo "ASSISTANT_ID=asst_xyz789..." >> .env
```

### Step 4: Deploy Supabase Edge Functions

```bash
# Login to Supabase
supabase login

# Link to project
supabase link --project-ref xkxyvboeubffxxbebsll

# Deploy embedding-worker function
supabase functions deploy embedding-worker --no-verify-jwt

# Deploy embedding-maintenance function
supabase functions deploy embedding-maintenance --no-verify-jwt

# Set secrets for Edge Functions
supabase secrets set OPENAI_API_KEY="sk-proj-..."
supabase secrets set VS_POLICIES_ID="vs_abc123..."
supabase secrets set VS_SOPS_WORKFLOWS_ID="vs_def456..."
supabase secrets set VS_EXAMPLES_SYSTEMS_ID="vs_ghi789..."
supabase secrets set SLACK_WEBHOOK_URL="https://hooks.slack.com/..." # Optional
```

**Expected Output:**
```
Deploying function embedding-worker...
✅ Function deployed successfully

Deploying function embedding-maintenance...
✅ Function deployed successfully

Setting secrets...
✅ Secrets set successfully
```

**Verification:**
```bash
# List deployed functions
supabase functions list

# Test embedding-worker
curl -X POST "https://xkxyvboeubffxxbebsll.supabase.co/functions/v1/embedding-worker" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"batchSize": 3}'

# Should return processing results
```

### Step 5: Enable Edge Function Cron Jobs

```bash
# Connect to database
psql "$POSTGRES_URL"
```

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule maintenance function (daily at 2 AM UTC)
SELECT cron.schedule(
  'embedding-maintenance-daily',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://xkxyvboeubffxxbebsll.supabase.co/functions/v1/embedding-maintenance',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.anon_key') || '"}'::jsonb
  );
  $$
);

-- Schedule worker function (every 6 hours)
SELECT cron.schedule(
  'embedding-worker-6hourly',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://xkxyvboeubffxxbebsll.supabase.co/functions/v1/embedding-worker',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.anon_key') || '"}'::jsonb,
    body := '{"batchSize": 10}'::jsonb
  );
  $$
);

-- Verify cron jobs
SELECT * FROM cron.job;

-- Exit
\q
```

**Note:** If `pg_cron` is not available, use Supabase Dashboard:
1. Go to Database → Extensions
2. Enable `pg_cron`
3. Use SQL Editor to run the above schedule commands

### Step 6: Configure GitHub Actions

```bash
# Set GitHub repository secrets
gh secret set POSTGRES_URL -b "$POSTGRES_URL"
gh secret set SLACK_WEBHOOK_URL -b "$SLACK_WEBHOOK_URL"  # Optional

# Verify secrets
gh secret list
```

**Manual Setup (if gh CLI not available):**
1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Add repository secrets:
   - `POSTGRES_URL`: `postgresql://postgres.xxx:xxx@aws-1-us-east-1.pooler.supabase.com:6543/postgres`
   - `SLACK_WEBHOOK_URL`: `https://hooks.slack.com/services/...` (optional)

**Trigger Manual Workflow:**
```bash
# Trigger health check workflow manually
gh workflow run embedding-health.yml

# View workflow runs
gh run list --workflow=embedding-health.yml
```

### Step 7: Initial System Test

```bash
# Test CLI audit tool
python scripts/embedding_audit.py --health

# Should show health metrics
```

**Expected Output:**
```
🏥 Health Metrics
================================================================================
{
  "total_sources": 9,
  "by_status": {
    "embedded": 9,
    "pending": 0,
    "failed": 0,
    "stale": 0
  },
  "failed_sources": 0,
  "stale_sources": 0,
  "avg_failure_count": 0.00,
  "last_successful_embed": "2025-01-15T10:30:00Z",
  "oldest_pending": null
}

📊 Coverage Statistics
================================================================================
Total Sources: 9
Embedded: 9
Pending: 0
Failed: 0
Stale: 0
Coverage: 100.0%
```

## Verification Checklist

### Database Layer
- [x] `embedding_sources` table created
- [x] 9 initial sources seeded
- [x] Helper functions working (`mark_stale_sources`, `get_next_sources`, etc.)
- [x] RLS policies enabled

### OpenAI Layer
- [x] 3 vector stores created
- [x] 9 files uploaded successfully
- [x] Assistant created with file_search tool
- [x] Assistant test query returns relevant results

### Supabase Edge Functions
- [x] `embedding-worker` deployed
- [x] `embedding-maintenance` deployed
- [x] Secrets configured
- [x] Functions responding to HTTP requests
- [x] Cron jobs scheduled

### GitHub Actions
- [x] Workflow file committed
- [x] Secrets configured
- [x] Manual workflow run successful
- [x] Daily schedule configured

### CLI Tools
- [x] Audit script executable
- [x] Database connection working
- [x] Health metrics displaying
- [x] Export functionality working

## Post-Deployment Operations

### Monitor Initial Processing

```bash
# Watch processing in real-time
watch -n 5 'python scripts/embedding_audit.py --health'

# View recent embeds
psql "$POSTGRES_URL" -c "
  SELECT source_url, status, last_embedded_at
  FROM embedding_sources
  ORDER BY last_embedded_at DESC NULLS LAST
  LIMIT 10;
"
```

### Test Assistant Queries

```bash
# Create test script
cat > test_assistant.ts << 'EOF'
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const ASSISTANT_ID = process.env.ASSISTANT_ID!;

async function testQuery(question: string) {
  const thread = await client.beta.threads.create();

  await client.beta.threads.messages.create(thread.id, {
    role: 'user',
    content: question
  });

  const run = await client.beta.threads.runs.create(thread.id, {
    assistant_id: ASSISTANT_ID
  });

  let runStatus = await client.beta.threads.runs.retrieve(thread.id, run.id);
  while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
    await new Promise(resolve => setTimeout(resolve, 1000));
    runStatus = await client.beta.threads.runs.retrieve(thread.id, run.id);
  }

  const messages = await client.beta.threads.messages.list(thread.id);
  const response = messages.data.find(m => m.role === 'assistant');

  if (response && response.content[0]?.type === 'text') {
    console.log('\nQuestion:', question);
    console.log('\nAnswer:', response.content[0].text.value);
  }
}

testQuery('When is the 2550Q filing deadline for Q1 2025?');
EOF

# Run test
tsx test_assistant.ts
```

### Add New Sources

```sql
-- Add new BIR form
INSERT INTO embedding_sources (source_url, authority_rank, doc_type, form, domain, status, metadata)
VALUES (
  'https://www.bir.gov.ph/new-form.pdf',
  10,
  'policy',
  '1702',
  'tax',
  'pending',
  '{"notes": "Annual income tax return", "version": "2025.01"}'::JSONB
);

-- Trigger worker to process
-- (Or wait for next cron run)
```

## Troubleshooting

### Issue: Edge Functions Not Responding

**Check:**
```bash
# View function logs
supabase functions logs embedding-worker --tail

# Test with curl
curl -v "https://xkxyvboeubffxxbebsll.supabase.co/functions/v1/embedding-worker" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"
```

**Resolution:**
- Verify JWT verification is disabled (`--no-verify-jwt`)
- Check secrets are set correctly
- Review function logs for errors

### Issue: Cron Jobs Not Running

**Check:**
```sql
-- View cron job status
SELECT * FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 10;
```

**Resolution:**
- Ensure `pg_cron` extension is enabled
- Verify cron schedule syntax
- Check database timezone settings

### Issue: GitHub Actions Failing

**Check:**
```bash
# View workflow runs
gh run list --workflow=embedding-health.yml --limit 5

# View specific run logs
gh run view [run-id] --log
```

**Resolution:**
- Verify `POSTGRES_URL` secret is set correctly
- Check Python dependencies installed
- Ensure psycopg2-binary can connect to database

### Issue: Low Coverage

**Check:**
```bash
python scripts/embedding_audit.py --status failed
python scripts/embedding_audit.py --status pending
```

**Resolution:**
- Manually trigger worker: `curl .../embedding-worker`
- Check failed sources for error messages
- Update broken URLs in database

## Maintenance Schedule

### Daily (Automated)
- 2 AM UTC: Maintenance function marks stale sources
- 3 AM UTC: GitHub Actions health check runs
- Every 6 hours: Worker processes pending sources

### Weekly (Manual)
- Review health check results in GitHub Actions
- Check Slack notifications for alerts
- Run manual audit: `python scripts/embedding_audit.py --health`

### Monthly (Manual)
- Export comprehensive report: `python scripts/embedding_audit.py --export monthly.json`
- Review and update source URLs if needed
- Monitor OpenAI API costs
- Update assistant system prompt if needed

## Rollback Procedures

### Rollback Database Schema

```bash
# Create backup
pg_dump "$POSTGRES_URL" > backup_before_rollback.sql

# Drop tables
psql "$POSTGRES_URL" -c "DROP TABLE IF EXISTS embedding_sources CASCADE;"

# Restore from backup
psql "$POSTGRES_URL" < backup_before_rollback.sql
```

### Rollback Edge Functions

```bash
# Delete functions
supabase functions delete embedding-worker
supabase functions delete embedding-maintenance
```

### Disable Automation

```sql
-- Disable cron jobs
SELECT cron.unschedule('embedding-maintenance-daily');
SELECT cron.unschedule('embedding-worker-6hourly');
```

```bash
# Disable GitHub Actions
# Go to repository → Actions → Disable workflow
```

## Next Steps

1. **Monitor for 24 hours:** Ensure all automated tasks run successfully
2. **Add internal documents:** Upload company-specific SOPs and templates
3. **Customize staleness threshold:** Adjust based on content update frequency
4. **Set up Slack notifications:** Configure webhook for real-time alerts
5. **Create Notion dashboard:** Visualize health metrics (optional)
6. **Tune batch sizes:** Optimize based on OpenAI rate limits and costs
7. **Add more sources:** Expand knowledge base with additional authorities

## Support

**Documentation:**
- Self-Healing Architecture: `docs/SELF_HEALING_PIPELINE.md`
- Quick Start: `RAG_QUICKSTART.md`
- Technical Reference: `config/PH_TAX_ASSISTANT_README.md`

**Database Access:**
```bash
psql "$POSTGRES_URL"
```

**Audit Tool:**
```bash
python scripts/embedding_audit.py --help
```

---

**Deployment Date:** 2025-01-15
**Version:** 1.0
**Status:** Production Ready ✅
