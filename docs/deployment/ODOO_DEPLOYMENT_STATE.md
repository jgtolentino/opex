# Odoo Deployment State Documentation

**Last Updated:** 2025-11-23
**Environment:** Production (DigitalOcean)
**URL:** https://erp.insightpulseai.net

---

## Executive Summary

The InsightPulse Odoo ERP system is currently deployed on DigitalOcean using a **manual, script-based approach**. The infrastructure is physically operational, but the deployment lacks automation, infrastructure-as-code, and CI/CD integration.

**Current Status:** ⚠️ **Functional but Manual**

---

## 1. Current Deployment Reality

### 1.1 Infrastructure Layer

| Component                    | Status | Details                                                  |
| ---------------------------- | ------ | -------------------------------------------------------- |
| **Droplet Created**          | ✅     | Ubuntu + Docker installed (from `deploy_m1.sh`)         |
| **Reverse Proxy**            | ✅     | NGINX + Certbot configured for `erp.insightpulseai.net` |
| **SSL Certificate**          | ✅     | Let's Encrypt via Certbot (auto-renew configured)       |
| **Firewall**                 | ✅     | UFW configured (80, 443, 22 open)                       |
| **IP Address**               | ✅     | `159.223.75.148` (static)                               |
| **DNS**                      | ✅     | A record pointing to droplet IP                         |

### 1.2 Application Layer

| Component                | Status | Details                                            |
| ------------------------ | ------ | -------------------------------------------------- |
| **Odoo Runtime**         | ✅     | Running via Docker Compose (`odoo-ce`, `odoo-db`)  |
| **Database**             | ✅     | PostgreSQL 16 running in container                 |
| **Volumes**              | ✅     | Persistent volumes for DB and file storage         |
| **Custom Addons Mounted** | ✅     | Mounted at `/opt/odoo/custom-addons/`              |
| **IPAI Modules Present** | ✅     | All modules exist in filesystem                    |
| **Database Install State**| ⚠️     | Modules registered but **NOT INSTALLED** in DB     |

### 1.3 Automation & CI/CD

| Component                          | Status | Details                                      |
| ---------------------------------- | ------ | -------------------------------------------- |
| **CI/CD Pipeline**                 | ❌     | No GitHub Actions integration                |
| **Infrastructure as Code**         | ❌     | Manual script-based deployment only          |
| **Automated Builds**               | ❌     | No Docker image builds                       |
| **Staging Environment**            | ❌     | No staging/testing environment               |
| **Deployment Automation**          | ❌     | Manual SSH + commands required               |
| **Monitoring/Alerting**            | ❌     | No healthchecks or alerts configured         |

---

## 2. IPAI Modules Inventory

All modules follow the **TBWA IPAI Module Standard** and are present in the filesystem at `/opt/odoo/custom-addons/`:

### 2.1 Core Modules

| Module                          | Purpose                                    | Status       |
| ------------------------------- | ------------------------------------------ | ------------ |
| `ipai_docs`                     | Document management base                   | ⚠️ Uninstalled |
| `ipai_docs_project`             | Project-based document organization        | ⚠️ Uninstalled |
| `ipai_cash_advance`             | Cash advance request workflow              | ⚠️ Uninstalled |
| `ipai_expense`                  | Expense tracking and approval              | ⚠️ Uninstalled |
| `ipai_equipment`                | Equipment/asset management                 | ⚠️ Uninstalled |
| `ipai_ocr_expense`              | OCR-based expense extraction               | ⚠️ Uninstalled |
| `ipai_finance_ppm`              | PPM financial management                   | ⚠️ Uninstalled |
| `ipai_finance_monthly_closing`  | Monthly financial closing workflows        | ⚠️ Uninstalled |
| `ipai_finance_ssc`              | Shared Service Center finance              | ⚠️ Uninstalled |
| `ipai_ppm_monthly_close`        | PPM monthly close automation               | ⚠️ Uninstalled |

### 2.2 Integration Modules

| Module                     | Purpose                        | Status       |
| -------------------------- | ------------------------------ | ------------ |
| `tbwa_spectra_integration` | Spectra system integration     | ⚠️ Uninstalled |

---

## 3. Critical Gap: Module Installation

**Problem:** All IPAI modules exist in the filesystem and are registered in Odoo, but they show as **"To Install"** in the Odoo Apps interface instead of **"Installed"**.

