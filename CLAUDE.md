# InsightPulse Platform – CLAUDE.md

## 1. Purpose

This repo is the **InsightPulse Platform** monorepo.

It contains:

- Operational apps (OpEx portal, Data Lab, admin console, docs site)
- Data platform (Supabase, Odoo CE/OCA, ETL)
- AI agents & skills (MCP, multi-agent orchestration)
- Design system (tokens, themes, shared components)
- Automation (n8n, Deepnote, CI/CD, Mattermost)

Your job is to **act as a production-grade engineering copilot**:
- Read the existing specs (`.specify/specs/**`)
- Propose plans in `PLANNING.md`
- Decompose into `TASKS.md`
- Implement code/config/docs inside the repo
- Update `CHANGELOG.md` when work is logically complete

No chit-chat, no open loops: every edit should move the system toward shippable, boring reliability.

---

## 2. Operating Principles

1. **Spec-Driven**
   - Always read relevant `.specify/specs/**/spec.md` and `plan.md` before making structural changes.
   - If something is unclear, prefer tightening the spec rather than improvising ad-hoc patterns.

2. **Monorepo First**
   - Prefer adding to this repo instead of spinning up new ones.
   - Keep shared logic in:
     - `design-system/` (tokens, themes, components)
     - `agents/` (registry, skills, MCP configs)
     - `automation/` (n8n, Deepnote, CI/CD)
     - `platform/` (Supabase, Odoo, pipelines)

3. **Security & Compliance**
   - Never commit secrets, tokens, passwords, keys.
   - Respect:
     - AGPL-3 / OCA standards for Odoo code.
     - License headers where required.
   - Treat Supabase + Odoo schemas as **source of truth**; no destructive migrations without explicit spec.

4. **Execution Bias**
   - Assume the user intends to execute what you output.
   - Prefer complete, copy-paste-ready files and diffs.
   - Avoid trailing questions; address ambiguity with conservative, reversible choices and clear inline comments.

5. **Single Source of Design Truth**
   - Use `design-system/tokens/*.tokens.json` as the canonical palette/typography/spacing.
   - Web apps must pull themes from:
     - `design-system/web/mui-theme.ts`
     - `design-system/web/echarts-theme.ts`
   - Don't hard-code colors/fonts in components unless explicitly allowed.

---

## 3. Repo Map (High Level)

You should learn and respect this structure:

```
apps/                # All frontends (Next.js, docs, admin, client portals)
platform/            # Supabase, Odoo, pipelines, experiments
agents/              # Agent registry, skills, MCP configs, playbooks
design-system/       # Tokens, themes, shared UI components, Figma mappings
docs/                # Human docs + upstream mirrors + RAG ingest manifests
automation/          # n8n, Deepnote, CI/CD, Mattermost, helper scripts
infra/               # Terraform, Docker, k8s, env templates
.specify/specs/      # Spec Kit specs (spec.md, plan.md, tasks.md)
.claude/             # Optional client configs, MCP routing (if present)
```

When editing, prefer **locality**:

* Frontend pages: `apps/**`
* Data platform: `platform/**`
* Agents & tools: `agents/**`
* Docs & RAG: `docs/**`
* Automations: `automation/**`

---

## 4. How to Work on Changes

### 4.1 Standard Loop

For any non-trivial change:

1. **Find the spec**

   * Locate an existing spec under `.specify/specs/**` that matches the feature.
   * If none exists, add one (minimal `spec.md`, `plan.md`, `tasks.md`).

2. **Update planning**

   * Edit `PLANNING.md`:

     * Add/adjust phase, milestone, or sub-section.
     * Keep it short and execution-oriented.

3. **Update tasks**

   * Edit `TASKS.md`:

     * Add/check off items with `[ ]` → `[x]`.
     * Group tasks by area: apps, platform, agents, design-system, docs, automation, infra.

4. **Apply changes**

   * Modify files in the relevant directory.
   * Keep code cohesive and production-oriented (no throwaway PoCs).
   * Follow existing patterns in the repo (linting, naming, structure).

5. **Update CHANGELOG**

   * Under `Unreleased` or a new version section, record:

     * What changed
     * Area(s) of the repo
     * Any migration / breaking change note

### 4.2 Small Fixes

For tiny changes (typo, quick bugfix):

* You can skip spec edits and just:

  * Apply the fix
  * Mark the corresponding task (if present) as done
  * Add a short line to `CHANGELOG.md`

---

## 5. Tools & Integrations You Should Be Aware Of

* **Supabase**

  * `platform/supabase/migrations/` – SQL migrations (must stay idempotent).
  * `platform/supabase/functions/` – Edge Functions (analytics, RAG, ingest).

* **Odoo CE / OCA**

  * `platform/odoo/addons/ipai_*` – custom modules.
  * Must be AGPL-3, OCA-style (manifests, linting).

* **Automation**

  * `automation/n8n/workflows/*.json` – importable n8n workflows.
  * `automation/deepnote/` – Deepnote project manifest & templates.
  * `automation/mattermost/` – slash commands & webhooks docs.
  * `automation/ci-cd/github-actions/*.yml` – CI/CD flows.

* **Agents**

  * `agents/registry/agents.yaml`, `skills.yaml` – canonical registry.
  * `agents/mcp/*.mcp.json` – MCP server configs (Chrome DevTools, Supabase, Odoo, n8n, etc.).
  * `agents/playbooks/*.md` – end-to-end flows (Design Import Pipeline, Data Lab, etc.).

---

## 6. Coding & Documentation Style

* Prefer **TypeScript** for new frontend code.
* Prefer **Python** for ETL and simple scripting.
* Prefer **SQL migrations** over ad-hoc schema edits.
* Docs:

  * Use Markdown.
  * Keep sections short and scannable.
  * Co-locate runbooks with the systems they operate (e.g. `platform/odoo/docs/`, `automation/n8n/README.md`).

---

## 7. Things You Must Not Do

* Don't commit any secrets, keys, passwords, or private tokens.
* Don't rewrite large parts of Odoo or Supabase schemas without an updated spec and explicit migration steps.
* Don't introduce a new design system or charting library unless a spec explicitly calls for it.
* Don't silently change RAG or metrics semantics; always reflect in specs/docs + CHANGELOG.

---

## 8. Additional Resources

For comprehensive codebase documentation, see `CODEBASE_GUIDE.md`.

If you are unsure which area to touch, search for:

* **Spec**: `.specify/specs/**`
* **Owning app**: `apps/**`
* **Owning platform component**: `platform/**`
* **Owning agent or skill**: `agents/**`

Then update `PLANNING.md`, `TASKS.md`, and finally code/config. Never leave work half-described.
