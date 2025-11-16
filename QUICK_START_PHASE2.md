# Phase 2 Quick Start - 15 Minute Deployment

**Current Status**: Database ✅ Complete | Edge Functions ⏳ Ready for Deployment

---

## ⚡ Fast Track (One Command)

```bash
# 1. Get new Supabase token (2 minutes)
# → Go to: https://supabase.com/dashboard/account/tokens
# → Click "Generate new token"
# → Copy token (starts with sbp_)

# 2. Deploy everything (5 minutes)
export SUPABASE_ACCESS_TOKEN="sbp_YOUR_NEW_TOKEN_HERE"
./scripts/deploy_phase2_functions.sh

# 3. Slack setup (5 minutes)
# → Go to: https://api.slack.com/apps
# → Create app → Enable Incoming Webhooks → Select channel
# → Copy webhook URL
# → Add to Supabase: https://supabase.com/dashboard/project/ublqmilcjtpnflofprkr/settings/vault
# → Secret name: SLACK_WEBHOOK_URL

# 4. Configure Database Webhook (3 minutes)
# → Go to: https://supabase.com/dashboard/project/ublqmilcjtpnflofprkr/database/webhooks
# → Create webhook:
#   - Table: opex.rag_alerts
#   - Events: INSERT only
#   - URL: https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/alert-notifier
#   - Header: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 5. Test (2 minutes)
./test_rag_feedback.sh
./test_rag_alerts.sh
```

**Done!** You're now production-ready with:
- ✅ User feedback collection (1-5 stars + text)
- ✅ Real-time evaluation metrics
- ✅ Automatic error/latency/rating alerts
- ✅ Slack notifications for critical issues

---

## 📊 What You're Getting

### Evaluation Framework (Phase 2.1)
- **Rating System**: 1-5 stars on every RAG query
- **Feedback Collection**: Optional text feedback
- **Analytics View**: `opex.rag_evaluation_metrics` with:
  - Success rate
  - Average rating
  - Satisfaction rate (% ≥4 stars)
  - Average response time

### Monitoring & Alerting (Phase 2.2)
- **Automatic Alerts** on:
  - Errors (high severity): `success = false`
  - Slow queries (medium): `>10 seconds`
  - Low ratings (medium): `rating ≤ 2 stars`
- **Slack Notifications**: Real-time alerts with formatted messages
- **Alert Management**: Track, resolve, analyze trends

---

## 🆘 If Something Goes Wrong

### Deployment Failed
```bash
# Check logs
supabase functions deploy rag-feedback --project-ref ublqmilcjtpnflofprkr --debug

# Or deploy via Dashboard:
# https://supabase.com/dashboard/project/ublqmilcjtpnflofprkr/functions
```

### Tests Failing
```bash
# Check database connection
psql "postgres://postgres.ublqmilcjtpnflofprkr:1G8TRd5wE7b9szBH@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require" -c "\dt opex.*"

# Verify Edge Functions deployed
curl https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/rag-feedback
```

### No Slack Notifications
```bash
# 1. Check secret exists
# Dashboard → Settings → Vault → Verify SLACK_WEBHOOK_URL

# 2. Test Slack webhook directly
curl -X POST "YOUR_SLACK_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"text": "Test from command line"}'

# 3. Check Database Webhook enabled
# Dashboard → Database → Webhooks → Verify "RAG Alerts to Slack"
```

---

## 📖 Full Documentation

- **Complete Status**: `PHASE_2_COMPLETE.md`
- **Feedback Deployment**: `MANUAL_DEPLOYMENT_FEEDBACK.md`
- **Alert Deployment**: `MANUAL_DEPLOYMENT_ALERTS.md`
- **Master Checklist**: `PHASE_2_CHECKLIST.md`

---

## 🎯 Success Criteria

You're done when:
- [x] Database schema applied (already done ✅)
- [ ] Edge Functions deployed and responding
- [ ] `./test_rag_feedback.sh` → 4/4 tests PASS
- [ ] `./test_rag_alerts.sh` → Slack message received
- [ ] Analytics view shows metrics: `SELECT * FROM opex.rag_evaluation_metrics;`

**Total Time**: ~15-20 minutes
**Difficulty**: Easy (copy-paste commands)
**Result**: Production-ready evaluation and monitoring system