**Impact:**
- Modules are not active in the database
- Business workflows are not operational
- Users cannot access module functionality

**Resolution Required:** Run batch module installation command (see Section 6).

---

## 4. Deployment Method: Manual Script-Based

### 4.1 Current Deployment Script

Location: `deploy_m1.sh` (legacy, not in version control)

**Process:**
1. SSH into DigitalOcean droplet
2. Clone/pull `odoo-ce` repository
3. Run Docker Compose to start containers
4. Manually restart services when needed
5. Manually install/upgrade modules via Odoo CLI

### 4.2 Limitations

- ❌ No rollback capability
- ❌ No staging environment for testing
- ❌ No automated testing before deployment
- ❌ No deployment history/audit trail
- ❌ High risk of human error
- ❌ Cannot reproduce deployment on different infrastructure
- ❌ Single point of failure (one developer with SSH access)

---

## 5. What's Missing

### 5.1 Immediate Needs

1. **Module Installation**
   - Run batch install command for all IPAI modules
   - Verify all modules show as "Installed" in Odoo Apps

2. **Documentation**
   - Document current deployment architecture
   - Create runbook for common operations
   - Document emergency procedures

### 5.2 Short-Term Needs (Next 2-4 Weeks)

1. **Docker Image Build System**
   - Create `Dockerfile` for Odoo with baked-in custom addons
   - Push images to DigitalOcean Container Registry
   - Version images with git SHA tags

2. **Deployment Scripts**
   - `deploy.sh` - Pull image and restart services
   - `install_modules.sh` - Batch module installation
   - `backup_db.sh` - Database backup automation
   - `restore_db.sh` - Database restore procedure

3. **Basic CI/CD**
   - GitHub Actions workflow to build Docker images
   - Automated deployment to staging environment
   - Manual promotion to production

### 5.3 Medium-Term Needs (1-3 Months)

1. **Infrastructure as Code**
   - Terraform modules for DigitalOcean resources
   - Cloud-init scripts for droplet bootstrap
   - Reproducible infrastructure deployment

2. **Staging Environment**
   - Separate droplet for staging
   - Database snapshot/restore workflow
   - Pre-production testing environment

3. **Monitoring & Alerting**
   - Healthchecks.io integration for uptime monitoring
   - Database backup verification
   - Disk space and resource monitoring
   - Alert notifications via Mattermost/email

### 5.4 Long-Term Needs (3-6 Months)

1. **High Availability**
   - Multi-droplet deployment with load balancer
   - Database replication
   - Zero-downtime deployments

2. **Managed Services Migration**
   - Move to DigitalOcean Managed PostgreSQL
   - Managed Redis for session storage
   - Object storage for file attachments

3. **Advanced CI/CD**
   - Automated testing in CI pipeline
   - Canary deployments
   - Automatic rollback on failures

---

## 6. Immediate Action Required

### 6.1 Install All Modules (One-Time Fix)

Run this command on the production droplet to install all IPAI modules:

```bash
# SSH into production droplet
ssh root@159.223.75.148

# Navigate to deployment directory
cd /opt/odoo

# Install all modules
docker compose exec odoo odoo \
  -d odoo \
  -i ipai_docs,ipai_docs_project,ipai_cash_advance,ipai_expense,ipai_equipment,ipai_ocr_expense,ipai_finance_ppm,ipai_finance_monthly_closing,ipai_finance_ssc,ipai_ppm_monthly_close,tbwa_spectra_integration \
  --stop-after-init

# Restart Odoo services
docker compose down && docker compose up -d
```

**Verification:**
1. Log into Odoo at https://erp.insightpulseai.net
2. Go to Apps menu
3. Verify all `ipai_*` and `tbwa_*` modules show as "Installed"

### 6.2 Verify Module Health

After installation, verify each module:

```sql
-- Check installed modules
SELECT name, state, latest_version
FROM ir_module_module
WHERE name LIKE 'ipai_%' OR name LIKE 'tbwa_%'
ORDER BY name;

-- Expected state: 'installed'
```

---

## 7. Architecture Overview

### 7.1 Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Internet Traffic                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
                ┌────────────────┐
                │   CloudFlare   │ (DNS)
                │  DNS A Record  │
                └────────┬───────┘
                         │
                         ▼
           ┌─────────────────────────┐
           │  DigitalOcean Droplet   │
           │  159.223.75.148         │
           │  Ubuntu 24.04           │
           └─────────┬───────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌───────────────┐         ┌──────────────┐
