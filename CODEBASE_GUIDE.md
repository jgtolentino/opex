# OpEx Repository - Comprehensive Codebase Guide

**Project**: OpEx Hybrid Platform - Next.js/Notion + Docusaurus Documentation Hub  
**Version**: 2.0.0  
**Author**: Jake Tolentino  
**License**: MIT  

---

## Executive Summary

OpEx is a comprehensive operational excellence platform built on a hybrid architecture combining:
- A **Next.js application** that renders Notion pages dynamically
- A **Docusaurus documentation site** with structured HR/Finance/Operations content
- **RAG (Retrieval-Augmented Generation)** systems powered by OpenAI and Supabase
- **InsightPulse Data Lab** - Analytics platform with Superset, Deepnote, ECharts, and Jenny (AI BI Genie)
- **BPM Agent Skills Framework** for specialized business process management roles
- **n8n automation workflows** for operational processes
- **Python voice agent** for voice-first interactions with RAG capabilities

The platform serves a Finance Shared Services Center (SSC) managing 8 agencies with focus on Philippine tax compliance (BIR forms), HR workflows, and financial operations.

**NEW: InsightPulse Data Lab** - A comprehensive analytics platform featuring:
- **Jenny (AI BI Genie)**: Conversational analytics with natural language queries
- **Apache Superset**: Self-hosted BI platform for dashboards and data exploration
- **Deepnote**: Collaborative notebooks and data job orchestration
- **Apache ECharts**: Standardized visualization system
- See `DATA_LAB_INTEGRATION_GUIDE.md` for complete architecture and implementation details.

---

## 1. Architecture Overview

### 1.1 Technology Stack

**Frontend & Core Framework**:
- **Next.js 15.5.3** (React 19.1.1) - Main application framework
- **TypeScript 5.9** - Type safety and development experience
- **React Notion X 7.7.0** - Notion page rendering
- **Docusaurus 3.x** - Documentation site (in `/docs`)

**Backend & Data**:
- **Supabase** - PostgreSQL database with pgvector for RAG
- **OpenAI API** - GPT-4 Turbo for assistants, embeddings, voice
- **Vercel** - Deployment platform for Next.js app
- **n8n** - Workflow automation engine

**AI/ML Stack**:
- **OpenAI Assistants API** - Multi-turn RAG conversations
- **OpenAI File Search** - Vector store based document retrieval
- **OpenAI Agents SDK (Python)** - Voice agent implementation
- **LangChain concepts** - Used in edge functions

**Data Lab & Analytics** (NEW):
- **Apache Superset** - Self-hosted BI platform for dashboards
- **Deepnote** - Collaborative notebook workspace for data jobs
- **Apache ECharts** - Visualization library (standardized across platform)
- **Jenny (AI BI Genie)** - Natural language analytics interface
- **Ant Design (AntD)** - Component library for Data Lab UI

**Styling & UI**:
- **CSS Modules** - Component-scoped styling
- **Classnames** - Dynamic class management
- **PostHog & Fathom** - Analytics integration

**Package Management**:
- **pnpm 10.11.1** (required)
- **Node 18+** required
- **ESM modules** - Project uses `"type": "module"` in package.json

### 1.2 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                   OpEx Hybrid Platform                          │
│                                                                 │
│  ┌──────────────────┐          ┌─────────────────┐            │
│  │ Next.js App      │          │ Docusaurus Docs │            │
│  │ (Vercel)         │          │ (Vercel/GitHub) │            │
│  └────────┬─────────┘          └────────┬────────┘            │
│           │                             │                      │
│           └─────────────┬───────────────┘                       │
│                         │                                       │
│         ┌───────────────▼──────────────┐                        │
│         │   Supabase Edge Functions    │                        │
│         │   - opex-rag-query           │                        │
│         │   - embedding-worker         │                        │
│         │   - embedding-maintenance    │                        │
│         └────────────┬────────────────┘                         │
│                      │                                          │
│      ┌───────────────┴────────────┐                             │
│      │                            │                             │
│      ▼                            ▼                             │
│  ┌─────────────┐         ┌──────────────────┐                  │
│  │  Supabase   │         │   OpenAI API     │                  │
│  │  PostgreSQL │         │  - GPT-4 Turbo   │                  │
│  │  + pgvector │         │  - Assistants    │                  │
│  └─────────────┘         │  - File Search   │                  │
│                          │  - Embeddings    │                  │
│                          │  - Voice (TTS)   │                  │
│                          └─────────┬────────┘                   │
│                                    │                            │
│                          ┌─────────▼────────┐                  │
│                          │ Vector Stores(3) │                  │
│                          │ - vs_policies    │                  │
│                          │ - vs_sops        │                  │
│                          │ - vs_examples    │                  │
│                          └──────────────────┘                   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Integration Layer                                │  │
│  │  - Mattermost webhook                                    │  │
│  │  - n8n workflows                                         │  │
│  │  - Python voice agent                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure & Purposes

### Root Level Files
```
/home/user/opex/
├── package.json              # Main package config + pnpm scripts
├── tsconfig.json             # TypeScript configuration
├── next.config.js            # Next.js configuration
├── site.config.ts            # Site metadata (Notion page IDs, domain)
├── eslint.config.js          # Linting configuration
├── pnpm-lock.yaml           # Dependency lock file
├── voice_agent.py            # Python voice agent (OpenAI Agents SDK)
├── requirements.txt          # Python dependencies
├── README.md                 # Project overview
├── .env.example              # Environment variables template
└── .gitignore               # Git ignore rules
```

### 2.1 `/pages` Directory (Next.js Routes)

**Purpose**: Server-rendered and static pages using Next.js file-based routing

