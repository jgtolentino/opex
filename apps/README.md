# Apps

This directory contains all user-facing frontend applications for the InsightPulse Platform.

## Structure

```
apps/
├── opex-portal/        # OpEx / AI Ops UI (Next.js + MUI)
├── data-lab-ui/        # Data Lab dashboard (Next.js + MUI + ECharts)
├── docs-site/          # Documentation site (Docusaurus/Next.js)
├── admin-console/      # Internal admin tools
└── client-portals/     # White-label client views (optional)
```

## Applications

### OpEx Portal (`opex-portal/`)
**Status:** Planned (Phase 3)

- **Tech Stack:** Next.js 15, React 19, MUI, TypeScript
- **Purpose:** Operational excellence platform for Finance SSC
- **Features:**
  - RAG-powered docs assistant
  - Philippine tax compliance tools (BIR forms)
  - HR workflows
  - Finance operations dashboards

### Data Lab UI (`data-lab-ui/`)
**Status:** Planned (Phase 3)

- **Tech Stack:** Next.js 15, React 19, MUI, ECharts, TypeScript
- **Purpose:** Analytics and BI interface for InsightPulse Data Lab
- **Features:**
  - Superset dashboard embeds
  - Deepnote project links
  - Jenny (AI BI Genie) chat interface
  - Real-time metrics visualizations

### Docs Site (`docs-site/`)
**Status:** Planned (Phase 3)

- **Tech Stack:** Docusaurus 3.x or Next.js
- **Purpose:** Public-facing documentation
- **Features:**
  - InsightPulse guides and runbooks
  - API documentation
  - Upstream doc links (Odoo, Material)
  - Search and "Ask OpEx" chat widget

### Admin Console (`admin-console/`)
**Status:** Planned (Phase 3+)

- **Tech Stack:** Next.js 15, React 19, MUI, TypeScript
- **Purpose:** Internal admin tools
- **Features:**
  - Agent management UI
  - Experiment tracking
  - Configuration management
  - User and tenant administration

## Shared Dependencies

All apps use the unified design system from `design-system/`:
- Tokens (colors, typography, spacing)
- MUI theme
- ECharts theme
- Shared components (KpiCard, TimeSeriesChart, etc.)

## Development

### Prerequisites
- Node.js 18+
- pnpm 10.11.1+

### Running Locally
```bash
# From repo root
cd apps/<app-name>
pnpm install
pnpm dev
```

### Environment Variables
Each app requires environment variables. See `infra/env-templates/` for examples.

## Deployment

Apps are deployed to Vercel (or similar Next.js hosting):
- Production: `main` branch auto-deploy
- Staging: `develop` branch auto-deploy
- Preview: PR deployments

See `automation/ci-cd/github-actions/` for deployment workflows.

## References

- **Design System:** `design-system/`
- **Platform APIs:** `platform/supabase/functions/`
- **Specs:** `.specify/specs/**`
- **Architecture:** `docs/insightpulse/architecture/overview.md`
