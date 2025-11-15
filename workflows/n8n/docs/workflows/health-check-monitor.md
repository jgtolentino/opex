# Service Health Check Monitor Workflow

Continuous infrastructure monitoring with automated alerting.

## Overview

**File**: `health-check-monitor.json`
**Trigger**: Cron (Every 10 minutes)
**Purpose**: Proactive service monitoring without full observability stack

## Flow

```
Cron (10 min) → Check 4 Services in Parallel → Merge Results →
Evaluate Health → Filter Issues → Format Alert → Post to Mattermost + GitHub Issue
```

## Services Monitored

1. **MCP Service**: `https://mcp.insightpulseai.net/health`
2. **ERP (Odoo)**: `https://erp.insightpulseai.net/web/health`
3. **OCR Service**: `https://ade-ocr-backend-d9dru.ondigitalocean.app/health`
4. **n8n Self**: `https://ipa.insightpulseai.net/healthz`

## Nodes

1. **Every 10 Minutes**: Cron trigger
2. **Check [Service]**: 4 parallel HTTP requests (timeout: 5s)
3. **Merge All Checks**: Combine results
4. **Evaluate Health**: JavaScript code to detect failures/slow responses
5. **Has Issues?**: Filter if any service down or slow (>500ms)
6. **Format Alert Message**: Create detailed alert
7. **Post to Mattermost**: Send to `#ops-alerts`
8. **Create GitHub Issue**: (Optional) Create tracking issue

## Configuration

### Credentials
- **Optional**: Supabase (for logging)
- Mattermost Webhook
- GitHub PAT (for issue creation)

### Health Check Logic

```javascript
const services = [
  { name: 'MCP', result: $input.first().json },
  { name: 'ERP (Odoo)', result: $input.all()[1]?.json },
  { name: 'OCR Service', result: $input.all()[2]?.json },
  { name: 'n8n', result: $input.all()[3]?.json }
];

const failures = [];
const warnings = [];

services.forEach(service => {
  if (!service.result || service.result.error) {
    failures.push({
      service: service.name,
      status: 'DOWN',
      error: service.result?.error || 'No response'
    });
  } else if (service.result.responseTime > 500) {
    warnings.push({
      service: service.name,
      status: 'SLOW',
      responseTime: service.result.responseTime
    });
  }
});

return {
  failures: failures,
  warnings: warnings,
  hasIssues: failures.length > 0 || warnings.length > 0
};
```

## Alert Format

```
🚨 **Service Health Alert** 🚨

**Summary**: 2 down, 1 slow
**Time**: 2025-11-15T10:30:00Z

**Services Down**:
- ❌ OCR Service: Connection timeout
- ❌ MCP: HTTP 500

**Performance Warnings**:
- ⚠️ ERP (Odoo): 850ms (threshold: 500ms)

[View Monitoring Dashboard](https://ipa.insightpulseai.net/monitoring)
```

## Customization

### Add More Services
```javascript
// In workflow, duplicate "Check Service" node
// Update URL and merge inputs

### Change Thresholds
```javascript
// In "Evaluate Health" node
const SLOW_THRESHOLD = 1000; // 1 second instead of 500ms
```

### Disable GitHub Issue Creation
Simply disconnect the "Create GitHub Issue" node.

## Analytics

Track uptime in Supabase:
```sql
CREATE TABLE service_health_log (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  service TEXT NOT NULL,
  status TEXT NOT NULL, -- 'up' | 'down' | 'slow'
  response_time_ms INTEGER,
  error_message TEXT
);
```
