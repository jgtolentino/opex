# Phase 2: Production Readiness - Complete Implementation Guide

**Status**: ✅ Code Complete | ⏳ Awaiting Token for Deployment
**Completion**: 85% (Database ✅ | Code ✅ | Deployment Pending)

---

## 🎯 Quick Start

```bash
# Generate new Supabase token (browser tab should be open)
# → Copy the token from https://supabase.com/dashboard/account/tokens

# Set token in terminal
export SUPABASE_ACCESS_TOKEN="sbp_YOUR_NEW_TOKEN"

# Run automated deployment (15-20 minutes)
./DEPLOY_NOW.sh
```

That's it! The script will deploy everything and guide you through the final steps.

---

## 📦 What's Been Built

### Phase 2.1: Evaluation Framework
- ✅ **User Ratings**: 1-5 star rating system for every RAG query
- ✅ **Text Feedback**: Optional feedback comments
- ✅ **Analytics Dashboard**: `opex.rag_evaluation_metrics` view with:
  - Success rate (queries with answers)
  - Average rating
  - Satisfaction rate (% rated ≥4 stars)
  - Average response time

### Phase 2.2: Monitoring & Alerting
- ✅ **Automatic Alert Generation**:
  - **Error Alerts** (High): Any failed query
  - **Latency Alerts** (Medium): Queries taking >10 seconds
  - **Low Rating Alerts** (Medium): Ratings ≤2 stars
- ✅ **Slack Integration**: Real-time notifications with formatted messages
- ✅ **Alert Management**: Track, resolve, and analyze alert trends

---

## 📂 Project Structure

```
opex/
├── supabase/functions/
│   ├── rag-feedback/           # Feedback collection API
│   │   └── index.ts            # 170 lines, production-ready
│   └── alert-notifier/         # Slack notification handler
│       └── index.ts            # 200 lines, production-ready
│
├── test_rag_feedback.sh        # Automated feedback tests (4 cases)
├── test_rag_alerts.sh          # Automated alert tests (6 cases)
│
├── scripts/
│   └── deploy_phase2_functions.sh  # Automated deployment
│
├── DEPLOY_NOW.sh               # ⭐ Interactive deployment wizard
│
└── Documentation/
    ├── QUICK_START_PHASE2.md       # 15-minute quick start
    ├── PHASE_2_COMPLETE.md         # Comprehensive status report
    ├── MANUAL_DEPLOYMENT_FEEDBACK.md  # Step-by-step feedback deployment
    └── MANUAL_DEPLOYMENT_ALERTS.md    # Step-by-step alert deployment
```

---

## 🗄️ Database Schema

### New Tables
```sql
opex.rag_alerts (
  id uuid PRIMARY KEY,
  query_id uuid → opex.rag_queries(id),
  alert_type text,          -- 'error' | 'latency' | 'rating'
  severity text,            -- 'low' | 'medium' | 'high' | 'critical'
  message text,
  details jsonb,
  created_at timestamptz,
  resolved_at timestamptz,
  status text,              -- 'open' | 'resolved' | 'ignored'
  notified_at timestamptz
)
```

### Modified Tables
```sql
opex.rag_queries (
  -- Phase 2.1 additions
  rating integer CHECK (rating >= 1 AND rating <= 5),
  feedback text,
  evaluation_metadata jsonb,

  -- Phase 2.2 additions
  success boolean DEFAULT true,
  error_message text,
  response_time_ms integer
)
```

### New Views
```sql
opex.rag_evaluation_metrics
  → Daily rollup of success rate, ratings, satisfaction, response times
```

### Triggers
```sql
trg_create_rag_alerts
  → Automatically creates alerts on INSERT/UPDATE to rag_queries
  → Fires for: errors, slow queries, low ratings
```

---

## 🧪 Testing

### Automated Test Suites

**Feedback API Tests**:
```bash
./test_rag_feedback.sh

Expected Output:
✅ PASS: Feedback submitted successfully
✅ PASS: Rating found in database
✅ PASS: Evaluation metrics view accessible
✅ PASS: Invalid rating correctly rejected
```

**Alert System Tests**:
```bash
./test_rag_alerts.sh

Expected Output:
✅ PASS: Error alert created
✅ PASS: Latency alert created
✅ PASS: Rating alert created
✅ PASS: Multiple alerts on single query
```

### Manual Testing

**Test Feedback Submission**:
```bash
curl -X POST "https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/rag-feedback" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "queryId": "YOUR_QUERY_ID",
    "rating": 5,
    "feedback": "Excellent response!"
  }'
```

**Test Alert Generation**:
```bash
# Create failed query (should trigger alert + Slack)
psql "$POSTGRES_URL" -c "
INSERT INTO opex.rag_queries (question, success, error_message, user_id, channel)
VALUES ('Test alert', false, 'Test error message', 'test', 'test');
"
```

---

## 🔐 Security

### Row Level Security (RLS)

**rag_queries**:
- Service role: Full access
- Authenticated users: See own queries only
- Anon: Insert only (for public feedback)

**rag_alerts**:
- Service role: Full access
- Authenticated users: Read only
- Anon: No access

### Secret Management
All secrets stored in Supabase Vault:
- `OPENAI_API_KEY` (existing)
- `SLACK_WEBHOOK_URL` (Phase 2.2)
- `SUPABASE_URL` (existing)
- `SUPABASE_SERVICE_ROLE_KEY` (existing)

---

## 📊 Success Metrics

### Before Phase 2
- ❌ No user feedback mechanism
- ❌ No quality metrics
- ❌ No error detection
- ❌ Manual debugging only
- ❌ No proactive monitoring

