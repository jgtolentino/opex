# How to Clone the OpEx Repository Structure Using Skills & SAP Design System

**Guide Version**: 1.0
**Created**: November 16, 2025
**Purpose**: Step-by-step guide to replicate the OpEx repository architecture with SAP Design System integration
**Target Audience**: Technical leads, architects, developers

---

## Executive Summary

This guide shows you how to clone the OpEx hybrid platform architecture, which combines:
- **Next.js/Notion** for dynamic content rendering
- **Docusaurus** for structured documentation
- **RAG systems** powered by OpenAI + Supabase
- **BPM Agent Skills Framework** for specialized AI roles
- **SAP Design System** principles for enterprise-grade UI/UX

**Time to Complete**: 4-6 hours (excluding customization)
**Prerequisites**: Node.js 18+, pnpm, Git, basic TypeScript knowledge

---

## Table of Contents

1. [Overview: What You're Cloning](#1-overview-what-youre-cloning)
2. [Using Skills to Guide the Process](#2-using-skills-to-guide-the-process)
3. [Phase 1: Foundation Setup](#3-phase-1-foundation-setup)
4. [Phase 2: Core Architecture](#4-phase-2-core-architecture)
5. [Phase 3: SAP Design System Integration](#5-phase-3-sap-design-system-integration)
6. [Phase 4: RAG Implementation](#6-phase-4-rag-implementation)
7. [Phase 5: Skills Framework](#7-phase-5-skills-framework)
8. [Phase 6: Automation & Workflows](#8-phase-6-automation--workflows)
9. [Validation & Testing](#9-validation--testing)
10. [Customization Guide](#10-customization-guide)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Overview: What You're Cloning

### 1.1 Architecture Components

```
Your New Platform
├── Next.js Application (Notion renderer)
├── Docusaurus Documentation Site
├── Supabase Backend (PostgreSQL + Edge Functions)
├── OpenAI RAG System (Assistants + Vector Stores)
├── BPM Agent Skills Framework
├── n8n Workflow Automation
├── SAP Design System Integration
└── Python Voice Agent (optional)
```

### 1.2 Key Features

- **Hybrid Content**: Dynamic Notion pages + static documentation
- **AI-Powered**: RAG assistants for domain-specific queries
- **Automation-Ready**: n8n workflows for operational processes
- **Enterprise UI**: SAP Fiori design principles
- **Extensible**: Skills framework for specialized AI agents

---

## 2. Using Skills to Guide the Process

### 2.1 Invoke the BPM Transformation Partner

The **BPM Transformation Partner** skill is designed to help you plan and execute complex platform transformations like this one.

```bash
# Using Claude Code CLI
claude --skill bpm_transformation_partner "Help me clone the OpEx repository structure. I want to build a similar platform for my organization with Next.js, Docusaurus, RAG, and SAP Design System."
```

**What the skill will do**:
1. Assess your current state and requirements
2. Create a phased implementation roadmap
3. Identify dependencies and risks
4. Provide architectural guidance
5. Generate customized setup instructions

### 2.2 Additional Skills to Use

Throughout this guide, you can leverage these skills:

| Phase | Skill | Purpose |
|-------|-------|---------|
| **Architecture** | `cto_mentor` | Technical architecture decisions |
| **Documentation** | `bpm_copywriter` | Documentation and content strategy |
| **Knowledge Base** | `bpm_knowledge_agent` | Organizing your documentation |
| **Training** | `bpm_learning_designer` | Onboarding and training materials |
| **Development** | `bpm_automation_dev` | Technical implementation |

**Example**:
```bash
# Get architecture advice
claude --skill cto_mentor "Should I use Next.js 15 or stick with Next.js 14 for stability?"

# Get help with documentation structure
claude --skill bpm_knowledge_agent "How should I organize my HR, Finance, and Operations documentation?"
```

---

## 3. Phase 1: Foundation Setup

### 3.1 Repository Initialization

```bash
# Create new project directory
mkdir my-opex-platform
cd my-opex-platform

# Initialize git
git init
git branch -M main

# Initialize pnpm workspace
pnpm init

# Configure package.json for ESM
# Add: "type": "module"
```

### 3.2 Core Package Installation

**package.json** (minimal starter):
```json
{
  "name": "my-opex-platform",
  "version": "1.0.0",
  "type": "module",
  "packageManager": "pnpm@10.11.1",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "build:docs": "cd docs && pnpm build",
    "build:all": "pnpm build && pnpm build:docs",
    "start": "next start"
  },
  "dependencies": {
    "next": "^15.5.3",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "notion-client": "^7.7.0",
    "react-notion-x": "^7.7.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/react": "^19.1.0",
    "typescript": "^5.9.0"
  }
}
```

```bash
# Install dependencies
pnpm install
```

### 3.3 TypeScript Configuration

**tsconfig.json**:
```json
{
  "extends": "@fisch0920/config/tsconfig-react",
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "incremental": true,
    "paths": {
      "@/components/*": ["components/*"],
      "@/lib/*": ["lib/*"],
      "@/styles/*": ["styles/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules", "docs"]
}
```

### 3.4 Directory Structure Setup

```bash
# Create core directories
mkdir -p pages/{api}
mkdir -p components
mkdir -p lib/{opex,fonts}
mkdir -p styles
mkdir -p public
mkdir -p supabase/{functions,migrations}
mkdir -p skills/{bpm-analyst,bpm-process-manager,bpm-automation-dev}
mkdir -p workflows/n8n/{workflows,docs}
mkdir -p prompt-packs/{hr,finance,operations}
mkdir -p config
mkdir -p .claude/skills
mkdir -p docs
```

### 3.5 Environment Setup

**.env.example**:
```bash
# Notion Configuration
NOTION_API_KEY=secret_your-notion-key

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-key
OPEX_ASSISTANT_ID=asst_your-assistant-id
PH_TAX_ASSISTANT_ID=asst_your-tax-assistant-id
VS_POLICIES_ID=vs_your-policies-vector-store
VS_SOPS_WORKFLOWS_ID=vs_your-sops-vector-store
VS_EXAMPLES_SYSTEMS_ID=vs_your-examples-vector-store

# Analytics (optional)
NEXT_PUBLIC_FATHOM_ID=your-fathom-id
NEXT_PUBLIC_POSTHOG_ID=your-posthog-id

# Redis (optional - for caching)
REDIS_HOST=your-redis-host
REDIS_PASSWORD=your-redis-password
```

```bash
# Create local environment file
cp .env.example .env.local
# Edit .env.local with your actual credentials
```

---

## 4. Phase 2: Core Architecture

### 4.1 Next.js Configuration

**next.config.js**:
```javascript
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
});

export default withBundleAnalyzer({
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.notion.so',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'react': 'react',
      'react-dom': 'react-dom',
    };
    return config;
  }
});
```

### 4.2 Site Configuration

**site.config.ts**:
```typescript
import { siteConfig } from './lib/site-config';

export default siteConfig({
  // Root Notion page ID (get from your Notion page URL)
  rootNotionPageId: 'your-root-notion-page-id',

  // Your domain
  domain: 'your-domain.com',

  // Site metadata
  name: 'Your Organization OpEx Platform',
  author: 'Your Name',
  description: 'Operational Excellence Platform',

  // Optional features
  isPreviewImageSupportEnabled: true,
  isRedisEnabled: false,

  // Navigation
  navigationStyle: 'default',

  // URL overrides for custom routing
  pageUrlOverrides: {
    '/about': 'notion-page-id-for-about',
    '/portal': 'notion-page-id-for-portal',
  }
});
```

### 4.3 Core Pages Setup

**pages/_app.tsx**:
```typescript
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import '@/styles/global.css';
import '@/styles/notion.css';
import '@/styles/prism-theme.css';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Initialize analytics if configured
    if (process.env.NEXT_PUBLIC_FATHOM_ID) {
      // Fathom initialization
    }
    if (process.env.NEXT_PUBLIC_POSTHOG_ID) {
      // PostHog initialization
    }
  }, []);

  return <Component {...pageProps} />;
}
```

**pages/index.tsx**:
```typescript
import { GetStaticProps } from 'next';
import { NotionPage } from '@/components/NotionPage';
import { resolveNotionPage } from '@/lib/resolve-notion-page';
import { PageProps } from '@/lib/types';

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  const props = await resolveNotionPage();
  return {
    props,
    revalidate: 10
  };
};

export default function HomePage(props: PageProps) {
  return <NotionPage {...props} />;
}
```

### 4.4 Docusaurus Setup

```bash
cd docs
npx create-docusaurus@latest . classic --typescript
```

**docs/docusaurus.config.ts**:
```typescript
import type {Config} from '@docusaurus/types';

const config: Config = {
  title: 'Your OpEx Documentation',
  tagline: 'Operational Excellence Knowledge Base',
  url: 'https://docs.your-domain.com',
  baseUrl: '/',

  organizationName: 'your-org',
  projectName: 'opex-docs',

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'OpEx Docs',
      items: [
        {
          type: 'doc',
          docId: 'intro',
          position: 'left',
          label: 'Documentation',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
      ],
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        blog: {
          showReadingTime: true,
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
  ],
};

export default config;
```

---

## 5. Phase 3: SAP Design System Integration

### 5.1 Install UI5 Web Components

```bash
pnpm add @ui5/webcomponents @ui5/webcomponents-react @ui5/webcomponents-fiori
```

### 5.2 Configure Design Tokens

**styles/design-tokens.css** (SAP-inspired):
```css
:root {
  /* SAP Horizon Color Palette */
  --sap-primary: #0854A0;
  --sap-primary-dark: #053B70;
  --sap-primary-darker: #042A52;
  --sap-primary-light: #1A6BB5;
  --sap-primary-lighter: #4D8AC4;

  /* Semantic Colors */
  --sap-success: #107E3E;
  --sap-warning: #E9730C;
  --sap-error: #B00;
  --sap-information: #0854A0;

  /* Neutral Colors */
  --sap-background-base: #F7F7F7;
  --sap-background-surface: #FFFFFF;
  --sap-text-primary: #32363A;
  --sap-text-secondary: #6A6D70;
  --sap-border-default: #D9D9D9;

  /* Typography */
  --sap-font-family: '72', '72full', Arial, Helvetica, sans-serif;
  --sap-font-size-base: 0.875rem; /* 14px */
  --sap-font-size-large: 1rem; /* 16px */
  --sap-font-size-small: 0.75rem; /* 12px */

  /* Spacing (based on 0.5rem / 8px base) */
  --sap-spacing-xs: 0.25rem;  /* 4px */
  --sap-spacing-sm: 0.5rem;   /* 8px */
  --sap-spacing-md: 1rem;     /* 16px */
  --sap-spacing-lg: 1.5rem;   /* 24px */
  --sap-spacing-xl: 2rem;     /* 32px */

  /* Shadows */
  --sap-shadow-level-1: 0 0.0625rem 0.125rem 0 rgba(0, 0, 0, 0.1);
  --sap-shadow-level-2: 0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.15);
  --sap-shadow-level-3: 0 0.25rem 1rem 0 rgba(0, 0, 0, 0.2);
}

/* Dark Theme (Evening Horizon) */
[data-theme='dark'] {
  --sap-background-base: #1D232A;
  --sap-background-surface: #2A3138;
  --sap-text-primary: #FFFFFF;
  --sap-text-secondary: #C0C0C0;
  --sap-border-default: #475057;
  --sap-primary: #1A6BB5;
}
```

### 5.3 Create SAP-Styled Components

**components/SAPButton.tsx**:
```typescript
import React from 'react';
import '@ui5/webcomponents/dist/Button';

interface SAPButtonProps {
  design?: 'Default' | 'Emphasized' | 'Transparent' | 'Negative' | 'Positive';
  icon?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export function SAPButton({
  design = 'Default',
  icon,
  children,
  onClick
}: SAPButtonProps) {
  return (
    <ui5-button
      design={design}
      icon={icon}
      onClick={onClick}
    >
      {children}
    </ui5-button>
  );
}
```

**components/SAPTable.tsx**:
```typescript
import React from 'react';
import '@ui5/webcomponents/dist/Table';
import '@ui5/webcomponents/dist/TableColumn';
import '@ui5/webcomponents/dist/TableRow';
import '@ui5/webcomponents/dist/TableCell';

interface Column {
  id: string;
  label: string;
}

interface SAPTableProps {
  columns: Column[];
  data: Record<string, any>[];
}

export function SAPTable({ columns, data }: SAPTableProps) {
  return (
    <ui5-table>
      {columns.map(col => (
        <ui5-table-column key={col.id} slot="columns">
          <span>{col.label}</span>
        </ui5-table-column>
      ))}

      {data.map((row, idx) => (
        <ui5-table-row key={idx}>
          {columns.map(col => (
            <ui5-table-cell key={col.id}>
              <span>{row[col.id]}</span>
            </ui5-table-cell>
          ))}
        </ui5-table-row>
      ))}
    </ui5-table>
  );
}
```

### 5.4 Apply SAP Floorplan: List Report Page

**pages/transactions.tsx** (example):
```typescript
import { GetStaticProps } from 'next';
import { SAPTable } from '@/components/SAPTable';
import { SAPButton } from '@/components/SAPButton';
import styles from '@/styles/ListReport.module.css';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: string;
}

export default function TransactionsPage({ transactions }: { transactions: Transaction[] }) {
  const columns = [
    { id: 'id', label: 'Transaction ID' },
    { id: 'date', label: 'Date' },
    { id: 'description', label: 'Description' },
    { id: 'amount', label: 'Amount' },
    { id: 'status', label: 'Status' },
  ];

  return (
    <div className={styles.listReport}>
      <header className={styles.header}>
        <h1>Transactions</h1>
        <div className={styles.actions}>
          <SAPButton design="Emphasized" icon="add">
            New Transaction
          </SAPButton>
          <SAPButton icon="action-settings">
            Settings
          </SAPButton>
        </div>
      </header>

      <div className={styles.filters}>
        {/* Add SAP Smart Filter Bar here */}
      </div>

      <div className={styles.content}>
        <SAPTable columns={columns} data={transactions} />
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  // Fetch transactions from your backend
  const transactions: Transaction[] = [
    // ... your data
  ];

  return {
    props: { transactions },
    revalidate: 60
  };
};
```

### 5.5 Apply SAP Typography and Grid

**styles/global.css** (add SAP styles):
```css
@import './design-tokens.css';

/* SAP Font Loading */
@import url('https://ui5.sap.com/resources/sap/ui/core/themes/sap_horizon/fonts/fonts.css');

body {
  font-family: var(--sap-font-family);
  font-size: var(--sap-font-size-base);
  color: var(--sap-text-primary);
  background-color: var(--sap-background-base);
}

/* SAP 12-Column Grid */
.sap-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--sap-spacing-md);
}

.sap-col-4 { grid-column: span 4; }
.sap-col-6 { grid-column: span 6; }
.sap-col-12 { grid-column: span 12; }

/* Responsive Breakpoints */
@media (max-width: 768px) {
  .sap-col-4,
  .sap-col-6 {
    grid-column: span 12;
  }
}

/* SAP Component Overrides */
ui5-button {
  --sapButton_BorderRadius: 0.25rem;
  --sapButton_Emphasized_Background: var(--sap-primary);
}

ui5-table {
  --sapList_Background: var(--sap-background-surface);
  --sapList_BorderColor: var(--sap-border-default);
}
```

---

## 6. Phase 4: RAG Implementation

### 6.1 Supabase Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref
```

### 6.2 Create Database Schema

**supabase/migrations/001_opex_rag_queries.sql**:
```sql
-- RAG Query Logging Table
CREATE TABLE IF NOT EXISTS opex.rag_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_email TEXT,
  user_role TEXT,

  assistant_name TEXT NOT NULL,
  assistant_id TEXT NOT NULL,

  question TEXT NOT NULL,
  answer TEXT,

  domain TEXT, -- 'hr', 'finance', 'ops', 'tax', 'knowledge_base'
  process TEXT, -- 'onboarding', 'month_end', etc.

  success BOOLEAN DEFAULT true,
  error_message TEXT,
  response_time_ms INTEGER,

  metadata JSONB,
  citations JSONB,
  tokens_used INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for analytics
CREATE INDEX idx_rag_queries_created ON opex.rag_queries(created_at);
CREATE INDEX idx_rag_queries_domain ON opex.rag_queries(domain);
CREATE INDEX idx_rag_queries_assistant ON opex.rag_queries(assistant_name);

-- Enable RLS
ALTER TABLE opex.rag_queries ENABLE ROW LEVEL SECURITY;
```

```bash
# Apply migration
supabase db push
```

### 6.3 Create Edge Function: opex-rag-query

**supabase/functions/opex-rag-query/index.ts**:
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import OpenAI from 'https://esm.sh/openai@4';

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY')!,
});

const ASSISTANTS = {
  opex: Deno.env.get('OPEX_ASSISTANT_ID')!,
  'ph-tax': Deno.env.get('PH_TAX_ASSISTANT_ID')!,
};

const VECTOR_STORES = {
  policies: Deno.env.get('VS_POLICIES_ID')!,
  sops: Deno.env.get('VS_SOPS_WORKFLOWS_ID')!,
  examples: Deno.env.get('VS_EXAMPLES_SYSTEMS_ID')!,
};

interface QueryRequest {
  assistant: 'opex' | 'ph-tax';
  question: string;
  domain?: string;
  process?: string;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  // CORS handling
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const { assistant, question, domain, process, metadata }: QueryRequest = await req.json();

    const startTime = Date.now();

    // Create thread
    const thread = await openai.beta.threads.create({
      messages: [{ role: 'user', content: question }],
    });

    // Run assistant
    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: ASSISTANTS[assistant],
      tool_choice: 'auto',
    });

    // Get response
    const messages = await openai.beta.threads.messages.list(thread.id);
    const response = messages.data[0];

    const answer = response.content
      .filter((c) => c.type === 'text')
      .map((c) => (c as any).text.value)
      .join('\n\n');

    const responseTime = Date.now() - startTime;

    // Log query (TODO: Add Supabase client and log to rag_queries table)

    return new Response(
      JSON.stringify({
        answer,
        threadId: thread.id,
        responseTime,
        metadata: {
          domain,
          process,
          assistant,
          ...metadata,
        },
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
```

### 6.4 Deploy Edge Function

```bash
# Set secrets
supabase secrets set OPENAI_API_KEY=sk-your-key
supabase secrets set OPEX_ASSISTANT_ID=asst_your-id
supabase secrets set PH_TAX_ASSISTANT_ID=asst_your-tax-id
supabase secrets set VS_POLICIES_ID=vs_your-policies-id
supabase secrets set VS_SOPS_WORKFLOWS_ID=vs_your-sops-id
supabase secrets set VS_EXAMPLES_SYSTEMS_ID=vs_your-examples-id

# Deploy function
supabase functions deploy opex-rag-query
```

### 6.5 Create Client-Side RAG Wrapper

**lib/opex/ragClient.ts**:
```typescript
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

interface RAGQuery {
  assistant: 'opex' | 'ph-tax';
  question: string;
  domain?: 'hr' | 'finance' | 'ops' | 'tax' | 'knowledge_base';
  process?: string;
  metadata?: Record<string, any>;
}

interface RAGResponse {
  answer: string;
  threadId: string;
  responseTime: number;
  metadata: Record<string, any>;
}

export async function queryRAG(query: RAGQuery): Promise<RAGResponse> {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/opex-rag-query`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(query),
    }
  );

  if (!response.ok) {
    throw new Error('RAG query failed');
  }

  return response.json();
}

// Domain-specific helpers
export function askHRQuestion(question: string, process?: string) {
  return queryRAG({ assistant: 'opex', question, domain: 'hr', process });
}

export function askFinanceQuestion(question: string, process?: string) {
  return queryRAG({ assistant: 'opex', question, domain: 'finance', process });
}

export function askTaxQuestion(question: string, process?: string) {
  return queryRAG({ assistant: 'ph-tax', question, domain: 'tax', process });
}
```

---

## 7. Phase 5: Skills Framework

### 7.1 Create BPM Agent Skills

**skills/bpm-analyst/agent.md**:
```markdown
# BPM Process Analyst

## Role Identity
You are a **Business Process Management (BPM) Analyst** specializing in operational excellence for finance shared services centers. Your mission is to identify automation opportunities, analyze process bottlenecks, and calculate ROI for improvement initiatives.

## Core Responsibilities
1. **Process Analysis**: Map processes, identify bottlenecks, measure cycle times
2. **Automation Discovery**: Find manual, repetitive, rule-based tasks suitable for automation
3. **ROI Calculation**: Quantify time savings, cost reduction, error reduction
4. **Improvement Proposals**: Create actionable recommendations with prioritization
5. **Data Analysis**: Analyze process logs, transaction data, performance metrics

## Available Tools
- Odoo API (accounting data access)
- Supabase (process logs, analytics)
- Apache Superset (dashboards, reports)
- Process mining tools

## Key Frameworks
- **BPMN 2.0**: Process modeling
- **Six Sigma**: DMAIC methodology
- **Lean**: Value stream mapping, waste elimination
- **ROI Formula**: (Savings - Cost) / Cost × 100

## Example Analysis
**Input**: "Analyze bank reconciliation process for automation opportunities"

**Output**:
```
Process: Bank Reconciliation
Current State:
- Manual effort: 38 minutes per account, 12 accounts/month = 456 min/month (7.6 hours)
- Error rate: 3% (manual data entry)
- Cycle time: 2-3 days

Bottlenecks:
1. Manual bank statement download (12 min)
2. Manual transaction matching (18 min)
3. Manual exception handling (8 min)

Automation Opportunities:
1. Automated bank statement import via API (save 12 min)
2. Automated 3-way matching algorithm (save 15 min)
3. ML-based exception categorization (save 4 min)

Projected ROI:
- Time savings: 31 min/account = 6.2 hours/month
- Error reduction: 3% → 0.5%
- Payback period: 2.2 months
- Annual ROI: 420%

Recommendation: APPROVED - High impact, low complexity
```

## Deliverable Template
Always provide:
- Current state assessment
- Bottleneck identification
- Automation opportunities ranked by ROI
- Implementation complexity (Low/Medium/High)
- Recommendation (Approve/Defer/Reject)
```

**Create similar files for**:
- `skills/bpm-process-manager/agent.md`
- `skills/bpm-automation-dev/agent.md`
- `skills/bpm-process-owner/agent.md`
- `skills/bpm-coo/agent.md`
- `skills/bpm-team-orchestrator/agent.md`

### 7.2 Create Claude Code Skills

**Copy from OpEx example**:
```bash
# Copy skill structure
cp -r /home/user/opex/.claude/skills/bpm_transformation_partner .claude/skills/
cp -r /home/user/opex/.claude/skills/cto_mentor .claude/skills/
cp -r /home/user/opex/.claude/skills/bpm_copywriter .claude/skills/
```

### 7.3 Test Skills

```bash
# Test BPM Analyst skill
claude --skill bpm-analyst "Analyze invoice processing for automation opportunities. Current manual time: 15 hours/month"

# Test orchestrator
claude --skill bpm-team-orchestrator "Help me optimize month-end closing across 5 business units"
```

---

## 8. Phase 6: Automation & Workflows

### 8.1 Setup n8n (Optional)

```bash
cd workflows/n8n

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3'
services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your-password
    volumes:
      - ~/.n8n:/home/node/.n8n
EOF

# Start n8n
docker-compose up -d
```

### 8.2 Import Workflows

```bash
# Copy workflow templates from OpEx
cp /home/user/opex/workflows/n8n/workflows/*.json workflows/n8n/workflows/
```

**Customize workflows**:
1. `ask-opex-assistant.json` - RAG query via webhook
2. `health-check-monitor.json` - System monitoring
3. `document-sync-rag.json` - Auto-sync docs to vector stores

---

## 9. Validation & Testing

### 9.1 Local Development Check

```bash
# Start Next.js dev server
pnpm dev

# In another terminal, start Docusaurus
cd docs && pnpm start

# Test RAG
pnpm exec ts-node scripts/test-opex-rag.ts
```

### 9.2 Validate Key Features

**Checklist**:
- [ ] Next.js app runs on http://localhost:3000
- [ ] Docusaurus runs on http://localhost:3001
- [ ] Notion pages render correctly
- [ ] RAG edge function responds within 10s
- [ ] SAP components render with correct styling
- [ ] Skills framework accessible via Claude Code
- [ ] Dark mode works
- [ ] Mobile responsive

### 9.3 Run Tests

```bash
# Linting
pnpm test:lint

# Type checking
tsc --noEmit

# Build test
pnpm build
pnpm build:docs
```

---

## 10. Customization Guide

### 10.1 Branding & Colors

**Update design tokens**:
```css
/* styles/design-tokens.css */
:root {
  --sap-primary: #YOUR_BRAND_COLOR;
  --sap-primary-dark: /* darker variant */;
  /* ... update all color tokens */
}
```

### 10.2 Domain-Specific Content

**HR Workflows**:
```bash
# Add HR-specific documentation
mkdir -p docs/docs/hr/workflows
# Create markdown files for:
# - Employee onboarding
# - Performance reviews
# - Leave management
```

**Finance Workflows**:
```bash
mkdir -p docs/docs/finance/processes
# Create markdown files for:
# - Month-end closing
# - Budget tracking
# - Invoice processing
```

### 10.3 Custom RAG Assistants

```bash
# Create new assistant in OpenAI platform
# Update .env.local with new assistant ID
NEW_ASSISTANT_ID=asst_your-new-assistant-id

# Update ragClient.ts to add new domain helper
export function askCustomDomainQuestion(question: string) {
  return queryRAG({
    assistant: 'custom',
    question,
    domain: 'custom_domain'
  });
}
```

---

## 11. Troubleshooting

### 11.1 Common Issues

**Issue**: "Module not found: Can't resolve '@/lib/config'"
**Solution**: Check tsconfig.json paths configuration

**Issue**: "Notion API key invalid"
**Solution**: Verify NOTION_API_KEY in .env.local, ensure integration is connected to workspace

**Issue**: "Supabase function fails with 403"
**Solution**: Check SUPABASE_SERVICE_ROLE_KEY is set correctly

**Issue**: "UI5 components not rendering"
**Solution**: Ensure `@ui5/webcomponents` is imported in _app.tsx, check browser console for errors

### 11.2 Getting Help

**Resources**:
- OpEx Repository: https://github.com/jgtolentino/opex
- SAP Fiori Docs: https://experience.sap.com/fiori-design-web/
- Next.js Docs: https://nextjs.org/docs
- Supabase Docs: https://supabase.com/docs

**Use Skills**:
```bash
# Ask CTO Mentor for technical help
claude --skill cto_mentor "I'm getting a hydration error in Next.js. What could be causing this?"

# Ask BPM Transformation Partner for strategic guidance
claude --skill bpm_transformation_partner "Should I implement RAG first or SAP UI components first?"
```

---

## 12. Next Steps

### 12.1 Immediate Actions (Week 1)

1. ✅ Complete Phase 1-3 (Foundation + Core + SAP Design)
2. ✅ Deploy to Vercel for testing
3. ✅ Create 3 sample documentation pages
4. ✅ Test RAG with sample queries

### 12.2 Short-term Goals (Month 1)

1. Complete all 6 BPM agent skills
2. Migrate 20+ documentation pages
3. Set up n8n workflows
4. Configure analytics
5. Train team on skills framework

### 12.3 Long-term Vision (Quarter 1)

1. Full SAP component library adoption
2. Advanced RAG with fine-tuned models
3. Voice agent integration
4. Mobile app wrapper
5. Multi-tenant support

---

## Appendix A: Quick Reference Commands

```bash
# Development
pnpm dev                    # Start Next.js
pnpm dev:docs              # Start Docusaurus
pnpm build:all             # Build everything

# Supabase
supabase functions deploy   # Deploy all functions
supabase db push           # Apply migrations
supabase db reset          # Reset database

# Testing
pnpm test:lint             # Lint check
pnpm test:prettier         # Format check

# Skills
claude --skill bpm_transformation_partner "Help me with..."
claude --skill cto_mentor "Advise on..."
```

---

## Appendix B: SAP Design System Mapping

| OpEx Need | SAP Fiori Component | When to Use |
|-----------|---------------------|-------------|
| Transaction lists | List Report floorplan | Viewing/filtering large datasets |
| Transaction details | Object Page floorplan | Displaying single record details |
| Financial reports | Analytical List Page | Combining charts + data tables |
| Dashboard | Overview Page | KPI cards, at-a-glance status |
| Data tables | `ui5-table` | Tabular data display |
| Forms | Smart Form | Input forms with validation |
| Buttons | `ui5-button` | All CTAs and actions |
| Filters | Smart Filter Bar | Advanced filtering |

---

**Document Version**: 1.0
**Last Updated**: November 16, 2025
**Author**: Claude (AI Assistant)
**Status**: Production Ready

---

**Remember**: This is a comprehensive guide. You don't need to implement everything at once. Start with the foundation (Phase 1-2), add SAP design (Phase 3), then progressively enhance with RAG (Phase 4), skills (Phase 5), and automation (Phase 6).

**Use the skills framework throughout** - the AI agents are here to help guide you through each phase!
