# OpEx RAG Integration Guide

Complete guide for integrating the self-healing RAG pipeline with OpEx Next.js application.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    OpEx Next.js Application                      │
│                   (Next.js + React + Vercel)                     │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
         ┌─────────────────────────┐
         │ opex-rag-query Function │
         │   (Supabase Edge Fn)    │
         └────────┬────────────────┘
                  │
      ┌───────────┴───────────┐
      │                       │
      ▼                       ▼
┌─────────────┐       ┌─────────────┐
│  OpEx DB    │       │  OpenAI API │
│ (Supabase)  │       │  GPT-4      │
│             │       │  + RAG      │
│ rag_queries │       │             │
└─────────────┘       └──────┬──────┘
                             │
                             ▼
               ┌──────────────────────┐
               │  Vector Stores (3)    │
               │                       │
               │  vs_policies          │
               │  vs_sops_workflows    │
               │  vs_examples_systems  │
               └───────────────────────┘
```

## Components

### 1. OpEx Supabase (App Data)
- **Project:** `ublqmilcjtpnflofprkr`
- **Database:** Application data, user management, query logs
- **Tables:** `opex.rag_queries` for tracking all RAG queries
- **Edge Functions:** `opex-rag-query` for handling assistant queries

### 2. Finance RAG Supabase (RAG Pipeline)
- **Project:** `xkxyvboeubffxxbebsll`
- **Database:** `embedding_sources` for self-healing pipeline
- **Edge Functions:** `embedding-worker`, `embedding-maintenance`

### 3. OpenAI Vector Stores
- **vs_policies:** Tax/HR/Finance policies and regulations
- **vs_sops_workflows:** Process SOPs and workflows
- **vs_examples_systems:** Templates, forms, system docs

## Deployment Steps

### Step 1: Deploy OpEx Database Schema

```bash
# Connect to OpEx Supabase
export OPEX_POSTGRES_URL="postgresql://postgres.ublqmilcjtpnflofprkr:xxx@aws-1-us-east-1.pooler.supabase.com:6543/postgres"

# Deploy migration
psql "$OPEX_POSTGRES_URL" -f packages/db/migrations/001_opex_rag_queries.sql

# Verify
psql "$OPEX_POSTGRES_URL" -c "\dt opex.*"
```

**Expected Output:**
```
                List of relations
 Schema |    Name     | Type  |    Owner
--------+-------------+-------+-------------
 opex   | rag_queries | table | postgres
```

### Step 2: Deploy OpEx Edge Function

```bash
# Link to OpEx Supabase project
supabase link --project-ref ublqmilcjtpnflofprkr

# Deploy function
supabase functions deploy opex-rag-query --no-verify-jwt --project-ref ublqmilcjtpnflofprkr

# Set secrets
supabase secrets set \
  OPENAI_API_KEY="sk-proj-..." \
  VS_POLICIES_ID="vs_..." \
  VS_SOPS_WORKFLOWS_ID="vs_..." \
  VS_EXAMPLES_SYSTEMS_ID="vs_..." \
  --project-ref ublqmilcjtpnflofprkr
```

**Verify Deployment:**
```bash
curl -X POST "https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/opex-rag-query" \
  -H "Content-Type: application/json" \
  -d '{
    "assistant": "opex",
    "question": "What are the steps for employee onboarding?",
    "domain": "hr",
    "process": "onboarding"
  }'
```

### Step 3: Configure Next.js Environment

**`.env.local`:**
```bash
# OpEx Supabase (App Data)
NEXT_PUBLIC_SUPABASE_URL=https://ublqmilcjtpnflofprkr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPEX_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: For admin operations
OPEX_POSTGRES_URL=postgresql://postgres.ublqmilcjtpnflofprkr:xxx@aws-1-us-east-1.pooler.supabase.com:6543/postgres
```

### Step 4: Install Client Library

```bash
# Install dependencies
pnpm install @supabase/supabase-js
```

## Usage Examples

### Basic Usage

```typescript
import { askOpexAssistant, askPhTaxAssistant } from '@/lib/opex/ragClient';

// HR question
const hrResponse = await askOpexAssistant({
  question: 'What are the steps for employee onboarding?',
  domain: 'hr',
  process: 'onboarding',
});

console.log(hrResponse.answer);
console.log(hrResponse.citations);

