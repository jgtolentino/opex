# Finance Automation - Complete Setup Guide

**Complete n8n automation suite for Finance month-end close, BIR tax filing, and task management**

---

## 📋 Overview

This suite automates your entire Finance operations workflow:

| Workflow | Purpose | Trigger | Key Features |
|----------|---------|---------|--------------|
| **5. Finance Handoff (Email)** | Sequential handoff alerts | Task Status → Done | Email next assignee, update status |
| **5. Finance Handoff (Rocket.Chat)** | Sequential handoff alerts | Task Status → Done | Rocket.Chat notification, @ mentions |
| **6. Sheets → Notion Tasks** | Daily task sync | Cron (7 AM daily) | Google Sheets → Notion, employee lookup, calendar sync |
| **7. Tasks → Docs Auto-gen** | Auto-create documentation | Task needs doc | Smart templates (SOP/PRD/Tax), Notion docs |
| **8. Task Alerts (Due/Overdue)** | Proactive reminders | Cron (8 AM daily) | Classify urgency, DM assignees, auto-flag at-risk |

---

## 🎯 Use Case: Month-End Close Process

### Your Current Process

**Source of Truth**: Google Sheets `Month-end Closing Task and Tax Filing`
- Sheet: `Closing Task – Gantt Chart`
- Columns: Task Category, Detailed Task, Activity, Employee Code, Date (shifted to Dec/Jan)

**Team**: 12 people across 8 agencies (CKVC, RIM, LAS, BOM, JPAL, JPL, JI, JO, JM, RMQB, CJD, JT)

**Flow**:
```
Google Sheet (tasks + dates)
    ↓ Workflow 6 (daily sync 7 AM)
Notion Finance Tasks DB (with assignees, due dates, calendar view)
    ↓ Workflow 8 (daily alerts 8 AM)
Rocket.Chat notifications (overdue/due today/upcoming)
    ↓ Team completes tasks
Task marked "Done" in Notion
    ↓ Workflow 5 (handoff)
Next assignee notified via Rocket.Chat
    ↓ Repeat until month-end close complete
```

### What Gets Automated

**✅ Daily** (7 AM):
- Sync all tasks from Google Sheet to Notion
- Match employee codes to names/emails
- Create calendar view for visual planning
- Post sync summary to Rocket.Chat

**✅ Daily** (8 AM):
- Check all active tasks
- Classify: Overdue / Due Today / Due Tomorrow / Upcoming
- Post summary to Rocket.Chat
- DM individual assignees for overdue tasks
- Auto-mark overdue tasks as "At Risk"

**✅ Real-time** (when task done):
- Detect task status → "Done"
- Look up "Next Step" task
- Notify next assignee via Rocket.Chat
- Update next task status to "Ready to Start"

**✅ On-demand** (when task needs doc):
- Check if task has "Needs Doc" = true
- Select template based on category (SOP / PRD / Tax Guide)
- Create structured Notion doc page
- Link doc back to task
- Notify owner via Rocket.Chat

---

## 🛠️ Prerequisites

### 1. Notion Setup

**Create 2 Notion Databases**:

#### A. Finance Tasks Database

| Property | Type | Options/Notes |
|----------|------|---------------|
| **Name** | Title | Task name |
| **Category** | Select | Month-End Close, BIR Filing, Bank Recon, Budget Review, General |
| **Activity** | Select | Preparation, Review, Approval, Filing, Payment |
| **Status** | Select | Scheduled, In Progress, Ready to Start, At Risk, Done, Cancelled |
| **Assignee Name** | Rich Text | From employee directory |
| **Assignee Email** | Email | For notifications |
| **Employee Code** | Text | CKVC, RIM, LAS, etc. |
| **Due Date** | Date | Deadline (from Google Sheet) |
| **Next Step** | Relation | Link to next task in sequence |
| **Has Doc** | Checkbox | Marks if doc created |
| **Needs Doc** | Checkbox | Trigger for doc generation |
| **Doc Link** | URL | Link to generated doc |
| **Doc Type** | Select | SOP, PRD, Tax Guide |
| **Source** | Select | Google Sheets (Gantt), Manual |
| **Row ID** | Number | For Google Sheets sync |
| **Last Synced** | Date | Sync timestamp |
| **Notified At** | Date | When handoff notification sent |
| **Flagged At** | Date | When marked "At Risk" |

