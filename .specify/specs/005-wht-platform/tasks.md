# WHT Platform – Tasks

**Spec:** 005 – White-Label Headless Template Platform  
**Status:** Planned  
**Last Updated:** 2025-11-18  

> Checklist for implementing the WHT Platform and emitting the first Cheqroom-class clone.

---

## A. Foundations & Repo

- [ ] A1 – Create `platform/wht-engine/` directory structure:
  - [ ] `ingestion/` - Web crawlers, analyzers
  - [ ] `blueprint/` - Blueprint generation and validation
  - [ ] `generators/` - Code generators (Supabase, Odoo, Next.js, n8n, docs)
  - [ ] `design-mapper/` - Design token extraction and mapping
  - [ ] `api/` - FastAPI or Express WHT API
  - [ ] `cli/` - CLI tool for WHT operations
  
- [ ] A2 – Add Spec-Kit files:
  - [x] `.specify/specs/005-wht-platform/spec.md`
  - [x] `.specify/specs/005-wht-platform/plan.md`
  - [x] `.specify/specs/005-wht-platform/tasks.md`
  - [ ] `.specify/specs/005-wht-platform/claude.md`
  
- [ ] A3 – Configure basic CI:
  - [ ] Lint + type-check pipeline for WHT engine
  - [ ] Build and test generators
  - [ ] Integration tests for full generation flow

- [ ] A4 – Add WHT Platform to root README and PLANNING.md

---

## B. WHT Meta Schema (Supabase)

- [ ] B1 – Create `wht.projects` table:
  ```sql
  CREATE TABLE wht.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    template_name TEXT,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );
  ```

- [ ] B2 – Create `wht.blueprints` table:
  ```sql
  CREATE TABLE wht.blueprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES wht.projects(id) ON DELETE CASCADE,
    blueprint_json JSONB NOT NULL,
    version INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now()
  );
  ```

- [ ] B3 – Create `wht.runs` table:
  ```sql
  CREATE TABLE wht.runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES wht.projects(id) ON DELETE CASCADE,
    blueprint_id UUID REFERENCES wht.blueprints(id),
    status TEXT DEFAULT 'queued',
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    logs TEXT,
    error TEXT,
    artifacts_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  );
  ```

- [ ] B4 – Create `wht.design_tokens` table:
  ```sql
  CREATE TABLE wht.design_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES wht.projects(id) ON DELETE CASCADE,
    token_json JSONB NOT NULL,
    source TEXT DEFAULT 'custom',
    created_at TIMESTAMPTZ DEFAULT now()
  );
  ```

- [ ] B5 – Add RLS policies and roles:
  - [ ] Admin role (full access)
  - [ ] Worker role (can update runs, read projects/blueprints)
  - [ ] Observer role (read-only)

- [ ] B6 – Create indexes for common queries:
  - [ ] Index on `projects.slug`
  - [ ] Index on `runs.status`
  - [ ] Index on `blueprints.project_id`

---

## C. Ingestion & Analysis

### C1 – Web Crawler

- [ ] C1.1 – Implement basic URL crawler:
  - [ ] Accept list of URLs
  - [ ] Respect robots.txt
  - [ ] Rate limiting
  - [ ] Save HTML to object storage

- [ ] C1.2 – Add screenshot capture:
  - [ ] Use Playwright or Puppeteer
  - [ ] Capture full page + key sections
  - [ ] Store in object storage

- [ ] C1.3 – Error handling and retry logic

### C2 – HTML Analyzer

- [ ] C2.1 – Extract navigation structure:
  - [ ] Parse HTML tree
  - [ ] Identify main nav, sidebars, footer
  - [ ] Map routes to page types (list, detail, dashboard, etc.)

- [ ] C2.2 – Detect recurring layout patterns:
  - [ ] Identify common components (cards, tables, forms, modals)
  - [ ] Extract grid/layout structure
  - [ ] Identify responsive breakpoints

- [ ] C2.3 – Output `ui_model.json`:
  ```json
  {
    "pages": [
      {
        "route": "/equipment",
        "type": "list",
        "components": ["data-table", "filters", "search"]
      }
    ]
  }
  ```

### C3 – Text Analyzer

- [ ] C3.1 – Extract entities / terminology:
  - [ ] Parse docs, help center, pricing pages
  - [ ] Identify nouns (assets, bookings, locations, users)
  - [ ] Identify relationships (user has bookings, asset belongs to location)

- [ ] C3.2 – Extract roles and permissions hints:
  - [ ] Identify user types (admin, manager, user, guest)
  - [ ] Infer capabilities per role

- [ ] C3.3 – Output `product_model.json`:
  ```json
  {
    "entities": [
      {
        "name": "asset",
        "fields": ["name", "status", "location_id"],
        "relationships": ["belongs_to location", "has_many bookings"]
      }
    ],
    "roles": ["admin", "manager", "user"]
  }
  ```

### C4 – Blueprint Draft Generator

- [ ] C4.1 – Convert `product_model.json` + `ui_model.json` → `stack_blueprint.yaml`

