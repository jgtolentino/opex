# InfraAuditor Quick Start Guide

Get started with InfraAuditor in 5 minutes.

## Step 1: Install Prerequisites

```bash
# Navigate to the auditor directory
cd infra/auditor

# Run the setup script
./setup.sh
```

Or install manually:

```bash
# Python dependencies
pip install pyyaml

# macOS
brew install doctl supabase/tap/supabase postgresql

# Linux (Ubuntu/Debian)
# Install doctl
wget https://github.com/digitalocean/doctl/releases/download/v1.98.1/doctl-1.98.1-linux-amd64.tar.gz
tar xf doctl-1.98.1-linux-amd64.tar.gz
sudo mv doctl /usr/local/bin

# Install supabase
npm install -g supabase

# Install PostgreSQL client
sudo apt-get install postgresql-client
```

## Step 2: Authenticate

```bash
# DigitalOcean
doctl auth init
# Follow prompts to enter your API token

# Supabase
supabase login
# Opens browser for authentication

# Verify
doctl account get
supabase projects list
```

## Step 3: Create Your Config

```bash
# Copy the example config
cp config/infra_spec.example.yaml config/infra_spec.yaml

# Edit with your actual values
nano config/infra_spec.yaml
# or
vim config/infra_spec.yaml
```

**Minimum config for testing:**

```yaml
dns:
  delete_unmanaged: false
  domains:
    - name: your-domain.com
      records:
        - type: A
          name: "@"
          data: "1.2.3.4"
          ttl: 3600

supabase:
  project_url: "https://xxxxx.supabase.co"
  project_ref: "xxxxx"
  migrations_dir: "supabase/migrations"
  functions_dir: "supabase/functions"
```

## Step 4: Run Your First Audit

```bash
# Safe read-only audit
python infra_auditor.py --audit-only
```

You should see output like:

```
================================================================================
STEP 1: DISCOVERING CONTEXT
================================================================================
Repository Context:
  Root: /home/user/opex
  ...

================================================================================
STEP 2: DNS AUDIT (DIGITALOCEAN)
================================================================================
Auditing domain: your-domain.com
Found 5 records for your-domain.com
...
```

## Step 5: Review the Report

```bash
# Check the generated report
cat infra_auditor_report.md

# Check the detailed logs
tail -f infra_auditor.log
```

## Step 6: Apply Fixes (Optional)

If the audit found issues you want to fix:

```bash
# Generate fix plan (no changes made)
python infra_auditor.py

# Review proposed commands
cat infra_auditor.log | grep "EXECUTING"

# Apply safe fixes only
python infra_auditor.py --confirm-apply

# Apply ALL fixes (including destructive)
python infra_auditor.py --confirm-apply --confirm-destructive
```

## Common First-Time Tasks

### Task 1: Audit Current DNS Records

```bash
# Just see what's currently configured
python infra_auditor.py --audit-only 2>&1 | grep -A 20 "DNS AUDIT"
```

### Task 2: Add a New DNS Record

1. Edit `config/infra_spec.yaml`:
   ```yaml
   dns:
     domains:
       - name: your-domain.com
         records:
           - type: A
             name: "api"
             data: "5.6.7.8"
             ttl: 3600
   ```

2. Preview the change:
   ```bash
   python infra_auditor.py
   ```

3. Apply:
   ```bash
   python infra_auditor.py --confirm-apply
   ```

### Task 3: Check Supabase Edge Functions

```bash
# See which edge functions are deployed
python infra_auditor.py --audit-only 2>&1 | grep -A 10 "Edge Function"
```

### Task 4: Verify Database Schema

```bash
# Check for schema drift
python infra_auditor.py --audit-only 2>&1 | grep -A 10 "Schema Audit"
```

## Troubleshooting First Run

### "doctl not found"

```bash
which doctl
# If nothing, install it:
brew install doctl  # macOS
# or download from GitHub for Linux
```

### "Cannot access DigitalOcean account"

```bash
# Re-authenticate
doctl auth init

# Verify
doctl account get
```

### "supabase not found"

```bash
npm install -g supabase
supabase --version
```

### "No configuration file found"

```bash
# Make sure you're in the right directory
pwd
# Should be: /path/to/opex/infra/auditor

# Copy example
cp config/infra_spec.example.yaml config/infra_spec.yaml
```

### "Permission denied"

```bash
# Make scripts executable
chmod +x infra_auditor.py setup.sh
```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore example configs in `config/`
- Set up CI/CD integration (see README.md)
- Schedule regular audits with cron

## Quick Reference

```bash
# Audit only (safe)
python infra_auditor.py --audit-only

# Audit + generate plans
python infra_auditor.py

# Apply safe changes
python infra_auditor.py --confirm-apply

# Apply all changes
python infra_auditor.py --confirm-apply --confirm-destructive

# Use custom config
python infra_auditor.py --config my_config.yaml

# Verbose output
python infra_auditor.py --verbose --audit-only
```

## Getting Help

- Check logs: `cat infra_auditor.log`
- View report: `cat infra_auditor_report.md`
- Read full docs: [README.md](README.md)
- Test CLI tools individually:
  ```bash
  doctl compute domain list
  supabase projects list
  ```

Happy auditing! 🚀
