# Credentials Configuration Guide

Complete reference for setting up all required credentials in n8n for OpEx workflows.

## Overview

OpEx workflows require 3 types of credentials:
1. **Supabase** - Database and Edge Functions access
2. **Mattermost** - Notification and chat integration
3. **GitHub** - (Optional) Automated issue creation

---

## 1. Supabase Credentials

### 1.1 Service Role Key (Admin Operations)

**Purpose**: Full database access for admin operations

**Use Cases**:
- Tax deadline queries (read `tax_calendar` table)
- Embedding source management
- Notification logging
- RAG analytics

**Configuration**:
1. n8n → **Settings** → **Credentials**
2. **Add Credential** → **Header Auth**
3. **Name**: `Supabase OpEx (Service Role)`
4. **Header Name**: `apikey`
5. **Header Value**: Paste service role key

**Get Service Role Key**:
```bash
# From ~/.zshrc
echo $OPEX_SUPABASE_SERVICE_ROLE_KEY
```

**Security Note**: 🔒 Never expose service role key in client-side code or public repositories.

---

### 1.2 Anon Key (Public Operations)

**Purpose**: Limited access for public RAG queries

**Use Cases**:
- Public RAG queries (RLS enforced)
- Read-only operations
- Client-side integrations

**Configuration**:
1. n8n → **Settings** → **Credentials**
2. **Add Credential** → **Header Auth**
3. **Name**: `Supabase OpEx (Anon)`
4. **Header Name**: `apikey`
5. **Header Value**: Paste anon key

**Get Anon Key**:
```bash
# From ~/.zshrc
echo $OPEX_NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

### 1.3 PostgreSQL Direct Connection (Optional)

**Purpose**: Direct database access for complex queries

**Use Cases**:
- Complex SQL queries
- Batch data operations
- Performance-critical operations

**Configuration**:
1. n8n → **Add Credential** → **Postgres**
2. **Host**: `aws-1-us-east-1.pooler.supabase.com`
3. **Port**: `6543` (pooler) or `5432` (direct)
4. **Database**: `postgres`
5. **User**: `postgres.ublqmilcjtpnflofprkr`
6. **Password**: From environment variable

**Get Password**:
```bash
# From connection string
echo $OPEX_POSTGRES_PASSWORD
```

**Connection Strings**:
```bash
# Pooled (recommended for n8n)
OPEX_POSTGRES_URL="postgres://postgres.ublqmilcjtpnflofprkr:***@aws-1-us-east-1.pooler.supabase.com:6543/postgres"

# Direct (for long-running queries)
OPEX_POSTGRES_URL_NON_POOLING="postgres://postgres.ublqmilcjtpnflofprkr:***@aws-1-us-east-1.pooler.supabase.com:5432/postgres"
```

---

## 2. Mattermost Credentials

### 2.1 Incoming Webhook

**Purpose**: Post notifications to Mattermost channels

**Use Cases**:
- Tax deadline alerts
- Service health alerts
- Document sync summaries

**Configuration**:

**Step 1: Create Webhook in Mattermost**
1. Mattermost → **Main Menu** → **Integrations**
2. **Incoming Webhooks** → **Add Incoming Webhook**
3. **Title**: `n8n Notifications`
4. **Description**: `Automated notifications from OpEx workflows`
5. **Channel**: Select default channel (e.g., `finance-alerts`)
6. **Save** and copy webhook URL

**Step 2: Add to n8n**
1. n8n → **Settings** → **Credentials**
2. **Add Credential** → **HTTP Request** (generic)
3. **Name**: `Mattermost Webhook`
4. **Authentication**: None
5. **URL**: Paste webhook URL from step 1

**Example URL**:
```
https://your-mattermost.com/hooks/abc123xyz456
```

---

### 2.2 Personal Access Token (Optional)

**Purpose**: Advanced Mattermost API operations

**Use Cases**:
- Creating channels dynamically
- User management
- Advanced message formatting

**Configuration**:

**Step 1: Create Token in Mattermost**
1. Mattermost → **Profile** → **Security**
2. **Personal Access Tokens** → **Create Token**
3. **Description**: `n8n Integration`
4. **Save** and copy token

**Step 2: Add to n8n**
1. n8n → **Add Credential** → **Header Auth**
2. **Name**: `Mattermost PAT`
3. **Header Name**: `Authorization`
4. **Header Value**: `Bearer <your-token>`

---

## 3. GitHub Credentials

### 3.1 Personal Access Token

**Purpose**: Create issues automatically for service failures

**Use Cases**:
- Health check failures → GitHub issue
- Critical errors → Incident tracking
- Automated bug reports

**Configuration**:

**Step 1: Create Token in GitHub**
1. GitHub → **Settings** → **Developer Settings**
2. **Personal Access Tokens** → **Tokens (classic)**
3. **Generate new token**
4. **Note**: `n8n OpEx Workflows`
5. **Scopes**: `repo` (full control)
6. **Generate** and copy token

**Step 2: Add to n8n**
1. n8n → **Add Credential** → **Header Auth**
2. **Name**: `GitHub PAT`
3. **Header Name**: `Authorization`
4. **Header Value**: `Bearer <github-token>`

**Example**:
```
Authorization: Bearer ghp_abc123xyz456...
```

---

## 4. OpenAI Credentials (Optional)

### 4.1 API Key

**Purpose**: Direct OpenAI API calls (if not using Supabase Edge Functions)

**Use Cases**:
- Testing RAG queries directly
- Custom GPT integrations
- Backup if Supabase Edge Function fails

**Configuration**:
1. n8n → **Add Credential** → **OpenAI API**
2. **API Key**: Paste OpenAI API key

**Get API Key**:
```bash
# From ~/.zshrc
echo $OPENAI_API_KEY
```

---

## 5. Environment Variables in n8n

### 5.1 Docker Compose Setup

Add to `docker-compose.yml`:

```yaml
services:
  n8n:
    image: n8nio/n8n
    environment:
      # Mattermost
      - MATTERMOST_WEBHOOK_URL=https://your-mattermost.com/hooks/xxx

      # Supabase
      - OPEX_SUPABASE_URL=https://ublqmilcjtpnflofprkr.supabase.co
      - OPEX_SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
      - OPEX_SUPABASE_ANON_KEY=eyJhbGci...

      # PostgreSQL
      - OPEX_POSTGRES_URL=postgres://...
      - OPEX_POSTGRES_PASSWORD=***

      # GitHub
      - GITHUB_TOKEN=github_pat_xxx

      # OpenAI (optional)
      - OPENAI_API_KEY=sk-proj-xxx
