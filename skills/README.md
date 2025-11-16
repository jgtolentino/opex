# BPM Agent Skills Framework

Independent AI agent skills for Business Process Management roles in Finance SSC operations.

## Overview

This framework provides specialized AI sub-agents for each BPM role, enabling distributed process management across eight agencies (RIM, CKVC, BOM, etc.) with automation-first approaches.

## Agent Skills

### 1. **BPM Process Owner** (`bpm-process-owner/`)
- **Role**: Agency Finance Directors who own their processes
- **Focus**: End-to-end process ownership, performance accountability
- **Capabilities**: Process definition, KPI monitoring, stakeholder management

### 2. **BPM Process Manager** (`bpm-process-manager/`)
- **Role**: Cross-agency coordination (Jake's role)
- **Focus**: Standardization, integration, resource allocation
- **Capabilities**: Process orchestration, conflict resolution, change management

### 3. **BPM Analyst** (`bpm-analyst/`)
- **Role**: Identify automation opportunities
- **Focus**: Process analysis, bottleneck identification, improvement proposals
- **Capabilities**: Data analysis, process mapping, ROI calculation

### 4. **BPM Automation Developer** (`bpm-automation-dev/`)
- **Role**: Build automation solutions
- **Focus**: Technical implementation (Odoo modules, MCP servers, CI/CD)
- **Capabilities**: Code generation, integration development, testing automation

### 5. **BPM COO/Process Excellence** (`bpm-coo/`)
- **Role**: Enterprise-wide oversight
- **Focus**: Strategic alignment, governance, executive reporting
- **Capabilities**: Portfolio management, risk assessment, compliance monitoring

### 6. **BPM Team Orchestrator** (`bpm-team-orchestrator/`)
- **Role**: Coordinate all BPM agents
- **Focus**: Task routing, collaboration, unified reporting
- **Capabilities**: Agent delegation, dependency management, consolidated insights

### 7. **Designer Mentor** (`designer-mentor/`)
- **Role**: Enterprise UX/UI design mentor and component playground
- **Focus**: Mobile-first design, design systems, developer handoff
- **Capabilities**: Workflow → screen translation, component recommendations (Fiori/HIG/Material), accessibility-first design, implementation-ready specs

## Architecture

```
┌─────────────────────────────────────────────────────┐
│         BPM Team Orchestrator                       │
│  (Routes tasks to appropriate agent)                │
└───┬─────┬─────┬─────┬─────┬────────────────────────┘
    │     │     │     │     │
    ▼     ▼     ▼     ▼     ▼
  Owner Manager Analyst AutoDev COO
    │     │     │     │     │
    └─────┴─────┴─────┴─────┘
            │
            ▼
    ┌─────────────────┐
    │ Shared Resources│
    │ - Odoo Data     │
    │ - Process Docs  │
    │ - Audit Logs    │
    │ - Dashboards    │
    └─────────────────┘
```

## Usage

### Standalone Agent
```bash
# Invoke a specific BPM agent directly
claude --skill bpm-analyst "Analyze month-end closing process for bottlenecks"
```

### Orchestrated Team
```bash
# Let orchestrator route to appropriate agent(s)
claude --skill bpm-team-orchestrator "Optimize BIR filing across all agencies"
```

### Integration with Voice Agent
```python
from skills.bpm_analyst import BPMAnalystAgent
from skills.bpm_automation_dev import AutomationDevAgent

# Voice command triggers agent collaboration
analyst_findings = BPMAnalystAgent.analyze("reconciliation process")
AutomationDevAgent.implement(analyst_findings.recommendations)
```

## Configuration

Each skill directory contains:
- `agent.md` - Role definition and instructions
- `tools.json` - Available functions/APIs
- `knowledge.md` - Domain-specific context
- `examples.md` - Sample interactions

## Finance SSC Context

**Eight Agencies Under Management:**
- RIM (Research Institute for Mindanao)
- CKVC (Center for Knowledge and Value Creation)
- BOM (Business Operations Management)
- [Add other 5 agencies]

**Core Processes:**
- Month-end closing
- BIR filing and compliance
- Bank reconciliation
- Inter-agency transactions
- Budget tracking and reporting

**Automation Stack:**
- **Backend**: Odoo CE (accounting, procurement)
- **Analytics**: Apache Superset
- **OCR**: PaddleOCR (document processing)
- **Database**: Supabase (PostgreSQL)
- **Voice**: OpenAI Agents SDK
- **Orchestration**: Claude MCP servers

## Development

### Adding a New Agent Skill
1. Create directory: `skills/new-role/`
2. Define role in `agent.md`
3. Specify tools in `tools.json`
4. Add domain knowledge in `knowledge.md`
5. Update orchestrator routing logic

### Testing
```bash
# Test individual agent
python -m skills.bpm_analyst.test

# Test orchestrator
python -m skills.bpm_team_orchestrator.test
```

## License
MIT
