# Notion ↔ Tasks Sync Setup Guide

Complete setup guide for 4 n8n workflows that keep your Notion docs and task system in sync.

---

## Overview

These workflows automate the bi-directional sync between Notion documentation and your task management system (GitHub Issues, Jira, ClickUp, Asana, etc.).

### Workflows Included

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **1. Doc Created → Create Task** | Notion page added | Auto-create task when new doc is added |
| **2. Task Updated → Update Doc** | Webhook (task system) | Sync task status back to Notion doc |
| **3. Daily Docs Review Queue** | Cron (9 AM daily) | Find docs without tasks and create them |
| **4. Task Created → Generate Doc** | Webhook (task system) | Create spec page when task is labeled `spec-needed` |

---

## Prerequisites

### 1. Notion Setup

**Create Two Notion Databases:**

#### A. Docs Database

Create a Notion database with these properties:

| Property | Type | Description |
|----------|------|-------------|
| **Name** | Title | Document title |
| **Type** | Select | Options: Spec, SOP, PRD, Meeting Notes, Guide |
| **Status** | Select | Options: Draft, In Review, Completed, Archived, Needs Implementation |
| **Owner** | Person | Document owner |
| **Due Date** | Date | Optional deadline |
| **Task Link** | URL | Link to associated task |
| **Task ID** | Text | Task ID (for queries) |
| **Priority** | Select | Options: Low, Medium, High, Critical |
| **Summary** | Rich Text | Brief summary |
| **Created Time** | Created time | Auto-populated |
| **Last Synced** | Date | Last sync timestamp |
| **Auto-created** | Date | If created by automation |

#### B. Specs Database (Optional - for Workflow 4)

Create a separate database for auto-generated specs with same properties as above, plus:

| Property | Type | Description |
|----------|------|-------------|
| **Source Task** | URL | Link to originating task |
| **Created From** | Select | Options: Manual, Task (Auto), Template |

**Get Database IDs:**
```bash
# Open database in Notion
# URL format: https://notion.so/workspace/<DATABASE_ID>?v=...
# Copy the DATABASE_ID part (32-character hex string)
```

**Create Notion Integration:**
1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Name: "n8n Task Sync"
4. Select workspace
5. Copy **Internal Integration Token**
6. Share both databases with this integration:
   - Open database → Click "..." → Add connections → Select "n8n Task Sync"

---

### 2. Task System Setup

**Supported Systems:**
- **GitHub Issues** (recommended for dev teams)
- **Jira** (enterprise teams)
- **ClickUp** (flexible project management)
- **Asana** (simple task tracking)
- **Generic REST API** (custom systems)

**Required Task Properties:**
- Title/Summary
- Status (open, in progress, done, closed)
- Assignee(s)
- ID/Key
- URL
- Labels/Tags (optional but recommended)
- Custom fields for `notion_page_id` (optional)

---

### 3. n8n Credentials

**Create in n8n UI:**

1. **Notion API**
   - Settings → Credentials → Add Credential → Notion API
   - Paste Integration Token from Notion
   - Test connection
   - Save as "Notion API"

2. **Task System Credentials** (choose one)

   **GitHub:**
   - Settings → Credentials → GitHub → OAuth2 or Personal Access Token
   - Scopes needed: `repo`, `write:discussion`

   **Jira:**
   - Settings → Credentials → Jira Software
   - Use API token from Atlassian account settings

   **ClickUp:**
   - Settings → Credentials → ClickUp API
   - Generate API key from ClickUp settings

   **Generic HTTP:**
   - Settings → Credentials → Header Auth
   - Add `Authorization: Bearer YOUR_TOKEN`

3. **Mattermost/Rocket.Chat** (optional)
   - Settings → Credentials → HTTP Header Auth
   - Not needed if using generic webhook URL

---

## Installation

### Step 1: Import Workflows

```bash
# Navigate to repo
cd /home/user/opex/workflows/n8n/workflows

# List workflow files
ls -la *.json

# Import via n8n UI:
# 1. Open https://ipa.insightpulseai.net
# 2. Workflows → Import from File
# 3. Select each JSON file:
#    - 1-doc-created-create-task.json
#    - 2-task-updated-update-doc.json
#    - 3-daily-docs-review-queue.json
#    - 4-task-created-generate-doc.json
# 4. Click "Import"
```

