# InsightPulse Data Lab - Comprehensive Integration Guide

**Version**: 1.0.0
**Last Updated**: November 17, 2025
**Author**: InsightPulse AI Team

---

## Executive Summary

This guide describes how to integrate and operate the **InsightPulse Data Lab**, a comprehensive analytics platform built on:

- **Apache Superset** (or compatible BI platform) for dashboards and data exploration
- **Deepnote** for collaborative notebooks and data job orchestration
- **Apache ECharts** for standardized, beautiful visualizations
- **Jenny (AI BI Genie)** for natural language analytics
- **Supabase/PostgreSQL** as the unified data warehouse

The Data Lab brings together executive dashboards, ad-hoc analytics, and automated data pipelines in a single, cohesive experience.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Component Breakdown](#component-breakdown)
3. [Skills Framework](#skills-framework)
4. [Integration Patterns](#integration-patterns)
5. [Implementation Roadmap](#implementation-roadmap)
6. [User Personas & Workflows](#user-personas--workflows)
7. [Technical Implementation](#technical-implementation)
8. [Deployment Guide](#deployment-guide)
9. [Troubleshooting](#troubleshooting)
10. [Next Steps](#next-steps)

---

## Architecture Overview

### High-Level Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    InsightPulse Data Lab                        │
│                                                                 │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐ │
│  │   Deepnote   │      │   Superset   │      │    Jenny     │ │
│  │  Notebooks   │─────▶│  Dashboards  │◀─────│  AI Genie    │ │
│  │              │      │              │      │              │ │
│  └──────┬───────┘      └──────┬───────┘      └──────┬───────┘ │
│         │                     │                     │         │
│         └─────────────────────┼─────────────────────┘         │
│                               │                               │
│                    ┌──────────▼──────────┐                     │
│                    │  Supabase Postgres  │                     │
│                    │  Data Warehouse     │                     │
│                    │  - Gold Tables      │                     │
│                    │  - Summary Views    │                     │
│                    │  - Metadata         │                     │
│                    └─────────────────────┘                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Component Roles

| Component | Purpose | Primary Users |
|-----------|---------|---------------|
| **Superset** | Pre-built dashboards, scheduled reports, embedded analytics | Executives, analysts, business users |
| **Deepnote** | Data exploration, job orchestration, transformation pipelines | Data engineers, analytics engineers |
| **Jenny** | Conversational analytics, ad-hoc queries, learning interface | All users (especially non-technical) |
| **ECharts** | Standardized visualizations across all surfaces | System-wide (rendered everywhere) |
| **Supabase** | Unified data warehouse, single source of truth | Backend for all components |

### Database Architecture (Single Shared Database)

**Critical:** All Data Lab components use the **same Supabase PostgreSQL database**. There is NO separate database for Deepnote, Superset, or Jenny.

```
┌──────────────────────────────────────────────────────────┐
│         Supabase PostgreSQL (Single Database)            │
│                                                          │
│  Production Schemas (READ-ONLY except via migrations):  │
│    • scout.*    - retail/sales metrics                  │
│    • opex.*     - operations and month-end metrics      │
│    • te_tax.*   - tax and expense tracking              │
│    • ces.*      - creative effectiveness metrics        │
│    • gold.*     - summary tables (written by Deepnote)  │
│                                                          │
│  Development Schemas (READ/WRITE for Deepnote):         │
│    • dev_lab_*  - experimental schemas for prototyping  │
│    • staging.*  - testing before production             │
└──────────────────────────────────────────────────────────┘
              ▲          ▲          ▲          ▲
              │          │          │          │
      ┌───────┘          │          │          └─────────┐
      │                  │          │                    │
┌─────▼──────┐   ┌───────▼─────┐  ┌▼────────┐  ┌────────▼────────┐
│ Deepnote   │   │  Superset   │  │ Jenny   │  │ OpEx Admin      │
│ (data-lab/)│   │  (BI)       │  │ (AI BI) │  │ Shell (AntD)    │
└────────────┘   └─────────────┘  └─────────┘  └─────────────────┘
READ/WRITE        READ-ONLY        READ-ONLY      READ-ONLY
(dev_lab_*)       (curated)        (curated)      (curated)
```

**Access Patterns:**
- **Deepnote**: Read/write to `dev_lab_*` for experiments; read-only to production schemas; writes to `gold.*` via scheduled jobs
- **Superset**: Read-only to curated schemas for BI dashboards
- **Jenny**: Read-only to curated schemas for conversational analytics
- **OpEx Admin Shell**: Read-only to curated schemas for operational UI

**Database Roles:**
```sql
-- Deepnote (development)
deepnote_dev → GRANT ALL ON dev_lab_*, CREATE on gold.*

-- Deepnote (production queries)
deepnote_readonly → GRANT SELECT ON scout, opex, te_tax, ces, gold

-- Superset
superset_readonly → GRANT SELECT ON scout, opex, te_tax, ces, gold

-- Jenny
jenny_readonly → GRANT SELECT ON scout, opex, te_tax, ces, gold
```

**Setup Instructions:** See `DATA_LAB_SETUP.md` for complete database configuration guide.

---

## Component Breakdown

### 1. Apache Superset (BI Platform)

**What it does:**
- Hosts pre-built executive dashboards
- Provides dataset definitions and semantic layer
- Enables self-service chart building
- Powers embedded analytics in OpEx UI

**Key Features:**
- RBAC (Role-Based Access Control)
- RLS (Row-Level Security) for multi-tenancy
- SQL Lab for ad-hoc queries
- Chart caching and query optimization
- REST API for programmatic management

**Skills that support Superset:**
- `insightpulse-superset-platform-admin` - Deployment and operations
- `insightpulse-superset-embedded-analytics` - Embedding in OpEx UI
- `insightpulse-superset-api-ops` - Infrastructure as code
- `insightpulse-superset-user-enablement` - Training and adoption

### 2. Deepnote (Data Lab Workbench)

**What it does:**
- Collaborative notebook environment for data exploration
- Scheduled job runner for data pipelines
- Transformation layer feeding gold tables to Superset/Jenny
- EDA (Exploratory Data Analysis) workspace

**Key Features:**
- Python/SQL notebooks with scheduling
- Git integration for version control
- Environment management
- Database connection management
- Real-time collaboration

**Skills that support Deepnote:**
- `insightpulse-deepnote-data-lab` - Workspace architecture and job design

**Repository:**
- Located at `data-lab/` (git submodule)
- Source: https://github.com/jgtolentino/deep-data-workbench
- Initialize with: `git submodule update --init data-lab`
- See `DATA_LAB_SETUP.md` for complete setup instructions

### 3. Jenny (AI BI Genie)

**What it does:**
- Conversational analytics interface
- Natural language to SQL translation
- Auto-generates charts and insights
- Explains reasoning and data freshness

**Key Features:**
- Space-aware (scoped to specific domains)
- Multi-modal answers (text + chart + table + SQL)
- Feedback loop for continuous improvement
- Integration with gold tables and semantic layer

**UI Component:**
- `components/jenny/JennyPanel.tsx` - React component for Jenny interface

### 4. Apache ECharts (Visualization Standard)

**What it does:**
- Provides consistent, beautiful charts across all surfaces
- Powers Superset chart plugins
- Used in Jenny responses
- Embedded in OpEx UI dashboards

**Key Features:**
- Extensive chart types (line, bar, scatter, heatmap, etc.)
- Theming and branding
- Interactive features (zoom, brush, tooltip)
- High performance with large datasets

**Skills that support ECharts:**
- `insightpulse-echarts-viz-system` - Chart design and theming

### 5. Supabase/PostgreSQL (Data Warehouse)

**What it does:**
- Central data warehouse
- Hosts gold/summary tables produced by Deepnote
- Stores RAG query metadata and job logs
- Single source of truth for all analytics

**Key Tables:**
- `gold.*` - Summary tables for dashboards
- `rag_queries` - Jenny query log and analytics
- `data_lab_job_runs` - Deepnote job metadata
- Application tables (depending on OpEx domains)

---

## Skills Framework

The InsightPulse Data Lab is supported by **six specialized Claude Code skills** that act as expert assistants for different aspects of the platform.

### How to Use Skills

Skills are markdown-based agent definitions in `.claude/skills/`. They can be invoked in Claude Code to get expert guidance on specific tasks.

**Example:**
```bash
# To get help deploying Superset
claude skill invoke insightpulse-superset-platform-admin

# To design Deepnote jobs
claude skill invoke insightpulse-deepnote-data-lab

# To create ECharts themes
claude skill invoke insightpulse-echarts-viz-system
```

### Available Skills

| Skill | When to Use |
|-------|-------------|
| **insightpulse-superset-platform-admin** | Deploying, upgrading, monitoring Superset; infrastructure planning |
| **insightpulse-superset-embedded-analytics** | Embedding dashboards in OpEx UI; theming; SSO/RLS setup |
| **insightpulse-superset-api-ops** | Managing Superset assets as code; CI/CD for dashboards |
| **insightpulse-superset-user-enablement** | Creating training materials, onboarding plans, documentation |
| **insightpulse-deepnote-data-lab** | Designing notebook structure; creating scheduled jobs; integration |
| **insightpulse-echarts-viz-system** | Choosing chart types; creating themes; designing visualizations |

---

## Integration Patterns

### Pattern 1: Deepnote → Gold Tables → Superset/Jenny

**Flow:**
1. Deepnote notebook runs on schedule (e.g., daily at 2 AM)
2. Queries raw data, applies transformations
3. Writes to `gold.sales_daily_summary` table in Supabase
4. Superset dataset references this table
5. Jenny can query this table for conversational analytics

**Implementation:**
```python
# In Deepnote notebook: 90_job_sales_summary.ipynb
import psycopg2
from datetime import datetime

# Connect to Supabase
conn = psycopg2.connect(os.environ['SUPABASE_CONNECTION_STRING'])

# Transform data
df_summary = raw_data.groupby(['date', 'region']).agg({
    'revenue': 'sum',
    'orders': 'count'
}).reset_index()

# Write to gold table (idempotent UPSERT)
df_summary.to_sql(
    'sales_daily_summary',
    conn,
    schema='gold',
    if_exists='replace',  # or use UPSERT logic
    index=False
)

# Log job run
conn.execute("""
    INSERT INTO data_lab_job_runs (job_name, status, rows_written, finished_at)
    VALUES ('sales_summary', 'success', %s, %s)
""", (len(df_summary), datetime.now()))
conn.commit()
```

### Pattern 2: Jenny Natural Language Query

**Flow:**
1. User asks Jenny: "Top 5 brands by revenue last 30 days"
2. Jenny translates to SQL using semantic layer
3. Queries `gold.sales_daily_summary`
4. Generates ECharts visualization
5. Returns multi-modal answer (insight + chart + table + SQL)

**Implementation:**
```typescript
// In OpEx UI
import JennyPanel from '@/components/jenny/JennyPanel';

const handleJennyQuestion = async (question: string) => {
  const response = await fetch('/api/jenny/query', {
    method: 'POST',
    body: JSON.stringify({
      space: 'sales',
      question,
      domain: 'revenue'
    })
  });

  const result = await response.json();
  setSelectedResult({
    title: result.title,
    description: result.summary,
    chartOption: result.echarts_option,
    tableData: result.rows,
    sql: result.generated_sql,
    explanation: result.reasoning
  });
};
```

### Pattern 3: Embedded Superset Dashboard in OpEx UI

**Flow:**
1. Create dashboard in Superset
2. Configure embedding permissions (guest token or SSO)
3. Embed in OpEx UI via iframe or reverse proxy
4. Apply theming to match OpEx design system

**Implementation:**
```tsx
// In OpEx UI page
import { SupersetEmbedded } from '@/components/superset/Embedded';

<SupersetEmbedded
  dashboardId="abc123"
  filters={{ region: 'APAC', date_range: 'last_30_days' }}
  theme="insightpulse-light"
/>
```

### Pattern 4: ECharts Theme Consistency

**Flow:**
1. Define InsightPulse ECharts theme once
2. Register theme in all contexts (Superset, Jenny, OpEx UI)
3. All charts automatically use consistent colors, fonts, spacing

**Implementation:**
```javascript
// theme/insightpulse-echarts-theme.js
export const insightPulseTheme = {
  color: [
    '#6750A4', // Primary (M3)
    '#958DA5', // Secondary
    '#D0BCFF', // Tertiary
    '#B3261E', // Error
  ],
  backgroundColor: '#FFFBFE',
  textStyle: {
    fontFamily: 'Inter, Roboto, sans-serif',
    fontSize: 12
  },
  // ... full theme definition
};

// In React app
import * as echarts from 'echarts';
import { insightPulseTheme } from '@/theme/insightpulse-echarts-theme';

echarts.registerTheme('insightpulse', insightPulseTheme);
const chart = echarts.init(dom, 'insightpulse');
```

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)

**Goal:** Set up core infrastructure

- [ ] Deploy Supabase/PostgreSQL warehouse
- [ ] Set up Superset instance (Docker or K8s)
- [ ] Create initial Deepnote workspace
- [ ] Define gold table schemas

**Deliverables:**
- Supabase database with `gold`, `staging`, `raw` schemas
- Superset accessible at `superset.insightpulse.ai`
- Deepnote workspace: "InsightPulse Data Lab"

### Phase 2: Data Pipelines (Weeks 3-4)

**Goal:** Build automated data flows

- [ ] Create Deepnote notebooks for key metrics
- [ ] Schedule daily/hourly jobs
- [ ] Populate gold tables
- [ ] Set up job monitoring

**Deliverables:**
- 3-5 production notebooks writing to gold tables
- Job run metadata table with health checks
- Alerts for failed jobs

### Phase 3: Dashboards (Weeks 5-6)

**Goal:** Build executive dashboards

- [ ] Create Superset datasets from gold tables
- [ ] Build 3-5 core dashboards (Exec Overview, Sales, Finance)
- [ ] Configure RBAC and RLS
- [ ] Set up caching

**Deliverables:**
- Published dashboards accessible to stakeholders
- Permissions aligned with org structure
- Email/Slack scheduled reports

### Phase 4: Jenny Integration (Weeks 7-8)

**Goal:** Enable conversational analytics

- [ ] Implement NL→SQL service (WrenAI, Text2SQL, or custom)
- [ ] Deploy JennyPanel in OpEx UI
- [ ] Define semantic layer and spaces
- [ ] Wire to gold tables

**Deliverables:**
- Jenny accessible in OpEx portal
- 2-3 defined spaces (Sales, Finance, Ops)
- Query logging and feedback system

### Phase 5: Embedding & Theming (Weeks 9-10)

**Goal:** Unify UX across surfaces

- [ ] Define InsightPulse ECharts theme
- [ ] Embed Superset dashboards in OpEx UI
- [ ] Apply consistent branding
- [ ] Set up SSO

**Deliverables:**
- Embedded dashboards in OpEx portal pages
- Consistent look-and-feel across Superset, Jenny, OpEx
- Single sign-on flow

### Phase 6: Enablement & Rollout (Weeks 11-12)

**Goal:** Launch to users

- [ ] Create documentation (Notion or Docusaurus)
- [ ] Train analysts and power users
- [ ] Conduct exec demo
- [ ] Gather feedback and iterate

**Deliverables:**
- User documentation site
- Training videos and workshops
- Adoption metrics dashboard

---

## User Personas & Workflows

### Persona 1: Executive (CEO, CFO, COO)

**Goals:**
- Monitor high-level KPIs
- Spot trends and anomalies
- Make data-driven decisions quickly

**Tools:**
- Superset dashboards (mobile + desktop)
- Jenny for ad-hoc questions
- Email/Slack reports

**Typical Workflow:**
1. Opens OpEx portal → sees embedded Exec Overview dashboard
2. Asks Jenny: "What drove the 15% revenue increase this month?"
3. Receives natural language answer + chart
4. Drills into Superset dashboard for details

### Persona 2: Analyst (Finance Analyst, Sales Analyst)

**Goals:**
- Build custom analyses
- Answer business questions
- Create reports for stakeholders

**Tools:**
- Superset SQL Lab
- Deepnote for exploration
- Jenny for quick insights

**Typical Workflow:**
1. Asks Jenny: "Top 10 customers by LTV"
2. Reviews results, decides to dig deeper
3. Opens Superset SQL Lab, writes custom query
4. Saves as new chart, adds to dashboard

### Persona 3: Data Engineer / Analytics Engineer

**Goals:**
- Build reliable data pipelines
- Maintain gold tables
- Optimize query performance

**Tools:**
- Deepnote for job development
- Superset for dataset definitions
- Git for version control

**Typical Workflow:**
1. Designs new metric in Deepnote exploration notebook
2. Refactors into production job notebook
3. Schedules daily run
4. Creates Superset dataset from new gold table
5. Notifies analysts that new metric is available

### Persona 4: Business User (Non-Technical)

**Goals:**
- Get answers without writing SQL
- Understand data easily
- Trust the insights

**Tools:**
- Jenny (primary interface)
- Superset dashboards (read-only)

**Typical Workflow:**
1. Opens OpEx portal → "Ask Jenny" interface
2. Types: "How are we doing vs our Q4 targets?"
3. Jenny shows progress chart + summary
4. Clicks "Explain" to understand how Jenny calculated it
5. Gives thumbs up feedback

---

## Technical Implementation

### Setting Up Superset

**Option A: Docker (Development/Small Teams)**

```bash
# Clone Superset repo
git clone https://github.com/apache/superset.git
cd superset

# Start with docker-compose
docker-compose -f docker-compose-non-dev.yml up -d

# Access at http://localhost:8088
# Default credentials: admin / admin
```

**Option B: Kubernetes (Production)**

```bash
# Add Superset Helm repo
helm repo add superset https://apache.github.io/superset
helm repo update

# Create values.yaml (see Platform Admin skill for details)
# Deploy
helm install insightpulse-superset superset/superset \
  -f values.yaml \
  --namespace data-lab
```

**Key Configuration:**
```yaml
# superset_config.py
SQLALCHEMY_DATABASE_URI = 'postgresql://user:pass@supabase.example.com/warehouse'

# Enable ECharts viz plugins
VIZ_TYPE_DENYLIST = []

# Configure caching
CACHE_CONFIG = {
    'CACHE_TYPE': 'redis',
    'CACHE_REDIS_URL': 'redis://localhost:6379/0'
}
```

### Setting Up Deepnote

1. **Create Workspace**
   - Go to deepnote.com
   - Create workspace: "InsightPulse Data Lab"
   - Invite team members

2. **Configure Database Connection**
   - In workspace settings → Integrations
   - Add PostgreSQL connection to Supabase
   - Test connection in a notebook

3. **Create Project Structure**
   ```
   data-lab-core/
     00_connection_helpers.ipynb
     10_build_sales_summary.ipynb
     20_build_finance_summary.ipynb

   data-lab-exploration/
     01_eda_revenue_trends.ipynb
     02_eda_customer_cohorts.ipynb
   ```

4. **Schedule Jobs**
   - Open production notebook
   - Click "Schedule" button
   - Set frequency (daily at 2:00 AM UTC)
   - Enable notifications on failure

### Integrating Jenny

**Backend: Natural Language to SQL**

Options:
1. **WrenAI** (open-source, self-hosted)
2. **Databricks SQL AI** (if using Databricks)
3. **Custom with OpenAI GPT-4** + semantic layer

**Implementation with OpenAI:**

```typescript
// pages/api/jenny/query.ts
import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { space, question } = req.body;

  // Load semantic layer for this space
  const semanticLayer = await loadSemanticLayer(space);

  // Generate SQL
  const sqlResponse = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      {
        role: 'system',
        content: `You are a SQL expert. Convert natural language to SQL.
Available tables: ${JSON.stringify(semanticLayer.tables)}
Available metrics: ${JSON.stringify(semanticLayer.metrics)}`
      },
      { role: 'user', content: question }
    ]
  });

  const sql = extractSQL(sqlResponse.choices[0].message.content);

  // Execute query
  const { data, error } = await supabase.rpc('execute_safe_query', { sql });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Generate chart
  const chartOption = generateEChartsOption(data, question);

  // Log query
  await supabase.from('jenny_queries').insert({
    space,
    question,
    sql,
    row_count: data.length,
    user_id: req.user.id
  });

  return res.json({
    title: summarizeQuestion(question),
    summary: generateSummary(data, question),
    echarts_option: chartOption,
    rows: data,
    generated_sql: sql,
    reasoning: explainQuery(sql, semanticLayer)
  });
}
```

**Frontend: Jenny Component**

```tsx
// pages/jenny.tsx
import JennyPanel from '@/components/jenny/JennyPanel';

export default function JennyPage() {
  const [messages, setMessages] = useState<JennyMessage[]>([]);
  const [result, setResult] = useState<JennyResult | null>(null);

  const handleSend = async (question: string) => {
    // Add user message
    const userMsg = {
      id: nanoid(),
      role: 'user' as const,
      content: question,
      createdAt: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, userMsg]);

    // Call API
    const response = await fetch('/api/jenny/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ space: 'sales', question })
    });

    const data = await response.json();

    // Add assistant message
    const assistantMsg = {
      id: nanoid(),
      role: 'assistant' as const,
      content: data.summary,
      summary: data.title,
      createdAt: new Date().toLocaleTimeString(),
      status: 'complete' as const
    };
    setMessages(prev => [...prev, assistantMsg]);
    setResult(data);
  };

  return (
    <JennyPanel
      spaceName="Sales"
      spaceDescription="Revenue, orders, and conversion metrics"
      exampleQuestions={[
        "Top 5 brands by revenue",
        "Revenue vs target last 30 days"
      ]}
      messages={messages}
      selectedResult={result}
      onSendQuestion={handleSend}
    />
  );
}
```

### Creating ECharts Theme

```javascript
// lib/echarts-theme/insightpulse.ts
export const insightPulseTheme = {
  color: [
    '#6750A4', // M3 Primary
    '#958DA5', // M3 Secondary
    '#D0BCFF', // M3 Tertiary
    '#B3261E', // M3 Error
    '#006C4C', // Success
    '#7D5260'  // Warning
  ],
  backgroundColor: '#FFFBFE',
  textStyle: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: 12,
    color: '#1C1B1F'
  },
  title: {
    textStyle: {
      fontSize: 18,
      fontWeight: 600,
      color: '#1C1B1F'
    }
  },
  line: {
    itemStyle: { borderWidth: 2 },
    lineStyle: { width: 2 },
    symbolSize: 6,
    symbol: 'circle',
    smooth: false
  },
  bar: {
    itemStyle: {
      barBorderWidth: 0,
      barBorderColor: '#ccc'
    }
  },
  categoryAxis: {
    axisLine: { show: true, lineStyle: { color: '#E7E0EC' } },
    axisTick: { show: false },
    axisLabel: { color: '#49454F' },
    splitLine: { show: false }
  },
  valueAxis: {
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#49454F' },
    splitLine: { show: true, lineStyle: { color: '#E7E0EC', type: 'dashed' } }
  },
  legend: {
    textStyle: { color: '#1C1B1F' }
  },
  tooltip: {
    backgroundColor: 'rgba(28, 27, 31, 0.9)',
    borderColor: '#6750A4',
    borderWidth: 1,
    textStyle: { color: '#FFFFFF' }
  }
};

// Register in app
import * as echarts from 'echarts';
import { insightPulseTheme } from '@/lib/echarts-theme/insightpulse';

echarts.registerTheme('insightpulse', insightPulseTheme);

// Use in components
const chart = echarts.init(chartDom, 'insightpulse');
chart.setOption(option);
```

---

## Deployment Guide

### Infrastructure Requirements

**Minimum (Development/PoC):**
- 1x VM (4 CPU, 16GB RAM) for Superset
- Supabase cloud (free tier)
- Deepnote cloud (free tier)

**Production:**
- Kubernetes cluster (3+ nodes, 8 CPU, 32GB RAM each)
- Supabase Pro or self-hosted PostgreSQL (high availability)
- Deepnote Teams plan
- Redis for caching
- Load balancer
- CDN for static assets

### Deployment Checklist

**Pre-Deployment:**
- [ ] Provision infrastructure (cloud resources, K8s cluster)
- [ ] Set up DNS (superset.example.com, jenny.example.com)
- [ ] Configure SSL certificates
- [ ] Create service accounts and API keys
- [ ] Set up monitoring (Prometheus, Grafana, or cloud native)

**Superset Deployment:**
- [ ] Deploy via Docker Compose or Helm
- [ ] Configure metadata database connection
- [ ] Set up Redis for caching
- [ ] Configure authentication (SSO, LDAP, or local)
- [ ] Import initial dashboards and datasets
- [ ] Set up RBAC roles
- [ ] Configure email/Slack for alerts

**Deepnote Setup:**
- [ ] Create workspace
- [ ] Configure database integrations
- [ ] Create project structure
- [ ] Schedule production jobs
- [ ] Set up failure notifications

**Jenny Deployment:**
- [ ] Deploy NL→SQL backend (WrenAI or custom)
- [ ] Deploy JennyPanel in OpEx UI
- [ ] Configure semantic layer
- [ ] Set up query logging
- [ ] Test with sample questions

**Post-Deployment:**
- [ ] Smoke test all components
- [ ] Run load tests
- [ ] Configure backups
- [ ] Document runbooks
- [ ] Train initial users

---

## Troubleshooting

### Issue: Superset Dashboards Loading Slowly

**Diagnosis:**
- Check query execution time in SQL Lab
- Review cache hit rate in Superset metrics

**Solutions:**
1. Enable query caching: set `CACHE_CONFIG` in `superset_config.py`
2. Create materialized views or pre-aggregated tables in Deepnote
3. Add database indexes on frequently filtered columns
4. Use dashboard-level caching (24 hours for exec dashboards)

### Issue: Deepnote Job Failures

**Diagnosis:**
- Check job logs in Deepnote UI
- Review `data_lab_job_runs` table for error messages

**Solutions:**
1. Add retry logic to notebooks
2. Implement idempotent writes (UPSERT instead of INSERT)
3. Set up alerts via Deepnote integrations
4. Add health checks that run before main logic

### Issue: Jenny Giving Incorrect Answers

**Diagnosis:**
- Review `jenny_queries` table
- Check generated SQL for accuracy
- Validate semantic layer definitions

**Solutions:**
1. Improve semantic layer with more examples
2. Add guardrails to SQL generation (only allow SELECT)
3. Implement feedback loop: thumbs down → review → retrain
4. Start with narrow spaces, expand gradually

### Issue: ECharts Not Rendering

**Diagnosis:**
- Check browser console for errors
- Verify echarts and echarts-for-react are installed

**Solutions:**
1. Install dependencies: `pnpm add echarts echarts-for-react`
2. Uncomment ECharts code in JennyPanel.tsx
3. Verify chartOption structure matches ECharts API
4. Check that theme is registered before chart init

---

## Next Steps

### Immediate (This Week)
1. Review this guide with the team
2. Choose deployment approach (Docker vs K8s)
3. Set up Supabase database and initial schemas
4. Create Deepnote workspace

### Short-Term (Next 2 Weeks)
1. Deploy Superset instance
2. Build first gold table via Deepnote
3. Create first Superset dashboard
4. Test Jenny component with mock data

### Medium-Term (Next Month)
1. Complete Phase 1-3 of implementation roadmap
2. Train analysts and data engineers
3. Gather feedback from pilot users
4. Iterate on workflows

### Long-Term (Next Quarter)
1. Full rollout to organization
2. Build advanced features (alerts, anomaly detection)
3. Optimize performance and costs
4. Expand to additional data sources

---

## Additional Resources

### Documentation
- [Apache Superset Docs](https://superset.apache.org/docs/intro)
- [Deepnote Documentation](https://docs.deepnote.com/)
- [Apache ECharts Documentation](https://echarts.apache.org/en/index.html)
- [Supabase Docs](https://supabase.com/docs)

### Skills Reference
- See `.claude/skills/` directory for all Data Lab skills
- Each skill has detailed workflows and examples

### Community
- [Superset Slack](https://superset.apache.org/community)
- [Deepnote Community](https://community.deepnote.com/)
- [ECharts GitHub Discussions](https://github.com/apache/echarts/discussions)

### Internal Contacts
- Data Platform Team: `data-platform@insightpulse.ai`
- Analytics Team: `analytics@insightpulse.ai`
- OpEx Product: `opex@insightpulse.ai`

---

**End of Integration Guide**

For questions or contributions to this guide, please contact the Data Platform team or submit a pull request to the OpEx repository.
