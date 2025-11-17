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

---

## Finance Operations Skills

Specialized agents for month-end closing, BIR tax compliance, and CPA exam preparation.

### 7. **Finance Month-End Ops** (`finance-monthend-ops/`)
- **Role**: Orchestrator for month-end close and BIR tax filing
- **Focus**: 46-task month-end cycle coordination, BIR compliance, risk management
- **Capabilities**:
  - Month-end close coordination (Day 1–15)
  - BIR tax filing orchestration (1601-C, 2550Q, 1702-Q, etc.)
  - Role-based checklists (Accounting Staff → FS → SFM → FD)
  - Risk flagging and exception management
  - Integration with CPA learning (map tasks to exam topics)
- **Sub-Agents**: Delegates to ClosingTasksPlanner, TaxFilingScheduler, eBIRFormsHelper, CPATaxTutor

### 8. **Closing Tasks Planner** (`finance-closing-tasks-planner/`)
- **Role**: Task sequencing and checklist generation
- **Focus**: 46-task month-end process → day-by-day, role-specific plans
- **Capabilities**:
  - Query tasks by role, entity, date, category
  - Dependency resolution (Bank Rec → AP/AR → GL → Tax → Reporting)
  - SLA monitoring and overdue detection
  - Generate Gantt charts and calendars
  - Business day calculations (skip PH holidays)

### 9. **Tax Filing Scheduler** (`finance-tax-filing-scheduler/`)
- **Role**: BIR deadline computation and back-scheduling
- **Focus**: Philippine BIR forms (1601-C, 2550Q, 1702-Q, 1702, 0619-E)
- **Capabilities**:
  - Compute actual filing deadlines (adjust for weekends/holidays)
  - Back-schedule: Filing → Payment Approval (FD) → Report Approval (SFM) → Prep (FS)
  - Multi-period planning (monthly, quarterly, annual)
  - Conflict detection (multiple forms same day, holiday overlaps)
  - Risk flagging (urgent/high/medium/low priority)

### 10. **eBIRForms Helper** (`finance-ebirforms-helper/`)
- **Role**: BIR form field mapping and eFPS encoding guidance
- **Focus**: Form-specific expertise (1601-C, 2550Q, 1702-Q, 1702, 0619-E)
- **Capabilities**:
  - Map GL data to exact eFPS fields
  - Generate JSON payload templates ready for encoding
  - Validation (GL reconciliation, missing fields, logic checks)
  - Field-by-field guides with BIR references
  - Pre-flight checklists and supporting document requirements

### 11. **CPA Tax Tutor** (`finance-cpa-tax-tutor/`)
- **Role**: Map real work to CPA Taxation syllabus + generate study materials
- **Focus**: LECPA Taxation subject (Sections 1.0–12.0)
- **Capabilities**:
  - Task-to-topic mapping (e.g., 1601-C → Section 10.1 Withholding on Compensation)
  - Generate MCQs, computational problems, case studies
  - Explanation + coaching (BIR regulations, exam traps, memory aids)
  - Progress tracking (topics covered, weak areas, study plan)
  - Coverage heatmap (real work vs self-study)

## Architecture

### BPM + Finance Agent Ecosystem

```
┌──────────────────────────────────────────────────────────────────┐
│                 BPM Team Orchestrator                             │
│           (Routes tasks to BPM agents)                            │
└───┬─────┬─────┬─────┬─────┬───────────────────────────────────────┘
    │     │     │     │     │
    ▼     ▼     ▼     ▼     ▼
  Owner Manager Analyst AutoDev COO
    │     │     │     │     │
    └─────┴─────┴─────┴─────┘
            │
            ▼
    ┌─────────────────────────────────────────────────────┐
    │         Finance Month-End Ops Orchestrator           │
    │    (Coordinates month-end + tax + learning)          │
    └───┬─────────┬──────────┬──────────┬─────────────────┘
        │         │          │          │
        ▼         ▼          ▼          ▼
    Closing   Tax      eBIRForms    CPA Tax
    Tasks    Filing     Helper       Tutor
    Planner  Scheduler
        │         │          │          │
        └─────────┴──────────┴──────────┘
                  │
                  ▼
          ┌──────────────────┐
          │ Shared Resources │
          │ - Odoo Data      │
          │ - Supabase DB    │
          │ - Process Docs   │
          │ - BIR Docs (RAG) │
          │ - CPA Syllabus   │
          │ - Dashboards     │
          └──────────────────┘
```

### Finance Agent Workflow Example

```
User: "I'm Finance Supervisor for CKVC. It's Day 3. What should I do?"
           │
           ▼
  ┌────────────────────┐
  │ MonthEndOps Agent  │
  └────────┬───────────┘
           │ (delegates to)
           ▼
  ┌──────────────────────┐
  │ ClosingTasksPlanner  │ → Query: {role: FS, entity: CKVC, day: 3}
  └──────────┬───────────┘
             │
             ▼
  Returns: [AP Aging, AP Reconciliation, Review Aged Payables]
             │
             ▼
  ┌──────────────────────┐
  │   MonthEndOps        │ → Formats checklist
  │   (orchestrator)     │ → Adds risks/dependencies
  └──────────┬───────────┘ → Links to CPA topics
             │
             ▼
  ┌──────────────────────┐
  │   CPATaxTutor        │ → Maps: "AP Reconciliation" → FAR 3.2
  └──────────┬───────────┘ → Generates: 3 MCQs on accounts payable
             │
             ▼
      User receives:
      - Day 3 checklist (3 tasks, 9h total)
      - Risk: Resource conflict warning
      - Learning: "This covers FAR 3.2 + 5 practice questions"
```

