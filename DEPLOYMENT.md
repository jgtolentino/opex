# OpEx RAG Document Upload - Deployment Guide

## System Overview

**Architecture**: Web UI → Auth0 → Supabase Edge Function → OpenAI Vector Stores → RAG

**Components**:
- Login page with Auth0 authentication
- File upload page with drag-and-drop (PDF, Word, TXT, MD)
- Supabase Edge Function for document ingestion
- Database tracking with RLS policies

## Prerequisites

✅ Completed:
- [x] Login page created (`pages/login.tsx`)
- [x] Upload page created (`pages/upload.tsx`)
- [x] Edge Function created (`supabase/functions/ingest-document/index.ts`)
- [x] Database migration applied (`document_uploads` table with RLS)
- [x] Code committed and pushed to GitHub

## Deployment Steps

### 1. Deploy Supabase Edge Function

**Option A: Supabase Dashboard (Recommended)**
1. Go to https://supabase.com/dashboard/project/ublqmilcjtpnflofprkr/functions
2. Click "Create Function"
3. Name: `ingest-document`
4. Copy contents from `supabase/functions/ingest-document/index.ts`
5. Click "Deploy"

**Option B: CLI (Requires valid access token)**
```bash
# Generate new access token at:
# https://supabase.com/dashboard/account/tokens

export SUPABASE_ACCESS_TOKEN="your_new_token_here"
supabase link --project-ref ublqmilcjtpnflofprkr
supabase functions deploy ingest-document
```

### 2. Configure Supabase Secrets

Go to https://supabase.com/dashboard/project/ublqmilcjtpnflofprkr/settings/vault

Add these secrets:
```bash
OPENAI_API_KEY=<your-openai-api-key>
VS_POLICIES_ID=<policies-vector-store-id>
VS_SOPS_WORKFLOWS_ID=<sops-vector-store-id>
VS_EXAMPLES_SYSTEMS_ID=<examples-vector-store-id>
SUPABASE_URL=https://ublqmilcjtpnflofprkr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

**Where to get these**:
- `OPENAI_API_KEY`: https://platform.openai.com/api-keys
- `VS_*_ID`: Create vector stores at https://platform.openai.com/storage/vector_stores
  - Create 3 stores: "OpEx Policies", "OpEx SOPs & Workflows", "OpEx Examples & Systems"
  - Copy each store's ID (starts with `vs_`)
- `SUPABASE_SERVICE_ROLE_KEY`: Already in `.env.local` file

### 3. Configure Auth0 in Vercel

Go to https://vercel.com/jake-tolentinos-projects-c0369c83/~/integrations/auth0/icfg_UxVctpfDaNtZC1IrbGpbNLca

**Get these values from Auth0 integration**:
1. Domain: `YOUR_AUTH0_DOMAIN.auth0.com`
2. Client ID
3. Client Secret

**Add to Vercel Environment Variables**:
https://vercel.com/jake-tolentinos-projects-c0369c83/opex/settings/environment-variables

```
AUTH0_SECRET=<generate-with-openssl-rand-hex-32>
AUTH0_BASE_URL=https://your-vercel-deployment.vercel.app
AUTH0_ISSUER_BASE_URL=https://YOUR_AUTH0_DOMAIN.auth0.com
AUTH0_CLIENT_ID=<from-auth0-integration>
AUTH0_CLIENT_SECRET=<from-auth0-integration>
```

Generate AUTH0_SECRET:
```bash
openssl rand -hex 32
```

### 4. Update Local Environment

Update `.env.local` with the actual Auth0 values from step 3:
```bash
AUTH0_SECRET='<generated-secret>'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://YOUR_AUTH0_DOMAIN.auth0.com'
AUTH0_CLIENT_ID='<client-id>'
AUTH0_CLIENT_SECRET='<client-secret>'
```

## Testing

### Local Development
```bash
npm run dev
# or
pnpm dev
```

1. Visit http://localhost:3000/login
2. Click "Sign In with Auth0"
3. After authentication, should redirect to `/upload`
4. Try uploading a PDF file
5. Check Supabase logs for Edge Function execution

### Production Testing
1. Visit https://your-vercel-deployment.vercel.app/login
2. Complete authentication flow
3. Upload a test document
4. Verify in database:
```sql
SELECT * FROM opex.document_uploads ORDER BY created_at DESC LIMIT 5;
```

## File Upload Flow

```
1. User drags PDF into dropzone
   ↓
2. React validates: type (PDF/Word/TXT/MD), size (<10MB)
   ↓
3. FormData sent to Supabase Edge Function
   ↓
4. Edge Function validates again (server-side)
   ↓
5. Upload to OpenAI Files API (purpose: 'assistants')
   ↓
6. Add file to appropriate Vector Store (by category)
   ↓
7. Poll until processing complete
   ↓
8. Log to opex.document_uploads table
   ↓
9. Return success to UI
```

## Troubleshooting

### Edge Function fails to deploy
- Check Supabase access token is valid
- Try dashboard deployment instead of CLI
- Verify all environment secrets are set

### Auth0 login fails
- Verify AUTH0_* variables in Vercel
- Check Auth0 callback URL is configured
- Ensure domain and client ID match

### File upload fails
- Check OpenAI API key is valid
- Verify vector store IDs exist
- Check Supabase service role key
- Review Edge Function logs in dashboard

### Database logging fails
- Verify `document_uploads` table exists
- Check RLS policies allow service_role access
- Confirm opex schema exists

## Architecture Decisions

### Why Auth0?
- Already integrated with Vercel
- Handles user management, password resets, MFA
- Zero additional infrastructure

### Why Supabase Edge Functions?
- Deno runtime with TypeScript support
- Direct database access with RLS
- Automatic CORS handling
- Built-in secrets management

### Why OpenAI Vector Stores?
- Native file_search capability
- Automatic chunking and embedding
- Optimized for RAG queries
- Handles PDF, Word, TXT, MD natively

### Why separate vector stores?
- `policies`: Company policies and procedures
- `sops`: Standard Operating Procedures and workflows
- `examples`: Examples and system documentation
- Allows targeted RAG queries by category

## Next Features

- [ ] Add category selection in upload UI
- [ ] Add domain selection (hr, finance, ops, tax)
- [ ] Show upload history from database
- [ ] Add delete functionality
- [ ] Implement RAG query interface
- [ ] Add progress bar during vector store processing
- [ ] Email notifications on upload completion
- [ ] Bulk upload support
