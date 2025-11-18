# InsightPulse Platform – CHANGELOG

All notable changes to this monorepo will be documented in this file.

Format loosely follows [Keep a Changelog] concepts:
- Grouped by version
- Sections: Added, Changed, Fixed, Removed, etc.

---

## [Unreleased]

### Added
- Planned:
  - Integration of agents, design system, docs, and automation into a unified monorepo.
  - Supabase + Odoo CE/OCA as the core data platform.
  - n8n, Deepnote, and Mattermost as primary automation and collaboration channels.
  - Spec-Kit-style specs for major features under `.specify/specs/**`.

### Changed
- N/A yet (use this section when modifying existing behaviour).

### Fixed
- N/A yet.

### Removed
- N/A yet.

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
