# InfraAuditor - DNS + Supabase Infrastructure Auditor

A cautious but highly capable DevOps assistant for auditing and correcting infrastructure configuration.

## Overview

InfraAuditor audits and fixes:
1. **DNS records** (DigitalOcean DNS)
2. **Supabase project configuration** (database, API, and security)

## Features

- **Safety-First Approach**: READ/DRY-RUN first, then propose changes
- **Explicit Confirmation**: Requires `--confirm-apply` before executing changes
- **Destructive Protection**: Requires `--confirm-destructive` for deletes, drops, etc.
- **Comprehensive Logging**: All commands and modifications are logged
- **Diff Reporting**: Clear before/after comparisons
- **Rollback Support**: Safe, reversible changes

## Prerequisites

### Required Tools

1. **DigitalOcean CLI (doctl)**
   ```bash
   # macOS
   brew install doctl

   # Linux
   cd ~
   wget https://github.com/digitalocean/doctl/releases/download/v1.98.1/doctl-1.98.1-linux-amd64.tar.gz
   tar xf ~/doctl-1.98.1-linux-amd64.tar.gz
   sudo mv ~/doctl /usr/local/bin

   # Authenticate
   doctl auth init
   ```

2. **Supabase CLI**
   ```bash
   # macOS/Linux
   brew install supabase/tap/supabase

   # Or with npm
   npm install -g supabase

   # Authenticate
   supabase login
   ```

3. **PostgreSQL Client (psql)** - for direct database queries
   ```bash
   # macOS
   brew install postgresql

   # Ubuntu/Debian
   sudo apt-get install postgresql-client

   # Fedora/RHEL
   sudo dnf install postgresql
   ```

4. **Python 3.8+** with dependencies
   ```bash
   pip install pyyaml
   ```

## Installation

1. Clone the repository and navigate to the auditor:
   ```bash
   cd infra/auditor
   ```

2. Make the script executable:
   ```bash
   chmod +x infra_auditor.py
   ```

3. Verify tool availability:
   ```bash
   doctl version
   supabase --version
   psql --version
   ```

## Configuration

Create your infrastructure specification file based on the examples:

```bash
# Copy and customize the example
cp config/infra_spec.example.yaml config/infra_spec.yaml

# Or use separate configs
cp config/dns_spec.example.yaml config/dns_spec.yaml
cp config/supabase_spec.example.yaml config/supabase_spec.yaml
```

### DNS Configuration

Define your desired DNS state in `dns_spec.yaml`:

```yaml
dns:
  delete_unmanaged: false
  domains:
    - name: example.com
      records:
        - type: A
          name: "@"
          data: "1.2.3.4"
          ttl: 3600
        - type: A
          name: "api"
          data: "5.6.7.8"
          ttl: 3600
```

### Supabase Configuration

Define your Supabase desired state in `supabase_spec.yaml`:

```yaml
supabase:
  project_url: "https://xxxxx.supabase.co"
  project_ref: "xxxxx"
  schema:
    tables:
      - name: documents
        columns:
          - name: id
            type: uuid
            primary_key: true
```

## Usage

### 1. Audit Only (Safe, Read-Only)

```bash
python infra_auditor.py --audit-only
```

This will:
- Check DigitalOcean account access
- List all domains and DNS records
- Check Supabase project access
- Report on schema, RLS, functions, etc.
- **No changes made**

### 2. Audit + Generate Fix Plan

```bash
python infra_auditor.py
```

This will:
- Run full audit
- Generate `doctl` commands for DNS fixes
- Generate migration files for Supabase schema fixes
- Generate deployment commands for edge functions
- **No changes made** (only plans created)

### 3. Apply Fixes (Safe Changes Only)

```bash
python infra_auditor.py --confirm-apply
```

This will:
- Execute safe DNS changes (ADD records)
- Apply Supabase migrations
- Deploy edge functions
- **Skip destructive operations** (deletes, drops)

### 4. Apply All Fixes (Including Destructive)

```bash
python infra_auditor.py --confirm-apply --confirm-destructive
```

⚠️ **WARNING**: This will execute ALL changes including:
- DNS record deletions
- Database schema drops
- Irreversible operations

### 5. Use Custom Config

```bash
python infra_auditor.py --config my_custom_spec.yaml
```

### 6. Verbose Logging

```bash
python infra_auditor.py --verbose
```

## Workflow

### Operating Loop

1. **DISCOVER CONTEXT**
   - Detect repository structure
   - Locate infrastructure directories
   - Check tool availability

2. **DNS AUDIT**
   - Fetch current DNS records from DigitalOcean
   - Compare with desired state
   - Identify: Missing, Mismatched, Obsolete records

3. **DNS FIX PLAN**
   - Generate `doctl` commands for each change
   - Classify as SAFE or RISKY
   - Wait for confirmation

4. **SUPABASE AUDIT**
   - Check project access
   - Audit schema vs migrations
   - Check RLS policies
   - Verify edge functions deployment
   - Audit storage buckets

5. **SUPABASE FIX PLAN**
   - Generate migration files
   - Generate deployment commands
   - Identify manual steps

6. **EXECUTION** (Only after CONFIRM_APPLY)
   - Execute DNS changes (safe first, then risky)
   - Apply Supabase migrations
   - Deploy edge functions
   - Re-audit to verify

7. **REPORTING**
   - Generate structured summary
   - List unresolved issues
   - Document pending manual steps

## Output

### Console Output

The tool provides structured, real-time output:

```
================================================================================
STEP 1: DISCOVERING CONTEXT
================================================================================
Repository Context:
  Root: /home/user/opex
  Infrastructure dirs: ['./infra', './packages/mattermost-rag/infra']
  Supabase dirs: ['./supabase']
  DNS files: ['./packages/mattermost-rag/infra/do/mattermost-rag.yaml']

================================================================================
STEP 2: DNS AUDIT (DIGITALOCEAN)
================================================================================
Auditing domain: example.com
Records to ADD: 2
  + A api -> 5.6.7.8
  + A www -> 1.2.3.4
Records to UPDATE: 1
  ~ A @
    Current: 9.9.9.9 (TTL: 1800)
    Desired: 1.2.3.4 (TTL: 3600)
```

### Report File

A detailed report is saved to `infra_auditor_report.md`:

```markdown
# InfraAuditor - Final Report

## DNS (DigitalOcean)
- Issues Found: 3
- Commands Generated: 3
- Commands Executed: 3
- Success: 3
- Failed: 0

## Supabase
- Schema Issues: 0
- RLS Policy Issues: 0
- Function Issues: 0
- Migrations Applied: 0
- Edge Functions Deployed: 1

## Pending Manual Steps
- None

## Unresolved Risks
- None
```

### Log File

All operations are logged to `infra_auditor.log`:

```
2025-11-15 10:30:15 - InfraAuditor - INFO - Loading configuration from config/infra_spec.yaml
2025-11-15 10:30:16 - DNSAuditor - INFO - doctl CLI is available
2025-11-15 10:30:17 - DNSAuditor - INFO - Fetching DigitalOcean account info...
```

## Safety Features

### 1. Dry-Run by Default

All operations are read-only unless you explicitly provide `--confirm-apply`.

### 2. Destructive Operation Protection

Deletes, drops, and other irreversible operations require both:
- `--confirm-apply`
- `--confirm-destructive`

### 3. Command Logging

Every command is logged before execution:
```
EXECUTING: doctl compute domain records create example.com --record-type A --record-name api --record-data 5.6.7.8 --record-ttl 3600
  SUCCESS
```

### 4. Verification Loop

After applying changes, the tool re-runs the audit to verify the desired state was achieved.

### 5. No Secret Exposure

The tool never prints API keys, passwords, or JWTs in logs or console output.

## Common Use Cases

### 1. Add New DNS Record

1. Edit `config/infra_spec.yaml`:
   ```yaml
   dns:
     domains:
       - name: example.com
         records:
           - type: A
             name: "new-service"
             data: "10.20.30.40"
             ttl: 3600
   ```

2. Run audit:
   ```bash
   python infra_auditor.py
   ```

3. Review the proposed `doctl` command

4. Apply:
   ```bash
   python infra_auditor.py --confirm-apply
   ```

### 2. Update Existing DNS Record

Same as above - the tool will detect the mismatch and propose an UPDATE command.

### 3. Deploy Supabase Edge Function

1. Create the function locally in `supabase/functions/my-function/`

2. Add to spec:
   ```yaml
   supabase:
     edge_functions:
       - name: my-function
         verify_deployed: true
   ```

3. Run:
   ```bash
   python infra_auditor.py --confirm-apply
   ```

### 4. Fix Schema Drift

1. Define expected schema in `config/infra_spec.yaml`

2. Run audit:
   ```bash
   python infra_auditor.py
   ```

3. Review generated migration files in `supabase/migrations/`

4. Apply migrations:
   ```bash
   python infra_auditor.py --confirm-apply
   ```

### 5. Audit Entire Infrastructure

```bash
python infra_auditor.py --audit-only --verbose
```

This gives you a complete snapshot of your infrastructure state.

## Troubleshooting

### "doctl command not found"

Install DigitalOcean CLI:
```bash
brew install doctl
doctl auth init
```

### "supabase command not found"

Install Supabase CLI:
```bash
npm install -g supabase
supabase login
```

### "Cannot access DigitalOcean account"

Authenticate:
```bash
doctl auth init
doctl account get  # Verify
```

### "Cannot access Supabase project"

1. Login:
   ```bash
   supabase login
   ```

2. Set environment variable:
   ```bash
   export DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
   ```

3. Or set in config:
   ```yaml
   supabase:
     project_url: "https://xxxxx.supabase.co"
     project_ref: "xxxxx"
   ```

### "Migration files not found"

Ensure migrations directory exists:
```bash
mkdir -p supabase/migrations
```

Or set custom path in config:
```yaml
supabase:
  migrations_dir: "path/to/migrations"
```

## Development

### Project Structure

```
infra/auditor/
├── infra_auditor.py       # Main orchestrator
├── dns_auditor.py         # DNS auditing module
├── supabase_auditor.py    # Supabase auditing module
├── config/
│   ├── infra_spec.example.yaml      # Complete example
│   ├── dns_spec.example.yaml        # DNS-only example
│   └── supabase_spec.example.yaml   # Supabase-only example
└── README.md              # This file
```

### Adding New Auditors

1. Create `my_auditor.py` with `MyAuditor` class
2. Implement:
   - `audit(dry_run=True) -> Dict`
   - `generate_fix_plan(audit_results) -> Dict`
   - `execute_fixes(plan, confirm_destructive=False) -> Dict`
3. Add to `infra_auditor.py`:
   ```python
   from my_auditor import MyAuditor
   self.my_auditor = MyAuditor(self.config.get('my_config', {}))
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with `--audit-only` first
5. Submit a pull request

## License

See repository LICENSE file.

## Support

For issues or questions:
- GitHub Issues: [Your repo URL]
- Documentation: This README

## Changelog

### v1.0.0 (2025-11-15)
- Initial release
- DNS auditing for DigitalOcean
- Supabase project auditing
- Safe execution with confirmation gates
- Comprehensive logging and reporting
