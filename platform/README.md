# Platform

This directory contains backend systems and data infrastructure for the InsightPulse Platform.

## Structure

```
platform/
├── supabase/           # PostgreSQL + pgvector + Edge Functions
├── odoo/               # Odoo CE/OCA ERP modules
├── data-pipelines/     # ETL scripts (extract, transform, load)
└── experiments/        # RAG experiments and model registry
```

## Components

### Supabase (`supabase/`)
**Status:** Active

PostgreSQL database with pgvector extension for RAG and analytics.

**Subdirectories:**
- `migrations/` - SQL schema migrations
- `functions/` - Deno Edge Functions (RAG, analytics, ingest)
- `seeds/` - Initial data for development
- `config/` - Supabase project config

**Key Functions:**
- `opex-rag-query` - RAG query endpoint with vector search
- `analytics-api` - Data Lab metrics API
- `embedding-worker` - Document embedding pipeline
- `ingest-document` - RAG document ingest

**Documentation:** `SCHEMA.md`, `functions/DEPLOYMENT.md`

### Odoo (`odoo/`)
**Status:** Active

Odoo Community Edition v17 with custom InsightPulse modules.

**Subdirectories:**
- `addons/` - Custom Odoo modules (`ipai_*`)
- `docker/` - Docker Compose setup for local dev
- `docs/` - Odoo-specific runbooks

**Modules:**
- `ipai_branding_cleaner` - White-label branding removal (AGPL-3)
- (Future) Finance SSC modules

**License:** AGPL-3 (OCA-compliant)

**Documentation:** `docs/runbook.md`

### Data Pipelines (`data-pipelines/`)
**Status:** Planned (Phase 2)

ETL scripts for data transformation and loading.

**Subdirectories:**
- `extract/` - Data extraction scripts (APIs, databases, files)
- `transform/` - Data transformation logic (Python, SQL)
- `load/` - Data loading to Supabase/Odoo

**Scheduling:** Via n8n workflows or cron jobs

### Experiments (`experiments/`)
**Status:** Planned (Phase 2+)

Experimental features and model variants.

**Subdirectories:**
- `rag/` - RAG experiment configs, SQL, notebook links
- `models/` - Model registry (YAML/JSON for model variants)

## Development

### Supabase Local Development
```bash
cd platform/supabase
supabase start
supabase db reset
supabase functions serve
```

### Odoo Local Development
```bash
cd platform/odoo/docker
docker-compose up -d
```

See `platform/odoo/docs/runbook.md` for details.

## Deployment

### Supabase
Migrations and functions deployed via Supabase CLI or GitHub Actions.

```bash
supabase db push
supabase functions deploy <function-name>
```

### Odoo
Deployed via Docker containers. See `platform/odoo/docker/` for configuration.

## Security & Compliance

- **No secrets in git** - Use `.env` files per `infra/env-templates/`
- **Odoo modules:** AGPL-3 licensed, OCA-compliant
- **Supabase:** RLS policies for data access control
- **Migrations:** Idempotent SQL only, no destructive ops without spec

## References

- **Specs:** `.specify/specs/**`
- **Architecture:** `docs/insightpulse/architecture/overview.md`
- **Environment Templates:** `infra/env-templates/`
