# Manual Deployment: Phase 2.2 - Monitoring & Alerting

**Note**: Database changes are already applied. This guide covers Edge Function deployment and Slack webhook configuration.

---

## Current Status

✅ **Database Changes Complete**:
- `opex.rag_alerts` table created with RLS policies
- Trigger function `fn_create_rag_alerts()` created
- Trigger `trg_create_rag_alerts` attached to `opex.rag_queries`

⏳ **Pending**:
- Deploy `alert-notifier` Edge Function
- Configure Slack webhook
- Set up Supabase Database Webhook
- Test end-to-end alert flow

---

## Step 1: Get Slack Webhook URL

### Create Slack Incoming Webhook

1. Go to: https://api.slack.com/apps
2. Click **"Create New App"** → **"From scratch"**
3. App Name: `OpEx RAG Alerts`
4. Workspace: Select your workspace
5. Click **"Create App"**

6. In the left sidebar, click **"Incoming Webhooks"**
7. Toggle **"Activate Incoming Webhooks"** to ON
8. Click **"Add New Webhook to Workspace"**
9. Select channel (e.g., `#opex-alerts` or `#monitoring`)
10. Click **"Allow"**

11. **Copy the Webhook URL** - looks like:
   ```
   https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
   ```

12. **Save this URL securely** - you'll need it for Supabase secrets

---

## Step 2: Set Supabase Secrets

### Option A: Via Supabase Dashboard (Recommended)

1. Go to: https://supabase.com/dashboard/project/ublqmilcjtpnflofprkr/settings/vault
2. Click **"New secret"**
3. Name: `SLACK_WEBHOOK_URL`
4. Value: Paste your Slack webhook URL
5. Click **"Save"**

### Option B: Via Supabase CLI

```bash
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

supabase secrets set SLACK_WEBHOOK_URL="$SLACK_WEBHOOK_URL" \
  --project-ref ublqmilcjtpnflofprkr
```

---

## Step 3: Deploy alert-notifier Edge Function

### Option A: Via Supabase Dashboard (5-10 minutes)

1. Go to: https://supabase.com/dashboard/project/ublqmilcjtpnflofprkr/functions
2. Click **"Create Function"** button

3. **Function Configuration**:
   - **Function Name**: `alert-notifier`
   - **Function Code**: Copy entire contents from `supabase/functions/alert-notifier/index.ts`

4. Paste the code into the editor
5. Click **"Deploy"** button
6. Wait for deployment to complete (~30 seconds)

7. **Verify Deployment**:
   - Function should appear in functions list
   - Status: Active (green indicator)

### Option B: Via Supabase CLI (if auth fixed)

```bash
# Fix auth first
export SUPABASE_ACCESS_TOKEN="sbp_YOUR_NEW_TOKEN_HERE"

# Deploy
supabase functions deploy alert-notifier --project-ref ublqmilcjtpnflofprkr
```

---

## Step 4: Configure Supabase Database Webhook

### Via Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/ublqmilcjtpnflofprkr/database/webhooks
2. Click **"Create a new hook"** button

3. **Webhook Configuration**:
   - **Name**: `RAG Alerts to Slack`
   - **Table**: `opex.rag_alerts`
   - **Events**: ✅ INSERT (check only INSERT, uncheck UPDATE and DELETE)
   - **Type**: HTTP Request
   - **Method**: POST
   - **URL**: `https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/alert-notifier`

4. **HTTP Headers** (click "Add header" for each):
   ```
   Authorization: Bearer YOUR_SERVICE_ROLE_KEY_HERE
   Content-Type: application/json
   ```

   **Replace `YOUR_SERVICE_ROLE_KEY_HERE` with**:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVibHFtaWxjanRwbmZsb2ZwcmtyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyODQyNzI4OSwiZXhwIjoyMDQ0MDAzMjg5fQ.rN0YpnHR0RLtRN8aGKJqt_E2WxFvhL2eHm6ZWy4Hk3A
   ```

5. **Conditions** (optional):
   - Leave blank to send all alerts
   - Or filter by severity: `severity = 'critical'`

6. Click **"Create webhook"**

7. **Test the Webhook**:
   - Click the webhook in the list
   - Click **"Send test event"**
   - Should see success response

---

## Step 5: Test End-to-End Flow

### Run Automated Tests

```bash
# From repo root
chmod +x test_rag_alerts.sh
./test_rag_alerts.sh
```

**Expected Output**:
```
✅ PASS: Error alert created
✅ PASS: Latency alert created
✅ PASS: Rating alert created
✅ PASS: Both error and latency alerts created
✅ PASS: Slack notification sent
```

### Manual Test - Create Failed Query

```bash
# Create a failed query (should trigger error alert + Slack)
psql "$POSTGRES_URL" <<'SQL'
INSERT INTO opex.rag_queries (question, success, error_message, user_id, channel, meta)
VALUES (
  'Manual test: failed query',
  false,
  'Test error message',
  'manual-test',
  'test',
  jsonb_build_object('response_time_ms', 5000)
);
SQL
```

**Expected Result**:
1. Alert created in `opex.rag_alerts` table
2. Slack message received in configured channel
3. Alert `notified_at` timestamp updated

### Check Slack Channel

You should see a message like:
```
🟠 ❌ RAG query failed