│  NGINX        │         │  Docker      │
│  Reverse      │◄────────┤  Compose     │
│  Proxy        │         │              │
│  + Certbot    │         └──────┬───────┘
└───────────────┘                │
                        ┌────────┴────────┐
                        │                 │
                        ▼                 ▼
              ┌─────────────┐   ┌─────────────┐
              │  odoo-ce    │   │  odoo-db    │
              │  Container  │───┤  PostgreSQL │
              │  Port 8069  │   │  Container  │
              └─────────────┘   └─────────────┘
                     │
                     ▼
           ┌─────────────────┐
           │  Volume Mounts  │
           │  custom-addons  │
           │  odoo-data      │
           │  db-data        │
           └─────────────────┘
```

### 7.2 Target Architecture (Future State)

```
┌──────────────────────────────────────────────────────────────┐
│                      Internet Traffic                         │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
                ┌────────────────┐
                │  DigitalOcean  │
                │  Load Balancer │
                └────────┬───────┘
                         │
            ┌────────────┼────────────┐
            │                         │
            ▼                         ▼
    ┌───────────────┐         ┌───────────────┐
    │   Staging     │         │  Production   │
    │   Droplet     │         │  Droplet(s)   │
    └───────┬───────┘         └───────┬───────┘
            │                         │
            ▼                         ▼
    ┌───────────────┐         ┌───────────────┐
    │  Docker       │         │  Docker       │
    │  (Staging)    │         │  (Prod)       │
    └───────┬───────┘         └───────┬───────┘
            │                         │
            └────────────┬────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │  DO Managed      │
              │  PostgreSQL      │
              │  + Backups       │
              └──────────────────┘
```

---

## 8. Security Considerations

### 8.1 Current Security Posture

✅ **Implemented:**
- HTTPS with Let's Encrypt certificates
- UFW firewall (restrictive rules)
- SSH key-based authentication
- Docker container isolation
- Database credentials in environment files (not in code)

⚠️ **Needs Attention:**
- Secrets management (env files in version control)
- Database backups not automated
- No intrusion detection
- No audit logging
- Root access required for deployment

### 8.2 Recommended Security Improvements

1. **Secrets Management**
   - Move to DigitalOcean Secrets or HashiCorp Vault
   - Rotate database credentials
   - Use service-specific credentials (not root)

2. **Backup Automation**
   - Daily automated backups to DigitalOcean Spaces
   - 30-day retention policy
   - Backup verification/testing

3. **Access Control**
   - Create non-root deploy user
   - Implement least-privilege access
   - Enable MFA for SSH

4. **Audit & Monitoring**
   - Enable Odoo audit logging
   - Ship logs to external monitoring
   - Alert on suspicious activity

---

## 9. Disaster Recovery

### 9.1 Current DR Capability

❌ **No Formal DR Plan**

**Current Risks:**
- Droplet failure = complete outage
- Database corruption = potential data loss
- No tested recovery procedures
- RTO: Unknown
- RPO: Unknown

### 9.2 Recommended DR Strategy

1. **Backup Strategy**
   - Daily automated database backups
   - Weekly full system snapshots
   - Offsite backup storage (DigitalOcean Spaces)
   - 30-day retention

2. **Recovery Procedures**
   - Documented database restore procedure
   - Terraform-based infrastructure recreation
   - Automated deployment from backup
   - Target RTO: 4 hours
   - Target RPO: 24 hours

3. **Testing**
   - Quarterly DR test exercises
   - Document test results
   - Update procedures based on learnings

---

## 10. Deployment Runbook

### 10.1 Standard Deployment

**Prerequisites:**
- SSH access to production droplet
- Access to `odoo-ce` repository
- Docker and Docker Compose installed

**Procedure:**
```bash
# 1. SSH into droplet
ssh root@159.223.75.148

# 2. Navigate to deployment directory
cd /opt/odoo

# 3. Pull latest code
git pull origin main

# 4. Pull latest Docker images
docker compose pull

# 5. Restart services
docker compose down
docker compose up -d

# 6. Verify health
docker compose ps
docker compose logs -f odoo | head -50
```

### 10.2 Module Update Deployment

```bash
# 1-5. Follow standard deployment steps above