```
pages/
├── _app.tsx                  # App wrapper, analytics setup (Fathom, PostHog)
├── _document.tsx             # Document shell, HTML metadata
├── _error.tsx                # Error boundary
├── index.tsx                 # Home page (renders root Notion page)
├── [pageId].tsx              # Dynamic page renderer for Notion pages
├── portal.tsx                # OpEx Portal landing page (HR/Finance/Ops hub)
├── workflows.tsx             # n8n Workflows showcase page
├── feed.tsx                  # RSS feed generation
├── robots.txt.tsx            # robots.txt endpoint
├── sitemap.xml.tsx           # XML sitemap endpoint
├── 404.tsx                   # 404 page
└── api/
    ├── search-notion.ts      # Notion search API endpoint
    └── social-image.tsx      # Open Graph image generation (edge runtime)
```

**Key Patterns**:
- Dynamic page resolution via `getStaticProps`
- ISR (Incremental Static Regeneration) with 10-second revalidation
- Notion page caching via Redis (when enabled)
- Image optimization with next/image

### 2.2 `/lib` Directory (Core Logic & Utilities)

**Purpose**: Shared utilities, configuration, and business logic

```
lib/
├── config.ts                 # App config (Notion IDs, domain, analytics, Redis)
├── site-config.ts            # Site configuration wrapper
├── notion-api.ts             # Notion API client initialization
├── notion.ts                 # Notion page fetching + enhancement
├── resolve-notion-page.ts    # Page resolution logic (URL→pageId mapping)
├── get-site-map.ts           # Generate site navigation map
├── get-canonical-page-id.ts  # Extract Notion page ID from URL
├── map-page-url.ts           # URL generation and page URL mapping
├── map-image-url.ts          # Image URL transformation
├── get-tweets.ts             # Tweet embedding
├── get-page-tweet.ts         # Extract tweet from page
├── search-notion.ts          # Notion search functionality
├── preview-images.ts         # LQIP preview image generation
├── bootstrap-client.ts       # Client-side initialization
├── use-dark-mode.ts          # Dark mode hook
├── acl.ts                    # Access control logic
├── db.ts                     # Redis database client
├── oembed.ts                 # OEmbed provider integration
├── types.ts                  # TypeScript type definitions
├── get-config-value.ts       # Configuration value accessor
├── reset.d.ts                # TypeScript reset/CSS reset declarations
├── fonts/
│   └── inter-semibold.ts     # Font import (preloaded)
└── opex/
    ├── ragClient.ts          # RAG assistant client wrapper
    └── (analytics.ts - future)
```

**Key Patterns**:
- Configuration-driven behavior
- Lazy loading and memoization (p-memoize) for performance
- API abstraction layers
- Type-safe exports

### 2.3 `/components` Directory (React Components)

**Purpose**: Reusable React components for pages and rendering

```
components/
├── NotionPage.tsx            # Main Notion page renderer (with dynamic imports)
├── NotionPageHeader.tsx       # Page header section
├── Footer.tsx                # Footer component (links to portal, docs)
├── PageHead.tsx              # Head metadata manager
├── PageActions.tsx           # Action buttons for pages
├── PageAside.tsx             # Sidebar component
├── PageSocial.tsx            # Social sharing section
├── Page404.tsx               # 404 error component
├── ErrorPage.tsx             # Error boundary
├── OpExPortal.tsx            # Portal component (hero + cards + processes)
├── OpExPortal.module.css     # Portal styling
├── PageSocial.module.css      # Social component styling
├── styles.module.css          # Core component styles
├── GitHubShareButton.tsx      # Share to GitHub button
├── Loading.tsx               # Loading indicator
├── LoadingIcon.tsx           # Animated loading icon
└── jenny/
    └── JennyPanel.tsx        # (NEW) Jenny AI BI Genie interface component
                              # - Chat-first analytics UI
                              # - Natural language to SQL/charts
                              # - Multi-modal results (insight/chart/data/SQL/explain)
                              # - Databricks Genie-style UX
```

**Key Patterns**:
- CSS Modules for scoped styling
- Dynamic imports for code splitting
- Server-side rendering with async components
- Dark mode support via custom hook

### 2.4 `/styles` Directory (Global Styles)

```
styles/
├── global.css                # Global styles and CSS variables
├── notion.css                # Notion-specific overrides
├── prism-theme.css           # Syntax highlighting theme
└── [implicit reset]          # Browser reset via lib/reset.d.ts
```

### 2.5 `/supabase` Directory (Backend Infrastructure)

**Purpose**: Supabase edge functions and database migrations

```
supabase/
├── functions/
│   ├── opex-rag-query/
│   │   └── index.ts          # Main RAG query handler (Deno)
│   │       - Creates OpenAI thread + runs assistant
│   │       - Supports domain/process filtering
│   │       - Logs queries to rag_queries table
│   │       - Handles both 'opex' and 'ph-tax' assistants
│   ├── embedding-worker/
│   │   └── index.ts          # Document processing + embedding
│   │       - Downloads documents from URLs
│   │       - Converts HTML to Markdown
│   │       - Uploads to OpenAI vector stores
│   │       - Routes docs based on doc_type
│   └── embedding-maintenance/
│       └── index.ts          # Health checks + stale source detection
│           - Marks old sources for reprocessing
│           - Validates vector store health
│           - Triggers re-indexing
└── migrations/
    └── 001_opex_rag_queries.sql  # Schema for query logging + analytics
```

**Key Patterns**:
- Deno runtime (TypeScript without compilation)
- Environment variables passed at deployment
- Exponential backoff for retries
- Service role key for privileged operations

### 2.6 `/skills` Directory (BPM Agent Framework)

**Purpose**: Specialized AI agent definitions for business process management roles

```
skills/
├── README.md                 # Overview of skill framework
├── QUICK_START.md           # Quick setup guide
├── USAGE_GUIDE.md           # Detailed usage instructions
├── implementation_example.py # Python implementation template
├── bpm-analyst/
│   └── agent.md             # Process analysis + automation ROI expert
├── bpm-automation-dev/
│   └── agent.md             # Technical implementation specialist
├── bpm-process-manager/
│   └── agent.md             # Cross-agency coordination
├── bpm-process-owner/
│   ├── agent.md             # Agency Finance Director role
│   └── knowledge.md         # Domain knowledge reference
├── bpm-coo/
│   └── agent.md             # Enterprise-wide oversight
└── bpm-team-orchestrator/
    └── agent.md             # Coordinator of all BPM agents
```

