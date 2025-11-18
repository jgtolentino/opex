-- OpEx RAG Minimal Schema
-- Purpose: S3/Storage upload → chunks → embeddings → vector search

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Embedding Sources Table
CREATE TABLE IF NOT EXISTS opex_embedding_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type TEXT NOT NULL CHECK (source_type IN ('s3_upload', 'google_drive', 'notion', 'manual')),
    title TEXT,
    description TEXT,
    bucket TEXT,
    object_key TEXT,
    mime_type TEXT,
    uploaded_by TEXT,
    tags TEXT[],
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'ready', 'failed')) DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for status queries
CREATE INDEX IF NOT EXISTS idx_opex_sources_status ON opex_embedding_sources(status);
CREATE INDEX IF NOT EXISTS idx_opex_sources_created ON opex_embedding_sources(created_at DESC);

-- 2. Documents Table (text chunks)
CREATE TABLE IF NOT EXISTS opex_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES opex_embedding_sources(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    text TEXT NOT NULL,
    token_count INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_id, chunk_index)
);

-- Index for source lookup
CREATE INDEX IF NOT EXISTS idx_opex_docs_source ON opex_documents(source_id);

-- 3. Document Embeddings Table (vectors)
CREATE TABLE IF NOT EXISTS opex_document_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES opex_documents(id) ON DELETE CASCADE,
    embedding vector(1536), -- OpenAI text-embedding-3-small dimension
    model TEXT NOT NULL DEFAULT 'text-embedding-3-small',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(document_id)
);

-- Vector similarity search index (HNSW for performance)
CREATE INDEX IF NOT EXISTS idx_opex_embeddings_vector
    ON opex_document_embeddings
    USING hnsw (embedding vector_cosine_ops);

-- 4. Helper function: Vector similarity search
CREATE OR REPLACE FUNCTION match_opex_documents(
    query_embedding vector(1536),
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 5
)
RETURNS TABLE (
    document_id UUID,
    source_id UUID,
    title TEXT,
    text TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.id AS document_id,
        d.source_id,
        s.title,
        d.text,
        1 - (e.embedding <=> query_embedding) AS similarity
    FROM opex_document_embeddings e
    JOIN opex_documents d ON e.document_id = d.id
    JOIN opex_embedding_sources s ON d.source_id = s.id
    WHERE s.status = 'ready'
        AND (1 - (e.embedding <=> query_embedding)) > match_threshold
    ORDER BY e.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- 5. Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_opex_sources_updated_at
    BEFORE UPDATE ON opex_embedding_sources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. RLS Policies (disabled for service role usage)
ALTER TABLE opex_embedding_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE opex_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE opex_document_embeddings ENABLE ROW LEVEL SECURITY;

-- Grant service role full access
GRANT ALL ON opex_embedding_sources TO service_role;
GRANT ALL ON opex_documents TO service_role;
GRANT ALL ON opex_document_embeddings TO service_role;

-- Allow authenticated users to read
CREATE POLICY "Allow authenticated read access to sources"
    ON opex_embedding_sources FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated read access to documents"
    ON opex_documents FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated read access to embeddings"
    ON opex_document_embeddings FOR SELECT
    TO authenticated
    USING (true);

-- Comments
COMMENT ON TABLE opex_embedding_sources IS 'Source files for RAG knowledge base (S3, Drive, Notion, etc.)';
COMMENT ON TABLE opex_documents IS 'Chunked text extracted from sources';
COMMENT ON TABLE opex_document_embeddings IS 'Vector embeddings for semantic search';
COMMENT ON FUNCTION match_opex_documents IS 'Vector similarity search across OpEx knowledge base';
