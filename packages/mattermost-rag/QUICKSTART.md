# Mattermost RAG - Quick Start Guide

## Current Status

✅ Colima (Docker) is running
🔄 Building Docker images...

## What's Happening Now

The stack is building 3 services:
1. **PostgreSQL** - Mattermost database
2. **Mattermost** - Chat platform (http://localhost:8065)
3. **RAG Service** - FastAPI + Claude integration (http://localhost:8001)

This will take **2-3 minutes** on first build.

## Next Steps (After Build Completes)

### 1. Check Service Health

```bash
# Wait for services to be ready
docker compose ps

# Expected output:
# NAME                STATUS        PORTS
# db                  running       5432
# mattermost          healthy       0.0.0.0:8065->8065/tcp
# rag-service         healthy       0.0.0.0:8001->8000/tcp
```

### 2. Access Mattermost

Open: **http://localhost:8065**

**First Time Setup:**
1. Create admin account:
   - Email: `jgtolentino_rn@yahoo.com`
   - Username: `admin`
   - Password: (choose secure password)
2. Create team: `opex` or skip
3. You'll land on "Town Square" channel

### 3. Configure Bot & Slash Commands

#### A. Create Bot Account

1. Click hamburger menu (≡) → **System Console**
2. Navigate: **Integrations → Bot Accounts**
3. Click "Add Bot Account"
   - Username: `ask-bot`
   - Display Name: `Ask Bot`
   - Description: `AI assistant for OpEx knowledge base`
   - Post All: ✅ **REQUIRED**
4. Click "Create Bot Account"
5. Click "Create Access Token"
6. **COPY THE TOKEN** (you won't see it again!)

**Update .env:**
```bash
nano .env
# Set: MM_BOT_TOKEN=<paste_token_here>
# Save: Ctrl+O, Enter, Ctrl+X
```

#### B. Create Slash Command `/ask`

1. Still in System Console → **Integrations → Slash Commands**
2. Click "Add Slash Command"
   - Title: `Ask AI`
   - Description: `Search knowledge base with AI`
   - Command Trigger Word: `ask`
   - Request URL: `http://rag-service:8000/mm/ask`
   - Request Method: `POST`
   - Response Username: `ask-bot`
   - Autocomplete: ✅
   - Autocomplete Hint: `[your question]`
   - Autocomplete Description: `Ask AI about OpEx docs`
3. Click "Save"
4. **COPY THE TOKEN**

**Update .env:**
```bash
nano .env
# Set: MM_SLASH_TOKEN=<paste_token_here>
# Save
```

#### C. Create Slash Command `/ask-human`

Repeat step B with:
- Command Trigger Word: `ask-human`
- Request URL: `http://rag-service:8000/mm/ask-human`
- Autocomplete Hint: `[question for human expert]`
- Use **same token** as `/ask`

#### D. Add Anthropic API Key

```bash
nano .env
# Set: ANTHROPIC_API_KEY=sk-ant-...
# Save
```

#### E. Restart RAG Service

```bash
docker compose restart rag-service

# Check logs
docker compose logs -f rag-service
```

You should see:
```json
{"event": "service_starting", "has_bot_token": true, "has_slash_token": true}
```

### 4. Test It!

Go to any Mattermost channel and type:

```
/ask how do I rotate database credentials?
```

**Expected Response:**
1. Ephemeral message: "🔍 Searching knowledge base..."
2. Bot posts answer with:
   - Direct answer
   - Source citations
   - Confidence score
   - Feedback options

**Example Output:**
```
To rotate Supabase database credentials:

1. **Generate new key**: Supabase Dashboard → Settings → API
2. **Update secrets**: `doctl apps update <id> --env KEY=<new>`
3. **Redeploy**: `doctl apps create-deployment <id>`

[source: Document 1 - Credential Rotation Best Practices]

---

**Sources**
1. [Credential Rotation Best Practices](https://docs.example.com/security/rotation) (confidence: 0.88)

✅ **Confidence**: High (0.88)

**Feedback**: 👍 Helpful? | 👎 Not helpful? | `/ask-human` to escalate
```

## Troubleshooting

### Services won't start

```bash
# Check logs
docker compose logs

# Restart
docker compose down
docker compose up -d
```

### "Invalid slash command token"

- Make sure MM_SLASH_TOKEN in .env matches token from Mattermost
- Restart rag-service after updating .env

### Bot can't post messages

- Verify MM_BOT_TOKEN is set correctly
- Ensure bot has "Post All" permission enabled
- Check bot account still exists in System Console

### Mattermost won't load

```bash
# Wait for health check
docker compose ps

# If still unhealthy after 2 minutes:
docker compose restart mattermost
docker compose logs mattermost
```

## Useful Commands

```bash
# View all logs
docker compose logs -f

# View specific service
docker compose logs -f rag-service

# Restart service
docker compose restart rag-service

# Stop everything
docker compose down

# Stop and remove volumes (DESTRUCTIVE)
docker compose down -v

# Check service health
curl http://localhost:8001/health
curl http://localhost:8065/api/v4/system/ping
```

## Current Configuration

**Development Mode:**
- Using fallback context (hardcoded examples)
- No real RAG backend required
- Works for testing common questions

**To Enable Production RAG:**
1. Set `RAG_BACKEND_URL` in .env
2. Implement `/retrieve` endpoint (see README)
3. Or use Supabase pgvector (see rag_client.py)

## Next: Customize

- **Prompts**: Edit `rag-service/prompts.py`
- **Confidence**: Adjust thresholds in `prompts.py:assess_confidence()`
- **Response Format**: Edit `main.py:render_answer()`
- **RAG Backend**: Wire your hybrid search to `rag_client.py:retrieve()`

## Support

For issues, check the main **README.md** troubleshooting section.
