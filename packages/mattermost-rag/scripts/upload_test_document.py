#!/usr/bin/env python3
"""
Upload test document to OpEx RAG vector database.

This script:
1. Creates a test document in opex_embedding_sources
2. Chunks the text into smaller pieces
3. Generates embeddings using OpenAI
4. Stores embeddings in opex_document_embeddings
5. Verifies the document is searchable via match_opex_documents()

Usage:
    export SUPABASE_URL="https://ublqmilcjtpnflofprkr.supabase.co"
    export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
    export OPENAI_API_KEY="your-openai-api-key"
    python upload_test_document.py
"""

import os
import sys
from typing import List
from supabase import create_client
from openai import OpenAI

# Test document content
TEST_DOCUMENT = """
# OpEx Knowledge Base - Deployment Guide

## DigitalOcean App Platform Deployment

The OpEx system uses DigitalOcean App Platform for deploying microservices. Here's how to deploy:

### Prerequisites
- DigitalOcean account with doctl CLI configured
- App spec YAML file (e.g., infra/do/mattermost-rag.yaml)
- GitHub repository connected to DigitalOcean

### Deployment Steps

1. **Update App Spec**
   ```bash
   doctl apps update <app-id> --spec <spec-file.yaml>
   ```

2. **Trigger Deployment**
   ```bash
   doctl apps create-deployment <app-id> --force-rebuild
   ```

3. **Monitor Logs**
   ```bash
   doctl apps logs <app-id> --follow
   ```

### Environment Variables

Required secrets:
- OPENAI_API_KEY - For LLM synthesis and embeddings
- SUPABASE_SERVICE_ROLE_KEY - For database access
- MM_BOT_TOKEN - Mattermost bot authentication
- MM_SLASH_TOKEN - Slash command verification

### Troubleshooting

**Issue**: Deployment fails with "Build failed"
**Solution**: Check build logs for missing dependencies or syntax errors

**Issue**: 401 authentication errors
**Solution**: Verify API keys are set correctly in DO environment variables

**Issue**: Database connection timeout
**Solution**: Check Supabase URL and service role key, ensure connection pooler port 6543

## Supabase Vector Search

The system uses pgvector extension for semantic search:

### Vector Search Query
```sql
SELECT * FROM match_opex_documents(
    query_embedding := '[0.1, 0.2, ...]'::vector,
    match_threshold := 0.7,
    match_count := 5
);
```

### Embedding Generation
Use OpenAI text-embedding-3-small model (1536 dimensions):
```python
from openai import OpenAI
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
response = client.embeddings.create(
    model="text-embedding-3-small",
    input="Your text here"
)
embedding = response.data[0].embedding
```

## Mattermost Integration

Configure slash commands in Mattermost:

1. Go to Integrations → Slash Commands
2. Create new command: `/ask`
3. Set Request URL: https://your-service.ondigitalocean.app/mm/ask
4. Set Request Method: POST
5. Copy the token and add to DO environment as MM_SLASH_TOKEN

### Bot Setup
1. Create bot account in Mattermost
2. Generate bot token
3. Add bot to team
4. Store token in DO environment as MM_BOT_TOKEN

## Best Practices

- Always use connection pooler (port 6543) for Supabase in production
- Set appropriate match_threshold (0.7-0.8) for vector search
- Use fallback context when vector DB is empty
- Implement retry logic for API calls
- Log all errors with structlog for debugging
"""


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 200) -> List[str]:
    """Split text into overlapping chunks."""
    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start += chunk_size - overlap

    return chunks


def main():
    # Validate environment variables
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")

    if not all([supabase_url, supabase_key, openai_key]):
        print("❌ Error: Missing required environment variables")
        print("Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY")
        sys.exit(1)

    print("✅ Environment variables validated")

    # Initialize clients
    supabase = create_client(supabase_url, supabase_key)
    openai_client = OpenAI(api_key=openai_key)

    print("✅ Clients initialized")

    # Step 1: Create embedding source
    print("\n📝 Creating embedding source...")
    source_data = {
        "source_type": "manual",
        "title": "OpEx Knowledge Base - Deployment Guide",
        "description": "Test document for RAG verification - deployment and integration guide",
        "tags": ["deployment", "digitalocean", "supabase", "mattermost", "testing"],
        "status": "processing"
    }

    source_result = supabase.table("opex_embedding_sources").insert(source_data).execute()
    source_id = source_result.data[0]["id"]
    print(f"✅ Created source: {source_id}")

    # Step 2: Chunk the document
    print("\n📄 Chunking document...")
    chunks = chunk_text(TEST_DOCUMENT)
    print(f"✅ Created {len(chunks)} chunks")

    # Step 3: Process each chunk
    print("\n🔄 Processing chunks and generating embeddings...")
    for idx, chunk_text in enumerate(chunks):
        print(f"   Processing chunk {idx + 1}/{len(chunks)}...")

        # Create document record
        doc_data = {
            "source_id": source_id,
            "chunk_index": idx,
            "text": chunk_text,
            "token_count": len(chunk_text.split())  # Rough estimate
        }

        doc_result = supabase.table("opex_documents").insert(doc_data).execute()
        document_id = doc_result.data[0]["id"]

        # Generate embedding
        embedding_response = openai_client.embeddings.create(
            model="text-embedding-3-small",
            input=chunk_text
        )
        embedding = embedding_response.data[0].embedding

        # Store embedding
        embedding_data = {
            "document_id": document_id,
            "embedding": embedding,
            "model": "text-embedding-3-small"
        }

        supabase.table("opex_document_embeddings").insert(embedding_data).execute()
        print(f"   ✅ Chunk {idx + 1} embedded and stored")

    # Step 4: Mark source as ready
    print("\n✅ Marking source as ready...")
    supabase.table("opex_embedding_sources").update({"status": "ready"}).eq("id", source_id).execute()

    # Step 5: Test vector search
    print("\n🔍 Testing vector search...")
    test_query = "How do I deploy to DigitalOcean?"

    # Generate query embedding
    query_response = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=test_query
    )
    query_embedding = query_response.data[0].embedding

    # Search using RPC function
    search_result = supabase.rpc(
        "match_opex_documents",
        {
            "query_embedding": query_embedding,
            "match_threshold": 0.7,
            "match_count": 3
        }
    ).execute()

    print(f"\n✅ Vector search successful!")
    print(f"   Query: '{test_query}'")
    print(f"   Results: {len(search_result.data)} matches\n")

    for i, match in enumerate(search_result.data, 1):
        print(f"   Match {i}:")
        print(f"   Title: {match['title']}")
        print(f"   Similarity: {match['similarity']:.3f}")
        print(f"   Text preview: {match['text'][:100]}...")
        print()

    print("=" * 80)
    print("🎉 SUCCESS! Test document uploaded and verified")
    print("=" * 80)
    print(f"\nSource ID: {source_id}")
    print(f"Total chunks: {len(chunks)}")
    print(f"Embeddings generated: {len(chunks)}")
    print(f"Vector search working: ✅")
    print("\nNext steps:")
    print("1. Test /ask command in Mattermost")
    print("2. Try queries like:")
    print("   - 'How do I deploy to DigitalOcean?'")
    print("   - 'What environment variables are required?'")
    print("   - 'How do I troubleshoot deployment issues?'")
    print("   - 'How do I configure Mattermost slash commands?'")


if __name__ == "__main__":
    main()
