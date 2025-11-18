# Automation

Workflows, integrations, and automation for the InsightPulse Platform.

## Structure

```
automation/
├── n8n/                # n8n workflow definitions
├── deepnote/           # Deepnote project manifests and templates
├── ci-cd/              # GitHub Actions and deployment workflows
├── mattermost/         # Slash commands and webhook documentation
└── scripts/            # Helper scripts (sync, seed, health checks)
```

## n8n Workflows

**Status:** Partially Active (Phase 1), Full in Phase 5

Workflow automation engine for data pipelines, alerts, and integrations.

### Active Workflows

- `supabase-alert-notifier.json` - Sends alerts from Supabase to Mattermost

### Planned Workflows

- `design-import-pipeline-v3.json` - Figma → Code design import
- `sync-docs-to-rag.json` - Upstream docs → Supabase RAG index
- `data-lab-job-monitor.json` - Deepnote job monitoring and health alerts
- `odoo-branding-guard.json` - Odoo branding compliance monitoring

**Documentation:** `n8n/README.md`

## Deepnote

**Status:** Planned (Phase 5)

Collaborative notebook workspace for data jobs and exploration.

### Subdirectories

- `project-manifest.yaml` - Deepnote project configuration
- `templates/` - Shared DB helpers, SQL snippets, code templates

### Use Cases

- Data Lab metric computation (hourly/daily summaries)
- Exploratory data analysis
- ML model training and evaluation
- Report generation

## CI/CD

**Status:** Planned (Phase 5)

GitHub Actions workflows in `ci-cd/github-actions/`:

### Planned Workflows

**Linting & Testing**
- `lint-typescript.yml` - ESLint + Prettier for TS/JS
- `lint-python.yml` - Black + isort for Python
- `lint-sql.yml` - SQL linting (if feasible)
- `validate-specs.yml` - Spec Kit validation

**Deployment**
- `deploy-opex-portal.yml` - Deploy OpEx Portal to Vercel
- `deploy-data-lab-ui.yml` - Deploy Data Lab UI to Vercel
- `deploy-docs-site.yml` - Deploy Docs Site to Vercel
- `deploy-supabase-migrations.yml` - Run Supabase migrations
- `deploy-supabase-functions.yml` - Deploy Edge Functions

**Agent/Skill Validation**
- `validate-agents.yml` - Validate agents.yaml and skills.yaml
- `validate-skills.yml` - Lint SKILL.md files

## Mattermost

**Status:** Documented (Phase 1)

Slash commands and webhooks for team collaboration.

### Slash Commands

**Planned Commands:**
- `/ask` - Query OpEx Docs Assistant
- `/docs` - Search documentation
- `/ai-health` - Check AI systems health

### Incoming Webhooks

Used by n8n workflows and Edge Functions for alerts:
- Data Lab job failures
- n8n workflow errors
- Deployment status
- Odoo branding violations

**Documentation:** `mattermost/slash-commands.md`, `mattermost/webhooks.md`

## Scripts

**Status:** Planned (Phase 5)

Helper scripts in `scripts/`:

### Planned Scripts

- `sync-docs.sh` - Sync upstream docs (Odoo, Material) to local
- `seed-scout-data.py` - Seed sample data for development
- `verify-data-lab-health.py` - Data Lab system health check
- `backup-supabase.sh` - Backup Supabase database

## Environment Variables

Automations may require:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `MATTERMOST_WEBHOOK_URL`
- `ODOO_API_URL`
- `ODOO_API_KEY`
- `FIGMA_API_TOKEN`
- `DEEPNOTE_API_KEY`
- `GITHUB_TOKEN`

See `infra/env-templates/` for examples.

## Development

### Running n8n Locally

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

Import workflows from `n8n/workflows/*.json`.

### Testing Webhooks

```bash
curl -X POST https://your-mattermost/hooks/WEBHOOK_ID \
  -H 'Content-Type: application/json' \
  -d '{"text": "Test alert"}'
```

## References

- **n8n Documentation:** https://docs.n8n.io/
- **Deepnote Documentation:** https://docs.deepnote.com/
- **GitHub Actions:** https://docs.github.com/en/actions
- **Specs:** `.specify/specs/**`
