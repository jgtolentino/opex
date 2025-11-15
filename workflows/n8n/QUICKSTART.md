# n8n Workflow Quick Start Guide

## Prerequisites Checklist

Before running the automated setup, ensure you have:

- [ ] n8n API Key (created via web UI)
- [ ] Supabase Service Role Key
- [ ] Supabase Project URL
- [ ] Mattermost Webhook URL (optional but recommended)

## Step 1: Create n8n API Key

1. **Access n8n**: Open https://ipa.insightpulseai.net
2. **Navigate to Settings**: Click your user icon → Settings
3. **API Section**: Go to "API" tab
4. **Create Key**: Click "Create API Key"
5. **Copy Key**: Copy the generated key immediately (it won't be shown again)

## Step 2: Set Environment Variables

Add to your `~/.zshrc`:

```bash
# n8n API Key (Created: YYYY-MM-DD)
export N8N_API_KEY="your-api-key-here"

# OpEx Supabase Project (if not already set)
export OPEX_SUPABASE_URL="https://ublqmilcjtpnflofprkr.supabase.co"
export OPEX_SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Mattermost Webhook (optional)
export MATTERMOST_WEBHOOK_URL="https://your-mattermost.com/hooks/xxx"
```

Then reload:
```bash
source ~/.zshrc
```

## Step 3: Run Automated Setup

```bash
# Make script executable (if not already done)
chmod +x scripts/setup-n8n-workflows.sh

# Run the setup script
./scripts/setup-n8n-workflows.sh
```

The script will:
- ✅ Validate all credentials
- ✅ Create Supabase credentials in n8n
- ✅ Create Mattermost credentials in n8n (if webhook provided)
- ✅ Import all 4 workflows
- ✅ Provide activation instructions

## Step 4: Manual Activation (via n8n UI)

After import, you'll need to activate workflows manually:

1. Open https://ipa.insightpulseai.net
2. Click on each workflow
3. Click "Activate" toggle in top-right corner
4. Verify credentials are properly linked

## Step 5: Set Up Mattermost Slash Command

### Option A: Via Mattermost UI
1. Go to Mattermost → Integrations → Slash Commands
2. Create command: `/opex`
3. Request URL: `https://ipa.insightpulseai.net/webhook/ask-opex-assistant`
4. Request Method: `POST`
5. Save

### Option B: Via API (if Mattermost token available)
```bash
# Set Mattermost admin token
export MATTERMOST_TOKEN="your-admin-token"

# Create slash command via API
curl -X POST https://your-mattermost.com/api/v4/commands \
  -H "Authorization: Bearer $MATTERMOST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "team_id": "your-team-id",
    "trigger": "opex",
    "url": "https://ipa.insightpulseai.net/webhook/ask-opex-assistant",
    "method": "POST",
    "username": "OpEx Assistant",
    "icon_url": "https://your-icon-url.com/icon.png",
    "auto_complete": true,
    "auto_complete_desc": "Ask OpEx Assistant about HR, Finance, or Tax questions",
    "auto_complete_hint": "What is the onboarding process?"
  }'
```

## Step 6: Test the Integration

### Test Ask OpEx Assistant
```bash
# Direct webhook test
curl -X POST https://ipa.insightpulseai.net/webhook/ask-opex-assistant \
  -H "Content-Type: application/json" \
  -d '{"text": "What is the employee requisition process?"}'
```

### Test in Mattermost
```
/opex What is the onboarding process?
```

## Troubleshooting

### "API Key Required" Error
- Verify `N8N_API_KEY` is set: `echo $N8N_API_KEY`
- Regenerate key if expired: Settings → API → Create New Key

### "Workflow Import Failed"
- Check workflow JSON syntax: `cat workflows/n8n/ask-opex-assistant.json | jq`
- Verify n8n API endpoint: `curl https://ipa.insightpulseai.net/api/v1/workflows`

### "Credential Not Found"
- Ensure credentials created before workflow import
- Check credential names match workflow references
- Re-run setup script: `./scripts/setup-n8n-workflows.sh`

### "Supabase Edge Function Error"
- Verify Edge Function deployed: https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/opex-rag-query
- Check service role key permissions
- Test Edge Function directly:
  ```bash
  curl -X POST https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/opex-rag-query \
    -H "Content-Type: application/json" \
    -d '{"assistant": "opex", "question": "What is the onboarding process?"}'
  ```

## Next Steps After Setup

1. **Test all 4 workflows**:
   - Ask OpEx Assistant (webhook test)
   - Tax Deadline Notifier (manual trigger in n8n)
   - Health Check Monitor (wait 10 minutes or manual trigger)
   - Document Sync RAG (wait for 3 AM or manual trigger)

2. **Monitor workflow executions**:
   - n8n UI → Executions tab
   - Check for errors and success rates

3. **Configure notification channels**:
   - Update Mattermost channels in workflows
   - Set up email notifications if needed

4. **Review documentation**:
   - `workflows/n8n/README.md` - Overview
   - `workflows/n8n/docs/SETUP.md` - Detailed setup
   - `workflows/n8n/docs/MATTERMOST_CONFIG.md` - Mattermost integration
   - `workflows/n8n/docs/CREDENTIALS.md` - Credential reference

## Support

- **Repository**: workflows/n8n/
- **Documentation**: /workflows page on OpEx Portal
- **n8n Instance**: https://ipa.insightpulseai.net
- **Issues**: Create GitHub issue for bugs or feature requests
