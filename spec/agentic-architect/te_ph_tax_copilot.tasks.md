# Tasks – Odoo T&E + PH Tax Copilot

Origin: `te_ph_tax_copilot.prd.yaml`
Owner agent: `agentic-architect`
Statuses: TODO / IN_PROGRESS / BLOCKED / DONE

---

## 0. Foundations & Repo Setup

- [ ] T0.1 – Create project skeleton
  - Create `spec/agentic-architect/` folder in monorepo (if not existing).
  - Commit:
    - `te_ph_tax_copilot.prd.yaml`
    - `te_ph_tax_copilot.tasks.md`
  - Owner: Architect
  - Status: TODO

- [ ] T0.2 – Register agent + skill
  - Add `skills/agentic-architect/SKILL.md`
  - Add `agents/agentic-architect/agent.yaml`
  - Register in `skills/registry.yaml`
  - Owner: Platform
  - Status: TODO

- [ ] T0.3 – Environments & secrets
  - Confirm `dev / staging / prod` Supabase projects for finance.
  - Confirm DO droplets for OCR and agents.
  - Define secret management pattern for:
    - Supabase keys
    - Odoo API creds
    - Mattermost + n8n webhooks
  - Owner: Platform
  - Status: TODO

---

## 1. Foundation (Milestone m1)

### 1.1 OCR Service & Storage

- [ ] T1.1 – Design OCR service interface
  - Define HTTP API spec for OCR:
    - `POST /ocr/receipt` → `{ url | file }` → `{ text, raw_lines, confidence }`
  - Document in `docs/ocr_api.md`
  - Owner: Architect
  - Status: TODO

- [ ] T1.2 – Implement OCR service (DO droplet)
  - Containerize PaddleOCR (or equivalent).
  - Implement API according to `docs/ocr_api.md`.
  - Add logging and simple healthcheck endpoint.
  - Owner: Backend
  - Status: TODO

- [ ] T1.3 – Supabase storage + metadata
  - Create Supabase tables:
    - `receipts` (id, employee_id, file_path, uploaded_at, status)
    - `receipt_ocr` (receipt_id, raw_text, confidence, ocr_meta, created_at)
  - Wire object storage bucket for receipt files.
  - Owner: Data
  - Status: TODO

### 1.2 Odoo Connector (Base)

- [ ] T1.4 – Define Odoo connector endpoints
  - Document needed operations:
    - Create/Update expense
    - Fetch expense by id
    - Fetch tax codes
  - Add `docs/odoo_te_connector.md`
  - Owner: Architect
  - Status: TODO

- [ ] T1.5 – Implement connector (Edge Function or service)
  - Implement minimal service with:
    - `POST /odoo/expense` (create draft)
    - `PATCH /odoo/expense/:id` (update)
  - Use Odoo API keys stored in env.
  - Owner: Backend
  - Status: TODO

### 1.3 n8n Base Workflow for Ingestion

- [ ] T1.6 – Create `wf_receipt_ingest` in n8n
  - Trigger: Webhook from front-end / mobile capture.
  - Steps:
    - Upload file → Supabase storage
    - Insert `receipts` record
    - Call OCR service
    - Insert `receipt_ocr`
  - Owner: Automation
  - Status: TODO

- [ ] T1.7 – Add dev logging
  - Ensure n8n workflow logs minimal PII.
  - Write `runbooks/wf_receipt_ingest.md`
  - Owner: Automation
  - Status: TODO

---

## 2. Tax Rules + RAG (Milestone m2)

### 2.1 PH VAT/WHT Rules Engine

- [ ] T2.1 – Tax rules spec
  - Document PH VAT and WHT requirements for T&E:
    - Common vendors
    - Rates
    - thresholds
  - Save as `docs/ph_te_tax_rules.md`
  - Owner: Tax/SME + Architect
  - Status: TODO

- [ ] T2.2 – Implement deterministic rules engine
  - Choose implementation:
    - Odoo module **or**
    - Python microservice with clear API:
      - `POST /tax/validate-expense`
  - Support:
    - Input: normalized T&E line items.
    - Output: computed VAT/WHT + explanations + rule ids.
  - Owner: Backend
  - Status: TODO

- [ ] T2.3 – Unit tests for tax rules
  - Create fixtures for typical PH scenarios.
  - Add test suite (Pytest or Odoo tests).
  - Owner: Backend
  - Status: TODO