- [ ] C4.2 – Validate blueprint schema:
  - [ ] Required sections present
  - [ ] Entity names valid
  - [ ] Relationships valid

- [ ] C4.3 – Store blueprint in `wht.blueprints` table

### C5 – CLI Command

- [ ] C5.1 – Implement `wht analyze`:
  ```bash
  wht analyze --project <id> --urls <urls> --output blueprint.yaml
  ```

- [ ] C5.2 – Progress reporting and logging

- [ ] C5.3 – Error handling and validation

---

## D. Blueprint & Template Engine

- [ ] D1 – Define `stack_blueprint.yaml` schema:
  ```yaml
  product:
    name: "Equipment Management"
    description: "Cheqroom-class asset management"
  
  entities:
    - name: asset
      fields:
        - name: name
          type: string
        - name: status
          type: enum
  
  relationships:
    - from: asset
      to: location
      type: belongs_to
  
  roles:
    - name: admin
      permissions: ["*"]
  
  routes:
    - path: /equipment
      type: list
      entity: asset
  
  integrations:
    - type: auth
      provider: supabase
  
  design_system:
    base: material3
    brand: insightpulse
  ```

- [ ] D2 – Implement validation for blueprints:
  - [ ] Schema validation (YAML structure)
  - [ ] Semantic validation (entity references, relationships)
  - [ ] Security validation (no SQL injection in names, etc.)

- [ ] D3 – Store blueprint versions:
  - [ ] Increment version on each update
  - [ ] Track changes between versions

---

## E. Generators

### E1 – Supabase Generator

- [ ] E1.1 – Map entities → SQL tables:
  - [ ] Generate CREATE TABLE statements
  - [ ] Add primary keys, foreign keys
  - [ ] Add timestamps (created_at, updated_at)

- [ ] E1.2 – Generate migrations:
  - [ ] `000_init.sql` - Base schema
  - [ ] `010_rls.sql` - RLS policies per role
  - [ ] `020_views.sql` - Convenience views

- [ ] E1.3 – Generate seed data:
  - [ ] Sample records for each entity
  - [ ] Realistic relationships

- [ ] E1.4 – Output to `infra/supabase/migrations/`

### E2 – Odoo CE/OCA Generator

- [ ] E2.1 – Generate module scaffold:
  - [ ] `__manifest__.py` with OCA metadata
  - [ ] `__init__.py`
  - [ ] `models/__init__.py`

- [ ] E2.2 – Generate models:
  - [ ] `models/<entity>.py` for each entity
  - [ ] Fields, relationships, constraints
  - [ ] Compute methods where needed

- [ ] E2.3 – Generate views:
  - [ ] `views/<entity>_views.xml`
  - [ ] List, form, search views
  - [ ] Menus and actions

- [ ] E2.4 – Generate security:
  - [ ] `security/ir.model.access.csv`
  - [ ] Access rules per role

- [ ] E2.5 – Run pylint-odoo validation

- [ ] E2.6 – Output to `apps/odoo/addons/<module_name>/`

### E3 – Next.js + MUI Generator

- [ ] E3.1 – Create base app structure:
  - [ ] `apps/web/` with App Router
  - [ ] `src/components/`
  - [ ] `src/lib/`
  - [ ] `src/theme/`

- [ ] E3.2 – Generate theme:
  - [ ] `src/theme/tokens.ts` from design tokens
  - [ ] `src/theme/mui-theme.ts` using tokens
  - [ ] Theme provider setup

- [ ] E3.3 – Generate pages:
  - [ ] `app/(dashboard)/[entity]/page.tsx` for list views
  - [ ] `app/(dashboard)/[entity]/[id]/page.tsx` for detail views
  - [ ] `app/(dashboard)/[entity]/new/page.tsx` for create forms

- [ ] E3.4 – Generate components:
  - [ ] `src/components/ui/DataTable.tsx`
  - [ ] `src/components/ui/DetailPanel.tsx`
  - [ ] `src/components/layout/AppShell.tsx`

- [ ] E3.5 – Generate API client:
  - [ ] `src/lib/api/supabase.ts`
  - [ ] `src/lib/api/[entity].ts` for each entity

- [ ] E3.6 – Ensure no hard-coded colors/spacing:
  - [ ] Lint rule to enforce token usage
  - [ ] Visual regression tests

### E4 – n8n & Docs Generators

- [ ] E4.1 – Generate n8n workflows:
  - [ ] `apps/n8n/workflows/sync_odoo_supabase.json`
  - [ ] `apps/n8n/workflows/alerts_mattermost.json`
  - [ ] `apps/n8n/workflows/health_checks.json`

- [ ] E4.2 – Generate docs structure:
  - [ ] `apps/docs/docusaurus.config.js`
  - [ ] `apps/docs/docs/00-intro.md`
  - [ ] `apps/docs/docs/10-architecture.md`
  - [ ] `apps/docs/docs/20-data-model.md`
  - [ ] `apps/docs/docs/30-user-flows.md`

---