**Skill Characteristics**:
- Each skill is a markdown file with structured prompts
- Contains: role identity, core responsibilities, frameworks, deliverables
- Designed for Claude or GPT with function calling
- Domain-specific context and examples included

### 2.7 `/prompt-packs` Directory (Reusable Prompt Templates)

**Purpose**: Structured prompt templates for specific operational workflows

```
prompt-packs/
├── hr/
│   └── employee-requisition-workflow.json
│       - Role: HR Manager
│       - Goal: Guide through hiring process
│       - Variables: department, role level, timeline
├── finance/
│   └── month-end-close-controller.json
│       - Role: Finance Controller
│       - Goal: Month-end close planning
│       - Variables: period, BIR forms, ERP system
└── engineering/
    └── incident-postmortem-writer.json
        - Role: Engineering Lead
        - Goal: Structured incident analysis
```

**Prompt Pack Structure**:
```json
{
  "id": "unique.identifier.v1",
  "slug": "url-friendly-slug",
  "title": "Display Title",
  "role": "target_role",
  "category": "category_name",
  "prompt_type": "assistant",
  "system_prompt": "...",
  "user_template": "...",
  "variables": [{ "name": "...", "type": "string", "required": true }],
  "tags": ["tag1", "tag2"],
  "version": 1,
  "status": "active"
}
```

### 2.8 `/docs` Directory (Docusaurus Documentation)

**Purpose**: Comprehensive organizational documentation site

```
docs/
├── docusaurus.config.ts      # Docusaurus configuration
├── package.json              # Docs site package
├── sidebars.ts               # Documentation navigation
├── src/                      # Custom React components + CSS
├── static/                   # Static assets
├── blog/                     # Blog posts
├── docs/
│   ├── hr/                   # HR policies and workflows
│   ├── finance/              # Finance processes and tax info
│   ├── operations/           # Operational procedures
│   ├── knowledge-base/       # General knowledge articles
│   └── tutorials/            # Step-by-step guides
├── OPEX_RAG_INTEGRATION.md   # RAG integration documentation
├── SELF_HEALING_PIPELINE.md  # Auto-updating knowledge base docs
└── LANDING_PAGE_GUIDE.md     # Landing page content guidelines
```

### 2.9 `/workflows` Directory (n8n Automation)

**Purpose**: Production automation workflows for operational processes

```
workflows/
└── n8n/
    ├── QUICKSTART.md         # Setup in 5 minutes
    ├── README.md             # Overview
    ├── IMPORT_GUIDE.md       # How to import workflows
    ├── workflows/            # Exported workflow JSON files
    │   ├── ask-opex-assistant.json
    │   ├── tax-deadline-notifier.json
    │   ├── health-check-monitor.json
    │   └── bir-document-sync.json
    └── docs/
        ├── SETUP.md          # Detailed setup
        ├── MATTERMOST_CONFIG.md
        ├── CREDENTIALS.md    # API credentials configuration
        └── workflows/        # Workflow documentation
            ├── ask-opex-assistant.md
            ├── document-sync-rag.md
            ├── health-check-monitor.md
            └── tax-deadline-notifier.md
```

### 2.10 `/config` Directory

```
config/
├── ph_tax_assistant_system_prompt.md
│   - System prompt for PH Tax Copilot
│   - Covers BIR forms, compliance, deadlines
└── opex_assistant_system_prompt.md
    - System prompt for OpEx HR/Finance/Ops assistant
```

### 2.11 `/.claude` Directory (Claude Code Integration)

```
.claude/
├── AGENTS.md                 # BPM skill definitions and usage
├── CTO_MENTOR_PROMPTS.md     # CTO mentor skill examples
├── LANDING_PAGE_PROMPTS.md   # Landing page copy generation prompts
└── skills/                   # Claude Code skills directory
    ├── bpm_copywriter/
    ├── bpm_knowledge_agent/
    ├── bpm_learning_designer/
    ├── bpm_transformation_partner/
    ├── cto_mentor/
    └── (NEW) Data Lab Skills:
        ├── insightpulse-superset-platform-admin/
        ├── insightpulse-superset-embedded-analytics/
        ├── insightpulse-superset-api-ops/
        ├── insightpulse-superset-user-enablement/
        ├── insightpulse-deepnote-data-lab/
        └── insightpulse-echarts-viz-system/
```

### 2.12 `/scripts` Directory (Automation & Tooling)

```
scripts/
├── deploy-edge-function.sh       # Supabase function deployment
├── set-edge-function-secrets.sh  # Secret configuration
├── test-edge-function.sh         # Integration testing
├── test-opex-rag.ts              # RAG system testing
├── embedding_audit.py            # Vector store health audit
├── export-diagrams.sh            # Diagram export utility
└── dashboard-deploy-instructions.md
```

---

## 3. Next.js + Notion Integration

### 3.1 How It Works

The application uses a **hybrid rendering model**:

1. **Static Site Generation (SSG)** with Incremental Static Regeneration (ISR)
   - Pre-builds commonly accessed Notion pages at build time
   - Revalidates every 10 seconds (`revalidate: 10` in `getStaticProps`)
   - Falls back to dynamic rendering during request if needed

