# OpEx Docker Infrastructure

Production-ready Docker infrastructure for MCP coordinator and n8n workflow automation.

## Architecture

```
┌────────────────────────────────────────────────────────────┐
│                   Traefik Reverse Proxy                     │
│                  (TLS Termination + Routing)                │
└───────────┬────────────────────────┬───────────────────────┘
            │                        │
    ┌───────▼────────┐      ┌───────▼────────┐
    │ MCP Coordinator│      │     n8n        │
    │ Port: 3000     │      │  Port: 5678    │
    │ (Internal)     │      │  (Internal)    │
    └───────┬────────┘      └───────┬────────┘
            │                        │
            └────────┬───────────────┘
                     │
         ┌───────────▼──────────────┐
         │  Internal Network        │
         │  - Supabase              │
         │  - Odoo                  │
         │  - Superset              │
         └──────────────────────────┘
```

## Services

### MCP Coordinator
- **Domain**: `mcp.insightpulseai.net`
- **Purpose**: Model Context Protocol coordinator for AI tool integrations
- **Integrations**: Supabase, Odoo, Superset, OpenAI
- **Health Check**: `https://mcp.insightpulseai.net/health`

### n8n Workflow Automation
- **Domain**: `n8n.insightpulseai.net`
- **Purpose**: Workflow automation engine
- **Database**: SQLite (persistent volume)
- **Health Check**: `https://n8n.insightpulseai.net/healthz`

## Quick Start

### Prerequisites

1. **Traefik Reverse Proxy** running with:
   - External network `traefik_proxy`
   - LetsEncrypt certificate resolver
   - HTTPS entrypoint configured

2. **DNS Records** pointing to your server:
   ```
   mcp.insightpulseai.net  → A  <server-ip>
   n8n.insightpulseai.net  → A  <server-ip>
   ```

3. **Environment Files** configured:
   ```bash
   cp env/mcp.env.example env/mcp.env
   cp env/n8n.env.example env/n8n.env
   # Edit with your actual values
   ```

### Deployment

```bash
# 1. Create external Traefik network (if not exists)
docker network create traefik_proxy

# 2. Configure environment files
nano env/mcp.env
nano env/n8n.env

# 3. Start services
docker-compose -f docker-compose.mcp-n8n.yml up -d

# 4. Check logs
docker-compose -f docker-compose.mcp-n8n.yml logs -f

# 5. Verify health
curl -sf https://mcp.insightpulseai.net/health
curl -sf https://n8n.insightpulseai.net/healthz
```

### Import n8n Workflows

```bash
# 1. Access n8n web UI
open https://n8n.insightpulseai.net

# 2. Login with credentials from env/n8n.env

# 3. Import workflow
# - Click "Workflows" → "Add Workflow" → "Import from File"
# - Select: automation/n8n/workflows/supabase-alert-notifier.json
# - Activate workflow
```

## Configuration

### MCP Coordinator (`env/mcp.env`)

**Required Variables**:
```bash
SUPABASE_URL=https://ublqmilcjtpnflofprkr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-key>
ODOO_URL=https://erp.insightpulseai.net
OPENAI_API_KEY=<your-key>
```

**Optional Variables**:
```bash
LOG_LEVEL=info              # Logging verbosity
HEALTH_CHECK_INTERVAL=300   # Seconds between health checks
ALERT_WEBHOOK_URL=<url>     # Alert notification endpoint
```

### n8n (`env/n8n.env`)

**Required Variables**:
```bash
N8N_HOST=n8n.insightpulseai.net
N8N_ENCRYPTION_KEY=<random-32-char-key>
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=<strong-password>
```

**Supabase Integration**:
```bash
SUPABASE_URL=https://ublqmilcjtpnflofprkr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-key>
```

**Rocket.Chat Integration**:
```bash
ROCKETCHAT_WEBHOOK_URL=https://your.rocket.chat/hooks/<webhook-id>
```

## Workflows

### Supabase Alert Notifier

**Purpose**: Forward alerts from applications to Supabase Edge Function → Rocket.Chat

**Endpoint**: `https://n8n.insightpulseai.net/webhook/supabase-alert`

**Payload**:
```json
{
  "source": "nextjs-app",
  "level": "error",
  "text": "Build failed with 5 errors",
  "context": {
    "env": "production",
    "service": "docusaurus-build"
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Alert sent successfully",
  "timestamp": "2025-01-16T05:30:00Z"
}
```

**Testing**:
```bash
curl -X POST https://n8n.insightpulseai.net/webhook/supabase-alert \
  -H "Content-Type: application/json" \
  -d '{
    "source": "test",
    "level": "info",
    "text": "Test alert from n8n workflow",
    "context": {"test": true}
  }'
```

