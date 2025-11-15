# OpEx Hybrid Platform - Tasks

> Following GitHub Spec Kit task management format
> Last Updated: 2025-11-15

This document tracks individual work units for the OpEx Hybrid Platform. Tasks are derived from the [PLANNING.md](./PLANNING.md) and [PRD.md](./PRD.md) documents.

## Task Status Legend

- 🟢 **Completed** - Task fully implemented and verified
- 🟡 **In Progress** - Currently being worked on
- 🔴 **Blocked** - Cannot proceed due to dependencies
- ⚪ **Pending** - Not started, ready to begin
- 🔵 **Review** - Awaiting review or testing

---

## Active Sprint Tasks

### 1. RAG Infrastructure (Priority: High)

#### 1.1 Edge Function Deployment
**Status:** 🔴 Blocked
**Assigned to:** DevOps/Admin
**Blocker:** Supabase access token lacks Edge Function deployment permissions
**Dependencies:** None
**Acceptance Criteria:**
- [ ] `opex-rag-query` Edge Function deployed to Supabase
- [ ] Function accessible via HTTPS endpoint
- [ ] JWT verification disabled for public access
- [ ] Function logs visible in Supabase dashboard

**Manual Deployment Steps:**
1. Navigate to https://supabase.com/dashboard/project/ublqmilcjtpnflofprkr/functions
2. Create new function named `opex-rag-query`
3. Upload `supabase/functions/opex-rag-query/index.ts`
4. Configure no-verify-jwt setting
5. Deploy and verify endpoint

**Files:** `supabase/functions/opex-rag-query/index.ts`

---

#### 1.2 Configure Edge Function Secrets
**Status:** ⚪ Pending
**Assigned to:** DevOps/Admin
**Dependencies:** Task 1.1 (Edge Function Deployment)
**Acceptance Criteria:**
- [ ] `OPENAI_API_KEY` set in Supabase secrets
- [ ] `VS_POLICIES_ID` configured
- [ ] `VS_SOPS_WORKFLOWS_ID` configured
- [ ] `VS_EXAMPLES_SYSTEMS_ID` configured
- [ ] Secrets verified via test invocation

**Commands:**
```bash
supabase secrets set \
  OPENAI_API_KEY="$OPENAI_API_KEY" \
  VS_POLICIES_ID="$VS_POLICIES_ID" \
  VS_SOPS_WORKFLOWS_ID="$VS_SOPS_WORKFLOWS_ID" \
  VS_EXAMPLES_SYSTEMS_ID="$VS_EXAMPLES_SYSTEMS_ID" \
  --project-ref ublqmilcjtpnflofprkr
```

**Files:** N/A (Dashboard configuration)

---

#### 1.3 RAG End-to-End Smoke Test
**Status:** ⚪ Pending
**Assigned to:** QA/Developer
**Dependencies:** Tasks 1.1, 1.2
**Acceptance Criteria:**
- [ ] Test script executes without errors
- [ ] Response contains valid answer
- [ ] Citations include source documents
- [ ] Query logged to `opex.rag_queries` table
- [ ] Analytics function returns metrics

**Test Command:**
```bash
tsx scripts/test-opex-rag.ts
```

**Verification Query:**
```sql
SELECT * FROM opex.rag_queries ORDER BY created_at DESC LIMIT 5;
SELECT opex.get_rag_analytics('opex-assistant', 7);
```

**Files:** `scripts/test-opex-rag.ts`

---

#### 1.4 Document Upload to Vector Stores
**Status:** ⚪ Pending
**Assigned to:** Content/Developer
**Dependencies:** Tasks 1.1, 1.2
**Acceptance Criteria:**
- [ ] Policies uploaded to `VS_POLICIES_ID`
- [ ] SOPs/Workflows uploaded to `VS_SOPS_WORKFLOWS_ID`
- [ ] Examples/Systems uploaded to `VS_EXAMPLES_SYSTEMS_ID`
- [ ] Test queries return relevant results from each store
- [ ] Document count verified in OpenAI dashboard

**Script:**
```bash
python scripts/upload_test_documents.py
```

**Files:** `scripts/upload_test_documents.py`

---

### 2. Next.js Application Integration

#### 2.1 Configure Next.js Environment Variables
**Status:** ⚪ Pending
**Assigned to:** Developer
**Dependencies:** None
**Acceptance Criteria:**
- [ ] `.env.local` contains Supabase credentials
- [ ] Vercel environment variables configured
- [ ] Variables accessible in Next.js runtime
- [ ] Build succeeds with new env vars

**Variables:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://ublqmilcjtpnflofprkr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Files:** `.env.local`, Vercel Dashboard

---

#### 2.2 Implement RAG Client Integration
**Status:** 🟢 Completed
**Assigned to:** Developer
**Dependencies:** None
**Acceptance Criteria:**
- [x] `lib/opex/ragClient.ts` created
- [x] `askOpexAssistant()` function implemented
- [x] Type definitions for requests/responses
- [x] Error handling for network failures
- [x] Query metadata logging

