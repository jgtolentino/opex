# Notion Database Import Files

**Purpose**: CSV exports ready for direct import into Notion databases

**Created**: 2025-01-16
**Source**: docs/finance/month_end_closing/ documentation

---

## Files

### 01_month_end_tasks.csv
**Notion Database**: Month-End Closing Tasks
**Records**: 47 tasks (43 monthly + 4 quarterly)
**Columns**: 9 fields

| Column | Type | Description |
|--------|------|-------------|
| Task Name | Title | Task description |
| Owner | Select | Accounting Staff, Finance Supervisor, Senior Finance Manager, Finance SSC Manager |
| Role | Select | Executor, Responsible, Accountable |
| Due Day | Text | Day 1-25 of close cycle |
| SLA | Text | Time allocation for task |
| Status | Select | pending, in_progress, completed, blocked |
| Evidence | Text | Required deliverables/documentation |
| BIR Form | Select | 1601-C, 2550Q, N/A |
| Description | Text | Detailed task instructions |

**Notion Setup**:
1. Create new database: "Month-End Closing Tasks"
2. Import CSV
3. Convert "Owner" to Select property (4 options)
4. Convert "Role" to Select property (3 options: Executor, Responsible, Accountable)
5. Convert "Status" to Select property (4 options: pending, in_progress, completed, blocked)
6. Convert "BIR Form" to Select property (3 options: 1601-C, 2550Q, N/A)
7. Add formula property: `Complete = if(prop("Status") == "completed", "✅", "")`
8. Add rollup: Count tasks by owner
9. Create views:
   - By Phase (Group by Due Day)
   - By Owner (Group by Owner)
   - By BIR Form (Filter BIR Form != N/A)
   - Kanban Board (Group by Status)

---

### 02_bir_filing_schedule.csv
**Notion Database**: BIR Tax Filing Schedule
**Records**: 24 filing deadlines (13 monthly + 11 quarterly for 2025-2026)
**Columns**: 6 fields

| Column | Type | Description |
|--------|------|-------------|
| BIR Form | Title | Form number and name |
| Period Covered | Text | Month or quarter |
| BIR Filing & Payment Deadline | Date | Official BIR deadline |
| Prep & File Request (Finance Supervisor) | Date | Preparation target date |
| Report Approval (Senior Finance Manager) | Date | Review target date |
| Payment Approval (Finance Director) | Date | Payment approval target date |

**Notion Setup**:
1. Create new database: "BIR Tax Filing Schedule"
2. Import CSV
3. Convert deadline columns to Date properties
4. Add formula property: `Days Until Deadline = dateBetween(prop("BIR Filing & Payment Deadline"), now(), "days")`
5. Add formula property: `Status = if(now() > prop("BIR Filing & Payment Deadline"), "⚠️ Overdue", if(prop("Days Until Deadline") <= 3, "🚨 Due Soon", "📅 Upcoming"))`
6. Create views:
   - Calendar View (By BIR Filing & Payment Deadline)
   - Upcoming Deadlines (Filter: Status != Overdue, Sort by Deadline)
   - Monthly Forms (Filter: BIR Form contains "1601-C")
   - Quarterly Forms (Filter: BIR Form contains "Q")
7. Add relations: Link to "Month-End Closing Tasks" where BIR Form matches

---

### 03_finance_policies_sops.csv
**Notion Database**: Finance Policies & SOPs
**Records**: 15 policies and procedures
**Columns**: 6 fields

| Column | Type | Description |
|--------|------|-------------|
| Policy/SOP Name | Title | Policy or procedure name |
| Category | Select | Financial Reporting, Tax Compliance, Cash Management, etc. |
| Link to Markdown | URL | Reference link to source documentation |
| Primary Owner | Select | Finance SSC Manager, Senior Finance Manager, Finance Supervisor, Accounting Staff |
| Review Frequency | Select | Monthly, Quarterly, Annually |
| Description | Text | Brief policy/procedure description |

