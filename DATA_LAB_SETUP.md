# InsightPulse Data Lab Setup Guide

**Quick Setup**: Get the Deepnote workspace (deep-data-workbench) connected to your Supabase database.

---

## 1. Initialize the Data Lab Submodule

The Deepnote workspace is tracked as a git submodule at `data-lab/`.

```bash
# Initialize and fetch the submodule
git submodule init
git submodule update --remote data-lab

# Or in one command:
git submodule update --init --remote data-lab
```

This will clone `https://github.com/jgtolentino/deep-data-workbench.git` into `data-lab/`.

---

## 2. Database Architecture (SHARED SUPABASE)

**Important:** The Data Lab uses your **existing Supabase database**. It does NOT create a new database.

```
┌────────────────────────────────────────────────────┐
│        Supabase PostgreSQL (Single Source)          │
│                                                     │
│  Production Schemas (READ-ONLY for most tools):    │
│    • scout.*       - retail metrics                │
│    • opex.*        - operations and close metrics  │
│    • te_tax.*      - tax and expenses              │
│    • ces.*         - creative effectiveness        │
│    • gold.*        - summary tables (from Deepnote)│
│                                                     │
│  Development Schemas (READ/WRITE for Deepnote):    │
│    • dev_lab_*     - experimental work             │
│    • staging.*     - testing before prod           │
└────────────────────────────────────────────────────┘
             ▲        ▲         ▲         ▲
             │        │         │         │
     ┌───────┘        │         │         └─────────┐
     │                │         │                   │
┌────▼─────┐   ┌──────▼────┐  ┌▼──────┐   ┌────────▼──────┐
│ Deepnote │   │ Superset  │  │ Jenny │   │ OpEx Admin    │
│ (Lab)    │   │ (BI)      │  │(AI BI)│   │ Shell (AntD)  │
└──────────┘   └───────────┘  └───────┘   └───────────────┘
READ/WRITE      READ-ONLY     READ-ONLY      READ-ONLY
(dev schemas)   (curated)     (curated)      (curated)
```

**Key Points:**
- **One database, multiple tools**
- Deepnote can write to `dev_lab_*` schemas for experiments
- Production schemas are read-only from Deepnote (except via migrations)
- Gold tables written by Deepnote jobs are consumed by Superset and Jenny

---

## 3. Configure Deepnote Connection to Supabase

### Step 1: Get Supabase Credentials

From your Supabase project dashboard:
1. Go to **Settings** → **Database**
2. Copy connection info:
   - Host: `db.[project-ref].supabase.co`
   - Port: `5432`
   - Database: `postgres`
   - User: Create TWO database roles (see below)

### Step 2: Create Database Roles

Connect to your Supabase database and run:

```sql
-- 1. Read-only role for production queries
CREATE ROLE deepnote_readonly WITH LOGIN PASSWORD 'your-secure-password-1';

GRANT CONNECT ON DATABASE postgres TO deepnote_readonly;
GRANT USAGE ON SCHEMA scout, opex, te_tax, ces, gold TO deepnote_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA scout, opex, te_tax, ces, gold TO deepnote_readonly;

-- Auto-grant SELECT on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA scout, opex, te_tax, ces, gold
GRANT SELECT ON TABLES TO deepnote_readonly;

-- 2. Read/write role for development/experimentation
CREATE ROLE deepnote_dev WITH LOGIN PASSWORD 'your-secure-password-2';

GRANT CONNECT ON DATABASE postgres TO deepnote_dev;
GRANT ALL PRIVILEGES ON SCHEMA dev_lab TO deepnote_dev;
GRANT CREATE ON DATABASE postgres TO deepnote_dev;

-- Allow creating dev_lab_* schemas
ALTER USER deepnote_dev CREATEDB;
```

**Security Note:** Use strong, unique passwords and store them in a password manager.

### Step 3: Add Integration in Deepnote

1. Go to your Deepnote workspace: **InsightPulse Data Lab**
2. Click **Integrations** in the left sidebar
3. Click **+ Add Integration** → **PostgreSQL**
4. Configure TWO connections:

**Connection 1: Production (Read-Only)**
```
Name: Supabase Production (Read-Only)
Host: db.[your-project-ref].supabase.co
Port: 5432
Database: postgres
Username: deepnote_readonly
Password: [paste password from Step 2]
```

**Connection 2: Development (Read/Write)**
```
Name: Supabase Dev Lab (Read/Write)
Host: db.[your-project-ref].supabase.co
Port: 5432
Database: postgres
Username: deepnote_dev
Password: [paste password from Step 2]
```

5. Click **Test Connection** for each
6. Click **Save**

---

## 4. Test the Connection

