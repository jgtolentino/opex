# OpEx Task Management System - Deployment Guide

## 🎯 Overview

This guide walks you through deploying the **normalized task management system** with:

- ✅ Recurring task automation (RRULE)
- ✅ Task dependencies
- ✅ Audit trails
- ✅ Rocket.Chat notifications
- ✅ Compliance health dashboards
- ✅ Multi-team support

---

## 📋 Prerequisites

1. **Supabase Project** - You should already have this (check `SUPABASE_URL` in `.env`)
2. **Supabase CLI** installed - `npm install -g supabase`
3. **Rocket.Chat webhook URL** (optional, for notifications)
4. **PostgreSQL knowledge** (basic)

---

## 🚀 Step-by-Step Deployment

### **Step 1: Run Database Migration**

Apply the main schema migration:

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migration
supabase db push
```

This will create:
- ✅ 7 tables (`opex_teams`, `opex_users`, `opex_tasks`, etc.)
- ✅ Helper functions (`opex_get_upcoming_tasks`, `opex_get_compliance_health`)
- ✅ RLS policies
- ✅ Indexes for performance

**Verify migration:**
```sql
-- Run this in Supabase SQL Editor
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'opex_%';
```

You should see 7 tables.

---

### **Step 2: Load Seed Data**

Load sample teams, users, and task templates:

```bash
# Apply seed data
supabase db execute --file supabase/seed_task_management.sql
```

This creates:
- 5 teams (Finance, Tax & Compliance, HR, Operations, Legal)
- 4 sample users
- 5 recurring task templates (BIR filings, month-end close, etc.)
- 4 task instances for November 2025

**Verify seed data:**
```sql
SELECT name FROM opex_teams;
SELECT title FROM opex_tasks WHERE recurrence_rule IS NOT NULL;
```

---

### **Step 3: Deploy Edge Functions**

#### **3.1 Deploy Task Scheduler (RRULE → Instances)**

```bash
# Deploy function
supabase functions deploy opex-task-scheduler

# No additional secrets needed (uses existing SUPABASE_* vars)
```

**Test it:**
```bash
curl -X POST \
  https://YOUR_PROJECT_REF.supabase.co/functions/v1/opex-task-scheduler \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "days_ahead": 90
  }'
```

Expected response:
```json
{
  "generated": 15,
  "skipped": 4,
  "errors": [],
  "instances": [...]
}
```

#### **3.2 Deploy Rocket.Chat Notification Function**

```bash
# Set Rocket.Chat webhook URL secret
supabase secrets set ROCKETCHAT_WEBHOOK_URL=https://your-rocketchat.com/hooks/YOUR_WEBHOOK_ID

# Deploy function
supabase functions deploy opex-task-notifications
```

**Test it (dry run):**
```bash
curl -X POST \
  https://YOUR_PROJECT_REF.supabase.co/functions/v1/opex-task-notifications \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "days_ahead": 7,
    "include_overdue": true,
    "dry_run": true
  }'
```

Expected response:
```json
{
  "notifications_sent": 1,
  "users_notified": ["juan.delacruz@opex.ph"],
  "errors": [],
  "dry_run": true
}
```

---

### **Step 4: Set Up Automated Scheduling**

Schedule both edge functions to run automatically:

#### **4.1 Daily Task Instance Generation** (3 AM daily)

```bash
# Create cron job in Supabase Dashboard
# Navigate to: Edge Functions → opex-task-scheduler → Cron

# Or use Supabase CLI:
supabase functions schedule create \
  --function-name opex-task-scheduler \
  --schedule "0 3 * * *" \
  --payload '{"days_ahead": 90}'
```

#### **4.2 Daily Notification Dispatch** (8 AM daily)

```bash
supabase functions schedule create \
  --function-name opex-task-notifications \
  --schedule "0 8 * * *" \
  --payload '{"days_ahead": 7, "include_overdue": true}'
```

---

## 🔧 Integration with Existing OpEx Platform

### **1. Add TypeScript Types to Frontend**

The types are already created at `lib/types/tasks.ts`. Import them in your components:

```typescript
import {
  TaskInstance,
  TaskWithInstances,
  ComplianceHealth,
  UpcomingTask
} from '@/lib/types/tasks';
```

### **2. Query Tasks from Frontend**

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Get upcoming tasks
const { data: upcomingTasks } = await supabase
  .rpc('opex_get_upcoming_tasks', {
    days_ahead: 7,
    include_overdue: true
  });

// Get compliance health
const { data: complianceMetrics } = await supabase
  .rpc('opex_get_compliance_health', {
    date_from: '2025-01-01',
    date_to: '2025-12-31'
  });
```

