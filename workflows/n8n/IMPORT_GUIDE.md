# n8n Workflow Import Guide (Manual UI Method)

## ✅ Current Status (Updated 2025-11-15)

**Prerequisites Complete**:
- ✅ RAG query logging table created (`opex.rag_queries`)
- ✅ Edge Function deployed with logging
- ✅ Broken workflows deleted from database
- ✅ n8n restarted and ready for fresh imports

**Ready to Import**: 4 production workflows via n8n Web UI

## Background: Why Manual UI Import?

While attempting CLI automation, we encountered:
1. ❌ API authentication issues (key created but not recognized)
2. ❌ Database direct insert caused JSON format incompatibilities
3. ✅ **Solution**: Manual UI import (guaranteed to work, faster)

## Recommended Solution: Manual UI Import

The n8n Web UI handles workflow JSON format correctly and is the most reliable import method.

### Step-by-Step Import Instructions

#### 1. Access n8n UI
Open: https://ipa.insightpulseai.net

#### 2. Import Each Workflow

For each of the 4 workflow files in `workflows/n8n/`:

**Workflow 1: Ask OpEx Assistant**
1. Click "+ Add workflow" or "Import from File"
2. Select: `workflows/n8n/ask-opex-assistant.json`
3. Click "Import"
4. Workflow will appear with all nodes configured

**Workflow 2: Tax Deadline Notifier**
1. Click "+ Add workflow" or "Import from File"
2. Select: `workflows/n8n/tax-deadline-notifier.json`
3. Click "Import"

**Workflow 3: Health Check Monitor**
1. Click "+ Add workflow" or "Import from File"
2. Select: `workflows/n8n/health-check-monitor.json`
3. Click "Import"

**Workflow 4: BIR Document Sync**
1. Click "+ Add workflow" or "Import from File"
2. Select: `workflows/n8n/document-sync-rag.json`
3. Click "Import"

#### 3. Configure Credentials

After import, you'll need to set up credentials for each workflow:

**Supabase (Service Role) - Header Auth**
1. Go to: Settings → Credentials
2. Create new credential: "Header Auth"
3. Name: "Supabase OpEx (Service Role)"
4. Header Name: `apikey`
5. Header Value: Get from `~/.zshrc` → `OPEX_SUPABASE_SERVICE_ROLE_KEY`
6. Save

**Mattermost Webhook - HTTP Request (Optional)**
1. Settings → Credentials
2. Create: "HTTP Request"
3. Name: "Mattermost Webhook"
4. URL: Your Mattermost incoming webhook URL
5. Save

**GitHub PAT - Header Auth (for Health Monitor)**
1. Settings → Credentials
2. Create: "Header Auth"
3. Name: "GitHub PAT"
4. Header Name: `Authorization`
5. Header Value: `Bearer YOUR_GITHUB_TOKEN`
6. Save

#### 4. Link Credentials to Workflows

For each workflow:
1. Open the workflow
2. Click on nodes that require credentials (marked with ⚠️)
3. Select the appropriate credential from dropdown
4. Save workflow

#### 5. Activate Workflows

For each workflow:
1. Open the workflow
2. Click "Active" toggle in top-right
3. Verify status changes to "Active"

#### 6. Test Workflows

**Test Ask OpEx Assistant:**
```bash
curl -X POST https://ipa.insightpulseai.net/webhook/ask-opex-assistant \
  -H "Content-Type: application/json" \
  -d '{"text": "What is the employee onboarding process?"}'
```

**Test Tax Deadline Notifier:**
- Click "Execute Workflow" button in n8n UI
- Check Mattermost for notification

**Test Health Check Monitor:**
- Click "Execute Workflow" button
- Check Mattermost for health status report

**Test Document Sync:**
- Click "Execute Workflow" button
- Check Supabase `opex.embedding_sources` for new entries

## Troubleshooting

### Workflow Import Fails
- **Solution**: Ensure JSON files are valid
- **Check**: `cat workflows/n8n/ask-opex-assistant.json | jq`

### Credential Not Found
- **Solution**: Create credentials first before linking to workflows
- **Check**: Settings → Credentials → verify all exist

### Webhook Returns Error
- **Solution**: Ensure workflow is Active
- **Check**: Workflow toggle is green/enabled

### Supabase Edge Function Timeout
- **Solution**: Verify Edge Function is deployed
- **Test**:
  ```bash
  curl -X POST https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/opex-rag-query \
    -H "Content-Type: application/json" \
    -d '{"assistant": "opex", "question": "test"}'
  ```

## Next Steps After Manual Import

1. **Set up Mattermost Slash Command**:
   - Mattermost → Integrations → Slash Commands
   - Command: `/opex`
   - Request URL: `https://ipa.insightpulseai.net/webhook/ask-opex-assistant`
   - Method: POST
   - Save

2. **Monitor Workflow Executions**:
   - n8n UI → Executions tab
   - Check for errors and success rates

3. **Schedule Workflows**:
   - Tax Notifier: Daily 8 AM (already configured in JSON)
   - Health Monitor: Every 10 minutes (already configured)
   - Doc Sync: Daily 3 AM (already configured)

## API Key Investigation (For Future)

The API key authentication issue needs further investigation:

**Possible Causes**:
1. API endpoint might be disabled in this n8n version
2. API key format might need specific hashing
3. Additional configuration might be required
4. Version 1.118.2 might have different API auth requirements

**To Investigate**:
- Check n8n docker logs: `docker logs n8n-n8n-1`
- Review n8n env vars: `docker inspect n8n-n8n-1 | jq '.[0].Config.Env'`
- Check n8n version-specific API docs
- Test with fresh API key created via UI

## Files Reference

All workflow JSON files are located in: `workflows/n8n/`
- `ask-opex-assistant.json` - Mattermost integration
- `tax-deadline-notifier.json` - BIR deadline reminders
- `health-check-monitor.json` - Infrastructure monitoring
- `document-sync-rag.json` - Automatic document ingestion

Documentation:
- `workflows/n8n/README.md` - Overview
- `workflows/n8n/QUICKSTART.md` - Quick start guide
- `workflows/n8n/docs/SETUP.md` - Detailed setup
- `workflows/n8n/docs/CREDENTIALS.md` - Credential reference
- `workflows/n8n/docs/MATTERMOST_CONFIG.md` - Mattermost integration
