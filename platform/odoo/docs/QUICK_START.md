# Odoo CE+OCA 18.0 - Quick Start Guide

**Get a white-labeled Odoo instance running in 15 minutes**

This is the condensed version. For full details, see [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## Prerequisites

- Ubuntu 22.04+ server with Docker installed
- Domain name pointed to your server (e.g., `erp.yourdomain.com`)
- 4GB+ RAM, 2+ CPU cores

---

## 5-Step Quick Start

### 1. Clone & Configure

```bash
# Clone repository
git clone https://github.com/jgtolentino/opex.git
cd opex/platform/odoo/docker

# Set up environment
cp .env.template .env
nano .env  # Edit: ODOO_BASE_URL, DB_PASSWORD, ADMIN_PASSWORD
```

### 2. Set Up OCA Repos

```bash
cd scripts
./setup-oca-repos.sh 18.0
cd ..
```

### 3. Launch Stack

```bash
docker-compose up -d
docker-compose logs -f odoo  # Watch until "HTTP service running"
```

### 4. Create Database

1. Open: `http://your-server-ip:8069`
2. Create database (name: `production`, no demo data)
3. Log in

### 5. Install Branding Cleaner

```bash
# In Odoo UI:
# Apps → Update Apps List → Search "ipai_branding_cleaner" → Install

# Then run from terminal:
cd scripts
./disable-iap.sh production
./verify-isolation.sh production
```

---

## Set Up SSL (Choose One)

### Option A: Caddy (Easiest)

```bash
sudo apt install caddy -y
sudo nano /etc/caddy/Caddyfile
```

Add:
```
erp.yourdomain.com {
    reverse_proxy localhost:8069
}
```

```bash
sudo systemctl restart caddy
```

### Option B: Nginx + Certbot

```bash
sudo apt install nginx certbot python3-certbot-nginx -y
sudo certbot --nginx -d erp.yourdomain.com
# Follow prompts
```

---

## Verification

Run the automated check:

```bash
cd platform/odoo/docker/scripts
./verify-isolation.sh production
```

Expected output:
```
✓ All checks passed!
Your Odoo instance is fully isolated from odoo.com
```

---

## What You Just Got

✅ Odoo CE 18.0 (OCB - OCA Community Backports)
✅ OCA modules (server-tools, web, etc.)
✅ Zero odoo.com dependencies
✅ Custom branding (InsightPulseAI)
✅ Domain locked to your URL
✅ All IAP/upsell removed
✅ SSL-ready reverse proxy

---

## Next Steps

1. **Customize branding**: Settings → Companies → Upload logo
2. **Install OCA modules**: Apps → Search for web_responsive, base_tier_validation
3. **Configure email**: Settings → Technical → Outgoing Mail Servers
4. **Set up backups**: `docker exec ipai_odoo_db pg_dump...`

---

## Common Commands

```bash
# View logs
docker-compose logs -f odoo

# Restart Odoo
docker-compose restart odoo

# Update module
docker-compose exec odoo odoo-bin -d production -u ipai_branding_cleaner --stop-after-init

# Backup database
docker exec ipai_odoo_db pg_dump -U odoo production | gzip > backup.sql.gz

# Check isolation
./scripts/verify-isolation.sh production
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Still see odoo.com links | Clear browser cache, check console logs |
| Module not found | `docker-compose restart odoo`, update apps list |
| Can't create database | Check ADMIN_PASSWORD in .env |
| SSL not working | Check DNS, wait for propagation |

---

## Support

- **Full docs**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Mattermost**: #opex-odoo
- **GitHub**: https://github.com/jgtolentino/opex/issues

---

**Pro tip**: After installation, run `./verify-isolation.sh production` monthly to ensure no drift back to odoo.com dependencies.
