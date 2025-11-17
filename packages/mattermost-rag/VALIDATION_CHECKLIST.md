# Mattermost RAG Integration - Validation Checklist

Complete step-by-step validation to ensure everything works end-to-end.

## ✅ 1. Repository & Scripts Sanity Check

### File Structure Verification
```bash
cd packages/mattermost-rag

# Check main structure
ls -la
# ✅ README.md
# ✅ CLI_WEBHOOK_SETUP.md
# ✅ webhook-setup.md
# ✅ scripts/
# ✅ n8n-workflows/
# ✅ data/

# Check scripts
ls -la scripts/
# ✅ setup-webhooks.sh (executable)
# ✅ setup-complete-stack.sh (executable)
# ✅ update-notion-month-end.js
# ✅ package.json

# Check n8n workflows
ls -la n8n-workflows/
# ✅ mattermost-rag-router.json

# Check data files
ls -la data/
# ✅ month_end_closing_tasks_oct_2025.csv
# ✅ tbwa_finance_team_directory.csv
```

### Script Permissions
```bash
cd scripts
chmod +x setup-webhooks.sh setup-complete-stack.sh
ls -la *.sh
# ✅ Both scripts should be executable
```

### Package.json Check
```bash
cat package.json
# ✅ Should contain "update" script
# ✅ Should have @notionhq/client dependency
```

## ✅ 2. Mattermost Setup Validation

### Environment Variables
```bash
# Check required env vars are set
echo $MM_BASE_URL
echo $MM_ADMIN_TOKEN
echo $MM_TEAM_NAME
# ✅ All should have values
```

### Run CLI Setup
```bash
# Webhook-only setup
./setup-webhooks.sh setup
# ✅ Should create bot, channels, webhooks, slash commands

# Complete stack setup
./setup-complete-stack.sh setup
# ✅ Should deploy Supabase functions and set secrets
```

### Mattermost Verification
```bash
# Check bot exists
mmctl bot list | grep ragbot
# ✅ Should show ragbot

# Check channel exists
mmctl channel list $MM_TEAM_NAME | grep ask-ai
# ✅ Should show ask-ai channel

# Check slash commands via API
curl -s -H "Authorization: Bearer $MM_ADMIN_TOKEN" \
  "$MM_BASE_URL/api/v4/commands" | jq '.[] | select(.trigger=="ask" or .trigger=="feedback")'
# ✅ Should show both /ask and /feedback commands with same n8n URL
```

## ✅ 3. n8n Workflow Validation

### Import Workflow
1. **Go to n8n UI** → Workflows → Import
2. **Upload**: `n8n-workflows/mattermost-rag-router.json`
3. **Activate** the workflow
4. **Check environment variables** in n8n:
   - ✅ `SUPABASE_FUNCTION_OPEX_RAG_QUERY`
   - ✅ `SUPABASE_FUNCTION_RAG_FEEDBACK`
   - ✅ `SUPABASE_ANON_KEY`

### Test Webhook Endpoints
```bash
# Test /ask endpoint
curl -X POST "https://n8n.yourdomain.com/webhook/mattermost-rag-router" \
  -d "command=/ask&text=Test%20query&user_name=jake&user_id=123&channel_id=abc"

# Expected response:
# {
#   "response_type": "in_channel",
#   "text": "..."
# }

# Test /feedback endpoint
curl -X POST "https://n8n.yourdomain.com/webhook/mattermost-rag-router" \
  -d "command=/feedback&text=test-id%205%20Great%20answer&user_name=jake&user_id=123"

# Expected response:
# {
#   "response_type": "ephemeral",
#   "text": "Thanks! Feedback saved for query test-id with rating 5"
# }
```

## ✅ 4. Supabase Edge Functions Validation

### Function Deployment Check
```bash
supabase functions list --project-ref $SUPABASE_PROJECT_REF
# ✅ opex-rag-query
# ✅ rag-feedback
# ✅ alert-notifier
```

### Secrets Verification
```bash
supabase secrets list --project-ref $SUPABASE_PROJECT_REF
# ✅ OPENAI_API_KEY
# ✅ SUPABASE_URL (or OPEX_SUPABASE_URL)
# ✅ SUPABASE_SERVICE_ROLE_KEY (or OPEX_SUPABASE_SERVICE_ROLE_KEY)
```