**Notion Setup**:
1. Create new database: "Finance Policies & SOPs"
2. Import CSV
3. Convert "Category" to Select property (10 categories: Financial Reporting, Tax Compliance, Cash Management, Working Capital Management, Asset Management, General Accounting, System Controls, Compliance & Audit, IT Controls, SOP)
4. Convert "Primary Owner" to Select property (4 options)
5. Convert "Review Frequency" to Select property (3 options: Monthly, Quarterly, Annually)
6. Add formula property: `Next Review = if(prop("Review Frequency") == "Monthly", dateAdd(now(), 1, "months"), if(prop("Review Frequency") == "Quarterly", dateAdd(now(), 3, "months"), dateAdd(now(), 12, "months")))`
7. Add checkbox property: "Up to Date" (default: checked)
8. Create views:
   - By Category (Group by Category)
   - By Owner (Group by Primary Owner)
   - By Review Frequency (Group by Review Frequency)
   - Due for Review (Filter: Next Review <= 7 days from now)
9. Add relations: Link to "Month-End Closing Tasks" based on related policies

---

## Import Instructions

### Method 1: Direct CSV Import
1. Open Notion
2. Create new page
3. Type `/database` → Select "Database - Inline"
4. Click "..." menu → Import → CSV
5. Select corresponding CSV file
6. Map columns as described above

### Method 2: Notion Import Block
1. Create new page in Notion
2. Type `/import` → Select CSV
3. Choose CSV file
4. Review column mapping
5. Click "Import"

---

## Post-Import Configuration

### Database Relations

**Link BIR Filing Schedule ↔ Month-End Closing Tasks**:
- In BIR Filing Schedule: Add relation property "Related Tasks"
- In Month-End Closing Tasks: Add relation property "BIR Filing"
- Manually link or use formula: `if(prop("BIR Form") != "N/A", filter tasks where BIR Form = this.BIR Form)`

**Link Policies ↔ Tasks**:
- In Policies: Add relation property "Related Tasks"
- In Tasks: Add relation property "Governing Policy"
- Link policies to tasks they govern (e.g., "Bank Reconciliation Policy" → all Day 1-2 tasks)

### Automation Suggestions

**Notion Automations**:
1. **BIR Deadline Reminder**: When "Days Until Deadline" ≤ 5 → Send notification to Finance Supervisor
2. **Task Overdue Alert**: When task "Due Day" passes and Status != completed → Send notification to Owner
3. **Policy Review Reminder**: When "Next Review" ≤ 7 days → Send notification to Primary Owner

**Integration with n8n** (see automation_workflows/):
- Sync Notion task status → Supabase `task_queue` table
- BIR filing deadline → Email reminders 5 days before
- Policy review due → Slack/email notification

---

## Data Validation

### Month-End Tasks (01_month_end_tasks.csv)
```bash
# Verify record count
wc -l 01_month_end_tasks.csv
# Expected: 48 lines (47 tasks + 1 header)

# Check for duplicates
cut -d',' -f1 01_month_end_tasks.csv | sort | uniq -d
# Expected: No output (no duplicates)

# Verify BIR Form values
cut -d',' -f8 01_month_end_tasks.csv | sort | uniq
# Expected: 1601-C, 2550Q, N/A
```

### BIR Filing Schedule (02_bir_filing_schedule.csv)
```bash
# Verify record count
wc -l 02_bir_filing_schedule.csv
# Expected: 25 lines (24 deadlines + 1 header)

# Check date format
cut -d',' -f3 02_bir_filing_schedule.csv | tail -n +2
# Expected: Dates in "Mon DD YYYY" format
```

### Policies & SOPs (03_finance_policies_sops.csv)
```bash
# Verify record count
wc -l 03_finance_policies_sops.csv
# Expected: 16 lines (15 policies + 1 header)

# Check categories
cut -d',' -f2 03_finance_policies_sops.csv | sort | uniq
# Expected: 10 unique categories
```

---

## Notion Template

For a ready-to-use Notion template with all three databases pre-configured:

1. Duplicate template: [Finance Ops - Month-End Close Framework](notion://duplicate-template-link-here)
2. Or manually import CSVs following instructions above

---

**Questions**: Contact Finance SSC Manager
**Source Documentation**: `/Users/tbwa/opex/docs/docs/finance/month_end_closing/`
**Last Updated**: 2025-01-16
