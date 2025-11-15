# PH Tax Assistant - Quick Start Guide

## 🚀 Setup in 2 Steps

### Prerequisites
- OpenAI API key
- Node.js 18+ installed
- pnpm package manager

### Step 1: Upload Files to Vector Stores

```bash
# Set your OpenAI API key
export OPENAI_API_KEY=sk-proj-...

# Run the setup script (creates vector stores + uploads all 9 files)
pnpm rag:setup
```

**What this does:**
1. Creates 3 vector stores in OpenAI:
   - `vs_policies` (BIR forms and regulations)
   - `vs_sops_workflows` (Month-end close procedures)
   - `vs_examples_systems` (Templates and system docs)
2. Uploads all 9 files from `raw_docs/` with proper routing
3. Saves vector store IDs to `.env` file
4. Shows statistics for each vector store

**Expected output:**
```
📦 Creating vector stores...

✅ vs_policies created: vs_abc123...
✅ vs_sops_workflows created: vs_def456...
✅ vs_examples_systems created: vs_ghi789...

📤 Uploading files to vector stores...

   Uploading: bir_1601c_instructions_html
   ✅ bir_1601c_instructions_html → vs_policies
   Uploading: bir_1601c_form_pdf
   ✅ bir_1601c_form_pdf → vs_policies
   ...

📊 Upload Summary:
   ✅ Success: 9
   ❌ Errors: 0
   📁 Total: 9

💾 Vector store IDs saved to .env file

✅ Setup complete!
```

### Step 2: Create the Assistant

```bash
# Create the PH Tax Assistant (reads IDs from .env)
pnpm rag:assistant
```

**What this does:**
1. Reads system prompt from `config/ph_tax_assistant_system_prompt.md`
2. Creates OpenAI Assistant with GPT-4 Turbo
3. Attaches all 3 vector stores
4. Tests with sample query
5. Returns assistant ID for production use

**Expected output:**
```
Creating PH Tax Assistant...
✅ Assistant created: asst_xyz789...
   Name: PH Month-End & Tax Copilot
   Model: gpt-4-turbo-preview
   Vector Stores: 3

🧪 Testing assistant with sample query...

Query: "I am the Finance Supervisor. I just finished preparing the 1601-C for this month. What is my next step before filing?"

📝 Assistant Response:

Based on the month-end close workflows, after preparing Form 1601-C, the next step is:

**Report Approval (Senior Finance Manager)**

Workflow:
1. Submit prepared 1601-C to Senior Finance Manager for review
2. Manager verifies:
   - Withholding tax calculations are accurate
   - All required attachments are included
   - Data matches payroll records
3. Manager approves or returns for corrections

Timing: BIR Deadline minus 2 business days (internal policy)

System: Submit via your document approval workflow

Next steps after approval:
- Payment Approval (Finance Director)
- Filing via eFPS
- Payment processing

Source: Month-End Close Process - VirtueCPAs, Section: Steps

✅ Test completed successfully

💾 Save this assistant ID for future use: asst_xyz789...
```

## 📝 Save Your Credentials

After running the scripts, you'll have a `.env` file with:

```bash
OPENAI_API_KEY=sk-proj-...
VS_POLICIES_ID=vs_abc123...
VS_SOPS_WORKFLOWS_ID=vs_def456...
VS_EXAMPLES_SYSTEMS_ID=vs_ghi789...
```

And an assistant ID: `asst_xyz789...`

**Keep these safe!** You'll need them to integrate the assistant into your apps.

## 🧪 Testing the Assistant

### Manual Test (using OpenAI Playground)
1. Go to https://platform.openai.com/playground
2. Select "Assistants" mode
3. Choose your assistant: `asst_xyz789...`
4. Try these queries:

**Tax Deadline Query:**
```
When is the 2550Q filing deadline for Q1 2026?
```

**Process Query:**
```
I am the Finance Supervisor. What's my next step after preparing the 1601-C?
```

**System Query:**
```
What are the steps for filing Form 2550M electronically?
```

### Programmatic Test (TypeScript)
```typescript
import OpenAI from 'openai';

const client = new OpenAI();

const thread = await client.beta.threads.create();

await client.beta.threads.messages.create(thread.id, {
  role: 'user',
  content: 'When is the 2550Q filing deadline for Q1 2026?'
});

const run = await client.beta.threads.runs.create(thread.id, {
  assistant_id: 'asst_xyz789...' // Your assistant ID
});

// Wait for completion and get response
// (See full code in scripts/createPhTaxAssistant.ts)
```

