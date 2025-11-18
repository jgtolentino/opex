# Odoo Phone-Home Guard Workflow

**Version**: 1.0.0
**n8n Compatibility**: 1.0+
**Author**: InsightPulseAI
**Last Updated**: 2025-01-18

## Overview

The **Odoo Phone-Home Guard** is an n8n workflow that monitors your Odoo instance for "forbidden" modules that may phone home to `odoo.com` or require Enterprise licensing. It automatically detects IAP (In-App Purchase) modules, Enterprise addons, and online service integrations, then alerts you via Mattermost and logs violations to Supabase.

## Why Use This Workflow?

### Security & Compliance
- **Prevent data leakage**: Catch modules that send data to odoo.com
- **License compliance**: Detect Enterprise modules on CE installations
- **Audit trail**: Log all violations to your data warehouse

### Cost Control
- **No surprise bills**: Avoid IAP credit purchases
- **Budget predictability**: Know exactly what's installed
- **TCO transparency**: Track module usage over time

### Operational Excellence
- **Automated monitoring**: No manual checks needed
- **Instant alerts**: Know immediately when violations occur
- **Team visibility**: Alert entire team via Mattermost

## Features

✅ **Hourly Checks**: Automatically runs every hour
✅ **Manual Trigger**: Test anytime via n8n UI
✅ **Comprehensive Detection**: Checks for IAP, Enterprise, and online service modules
✅ **Smart Categorization**: Groups violations by type
✅ **Mattermost Alerts**: Rich, formatted notifications
✅ **Supabase Logging**: Persistent audit trail
✅ **Clean Status Logging**: Logs successful checks too

## Detected Module Categories

### 1. IAP Modules (In-App Purchase)
Modules that connect to `iap.odoo.com` to purchase credits:
- `iap_*` - IAP framework modules
- `*_iap` - Modules with IAP integration

### 2. Enterprise Modules
Modules from the Odoo Enterprise repository:
- `odoo_enterprise`, `web_enterprise`
- `account_accountant`
- `helpdesk`
- `planning`
- `approvals`
- `documents`
- `sign`
- `voip`

### 3. Online Service Modules
Modules that require online services:
- `account_invoice_extract` - OCR service
- `sale_subscription` - Subscription management
- `social_push_notifications` - Push notification service

## Installation

### Prerequisites

1. **n8n Instance**: Running n8n 1.0+
2. **PostgreSQL Access**: Direct access to Odoo database
3. **Mattermost Webhook**: Incoming webhook URL
4. **Supabase** (optional): For violation logging

### Step 1: Import Workflow

1. Open n8n UI
2. Click **Workflows** → **Import from File**
3. Select `odoo-phone-home-guard.json`
4. Click **Import**

### Step 2: Configure PostgreSQL Credentials

1. In the workflow, click **Check for IAP/Enterprise Modules** node
2. Click **Credentials** dropdown
3. Create new **Postgres** credential:
   - **Host**: Your Odoo database host (e.g., `localhost` or `postgres`)
   - **Database**: Your Odoo database name (e.g., `odoo`)
   - **User**: PostgreSQL user (e.g., `odoo`)
   - **Password**: PostgreSQL password
   - **Port**: 5432 (default)
   - **SSL**: Enable if required

4. Test connection
5. Save credential

### Step 3: Configure Mattermost Webhook

1. In Mattermost, go to **Integrations** → **Incoming Webhooks**
2. Create new webhook for `#opex-alerts` channel
3. Copy webhook URL
4. In n8n workflow, click **Send Mattermost Alert** node
5. Replace `REPLACE_WITH_YOUR_MATTERMOST_WEBHOOK_URL` with your URL
6. Save

### Step 4: Configure Supabase (Optional)

If you want to log violations to Supabase:

1. In Supabase, create tables:

```sql
-- Table for violations
CREATE TABLE odoo_security_violations (
  id BIGSERIAL PRIMARY KEY,
  violation_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  module_count INTEGER NOT NULL,
  modules JSONB NOT NULL,
  categories JSONB NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL,
  environment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for clean checks
CREATE TABLE odoo_security_checks (
  id BIGSERIAL PRIMARY KEY,
  check_type TEXT NOT NULL,
  status TEXT NOT NULL,
  module_count INTEGER NOT NULL,
  checked_at TIMESTAMPTZ NOT NULL,
  environment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_violations_detected ON odoo_security_violations(detected_at);
CREATE INDEX idx_checks_checked ON odoo_security_checks(checked_at);
```