### Step 2: Configure Each Workflow

**Workflow 1: Doc Created → Create Task**

1. Open workflow in n8n
2. Click "Watch Docs Database" node
3. Set **Database ID**: `YOUR_DOCS_DATABASE_ID_HERE`
4. Click "Create Task (Generic)" node
5. **Option A - GitHub:**
   - Replace HTTP node with "GitHub" node
   - Operation: Create Issue
   - Repository Owner: `your-org`
   - Repository Name: `your-repo`
   - Map fields:
     ```
     Title: {{ $json.task_title }}
     Body: {{ $json.task_description }}
     Assignees: [{{ $json.task_assignee }}]
     Labels: ["from-notion", "auto-generated"]
     ```

   **Option B - Jira:**
   - Replace HTTP node with "Jira" node
   - Operation: Create Issue
   - Project: Select your project
   - Issue Type: Task
   - Map fields similarly

   **Option C - ClickUp:**
   - Replace HTTP node with "ClickUp" node
   - Operation: Create Task
   - List ID: Your list ID
   - Map fields similarly

6. Click "Link Task to Doc" node
7. Verify property names match your Notion database
8. **Save** workflow
9. **Activate** (toggle in top-right)

**Workflow 2: Task Updated → Update Doc**

1. Open workflow
2. Click "Task System Webhook" node
3. Copy webhook URL (e.g., `https://ipa.insightpulseai.net/webhook/task-updated`)
4. Click "Find Doc by Task ID" node
5. Set **Database ID**: `YOUR_DOCS_DATABASE_ID_HERE`
6. Configure webhook in your task system:

   **GitHub:**
   ```bash
   # Settings → Webhooks → Add webhook
   Payload URL: https://ipa.insightpulseai.net/webhook/task-updated
   Content type: application/json
   Events: Issues (opened, edited, closed, reopened)
   ```

   **Jira:**
   ```bash
   # System → WebHooks → Create a WebHook
   URL: https://ipa.insightpulseai.net/webhook/task-updated
   Events: Issue (created, updated, deleted)
   ```

   **ClickUp:**
   ```bash
   # Settings → Webhooks → Create Webhook
   Endpoint: https://ipa.insightpulseai.net/webhook/task-updated
   Events: taskUpdated, taskStatusUpdated
   ```

7. **Save** and **Activate** workflow

**Workflow 3: Daily Docs Review Queue**

1. Open workflow
2. Click "Get Docs Missing Tasks" node
3. Set **Database ID**: `YOUR_DOCS_DATABASE_ID_HERE`
4. Adjust filter conditions if needed:
   - Default: `Task Link` is empty AND `Status` = "Needs Implementation"
   - You can add more filters (e.g., `Type` = "Spec")
5. Click "Create Task" node
6. Configure task system (same as Workflow 1)
7. Click "Daily Trigger (9 AM)" node
8. Adjust time/timezone if needed (default: 9 AM Asia/Manila)
9. **Save** and **Activate**

**Workflow 4: Task Created → Generate Doc**

1. Open workflow
2. Click "New Task Webhook" node
3. Copy webhook URL (e.g., `https://ipa.insightpulseai.net/webhook/task-created-generate-doc`)
4. Click "Create Spec Page in Notion" node
5. Set **Database ID**: `YOUR_SPECS_DATABASE_ID_HERE`
6. Configure webhook in task system:

   **GitHub:**
   ```bash
   # Same webhook as Workflow 2, but add event filter in workflow:
   # Events: Issues (opened with label 'spec-needed')
   ```

   **Filter in n8n:**
   - Click "Needs Doc?" node
   - Condition checks for label: `spec-needed`
   - Adjust if your labels are different

7. Click "Add Doc Link to Task" node
8. Configure API call to add comment/description (see examples below)
9. **Save** and **Activate**

---

## Task System Integration Examples

### GitHub Issues

**Replace HTTP nodes with GitHub nodes:**

