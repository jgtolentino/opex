-- ============================================================================
-- 001_opex_rag_queries.sql
-- OpEx RAG Query Logging Table
-- ============================================================================

-- Create schema for OpEx app data
CREATE SCHEMA IF NOT EXISTS opex;

-- Main query log table
CREATE TABLE IF NOT EXISTS opex.rag_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- User tracking
  user_id UUID,
  user_email TEXT,
  user_role TEXT,

  -- Assistant identification
  assistant_name TEXT NOT NULL,  -- 'ph-tax-assistant' | 'opex-assistant'
  assistant_id TEXT,              -- OpenAI assistant ID

  -- Query details
  question TEXT NOT NULL,
  answer TEXT,
  domain TEXT,                    -- 'hr' | 'finance' | 'ops' | 'tax'
  process TEXT,                   -- 'onboarding' | 'offboarding' | 'expense' | 'requisition' | etc.

  -- Result tracking
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  response_time_ms INTEGER,       -- Processing time in milliseconds

  -- Metadata and analytics
  metadata JSONB DEFAULT '{}'::JSONB,
  citations JSONB DEFAULT '[]'::JSONB,  -- Vector store citations
  tokens_used JSONB DEFAULT '{}'::JSONB, -- { prompt: N, completion: M, total: X }

  -- Feedback (for future improvement)
  feedback_rating INTEGER,        -- 1-5 rating
  feedback_text TEXT,
  feedback_at TIMESTAMPTZ,

  -- Indexes for common queries
  CONSTRAINT check_assistant_name CHECK (assistant_name IN ('ph-tax-assistant', 'opex-assistant')),
  CONSTRAINT check_domain CHECK (domain IS NULL OR domain IN ('hr', 'finance', 'ops', 'tax', 'knowledge_base')),
  CONSTRAINT check_feedback_rating CHECK (feedback_rating IS NULL OR (feedback_rating >= 1 AND feedback_rating <= 5))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rag_queries_created_at ON opex.rag_queries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rag_queries_assistant ON opex.rag_queries(assistant_name);
CREATE INDEX IF NOT EXISTS idx_rag_queries_domain ON opex.rag_queries(domain) WHERE domain IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rag_queries_process ON opex.rag_queries(process) WHERE process IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rag_queries_user_id ON opex.rag_queries(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rag_queries_success ON opex.rag_queries(success) WHERE success = false;

-- GIN index for JSONB searches
CREATE INDEX IF NOT EXISTS idx_rag_queries_metadata ON opex.rag_queries USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_rag_queries_citations ON opex.rag_queries USING GIN(citations);

-- RLS (Row Level Security)
ALTER TABLE opex.rag_queries ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role has full access"
  ON opex.rag_queries
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to read their own queries
CREATE POLICY "Users can read their own queries"
  ON opex.rag_queries
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow authenticated users to insert queries (will be set with their user_id)
CREATE POLICY "Users can insert queries"
  ON opex.rag_queries
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow authenticated users to update feedback on their own queries
CREATE POLICY "Users can update their own feedback"
  ON opex.rag_queries
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to get analytics by assistant
CREATE OR REPLACE FUNCTION opex.get_rag_analytics(
  p_assistant_name TEXT DEFAULT NULL,
  p_days INTEGER DEFAULT 7
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT JSONB_BUILD_OBJECT(
    'total_queries', COUNT(*),
    'successful_queries', COUNT(*) FILTER (WHERE success = true),
    'failed_queries', COUNT(*) FILTER (WHERE success = false),
    'success_rate', ROUND((COUNT(*) FILTER (WHERE success = true)::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2),
    'avg_response_time_ms', ROUND(AVG(response_time_ms)),
    'by_domain', (
      SELECT JSONB_OBJECT_AGG(domain, count)
      FROM (
        SELECT COALESCE(domain, 'unknown') AS domain, COUNT(*) AS count
        FROM opex.rag_queries
        WHERE created_at >= NOW() - (p_days || ' days')::INTERVAL
          AND (p_assistant_name IS NULL OR assistant_name = p_assistant_name)
        GROUP BY domain
      ) domain_counts
    ),
    'by_process', (
      SELECT JSONB_OBJECT_AGG(process, count)
      FROM (
        SELECT COALESCE(process, 'unknown') AS process, COUNT(*) AS count
        FROM opex.rag_queries
        WHERE created_at >= NOW() - (p_days || ' days')::INTERVAL
          AND (p_assistant_name IS NULL OR assistant_name = p_assistant_name)
        GROUP BY process
      ) process_counts
    ),
    'avg_feedback_rating', ROUND(AVG(feedback_rating), 2),
    'queries_with_feedback', COUNT(*) FILTER (WHERE feedback_rating IS NOT NULL)
  )
  INTO v_result
  FROM opex.rag_queries
  WHERE created_at >= NOW() - (p_days || ' days')::INTERVAL
    AND (p_assistant_name IS NULL OR assistant_name = p_assistant_name);

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function to get popular questions
CREATE OR REPLACE FUNCTION opex.get_popular_questions(
  p_assistant_name TEXT DEFAULT NULL,
  p_days INTEGER DEFAULT 30,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  question TEXT,
  query_count BIGINT,
  avg_rating NUMERIC,
  domains TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    rq.question,
    COUNT(*) AS query_count,
    ROUND(AVG(rq.feedback_rating), 2) AS avg_rating,
    ARRAY_AGG(DISTINCT rq.domain) FILTER (WHERE rq.domain IS NOT NULL) AS domains
  FROM opex.rag_queries rq
  WHERE rq.created_at >= NOW() - (p_days || ' days')::INTERVAL
    AND (p_assistant_name IS NULL OR rq.assistant_name = p_assistant_name)
  GROUP BY rq.question
  ORDER BY query_count DESC, avg_rating DESC NULLS LAST
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Initial Test Data (Optional - Remove in Production)
-- ============================================================================

-- Uncomment to insert test data
/*
INSERT INTO opex.rag_queries (assistant_name, question, answer, domain, process, success, response_time_ms)
VALUES
  ('ph-tax-assistant', 'When is the 2550M deadline for January 2025?', 'The deadline for filing BIR Form 2550M for January 2025 is February 20, 2025 (20 days following the close of the month).', 'tax', NULL, true, 1234),
  ('opex-assistant', 'What are the steps for employee onboarding?', 'The employee onboarding process involves...', 'hr', 'onboarding', true, 890),
  ('opex-assistant', 'How do I submit an expense report?', 'To submit an expense report...', 'finance', 'expense', true, 1050);
*/

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE opex.rag_queries IS 'Logs all RAG assistant queries for analytics and improvement';
COMMENT ON COLUMN opex.rag_queries.assistant_name IS 'Which assistant handled the query (ph-tax-assistant or opex-assistant)';
COMMENT ON COLUMN opex.rag_queries.domain IS 'Business domain: hr, finance, ops, tax, knowledge_base';
COMMENT ON COLUMN opex.rag_queries.process IS 'Specific process: onboarding, expense, requisition, etc.';
COMMENT ON COLUMN opex.rag_queries.citations IS 'JSON array of vector store citations used in answer';
COMMENT ON COLUMN opex.rag_queries.metadata IS 'Flexible JSONB for additional context (user agent, session, etc.)';
COMMENT ON FUNCTION opex.get_rag_analytics IS 'Get analytics for RAG queries over specified days';
COMMENT ON FUNCTION opex.get_popular_questions IS 'Get most frequently asked questions';
