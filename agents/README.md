# Agents

This directory contains AI agent architecture for the InsightPulse Platform.

## Structure

```
agents/
├── registry/           # Agent and skill registries (YAML)
├── skills/             # Skill definitions (SKILL.md per skill)
├── profiles/           # Agent persona specifications
├── mcp/                # MCP server configurations
└── playbooks/          # End-to-end workflow playbooks
```

## Agent Registry

### `registry/agents.yaml`
Canonical registry of all agents in the platform.

**Defined Agents:**
- **OpEx Assistant** - RAG-powered docs and operations assistant
- **Data Lab Assistant** - Analytics, Superset, Deepnote, Jenny (AI BI Genie)
- **Odoo Architect** - Odoo CE/OCA module development
- **Design Import Agent** - Figma → Code design pipeline
- **BPM Suite** - Business process management agents
- **CTO Mentor** - Strategy and architecture guidance

### `registry/skills.yaml`
Catalog of all skills with metadata, tags, and domain classification.

**Total Skills:** 11

**Domains:**
- `bpm` - Business process management (4 skills)
- `strategy` - Leadership and architecture (1 skill)
- `data-lab` - Data Lab & BI (6 skills)
- `design` - Design systems (planned)
- `odoo` - ERP customization (planned)

## Skills

Each skill is defined in `skills/<skill-name>/SKILL.md` with:
- Frontmatter (name, version, tags, description)
- Core mandate and specialization
- When to use this skill
- Example prompts and workflows

**Active Skills:**
- BPM: `bpm_copywriter`, `bpm_knowledge_agent`, `bpm_learning_designer`, `bpm_transformation_partner`
- Strategy: `cto_mentor`
- Data Lab: `insightpulse-superset-platform-admin`, `insightpulse-superset-api-ops`, `insightpulse-superset-embedded-analytics`, `insightpulse-superset-user-enablement`, `insightpulse-deepnote-data-lab`, `insightpulse-echarts-viz-system`

## Profiles

Agent persona specifications in `profiles/`:
- Narrative description of agent capabilities
- Use cases and examples
- Integration points with skills and MCP servers

**Status:** Planned (Phase 4)

## MCP (Model Context Protocol) Integrations

MCP server configurations in `mcp/`:

**Planned MCP Servers:**
- `chrome-devtools.mcp.json` - Chrome DevTools for design import
- `supabase-tools.mcp.json` - Supabase management
- `odoo-backend.mcp.json` - Odoo API integration
- `n8n-orchestrator.mcp.json` - n8n workflow automation

**Status:** Planned (Phase 4)

## Playbooks

End-to-end workflow documentation in `playbooks/`:

**Planned Playbooks:**
- `design-import-pipeline.md` - Figma → Code token extraction
- `data-lab-healthcheck.md` - Data Lab system health monitoring
- `opex-triage-flow.md` - OpEx incident triage and response
- `odoo-branding-guard.md` - Odoo white-label compliance monitoring

**Status:** Planned (Phase 4)

## Development

### Adding a New Skill

1. Create skill directory:
   ```bash
   mkdir agents/skills/my-new-skill
   ```

2. Create `SKILL.md`:
   ```markdown
   ---
   name: "My New Skill"
   version: 1
   author: "InsightPulseAI"
   tags:
     - domain
     - specialty
   description: >
     Brief description of the skill.
   ---
   
   [Skill content...]
   ```

3. Register in `agents/registry/skills.yaml`:
   ```yaml
   - id: my-new-skill
     name: My New Skill
     domain: <domain>
     description: ...
     path: agents/skills/my-new-skill/SKILL.md
     tags: [...]
     status: active
     version: 1.0.0
   ```

4. Update `agents/registry/agents.yaml` to assign skill to agents

### Adding a New Agent

1. Define in `agents/registry/agents.yaml`
2. Create profile in `agents/profiles/<agent-name>.md`
3. Assign skills from skills registry
4. Configure MCP servers if needed

## References

- **Specs:** `.specify/specs/**`
- **Architecture:** `docs/insightpulse/architecture/overview.md`
- **Original Skills:** `.claude/skills/` (deprecated, migrated to `agents/skills/`)
