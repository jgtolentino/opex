# 🚀 **OpEx AI Assistant Onboarding Bundle**

Welcome to your Operational Excellence AI assistant. This bot helps you automate workflows, search company policies, and answer finance, HR, audit, and compliance questions — instantly.

---

## 📍 **What the Assistant Can Do**

✔ Search your internal knowledge base (RAG)
✔ Answer questions about Finance, Processes, HR workflows
✔ Retrieve forms, checklists, SOPs, month-end close tasks
✔ Explain policy steps or required approvals
✔ Run automation commands (upload, index, retrain)
✔ Summarize files, spreadsheets, PDFs

---

## 🧠 **Best Things to Ask**

Examples:

```
What are the steps for BIR filing 1601-C?
```

```
Who approves purchase requests above ₱50,000?
```

```
Summarize the month-end close checklist.
```

```
Where can I download the Expense Reimbursement Form?
```

```
Explain the Revenue Recognition SOP in simple terms.
```

```
Generate a checklist for onboarding a new vendor.
```

---

## 🧭 **Slash Commands**

| Command           | Purpose                                                |
| ----------------- | ------------------------------------------------------ |
| `/help`           | Show quick help menu                                   |
| `/ping`           | Confirm bot is alive                                   |
| `/ask <question>` | Ask anything from the knowledge base                   |
| `/upload`         | Send files for indexing (drag + run command afterward) |
| `/train`          | Force re-train of RAG index                            |
| `/sources`        | List all documents in the knowledge base               |
| `/rag-status`     | Show health, number of documents, and last update      |
| `/debug`          | Troubleshoot (admin only)                              |

---

## 📁 **File Upload Workflow**

Uploading new documentation?

1. Drag/Paste file into Mattermost
2. Reply under the file message:

```
/upload name:"BIR 2550Q Filing Guide" category:"Finance/Tax"
```

Example expected response:

```
📌 File registered.
🔄 Processing text + embeddings...
⏳ Estimated ready: 12–60 seconds
```

Once indexed:

```
✅ Added to Knowledge Base
📄 Title: BIR 2550Q Filing Guide
🔍 Searchable by keywords: "VAT Filing", "2550Q", "Quarterly Filing"
```

---

## 📊 **Health Check**

Use anytime:

```
/rag-status
```

Returns something like:

```
📊 OpEx Assistant Status

✔ Vector DB Connected
✔ Embeddings Model: text-embedding-3-small
✔ Documents Indexed: 38
✔ Total Chunks: 2,314
✔ Last Indexed: Tax Calendar.xlsx (2 min ago)

System Healthy 🚀
```

---

## 🧪 **Verification Scenario**

To validate everything works, run:

```
/ask "What is OpEx?"
```

Expected response:

```
🔍 Searching internal knowledge…
📄 OpEx stands for Operational Excellence…
(source: Finance Overview → Policies → OpEx Framework)
```

Then test file recall:

```
/ask "When is the deadline for 1601-C filing for February?"
```

Bot should reference your Tax Filing Calendar spreadsheet.

---

## 🧑‍🏫 **Training Prompts for New Users**

Paste into Town Square pinned message:

```
🧠 Tip: Start with natural sentences.

Good examples:
• "Show me the SOP for fixed asset capitalization."
• "Who approves travel expenses over ₱100,000?"
• "Give me the step-by-step month-end closing tasks for Revenue."
```

---

## 🔧 Admin Controls (Optional)

| Action                 | Command                    |
| ---------------------- | -------------------------- |
| Add admin              | `/admin add @username`     |
| Remove outdated source | `/delete-source <file-id>` |
| Refresh all embeddings | `/train all`               |
| Export knowledge base  | `/export`                  |

---

## 🎉 You're Live

This automation stack is now running:

```
Mattermost → Webhook → OpEx LLM → Vector DB (Supabase) → Response → Mattermost
```

and supports future integrations:

* S3 auto-ingest
* Firecrawl (web → RAG indexing)
* Slack mode
* Email-to-RAG ingestion

---

## 🔧 Current Setup Details

**Service URL**: https://mattermost-rag-egb6n.ondigitalocean.app
**App ID**: 7bfabd64-5b56-4222-9403-3d4cf3b23209
**Mattermost**: https://chat.insightpulseai.net
**Bot**: @system-bot

**Active Commands**:
- `/ask` - Main knowledge search command ✅

**Status**:
- Bot deployment: ✅ Live
- OpenAI Integration: ⏳ Pending API key configuration
- Vector DB: ✅ Schema ready (migration created)
- File ingestion: ⏳ Pending Edge Function deployment

---

## 🚀 Next Steps to Full RAG

1. **Set OpenAI API Key** in DigitalOcean app environment variables
2. **Apply database migration**: `psql "$POSTGRES_URL" -f supabase/migrations/20251115_opex_rag_minimal.sql`
3. **Deploy ingestion Edge Function** for file processing
4. **Upload first documents** to test end-to-end RAG
5. **Test with** `/ask` command

---

**Questions?** Ask in #town-square or contact the OpEx team.
