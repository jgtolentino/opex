# Changelog

All notable changes to the OpEx Hybrid Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive documentation suite (CLAUDE.md, PRD.md, PLANNING.md, TASKS.md)
- Process-oriented requirements following SAP Signavio standards
- GitHub Spec Kit compliant project structure

### Changed
- Documentation structure reorganized for AI assistant workflows

## [2.0.0] - 2025-11-16

### Added
- **RAG Infrastructure**: Real RAG vector search with Supabase pgvector
  - Database schema for `opex.rag_queries` table
  - 8 indexes for performance optimization (JSONB support)
  - Row-Level Security (RLS) policies
  - Helper functions: `get_rag_analytics()`, `get_popular_questions()`
- **Edge Functions**: Supabase Edge Function for RAG queries (`opex-rag-query`)
  - Vector store routing based on document metadata
  - Query logging to database
  - Integration with OpenAI GPT-4o
- **RAG Client**: TypeScript client for Next.js (`lib/opex/ragClient.ts`)
  - `askOpexAssistant()` function with type safety
  - Error handling and retry logic
- **Test Scripts**:
  - Document upload script for RAG verification
  - Test document upload script (`scripts/upload_test_documents.py`)
- **Documentation**:
  - Comprehensive quickstart guide for RAG setup (`RAG_QUICKSTART.md`)
  - Deployment status tracking (`DEPLOYMENT_STATUS.md`)
  - Manual deployment guide (`MANUAL_DEPLOYMENT_GUIDE.md`)

### Changed
- Switched from OpenRouter to OpenAI API for vector search
- Updated deployment workflow to support manual Edge Function deployment

### Fixed
- GitHub repository name in DigitalOcean app spec

## [1.5.0] - 2025-11-15

### Added
- **Mattermost RAG Integration**: OpenRouter/DeepSeek integration for chat
  - Real-time Q&A bot for Mattermost
  - Integration with OpEx knowledge base
- **Landing Page Redesign**: Production-grade OpEx Docs homepage
  - Hero section with value proposition
  - Feature showcase grid
  - Agency partner logos (8 finance SSCs)
  - Call-to-action sections
- **BPM Agent Skills Architecture**:
  - 4 core BPM sub-agents:
    - `bpm_copywriter`: Documentation and report generation
    - `bpm_knowledge_agent`: Q&A and guidance
    - `bpm_learning_designer`: Training material creation
    - `bpm_transformation_partner`: Process improvement recommendations
  - `cto_mentor` skill for AI platform and product strategy
- **Prompt Packs**: Seed prompt packs for Finance, HR, and Engineering
  - Structured JSON templates with variable substitution
  - Use case examples for each domain
- **n8n Workflow Automation**:
  - Integration framework with comprehensive documentation
  - Workflow examples for common SSC tasks
  - REST API endpoints for external system integration
- **Voice RAG Agent**: JakeVoiceDev - Voice-first AI assistant
  - Speech-to-text (STT) with OpenAI `gpt-4o-transcribe`
  - Text-to-speech (TTS) with OpenAI `gpt-4o-mini-tts`
  - RAG backend integration (Scout, Odoo, Supabase docs)
  - Personal assistant capabilities (task creation, planning)
- **Docusaurus Documentation Hub**:
  - Deployed to GitHub Pages
  - Comprehensive guides for platform usage
  - API reference documentation
- **OpEx Operational Portal**: Front door to documentation hub
  - Navigation to all platform components
  - Quick links to common resources

### Changed
- Updated `.gitignore`: Added comprehensive security and build exclusions
- Updated social links: Replaced Twitter/GitHub with Notion/Documentation
- Enhanced site configuration with custom domain support

### Security
- Environment variable templates for secure credential management
- Removed hardcoded API keys and sensitive data

## [1.0.0] - 2025-11-15

### Added
- **Initial Release**: Next.js + Notion hybrid platform
- **Core Features**:
  - Notion API integration for content management
  - Incremental Static Regeneration (ISR) for performance
  - Preview image generation with LQIP
  - Dark mode support
  - RSS feed generation
- **Technology Stack**:
  - Next.js 15 with React 19
  - TypeScript for type safety
  - react-notion-x for Notion rendering
  - Vercel deployment
- **Development Workflow**:
  - pnpm for package management
  - ESLint + Prettier for code quality
  - GitHub Actions for CI/CD
- **Documentation**:
  - README with setup instructions
  - Contributing guidelines
  - EditorConfig for consistent formatting

### Infrastructure
- Vercel hosting configuration
- Environment variable management
- GitHub repository setup

---

## Version History Summary

| Version | Date | Type | Description |
|---------|------|------|-------------|
| 2.0.0 | 2025-11-16 | Major | RAG infrastructure, vector search, AI assistants |
| 1.5.0 | 2025-11-15 | Minor | BPM skills, voice agent, Docusaurus, landing page |
| 1.0.0 | 2025-11-15 | Major | Initial release with Next.js + Notion |

