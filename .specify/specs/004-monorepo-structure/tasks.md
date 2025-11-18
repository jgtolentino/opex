# Tasks: Monorepo Architecture & Structure

**Spec:** 004 – InsightPulse Platform Monorepo Structure  
**Status:** In Progress  
**Last Updated:** 2025-11-18  

---

## Phase 0: Bootstrap (Current Phase)

### Directory Structure
- [x] Create `apps/` directory with subdirectories
- [x] Create `platform/` directory with subdirectories
- [x] Create `agents/` directory with subdirectories
- [x] Create `design-system/` directory with subdirectories
- [x] Create `docs/` directory with subdirectories
- [x] Create `automation/` directory with subdirectories
- [x] Create `infra/` directory with subdirectories
- [x] Create `.specify/specs/` directory

### Coordination Files
- [x] Rename existing CLAUDE.md to CODEBASE_GUIDE.md
- [x] Create new CLAUDE.md (AI copilot instructions)
- [x] Create PLANNING.md (phase-based roadmap)
- [x] Create TASKS.md (cross-repo checklist)
- [x] Create CHANGELOG.md (version history)

### Spec Files
- [x] Create `.specify/specs/004-monorepo-structure/spec.md`
- [x] Create `.specify/specs/004-monorepo-structure/plan.md`
- [x] Create `.specify/specs/004-monorepo-structure/tasks.md` (this file)

### Documentation
- [ ] Add README.md at repo root
- [ ] Add README.md in `apps/` explaining app structure
- [ ] Add README.md in `platform/` explaining platform components
- [ ] Add README.md in `agents/` explaining agent architecture
- [ ] Add README.md in `design-system/` explaining design tokens
- [ ] Add README.md in `docs/` explaining docs organization
- [ ] Add README.md in `automation/` explaining workflows
- [ ] Add README.md in `infra/` explaining infrastructure

### Git & CI
- [ ] Commit Phase 0 changes
- [ ] Push to feature branch
- [ ] Verify CI passes (if applicable)

---

## Phase 1: Migrate Platform Components

### Supabase Migration
- [ ] Move `supabase/migrations/` to `platform/supabase/migrations/`
- [ ] Move `supabase/functions/` to `platform/supabase/functions/`
- [ ] Update deployment scripts to reference new paths
- [ ] Update CI/CD workflows for new paths
- [ ] Test edge function deployment
- [ ] Update documentation references
- [ ] Remove old `supabase/` directory

### Odoo Migration
- [ ] Move `odoo/*` to `platform/odoo/addons/`
- [ ] Create `platform/odoo/docker/docker-compose.yml`
- [ ] Create `platform/odoo/docs/runbook.md`
- [ ] Verify AGPL-3 license headers on all modules
- [ ] Add OCA linting configuration
- [ ] Test Odoo module loading
- [ ] Update documentation references
- [ ] Remove old `odoo/` directory

### Data Pipelines
- [ ] Identify existing ETL scripts
- [ ] Move to `platform/data-pipelines/` with appropriate subdirectories
- [ ] Document each pipeline
- [ ] Update cron jobs or automation configs

---

## Phase 1: Migrate Agents & Skills

### Agent Registry
- [ ] Create `agents/registry/agents.yaml` with schema
- [ ] Document existing OpEx assistant
- [ ] Document existing PH Tax assistant
- [ ] Document Data Lab assistant
- [ ] Document Design Import agent
- [ ] Document other agents as discovered

### Skills Migration
- [ ] Create `agents/registry/skills.yaml` with schema
- [ ] Migrate `.claude/skills/bpm_copywriter/` → `agents/skills/bpm-copywriter/`
- [ ] Migrate `.claude/skills/bpm_knowledge_agent/` → `agents/skills/bpm-knowledge-agent/`
- [ ] Migrate `.claude/skills/bpm_learning_designer/` → `agents/skills/bpm-learning-designer/`
- [ ] Migrate `.claude/skills/bpm_transformation_partner/` → `agents/skills/bpm-transformation-partner/`
- [ ] Migrate `.claude/skills/cto_mentor/` → `agents/skills/cto-mentor/`
- [ ] Migrate all InsightPulse Data Lab skills (6 skills)
- [ ] Update skill references in agent configs
- [ ] Remove old `.claude/skills/` directory (or mark as deprecated)

