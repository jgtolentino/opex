# WHT Platform – Technical Plan

**Spec:** 005 – White-Label Headless Template Platform  
**Status:** Planned  
**Last Updated:** 2025-11-18  

---

## 1. High-Level Architecture

### 1.1 Core Layers

1. **Ingestion & Analysis Layer**
   - Components:
     - Web crawler (docs/marketing pages).
     - HTML/DOM analyzer (navigation, IA, component patterns).
     - Text analyzer (features, roles, pricing).
     - Optional: screenshot analyzer.
   - Output:
     - `product_model.json` (entities, flows, roles).
     - `ui_model.json` (screens, layouts, components).
     - `design_tokens_base.json` (derived from reference + chosen theme).

2. **Blueprint & Template Engine**
   - Normalizes analysis into:
     - `stack_blueprint.yaml`
       - Entities, routes, permissions.
       - Integrations (auth, billing, notifications).
       - Design system mapping.
   - Feeds into generators:
     - Supabase schema generator.
     - Odoo module generator.
     - Next.js/MUI app generator.
     - n8n workflow generator.
     - Docs site generator.

3. **Generator & Scaffolder**
   - Uses blueprint + templates to:
     - Create a monorepo skeleton.
     - Fill in code templates with typed models & routes.
     - Emit CI workflows and env templates.

4. **Automation & Ops Layer**
   - n8n workflows:
     - Health checks.
     - Sync jobs.
     - Alerting.
   - Observability:
     - Supabase tables for generator runs, errors, health.
     - Optional integration with Data Lab (Deepnote) for metrics.

5. **Management & UI**
   - WHT Console:
     - Project creation, template selection.
     - "Diff vs reference product" views (features/flows).
     - Generator run logs & status.
   - API:
     - REST/JSON endpoints to create/query generator jobs.

---

## 2. Tech Stack

### 2.1 Orchestration

- **Backend**: FastAPI (Python) or Node/Express as the main WHT API (choose one).
- **Workers**: Queue (e.g. Celery / RQ / BullMQ) to run long generator jobs.
- **Storage**:
  - Supabase Postgres for:
    - WHT metadata (`wht.projects`, `wht.runs`, `wht.blueprints`).
    - Generated metrics & logs.
  - Object storage (Supabase / S3) for:
    - Crawled pages.
    - Screenshots.
    - Generated artifacts (zips).

### 2.2 Generators

- **Supabase Generator**
  - Inputs:
    - Entities & relations.
    - Access rules.
  - Outputs:
    - `sql/000_init.sql` – base schema.
    - `sql/010_rls.sql` – RLS & policies.
    - `sql/020_views.sql` – gold views.
    
- **Odoo Generator**
  - Structure:
    - `odoo/addons/<module_name>/__manifest__.py`
    - `models/*.py`
    - `views/*.xml`
    - `security/ir.model.access.csv`
  - Compliant with OCA patterns.
  
- **Next.js + MUI Generator**
  - `apps/web`:
    - App Router (or Pages) with:
      - `app/(dashboard)/...`
    - `src/components/ui/*` – MUI components wrapped with design tokens.
    - `src/theme/tokens.*` – Material 3 + brand tokens.
    - Data hooks using Supabase client or API routes.
    
- **n8n Generator**
  - `apps/n8n/workflows/*.json`:
    - Sync flows (Odoo ↔ Supabase).
    - Alerts (Mattermost, email).
    - Periodic maintenance jobs.

- **Docs Generator**
  - `apps/docs/` (Docusaurus or similar):
    - "Getting Started", "Architecture", "Entities", "API".
    - Brand-aligned docs theme.

---

## 3. Repository Layout (Template)

WHT will emit repos using this base layout:

```
wht-cheqroom-clone/
  apps/
    web/                    # Next.js + MUI app
      app/
      src/
        components/
        theme/
        lib/
      public/
    odoo/                   # Odoo CE/OCA modules
      addons/
        wht_cheqroom_core/
        wht_cheqroom_billing/
    n8n/
      workflows/
        sync_odoo_supabase.json
        alerts_mattermost.json
    docs/
      docusaurus.config.js
      docs/
        00-intro.md
        10-architecture.md
        20-data-model.md

  infra/
    supabase/
      migrations/
        000_init.sql
        010_rag_views.sql
      seed/
        001_seed_data.sql
    ci/
      github/
        ci.yml
        deploy_web.yml
        deploy_odoo.yml
        deploy_supabase.yml
    env/
      .env.example
      supabase.env.example
      odoo.env.example

  .specify/
    specs/
      000-wht-platform/
        spec.md
        plan.md
        tasks.md
        claude.md

  README.md
  LICENSE
  CHANGELOG.md
```