2. In n8n, create **HTTP Header Auth** credential:
   - **Name**: Supabase API Key
   - **Header Name**: `apikey`
   - **Value**: Your Supabase anon key

3. In workflow environment variables:
   - `SUPABASE_URL`: Your Supabase project URL

4. Update **Log to Supabase** and **Log Clean Status** nodes with credential

### Step 5: Activate Workflow

1. Click **Active** toggle in top-right
2. Workflow will now run every hour
3. Test manually: Click **Manual Trigger** → **Execute Workflow**

## Usage

### Manual Testing

To test the workflow immediately:

1. Open workflow in n8n
2. Click **Manual Trigger** node
3. Click **Execute Workflow**
4. Check execution log for results

### Interpreting Alerts

#### Clean Status
If no violations found, you'll see (in logs only, no Mattermost alert):
```
status: "clean"
count: 0
modules: []
```

#### Violation Detected
If violations found, Mattermost alert shows:

```
⚠️ Odoo Phone-Home Guard detected 3 forbidden module(s) installed.

Forbidden Modules Detected
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Count: 3
Status: violation_detected

IAP Modules: 1
Enterprise Modules: 2

Module Names:
• iap_account (1.0)
• account_accountant (18.0)
• helpdesk (18.0)
```

### What to Do When Violations Detected

1. **Review modules**: Check if they're actually needed
2. **Uninstall if possible**:
   ```bash
   odoo-bin -d your_database -u module_name --uninstall
   ```
3. **Document exceptions**: If module is legitimately needed, document why
4. **Consider alternatives**: Look for OCA or custom replacements

### Customizing Detection Rules

To modify what's considered "forbidden":

1. Open workflow
2. Edit **Check for IAP/Enterprise Modules** node
3. Modify SQL query:

```sql
-- Add more module patterns
OR name LIKE 'your_pattern_%'

-- Add specific module names
OR name IN (
  'your_forbidden_module_1',
  'your_forbidden_module_2'
)
```

4. Save and re-activate

## Workflow Architecture

```
┌─────────────────┐     ┌──────────────────┐
│  Cron Trigger   │────▶│  Merge Triggers  │
│  (Every Hour)   │     │                  │
└─────────────────┘     └────────┬─────────┘
                                 │
┌─────────────────┐             │
│ Manual Trigger  │─────────────┘
└─────────────────┘             │
                                ▼
                     ┌──────────────────────┐
                     │ Check IAP/Enterprise │
                     │ Modules (PostgreSQL) │
                     └──────────┬───────────┘
                                │
                                ▼
                     ┌──────────────────────┐
                     │  Summarize Results   │
                     │  (Function Node)     │
                     └──────────┬───────────┘
                                │
                                ▼
                     ┌──────────────────────┐
                     │ Any Forbidden Mods?  │
                     │   (IF condition)     │
                     └──────┬───────┬───────┘
                            │       │
                      YES   │       │   NO
                            │       │
         ┌──────────────────┴─┐   ▼
         │                    │   │
         ▼                    ▼   │
┌────────────────┐   ┌────────────────┐
│ Send Mattermost│   │ Log to Supabase│
│     Alert      │   │  (Violation)   │
└────────────────┘   └────────────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │ Log Clean Status│
                   │  (Supabase)     │
                   └─────────────────┘
```

## Performance & Scheduling

- **Execution Time**: ~2-5 seconds per run
- **Schedule**: Every hour (configurable)
- **Database Impact**: Single SELECT query (minimal)
- **Network**: 1-3 HTTP requests if violations found

### Changing Schedule

To run more/less frequently:

1. Click **Every Hour Check** node
2. Change **Trigger Times**:
   - Every 30 minutes: Mode → Custom → `*/30 * * * *`
   - Every 6 hours: Mode → Custom → `0 */6 * * *`
   - Daily at 9 AM: Mode → Custom → `0 9 * * *`

