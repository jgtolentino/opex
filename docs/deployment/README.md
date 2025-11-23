# InsightPulse Odoo - Deployment Documentation

This directory contains comprehensive documentation for deploying and managing the InsightPulse Odoo ERP system.

## 📚 Documentation Index

### Current Deployment State
- **[ODOO_DEPLOYMENT_STATE.md](./ODOO_DEPLOYMENT_STATE.md)** - Complete assessment of current deployment
  - Infrastructure and application status
  - Gap analysis and roadmap
  - Deployment runbooks
  - Troubleshooting guides
  - Disaster recovery procedures

## 🏗️ Infrastructure Components

The deployment infrastructure is organized across multiple directories:

### Docker Infrastructure
Location: `platform/odoo/docker/`

- **`odoo.Dockerfile`** - Production Docker image with IPAI addons
- **`docker-compose.base.yml`** - Shared service definitions
- **`docker-compose.staging.yml`** - Staging environment
- **`docker-compose.prod.yml`** - Production environment
- **`nginx/odoo.conf`** - NGINX reverse proxy configuration
- **`.env.example`** - Environment variables template

### Deployment Scripts
Location: `platform/odoo/scripts/`

- **`deploy.sh`** - Main deployment orchestration
- **`install_modules.sh`** - Module installation/upgrade
- **`backup_db.sh`** - Database backup automation
- **`restore_db.sh`** - Database restore procedure

### Infrastructure as Code
Location: `infra/terraform/odoo/`

- **`modules/droplet-odoo/`** - Reusable Terraform module
- **`staging/`** - Staging environment configuration
- **`prod/`** - Production environment configuration
- **`README.md`** - Complete Terraform guide

### Cloud-Init Bootstrap
Location: `infra/cloud-init/`

- **`odoo-droplet.yaml`** - Automated droplet setup

### CI/CD Workflows
Location: `.github/workflows/`

- **`build-odoo-image.yml`** - Docker image builds
- **`deploy-odoo-staging.yml`** - Staging deployment
- **`deploy-odoo-prod.yml`** - Production deployment
- **`test-odoo-modules.yml`** - Module testing

## 🚀 Quick Start Guides

### For First-Time Setup

1. **Read the deployment state document**
   ```bash
   cat docs/deployment/ODOO_DEPLOYMENT_STATE.md
   ```

2. **Review infrastructure as code**
   ```bash
   cat infra/terraform/odoo/README.md
   ```

3. **Set up Terraform for staging**
   ```bash
   cd infra/terraform/odoo/staging
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your credentials
   terraform init
   terraform plan
   ```

### For Regular Deployments

1. **Staging deployment** (automatic on push to develop)
   ```bash
   git push origin develop
   # GitHub Actions will automatically deploy to staging
   ```

2. **Production deployment** (manual via GitHub Actions)
   - Go to GitHub Actions → "Deploy Odoo to Production"
   - Click "Run workflow"
   - Enter the staging image tag to promote
   - Confirm deployment

### For Emergency Situations

See **Section 10** in [ODOO_DEPLOYMENT_STATE.md](./ODOO_DEPLOYMENT_STATE.md) for:
- Emergency rollback procedures
- Database restore procedures
- Service recovery steps

## 📋 Common Tasks

### Deploy to Staging
```bash
# Automated via GitHub Actions on push to develop branch
git checkout develop
git pull
# Make changes
git add .
git commit -m "feat: add new feature"
git push origin develop

# Or manually via SSH:
ssh root@<staging-ip>
cd /opt/odoo/platform/odoo
./scripts/deploy.sh staging
```

### Deploy to Production
```bash
# Via GitHub Actions (recommended):
# 1. Go to GitHub Actions
# 2. Select "Deploy Odoo to Production"
# 3. Run workflow with staging image tag

# Or manually via SSH (not recommended):
ssh root@159.223.75.148
cd /opt/odoo/platform/odoo
./scripts/deploy.sh prod
```

### Backup Database
```bash
ssh root@159.223.75.148
cd /opt/odoo/platform/odoo
./scripts/backup_db.sh
```

### Restore Database
```bash
ssh root@159.223.75.148
cd /opt/odoo/platform/odoo
./scripts/restore_db.sh backups/odoo_<timestamp>.sql.gz
```

### Install/Upgrade Modules
```bash
ssh root@159.223.75.148
cd /opt/odoo/platform/odoo

# Install modules
./scripts/install_modules.sh install

# Upgrade modules
./scripts/install_modules.sh upgrade
```

