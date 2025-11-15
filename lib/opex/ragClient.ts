// ============================================================================
// lib/opex/ragClient.ts
// OpEx RAG Assistant Client - Next.js Wrapper
// ============================================================================

export type AssistantType = 'opex' | 'ph-tax';

export type Domain = 'hr' | 'finance' | 'ops' | 'tax' | 'knowledge_base';

export interface RAGQueryRequest {
  assistant: AssistantType;
  question: string;
  domain?: Domain;
  process?: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  metadata?: Record<string, any>;
}

export interface RAGQueryResponse {
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

export interface RAGQueryError {
  error: string;
  details?: any;
}

/**
 * Query OpEx or PH Tax Assistant via Supabase Edge Function
 */
export async function askAssistant(
  request: RAGQueryRequest,
): Promise<RAGQueryResponse> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL not configured');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/opex-rag-query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error: RAGQueryError = await response.json();
    throw new Error(error.error || 'RAG query failed');
  }

  return response.json();
}

/**
 * Convenience wrappers for specific assistants
 */

export async function askOpexAssistant(payload: {
  question: string;
  domain?: Domain;
  process?: string;
  userId?: string;
  metadata?: Record<string, any>;
}): Promise<RAGQueryResponse> {
  return askAssistant({
    assistant: 'opex',
    ...payload,
  });
}

export async function askPhTaxAssistant(payload: {
  question: string;
  domain?: Domain;
  process?: string;
  userId?: string;
  metadata?: Record<string, any>;
}): Promise<RAGQueryResponse> {
  return askAssistant({
    assistant: 'ph-tax',
    ...payload,
  });
}

/**
 * Domain-specific convenience wrappers
 */

export async function askHRQuestion(
  question: string,
  process?: string,
): Promise<RAGQueryResponse> {
  return askOpexAssistant({
    question,
    domain: 'hr',
    process,
  });
}

export async function askFinanceQuestion(
  question: string,
  process?: string,
): Promise<RAGQueryResponse> {
  return askOpexAssistant({
    question,
    domain: 'finance',
    process,
  });
}

export async function askOpsQuestion(
  question: string,
  process?: string,
): Promise<RAGQueryResponse> {
  return askOpexAssistant({
    question,
    domain: 'ops',
    process,
  });
}

export async function askTaxQuestion(
  question: string,
  process?: string,
): Promise<RAGQueryResponse> {
  return askPhTaxAssistant({
    question,
    domain: 'tax',
    process,
  });
}

/**
 * Process-specific convenience wrappers
 */

export async function askOnboardingQuestion(
  question: string,
): Promise<RAGQueryResponse> {
  return askOpexAssistant({
    question,
    domain: 'hr',
    process: 'onboarding',
  });
}

export async function askOffboardingQuestion(
  question: string,
): Promise<RAGQueryResponse> {
  return askOpexAssistant({
    question,
    domain: 'hr',
    process: 'offboarding',
  });
}

export async function askExpenseQuestion(
  question: string,
): Promise<RAGQueryResponse> {
  return askOpexAssistant({
    question,
    domain: 'finance',
    process: 'expense',
  });
}

export async function askRequisitionQuestion(
  question: string,
): Promise<RAGQueryResponse> {
  return askOpexAssistant({
    question,
    domain: 'hr',
    process: 'requisition',
  });
}

export async function askMonthEndQuestion(
  question: string,
): Promise<RAGQueryResponse> {
  return askPhTaxAssistant({
    question,
    domain: 'tax',
    process: 'month_end',
  });
}
