-- ============================================================================
-- embedding_sources.sql
-- Self-Healing RAG Pipeline - Source Tracking Table
-- ============================================================================

-- Create enum types
CREATE TYPE embedding_status AS ENUM (
  'pending',      -- Awaiting first crawl
  'crawled',      -- Content downloaded, awaiting embedding
  'embedded',     -- Successfully embedded in vector store
  'failed',       -- Processing failed
  'stale'         -- Content outdated, needs re-crawl
);

CREATE TYPE doc_type_enum AS ENUM (
  'policy',          -- Official regulations and deadlines
  'calendar',        -- Tax calendars and schedules
  'sop',            -- Standard operating procedures
  'workflow',       -- Process workflows
  'example',        -- Sample forms and templates
  'system_manual'   -- System documentation
);

-- Main tracking table
CREATE TABLE IF NOT EXISTS embedding_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Source identification
  source_url TEXT NOT NULL UNIQUE,
  authority_rank INTEGER NOT NULL DEFAULT 5,

  -- Classification
  doc_type doc_type_enum NOT NULL,
  form TEXT,                      -- BIR form identifier (e.g., "1601C", "2550Q")
  domain TEXT NOT NULL,           -- "tax", "month_end", "systems"
  jurisdiction TEXT DEFAULT 'PH', -- Country/region code

  -- Vector store routing
  vector_store_id TEXT,           -- OpenAI vector store ID after upload
  vector_store_name TEXT,         -- vs_policies, vs_sops_workflows, vs_examples_systems

  -- Crawl tracking
  last_crawled_at TIMESTAMPTZ,
  last_embedded_at TIMESTAMPTZ,
  status embedding_status NOT NULL DEFAULT 'pending',

  -- Failure handling
  failure_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,

  -- Change detection
  content_hash TEXT,              -- SHA-256 hash of content
  content_length INTEGER,         -- Byte size of downloaded content

  -- Flexible metadata (JSONB for extensibility)
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_embedding_sources_status ON embedding_sources(status);
CREATE INDEX IF NOT EXISTS idx_embedding_sources_doc_type ON embedding_sources(doc_type);
CREATE INDEX IF NOT EXISTS idx_embedding_sources_authority_rank ON embedding_sources(authority_rank DESC);
CREATE INDEX IF NOT EXISTS idx_embedding_sources_last_crawled ON embedding_sources(last_crawled_at DESC);
CREATE INDEX IF NOT EXISTS idx_embedding_sources_domain ON embedding_sources(domain);
CREATE INDEX IF NOT EXISTS idx_embedding_sources_form ON embedding_sources(form) WHERE form IS NOT NULL;

-- GIN index for JSONB metadata queries
CREATE INDEX IF NOT EXISTS idx_embedding_sources_metadata ON embedding_sources USING GIN(metadata);

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_embedding_sources_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_embedding_sources_timestamp
  BEFORE UPDATE ON embedding_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_embedding_sources_timestamp();

-- RLS (Row Level Security) policies
ALTER TABLE embedding_sources ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role has full access"
  ON embedding_sources
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users read access
CREATE POLICY "Authenticated users can read"
  ON embedding_sources
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to mark stale sources (>30 days since last crawl)
CREATE OR REPLACE FUNCTION mark_stale_sources(staleness_days INTEGER DEFAULT 30)
RETURNS TABLE (
  marked_count INTEGER,
  stale_sources JSONB
) AS $$
DECLARE
  v_marked_count INTEGER;
  v_stale_sources JSONB;
BEGIN
  -- Update stale sources
  WITH updated AS (
    UPDATE embedding_sources
    SET
      status = 'stale',
      updated_at = NOW()
    WHERE
      status IN ('embedded', 'crawled')
      AND last_crawled_at < NOW() - (staleness_days || ' days')::INTERVAL
    RETURNING id, source_url, last_crawled_at
  )
  SELECT
    COUNT(*)::INTEGER,
    JSONB_AGG(ROW_TO_JSON(updated))
  INTO v_marked_count, v_stale_sources
  FROM updated;

  RETURN QUERY SELECT v_marked_count, COALESCE(v_stale_sources, '[]'::JSONB);
END;
$$ LANGUAGE plpgsql;

