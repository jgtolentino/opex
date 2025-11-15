# PH Tax Assistant - Setup & Usage Guide

## Overview

The **PH Month-End & Tax Copilot** is an AI assistant specialized in:
- Philippine BIR tax compliance (Forms 1601-C, 2550M, 2550Q, etc.)
- Month-end financial closing procedures
- Role-based workflow guidance for Finance teams
- Concrete examples from templates and sample forms

The assistant is powered by OpenAI's GPT-4 Turbo with RAG (Retrieval-Augmented Generation) using three specialized vector stores.

## Vector Store Architecture

The assistant requires three vector stores to be created and populated:

### 1. `vs_policies` (VS_POLICIES_ID)
**Purpose**: Tax laws, official deadlines, BIR regulations

**Content**:
- BIR Form 1601-C instructions (HTML + PDF)
- BIR Form 2550M instructions (HTML)
- BIR Form 2550Q form + guidelines (PDFs)
- Internal tax calendars and policy documents

**Metadata Filters**:
- `domain: "tax"`
- `doc_type: "policy" | "calendar"`
- `form: "1601C" | "2550M" | "2550Q" | ...`

### 2. `vs_sops_workflows` (VS_SOPS_WORKFLOWS_ID)
**Purpose**: How to execute processes step-by-step

**Content**:
- Month-end close SOPs and workflows
- VirtueCPAs, Prophix, NetSuite, Brex best practice guides
- Company-specific BIR form preparation workflows
- Docusaurus/OpEx Docs exports

**Metadata Filters**:
- `doc_type: "sop" | "workflow"`
- `domain: "month_end" | "tax"`
- `role_primary: "Finance Supervisor" | "Senior Finance Manager" | ...`

### 3. `vs_examples_systems` (VS_EXAMPLES_SYSTEMS_ID)
**Purpose**: Concrete examples and system documentation

**Content**:
- Sample filled BIR forms (anonymized)
- Journal entry templates
- ERP menu paths and report dictionary
- Reconciliation templates

**Metadata Filters**:
- `doc_type: "example" | "system_manual"`
- `system: "ERP" | "eBIR" | "eFPS" | ...`

## Prerequisites

### 1. Environment Variables
Create a `.env` file in the project root with:

```bash
# OpenAI API Key
OPENAI_API_KEY=sk-...

# Vector Store IDs (create these in OpenAI platform first)
VS_POLICIES_ID=vs_...
VS_SOPS_WORKFLOWS_ID=vs_...
VS_EXAMPLES_SYSTEMS_ID=vs_...

# Optional: Supabase connection (for future integrations)
NEXT_PUBLIC_SUPABASE_URL=https://ublqmilcjtpnflofprkr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
opex_SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

### 2. Install Dependencies
```bash
npm install openai dotenv
npm install --save-dev @types/node ts-node typescript
```

### 3. TypeScript Configuration
Ensure `tsconfig.json` includes:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "esModuleInterop": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "outDir": "./dist"
  },
  "include": ["scripts/**/*"]
}
```

## Creating Vector Stores

Before running the assistant, create the three vector stores in OpenAI:

```typescript
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 1. Create vs_policies
const vsPolicies = await client.beta.vectorStores.create({
  name: 'PH Tax Policies & Regulations',
  metadata: { type: 'policies', domain: 'tax' }
});

// 2. Create vs_sops_workflows
const vsSops = await client.beta.vectorStores.create({
  name: 'PH Tax & Month-End Workflows',
  metadata: { type: 'sops_workflows', domain: 'month_end' }
});

// 3. Create vs_examples_systems
const vsExamples = await client.beta.vectorStores.create({
  name: 'PH Tax Examples & Systems',
  metadata: { type: 'examples', domain: 'systems' }
});

console.log('VS_POLICIES_ID:', vsPolicies.id);
console.log('VS_SOPS_WORKFLOWS_ID:', vsSops.id);
console.log('VS_EXAMPLES_SYSTEMS_ID:', vsExamples.id);
```

## Uploading Files to Vector Stores

Use the metadata schema from `config/metadata.yaml` to upload files:

```typescript
import yaml from 'js-yaml';
import { readFileSync } from 'fs';

// Load metadata
const metadataFile = readFileSync('config/metadata.yaml', 'utf-8');
const metadata = yaml.load(metadataFile);

// Upload files based on doc_type
for (const fileMeta of metadata.files) {
  // Determine target vector store
  let vectorStoreId;
  if (fileMeta.doc_type === 'policy' || fileMeta.doc_type === 'calendar') {
    vectorStoreId = VS_POLICIES_ID;
  } else if (fileMeta.doc_type === 'sop' || fileMeta.doc_type === 'workflow') {
    vectorStoreId = VS_SOPS_WORKFLOWS_ID;
  } else {
    vectorStoreId = VS_EXAMPLES_SYSTEMS_ID;
  }

  // Upload file
  const fileObj = await client.files.create({
    file: createReadStream(fileMeta.path),
    purpose: 'assistants'
  });

  // Add to vector store
  await client.beta.vectorStores.files.create(vectorStoreId, {
    file_id: fileObj.id
  });

  console.log(`✅ Uploaded ${fileMeta.id} to vector store`);
}
```

