# InsightPulse Platform

**Version:** 1.0.0  
**Status:** Active Development (Phase 1)  
**License:** MIT (apps), AGPL-3 (Odoo modules)

A unified monorepo for the InsightPulse AI operations and analytics platform, consolidating apps, platform components, agents, design system, docs, and automation.

---

## 📁 Repository Structure

```
insightpulse-platform/
├── apps/                   # All frontends (Next.js, docs, admin, client portals)
├── platform/               # Supabase, Odoo, pipelines, experiments
├── agents/                 # Agent registry, skills, MCP configs, playbooks
├── design-system/          # Tokens, themes, shared UI components
├── docs/                   # Human docs + upstream mirrors + RAG knowledge
├── automation/             # n8n, Deepnote, CI/CD, Mattermost, scripts
├── infra/                  # Terraform, Docker, k8s, env templates
├── .specify/specs/         # Spec Kit specs (spec.md, plan.md, tasks.md)
├── CLAUDE.md               # AI copilot instructions
├── PLANNING.md             # Phase-based roadmap
├── TASKS.md                # Cross-cutting implementation checklist
├── CHANGELOG.md            # Version history
└── CODEBASE_GUIDE.md       # Comprehensive technical documentation
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 10.11.1+
- Docker (for local Supabase and Odoo)
- Supabase CLI (optional, for local development)

### Clone and Install

```bash
git clone https://github.com/jgtolentino/opex.git
cd opex
pnpm install
```

### Environment Setup

1. Copy environment templates:
   ```bash
   cp infra/env-templates/.env.opex.example .env
   cp infra/env-templates/.env.supabase.example platform/supabase/.env
   ```

2. Fill in actual values (never commit `.env` files)

### Run Local Stack

```bash
# Start Supabase locally
cd platform/supabase
supabase start

# Start Odoo (Docker)
cd platform/odoo/docker
docker-compose up -d

