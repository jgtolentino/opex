# Spec: Monorepo Architecture & Structure

**ID:** 004  
**Title:** InsightPulse Platform Monorepo Structure  
**Status:** In Progress  
**Owner:** InsightPulse Platform Team  
**Created:** 2025-11-18  

---

## 1. Overview

This spec defines the **canonical directory structure and organizational patterns** for the InsightPulse Platform monorepo.

The monorepo consolidates:
- **Apps** (frontends: OpEx portal, Data Lab UI, docs site, admin console)
- **Platform** (Supabase, Odoo CE/OCA, data pipelines, experiments)
- **Agents** (registry, skills, MCP configs, playbooks)
- **Design System** (tokens, themes, shared components)
- **Docs** (human docs, upstream mirrors, RAG knowledge)
- **Automation** (n8n, Deepnote, CI/CD, Mattermost)
- **Infrastructure** (Terraform, Docker, env templates)

---

## 2. Goals

1. **Single Source of Truth**
   - One repo for all InsightPulse platform code, config, docs, and specs.

2. **Locality Principle**
   - Related code/config lives close together (e.g., `platform/odoo/` contains addons, docker, and docs).

3. **Clear Boundaries**
   - Explicit separation between apps, platform, agents, design system, docs, automation, and infra.

4. **Spec-Driven Development**
   - All major features tracked via `.specify/specs/**/` with `spec.md`, `plan.md`, `tasks.md`.

5. **Production-Grade Patterns**
   - Tooling, linting, and conventions that support boring reliability.

---

## 3. Monorepo Structure

### 3.1 Top-Level Layout

```
/
├── apps/                   # All frontends (Next.js, docs, admin, client portals)
├── platform/               # Supabase, Odoo, pipelines, experiments
├── agents/                 # Agent registry, skills, MCP configs, playbooks
├── design-system/          # Tokens, themes, shared UI components, Figma mappings
├── docs/                   # Human docs + upstream mirrors + RAG ingest manifests
├── automation/             # n8n, Deepnote, CI/CD, Mattermost, helper scripts
├── infra/                  # Terraform, Docker, k8s, env templates
├── .specify/specs/         # Spec Kit specs (spec.md, plan.md, tasks.md)
├── .claude/                # Optional client configs, MCP routing (if present)
├── CLAUDE.md               # AI copilot instructions
├── PLANNING.md             # Phase-based roadmap
├── TASKS.md                # Cross-cutting implementation checklist
├── CHANGELOG.md            # Version history
├── CODEBASE_GUIDE.md       # Comprehensive codebase documentation
└── README.md               # Repo overview and getting started
```

### 3.2 Directory Purposes

#### `apps/`
All user-facing frontends:
- `opex-portal/` – Next.js + MUI OpEx / AI Ops UI
- `data-lab-ui/` – Data Lab dashboard (ECharts, Deepnote links)
- `docs-site/` – Docusaurus / Next.js docs frontend
- `admin-console/` – Internal admin tools (agents, experiments, config)
- `client-portals/` – (optional) White-label client views

#### `platform/`
Backend systems and data infrastructure:
- `supabase/` – PostgreSQL + pgvector, Edge Functions, migrations
- `odoo/` – Odoo CE/OCA addons, docker setup, runbooks
- `data-pipelines/` – ETL scripts (extract, transform, load)
- `experiments/` – RAG experiments, model registry

#### `agents/`
AI agent architecture:
- `registry/` – `agents.yaml`, `skills.yaml` (canonical registry)
- `skills/` – Skill definitions (SKILL.md per skill)
- `profiles/` – Agent persona specs
- `mcp/` – MCP server configs (Chrome DevTools, Supabase, Odoo, n8n)
- `playbooks/` – End-to-end workflows (Design Import, Data Lab health, etc.)

