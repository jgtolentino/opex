# InsightPulse Platform – PLANNING.md

This file tracks **medium-term planning** for the InsightPulse Platform monorepo:
- What we're building
- In what phases
- Rough ordering and dependencies

It complements the more detailed specs in `.specify/specs/**`.

---

## 1. Current Focus

**Primary objective:**  
Unify agents, design system, docs, and automations into a single, production-grade monorepo that powers:

- OpEx / AI Ops UI (Next.js + Material/Design tokens)
- InsightPulse Data Lab (Deepnote + Supabase)
- Odoo CE / OCA backend for finance/ops
- n8n-driven automations and MCP-driven agents

---

## 2. Phases

### Phase 0 – Monorepo Bootstrap & Skeleton

**Goal:** Establish the core directory structure and baseline tooling.

**Scope:**
- Create top-level directories:

  - `apps/`
  - `platform/`
  - `agents/`
  - `design-system/`
  - `docs/`
  - `automation/`
  - `infra/`
  - `.specify/specs/`

- Add initial `CLAUDE.md`, `PLANNING.md`, `TASKS.md`, `CHANGELOG.md`.
- Add base linting/formatting (ESLint/Prettier for TS, Black/isort for Python, basic SQL style).
- Confirm CI skeleton exists (`automation/ci-cd/github-actions/`).

**Depends on:** Nothing (bootstrap).

---

### Phase 1 – Design System & Shared Components

**Goal:** Single design system powering all frontends.

**Scope:**
- `design-system/tokens/*.tokens.json`:
  - Colors (Material-inspired / M3-aligned)
  - Typography
  - Spacing, radius, elevation
- `design-system/web/mui-theme.ts`:
  - MUI theme consuming tokens.
- `design-system/web/echarts-theme.ts`:
  - Shared theme for charts.
- `design-system/web/components/`:
  - `KpiCard`, `TimeSeriesChart`, `RatingDistributionChart`, basic layout primitives.

**Depends on:** Phase 0.

---

### Phase 2 – Platform Core (Supabase + Odoo CE/OCA)

**Goal:** Solid data backend with opinionated boundaries.

**Scope:**
- Supabase:

  - Baseline schema + migrations for:
    - RAG tables (documents, chunks, queries)
    - Data Lab metrics (summaries, job runs, experiments)
    - AI Ops metrics (alerts, evaluations)
  - Edge Functions for:
    - `/analytics-api`
    - RAG query and ingest

- Odoo:

  - Place existing `ipai_*` modules under `platform/odoo/addons/`.
  - Ensure AGPL & OCA patterns (manifests, linting).
  - Doc basic runbook under `platform/odoo/docs/`.

**Depends on:** Phase 0.

---

### Phase 3 – Applications (Opex Portal, Data Lab UI, Docs Site)

**Goal:** Frontends wired to the platform & design system.

**Scope:**
- `apps/opex-portal/`:
  - Next.js + MUI
  - Uses design system theme + components
  - Integrates with Supabase Edge Functions (`analytics-api`, RAG feedback)

- `apps/data-lab-ui/`:
  - Uses same design system
  - Shows metrics produced by Deepnote jobs
  - Provides links into Deepnote project(s)

- `apps/docs-site/`:
  - Docusaurus/Next.js docs frontend
  - Surfacing `docs/insightpulse/**` content

**Depends on:** Phases 1 & 2.

---

### Phase 4 – Agents, Skills & MCP Integration

**Goal:** Formalize agent architecture and wiring.

**Scope:**
- `agents/registry/agents.yaml` & `skills.yaml` populated.
- `agents/skills/**/SKILL.md` migrated/refined from existing `.claude/skills/**`.
- `agents/mcp/*.mcp.json` for:

  - Chrome DevTools
  - Supabase tools
  - Odoo backend
  - n8n orchestrator
  - Other core MCP servers

- `agents/playbooks/*.md` for:

  - Design Import Pipeline
  - Data Lab healthcheck
  - Odoo branding guard
  - OpEx triage flow

**Depends on:** Phase 0, partial Phase 2.

---

### Phase 5 – Automation (n8n, Deepnote, CI/CD, Mattermost)

**Goal:** Glue everything together with reliable automations.

**Scope:**
- `automation/n8n/workflows/*.json`:

  - Design Import Pipeline v3
  - Sync upstream docs → RAG
  - Data Lab job monitor
  - Odoo branding guard + alerts

- `automation/deepnote/`:

  - `project-manifest.yaml`
  - Shared DB helpers + code templates for notebooks

- `automation/mattermost/`:

  - Slash command documentation (`/ask`, `/docs`, `/ai-health`)
  - Webhook documentation for alerts and pipelines

- `automation/ci-cd/github-actions/*.yml`:

  - Deploy Opex/Data Lab
  - Deploy Supabase functions
  - Validate agents/skills and specs

**Depends on:** Phases 1–4.

---

### Phase 6 – Hardening, Observability & Docs

**Goal:** Make the system "production-grade and boring".

**Scope:**
- Health dashboards (Data Lab UI pages + Supabase metrics).
- Alerting on:

  - Failing Data Lab jobs
  - Failing n8n workflows
  - Schema drift / migration failures

- Documentation:

  - High-level architecture in `docs/insightpulse/architecture/`
  - Runbooks per subsystem (Odoo, Supabase, n8n, agents)

**Depends on:** All earlier phases.

---

## 3. Milestones Snapshot

- **M0:** Monorepo structure in place, baseline tooling wired.
- **M1:** Design system tokens + themes powering at least one app.
- **M2:** Supabase + Odoo baseline schemas and docs in place.
- **M3:** Opex/Data Lab UIs live on top of real data.
- **M4:** Agents + MCP flows wired and documented.
- **M5:** Automation + health monitoring in place.
- **M6:** Docs and runbooks reflect reality; system is auditable and boring.

---

## 4. Planning Conventions

- Use `.specify/specs/**` for feature-level detail.
- Keep this `PLANNING.md` at **roadmap / milestone** level.
- Avoid duplicating low-level tasks here; those belong in `TASKS.md`.