// Tax question
const taxResponse = await askPhTaxAssistant({
  question: 'When is the 2550M deadline for January 2025?',
  domain: 'tax',
});

console.log(taxResponse.answer);
```

### Domain-Specific Convenience Functions

```typescript
import {
  askHRQuestion,
  askFinanceQuestion,
  askOpsQuestion,
  askTaxQuestion,
} from '@/lib/opex/ragClient';

// HR
const onboarding = await askHRQuestion(
  'What documents are needed for new hire onboarding?',
  'onboarding'
);

// Finance
const expense = await askFinanceQuestion(
  'What is the meal allowance limit?',
  'expense'
);

// Operations
const ticketing = await askOpsQuestion(
  'How do I create a service ticket?',
  'ticketing'
);

// Tax
const monthEnd = await askTaxQuestion(
  'What are the month-end close steps for Finance Supervisor?',
  'month_end'
);
```

### Process-Specific Convenience Functions

```typescript
import {
  askOnboardingQuestion,
  askOffboardingQuestion,
  askExpenseQuestion,
  askRequisitionQuestion,
  askMonthEndQuestion,
} from '@/lib/opex/ragClient';

// Onboarding
const onboarding = await askOnboardingQuestion(
  'Who approves new hire requisitions?'
);

// Offboarding
const offboarding = await askOffboardingQuestion(
  'What is the IT access removal process?'
);

// Expenses
const expense = await askExpenseQuestion(
  'How long does expense reimbursement take?'
);

// Requisitions
const requisition = await askRequisitionQuestion(
  'What is the approval workflow for employee requisitions?'
);

// Month-end
const monthEnd = await askMonthEndQuestion(
  'What are the internal deadlines for 1601-C preparation?'
);
```

### React Component Example

```typescript
'use client';

import { useState } from 'react';
import { askOpexAssistant } from '@/lib/opex/ragClient';
import type { RAGQueryResponse } from '@/lib/opex/ragClient';

