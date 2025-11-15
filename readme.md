# OpEx Hybrid Platform

> Comprehensive operational excellence documentation hub combining Next.js/Notion + Docusaurus

[![Build Status](https://github.com/jgtolentino/opex/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/jgtolentino/opex/actions/workflows/deploy-docs.yml) [![Prettier Code Formatting](https://img.shields.io/badge/code_style-prettier-brightgreen.svg)](https://prettier.io)

## Overview

OpEx is a hybrid documentation platform that combines:
- **Next.js/Notion** for public-facing content and marketing
- **Docusaurus 3** for comprehensive organizational documentation

This approach provides the flexibility of Notion for content creation with the power of version-controlled, searchable documentation.

## Features

### Public Site (Next.js + Notion)
- Notion-powered content management
- Beautiful article pages with smooth previews
- Automatic social images
- Dark mode support
- Responsive design

### Documentation Hub (Docusaurus)
- **Knowledge Base**: Glossary, FAQ, getting started guides
- **HR Documentation**: Policies, workflows (hiring, onboarding, performance, offboarding), templates
- **Finance Documentation**: Expense policies, procurement workflows, approval matrices
- **Operations**: SOPs, incident response, change management
- **Technical Docs**: Architecture, API documentation, development guides
- **Automated Diagram Export**: Git-based BPMN/Draw.io workflow with SVG/PNG generation

## Quick Start

### Prerequisites
- Node.js >= 18
- pnpm (recommended)

### Installation

```bash
# Clone repository
git clone https://github.com/jgtolentino/opex.git
cd opex

# Install dependencies
pnpm install

# Start Next.js development server
pnpm dev

# Start Docusaurus development server (in separate terminal)
pnpm dev:docs
```

### URLs
- **Next.js Site**: http://localhost:3000
- **Docusaurus Docs**: http://localhost:3000/opex/ (after deployment)
- **Production**: https://jgtolentino.github.io/opex/

## Project Structure

```
opex/
├── components/          # Next.js components
├── lib/                 # Next.js utilities
├── pages/               # Next.js pages
├── docs/                # Docusaurus documentation hub
│   ├── docs/            # Documentation content
│   │   ├── knowledge-base/
│   │   ├── hr/ (policies, workflows, templates)
│   │   ├── finance/
│   │   ├── operations/
│   │   ├── technical/
│   │   └── ticketing/
│   ├── diagrams-src/    # Source .drawio files (Git-tracked)
│   ├── static/diagrams/ # Auto-exported SVG/PNG
│   └── blog/            # Documentation updates
├── scripts/             # Automation scripts
│   └── export-diagrams.sh
├── templates/           # Documentation templates
│   └── sop-template.md
└── .github/workflows/   # CI/CD automation
    ├── deploy-docs.yml
    └── export-diagrams.yml
```

## Documentation Workflow

### Creating Documentation

1. **Navigate to category**: `docs/docs/[category]/`
2. **Create markdown file**: Follow frontmatter format
3. **Add to sidebar**: Update `docs/sidebars.ts`
4. **Commit changes**: Documentation auto-deploys via GitHub Actions

### Creating Diagrams

1. **Create .drawio file**: Use Draw.io Desktop or VS Code extension
2. **Save to diagrams-src**: Organize by category (hr/, finance/, etc.)
3. **Commit to Git**: GitHub Actions auto-exports to SVG/PNG
4. **Reference in docs**: Use `/diagrams/[category]/[filename].svg`

See [Diagram Workflow Documentation](docs/diagrams-src/README.md) for details.

## Available Scripts

### Next.js (Public Site)
```bash
pnpm dev              # Start development server
pnpm build            # Build production bundle
pnpm start            # Start production server
pnpm deploy           # Deploy to Vercel
```

### Docusaurus (Documentation)
```bash
pnpm dev:docs         # Start Docusaurus dev server
pnpm build:docs       # Build Docusaurus static site
pnpm build:all        # Build both Next.js + Docusaurus
pnpm deploy:docs      # Deploy documentation to GitHub Pages
```

## Deployment

### Current Status
- ✅ **Docusaurus Build**: Production-ready (verified 2025-11-15)
- ✅ **Dev Server**: Running at http://localhost:3000/opex/
- ✅ **Cross-Site Navigation**: Configured (Docusaurus → Vercel)
- ✅ **Git Commit**: Changes committed and pushed to main branch
- ✅ **Vercel Deployment**: docs-8vyrsbyl9-jake-tolentinos-projects-c0369c83.vercel.app (deploying)
- ⏳ **Production URL**: Pending Vercel build completion
- ⏳ **Landing Page Link**: Pending (see INTEGRATION.md)

### Next.js Site
Deployed to Vercel automatically on push to `main` branch.

**Live URL**: https://nextjs-notion-starter-kit-eight-iota.vercel.app

### Docusaurus Documentation
Deployed to GitHub Pages via GitHub Actions on changes to `docs/**` files.

**Target URL**: https://jgtolentino.github.io/opex/

**GitHub Pages Setup**:
1. Repository Settings → Pages
2. Source: Deploy from branch
3. Branch: `gh-pages` / `root`
4. Push to `main` branch to trigger first deployment
5. GitHub Actions workflows handle automated deployment

### Manual Deployment (GitHub Actions Blocked)

If GitHub Actions is unavailable due to billing issues, deploy manually:

```bash
# 1. Build production bundle
cd docs
pnpm build

# 2. Deploy to GitHub Pages
# Option A: Using gh-pages package (recommended)
pnpm add -D gh-pages
npx gh-pages -d build -b gh-pages

# Option B: Manual git push
git checkout --orphan gh-pages
git add -f build
git commit -m "Deploy Docusaurus"
git push origin gh-pages --force
git checkout main
```

**First Deployment Checklist**:
- [ ] Enable GitHub Pages in repository settings
  - Settings → Pages → Source: Branch `gh-pages` / `root`
- [ ] Deploy manually (see above) OR fix GitHub Actions billing
- [ ] Wait for Pages to build (2-3 minutes)
- [ ] Verify site at https://jgtolentino.github.io/opex/
- [ ] Test cross-site navigation
- [ ] Add documentation link to Vercel site (see INTEGRATION.md)

## Configuration

### Next.js Site
Edit [site.config.ts](./site.config.ts) for Notion integration and site settings.

### Docusaurus
Edit [docs/docusaurus.config.ts](./docs/docusaurus.config.ts) for documentation site settings.

## Documentation Templates

Pre-built templates available in `/templates`:
- **SOP Template**: Standard operating procedure format
- **Policy Template**: Policy documentation structure
- **Workflow Template**: BPMN workflow documentation

## GitHub Actions Workflows

### Documentation Deployment
- **Trigger**: Push to `main` with changes to `docs/**`
- **Action**: Build Docusaurus → Deploy to GitHub Pages
- **Workflow**: [.github/workflows/deploy-docs.yml](.github/workflows/deploy-docs.yml)

### Diagram Export
- **Trigger**: Push to `main` with changes to `.drawio` files
- **Action**: Export diagrams to SVG/PNG → Commit to repo
- **Workflow**: [.github/workflows/export-diagrams.yml](.github/workflows/export-diagrams.yml)

## Key Documentation Pages

- [Introduction](https://jgtolentino.github.io/opex/docs/knowledge-base/introduction) - Documentation hub overview
- [Employee Requisition Workflow](https://jgtolentino.github.io/opex/docs/hr/workflows/employee-requisition) - Complete BPMN example
- [Glossary](https://jgtolentino.github.io/opex/docs/knowledge-base/glossary) - Common terms
- [FAQ](https://jgtolentino.github.io/opex/docs/knowledge-base/faq) - Frequently asked questions

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make changes and commit: `git commit -m "Add my feature"`
4. Push to branch: `git push origin feature/my-feature`
5. Submit a pull request

### Documentation Contributions
Click "Edit this page" at the bottom of any documentation page to submit changes via GitHub.

## Technology Stack

- **Frontend**: Next.js 15, React 19
- **CMS**: Notion API
- **Documentation**: Docusaurus 3
- **Diagrams**: Draw.io, BPMN 2.0
- **Styling**: CSS Modules, Dark Mode
- **Deployment**: Vercel (Next.js), GitHub Pages (Docusaurus)
- **CI/CD**: GitHub Actions

## License

MIT © Jake Tolentino

## Support

- **Issues**: [GitHub Issues](https://github.com/jgtolentino/opex/issues)
- **Email**: jgtolentino_rn@yahoo.com
- **Documentation Feedback**: Submit via "Edit this page" links

---

**Built with**:
- [Next.js](https://nextjs.org/)
- [Notion](https://notion.so/)
- [Docusaurus](https://docusaurus.io/)
- [Draw.io](https://www.drawio.com/)
