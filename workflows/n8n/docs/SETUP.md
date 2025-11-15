# n8n Setup Guide for OpEx Workflows

Complete setup guide for configuring n8n to work with OpEx RAG system, Mattermost, and Supabase.

## Prerequisites

- ✅ n8n instance running at https://ipa.insightpulseai.net
- ✅ Supabase project: `ublqmilcjtpnflofprkr`
- ✅ Mattermost instance (self-hosted or cloud)
- ✅ OpenAI API key (for direct calls, if needed)

---

## Step 1: Configure n8n Credentials

### 1.1 Supabase HTTP Credential

Used for calling Supabase REST API and Edge Functions.

**Steps**:
1. Open n8n: https://ipa.insightpulseai.net
2. Click **Settings** (gear icon) → **Credentials**
3. Click **"+ Add Credential"**
4. Search for **"Header Auth"**
5. Configure:
   - **Name**: `Supabase OpEx (Service Role)`
   - **Header Name**: `apikey`
   - **Header Value**: `<OPEX_SUPABASE_SERVICE_ROLE_KEY>`
6. Click **"Create"**

**Service Role Key**:
```bash
# From ~/.zshrc
echo $OPEX_SUPABASE_SERVICE_ROLE_KEY
```

**When to Use**:
- Tax deadline queries (needs read access to tax tables)
- Embedding source checks (admin operation)
- Notification logging

---

### 1.2 Mattermost Webhook Credential

Used for posting notifications to Mattermost channels.

**Steps**:
1. In Mattermost:
   - Go to **Integrations** → **Incoming Webhooks**
   - Click **"Add Incoming Webhook"**
   - Select channel (e.g., `finance-alerts`, `ops-notifications`)
   - Copy webhook URL

2. In n8n:
   - Add credential type: **"HTTP Request"** (generic)
   - **Name**: `Mattermost Webhook`
   - **URL**: Paste webhook URL from step 1

**Environment Variable** (Recommended):
```bash
# Add to n8n container environment
MATTERMOST_WEBHOOK_URL=https://your-mattermost.com/hooks/xxx
```

---

### 1.3 GitHub Personal Access Token (Optional)

Used for creating issues automatically when services fail.

**Steps**:
1. GitHub → **Settings** → **Developer Settings** → **Personal Access Tokens**
2. Click **"Generate new token (classic)"**
3. Scopes: `repo` (full control of private repositories)
4. Copy token

5. In n8n:
   - Add credential: **"Header Auth"**
   - **Name**: `GitHub PAT`
   - **Header Name**: `Authorization`
   - **Header Value**: `Bearer <github_pat_token>`

---

## Step 2: Import Workflows

### 2.1 Import from File

1. Download workflow JSONs from `workflows/n8n/`
2. Open n8n → **Workflows** → **Import from File**
3. Select JSON file (e.g., `ask-opex-assistant.json`)
4. Click **"Import"**

### 2.2 Configure Credentials in Workflow

After importing, each HTTP Request node needs credentials:

**Example: "Call Supabase Edge Function" node**
1. Click the node
2. **Credential to connect with**: Select `Supabase OpEx (Service Role)`
3. Click **"Save"**

**Repeat for all nodes** that use:
- Supabase (HTTP Request nodes calling `ublqmilcjtpnflofprkr.supabase.co`)
- Mattermost (HTTP Request nodes calling Mattermost webhook)
- GitHub (HTTP Request nodes calling `api.github.com`)

---

## Step 3: Activate Workflows

### 3.1 Test Manually First

Before activating cron triggers:

1. Open workflow in n8n
2. Click **"Execute Workflow"** (play button)
3. Check execution log for errors
4. Verify output (e.g., Mattermost message sent)

### 3.2 Activate for Production

Once tested:

1. Toggle **"Active"** switch (top-right)
2. Workflow will now trigger automatically (cron) or accept webhooks

---

## Step 4: Configure Webhook URLs

### 4.1 Get Webhook URL

For `ask-opex-assistant` workflow:

1. Open workflow in n8n
2. Click **"Webhook"** node
3. Copy **Production URL**:
   ```
   https://ipa.insightpulseai.net/webhook/ask-opex-assistant
   ```

### 4.2 Test Webhook

```bash
curl -X POST https://ipa.insightpulseai.net/webhook/ask-opex-assistant \
  -H "Content-Type: application/json" \
  -d '{
    "text": "What is the deadline for BIR Form 1601-C?",
    "domain": "tax"
  }'
```

**Expected Response**:
```
BIR Form 1601-C (Monthly Remittance Return of Income Taxes Withheld) is due on the 10th day of the following month...
```

---

## Step 5: Environment Variables

### 5.1 Set in n8n Container

If using Docker, add to `docker-compose.yml`:

```yaml
services:
  n8n:
    image: n8nio/n8n
    environment:
      - MATTERMOST_WEBHOOK_URL=https://your-mattermost.com/hooks/xxx
      - OPEX_SUPABASE_URL=https://ublqmilcjtpnflofprkr.supabase.co
      - OPEX_SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
      - GITHUB_TOKEN=github_pat_xxx
```

### 5.2 Access in Workflows

Reference in nodes with:
```
={{$env.MATTERMOST_WEBHOOK_URL}}
```

---

## Step 6: Verify Integration

### 6.1 Test Each Workflow

**Ask OpEx Assistant**:
```bash
# Via curl
curl -X POST <webhook-url> \
  -d '{"text": "How do I onboard a new employee?"}'

# Via Mattermost (after slash command setup)
/opex How do I onboard a new employee?
```

**Tax Deadline Notifier**:
1. Manually execute workflow
2. Check Mattermost `#finance-alerts` for notification
3. Verify data comes from Supabase

**Health Check Monitor**:
1. Manually execute workflow
2. Check all 4 services return status
3. Verify Mattermost alert if service down

**Document Sync RAG**:
1. Manually execute workflow
2. Check Supabase `opex.embedding_sources` for new rows
3. Verify Mattermost summary message

---

## Step 7: Monitoring

### 7.1 Execution Logs

- n8n → **Executions** tab
- Filter by workflow name
- Check success/failure rates

### 7.2 Workflow Metrics

View in n8n dashboard:
- Execution count (last 24h, 7d, 30d)
- Success rate
- Average execution time
- Error types

### 7.3 Supabase Analytics

```sql
-- RAG query stats
SELECT
  DATE(created_at) as date,
  COUNT(*) as queries,
  AVG(response_time_ms) as avg_response_time
FROM opex.rag_queries
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## Troubleshooting

### Workflow Not Executing

**Cron Trigger**:
- Check workflow is **Active**
- Verify timezone: `Asia/Manila`
- Check n8n server time matches

**Webhook Trigger**:
- Verify URL is correct
- Check HTTP method (usually POST)
- Test with `curl` first

### Credential Errors

**401 Unauthorized**:
- Credential not configured in node
- Wrong API key (service role vs anon)
- Missing `apikey` header

**403 Forbidden**:
- Insufficient permissions
- Use service role key, not anon key

### Supabase Function Errors

**500 Internal Server Error**:
- Check function logs in Supabase Dashboard
- Verify function is deployed
- Test function directly with `curl`

### Mattermost Not Receiving

- Verify webhook URL is correct
- Check channel name matches
- Test webhook with `curl`:
  ```bash
  curl -X POST $MATTERMOST_WEBHOOK_URL \
    -d '{"text": "Test from n8n"}'
  ```

---

## Next Steps

- [Configure Mattermost Slash Command](MATTERMOST_CONFIG.md)
- [Review Credential Setup](CREDENTIALS.md)
- [Read Individual Workflow Docs](workflows/)

---

## Support

- **Documentation**: [`workflows/n8n/docs/`](../docs/)
- **GitHub**: [jgtolentino/opex](https://github.com/jgtolentino/opex)
- **Mattermost**: `#ops-automation`
