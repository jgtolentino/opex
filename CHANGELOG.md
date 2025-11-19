# InsightPulse Platform – CHANGELOG

All notable changes to this monorepo will be documented in this file.

Format loosely follows [Keep a Changelog] concepts:
- Grouped by version
- Sections: Added, Changed, Fixed, Removed, etc.

---

## [Unreleased]

### Added
- **Odoo CE+OCA 18.0 White-Label Setup (Phase 2 - Platform Core):**
  - Complete Docker Compose stack with OCB (OCA Community Backports) 18.0
  - Production-ready `odoo.conf` with security hardening and performance tuning
  - Environment template (`.env.template`) with secure defaults
  - Enhanced `ipai_branding_cleaner` module:
    - System parameters for domain binding (`web.base.url`, `web.base.url.freeze`)
    - QWeb template overrides (`webclient_cleanup.xml`, `settings_cleanup.xml`)
    - Scheduled action disabling (IAP, update notifications, publisher warranty)
    - Multi-layer isolation: parameters → templates → JavaScript → SCSS
  - Helper scripts:
    - `setup-oca-repos.sh` – Automated OCA repository cloning
    - `disable-iap.sh` – IAP module and account disabling
    - `verify-isolation.sh` – Comprehensive isolation verification
  - Documentation:
    - `DEPLOYMENT.md` – Complete 3-layer deployment guide
    - `QUICK_START.md` – 15-minute setup guide
    - Reverse proxy configurations (Nginx + Caddy)
    - Network-level blocking examples

### Changed
- Updated `ipai_branding_cleaner/__manifest__.py` to include data files and view overrides
- Enhanced module description to reflect multi-layer isolation approach

### Planned
- Design system tokens, themes, and shared components (Phase 2 continuation).
- Application scaffolding: OpEx Portal, Data Lab UI, Docs Site (Phase 3).
- MCP server configurations and agent playbooks (Phase 4).
- Full CI/CD automation and health monitoring (Phase 5).

### Fixed
- N/A.

### Removed
- N/A.

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
