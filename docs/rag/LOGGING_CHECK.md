# OpEx RAG Query Logging Fix

## Issue Summary

The Edge Function was successfully returning RAG answers but queries weren't being logged to `opex.rag_queries` table due to schema mismatch between the logging code and the actual database schema.

## Root Cause

The `logQuery()` function was using incorrect column names that didn't match the database schema:

| Incorrect Column | Correct Column |
|-----------------|----------------|
| `assistant` | `assistant_name` |
| `query_text` | `question` |
| `answer_text` | `answer` |
| `sources` | `citations` |
| `latency_ms` | `response_time_ms` |
| `error` | `error_message` |
| `session_id` | ❌ (doesn't exist) |
| `model` | ❌ (doesn't exist) |

## Fix Applied

### Code Diff (lines 142-177)

**BEFORE:**
```typescript
async function logQuery(
  request: QueryRequest,
  response: QueryResponse | null,
  error: any | null,
): Promise<void> {
  const assistantName = request.assistant === 'ph-tax' ? 'ph-tax' : 'opex';
  const model = 'gpt-4o-mini'; // Update if using different model

  try {
    const { error: insertError } = await supabase.from('rag_queries').insert({
      assistant: assistantName,
      user_id: request.userId || null,
      session_id: response?.metadata.threadId || null,
      query_text: request.question,
      answer_text: response?.answer || null,
      sources: response?.citations ? JSON.stringify(response.citations) : null,
      model: model,
      latency_ms: response?.metadata.responseTimeMs || error?.responseTimeMs || null,
      error: error ? (error.message || String(error)) : null,
    });

    if (insertError) {
      console.error('Failed to log query to opex.rag_queries:', insertError);
    } else {
      console.log(`✅ Query logged: ${request.question.substring(0, 50)}...`);
    }
  } catch (logError) {
    console.error('Exception while logging query:', logError);
    // Never throw - logging is best-effort
  }
}
```

**AFTER:**
```typescript
async function logQuery(
  request: QueryRequest,
  response: QueryResponse | null,
  error: any | null,
): Promise<void> {
  const assistantName = request.assistant === 'ph-tax' ? 'ph-tax-assistant' : 'opex-assistant';

  try {
    const { error: insertError } = await supabase.from('rag_queries').insert({
      assistant_name: assistantName,
      assistant_id: response?.metadata.assistantId || null,
      user_id: request.userId || null,
      user_email: request.userEmail || null,
      user_role: request.userRole || null,
      question: request.question,
      answer: response?.answer || null,
      domain: request.domain || null,
      process: request.process || null,
      success: !error,
      error_message: error ? (error.message || String(error)) : null,
      response_time_ms: response?.metadata.responseTimeMs || error?.responseTimeMs || null,
      citations: response?.citations || [],
      tokens_used: response?.metadata.tokensUsed || {},
      metadata: request.metadata || {},
    });

    if (insertError) {
      console.error('Failed to log query to opex.rag_queries:', insertError);
    } else {
      console.log(`✅ Query logged: ${request.question.substring(0, 50)}...`);
    }
  } catch (logError) {
    console.error('Exception while logging query:', logError);
    // Never throw - logging is best-effort
  }
}
```

### Key Changes:
1. ✅ **Column Names**: All column names now match the actual database schema
2. ✅ **Assistant Name**: Changed from `'ph-tax'/'opex'` to `'ph-tax-assistant'/'opex-assistant'` to match CHECK constraint
3. ✅ **JSONB Fields**: Using direct JSONB assignment for `citations`, `tokens_used`, `metadata` instead of JSON.stringify
4. ✅ **Complete Fields**: Now populating all available fields from the request/response
5. ✅ **Success Flag**: Using `!error` to set the success boolean
6. ✅ **Removed Non-Existent**: Removed `session_id` and `model` columns that don't exist in the table

## Test Harness

### 1. Deploy the Updated Function

**Option A: Dashboard Deployment (Recommended)**
1. Open https://supabase.com/dashboard/project/ublqmilcjtpnflofprkr/functions/opex-rag-query
2. Go to "Code" tab
3. Paste the updated code from `/Users/tbwa/opex/supabase/functions/opex-rag-query/index.ts`
4. Ensure "Verify JWT" is UNCHECKED
5. Click "Deploy"

**Option B: CLI Deployment**
```bash
supabase functions deploy opex-rag-query \
  --workdir /Users/tbwa/opex \
  --no-verify-jwt \
  --project-ref ublqmilcjtpnflofprkr
```

### 2. Test Query

```bash
curl -X POST https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/opex-rag-query \
  -H 'Content-Type: application/json' \
  -d '{"assistant":"opex","question":"What is OpEx?","userId":"test-user-logging","domain":"knowledge_base"}'
```

**Expected Response:**
```json
{
  "answer": "[RAG answer from OpEx knowledge base]",
  "citations": [...],
  "metadata": {
    "assistantId": "asst_5KOX6w8iqnQq48JxRGBop06c",
    "threadId": "thread_...",
    "runId": "run_...",
    "tokensUsed": {
      "prompt": 123,
      "completion": 456,
      "total": 579
    },
    "responseTimeMs": 5432
  }
}
```

### 3. Verify Logging

```bash
psql "postgres://postgres.ublqmilcjtpnflofprkr:1G8TRd5wE7b9szBH@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require" \
  -c "SELECT question, assistant_name, domain, success, response_time_ms, created_at FROM opex.rag_queries WHERE question = 'What is OpEx?' ORDER BY created_at DESC LIMIT 1;"
```

**Expected Output:**
```
        question        | assistant_name | domain | success | response_time_ms |         created_at
-----------------------+----------------+--------+---------+------------------+----------------------------
 What is OpEx?         | opex-assistant | knowledge_base | t       |             5432 | 2025-01-10 15:30:45.123+00
(1 row)
```

### 4. Check Last 3 Queries

```bash
psql "postgres://postgres.ublqmilcjtpnflofprkr:1G8TRd5wE7b9szBH@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require" \
  -c "SELECT question, assistant_name, success, response_time_ms, created_at FROM opex.rag_queries ORDER BY created_at DESC LIMIT 3;"
```

## Example Log Output

### Successful Insert:
```
Processing opex query: What is OpEx?
✅ Query logged: What is OpEx?...
```

### Simulated Failure (if schema still mismatched):
```
Processing opex query: What is OpEx?
Failed to log query to opex.rag_queries: {
  code: '42703',
  details: null,
  hint: 'Perhaps you meant to reference the column "rag_queries.assistant_name".',
  message: 'column "assistant" of relation "rag_queries" does not exist'
}
```

## Database Schema Reference

```sql
CREATE TABLE opex.rag_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID,
  user_email TEXT,
  user_role TEXT,
  assistant_name TEXT NOT NULL CHECK (assistant_name IN ('ph-tax-assistant', 'opex-assistant')),
  assistant_id TEXT,
  question TEXT NOT NULL,
  answer TEXT,
  domain TEXT CHECK (domain IS NULL OR domain IN ('hr', 'finance', 'ops', 'tax', 'knowledge_base')),
  process TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  response_time_ms INTEGER,
  metadata JSONB DEFAULT '{}'::JSONB,
  citations JSONB DEFAULT '[]'::JSONB,
  tokens_used JSONB DEFAULT '{}'::JSONB,
  feedback_rating INTEGER CHECK (feedback_rating IS NULL OR (feedback_rating >= 1 AND feedback_rating <= 5)),
  feedback_text TEXT,
  feedback_at TIMESTAMPTZ
);
```

## Deployment Status

- ✅ Database migration deployed
- ✅ Vector stores created
- ✅ OpenAI Assistants created
- ✅ Edge Function secrets configured
- ✅ Edge Function code updated with correct schema
- ⏳ **Pending**: Manual Dashboard deployment (CLI has DNS issues)
- ⏳ **Pending**: Verification test with logging confirmation

## Next Steps

1. Deploy the updated function via Dashboard
2. Run the test query
3. Verify query was logged to database
4. Provide confirmation screenshot/text
5. Document for Mattermost `/ask` integration