# 6. Upgrade modules
docker compose exec odoo odoo \
  -d odoo \
  -u ipai_docs,ipai_expense,ipai_equipment \
  --stop-after-init

# 7. Restart services
docker compose down && docker compose up -d
```

### 10.3 Emergency Rollback

```bash
# 1. SSH into droplet
ssh root@159.223.75.148

# 2. Navigate to deployment directory
cd /opt/odoo

# 3. Revert to previous git commit
git log --oneline -10  # Find previous commit
git checkout <previous-commit-sha>

# 4. Restart services
docker compose down
docker compose up -d

# 5. Verify rollback successful
docker compose logs -f odoo
```

---

## 11. Next Steps

### Immediate (This Week)
1. ✅ Document current deployment state
2. ⏳ Install all IPAI modules in production
3. ⏳ Verify module health and functionality
4. ⏳ Create backup of current working state

### Short-Term (Next 2 Weeks)
1. Create Dockerfile with baked-in addons
2. Set up DigitalOcean Container Registry
3. Implement basic deployment scripts
4. Document emergency procedures

### Medium-Term (Next Month)
1. Implement Terraform infrastructure as code
2. Create staging environment
3. Set up GitHub Actions CI/CD
4. Implement automated backups

### Long-Term (Next Quarter)
1. Migrate to managed PostgreSQL
2. Implement high availability
3. Set up comprehensive monitoring
4. Automate DR testing

---

## 12. References

- **TBWA IPAI Module Standard:** `/platform/odoo/docs/TBWA_IPAI_MODULE_STANDARD.md`
- **Deployment Scripts:** `/platform/odoo/scripts/`
- **Infrastructure Code:** `/infra/terraform/odoo/`
- **CI/CD Workflows:** `/.github/workflows/deploy-odoo-*.yml`

---

## Appendix A: Module Installation Command Reference

### Full Installation Command

```bash
docker compose exec odoo odoo \
  -d odoo \
  -i ipai_docs,ipai_docs_project,ipai_cash_advance,ipai_expense,ipai_equipment,ipai_ocr_expense,ipai_finance_ppm,ipai_finance_monthly_closing,ipai_finance_ssc,ipai_ppm_monthly_close,tbwa_spectra_integration \
  --stop-after-init
```

### Selective Module Update

```bash
# Update specific modules only
docker compose exec odoo odoo \
  -d odoo \
  -u ipai_expense,ipai_equipment \
  --stop-after-init
```

### Module Uninstall (Use with Caution)

```bash
# Uninstall a module (will remove data!)
docker compose exec odoo odoo \
  -d odoo \
  --uninstall ipai_test_module \
  --stop-after-init
```

---

## Appendix B: Troubleshooting Guide

### Issue: Modules Not Showing as Installed

**Symptoms:**
- Modules visible in filesystem
- Modules show "To Install" in Odoo Apps

**Resolution:**
```bash
# 1. Check module registration
docker compose exec odoo odoo shell -d odoo
>>> self.env['ir.module.module'].search([('name', 'like', 'ipai_%')])

# 2. Update module list
docker compose exec odoo odoo -d odoo -u base --stop-after-init

# 3. Install modules
docker compose exec odoo odoo -d odoo -i ipai_docs,... --stop-after-init
```

### Issue: Docker Compose Fails to Start

**Symptoms:**
- `docker compose up` fails
- Containers exit immediately

**Resolution:**
```bash
# 1. Check logs
docker compose logs odoo
docker compose logs db

# 2. Verify environment variables
cat .env

# 3. Check port conflicts
sudo netstat -tulpn | grep 8069
sudo netstat -tulpn | grep 5432

# 4. Restart Docker daemon
sudo systemctl restart docker
```

### Issue: Database Connection Failed

**Symptoms:**
- Odoo cannot connect to PostgreSQL
- Connection timeout errors

**Resolution:**
```bash
# 1. Verify database container is running
docker compose ps

# 2. Check database logs
docker compose logs db

# 3. Test database connection
docker compose exec db psql -U odoo -d odoo -c "SELECT version();"

# 4. Verify network connectivity
docker network ls
docker network inspect odoo_default
```

---

**Document Version:** 1.0
**Author:** Claude (InsightPulse Platform Copilot)
**Status:** Living Document (update as deployment evolves)