-- Function to get next sources for processing
CREATE OR REPLACE FUNCTION get_next_sources(batch_size INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  source_url TEXT,
  doc_type doc_type_enum,
  authority_rank INTEGER,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    es.id,
    es.source_url,
    es.doc_type,
    es.authority_rank,
    es.metadata
  FROM embedding_sources es
  WHERE
    es.status IN ('pending', 'stale')
    AND es.failure_count < 3
  ORDER BY
    es.authority_rank DESC,
    es.created_at ASC
  LIMIT batch_size
  FOR UPDATE SKIP LOCKED;
END;
$$ LANGUAGE plpgsql;

-- Function to record processing result
CREATE OR REPLACE FUNCTION record_processing_result(
  p_source_id UUID,
  p_success BOOLEAN,
  p_vector_store_id TEXT DEFAULT NULL,
  p_vector_store_name TEXT DEFAULT NULL,
  p_content_hash TEXT DEFAULT NULL,
  p_content_length INTEGER DEFAULT NULL,
  p_error TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  IF p_success THEN
    UPDATE embedding_sources
    SET
      status = 'embedded',
      last_crawled_at = NOW(),
      last_embedded_at = NOW(),
      vector_store_id = COALESCE(p_vector_store_id, vector_store_id),
      vector_store_name = COALESCE(p_vector_store_name, vector_store_name),
      content_hash = COALESCE(p_content_hash, content_hash),
      content_length = COALESCE(p_content_length, content_length),
      failure_count = 0,
      last_error = NULL,
      updated_at = NOW()
    WHERE id = p_source_id;
  ELSE
    UPDATE embedding_sources
    SET
      status = 'failed',
      failure_count = failure_count + 1,
      last_error = p_error,
      updated_at = NOW()
    WHERE id = p_source_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get health metrics
CREATE OR REPLACE FUNCTION get_embedding_health()
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT JSONB_BUILD_OBJECT(
    'total_sources', COUNT(*),
    'by_status', JSONB_OBJECT_AGG(status, count),
    'failed_sources', (SELECT COUNT(*) FROM embedding_sources WHERE failure_count >= 3),
    'stale_sources', (SELECT COUNT(*) FROM embedding_sources
                      WHERE last_crawled_at < NOW() - INTERVAL '30 days'),
    'avg_failure_count', ROUND(AVG(failure_count)::NUMERIC, 2),
    'last_successful_embed', (SELECT MAX(last_embedded_at) FROM embedding_sources
                              WHERE status = 'embedded'),
    'oldest_pending', (SELECT MIN(created_at) FROM embedding_sources
                      WHERE status = 'pending')
  )
  INTO v_result
  FROM (
    SELECT status, COUNT(*)::INTEGER AS count
    FROM embedding_sources
    GROUP BY status
  ) status_counts;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Initial Data: Seed existing downloaded files
-- ============================================================================

INSERT INTO embedding_sources (source_url, authority_rank, doc_type, form, domain, status, metadata) VALUES
  -- BIR Official Documents (Authority Rank 10 - Government source)
  ('https://efps.bir.gov.ph/efps-war/EFPSWeb_war/help/help1601c_v2.html', 10, 'policy', '1601C', 'tax', 'pending',
   '{"notes": "Official BIR online guidelines for 1601-C monthly remittance", "local_file": "raw_docs/bir/1601C_instructions.html"}'::JSONB),

  ('https://www.bir.gov.ph/images/bir_files/internal_communications_1_2018/Full%20Text%20RA%2010963%20TRAIN.pdf', 10, 'policy', '1601C', 'tax', 'pending',
   '{"notes": "Official Form 1601-C with complete instructions", "local_file": "raw_docs/bir/1601C_form_2018.pdf"}'::JSONB),

  ('https://efps.bir.gov.ph/efps-war/EFPSWeb_war/help/help2550m.html', 10, 'policy', '2550M', 'tax', 'pending',
   '{"notes": "Official BIR guidelines for monthly VAT declaration", "local_file": "raw_docs/bir/2550M_instructions.html"}'::JSONB),

  ('https://www.bir.gov.ph/images/bir_files/old_files/pdf/56836BIR%20Form%20No.%202550Q%20EVRAA.pdf', 10, 'policy', '2550Q', 'tax', 'pending',
   '{"notes": "Quarterly VAT return form (latest version)", "local_file": "raw_docs/bir/2550Q_form_2024.pdf"}'::JSONB),

  ('https://www.bir.gov.ph/images/bir_files/internal_communications_1_2024/RR%20No.%206-2024.pdf', 10, 'policy', '2550Q', 'tax', 'pending',
   '{"notes": "Complete Q2 2024 quarterly filing guidelines", "local_file": "raw_docs/bir/2550Q_guidelines_2024.pdf"}'::JSONB),

  -- Month-End Closing Best Practices (Authority Rank 7-8 - Reputable firms)
  ('https://www.virtuecpas.com/resource-center/month-end-close-checklist/', 8, 'workflow', NULL, 'month_end', 'pending',
   '{"notes": "Comprehensive month-end close procedures from accounting firm", "local_file": "raw_docs/sop_workflows/month_end_close_virtuecpas.html"}'::JSONB),

  ('https://www.prophix.com/resource/month-end-close-process/', 7, 'workflow', NULL, 'month_end', 'pending',
   '{"notes": "FP&A platform month-end closing best practices", "local_file": "raw_docs/sop_workflows/month_end_close_prophix.html"}'::JSONB),

  ('https://www.netsuite.com/portal/resource/articles/financial-management/financial-close.shtml', 7, 'workflow', NULL, 'month_end', 'pending',
   '{"notes": "ERP platform financial close process guide", "local_file": "raw_docs/sop_workflows/financial_close_netsuite.html"}'::JSONB),

  ('https://www.brex.com/journal/month-end-close', 8, 'workflow', NULL, 'month_end', 'pending',
   '{"notes": "Modern finance platform GAAP/IFRS compliance guide", "local_file": "raw_docs/sop_workflows/month_end_close_brex.html"}'::JSONB)
ON CONFLICT (source_url) DO NOTHING;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE embedding_sources IS 'Tracks all sources for the Finance + PH Tax RAG knowledge base with self-healing capabilities';
COMMENT ON COLUMN embedding_sources.authority_rank IS 'Philippine authority ranking: 10=Government, 9=Big-4, 8=Local firms, 7=Platforms, 6=Blogs, 5=Other';
COMMENT ON COLUMN embedding_sources.content_hash IS 'SHA-256 hash for change detection and de-duplication';
COMMENT ON COLUMN embedding_sources.metadata IS 'Flexible JSONB field for extensible metadata (role_primary, section, activity_type, etc.)';
COMMENT ON FUNCTION mark_stale_sources IS 'Automatically marks sources as stale if not crawled within specified days (default 30)';
COMMENT ON FUNCTION get_next_sources IS 'Returns next batch of sources to process, ordered by authority rank and age';
COMMENT ON FUNCTION record_processing_result IS 'Records the result of crawling/embedding attempt with success/failure tracking';
COMMENT ON FUNCTION get_embedding_health IS 'Returns health metrics for monitoring dashboard';