---

## 4. Data Model (WHT Meta)

### 4.1 Core Tables (in Supabase)

**`wht.projects`**
- `id` (uuid, PK)
- `name` (text)
- `slug` (text, unique)
- `template_name` (text) - e.g., "equipment-asset-mgmt"
- `status` (text) - draft, generating, ready, archived
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**`wht.blueprints`**
- `id` (uuid, PK)
- `project_id` (uuid, FK → projects)
- `blueprint_json` (jsonb) - full stack_blueprint.yaml as JSON
- `version` (int)
- `created_at` (timestamptz)

**`wht.runs`**
- `id` (uuid, PK)
- `project_id` (uuid, FK → projects)
- `blueprint_id` (uuid, FK → blueprints)
- `status` (text) - queued, running, success, failed
- `started_at` (timestamptz)
- `finished_at` (timestamptz)
- `logs` (text)
- `error` (text)
- `artifacts_url` (text) - S3/storage URL for generated zip

**`wht.design_tokens`**
- `id` (uuid, PK)
- `project_id` (uuid, FK → projects)
- `token_json` (jsonb) - design tokens
- `source` (text) - "material3", "insightpulse", "custom"
- `created_at` (timestamptz)

This keeps WHT's own state separate from the generated product's schema.

---

## 5. Integrations

### 5.1 GitHub
- Repo creation (optional via GitHub API).
- PRs for re-generation / updates.
- Issue creation for manual tasks.

### 5.2 Mattermost / Slack
- Notifications for:
  - Run start / success / failure.
  - Drift detection vs reference product.
  - Manual review requests.

### 5.3 Figma (Later)
- Token export.
- Screen diffs / overlays.
- Design-to-code validation.

### 5.4 Supabase
- Schema hosting for WHT meta tables.
- Object storage for artifacts.
- Edge Functions for webhook endpoints.

### 5.5 n8n
- Workflow orchestration.
- Scheduled jobs (health checks, sync).
- Alert routing.

---

## 6. Implementation Phases

### Phase 0 – Foundations (4 weeks)

**Goal:** WHT meta infrastructure and basic scaffold.

**Tasks:**
- Create `platform/wht-engine/` directory structure.
- Set up WHT meta schema in Supabase (`wht.*` tables).
- Implement basic project/blueprint/run CRUD API.
- Create CLI skeleton (`wht create-project`, `wht generate`).

**Deliverables:**
- WHT API (FastAPI or Express) with endpoints:
  - POST /projects
  - GET /projects/:id
  - POST /projects/:id/generate
- WHT meta tables deployed to Supabase.
- CLI tool that can create a project record.

---

### Phase 1 – Cheqroom-Class Prototype (6 weeks)

**Goal:** End-to-end generation for one hard-coded template.

**Tasks:**
- Manually author `stack_blueprint.yaml` for Cheqroom-class product.
- Implement generators:
  - Supabase schema generator.
  - Odoo module generator.
  - Next.js + MUI app generator.
  - n8n workflow generator.
  - Docs generator.
- Wire generators to WHT API.
- Test full generation flow from blueprint → deployed preview.

**Deliverables:**
- Working Cheqroom-class clone generated from blueprint.
- Preview environment (Vercel + Supabase + Docker Odoo).
- Documentation for generated stack.

---

### Phase 2 – Ingestion & Analysis (4 weeks)

**Goal:** Automate blueprint creation from target SaaS.

**Tasks:**
- Implement web crawler (respects robots.txt, rate limits).
- Implement HTML/DOM analyzer (navigation, layouts, components).
- Implement text analyzer (entities, roles, flows).
- Blueprint draft generator (AI-assisted).
- Add CLI command: `wht analyze --urls <urls> --output blueprint.yaml`.

**Deliverables:**
- Crawler + analyzers operational.
- Blueprint draft generator produces 70%+ accurate blueprints.
- Human review/edit step before generation.

---

### Phase 3 – Template Library (3 weeks)

**Goal:** Multiple reference templates, easy selection.