### Agent Profiles
- [ ] Create profiles for each agent persona in `agents/profiles/`
- [ ] Document agent capabilities and use cases
- [ ] Link profiles to skills in registry

### MCP Configs
- [ ] Create `agents/mcp/chrome-devtools.mcp.json`
- [ ] Create `agents/mcp/supabase-tools.mcp.json`
- [ ] Create `agents/mcp/n8n-orchestrator.mcp.json`
- [ ] Create `agents/mcp/odoo-backend.mcp.json`
- [ ] Document MCP server setup

### Playbooks
- [ ] Create `agents/playbooks/design-import-pipeline.md`
- [ ] Create `agents/playbooks/data-lab-healthcheck.md`
- [ ] Create `agents/playbooks/opex-triage-flow.md`
- [ ] Create `agents/playbooks/odoo-branding-guard.md`

---

## Phase 1: Migrate Automation

### n8n Workflows
- [ ] Ensure all workflows in `automation/n8n/workflows/`
- [ ] Create README documenting each workflow
- [ ] Verify workflow import/export process
- [ ] Document webhook endpoints

### Deepnote
- [ ] Create `automation/deepnote/project-manifest.yaml`
- [ ] Document notebook organization
- [ ] Create shared DB helper templates
- [ ] Document data job schedules

### Mattermost
- [ ] Create `automation/mattermost/slash-commands.md`
- [ ] Document `/ask` command
- [ ] Document `/docs` command
- [ ] Document `/ai-health` command
- [ ] Create `automation/mattermost/webhooks.md`
- [ ] Document incoming webhook URLs and formats

### Scripts
- [ ] Move helper scripts to `automation/scripts/`
- [ ] Document each script's purpose
- [ ] Update cron jobs or automation references

---

## Phase 1: Migrate Documentation

### InsightPulse Docs
- [ ] Organize existing docs into `docs/insightpulse/` subdirectories:
  - [ ] `opex/`
  - [ ] `data-lab/`
  - [ ] `n8n/`
  - [ ] `odoo-patterns/`
  - [ ] `agents/`
  - [ ] `architecture/`
- [ ] Create architecture overview in `docs/insightpulse/architecture/overview.md`
- [ ] Create runbooks:
  - [ ] `docs/insightpulse/opex/runbook.md`
  - [ ] `docs/insightpulse/data-lab/runbook.md`
  - [ ] `docs/insightpulse/automation/runbook.md`

### Upstream Docs
- [ ] Add Odoo docs as git submodule in `docs/upstream/odoo-docs/`
- [ ] (Optional) Add OCA docs submodules as needed
- [ ] Document upstream doc usage and attribution

### AI Knowledge
- [ ] Create `docs/ai-knowledge/ingest-scripts/odoo_docs_ingest.py`
- [ ] Create `docs/ai-knowledge/ingest-scripts/vendor_material_ingest.py`
- [ ] Create manifests:
  - [ ] `docs/ai-knowledge/manifests/odoo-docs-manifest.json`
  - [ ] `docs/ai-knowledge/manifests/material-docs-manifest.json`
  - [ ] `docs/ai-knowledge/manifests/google-charts-manifest.json`

---

## Phase 2: Design System

### Tokens
- [ ] Create `design-system/tokens/color.tokens.json`
- [ ] Create `design-system/tokens/typography.tokens.json`
- [ ] Create `design-system/tokens/spacing.tokens.json`
- [ ] Document token usage guidelines

### Web Mappings
- [ ] Create `design-system/web/mui-theme.ts` consuming tokens
- [ ] Create `design-system/web/echarts-theme.ts` consuming tokens
- [ ] Test themes in sample app
- [ ] Document theme customization

### Components
- [ ] Create `design-system/web/components/KpiCard.tsx`
- [ ] Create `design-system/web/components/TimeSeriesChart.tsx`
- [ ] Create `design-system/web/components/RatingDistributionChart.tsx`
- [ ] Add component documentation
- [ ] (Optional) Set up Storybook

### Figma Integration
- [ ] Export tokens from Figma to `design-system/figma/tokens-export.json`
- [ ] Create mapping documentation in `design-system/figma/mapping.md`
- [ ] Validate token parity