## 📦 What's in Each Vector Store?

### vs_policies (5 files)
- BIR Form 1601-C instructions (HTML + PDF)
- BIR Form 2550M instructions (HTML)
- BIR Form 2550Q form + guidelines (2 PDFs)

**Answers questions about:**
- Official BIR deadlines
- Tax rates and calculations
- Form filing requirements
- Legal compliance rules

### vs_sops_workflows (4 files)
- VirtueCPAs month-end close guide
- Prophix 10-step checklist
- NetSuite financial close guide
- Brex GAAP/IFRS compliance guide

**Answers questions about:**
- Month-end close procedures
- Step-by-step workflows
- Role responsibilities
- Best practices

### vs_examples_systems (0 files - ready for your content)
**Planned for:**
- Sample filled BIR forms (anonymized)
- Journal entry templates
- ERP menu paths
- Reconciliation templates

## 🔄 Adding More Content

To add new documents:

1. **Add file to appropriate folder:**
   ```bash
   # For policies/regulations
   raw_docs/bir/new_form.pdf

   # For workflows/SOPs
   raw_docs/sop_workflows/company_sop.docx

   # For examples/templates
   raw_docs/examples/sample_form.xlsx
   ```

2. **Update metadata.yaml:**
   ```yaml
   - id: new_document_id
     path: raw_docs/bir/new_form.pdf
     source_url: https://source.url
     domain: tax
     form: "1702"
     doc_type: policy
     jurisdiction: PH
     period_type: annual
     version: "2025"
     notes: "Description of what this document contains"
   ```

3. **Re-run upload:**
   ```bash
   pnpm rag:setup
   ```

The script will detect new files and upload them to the appropriate vector store.

## 🛠️ Troubleshooting

### "OPENAI_API_KEY not set"
```bash
export OPENAI_API_KEY=sk-proj-...
```

### "File not found" errors
Make sure you're in the `/Users/tbwa/opex` directory:
```bash
cd /Users/tbwa/opex
pnpm rag:setup
```

### Assistant not finding answers
- Check that files were uploaded successfully (look for ✅ in output)
- Verify vector store IDs in `.env` match what's in OpenAI dashboard
- Test queries should match the content in your documents

### TypeScript compilation errors
We're using `tsx` which doesn't require compilation. If you see errors:
```bash
pnpm install --save-dev tsx
```

## 📚 Next Steps

1. **Add your internal documents:**
   - Company tax calendar (Google Sheets export)
   - Internal SOPs for BIR forms
   - Sample filled forms (anonymized)
   - ERP menu paths and report dictionary

2. **Integrate into your app:**
   - See `config/PH_TAX_ASSISTANT_README.md` for integration examples
   - Use the assistant ID in your finance workflows
   - Build a Slack bot or web interface

3. **Monitor and improve:**
   - Review assistant responses for accuracy
   - Add missing documents based on user questions
   - Update metadata for better filtering

## 🔐 Security Notes

- ✅ All secrets stored in `.env` (gitignored)
- ✅ Only official BIR sources downloaded
- ✅ No company-specific data uploaded yet
- ✅ Vector stores are private to your OpenAI account

**Before adding internal documents:**
- Anonymize any sensitive data
- Review company data policies
- Get approval for uploading to OpenAI

## 📖 Documentation

- **Full Setup Guide**: `config/PH_TAX_ASSISTANT_README.md`
- **Metadata Schema**: `config/metadata.yaml`
- **Source Documentation**: `config/README_SOURCES.md`
- **Architecture Overview**: `FINANCE_RAG_SETUP_COMPLETE.md`

## ✅ Success Checklist

- [ ] OpenAI API key set in environment
- [ ] Vector stores created (3 total)
- [ ] All 9 files uploaded successfully
- [ ] `.env` file created with vector store IDs
- [ ] Assistant created and tested
- [ ] Assistant ID saved for production use
- [ ] Test queries working correctly

---

**Total Setup Time**: ~5 minutes
**Total Cost**: $0.00 (initial setup) + usage-based pricing for queries

You're ready to start using the PH Tax Assistant! 🎉