**Views**:
- **Calendar**: Timeline view by Due Date
- **By Assignee**: Group by Assignee Name
- **Overdue**: Filter Status ≠ Done AND Due Date < Today
- **This Week**: Filter Due Date = This Week
- **By Category**: Group by Category

#### B. Finance Docs Database

| Property | Type | Options/Notes |
|----------|------|---------------|
| **Name** | Title | Doc title |
| **Type** | Select | SOP, PRD, Tax Guide, General |
| **Status** | Select | Draft, In Review, Approved, Published |
| **Owner** | Text | From task assignee |
| **Source Task** | URL | Link back to triggering task |
| **Category** | Select | (Same as Finance Tasks) |
| **Created From** | Select | Task (Auto), Manual, Template |

**Get Database IDs**:
```
1. Open database in Notion
2. URL format: https://notion.so/workspace/DATABASE_ID?v=...
3. Copy DATABASE_ID (32-character hex)
4. Replace in workflows:
   - YOUR_FINANCE_TASKS_DB_ID
   - YOUR_FINANCE_DOCS_DB_ID
```

**Create Notion Integration**:
```
1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Name: "Finance Automation"
4. Select workspace
5. Copy Internal Integration Token
6. Share BOTH databases with this integration:
   - Open database → "..." → Add connections → "Finance Automation"
```

---

### 2. Google Sheets Setup

**Sheet Structure** (Closing Task – Gantt Chart):

| Column | Header | Example | Used In |
|--------|--------|---------|---------|
| A | Task Category | Month-End Close | Workflow 6 |
| B | Detailed Task | Prepare journal entries | Workflow 6 |
| C | Activity | Preparation | Workflow 6 |
| D | Employee | CKVC | Workflow 6 (lookup) |
| E | Date | 2025-12-29 | Workflow 6 (due date) |
| F | BIR Deadline | 2026-01-10 | (Reference only) |
| G | Notes | (Optional) | |

**Important**:
- Keep column headers exactly as shown
- Employee column must use codes: CKVC, RIM, LAS, etc.
- Dates in column E should be the **shifted December/January dates**
- Use `=WORKDAY(BIR_DEADLINE, -4)` formulas to auto-calculate prep dates

**Get Sheet ID**:
```
1. Open your Google Sheet
2. URL: https://docs.google.com/spreadsheets/d/SHEET_ID/edit
3. Copy SHEET_ID
4. Replace in Workflow 6: YOUR_GOOGLE_SHEET_ID
```

---

### 3. Rocket.Chat Setup

**Create Incoming Webhook**:
```
1. Rocket.Chat → Administration → Integrations → New Integration
2. Type: Incoming WebHook
3. Name: "Finance Automation"
4. Channel: #finance (or your channel name)
5. Enable: ✅
6. Save and copy Webhook URL
7. Set environment variable: ROCKETCHAT_WEBHOOK_URL
```

**Test Webhook**:
```bash
curl -X POST $ROCKETCHAT_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"text": "✅ Finance automation test message"}'
```

---

### 4. n8n Credentials

**Create in n8n UI**:

1. **Notion API**
   - Settings → Credentials → Add → Notion API
   - Paste Integration Token from Notion
   - Test connection → Save as "Notion API"

2. **Google Sheets OAuth2**
   - Settings → Credentials → Add → Google Sheets
   - Method: OAuth2
   - Authorize with Google account (must have access to sheet)
   - Test → Save as "Google Sheets"

3. **SMTP** (for email version of Workflow 5)
   - Settings → Credentials → Add → SMTP
   - Host: smtp.gmail.com (or your provider)
   - Port: 587 (TLS) or 465 (SSL)
   - User: your-email@example.com
   - Password: app password (not regular password)
   - Test → Save as "Finance SMTP"

4. **Environment Variable** (Rocket.Chat)
   - In n8n settings or docker-compose:
   ```yaml
   environment:
     - ROCKETCHAT_WEBHOOK_URL=https://your-rocketchat.com/hooks/xxx
   ```

---

## 📥 Installation

### Step 1: Import Workflows

