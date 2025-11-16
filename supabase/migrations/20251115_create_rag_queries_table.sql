-- Create schema if not exists
create schema if not exists opex;

-- RAG Query Logging Table
-- Purpose: Track all RAG queries for analytics, debugging, and improvement
create table if not exists opex.rag_queries (
  id            bigserial primary key,
  assistant     text not null,            -- 'opex', 'ph-tax', etc.
  user_id       uuid,                     -- optional auth user
  session_id    text,                     -- chat/session threading
  query_text    text not null,            -- user's question
  answer_text   text,                     -- AI response
  sources       jsonb,                    -- array of source docs/URLs
  model         text,                     -- 'gpt-4o-mini', 'gpt-4-turbo', etc.
  latency_ms    integer,                  -- response time in milliseconds
  error         text,                     -- error message if query failed
  created_at    timestamptz not null default now()
);

-- Performance index for date-based queries
create index if not exists idx_rag_queries_created_at
  on opex.rag_queries (created_at desc);

-- Index for filtering by assistant type
create index if not exists idx_rag_queries_assistant
  on opex.rag_queries (assistant);

-- Enable Row Level Security
alter table opex.rag_queries enable row level security;

-- Policy: service_role can insert (for Edge Functions)
create policy "service_role_can_insert"
  on opex.rag_queries
  for insert
  to service_role
  using (true)
  with check (true);

-- Policy: service_role can select all (for analytics)
create policy "service_role_can_select"
  on opex.rag_queries
  for select
  to service_role
  using (true);

-- Optional: authenticated users can view their own queries
create policy "users_can_view_own"
  on opex.rag_queries
  for select
  to authenticated
  using (user_id is null or auth.uid() = user_id);

-- Comment for documentation
comment on table opex.rag_queries is 'Logs all RAG queries for analytics and debugging';
comment on column opex.rag_queries.assistant is 'Type of assistant: opex, ph-tax, etc.';
comment on column opex.rag_queries.sources is 'JSON array of source documents used for RAG context';
comment on column opex.rag_queries.latency_ms is 'Total query latency including OpenAI API call';