**Create Issue:**
```json
{
  "node": "GitHub",
  "operation": "create",
  "resource": "issue",
  "owner": "your-org",
  "repository": "your-repo",
  "title": "={{ $json.task_title }}",
  "body": "={{ $json.task_description }}",
  "assignees": "={{ $json.task_assignee }}",
  "labels": ["from-notion", "auto"]
}
```

**Add Comment:**
```json
{
  "node": "GitHub",
  "operation": "createComment",
  "resource": "issue",
  "issueNumber": "={{ $json.task_id }}",
  "body": "📄 Spec: {{ $json.notion_url }}"
}
```

### Jira

**Create Issue:**
```json
{
  "node": "Jira Software",
  "operation": "create",
  "resource": "issue",
  "project": "YOUR_PROJECT_KEY",
  "issueType": "Task",
  "summary": "={{ $json.task_title }}",
  "description": "={{ $json.task_description }}",
  "assignee": "={{ $json.task_assignee }}"
}
```

### ClickUp

**Create Task:**
```json
{
  "node": "ClickUp",
  "operation": "create",
  "resource": "task",
  "list": "YOUR_LIST_ID",
  "name": "={{ $json.task_title }}",
  "description": "={{ $json.task_description }}",
  "assignees": "={{ $json.task_assignee }}",
  "tags": ["notion-sync"]
}
```

---

## Testing

### Test Workflow 1 (Doc Created → Create Task)

1. Create a new page in your Notion Docs database
2. Fill in:
   - Name: "Test Doc - Employee Onboarding"
   - Type: "Guide"
   - Status: "Draft"
   - Owner: Assign to yourself
3. Wait 30 seconds
4. Check n8n: Workflows → Executions → Should see successful run
5. Check task system: Should have new task titled same as doc
6. Check Notion: Doc should now have `Task Link` and `Task ID` filled

### Test Workflow 2 (Task Updated → Update Doc)

1. Find the task created in Test 1
2. Change status to "In Progress"
3. Wait 5 seconds
4. Check Notion: Doc status should change to "In Review"
5. Close the task
6. Check Notion: Doc status should change to "Completed"

### Test Workflow 3 (Daily Review Queue)

1. Create a new Notion page:
   - Name: "Unmapped Process Documentation"
   - Type: "SOP"
   - Status: "Needs Implementation"
   - Leave `Task Link` empty
2. Manually trigger workflow in n8n (click "Execute Workflow")
3. Check Mattermost: Should see summary message
4. Wait for execution to finish
5. Check task system: Should have new task "📄 Implement: Unmapped Process Documentation"
6. Check Notion: Page should now have `Task Link` populated

### Test Workflow 4 (Task Created → Generate Doc)

**GitHub:**
1. Create new issue with label `spec-needed`
2. Wait 10 seconds
3. Check Notion Specs database: Should have new page with issue title
4. Check GitHub issue: Should have comment with Notion link

**Other systems:**
1. Create task via API with label/tag for spec generation
2. Or manually test webhook:
   ```bash
   curl -X POST https://ipa.insightpulseai.net/webhook/task-created-generate-doc \
     -H "Content-Type: application/json" \
     -d '{
       "id": "TEST-123",
       "title": "New Feature: Dark Mode",
       "url": "https://your-system.com/tasks/TEST-123",
       "labels": [{"name": "spec-needed"}],
       "assignee": {"name": "Jake"}
     }'
   ```
3. Check Notion: Should create spec page

---

## Customization

### Adjust Status Mappings

**In Workflow 2 (Task → Doc):**

Edit "Map Task → Doc Status" node:

```javascript
const statusMap = {
  // Task status → Notion status
  'open': 'Draft',
  'todo': 'Draft',
  'in_progress': 'In Review',
  'in progress': 'In Review',
  'review': 'In Review',
  'done': 'Completed',
  'closed': 'Completed',
  'completed': 'Completed',
  'archived': 'Archived',

  // Add your custom mappings:
  'blocked': 'On Hold',
  'cancelled': 'Cancelled'
};
```

### Change Cron Schedule

**Workflow 3 (Daily Review):**

Click "Daily Trigger (9 AM)" node:
```json
{
  "hour": 9,      // Change to desired hour (0-23)
  "minute": 0,    // Change to desired minute (0-59)
  "timezone": "Asia/Manila"  // Change to your timezone
}
```

