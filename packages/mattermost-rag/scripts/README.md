# OpEx RAG Testing Scripts

## upload_test_document.py

Upload a test document to verify end-to-end RAG functionality.

### Prerequisites

1. **Apply database migration first:**
   - Go to: https://supabase.com/dashboard/project/ublqmilcjtpnflofprkr/sql/new
   - Copy contents of `supabase/migrations/20251115_opex_rag_minimal.sql`
   - Execute in SQL editor

2. **Get your API keys:**
   - SUPABASE_URL: `https://ublqmilcjtpnflofprkr.supabase.co`
   - SUPABASE_SERVICE_ROLE_KEY: From Supabase project settings
   - OPENAI_API_KEY: From OpenAI dashboard or Supabase Vault

3. **Install dependencies:**
   ```bash
   pip install supabase openai
   ```

### Usage

```bash
# Set environment variables
export SUPABASE_URL="https://ublqmilcjtpnflofprkr.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
export OPENAI_API_KEY="your-openai-api-key"

# Run the script
cd /Users/tbwa/opex/packages/mattermost-rag/scripts
python upload_test_document.py
```

### What It Does

1. ✅ Creates embedding source record
2. ✅ Chunks test document (800 chars with 200 overlap)
3. ✅ Generates embeddings using OpenAI text-embedding-3-small
4. ✅ Stores in opex_document_embeddings table
5. ✅ Verifies vector search with test query
6. ✅ Displays search results with similarity scores

### Expected Output

```
✅ Environment variables validated
✅ Clients initialized

📝 Creating embedding source...
✅ Created source: <uuid>

📄 Chunking document...
✅ Created 5 chunks

🔄 Processing chunks and generating embeddings...
   Processing chunk 1/5...
   ✅ Chunk 1 embedded and stored
   ...

✅ Marking source as ready...

🔍 Testing vector search...

✅ Vector search successful!
   Query: 'How do I deploy to DigitalOcean?'
   Results: 3 matches

   Match 1:
   Title: OpEx Knowledge Base - Deployment Guide
   Similarity: 0.892
   Text preview: ## DigitalOcean App Platform Deployment...

================================================================================
🎉 SUCCESS! Test document uploaded and verified
================================================================================

Source ID: <uuid>
Total chunks: 5
Embeddings generated: 5
Vector search working: ✅

Next steps:
1. Test /ask command in Mattermost
2. Try queries like:
   - 'How do I deploy to DigitalOcean?'
   - 'What environment variables are required?'
   - 'How do I troubleshoot deployment issues?'
   - 'How do I configure Mattermost slash commands?'
```

### Testing in Mattermost

After running the script successfully, test in Mattermost:

1. Go to https://chat.insightpulseai.net
2. In any channel, type: `/ask How do I deploy to DigitalOcean?`
3. Bot should respond with:
   - Real context from the uploaded document
   - Citations showing the source
   - Confidence score > 0.7
   - No more "No sources available" message

### Troubleshooting

**Error: "Missing required environment variables"**
- Solution: Ensure all three environment variables are set

**Error: "relation does not exist"**
- Solution: Apply the database migration first (see Prerequisites #1)

**Error: "401 authentication failed"**
- Solution: Check your SUPABASE_SERVICE_ROLE_KEY and OPENAI_API_KEY are correct

**Error: "No matches found"**
- Solution: Try lowering match_threshold or check if embeddings were stored

**Success but Mattermost still shows fallback context:**
- Solution: Check OPENAI_API_KEY and SUPABASE_SERVICE_ROLE_KEY in DO app settings
- Restart the DO app after adding secrets

### Cleanup

To remove the test document:

```sql
-- Find the source ID
SELECT id, title FROM opex_embedding_sources WHERE source_type = 'manual';

-- Delete (cascades to documents and embeddings)
DELETE FROM opex_embedding_sources WHERE id = '<source-id>';
```

## Next Steps

1. **Verify deployment:**
   ```bash
   doctl apps get-deployment 7bfabd64-5b56-4222-9403-3d4cf3b23209 c2ec4102-66b8-41c9-845f-1e9dfc19403e
   ```

2. **Check service health:**
   ```bash
   curl https://mattermost-rag-egb6n.ondigitalocean.app/health
   ```

3. **Test in Mattermost:**
   - Use `/ask` command with test queries
   - Verify real RAG results appear
   - Check citations and confidence scores

4. **Monitor logs:**
   ```bash
   doctl apps logs 7bfabd64-5b56-4222-9403-3d4cf3b23209 --follow
   ```
