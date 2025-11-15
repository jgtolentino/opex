# OPEX Infrastructure

Infrastructure as Code and DevOps tooling for the OPEX project.

## Contents

### InfraAuditor (`auditor/`)

A comprehensive infrastructure auditing and fixing tool for:
- **DNS Records** (DigitalOcean)
- **Supabase Configuration** (Database, RLS, Functions, Storage)

**Quick Start:**
```bash
cd auditor
./setup.sh
python infra_auditor.py --audit-only
```

**Documentation:**
- [Full Documentation](auditor/README.md)
- [Quick Start Guide](auditor/QUICKSTART.md)

**Key Features:**
- ✅ Safe, dry-run first approach
- ✅ Explicit confirmation gates for changes
- ✅ Comprehensive diff reporting
- ✅ Automatic fix plan generation
- ✅ Complete audit logging

## Directory Structure

```
infra/
├── auditor/               # InfraAuditor tool
│   ├── infra_auditor.py  # Main orchestrator
│   ├── dns_auditor.py    # DNS auditing
│   ├── supabase_auditor.py # Supabase auditing
│   ├── config/           # Configuration templates
│   │   ├── *.example.yaml
│   │   └── opex_infra_spec.yaml
│   ├── setup.sh          # Installation script
│   ├── README.md         # Full documentation
│   └── QUICKSTART.md     # Quick start guide
└── README.md             # This file
```

## Use Cases

### 1. Audit Current Infrastructure

```bash
cd auditor
python infra_auditor.py --audit-only
```

### 2. Add New DNS Record

```bash
# Edit config
vim auditor/config/opex_infra_spec.yaml

# Preview changes
python auditor/infra_auditor.py

# Apply
python auditor/infra_auditor.py --confirm-apply
```

### 3. Deploy Supabase Edge Function

```bash
# InfraAuditor will detect undeployed functions
python auditor/infra_auditor.py --confirm-apply
```

### 4. Verify Schema Matches Migrations

```bash
python auditor/infra_auditor.py --audit-only
# Check output for schema drift
```

## Integration with OPEX

The InfraAuditor is pre-configured for the OPEX project:

- **DNS**: `insightpulseai.net` domain management
- **Supabase**: Project `ublqmilcjtpnflofprkr`
- **Edge Functions**: RAG query, embedding worker, maintenance
- **Database**: Documents, embeddings, queries tables

See `auditor/config/opex_infra_spec.yaml` for the current configuration.

## CI/CD Integration

Add to your GitHub Actions or other CI/CD:

```yaml
- name: Audit Infrastructure
  run: |
    cd infra/auditor
    python infra_auditor.py --audit-only

- name: Check for drift
  run: |
    cd infra/auditor
    if grep -q "Issues Found: 0" infra_auditor_report.md; then
      echo "No infrastructure drift detected"
    else
      echo "Infrastructure drift detected!"
      cat infra_auditor_report.md
      exit 1
    fi
```

## Prerequisites

- Python 3.8+
- `doctl` (DigitalOcean CLI)
- `supabase` (Supabase CLI)
- `psql` (PostgreSQL client)

See [auditor/README.md](auditor/README.md) for detailed installation instructions.

## Contributing

1. Test changes with `--audit-only` first
2. Review generated commands before applying
3. Document any new configuration options
4. Update example configs as needed

## Support

- InfraAuditor Documentation: [auditor/README.md](auditor/README.md)
- Quick Start: [auditor/QUICKSTART.md](auditor/QUICKSTART.md)
- Configuration Examples: `auditor/config/*.example.yaml`

## License

See main repository LICENSE.
