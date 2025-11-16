---
name: Phase 2.2 - Monitoring & Alerting
about: Add proactive monitoring and Slack alerts for OpEx RAG
title: '[PHASE 2.2] Implement Monitoring & Alerting System'
labels: enhancement, production-readiness, monitoring
assignees: ''
---

## 🎯 Objective

Implement proactive monitoring and alerting system to detect errors, slow queries, and performance degradation in real-time.

## 📋 Tasks

### 1. Database Schema Changes

- [ ] Create `opex.rag_alerts` table
  ```sql
  CREATE TABLE IF NOT EXISTS opex.rag_alerts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type text NOT NULL, -- 'error_rate', 'slow_query', 'low_rating'
    severity text NOT NULL, -- 'critical', 'warning', 'info'
    message text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
  );

  GRANT ALL ON opex.rag_alerts TO service_role;
  GRANT SELECT ON opex.rag_alerts TO authenticated;
  ```

- [ ] Create alert trigger function
  ```sql
  CREATE OR REPLACE FUNCTION opex.check_rag_alerts()
  RETURNS trigger AS $$
  DECLARE
    error_rate numeric;
    slow_query_threshold integer := 10000; -- 10 seconds
  BEGIN
    -- Check for errors (no answer)
    IF NEW.answer IS NULL THEN
      INSERT INTO opex.rag_alerts (alert_type, severity, message, metadata)
      VALUES (
        'query_error',
        'warning',
        'RAG query failed',
        jsonb_build_object(
          'query_id', NEW.id,
          'question', NEW.question,
          'error', NEW.meta->'error_message'
        )
      );
    END IF;

    -- Check for slow queries
    IF (NEW.meta->>'response_time_ms')::integer > slow_query_threshold THEN
      INSERT INTO opex.rag_alerts (alert_type, severity, message, metadata)
      VALUES (
        'slow_query',
        'warning',
        'RAG query exceeded 10 seconds',
        jsonb_build_object(
          'query_id', NEW.id,
          'response_time_ms', NEW.meta->'response_time_ms'
        )
      );
    END IF;

    -- Check error rate (last 100 queries)
    SELECT
      ROUND(100.0 * COUNT(*) FILTER (WHERE answer IS NULL) / COUNT(*), 2)
    INTO error_rate
    FROM (
      SELECT answer FROM opex.rag_queries
      ORDER BY created_at DESC
      LIMIT 100
    ) recent;

    IF error_rate > 10 THEN
      INSERT INTO opex.rag_alerts (alert_type, severity, message, metadata)
      VALUES (
        'high_error_rate',
        'critical',
        'Error rate exceeded 10%',
        jsonb_build_object('error_rate', error_rate)
      );
    END IF;

    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  ```

- [ ] Attach trigger to `rag_queries`
  ```sql
  DROP TRIGGER IF EXISTS rag_alerts_trigger ON opex.rag_queries;
  CREATE TRIGGER rag_alerts_trigger
  AFTER INSERT ON opex.rag_queries
  FOR EACH ROW
  EXECUTE FUNCTION opex.check_rag_alerts();
  ```

### 2. Edge Function Deployment

- [ ] Create `alert-notifier` Edge Function
  - Location: `supabase/functions/alert-notifier/index.ts`
  - Implementation: See `RAG_AGENTS_AUDIT_REPORT.md` lines 608-650

- [ ] Set Slack webhook secret
  ```bash
  supabase secrets set SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..." \
    --project-ref ublqmilcjtpnflofprkr
  ```

- [ ] Deploy to Supabase
  ```bash
  supabase functions deploy alert-notifier --project-ref ublqmilcjtpnflofprkr
  ```

### 3. Supabase Database Webhook Configuration

- [ ] Navigate to Supabase Dashboard → Database → Webhooks
- [ ] Create new webhook:
  - **Name**: `RAG Alerts to Slack`
  - **Table**: `opex.rag_alerts`
  - **Events**: INSERT
  - **Type**: HTTP Request
  - **Method**: POST
  - **URL**: `https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/alert-notifier`
  - **Headers**:
    ```
    Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY
    Content-Type: application/json
    ```

### 4. Testing & Validation

- [ ] Test manual alert insertion
  ```sql
  INSERT INTO opex.rag_alerts (alert_type, severity, message, metadata)
  VALUES (
    'test_alert',
    'info',
    'Test alert from manual insertion',
    jsonb_build_object('test', true, 'timestamp', now())
  );
  ```

- [ ] Verify Slack notification received

- [ ] Test slow query alert (simulate >10s response)
  ```sql
  INSERT INTO opex.rag_queries (question, answer, user_id, channel, meta)
  VALUES (
    'Test slow query',
    'Test answer',
    'test-user',
    'test',
    jsonb_build_object('response_time_ms', 15000)
  );
  ```

- [ ] Test error rate alert (insert multiple failed queries)
  ```bash
  for i in {1..15}; do
    psql "$POSTGRES_URL" -c "INSERT INTO opex.rag_queries (question, user_id, channel) VALUES ('Test $i', 'test', 'test');"
  done
  ```

- [ ] Check alerts table
  ```sql
  SELECT * FROM opex.rag_alerts ORDER BY created_at DESC LIMIT 10;
  ```

### 5. Monitoring Dashboard (Optional)

- [ ] Create Supabase SQL query dashboard
  - Recent alerts (last 24 hours)
  - Alert counts by type and severity
  - Error rate trend (last 7 days)

- [ ] Add monitoring queries to `DEPLOYMENT_AUDIT_REPORT.md`

## ✅ Success Criteria

- [x] Alerts fire on:
  - Error rate > 10%
  - Response time > 10 seconds
  - Query failures
- [x] Slack notifications received with:
  - Alert type and severity
  - Error details
  - Timestamp
- [x] Alert history queryable in `rag_alerts` table
- [x] Trigger executes on every `rag_queries` INSERT
- [x] Full verification passes: `./scripts/verify_opex_stack.sh`

## 📚 Reference

- **Implementation Guide**: `RAG_AGENTS_AUDIT_REPORT.md` lines 525-650
- **Slack Webhook Setup**: [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)
- **Supabase Webhooks**: [Database Webhooks Guide](https://supabase.com/docs/guides/database/webhooks)

## 🎯 Alert Thresholds

| Alert Type | Threshold | Severity |
|------------|-----------|----------|
| Error Rate | >10% (last 100 queries) | Critical |
| Slow Query | >10 seconds | Warning |
| Query Failure | Any failure | Warning |
| Low Rating | Avg rating <3.0 (future) | Info |

## 🔗 Related Issues

- #[PHASE 2.1] - Evaluation Framework
- #[PHASE 3] - MCP Tool Routing

---

**Phase**: 2 (Production Readiness)
**Priority**: High
**Estimated Effort**: 4-6 hours
**Dependencies**: Slack workspace webhook URL