**Files:** `lib/opex/ragClient.ts`

---

#### 2.3 Add RAG UI Components
**Status:** ⚪ Pending
**Assigned to:** Frontend Developer
**Dependencies:** Tasks 2.1, 2.2
**Acceptance Criteria:**
- [ ] Chat interface component created
- [ ] Question input with domain/process filters
- [ ] Answer display with citations
- [ ] Loading states and error handling
- [ ] Responsive design for mobile

**Files:**
- `components/OpexChat.tsx`
- `components/OpexChatInput.tsx`
- `components/OpexChatResponse.tsx`

---

### 3. Skills & Prompt Packs

#### 3.1 Validate BPM Agent Skills
**Status:** 🟢 Completed
**Assigned to:** QA
**Dependencies:** None
**Acceptance Criteria:**
- [x] 4 BPM agent skills installed (copywriter, knowledge_agent, learning_designer, transformation_partner)
- [x] CTO Mentor skill installed
- [x] Each skill has README and configuration
- [x] Skills accessible via Claude Code CLI

**Files:** `skills/*/`

---

#### 3.2 Test Prompt Pack Templates
**Status:** ⚪ Pending
**Assigned to:** QA
**Dependencies:** None
**Acceptance Criteria:**
- [ ] Finance prompt pack tested with sample data
- [ ] HR prompt pack tested with sample data
- [ ] Engineering prompt pack tested with sample data
- [ ] Variables correctly substituted
- [ ] Output matches expected format

**Test Command:**
```bash
# Test finance prompt pack
cat prompt-packs/finance/budget_variance_analysis.json | jq
```

**Files:** `prompt-packs/*/`

---

### 4. Documentation

#### 4.1 Update Deployment Guides
**Status:** 🟡 In Progress
**Assigned to:** Technical Writer
**Dependencies:** Tasks 1.1, 1.2
**Acceptance Criteria:**
- [ ] `DEPLOYMENT_STATUS.md` reflects latest deployment state
- [ ] `MANUAL_DEPLOYMENT_GUIDE.md` includes Edge Function steps
- [ ] Screenshots added for Supabase dashboard steps
- [ ] Troubleshooting section updated

**Files:**
- `DEPLOYMENT_STATUS.md`
- `MANUAL_DEPLOYMENT_GUIDE.md`

---

#### 4.2 Create API Documentation
**Status:** ⚪ Pending
**Assigned to:** Technical Writer
**Dependencies:** Task 1.1
**Acceptance Criteria:**
- [ ] Edge Function API endpoints documented
- [ ] Request/response schemas defined
- [ ] Example curl commands provided
- [ ] Error codes and messages listed
- [ ] Rate limiting documented

**Files:** `docs/docs/api-reference/rag-query.md`

---

#### 4.3 Update Docusaurus Documentation
**Status:** ⚪ Pending
**Assigned to:** Technical Writer
**Dependencies:** Tasks 4.1, 4.2
**Acceptance Criteria:**
- [ ] RAG integration guide added to docs
- [ ] Skills usage guide updated
- [ ] Prompt pack examples added
- [ ] Architecture diagrams updated
- [ ] Docs site rebuilt and deployed

**Build Command:**
```bash
cd docs && pnpm build && pnpm deploy
```

**Files:** `docs/docs/**/*.md`

---

### 5. Testing & Quality Assurance

#### 5.1 Unit Test Coverage
**Status:** ⚪ Pending
**Assigned to:** Developer
**Dependencies:** None
**Acceptance Criteria:**
- [ ] `ragClient.ts` unit tests written
- [ ] Edge Function unit tests added
- [ ] Mocks for OpenAI API calls
- [ ] Test coverage > 80%
- [ ] All tests passing

**Test Command:**
```bash
pnpm test
```

**Files:** `lib/opex/__tests__/ragClient.test.ts`

---

#### 5.2 Integration Testing
**Status:** ⚪ Pending
**Assigned to:** QA
**Dependencies:** Tasks 1.1, 1.2, 1.3
**Acceptance Criteria:**
- [ ] End-to-end test suite created
- [ ] RAG query flow tested
- [ ] Error scenarios tested (API failure, rate limits)
- [ ] Performance benchmarks established
- [ ] CI/CD pipeline runs tests

**Files:** `__tests__/integration/rag.test.ts`

---

#### 5.3 Load Testing
**Status:** ⚪ Pending
**Assigned to:** QA/DevOps
**Dependencies:** Task 1.1
**Acceptance Criteria:**
- [ ] Load test script created (k6 or Artillery)
- [ ] Baseline performance metrics established
- [ ] Concurrent user simulation (10, 50, 100 users)
- [ ] Response time < 2s at p95
- [ ] Error rate < 1%

**Test Script:** `scripts/load-test-rag.js`

---

### 6. Deployment & Operations

