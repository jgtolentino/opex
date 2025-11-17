# Notion ↔ Tasks Sync - Quick Reference

## One-Page Cheat Sheet

### Prerequisites Checklist

- [ ] Notion database created (with properties: Name, Type, Status, Owner, Task Link, Task ID)
- [ ] Notion integration created and shared with database
- [ ] Task system credentials configured (GitHub/Jira/ClickUp)
- [ ] n8n credentials added (Notion API + Task System)
- [ ] Mattermost webhook URL (optional)

### Database IDs

**Find your Notion database ID:**
```
URL: https://notion.so/workspace/<DATABASE_ID>?v=...
                                 ^^^^^^^^^^^^^^^^
                                 Copy this part (32 chars)
```

**Replace in workflows:**
- `YOUR_DOCS_DATABASE_ID_HERE` → Your Docs database ID
- `YOUR_SPECS_DATABASE_ID_HERE` → Your Specs database ID (Workflow 4)
- `YOUR_TASK_SYSTEM_API_URL` → Your task API endpoint

### Quick Setup (5 Minutes)

```bash
# 1. Import workflows
# Open n8n UI → Workflows → Import from File → Select all 4 JSON files

# 2. Update database IDs in each workflow
# Search and replace: YOUR_DOCS_DATABASE_ID_HERE → abc123...

# 3. Configure task system
# Option A: Replace HTTP nodes with GitHub/Jira/ClickUp nodes
# Option B: Update HTTP URLs to your task API endpoint

# 4. Test each workflow
# Workflow 1: Create Notion page → Check task created
# Workflow 2: Update task → Check Notion updated
# Workflow 3: Manual execute → Check tasks created
# Workflow 4: Create task with label → Check Notion page created

# 5. Activate all workflows
# Click toggle in top-right of each workflow
```

### Node Replacement Guide

**GitHub (Recommended for Dev Teams)**

| Generic Node | GitHub Node | Operation |
|--------------|-------------|-----------|
| HTTP Create Task | GitHub → Create Issue | `title`, `body`, `assignees`, `labels` |
| HTTP Add Comment | GitHub → Create Comment | `issueNumber`, `body` |
| Webhook | GitHub Trigger | Events: `issues` (opened, edited, closed) |

**Jira (Enterprise Teams)**

| Generic Node | Jira Node | Operation |
|--------------|-----------|-----------|
| HTTP Create Task | Jira → Create Issue | `project`, `issueType`, `summary`, `description` |
| HTTP Add Comment | Jira → Add Comment | `issueKey`, `comment` |
| Webhook | Jira Trigger | Events: `jira:issue_created`, `jira:issue_updated` |

**ClickUp (Flexible PM)**

| Generic Node | ClickUp Node | Operation |
|--------------|-------------|-----------|
| HTTP Create Task | ClickUp → Create Task | `list`, `name`, `description`, `assignees` |
| HTTP Add Comment | ClickUp → Create Comment | `taskId`, `commentText` |
| Webhook | Webhook | Configure in ClickUp: Settings → Webhooks |

### Webhook URLs

**Copy from n8n workflows:**

| Workflow | Webhook Path | Configure In |
|----------|--------------|--------------|
| Workflow 2 | `/webhook/task-updated` | Task system webhooks |
| Workflow 4 | `/webhook/task-created-generate-doc` | Task system webhooks |

**Full URL format:**
```
https://ipa.insightpulseai.net/webhook/<path>
```

**GitHub Webhook Setup:**
```bash
# Repository → Settings → Webhooks → Add webhook
Payload URL: https://ipa.insightpulseai.net/webhook/task-updated
Content type: application/json
Events: ☑ Issues
```

**Jira Webhook Setup:**
```bash
# System → WebHooks → Create a WebHook
URL: https://ipa.insightpulseai.net/webhook/task-updated
Events: ☑ Issue (created, updated, deleted)
```

### Status Mapping

**Task Status → Notion Status:**

| Task System | Notion Doc |
|-------------|------------|
| `open`, `todo` | Draft |
| `in_progress`, `in progress`, `review` | In Review |
| `done`, `closed`, `completed` | Completed |
| `archived` | Archived |

**Customize in Workflow 2 → "Map Task → Doc Status" node**

### Notion Properties Required

**Docs Database:**

| Property | Type | Usage |
|----------|------|-------|
| Name | Title | Document title |
| Status | Select | Draft, In Review, Completed, Archived, Needs Implementation |
| Task Link | URL | URL to associated task |
| Task ID | Text | Task identifier (for queries) |
| Owner | Person | Document owner |
| Type | Select | Spec, SOP, PRD, Guide, etc. |
| Last Synced | Date | Timestamp of last sync |