```bash
# Navigate to workflows directory
cd /home/user/opex/workflows/n8n/workflows

# Import via n8n UI:
# 1. Open https://ipa.insightpulseai.net
# 2. Workflows → Import from File
# 3. Select each JSON:
#    - 5-finance-handoff-email.json
#    - 5-finance-handoff-rocketchat.json
#    - 6-sheets-to-notion-tasks.json
#    - 7-tasks-to-docs-autogen.json
#    - 8-finance-task-alerts.json
# 4. Click "Import"
```

### Step 2: Configure Workflow 6 (Sheets → Notion)

This is the **core** workflow - configure it first.

**1. Update Node: "Read Gantt Chart from Sheets"**
```json
{
  "documentId": "YOUR_GOOGLE_SHEET_ID",
  "sheetName": "Closing Task – Gantt Chart",
  "range": "A2:H200"
}
```

**2. Update Node: "Lookup Employee in Directory"**

Already includes all 12 employees:
- CKVC → Khalil Veracruz
- RIM → Rey Meran
- LAS → Amor Lasaga
- BOM → Beng Manalo
- JPAL → Jinky Paladin
- JPL → Jerald Loterte
- JI → Jasmin Ignacio
- JO → Jhoee Oliva
- JM → Joana Maravillas
- RMQB → Sally Brillantes
- CJD → Cliff Dejecacion
- JT → Jake Tolentino

*(No changes needed unless you add new employees)*

**3. Update Node: "Create/Update Task in Notion"**
```json
{
  "databaseId": "YOUR_FINANCE_TASKS_DB_ID"
}
```

**4. Verify Property Mappings**

Make sure Notion property names match:
- `Category` → Task Category
- `Activity` → Activity type
- `Assignee Name` → Employee name
- `Assignee Email` → Employee email
- `Employee Code` → Code (CKVC, RIM, etc.)
- `Due Date` → Date from sheet
- `Status` → Default: "Scheduled"
- `Source` → "Google Sheets (Gantt)"

**5. Test Workflow**
```
1. Click "Execute Workflow" (test button)
2. Should read your Google Sheet
3. Should create/update tasks in Notion
4. Check Notion database for new tasks
5. Check Rocket.Chat for sync summary
```

---

### Step 3: Configure Workflow 5 (Handoff Alerts)

**Choose email OR Rocket.Chat version** (or use both).

#### Option A: Email Version

**1. Update SMTP Credential**
```
- From email: finance-bot@yourcompany.com
- Test email sending before activating
```

**2. Update Database ID**
```
Node: "Watch Finance Tasks"
databaseId: "YOUR_FINANCE_TASKS_DB_ID"
```

**3. Test Handoff Flow**
```
1. Create 2 tasks in Notion:
   - Task A: "Bank Recon" (Assignee: CKVC)
   - Task B: "Payment Approval" (Assignee: RIM)
2. In Task A, set "Next Step" relation → Task B
3. Mark Task A status → "Done"
4. Check email: RIM should receive notification
5. Check Notion: Task B status should be "Ready to Start"
```

#### Option B: Rocket.Chat Version (Recommended)

**1. Set environment variable**
```bash
# In n8n environment or docker-compose:
ROCKETCHAT_WEBHOOK_URL=https://your-rocketchat.com/hooks/xxx
```

**2. Update Database ID**
```
(Same as email version)
```

**3. Test**
```
(Same flow as email version, but check Rocket.Chat instead)
```

---

### Step 4: Configure Workflow 7 (Auto-Doc Generation)

**1. Update Database IDs**
```
Node: "Watch Finance Tasks"
databaseId: "YOUR_FINANCE_TASKS_DB_ID"

Node: "Create Doc in Notion"
databaseId: "YOUR_FINANCE_DOCS_DB_ID"
```

**2. Template Customization**

Edit `Code_SelectDocTemplate` node if you want different templates:

```javascript
// Current templates:
// - PRD: For process design tasks
// - SOP: For standard operating procedures
// - TAX_GUIDE: For BIR filing tasks
// - GENERAL: Default fallback

// Add custom template:
if (category === 'Bank Reconciliation') {
  template = {
    type: 'BANK_RECON',
    sections: [
      { heading: '## Purpose', content: '...' },
      { heading: '## Steps', content: '...' },
      // ... your sections
    ]
  };
}
```

