# Tasks – InsightPulse Admin Shell v1

Origin: `insightpulse_admin_shell_v1.prd.yaml`
Statuses: TODO / IN_PROGRESS / BLOCKED / DONE

---

## 0. Repo & Environment Setup

- [ ] T0.1 – Create repo or app folder
  - Create `apps/admin-shell/` or dedicated repo.
  - Add `spec/insightpulse_admin_shell_v1.prd.yaml` and this `tasks.md`.
  - Status: TODO

- [ ] T0.2 – Initialize Next.js + Ant Design
  - Scaffold Next.js (app router).
  - Install Ant Design and set up global layout with basic theme.
  - Add `LayoutShell` component (sidebar + header + content).
  - Status: TODO

- [ ] T0.3 – Wire Supabase client
  - Add Supabase client initialization (`lib/supabaseClient.ts`).
  - Confirm connection to dev project.
  - Status: TODO

---

## 1. Design System & Layout (Milestone m1)

- [ ] T1.1 – Define design tokens
  - Document primary colors, spacing, typography, border radius in `docs/design-system.md`.
  - Configure Ant Design theme overrides.
  - Status: TODO

- [ ] T1.2 – Global layout & navigation
  - Implement AntD `Layout` with sidebar and top header.
  - Add nav items: Dashboard, T&E & Tax, OpEx Tasks, Contacts, Integrations, Settings.
  - Status: TODO

- [ ] T1.3 – Auth guard
  - Integrate Supabase Auth on client.
  - Implement `ProtectedRoute` / layout guard.
  - Status: TODO

- [ ] T1.4 – Settings page (theme & profile)
  - Simple UI for theme toggle and showing current user info.
  - Persist theme preference via localStorage or Supabase profile table.
  - Status: TODO

---

## 2. Supabase Data Layer (Milestone m2)

- [ ] T2.1 – Define tables & views
  - Create Supabase SQL migrations for:
    - `expenses`
    - `opex_tasks`
    - `contacts`
    - `system_status`
  - Status: TODO

- [ ] T2.2 – RLS policies (dev-safe)
  - Add basic RLS policies for dev:
    - Allow authenticated users to read key views.
  - Status: TODO

- [ ] T2.3 – React Query / hooks
  - Implement `useExpenses`, `useOpexTasks`, `useContacts`, `useSystemStatus` hooks.
  - Place in `src/hooks/useData.ts` or similar.
  - Status: TODO

- [ ] T2.4 – Table components
  - Build reusable AntD table component for list + filters.
  - Status: TODO

---

## 3. T&E + PH Tax Console (Milestone m3)

- [ ] T3.1 – n8n Odoo → Supabase sync
  - Create or update n8n workflow to sync `hr.expense` + tax status into `expenses`.
  - Schedule cron or webhook from Odoo.
  - Status: TODO

- [ ] T3.2 – Expenses list page
  - Page: `/te-tax`
  - Display table of expenses:
    - date, employee, amount, tax status, last summary.
  - Basic filters: date range, employee, status.
  - Status: TODO

- [ ] T3.3 – Odoo detail link
  - Each row should have an action to open the source expense in Odoo in a new tab.
  - Status: TODO

- [ ] T3.4 – Integration with validation logs (optional)
  - If `expense_validation_logs` exists, show latest validation date/status in a column.
  - Status: TODO

---

## 4. OpEx Tasks & Contacts (Milestone m4)

- [ ] T4.1 – OpEx tasks sync via n8n
  - Create n8n flow to sync Notion / CSV tasks into `opex_tasks`.
  - Ensure fields: id, period, title, owner, status, due_date.
  - Status: TODO

- [ ] T4.2 – OpEx tasks page
  - Page: `/opex-tasks`
  - Table with filters: period, owner, status.
  - Status: TODO

- [ ] T4.3 – Contacts import / sync
  - n8n flow: Odoo contacts → Supabase `contacts` (one-way for now).
  - Status: TODO

- [ ] T4.4 – Contacts page
  - Page: `/contacts`
  - Table with search by name/email.
  - Read-only in v1.
  - Status: TODO

---

## 5. Integrations Status & AI Hooks (Milestone m5)

- [ ] T5.1 – system_status population
  - Create script or n8n flow to periodically:
    - Ping Odoo, Supabase, n8n, Mattermost, key Edge Functions.
    - Upsert into `system_status`.
  - Status: TODO

- [ ] T5.2 – Integrations status page
  - Page: `/integrations`
  - AntD cards or list showing each system and status (OK, WARN, DOWN).
  - Status: TODO

- [ ] T5.3 – AI insights placeholders
  - Add a right-side drawer or panel component: `InsightsPanel`.
  - Expose a simple interface (prop or hook) to feed insights text.
  - Use dummy content in v1 (static or from a stub API).
  - Status: TODO

---

## 6. Hardening & Rollout

- [ ] T6.1 – Performance & UX pass
  - Check layout on mobile/tablet.
  - Optimize bundle where obvious (code splitting, lazy load heavy pages).
  - Status: TODO

- [ ] T6.2 – Role-based access control
  - Implement simple role flags (admin, ops, viewer) in Supabase.
  - Hide pages/actions based on roles.
  - Status: TODO

- [ ] T6.3 – Smoke tests
  - Add minimal Playwright or Cypress tests for:
    - Login
    - Navigation
    - Data load on: Dashboard, T&E, OpEx, Contacts.
  - Status: TODO

- [ ] T6.4 – Pilot release
  - Deploy to staging URL.
  - Give access to a small set of ops/finance users.
  - Collect feedback and log issues for v1.1.
  - Status: TODO