### **3. Create Dashboard Page**

Add a new page at `pages/tasks.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { UpcomingTask, ComplianceHealth } from '@/lib/types/tasks';

export default function TasksPage() {
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
  const [compliance, setCompliance] = useState<ComplianceHealth[]>([]);

  // Fetch data...
  // Render dashboard...
}
```

---

## 📊 Usage Examples

### **Create a New Recurring Task Template**

```sql
INSERT INTO opex_tasks (title, category_id, description, recurrence_rule, priority, owner_team_id)
VALUES (
  'Quarterly Board Report',
  (SELECT id FROM opex_task_categories WHERE name = 'Reporting'),
  'Prepare quarterly report for board meeting',
  'FREQ=YEARLY;BYMONTH=1,4,7,10;BYMONTHDAY=15', -- Jan 15, Apr 15, Jul 15, Oct 15
  'high',
  (SELECT id FROM opex_teams WHERE name = 'Finance')
);
```

### **Manually Create a Task Instance**

```sql
INSERT INTO opex_task_instances (task_id, assigned_to, status, due_date, cycle_identifier)
VALUES (
  'YOUR_TASK_ID',
  'YOUR_USER_ID',
  'not_started',
  '2025-12-15',
  'December 2025'
);
```

### **Update Task Status**

```sql
UPDATE opex_task_instances
SET status = 'done', completed_at = NOW()
WHERE id = 'YOUR_INSTANCE_ID';
```

### **Log Activity**

```sql
INSERT INTO opex_task_activity_log (task_instance_id, actor_id, action, metadata)
VALUES (
  'YOUR_INSTANCE_ID',
  'YOUR_USER_ID',
  'status_changed',
  '{"from": "in_progress", "to": "done", "comment": "Completed successfully"}'::jsonb
);
```

---

## 🎨 Dashboard Queries

### **Overdue Tasks by Team**

```sql
SELECT
  t.name AS team_name,
  COUNT(*) AS overdue_count
FROM opex_task_instances ti
JOIN opex_tasks tk ON ti.task_id = tk.id
JOIN opex_teams t ON tk.owner_team_id = t.id
WHERE ti.status NOT IN ('done', 'cancelled')
  AND ti.due_date < CURRENT_DATE
GROUP BY t.name
ORDER BY overdue_count DESC;
```

### **User Workload**

```sql
SELECT
  u.full_name,
  u.email,
  COUNT(*) FILTER (WHERE ti.status NOT IN ('done', 'cancelled')) AS active_tasks,
  COUNT(*) FILTER (WHERE ti.due_date < CURRENT_DATE AND ti.status NOT IN ('done', 'cancelled')) AS overdue_tasks
FROM opex_users u
LEFT JOIN opex_task_instances ti ON u.id = ti.assigned_to
GROUP BY u.id, u.full_name, u.email
ORDER BY active_tasks DESC;
```

### **Monthly Completion Rate**

```sql
SELECT
  TO_CHAR(due_date, 'YYYY-MM') AS month,
  COUNT(*) AS total_tasks,
  COUNT(*) FILTER (WHERE status = 'done') AS completed_tasks,
  ROUND((COUNT(*) FILTER (WHERE status = 'done')::DECIMAL / COUNT(*)) * 100, 2) AS completion_rate
FROM opex_task_instances
WHERE due_date >= DATE_TRUNC('year', CURRENT_DATE)
GROUP BY TO_CHAR(due_date, 'YYYY-MM')
ORDER BY month;
```

---

## 🔐 Security Considerations

### **Row Level Security (RLS)**

RLS is enabled on all tables. Current policies:

- ✅ Authenticated users can **read** all data
- ✅ Users can **update** their own assigned task instances
- ✅ Users can **insert** activity logs for their own actions
- ✅ Service role has **full access** (for edge functions)

### **Add Team-Based Access Control** (Optional)

If you want users to only see their team's tasks:

