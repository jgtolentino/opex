// supabase/functions/rag-ask-tax/index.ts
// Edge function stub for PH tax RAG Q&A.
// Contract matches n8n workflow: POST /rag/ask-tax with { question, context }.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleCorsPreflightRequest, jsonResponseWithCors, errorResponseWithCors } from "../_shared/cors.ts";
import { rateLimitMiddleware, createRateLimitErrorResponse } from "../_shared/ratelimit.ts";

type AskTaxRequest = {
  question: string;
  context?: {
    source?: string;
    user_name?: string;
    channel_id?: string;
    team_id?: string;
    intent?: string;
  };
};

type Citation = {
  title?: string;
  url?: string;
  snippet?: string;
};

type AskTaxResponse = {
  answer: string;
  citations: Citation[];
  confidence: number;      // 0–1
  risk_level: "low" | "medium" | "high";
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest(req);
  }

  // Check rate limit
  const rateLimitResult = rateLimitMiddleware(req);
  if (!rateLimitResult.allowed) {
    console.warn('Rate limit exceeded:', rateLimitResult);
    return createRateLimitErrorResponse(rateLimitResult, origin);
  }

  if (req.method !== "POST") {
    return errorResponseWithCors("Method not allowed", origin, 405);
  }

  let body: AskTaxRequest;
  try {
    body = await req.json();
  } catch {
    return errorResponseWithCors("Invalid JSON body", origin, 400);
  }

  const question = (body.question || "").trim();

  if (!question) {
    return errorResponseWithCors("Missing 'question' in request body", origin, 400);
  }

  // --- 1) Log the query (optional but recommended) ---
  try {
    await supabase.from("ai_feedback").insert({
      kind: "ask_tax",
      question,
      user_name: body.context?.user_name ?? null,
      channel_id: body.context?.channel_id ?? null,
      team_id: body.context?.team_id ?? null,
      extra: body.context ?? null,
    });
  } catch (e) {
    console.error("Failed to log ai_feedback:", e);
    // Do not fail the request just because logging failed.
  }

  // --- 2) TODO: Actual RAG retrieval + LLM call ---
  // For now this is a stub:
  // - Later, you will:
  //   * Embed `question`
  //   * Use `rag_chunks_te_tax` (vector search) to retrieve top-k chunks
  //   * Call your LLM (OpenAI/Anthropic) with those chunks as context
  //   * Return grounded answer + citations

  const placeholderAnswer =
    "This is a placeholder answer from rag-ask-tax. " +
    "RAG and PH tax logic still need to be implemented. " +
    "Do not use this in production for real filings.";

  const response: AskTaxResponse = {
    answer: placeholderAnswer,
    citations: [
      {
        title: "BIR – Placeholder reference",
        url: "https://www.bir.gov.ph/",
        snippet: "Replace this with an actual snippet retrieved from rag_chunks_te_tax.",
      },
    ],
    confidence: 0.0,
    risk_level: "high", // treat stub as high-risk
  };

  return jsonResponseWithCors(response, origin, 200);
});
