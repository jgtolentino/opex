# Design-to-Code Playground

Turn Figma designs and live website URLs into production-ready frontend code.

This spec defines the architecture, planning, and initial implementation roadmap for:
- A Design-to-Code Playground (web-based)
- Figma plugin and URL cloning pipeline
- VS Code / Claude Code integration

## Structure

- `spec.yaml` — GitHub Spec-Kit specification
- `prd.md` — Full Product Requirements Document
- `adrs/` — Architecture Decision Records
- `planning/` — Milestones and task breakdown

## Implementation

Implementation apps (Next.js playground, VS Code extension, Claude Code hooks, etc.) will live under:

- `apps/playground/` — Web-based tri-panel editor
- `apps/vscode-extension/` — VS Code extension for design-to-code workflows
- `apps/claude-hooks/` — Claude Code integration hooks

## Quick Links

- [Spec (spec.yaml)](./spec.yaml)
- [PRD (prd.md)](./prd.md)
- [Architecture (ADR-001)](./adrs/001-architecture.md)
- [Milestones](./planning/milestones.md)
- [Tasks](./planning/tasks.md)