Create a test notebook in Deepnote:

```python
# Test notebook: 00_test_connection.ipynb

import pandas as pd
from deepnote import connect

# Test production connection (read-only)
conn_prod = connect('Supabase Production (Read-Only)')

# List available schemas
schemas = pd.read_sql("""
    SELECT schema_name
    FROM information_schema.schemata
    WHERE schema_name IN ('scout', 'opex', 'te_tax', 'ces', 'gold')
    ORDER BY schema_name
""", conn_prod)

print("Available production schemas:")
print(schemas)

# Test a simple query
sample = pd.read_sql("""
    SELECT table_schema, table_name, table_type
    FROM information_schema.tables
    WHERE table_schema IN ('scout', 'opex', 'gold')
    LIMIT 5
""", conn_prod)

print("\nSample tables:")
print(sample)

# Test dev connection (read/write)
conn_dev = connect('Supabase Dev Lab (Read/Write)')

# Create a test schema
test_result = pd.read_sql("""
    CREATE SCHEMA IF NOT EXISTS dev_lab_test;
    SELECT 'Dev lab access OK' as status;
""", conn_dev)

print("\nDev lab status:")
print(test_result)
```

If this runs without errors, your setup is complete! ✅

---

## 5. Notebook Structure in Data Lab

Once initialized, your `data-lab/` submodule should have this structure:

```
data-lab/
├── README.md
├── 00_base_template.ipynb          # Connection boilerplate + helpers
├── 10_eda/
│   ├── 10_te_tax_eda.ipynb         # Tax & expenses exploration
│   ├── 20_opex_tasks_eda.ipynb     # Operations metrics
│   ├── 30_scout_metrics_eda.ipynb  # Retail/sales metrics
│   └── 40_ces_creative_eda.ipynb   # Creative effectiveness
├── 20_metrics/
│   └── design_metric_template.ipynb
├── 30_views/
│   └── sql_to_view_template.ipynb   # Lab → Supabase view workflow
└── 90_jobs/
    └── build_gold_summary.ipynb     # Scheduled jobs that write gold tables
```

**Workflow:**
1. **Explore** in `10_eda/` using read-only connection
2. **Design metrics** in `20_metrics/` using dev connection
3. **Create views** in `30_views/` - test SQL, then promote to migration
4. **Build jobs** in `90_jobs/` - scheduled notebooks that populate gold tables

---

## 6. Promotion Flow: Lab → Production

**Goal:** Move validated SQL from Deepnote into production Supabase views.

### Standard Flow

1. **Develop in Deepnote** (`20_metrics/` or `30_views/`)
   - Write and test your SQL
   - Use `dev_lab_*` schemas for experimentation
   - Validate results with sample queries

2. **Create Supabase Migration**
   ```bash
   # In your OpEx repo
   cd supabase/migrations

   # Create new migration file
   cat > $(date +%Y%m%d%H%M%S)_create_gold_sales_summary.sql <<'EOF'
   -- Tested in Deepnote notebook: 30_views/sales_summary.ipynb

   CREATE OR REPLACE VIEW gold.sales_daily_summary AS
   SELECT
     date,
     region,
     SUM(revenue) as total_revenue,
     COUNT(DISTINCT order_id) as order_count
   FROM scout.orders
   WHERE status = 'completed'
   GROUP BY date, region
   ORDER BY date DESC, region;

   GRANT SELECT ON gold.sales_daily_summary TO deepnote_readonly;
   GRANT SELECT ON gold.sales_daily_summary TO superset_readonly;
   GRANT SELECT ON gold.sales_daily_summary TO jenny_readonly;
   EOF
   ```

3. **Deploy Migration**
   ```bash
   supabase db push
   # or via CI/CD
   ```

4. **Create Superset Dataset**
   - In Superset UI: Add Dataset → `gold.sales_daily_summary`
   - Build chart and add to dashboard

5. **Enable in Jenny**
   - Add to semantic layer config
   - Test conversational query

6. **Document in Deepnote**
   - Update the notebook with a note: "✅ Promoted to production: `gold.sales_daily_summary`"
   - Link to Superset dashboard

---

## 7. Security Best Practices

### DO:
- ✅ Store credentials in Deepnote integrations (NOT in notebooks)
- ✅ Use separate roles: `deepnote_dev` for experiments, `deepnote_readonly` for prod queries
- ✅ Test all SQL in dev schemas before promoting
- ✅ Use migrations for all DDL changes (CREATE VIEW, ALTER TABLE, etc.)
- ✅ Grant permissions explicitly after creating views/tables