export function OpExAssistant() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<RAGQueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await askOpexAssistant({
        question,
        domain: 'hr', // Could be dynamic based on page/context
        userId: 'current-user-id',
      });

      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Query failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">OpEx Assistant</h2>

      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask me about HR, Finance, or Ops policies and processes..."
          className="w-full p-3 border rounded-lg"
          rows={3}
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
        >
          {loading ? 'Thinking...' : 'Ask'}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {response && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Answer:</h3>
          <div className="prose">{response.answer}</div>

          {response.citations.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              <h4 className="font-semibold">Sources:</h4>
              <ul className="list-disc list-inside">
                {response.citations.map((citation, i) => (
                  <li key={i}>{citation.file_name || 'Document'}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 text-xs text-gray-500">
            Response time: {response.metadata.responseTimeMs}ms
            {response.metadata.tokensUsed && (
              <span className="ml-2">
                Tokens: {response.metadata.tokensUsed.total}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

### Next.js API Route Example

```typescript
// app/api/assistant/route.ts
import { NextResponse } from 'next/server';
import { askOpexAssistant } from '@/lib/opex/ragClient';

export async function POST(request: Request) {
  try {
    const { question, domain, process } = await request.json();

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    const response = await askOpexAssistant({
      question,
      domain,
      process,
      // Get user ID from session/auth
      userId: request.headers.get('x-user-id') || undefined,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Assistant API error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
```

## Analytics and Monitoring

### View Query Analytics

```sql
-- Get analytics for last 7 days
SELECT opex.get_rag_analytics('opex-assistant', 7);

-- Get analytics for PH Tax assistant
SELECT opex.get_rag_analytics('ph-tax-assistant', 7);

-- Get popular questions
SELECT * FROM opex.get_popular_questions('opex-assistant', 30, 10);
```

### Query Logs Dashboard

```typescript
// lib/opex/analytics.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.OPEX_SUPABASE_SERVICE_ROLE_KEY!
);

export async function getQueryAnalytics(
  assistantName: string,
  days: number = 7
) {
  const { data, error } = await supabase.rpc('get_rag_analytics', {
    p_assistant_name: assistantName,
    p_days: days,
  });

  if (error) throw error;
  return data;
}

export async function getPopularQuestions(
  assistantName: string,
  days: number = 30,
  limit: number = 10
) {
  const { data, error } = await supabase.rpc('get_popular_questions', {
    p_assistant_name: assistantName,
    p_days: days,
    p_limit: limit,
  });

  if (error) throw error;
  return data;
}

export async function getRecentQueries(limit: number = 50) {
  const { data, error } = await supabase
    .from('opex.rag_queries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}
```

## User Feedback Integration

### Submit Feedback

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function submitFeedback(
  queryId: string,
  rating: number,
  feedbackText?: string
) {
  const { data, error } = await supabase
    .from('opex.rag_queries')
    .update({
      feedback_rating: rating,
      feedback_text: feedbackText,
      feedback_at: new Date().toISOString(),
    })
    .eq('id', queryId);

  if (error) throw error;
  return data;
}
```

### Feedback UI Component

```typescript
export function FeedbackButtons({ queryId }: { queryId: string }) {
  const [rating, setRating] = useState<number | null>(null);

  const handleRating = async (value: number) => {
    setRating(value);
    await submitFeedback(queryId, value);
  };

  return (
    <div className="flex gap-2 items-center">
      <span className="text-sm text-gray-600">Was this helpful?</span>
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          onClick={() => handleRating(value)}
          className={`text-2xl ${
            rating === value ? 'text-yellow-500' : 'text-gray-300'
          }`}
        >
          ⭐
        </button>
      ))}
    </div>
  );
}
```

## Testing

### Unit Tests

```typescript
// __tests__/ragClient.test.ts
import { describe, it, expect, vi } from 'vitest';
import { askOpexAssistant } from '@/lib/opex/ragClient';

describe('RAG Client', () => {
  it('should query OpEx assistant successfully', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            answer: 'Test answer',
            citations: [],
            metadata: {
              assistantId: 'test',
              threadId: 'test',
              runId: 'test',
              responseTimeMs: 100,
            },
          }),
      })
    ) as any;

    const response = await askOpexAssistant({
      question: 'Test question',
      domain: 'hr',
    });

    expect(response.answer).toBe('Test answer');
  });

  it('should handle errors gracefully', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Test error' }),
      })
    ) as any;

    await expect(
      askOpexAssistant({
        question: 'Test question',
        domain: 'hr',
      })
    ).rejects.toThrow('Test error');
  });
});
```

### Integration Tests

```bash
# Test Edge Function deployment
curl -X POST "https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/opex-rag-query" \
  -H "Content-Type: application/json" \
  -d '{
    "assistant": "opex",
    "question": "What are the steps for employee onboarding?",
    "domain": "hr",
    "process": "onboarding"
  }'

# Should return:
# {
#   "answer": "...",
#   "citations": [...],
#   "metadata": { ... }
# }
```

## Troubleshooting

### Issue: Edge Function Not Found

**Check:**
```bash
supabase functions list --project-ref ublqmilcjtpnflofprkr
```

**Fix:**
```bash
supabase functions deploy opex-rag-query --no-verify-jwt --project-ref ublqmilcjtpnflofprkr
```

### Issue: Secrets Not Set

**Check:**
```bash
supabase secrets list --project-ref ublqmilcjtpnflofprkr
```

**Fix:**
```bash
supabase secrets set OPENAI_API_KEY="sk-proj-..." --project-ref ublqmilcjtpnflofprkr
```

### Issue: Query Logs Not Appearing

**Check:**
```sql
SELECT COUNT(*) FROM opex.rag_queries;
```

**Fix:**
```sql
-- Verify RLS policies
SELECT * FROM pg_policies WHERE tablename = 'rag_queries';
```

## Production Checklist

- [ ] OpEx database migration deployed
- [ ] opex-rag-query Edge Function deployed
- [ ] Edge Function secrets configured
- [ ] Next.js environment variables set
- [ ] Client library integrated
- [ ] Query logging working
- [ ] Analytics functions tested
- [ ] User feedback mechanism implemented
- [ ] Error handling in place
- [ ] Monitoring dashboard created

## Next Steps

1. **Add Internal Content:** Upload HR/Finance/Ops docs to vector stores
2. **Customize System Prompts:** Adjust prompts based on company specifics
3. **Monitor Usage:** Track query analytics and popular questions
4. **Iterate Based on Feedback:** Use feedback ratings to improve responses
5. **Expand Domains:** Add more process-specific convenience functions

---

**Version:** 1.0
**Last Updated:** 2025-01-15
**Status:** Ready for Integration ✅