**3. Test Doc Generation**
```
1. Create task in Notion:
   - Name: "Test Doc Generation"
   - Category: "Month-End Close"
   - Needs Doc: ✅ (checked)
   - Has Doc: ☐ (unchecked)
2. Save task
3. Wait 5 seconds
4. Check Finance Docs database for new doc
5. Check task: "Doc Link" should be populated
6. Check Rocket.Chat for notification
```

---

### Step 5: Configure Workflow 8 (Task Alerts)

**1. Update Database ID**
```
Node: "Get Active Tasks"
databaseId: "YOUR_FINANCE_TASKS_DB_ID"
```

**2. Adjust Alert Schedule**

Default: 8 AM daily

Change in `Cron_Daily8AM` node:
```json
{
  "hour": 8,  // Your desired hour (0-23)
  "minute": 0,
  "timezone": "Asia/Manila"
}
```

**3. Customize Alert Logic**

Edit `Code_ClassifyTasks` node:
```javascript
// Current thresholds:
// - Overdue: < 0 days
// - Due Today: 0 days
// - Due Tomorrow: 1 day
// - Upcoming: 2-3 days

// Adjust as needed:
if (diffDays < -2) {
  overdue.push(task);  // Only alert if >2 days late
}
```

**4. Test Alerts**
```
1. Create tasks with various due dates:
   - Task A: Due yesterday (overdue)
   - Task B: Due today
   - Task C: Due tomorrow
2. Manually execute workflow (don't wait for cron)
3. Check Rocket.Chat:
   - General summary posted to channel
   - DMs sent to overdue task assignees
4. Check Notion:
   - Overdue tasks marked "At Risk"
```

---

## 🚀 Activation

**After all workflows are configured and tested**:

1. **Activate Workflow 6** (Sheets sync)
   - Open workflow → Toggle "Active" in top-right
   - Will run daily at 7 AM

2. **Activate Workflow 5** (Handoff alerts)
   - Choose email OR Rocket.Chat version
   - Toggle "Active"
   - Runs real-time on task updates

3. **Activate Workflow 7** (Doc generation)
   - Toggle "Active"
   - Runs real-time when "Needs Doc" checked

4. **Activate Workflow 8** (Task alerts)
   - Toggle "Active"
   - Will run daily at 8 AM

**Monitor for 24 hours**:
- Check n8n Executions tab for errors
- Verify Rocket.Chat notifications
- Confirm Notion updates
- Test handoff flow manually

---

## 📊 Daily Operations

### Morning Routine (Automated)

**7:00 AM** - Workflow 6 runs:
```
✅ Sync Google Sheet → Notion
✅ Update task assignees
✅ Refresh calendar view
✅ Post sync summary to Rocket.Chat
```

**8:00 AM** - Workflow 8 runs:
```
✅ Check all tasks
✅ Classify urgency
✅ Post summary to Rocket.Chat
✅ DM overdue assignees
✅ Mark "At Risk" tasks
```

### Throughout the Day (Real-time)

**When someone completes a task**:
```
User marks task "Done" in Notion
    ↓
Workflow 5 triggers
    ↓
Next assignee notified
    ↓
Next task marked "Ready to Start"
```

**When task needs documentation**:
```
User checks "Needs Doc" in Notion
    ↓
Workflow 7 triggers
    ↓
Doc page created with template
    ↓
Owner notified to fill in details
```

---

## 🔧 Customization Examples

### Add New Employee

**1. Update employee directory**:
```
File: /home/user/opex/workflows/n8n/data/employee-directory.csv

Add row:
NEW,New Person,New Person,new.person@omc.com
```

**2. Update Workflow 6**:
```javascript
// In "Lookup Employee in Directory" node:
const directory = {
  // ... existing entries ...
  'NEW': { name: 'New Person', email: 'new.person@omc.com' }
};
```

**3. Use in Google Sheet**:
```
Column D (Employee): NEW
```

### Change Task Categories

**1. Update Notion Select Options**:
```
Finance Tasks DB → Category property → Edit
Add new option: "Audit Preparation"
```

**2. Update Google Sheet**:
```
Column A: Use new category name
```

**3. (Optional) Add Custom Doc Template**:
```javascript
// In Workflow 7, "Select Doc Template" node:
if (category === 'Audit Preparation') {
  template = {
    type: 'AUDIT_PREP',
    sections: [
      { heading: '## Audit Scope', content: '...' },
      { heading: '## Evidence Required', content: '...' }
    ]
  };
}
```