## F. Automation & Observability

- [ ] F1 – Implement WHT run worker:
  - [ ] Queue system (Celery/BullMQ)
  - [ ] Job: generate project from blueprint
  - [ ] Update `wht.runs` status throughout

- [ ] F2 – Add health metrics:
  - [ ] `wht.run_metrics` view (duration, success rate)
  - [ ] Dashboard in Data Lab UI

- [ ] F3 – Mattermost/Slack notifications:
  - [ ] On generation start
  - [ ] On generation success (with preview URL)
  - [ ] On generation failure (with error log)

- [ ] F4 – Logging and debugging:
  - [ ] Structured logs for each generator step
  - [ ] Store logs in `wht.runs.logs`
  - [ ] Searchable log viewer in WHT Console

---

## G. First Target – Cheqroom-Class Template

- [ ] G1 – Manual blueprint authoring:
  - [ ] Create `blueprints/cheqroom-class.yaml`
  - [ ] Entities: asset, booking, location, user, role, maintenance
  - [ ] Workflows: request, approve, check-out, check-in, damage report, maintenance schedule

- [ ] G2 – Run full generation pipeline:
  - [ ] Generate Supabase schema
  - [ ] Generate Odoo module(s)
  - [ ] Generate Next.js app
  - [ ] Generate n8n workflows
  - [ ] Generate docs

- [ ] G3 – Deploy preview:
  - [ ] Deploy Next.js app to Vercel
  - [ ] Deploy Supabase migrations
  - [ ] Spin up Odoo instance (Docker)
  - [ ] Import n8n workflows

- [ ] G4 – Manual QA:
  - [ ] Verify core flows:
    - [ ] User can request equipment
    - [ ] Admin can approve request
    - [ ] User can check-out equipment
    - [ ] User can check-in equipment
    - [ ] System tracks damage and maintenance
  - [ ] Check design parity:
    - [ ] Layout matches reference
    - [ ] Typography aligned with tokens
    - [ ] Colors aligned with brand
    - [ ] Responsive behavior correct

- [ ] G5 – Iterate and refine generators based on findings

---

## H. Hardening & Docs

- [ ] H1 – Add integration tests:
  - [ ] Test full generation pipeline
  - [ ] Test each generator individually
  - [ ] Test blueprint validation

- [ ] H2 – Add smoke tests for generated apps:
  - [ ] Can build successfully
  - [ ] Can deploy successfully
  - [ ] Core routes accessible
  - [ ] No critical errors in logs

- [ ] H3 – Document extension points:
  - [ ] How to add new generator
  - [ ] How to add new template
  - [ ] How to customize blueprint

- [ ] H4 – Update root docs:
  - [ ] Add WHT Platform to README.md
  - [ ] Add to PLANNING.md
  - [ ] Update CHANGELOG.md

---

## I. WHT Console UI

- [ ] I1 – Project management:
  - [ ] List projects
  - [ ] Create project
  - [ ] View project details
  - [ ] Delete project

- [ ] I2 – Template browser:
  - [ ] List available templates
  - [ ] View template details
  - [ ] Select template for new project

- [ ] I3 – Blueprint editor:
  - [ ] View blueprint YAML
  - [ ] Edit blueprint
  - [ ] Validate changes
  - [ ] Save new version

- [ ] I4 – Run dashboard:
  - [ ] List runs for project
  - [ ] View run status
  - [ ] View run logs
  - [ ] Download artifacts

- [ ] I5 – Design token manager:
  - [ ] View design tokens
  - [ ] Edit tokens
  - [ ] Preview token changes
  - [ ] Export to Figma

---

## J. CLI Tools

- [ ] J1 – `wht init`:
  - [ ] Initialize new WHT project locally

- [ ] J2 – `wht analyze`:
  - [ ] Analyze target SaaS and create blueprint

- [ ] J3 – `wht generate`:
  - [ ] Generate full stack from blueprint

- [ ] J4 – `wht validate`:
  - [ ] Validate blueprint

- [ ] J5 – `wht deploy`:
  - [ ] Deploy generated stack

---

## Acceptance Criteria

### Phase 0 Complete

- [ ] `platform/wht-engine/` directory exists with structure
- [ ] WHT meta schema deployed to Supabase
- [ ] Basic project CRUD API working
- [ ] CLI can create project record

### Phase 1 Complete

- [ ] Cheqroom-class clone generated from blueprint
- [ ] Preview environment deployed and accessible
- [ ] Core workflows operational
- [ ] Visual parity confirmed

### Phase 2 Complete

- [ ] Blueprint auto-generated from target URLs
- [ ] 70%+ accuracy achieved
- [ ] Human review step integrated

### Phase 3 Complete

- [ ] 3+ templates available
- [ ] WHT Console UI operational
- [ ] Non-technical users can generate projects

---

**Notes:**

- Tasks can be done in parallel where dependencies allow
- Update `TASKS.md` (root) as cross-cutting tasks are completed
- Update `CHANGELOG.md` for each phase completion
- Create additional specs as needed for complex features
