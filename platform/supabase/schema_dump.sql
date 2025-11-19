                                                                                                  Table "opex.document_uploads"
        Column        |           Type           | Collation | Nullable |                      Default                      | Storage  | Compression | Stats target |                         Description                         
----------------------+--------------------------+-----------+----------+---------------------------------------------------+----------+-------------+--------------+-------------------------------------------------------------
 id                   | bigint                   |           | not null | nextval('opex.document_uploads_id_seq'::regclass) | plain    |             |              | 
 filename             | text                     |           | not null |                                                   | extended |             |              | 
 file_id              | text                     |           | not null |                                                   | extended |             |              | OpenAI file ID
 vector_store_file_id | text                     |           | not null |                                                   | extended |             |              | OpenAI vector store file ID
 bytes                | integer                  |           | not null |                                                   | plain    |             |              | 
 user_id              | text                     |           | not null |                                                   | extended |             |              | 
 user_email           | text                     |           | not null |                                                   | extended |             |              | 
 category             | text                     |           | not null | 'policies'::text                                  | extended |             |              | policies, sops, or examples - determines which vector store
 domain               | text                     |           | not null | 'hr'::text                                        | extended |             |              | 
 status               | text                     |           | not null | 'completed'::text                                 | extended |             |              | 
 created_at           | timestamp with time zone |           | not null | now()                                             | plain    |             |              | 
Indexes:
    "document_uploads_pkey" PRIMARY KEY, btree (id)
    "idx_document_uploads_category" btree (category)
    "idx_document_uploads_created_at" btree (created_at DESC)
    "idx_document_uploads_domain" btree (domain)
    "idx_document_uploads_user_id" btree (user_id)
Policies:
    POLICY "service_role_full_access"
      TO service_role
      USING (true)
      WITH CHECK (true)
    POLICY "users_can_view_own_uploads" FOR SELECT
      TO authenticated
      USING ((user_id = (auth.jwt() ->> 'sub'::text)))
Access method: heap

                                                        Table "opex.rag_queries"
   Column   |           Type           | Collation | Nullable |      Default      | Storage  | Compression | Stats target | Description 
------------+--------------------------+-----------+----------+-------------------+----------+-------------+--------------+-------------
 id         | uuid                     |           | not null | gen_random_uuid() | plain    |             |              | 
 question   | text                     |           | not null |                   | extended |             |              | 
 answer     | text                     |           |          |                   | extended |             |              | 
 user_id    | text                     |           |          |                   | extended |             |              | 
 channel    | text                     |           |          |                   | extended |             |              | 
 created_at | timestamp with time zone |           | not null | now()             | plain    |             |              | 
 meta       | jsonb                    |           |          | '{}'::jsonb       | extended |             |              | 
Indexes:
    "rag_queries_pkey" PRIMARY KEY, btree (id)
    "idx_rag_queries_created_at" btree (created_at DESC)
    "idx_rag_queries_meta" gin (meta)
    "idx_rag_queries_user_id" btree (user_id) WHERE user_id IS NOT NULL
Policies:
    POLICY "allow_all_inserts" FOR INSERT
      TO anon,authenticated,service_role
      WITH CHECK (true)
    POLICY "service_role_select_all" FOR SELECT
      TO service_role
      USING (true)
    POLICY "users_select_own" FOR SELECT
      TO authenticated
      USING ((user_id = CURRENT_USER))
Access method: heap

 schemaname |    tablename     |            indexname            |                                                  indexdef                                                  
------------+------------------+---------------------------------+------------------------------------------------------------------------------------------------------------
 opex       | document_uploads | document_uploads_pkey           | CREATE UNIQUE INDEX document_uploads_pkey ON opex.document_uploads USING btree (id)
 opex       | document_uploads | idx_document_uploads_category   | CREATE INDEX idx_document_uploads_category ON opex.document_uploads USING btree (category)
 opex       | document_uploads | idx_document_uploads_created_at | CREATE INDEX idx_document_uploads_created_at ON opex.document_uploads USING btree (created_at DESC)
 opex       | document_uploads | idx_document_uploads_domain     | CREATE INDEX idx_document_uploads_domain ON opex.document_uploads USING btree (domain)
 opex       | document_uploads | idx_document_uploads_user_id    | CREATE INDEX idx_document_uploads_user_id ON opex.document_uploads USING btree (user_id)
 opex       | rag_queries      | idx_rag_queries_created_at      | CREATE INDEX idx_rag_queries_created_at ON opex.rag_queries USING btree (created_at DESC)
 opex       | rag_queries      | idx_rag_queries_meta            | CREATE INDEX idx_rag_queries_meta ON opex.rag_queries USING gin (meta)
 opex       | rag_queries      | idx_rag_queries_user_id         | CREATE INDEX idx_rag_queries_user_id ON opex.rag_queries USING btree (user_id) WHERE (user_id IS NOT NULL)
 opex       | rag_queries      | rag_queries_pkey                | CREATE UNIQUE INDEX rag_queries_pkey ON opex.rag_queries USING btree (id)
(9 rows)

 schemaname |    tablename     |         policyname         | permissive |               roles               |  cmd   |                   qual                   | with_check 
------------+------------------+----------------------------+------------+-----------------------------------+--------+------------------------------------------+------------
 opex       | document_uploads | service_role_full_access   | PERMISSIVE | {service_role}                    | ALL    | true                                     | true
 opex       | document_uploads | users_can_view_own_uploads | PERMISSIVE | {authenticated}                   | SELECT | (user_id = (auth.jwt() ->> 'sub'::text)) | 
 opex       | rag_queries      | allow_all_inserts          | PERMISSIVE | {anon,authenticated,service_role} | INSERT |                                          | true
 opex       | rag_queries      | service_role_select_all    | PERMISSIVE | {service_role}                    | SELECT | true                                     | 
 opex       | rag_queries      | users_select_own           | PERMISSIVE | {authenticated}                   | SELECT | (user_id = CURRENT_USER)                 | 
(5 rows)