### Adjust Alert Timing

**For earlier alerts**:
```javascript
// In Workflow 8, "Classify by Urgency" node:
// Current: alerts 1 day before
// Change to: alerts 2 days before

if (diffDays <= 2) {
  dueTomorrow.push(task);  // Now "due in 2 days"
}
```

### Add BIR Deadline Calculations

**In Google Sheet**:
```
Column E (Prep Date) = WORKDAY(Column F (BIR Deadline), -4)
Column G (Approval Date) = WORKDAY(Column F, -2)
Column H (Payment Date) = WORKDAY(Column F, -1)
```

**Create separate tasks**:
```
Row 1: Prep & File Request | CKVC | =WORKDAY(F2,-4)
Row 2: Report Approval | RIM | =WORKDAY(F2,-2)
Row 3: Payment Approval | LAS | =WORKDAY(F2,-1)
```

Set "Next Step" relations:
```
Row 1 Next Step → Row 2
Row 2 Next Step → Row 3
```

---

## 🐛 Troubleshooting

### Workflow 6 Not Syncing

**Issue**: Tasks not appearing in Notion after 7 AM

**Checks**:
1. Is workflow activated? (green toggle)
2. Check Executions tab for errors
3. Google Sheets credential valid?
   - Settings → Credentials → Google Sheets → Test
4. Sheet name exact match?
   - "Closing Task – Gantt Chart" (note: en-dash, not hyphen)
5. Database ID correct?
   - Copy from Notion URL
6. Sheet has data in rows 2+?
   - Check range: A2:H200

**Fix**:
```bash
# Test manually:
1. Open Workflow 6
2. Click "Execute Workflow"
3. Review each node output
4. Check for errors in red nodes
```

### Workflow 5 Handoff Not Firing

**Issue**: No notification when task marked "Done"

**Checks**:
1. "Next Step" relation populated?
   - Must link to another task in same database
2. Status changed to exactly "Done"?
   - Check spelling, case-sensitive
3. Workflow activated?
4. Rocket.Chat webhook URL set?
   - `echo $ROCKETCHAT_WEBHOOK_URL`

**Fix**:
```
# Test notification manually:
curl -X POST $ROCKETCHAT_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"text": "Test from n8n"}'
```

### Workflow 7 Not Creating Docs

**Issue**: "Needs Doc" checked but no doc created

**Checks**:
1. "Has Doc" is unchecked?
   - Workflow skips if already has doc
2. Finance Docs database shared with integration?
   - Notion → Database → Connections → "Finance Automation"
3. Template selection working?
   - Check "Code_SelectDocTemplate" node output

**Fix**:
```
1. Manually execute workflow
2. Check node "If_NeedsDoc" output
3. If true, check "Notion_CreateDocPage" errors
4. Common: wrong database ID or missing properties
```

### Workflow 8 Not Sending Alerts

**Issue**: No alerts at 8 AM

**Checks**:
1. Cron schedule correct?
   - Check timezone: Asia/Manila
2. Any active tasks with due dates?
   - Filter: Status ≠ Done AND Due Date ≤ Today
3. Rocket.Chat webhook working?
4. Check executions for failed runs

**Fix**:
```
# Trigger manually to test:
1. Open Workflow 8
2. Click "Execute Workflow"
3. Should process immediately
4. Check Rocket.Chat for message
```

### Employee Lookup Failing

**Issue**: Assignee shows as "Unassigned"

**Checks**:
1. Employee code in sheet matches directory?
   - Must be exact: CKVC, RIM, LAS (uppercase)
2. Employee in lookup table?
   - Check "Lookup Employee in Directory" node
3. Trim whitespace in sheet?

**Fix**:
```javascript
// In "Normalize Task Data" node:
"employee_code": "={{ ($json['Employee'] || $json['D'] || '').toUpperCase().trim() }}"

// This handles:
// - Lowercase codes: ckvc → CKVC
// - Extra spaces: " CKVC " → CKVC
```

---

## 📈 Analytics & Reporting

### Query Task Metrics

**In Notion**, create views:

**1. Completion Rate**
```
Filter: Source = "Google Sheets (Gantt)"
Group by: Status
Sort: Count descending
```

**2. Assignee Workload**
```
Filter: Status = "In Progress" OR "Ready to Start"
Group by: Assignee Name
Sort: Count descending
```