#### 6.1 Configure Vercel Production Environment
**Status:** ⚪ Pending
**Assigned to:** DevOps
**Dependencies:** Task 2.1
**Acceptance Criteria:**
- [ ] Production environment variables set
- [ ] Domain configured (if applicable)
- [ ] Build and deploy successful
- [ ] ISR revalidation working
- [ ] Analytics configured

**Deployment:**
```bash
pnpm deploy
```

---

#### 6.2 Set Up Monitoring & Alerts
**Status:** ⚪ Pending
**Assigned to:** DevOps
**Dependencies:** Task 6.1
**Acceptance Criteria:**
- [ ] Supabase logs monitored
- [ ] Vercel analytics configured
- [ ] Error tracking (Sentry or similar)
- [ ] Uptime monitoring (Uptime Robot or similar)
- [ ] Slack/email alerts for critical errors

**Services:**
- Supabase Logs
- Vercel Analytics
- Sentry (optional)

---

#### 6.3 Create Runbook
**Status:** ⚪ Pending
**Assigned to:** DevOps/Technical Writer
**Dependencies:** Tasks 6.1, 6.2
**Acceptance Criteria:**
- [ ] Common issues documented
- [ ] Troubleshooting steps provided
- [ ] Escalation procedures defined
- [ ] On-call rotation documented
- [ ] Incident response playbook created

**Files:** `docs/runbook.md`

---

## Backlog Tasks

### 7. Future Enhancements (Priority: Medium)

#### 7.1 Multi-Language Support
**Status:** ⚪ Pending
**Acceptance Criteria:**
- [ ] i18n library integrated (next-i18next)
- [ ] English and Filipino translations
- [ ] Language switcher UI component
- [ ] RAG queries support language parameter

---

#### 7.2 User Authentication
**Status:** ⚪ Pending
**Acceptance Criteria:**
- [ ] Supabase Auth configured
- [ ] Login/signup UI components
- [ ] Protected routes implemented
- [ ] User-specific query history

---

#### 7.3 Advanced Analytics Dashboard
**Status:** ⚪ Pending
**Acceptance Criteria:**
- [ ] Query trends visualization
- [ ] Popular questions dashboard
- [ ] User engagement metrics
- [ ] Export to CSV/PDF

---

#### 7.4 Voice Agent Integration
**Status:** ⚪ Pending
**Acceptance Criteria:**
- [ ] Voice agent RAG backend connected
- [ ] STT/TTS pipeline tested
- [ ] Voice commands for RAG queries
- [ ] Mobile voice interface

**Files:** `voice_agent.py`

---

### 8. Technical Debt (Priority: Low)

#### 8.1 Migrate to OpenAI SDK v2
**Status:** ⚪ Pending
**Acceptance Criteria:**
- [ ] Upgrade OpenAI SDK dependency
- [ ] Update API calls to new format
- [ ] Test all RAG functionality
- [ ] Update documentation

---

#### 8.2 Refactor Site Config
**Status:** ⚪ Pending
**Acceptance Criteria:**
- [ ] Update placeholder values in `site.config.ts`
- [ ] Configure custom domain
- [ ] Update social links
- [ ] Customize Notion page mappings

**Files:** `site.config.ts`

---

#### 8.3 Optimize Bundle Size
**Status:** ⚪ Pending
**Acceptance Criteria:**
- [ ] Run bundle analyzer
- [ ] Lazy load heavy components
- [ ] Tree-shake unused dependencies
- [ ] Bundle size < 500KB (main)

**Command:**
```bash
pnpm analyze
```

---

## Task Metrics

### Sprint Progress (Current)
- **Total Tasks:** 21
- **Completed:** 2 (9.5%)
- **In Progress:** 1 (4.8%)
- **Blocked:** 1 (4.8%)
- **Pending:** 17 (81%)

### Priority Breakdown
- **High:** 7 tasks (RAG Infrastructure, Next.js Integration)
- **Medium:** 10 tasks (Documentation, Testing, Deployment)
- **Low:** 4 tasks (Future Enhancements, Technical Debt)

### Estimated Effort
- **High Priority:** ~40 hours
- **Medium Priority:** ~60 hours
- **Low Priority:** ~30 hours
- **Total:** ~130 hours

---

## Related Documents

- [PRD.md](./PRD.md) - Product Requirements Document
- [PLANNING.md](./PLANNING.md) - Strategic Planning
- [CHANGELOG.md](./CHANGELOG.md) - Version History
- [CLAUDE.md](./CLAUDE.md) - AI Assistant Guide
- [DEPLOYMENT_STATUS.md](./DEPLOYMENT_STATUS.md) - Current Deployment State

---

## Notes

**Convention:** Task IDs follow the format `{Section}.{Task}` (e.g., 1.1, 1.2)

**Updates:** This document should be updated weekly or when task statuses change significantly.

**Blocked Tasks:** Blocked tasks require immediate attention and should be escalated to project stakeholders.

**Sprint Cycle:** 2-week sprints with retrospectives every Friday.
