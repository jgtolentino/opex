# OpEx RAG Quickstart Guide

Complete guide to get real RAG (Retrieval-Augmented Generation) working with Mattermost.

## 🎯 Current Status

✅ **Code Implementation Complete**
- Vector search implemented in `rag_client.py`
- Supabase pgvector integration ready
- OpenAI embeddings configured (text-embedding-3-small)
- DigitalOcean deployment in progress

⏳ **Pending Manual Steps**
1. Apply database migration
2. Configure API keys
3. Upload test document
4. Verify end-to-end

---

## 📋 Step-by-Step Setup

### Step 1: Apply Database Migration (5 minutes)

**Required**: This creates the vector database schema.

1. Go to: https://supabase.com/dashboard/project/ublqmilcjtpnflofprkr/sql/new

2. Copy the entire contents of `supabase/migrations/20251115_opex_rag_minimal.sql`

3. Paste into the SQL editor

4. Click **Run**

**What this creates:**
- `opex_embedding_sources` - Tracks uploaded documents
- `opex_documents` - Stores text chunks
- `opex_document_embeddings` - Stores vector embeddings (1536 dimensions)
- `match_opex_documents()` - Vector similarity search function
- HNSW index - For fast vector lookups

**Verification:**
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'opex_%';

-- Should return: opex_embedding_sources, opex_documents, opex_document_embeddings
```

---

### Step 2: Configure API Keys in DigitalOcean (5 minutes)

**Required**: The RAG service needs these to work.

1. Go to: https://cloud.digitalocean.com/apps/7bfabd64-5b56-4222-9403-3d4cf3b23209/settings

2. Click **Edit** next to environment variables

3. **Find and update these SECRET variables:**

   **OPENAI_API_KEY**
   - Get from: https://platform.openai.com/api-keys
   - OR from Supabase Vault if you stored it there
   - Format: `sk-...` (starts with sk-)

   **SUPABASE_SERVICE_ROLE_KEY**
   - Get from: https://supabase.com/dashboard/project/ublqmilcjtpnflofprkr/settings/api
   - Look for "service_role" key (NOT anon key)
   - Format: `eyJhbGci...` (long JWT token)

4. Click **Save**

5. The app will automatically redeploy (takes ~2-3 minutes)

**Verification:**
```bash
# Wait for deployment to complete
doctl apps get 7bfabd64-5b56-4222-9403-3d4cf3b23209

# Check health endpoint
curl https://mattermost-rag-egb6n.ondigitalocean.app/health
# Should return: {"status":"ok"}
```

---

### Step 3: Upload Test Document (2 minutes)

**Required**: Populate the vector database with test content.

1. **Set environment variables locally:**
   ```bash
   export SUPABASE_URL="https://ublqmilcjtpnflofprkr.supabase.co"
   export SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key>"
   export OPENAI_API_KEY="<your-openai-api-key>"
   ```

2. **Install dependencies:**
   ```bash
   pip install supabase openai
   ```

3. **Run the upload script:**
   ```bash
   cd /Users/tbwa/opex/packages/mattermost-rag/scripts
   python upload_test_document.py
   ```

**Expected Output:**
```
✅ Environment variables validated
✅ Clients initialized
📝 Creating embedding source...
✅ Created source: <uuid>
📄 Chunking document...
✅ Created 5 chunks
🔄 Processing chunks and generating embeddings...
   ✅ Chunk 1 embedded and stored
   ...
🔍 Testing vector search...
✅ Vector search successful!
   Results: 3 matches
🎉 SUCCESS! Test document uploaded and verified
```

**What this does:**
- Uploads deployment guide documentation
- Generates 5 text chunks
- Creates embeddings for each chunk
- Stores in vector database
- Verifies search is working

---

### Step 4: Test in Mattermost (1 minute)

**Required**: Verify end-to-end RAG flow.

1. Go to: https://chat.insightpulseai.net

2. In any channel, type:
   ```
   /ask How do I deploy to DigitalOcean?
   ```

3. **Expected Response:**
   ```
   🔍 Searching knowledge base...

   [Answer based on uploaded deployment guide]

   **Sources:**
   - OpEx Knowledge Base - Deployment Guide (similarity: 0.89)

   Confidence: high (0.87)
   ```

4. **Try more queries:**
   ```
   /ask What environment variables are required?
   /ask How do I troubleshoot deployment issues?
   /ask How do I configure Mattermost slash commands?
   ```

**What to look for:**
- ✅ Bot responds within 5-10 seconds
- ✅ Answer references the deployment guide content
- ✅ Citations show the source document
- ✅ Confidence score > 0.7
- ✅ NO "No sources available" message

---

## 🔍 Verification Checklist

Use this to confirm everything is working:

### Database Layer
- [ ] Migration applied successfully
- [ ] Tables exist: `opex_embedding_sources`, `opex_documents`, `opex_document_embeddings`
- [ ] Vector search function `match_opex_documents()` works
- [ ] Test document uploaded (5 chunks)

### Service Layer
- [ ] DigitalOcean deployment completed
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] Environment variables set: `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Service logs show no errors