## Usage

### BPM Skills

#### Standalone Agent
```bash
# Invoke a specific BPM agent directly
claude --skill bpm-analyst "Analyze month-end closing process for bottlenecks"
```

#### Orchestrated Team
```bash
# Let orchestrator route to appropriate agent(s)
claude --skill bpm-team-orchestrator "Optimize BIR filing across all agencies"
```

### Finance Skills

#### Month-End Operations
```bash
# Generate role-specific checklist
claude --skill finance-monthend-ops "Generate October 2025 close checklist for Finance Supervisor (RIM)"

# Check BIR deadlines
claude --skill finance-monthend-ops "What BIR forms are due in the next 14 days?"

# Map task to CPA topics
claude --skill finance-monthend-ops "I just completed 'Calculate Monthly Depreciation' - what CPA topics does this cover?"
```

#### Task Planning
```bash
# Get tasks for specific day
claude --skill finance-closing-tasks-planner "Show all tasks due on Day 3 of month-end close"

# Check overdue items
claude --skill finance-closing-tasks-planner "List all overdue tasks as of Day 5"

# View by category
claude --skill finance-closing-tasks-planner "Show all Tax category tasks for October close"
```

#### Tax Filing
```bash
# Upcoming filings
claude --skill finance-tax-filing-scheduler "What BIR forms are due in the next 30 days?"

# Full year calendar
claude --skill finance-tax-filing-scheduler "Generate full 2026 BIR filing calendar"

# Back-schedule specific form
claude --skill finance-tax-filing-scheduler "Back-schedule 2550Q for Q1 2026"
```

#### eBIRForms Help
```bash
# Generate form payload
claude --skill finance-ebirforms-helper "Generate 1601-C payload template for November 2025 (CKVC)"

# Field-level guidance
claude --skill finance-ebirforms-helper "How do I fill out Form 2550Q Schedule 1?"

# Validation
claude --skill finance-ebirforms-helper "Validate my 1601-C data before filing"
```

#### CPA Exam Prep
```bash
# Map task to syllabus
claude --skill finance-cpa-tax-tutor "I just prepared Form 1601-C. What CPA topics does this cover?"

# Generate practice questions
claude --skill finance-cpa-tax-tutor "Generate 5 MCQs on withholding tax, moderate difficulty"

# Study recommendations
claude --skill finance-cpa-tax-tutor "What should I study next based on my recent work?"
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

## Database Setup (Finance Skills)

The finance agents require a normalized database schema. Run the migration to set up tables:

```bash
# Apply Supabase migration
cd supabase
supabase db push

# Or manually apply the SQL migration
psql $DATABASE_URL < supabase/migrations/002_finance_ops_schema.sql
```

### Key Tables Created
- **opex.closing_tasks** - Master task list (46 tasks)
- **opex.closing_task_instances** - Period-specific task tracking (e.g., Oct 2025 close for RIM)
- **opex.bir_forms** - BIR form catalog
- **opex.bir_filing_schedule** - Computed deadlines with back-scheduling
- **opex.cpa_subjects** & **opex.cpa_syllabus_topics** - CPA exam syllabus
- **opex.cpa_study_progress** - User study tracking
- **opex.ph_holidays** - Philippine holiday calendar for business day calculations

### Seed Data (Initial Load)

```bash
# Load month-end tasks from CSV
psql $DATABASE_URL <<EOF
COPY opex.closing_tasks(task_name, owner_role_code, responsible_role, due_day, sla_hours, status, evidence_required, bir_form, description)
FROM '/path/to/notion_exports/01_month_end_tasks.csv'
WITH (FORMAT CSV, HEADER TRUE);
EOF

# Load BIR filing schedule from CSV
psql $DATABASE_URL <<EOF
COPY opex.bir_filing_schedule(form_code, period_label, filing_deadline, prep_date, approval_sfm_date, approval_fd_date)
FROM '/path/to/notion_exports/02_bir_filing_schedule.csv'
WITH (FORMAT CSV, HEADER TRUE);
EOF
```

Or use a seed script (recommended):
```typescript
// scripts/seed-finance-data.ts
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import Papa from 'papaparse';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// Parse and insert month-end tasks
const tasksCSV = fs.readFileSync('notion_exports/01_month_end_tasks.csv', 'utf8');
const tasksData = Papa.parse(tasksCSV, { header: true });
await supabase.from('closing_tasks').insert(tasksData.data);

// Parse and insert BIR schedule
const birCSV = fs.readFileSync('notion_exports/02_bir_filing_schedule.csv', 'utf8');
const birData = Papa.parse(birCSV, { header: true });
await supabase.from('bir_filing_schedule').insert(birData.data);
```

## Development

### Adding a New Agent Skill
1. Create directory: `skills/new-role/`
2. Define role in `agent.md`
3. Specify tools in `tools.json` (optional)
4. Add domain knowledge in `knowledge.md` (optional)
5. Update orchestrator routing logic

### Adding a New Finance Agent
1. Follow standard skill structure above
2. Define input/output contracts (JSON schemas)
3. Map to database tables (if applicable)
4. Integrate with parent orchestrator (MonthEndOps)
5. Add usage examples to README

### Testing
```bash
# Test individual BPM agent
python -m skills.bpm_analyst.test

# Test orchestrator
python -m skills.bpm_team_orchestrator.test

# Test finance agents (TypeScript/Node)
pnpm test:finance-agents

# Test specific finance skill
node --loader ts-node/esm scripts/test-closing-planner.ts
```

## License
MIT