## Monitoring

### Health Checks

```bash
# MCP Coordinator
curl -sf https://mcp.insightpulseai.net/health | jq

# n8n
curl -sf https://n8n.insightpulseai.net/healthz
```

### Logs

```bash
# All services
docker-compose -f docker-compose.mcp-n8n.yml logs -f

# Specific service
docker logs mcp-coordinator -f
docker logs n8n -f

# Last 100 lines
docker logs --tail 100 n8n
```

### Resource Usage

```bash
# Container stats
docker stats mcp-coordinator n8n

# Disk usage
docker system df
docker volume ls
```

## Maintenance

### Backup

```bash
# n8n data (workflows + executions)
docker run --rm -v opex_n8n_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/n8n-backup-$(date +%Y%m%d).tar.gz /data

# MCP data
docker run --rm -v opex_mcp_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/mcp-backup-$(date +%Y%m%d).tar.gz /data
```

### Restore

```bash
# n8n data
docker run --rm -v opex_n8n_data:/data -v $(pwd):/backup \
  alpine sh -c "cd /data && tar xzf /backup/n8n-backup-20250116.tar.gz --strip 1"
```

### Update Services

```bash
# Pull latest images
docker-compose -f docker-compose.mcp-n8n.yml pull

# Restart with new images
docker-compose -f docker-compose.mcp-n8n.yml up -d

# Check logs for errors
docker-compose -f docker-compose.mcp-n8n.yml logs -f
```

### Clean Up

```bash
# Stop and remove containers
docker-compose -f docker-compose.mcp-n8n.yml down

# Remove volumes (CAUTION: deletes all data)
docker-compose -f docker-compose.mcp-n8n.yml down -v

# Clean up unused images
docker image prune -a
```

## Troubleshooting

### Services not accessible via HTTPS

**Check Traefik network**:
```bash
docker network inspect traefik_proxy
```

**Verify Traefik labels**:
```bash
docker inspect mcp-coordinator | grep traefik
docker inspect n8n | grep traefik
```

**Check Traefik logs**:
```bash
docker logs traefik -f
```

### n8n workflow not triggering

**Check webhook endpoint**:
```bash
curl -X POST https://n8n.insightpulseai.net/webhook/supabase-alert \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

**Check n8n execution logs**:
- Login to n8n UI
- Go to "Executions" tab
- Find recent execution
- Check error details

### MCP coordinator not connecting to services

**Check environment variables**:
```bash
docker exec mcp-coordinator env | grep SUPABASE
docker exec mcp-coordinator env | grep ODOO
```

**Test connectivity**:
```bash
docker exec mcp-coordinator curl -sf https://ublqmilcjtpnflofprkr.supabase.co
```

### Database connection errors

**Check Supabase credentials**:
```bash
# Test service role key
curl -sf https://ublqmilcjtpnflofprkr.supabase.co/rest/v1/ \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY"
```

**Check Odoo connection**:
```bash
curl -sf https://erp.insightpulseai.net/web/login
```

## Security Best Practices

1. **Secrets Management**:
   - Never commit `.env` files to git
   - Use strong passwords (≥16 characters)
   - Rotate API keys quarterly

2. **Network Security**:
   - Services only exposed via Traefik (HTTPS)
   - Internal network for service-to-service communication
   - No direct port exposure to internet

3. **Access Control**:
   - Enable n8n basic auth in production
   - Use service role keys (not anon keys) for backend
   - Implement IP whitelisting if needed

4. **Monitoring**:
   - Enable health checks
   - Monitor resource usage
   - Set up alerts for failures

## Next Steps

1. **Configure Traefik** (if not already done):
   - See `infra/traefik/` for Traefik setup
   - Ensure LetsEncrypt certificate resolver works

2. **Import Additional Workflows**:
   - Tax deadline notifier
   - Health check monitor
   - Document sync RAG

3. **Set up Monitoring**:
   - Prometheus + Grafana dashboards
   - Alert notifications to Rocket.Chat
   - Log aggregation with Loki

4. **Integrate with Odoo/Superset**:
   - Configure MCP coordinator connections
   - Test API integrations
   - Deploy custom workflows

## Related Documentation

- Alert System: `/lib/ALERT_SYSTEM.md`
- n8n Workflows: `/automation/n8n/workflows/`
- Traefik Setup: `/infra/traefik/README.md` (if exists)
- Supabase Integration: `/docs/OPEX_RAG_INTEGRATION.md`

---

**Last Updated**: 2025-01-16
**Status**: Production Ready
**Maintainer**: OpEx Team
