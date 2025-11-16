# Docker Infrastructure Deployment Checklist

Post-deployment validation checklist for MCP + n8n infrastructure.

## Pre-Deployment Requirements

- [ ] DNS records configured:
  - `mcp.insightpulseai.net` → Server IP
  - `n8n.insightpulseai.net` → Server IP
- [ ] Traefik proxy running with LetsEncrypt
- [ ] Environment files configured:
  - `infra/docker/env/mcp.env` (from template)
  - `infra/docker/env/n8n.env` (from template)

## Deployment Steps

### 1️⃣ Infrastructure Sanity Checks

```bash
cd /Users/tbwa/opex/infra/docker

# Check service status
docker compose -f docker-compose.mcp-n8n.yml ps

# Expected output:
# NAME              STATUS    PORTS
# mcp-coordinator   Up        (healthy)
# n8n               Up        (healthy)

# Check logs (30 second tail)
docker compose -f docker-compose.mcp-n8n.yml logs --tail 100 -f n8n mcp-coordinator
```

**Validation Criteria**:
- [ ] `mcp-coordinator` status: `Up (healthy)`
- [ ] `n8n` status: `Up (healthy)`
- [ ] No error logs in past 100 lines
- [ ] Valid TLS certs for both domains

### 2️⃣ Secrets & Configuration Alignment

#### Server Environment Files

**`infra/docker/env/mcp.env`**:
- [ ] `SUPABASE_URL=https://ublqmilcjtpnflofprkr.supabase.co`
- [ ] `SUPABASE_SERVICE_ROLE_KEY=<actual-key>`
- [ ] `ODOO_URL=https://erp.insightpulseai.net`
- [ ] `OPENAI_API_KEY=sk-<actual-key>`

**`infra/docker/env/n8n.env`**:
- [ ] `N8N_HOST=n8n.insightpulseai.net`
- [ ] `WEBHOOK_URL=https://n8n.insightpulseai.net/`
- [ ] `SUPABASE_URL=https://ublqmilcjtpnflofprkr.supabase.co`
- [ ] `SUPABASE_SERVICE_ROLE_KEY=<actual-key>`
- [ ] `ROCKETCHAT_WEBHOOK_URL=https://your.rocket.chat/hooks/<id>`
- [ ] `N8N_ENCRYPTION_KEY=<random-32-char-key>`
- [ ] `N8N_BASIC_AUTH_USER=<strong-username>`
- [ ] `N8N_BASIC_AUTH_PASSWORD=<strong-password>`

#### Supabase Vault

```bash
# Verify secret exists
supabase secrets list

# Should show:
# ROCKETCHAT_ALERT_WEBHOOK_URL
```

- [ ] `ROCKETCHAT_ALERT_WEBHOOK_URL` set in Vault
- [ ] `alert-notifier` Edge Function deployed
- [ ] Edge Function logs show no errors

#### Rocket.Chat

- [ ] Incoming webhook created for `#alerts` channel
- [ ] Webhook URL matches `ROCKETCHAT_ALERT_WEBHOOK_URL` in Supabase Vault
- [ ] Webhook is enabled and active

### 3️⃣ n8n Workflow Health

#### Import Workflow

```bash
# 1. Access n8n UI
open https://n8n.insightpulseai.net

# 2. Login with credentials from env/n8n.env
# 3. Import workflow:
#    - Workflows → Add Workflow → Import from File
#    - Select: automation/n8n/workflows/supabase-alert-notifier.json
# 4. Activate workflow (toggle in top-right)
```

- [ ] Workflow imported successfully
- [ ] Workflow activated (toggle shows "Active")
- [ ] Webhook URL visible: `https://n8n.insightpulseai.net/webhook/supabase-alert`

#### End-to-End Test

```bash
# Send test alert through n8n → Supabase → Rocket.Chat
curl -X POST https://n8n.insightpulseai.net/webhook/supabase-alert \
  -H "Content-Type: application/json" \
  -d '{
    "source": "infra-check",
    "level": "info",
    "text": "End-to-end alert pipeline is live ✅",
    "context": {
      "stack": "opex",
      "deployed_at": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
    }
  }'
```

**Expected Result**:
- [ ] HTTP 200 response with `{"success": true, ...}`
- [ ] n8n execution shows "Success" in UI
- [ ] Supabase `alert-notifier` function logs show successful call
- [ ] Message appears in Rocket.Chat `#alerts` channel
- [ ] Message formatting correct (level, source, text, context)

### 4️⃣ Next.js Integration

#### Vercel Environment Variables

```bash
# Add to Vercel project settings
vercel env add ALERT_NOTIFIER_URL production

# Value:
# https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/alert-notifier
# OR
# https://n8n.insightpulseai.net/webhook/supabase-alert
```

- [ ] `ALERT_NOTIFIER_URL` set in Vercel (Production)
- [ ] `ALERT_NOTIFIER_URL` set in Vercel (Preview)
- [ ] `ALERT_NOTIFIER_URL` set in `.env.local` (Development)

#### Test from Next.js App

```typescript
// In any API route or server component
import { logAlert } from '@/lib/logAlert'

await logAlert({
  source: 'opex-web',
  level: 'info',
  text: 'Next.js alert integration test',
  context: {
    route: '/api/test',
    timestamp: new Date().toISOString()
  }
})
```

- [ ] Alert sent successfully from Next.js
- [ ] Alert appears in Rocket.Chat
- [ ] No errors in Vercel function logs