**Tasks:**
- Store blueprints as templates in `wht.templates` table.
- Build WHT Console UI:
  - Template browser.
  - Project creation wizard.
  - Run status dashboard.
- Add template variants:
  - Equipment/asset management (Cheqroom).
  - Booking/scheduling (Calendly-class).
  - CRM/light ERP.

**Deliverables:**
- WHT Console deployed.
- 3+ reference templates available.
- Users can select template → generate project via UI.

---

### Phase 4 – Design System Deep Dive (4 weeks)

**Goal:** Pixel-perfect visual parity and brand alignment.

**Tasks:**
- Implement design token extractor from screenshots.
- Visual diff tool (baseline screenshots vs generated).
- Figma integration (token export/import).
- Component library validation (only approved MUI components).

**Deliverables:**
- Design token extractor operational.
- Visual regression testing integrated into CI.
- Figma token sync working.

---

### Phase 5 – Hardening & Productization (4 weeks)

**Goal:** Production-ready, multi-tenant, secure.

**Tasks:**
- Multi-tenancy: isolate projects by tenant/org.
- Security audit: RLS, access controls, secret management.
- Performance optimization: generator parallelization, caching.
- Documentation: WHT user guide, API docs, template authoring guide.
- Observability: Data Lab integration, metrics dashboards.

**Deliverables:**
- WHT Platform production-ready.
- Security audit passed.
- Performance benchmarks met (< 60 min generation time).
- Full documentation published.

---

## 7. Risk Mitigation

### Risk: Target SaaS changes frequently
**Mitigation:**
- Store reference blueprint versions.
- Periodic re-analysis to detect drift.
- Notify users of breaking changes.

### Risk: Generated code quality issues
**Mitigation:**
- Automated linting, type-checking, tests in CI.
- Manual review checkpoints before deployment.
- Template improvement feedback loop.

### Risk: Design token extraction accuracy
**Mitigation:**
- Start with manual token authoring.
- Iteratively improve AI extraction.
- Human-in-the-loop validation.

### Risk: Legal/IP concerns
**Mitigation:**
- Only analyze public information.
- Clear licensing for generated code.
- Legal review before public launch.

---

## 8. Success Criteria

**Phase 1 Complete:**
- [ ] Cheqroom-class clone generated and deployed.
- [ ] Core workflows (book, check-out, check-in) operational.
- [ ] Visual parity with reference product confirmed.

**Phase 2 Complete:**
- [ ] Blueprint auto-generated from target URLs with 70%+ accuracy.
- [ ] Human review reduces generation time by 50%.

**Phase 3 Complete:**
- [ ] 3+ templates available in template library.
- [ ] Non-technical users can generate projects via UI.

**Phase 4 Complete:**
- [ ] Visual regression tests passing for all templates.
- [ ] Design tokens synced with Figma.

**Phase 5 Complete:**
- [ ] Production deployment with real customers.
- [ ] < 60 min generation time achieved.
- [ ] Security audit passed with no critical issues.

---

## 9. Open Questions

1. **Tech Stack Choice:** FastAPI vs Express for WHT API?
   - Recommendation: FastAPI (Python) aligns with existing Supabase + ML tooling.

2. **Generator Language:** Python vs TypeScript?
   - Recommendation: Python for generators (leverage AI/ML libraries).

3. **Figma Integration Depth:** v1 or v2?
   - Recommendation: v2 (focus on blueprint generation first).

4. **Multi-tenancy Model:** Org-based or project-based?
   - Recommendation: Org-based (future SaaS model).

---

## 10. Next Steps

1. **Review and Approve Spec Bundle**
   - Stakeholder sign-off on spec.md, plan.md, tasks.md.

2. **Kick Off Phase 0**
   - Set up `platform/wht-engine/` directory.
   - Create WHT meta schema in Supabase.
   - Implement basic project CRUD API.

3. **Recruit Team**
   - Platform engineer (Python/FastAPI).
   - Frontend engineer (Next.js/MUI).
   - Odoo engineer (OCA-compliant modules).
   - DevOps engineer (CI/CD, deployment).

4. **Establish Cadence**
   - Weekly sprint planning.
   - Bi-weekly demos.
   - Monthly milestone reviews.

---

**Related Documents:**
- `.specify/specs/005-wht-platform/spec.md`
- `.specify/specs/005-wht-platform/tasks.md`
- `.specify/specs/005-wht-platform/claude.md`
