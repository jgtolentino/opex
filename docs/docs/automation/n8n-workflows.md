---
sidebar_position: 1
title: n8n Automation Workflows
description: Production-ready n8n workflows for OpEx operations
---

# n8n Automation Workflows

Automate OpEx operations, finance processes, and infrastructure monitoring with production-ready n8n workflows.

## Overview

The OpEx platform includes 4 pre-built n8n workflows that automate:
- **RAG Query Handling** - Mattermost slash command integration
- **Tax Deadline Notifications** - Automated BIR compliance reminders
- **Service Health Monitoring** - Proactive infrastructure monitoring
- **Document Synchronization** - Self-healing RAG knowledge base

## Available Workflows

### 1. Ask OpEx / PH Tax Assistant

**Trigger**: Webhook POST (Mattermost `/opex` slash command)

**Features**:
- Query OpEx RAG system from Mattermost
- Supports HR, Finance, and Tax domains
- Automatic domain detection
- Real-time AI-generated answers

**Use Cases**:
- "What is the employee requisition process?"
- "When is BIR Form 1601-C due?"
- "How do I submit an expense report?"

**Mattermost Usage**:
```
/opex What is the onboarding process?
```

---

### 2. PH Tax Deadline Notifier

**Trigger**: Cron (Daily at 8 AM Philippine Time)

**Features**:
- Daily check for upcoming BIR deadlines
- 7-day advance notification window
- Multi-agency support (RIM, CKVC, BOM, etc.)
- Mattermost channel routing

**Notification Example**:
```
🚨 Tax Deadline Reminder

Agency: RIM
Form: 1601-C (Monthly Remittance Return)
Due Date: 2025-12-10
Days Remaining: 5
```

---

### 3. Service Health Check Monitor

**Trigger**: Cron (Every 10 minutes)

**Features**:
- Monitors 4 critical services (MCP, ERP, OCR, n8n)
- Response time tracking (<500ms threshold)
- Automatic Mattermost alerts
- Optional GitHub issue creation

**Services Monitored**:
- MCP Service (`https://mcp.insightpulseai.net/health`)
- ERP Odoo (`https://erp.insightpulseai.net/web/health`)
- OCR Service (`https://ade-ocr-backend-d9dru.ondigitalocean.app/health`)
- n8n Self (`https://ipa.insightpulseai.net/healthz`)

---

### 4. BIR Document Sync to RAG

**Trigger**: Cron (Daily at 3 AM Philippine Time)

**Features**:
- Automatic BIR website scraping
- New document detection
- PDF download and processing
- RAG embedding update via `embedding-worker`
- Batched processing with rate limiting

**Process Flow**:
```
Fetch Sitemap → Parse URLs → Filter New Docs →
Download PDFs → Create Embeddings → Update RAG
```

---

## Quick Start

### Prerequisites

- n8n instance running at https://ipa.insightpulseai.net
- Supabase project: `ublqmilcjtpnflofprkr`
- Mattermost instance configured
- Credentials configured in n8n

### Import Workflows

1. Download workflow JSON files from [`workflows/n8n/`](https://github.com/jgtolentino/opex/tree/main/workflows/n8n)
2. Open n8n → **Workflows** → **Import from File**
3. Select JSON file (e.g., `ask-opex-assistant.json`)
4. Configure credentials (Supabase, Mattermost)
5. **Save** and **Activate**

### Test Workflows

**Ask OpEx Assistant**:
```bash
curl -X POST https://ipa.insightpulseai.net/webhook/ask-opex-assistant \
  -H "Content-Type: application/json" \
  -d '{"text": "What is the onboarding process?"}'
```

**Tax Deadline Notifier**:
- Manually execute in n8n UI
- Check Mattermost `#finance-alerts` for notification

**Health Check Monitor**:
- Manually execute to see current service status
- Verify Mattermost alert if service down

**Document Sync**:
- Manually execute to sync new BIR documents
- Check Supabase `opex.embedding_sources` table

---

## Documentation

### Setup Guides

- **[Setup Guide](https://github.com/jgtolentino/opex/blob/main/workflows/n8n/docs/SETUP.md)** - n8n + credential configuration
- **[Mattermost Integration](https://github.com/jgtolentino/opex/blob/main/workflows/n8n/docs/MATTERMOST_CONFIG.md)** - Slash command setup
- **[Credentials Guide](https://github.com/jgtolentino/opex/blob/main/workflows/n8n/docs/CREDENTIALS.md)** - Supabase, Mattermost, GitHub credentials

### Individual Workflow Docs

- [Ask OpEx Assistant](https://github.com/jgtolentino/opex/blob/main/workflows/n8n/docs/workflows/ask-opex-assistant.md)
- [Tax Deadline Notifier](https://github.com/jgtolentino/opex/blob/main/workflows/n8n/docs/workflows/tax-deadline-notifier.md)
- [Health Check Monitor](https://github.com/jgtolentino/opex/blob/main/workflows/n8n/docs/workflows/health-check-monitor.md)
- [Document Sync RAG](https://github.com/jgtolentino/opex/blob/main/workflows/n8n/docs/workflows/document-sync-rag.md)

---

## Architecture

```
┌─────────────────┐
│   Mattermost    │  /opex command
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   n8n Workflow  │  Orchestration
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Supabase Edge   │  opex-rag-query
│   Functions     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   OpenAI API    │  gpt-4-turbo + RAG
└─────────────────┘
```

---

## Support

- **Repository**: [github.com/jgtolentino/opex/tree/main/workflows/n8n](https://github.com/jgtolentino/opex/tree/main/workflows/n8n)
- **Mattermost**: `#ops-automation`
- **GitHub Issues**: [github.com/jgtolentino/opex/issues](https://github.com/jgtolentino/opex/issues)