**Optional but recommended:**
- Priority (Select)
- Due Date (Date)
- Summary (Rich Text)
- Auto-created (Date)

### Cron Schedule

**Workflow 3 (Daily Review Queue):**

```javascript
{
  "hour": 9,        // 9 AM
  "minute": 0,
  "timezone": "Asia/Manila"
}
```

**Change to your timezone:**
- US/Pacific: `America/Los_Angeles`
- US/Eastern: `America/New_York`
- Europe/London: `Europe/London`
- Asia/Tokyo: `Asia/Tokyo`

### Testing Commands

**Test Workflow 1 (not applicable - uses Notion trigger)**

**Test Workflow 2:**
```bash
curl -X POST https://ipa.insightpulseai.net/webhook/task-updated \
  -H "Content-Type: application/json" \
  -d '{
    "id": "123",
    "status": "closed",
    "metadata": {"notion_page_id": "abc123def456"}
  }'
```

**Test Workflow 3:**
```bash
# In n8n UI: Open workflow → Click "Execute Workflow" button
```

**Test Workflow 4:**
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

### Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Workflow not triggering | Check: (1) Activated? (2) Credentials valid? (3) Database shared with integration? |
| Task not created | Check: (1) Task system credentials (2) API URL correct (3) Database ID correct |
| Notion not updating | Check: (1) Webhook configured (2) Task ID matches (3) Property names match |
| Duplicate tasks | Check: (1) Filter conditions (2) Previous runs succeeded (3) Task Link property populated |
| Spec page not created | Check: (1) Label name matches (2) Webhook events enabled (3) Specs database ID correct |

### Monitoring

**View Executions:**
```
n8n UI → Workflows → Executions → Filter by workflow name
```

**Check Success Rate:**
```
Chart shows green (success) vs red (error) over time
```

**Debug Failed Runs:**
```
Click failed execution → Review node outputs → Look for error in red node
```

### Performance Tuning

**Prevent Rate Limiting:**

| System | Limit | Workflow Setting |
|--------|-------|------------------|
| Notion API | 3/second | Wait: 1 second between batches |
| GitHub API | 5000/hour | Batch size: 10, Wait: 1 second |
| Jira API | 10/second | Wait: 0.5 seconds |
| ClickUp API | 100/minute | Wait: 2 seconds |

**Adjust in Workflow 3:**
- "Process in Batches" → `batchSize`
- "Wait (Rate Limiting)" → `amount` (seconds)

### Customization Examples

**Add Custom Notion Property:**
```javascript
// In any Notion update node:
{
  "key": "Your Custom Field",
  "textContent": "={{ $json.your_value }}"
}
```

**Filter by Doc Type:**
```javascript
// In Workflow 3 "Get Docs Missing Tasks" node:
{
  "filters": {
    "conditions": [
      {"key": "Task Link", "condition": "isEmpty"},
      {"key": "Status", "condition": "equals", "value": "Needs Implementation"},
      {"key": "Type", "condition": "equals", "value": "Spec"}  // NEW
    ]
  }
}
```

**Change Notification Channel:**
```javascript
// In any Mattermost node:
{
  "channel": "your-channel-name"  // e.g., "tasks", "specs", "alerts"
}
```

### Security

**Webhook Authentication:**
```bash
# Add secret token to URL:
https://ipa.insightpulseai.net/webhook/task-updated?token=YOUR_SECRET

# Then add validation in workflow (after webhook node):
If node: {{ $json.query.token === 'YOUR_SECRET' }}
  True → Continue
  False → Return 403 response
```

**Credential Rotation:**
```bash
# 1. Generate new token in Notion/GitHub/etc.
# 2. Update in n8n: Settings → Credentials → Edit
# 3. Test all workflows
# 4. Revoke old token
```

### Useful SQL Queries

**Find Docs Without Tasks (Notion database view):**
```
Filter: Task Link | is empty
AND Status | equals | Needs Implementation
Sort: Created Time | Descending
```

**Find Auto-Created Tasks:**
```
Filter: Auto-created | is not empty
Group by: Status
```

### Support

**Documentation:** `/home/user/opex/workflows/n8n/docs/NOTION_TASK_SYNC_SETUP.md`
**n8n Community:** https://community.n8n.io/
**OpEx Issues:** https://github.com/jgtolentino/opex/issues

### Quick Links

- [Full Setup Guide](./NOTION_TASK_SYNC_SETUP.md)
- [n8n Notion Node Docs](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.notion/)
- [n8n Webhook Docs](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)
- [Notion API Reference](https://developers.notion.com/)

---

**Last Updated:** 2025-01-16
**Version:** 1.0.0