**3. Overdue Report**
```
Filter: Status ≠ "Done" AND Due Date < Today
Sort: Due Date ascending
```

**4. Handoff Log**
```
Create formula property "Handoff Time":
  If Status = "Ready to Start" AND Notified At exists
  Then: Notified At - Created Time
  (Shows time between task creation and handoff)
```

### Rocket.Chat Logs

**Daily Summary Example**:
```
✅ Finance Tasks Sync Complete

Total tasks synced: 47

By category:
  - Month-End Close: 23
  - BIR Filing: 12
  - Bank Recon: 8
  - Budget Review: 4

Top assignees:
  - Khalil Veracruz: 12 tasks
  - Rey Meran: 9 tasks
  - Amor Lasaga: 7 tasks
  - Beng Manalo: 6 tasks
  - Jinky Paladin: 5 tasks
```

**Alert Summary Example**:
```
🔔 Finance Task Alerts 🔔

🚨 OVERDUE (3):
  ❗ Bank Recon - Oct Period - Khalil Veracruz (2 days late)
  ❗ BIR 1601-C Filing - Rey Meran (1 day late)
  ❗ Payment Approval - Amor Lasaga (3 days late)

⏰ DUE TODAY (5):
  📌 Prepare Journal Entries - Beng Manalo
  📌 Review Trial Balance - Jinky Paladin
  ...

📅 DUE TOMORROW (7):
  • Month-End Report - Jerald Loterte
  • BIR Payment - Jasmin Ignacio
  ...
```

---

## 🔐 Security Best Practices

### Credential Management

**Never commit secrets**:
```bash
# .gitignore
.env
.env.local
credentials.json
```

**Use environment variables**:
```yaml
# docker-compose.yml
environment:
  - ROCKETCHAT_WEBHOOK_URL=${ROCKETCHAT_WEBHOOK_URL}
  - NOTION_API_KEY=${NOTION_API_KEY}
```

**Rotate regularly**:
```
1. Generate new Notion integration token (quarterly)
2. Update in n8n credentials
3. Test all workflows
4. Revoke old token
```

### Access Control

**Notion**:
- Share databases only with "Finance Automation" integration
- Don't share entire workspace
- Review integration permissions quarterly

**Google Sheets**:
- Use OAuth2 (not API key)
- Limit access to specific sheet
- Use service account if possible

**Rocket.Chat**:
- Webhook restricted to #finance channel
- Consider IP whitelist if n8n has static IP

### Audit Logging

**Enable in n8n**:
```
Settings → Workflows → Log Level: "debug"
```

**Log handoff activities**:
```
Workflow 5 already includes "Log Handoff Activity" node
Captures:
- From task/assignee
- To task/assignee
- Timestamp
- Notification channel
```

---

## 🆘 Support

**Documentation**:
- This guide: `/workflows/n8n/docs/FINANCE_AUTOMATION_SETUP.md`
- Main README: `/workflows/n8n/README.md`
- Notion Sync: `/workflows/n8n/docs/NOTION_TASK_SYNC_SETUP.md`

**Community**:
- n8n Community: https://community.n8n.io/
- OpEx Issues: https://github.com/jgtolentino/opex/issues

**Contact**:
- Rocket.Chat: #ops-automation
- Email: jgtolentino.rn@gmail.com

---

## 📝 Changelog

### v1.0.0 (2025-01-16)
- Initial release
- 5 workflows (Email/Rocket.Chat handoff + 3 core automation)
- Google Sheets → Notion sync
- Auto-doc generation with smart templates
- Daily alerts with urgency classification
- Employee directory with 12 team members
- Support for 8 agencies

---

**Next Steps**:
1. Complete all prerequisite setup
2. Import workflows to n8n
3. Configure database IDs and credentials
4. Test each workflow individually
5. Activate workflows
6. Monitor for 1 week
7. Adjust timing/templates as needed

**Success Criteria**:
- [ ] Tasks sync daily from Google Sheets to Notion
- [ ] Calendar view shows all tasks visually
- [ ] Handoff alerts work when tasks marked "Done"
- [ ] Daily alert summary posts to Rocket.Chat
- [ ] Overdue tasks trigger DMs to assignees
- [ ] Doc generation creates proper templates
- [ ] Zero manual task creation needed

Good luck with your Finance automation! 🚀
