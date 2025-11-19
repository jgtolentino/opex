# WHT Platform – Specification

**ID:** 005  
**Title:** White-Label Headless Template Platform  
**Status:** Planned  
**Owner:** InsightPulse Platform Team  
**Created:** 2025-11-18  

---

## 1. Summary

The **WHT Platform** (White-Label Hyper-Template Platform) is a full-stack, AI-assisted system that can:

- Take a target SaaS product as input (e.g. **Cheqroom**, Deepnote, Calendly).
- Analyze its public UX, IA, docs, and pricing/features.
- Generate a **production-grade clone** with:
  - Feature-level **product/service parity** (core workflows, roles, billing flows).
  - **Visual & interaction parity** using design tokens / brand system.
  - A coherent, **Odoo CE/OCA + Supabase + Next.js/MUI** implementation.
  - Automation glue (n8n, webhooks, Mattermost alerts, RAG docs).

In short: given "_make me a Cheqroom-class app_", the platform emits a ready-to-deploy, white-label, brand-aligned SaaS app and its documentation.

---

## 2. Problem Statement

Building a serious SaaS clone today is:

- **Slow** – lots of manual UX reverse engineering, schema modeling, and integration wiring.
- **Inconsistent** – UI, branding, and documentation drift across products.
- **Non-repeatable** – each new product clone is a bespoke effort instead of a reusable pattern.
- **Non-agentic** – AI helps "a bit" (copy, snippets) but does not drive a full stack from spec → code → docs.

We need a platform that:

- Treats *existing SaaS products* as **templates** (feature + UX + data model).
- Encodes **best practices** in architecture, UX, observability, and automation.
- Lets AI agents take on the heavy lifting while staying within strict technical and design guardrails.

---

## 3. Goals & Non-Goals

### 3.1 Goals

1. **Product Parity Engine**
   - Infer **core entities**, workflows, and access roles from a reference SaaS (e.g. Cheqroom).
   - Generate a target data model (Supabase + Odoo modules) with migration scripts.
   - Emit test data and seed flows for demo environments.

2. **Visual / Brand Parity**
   - Capture **design tokens** (colors, typography, spacing, shapes) from:
     - Material Design / MUI docs.
     - Reference SaaS marketing and app screens.
   - Guarantee "pixel-tight" UX parity where needed (layouts, components, interactions).
   - Support **brand overlays** (InsightPulse, client brand) via theme packs.

3. **Full-Stack Template Emission**
   - Output a repo with:
     - `apps/web` – Next.js + MUI front-end.
     - `apps/odoo` – Odoo CE/OCA modules for ERP/ledger flows.
     - `apps/n8n` – workflow definitions.
     - `apps/docs` – Docusaurus-style docs site.
     - `infra/` – Supabase schema, config, and CI workflows.

4. **Automation-First**
   - One command (or one spec) triggers:
     - Repo scaffold.
     - DB migrations.
     - Odoo module stubs.
     - CI workflows and environment templates.
   - n8n flows for:
     - Alerts (Mattermost/Slack).
     - Data sync (Supabase ↔ Odoo).
     - Health checks and job monitoring.

5. **Design-System Discipline**
   - Enforce usage of:
     - MUI / Material 3 tokens.
     - House design tokens (e.g. "InsightPulse" token set).
   - Reject or flag non-compliant components / colors in generated code.
   - Produce Figma-ready token exports.

### 3.2 Non-Goals

- WHT is **not**:
  - A general low-code builder for arbitrary non-SaaS use cases.
  - A drag-and-drop front-end editor (fine later, but not v1).
  - A "train your own ML model" platform (it orchestrates existing models/agents).

---

## 4. Key Users & Personas

1. **Founder / Product Owner**
   - Wants: "Give me a Cheqroom-like product for equipment rental, under my brand, with sane billing & audit."
   - Interacts via: high-level brief + target SaaS URL(s).

2. **Solution Architect**
   - Wants: inspect & tweak:
     - Entities, schema, and flows.
     - Module boundaries (Odoo vs Supabase).
   - Interacts via: spec dashboards, schema diff views, design system view.

3. **Designer / Brand Owner**
   - Wants: guarantee visual parity and brand fit.
   - Interacts via: design tokens, Figma exports, preview environments.

4. **Engineer / DevOps**
   - Wants: generated code that is:
     - Readable, typed, testable.
     - CI-ready and infra-compatible.
   - Interacts via: repo, CI pipeline, issue queue.

---

## 5. Core User Scenarios

### 5.1 "Clone Cheqroom for my studio"

