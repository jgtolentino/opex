# Mattermost RAG Setup - COMPLETE ✅

## 🎉 Status: Running Successfully

Your Mattermost RAG integration is now running and ready to configure!

## Services Running

```bash
✅ PostgreSQL Database (port 5432) - HEALTHY
✅ RAG Service (port 8001) - HEALTHY
ℹ️  Using existing Mattermost on port 8065
```

**Health Check:**
```bash
curl http://localhost:8001/health
# Returns: {"status":"healthy","service":"mattermost-rag"}
```

## Next Steps: Configure Mattermost

Since you already have Mattermost running on port 8065, you need to configure the bot and slash commands:

### 1. Create Bot Account

1. Open Mattermost: http://localhost:8065
2. Go to **System Console** (hamburger menu → System Console)
3. Navigate to **Integrations → Bot Accounts**
4. Click **Add Bot Account**
   - **Username**: `ask-bot`
   - **Display Name**: `Ask Bot`
   - **Description**: `AI assistant for OpEx knowledge base`
   - **Post All**: ✅ **REQUIRED** (enable this!)
5. Click **Create Bot Account**
6. Click **Create Access Token**
7. **COPY THE TOKEN** (you won't see it again!)

**Save token to .env:**
```bash
cd /Users/tbwa/opex/packages/mattermost-rag
nano .env
# Add: MM_BOT_TOKEN=<paste_token_here>
```

### 2. Create Slash Command `/ask`

1. Still in System Console → **Integrations → Slash Commands**
2. Click **Add Slash Command**
   - **Title**: `Ask AI`
   - **Description**: `Search knowledge base with AI`
   - **Command Trigger Word**: `ask`
   - **Request URL**: `http://host.docker.internal:8001/mm/ask`
   - **Request Method**: `POST`
   - **Response Username**: `ask-bot`
   - **Autocomplete**: ✅
   - **Autocomplete Hint**: `[your question]`
   - **Autocomplete Description**: `Ask AI about OpEx docs`
3. Click **Save**
4. **COPY THE TOKEN**

**Save token to .env:**
```bash
nano .env
# Add: MM_SLASH_TOKEN=<paste_token_here>
```

### 3. (Optional) Create `/ask-human` Command

Repeat step 2 with:
- **Command Trigger Word**: `ask-human`
- **Request URL**: `http://host.docker.internal:8001/mm/ask-human`
- **Autocomplete Hint**: `[question for human expert]`
- Use **same token** as `/ask`

### 4. Add Anthropic API Key

```bash
nano .env
# Add: ANTHROPIC_API_KEY=sk-ant-...
```

### 5. Restart RAG Service

```bash
docker compose restart rag-service
```

### 6. Test It!

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

## Useful Commands

```bash
# View logs
docker compose logs -f rag-service

# Restart service
docker compose restart rag-service

# Stop all services
docker compose down

# Check service health
curl http://localhost:8001/health
```

## Troubleshooting

### "Invalid slash command token"
- Make sure MM_SLASH_TOKEN in .env matches token from Mattermost
- Restart rag-service after updating .env

### Bot can't post messages
- Verify MM_BOT_TOKEN is set correctly
- Ensure bot has "Post All" permission enabled
- Check bot account still exists in System Console

### Mattermost won't connect
- Use `http://host.docker.internal:8001` for Request URL (not localhost)
- Docker containers use `host.docker.internal` to reach host machine

## Architecture

```
Your Mattermost (port 8065)
    ↓ slash command webhook
RAG Service (port 8001)
    ↓ retrieve context
RAG Backend (optional - currently using fallback)
    ↓ synthesize answer
Claude Sonnet 4 (Anthropic API)
    ↓ post response
Mattermost Bot (@ask-bot)
```

## Files Created

```
/Users/tbwa/opex/packages/mattermost-rag/
├── docker-compose.yml       # Services orchestration
├── .env                      # Configuration (YOU NEED TO EDIT THIS)
├── rag-service/
│   ├── Dockerfile
│   ├── main.py              # FastAPI application
│   ├── rag_client.py        # RAG logic
│   ├── prompts.py           # Claude prompts
│   └── requirements.txt     # Python dependencies
├── README.md                # Full documentation
├── QUICKSTART.md            # Step-by-step setup guide
└── SETUP_COMPLETE.md        # This file
```

## Current .env Configuration

```bash
POSTGRES_PASSWORD=mattermost_db_password_2025
MM_SITE_URL=http://localhost:8065

# YOU NEED TO ADD THESE:
# MM_BOT_TOKEN=
# MM_SLASH_TOKEN=
# ANTHROPIC_API_KEY=
```

---

🎯 **Action Required:** Configure the 3 missing environment variables above, then test with `/ask`!