# Start an app (e.g., OpEx Portal)
cd apps/opex-portal
pnpm dev
```

---

## 📚 Key Components

### Apps

User-facing frontends:
- **OpEx Portal** - Operational excellence UI (RAG-powered docs, PH tax, HR)
- **Data Lab UI** - Analytics dashboards (Superset, Deepnote, Jenny AI BI Genie)
- **Docs Site** - Public documentation (Docusaurus)
- **Admin Console** - Internal admin tools

**Status:** Planned (Phase 3)  
**README:** [apps/README.md](apps/README.md)

### Platform

Backend systems and data infrastructure:
- **Supabase** - PostgreSQL + pgvector + Edge Functions (RAG, analytics)
- **Odoo CE/OCA** - ERP with custom modules (finance, HR, branding cleaner)
- **Data Pipelines** - ETL scripts (extract, transform, load)
- **Experiments** - RAG experiments, model registry

**Status:** Active (Supabase, Odoo), Planned (Pipelines, Experiments)  
**README:** [platform/README.md](platform/README.md)

### Agents

AI agent architecture:
- **Registry** - `agents.yaml`, `skills.yaml` (6 agents, 11 skills)
- **Skills** - BPM, CTO Mentor, Data Lab (Superset, Deepnote, ECharts)
- **MCP** - Model Context Protocol integrations (Chrome DevTools, Supabase, Odoo, n8n)
- **Playbooks** - End-to-end workflows (Design Import, Data Lab Health, Odoo Branding Guard)

**Status:** Active (Skills), Planned (MCP, Playbooks)  
**README:** [agents/README.md](agents/README.md)

### Design System

Unified visual language:
- **Tokens** - Color, typography, spacing (Material 3-aligned)
- **Themes** - MUI theme, ECharts theme
- **Components** - KpiCard, TimeSeriesChart, RatingDistributionChart

**Status:** Planned (Phase 2)  
**README:** [design-system/README.md](design-system/README.md)

### Docs

Documentation and knowledge:
- **InsightPulse Docs** - First-party guides (OpEx, Data Lab, n8n, Odoo, agents)
- **Upstream Docs** - Mirrored docs (Odoo CE/OCA, git submodules)
- **AI Knowledge** - RAG ingest scripts and manifests

**Status:** Active (InsightPulse), Planned (Upstream, RAG ingest)  
**README:** [docs/insightpulse/architecture/overview.md](docs/insightpulse/architecture/overview.md)

### Automation

Workflows and integrations:
- **n8n** - Workflow automation (alerts, design import, docs sync)
- **Deepnote** - Data jobs and notebooks
- **CI/CD** - GitHub Actions (linting, deployment, validation)
- **Mattermost** - Slash commands, webhooks

**Status:** Partially Active (n8n), Planned (Deepnote, CI/CD, Mattermost)  
**README:** [automation/README.md](automation/README.md)

### Infra

Infrastructure as code:
- **Docker** - Docker Compose for local dev
- **Terraform** - Cloud infrastructure (optional)
- **Env Templates** - `.env` examples for all services

**Status:** Planned (Phase 4)  
**README:** [infra/README.md](infra/README.md)

---

## 📖 Documentation

- **CLAUDE.md** - AI copilot instructions for working in this repo
- **CODEBASE_GUIDE.md** - Comprehensive technical guide (architecture, stack, patterns)
- **PLANNING.md** - Roadmap with 6 phases (M0-M6)
- **TASKS.md** - Cross-repo task checklist
- **CHANGELOG.md** - Version history and release notes
- **Specs** - `.specify/specs/**` - Spec Kit feature specs

---

## 🗺️ Roadmap

Current phase: **Phase 0 Complete, Phase 1 In Progress**

- **M0 (Complete):** Monorepo structure, coordination files
- **M1 (In Progress):** Migrate existing code to new structure
- **M2 (Planned):** Design system tokens + themes
- **M3 (Planned):** Applications (OpEx Portal, Data Lab UI, Docs Site)
- **M4 (Planned):** Agents + MCP flows
- **M5 (Planned):** Automation + health monitoring
- **M6 (Planned):** Production-grade hardening, observability, docs

See [PLANNING.md](PLANNING.md) for detailed phases and milestones.

---

## 🧩 Tech Stack

**Frontend:**
- Next.js 15, React 19, TypeScript 5.9
- Material UI (MUI), Apache ECharts
- Docusaurus 3.x (docs site)

**Backend:**
- Supabase (PostgreSQL + pgvector, Deno Edge Functions)
- Odoo CE v17 (AGPL-3, OCA-compliant)
- Python (ETL scripts, data jobs)

**AI/ML:**
- OpenAI API (GPT-4, Assistants, Embeddings)
- RAG (Retrieval-Augmented Generation)
- Multi-agent orchestration (MCP)

**Data & Analytics:**
- Apache Superset (self-hosted BI)
- Deepnote (collaborative notebooks)
- Jenny (AI BI Genie)

**Automation:**
- n8n (workflow automation)
- GitHub Actions (CI/CD)
- Mattermost (collaboration, alerts)

---

## 🤝 Contributing

This is a private monorepo for InsightPulse Platform. For contributors:

1. **Follow CLAUDE.md** - AI copilot instructions and patterns
2. **Spec-Driven** - Add/update specs in `.specify/specs/**` for major features
3. **Update TASKS.md** - Check off tasks as you complete them
4. **Update CHANGELOG.md** - Document changes under `Unreleased` or version sections
5. **Respect Structure** - Apps in `apps/`, platform in `platform/`, etc.
6. **No Secrets** - Use `.env` files, never commit secrets

### Development Workflow

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes following existing patterns
3. Update specs, tasks, changelog
4. Run linters and tests (when available)
5. Push and create PR
6. Deploy to staging (auto on PR)
7. Merge to main after review

---

## 📄 License

- **Apps, Design System, Docs, Automation:** MIT
- **Odoo Modules (`platform/odoo/addons/ipai_*`):** AGPL-3 (OCA-compliant)

See individual LICENSE files where applicable.

---

## 🔗 Links

- **GitHub:** https://github.com/jgtolentino/opex
- **Documentation:** (Planned: docs.insightpulseai.net)
- **Support:** (Mattermost/Slack TBD)

---

## 📞 Contact

**Maintainer:** Jake Tolentino  
**Organization:** InsightPulseAI  
**Project:** InsightPulse Platform

For questions or support, see the internal wiki or contact the team lead.

---

**Built with ❤️ by the InsightPulse team**