### DON'T:
- ❌ Embed Supabase keys or passwords in notebook code
- ❌ Write directly to production schemas from notebooks
- ❌ Use the `postgres` superuser role for Deepnote
- ❌ Skip migrations - always use SQL files in `supabase/migrations/`
- ❌ Run DDL commands in scheduled Deepnote jobs

---

## 8. Scheduled Jobs (Gold Table Updates)

For notebooks that should run on a schedule (e.g., daily summary tables):

### Step 1: Design the Job Notebook

```python
# 90_jobs/build_sales_summary.ipynb

import pandas as pd
from deepnote import connect
from datetime import datetime, timedelta

# Use dev connection (has write access to gold schema)
conn = connect('Supabase Dev Lab (Read/Write)')

# Calculate date range
end_date = datetime.now().date()
start_date = end_date - timedelta(days=30)

# Build summary
summary = pd.read_sql(f"""
    INSERT INTO gold.sales_daily_summary (date, region, revenue, orders)
    SELECT
        order_date::date as date,
        region,
        SUM(total_amount) as revenue,
        COUNT(*) as orders
    FROM scout.orders
    WHERE order_date >= '{start_date}' AND order_date < '{end_date}'
      AND status = 'completed'
    GROUP BY order_date::date, region
    ON CONFLICT (date, region)
    DO UPDATE SET
        revenue = EXCLUDED.revenue,
        orders = EXCLUDED.orders,
        updated_at = NOW()
    RETURNING *
""", conn)

print(f"✅ Updated {len(summary)} rows in gold.sales_daily_summary")

# Log job run
pd.read_sql("""
    INSERT INTO gold.data_lab_job_runs (
        job_name, status, rows_written, finished_at
    ) VALUES (
        'sales_daily_summary', 'success', %s, NOW()
    )
""", conn, params=(len(summary),))
```

### Step 2: Schedule in Deepnote

1. Open the notebook in Deepnote
2. Click **Schedule** button (top right)
3. Set frequency: e.g., "Daily at 02:00 UTC"
4. Enable notifications on failure
5. Save

### Step 3: Monitor

Create a monitoring notebook to check job health:

```python
# Check last 10 job runs
job_log = pd.read_sql("""
    SELECT
        job_name,
        status,
        rows_written,
        finished_at,
        finished_at - started_at as duration
    FROM gold.data_lab_job_runs
    ORDER BY finished_at DESC
    LIMIT 10
""", conn)

print(job_log)
```

---

## 9. Troubleshooting

### Issue: "Connection refused" or "No such host"

**Diagnosis:** Network or hostname issue

**Solution:**
- Verify your Supabase project is active
- Check hostname: `db.[project-ref].supabase.co` (NOT `[project-ref].supabase.co`)
- Ensure Deepnote can reach external databases (check workspace settings)

### Issue: "Permission denied for schema"

**Diagnosis:** Role doesn't have access to the schema

**Solution:**
```sql
-- Grant usage on schema
GRANT USAGE ON SCHEMA gold TO deepnote_readonly;

-- Grant select on all tables
GRANT SELECT ON ALL TABLES IN SCHEMA gold TO deepnote_readonly;

-- Auto-grant for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA gold
GRANT SELECT ON TABLES TO deepnote_readonly;
```

### Issue: "Cannot write to table in production schema"

**Expected:** This is correct! Production schemas should be read-only.

**Solution:**
- Use `dev_lab_*` schemas for experiments
- Promote stable queries via migrations (see section 6)

### Issue: Notebook is slow

**Diagnosis:** Large query or missing indexes

**Solution:**
```sql
-- Add indexes on frequently filtered columns
CREATE INDEX idx_orders_date ON scout.orders(order_date);
CREATE INDEX idx_orders_region ON scout.orders(region);

-- Or use a materialized view
CREATE MATERIALIZED VIEW gold.sales_summary_mv AS
SELECT ...;

-- Refresh periodically
REFRESH MATERIALIZED VIEW gold.sales_summary_mv;
```

---

## 10. Next Steps

Once your Data Lab is set up:

1. **Explore existing data** - Use the EDA notebooks in `10_eda/`
2. **Design your first metric** - Follow templates in `20_metrics/`
3. **Create a gold table** - Write a job notebook in `90_jobs/`
4. **Build a Superset dashboard** - Connect to your new gold table
5. **Ask Jenny** - Test conversational queries against your new data

**See Also:**
- `DATA_LAB_INTEGRATION_GUIDE.md` - Full platform architecture
- `.claude/skills/insightpulse-deepnote-data-lab/` - Expert guidance on notebook design
- `spec/insightpulse_data_lab.prd.yaml` - Complete requirements

---

**Questions?** Check the troubleshooting section or consult the Data Lab skills in `.claude/skills/insightpulse-*`.
