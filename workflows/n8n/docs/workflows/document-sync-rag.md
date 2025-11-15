# BIR Document Sync to RAG Workflow

Automatic discovery and ingestion of new BIR documents into RAG system.

## Overview

**File**: `document-sync-rag.json`
**Trigger**: Cron (Daily 3 AM Philippine Time)
**Purpose**: Self-healing knowledge base with zero manual updates

## Flow

```
Cron (3 AM) → Fetch BIR Sitemap → Parse Document URLs →
Check Existing Sources → Filter New Docs → Download →
Call Embedding Worker → Post Summary to Mattermost
```

## Nodes

1. **Daily Trigger (3 AM)**: Cron trigger
2. **Fetch BIR Sitemap/RSS**: GET `https://www.bir.gov.ph/sitemap.xml`
3. **Parse Document URLs**: Extract PDF URLs with regex
4. **Check Existing Sources**: Query Supabase `opex.embedding_sources`
5. **Filter New Documents**: Compare against existing
6. **Process in Batches**: Handle 5 documents at a time
7. **Download Document**: GET PDF binary
8. **Call Embedding Worker**: POST to `/functions/v1/embedding-worker`
9. **Wait 2 Seconds**: Rate limiting between documents
10. **Aggregate Results**: Collect all processed documents
11. **Format Summary**: Create completion message
12. **Post Summary to Mattermost**: Send to `#ops-notifications`

## Configuration

### Credentials
- Supabase Service Role Key
- Mattermost Webhook

### BIR Document Sources

Current sources (can be expanded):
- `https://www.bir.gov.ph/sitemap.xml` - Main sitemap
- `https://www.bir.gov.ph/index.php/revenue-regulations/` - Revenue Regulations RSS
- `https://www.bir.gov.ph/index.php/bir-forms/` - Tax Forms

## Document Parsing Logic

```javascript
// Extract PDF URLs from XML sitemap
const sitemap = $input.first().json.data;
const urlPattern = /<loc>(.*?\.pdf)<\/loc>/gi;
const matches = [...sitemap.matchAll(urlPattern)];

const documents = matches.map(match => ({
  url: match[1],
  source: 'bir_website',
  discoveredAt: new Date().toISOString()
}));

return documents.map(doc => ({ json: doc }));
```

## Filtering New Documents

```javascript
const newDocs = $input.first().json;
const existing = $input.all()[1].json;

const existingUrls = new Set(existing.map(doc => doc.source_url));
const toProcess = newDocs.filter(doc => !existingUrls.has(doc.url));

return toProcess.map(doc => ({ json: doc }));
```

## Embedding Worker Integration

**POST** `https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/embedding-worker`

**Body**:
```json
{
  "sourceUrl": "https://www.bir.gov.ph/forms/1601-C.pdf",
  "sourceType": "bir_document",
  "content": "<binary or base64>",
  "metadata": {
    "source": "bir_website",
    "discoveredAt": "2025-11-15T03:00:00Z"
  }
}
```

## Summary Notification

```
📚 **BIR Document Sync Complete** 📚

**Timestamp**: 2025-11-15T03:05:30Z
**Documents Processed**: 3
**Source**: BIR Website (sitemap.xml)

**Status**: ✅ Successfully synced to RAG system

[View Embedding Sources](https://ipa.insightpulseai.net/admin/embeddings)
```

## Customization

### Add More Document Sources

```javascript
// After "Fetch BIR Sitemap" node, add parallel HTTP nodes
const sources = [
  'https://www.bir.gov.ph/sitemap.xml',
  'https://www.bir.gov.ph/revenue-regulations-rss.xml',
  'https://www.bir.gov.ph/bir-forms-rss.xml'
];
```

### Change Batch Size

```javascript
// In "Process in Batches" node
{
  "batchSize": 10  // Process 10 at a time (faster but more API load)
}
```

### Filter by Document Type

```javascript
// In "Filter New Documents" node
const toProcess = newDocs.filter(doc =>
  !existingUrls.has(doc.url) &&
  doc.url.match(/forms|regulations|revenue-memorandum/i)
);
```

## Monitoring

View sync history in Supabase:

```sql
SELECT
  source_url,
  last_updated,
  status,
  metadata->>'discovered_at' as discovered_at
FROM opex.embedding_sources
WHERE source_type = 'bir_document'
ORDER BY last_updated DESC
LIMIT 50;
```

## Error Handling

### Download Failures
- **Continue on fail**: ✅ Enabled
- **Retry**: 2 attempts with exponential backoff
- **Log**: Error recorded in workflow execution

### Embedding Worker Timeout
- **Timeout**: 30 seconds
- **Fallback**: Document queued for manual review

### Rate Limiting
- **Wait**: 2 seconds between documents
- **Batch size**: 5 documents
- **Total time**: ~15-20 minutes for 50 documents