### 5️⃣ Troubleshooting Runbook

**If alerts are silent but things are on fire:**

#### Step 1: Check Rocket.Chat
```bash
# Last message in #alerts channel?
# Any error spam?
# Webhook still enabled?
```

- [ ] Channel accessible
- [ ] Last message timestamp reasonable
- [ ] Webhook enabled in Rocket.Chat admin

#### Step 2: Check Supabase Edge Functions
```bash
# Supabase Dashboard → Edge Functions → alert-notifier → Logs
# Look for:
# - 500 errors (missing webhook URL)
# - 502 errors (Rocket.Chat unreachable)
# - Network timeouts
```

- [ ] No recent errors in function logs
- [ ] Function responding to requests
- [ ] Secrets accessible from function

#### Step 3: Check n8n Executions
```bash
# n8n UI → Executions tab
# Filter: Workflow = "supabase-alert-notifier"
# Look for:
# - Failed executions
# - HTTP errors calling Supabase
# - Webhook not triggering
```

- [ ] Recent executions visible
- [ ] No failed executions
- [ ] Webhook triggering correctly

#### Step 4: Check Docker Services
```bash
docker compose -f docker-compose.mcp-n8n.yml ps
docker logs --tail 100 n8n
docker logs --tail 100 mcp-coordinator
docker logs --tail 100 traefik
```

- [ ] All containers running
- [ ] No error logs
- [ ] Services healthy

#### Step 5: Check DNS/TLS
```bash
curl -v https://n8n.insightpulseai.net/healthz
curl -v https://mcp.insightpulseai.net/health

# Should return:
# - HTTP 200
# - Valid TLS certificate
# - No redirect errors
```

- [ ] DNS resolving correctly
- [ ] TLS certificates valid
- [ ] Health endpoints responding

## Health Check Script

**Create**: `infra/docker/health-check.sh`

```bash
#!/bin/bash
set -e

echo "🔍 OpEx Infrastructure Health Check"
echo "===================================="

# 1. Docker services
echo "1️⃣ Checking Docker services..."
docker compose -f docker-compose.mcp-n8n.yml ps

# 2. n8n health
echo "2️⃣ Checking n8n..."
curl -sf https://n8n.insightpulseai.net/healthz || echo "❌ n8n unhealthy"

# 3. MCP coordinator health
echo "3️⃣ Checking MCP coordinator..."
curl -sf https://mcp.insightpulseai.net/health || echo "❌ MCP unhealthy"

# 4. Supabase Edge Function
echo "4️⃣ Checking Supabase Edge Function..."
curl -sf -X POST https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/alert-notifier \
  -H "Content-Type: application/json" \
  -d '{"source":"health-check","level":"info","text":"Health check test"}' \
  || echo "❌ Edge Function unhealthy"

echo "✅ Health check complete!"
```

- [ ] Health check script created
- [ ] Script executable: `chmod +x health-check.sh`
- [ ] Script runs without errors

## Monitoring Setup (Optional)

### Prometheus Metrics
- [ ] MCP coordinator exposes `/metrics`
- [ ] n8n metrics enabled
- [ ] Prometheus scraping configured

### Grafana Dashboards
- [ ] n8n execution dashboard
- [ ] Alert delivery metrics
- [ ] Service health dashboard

### Alert Rules
- [ ] Alert on service down (>5 minutes)
- [ ] Alert on failed executions (>5 in 1 hour)
- [ ] Alert on high error rate (>10% in 5 minutes)

## Usage Examples

### Application Integration

```typescript
// API route error handling
catch (err) {
  await logAlert({
    level: 'error',
    source: 'opex-api',
    text: 'User registration failed',
    context: { error: err.message, userId }
  })
}

// Deployment notifications
await logAlert({
  level: 'info',
  source: 'vercel-deploy',
  text: 'Production deployment successful',
  context: { deploymentId, timestamp }
})

// Business metrics
await logAlert({
  level: 'warn',
  source: 'finance-ssc',
  text: 'Month-end close delayed',
  context: { period: 'Jan 2025', daysOverdue: 2 }
})
```

## Success Criteria

**Deployment is complete when:**

- ✅ All Docker services healthy
- ✅ TLS certificates valid for all domains
- ✅ n8n workflow imported and active
- ✅ End-to-end test successful (Next.js → n8n → Supabase → Rocket.Chat)
- ✅ Health check script passes
- ✅ Documentation reviewed
- ✅ Team notified of new infrastructure

## Rollback Plan

**If deployment fails:**

```bash
# 1. Stop services
docker compose -f docker-compose.mcp-n8n.yml down

# 2. Review logs
docker compose -f docker-compose.mcp-n8n.yml logs

# 3. Fix configuration issues

# 4. Redeploy
docker compose -f docker-compose.mcp-n8n.yml up -d
```

## Next Steps After Deployment

1. **Integrate with CI/CD**:
   - Add alert on build failures
   - Add alert on deployment success/failure
   - Add alert on test failures

2. **Expand Workflows**:
   - Tax deadline notifier
   - Health check monitor
   - Document sync RAG

3. **Set Up Monitoring**:
   - Prometheus + Grafana
   - Alert on anomalies
   - SLA tracking

4. **Document Runbooks**:
   - Incident response procedures
   - Escalation paths
   - Recovery procedures

---

**Last Updated**: 2025-01-16
**Status**: Production Checklist
**Owner**: OpEx DevOps Team
