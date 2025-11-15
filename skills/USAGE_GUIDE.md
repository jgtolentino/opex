# BPM Agent Skills Usage Guide

## Quick Start

### Standalone Agent Invocation
Use when you know exactly which agent you need:

```bash
# Analyze a process for bottlenecks
claude --skill bpm-analyst "Analyze bank reconciliation process for automation opportunities"

# Check operational status
claude --skill bpm-process-manager "What's the status of month-end closing across all agencies?"

# Review KPIs as Process Owner
claude --skill bpm-process-owner "Show me BIR filing performance for AGENCY1 last quarter"

# Build automation
claude --skill bpm-automation-dev "Create Odoo module for automated bank reconciliation"

# Strategic decision
claude --skill bpm-coo "Approve enterprise-wide process standardization initiative"
```

### Orchestrated Team (Recommended)
Let the orchestrator route to the right agent(s):

```bash
# The orchestrator will analyze and route appropriately
claude --skill bpm-team-orchestrator "I want to improve our invoice processing. What are the bottlenecks and how can we automate them?"
```

## Integration with Voice Agent

Add BPM agent skills to your voice agent for spoken queries:

```python
# voice_agent.py
from openai_agents import Agent, function_tool
from skills.bpm_team_orchestrator import BPMOrchestrator

@function_tool
def bpm_query(query: str) -> str:
    """Route BPM queries to appropriate agent."""
    orchestrator = BPMOrchestrator()
    return orchestrator.route(query)

voice_agent = Agent(
    # ... existing config
    tools=[
        # ... existing tools
        bpm_query,
    ]
)
```

Now you can ask vocally:
- "What's the status of our month-end closing?"
- "Analyze our BIR filing process for automation opportunities"
- "Show me the ROI for automating bank reconciliation"

## Common Use Cases

### 1. Daily Operations (Process Manager)

**Morning Status Check**:
```bash
claude --skill bpm-process-manager "Show me overnight process runs and any failures"
```

**Operational Intervention**:
```bash
claude --skill bpm-process-manager "AGENCY3 month-end closing is blocked. Investigate and resolve."
```

**Cross-Agency Coordination**:
```bash
claude --skill bpm-process-manager "Coordinate all agencies to adopt standardized BIR filing by end of month"
```

### 2. Performance Review (Process Owner)

**KPI Dashboard**:
```bash
claude --skill bpm-process-owner "Review month-end closing KPIs for AGENCY1 last month"
```

**Approve Changes**:
```bash
claude --skill bpm-process-owner "Review and approve automation proposal CR-2025-043 for OCR invoice processing"
```

**Escalate Issues**:
```bash
claude --skill bpm-process-owner "Budget variance is 15% for AGENCY1. Escalate to COO with recommendation."
```

### 3. Process Analysis (Analyst)

**Bottleneck Analysis**:
```bash
claude --skill bpm-analyst "Analyze bank reconciliation process. Identify bottlenecks and automation opportunities."
```

**ROI Calculation**:
```bash
claude --skill bpm-analyst "Calculate ROI for automating invoice processing with OCR. Current manual time: 10 hours/month."
```

**Root Cause Analysis**:
```bash
claude --skill bpm-analyst "BIR filing error rate increased from 2% to 5%. Perform root cause analysis."
```

### 4. Automation Development (Developer)

**Build Odoo Module**:
```bash
claude --skill bpm-automation-dev "Build Odoo module for automated 3-way matching (PO-GR-Invoice)"
```

**Create MCP Server**:
```bash
claude --skill bpm-automation-dev "Create MCP server to expose Odoo accounting data to Claude agents"
```

**Optimize Performance**:
```bash
claude --skill bpm-automation-dev "Bank reconciliation job is taking 15 minutes. Optimize to under 2 minutes."
```

### 5. Strategic Decisions (COO)

**Approve Initiative**:
```bash
claude --skill bpm-coo "Review and approve enterprise-wide Odoo upgrade + automation project (₱2.5M budget)"
```

**Resolve Conflicts**:
```bash
claude --skill bpm-coo "AGENCY3 and AGENCY5 disagree on inter-agency transfer process. Resolve."
```

**Set Policy**:
```bash
claude --skill bpm-coo "Establish policy: All processes must achieve 80% automation coverage by Q4 2025"
```

## Multi-Agent Workflows

### Example 1: End-to-End Automation Implementation

**User Request**: "Automate our bank reconciliation process"