### View Logs
```bash
ssh root@159.223.75.148
cd /opt/odoo/platform/odoo

# View all logs
docker compose -f docker/docker-compose.base.yml -f docker/docker-compose.prod.yml logs -f

# View Odoo logs only
docker compose -f docker/docker-compose.base.yml -f docker/docker-compose.prod.yml logs -f odoo

# View last 100 lines
docker compose -f docker/docker-compose.base.yml -f docker/docker-compose.prod.yml logs --tail=100 odoo
```

## 🔐 Security Considerations

### Secrets Management
- ✅ All example files use `.example` suffix
- ✅ Real credentials are in `.env` files (gitignored)
- ✅ GitHub Actions secrets store sensitive values
- ⚠️ Never commit `terraform.tfvars` with real values
- ⚠️ Rotate API tokens and credentials regularly

### Access Control
- Production SSH access restricted to specific IPs
- Firewall rules managed via Terraform
- Database credentials in environment files only
- NGINX handles SSL/TLS termination

### Backup Strategy
- Daily automated backups (production)
- 30-day retention policy
- Backups stored on droplet (move to object storage recommended)
- Manual backup before major deployments

## 📊 Monitoring & Health Checks

### Health Check Endpoints
```bash
# Check Odoo health
curl -f https://erp.insightpulseai.net/web/health

# Check from droplet
curl -f http://localhost:8069/web/health
```

### Docker Service Status
```bash
docker compose ps
docker compose logs --tail=50 odoo
docker compose logs --tail=50 db
```

### System Resources
```bash
# CPU and memory
docker stats

# Disk usage
df -h

# Database size
docker compose exec db psql -U odoo -c "SELECT pg_database_size('odoo');"
```

## 🆘 Support & Troubleshooting

### Documentation Resources
1. **[ODOO_DEPLOYMENT_STATE.md](./ODOO_DEPLOYMENT_STATE.md)** - Complete deployment documentation
2. **[Terraform README](../../infra/terraform/odoo/README.md)** - Infrastructure as code guide
3. **[Platform Odoo README](../../platform/odoo/README.md)** - Odoo platform documentation (if exists)

### Common Issues
See **Appendix B** in [ODOO_DEPLOYMENT_STATE.md](./ODOO_DEPLOYMENT_STATE.md#appendix-b-troubleshooting-guide) for:
- Module installation failures
- Docker Compose issues
- Database connection problems
- NGINX configuration errors

### Getting Help
1. Check troubleshooting guide in deployment docs
2. Review logs: `docker compose logs`
3. Check GitHub Actions workflow runs
4. Review recent commits for breaking changes

## 📈 Deployment Roadmap

### Completed ✅
- [x] Deployment state documentation
- [x] Docker infrastructure (Dockerfile, Compose files)
- [x] Deployment automation scripts
- [x] Terraform infrastructure as code
- [x] GitHub Actions CI/CD workflows
- [x] NGINX reverse proxy configuration
- [x] Database backup/restore scripts

### In Progress 🚧
- [ ] Install all IPAI modules in production database
- [ ] Configure DigitalOcean Container Registry
- [ ] Set up GitHub Actions secrets
- [ ] Initial staging deployment

### Planned 📋
- [ ] Migrate to managed PostgreSQL database
- [ ] Set up monitoring and alerting (Healthchecks.io)
- [ ] Implement high availability setup
- [ ] Create staging environment droplet
- [ ] Automated DR testing
- [ ] Object storage for backups and attachments

## 📝 Contributing

When updating deployment infrastructure:

1. **Update documentation** - Keep this README and deployment state doc current
2. **Test in staging** - Always test changes in staging first
3. **Update CHANGELOG.md** - Document all infrastructure changes
4. **Review security** - Ensure no secrets are committed
5. **Update Terraform** - Keep IaC in sync with manual changes

## 🔗 Related Documentation

- [CLAUDE.md](../../CLAUDE.md) - AI copilot operating instructions
- [PLANNING.md](../../PLANNING.md) - Platform roadmap and phases
- [CODEBASE_GUIDE.md](../../CODEBASE_GUIDE.md) - Comprehensive codebase documentation
- [Platform README](../../platform/README.md) - Platform components overview

---

**Last Updated:** 2025-11-23
**Maintained By:** InsightPulse Platform Team
**Questions?** See [ODOO_DEPLOYMENT_STATE.md](./ODOO_DEPLOYMENT_STATE.md) or contact DevOps team