## Troubleshooting

### Workflow Fails with "Database Error"

**Cause**: Can't connect to PostgreSQL
**Solution**:
1. Verify PostgreSQL credentials
2. Check if n8n can reach database (network/firewall)
3. Verify user has SELECT permission on `ir_module_module`

### No Mattermost Alert Received

**Cause**: Webhook URL incorrect or channel doesn't exist
**Solution**:
1. Verify webhook URL in Mattermost
2. Test webhook with curl:
   ```bash
   curl -X POST YOUR_WEBHOOK_URL \
     -H 'Content-Type: application/json' \
     -d '{"text":"Test from n8n"}'
   ```
3. Check Mattermost channel name in workflow

### Supabase Logging Fails

**Cause**: Table doesn't exist or wrong API key
**Solution**:
1. Run table creation SQL (see Step 4)
2. Verify Supabase URL and API key
3. Check table permissions (anon role needs INSERT)

### False Positives: Module Not Actually Enterprise

**Cause**: Detection rules too broad
**Solution**:
1. Edit SQL query to exclude specific modules:
   ```sql
   AND name NOT IN ('your_legit_module')
   ```
2. Or create a whitelist table

## Integration with Branding Cleaner

This workflow pairs perfectly with the **InsightPulse Branding Cleaner** Odoo module:

| Component | Purpose |
|-----------|---------|
| **Branding Cleaner** | Removes visible odoo.com links/branding in UI |
| **Phone-Home Guard** | Detects modules that connect to odoo.com in backend |

Together, they provide **complete odoo.com independence**:
- Users see no odoo.com branding (Cleaner)
- System doesn't connect to odoo.com (Guard)

## Analytics & Reporting

### Querying Violation History

If using Supabase logging:

```sql
-- Count violations by type over last 30 days
SELECT
  violation_type,
  COUNT(*) as occurrences,
  MAX(detected_at) as last_seen
FROM odoo_security_violations
WHERE detected_at > NOW() - INTERVAL '30 days'
GROUP BY violation_type
ORDER BY occurrences DESC;

-- Most frequently detected modules
SELECT
  module->>'name' as module_name,
  COUNT(*) as times_detected
FROM odoo_security_violations,
  jsonb_array_elements(modules) as module
GROUP BY module->>'name'
ORDER BY times_detected DESC
LIMIT 10;
```

### Creating Dashboards

Use Apache Superset or Metabase to visualize:
- Violations over time (line chart)
- Module categories (pie chart)
- Mean time to remediation (if you track uninstalls)

## Best Practices

1. **Start with notifications only**: Don't auto-uninstall until you understand what's installed
2. **Document exceptions**: Maintain a list of legitimately-needed Enterprise modules
3. **Review alerts weekly**: Don't ignore persistent violations
4. **Combine with network monitoring**: Use firewall logs to detect actual odoo.com connections
5. **Test in staging first**: Verify detection rules before production deployment

## FAQ

**Q: Will this workflow break my Odoo?**
A: No. It only reads from the database, never writes or uninstalls anything.

**Q: What if I legitimately need an Enterprise module?**
A: Either:
- Exclude it from the SQL query, or
- Document the exception and acknowledge alerts

**Q: Can I use this with Odoo SaaS (odoo.com hosting)?**
A: No. You need direct database access, which SaaS doesn't provide.

**Q: Does this replace proper license compliance?**
A: No. This is a monitoring tool. You still need proper Odoo licenses if using Enterprise.

**Q: Can I auto-uninstall forbidden modules?**
A: Technically yes (via RPC), but **not recommended**. Always review first.

## Support

- **Documentation**: https://insightpulseai.net/docs/n8n
- **Mattermost**: #opex-automation
- **GitHub**: https://github.com/jgtolentino/opex/issues

## License

**AGPL-3** - Same as Odoo and n8n.

## Credits

**Developed by**: InsightPulseAI
**Maintainer**: Jake Tolentino (@jgtolentino)
**Part of**: OpEx Platform - Operational Excellence for Finance SSCs

---

**Version**: 1.0.0
**Status**: Production Ready