---

## Categories Explained

### Added
New features, components, or capabilities added to the platform.

### Changed
Modifications to existing functionality that don't break backward compatibility.

### Deprecated
Features that will be removed in upcoming releases.

### Removed
Features that have been completely removed from the platform.

### Fixed
Bug fixes and corrections to existing functionality.

### Security
Security improvements, vulnerability patches, or compliance updates.

---

## Deprecation Schedule

### To Be Deprecated in v3.0.0
- **Redis Caching**: Currently disabled, may be replaced with Edge Function caching
- **Legacy Notion API Calls**: Migrating to newer API version

### Removed in v2.0.0
- **OpenRouter Integration**: Replaced with direct OpenAI API integration
- **Static Site Generation Only**: Replaced with hybrid ISR + RAG approach

---

## Migration Guides

### Upgrading from 1.x to 2.0

**Database Migration:**
```sql
-- Run migration script
psql -h <SUPABASE_HOST> -U postgres -d postgres -f packages/db/migrations/001_opex_rag_queries.sql
```

**Environment Variables:**
Add new variables to `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://ublqmilcjtpnflofprkr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>
```

**Edge Function Deployment:**
See [DEPLOYMENT_STATUS.md](./DEPLOYMENT_STATUS.md) for step-by-step instructions.

**Breaking Changes:**
- `askAssistant()` renamed to `askOpexAssistant()` in RAG client
- Query metadata structure changed (added `domain`, `process` fields)

---

## Roadmap

### [3.0.0] - Planned Q2 2025

**Theme:** Multi-Tenant & Mobile

#### Added (Planned)
- **Multi-Tenant Support**:
  - Isolated data for 8 SSC agencies
  - Agency-specific branding
  - Role-based access control (RBAC)
- **Mobile Apps**:
  - iOS native app (Swift)
  - Android native app (Kotlin)
  - Offline mode for field operations
- **Advanced Analytics**:
  - Usage dashboards for managers
  - Knowledge gap identification
  - ROI tracking and reporting
- **User Authentication**:
  - Supabase Auth integration
  - SSO (Azure AD, Google Workspace)
  - User-specific query history

#### Changed (Planned)
- Next.js upgraded to v16 (if available)
- OpenAI SDK upgraded to v2
- Improved caching strategy (Edge Function + Redis)

#### Deprecated (Planned)
- Public access (replaced with authenticated users)
- Monolithic deployment (migrating to microservices)

---

### [4.0.0] - Planned Q4 2025

**Theme:** AI-Powered Automation

#### Added (Planned)
- **Predictive Analytics**:
  - Process bottleneck detection
  - Anomaly detection in financial data
  - Natural language to SQL for ad-hoc reporting
- **Workflow Orchestration**:
  - 50+ n8n workflows for SSC tasks
  - Integration with ERP systems (SAP, Oracle, Odoo)
  - Automated report generation
- **Voice Interface**:
  - Production-ready voice agent
  - Multi-language support (English, Filipino)
  - Voice commands for common tasks
- **Open-Source Ecosystem**:
  - Public GitHub repository
  - Community contributions welcome
  - Plugin architecture for extensions

---

## Contributing to Changelog

When making changes to the project:

1. **Add entry to "Unreleased" section** at the top
2. **Categorize** your change (Added, Changed, Fixed, etc.)
3. **Write clear description** of what changed and why
4. **Link to PR/Issue** if applicable
5. **Follow format**: `- **Component**: Description (PR #123)`

**Example:**
```markdown
## [Unreleased]

### Added
- **RAG UI Components**: Chat interface for RAG queries (PR #42)
- **Analytics Dashboard**: Usage metrics visualization (Issue #38)

### Fixed
- **Edge Function**: Retry logic for OpenAI API rate limits (PR #41)
```

When releasing a version:
1. Move "Unreleased" entries to a new version section
2. Update version number and date
3. Add link to GitHub compare view (if applicable)
4. Update README.md with new version

---

## Links

- [Repository](https://github.com/jgtolentino/opex)
- [Documentation](https://docs-9qs1bqcvs-jake-tolentinos-projects-c0369c83.vercel.app)
- [Issues](https://github.com/jgtolentino/opex/issues)
- [Pull Requests](https://github.com/jgtolentino/opex/pulls)
- [Deployment Status](./DEPLOYMENT_STATUS.md)
- [PRD](./PRD.md)
- [Planning](./PLANNING.md)
- [Tasks](./TASKS.md)

---

## Version Tags

[Unreleased]: https://github.com/jgtolentino/opex/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/jgtolentino/opex/compare/v1.5.0...v2.0.0
[1.5.0]: https://github.com/jgtolentino/opex/compare/v1.0.0...v1.5.0
[1.0.0]: https://github.com/jgtolentino/opex/releases/tag/v1.0.0

---

**Maintained by:** Development Team
**Last Updated:** 2025-11-16
**Next Review:** End of Q1 2025
