# Plan: Monorepo Architecture & Structure

**Spec:** 004 – InsightPulse Platform Monorepo Structure  
**Status:** In Progress  
**Last Updated:** 2025-11-18  

---

## 1. Implementation Approach

This plan outlines how to bootstrap and incrementally migrate to the InsightPulse Platform monorepo structure.

### Strategy
- **Phase 0:** Bootstrap skeleton (directories, coordination files)
- **Incremental Migration:** Move existing code/config in logical groups
- **Non-Breaking:** Maintain existing functionality during migration
- **Spec-Driven:** Document major features as we go

---

## 2. Phase 0 – Bootstrap (Current Phase)

### Goals
1. Create all top-level directories
2. Add coordination files (CLAUDE.md, PLANNING.md, TASKS.md, CHANGELOG.md)
3. Establish this spec as the pattern for future specs

### Implementation Steps

#### Step 1: Create Directory Structure
```bash
mkdir -p apps/{opex-portal,data-lab-ui,docs-site,admin-console,client-portals}
mkdir -p platform/supabase/{migrations,functions,seeds,config}
mkdir -p platform/odoo/{docker,addons,docs}
mkdir -p platform/data-pipelines/{extract,transform,load}
mkdir -p platform/experiments/{rag,models}
mkdir -p agents/{registry,skills,profiles,mcp,playbooks}
mkdir -p design-system/{tokens,web/{charts,components/{buttons,layout,data-viz}},figma,stories/storybook}
mkdir -p docs/{insightpulse/{opex,data-lab,n8n,odoo-patterns,agents,architecture},upstream,ai-knowledge/{ingest-scripts,manifests}}
mkdir -p automation/{n8n/workflows,deepnote,ci-cd/github-actions,mattermost,scripts}
mkdir -p infra/{terraform,k8s,docker,env-templates}
mkdir -p .specify/specs
```

#### Step 2: Add Coordination Files
- [x] Rename existing CLAUDE.md → CODEBASE_GUIDE.md
- [x] Create new CLAUDE.md (AI copilot instructions)
- [x] Create PLANNING.md (phase-based roadmap)
- [x] Create TASKS.md (cross-repo checklist)
- [x] Create CHANGELOG.md (version history)

#### Step 3: Create This Spec
- [x] Create `.specify/specs/004-monorepo-structure/spec.md`
- [x] Create `.specify/specs/004-monorepo-structure/plan.md` (this file)
- [ ] Create `.specify/specs/004-monorepo-structure/tasks.md`

#### Step 4: Document Structure
- [ ] Add README.md at repo root explaining layout
- [ ] Add README.md in each major directory explaining purpose

---

## 3. Phase 1 – Migrate Existing Code

### 3.1 Platform (Supabase)
**Goal:** Consolidate Supabase code under `platform/supabase/`

**Current State:**
- `supabase/` directory exists at root
- Contains migrations, functions

**Target State:**
- Move to `platform/supabase/`
- Update references in deployment scripts

**Tasks:**
- [ ] Move `supabase/migrations/` → `platform/supabase/migrations/`
- [ ] Move `supabase/functions/` → `platform/supabase/functions/`
- [ ] Update deployment scripts
- [ ] Update CI/CD workflows
- [ ] Test edge function deployment

### 3.2 Platform (Odoo)
**Goal:** Consolidate Odoo code under `platform/odoo/`

**Current State:**
- `odoo/` directory exists at root
- Contains custom modules

**Target State:**
- Move to `platform/odoo/addons/`
- Add docker setup
- Add runbook docs

**Tasks:**
- [ ] Move `odoo/*` → `platform/odoo/addons/`
- [ ] Create `platform/odoo/docker/` with docker-compose
- [ ] Create `platform/odoo/docs/runbook.md`
- [ ] Ensure AGPL-3 compliance
- [ ] Add OCA linting config

### 3.3 Agents & Skills
**Goal:** Consolidate agent definitions under `agents/`

**Current State:**
- `.claude/skills/` exists
- `agents/agentic-architect/` exists

**Target State:**
- Unified registry in `agents/registry/`
- Skill definitions in `agents/skills/`
- MCP configs in `agents/mcp/`

**Tasks:**
- [ ] Create `agents/registry/agents.yaml`
- [ ] Create `agents/registry/skills.yaml`
- [ ] Migrate `.claude/skills/*` → `agents/skills/*/SKILL.md`
- [ ] Document existing agents in registry
- [ ] Create MCP config templates in `agents/mcp/`

