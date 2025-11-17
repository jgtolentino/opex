# Tasks – InsightPulse Data Lab

Origin: `insightpulse_data_lab.prd.yaml`
Statuses: TODO / IN_PROGRESS / BLOCKED / DONE

---

## 1. Workspace & Integrations (m1)

- [ ] D1.1 – Create Deepnote workspace
  - Name: "InsightPulse Data Lab"
  - Invite core accounts (you + key collaborators).
  - Status: TODO

- [ ] D1.2 – Add Supabase dev integration
  - Create a dedicated dev DB user (read/write, limited to dev schemas).
  - Configure Deepnote integration using that user.
  - Test connection with a simple `SELECT 1`.
  - Status: TODO

- [ ] D1.3 – Add Supabase prod integration (read-only)
  - Create read-only DB user for curated schemas (scout, opex, te_tax, ces).
  - Configure Deepnote integration for prod.
  - Verify that DDL fails and only SELECT is allowed.
  - Status: TODO

---

## 2. Templates & Folder Structure (m2)

- [ ] D2.1 – Define folder structure
  - `/templates`
  - `/te_tax`
  - `/opex`
  - `/scout`
  - `/ces` (optional, when ready)
  - `/playground`
  - Status: TODO

- [ ] D2.2 – Base template notebook
  - Notebook: `/templates/00_base_template.ipynb` (or `.ipynb` equivalent in Deepnote).
  - Contents:
    - Connection snippet to Supabase dev and prod.
    - Helper functions for `run_sql()` and simple plotting.
    - Section describing promotion process → migrations → Superset/Admin Shell.
  - Status: TODO

- [ ] D2.3 – T&E / Tax EDA template
  - Notebook: `/te_tax/10_te_tax_eda_template`
  - Pre-populate with:
    - Queries over `expenses` and `expense_validation_logs` (or your final tables).
    - Example KPIs (validation pass rate, high-risk expenses, etc.).
  - Status: TODO

- [ ] D2.4 – OpEx EDA template
  - Notebook: `/opex/20_opex_tasks_eda_template`
  - Queries for month-end tasks, durations, blockers.
  - Status: TODO

- [ ] D2.5 – Scout metrics EDA template
  - Notebook: `/scout/30_scout_metrics_eda_template`
  - Queries for sales, regions, brands, basket metrics.
  - Status: TODO

---

## 3. SQL → Production Flow (m3)

- [ ] D3.1 – Document promotion process
  - In base template and a `README.md`:
    - Step 1: Explore with dev Supabase.
    - Step 2: Copy final SQL into `supabase/migrations/` file.
    - Step 3: Deploy via CLI/CI.
    - Step 4: Register view in Superset and Admin Shell.
  - Status: TODO

- [ ] D3.2 – First real promotion example
  - Pick a metric (e.g. "T&E high-risk expense view").
  - Implement in Lab, then promote to:
    - Supabase view `te_tax.v_high_risk_expenses`.
    - Superset chart/dash.
    - Admin Shell T&E page KPI card.
  - Status: TODO

---

## 4. AI Patterns & Guardrails

- [ ] D4.1 – AI prompt patterns
  - In base template, add a section:
    - Good prompts for generating SQL.
    - How to request explanations and sanity checks.
  - Status: TODO

- [ ] D4.2 – Safety notes
  - Add short guidance:
    - "Always review AI-generated SQL before running."
    - "Never let AI change prod DB directly; use dev + migrations."
  - Status: TODO

---

## 5. Integration with Superset & Admin Shell

- [ ] D5.1 – Superset alignment
  - Create a simple Deepnote notebook showing:
    - SQL used in a Superset chart.
    - How to iterate on that SQL in Lab and then update the view.
  - Status: TODO

- [ ] D5.2 – Admin Shell alignment
  - Create a notebook that:
    - Designs the query powering a specific Admin Shell table/KPI.
    - Documents the JSON shape expected by the frontend.
  - Status: TODO
