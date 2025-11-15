# Mattermost Slash Command Configuration

Complete guide for integrating the "Ask OpEx Assistant" n8n workflow with Mattermost via slash commands.

## Overview

After setup, users can query the OpEx RAG system directly from Mattermost:

```
/opex What are the steps for employee requisition?
```

The workflow processes the question and returns an AI-generated answer in the channel.

---

## Prerequisites

- ✅ Mattermost instance (self-hosted or cloud)
- ✅ Admin access to create slash commands
- ✅ n8n workflow `ask-opex-assistant` imported and activated
- ✅ Webhook URL from n8n workflow

---

## Step 1: Get Webhook URL from n8n

1. Open https://ipa.insightpulseai.net
2. Navigate to **"Ask OpEx / PH Tax Assistant"** workflow
3. Click the **"Incoming Webhook"** node
4. Copy the **Production URL**:
   ```
   https://ipa.insightpulseai.net/webhook/ask-opex-assistant
   ```

---

## Step 2: Create Slash Command in Mattermost

### 2.1 Navigate to Integrations

1. Open Mattermost
2. Click **Main Menu** (☰) → **Integrations**
3. Select **"Slash Commands"**
4. Click **"Add Slash Command"**

### 2.2 Configure Command

**Basic Settings**:
- **Title**: `OpEx Assistant`
- **Description**: `Ask questions about HR, Finance policies, and BIR tax regulations`
- **Command Trigger Word**: `opex`

**Request Configuration**:
- **Request URL**: `https://ipa.insightpulseai.net/webhook/ask-opex-assistant`
- **Request Method**: `POST`
- **Response Username**: `OpEx Assistant` (optional)
- **Response Icon**: `:robot:` or custom emoji (optional)

**Optional Settings**:
- **Autocomplete**: ✅ Enable
- **Autocomplete Hint**: `[question]`
- **Autocomplete Description**: `Ask OpEx or PH Tax Assistant a question`

### 2.3 Save and Copy Token

1. Click **"Save"**
2. Copy the **Token** (for webhook authentication, if needed)

---

## Step 3: Test the Integration

### 3.1 Basic Test

In any Mattermost channel:

```
/opex Hello
```

**Expected Response**:
```
Hello! I'm the OpEx Assistant. I can help with:
- HR policies (requisitions, onboarding, performance reviews)
- Finance workflows (expenses, approvals, budgeting)
- Philippine BIR tax regulations (1601-C, 2550Q, 1702-RT)

What would you like to know?
```

### 3.2 HR Query Test

```
/opex What are the steps for employee onboarding?
```

**Expected Response** (excerpt):
```
Employee Onboarding Process:

1. Pre-boarding (Before Day 1):
   - Send welcome email with first-day details
   - Prepare workstation and equipment
   - Create accounts (email, ERP, systems)

2. Day 1 Orientation:
   - HR introduction and company overview
   - Complete documentation (tax forms, contracts)
   ...
```

### 3.3 Tax Query Test

```
/opex When is BIR Form 1601-C due?
```

**Expected Response**:
```
BIR Form 1601-C (Monthly Remittance Return of Income Taxes Withheld) is due on the **10th day of the following month**.

Example:
- January withholding taxes → Due February 10
- February withholding taxes → Due March 10

Late filing penalties apply after the deadline.

[View Form Guide](https://ipa.insightpulseai.net/docs/tax/1601-c)
```

---

## Step 4: Advanced Configuration

### 4.1 Domain-Specific Commands (Optional)

Create separate slash commands for specific domains:

**`/opex-hr`** - HR-only queries
- Request URL: `<webhook-url>?domain=hr`

**`/opex-tax`** - Tax-only queries
- Request URL: `<webhook-url>?domain=tax`

**`/opex-finance`** - Finance-only queries
- Request URL: `<webhook-url>?domain=finance`

### 4.2 Response Formatting

Mattermost supports Markdown in responses:

```markdown
**Bold text**
*Italic text*
- Bullet lists
[Link text](https://example.com)
```

The n8n workflow returns plain text, so responses are automatically formatted.

### 4.3 Private Responses

To make responses visible only to the user (not the whole channel):

1. Edit the slash command in Mattermost
2. Check **"Ephemeral"** (response visible only to user)

---

## Step 5: Webhook Authentication (Optional)

### 5.1 Add Token Verification to n8n

For security, verify Mattermost token in n8n workflow:

1. Open workflow in n8n
2. Add **"IF"** node after webhook
3. Condition:
   ```
   {{$json["token"]}} equals <mattermost-token>
   ```
4. If false, return error message

### 5.2 IP Whitelisting

If using self-hosted Mattermost, whitelist its IP in n8n:

1. n8n → **Settings** → **Security**
2. Add Mattermost server IP to allowed list

---

## Usage Examples

### HR Queries

```
/opex How do I request a new employee?
/opex What is the performance review process?
/opex Where is the onboarding checklist?
```

### Finance Queries

```
/opex How do I submit an expense report?
/opex What is the approval matrix for purchases?
/opex Where is the budget template?
```

### Tax Queries

```
/opex What is BIR Form 2550Q?
/opex When is the quarterly tax deadline?
/opex How do I compute withholding tax?
```

---

## Troubleshooting

### Slash Command Not Working

**Symptom**: `/opex` shows "Command not found"

**Solutions**:
- Verify slash command is created in Mattermost
- Check trigger word is exactly `opex` (lowercase)
- Ensure command is enabled (not disabled)

### Webhook Not Responding

**Symptom**: Slash command triggers but no response

**Solutions**:
1. Test webhook URL directly with `curl`:
   ```bash
   curl -X POST <webhook-url> \
     -H "Content-Type: application/json" \
     -d '{"text": "test"}'
   ```
2. Check n8n workflow is **Active**
3. View n8n execution logs for errors

### Wrong or Incomplete Answers

**Symptom**: Assistant returns incorrect information

**Solutions**:
- Check RAG system has latest documents
- Verify Supabase Edge Function is working:
  ```bash
  curl -X POST https://ublqmilcjtpnflofprkr.supabase.co/functions/v1/opex-rag-query \
    -H "Content-Type: application/json" \
    -d '{"assistant": "opex", "question": "test", "domain": "hr"}'
  ```
- Review OpenAI Assistant configuration

### Timeout Errors

**Symptom**: Mattermost shows "Request timeout"

**Solutions**:
- Increase Mattermost slash command timeout (default: 30s)
- Optimize RAG query performance (reduce context length)
- Check OpenAI API response times

---

## Best Practices

### 1. Channel Organization

Create dedicated channels for different use cases:
- `#ask-opex-hr` - HR policy questions
- `#ask-opex-finance` - Finance workflow questions
- `#ask-opex-tax` - BIR tax and compliance

### 2. User Training

Teach users how to ask effective questions:

✅ **Good Questions**:
```
/opex What is the approval process for travel expenses?
/opex When is the deadline for BIR Form 1601-C?
/opex How do I onboard a new manager?
```

❌ **Vague Questions**:
```
/opex expenses
/opex tax
/opex how
```

### 3. Feedback Loop

Track question quality and improve RAG content:

```sql
-- View recent questions
SELECT
  created_at,
  question,
  domain,
  success,
  metadata->>'source' as source
FROM opex.rag_queries
WHERE metadata->>'source' = 'mattermost'
ORDER BY created_at DESC
LIMIT 50;
```

---

## Next Steps

- [Review Setup Guide](SETUP.md)
- [Configure Credentials](CREDENTIALS.md)
- [Read Workflow Documentation](workflows/ask-opex-assistant.md)

---

## Support

- **Mattermost**: `#ops-automation`
- **GitHub Issues**: [jgtolentino/opex](https://github.com/jgtolentino/opex/issues)
- **Documentation**: [workflows/n8n/docs/](../)
