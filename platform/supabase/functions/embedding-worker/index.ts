// ============================================================================
// embedding-worker/index.ts
// Supabase Edge Function - Process pending sources and create embeddings
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import OpenAI from 'https://esm.sh/openai@4';
import { createHash } from 'https://deno.land/std@0.168.0/hash/mod.ts';

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;
const VS_POLICIES_ID = Deno.env.get('VS_POLICIES_ID')!;
const VS_SOPS_WORKFLOWS_ID = Deno.env.get('VS_SOPS_WORKFLOWS_ID')!;
const VS_EXAMPLES_SYSTEMS_ID = Deno.env.get('VS_EXAMPLES_SYSTEMS_ID')!;

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

interface ProcessingResult {
  success: boolean;
  sourceId: string;
  sourceUrl: string;
  vectorStoreId?: string;
  vectorStoreName?: string;
  contentHash?: string;
  contentLength?: number;
  error?: string;
}

/**
 * Route document to appropriate vector store based on doc_type
 */
function routeToVectorStore(docType: string): { id: string; name: string } {
  if (docType === 'policy' || docType === 'calendar') {
    return { id: VS_POLICIES_ID, name: 'vs_policies' };
  }
  if (docType === 'sop' || docType === 'workflow') {
    return { id: VS_SOPS_WORKFLOWS_ID, name: 'vs_sops_workflows' };
  }
  return { id: VS_EXAMPLES_SYSTEMS_ID, name: 'vs_examples_systems' };
}

/**
 * Download content from URL with retry logic
 */
async function downloadContent(url: string, maxRetries = 3): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'PH-Tax-RAG-Bot/1.0 (Finance Knowledge Base)',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const content = await response.text();
      return content;
    } catch (error) {
      lastError = error as Error;
      console.error(`Download attempt ${attempt} failed:`, error);

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Download failed after retries');
}

/**
 * Convert HTML to clean markdown
 */
function htmlToMarkdown(html: string): string {
  // Basic HTML to Markdown conversion
  let markdown = html
    // Remove script and style tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Convert headers
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
    // Convert lists
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    // Convert paragraphs
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    // Convert line breaks
    .replace(/<br\s*\/?>/gi, '\n')
    // Convert strong/bold
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    // Convert emphasis/italic
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    // Remove remaining HTML tags
    .replace(/<[^>]+>/g, '')
    // Decode HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    // Normalize whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return markdown;
}

/**
 * Upload content to OpenAI vector store
 */
async function uploadToVectorStore(
  content: string,
  sourceUrl: string,
  vectorStoreId: string,
): Promise<void> {
  // Create file from content
  const blob = new Blob([content], { type: 'text/markdown' });
  const filename = sourceUrl.split('/').pop() || 'document.md';

  const file = await openai.files.create({
    file: new File([blob], filename, { type: 'text/markdown' }),
    purpose: 'assistants',
  });

  // Add to vector store
  await openai.beta.vectorStores.files.create(vectorStoreId, {
    file_id: file.id,
  });
}

/**
 * Process a single source
 */
async function processSource(source: any): Promise<ProcessingResult> {
  const { id, source_url, doc_type } = source;

  try {
    console.log(`Processing source: ${source_url}`);

    // Download content
    const content = await downloadContent(source_url);
    const contentLength = content.length;

    // Convert HTML to markdown
    const markdown = htmlToMarkdown(content);

    // Calculate content hash
    const hash = createHash('sha256');
    hash.update(markdown);
    const contentHash = hash.toString();

    // Route to vector store
    const vectorStore = routeToVectorStore(doc_type);

    // Upload to OpenAI
    await uploadToVectorStore(markdown, source_url, vectorStore.id);

    console.log(`Successfully processed: ${source_url} → ${vectorStore.name}`);

    return {
      success: true,
      sourceId: id,
      sourceUrl: source_url,
      vectorStoreId: vectorStore.id,
      vectorStoreName: vectorStore.name,
      contentHash,
      contentLength,
    };
  } catch (error) {
    console.error(`Failed to process ${source_url}:`, error);

    return {
      success: false,
      sourceId: id,
      sourceUrl: source_url,
      error: (error as Error).message,
    };
  }
}

/**
 * Main handler
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const { batchSize = 10 } = await req.json().catch(() => ({}));

    // Get next sources to process
    const { data: sources, error: fetchError } = await supabase.rpc(
      'get_next_sources',
      { batch_size: batchSize },
    );

    if (fetchError) {
      throw new Error(`Failed to fetch sources: ${fetchError.message}`);
    }

    if (!sources || sources.length === 0) {
      return new Response(
        JSON.stringify({
          message: 'No pending sources to process',
          processed: 0,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    console.log(`Processing ${sources.length} sources...`);

    // Process sources in parallel (with concurrency limit)
    const CONCURRENCY_LIMIT = 3;
    const results: ProcessingResult[] = [];

    for (let i = 0; i < sources.length; i += CONCURRENCY_LIMIT) {
      const batch = sources.slice(i, i + CONCURRENCY_LIMIT);
      const batchResults = await Promise.all(batch.map(processSource));
      results.push(...batchResults);
    }

    // Record results in database
    for (const result of results) {
      await supabase.rpc('record_processing_result', {
        p_source_id: result.sourceId,
        p_success: result.success,
        p_vector_store_id: result.vectorStoreId,
        p_vector_store_name: result.vectorStoreName,
        p_content_hash: result.contentHash,
        p_content_length: result.contentLength,
        p_error: result.error,
      });
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return new Response(
      JSON.stringify({
        message: 'Processing complete',
        processed: results.length,
        successful: successCount,
        failed: failureCount,
        results: results.map((r) => ({
          url: r.sourceUrl,
          success: r.success,
          vectorStore: r.vectorStoreName,
          error: r.error,
        })),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Worker error:', error);

    return new Response(
      JSON.stringify({
        error: (error as Error).message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
});
