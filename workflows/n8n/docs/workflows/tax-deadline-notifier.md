# PH Tax Deadline Notifier Workflow

Automated BIR tax deadline reminders for multi-agency finance operations.

## Overview

**File**: `tax-deadline-notifier.json`
**Trigger**: Cron (Daily 8 AM Philippine Time)
**Purpose**: Prevent missed BIR filing deadlines with proactive notifications

## Flow

```
Cron (8 AM) → Query Supabase (upcoming deadlines) → Split by Agency →
Format Notification → Post to Mattermost → Log Success
```

## Nodes

1. **Daily Trigger**: Cron at 8 AM (`Asia/Manila` timezone)
2. **Query Upcoming Deadlines**: RPC call to `get_upcoming_tax_deadlines(days_ahead: 7)`
3. **Check if Deadlines Exist**: Filter empty results
4. **Split by Agency**: Process each deadline individually
5. **Format Notification**: Create Mattermost-friendly message
6. **Post to Mattermost**: Send to channel (agency-specific or `finance-alerts`)
7. **Log to Supabase**: Record notification in `notification_log`

## Configuration

### Required Credentials
- Supabase Service Role Key (for tax table queries)
- Mattermost Webhook URL

### Supabase RPC Function

Create in Supabase:
```sql
CREATE OR REPLACE FUNCTION get_upcoming_tax_deadlines(days_ahead INTEGER)
RETURNS TABLE (
  agency TEXT,
  form_type TEXT,
  form_name TEXT,
  due_date DATE,
  days_until_due INTEGER,
  description TEXT,
  mattermost_channel TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.agency,
    t.form_type,
    t.form_name,
    t.due_date,
    (t.due_date - CURRENT_DATE) as days_until_due,
    t.description,
    COALESCE(a.mattermost_channel, 'finance-alerts') as mattermost_channel
  FROM tax_calendar t
  LEFT JOIN agencies a ON t.agency = a.code
  WHERE t.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + days_ahead
  ORDER BY t.due_date, t.agency;
END;
$$ LANGUAGE plpgsql;
```

## Notification Format

```
🚨 **Tax Deadline Reminder** 🚨

**Agency**: RIM
**Form**: 1601-C (Monthly Remittance Return)
**Due Date**: 2025-12-10
**Days Remaining**: 5

**Description**: Monthly withholding tax remittance

[View Form Guide](https://ipa.insightpulseai.net/docs/tax/1601-c)
```

## Usage

### Manual Trigger
1. Open workflow in n8n
2. Click **"Execute Workflow"**
3. Check Mattermost for notifications

### Schedule
- **Frequency**: Daily at 8 AM
- **Timezone**: Asia/Manila
- **Window**: Next 7 days

## Customization

### Change Notification Window
```javascript
// In "Query Upcoming Deadlines" node
{
  "days_ahead": 14  // Change to 14 days
}
```

### Add Email Notifications
After "Format Notification" node, add:
- **HTTP Request** node
- **URL**: Email service API
- **Body**: Same message content

## Analytics

```sql
-- View notification stats
SELECT
  DATE(created_at) as date,
  COUNT(*) as notifications_sent,
  COUNT(DISTINCT metadata->>'agency') as agencies
FROM notification_log
WHERE type = 'tax_deadline'
AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```