Alert Type: error
Severity: high
Time: 2025-01-16 10:30:00
Alert ID: a1b2c3d4
```

---

## Step 6: Verify Monitoring System

### Check Alerts Table

```sql
-- View recent alerts
SELECT
  id,
  alert_type,
  severity,
  message,
  status,
  notified_at,
  created_at
FROM opex.rag_alerts
ORDER BY created_at DESC
LIMIT 10;
```

### Check Alert Statistics

```sql
-- Alert breakdown by type and severity
SELECT
  alert_type,
  severity,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE status = 'open') as open,
  COUNT(*) FILTER (WHERE notified_at IS NOT NULL) as notified
FROM opex.rag_alerts
GROUP BY alert_type, severity
ORDER BY alert_type, severity;
```

### Test Alert Thresholds

The trigger function creates alerts for:

1. **Error Alert** (`severity: high`):
   - Condition: `success = false`
   - Test: Any failed RAG query

2. **Slow Query Alert** (`severity: medium`):
   - Condition: `response_time_ms > 10000` (10 seconds)
   - Test: Insert query with `response_time_ms: 15000`

3. **Low Rating Alert** (`severity: medium`):
   - Condition: `rating IS NOT NULL AND rating <= 2`
   - Test: Submit rating of 1 or 2 stars

---

## Troubleshooting

### Alert not created in database

**Symptom**: Query inserted but no alert in `opex.rag_alerts`

**Solution**:
```sql
-- Check if trigger exists
SELECT * FROM information_schema.triggers
WHERE event_object_table = 'rag_queries'
AND trigger_schema = 'opex';

-- Check if trigger function exists
SELECT proname FROM pg_proc
WHERE proname = 'fn_create_rag_alerts';

-- Manually test trigger function
SELECT opex.fn_create_rag_alerts();
```

### Slack notification not received

**Symptom**: Alert created but no Slack message

**Solutions**:

1. **Check Supabase Database Webhook**:
   - Go to Dashboard → Database → Webhooks
   - Verify webhook is enabled
   - Check "Recent requests" for errors

2. **Check Edge Function Logs**:
   - Go to Dashboard → Edge Functions → alert-notifier
   - Click "Logs" tab
   - Look for errors or failed requests

3. **Verify Slack Webhook URL**:
   ```bash
   # Test Slack webhook directly
   curl -X POST "YOUR_SLACK_WEBHOOK_URL" \
     -H "Content-Type: application/json" \
     -d '{"text": "Test message from curl"}'
   ```

4. **Check Supabase Secrets**:
   - Dashboard → Settings → Vault
   - Verify `SLACK_WEBHOOK_URL` exists and is correct

### Edge Function returns 401 Unauthorized

**Solution**: Regenerate Supabase access token
- Dashboard → Settings → API → Generate new token
- Update environment variable: `export SUPABASE_ACCESS_TOKEN="sbp_NEW_TOKEN"`

### Alert notified_at not updating

**Symptom**: Slack messages sent but `notified_at` remains NULL

**Solution**: Check Edge Function has permission to update alerts
```sql
-- Verify service_role can update
SELECT * FROM pg_policies
WHERE tablename = 'rag_alerts'
AND policyname LIKE '%service%';
```

---

## Next Steps After Deployment

1. ✅ Run `./test_rag_alerts.sh` to verify all alert types
2. ✅ Create real failed query and check Slack
3. ✅ Update `INTEGRATION_GUIDE.md` with alert system usage
4. ✅ Configure alert resolution workflows
5. ✅ Set up alert dashboard in Supabase
6. ✅ Document alert severity escalation

---

## Cleanup Test Data

```bash
# Remove test alerts and queries
psql "$POSTGRES_URL" -c "DELETE FROM opex.rag_alerts WHERE details->>'test' = 'true';"
psql "$POSTGRES_URL" -c "DELETE FROM opex.rag_queries WHERE user_id = 'test-alerts-user';"
```

---

**Status**: Ready for deployment
**Estimated Time**: 15-20 minutes total
**Prerequisites**: Slack workspace with webhook access
