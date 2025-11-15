# Product Requirements Document (PRD)
## OpEx Hybrid Platform - AI-Powered Knowledge Management for Finance SSCs

---

**Document Version:** 2.0.0
**Last Updated:** 2025-11-15
**Status:** Active
**Product Manager:** Jake Tolentino
**Target Release:** Q1 2025

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Product Vision & Goals](#3-product-vision--goals)
4. [Target Users & Personas](#4-target-users--personas)
5. [User Stories & Use Cases](#5-user-stories--use-cases)
6. [Functional Requirements](#6-functional-requirements)
7. [Process-Oriented Requirements](#7-process-oriented-requirements)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [User Experience Requirements](#9-user-experience-requirements)
10. [Data Requirements](#10-data-requirements)
11. [Integration Requirements](#11-integration-requirements)
12. [Security & Compliance Requirements](#12-security--compliance-requirements)
13. [Success Metrics](#13-success-metrics)
14. [Release Plan & Roadmap](#14-release-plan--roadmap)
15. [Out of Scope](#15-out-of-scope)
16. [Dependencies & Constraints](#16-dependencies--constraints)
17. [Glossary](#17-glossary)
18. [Appendix](#18-appendix)

---

## 1. Executive Summary

### 1.1 Product Overview

The **OpEx Hybrid Platform** is an AI-powered knowledge management and operational excellence system designed specifically for Philippine Finance Shared Service Centers (SSCs). It combines static content from Notion with dynamic AI assistance via Retrieval-Augmented Generation (RAG) to help SSC staff access policies, procedures, and best practices instantly.

### 1.2 Business Opportunity

**Market:** 8 Philippine government finance agencies serving 200,000+ government employees

**Problem:** SSC staff spend 2-4 hours daily searching for policy documents, SOPs, and regulatory guidance across fragmented systems (email, SharePoint, physical files)

**Solution:** Centralized knowledge hub with AI-powered Q&A that delivers contextual answers in < 2 seconds

**Impact:**
- 30% reduction in time spent searching for information
- 50% reduction in compliance errors
- 90% user satisfaction with answer relevance

### 1.3 Strategic Alignment

**Government Digital Transformation Agenda:**
- Aligns with Presidential Digital Transformation Strategy
- Supports Civil Service Commission's competency framework
- Enables DBM's budget modernization initiatives

**Finance SSC Objectives:**
- Improve service delivery to client agencies
- Enhance staff productivity and satisfaction
- Ensure regulatory compliance (BIR, COA, DBM)
- Foster knowledge sharing across agencies

---

## 2. Problem Statement

### 2.1 Current Pain Points

**For SSC Staff (Finance Officers, Budget Analysts, Procurement Officers):**

1. **Information Fragmentation**
   - Policies scattered across 10+ systems
   - No single source of truth
   - Outdated documents still in circulation

2. **Search Inefficiency**
   - Generic search tools (Ctrl+F in PDFs)
   - Cannot find contextual answers
   - Must ask supervisors or colleagues repeatedly

3. **Onboarding Challenges**
   - 3-6 months to become productive
   - Heavy reliance on mentorship
   - Knowledge gaps when mentors leave

4. **Compliance Risks**
   - Unintentional non-compliance due to lack of awareness
   - Difficulty tracking regulatory changes
   - No audit trail for policy consultation

**For Managers (Division Chiefs, Directors):**

1. **Bottlenecks**
   - Constant interruptions for policy clarifications
   - Cannot scale knowledge transfer
   - Inconsistent guidance across teams

2. **Quality Control**
   - Errors due to outdated information
   - Difficult to enforce standard processes
   - No visibility into knowledge gaps

3. **Reporting Burden**
   - Manual compilation of metrics
   - Cannot identify training needs systematically
   - Lack of data-driven insights

### 2.2 Root Causes

1. **Legacy Systems:** Built before cloud/AI era
2. **Siloed Organizations:** Agencies operate independently
3. **Resource Constraints:** Limited IT budgets and staff
4. **Change Resistance:** Cultural preference for traditional methods

### 2.3 Impact

**Quantified Costs:**
- **Time:** 800 hours/year per staff member searching for information
- **Errors:** 15% of transactions require rework due to policy non-compliance
- **Turnover:** 20% annual attrition due to frustration

**Strategic Costs:**
- Delayed digital transformation initiatives
- Poor citizen satisfaction with government services
- Inability to attract top talent

---

## 3. Product Vision & Goals

### 3.1 Vision Statement

> "Empower every Philippine Finance SSC professional with instant, accurate, and contextual knowledge, enabling them to deliver exceptional public service while maintaining the highest standards of compliance and efficiency."

### 3.2 Product Goals

**Primary Goals (Must-Have):**

1. **Instant Knowledge Access**
   - Users find answers to policy questions in < 2 seconds
   - 90% of queries answered without human intervention

2. **Centralized Documentation**
   - 100% of active policies, SOPs, and references indexed
   - Single source of truth for all SSC knowledge

3. **Contextual Intelligence**
   - AI understands domain-specific terminology (BIR, DBM, COA)
   - Answers tailored to user's role and agency

**Secondary Goals (Should-Have):**

4. **Workflow Automation**
   - 20+ routine tasks automated (report generation, notifications)
   - Integration with existing systems (HRIS, ERP)

5. **Continuous Learning**
   - System improves from user feedback
   - Identifies knowledge gaps and suggests content updates

**Stretch Goals (Nice-to-Have):**

6. **Multi-Modal Access**
   - Voice interface for hands-free queries
   - Mobile app for field operations

7. **Predictive Analytics**
   - Anticipate user needs based on context
   - Proactive alerts for regulatory changes

### 3.3 Business Goals

**Year 1:**
- 80% adoption rate across 3 pilot SSC functions
- 30% reduction in time spent searching for information
- 50% reduction in supervisor interruptions

**Year 2:**
- Expand to all 8 finance agencies
- 90% user satisfaction score
- ROI: 300% (time saved + error reduction)

**Year 3:**
- Open-source community with 100+ contributors
- Platform adopted by 5 other government sectors (health, education, etc.)
- Self-sustaining through cost savings

---

## 4. Target Users & Personas

### 4.1 Primary Personas

#### Persona 1: Maria - Budget Analyst (25-35 years old)

**Profile:**
- 2-5 years experience in government
- College degree in Accounting or Finance
- Works at DBM Regional Office
- Handles budget preparation and monitoring

**Goals:**
- Quickly understand new DBM circulars
- Prepare accurate budget reports
- Avoid errors that delay agency operations

**Pain Points:**
- Cannot find specific sections of 200-page budget manual
- Afraid to ask supervisor "stupid questions"
- Misses deadlines due to confusion about requirements

**User Needs:**
- Simple search interface (no training required)
- Answers with specific citations (page numbers, clause references)
- Examples of correctly filled forms

**Quote:** *"I just need to know if I can reallocate this budget item. It takes me 30 minutes to find the answer in the manual."*

---

#### Persona 2: Roberto - Tax Compliance Officer (35-50 years old)

**Profile:**
- 10+ years experience in government
- CPA license, BIR-accredited
- Works at DOF Finance Service
- Processes withholding taxes, VAT, income tax

**Goals:**
- Stay updated with frequent BIR regulation changes
- File taxes correctly and on time
- Train junior staff on tax compliance

**Pain Points:**
- BIR issues 50+ revenue regulations annually
- Difficult to determine which regulation applies
- No centralized repository of tax forms and guides

**User Needs:**
- Alert system for new regulations affecting his agency
- Historical context (when did this rule change?)
- Decision trees for complex tax scenarios

**Quote:** *"Every time BIR issues a new revenue memo, I spend hours figuring out what changed and how it affects us."*

---

#### Persona 3: Linda - Procurement Officer (30-45 years old)

**Profile:**
- 5-10 years experience in government
- Handles bidding, contracts, supplier management
- Works at GPPB Secretariat
- Must comply with RA 9184 (Procurement Law)

**Goals:**
- Conduct compliant procurements
- Avoid COA audit findings
- Streamline procurement processes

**Pain Points:**
- Procurement law is complex (100+ pages)
- Frequent clarifications from GPPB
- Difficult to justify decisions during audits

**User Needs:**
- Step-by-step process guides
- Compliance checklists
- Audit trail of policy consultations

**Quote:** *"I need to prove that I followed the correct process. If COA asks, I should be able to show I checked the rules."*

---

### 4.2 Secondary Personas

#### Persona 4: Manager - Division Chief

**Needs:**
- Dashboard of team knowledge gaps
- Analytics on common policy questions
- Automated reporting

#### Persona 5: Content Admin - Knowledge Manager

**Needs:**
- Easy content upload and organization
- Workflow for content approval
- Version control for documents

#### Persona 6: Executive - Finance Director

**Needs:**
- ROI metrics (time saved, error reduction)
- Compliance audit reports
- Strategic insights from usage data

---

## 5. User Stories & Use Cases

### 5.1 Epic 1: Knowledge Discovery

#### User Story 1.1: Quick Policy Lookup

**As** Maria (Budget Analyst)
**I want to** ask a question in plain language
**So that** I can get an instant answer without reading 200-page manuals

**Acceptance Criteria:**
- Given I type "Can I reallocate from MOOE to Capital Outlay?"
- When I submit the query
- Then I receive an answer within 2 seconds
- And the answer includes specific DBM circular citations
- And I can click citations to view the source document

**Priority:** P0 (Must-Have)

---

#### User Story 1.2: Domain-Specific Search

**As** Roberto (Tax Officer)
**I want to** filter search results by domain (e.g., "BIR regulations")
**So that** I only see tax-related answers, not HR or procurement policies

**Acceptance Criteria:**
- Given I select "Tax Compliance" domain filter
- When I search for "withholding tax rate"
- Then results only come from BIR regulations and tax circulars
- And results are ranked by relevance and recency

**Priority:** P0 (Must-Have)

---

#### User Story 1.3: Multi-Step Process Guidance

**As** Linda (Procurement Officer)
**I want to** see step-by-step instructions for competitive bidding
**So that** I don't miss any required steps

**Acceptance Criteria:**
- Given I ask "How do I conduct competitive bidding for IT equipment?"
- When I receive the answer
- Then it includes a numbered checklist of steps
- And each step links to relevant GPPB resolutions
- And I can mark steps as complete

**Priority:** P1 (Should-Have)

---

### 5.2 Epic 2: Content Management

#### User Story 2.1: Document Upload

**As** a Knowledge Manager
**I want to** upload new policy documents in bulk
**So that** they are automatically indexed and searchable

**Acceptance Criteria:**
- Given I have 100 PDF files
- When I upload them to the system
- Then they are chunked, embedded, and added to the vector store
- And I receive a confirmation with upload status
- And errors (corrupted files, duplicates) are flagged

**Priority:** P1 (Should-Have)

---

#### User Story 2.2: Content Versioning

**As** a Knowledge Manager
**I want to** track versions of policy documents
**So that** users see the most current version but can access history

**Acceptance Criteria:**
- Given a policy document is updated
- When I upload the new version
- Then the old version is archived with timestamp
- And users querying old date ranges see the correct version
- And I can revert to a previous version if needed

**Priority:** P2 (Nice-to-Have)

---

### 5.3 Epic 3: Analytics & Reporting

#### User Story 3.1: Usage Dashboard

**As** a Division Chief
**I want to** see what questions my team is asking
**So that** I can identify training needs

**Acceptance Criteria:**
- Given I access the analytics dashboard
- When I filter by my team
- Then I see top 10 queries this week
- And queries categorized by domain
- And I can export data to Excel

**Priority:** P1 (Should-Have)

---

#### User Story 3.2: Compliance Audit Trail

**As** Linda (Procurement Officer)
**I want to** generate a report of all policy consultations for a specific procurement
**So that** I can provide evidence during COA audits

**Acceptance Criteria:**
- Given I tagged my queries with procurement ID "PR-2025-001"
- When I request an audit trail
- Then I receive a PDF report with:
  - Date and time of each query
  - Question asked
  - Answer provided with citations
  - User who asked (me)

**Priority:** P1 (Should-Have)

---

### 5.4 Epic 4: Workflow Automation

#### User Story 4.1: New Regulation Alerts

**As** Roberto (Tax Officer)
**I want to** receive notifications when BIR issues new regulations
**So that** I stay updated without manually checking daily

**Acceptance Criteria:**
- Given BIR publishes a new revenue regulation
- When the system detects it (via webhook or scheduled scrape)
- Then I receive an email notification within 24 hours
- And the notification includes a summary and link to full text
- And the regulation is auto-indexed in the RAG system

**Priority:** P2 (Nice-to-Have)

---

### 5.5 Use Case Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    OpEx Platform                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐                                          │
│  │ Budget   │──> Ask Policy Question                   │
│  │ Analyst  │──> View Citations                        │
│  └──────────┘                                          │
│                                                         │
│  ┌──────────┐                                          │
│  │ Tax      │──> Filter by Domain (BIR)                │
│  │ Officer  │──> Set Regulation Alerts                 │
│  └──────────┘                                          │
│                                                         │
│  ┌──────────┐                                          │
│  │Procure-  │──> Request Process Guide                 │
│  │ment Ofc. │──> Generate Audit Trail                  │
│  └──────────┘                                          │
│                                                         │
│  ┌──────────┐                                          │
│  │Knowledge │──> Upload Documents                      │
│  │ Manager  │──> Manage Content Versions               │
│  └──────────┘                                          │
│                                                         │
│  ┌──────────┐                                          │
│  │Division  │──> View Team Analytics                   │
│  │ Chief    │──> Identify Knowledge Gaps               │
│  └──────────┘                                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Functional Requirements

### 6.1 RAG Query System (FR-RAG)

#### FR-RAG-001: Natural Language Question Input
**Priority:** P0
**Description:** Users shall be able to type questions in plain English or Filipino
**Acceptance Criteria:**
- Text input field accepts up to 500 characters
- Supports English and Filipino (Tagalog)
- Auto-completes common question patterns
- Validates input (no SQL injection, XSS)

---

#### FR-RAG-002: Domain and Process Filtering
**Priority:** P0
**Description:** Users shall be able to filter queries by domain and process
**Acceptance Criteria:**
- Dropdown menus for domain (Finance, HR, Procurement, etc.)
- Dropdown menus for process (Budget Preparation, Tax Filing, etc.)
- Filters affect vector store routing logic
- Can save favorite filters per user

---

#### FR-RAG-003: Answer with Citations
**Priority:** P0
**Description:** System shall provide answers with specific source citations
**Acceptance Criteria:**
- Answer text displayed clearly
- Citations listed with document title, section, page number
- Citations are clickable links to source documents
- If answer confidence is low (< 70%), system disclaims uncertainty

---

#### FR-RAG-004: Query Logging
**Priority:** P0
**Description:** All queries shall be logged for analytics and audit
**Acceptance Criteria:**
- Logged to `opex.rag_queries` table
- Includes: question, answer, citations, metadata (domain, process)
- Logged within 100ms of query completion
- Personal data anonymized or tokenized

---

#### FR-RAG-005: Response Time SLA
**Priority:** P0
**Description:** System shall respond to queries within 2 seconds at p95
**Acceptance Criteria:**
- Measured from API call to response received
- Excludes network latency on user's side
- Monitored via Supabase logs and Vercel analytics

---

### 6.2 Content Management (FR-CM)

#### FR-CM-001: Document Upload
**Priority:** P1
**Description:** Admins shall be able to upload documents to vector stores
**Acceptance Criteria:**
- Supports PDF, DOCX, TXT, MD formats
- Batch upload up to 100 files at once
- Automatic chunking (500-1000 tokens per chunk)
- Duplicate detection (hash-based)

---

#### FR-CM-002: Metadata Tagging
**Priority:** P1
**Description:** Each document shall be tagged with domain, process, version, date
**Acceptance Criteria:**
- Metadata form during upload
- Required fields: domain, document_type
- Optional fields: process, agency, effective_date
- Metadata stored in vector store and database

---

#### FR-CM-003: Content Search and Browse
**Priority:** P1
**Description:** Users shall be able to browse all indexed documents
**Acceptance Criteria:**
- Browse by domain, process, agency
- Full-text search within documents
- Sort by relevance, date, title
- Paginated results (20 per page)

---

### 6.3 User Interface (FR-UI)

#### FR-UI-001: Responsive Design
**Priority:** P0
**Description:** UI shall work on desktop, tablet, and mobile
**Acceptance Criteria:**
- Tested on Chrome, Firefox, Safari, Edge
- Breakpoints: mobile (< 768px), tablet (768-1024px), desktop (> 1024px)
- Touch-friendly controls on mobile
- Passes WCAG 2.1 AA accessibility standards

---

#### FR-UI-002: Dark Mode
**Priority:** P2
**Description:** Users shall be able to toggle dark mode
**Acceptance Criteria:**
- Dark mode toggle in header
- Preference saved to localStorage
- Smooth transition animation (< 300ms)

---

#### FR-UI-003: Chat-Style Interface
**Priority:** P1
**Description:** RAG queries shall be presented in a chat interface
**Acceptance Criteria:**
- User questions on right (blue bubbles)
- AI answers on left (gray bubbles)
- Scrollable history within session
- Option to clear history

---

### 6.4 Analytics & Reporting (FR-AR)

#### FR-AR-001: Usage Dashboard
**Priority:** P1
**Description:** Admins shall have access to a usage dashboard
**Acceptance Criteria:**
- Metrics: total queries, unique users, avg response time
- Time series charts (daily, weekly, monthly)
- Top 10 queries
- Export to CSV

---

#### FR-AR-002: Query Feedback
**Priority:** P1
**Description:** Users shall be able to rate answer quality
**Acceptance Criteria:**
- Thumbs up/down on each answer
- Optional text feedback (up to 200 chars)
- Feedback stored in database
- Low-rated answers flagged for review

---

## 7. Process-Oriented Requirements

> Following SAP Signavio Process Intelligence principles

### 7.1 Process Dictionary

**Budget Preparation Process:**
1. **Inputs:** DBM Budget Call, Agency Priorities
2. **Steps:** Draft budget, Review, Submit, Consolidate
3. **Outputs:** Approved Budget (GAA)
4. **Roles:** Budget Analyst (preparer), Division Chief (reviewer), DBM (approver)
5. **Systems:** eBudget, OpEx Platform
6. **Policies:** DBM National Budget Memorandum, Budget Operations Manual

**Tax Filing Process:**
1. **Inputs:** Financial transactions, Payroll data
2. **Steps:** Compute tax, Prepare forms, File to BIR, Pay tax
3. **Outputs:** BIR forms (2316, 1601C, etc.), Payment confirmation
4. **Roles:** Tax Officer (preparer), Finance Chief (approver), BIR (receiver)
5. **Systems:** HRIS, eFPS, OpEx Platform
6. **Policies:** Tax Code, BIR Revenue Regulations

### 7.2 Process Requirements

#### PR-001: Process Coverage
**Requirement:** Platform shall support all core SSC processes
**Processes Covered:**
- Budget preparation and execution (DBM)
- Tax compliance (BIR)
- Procurement (GPPB)
- Financial reporting (COA)
- HR services (CSC)

**Acceptance Criteria:**
- At least 5 policy documents per process
- Process-specific prompt packs available
- Domain filters map to processes

---

#### PR-002: Role-Based Knowledge Access
**Requirement:** Content shall be filtered by user role
**Roles:**
- Budget Analyst → DBM circulars, budget manuals
- Tax Officer → BIR regulations, tax guides
- Procurement Officer → GPPB resolutions, RA 9184

**Acceptance Criteria:**
- Users assigned roles during onboarding
- Search results prioritized by role
- Irrelevant content hidden (optional)

---

#### PR-003: Process Compliance Tracking
**Requirement:** System shall track policy consultations per process instance
**Example:**
- Procurement PR-2025-001 has 10 policy consultations
- Budget submission FY2026 has 50 policy consultations

**Acceptance Criteria:**
- Users can tag queries with process instance ID
- Audit trail report generated on demand
- Compliance dashboard shows coverage (% of processes with consultations)

---

### 7.3 Process Attributes

**Custom Attributes (Metadata):**
- **Priority:** High, Medium, Low
- **Frequency:** Daily, Weekly, Monthly, Quarterly, Annual
- **Complexity:** Simple, Moderate, Complex
- **Compliance Risk:** Critical, High, Medium, Low
- **Automation Potential:** Fully, Partially, Manual

**Example Attribute Mapping:**

| Process | Priority | Frequency | Complexity | Compliance Risk | Automation Potential |
|---------|----------|-----------|------------|-----------------|---------------------|
| Budget Preparation | High | Annual | Complex | High | Partially |
| Tax Filing (Monthly) | High | Monthly | Moderate | Critical | Fully |
| Procurement (Small) | Medium | Weekly | Simple | Medium | Partially |

---

## 8. Non-Functional Requirements

### 8.1 Performance (NFR-PERF)

#### NFR-PERF-001: Response Time
- **Requirement:** RAG query response time < 2 seconds at p95
- **Measurement:** Vercel analytics, Supabase logs
- **Target:** 95th percentile < 2000ms

#### NFR-PERF-002: Uptime
- **Requirement:** 99.5% uptime (excluding planned maintenance)
- **Measurement:** Uptime monitoring (Uptime Robot)
- **Downtime Budget:** 3.65 hours/month

#### NFR-PERF-003: Scalability
- **Requirement:** Support 1000 concurrent users
- **Measurement:** Load testing (k6)
- **Target:** No degradation in response time up to 1000 users

---

### 8.2 Reliability (NFR-REL)

#### NFR-REL-001: Error Rate
- **Requirement:** < 1% of queries result in errors
- **Measurement:** Supabase edge function error logs
- **Target:** Error rate < 1%

#### NFR-REL-002: Data Durability
- **Requirement:** No data loss in query logs
- **Measurement:** Daily backup verification
- **Target:** RPO (Recovery Point Objective) = 24 hours

---

### 8.3 Usability (NFR-USE)

#### NFR-USE-001: Learnability
- **Requirement:** New users can perform first query within 1 minute (no training)
- **Measurement:** User testing (time-to-first-query)
- **Target:** 90% of users complete first query in < 60 seconds

#### NFR-USE-002: Accessibility
- **Requirement:** WCAG 2.1 Level AA compliance
- **Measurement:** Automated testing (axe, Lighthouse)
- **Target:** 0 critical accessibility violations

---

### 8.4 Maintainability (NFR-MAIN)

#### NFR-MAIN-001: Code Quality
- **Requirement:** TypeScript strict mode, ESLint, Prettier
- **Measurement:** Pre-commit hooks
- **Target:** 0 lint errors, 100% formatted code

#### NFR-MAIN-002: Test Coverage
- **Requirement:** > 80% unit test coverage for critical paths
- **Measurement:** Jest coverage report
- **Target:** Coverage > 80%

---

### 8.5 Portability (NFR-PORT)

#### NFR-PORT-001: Browser Compatibility
- **Requirement:** Support last 2 versions of major browsers
- **Browsers:** Chrome, Firefox, Safari, Edge
- **Measurement:** Cross-browser testing (BrowserStack)

#### NFR-PORT-002: Mobile Compatibility
- **Requirement:** Responsive design for iOS and Android
- **Devices:** iPhone 12+, Samsung Galaxy S20+
- **Measurement:** Device testing

---

## 9. User Experience Requirements

### 9.1 Interaction Design

#### UX-001: Zero Learning Curve
- Users should not need training to use basic features
- Interface follows familiar patterns (Google search, ChatGPT)
- Tooltips and contextual help available

#### UX-002: Feedback Loops
- Loading indicators for queries in progress
- Success/error messages for all actions
- Progress bars for uploads

#### UX-003: Personalization
- Remember user's domain/process preferences
- Suggest questions based on role
- Favorite/bookmark frequently used content

---

### 9.2 Visual Design

#### UX-004: Brand Consistency
- Use government color palette (blue, white, gold)
- Philippine seal or agency logos (optional)
- Professional, trustworthy aesthetic

#### UX-005: Information Hierarchy
- Clear visual distinction between questions and answers
- Citations less prominent but accessible
- Important actions (submit query) visually emphasized

---

## 10. Data Requirements

### 10.1 Data Sources

#### DS-001: Notion Workspace
- **Content:** Policies, SOPs, references
- **Update Frequency:** Real-time (Notion API)
- **Owner:** Knowledge Management Team

#### DS-002: OpenAI Vector Stores
- **Content:** Embedded document chunks
- **Update Frequency:** Daily batch uploads
- **Owner:** DevOps Team

#### DS-003: Supabase Database
- **Content:** Query logs, user data, analytics
- **Update Frequency:** Real-time
- **Owner:** Database Administrator

---

### 10.2 Data Volume

**Initial Load:**
- 500 policy documents (avg 50 pages each) = 25,000 pages
- ~10 million tokens → ~10,000 chunks
- Vector store size: ~500 MB

**Growth:**
- +50 documents/month
- +5,000 queries/month
- Database growth: ~10 GB/year

---

### 10.3 Data Quality

#### DQ-001: Accuracy
- All documents reviewed by subject matter experts
- Metadata validated during upload
- Regular audits (quarterly)

#### DQ-002: Completeness
- All active policies indexed within 30 days of publication
- No missing sections or pages
- Broken links flagged and fixed

#### DQ-003: Timeliness
- New regulations indexed within 24 hours
- Superseded documents archived same day

---

## 11. Integration Requirements

### 11.1 External Systems

#### INT-001: Notion API
- **Purpose:** Fetch content for rendering and updates
- **Protocol:** REST API, OAuth 2.0
- **Frequency:** On-demand (page views), Daily (batch sync)

#### INT-002: OpenAI API
- **Purpose:** Embeddings, RAG queries, assistants
- **Protocol:** REST API, API key
- **Frequency:** Real-time (per query)

#### INT-003: Supabase
- **Purpose:** Database, edge functions, auth
- **Protocol:** Postgres protocol, HTTP
- **Frequency:** Real-time

---

### 11.2 Internal Systems (Future)

#### INT-004: HRIS Integration
- **Purpose:** User provisioning, role assignment
- **Protocol:** LDAP or API
- **Status:** Roadmap (Phase 3)

#### INT-005: ERP Integration (SAP, Oracle, Odoo)
- **Purpose:** Automate data fetching for reports
- **Protocol:** API or database connector
- **Status:** Roadmap (Phase 3)

---

## 12. Security & Compliance Requirements

### 12.1 Authentication & Authorization

#### SEC-001: User Authentication
- **Phase 1:** No authentication (public access)
- **Phase 2:** Email/password via Supabase Auth
- **Phase 3:** SSO (Azure AD, Google Workspace)

#### SEC-002: Role-Based Access Control (RBAC)
- **Roles:** Admin, Editor, Viewer
- **Permissions:** CRUD operations on content, analytics access
- **Enforcement:** Database RLS policies

---

### 12.2 Data Security

#### SEC-003: Encryption
- **In Transit:** TLS 1.3 for all HTTP traffic
- **At Rest:** Supabase managed encryption (AES-256)

#### SEC-004: API Key Management
- **Storage:** Environment variables, Supabase secrets
- **Rotation:** Quarterly or on compromise
- **Access:** Limited to authorized personnel

#### SEC-005: Data Privacy
- **PII Handling:** Minimal collection (email, name only)
- **Anonymization:** Query logs anonymized after 90 days
- **Right to Erasure:** Users can request data deletion

---

### 12.3 Compliance

#### COMP-001: Philippine Data Privacy Act (DPA)
- **Requirement:** Obtain user consent for data collection
- **Compliance:** Privacy notice, consent checkbox during signup
- **Owner:** Legal/Compliance Team

#### COMP-002: BIR Record Retention
- **Requirement:** Retain tax-related query logs for 10 years
- **Compliance:** Partition tax queries, automated archival
- **Owner:** Finance Team

#### COMP-003: COA Audit Requirements
- **Requirement:** Provide audit trail for procurement consultations
- **Compliance:** Audit trail report feature (FR-AR-002)
- **Owner:** Audit Liaison

---

## 13. Success Metrics

### 13.1 Key Performance Indicators (KPIs)

#### Product Metrics

| Metric | Baseline | Target (Year 1) | Measurement |
|--------|----------|-----------------|-------------|
| Daily Active Users (DAU) | 0 | 500 | Vercel analytics |
| Monthly Active Users (MAU) | 0 | 2000 | Vercel analytics |
| Queries per User per Week | N/A | 10 | Database query |
| Answer Satisfaction Rate | N/A | 90% | Thumbs up/down |
| Response Time (p95) | N/A | < 2 seconds | Supabase logs |
| Uptime | N/A | 99.5% | Uptime Robot |

#### Business Metrics

| Metric | Baseline | Target (Year 1) | Measurement |
|--------|----------|-----------------|-------------|
| Time Spent Searching (hours/week) | 8 | 5.6 (-30%) | User survey |
| Compliance Error Rate | 15% | 7.5% (-50%) | Audit reports |
| Supervisor Interruptions (per day) | 10 | 5 (-50%) | Manager survey |
| Employee Satisfaction (NPS) | N/A | 50+ | Quarterly survey |

#### Financial Metrics

| Metric | Value | Calculation |
|--------|-------|-------------|
| Annual Time Saved | 80,000 hours | 500 users × 160 hours/year |
| Annual Cost Savings | ₱40M ($700K) | 80,000 hours × ₱500/hour |
| Annual Platform Cost | ₱2.5M ($50K) | Infrastructure + personnel |
| ROI | 1500% | (Savings - Cost) / Cost |

---

### 13.2 Adoption Metrics

**Funnel:**
1. **Awareness:** 5000 SSC staff informed (emails, posters)
2. **Trial:** 2000 staff visit platform at least once (40% conversion)
3. **Activation:** 1000 staff perform first query (50% of visitors)
4. **Retention:** 500 staff use weekly (50% of activated)
5. **Advocacy:** 100 staff refer colleagues (20% of retained)

---

## 14. Release Plan & Roadmap

### 14.1 Phased Rollout

#### Phase 0: MVP (Weeks 1-8) - ✅ 80% Complete

**Scope:**
- RAG infrastructure (database, edge functions)
- Basic Next.js UI (query input, answer display)
- Pilot with 10 users (friendly testers)

**Status:**
- ✅ Database migration deployed
- ✅ RAG client implemented
- 🔴 Edge function deployment blocked (permissions)
- ⏳ Secrets configuration pending
- ⏳ Smoke tests pending

**Launch Criteria:**
- Edge function deployed and functional
- 10 pilot users complete 50 queries each
- Answer satisfaction > 80%
- No critical bugs

---

#### Phase 1: Limited Beta (Weeks 9-16)

**Scope:**
- Expand to 100 users (3 SSC functions)
- Add domain/process filters
- Implement feedback mechanism
- Initial analytics dashboard

**Launch Criteria:**
- Phase 0 completed
- 100 users onboarded
- 5000+ queries processed
- Answer satisfaction > 85%

---

#### Phase 2: Public Launch (Weeks 17-24)

**Scope:**
- Open to all SSC staff (2000+ users)
- Content migration (500 documents)
- Skills and prompt packs
- Mobile-responsive UI

**Launch Criteria:**
- Phase 1 completed
- 500 documents indexed
- Load testing passed (1000 concurrent users)
- Marketing campaign launched

---

#### Phase 3: Expansion (Months 7-12)

**Scope:**
- Multi-tenant support (8 agencies)
- Workflow automation (n8n integration)
- Voice agent integration
- Advanced analytics

**Launch Criteria:**
- Phase 2 completed
- 80% adoption rate among pilot agencies
- Positive ROI demonstrated

---

### 14.2 Roadmap (3-Year Vision)

**2025: Foundation**
- Q1: MVP launch
- Q2: Public beta (3 agencies)
- Q3: Full production (8 agencies)
- Q4: Optimization and scaling

**2026: Enhancement**
- Q1: Mobile apps (iOS, Android)
- Q2: Voice interface
- Q3: Predictive analytics
- Q4: Third-party integrations (ERP, HRIS)

**2027: Ecosystem**
- Q1: Open-source community launch
- Q2: API marketplace
- Q3: Plugin architecture
- Q4: Expansion to other government sectors

---

## 15. Out of Scope

The following are **explicitly excluded** from this PRD and may be considered for future versions:

1. **Transactional Features**
   - Cannot file taxes directly through platform
   - Cannot submit budget proposals
   - Cannot approve procurement requisitions

2. **Real-Time Collaboration**
   - No shared editing of documents
   - No video conferencing
   - No instant messaging between users

3. **Content Authoring**
   - Platform consumes content, does not author it
   - No WYSIWYG editor for policies
   - Content creation stays in Notion

4. **Hardware Integration**
   - No printing from platform
   - No scanning of physical documents
   - No biometric authentication

5. **Advanced AI Features (Phase 1)**
   - No predictive analytics
   - No anomaly detection
   - No natural language to SQL

---

## 16. Dependencies & Constraints

### 16.1 External Dependencies

**Critical:**
- OpenAI API availability (99.9% SLA)
- Supabase Cloud reliability
- Notion API stability
- Vercel platform uptime

**Risks:**
- API price increases
- Service deprecations
- Vendor lock-in

**Mitigation:**
- Monitor vendor status pages
- Maintain 3-month runway in budget
- Abstract vendor APIs behind interfaces

---

### 16.2 Internal Constraints

**Budget:**
- Annual budget: $50,000 USD
- Cannot exceed without executive approval
- Cost optimization required (use efficient models)

**Timeline:**
- MVP must launch by end of Q1 2025
- Public launch by end of Q2 2025
- No delays beyond Q2

**Resources:**
- 5 core team members (cannot expand in Year 1)
- Part-time SME support (10 hours/week)
- Limited DevOps capacity

---

### 16.3 Technical Constraints

**Technology Stack:**
- Must use Next.js (existing investment)
- Must use Supabase (approved vendor)
- Cannot use AWS/GCP (not approved)

**Security:**
- Must comply with NIST Cybersecurity Framework
- Cannot store PII outside Philippines (data residency)
- Must pass penetration testing before launch

**Performance:**
- Must work on low-bandwidth connections (3G)
- Must support IE11 (deprecated, but still used in some agencies)

---

## 17. Glossary

| Term | Definition |
|------|------------|
| **BIR** | Bureau of Internal Revenue - Philippine tax authority |
| **BOC** | Bureau of Customs - Philippine customs authority |
| **COA** | Commission on Audit - Philippine government auditor |
| **DBM** | Department of Budget and Management - Philippine budget office |
| **DOF** | Department of Finance - Philippine finance ministry |
| **eFPS** | Electronic Filing and Payment System - BIR's online tax system |
| **GAA** | General Appropriations Act - Philippine national budget law |
| **GPPB** | Government Procurement Policy Board - Philippine procurement regulator |
| **HRIS** | Human Resources Information System |
| **ISR** | Incremental Static Regeneration - Next.js feature |
| **MOOE** | Maintenance and Other Operating Expenses - Budget category |
| **OpEx** | Operational Excellence |
| **RAG** | Retrieval-Augmented Generation - AI technique |
| **RBAC** | Role-Based Access Control |
| **RLS** | Row-Level Security - Postgres feature |
| **SOP** | Standard Operating Procedure |
| **SSC** | Shared Service Center |
| **TTS** | Text-to-Speech |
| **STT** | Speech-to-Text |

---

## 18. Appendix

### 18.1 References

1. **GitHub Spec Kit**
   https://github.com/github/spec-kit

2. **SAP Signavio Process Intelligence**
   https://www.signavio.com/products/process-intelligence/

3. **OpenAI API Documentation**
   https://platform.openai.com/docs

4. **Supabase Documentation**
   https://supabase.com/docs

5. **Philippine Data Privacy Act (RA 10173)**
   https://www.privacy.gov.ph/data-privacy-act/

---

### 18.2 Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-15 | Jake Tolentino | Initial draft |
| 1.1.0 | 2025-02-01 | Jake Tolentino | Added process-oriented requirements |
| 2.0.0 | 2025-11-15 | Jake Tolentino | Major update with RAG implementation status |

---

### 18.3 Approvals

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Manager | Jake Tolentino | 2025-11-15 | _Pending_ |
| Tech Lead | TBD | TBD | _Pending_ |
| Finance Director | TBD | TBD | _Pending_ |
| CTO | TBD | TBD | _Pending_ |

---

**END OF DOCUMENT**
