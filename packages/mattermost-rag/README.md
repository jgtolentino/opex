# Mattermost RAG Integration

Complete CLI-driven integration between Mattermost chat and your RAG system using Supabase Edge Functions and n8n orchestration.

## 🚀 Quick Start

### 1. Environment Setup

Create `.env` file:
```bash
# Mattermost
MM_BASE_URL=https://chat.insightpulseai.net
MM_ADMIN_TOKEN=your_admin_token
MM_TEAM_NAME=insightpulaeai

# Supabase
SUPABASE_PROJECT_REF=ublqmilcjtpnflofprkr
SUPABASE_URL=https://ublqmilcjtpnflofprkr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key

# n8n (optional)
N8N_WEBHOOK_RAG_ROUTER=https://n8n.yourdomain.com/webhook/mattermost-rag-router
```

### 2. Quick Webhooks Setup

```bash
cd packages/mattermost-rag/scripts
./setup-webhooks.sh setup
```

This creates:
- Incoming webhook for alerts
- Slash command `/ask` pointing to n8n

### 3. Complete Stack Setup

```bash
cd packages/mattermost-rag/scripts
./setup-complete-stack.sh setup
```

This creates:
- `ragbot` bot user + token
- All webhooks and slash commands
- Deploys Supabase Edge Functions
- Sets up environment variables

## 📋 What's Included

### CLI Scripts

| Script | Purpose |
|--------|---------|
| `setup-webhooks.sh` | Webhook-only setup |
| `setup-complete-stack.sh` | Full stack automation |
| `setup-webhooks.sh test` | Test existing setup |

### Supabase Edge Functions

| Function | Purpose |
|----------|---------|
| `opex-rag-query` | Core RAG processing |
| `rag-feedback` | User feedback collection |
| `alert-notifier` | System notifications to Mattermost |

### n8n Workflows

| Workflow | Purpose |
|----------|---------|
| `mattermost-rag-router.json` | Routes `/ask` and `/feedback` commands |

## 🔧 Usage

### Mattermost Commands

**Ask Questions:**
```bash
/ask "How do I process expense reports?"
/ask "What are the BIR deadlines this month?"
```

**Provide Feedback:**
```bash
/feedback <query_id> <rating 1-5> [optional comment]
```

**Natural Language (via webhooks):**
```bash
@opex how do I process expense reports?
@rag what are the BIR deadlines this month?
ask about month-end close procedures
```

### System Alerts

Send alerts via Supabase Edge Functions:
```bash
supabase functions invoke alert-notifier \
  --project-ref $SUPABASE_PROJECT_REF \
  --no-verify-jwt \
  --body '{"message":"RAG system indexing complete"}'
```

## 🏗 Architecture

```
Mattermost Chat
├── /ask command → n8n → opex-rag-query → RAG answer
├── /feedback command → n8n → rag-feedback → feedback storage
├── @opex mentions → outgoing webhook → n8n → RAG answer
└── System alerts ← incoming webhook ← alert-notifier

Supabase Edge Functions
├── opex-rag-query: Core RAG processing + query logging
├── rag-feedback: User feedback collection + storage
└── alert-notifier: System notifications to Mattermost

n8n Orchestration
└── mattermost-rag-router: Routes commands to appropriate functions
```

## 🔍 Testing

### Test Webhooks
```bash
./setup-webhooks.sh test
```

### Test Complete Stack
```bash
./setup-complete-stack.sh test
```

### Manual Testing
1. **Slash command**: `/ask "test question"`
2. **Natural language**: `@opex test question`
3. **Feedback**: `/feedback <query_id> 5 "Great answer!"`
4. **Alerts**: Use `alert-notifier` function

## 📁 File Structure

```
packages/mattermost-rag/
├── scripts/
│   ├── setup-webhooks.sh          # Webhook-only setup
│   └── setup-complete-stack.sh    # Full stack setup
├── n8n-workflows/
│   └── mattermost-rag-router.json # n8n workflow for routing
├── rag-service/
│   └── main.py                    # FastAPI RAG service
├── webhook-setup.md               # Technical setup guide
├── CLI_WEBHOOK_SETUP.md           # CLI usage documentation
└── README.md                      # This file
```

## 🔒 Security

- **Tokens**: All tokens stored in `.env` file
- **Webhooks**: Use Mattermost's built-in token verification
- **Edge Functions**: Use Supabase service role key for database access
- **n8n**: Basic auth enabled by default

## 🚨 Troubleshooting

### Common Issues

**Permission denied:**
```bash
chmod +x packages/mattermost-rag/scripts/*.sh
```

**Missing dependencies:**
```bash
# Install required tools
brew install curl jq  # macOS
sudo apt-get install curl jq  # Ubuntu/Debian
```

**Invalid token:**
- Regenerate Mattermost admin token
- Ensure token has proper permissions

**Function deployment fails:**
- Check Supabase CLI is logged in
- Verify project reference is correct
- Check environment variables are set

### Logs

- **Mattermost**: System Console > Logs
- **Supabase**: Dashboard > Edge Functions > Logs
- **n8n**: Workflow execution logs

## 📚 Next Steps

1. **Deploy n8n** using the provided workflow JSON
2. **Configure Mattermost** slash commands to point to n8n
3. **Test end-to-end** with sample queries
4. **Monitor performance** and adjust as needed
5. **Add more workflows** for advanced features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the OpEx platform. See the main repository for license information.