## Running the Assistant

### Create and Test
```bash
# Set environment variables
export OPENAI_API_KEY=sk-...
export VS_POLICIES_ID=vs_...
export VS_SOPS_WORKFLOWS_ID=vs_...
export VS_EXAMPLES_SYSTEMS_ID=vs_...

# Run the creation script
npx ts-node scripts/createPhTaxAssistant.ts

# Or compile first
npx tsc
node dist/scripts/createPhTaxAssistant.js
```

### Expected Output
```
Creating PH Tax Assistant...
✅ Assistant created: asst_...
   Name: PH Month-End & Tax Copilot
   Model: gpt-4-turbo-preview
   Vector Stores: 3

🧪 Testing assistant with sample query...

Query: "I am the Finance Supervisor. I just finished preparing the 1601-C for this month. What is my next step before filing?"

📝 Assistant Response:

[Response from assistant based on RAG content]

✅ Test completed successfully

💾 Save this assistant ID for future use: asst_...
```

## Usage Examples

### Example 1: Tax Deadline Question
```typescript
const query = "When is the 2550Q filing deadline for Q1 2026?";
// Expected: Searches vs_policies for BIR deadlines
// Response: "Within 25 days following Q1 close (by April 25, 2026)"
```

### Example 2: Process Question
```typescript
const query = "I am Finance Supervisor. What's my next step after preparing 1601-C?";
// Expected: Searches vs_sops_workflows for 1601-C workflow
// Response: Step-by-step workflow with roles and systems
```

### Example 3: System Question
```typescript
const query = "Where do I find the AP aging report in our ERP?";
// Expected: Searches vs_examples_systems for system documentation
// Response: Menu paths and navigation instructions
```

## Extending the Knowledge Base

When adding new documents:

1. **Update** `config/metadata.yaml` with new file entries
2. **Upload** files to appropriate vector store based on `doc_type`
3. **Test** the assistant with queries targeting the new content

### Adding Internal Company Documents

Priority additions:
- [ ] Internal tax calendar (Google Sheets export) → `vs_policies`
- [ ] Company-specific 1601-C SOP → `vs_sops_workflows`
- [ ] Sample filled 1601-C form (anonymized) → `vs_examples_systems`
- [ ] ERP menu paths and report dictionary → `vs_examples_systems`
- [ ] Reconciliation templates → `vs_examples_systems`

### Document Preparation

Before uploading:
1. Convert HTML to clean Markdown: `python scripts/html_to_markdown.py`
2. Extract text from PDFs: `python scripts/pdf_to_text.py`
3. Validate metadata: `python scripts/validate_metadata.py`
4. Upload with proper metadata tags

## Troubleshooting

### Assistant Not Finding Answers
- **Check**: Are files uploaded to correct vector store?
- **Verify**: Metadata fields match query filters
- **Test**: Query vector stores directly to confirm content

### Token Limit Errors
- **Reduce**: Context window by chunking large documents
- **Optimize**: Use more specific metadata filters
- **Consider**: Using gpt-4-turbo-preview or gpt-4o for larger context

### Incorrect Responses
- **Review**: System prompt alignment with expectations
- **Update**: Metadata to improve filtering accuracy
- **Add**: Missing SOPs or policy documents to knowledge base

## System Prompt Customization

The system prompt is in `config/ph_tax_assistant_system_prompt.md`.

To modify behavior:
1. Edit the markdown file
2. Re-run `createPhTaxAssistant.ts` to update
3. Test with sample queries

Key sections to customize:
- **ROLE**: Adjust scope and user personas
- **TOOL USAGE RULES**: Modify filter priorities
- **ANSWER STYLE**: Change output format preferences
- **WHAT TO AVOID**: Add domain-specific restrictions

## Integration Points

### Future Enhancements
- **Slack Bot**: Route finance questions to assistant
- **Supabase Integration**: Store conversation history
- **Automated Reminders**: BIR deadline notifications
- **Multi-Agent Orchestration**: Coordinate with other domain assistants

### API Integration Example
```typescript
// In your finance app
import { createThread, sendMessage, getResponse } from './lib/ph-tax-assistant';

async function handleFinanceQuery(userQuery: string, userRole: string) {
  const thread = await createThread();
  const contextualQuery = `I am ${userRole}. ${userQuery}`;
  await sendMessage(thread.id, contextualQuery);
  const response = await getResponse(thread.id);
  return response;
}
```

## Maintenance

### Monthly
- [ ] Review assistant performance metrics
- [ ] Update BIR forms as new versions are released
- [ ] Add new month-end close examples

### Quarterly
- [ ] Audit knowledge base completeness
- [ ] Update system prompt based on user feedback
- [ ] Refresh best practice guides

### Annually
- [ ] Update tax calendar for new year
- [ ] Review and archive outdated BIR forms
- [ ] Comprehensive knowledge base audit

## Support

For issues or questions:
1. Check this README first
2. Review `FINANCE_RAG_SETUP_COMPLETE.md` for architecture details
3. Inspect `config/metadata.yaml` for data schema
4. Consult OpenAI Assistants API documentation

## License

Internal use only. Not for distribution outside the organization.
