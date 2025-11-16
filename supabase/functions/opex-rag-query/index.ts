// ============================================================================
// opex-rag-query/index.ts
// Supabase Edge Function - Query OpEx or PH Tax Assistant with RAG
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import OpenAI from 'https://esm.sh/openai@4';

// Environment variables
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;
const VS_POLICIES_ID = Deno.env.get('VS_POLICIES_ID')!;
const VS_SOPS_WORKFLOWS_ID = Deno.env.get('VS_SOPS_WORKFLOWS_ID')!;
const VS_EXAMPLES_SYSTEMS_ID = Deno.env.get('VS_EXAMPLES_SYSTEMS_ID')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// OpenAI Assistant IDs
const OPEX_ASSISTANT_ID = 'asst_5KOX6w8iqnQq48JxRGBop06c';
const PH_TAX_ASSISTANT_ID = 'asst_JZogV16Xpn6OOKNmPcqj79nT';

// System prompts
const SYSTEM_PROMPTS = {
  'ph-tax-assistant': `You are the "PH Month-End & Tax Copilot" for the Finance team. You assist with Philippine BIR tax compliance and month-end closing tasks. Ground all answers in the RAG knowledge base using file_search. Never answer based only on general knowledge if a relevant document exists.`,
  
  'opex-assistant': `You are the "Operational Excellence Assistant" for HR, Finance, and Operations. You help users navigate and understand policies, processes, and workflows. Ground all answers in the RAG knowledge base using file_search. Never answer policy or process questions from general knowledge alone if relevant documents exist.`,
};

// Initialize clients
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  db: { schema: 'opex' },
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface QueryRequest {
  assistant: 'opex' | 'ph-tax';
  question: string;
  domain?: 'hr' | 'finance' | 'ops' | 'tax' | 'knowledge_base';
  process?: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  metadata?: Record<string, any>;
}

interface QueryResponse {
  answer: string;
  citations: any[];
  metadata: {
    assistantId: string;
    threadId: string;
    runId: string;
    tokensUsed?: {
      prompt: number;
      completion: number;
      total: number;
    };
    responseTimeMs: number;
  };
}

function getSystemPrompt(assistant: string): string {
  const assistantKey = assistant === 'ph-tax' ? 'ph-tax-assistant' : 'opex-assistant';
  return SYSTEM_PROMPTS[assistantKey] || SYSTEM_PROMPTS['opex-assistant'];
}

function buildFileSearchFilters(domain?: string, process?: string): any {
  const filters: any = {};
  if (domain) filters.domain = domain;
  if (process) filters.process = process;
  return Object.keys(filters).length > 0 ? filters : undefined;
}

async function queryAssistant(request: QueryRequest): Promise<QueryResponse> {
  const startTime = Date.now();

  try {
    const thread = await openai.beta.threads.create();
    
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: request.question,
    });

    const fileSearchConfig: any = {
      vector_store_ids: [VS_POLICIES_ID, VS_SOPS_WORKFLOWS_ID, VS_EXAMPLES_SYSTEMS_ID],
    };

    const filters = buildFileSearchFilters(request.domain, request.process);
    if (filters) {
      fileSearchConfig.filter = filters;
    }

    const assistantId = request.assistant === 'ph-tax' ? PH_TAX_ASSISTANT_ID : OPEX_ASSISTANT_ID;

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
    });

    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    if (runStatus.status !== 'completed') {
      throw new Error(`Run failed with status: ${runStatus.status}`);
    }

    const messages = await openai.beta.threads.messages.list(thread.id);
    const assistantMessage = messages.data.find((msg) => msg.role === 'assistant');

    if (!assistantMessage || assistantMessage.content[0]?.type !== 'text') {
      throw new Error('No valid response from assistant');
    }

    const answer = assistantMessage.content[0].text.value;
    const citations = assistantMessage.content[0].text.annotations || [];
    const responseTimeMs = Date.now() - startTime;

    return {
      answer,
      citations,
      metadata: {
        assistantId: run.assistant_id || '',
        threadId: thread.id,
        runId: run.id,
        tokensUsed: runStatus.usage ? {
          prompt: runStatus.usage.prompt_tokens,
          completion: runStatus.usage.completion_tokens,
          total: runStatus.usage.total_tokens,
        } : undefined,
        responseTimeMs,
      },
    };
  } catch (error) {
    const responseTimeMs = Date.now() - startTime;
    throw { error, responseTimeMs };
  }
}

async function logQuery(
  request: QueryRequest,
  response: QueryResponse | null,
  error: any | null,
): Promise<void> {
  console.log('🔍 logQuery called:', {
    assistant: request.assistant,
    question: request.question.substring(0, 50),
    hasResponse: !!response,
    hasError: !!error
  });

  const assistantName = request.assistant === 'ph-tax' ? 'ph-tax-assistant' : 'opex-assistant';

  // Prepare simplified payload with meta field for flexibility
  const insertPayload = {
    question: request.question,
    answer: response?.answer || null,
    user_id: request.userId || null,
    channel: 'edge-function', // Can be updated for Mattermost integration
    meta: {
      assistant_name: assistantName,
      assistant_id: response?.metadata.assistantId || null,
      thread_id: response?.metadata.threadId || null,
      run_id: response?.metadata.runId || null,
      user_email: request.userEmail || null,
      user_role: request.userRole || null,
      domain: request.domain || null,
      process: request.process || null,
      success: !error,
      error_message: error ? (error.message || String(error)) : null,
      response_time_ms: response?.metadata.responseTimeMs || error?.responseTimeMs || null,
      citations: response?.citations || [],
      tokens_used: response?.metadata.tokensUsed || {},
      request_metadata: request.metadata || {}
    }
  };

  console.log('📤 Inserting to opex.rag_queries:', {
    question: insertPayload.question.substring(0, 50),
    hasAnswer: !!insertPayload.answer,
    userId: insertPayload.user_id
  });

  try {
    const { data, error: insertError } = await supabase
      .from('rag_queries')
      .insert(insertPayload)
      .select('id, created_at');

    if (insertError) {
      console.error('❌ Failed to log query:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      });
    } else {
      console.log('✅ Query logged successfully:', {
        id: data?.[0]?.id,
        created_at: data?.[0]?.created_at
      });
    }
  } catch (logError) {
    console.error('💥 Exception while logging query:', {
      error: logError,
      message: (logError as Error).message,
      stack: (logError as Error).stack
    });
    // Never throw - logging is best-effort
  }
}

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
    const request: QueryRequest = await req.json();

    if (!request.assistant || !['opex', 'ph-tax'].includes(request.assistant)) {
      return new Response(
        JSON.stringify({ error: 'Invalid assistant. Must be "opex" or "ph-tax"' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (!request.question || request.question.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Question is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    console.log(`Processing ${request.assistant} query:`, request.question);

    let response: QueryResponse | null = null;
    let error: any | null = null;

    try {
      response = await queryAssistant(request);
    } catch (e: any) {
      error = e.error || e;
      console.error('Assistant query failed:', error);
    }

    await logQuery(request, response, error);

    if (response) {
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(
        JSON.stringify({
          error: error?.message || 'Assistant query failed',
          details: error,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }
  } catch (error) {
    console.error('Handler error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