**Orchestrator Workflow**:
```
Step 1: Analyst
  → Analyze current process
  → Calculate ROI
  → Define requirements
  → Output: "ROI is 2.2 months, 69% time savings. Requirements documented."

Step 2: Process Owner
  → Review analyst findings
  → Approve/reject initiative
  → Output: "APPROVED with pilot program condition"

Step 3: Automation Developer
  → Build Odoo module based on requirements
  → Create test suite
  → Output: "Module built, ready for pilot"

Step 4: Process Manager
  → Coordinate pilot with AGENCY1
  → Monitor results
  → Roll out to remaining agencies
  → Output: "Pilot successful. Rolled out to all 8 agencies."

Final Result: Automation implemented, 69% time savings realized.
```

**Command**:
```bash
claude --skill bpm-team-orchestrator "Automate our bank reconciliation process end-to-end"
```

### Example 2: Performance Issue Resolution

**User Request**: "BIR filing errors increased to 5%. Fix this."

**Orchestrator Workflow**:
```
Step 1: Process Manager
  → Triage issue
  → Collect recent error data
  → Output: "12 errors in November, pattern identified: tax calculation errors"

Step 2: Analyst
  → Root cause analysis
  → Identify source: Odoo config issue after upgrade
  → Output: "Root cause: Wrong tax rates in Odoo config for AGENCY2 and AGENCY4"

Step 3: Automation Developer
  → Fix Odoo configuration
  → Add validation rules
  → Test fixes
  → Output: "Config fixed, validation rules added to prevent recurrence"

Step 4: Process Manager
  → Deploy fix to production
  → Monitor next filing cycle
  → Output: "Error rate back to <1% baseline"

Final Result: Issue resolved, preventive controls added.
```

**Command**:
```bash
claude --skill bpm-team-orchestrator "BIR filing error rate increased to 5%. Investigate and fix."
```

## Integration Patterns

### Pattern 1: Voice Agent → BPM Orchestrator

```python
# File: voice_agent.py

from skills.bpm_team_orchestrator import route_bpm_request

@function_tool
def bpm_assistant(query: str) -> str:
    """Handle BPM-related queries through orchestrator."""
    return route_bpm_request(query)

# Usage via voice:
# User speaks: "What's the status of month-end closing?"
# Voice agent calls: bpm_assistant("status of month-end closing")
# Orchestrator routes to: Process Manager
# Response spoken back to user
```

### Pattern 2: Scheduled Status Reports

```python
# File: scheduled_tasks.py

from skills.bpm_process_manager import ProcessManager
import schedule

def daily_status_report():
    """Generate and send daily operational status."""
    manager = ProcessManager()
    report = manager.generate_status_report(
        period="daily",
        format="executive-summary",
        recipients=["process-owners@agency.gov.ph"]
    )
    # Send via email or Slack
    send_email(report)

# Run every weekday at 8 AM
schedule.every().monday.at("08:00").do(daily_status_report)
schedule.every().tuesday.at("08:00").do(daily_status_report)
# ... etc
```

### Pattern 3: Event-Driven Agent Triggers

```python
# File: event_handlers.py

from skills.bpm_analyst import Analyst
from skills.bpm_process_manager import ProcessManager

def on_process_failure(process_name, agency, error):
    """Triggered when a process fails."""
    # Immediate intervention by Manager
    manager = ProcessManager()
    manager.intervene_in_process(
        process_id=process_name,
        intervention_type="investigate",
        reason=f"Automated failure detection: {error}"
    )

    # Request analysis if pattern detected
    if is_recurring_failure(process_name, agency):
        analyst = Analyst()
        analyst.analyze_process(
            process_name=process_name,
            focus_areas=["root-cause-analysis", "error-reduction"]
        )

# Wire up to Odoo/Supabase event system
supabase.on("process_execution_log", on_process_failure)
```

## Configuration

### Agent Configuration Files

Each agent can be configured via JSON:

**Example: `skills/bpm-process-manager/config.json`**
```json
{
  "agent_id": "process-manager-jake",
  "name": "Finance SSC Process Manager",
  "odoo_connection": {
    "url": "https://odoo.agency.gov.ph",
    "database": "finance_ssc",
    "api_key_env": "ODOO_API_KEY"
  },
  "supabase_connection": {
    "url_env": "SUPABASE_URL",
    "key_env": "SUPABASE_KEY"
  },
  "notification_channels": {
    "slack_webhook": "https://hooks.slack.com/services/...",
    "email_smtp": "smtp.agency.gov.ph"
  },
  "monitoring": {
    "refresh_interval": 60,
    "alert_thresholds": {
      "error_rate": 0.05,
      "cycle_time_variance": 0.2
    }
  }
}
```

### Environment Variables

```bash
# .env file
ODOO_URL=https://odoo.agency.gov.ph
ODOO_DATABASE=finance_ssc
ODOO_API_KEY=your-api-key-here

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-key

SUPERSET_URL=https://analytics.agency.gov.ph
SUPERSET_API_KEY=your-superset-key

SLACK_WEBHOOK=https://hooks.slack.com/services/...

OPENAI_API_KEY=sk-your-openai-key  # For voice agent integration
```