### Add Custom Notion Properties

**In "Link Task to Doc" nodes:**

```json
{
  "propertiesUi": {
    "propertyValues": [
      // ... existing properties ...
      {
        "key": "Custom Field",
        "textContent": "={{ $json.custom_value }}"
      },
      {
        "key": "Priority",
        "selectValue": "={{ $json.priority }}"
      }
    ]
  }
}
```

### Filter by Doc Type

**In Workflow 3 (Daily Review):**

Add filter in "Get Docs Missing Tasks" node:
```json
{
  "filters": {
    "conditions": [
      {
        "key": "Task Link",
        "condition": "isEmpty"
      },
      {
        "key": "Status",
        "condition": "equals",
        "value": "Needs Implementation"
      },
      {
        "key": "Type",
        "condition": "equals",
        "value": "Spec"  // Only process Specs
      }
    ]
  }
}
```

---

## Troubleshooting

### Workflow 1 Not Triggering

**Issue:** New Notion pages don't create tasks

**Checks:**
1. Is workflow activated? (toggle in top-right)
2. Is Notion database shared with integration?
   - Open database → "..." → Connections → Should see "n8n Task Sync"
3. Check n8n execution logs: Workflows → Executions → Filter by workflow
4. Test Notion API credential: Settings → Credentials → Notion API → Test
5. Database ID correct? Copy from Notion URL

**Fix:**
- Re-share database with Notion integration
- Re-import workflow with correct database ID

### Workflow 2 Not Updating Docs

**Issue:** Task status changes don't sync to Notion

**Checks:**
1. Webhook configured in task system?
   - GitHub: Settings → Webhooks → Should see webhook with ✅
   - Check recent deliveries for errors
2. Webhook URL correct?
   - Copy from n8n workflow node
   - Should be `https://your-n8n.com/webhook/task-updated`
3. Payload includes `notion_page_id` or `Task ID`?
   - Check webhook delivery payload in task system
   - If missing, workflow will try to search by Task ID
4. Task ID matches Notion property?
   - GitHub uses numeric ID (e.g., `123`)
   - Jira uses key (e.g., `PROJ-123`)
   - ClickUp uses UUID

**Fix:**
- Test webhook manually:
  ```bash
  curl -X POST https://ipa.insightpulseai.net/webhook/task-updated \
    -H "Content-Type: application/json" \
    -d '{
      "id": "123",
      "status": "closed",
      "metadata": {"notion_page_id": "abc123..."}
    }'
  ```
- Check n8n execution log for errors

### Workflow 3 Creates Duplicate Tasks

**Issue:** Daily review creates tasks for docs that already have them

**Checks:**
1. Filter condition checking `Task Link` is empty?
2. Previous runs completed successfully?
   - Check if "Link Task to Doc" node ran
3. Rate limiting causing failures?
   - Increase wait time between batches

**Fix:**
- Add filter: `Task Link` → `isEmpty`
- Check task creation succeeded before updating doc
- Add error handling branch

### Workflow 4 Not Creating Docs

**Issue:** Tasks with `spec-needed` label don't create Notion pages

**Checks:**
1. Webhook firing for correct events?
   - GitHub: "issues" event enabled?
   - Check webhook delivery logs
2. Label name matches condition?
   - GitHub: `spec-needed` (exact match)
   - Check "Needs Doc?" node condition
3. Specs database ID correct?
4. Notion integration has write access to Specs database?

**Fix:**
- Test webhook manually with payload:
  ```bash
  curl -X POST https://ipa.insightpulseai.net/webhook/task-created-generate-doc \
    -H "Content-Type: application/json" \
    -d '{
      "id": "999",
      "title": "Test Spec Generation",
      "html_url": "https://github.com/org/repo/issues/999",
      "labels": [{"name": "spec-needed"}],
      "assignee": {"name": "Test User"}
    }'
  ```

### Generic n8n Debugging

**Check Execution Logs:**
1. Workflows → Executions
2. Click failed execution
3. Review each node's input/output
4. Look for error messages in red nodes

**Test Credentials:**
1. Settings → Credentials
2. Click credential name
3. Click "Test" button
4. Should see "Connection tested successfully"

