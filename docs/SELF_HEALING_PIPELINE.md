# Self-Healing RAG Pipeline Architecture

## Overview

The Finance + PH Tax RAG knowledge base uses a self-healing pipeline to automatically detect stale embeddings, re-crawl updated content, and maintain high-quality vector search results.

## Architecture Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         Data Sources                             │
│  BIR Forms • Accounting Firms • ERP Vendors • Official Docs     │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│               embedding_sources Table (PostgreSQL)                │
│  Tracks all sources with status, failure counts, content hashes │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
         ┌─────────────┴─────────────┐
         │                           │
         ▼                           ▼
┌──────────────────┐        ┌──────────────────┐
│ Maintenance Cron │        │ Embedding Worker │
│  (Daily 2 AM)    │        │   (On-Demand)    │
└────────┬─────────┘        └────────┬─────────┘
         │                           │
         │ Mark stale sources        │ Process pending
         │ Reset failures            │ Download content
         │ Send health alerts        │ Create embeddings
         │                           │ Upload to OpenAI
         │                           │
         └───────────┬───────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │   OpenAI Vector Store  │
         │   vs_policies          │
         │   vs_sops_workflows    │
         │   vs_examples_systems  │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  PH Tax Assistant      │
         │  (GPT-4 Turbo)        │
         └───────────────────────┘
```

## Component Responsibilities

### 1. Database Schema (`packages/db/sql/embedding_sources.sql`)

**Tables:**
- `embedding_sources` - Primary tracking table

**Status Flow:**
```
pending → crawled → embedded ✓
   ↓         ↓         ↓
 failed ← failed ← failed (>3 failures = permanent)
                     ↓
                  stale (>30 days) → pending (retry)
```

**Key Functions:**
- `mark_stale_sources(staleness_days)` - Auto-detect outdated content
- `get_next_sources(batch_size)` - Intelligent queue management
- `record_processing_result()` - Success/failure tracking
- `get_embedding_health()` - Metrics dashboard

**Authority Ranking:**
- 10 = Philippine Government (BIR, SEC, BSP)
- 9 = Big-4 Accounting Firms (PwC, Deloitte, EY, KPMG)
- 8 = Local Accounting Firms
- 7 = ERP/SaaS Platforms (NetSuite, Brex, Prophix)
- 6 = Industry Blogs and Publications
- 5 = Other Sources

### 2. Embedding Worker (`supabase/functions/embedding-worker/index.ts`)

**Purpose:** Process pending sources and create embeddings

**Workflow:**
1. Fetch next batch of sources (ordered by authority_rank)
2. Download content with exponential backoff retry
3. Convert HTML to Markdown
4. Calculate content hash for change detection
5. Upload to appropriate OpenAI vector store
6. Update database with result
7. Increment failure_count on errors

**Triggers:**
- HTTP POST (manual)
- Scheduled cron (every 6 hours)
- GitHub Actions (on-demand)

**Configuration:**
```typescript
// Environment variables required
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
VS_POLICIES_ID
VS_SOPS_WORKFLOWS_ID
VS_EXAMPLES_SYSTEMS_ID
```

**API Usage:**
```bash
# Manual trigger
curl -X POST "https://[project-ref].supabase.co/functions/v1/embedding-worker" \
  -H "Authorization: Bearer [anon-key]" \
  -H "Content-Type: application/json" \
  -d '{"batchSize": 10}'
```

**Response:**
```json
{
  "message": "Processing complete",
  "processed": 10,
  "successful": 9,
  "failed": 1,
  "results": [
    {
      "url": "https://efps.bir.gov.ph/...",
      "success": true,
      "vectorStore": "vs_policies"
    }
  ]
}
```

### 3. Maintenance Function (`supabase/functions/embedding-maintenance/index.ts`)

**Purpose:** Detect stale embeddings and system health monitoring

**Workflow:**
1. Mark sources stale if not crawled in 30 days
2. Reset failure count for recoverable errors (< 3 failures)
3. Collect health metrics
4. Send Slack notifications for alerts
5. Create GitHub issues for critical failures

**Schedule:** Daily at 2 AM UTC (cron)

**Alert Thresholds:**
- Failed sources ≥ 5
- Stale sources > 20% of total
- Pending backlog > 50% of total

**API Usage:**
```bash
# Manual trigger
curl -X POST "https://[project-ref].supabase.co/functions/v1/embedding-maintenance" \
  -H "Authorization: Bearer [anon-key]" \
  -H "Content-Type: application/json" \
  -d '{"stalenessDays": 30}'