2. **Notion API Integration**
   - Uses `notion-client` library (community package)
   - Fetches page content as `ExtendedRecordMap` (Notion's internal format)
   - Caches at Redis layer if available

3. **Dynamic Page Rendering**
   - Maps URL paths to Notion page IDs
   - Supports custom URL overrides via `pageUrlOverrides` config
   - Renders using `react-notion-x` component library

### 3.2 Page Resolution Flow

```
URL Request (e.g., /about)
    ↓
[pageId].tsx getStaticProps()
    ↓
resolveNotionPage(domain, pageId)
    ↓
Check URL overrides → Check redis cache → Query Notion API
    ↓
getPage() from notion.ts
    ↓
Enhance page (preview images, tweets, navigation links)
    ↓
Return PageProps {site, recordMap, pageId}
    ↓
NotionPage component renders ExtendedRecordMap
    ↓
Send HTML to client
```

### 3.3 Key Configuration

**site.config.ts**:
```typescript
{
  rootNotionPageId: '...',         // Root page (homepage)
  rootNotionSpaceId: null,          // Optional workspace restriction
  name: 'Next.js Notion Starter Kit',
  domain: '...',
  pageUrlOverrides: {               // Custom URL routing
    '/about': 'notion-page-id-xyz'
  }
}
```

**Configuration Sources** (priority order):
1. `site.config.ts` - Explicit configuration
2. `lib/config.ts` - Parsed and computed values
3. Environment variables - Runtime overrides

### 3.4 Performance Optimizations

- **Redis caching** of URI→pageId mappings (when enabled)
- **LQIP preview images** for Notion images (lazy loaded)
- **Dynamic imports** for syntax highlighting (on-demand loading)
- **Image optimization** via next/image (WebP, AVIF formats)
- **Bundle analysis** support via `ANALYZE=true next build`

---

## 4. RAG (Retrieval-Augmented Generation) Implementation

### 4.1 RAG Architecture

**Two-tier System**:
1. **Vector Stores** (OpenAI File Search)
   - `vs_policies` - BIR forms, regulations, legal documents
   - `vs_sops_workflows` - Processes, workflows, best practices
   - `vs_examples_systems` - Templates, examples, system documentation

2. **Assistants** (OpenAI API)
   - `opex-assistant` - HR, Finance, Operations queries
   - `ph-tax-assistant` - Philippine BIR tax compliance

### 4.2 Query Flow

```
Frontend (askOpexAssistant)
    ↓
ragClient.ts (Next.js wrapper)
    ↓
POST /functions/v1/opex-rag-query (Edge Function)
    ↓
opex-rag-query/index.ts (Deno)
    ├─ Create OpenAI thread
    ├─ Add user message
    ├─ Run assistant with vector stores
    ├─ Poll for completion
    └─ Extract answer + citations
    ↓
Log to rag_queries table
    ↓
Return {answer, citations, metadata}
    ↓
Display to user
```

### 4.3 Vector Store Routing

**Based on `doc_type` metadata**:
```typescript
'policy' | 'calendar' → vs_policies
'sop' | 'workflow'    → vs_sops_workflows
(default)             → vs_examples_systems
```

### 4.4 Document Embedding Pipeline

**embedding-worker** (runs every 6 hours or on-demand):
```
1. Read pending sources from embedding_sources table
2. For each source:
   a. Download content from URL (with retry + backoff)
   b. Convert HTML to Markdown
   c. Create content hash
   d. Upload to appropriate vector store
   e. Mark as processed with timestamp
```

### 4.5 Client Integration

**TypeScript Client** (`lib/opex/ragClient.ts`):
```typescript
// Domain-specific wrappers
askOpexAssistant({question, domain?, process?, metadata?})
askPhTaxAssistant({question, domain?, process?, metadata?})

// Domain-specific helpers
askHRQuestion(question, process?)
askFinanceQuestion(question, process?)
askOpsQuestion(question, process?)
askTaxQuestion(question, process?)

// Process-specific helpers
askOnboardingQuestion(question)
askOffboardingQuestion(question)
askExpenseQuestion(question)
askRequisitionQuestion(question)
askMonthEndQuestion(question)
```

### 4.6 Query Logging & Analytics

**Table**: `opex.rag_queries`
```sql
user_id, user_email, user_role
assistant_name, assistant_id
question, answer
domain, process
success, error_message
response_time_ms
metadata, citations, tokens_used
created_at
```

---

## 5. Skills System & Prompt-Packs

### 5.1 Skills Framework

**Five Core Skills** (in `.claude/skills/`):

1. **bpm_copywriter** - Documentation + content polish
2. **bpm_knowledge_agent** - Wiki navigation + knowledge retrieval
3. **bpm_learning_designer** - Training + onboarding content
4. **bpm_transformation_partner** - Strategic roadmaps + capability planning
5. **cto_mentor** - Architecture, platform, AI product strategy

### 5.2 BPM Agent Skills (in `/skills/`)

**Six Specialized Agents**:

1. **BPM Analyst** (`bpm-analyst/`)
   - Process analysis, bottleneck identification
   - ROI calculations, improvement recommendations
   - Uses data analysis frameworks

2. **BPM Process Manager** (`bpm-process-manager/`)
   - Cross-agency coordination
   - Standardization, conflict resolution
   - Change management

3. **BPM Process Owner** (`bpm-process-owner/`)
   - Agency Finance Director perspective
   - End-to-end process ownership
   - KPI monitoring, stakeholder management

4. **BPM Automation Developer** (`bpm-automation-dev/`)
   - Technical implementation (Odoo, MCP, CI/CD)
   - Code generation, testing automation
   - Integration development

5. **BPM COO** (`bpm-coo/`)
   - Enterprise-wide oversight
   - Strategic alignment, governance
   - Compliance monitoring

6. **BPM Team Orchestrator** (`bpm-team-orchestrator/`)
   - Routes tasks to appropriate agent
   - Manages dependencies
   - Consolidated reporting

### 5.3 Prompt-Pack Structure

Located in `/prompt-packs/{category}/`:
```json
{
  "id": "finance.month_end_close_controller.v1",
  "slug": "finance-month-end-close-controller",
  "title": "Month-End Close Controller Copilot",
  "role": "finance_controller",
  "category": "finance",
  "prompt_type": "assistant",
  "system_prompt": "You are a senior Finance Controller...",
  "user_template": "Context:\n- Period: {{period}}\n...",
  "variables": [
    {
      "name": "period",
      "type": "string",
      "description": "Accounting period (e.g., 'Oct 2025')",
      "required": true
    }
  ],
  "version": 1,
  "status": "active"
}
```

### 5.4 Using Prompt-Packs

**Invocation Pattern**:
1. Load prompt pack JSON
2. Render `system_prompt` (constant)
3. Render `user_template` with provided variables
4. Send to LLM as system + user messages

---

## 6. Development Workflows & Build Processes

### 6.1 Local Development

**Setup**:
```bash
# Install dependencies
pnpm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local with your secrets

# Start dev server
pnpm dev

# Open http://localhost:3000
```

**Key Environment Variables**:
```bash
# Notion
NOTION_API_KEY=...

# Supabase (RAG)
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...

# OpenAI
OPENAI_API_KEY=...
VS_POLICIES_ID=...
VS_SOPS_WORKFLOWS_ID=...
VS_EXAMPLES_SYSTEMS_ID=...

# Analytics (optional)
NEXT_PUBLIC_FATHOM_ID=...
NEXT_PUBLIC_POSTHOG_ID=...

# Twitter (optional)
TWITTER_ACCESS_TOKEN=...

# Redis (optional)
REDIS_HOST=...
REDIS_PASSWORD=...
```

### 6.2 Build Process

**Production Build**:
```bash
pnpm build              # Builds Next.js app (SSG + ISR)
pnpm build:docs         # Builds Docusaurus site
pnpm build:all          # Both
```

**Bundle Analysis**:
```bash
ANALYZE=true pnpm build     # Generate bundle analysis
BUNDLE_ANALYZE=server pnpm build
BUNDLE_ANALYZE=browser pnpm build
```

### 6.3 Testing & Quality

**Linting**:
```bash
pnpm test:lint                  # ESLint check
eslint . --fix                  # Auto-fix linting errors
```

**Formatting**:
```bash
pnpm test:prettier              # Prettier check
prettier '**/*.{js,jsx,ts,tsx}' --write  # Auto-format
```

**Pre-commit Hooks**:
```bash
# Configured in package.json
# Runs prettier + eslint on .ts/.tsx files before commit
```

### 6.4 Deployment

**Vercel Deployment** (Next.js):
```bash
pnpm deploy          # Deploy via Vercel CLI
```

**Environment Setup**:
- Vercel dashboard → Project Settings → Environment Variables
- Add all secrets from `.env.example`
- Set Node version to 18+

**Supabase Edge Functions**:
```bash
# Deploy edge function
supabase functions deploy opex-rag-query

# Set secrets
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set VS_POLICIES_ID=vs_...
```

### 6.5 Incremental Static Regeneration (ISR)

**How It Works**:
- Pages built at request time if older than revalidation period
- Set via `revalidate: 10` (seconds) in `getStaticProps`
- Automatic fallback for missing pages

**Revalidation Triggers**:
- Time-based: Pages refresh after 10 seconds
- Manual: Can use `revalidateTag()` if needed

---

## 7. Testing & Deployment Strategies

### 7.1 Testing Approach

**Manual Testing**:
```bash
# RAG system testing
pnpm exec ts-node scripts/test-opex-rag.ts

# Edge function testing
bash scripts/test-edge-function.sh
```

**Embedding Audit**:
```bash
python scripts/embedding_audit.py
# Validates vector store health, checks for stale sources
```

**CI/CD** (GitHub Actions):
- Linting on PR
- Format checking
- Build verification
- Dependency updates

### 7.2 Deployment Checklist

**Pre-Deployment**:
```
□ Run linting: pnpm test:lint
□ Run prettier: pnpm test:prettier
□ Test build locally: pnpm build
□ Update environment variables
□ Test RAG edge functions
□ Verify vector store IDs
```

**Deployment**:
```
□ Merge to main branch
□ Vercel auto-deploys Next.js app
□ Verify deployment preview
□ Monitor analytics (Fathom, PostHog)
□ Check edge function logs
□ Test RAG queries
```

**Post-Deployment**:
```
□ Smoke test key pages
□ Check RAG assistant functionality
□ Monitor error rates
□ Verify SSL/HTTPS
□ Test Notion integration
```

### 7.3 Monitoring

**Analytics**:
- **Fathom Analytics** - Page views, user behavior
- **PostHog** - Feature usage tracking
- **Supabase Dashboard** - Function logs, database metrics
- **OpenAI API Dashboard** - Token usage, errors

**Error Tracking**:
- Vercel error logs
- Supabase edge function logs
- Browser console errors

---

## 8. Unique Patterns & Conventions

### 8.1 Code Organization Patterns

**Import Aliases** (`tsconfig.json`):
```typescript
@/components/*  → components/
@/lib/*         → lib/
@/styles/*      → styles/
```

**Convention**: Always use `@/` aliases in imports (not relative paths)

### 8.2 Component Patterns

**Server Components**:
- Top-level page components use `getStaticProps`
- Client-side data fetching via client wrappers

**Dynamic Imports** (Code Splitting):
```typescript
const Code = dynamic(() =>
  import('react-notion-x/build/third-party/code').then(...)
);
```

**CSS Modules**:
```typescript
import styles from './OpExPortal.module.css'
<div className={styles.portal}>
```

### 8.3 Configuration Management

**Layered Configuration**:
1. `site.config.ts` - User-facing configuration
2. `lib/config.ts` - Computed/parsed configuration
3. `lib/get-config-value.ts` - Helper functions
4. Environment variables - Runtime overrides

**Pattern**: Don't import site.config directly; use lib/config

### 8.4 Type Safety

**Strict TypeScript**:
- Explicit return types on functions
- No implicit `any`
- Full type exports in `lib/types.ts`

**Notion Types**:
```typescript
import { ExtendedRecordMap, PageBlock } from 'notion-types'
import { parsePageId } from 'notion-utils'
```

### 8.5 Async Patterns

**Memoization** (p-memoize):
```typescript
const getNavigationLinkPages = pMemoize(async () => {...})
```

**Parallel Requests** (p-map):
```typescript
pMap(pageIds, async (id) => notion.getPage(id), { concurrency: 4 })
```

### 8.6 RAG Patterns

**Query Pattern**:
```typescript
const response = await askAssistant({
  assistant: 'opex' | 'ph-tax',
  question: 'User query',
  domain?: 'hr' | 'finance' | 'ops' | 'tax' | 'knowledge_base',
  process?: 'onboarding' | 'month_end' | ...,
  metadata?: { custom: 'data' }
})
```

**Domain Filtering**:
- Metadata attached to vector store files during upload
- Filter applied during file search
- Reduces irrelevant results

### 8.7 Edge Function Patterns

**Deno Environment**:
```typescript
// Use ESM imports from esm.sh
import OpenAI from 'https://esm.sh/openai@4'

// Get env vars from Deno
const key = Deno.env.get('OPENAI_API_KEY')!

// CORS handling
if (req.method === 'OPTIONS') {
  return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
}
```

**Error Handling**:
- Try/catch with detailed logging
- Return JSON error responses
- Log to Supabase when possible

### 8.8 Python Voice Agent Patterns

**Tool Definition**:
```python
@function_tool
def query_docs(query: str) -> str:
    """Query documentation via RAG"""
    # TODO: Wire to Supabase vector search
    return f"Results for {query}"
```

**Agent Configuration**:
```python
voice_agent = Agent(
    name="JakeVoiceDev",
    instructions="...",
    tools=[WebSearchTool(), query_docs, ...],
    model="gpt-4o-mini"
)
```

---

## 9. Configuration Files & Their Purposes

### 9.1 Build & Package Configuration

**package.json**:
- Version: 2.0.0
- Manager: pnpm 10.11.1
- Type: ES modules (`"type": "module"`)
- Key scripts: dev, build, build:all, deploy, test

**tsconfig.json**:
- Extends `@fisch0920/config/tsconfig-react`
- Path aliases for `@/components`, `@/lib`, `@/styles`
- Includes `next-env.d.ts`, all `.ts`/`.tsx` files

**next.config.js**:
- Bundle analyzer support
- Image optimization (WebP, AVIF, SVG)
- Webpack alias for react/react-dom
- Transpile react-tweet

**.eslintrc.json**:
- ESLint configuration (minimal, extends fisch0920 config)

**.prettierignore**:
- Files to exclude from prettier formatting

### 9.2 Environment & Secrets

**.env.example**:
```bash
NEXT_PUBLIC_FATHOM_ID              # Optional analytics
NEXT_PUBLIC_POSTHOG_ID             # Optional analytics
TWITTER_ACCESS_TOKEN               # Tweet embedding
REDIS_HOST, REDIS_PASSWORD         # Optional caching
OPENAI_API_KEY                     # RAG + voice
SUPABASE_URL, SUPABASE_KEY         # Backend
```

**Secrets Management**:
- Use Vercel environment variables for production
- Use `.env.local` for development
- Never commit `.env` files

### 9.3 Site Configuration

**site.config.ts**:
```typescript
siteConfig({
  rootNotionPageId: '...',        // Required
  rootNotionSpaceId: null,        // Optional
  name: 'Site Name',              // Required
  domain: 'example.com',          // Required
  author: 'Author Name',          // Required
  description: '...',             // Optional
  isPreviewImageSupportEnabled: true,
  isRedisEnabled: false,
  navigationStyle: 'default'      // or 'custom'
})
```

**lib/config.ts**:
- Parses and validates site.config
- Builds derived config values
- Exports for use throughout app

### 9.4 TypeScript Configuration

**tsconfig.json**:
- React JSX support
- Strict null checks
- Module resolution for aliases
- Excludes `node_modules`, `docs`

**Path Aliases**:
```json
"@/components/*": ["components/*"],
"@/lib/*": ["lib/*"],
"@/styles/*": ["styles/*"]
```

### 9.5 Git Configuration

**.gitignore**:
```
node_modules/
.next/
dist/
.env
.env.local
.DS_Store
```

### 9.6 Editor Configuration

**.editorconfig**:
- Consistent code style across editors
- Charset: UTF-8
- Line endings, indentation

**.vscode/**:
- VS Code workspace settings
- Extensions recommendations
- Debug configurations

---

## 10. Implementation Notes & Best Practices

### 10.1 When Working with Notion Integration

**Page ID Format**:
- Notion page IDs are UUIDs (36 characters including hyphens)
- Stored without hyphens in URLs
- Use `parsePageId()` to normalize

**Caching Strategy**:
- URL → Page ID mappings cached in Redis (if enabled)
- Page content cached via ISR (10-second revalidation)
- Invalidate manually if needed

**Performance Considerations**:
- Notion API rate limits: 3 requests/second
- Use p-map with concurrency: 4 for parallel requests
- Memoize expensive operations

### 10.2 When Working with RAG

**Vector Store Management**:
- Files grouped by doc_type
- Metadata attached during upload
- Domain filtering applied at query time

**Query Performance**:
- Shorter queries often better for vector search
- Domain/process filters reduce noise
- Response time typically 3-10 seconds

**Cost Optimization**:
- Monitor token usage via OpenAI dashboard
- Use gpt-4-turbo (not gpt-4) for cost efficiency
- Batch embedding jobs during off-hours

### 10.3 When Adding New Pages

**Static Page**:
1. Create page in Notion
2. Get page ID (long UUID)
3. Add to config if needed (pageUrlOverrides)
4. Deploy (or test locally with fallback: true)

**Dynamic Page**:
1. Just add page to Notion
2. Share link (auto-discovered via sitemap)
3. No config needed

### 10.4 When Modifying Styles

**Global Styles** (`styles/global.css`):
- CSS variables for colors, spacing, fonts
- Applies to all pages

**Component Styles** (CSS Modules):
- Scoped to component, no conflicts
- Use `classnames` for dynamic classes

**Dark Mode**:
- Automatically applied via `useDarkMode()` hook
- Notion styles include dark theme

### 10.5 When Deploying to Production

**Pre-Deployment Checklist**:
1. Run full test suite (`pnpm test`)
2. Build locally and verify (`pnpm build`)
3. Check Notion API key validity
4. Verify all secrets in Vercel dashboard
5. Test critical flows in staging

**Monitoring After Deploy**:
1. Check Vercel deployment logs
2. Monitor page performance (Fathom)
3. Test Notion page rendering
4. Verify RAG assistants working
5. Watch error rates for 24 hours

### 10.6 Common Troubleshooting

**Build Fails**:
- Clear Next.js cache: `rm -rf .next`
- Reinstall deps: `pnpm install`
- Check Node version: `node -v` (should be 18+)

**Pages Not Loading**:
- Check Notion page ID format
- Verify NOTION_API_KEY is set
- Check pageUrlOverrides if custom URL
- Try ISR revalidation: wait 10 seconds, refresh

**RAG Not Responding**:
- Check OpenAI API key
- Verify vector store IDs in env vars
- Check edge function logs in Supabase
- Test with simpler query

**Images Not Loading**:
- Check image URLs in Notion remote patterns
- Verify NEXT_PUBLIC_SUPABASE_URL if using Supabase images
- Check image optimization settings

---

## 11. Key Technologies & External Services

### 11.1 Core Libraries

**React & Next.js**:
- react@19.1.1 - UI framework
- next@15.5.3 - Framework + routing + SSG
- next/image - Image optimization
- next/dynamic - Code splitting

**Notion Integration**:
- notion-client@7.7.0 - Notion API
- notion-types@7.7.0 - Type definitions
- notion-utils@7.7.0 - Utilities
- react-notion-x@7.7.0 - Component library

**UI & Styling**:
- classnames - Class composition
- react-body-classname - Dynamic body class
- css modules - Component scoping

**Analytics**:
- fathom-client - Privacy-focused analytics
- posthog-js - Feature usage tracking

**Utilities**:
- p-map - Parallel request manager
- p-memoize - Async memoization
- ky - HTTP client
- rss - RSS feed generation
- react-use - React hooks library

### 11.2 External Services

**OpenAI**:
- GPT-4 Turbo - Chat completions
- Assistants API - Multi-turn RAG
- File Search - Vector store search
- Embeddings - Document embedding
- Voice (TTS/STT) - Audio I/O

**Supabase** (open-source PostgreSQL + BaaS):
- PostgreSQL database
- pgvector extension - Vector search
- Edge Functions (Deno runtime)
- Real-time subscriptions

**Vercel**:
- Next.js deployment
- Serverless functions
- Edge middleware
- Analytics

**GitHub**:
- Version control
- GitHub Actions CI/CD
- Issues & discussions

**n8n**:
- Workflow automation
- Mattermost integration
- Webhook support
- Scheduling

---

## 12. Important Context & Domain Knowledge

### 12.1 Philippine Tax System

The platform includes specific support for **Philippine Bureau of Internal Revenue (BIR)** forms:
- **1601-C** - Withholding tax return (monthly)
- **2550M** - Annual corporate income tax return
- **2550Q** - Quarterly income tax return
- **1702** - Annual information return

**Key Dates**:
- Monthly deadlines: 10th business day after month
- Quarterly deadlines: 1st month following quarter
- Annual deadline: January 20th

### 12.2 Finance SSC Context

The platform manages a **Shared Services Center (SSC)** for 8 agencies:
- RIM, CKVC, BOM, and 5 others
- Monthly-end closing processes
- Bank reconciliations
- Inter-agency transactions
- Budget tracking

**Core Processes**:
- Month-end closing (coordinated)
- BIR filing and compliance
- Expense reimbursement
- Purchase requisitions
- Employee onboarding

### 12.3 Automation Stack

**Backend Systems**:
- Odoo CE/OCA - Accounting ERP
- Apache Superset - Analytics & dashboards
- PaddleOCR - Document processing
- PostgreSQL (Supabase) - Data warehouse

**Integration Points**:
- Supabase RPC functions
- Odoo API
- n8n workflows
- OpenAI RAG

---

## 13. Quick Reference: Essential Commands

```bash
# Development
pnpm dev                    # Start Next.js dev server
pnpm dev:docs             # Start Docusaurus docs dev server

# Building
pnpm build                # Build Next.js app
pnpm build:docs           # Build Docusaurus
pnpm build:all            # Build both

# Testing & Quality
pnpm test                 # Run all tests (lint + prettier)
pnpm test:lint            # ESLint check
pnpm test:prettier        # Prettier format check
eslint . --fix            # Auto-fix lint errors
prettier '**/*' --write   # Auto-format

# Deployment
pnpm deploy               # Deploy via Vercel
pnpm deploy:docs          # Deploy docs

# Supabase Functions
supabase functions deploy opex-rag-query
supabase secrets set KEY=value

# Analytics & Debugging
python scripts/embedding_audit.py
bash scripts/test-edge-function.sh
pnpm exec ts-node scripts/test-opex-rag.ts
```

---

## 14. Documentation Navigation

**Core Project Documentation**:
- `CLAUDE.md` - **This file** - Comprehensive AI assistant guide
- `PRD.md` - Product Requirements Document (WHAT & WHY)
- `PLANNING.md` - Strategic planning & architecture (HOW)
- `TASKS.md` - Task breakdown & sprint planning
- `CHANGELOG.md` - Version history & release notes
- `README.md` - Project overview & quick start

**RAG & Integration Guides**:
- `RAG_QUICKSTART.md` - RAG setup (2 steps)
- `OPEX_INTEGRATION_COMPLETE.md` - Complete RAG architecture
- `OPEX_RAG_IMPLEMENTATION_SUMMARY.md` - Implementation summary
- `docs/OPEX_RAG_INTEGRATION.md` - Detailed integration guide
- `docs/SELF_HEALING_PIPELINE.md` - Auto-updating knowledge base

**Data Lab & Analytics** (NEW):
- `DATA_LAB_INTEGRATION_GUIDE.md` - **Complete InsightPulse Data Lab guide**
  - Architecture overview (Superset + Deepnote + Jenny + ECharts)
  - Implementation roadmap (6 phases)
  - Technical setup and deployment
  - User personas and workflows
  - Integration patterns

**Development Frameworks**:
- `skills/README.md` - Agent skills framework
- `workflows/n8n/README.md` - n8n workflows
- `.claude/AGENTS.md` - Claude Code agents configuration
- `.claude/skills/insightpulse-*` - Data Lab skills (6 skills for Superset, Deepnote, ECharts)

**Deployment & Operations**:
- `DEPLOYMENT_STATUS.md` - Current deployment state
- `DEPLOYMENT_GUIDE.md` - Step-by-step deployment
- `MANUAL_DEPLOYMENT_GUIDE.md` - Manual deployment procedures

**For Specific Tasks**:
- **Understanding requirements**: See `PRD.md` (user stories, functional requirements)
- **Planning implementation**: See `PLANNING.md` (architecture, strategy)
- **Tracking work**: See `TASKS.md` (sprint tasks, acceptance criteria)
- **Version history**: See `CHANGELOG.md` (what changed, migration guides)
- **Setting up RAG**: See `RAG_QUICKSTART.md`
- **Deploying edge functions**: See `scripts/deploy-edge-function.sh`
- **Understanding skills**: See `skills/README.md` and `.claude/AGENTS.md`
- **n8n workflows**: See `workflows/n8n/SETUP.md`
- **Implementing Data Lab**: See `DATA_LAB_INTEGRATION_GUIDE.md` (Superset, Deepnote, Jenny, ECharts)
- **Working with Jenny**: See `components/jenny/JennyPanel.tsx` and Data Lab guide
- **Data Lab skills**: See `.claude/skills/insightpulse-*` (6 specialized skills)

---

## 15. Tips for AI Assistants Working with This Codebase

### 15.1 Code Navigation

1. **Start with the entry point**: `pages/[pageId].tsx` for routing logic
2. **Follow the imports**: Use path aliases (`@/lib`, `@/components`)
3. **Check `lib/config.ts`** for configuration values
4. **Use TypeScript**: Full type definitions in `lib/types.ts`

### 15.2 Making Changes

**Safe Changes**:
- Modify component styling (CSS modules)
- Update site.config.ts for configuration
- Add environment variables
- Create new prompt packs

**Requires Testing**:
- Changes to `lib/resolve-notion-page.ts` (page resolution)
- Changes to RAG edge functions
- Database migrations
- Build configuration

**Involves Deployment**:
- New environment variables
- Supabase function changes
- Vercel deployment settings

### 15.3 Understanding Error Messages

**"Not found" (404)**:
- Check Notion page ID format
- Verify NOTION_API_KEY is set
- Check if page exists and is accessible

**"RAG query failed"**:
- Check OpenAI API key
- Verify vector store IDs
- Check edge function logs in Supabase dashboard

**Build timeout**:
- ISR revalidation: 300 seconds (static page generation)
- Notion API delays
- Edge function processing

### 15.4 Performance Considerations

**Frontend**:
- Dynamic imports for syntax highlighting
- Image optimization via next/image
- CSS modules prevent style conflicts
- ISR balances freshness and performance

**Backend**:
- Notion API rate limits (3/second)
- Redis caching for URL mappings
- Vector search optimized with domain filters
- Edge functions run on regional servers

### 15.5 Security Best Practices

**Secrets Management**:
- Never commit `.env` or `.env.local`
- Use Vercel environment variables for production
- Service role key only in edge functions
- API keys rotated regularly

**Access Control**:
- ACL logic in `lib/acl.ts`
- Page-level access restrictions possible
- RAG queries logged with user context

---

## 16. Glossary of Key Terms

| Term | Definition |
|------|-----------|
| **SSC** | Shared Services Center - centralized finance operations |
| **BIR** | Bureau of Internal Revenue - Philippine tax authority |
| **ISR** | Incremental Static Regeneration - Next.js caching strategy |
| **SSG** | Static Site Generation - pre-build pages at build time |
| **RAG** | Retrieval-Augmented Generation - AI with document retrieval |
| **pgvector** | PostgreSQL vector extension for embeddings |
| **Deno** | TypeScript runtime (used in Supabase functions) |
| **LQIP** | Low Quality Image Placeholder - preview images |
| **ExtendedRecordMap** | Notion's internal data structure for pages |
| **Edge Function** | Serverless function running on edge servers |
| **Vector Store** | Database for semantic search (OpenAI File Search) |
| **BPMN** | Business Process Model and Notation - process diagrams |
| **Notion API** | Community package for interacting with Notion |

---

## 17. Future Roadmap & TODOs

**Near-term**:
- Complete n8n workflow automation setup
- Enable all Python voice agent RAG connections
- Implement real-time RAG query analytics dashboard
- Add multi-language support

**Medium-term**:
- Fine-tuned models for specific BPM processes
- Advanced analytics for query patterns
- Mattermost bot for wider team adoption
- Mobile app wrapper

**Long-term**:
- Multi-tenant SaaS platform
- Custom LLM models
- Advanced compliance reporting
- International tax support (beyond PH)

**Known Limitations**:
- Notion API rate limits (3/second)
- OpenAI API costs scale with usage
- Vector search limited to document content (not metadata)
- No real-time page updates (ISR based)

---

## 18. Contact & Support

**Repository**: `https://github.com/jgtolentino/opex`  
**Issues**: `https://github.com/jgtolentino/opex/issues`  
**Discussions**: `https://github.com/jgtolentino/opex/discussions`  

**Documentation Site**: [OpEx Docs](https://docs-o31ksa8qj-jake-tolentinos-projects-c0369c83.vercel.app)  
**Main Site**: [OpEx Portal](https://nextjs-notion-starter-kit.transitivebullsh.it)  

---

**Last Updated**: November 16, 2025
**Maintainer**: Jake Tolentino
**Status**: Active Development
