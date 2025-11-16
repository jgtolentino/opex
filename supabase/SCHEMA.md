# OpEx Database Schema Documentation

**Database**: Supabase PostgreSQL (ublqmilcjtpnflofprkr)
**Schema**: `opex`
**Generated**: 2025-11-15

## Tables

### opex.document_uploads

**Purpose**: Tracks all document uploads to OpenAI Vector Stores for RAG knowledge base

**Columns**:
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint | NOT NULL | nextval('opex.document_uploads_id_seq') | Primary key |
| filename | text | NOT NULL | - | Original filename |
| file_id | text | NOT NULL | - | OpenAI file ID |
| vector_store_file_id | text | NOT NULL | - | OpenAI vector store file ID |
| bytes | integer | NOT NULL | - | File size in bytes |
| user_id | text | NOT NULL | - | Auth0 user ID |
| user_email | text | NOT NULL | - | User email address |
| category | text | NOT NULL | 'policies' | policies, sops, or examples - determines which vector store |
| domain | text | NOT NULL | 'hr' | hr, finance, ops, tax |
| status | text | NOT NULL | 'completed' | completed, failed |
| created_at | timestamptz | NOT NULL | now() | Upload timestamp |

**Indexes**:
- `document_uploads_pkey` PRIMARY KEY (id)
- `idx_document_uploads_category` btree (category)
- `idx_document_uploads_created_at` btree (created_at DESC)
- `idx_document_uploads_domain` btree (domain)
- `idx_document_uploads_user_id` btree (user_id)

**Row Level Security Policies**:
1. `service_role_full_access`
   - Roles: service_role
   - Operations: ALL
   - Using: true
   - With Check: true

2. `users_can_view_own_uploads`
   - Roles: authenticated
   - Operations: SELECT
   - Using: (user_id = auth.jwt() ->> 'sub')

**Migration**: `20251115_create_document_uploads_table.sql`

---

### opex.rag_queries

**Purpose**: Logs all RAG query interactions for analytics and debugging

**Columns**:
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NOT NULL | gen_random_uuid() | Primary key |
| question | text | NOT NULL | - | User's question |
| answer | text | NULL | - | RAG system's answer |
| user_id | text | NULL | - | User identifier |
| channel | text | NULL | - | Channel/source (web, chat, etc) |
| created_at | timestamptz | NOT NULL | now() | Query timestamp |
| meta | jsonb | NULL | '{}' | Additional metadata |

**Indexes**:
- `rag_queries_pkey` PRIMARY KEY (id)
- `idx_rag_queries_created_at` btree (created_at DESC)
- `idx_rag_queries_meta` gin (meta)
- `idx_rag_queries_user_id` btree (user_id) WHERE user_id IS NOT NULL

**Row Level Security Policies**:
1. `allow_all_inserts`
   - Roles: anon, authenticated, service_role
   - Operations: INSERT
   - With Check: true

2. `service_role_select_all`
   - Roles: service_role
   - Operations: SELECT
   - Using: true

3. `users_select_own`
   - Roles: authenticated
   - Operations: SELECT
   - Using: (user_id = CURRENT_USER)

---

## Schema Relationships

### Document Upload Flow
```
User (Auth0)
  ↓
pages/upload.tsx
  ↓
supabase/functions/ingest-document
  ↓
OpenAI Files API → Vector Stores
  ↓
opex.document_uploads (audit log)
```

### RAG Query Flow
```
User Question
  ↓
RAG Query System
  ↓
opex.rag_queries (logging)
  ↓
OpenAI Vector Store Search
  ↓
Answer Response
```

---

## Access Patterns

### Document Uploads
1. **User View Own Uploads**:
   ```sql
   SELECT * FROM opex.document_uploads
   WHERE user_id = auth.jwt() ->> 'sub'
   ORDER BY created_at DESC;
   ```

2. **Admin View All Uploads**:
   ```sql
   -- Requires service_role
   SELECT * FROM opex.document_uploads
   ORDER BY created_at DESC;
   ```

3. **Upload Statistics by Category**:
   ```sql
   SELECT category, COUNT(*), SUM(bytes) as total_bytes
   FROM opex.document_uploads
   WHERE status = 'completed'
   GROUP BY category;
   ```

### RAG Queries
1. **Recent Queries**:
   ```sql
   SELECT question, answer, created_at
   FROM opex.rag_queries
   ORDER BY created_at DESC
   LIMIT 10;
   ```

2. **User Query History**:
   ```sql
   SELECT * FROM opex.rag_queries
   WHERE user_id = CURRENT_USER
   ORDER BY created_at DESC;
   ```

3. **Query Analytics**:
   ```sql
   SELECT
     DATE(created_at) as date,
     COUNT(*) as query_count,
     COUNT(DISTINCT user_id) as unique_users
   FROM opex.rag_queries
   GROUP BY DATE(created_at)
   ORDER BY date DESC;
   ```

---

## Security Model

### Authentication
- **Auth0**: Handles user authentication and JWT tokens
- **Supabase Auth**: Validates JWT and enforces RLS policies

### Row Level Security
- **document_uploads**: Users can only view their own uploads; service_role has full access
- **rag_queries**: Anyone can insert; users can only view their own queries; service_role has full access

### API Keys
- **OPENAI_API_KEY**: Stored in Supabase secrets (Edge Function access only)
- **SUPABASE_SERVICE_ROLE_KEY**: Backend services only (never exposed to client)
- **SUPABASE_ANON_KEY**: Safe for client use (RLS enforces permissions)

---

## Vector Store Categories

### 1. Policies (VS_POLICIES_ID)
- Company policies
- HR policies
- Compliance documents
- General procedures

### 2. SOPs & Workflows (VS_SOPS_WORKFLOWS_ID)
- Standard Operating Procedures
- Workflow documentation
- Process guides
- Step-by-step instructions

### 3. Examples & Systems (VS_EXAMPLES_SYSTEMS_ID)
- System documentation
- Code examples
- Technical guides
- Integration examples

---

## Migration History

| Date | Migration | Description |
|------|-----------|-------------|
| 2025-11-15 | 20251115_create_document_uploads_table.sql | Initial document_uploads table with RLS |
| (Prior) | - | rag_queries table (pre-existing) |

---

## Future Schema Enhancements

### Planned Additions
- [ ] `opex.vector_stores` - Track vector store metadata
- [ ] `opex.rag_feedback` - User feedback on RAG answers
- [ ] `opex.upload_errors` - Failed upload tracking
- [ ] `opex.api_usage` - OpenAI API usage tracking
- [ ] `opex.user_preferences` - User settings and preferences

### Planned Indexes
- [ ] Full-text search on document_uploads.filename
- [ ] Composite index on (user_id, created_at) for document_uploads
- [ ] GIN index on rag_queries.question for similarity search

### Planned Functions
- [ ] `get_user_upload_stats()` - User upload statistics
- [ ] `get_popular_queries()` - Most common RAG queries
- [ ] `cleanup_old_uploads()` - Archive/delete old uploads