### 3.4 Automation (n8n)
**Goal:** Organize n8n workflows under `automation/n8n/`

**Current State:**
- `automation/n8n/` exists
- Contains workflow JSONs

**Target State:**
- Clean organization with docs

**Tasks:**
- [ ] Ensure all workflows in `automation/n8n/workflows/`
- [ ] Add README.md explaining each workflow
- [ ] Document webhook endpoints
- [ ] Add Mattermost slash command docs

### 3.5 Documentation
**Goal:** Organize docs under `docs/insightpulse/`

**Current State:**
- `docs/` directory exists with various content

**Target State:**
- First-party docs in `docs/insightpulse/`
- Upstream mirrors in `docs/upstream/`
- RAG ingest setup in `docs/ai-knowledge/`

**Tasks:**
- [ ] Organize existing docs into `docs/insightpulse/` subdirectories
- [ ] Add `docs/upstream/` for Odoo docs submodule
- [ ] Create ingest scripts in `docs/ai-knowledge/ingest-scripts/`
- [ ] Create manifests in `docs/ai-knowledge/manifests/`

---

## 4. Phase 2 – Design System

### Goal
Create unified design system powering all frontends.

### Tasks
- [ ] Define tokens in `design-system/tokens/`
  - [ ] color.tokens.json
  - [ ] typography.tokens.json
  - [ ] spacing.tokens.json
- [ ] Create MUI theme consuming tokens
- [ ] Create ECharts theme consuming tokens
- [ ] Build shared components (KpiCard, TimeSeriesChart, etc.)
- [ ] Add Storybook (optional)

---

## 5. Phase 3 – Applications

### Goal
Scaffold frontends using design system.

### Tasks
- [ ] Create `apps/opex-portal/` (Next.js + MUI)
- [ ] Create `apps/data-lab-ui/` (Next.js + MUI + ECharts)
- [ ] Migrate/create `apps/docs-site/` (Docusaurus/Next.js)
- [ ] Integrate with Supabase Edge Functions
- [ ] Add health check pages

---

## 6. Phase 4 – Infrastructure

### Goal
Add IaC and environment templates.

### Tasks
- [ ] Create `infra/docker/docker-compose.dev.yml`
- [ ] Create env templates in `infra/env-templates/`
- [ ] (Optional) Add Terraform skeleton
- [ ] Document local dev setup

---

## 7. Phase 5 – CI/CD & Automation

### Goal
Automate testing, linting, and deployment.

### Tasks
- [ ] Add GitHub Actions for linting (TS, Python, SQL)
- [ ] Add deployment workflows for apps
- [ ] Add Supabase function deployment workflow
- [ ] Add agent/skill validation workflow
- [ ] Add spec validation workflow
- [ ] Set up Mattermost alerts

---

## 8. Risk Mitigation

### Risk: Breaking existing functionality during migration
**Mitigation:**
- Incremental migration with thorough testing
- Keep old structure until new structure is validated
- Use symlinks temporarily if needed

### Risk: Import path chaos
**Mitigation:**
- Use TypeScript path aliases
- Update all imports in one atomic commit per area
- Automated linting to catch broken imports

### Risk: Confusion about where to add new code
**Mitigation:**
- Clear documentation in CLAUDE.md and README files
- Consistent patterns across all directories
- Specs guide major additions

---

## 9. Rollout Schedule

- **Week 1:** Phase 0 (Bootstrap) ← **CURRENT**
- **Week 2-3:** Phase 1 (Migrate existing code)
- **Week 4-5:** Phase 2 (Design system)
- **Week 6-8:** Phase 3 (Applications)
- **Week 9:** Phase 4 (Infrastructure)
- **Week 10+:** Phase 5 (CI/CD & Automation)

Timeline is approximate and will adjust based on priorities and dependencies.

---

## 10. Success Metrics

- [ ] All code organized according to monorepo structure
- [ ] No orphaned directories or files
- [ ] All imports using correct paths
- [ ] CI/CD passing for all checks
- [ ] Documentation accurate and up-to-date
- [ ] New contributors can navigate repo using CLAUDE.md + README files

---

## 11. Next Steps

1. Complete Phase 0 tasks (directories, coordination files, this spec)
2. Update TASKS.md with all items from this plan
3. Begin Phase 1 migration starting with platform components
4. Create specs for major features as they're migrated