```

**Response:**
```json
{
  "message": "Maintenance complete",
  "marked_stale": 3,
  "reset_failures": 2,
  "health_metrics": {
    "total_sources": 15,
    "by_status": {
      "embedded": 10,
      "pending": 3,
      "failed": 2
    }
  },
  "alerts": null
}
```

### 4. CLI Audit Script (`scripts/embedding_audit.py`)

**Purpose:** Manual inspection and reporting tool

**Usage:**
```bash
# Show health metrics
python scripts/embedding_audit.py --health

# Show coverage statistics
python scripts/embedding_audit.py --coverage

# List sources by status
python scripts/embedding_audit.py --status pending
python scripts/embedding_audit.py --status failed

# Show stale sources
python scripts/embedding_audit.py --stale

# Show failed sources with error details
python scripts/embedding_audit.py --failed

# Estimate next crawl times
python scripts/embedding_audit.py --next-crawls

# Export comprehensive report
python scripts/embedding_audit.py --export report.json
python scripts/embedding_audit.py --export report.csv --format csv
```

**Dependencies:**
```bash
pip install psycopg2-binary tabulate
```

**Environment:**
```bash
export POSTGRES_URL="postgresql://postgres.xxx:xxx@aws-1-us-east-1.pooler.supabase.com:6543/postgres"
```

### 5. GitHub Actions Workflow (`.github/workflows/embedding-health.yml`)

**Purpose:** Automated monitoring and alerting

**Triggers:**
- Schedule: Daily at 3 AM UTC (after maintenance runs)
- Manual dispatch (workflow_dispatch)

**Actions:**
1. Run health audit using CLI script
2. Check health thresholds
3. Create GitHub issue if critical failures detected
4. Send Slack notification with health status
5. Upload detailed report as artifact

**GitHub Secrets Required:**
```
POSTGRES_URL - Supabase PostgreSQL connection string
SLACK_WEBHOOK_URL - Slack webhook for notifications (optional)
```

## Monitoring and Alerting

### Health Metrics

**Coverage Statistics:**
- Total sources tracked
- Embedded sources count
- Pending sources count
- Failed sources count
- Stale sources count
- Coverage percentage

**Health Indicators:**
- Last successful embed timestamp
- Oldest pending source age
- Average failure count
- Status distribution

### Alert Conditions

**Critical (Immediate Action):**
- ≥5 sources permanently failed (failure_count ≥ 3)
- >20% sources stale (not crawled in 30 days)
- Coverage <80%
- No successful embeds in 48 hours

**Warning (Review Recommended):**
- 3-4 sources failed
- 10-20% sources stale
- Coverage 80-90%
- Pending backlog growing

**Healthy:**
- <3 sources failed
- <10% sources stale
- Coverage >90%
- Regular successful embeds

### Notification Channels

**Slack (Real-time):**
- Maintenance completion summary
- Critical health alerts
- Processing failures

**GitHub Issues (Actionable):**
- Critical failures requiring investigation
- Stale source reports
- Low coverage alerts

**GitHub Actions Artifacts:**
- Daily audit reports (30-day retention)
- Detailed health metrics
- Failed source details

## Troubleshooting

### Common Issues

**1. High Failure Rate**

**Symptoms:**
- Multiple sources with failure_count ≥ 3
- Health alerts about failed sources

**Diagnosis:**
```bash
python scripts/embedding_audit.py --failed
```

**Common Causes:**
- Rate limiting from source websites
- Changed HTML structure
- Broken URLs
- Network timeouts

**Resolution:**
1. Review last_error column in database
2. Test URLs manually with curl
3. Update HTML parsing logic if structure changed
4. Add retry logic with longer backoff
5. Update source_url if redirected

**2. Stale Sources**

**Symptoms:**
- Health alerts about >20% stale sources
- Embeddings using outdated content

**Diagnosis:**
```bash
python scripts/embedding_audit.py --stale
```

**Resolution:**
1. Trigger manual worker run:
   ```bash
   curl -X POST "https://[project-ref].supabase.co/functions/v1/embedding-worker"
   ```
2. Check if maintenance function is running (cron enabled)
3. Verify staleness threshold (default 30 days)

**3. Low Coverage**

**Symptoms:**
- Coverage <80%
- Many sources stuck in pending

**Diagnosis:**
```bash
python scripts/embedding_audit.py --coverage
python scripts/embedding_audit.py --status pending
```

**Resolution:**
1. Trigger worker to process pending queue
2. Check OpenAI API key validity
3. Verify vector store IDs are correct
4. Review worker logs for errors

**4. Processing Stalled**

**Symptoms:**
- No recent embeddings
- Sources stuck in "crawled" status

**Diagnosis:**
```bash
SELECT * FROM embedding_sources
WHERE status = 'crawled'
ORDER BY last_crawled_at DESC;
```

**Resolution:**
1. Check Supabase Edge Function logs
2. Verify OpenAI API rate limits
3. Manually trigger worker
4. Reset stuck sources to pending:
   ```sql
   UPDATE embedding_sources
   SET status = 'pending'
   WHERE status = 'crawled'
   AND last_crawled_at < NOW() - INTERVAL '1 hour';
   ```

## Adding New Sources

### Method 1: SQL Insert

```sql
INSERT INTO embedding_sources (source_url, authority_rank, doc_type, form, domain, status, metadata)
VALUES (
  'https://www.bir.gov.ph/new-form.pdf',
  10,  -- Government source
  'policy',
  '1702',
  'tax',
  'pending',
  '{"notes": "Annual income tax return form", "version": "2025.01"}'::JSONB
);
```

### Method 2: Bulk Import via CSV

```python
import csv
import psycopg2