## Best Practices

### 1. Use the Orchestrator for Complex Requests
Instead of manually chaining agent calls, let the orchestrator handle routing:

❌ **Don't do this**:
```bash
claude --skill bpm-analyst "Analyze bank rec"
# Wait for result...
claude --skill bpm-automation-dev "Build module based on analysis"
# Wait for result...
claude --skill bpm-process-manager "Roll out to all agencies"
```

✅ **Do this**:
```bash
claude --skill bpm-team-orchestrator "Analyze bank rec, build automation, and roll out to all agencies"
```

### 2. Provide Context for Better Results

❌ **Vague**:
```bash
claude --skill bpm-analyst "Analyze the process"
```

✅ **Specific**:
```bash
claude --skill bpm-analyst "Analyze bank reconciliation process for AGENCY1. Focus on bottlenecks and automation opportunities. Current manual time: 38 minutes per account."
```

### 3. Use Appropriate Agent for Task

| Task | Use Agent | NOT |
|------|-----------|-----|
| Daily monitoring | Process Manager | Process Owner |
| KPI review | Process Owner | Process Manager |
| Technical build | Automation Developer | Analyst |
| ROI calculation | Analyst | Process Owner |
| Strategic approval | COO | Process Owner |

### 4. Leverage Voice Agent for Quick Queries

For quick status checks, use voice:
```
"Hey Claude, what's the status of month-end closing?"
(Much faster than typing the command)
```

### 5. Automate Recurring Reports

Don't manually request the same report daily. Schedule it:
```python
# Auto-generate and email daily status report
schedule.every().weekday.at("08:00").do(
    lambda: ProcessManager().generate_status_report(period="daily")
)
```

## Troubleshooting

### Issue: "Agent not found"
**Cause**: Agent skill not properly installed or path incorrect
**Solution**:
```bash
# Check agent exists
ls skills/bpm-analyst/

# Verify agent.md file exists
ls skills/bpm-analyst/agent.md
```

### Issue: "Tool execution failed"
**Cause**: Missing configuration (Odoo URL, API keys, etc.)
**Solution**:
```bash
# Check environment variables
echo $ODOO_URL
echo $ODOO_API_KEY

# Verify config file
cat skills/bpm-process-manager/config.json
```

### Issue: "Orchestrator routed to wrong agent"
**Cause**: Ambiguous request or unclear intent
**Solution**: Be more specific in your request:
```bash
# Instead of: "Check status"
# Use: "Check real-time operational status of BIR filing across all agencies"
```

### Issue: "Response too slow"
**Cause**: Complex multi-agent workflow
**Solution**:
1. Check if agents are running in parallel (should be)
2. Consider breaking into multiple requests
3. Use async mode for long-running tasks

## Advanced Usage

### Custom Agent Development

Create your own specialized agent:

```bash
# 1. Create directory structure
mkdir -p skills/my-custom-agent

# 2. Create agent definition
cat > skills/my-custom-agent/agent.md << 'EOF'
# My Custom Agent
...your agent instructions...
EOF

# 3. Create tools definition
cat > skills/my-custom-agent/tools.json << 'EOF'
{
  "agent_name": "My Custom Agent",
  "tools": [...]
}
EOF

# 4. Add to orchestrator routing
# Edit: skills/bpm-team-orchestrator/agent.md
```

### Agent Collaboration

Have agents collaborate directly:

```python
from skills.bpm_analyst import Analyst
from skills.bpm_automation_dev import AutomationDeveloper

# Analyst generates requirements
analyst = Analyst()
requirements = analyst.analyze_process(
    process_name="invoice-processing",
    focus_areas=["automation-opportunities"]
)

# Developer builds based on analyst's requirements
developer = AutomationDeveloper()
module = developer.develop_odoo_module(
    requirements=requirements,
    specifications={"test_coverage": 0.85}
)
```

## Next Steps

1. **Start Simple**: Use individual agents for specific tasks
2. **Learn Orchestration**: Graduate to using orchestrator for complex workflows
3. **Integrate Voice**: Add to voice agent for hands-free operation
4. **Automate**: Schedule recurring reports and monitoring
5. **Customize**: Create your own specialized agents as needed

## Support

- **Documentation**: `/skills/README.md`
- **Examples**: Each agent has `examples.md` (coming soon)
- **Issues**: Report via GitHub issues or Slack #bpm-automation

---

**Remember**: These agents are tools to enhance your BPM capabilities. Start with what you need, expand as you grow comfortable. The orchestrator is your friend for complex tasks!
