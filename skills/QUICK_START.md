# BPM Agent Skills - Quick Start

## What Are These?

Independent AI agent skills for each BPM role in your Finance SSC operations. Think of them as specialized AI team members who handle different aspects of business process management.

## The Team

| Agent | Role | When to Use |
|-------|------|-------------|
| **Process Owner** | Agency Finance Director | Review KPIs, approve changes, strategic decisions |
| **Process Manager** | Operations coordinator (your role, Jake) | Daily monitoring, cross-agency coordination, implementation |
| **Analyst** | Process improvement specialist | Find bottlenecks, calculate ROI, root cause analysis |
| **Automation Developer** | Technical builder | Build Odoo modules, MCP servers, integrations |
| **COO** | Executive oversight | Strategic initiatives, policy decisions, conflict resolution |
| **Orchestrator** | Smart router | Route complex requests to right agent(s) |

## 5-Minute Start

### 1. Test a Single Agent

```bash
# Check process status (Process Manager)
claude --skill bpm-process-manager "Show me month-end closing status for all agencies"

# Analyze for improvements (Analyst)
claude --skill bpm-analyst "Analyze bank reconciliation for automation opportunities"

# Review performance (Process Owner)
claude --skill bpm-process-owner "Show BIR filing KPIs for AGENCY1 last month"
```

### 2. Use the Orchestrator (Recommended)

```bash
# Let it figure out the right agent
claude --skill bpm-team-orchestrator "I want to automate invoice processing. Analyze ROI and build it if viable."
```

The orchestrator will:
1. Route to **Analyst** → Calculate ROI
2. Route to **Process Owner** → Approve/reject based on ROI
3. Route to **Automation Developer** → Build the solution
4. Route to **Process Manager** → Coordinate rollout

### 3. Integrate with Voice Agent

Add to your `voice_agent.py`:

```python
from skills.bpm_team_orchestrator import route_bpm_request

@function_tool
def bpm_query(query: str) -> str:
    """Answer BPM questions."""
    return route_bpm_request(query)
```

Now ask vocally:
- "What's the status of our month-end closing?"
- "Calculate ROI for automating bank rec"
- "Show me BIR filing performance"

## Common Tasks

### Daily Operations
```bash
# Morning status check
claude --skill bpm-process-manager "Show overnight process runs and failures"

# Investigate issue
claude --skill bpm-process-manager "AGENCY3 is blocked on month-end. Investigate."
```

### Process Analysis
```bash
# Find bottlenecks
claude --skill bpm-analyst "Analyze bank rec process for bottlenecks"

# Calculate ROI
claude --skill bpm-analyst "ROI for automating invoice processing. Current: 10 hrs/month manual"

# Root cause
claude --skill bpm-analyst "BIR errors increased from 2% to 5%. Why?"
```

### Automation
```bash
# Build Odoo module
claude --skill bpm-automation-dev "Build automated bank reconciliation module for Odoo"

# Create MCP server
claude --skill bpm-automation-dev "Create MCP server for Claude agents to query Odoo accounting data"
```

### Strategic Decisions
```bash
# Approve initiative
claude --skill bpm-coo "Approve enterprise Odoo upgrade + automation project (₱2.5M)"

# Resolve conflict
claude --skill bpm-coo "AGENCY3 and AGENCY5 disagree on transfer process. Resolve."
```

## Architecture

```
You (Jake)
    ↓
┌───────────────────────┐
│  BPM Orchestrator     │ ← Smart router
└───────┬───────────────┘
        ├─→ Process Owner (KPIs, approvals)
        ├─→ Process Manager (operations)
        ├─→ Analyst (analysis, ROI)
        ├─→ Auto Developer (build stuff)
        └─→ COO (strategic)
            ↓
    ┌──────────────────┐
    │ Shared Resources │
    │ - Odoo          │
    │ - Supabase      │
    │ - Superset      │
    └──────────────────┘
```

## Configuration

Set up environment variables:

```bash
# .env
ODOO_URL=https://odoo.agency.gov.ph
ODOO_DATABASE=finance_ssc
ODOO_API_KEY=your-key

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-key

SUPERSET_URL=https://analytics.agency.gov.ph
SUPERSET_API_KEY=your-key

SLACK_WEBHOOK=https://hooks.slack.com/...
```

## Next Steps

1. ✅ **Test**: Try the orchestrator with a simple query
2. ✅ **Integrate**: Add to your voice agent
3. ✅ **Automate**: Schedule daily status reports
4. ✅ **Customize**: Add your own specialized agents
5. ✅ **Scale**: Use across all 8 agencies

## Full Documentation

- **Complete Guide**: `USAGE_GUIDE.md`
- **Framework Overview**: `README.md`
- **Implementation**: `implementation_example.py`
- **Individual Agents**: See `skills/[agent-name]/agent.md`

## Support

Questions? Check:
- Individual agent docs: `skills/[agent-name]/agent.md`
- Usage guide: `USAGE_GUIDE.md`
- Implementation example: `implementation_example.py`

---

**TL;DR**: These are AI agents for each BPM role. Use the orchestrator (`bpm-team-orchestrator`) for most tasks—it routes to the right specialist automatically. Integrate with your voice agent for hands-free operation.