**Webhook Testing:**
1. Copy webhook URL from node
2. Use `curl` to send test payload
3. Check n8n execution log immediately
4. Verify webhook received and processed

**Common Errors:**
- `ENOTFOUND`: Wrong URL or hostname
- `401 Unauthorized`: Invalid API key/token
- `404 Not Found`: Wrong database/resource ID
- `422 Unprocessable Entity`: Invalid payload structure
- `429 Too Many Requests`: Rate limited (add wait nodes)

---

## Monitoring & Analytics

### Query Sync Activity

**Notion Database Views:**

Create filtered views to monitor sync:

1. **Recently Synced Docs**
   - Filter: `Last Synced` within last 7 days
   - Sort: `Last Synced` descending

2. **Auto-Created Tasks**
   - Filter: `Auto-created` is not empty
   - Group: Status

3. **Docs Missing Tasks**
   - Filter: `Task Link` is empty
   - Filter: `Status` = "Needs Implementation"

### n8n Execution Analytics

**View Success Rates:**
```bash
# In n8n UI:
# Workflows → Executions → Filter by workflow
# Chart shows success/error rate over time
```

**Failed Executions:**
- Click "Error" filter
- Review error messages
- Common fixes:
  - Re-test credentials
  - Check API rate limits
  - Verify database IDs

### Mattermost Reports

**Add Summary Notifications:**

In Workflow 3 (Daily Review), the "Post Summary to Mattermost" node shows:
```
📋 Daily Review Queue: 3 docs need tasks

- [Employee Onboarding SOP](https://notion.so/...) - Owner: Jake
- [Month-End Close Process](https://notion.so/...) - Owner: Finance Team
- [API Integration Spec](https://notion.so/...) - Owner: Unassigned
```

Customize message format in node's "text" parameter.

---

## Advanced Configurations

### Correlation IDs (End-to-End Tracking)

Add correlation IDs to trace sync across all workflows:

**In Workflow 1 (Doc → Task):**
```javascript
// In "Map to Task Fields" node, add:
{
  "name": "correlation_id",
  "value": "={{ $now.toFormat('yyyyMMdd') }}-{{ $json.id.substring(0,8) }}"
}
```

**In Workflow 2 (Task → Doc):**
```javascript
// Store correlation_id from task in Notion:
{
  "key": "Correlation ID",
  "textContent": "={{ $json.metadata?.correlation_id || '' }}"
}
```

Now you can trace: Doc creation → Task creation → Task updates → Doc updates

### Error Handling & Retries

**Add Error Branch:**

1. In any HTTP/API node, click "On Error" → "Continue"
2. Add "If" node after to check for errors
3. Branch to retry logic or notification

**Example Retry Pattern:**
```json
{
  "node": "HTTP Request",
  "continueOnFail": true
}
→ If (has error)
  → Wait (2 seconds)
  → HTTP Request (retry)
  → If (still error)
    → Mattermost (notify failure)
```

### Batch Processing Limits

**Prevent API Rate Limiting:**

In Workflow 3 (Daily Review):
- Adjust "Process in Batches" → `batchSize`: 5
- Adjust "Wait (Rate Limiting)" → `amount`: 2 seconds
- Max throughput: 2.5 docs/second

**For GitHub (5000 requests/hour):**
- Batch size: 10
- Wait: 1 second
- = 36 tasks/minute = safe margin

### Multi-Workspace Support

**Run same workflows for multiple Notion workspaces:**

1. Duplicate workflow
2. Rename: "Workflow 1 - Team A", "Workflow 1 - Team B"
3. Create separate credentials for each workspace
4. Update database IDs in each workflow
5. Activate all

---

## Security Best Practices

### Webhook Authentication

**Add Secret Token Validation:**

1. In webhook trigger node, click "Options" → "Hmac Validation"
2. Generate secret: `openssl rand -hex 32`
3. Configure in task system:
   - GitHub: Settings → Webhooks → Secret (copy from n8n)
   - Validates payload signature

**Alternative: Query Parameter Token:**

1. Webhook URL: `https://n8n.com/webhook/task-updated?token=SECRET`
2. In workflow, add "If" node after webhook:
   ```javascript
   {{ $json.query.token === 'YOUR_SECRET_TOKEN' }}
   ```
