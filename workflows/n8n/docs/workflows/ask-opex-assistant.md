# Ask OpEx / PH Tax Assistant Workflow

Webhook-based RAG query handler for Mattermost slash command integration.

## Overview

**Workflow File**: `ask-opex-assistant.json`
**Trigger**: Webhook POST (Mattermost `/opex` slash command)
**Purpose**: Enable users to ask OpEx HR/Finance/Tax questions directly from Mattermost

## Workflow Diagram

```
Mattermost          n8n Workflow                    Supabase Edge Function
─────────────────────────────────────────────────────────────────────────
  /opex "question"
       │
       ├─> Webhook Trigger
       │       │
       │       └─> Set Question & Params
       │               │
       │               └─> HTTP: Call opex-rag-query
       │                       │
       │                       ├─────────────────────> POST /functions/v1/opex-rag-query
       │                       │                               │
       │                       │                               └─> OpenAI Assistants API
       │                       │                                           │
       │                       │ <───────────────────────── RAG Answer <───┘
       │                       │
       │               Extract Answer
       │                       │
       └─< Return Answer ←─────┘
```

## Nodes

### 1. Incoming Webhook
- **Type**: `n8n-nodes-base.webhook`
- **Path**: `/webhook/ask-opex-assistant`
- **Method**: POST
- **Returns**: Answer text directly to caller

### 2. Set Question & Params
- **Type**: `n8n-nodes-base.set`
- **Purpose**: Normalize input payload
- **Outputs**:
  - `question`: From `text` or `message` field
  - `assistant`: `"opex"` (default)
  - `domain`: From input or `"hr"` (default)
  - `process`: From input or `"general"` (default)

### 3. Call Supabase Edge Function
- **Type**: `n8n-nodes-base.httpRequest`
- **URL**: `https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/opex-rag-query`
- **Method**: POST
- **Body**:
  ```json
  {
    "assistant": "opex",
    "question": "user question",
    "domain": "hr|finance|tax",
    "process": "specific_process"
  }
  ```

### 4. Extract Answer
- **Type**: `n8n-nodes-base.set`
- **Purpose**: Extract answer text from response
- **Returns**: Plain text answer for Mattermost

## Configuration

### Credentials Required
- **None** for webhook (public endpoint)
- **Optional**: Mattermost token verification

### Environment Variables
None required (uses Supabase anon key from Edge Function)

## Usage

### Via Mattermost Slash Command

```
/opex What are the steps for employee requisition?
```

**Response**:
```
Employee Requisition Process:

1. Manager submits requisition form...
2. HR reviews position justification...
3. Finance approves budget allocation...
...
```

### Via Direct HTTP

```bash
curl -X POST https://ipa.insightpulseai.net/webhook/ask-opex-assistant \
  -H "Content-Type: application/json" \
  -d '{
    "text": "What is BIR Form 1601-C?",
    "domain": "tax"
  }'
```

### With Domain Specification

```json
{
  "text": "How do I submit expenses?",
  "domain": "finance",
  "process": "expense-reimbursement"
}
```

## Testing

### Manual Execution

1. Open workflow in n8n
2. Click **"Execute Workflow"**
3. Provide test data:
   ```json
   {
     "text": "Test question"
   }
   ```
4. Check execution log for response

### Test Cases

| Domain | Question | Expected Answer Contains |
|--------|----------|---------------------------|
| hr | "How do I onboard?" | "Pre-boarding", "Day 1", "checklist" |
| finance | "Expense approval?" | "approval matrix", "budget", "receipt" |
| tax | "1601-C deadline?" | "10th day", "following month" |

## Error Handling

### No Answer Returned

**Symptom**: Response is empty or "(No answer returned)"

**Solutions**:
- Check Supabase Edge Function is deployed
- Verify OpenAI Assistant is configured
- Review RAG vector stores have content

### Timeout

**Symptom**: Webhook doesn't respond within 30s

**Solutions**:
- Increase Mattermost slash command timeout
- Optimize RAG query (reduce context length)
- Check OpenAI API status

### 401/403 Errors

**Symptom**: "Unauthorized" or "Forbidden"

**Solutions**:
- Verify Supabase Edge Function has correct API keys
- Check RLS policies on `opex.rag_queries` table

## Customization

### Add Authentication

```javascript
// In "Set Question & Params" node
if ($json.token !== 'expected-mattermost-token') {
  throw new Error('Unauthorized');
}
```

### Domain Auto-Detection

```javascript
// In "Set Question & Params" node
const question = $json.text || '';
let domain = 'hr'; // default

if (question.match(/bir|tax|1601|2550/i)) {
  domain = 'tax';
} else if (question.match(/expense|budget|finance|approval/i)) {
  domain = 'finance';
}
```

### Response Formatting

```javascript
// In "Extract Answer" node
const answer = $json.answer || 'No answer';
const formatted = `
🤖 **OpEx Assistant**

${answer}

_Powered by OpenAI GPT-4 + RAG_
`;
return { answer: formatted };
```

## Analytics

View query logs in Supabase:

```sql
SELECT
  created_at,
  question,
  domain,
  success,
  response_time_ms,
  metadata->>'source' as source
FROM opex.rag_queries
WHERE metadata->>'source' = 'mattermost'
ORDER BY created_at DESC
LIMIT 100;
```

## Related Documentation

- [Mattermost Configuration](../MATTERMOST_CONFIG.md)
- [Setup Guide](../SETUP.md)
- [Credentials](../CREDENTIALS.md)
