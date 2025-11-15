// ============================================================================
// ingest-document/index.ts
// Supabase Edge Function - Upload documents to OpenAI Vector Store for RAG
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4'

// Environment variables
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!
const VS_POLICIES_ID = Deno.env.get('VS_POLICIES_ID')!
const VS_SOPS_WORKFLOWS_ID = Deno.env.get('VS_SOPS_WORKFLOWS_ID')!
const VS_EXAMPLES_SYSTEMS_ID = Deno.env.get('VS_EXAMPLES_SYSTEMS_ID')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Initialize clients
const openai = new OpenAI({ apiKey: OPENAI_API_KEY })
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  db: { schema: 'opex' }
})

interface IngestRequest {
  file: File
  userId: string
  userEmail: string
  category?: 'policies' | 'sops' | 'examples'
  domain?: 'hr' | 'finance' | 'ops' | 'tax'
}

interface IngestResponse {
  success: boolean
  fileId: string
  vectorStoreFileId: string
  filename: string
  bytes: number
  metadata: {
    userId: string
    uploadedAt: string
    category: string
    domain: string
  }
}

async function uploadToVectorStore(
  file: File,
  category: string = 'policies'
): Promise<{ fileId: string; vectorStoreFileId: string }> {
  // 1. Upload file to OpenAI
  const uploadedFile = await openai.files.create({
    file: file,
    purpose: 'assistants',
  })

  // 2. Determine which vector store based on category
  let vectorStoreId = VS_POLICIES_ID
  if (category === 'sops') vectorStoreId = VS_SOPS_WORKFLOWS_ID
  if (category === 'examples') vectorStoreId = VS_EXAMPLES_SYSTEMS_ID

  // 3. Add file to vector store
  const vectorStoreFile = await openai.beta.vectorStores.files.create(
    vectorStoreId,
    {
      file_id: uploadedFile.id,
    }
  )

  // 4. Wait for processing to complete
  let fileStatus = await openai.beta.vectorStores.files.retrieve(
    vectorStoreId,
    vectorStoreFile.id
  )

  while (fileStatus.status === 'in_progress') {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    fileStatus = await openai.beta.vectorStores.files.retrieve(
      vectorStoreId,
      vectorStoreFile.id
    )
  }

  if (fileStatus.status !== 'completed') {
    throw new Error(`File processing failed with status: ${fileStatus.status}`)
  }

  return {
    fileId: uploadedFile.id,
    vectorStoreFileId: vectorStoreFile.id,
  }
}

async function logUpload(
  filename: string,
  fileId: string,
  vectorStoreFileId: string,
  bytes: number,
  userId: string,
  userEmail: string,
  category: string,
  domain: string
): Promise<void> {
  try {
    const { error } = await supabase.from('document_uploads').insert({
      filename,
      file_id: fileId,
      vector_store_file_id: vectorStoreFileId,
      bytes,
      user_id: userId,
      user_email: userEmail,
      category,
      domain,
      status: 'completed',
    })

    if (error) {
      console.error('Failed to log upload:', error)
    } else {
      console.log(`✅ Upload logged: ${filename}`)
    }
  } catch (error) {
    console.error('Exception while logging upload:', error)
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers':
          'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string
    const userEmail = formData.get('userEmail') as string
    const category = (formData.get('category') as string) || 'policies'
    const domain = (formData.get('domain') as string) || 'hr'

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
    ]

    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type. Only PDF, Word, TXT, MD allowed' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ error: 'File too large. Maximum size is 10MB' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    console.log(`Processing file: ${file.name} (${file.size} bytes)`)

    // Upload to OpenAI Vector Store
    const { fileId, vectorStoreFileId } = await uploadToVectorStore(file, category)

    // Log to database
    await logUpload(
      file.name,
      fileId,
      vectorStoreFileId,
      file.size,
      userId,
      userEmail,
      category,
      domain
    )

    const response: IngestResponse = {
      success: true,
      fileId,
      vectorStoreFileId,
      filename: file.name,
      bytes: file.size,
      metadata: {
        userId,
        uploadedAt: new Date().toISOString(),
        category,
        domain,
      },
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Ingestion error:', error)
    return new Response(
      JSON.stringify({
        error: (error as Error).message || 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})