### 2.2 RAG Setup in Supabase

- [ ] T2.4 – Data inventory for RAG
  - Collect:
    - BIR forms (2550Q, 1601-C, etc.)
    - Revenue regs / memos relevant to T&E
    - Internal SOPs and policies
  - Document in `docs/rag_sources_te_tax.md`
  - Owner: Tax/SME
  - Status: TODO

- [ ] T2.5 – Vector schema
  - Create `rag_documents_te_tax`:
    - id, source_type, title, url, created_at, updated_at
  - Create `rag_chunks_te_tax`:
    - id, document_id, chunk_text, embedding, metadata
  - Owner: Data
  - Status: TODO

- [ ] T2.6 – Embedding pipeline
  - Edge Function or script:
    - Split docs → embed → insert into `rag_chunks_te_tax`
  - Owner: Data + Backend
  - Status: TODO

- [ ] T2.7 – RAG query API
  - Implement `POST /rag/ask-tax`:
    - Input: `question, context_metadata`
    - Output: `answer, citations[]`
  - Add tests for retrieval quality.
  - Owner: Backend
  - Status: TODO

---

## 3. Mattermost Copilot (Milestone m3)

### 3.1 `/ask-tax` Flow

- [ ] T3.1 – Register Mattermost slash command `/ask-tax`
  - Configure in Mattermost system console:
    - Request URL (n8n webhook or Edge Function)
    - Channel restrictions (e.g., finance channels)
  - Owner: Platform
  - Status: TODO

- [ ] T3.2 – n8n workflow `wf_mm_ask_tax`
  - Implement flow described in `n8n` section below.
  - Add basic guards (max length, role checks).
  - Owner: Automation
  - Status: TODO

- [ ] T3.3 – Response templates
  - Create standardized format:
    - Short answer
    - Cited sources
    - Warnings for high-risk topics ("confirm with rules engine / SME")
  - Owner: Architect + Tax/SME
  - Status: TODO

### 3.2 `/validate-expense` Flow

- [ ] T3.4 – Register `/validate-expense`
  - Slash command taking Odoo expense ID or reference.
  - Owner: Platform
  - Status: TODO

- [ ] T3.5 – n8n workflow `wf_mm_validate_expense`
  - Implement flow to:
    - Fetch expense from Odoo
    - Normalize line items
    - Call tax rules engine
    - Post validation result back to Mattermost
  - Owner: Automation
  - Status: TODO

- [ ] T3.6 – Guards & error handling
  - Handle: invalid IDs, missing permissions, rules engine errors.
  - Owner: Automation
  - Status: TODO

---

## 4. Dashboards & Month-End Support (Milestone m4)

- [ ] T4.1 – Supabase views for T&E analytics
  - Create views:
    - `v_te_expenses_normalized`
    - `v_te_anomalies`
    - `v_te_tax_exposure`
  - Owner: Data
  - Status: TODO

- [ ] T4.2 – Superset dashboards
  - Build:
    - T&E anomalies dashboard
    - Tax exposure dashboard
    - Month-end T&E status dashboard
  - Owner: Data/Analytics
  - Status: TODO

- [ ] T4.3 – Month-end close bot flow
  - n8n workflow:
    - `/te-status` → summary of reconciliation and anomalies.
  - Owner: Automation
  - Status: TODO

---

## 5. Hardening & Rollout (Milestone m5)

- [ ] T5.1 – Load & resilience tests
  - Simulate typical month-end load on:
    - OCR service
    - RAG queries
    - Tax rules engine
  - Owner: Backend
  - Status: TODO

- [ ] T5.2 – Security review
  - Verify:
    - RLS policies
    - No secrets in logs
    - Proper Mattermost permissions
  - Owner: Security/Platform
  - Status: TODO

- [ ] T5.3 – Pilot roll-out
  - Select small group in finance.
  - Run 1–2 closing cycles with copilot.
  - Collect feedback into `ai_feedback` table.
  - Owner: Finance + Architect
  - Status: TODO

- [ ] T5.4 – v2 backlog
  - Capture learnings.
  - Log enhancements in `planning/te_ph_tax_copilot_backlog.md`.
  - Owner: Architect
  - Status: TODO
