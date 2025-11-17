# Supabase Edge Functions Deployment Guide

## Edge Functions for Odoo T&E + PH Tax Copilot

### Available Functions

1. **`rag-ask-tax`** - PH tax Q&A with RAG
2. **`odoo-expense-get`** - Odoo expense data proxy

### Deployment Commands

```bash
# Deploy RAG ask-tax function
supabase functions deploy rag-ask-tax --no-verify-jwt

# Deploy Odoo expense get function
supabase functions deploy odoo-expense-get --no-verify-jwt

# Set environment variables
supabase secrets set ODOO_EXPENSE_API_BASE=https://erp.insightpulseai.net/ipai_te_tax/expense
supabase secrets set ODOO_AUTH_TOKEN=your-odoo-token-here
```

### Environment Variables

**For `rag-ask-tax`:**
- `SUPABASE_URL` - Auto-configured by Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-configured by Supabase

**For `odoo-expense-get`:**
- `ODOO_EXPENSE_API_BASE` - Odoo API base URL
- `ODOO_AUTH_TOKEN` - Optional Odoo authentication token

### Function URLs

After deployment, your functions will be available at:

- **RAG Ask Tax**: `https://[project-ref].functions.supabase.co/rag-ask-tax`
- **Odoo Expense Get**: `https://[project-ref].functions.supabase.co/odoo-expense-get`

### Testing the Functions

```bash
# Test RAG function
curl -X POST https://[project-ref].functions.supabase.co/rag-ask-tax \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is the VAT rate for services in the Philippines?",
    "context": {
      "source": "mattermost",
      "user_name": "finance_user"
    }
  }'

# Test Odoo function
curl -X POST https://[project-ref].functions.supabase.co/odoo-expense-get \
  -H "Content-Type: application/json" \
  -d '{
    "expense_id": "123"
  }'
```

### Integration with n8n

**For `/ask-tax` workflow:**
- URL: `https://[project-ref].functions.supabase.co/rag-ask-tax`
- Method: POST
- Body: `{ "question": "{{$json.question}}", "context": {...} }`

**For `/validate-expense` workflow:**
- URL: `https://[project-ref].functions.supabase.co/odoo-expense-get`
- Method: POST
- Body: `{ "expense_id": "{{$json.expense_id}}" }`

### Security Notes

- Both functions are deployed with `--no-verify-jwt` for n8n integration
- Consider adding IP whitelisting for production
- Monitor function usage and logs in Supabase dashboard
- Set up proper error handling in n8n workflows
