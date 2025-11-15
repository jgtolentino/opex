# Mattermost RAG Integration

Production-ready Docker Compose setup for intelligent Q&A in Mattermost using Claude + RAG.

## Architecture

```
User → /ask question
  ↓
Mattermost (slash command)
  ↓
FastAPI RAG Service
  ↓ (retrieve)
Hybrid Search (Supabase pgvector / RAG backend)
  ↓ (synthesize)
Claude Sonnet 4
  ↓ (post answer)
Mattermost (bot message with citations)
```

## Features

- **Instant ephemeral acknowledgment** - no waiting for user
- **Background RAG processing** - retrieve → synthesize → post
- **Claude Sonnet 4 synthesis** - high-quality, context-aware answers
- **Source citations** - every answer includes document references
- **Confidence scoring** - automatic assessment of answer reliability
- **Human escalation** - `/ask-human` command for expert help
- **Production-ready** - Docker Compose with health checks, retries, logging

## Quick Start

### 1. Prerequisites

- Docker & Docker Compose
- Anthropic API key
- (Optional) Supabase project for document storage

### 2. Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env
```

Required environment variables:

```bash
# Anthropic (required)
ANTHROPIC_API_KEY=sk-ant-...

# Mattermost bot credentials (set after initial setup)
MM_BOT_TOKEN=...
MM_SLASH_TOKEN=...

# Optional: Supabase for RAG storage
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
```

### 3. Launch Stack

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f rag-service

# Check health
curl http://localhost:8001/health
```

Services:
- **Mattermost**: http://localhost:8065
- **RAG Service**: http://localhost:8001

### 4. Configure Mattermost

#### A. Create Bot Account

1. Go to **System Console → Integrations → Bot Accounts**
2. Click "Add Bot Account"
   - **Username**: `ask-bot`
   - **Display Name**: "Ask Bot"
   - **Description**: "AI assistant for OpEx knowledge base"
   - **Post All**: ✅ (required to post in all channels)
3. Click "Create Bot Account"
4. Generate **Personal Access Token**
5. Copy token → set as `MM_BOT_TOKEN` in `.env`

#### B. Create Slash Command (`/ask`)

1. Go to **System Console → Integrations → Slash Commands**
2. Click "Add Slash Command"
   - **Title**: "Ask AI"
   - **Description**: "Search knowledge base with AI"
   - **Command Trigger Word**: `ask`
   - **Request URL**: `http://rag-service:8000/mm/ask` (inside Docker network)
     - **External**: `https://your-domain.com/mm/ask` (if exposing publicly)
   - **Request Method**: `POST`
   - **Response Username**: `ask-bot`
   - **Autocomplete**: ✅
   - **Autocomplete Hint**: `[your question]`
   - **Autocomplete Description**: "Ask AI assistant about OpEx docs"
3. Click "Save"
4. Copy **Token** → set as `MM_SLASH_TOKEN` in `.env`

#### C. Create Slash Command (`/ask-human`)

Repeat above for human escalation:
- **Command Trigger Word**: `ask-human`
- **Request URL**: `http://rag-service:8000/mm/ask-human`
- **Autocomplete Hint**: `[question for human expert]`
- Use same `MM_SLASH_TOKEN`

#### D. Restart RAG Service

```bash
# Apply new environment variables
docker compose restart rag-service

# Verify configuration
docker compose logs rag-service | grep "service_starting"
```

You should see:
```json
{"event": "service_starting", "has_bot_token": true, "has_slash_token": true}
```

## Usage

### Basic Question

```
/ask how do I rotate database credentials safely?
```

**Response**:
```
To rotate Supabase database credentials:

1. **Generate new key**: Supabase Dashboard → Settings → API → Generate service_role_key
2. **Update secrets**: `doctl apps update <app-id> --env SUPABASE_SERVICE_ROLE_KEY=<new-key>`
3. **Redeploy**: `doctl apps create-deployment <app-id>`

[source: Document 1 - Supabase Security Best Practices]

---

**Sources**
1. [Supabase Security Best Practices](https://docs.supabase.com/security) (confidence: 0.95)

✅ **Confidence**: High (0.95)

**Feedback**: 👍 Helpful? | 👎 Not helpful? | `/ask-human` to escalate
```

### Human Escalation

```
/ask-human how do we configure regional failover for DigitalOcean?
```

**Response** (ephemeral to you):
```
✅ Your question has been escalated to human experts.
```

**Posted to channel**:
```
🆘 **Human Expert Needed**

**Question**: how do we configure regional failover for DigitalOcean?

**Requested by**: @jake

@channel - Can someone help with this?
```

## RAG Configuration

### Development Mode (Fallback Context)

By default, the service uses **hardcoded fallback context** for common topics:
- Credential rotation
- OCR service
- Deployment workflows

This is great for testing without a RAG backend.

### Production Mode (Hybrid Search)

Set `RAG_BACKEND_URL` to enable real hybrid search:

```bash
RAG_BACKEND_URL=http://your-rag-service:8000
```

The RAG client will call:
```
POST /retrieve
{
  "query": "user question",
  "user_id": "mattermost_user_id",
  "limit": 5
}
```

Expected response:
```json
{
  "hits": [
    {
      "title": "Document Title",
      "snippet": "relevant excerpt...",
      "url": "https://...",
      "score": 0.95
    }
  ]
}
```

### Supabase Vector Search

To use Supabase `pgvector` for retrieval:

1. Create embeddings table:
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  url TEXT,
  embedding VECTOR(1536),  -- OpenAI ada-002 dimension
  metadata JSONB
);

CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops);
```

2. Set Supabase credentials in `.env`

3. Update `rag_client.py` → `_supabase_search()` with your query logic

## Customization

### Prompt Engineering

Edit `rag-service/prompts.py`:

- **`SYSTEM_PROMPT`**: Claude's system instructions
- **`build_rag_prompt()`**: How context is formatted
- **`RAG_EXAMPLES`**: Few-shot examples for Claude

### Confidence Thresholds

Edit `rag-service/prompts.py` → `assess_confidence()`:

```python
if confidence >= 0.85:
    return confidence, "high"  # Adjust threshold
elif confidence >= 0.65:
    return confidence, "medium"
else:
    return confidence, "low"
```

### Response Format

Edit `rag-service/main.py` → `render_answer()`:

```python
return f"""{answer}

---

{citations}

{emoji} **Confidence**: {level.title()} ({confidence:.2f})

**Feedback**: 👍 Helpful? | 👎 Not helpful? | `/ask-human` to escalate"""
```

## Monitoring

### Health Checks

```bash
# Service health
curl http://localhost:8001/health

# Docker health
docker compose ps
```

### Logs

```bash
# All services
docker compose logs -f

# RAG service only
docker compose logs -f rag-service | jq

# Search for errors
docker compose logs rag-service | grep ERROR
```

### Structured Logging

All logs are JSON formatted with `structlog`:

```json
{
  "event": "processing_question",
  "user_id": "abc123",
  "channel_id": "xyz789",
  "question": "how do I...",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

## Production Deployment

### External URL Configuration

For production, expose the RAG service behind a reverse proxy:

```yaml
# docker-compose.yml
rag-service:
  environment:
    MM_SITE_URL: "https://mattermost.yourdomain.com"
  # Remove ports exposure
```

Update slash command URL in Mattermost:
```
Request URL: https://ask-api.yourdomain.com/mm/ask
```

### SSL/TLS

Use a reverse proxy (Traefik, Nginx, Caddy) for SSL termination:

```nginx
# nginx.conf
location /mm/ {
    proxy_pass http://rag-service:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

### Secrets Management

**DO NOT commit `.env` to git!**

Production options:
1. **Docker Secrets**: Use `docker secret create`
2. **Environment Variables**: Set in CI/CD or container orchestrator
3. **External Vaults**: HashiCorp Vault, AWS Secrets Manager

```bash
# Example: Docker Secrets
echo "sk-ant-..." | docker secret create anthropic_key -
```

Update `docker-compose.yml`:
```yaml
secrets:
  anthropic_key:
    external: true

services:
  rag-service:
    secrets:
      - anthropic_key
    environment:
      ANTHROPIC_API_KEY_FILE: /run/secrets/anthropic_key
```

### Scaling

Increase worker processes:

```dockerfile
# rag-service/Dockerfile
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "8"]
```

Or use Docker Compose replicas:

```yaml
rag-service:
  deploy:
    replicas: 3
```

## Troubleshooting

### "Invalid slash command token"

**Cause**: `MM_SLASH_TOKEN` mismatch

**Fix**:
```bash
# Get token from Mattermost slash command config
# Update .env
MM_SLASH_TOKEN=correct_token_here

# Restart
docker compose restart rag-service
```

### Bot can't post messages

**Cause**: Missing `MM_BOT_TOKEN` or insufficient permissions

**Fix**:
1. Verify bot account exists in System Console
2. Ensure bot has "Post All" permission
3. Regenerate Personal Access Token
4. Update `.env` and restart

### "Processing failed" errors

**Cause**: Anthropic API issues or missing API key

**Fix**:
```bash
# Check logs
docker compose logs rag-service | grep synthesis_failed

# Verify API key
docker compose exec rag-service env | grep ANTHROPIC_API_KEY

# Test API key manually
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-sonnet-4-20250514","max_tokens":10,"messages":[{"role":"user","content":"hi"}]}'
```

### Slow response times

**Cause**: Retrieval or synthesis taking too long

**Solutions**:
1. Reduce retrieval limit: `limit: int = 3` in `retrieve()`
2. Use faster model: `claude-haiku-4-20250514`
3. Enable RAG backend caching
4. Scale worker processes

## Development

### Local Development

```bash
# Install dependencies
cd rag-service
pip install -r requirements.txt

# Run locally
uvicorn main:app --reload --port 8000

# Test endpoints
curl http://localhost:8000/health

# Simulate slash command
curl -X POST http://localhost:8000/mm/ask \
  -F "token=$MM_SLASH_TOKEN" \
  -F "user_id=test_user" \
  -F "channel_id=test_channel" \
  -F "text=how do I rotate credentials?"
```

### Testing

Create `tests/test_rag.py`:

```python
import pytest
from rag_client import RAGClient

@pytest.mark.asyncio
async def test_retrieve():
    client = RAGClient()
    hits = await client.retrieve("test question", "user123")
    assert len(hits) > 0
    assert "title" in hits[0]

@pytest.mark.asyncio
async def test_synthesize():
    client = RAGClient()
    answer, citations, score, level = await client.synthesize(
        "test question",
        [{"title": "Test", "snippet": "content", "url": "#", "score": 0.9}]
    )
    assert len(answer) > 0
    assert level in ["high", "medium", "low"]
```

Run tests:
```bash
pytest tests/ -v
```

## License

MIT

## Support

For issues or questions:
1. Use `/ask-human` in Mattermost for urgent help
2. Check logs: `docker compose logs rag-service`
3. Review troubleshooting section above
