---
name: Phase 2.1 - Evaluation Framework
about: Add rating system and eval metrics to OpEx RAG
title: '[PHASE 2.1] Implement Evaluation Framework for RAG Queries'
labels: enhancement, production-readiness, rag
assignees: ''
---

## 🎯 Objective

Implement user feedback and evaluation metrics system to track RAG query quality and satisfaction.

## 📋 Tasks

### 1. Database Schema Changes

- [ ] Add rating + feedback columns to `opex.rag_queries`
  ```sql
  ALTER TABLE opex.rag_queries
  ADD COLUMN rating integer CHECK (rating >= 1 AND rating <= 5),
  ADD COLUMN feedback text,
  ADD COLUMN evaluation_metadata jsonb DEFAULT '{}'::jsonb;
  ```

- [ ] Create `opex.rag_evaluation_metrics` view
  ```sql
  CREATE OR REPLACE VIEW opex.rag_evaluation_metrics AS
  SELECT
    DATE_TRUNC('day', created_at) as eval_date,
    COUNT(*) as total_queries,
    COUNT(*) FILTER (WHERE answer IS NOT NULL) as successful_queries,
    ROUND(100.0 * COUNT(*) FILTER (WHERE answer IS NOT NULL) / COUNT(*), 2) as success_rate,
    COUNT(rating) as rated_queries,
    ROUND(AVG(rating), 2) as avg_rating,
    COUNT(*) FILTER (WHERE rating >= 4) as positive_ratings,
    ROUND(100.0 * COUNT(*) FILTER (WHERE rating >= 4) / NULLIF(COUNT(rating), 0), 2) as satisfaction_rate,
    ROUND(AVG((meta->>'response_time_ms')::integer), 0) as avg_response_time_ms,
    COUNT(*) FILTER (WHERE (meta->>'response_time_ms')::integer > 10000) as slow_queries
  FROM opex.rag_queries
  GROUP BY eval_date
  ORDER BY eval_date DESC;
  ```

- [ ] Grant permissions
  ```sql
  GRANT SELECT ON opex.rag_evaluation_metrics TO authenticated, service_role;
  ```

### 2. Edge Function Deployment

- [ ] Create `rag-feedback` Edge Function
  - Location: `supabase/functions/rag-feedback/index.ts`
  - Implementation: See `RAG_AGENTS_AUDIT_REPORT.md` lines 471-522

- [ ] Deploy to Supabase
  ```bash
  supabase functions deploy rag-feedback --project-ref ublqmilcjtpnflofprkr
  ```

### 3. Testing & Validation

- [ ] Test feedback submission
  ```bash
  curl -X POST "https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/rag-feedback" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -d '{"queryId":"<uuid>","rating":5,"feedback":"Excellent response!"}'
  ```

- [ ] Verify rating stored in database
  ```sql
  SELECT id, question, rating, feedback
  FROM opex.rag_queries
  WHERE rating IS NOT NULL
  ORDER BY created_at DESC
  LIMIT 5;
  ```

- [ ] Query evaluation metrics
  ```sql
  SELECT * FROM opex.rag_evaluation_metrics LIMIT 7;
  ```

### 4. Documentation

- [ ] Update `INTEGRATION_GUIDE.md` with feedback API usage
- [ ] Add monitoring queries to `DEPLOYMENT_AUDIT_REPORT.md`
- [ ] Document rating flow in `README.md`

## ✅ Success Criteria

- [x] Users can submit ratings 1-5 stars via API
- [x] Feedback stored in `opex.rag_queries` table
- [x] Analytics view shows:
  - Average rating
  - Satisfaction rate (% ratings ≥4)
  - Response time metrics
  - Query success rate
- [x] Metrics queryable via SQL or Edge Function
- [x] Full verification passes: `./scripts/verify_opex_stack.sh`

## 📚 Reference

- **Implementation Guide**: `RAG_AGENTS_AUDIT_REPORT.md` lines 425-522
- **Verification Script**: `scripts/verify_opex_stack.sh`
- **Integration Guide**: `docs/INTEGRATION_GUIDE.md`

## 🎯 Target Metrics (After Implementation)

- User satisfaction: **≥80% positive ratings (≥4 stars)**
- Rating coverage: **≥50% of queries rated**
- Avg response time: **<5 seconds**

## 🔗 Related Issues

- #[PHASE 2.2] - Monitoring & Alerting
- #[PHASE 3] - MCP Tool Routing

---

**Phase**: 2 (Production Readiness)
**Priority**: High
**Estimated Effort**: 4-6 hours