conn = psycopg2.connect(POSTGRES_URL)
cursor = conn.cursor()

with open('new_sources.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        cursor.execute("""
            INSERT INTO embedding_sources (source_url, authority_rank, doc_type, form, domain, metadata)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (source_url) DO NOTHING
        """, (row['url'], row['authority_rank'], row['doc_type'], row['form'], row['domain'], row['metadata']))

conn.commit()
```

### Method 3: REST API (Future Enhancement)

```bash
curl -X POST "https://[project-ref].supabase.co/rest/v1/embedding_sources" \
  -H "apikey: [service-role-key]" \
  -H "Content-Type: application/json" \
  -d '{
    "source_url": "https://example.com/doc.pdf",
    "authority_rank": 7,
    "doc_type": "workflow",
    "domain": "month_end",
    "status": "pending"
  }'
```

## Manual Intervention Procedures

### Force Re-crawl of Specific Source

```sql
UPDATE embedding_sources
SET status = 'pending',
    failure_count = 0,
    last_error = NULL
WHERE source_url = 'https://example.com/doc.pdf';
```

### Reset All Failed Sources

```sql
UPDATE embedding_sources
SET status = 'pending',
    failure_count = 0,
    last_error = NULL
WHERE status = 'failed';
```

### Mark All Sources as Stale (Force Re-crawl)

```sql
UPDATE embedding_sources
SET status = 'stale'
WHERE status = 'embedded';
```

### Delete Permanently Failed Source

```sql
DELETE FROM embedding_sources
WHERE id = '[uuid]';
```

### Update Content Hash (After Manual Verification)

```sql
UPDATE embedding_sources
SET content_hash = '[new-hash]',
    last_crawled_at = NOW(),
    status = 'embedded'
WHERE id = '[uuid]';
```

## Performance Optimization

### Batch Processing

**Worker Batch Size:** Default 10 sources per run
- Adjust based on OpenAI rate limits
- Higher batches = faster processing, more API costs
- Lower batches = slower but cheaper

**Configuration:**
```bash
curl -X POST ".../embedding-worker" \
  -d '{"batchSize": 20}'  # Increase to 20
```

### Concurrency Control

**Worker Concurrency:** Default 3 parallel downloads
- Adjust in `embedding-worker/index.ts`
- Higher concurrency = faster but more memory

```typescript
const CONCURRENCY_LIMIT = 5;  // Increase to 5
```

### Cron Frequency

**Maintenance:** Daily at 2 AM UTC
**Worker:** Every 6 hours

Adjust in Supabase Edge Functions cron settings:
```sql
-- Run worker every 3 hours instead of 6
SELECT cron.schedule(
  'embedding-worker-cron',
  '0 */3 * * *',  -- Changed from */6 to */3
  'https://[project-ref].supabase.co/functions/v1/embedding-worker'
);
```

## Cost Optimization

### OpenAI API Costs

**File Search Tool:** $0.10 per GB per day (vector storage)
**GPT-4 Turbo:** $0.01 per 1K input tokens, $0.03 per 1K output tokens

**Estimated Costs (100 sources):**
- Initial embedding: ~$5-10
- Monthly maintenance: ~$2-5
- Query costs: Variable based on usage

**Optimization Strategies:**
1. Use content_hash to avoid re-embedding unchanged content
2. Batch process during off-peak hours
3. Set staleness threshold to 45-60 days for stable content
4. Use smaller batch sizes to spread costs

### Supabase Costs

**Free Tier:** Up to 500 MB database, 2 million Edge Function invocations/month

**Recommendations:**
- Use connection pooler (port 6543) for efficient connections
- Enable RLS policies to secure data
- Monitor Edge Function execution time (<10s per invocation)

## Security Considerations

### RLS Policies

**Service Role:** Full access (embedding functions)
**Authenticated Users:** Read-only access (audit tools)
**Anonymous:** No access

### Secrets Management

**Never commit:**
- OpenAI API keys
- Supabase service role keys
- Slack webhook URLs

**Use:**
- GitHub Secrets for workflows
- Supabase Edge Function environment variables
- Local `.env` files (gitignored)

### Content Validation

**Before embedding:**
1. Verify source domain is trusted
2. Check robots.txt compliance
3. Validate content is not paywalled
4. Scan for sensitive information

## Roadmap

### Phase 1 (Complete)
- ✅ Database schema with tracking
- ✅ Embedding worker function
- ✅ Maintenance function
- ✅ CLI audit tool
- ✅ GitHub Actions monitoring

### Phase 2 (Future)
- [ ] Notion dashboard integration
- [ ] Real-time Slack alerts for failures
- [ ] Advanced HTML parsing (tables, charts)
- [ ] PDF OCR for scanned documents
- [ ] Smart content chunking strategies
- [ ] Multi-language support (English, Filipino)

### Phase 3 (Advanced)
- [ ] ML-based content change detection
- [ ] Automatic source discovery (web crawler)
- [ ] Quality scoring for embeddings
- [ ] A/B testing for system prompts
- [ ] User feedback integration
- [ ] Advanced analytics dashboard

## Support and Maintenance

### Regular Tasks

**Daily:**
- Review GitHub Actions health check results
- Check Slack notifications for alerts

**Weekly:**
- Run manual audit: `python scripts/embedding_audit.py --health`
- Review failed sources and update URLs if needed
- Monitor OpenAI API usage and costs

**Monthly:**
- Review stale sources and verify staleness threshold
- Update source authority rankings if needed
- Clean up permanently failed sources
- Export audit report: `python scripts/embedding_audit.py --export monthly_report.json`

**Quarterly:**
- Comprehensive source review
- Update system prompt based on user feedback
- Review and optimize batch sizes
- Database maintenance (VACUUM, ANALYZE)

### Contact and Resources

**Documentation:**
- System Prompt: `config/ph_tax_assistant_system_prompt.md`
- Metadata Schema: `config/metadata.yaml`
- Quick Start Guide: `RAG_QUICKSTART.md`

**Database Access:**
```bash
# Connect to database
psql "$POSTGRES_URL"

# View all sources
SELECT * FROM embedding_sources ORDER BY authority_rank DESC;

# Check health
SELECT get_embedding_health();
```

---

**Last Updated:** 2025-01-15
**Version:** 1.0
**Maintainer:** Finance SSC Team