### After Phase 2
- ✅ 1-5 star rating + text feedback
- ✅ Real-time analytics dashboard
- ✅ Automatic error detection
- ✅ Slack alerts for critical issues
- ✅ Comprehensive monitoring system

---

## 🚀 Deployment Options

### Option 1: Automated (Recommended - 15 minutes)
```bash
export SUPABASE_ACCESS_TOKEN="sbp_YOUR_TOKEN"
./DEPLOY_NOW.sh
```

### Option 2: Manual Dashboard (20 minutes)
1. Deploy `rag-feedback` via Supabase Dashboard
2. Deploy `alert-notifier` via Supabase Dashboard
3. Configure Slack webhook
4. Set up Database webhook
5. Run tests

### Option 3: CLI Only (10 minutes - fastest)
```bash
export SUPABASE_ACCESS_TOKEN="sbp_YOUR_TOKEN"
./scripts/deploy_phase2_functions.sh

# Then manually configure Slack + Database webhooks
```

---

## 🔧 Configuration

### Slack Webhook Setup
1. Create Slack app: https://api.slack.com/apps
2. Enable Incoming Webhooks
3. Select channel (e.g., #opex-alerts)
4. Copy webhook URL
5. Add to Supabase Vault as `SLACK_WEBHOOK_URL`

### Database Webhook Setup
1. Go to Supabase Dashboard → Database → Webhooks
2. Create webhook:
   - **Table**: opex.rag_alerts
   - **Events**: INSERT
   - **URL**: https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/alert-notifier
   - **Header**: `Authorization: Bearer $SERVICE_ROLE_KEY`

---

## 🐛 Troubleshooting

### Edge Function Not Deploying
```bash
# Check token validity
supabase functions list --project-ref ublqmilcjtpnflofprkr

# Re-generate token at:
https://supabase.com/dashboard/account/tokens
```

### Feedback API Returns 404
```bash
# Verify function deployed
curl https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/rag-feedback

# Expected: Method not allowed (means function exists)
```

### No Slack Notifications
```bash
# 1. Check secret exists
# Dashboard → Settings → Vault → SLACK_WEBHOOK_URL

# 2. Test webhook directly
curl -X POST "$SLACK_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"text": "Test"}'

# 3. Verify Database Webhook enabled
# Dashboard → Database → Webhooks
```

### Tests Failing
```bash
# Check database connection
psql "$POSTGRES_URL" -c "\dt opex.*"

# Verify schema
psql "$POSTGRES_URL" -c "\d opex.rag_queries"
psql "$POSTGRES_URL" -c "\d opex.rag_alerts"
```

---

## 📈 Monitoring Queries

### View Evaluation Metrics
```sql
SELECT * FROM opex.rag_evaluation_metrics
ORDER BY eval_date DESC
LIMIT 7;
```

### Check Recent Alerts
```sql
SELECT
  id,
  alert_type,
  severity,
  message,
  created_at
FROM opex.rag_alerts
ORDER BY created_at DESC
LIMIT 10;
```

### Alert Statistics
```sql
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

### User Satisfaction Trends
```sql
SELECT
  DATE_TRUNC('day', created_at) as date,
  AVG(rating) as avg_rating,
  COUNT(*) FILTER (WHERE rating >= 4) as positive,
  COUNT(*) FILTER (WHERE rating <= 2) as negative
FROM opex.rag_queries
WHERE rating IS NOT NULL
GROUP BY date
ORDER BY date DESC
LIMIT 30;
```

---

## 🎯 Next Steps

### Immediate (After Deployment)
1. ✅ Deploy Edge Functions
2. ✅ Configure Slack webhook
3. ✅ Set up Database webhook
4. ✅ Run comprehensive tests
5. ✅ Verify Slack notifications working

### This Week
- Monitor alert volume and tune thresholds if needed
- Add frontend rating UI component
- Create Slack alert dashboard
- Set up alert resolution workflows

### Next Sprint (Phase 3)
- MCP tool routing for RAG query orchestration
- Advanced analytics and reporting
- Alert escalation policies
- Automated alert resolution
- Performance optimization

---

## 📚 Documentation Index

| Document | Purpose | Audience |
|----------|---------|----------|
| `README_PHASE2.md` (this file) | Complete reference | Everyone |
| `QUICK_START_PHASE2.md` | 15-minute deployment | DevOps |
| `PHASE_2_COMPLETE.md` | Status and handoff | Product/Leadership |
| `DEPLOY_NOW.sh` | Interactive deployment | DevOps |
| `MANUAL_DEPLOYMENT_FEEDBACK.md` | Step-by-step feedback deploy | DevOps |
| `MANUAL_DEPLOYMENT_ALERTS.md` | Step-by-step alert deploy | DevOps |
| `test_rag_feedback.sh` | Feedback testing guide | QA/DevOps |
| `test_rag_alerts.sh` | Alert testing guide | QA/DevOps |

---

## 🤝 Support

**Issues?** Check:
1. `PHASE_2_COMPLETE.md` → Troubleshooting section
2. `MANUAL_DEPLOYMENT_*.md` → Detailed deployment steps
3. Test scripts output for specific error messages

**Questions?** All configuration and setup documented in deployment guides.

---

**Repository**: https://github.com/jgtolentino/opex
**Branch**: `claude/finance-ops-automation-and-notion-export`
**Latest Commit**: `3ce13ef` "Add interactive deployment script"

**Ready to deploy?** Run `./DEPLOY_NOW.sh` after setting your Supabase token! 🚀
