# InsightPulse Platform – TASKS.md

This file tracks **concrete, checkable tasks** across the monorepo.

For feature-specific tasks, see `.specify/specs/**/tasks.md`.  
This file is for repo-wide and cross-cutting work.

Use `[ ]` → `[x]` as work is completed.

---

## A. Monorepo Bootstrap & Tooling

- [x] A1 – Create base directory structure:
  - [x] `apps/`, `platform/`, `agents/`, `design-system/`, `docs/`, `automation/`, `infra/`, `.specify/specs/`
- [x] A2 – Add core meta files:
  - [x] `CLAUDE.md`
  - [x] `PLANNING.md`
  - [x] `TASKS.md`
  - [ ] `CHANGELOG.md`
- [ ] A3 – Configure base tooling:
  - [ ] ESLint + Prettier (TS/JS)
  - [ ] Python formatter/linter (Black + isort or equivalent)
  - [ ] Basic SQL style/lint (where feasible)
- [ ] A4 – Add root `README.md` describing repo layout and entrypoints.

---

## B. Design System & Shared Components

- [ ] B1 – Set up token structure:
  - [ ] `design-system/tokens/color.tokens.json`
  - [ ] `design-system/tokens/typography.tokens.json`
  - [ ] `design-system/tokens/spacing.tokens.json`
- [ ] B2 – Implement web mappings:
  - [ ] `design-system/web/mui-theme.ts` consuming tokens
  - [ ] `design-system/web/echarts-theme.ts` consuming tokens
- [ ] B3 – Implement shared components:
  - [ ] `design-system/web/components/KpiCard.tsx`
  - [ ] `design-system/web/components/TimeSeriesChart.tsx`
  - [ ] `design-system/web/components/RatingDistributionChart.tsx`
- [ ] B4 – Add minimal Storybook or demo page for components (optional but recommended).

---

## C. Platform – Supabase

- [ ] C1 – Initialize Supabase project structure under `platform/supabase/`:
  - [ ] `migrations/`
  - [ ] `functions/`
  - [ ] `seeds/`
- [ ] C2 – Create migrations for:
  - [ ] RAG document + chunk tables
  - [ ] RAG query logging
  - [ ] Data Lab summary tables (hourly/daily)
  - [ ] Job runs / experiments / model registry
- [ ] C3 – Implement Edge Functions:
  - [ ] `analytics-api` (overview, rag-quality, alerts, analytics endpoints)
  - [ ] RAG query (`opex-rag-query`)
  - [ ] RAG ingest (`opex-rag-ingest-doc`)
- [ ] C4 – Document schema and functions in `docs/insightpulse/data-platform/`.

---

## D. Platform – Odoo CE / OCA

- [ ] D1 – Place custom Odoo modules under `platform/odoo/addons/ipai_*`.
- [ ] D2 – Ensure manifests are AGPL-3 and OCA-style:
  - [ ] `author`, `website`, `license`, `installable`, `application`, `auto_install`
- [ ] D3 – Add OCA linting:
  - [ ] `pylint-odoo` configuration + basic CI step
- [ ] D4 – Create `platform/odoo/docs/runbook.md`:
  - [ ] Dev environment setup
  - [ ] Upgrade flow
  - [ ] Common admin operations

---

## E. Applications

- [ ] E1 – Scaffold `apps/opex-portal/`:
  - [ ] Next.js + MUI + shared theme
  - [ ] Health check page
- [ ] E2 – Scaffold `apps/data-lab-ui/`:
  - [ ] Next.js + MUI + shared theme
  - [ ] Overview page with placeholder charts using design system components
- [ ] E3 – Scaffold `apps/docs-site/`:
  - [ ] Docusaurus/Next.js-based docs frontend
  - [ ] Reads from `docs/insightpulse/**`
- [ ] E4 – Integrate `apps/opex-portal/` with `analytics-api` for basic KPIs.

---

## F. Agents, Skills & MCP

- [ ] F1 – Create `agents/registry/agents.yaml`:
  - [ ] Register core agents (OpEx assistant, Data Lab assistant, Odoo architect, Design-Import agent, etc.)
- [ ] F2 – Create `agents/registry/skills.yaml`:
  - [ ] List skills with domain tags and linked docs/specs
- [ ] F3 – Migrate existing skill definitions into `agents/skills/**/SKILL.md`.
- [ ] F4 – Add MCP configs to `agents/mcp/`:
  - [ ] Chrome DevTools MCP
  - [ ] Supabase MCP
  - [ ] Odoo backend MCP
  - [ ] n8n orchestrator MCP
- [ ] F5 – Document main playbooks in `agents/playbooks/`:
  - [ ] Design Import Pipeline
  - [ ] InsightPulse Data Lab rebuild
  - [ ] Odoo branding guard
  - [ ] AI Ops triage flow

---

## G. Automation – n8n, Deepnote, CI/CD, Mattermost

- [ ] G1 – Add `automation/n8n/workflows/`:
  - [ ] `design-import-pipeline-v3.json`
  - [ ] `sync-docs-to-rag.json`
  - [ ] `data-lab-job-monitor.json`
  - [ ] `odoo-branding-guard.json`
- [ ] G2 – Add `automation/deepnote/`:
  - [ ] `project-manifest.yaml`
  - [ ] Shared DB helper snippets
- [ ] G3 – Add `automation/mattermost/` docs:
  - [ ] Slash commands spec (`/ask`, `/docs`, `/ai-health`)
  - [ ] Incoming webhook endpoints used by n8n/Edge Functions
- [ ] G4 – Add `automation/ci-cd/github-actions/`:
  - [ ] Deploy frontends
  - [ ] Deploy Supabase migrations/functions
  - [ ] Run linters, tests, OCA checks
  - [ ] Basic agent/skills validation script

---

## H. Infra & Environments

- [ ] H1 – Create `infra/docker/docker-compose.dev.yml` for local stack.
- [ ] H2 – Create `infra/env-templates/`:
  - [ ] `.env.opex.example`
  - [ ] `.env.supabase.example`
  - [ ] `.env.odoo.example`
- [ ] H3 – (Optional) Add Terraform skeleton under `infra/terraform/` for cloud infra.

---

## I. Documentation & Specs

- [ ] I1 – Create `docs/insightpulse/architecture/overview.md`.
- [ ] I2 – Add runbooks:
  - [ ] `docs/insightpulse/opex/runbook.md`
  - [ ] `docs/insightpulse/data-lab/runbook.md`
  - [ ] `docs/insightpulse/automation/runbook.md`
- [ ] I3 – Ensure each major area has a Spec Kit spec under `.specify/specs/**`.

---

As tasks complete, mark them `[x]` and, where appropriate, reflect major milestones in `CHANGELOG.md`.