1. User selects **Template: Equipment Asset Management** and provides:
   - Cheqroom URLs (marketing, docs).
2. WHT:
   - Crawls public pages + docs.
   - Infers core entities: equipment, location, bookings, users, roles, workflows.
   - Maps UI screens → Next.js routes & components.
   - Maps pricing & roles → Odoo + Supabase schema.
3. Platform emits:
   - Repo `apps/cheq-clone/` with full stack.
   - Preview environment + docs.
4. User adjusts:
   - Brand tokens, logo, palette.
   - Workflow constraints (max loans, charge rules).
5. Hit **"Generate v1"** → pipeline runs CI + deploy.

### 5.2 "Apply a new design system to an existing product"

1. User connects GitHub repo (existing Next.js app).
2. WHT analyzes:
   - Current component usage, tokens, layout patterns.
3. User picks **Material 3/MUI** or custom design system.
4. WHT:
   - Proposes refactor plan:
     - Component replacements, token mapping, layout fixes.
   - Emits patches + migration guide.
5. CI runs automated refactors; visual baseline tests verify parity.

### 5.3 "Spin up a new vertical variant"

1. User says: "Take the Cheqroom clone and adapt it for **photo studio gear rental**."
2. WHT:
   - Reuses base model and flows.
   - Adds photo-specific metadata (lens, sensor, insurance, damage tracking).
   - Updates docs and seeds.
3. Emits `apps/cheq-photo-studio/` variant with minimal manual work.

---

## 6. Functional Requirements

### 6.1 Input & Analysis

- Accepts:
  - URLs (marketing site, docs, pricing, help center).
  - Structured briefs (YAML/JSON spec for features/roles).
  - Optional: screenshots / Figma exports.
- AI analysis pipeline must output:
  - `entities` & fields.
  - `roles` & permissions.
  - `user_journeys` & flows.
  - `ui_screens` & archetypes.
  - `integration_points` (billing, notifications, storage).

### 6.2 Stack Generator

- Generates:
  - Supabase schema (`sql/` migrations + RLS).
  - Odoo module(s) (models, views, menus, security, OCA-compliant).
  - Next.js app (TypeScript, MUI, API routes or calling Supabase directly).
  - n8n workflows (JSON export).
  - Docs site (Docusaurus or equivalent).

### 6.3 Design System & Branding

- Design token engine:
  - Base palettes: Material 3, "Google style", "SAP/Fiori style", "InsightPulse style".
  - Derived tokens: typography, radius, shadow, spacing.
- Enforcement:
  - Generated components must be from allowed libraries (MUI + a small approved set).
  - Colors, typography, and spacing must be pulled from tokens (no hard-coded hex except in tokens).

### 6.4 Automation & Observability

- Default automations:
  - Error & health alerts → Mattermost/Slack via webhooks.
  - Data sync between Odoo and Supabase.
  - Nightly jobs: cleanup, denormalized views, snapshot metrics.
- Default observability:
  - Basic metrics tables (`*_runs`, `*_errors`, `*_health`).
  - Logs per generator run (input → outputs, duration, result).

---

## 7. Non-Functional Requirements

- **Performance**: generated apps must be fast enough for real customers:
  - TTFB < 500ms on core pages under typical load.
- **Security**:
  - RLS on Supabase.
  - Odoo access rights per role.
  - No secrets committed; environment templates only.
- **Upgradeability**:
  - Odoo modules follow OCA structure.
  - Front-end uses stable Next.js & MUI patterns.
- **Compliance**:
  - All Odoo modules under **AGPL-3**.
  - Generated code clearly licensed and separated by component/source.

---

## 8. Success Metrics

- Time from **"template picked" → deployable preview**: < 60 minutes.
- 80%+ of core flows in reference product implemented with minimal manual tweaks.
- 0 critical security violations in default output.
- Internal users can generate at least **3 different product clones** within first month.

---

## 9. Risks & Open Questions

- Risk: template targets change their UX/flows frequently → drift.
- Risk: over-fit to one stack (Next/Odoo/Supabase) vs future stacks.
- Open: how far to go with HTML-to-design / design-to-code loops in v1.
- Open: degree of Figma integration required at launch vs later.

---

## 10. References

- **Plan:** `.specify/specs/005-wht-platform/plan.md`
- **Tasks:** `.specify/specs/005-wht-platform/tasks.md`
- **Agent Guide:** `.specify/specs/005-wht-platform/claude.md`
- **Related Specs:**
  - `.specify/specs/004-monorepo-structure/` - Base monorepo architecture
  - `.specify/specs/001-insightpulseai-data-lab/` - Data Lab integration patterns