```

### 5.2 Access in Workflows

Reference environment variables in nodes:

```javascript
// In n8n Code node or Set node
const webhookUrl = $env.MATTERMOST_WEBHOOK_URL;
const supabaseUrl = $env.OPEX_SUPABASE_URL;
```

---

## Security Best Practices

### 1. Credential Rotation

**Recommended Schedule**:
- Supabase service role key: Every 90 days
- Mattermost webhook: Every 6 months
- GitHub PAT: Every 90 days
- OpenAI API key: Every 90 days

**Rotation Process**:
1. Generate new credential in source system
2. Update in n8n credential manager
3. Test all workflows
4. Revoke old credential

### 2. Access Control

**Principle of Least Privilege**:
- Use **anon key** for public operations
- Use **service role key** only when necessary
- Restrict GitHub PAT to specific repositories

### 3. Secrets Management

**Never**:
- ❌ Hard-code credentials in workflow JSONs
- ❌ Commit credentials to git
- ❌ Share credentials in Mattermost/Slack
- ❌ Log full credentials in execution logs

**Always**:
- ✅ Use n8n credential manager
- ✅ Use environment variables
- ✅ Rotate credentials regularly
- ✅ Monitor credential usage

---

## Credential Testing

### Test Supabase Service Role Key

```bash
curl -X POST https://ublqmilcjtpnflofprkr.supabase.co/rest/v1/rpc/get_upcoming_tax_deadlines \
  -H "apikey: $OPEX_SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"days_ahead": 7}'
```

**Expected**: JSON array of upcoming tax deadlines

---

### Test Mattermost Webhook

```bash
curl -X POST $MATTERMOST_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "test",
    "username": "n8n Test",
    "text": "🔔 Credential test successful!"
  }'
```

**Expected**: Message appears in Mattermost channel

---

### Test GitHub PAT

```bash
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/user
```

**Expected**: JSON with your GitHub user info

---

### Test OpenAI API Key

```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

**Expected**: JSON list of available models

---

## Troubleshooting

### 401 Unauthorized

**Symptom**: "Unauthorized" or "Invalid API key"

**Solutions**:
- Verify credential is configured in node
- Check API key is copied correctly (no extra spaces)
- Ensure correct header name (`apikey` for Supabase)

### 403 Forbidden

**Symptom**: "Forbidden" or "Insufficient permissions"

**Solutions**:
- Use **service role key**, not anon key
- Verify GitHub PAT has `repo` scope
- Check Supabase RLS policies

### Credential Not Found

**Symptom**: "Credential not found in database"

**Solutions**:
- Re-create credential in n8n
- Ensure credential type matches node requirements
- Restart n8n if credential was just created

---

## Credential Reference Table

| Credential | Type | Usage | Security |
|------------|------|-------|----------|
| Supabase Service Role | Header Auth (`apikey`) | Admin operations | 🔒 High risk |
| Supabase Anon | Header Auth (`apikey`) | Public RAG queries | ✅ Safe (RLS) |
| Mattermost Webhook | HTTP Request | Notifications | ⚠️ Channel-specific |
| GitHub PAT | Header Auth (`Authorization`) | Issue creation | ⚠️ Repo access |
| OpenAI API | OpenAI Credential | Direct AI calls | 🔒 Cost risk |

---

## Next Steps

- [Complete Setup Guide](SETUP.md)
- [Configure Mattermost Integration](MATTERMOST_CONFIG.md)
- [Import Workflows](../README.md)

---

## Support

- **Documentation**: [`workflows/n8n/docs/`](../)
- **GitHub**: [jgtolentino/opex](https://github.com/jgtolentino/opex)
- **Mattermost**: `#ops-automation`
