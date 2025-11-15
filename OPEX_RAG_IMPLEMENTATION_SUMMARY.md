# OpEx RAG Implementation Summary

## ✅ What's Deployed and Working

### Mattermost RAG Service
- **URL**: https://mattermost-rag-egb6n.ondigitalocean.app
- **Status**: ✅ Deployed and responding
- **Health Check**: ✅ Passing
- **Slash Command**: `/ask` configured in Mattermost
- **Bot Integration**: ✅ Bot can post to channels

### Current Issue
❌ **OpenRouter API Key Invalid**: The key `sk-or-v1-d9f9db23eb674f9492da992a43e8c823` returns 401 "User not found"

**Action Needed**: Get a valid OpenRouter API key from https://openrouter.ai/

### Test Results
```
✅ Bot receives slash commands
✅ Bot processes questions
✅ Bot posts responses to Mattermost
✅ Fallback context working
❌ OpenRouter LLM synthesis failing (invalid API key)
```

## 📋 Next Implementation Steps

### Phase 1: Fix Current Deployment (IMMEDIATE)

1. **Get Valid OpenRouter API Key**
   - Go to: https://openrouter.ai/
   - Create account / sign in
   - Generate API key
   - Copy the key (starts with `sk-or-v1-...`)

2. **Update DigitalOcean App Environment Variable**
   ```bash
   # Update the app spec
   doctl apps update 7bfabd64-5b56-4222-9403-3d4cf3b23209 \
     --spec /Users/tbwa/opex/packages/mattermost-rag/infra/do/mattermost-rag.yaml

   # Or update via DO dashboard:
   # Apps → mattermost-rag → Settings → Environment Variables
   # Edit OPENROUTER_API_KEY value
   ```

3. **Test in Mattermost**
   ```
   /ask What is OpEx?
   ```

### Phase 2: Implement Full RAG System

#### Files Created

1. **Database Migration** ✅
   - Location: `/Users/tbwa/opex/supabase/migrations/20251115_opex_rag_minimal.sql`
   - Tables: `opex_embedding_sources`, `opex_documents`, `opex_document_embeddings`
   - Function: `match_opex_documents()` for vector similarity search

2. **Edge Function** (TODO)
   - Location: `supabase/functions/ingest-upload/index.ts`
   - Purpose: Process uploaded files → chunks → embeddings

3. **Mattermost Integration** ✅
   - Current: Uses fallback context
   - Next: Query `match_opex_documents()` for real RAG

#### Deployment Commands

```bash
# 1. Apply database migration
cd /Users/tbwa/opex
psql "$POSTGRES_URL" -f supabase/migrations/20251115_opex_rag_minimal.sql

# 2. Deploy Edge Function (after creating it)
supabase functions deploy ingest-upload --no-verify-jwt

# 3. Update Mattermost RAG service to use vector search
# (Modify rag_client.py to call match_opex_documents)

# 4. Redeploy Mattermost RAG service
git add .
git commit -m "Integrate OpEx vector search"
git push origin main
# DigitalOcean auto-deploys on push
```

## 🎯 Full RAG Architecture

```
┌─────────────────┐
│ File Upload     │
│ (S3/Supabase)   │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ ingest-upload   │
│ Edge Function   │
│ • Extract text  │
│ • Chunk (~800t) │
│ • Embed (OpenAI)│
│ • Store vectors │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ opex_documents  │
│ + embeddings    │
│ (PostgreSQL)    │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ /ask command    │
│ • Embed query   │
│ • Vector search │
│ • LLM synthesis │
│ • Post answer   │
└─────────────────┘
```

## 📦 Environment Variables Needed

### Supabase (for RAG)
```bash
OPEX_SUPABASE_URL=https://xkxyvboeubffxxbebsll.supabase.co
OPEX_SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
OPEX_OPENAI_API_KEY=sk-...  # For embeddings
```

### Mattermost Bot
```bash
MM_SITE_URL=https://chat.insightpulseai.net
MM_BOT_TOKEN=k7cgtd1jh3g79fbcwkjmhztizh
MM_SLASH_TOKEN=ajrn43z3bp85mpg3xmcp5ug93h
OPENROUTER_API_KEY=<VALID_KEY_HERE>  # ⚠️ FIX THIS
```

## 🧪 Testing Checklist

### Layer 1: Bot Connection
- [x] Bot registered in Mattermost
- [x] Bot added to team
- [x] Slash command configured

### Layer 2: Webhook/Event
- [x] `/ask` command receives requests
- [x] Returns acknowledgment message
- [x] Background processing starts

### Layer 3: RAG Backend
- [ ] Database migration applied
- [ ] Vector search function works
- [ ] Can upload and index files
- [ ] `match_opex_documents()` returns results

### Layer 4: LLM Response
- [ ] Valid OpenRouter API key
- [ ] Embeddings generated
- [ ] Context retrieved from vectors
- [ ] LLM synthesizes answer

### Layer 5: Bot Output
- [x] Bot posts to channel
- [x] Formatting preserved
- [ ] Citations included

## 📝 Next Actions (Priority Order)

1. **IMMEDIATE**: Get valid OpenRouter API key and update DO app
2. **TODAY**: Apply database migration to Supabase
3. **THIS WEEK**: Implement `ingest-upload` Edge Function
4. **THIS WEEK**: Update Mattermost RAG to query vector DB
5. **THIS WEEK**: Upload test documents and verify end-to-end

## 🔗 Quick Links

- Mattermost: https://chat.insightpulseai.net
- DO App: https://cloud.digitalocean.com/apps/7bfabd64-5b56-4222-9403-3d4cf3b23209
- OpenRouter: https://openrouter.ai/
- Supabase: https://supabase.com/dashboard/project/xkxyvboeubffxxbebsll

## 📊 Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Mattermost Bot | ✅ Working | Can receive and respond |
| Slash Command | ✅ Working | `/ask` configured |
| DO Deployment | ✅ Working | Auto-deploy on push |
| OpenRouter API | ❌ Invalid | Need new key |
| Vector DB | ⏳ Ready | Migration SQL created |
| Ingestion | ⏳ Pending | Edge function needed |
| Full RAG | ⏳ Pending | After API key fix |