### Mattermost Integration
- [ ] `/ask` command recognized
- [ ] Bot responds with ephemeral "Searching..." message
- [ ] Bot posts actual answer to channel
- [ ] Answer includes citations
- [ ] Confidence score displayed

### Vector Search
- [ ] Embeddings generated for queries
- [ ] Vector similarity search returns results
- [ ] Results ranked by similarity score
- [ ] Fallback context NOT used (real RAG working)

---

## 🚨 Troubleshooting

### Issue: "No sources available"

**Cause**: Vector database is empty or not connected

**Solutions:**
1. Verify migration applied: Check Supabase dashboard for tables
2. Upload test document: Run `upload_test_document.py`
3. Check service logs: `doctl apps logs 7bfabd64-5b56-4222-9403-3d4cf3b23209 --follow`

---

### Issue: 401 Authentication Error

**Cause**: Invalid or missing API keys

**Solutions:**
1. Check OPENAI_API_KEY is valid:
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $OPENAI_API_KEY"
   # Should list available models
   ```

2. Check SUPABASE_SERVICE_ROLE_KEY is correct:
   - Go to Supabase project settings
   - Compare with value in DO environment

3. Ensure keys are marked as SECRET in DO
4. Redeploy app after updating keys

---

### Issue: "vector_search_error" in logs

**Cause**: Connection to Supabase failed or RPC function missing

**Solutions:**
1. Verify Supabase URL is correct: `https://ublqmilcjtpnflofprkr.supabase.co`
2. Check `match_opex_documents()` function exists:
   ```sql
   SELECT proname FROM pg_proc WHERE proname = 'match_opex_documents';
   ```
3. Verify vector extension enabled:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'vector';
   ```

---

### Issue: Low Confidence Scores (<0.5)

**Cause**: Query doesn't match uploaded content well

**Solutions:**
1. Upload more relevant documents
2. Adjust `match_threshold` in code (currently 0.7)
3. Try more specific queries
4. Check if embeddings are being generated correctly

---

### Issue: Slow Response Times (>15 seconds)

**Cause**: Embedding generation or vector search taking too long

**Solutions:**
1. Check HNSW index exists:
   ```sql
   SELECT indexname FROM pg_indexes
   WHERE tablename = 'opex_document_embeddings';
   ```
2. Monitor OpenAI API response time
3. Consider increasing DO instance size if consistently slow
4. Check for network latency to Supabase

---

## 📊 System Architecture

```
User in Mattermost
    ↓
    /ask command
    ↓
FastAPI Service (DigitalOcean)
    ├─→ OpenAI API (Generate embedding)
    ├─→ Supabase pgvector (Vector search)
    └─→ OpenAI API (Synthesize answer)
    ↓
Post to Mattermost channel
```

**Key Components:**
- **Mattermost**: User interface, slash commands
- **DigitalOcean App Platform**: Hosts FastAPI service
- **Supabase PostgreSQL**: Vector database with pgvector extension
- **OpenAI API**: Embeddings (text-embedding-3-small) + LLM (gpt-4o-mini)

---

## 🔗 Quick Links

### Dashboards
- **Mattermost**: https://chat.insightpulseai.net
- **DigitalOcean App**: https://cloud.digitalocean.com/apps/7bfabd64-5b56-4222-9403-3d4cf3b23209
- **Supabase Project**: https://supabase.com/dashboard/project/ublqmilcjtpnflofprkr
- **GitHub Repo**: https://github.com/jgtolentino/opex

### API Endpoints
- **Service Health**: https://mattermost-rag-egb6n.ondigitalocean.app/health
- **Slash Command**: https://mattermost-rag-egb6n.ondigitalocean.app/mm/ask

### Commands
```bash
# Check deployment status
doctl apps get 7bfabd64-5b56-4222-9403-3d4cf3b23209

# View logs
doctl apps logs 7bfabd64-5b56-4222-9403-3d4cf3b23209 --follow

# Test health endpoint
curl https://mattermost-rag-egb6n.ondigitalocean.app/health

# Upload test document
cd /Users/tbwa/opex/packages/mattermost-rag/scripts
python upload_test_document.py
```

---

## 🎯 Success Criteria

You'll know it's working when:

1. ✅ `/ask` command in Mattermost responds within 5-10 seconds
2. ✅ Bot posts answers with real content (not "General OpEx documentation")
3. ✅ Citations reference the uploaded deployment guide
4. ✅ Confidence scores are >0.7 for relevant queries
5. ✅ Logs show "supabase_search_success" instead of "using_fallback_context"

---

## 📝 Next Phase: Automated File Ingestion

Once real RAG is verified working, the next phase will add:

1. **Mattermost File Upload Handler**: Trigger on file uploads
2. **Edge Function for Ingestion**: Process files → chunks → embeddings
3. **n8n Workflow**: Automate the upload → process → index pipeline
4. **Multiple File Formats**: Support PDF, DOCX, TXT, CSV, XLSX
5. **Auto-Indexing**: All uploads automatically become searchable

See `ONBOARDING_BUNDLE.md` for the full roadmap.