---

## Phase 3: Applications

### OpEx Portal
- [ ] Scaffold `apps/opex-portal/` with Next.js + MUI
- [ ] Integrate design system theme
- [ ] Create health check page
- [ ] Integrate with Supabase Edge Functions
- [ ] Add basic navigation
- [ ] Deploy to Vercel (or similar)

### Data Lab UI
- [ ] Scaffold `apps/data-lab-ui/` with Next.js + MUI + ECharts
- [ ] Integrate design system components
- [ ] Create overview dashboard with placeholder charts
- [ ] Add links to Deepnote projects
- [ ] Integrate with Supabase for metrics
- [ ] Deploy to Vercel (or similar)

### Docs Site
- [ ] Scaffold `apps/docs-site/` with Docusaurus or Next.js
- [ ] Configure to read from `docs/insightpulse/**`
- [ ] Add navigation structure
- [ ] Integrate search
- [ ] Add "Ask OpEx" chat widget (optional)
- [ ] Deploy to Vercel (or similar)

### Admin Console
- [ ] (Future) Scaffold `apps/admin-console/` for internal tools
- [ ] (Future) Add agent management UI
- [ ] (Future) Add experiment tracking UI
- [ ] (Future) Add config management

---

## Phase 4: Infrastructure

### Docker
- [ ] Create `infra/docker/docker-compose.dev.yml` for local development
- [ ] Include services: Supabase (local), Odoo, n8n, etc.
- [ ] Document local setup process

### Environment Templates
- [ ] Create `infra/env-templates/.env.opex.example`
- [ ] Create `infra/env-templates/.env.supabase.example`
- [ ] Create `infra/env-templates/.env.odoo.example`
- [ ] Document required environment variables

### Terraform (Optional)
- [ ] Create `infra/terraform/` skeleton
- [ ] Define cloud resources (if applicable)
- [ ] Document deployment process

---

## Phase 5: CI/CD & Automation

### Linting & Testing
- [ ] Add GitHub Action: ESLint + Prettier for TypeScript/JavaScript
- [ ] Add GitHub Action: Black + isort for Python
- [ ] Add GitHub Action: SQL linting (if feasible)
- [ ] Add GitHub Action: Spec validation

### Deployment
- [ ] Add GitHub Action: Deploy Opex Portal
- [ ] Add GitHub Action: Deploy Data Lab UI
- [ ] Add GitHub Action: Deploy Docs Site
- [ ] Add GitHub Action: Deploy Supabase migrations
- [ ] Add GitHub Action: Deploy Supabase functions

### Agent/Skill Validation
- [ ] Create validation script for agents.yaml
- [ ] Create validation script for skills.yaml
- [ ] Add GitHub Action to run validation on PR

### Alerts
- [ ] Configure Mattermost alerts for failed workflows
- [ ] Configure Mattermost alerts for failed Data Lab jobs
- [ ] Configure Mattermost alerts for deployment status

---

## Acceptance Criteria

### Phase 0 Complete
- [x] All directories exist
- [x] All coordination files created
- [x] Spec bundle complete
- [ ] README files added
- [ ] Changes committed and pushed

### Phase 1 Complete
- [ ] All existing code migrated to new structure
- [ ] No broken imports or references
- [ ] Old directories removed or clearly deprecated
- [ ] Documentation updated

### Phase 2 Complete
- [ ] Design system tokens defined
- [ ] Themes created and tested
- [ ] Shared components implemented
- [ ] At least one app using design system

### Phase 3 Complete
- [ ] All planned apps scaffolded
- [ ] Apps using design system
- [ ] Apps deployed to staging/production
- [ ] Health checks passing

### Phase 4 Complete
- [ ] Local dev environment documented and working
- [ ] Environment templates complete
- [ ] Infrastructure as code (if applicable) functional

### Phase 5 Complete
- [ ] All CI/CD workflows active and passing
- [ ] Automated deployments working
- [ ] Alerts configured and tested
- [ ] Team onboarded to new processes

---

## Notes

- Tasks can be done in parallel where dependencies allow
- Update TASKS.md (root) as cross-cutting tasks are completed
- Update CHANGELOG.md for each phase completion
- Create additional specs as needed for complex features
