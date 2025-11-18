# InsightPulse Platform Architecture

**Version:** 1.0  
**Last Updated:** 2025-11-18

## 1. High-Level Architecture

InsightPulse Platform is a monorepo-based system consolidating:

- **Apps**: OpEx Portal, Data Lab UI, Docs Site, Admin Console
- **Platform**: Supabase (PostgreSQL + pgvector), Odoo CE/OCA, Data Pipelines
- **Agents**: AI agent registry, skills, MCP integrations, playbooks
- **Design System**: Material-inspired tokens, MUI themes, ECharts themes, shared components
- **Docs**: Human docs + upstream mirrors + RAG knowledge base
- **Automation**: n8n workflows, Deepnote jobs, CI/CD, Mattermost integrations
- **Infrastructure**: Docker, Terraform, environment templates

## 2. System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                   InsightPulse Platform                          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐       │
│  │ OpEx Portal  │  │ Data Lab UI  │  │  Docs Site      │       │
│  │ (Next.js)    │  │ (Next.js)    │  │  (Docusaurus)   │       │
│  └──────┬───────┘  └──────┬───────┘  └────────┬────────┘       │
│         │                 │                    │                │
│         └─────────────────┼────────────────────┘                │
│                           │                                     │
│         ┌─────────────────▼────────────────────┐                │
│         │   Platform Layer                     │                │
│         │  ┌──────────────┐  ┌──────────────┐  │                │
│         │  │   Supabase   │  │   Odoo CE    │  │                │
│         │  │  PostgreSQL  │  │   + OCA      │  │                │
│         │  │  + pgvector  │  │              │  │                │
│         │  │  + Functions │  │              │  │                │
│         │  └──────────────┘  └──────────────┘  │                │
│         └──────────────────────────────────────┘                │
│                           │                                     │
│         ┌─────────────────▼────────────────────┐                │
│         │   Automation & Agents                │                │
│         │  ┌──────┐  ┌──────────┐  ┌────────┐  │                │
│         │  │ n8n  │  │ Deepnote │  │ Agents │  │                │
│         │  │ Flows│  │ Jobs     │  │ + MCP  │  │                │
│         │  └──────┘  └──────────┘  └────────┘  │                │
│         └──────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────────┘
```

## 3. Key Components

### 3.1 Apps Layer

**OpEx Portal** (`apps/opex-portal/`)
- Next.js + MUI frontend
- RAG-powered docs assistant
- Philippine tax compliance tools (BIR forms)
- Connects to Supabase Edge Functions

**Data Lab UI** (`apps/data-lab-ui/`)
- Next.js + MUI + ECharts
- Visualizations for Superset & Deepnote data
- Jenny (AI BI Genie) chat interface
- Real-time metrics dashboards

**Docs Site** (`apps/docs-site/`)
- Docusaurus-based documentation
- Surfaces `docs/insightpulse/**` content
- Links to upstream docs (Odoo, Material)

### 3.2 Platform Layer

**Supabase** (`platform/supabase/`)
- PostgreSQL with pgvector extension
- RAG document storage and vector search
- Edge Functions:
  - `opex-rag-query` - RAG query endpoint
  - `analytics-api` - Data Lab metrics
  - `embedding-worker` - Document embedding
  - `ingest-document` - RAG document ingest

**Odoo CE/OCA** (`platform/odoo/`)
- Odoo Community Edition v17
- Custom modules:
  - `ipai_branding_cleaner` - White-label branding removal
  - (Future) Finance SSC modules
- AGPL-3 licensed, OCA-compliant

**Data Pipelines** (`platform/data-pipelines/`)
- ETL scripts for data transformation
- Scheduled via n8n or cron
- Outputs to Supabase tables

### 3.3 Agents & Skills

**Agent Registry** (`agents/registry/`)
- `agents.yaml` - All agent definitions
- `skills.yaml` - All skill cataloging

**Skills** (`agents/skills/`)
- BPM skills (copywriter, knowledge agent, learning designer, transformation partner)
- CTO Mentor (strategy & architecture)
- InsightPulse Data Lab skills (6 skills for Superset, Deepnote, ECharts)

**MCP Integrations** (`agents/mcp/`)
- Chrome DevTools MCP (design import pipeline)
- Supabase Tools MCP
- Odoo Backend MCP
- n8n Orchestrator MCP

**Playbooks** (`agents/playbooks/`)
- Design Import Pipeline
- Data Lab Healthcheck
- Odoo Branding Guard
- OpEx Triage Flow

### 3.4 Design System

**Tokens** (`design-system/tokens/`)
- Material 3-aligned color palettes
- Typography scales
- Spacing & elevation tokens

**Web Themes** (`design-system/web/`)
- `mui-theme.ts` - MUI theme consuming tokens
- `echarts-theme.ts` - ECharts theme consuming tokens

**Components** (`design-system/web/components/`)
- KpiCard, TimeSeriesChart, RatingDistributionChart
- Shared across all apps

### 3.5 Automation

**n8n Workflows** (`automation/n8n/workflows/`)
- Supabase alert notifier
- (Planned) Design import, docs sync, Data Lab monitoring

**Deepnote** (`automation/deepnote/`)
- Project manifests
- Shared DB helpers
- Scheduled data jobs

**CI/CD** (`automation/ci-cd/github-actions/`)
- Linting (TS, Python, SQL)
- Deployment (apps, Supabase functions)
- Agent/skill validation

## 4. Data Flow

### RAG Query Flow

```
User → OpEx Portal → opex-rag-query Edge Function → pgvector search
                                                   ↓
                        ← Response with citations ← OpenAI + context
```

### Data Lab Metrics Flow

```
Deepnote Job → Supabase Tables → analytics-api Edge Function
                                              ↓
                                    Data Lab UI (ECharts)
```

### Design Import Flow

```
Figma → n8n workflow → Chrome DevTools MCP → Token extraction
                                          ↓
                              design-system/tokens/*.json → Git commit
```

## 5. Deployment

- **Apps**: Vercel (or similar Next.js hosting)
- **Supabase**: Managed Supabase Cloud or self-hosted
- **Odoo**: Docker containers (see `platform/odoo/docker/`)
- **n8n**: Self-hosted n8n instance
- **Deepnote**: Managed Deepnote Cloud

## 6. Security & Compliance

- No secrets in git (use `.env` files per `infra/env-templates/`)
- Odoo modules are AGPL-3 licensed
- RAG data isolated per tenant (future: multi-tenancy)
- Supabase RLS policies for data access control

## 7. References

- **Specs**: `.specify/specs/**`
- **Planning**: `PLANNING.md`
- **Tasks**: `TASKS.md`
- **Changelog**: `CHANGELOG.md`
- **Codebase Guide**: `CODEBASE_GUIDE.md`
