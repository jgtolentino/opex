# InsightPulse Platform – CHANGELOG

All notable changes to this monorepo will be documented in this file.

Format loosely follows [Keep a Changelog] concepts:
- Grouped by version
- Sections: Added, Changed, Fixed, Removed, etc.

---

## [Unreleased]

### Added - Odoo Deployment Infrastructure (Phase 8)

#### Documentation
- **Deployment State Documentation** (`docs/deployment/ODOO_DEPLOYMENT_STATE.md`)
  - Comprehensive assessment of current DigitalOcean deployment
  - Gap analysis and upgrade roadmap
  - Deployment runbook and troubleshooting guide
  - Disaster recovery procedures

#### Docker Infrastructure
- **Production Dockerfile** (`platform/odoo/docker/odoo.Dockerfile`)
  - Based on official Odoo 18 image
  - IPAI custom addons baked into image
  - Python dependencies for OCR, PDF processing, and integrations
  - Health check configuration

- **Docker Compose Configurations:**
  - `docker-compose.base.yml` - Shared service definitions
  - `docker-compose.staging.yml` - Staging environment overrides
  - `docker-compose.prod.yml` - Production environment with resource limits
  - `.env.example` - Environment variable template

- **NGINX Configuration** (`platform/odoo/docker/nginx/odoo.conf`)
  - Reverse proxy for Odoo
  - WebSocket support for longpolling
  - SSL/TLS configuration
  - Rate limiting and security headers
  - Static file caching

#### Deployment Scripts
- **`deploy.sh`** - Main deployment orchestration script
  - Pull latest images
  - Database backup (production only)
  - Service restart with health checks
  - Environment-specific configurations

- **`install_modules.sh`** - Module installation automation
  - Batch install/upgrade of IPAI modules
  - Rollback capability
  - Health verification

- **`backup_db.sh`** - Database backup automation
  - Compressed PostgreSQL dumps
  - Automatic rotation (30-day retention)
  - Timestamp-based naming

- **`restore_db.sh`** - Database restore procedure
  - Safe restore with confirmations
  - Pre-restore Odoo shutdown
  - Post-restore health checks

#### Infrastructure as Code (Terraform)
- **Reusable Module** (`infra/terraform/odoo/modules/droplet-odoo/`)
  - Parameterized droplet creation
  - Firewall configuration
  - Volume management
  - DNS record creation
  - DigitalOcean project integration

- **Staging Environment** (`infra/terraform/odoo/staging/`)
  - 2 vCPU, 4GB RAM droplet
  - Development mode enabled
  - Direct Odoo access for testing

- **Production Environment** (`infra/terraform/odoo/prod/`)
  - 4 vCPU, 8GB RAM droplet
  - Separate data volume (200GB)
  - Automated backups enabled
  - Restrictive firewall rules
  - Resource limits enforced

- **Cloud-Init Bootstrap** (`infra/cloud-init/odoo-droplet.yaml`)
  - Automated droplet configuration
  - Docker and Docker Compose installation
  - NGINX and Certbot setup
  - UFW firewall configuration
  - Health check timer
  - Daily backup cron job

- **Terraform Documentation** (`infra/terraform/odoo/README.md`)
  - Complete setup guide
  - Deployment procedures
  - Post-deployment steps
  - Troubleshooting guide
  - Security best practices

#### CI/CD Workflows (GitHub Actions)
- **`build-odoo-image.yml`** - Docker image build pipeline
  - Triggered on changes to `platform/odoo/**`
  - Multi-tag strategy (SHA, environment, timestamp)
  - Push to DigitalOcean Container Registry
  - Layer caching for faster builds

- **`deploy-odoo-staging.yml`** - Staging deployment automation
  - Auto-deploy on push to develop branch
  - SSH-based deployment
  - Health verification
  - Deployment notifications

- **`deploy-odoo-prod.yml`** - Production deployment workflow
  - Manual trigger with image tag input
  - Pre-deployment backup
  - Image promotion from staging
  - Rollback instructions on failure
  - Health checks and verification

- **`test-odoo-modules.yml`** - Module quality checks
  - Python linting (flake8, black, isort)
  - Manifest validation
  - Module structure verification
  - Security scanning (bandit)

#### Repository Organization
- Created `platform/odoo/docker/` for Docker configurations
- Created `platform/odoo/scripts/` for deployment automation
- Created `infra/terraform/odoo/` for infrastructure as code
- Created `infra/cloud-init/` for droplet bootstrap configs
- Created `docs/deployment/` for deployment documentation

### Added - Planned Future Work
- Design system tokens, themes, and shared components (Phase 2).
- Application scaffolding: OpEx Portal, Data Lab UI, Docs Site (Phase 3).
- MCP server configurations and agent playbooks (Phase 4).
- Full CI/CD automation and health monitoring (Phase 5).

### Changed
- Updated `PLANNING.md` with Phase 8 (Odoo Deployment Infrastructure)
- Updated milestone M8 for deployment automation
- Updated `TASKS.md` section H (Infra & Environments) with completed items

### Fixed
- N/A yet.

### Removed
- N/A yet.

### Infrastructure
- All deployment infrastructure files are version-controlled
- Secrets and credentials use example templates (`.example` files)
- Production-ready configurations with security best practices
- Comprehensive documentation for operations team

### Breaking Changes
- None (new infrastructure, no existing dependencies)

---

## [0.2.0] – Phase 1: Code Migration

**Date:** 2025-11-18

### Added
- **Platform Components Migrated:**
  - Supabase: 4 SQL migrations, 8 Edge Functions, schema docs → `platform/supabase/`
  - Odoo: `ipai_branding_cleaner` module (AGPL-3) → `platform/odoo/addons/`
- **Agents & Skills:**
  - 11 skills migrated from `.claude/skills/` → `agents/skills/`
  - Agent registry: `agents/registry/agents.yaml` (6 agents defined)
  - Skills registry: `agents/registry/skills.yaml` (11 skills cataloged)
- **Documentation:**
  - Root `README.md` with quick start, structure, roadmap
  - README files for all major directories: apps, platform, agents, design-system, automation, infra
  - Architecture overview: `docs/insightpulse/architecture/overview.md`
  - n8n workflow documentation: `automation/n8n/README.md`

### Changed
- Updated root README.md to reflect monorepo structure and Phase 1 status.

### Fixed
- N/A.

### Removed
- Removed `.gitkeep` files from directories now containing actual code.

---

## [0.1.0] – Monorepo Bootstrap

**Date:** 2025-11-18

### Added
- Initial monorepo structure:
  - `apps/`, `platform/`, `agents/`, `design-system/`, `docs/`, `automation/`, `infra/`, `.specify/specs/`.
- Core coordination files:
  - `CLAUDE.md` – instructions for AI copilot behaviour in this repo.
  - `PLANNING.md` – phase-based roadmap for the platform.
  - `TASKS.md` – cross-cutting implementation checklist.
  - `CHANGELOG.md` – this file.
  - `CODEBASE_GUIDE.md` – comprehensive codebase documentation (renamed from previous CLAUDE.md).
- Initial Spec-Kit integration:
  - Baseline pattern for `spec.md`, `plan.md`, `tasks.md` under `.specify/specs/**`.

### Changed
- Renamed existing `CLAUDE.md` to `CODEBASE_GUIDE.md` to differentiate from AI copilot instructions.

### Fixed
- N/A.

### Removed
- N/A.

---

## Versioning Notes

- Early on, versions reflect **structural milestones**, not public releases.
- Once external environments are hooked (prod deployments), versioning can align with deployment tags (e.g. `v1.0.0` for first full OpEx + Data Lab release).