3. If false → Send 403 response

### Credential Rotation

**Rotate API Keys Regularly:**

1. Generate new Notion integration token
2. Update in n8n: Settings → Credentials → Notion API → Edit
3. Test all workflows
4. Revoke old token in Notion

**Rotate Task System Tokens:**
- GitHub: Settings → Developer settings → Personal access tokens → Regenerate
- Update in n8n credentials

### Least Privilege Access

**Notion Integration:**
- Only share specific databases (not entire workspace)
- Use separate integration per workflow set if needed

**Task System:**
- GitHub: Limit scopes to `repo` only (not `admin`)
- Jira: Use project-level API token (not admin)

---

## Migration & Rollback

### Migrating Existing Docs/Tasks

**If you have existing docs and tasks to link:**

1. Export Notion database to CSV
2. Export tasks to CSV
3. Create mapping sheet:
   ```csv
   notion_page_id,task_id,task_url
   abc123,PROJ-456,https://...
   def456,PROJ-789,https://...
   ```
4. Use n8n workflow to bulk-update:
   - Read CSV node
   - Loop over rows
   - Update Notion page with Task Link/ID
   - Update task with Notion URL (in comment/description)

**Bulk Update Workflow (one-time):**
```
CSV File → Split In Batches → Set (parse row)
  → Notion: Update Page (set Task Link)
  → Task API: Add Comment (with Notion URL)
```

### Disabling Sync

**To stop syncing:**

1. Deactivate all 4 workflows in n8n
2. Data remains intact in both systems
3. Manual changes won't propagate

**To resume:**
- Reactivate workflows
- No data loss (picks up new changes going forward)

### Rollback Plan

**If sync causes issues:**

1. **Immediate:** Deactivate workflows
2. **Identify:** Check n8n execution logs for bad runs
3. **Revert:** Use Notion page history:
   - Page → "..." → Page history → Select version → Restore
4. **Fix:** Correct workflow configuration
5. **Test:** Use manual execution before reactivating
6. **Resume:** Reactivate workflows

---

## Cost Optimization

### n8n Workflow Executions

**Estimated Usage:**
- Workflow 1 (Doc → Task): ~10 runs/day = 300/month
- Workflow 2 (Task → Doc): ~50 runs/day = 1,500/month
- Workflow 3 (Daily Review): 1 run/day = 30/month
- Workflow 4 (Task → Doc): ~5 runs/day = 150/month
- **Total: ~2,000 executions/month**

**n8n Cloud Pricing:**
- Starter: 2,500 executions/month = $20/month
- Pro: 10,000 executions/month = $50/month

**Self-Hosted (Free):**
- Host on DigitalOcean ($12/month)
- Unlimited executions
- Requires server maintenance

### Notion API Rate Limits

**Limits:**
- 3 requests/second per integration
- Workflows respect this with wait nodes

**Optimizations:**
- Batch operations where possible
- Cache reads (avoid re-fetching same page)
- Use Notion database queries instead of page-by-page reads

### Task System API Limits

**GitHub:**
- 5,000 requests/hour (authenticated)
- Workflows well below limit

**Jira:**
- 10 requests/second (Cloud)
- Add wait nodes if hitting limits

**ClickUp:**
- 100 requests/minute
- Workflows respect this

---

## Support & Community

**Documentation:**
- n8n Notion node: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.notion/
- n8n webhook: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/

**Get Help:**
- n8n Community: https://community.n8n.io/
- OpEx Repo Issues: https://github.com/jgtolentino/opex/issues
- Mattermost: #ops-automation channel

**Contribute:**
- Share workflow improvements via PR
- Report bugs in GitHub issues
- Add new integrations (Linear, Notion, etc.)

---

## Changelog

### v1.0.0 (2025-01-16)
- Initial release
- 4 core workflows
- Support for GitHub, Jira, ClickUp
- Notion database sync
- Mattermost notifications

---

**Next Steps:**
1. Complete prerequisites (Notion databases, credentials)
2. Import workflows to n8n
3. Configure database IDs and task system integration
4. Test each workflow with dummy data
5. Activate workflows
6. Monitor for 1 week
7. Adjust filters/mappings as needed

Good luck! 🚀
