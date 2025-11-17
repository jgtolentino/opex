# Mattermost Webhook CLI Setup Guide

## Quick Setup via CLI

### Prerequisites
1. **Mattermost Admin Token** - Get from System Console > User Management > Personal Access Tokens
2. **curl** and **jq** installed on your system

### Step 1: Set Admin Token
```bash
export MM_ADMIN_TOKEN=your_mattermost_admin_token_here
```

### Step 2: Run the Setup Script
```bash
cd packages/mattermost-rag/scripts
./setup-webhooks.sh setup
```

### Alternative: One-liner Setup
```bash
MM_ADMIN_TOKEN=your_token_here ./packages/mattermost-rag/scripts/setup-webhooks.sh setup
```

## What the CLI Script Does

### Automatic Steps:
1. ✅ **Creates channels**:
   - `#opex-rag-alerts` for notifications
   - `#general` for queries (uses existing)

2. ✅ **Creates webhooks**:
   - **Incoming Webhook**: For sending notifications to Mattermost
   - **Outgoing Webhook**: For processing natural language queries

3. ✅ **Updates environment files**:
   - Adds `MM_INCOMING_WEBHOOK_URL` to `.env`
   - Adds `MM_OUTGOING_WEBHOOK_TOKEN` to `.env`
   - Updates `.env.example` with new variables

4. ✅ **Tests webhooks**:
   - Sends test message to verify incoming webhook works

## CLI Commands

### Setup Webhooks
```bash
./setup-webhooks.sh setup
```

### Test Existing Webhooks
```bash
./setup-webhooks.sh test
```

### Show Help
```bash
./setup-webhooks.sh help
```

## Environment Variables

The script uses these environment variables:
```bash
MM_SITE_URL=https://chat.insightpulseai.net  # Your Mattermost instance
MM_ADMIN_TOKEN=your_admin_token_here         # Required for API access
```

## Expected Output

When successful, you'll see:
```
[INFO] Starting Mattermost webhook setup...
[SUCCESS] Channel created: opex-rag-alerts (ID: abc123...)
[SUCCESS] Incoming webhook created (ID: xyz789...)
[SUCCESS] Outgoing webhook created (ID: def456...)
[SUCCESS] Environment files updated
[SUCCESS] Incoming webhook test passed
[SUCCESS] Mattermost webhook setup completed!

Setup Summary:
  - Incoming Webhook URL: https://chat.insightpulseai.net/hooks/xxx
  - Outgoing Webhook Token: your_outgoing_token
  - Environment files updated
```

## Manual Verification

After running the script, verify in Mattermost:

1. **Check channels**: `#opex-rag-alerts` should exist
2. **Check webhooks**: Go to System Console > Integrations
3. **Test natural language**: Try `@opex how do I process expenses?`

## Troubleshooting

### Common Issues:

**Permission denied:**
```bash
chmod +x packages/mattermost-rag/scripts/setup-webhooks.sh
```

**Missing dependencies:**
```bash
# On macOS
brew install curl jq

# On Ubuntu/Debian
sudo apt-get install curl jq
```

**Invalid token:**
- Regenerate admin token in Mattermost
- Ensure token has proper permissions

**Channel already exists:**
- Script handles this gracefully and uses existing channels

## Next Steps After Setup

1. **Deploy updated RAG service** with new webhook endpoints
2. **Test natural language queries** in Mattermost:
   - `@opex what are the BIR deadlines?`
   - `@rag how do I process expense reports?`
   - `ask about month-end close procedures`

3. **Monitor webhook performance** in Mattermost logs

## Security Notes

- Keep `MM_ADMIN_TOKEN` secure
- Webhook tokens are stored in `.env` file
- Consider rotating tokens periodically
- Monitor webhook usage for suspicious activity