### Direct Function Tests
```bash
# Test RAG query function
supabase functions invoke opex-rag-query \
  --project-ref $SUPABASE_PROJECT_REF \
  --no-verify-jwt \
  --body '{
    "user_id": "test-user",
    "query_text": "How do I process expense reports?",
    "metadata": { "source": "cli-smoke-test" }
  }'
# ✅ HTTP 200 with JSON response

# Test feedback function
supabase functions invoke rag-feedback \
  --project-ref $SUPABASE_PROJECT_REF \
  --no-verify-jwt \
  --body '{
    "queryId": "00000000-0000-0000-0000-000000000000",
    "rating": 5,
    "feedback": "Smoke test feedback",
    "evaluationMetadata": { "source": "cli-smoke-test" }
  }'
# ✅ HTTP 200 with success response
```

## ✅ 5. Notion Month-End Update Validation

### Dependencies Installation
```bash
cd packages/mattermost-rag/scripts
npm install
# ✅ Should install @notionhq/client
```

### Environment Setup
```bash
# Set required env vars
export NOTION_API_KEY=your_integration_token
export NOTION_PAGE_ID=7bf32e6a056948f687f55bdff1dd0931
```

### Run Update Script
```bash
npm run update
# ✅ Should update page title to "Month-End Closing Tasks - November 2025"
# ✅ Should add November-specific tasks
# ✅ Should print success message with page URL
```

### Manual Verification in Notion
1. **Open the updated page**
2. **Check title**: Should be "Month-End Closing Tasks - November 2025"
3. **Check tasks**: Should see 10 November-specific tasks
4. **Check properties**: Month, Year, Status should be updated

## ✅ 6. End-to-End Mattermost Tests

### Test /ask Command
In Mattermost `#ask-ai` channel:
```text
/ask How do I process expense reports?
```
**Expected Results:**
- ✅ RAG answer appears in channel
- ✅ Response includes a Query ID
- ✅ Answer references month-end closing tasks

### Test /feedback Command
Using the Query ID from above:
```text
/feedback <query_id> 5 Great answer!
```
**Expected Results:**
- ✅ Ephemeral "feedback saved" message appears
- ✅ Feedback recorded in Supabase (check `rag-feedback` logs)

### Test Natural Language Queries
```text
@opex What's RIM responsible for between Oct 29-31?
@rag List all Phase II tasks with CKVC
```
**Expected Results:**
- ✅ Bot responds with relevant task information
- ✅ Answers reference team codes and due dates

## ✅ 7. Data Integration Validation

### CSV Data Verification
```bash
# Check month-end tasks data
head -5 data/month_end_closing_tasks_oct_2025.csv
# ✅ Should show October 2025 tasks with team codes

# Check team directory
head -5 data/tbwa_finance_team_directory.csv
# ✅ Should show team members with codes and emails
```

### RAG Query Testing
Test queries that should use the CSV data:
```text
/ask What are the VAT filing deadlines for October?
/ask Who is responsible for WIP reconciliation?
/ask Show me all tasks for CKVC in Phase II
```

**Expected Results:**
- ✅ Answers should reference specific tasks from CSV data
- ✅ Should include team member names from directory
- ✅ Should show due dates and phases

## ✅ 8. Automation & Cron Validation

### Check Cron Setup (if configured)
```bash
crontab -l
# ✅ Should show monthly Notion update job
# ✅ Should have correct paths and environment variables
```

### Test Automation Script
```bash
# Manual test of the automation
cd packages/mattermost-rag/scripts
NOTION_API_KEY=your_token npm run update
# ✅ Should run without errors
# ✅ Should update Notion page successfully
```

## 🚨 Troubleshooting Common Issues

### Mattermost Issues
- **Bot not responding**: Check bot token and permissions
- **Slash commands not working**: Verify n8n webhook URL is correct
- **Channel not found**: Ensure team name is correct

### n8n Issues
- **Workflow not activating**: Check environment variables
- **Webhook not responding**: Verify n8n is running and accessible
- **HTTP request failures**: Check Supabase function URLs and API keys

### Supabase Issues
- **Function not found**: Redeploy functions with correct project ref
- **RPC errors**: Check database schema and RPC function definitions
- **Secret not set**: Use `supabase secrets set` to configure

### Notion Issues
- **API token invalid**: Regenerate integration token
- **Page not found**: Check page ID and integration permissions
- **Rate limiting**: Wait and retry

## 📊 Success Metrics

When all checks pass:
- ✅ Mattermost bot responds to `/ask` and `/feedback`
- ✅ n8n routes commands to correct Supabase functions
- ✅ Supabase functions return valid responses
- ✅ Notion page updates automatically
- ✅ RAG queries use month-end task data
- ✅ End-to-end workflow functions without manual intervention

## 🔄 Continuous Validation

Set up monitoring:
- **Weekly**: Test Mattermost commands
- **Monthly**: Verify Notion auto-update
- **Quarterly**: Full validation checklist run
- **On changes**: Test affected components

---

**Status**: Complete validation ensures your Mattermost RAG integration is production-ready and fully operational.