#### `design-system/`
Unified design language:
- `tokens/` – JSON token files (color, typography, spacing)
- `web/` – MUI theme, ECharts theme, shared components
- `figma/` – Figma token exports and mappings
- `stories/` – Storybook (optional)

#### `docs/`
Documentation and knowledge:
- `insightpulse/` – First-party docs (OpEx, Data Lab, n8n, Odoo patterns, agents)
- `upstream/` – Mirrored docs (Odoo CE/OCA, git submodules)
- `ai-knowledge/` – RAG ingest scripts and manifests

#### `automation/`
Workflows and integrations:
- `n8n/workflows/` – Exportable n8n workflow JSON files
- `deepnote/` – Project manifest, shared DB helpers
- `mattermost/` – Slash commands, webhook docs
- `ci-cd/github-actions/` – CI/CD workflows
- `scripts/` – Helper scripts (sync, seed, health checks)

#### `infra/`
Infrastructure as code:
- `terraform/` – Cloud infrastructure definitions
- `k8s/` – Kubernetes manifests (if applicable)
- `docker/` – Docker Compose files
- `env-templates/` – `.env` examples for each service

#### `.specify/specs/`
Spec Kit feature specs:
- Each spec in its own directory (e.g., `001-insightpulseai-data-lab/`)
- Contains: `spec.md`, `plan.md`, `tasks.md`

---

## 4. Cross-Cutting Concerns

### 4.1 Configuration Files

Root-level coordination files:
- **CLAUDE.md** – Instructions for AI copilots on how to work in the repo
- **PLANNING.md** – High-level roadmap and phases
- **TASKS.md** – Cross-repo checklist (not feature-specific)
- **CHANGELOG.md** – Version history and release notes
- **CODEBASE_GUIDE.md** – Comprehensive technical documentation
- **README.md** – Quick start and repo overview

### 4.2 Tooling & Linting

- **ESLint + Prettier** for TypeScript/JavaScript
- **Black + isort** for Python
- **SQL style** (basic linting where feasible)
- **GitHub Actions** for CI/CD validation

### 4.3 Shared Libraries

- Design system components exported from `design-system/web/components/`
- RAG utilities (potentially shared across apps and agents)
- Supabase client wrappers

---

## 5. Migration Strategy

### 5.1 Current State
- Existing code scattered across:
  - `apps/admin-shell/`
  - `agents/agentic-architect/`
  - `.claude/skills/`
  - `automation/n8n/`
  - `docs/`
  - `supabase/`
  - `odoo/`

### 5.2 Target State
- All code organized according to the new monorepo structure
- Legacy directories either:
  - Migrated into new structure, or
  - Clearly marked as deprecated

### 5.3 Migration Steps
1. Create new directory structure (Phase 0)
2. Incrementally move existing code into appropriate directories
3. Update import paths and references
4. Add specs for major components
5. Deprecate old structure

---

## 6. Success Criteria

- [ ] All top-level directories exist and are documented
- [ ] Core coordination files (CLAUDE.md, PLANNING.md, TASKS.md, CHANGELOG.md) in place
- [ ] At least one spec under `.specify/specs/` demonstrating the pattern
- [ ] CI/CD validates structure and linting
- [ ] README.md clearly explains repo layout

---

## 7. Non-Goals

- Not migrating all existing code in one go (incremental migration preferred)
- Not enforcing strict monorepo tooling (e.g., Nx, Turborepo) yet (may add later)
- Not creating apps/services that don't yet have clear requirements

---

## 8. Open Questions

- Should we use pnpm workspaces for managing dependencies across apps?
- Do we need a shared `packages/` directory for cross-app TypeScript libraries?
- How do we handle versioning for individual apps vs the monorepo as a whole?

---

## 9. References

- `.specify/specs/004-monorepo-structure/plan.md` – Implementation plan
- `.specify/specs/004-monorepo-structure/tasks.md` – Task breakdown
- `PLANNING.md` – Overall platform roadmap
- `TASKS.md` – Cross-repo task checklist
