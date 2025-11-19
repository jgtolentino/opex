# n8n Workflows

This directory contains n8n workflow definitions for the InsightPulse Platform.

## Workflows

### `supabase-alert-notifier.json`
- **Purpose**: Sends alerts from Supabase to Mattermost or other notification channels
- **Trigger**: HTTP webhook or scheduled
- **Outputs**: Mattermost notifications
- **Status**: Active

## Planned Workflows

The following workflows are planned for future implementation:

### `design-import-pipeline-v3.json`
- **Purpose**: Automate design token extraction from Figma → code
- **Integrations**: Figma API, Chrome DevTools MCP, GitHub
- **Status**: Planned (Phase 5)

### `sync-docs-to-rag.json`
- **Purpose**: Sync upstream docs (Odoo, Material) to Supabase RAG index
- **Integrations**: Git, Supabase Edge Functions
- **Status**: Planned (Phase 5)

### `data-lab-job-monitor.json`
- **Purpose**: Monitor Deepnote jobs and send health alerts
- **Integrations**: Deepnote API, Supabase, Mattermost
- **Status**: Planned (Phase 5)

### `odoo-branding-guard.json`
- **Purpose**: Monitor Odoo instances for branding compliance
- **Integrations**: Odoo API, Supabase, Mattermost
- **Status**: Implemented (see .specify/specs/003-odoo-branding-guard/)

## Importing Workflows

1. Navigate to your n8n instance
2. Click "Import workflow from file"
3. Select the JSON file from this directory
4. Configure credentials and webhook URLs
5. Activate the workflow

## Development

When creating new workflows:
1. Export from n8n as JSON
2. Place in `automation/n8n/workflows/`
3. Update this README
4. Document required environment variables
5. Add to version control

## Environment Variables

Workflows may require the following environment variables:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `MATTERMOST_WEBHOOK_URL`
- `ODOO_API_URL`
- `ODOO_API_KEY`
- `FIGMA_API_TOKEN`
- `DEEPNOTE_API_KEY`

See `infra/env-templates/` for example configurations.
