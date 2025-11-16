-- Create document_uploads table for tracking uploaded files
create table if not exists opex.document_uploads (
  id            bigserial primary key,
  filename      text not null,
  file_id       text not null,              -- OpenAI file ID
  vector_store_file_id text not null,       -- OpenAI vector store file ID
  bytes         integer not null,
  user_id       text not null,
  user_email    text not null,
  category      text not null default 'policies', -- policies, sops, examples
  domain        text not null default 'hr',       -- hr, finance, ops, tax
  status        text not null default 'completed', -- completed, failed
  created_at    timestamptz not null default now()
);

-- Performance indexes
create index if not exists idx_document_uploads_created_at
  on opex.document_uploads (created_at desc);

create index if not exists idx_document_uploads_user_id
  on opex.document_uploads (user_id);

create index if not exists idx_document_uploads_category
  on opex.document_uploads (category);

create index if not exists idx_document_uploads_domain
  on opex.document_uploads (domain);

-- Enable Row Level Security
alter table opex.document_uploads enable row level security;

-- Policy: service_role can do anything
create policy "service_role_full_access"
  on opex.document_uploads
  for all
  to service_role
  using (true)
  with check (true);

-- Policy: users can view their own uploads
create policy "users_can_view_own_uploads"
  on opex.document_uploads
  for select
  to authenticated
  using (user_id = auth.jwt() ->> 'sub');

-- Comments
comment on table opex.document_uploads is 'Tracks all document uploads to OpenAI Vector Stores';
comment on column opex.document_uploads.file_id is 'OpenAI file ID';
comment on column opex.document_uploads.vector_store_file_id is 'OpenAI vector store file ID';
comment on column opex.document_uploads.category is 'policies, sops, or examples - determines which vector store';