```sql
-- Replace the authenticated_read_instances policy
DROP POLICY authenticated_read_instances ON opex_task_instances;

CREATE POLICY "users_read_own_team_instances"
  ON opex_task_instances
  FOR SELECT
  TO authenticated
  USING (
    assigned_to = auth.uid()
    OR task_id IN (
      SELECT t.id FROM opex_tasks t
      JOIN opex_users u ON u.team_id = t.owner_team_id
      WHERE u.id = auth.uid()
    )
  );
```

---

## 🧪 Testing Checklist

After deployment, verify:

- [ ] Migration applied successfully (7 tables exist)
- [ ] Seed data loaded (5 teams, 4 users, 5 tasks)
- [ ] Task scheduler edge function deploys without errors
- [ ] Notification edge function deploys without errors
- [ ] Can manually trigger task scheduler via curl
- [ ] Can manually trigger notifications via curl (dry run)
- [ ] Cron jobs scheduled for both functions
- [ ] TypeScript types compile in Next.js project
- [ ] Can query upcoming tasks from frontend
- [ ] Can query compliance health from frontend

---

## 📝 Next Steps

### **1. Build UI Components**

Create React components for:
- Task list view (filterable by status, team, category)
- Task detail view (with activity log)
- Compliance dashboard (charts + metrics)
- Team workload view

### **2. Integrate with OpEx Portal**

Add a "Tasks" section to your OpEx Portal (`pages/portal.tsx`):

```tsx
<div className={styles.section}>
  <h2>Task Management</h2>
  <div className={styles.cards}>
    <Card
      title="My Tasks"
      description="View and manage your assigned tasks"
      href="/tasks/my-tasks"
      icon="📋"
    />
    <Card
      title="Compliance Dashboard"
      description="Track compliance health across teams"
      href="/tasks/compliance"
      icon="📊"
    />
  </div>
</div>
```

### **3. Add n8n Workflows** (Optional)

Create n8n workflows that trigger task updates based on external events:
- Google Calendar → Create task instances
- Email → Parse and create ad-hoc tasks
- Slack → Task status updates

### **4. RAG Integration** (Optional)

Enable AI assistant to answer task-related questions:

```typescript
// In lib/opex/ragClient.ts
export async function askTaskQuestion(question: string) {
  return askOpexAssistant({
    question,
    domain: 'ops',
    process: 'task_management',
    metadata: {
      available_data: 'task_instances, compliance_health, workload'
    }
  });
}
```

Example queries:
- "What tasks are overdue for the Finance team?"
- "Show me the compliance rate for Tax Filing category this quarter"
- "Who has the highest workload this month?"

---

## 🆘 Troubleshooting

### **Migration fails with "relation already exists"**

The tables already exist. Either:
- Drop existing tables: `DROP TABLE opex_tasks CASCADE;`
- Or modify migration to use `IF NOT EXISTS` (already included)

### **Edge function returns 500 error**

Check Supabase logs:
```bash
supabase functions logs opex-task-scheduler
supabase functions logs opex-task-notifications
```

### **Cron jobs not running**

Verify in Supabase Dashboard → Edge Functions → Cron Jobs.
Or list via CLI:
```bash
supabase functions schedule list
```

### **RLS blocking queries**

Temporarily disable RLS for testing:
```sql
ALTER TABLE opex_task_instances DISABLE ROW LEVEL SECURITY;
```

(Don't forget to re-enable for production!)

---

## 📚 Additional Resources

- **RRULE Spec:** https://icalendar.org/iCalendar-RFC-5545/3-8-5-3-recurrence-rule.html
- **RRULE Generator:** https://jakubroztocil.github.io/rrule/
- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions
- **Rocket.Chat Webhooks:** https://docs.rocket.chat/use-rocket.chat/workspace-administration/integrations

---

## ✅ Summary

You now have a **production-ready task management system** with:

1. ✅ **Normalized schema** (7 tables, proper relations)
2. ✅ **Recurring task automation** (RRULE → instances)
3. ✅ **Rocket.Chat notifications** (daily reminders + alerts)
4. ✅ **Audit trail** (activity log for compliance)
5. ✅ **Compliance dashboards** (health metrics by category)
6. ✅ **TypeScript types** (type-safe frontend integration)
7. ✅ **Automated scheduling** (cron jobs for daily tasks)

**Total deployment time:** ~30 minutes
**Cost:** $0 (within Supabase free tier for <500k edge function invocations/month)

---

**Questions?** Check the generated code or run:
```bash
supabase functions logs opex-task-scheduler --follow
```

🚀 Happy automating!
