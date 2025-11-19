# Odoo CE + OCA 18.0 White-Label Deployment Guide

**Complete isolation from odoo.com services in three layers**

This guide walks you through deploying a fully white-labeled Odoo Community Edition + OCA installation that:
- Runs 100% on your infrastructure
- Uses only your domain (no odoo.com references)
- Has all IAP and upsell mechanisms removed
- Is branded as InsightPulseAI / your company

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Layer 1: Install Pure CE+OCA](#layer-1-install-pure-ceoca)
4. [Layer 2: Lock to Your Domain](#layer-2-lock-to-your-domain)
5. [Layer 3: Strip IAP & Upsell](#layer-3-strip-iap--upsell)
6. [Verification Checklist](#verification-checklist)
7. [Maintenance & Operations](#maintenance--operations)
8. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### The Three Layers

```
┌─────────────────────────────────────────────────────────┐
│  Layer 3: IAP & Upsell Removal                         │
│  - ipai_branding_cleaner module                        │
│  - Disabled scheduled actions                          │
│  - Network-level blocking                              │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  Layer 2: Domain Binding                               │
│  - web.base.url = https://erp.yourdomain.com          │
│  - web.base.url.freeze = True                         │
│  - Reverse proxy with SSL                             │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  Layer 1: Base Installation                            │
│  - OCB 18.0 (OCA Community Backports)                 │
│  - PostgreSQL 15                                       │
│  - OCA modules (server-tools, web, etc.)              │
└─────────────────────────────────────────────────────────┘
```

### Stack Components

- **Odoo**: OCB 18.0 (OCA's fork with backports)
- **Database**: PostgreSQL 15
- **Reverse Proxy**: Nginx/Caddy with Let's Encrypt
- **Containers**: Docker + Docker Compose
- **Custom Modules**: ipai_branding_cleaner
- **OCA Modules**: server-tools, server-ux, web, reporting-engine, server-brand

---

## Prerequisites

### System Requirements

- **OS**: Ubuntu 22.04 LTS or similar (DigitalOcean droplet works great)
- **RAM**: Minimum 4GB, recommended 8GB+
- **CPU**: Minimum 2 cores, recommended 4+
- **Disk**: Minimum 40GB SSD
- **Domain**: Registered domain with DNS access

### Software Requirements

- Docker 24.0+
- Docker Compose 2.0+
- Git
- curl
- A domain name (e.g., `erp.yourdomain.com`)

### Installation on Ubuntu

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Add your user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install git and curl
sudo apt install git curl -y
```

---

## Layer 1: Install Pure CE+OCA

### Step 1.1: Clone the Repository

```bash
# Clone the OpEx platform monorepo
git clone https://github.com/jgtolentino/opex.git
cd opex/platform/odoo/docker

# Or if you're already in the repo:
cd platform/odoo/docker
```

### Step 1.2: Configure Environment

```bash
# Copy environment template
cp .env.template .env

# Edit environment variables
nano .env
```

**Critical settings to change in `.env`:**

```bash
# Your domain (THIS IS CRITICAL!)
ODOO_BASE_URL=https://erp.yourdomain.com

# Database password
DB_PASSWORD=your_secure_password_here

# Admin master password
ADMIN_PASSWORD=your_master_password_here

# Workers (adjust based on CPU cores)
# Formula: (cores * 2) + 1
WORKERS=9  # For 4 cores
```

### Step 1.3: Set Up OCA Repositories

```bash
# Run OCA setup script
cd scripts
./setup-oca-repos.sh 18.0

# This will clone:
# - server-tools
# - server-ux
# - web
# - reporting-engine
# - server-brand
# - And more...
```

### Step 1.4: Customize odoo.conf

```bash
# Edit Odoo configuration
cd ../config
nano odoo.conf
```

**Key settings to verify:**

```ini
[options]
# Database
db_host = postgres
db_user = odoo
db_password = odoo

# Addons path (order matters!)
addons_path = /mnt/extra-addons,/mnt/oca-addons,/usr/lib/python3/dist-packages/odoo/addons

# Proxy mode (REQUIRED for reverse proxy)
proxy_mode = True

# Disable database manager
list_db = False

# Workers
workers = 4
```

### Step 1.5: Launch the Stack

```bash
# Return to docker directory
cd ..

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f odoo
```

**Wait for this message:**
```
odoo    | INFO ? odoo.modules.loading: Modules loaded.
odoo    | INFO ? odoo.service.server: HTTP service (werkzeug) running on 0.0.0.0:8069
```

### Step 1.6: Create Initial Database

1. Open browser: `http://your-server-ip:8069`
2. Create database:
   - **Master Password**: (from your .env ADMIN_PASSWORD)
   - **Database Name**: `production` (or your choice)
   - **Email**: your admin email
   - **Password**: your admin password
   - **Language**: English (or your choice)
   - **Country**: Your country
   - **Demo Data**: ❌ Leave unchecked!

---

## Layer 2: Lock to Your Domain

### Step 2.1: Set Up Reverse Proxy

#### Option A: Using Caddy (Recommended - Auto SSL)

```bash
# Install Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# Configure Caddy
sudo nano /etc/caddy/Caddyfile
```

**Caddyfile:**

```
erp.yourdomain.com {
    reverse_proxy localhost:8069
    encode gzip
}
```

```bash
# Restart Caddy
sudo systemctl restart caddy
```

#### Option B: Using Nginx

```bash
# Install Nginx and Certbot
sudo apt install nginx certbot python3-certbot-nginx -y

# Create Nginx config
sudo nano /etc/nginx/sites-available/odoo
```

**Nginx config:**

```nginx
upstream odoo {
    server 127.0.0.1:8069;
}

upstream odoochat {
    server 127.0.0.1:8072;
}

map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 80;
    server_name erp.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name erp.yourdomain.com;

    # SSL certificates (will be created by certbot)
    ssl_certificate /etc/letsencrypt/live/erp.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/erp.yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";

    # Proxy settings
    proxy_read_timeout 720s;
    proxy_connect_timeout 720s;
    proxy_send_timeout 720s;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Real-IP $remote_addr;

    # Log files
    access_log /var/log/nginx/odoo-access.log;
    error_log /var/log/nginx/odoo-error.log;

    # Main location
    location / {
        proxy_pass http://odoo;
        proxy_redirect off;
    }

    # Longpolling
    location /longpolling {
        proxy_pass http://odoochat;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
    }

    # Increase upload size
    client_max_body_size 100M;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/odoo /etc/nginx/sites-enabled/

# Get SSL certificate
sudo certbot --nginx -d erp.yourdomain.com

# Restart Nginx
sudo systemctl restart nginx
```

### Step 2.2: Set System Parameters in Odoo

1. Log in to Odoo
2. Enable Developer Mode:
   - Settings → Activate Developer Mode
3. Go to: Settings → Technical → Parameters → System Parameters
4. **Verify these parameters exist** (they should if ipai_branding_cleaner is installed):

| Key | Value |
|-----|-------|
| `web.base.url` | `https://erp.yourdomain.com` |
| `web.base.url.freeze` | `True` |
| `iap.endpoint` | `` (empty) |
| `database.is_neutralized` | `True` |

5. If they don't exist, create them manually.

### Step 2.3: Update odoo.conf (if needed)

```bash
docker-compose exec odoo bash
nano /etc/odoo/odoo.conf
```

Verify:
```ini
proxy_mode = True
```

---

## Layer 3: Strip IAP & Upsell

### Step 3.1: Install ipai_branding_cleaner Module

1. Log in to Odoo as admin
2. Go to: Apps
3. Remove any filters (click ❌ on filter chips)
4. Click: **Update Apps List**
5. Search: `ipai_branding_cleaner`
6. Click: **Install**
7. Wait for installation to complete
8. Log out and log back in

### Step 3.2: Run IAP Disabling Script

```bash
cd platform/odoo/docker/scripts

# Disable all IAP modules and accounts
./disable-iap.sh production

# (Replace 'production' with your database name)
```

This script:
- Disables all IAP account tokens
- Uninstalls IAP-related modules
- Disables phone-home scheduled actions
- Sets database as "neutralized"

### Step 3.3: Network-Level Blocking (Optional but Recommended)

#### Option A: Using /etc/hosts (Simple)

```bash
sudo bash -c 'cat >> /etc/hosts << EOF
127.0.0.1 iap.odoo.com
127.0.0.1 apps.odoo.com
127.0.0.1 www.odoo.com
127.0.0.1 services.odoo.com
EOF'
```

#### Option B: Using UFW Firewall (More Robust)

```bash
# Block odoo.com domains
sudo ufw deny out to apps.odoo.com
sudo ufw deny out to iap.odoo.com
sudo ufw deny out to www.odoo.com
```

#### Option C: Docker Network Isolation (Best)

Edit `docker-compose.yml` to add DNS overrides:

```yaml
services:
  odoo:
    # ... existing config ...
    dns:
      - 1.1.1.1
      - 8.8.8.8
    extra_hosts:
      - "iap.odoo.com:127.0.0.1"
      - "apps.odoo.com:127.0.0.1"
      - "www.odoo.com:127.0.0.1"
```

Then restart:
```bash
docker-compose down
docker-compose up -d
```

---

## Verification Checklist

### Automated Verification

Run the verification script:

```bash
cd platform/odoo/docker/scripts
./verify-isolation.sh production
```

This checks:
- ✅ System parameters are set correctly
- ✅ IAP modules are disabled/uninstalled
- ✅ Phone-home scheduled actions are disabled
- ✅ Network connectivity to odoo.com is blocked
- ✅ ipai_branding_cleaner is installed
- ✅ No odoo.com references in web UI

### Manual Verification

Log in to Odoo and verify:

- [ ] **Login page**: No "Powered by Odoo" text
- [ ] **Main dashboard**: No odoo.com links in footer
- [ ] **Settings → About**: Shows your branding
- [ ] **Help menu**: Points to your documentation
- [ ] **Apps menu**: No link to apps.odoo.com
- [ ] **Settings → General Settings**: No "View My Services" button
- [ ] **Settings → Technical → System Parameters**: web.base.url is your domain
- [ ] **URL bar**: Shows your domain, not odoo.com
- [ ] **Browser console** (F12): ipai_branding_cleaner logs showing cleanup

### Expected Browser Console Output

Open browser console (F12) and look for:

```
[InsightPulse] Branding cleanup complete
[InsightPulse] Rewrote 0 odoo.com links  ← (should be 0 after cleanup)
[InsightPulse] Removed 0 "Powered by Odoo" elements
```

---

## Maintenance & Operations

### Regular Tasks

#### Daily Backups

```bash
# Backup script
docker exec ipai_odoo_db pg_dump -U odoo production | gzip > backup_$(date +%Y%m%d).sql.gz

# Backup filestore
docker cp ipai_odoo:/var/lib/odoo filestore_backup_$(date +%Y%m%d)
```

#### Update OCA Modules

```bash
cd platform/odoo/docker/scripts
./setup-oca-repos.sh 18.0  # Re-run to pull latest
docker-compose restart odoo
```

#### Check for Isolation Drift

Run monthly:
```bash
./verify-isolation.sh production
```

### Updating Odoo

```bash
# Pull latest OCB image
docker pull ghcr.io/oca/oca-ci/py3.10-odoo18.0:latest

# Backup first!
./backup.sh

# Update
docker-compose down
docker-compose up -d

# Update module list
# In Odoo: Apps → Update Apps List
```

---

## Troubleshooting

### Issue: Still seeing odoo.com links

**Solution 1**: Clear browser cache
```bash
# In browser: Ctrl+Shift+Delete → Clear all
# Or use incognito/private window
```

**Solution 2**: Check ipai_branding_cleaner installation
```bash
docker-compose exec odoo odoo-bin -d production -u ipai_branding_cleaner --stop-after-init
```

**Solution 3**: Manually check JavaScript console
- F12 → Console tab
- Look for ipai_branding_cleaner logs
- If not present, module may not be loaded

### Issue: "Database not found" error

**Solution**: Database manager is disabled. Create database via command line:
```bash
docker-compose exec odoo odoo-bin -d production --init base --stop-after-init
```

### Issue: Can't install modules

**Solution**: Check addons path
```bash
docker-compose exec odoo cat /etc/odoo/odoo.conf | grep addons_path
# Should include: /mnt/extra-addons,/mnt/oca-addons
```

### Issue: Container can still reach odoo.com

**Solution**: Check network blocking
```bash
# Test from within container
docker exec ipai_odoo curl -v https://www.odoo.com
# Should timeout or fail

# If it connects, add to /etc/hosts:
docker exec ipai_odoo bash -c 'echo "127.0.0.1 www.odoo.com" >> /etc/hosts'
```

### Issue: ipai_branding_cleaner not in Apps list

**Solution**: Check module path
```bash
# Verify module exists
docker exec ipai_odoo ls -la /mnt/extra-addons/ipai_branding_cleaner

# Update apps list
# In Odoo: Apps → Update Apps List
```

---

## Legal & Licensing

### What You're Allowed to Do

✅ **Allowed:**
- Host Odoo CE on your own infrastructure
- Modify and customize all CE modules (LGPL/AGPL)
- White-label the interface
- Remove odoo.com branding and links
- Use for commercial purposes
- Charge customers for your hosted service

❌ **Not Allowed:**
- Call it "Official Odoo" or suggest endorsement by Odoo SA
- Strip copyright notices from source code
- Use Odoo's trademarks without permission
- Claim you are Odoo SA

### Recommended Attribution

Footer text:
```
"Powered by InsightPulseAI | Built on Odoo Community Edition & OCA"
```

About page:
```
This platform is built on Odoo Community Edition, an open-source ERP system,
and OCA (Odoo Community Association) modules. Customization and hosting by InsightPulseAI.
```

---

## Next Steps

After successful deployment:

1. **Customize branding further**:
   - Replace logo: Settings → Companies → Upload logo
   - Customize favicon: Add `/web/static/src/img/favicon.ico`
   - Update email templates with your branding

2. **Install additional OCA modules**:
   - `web_responsive` - Mobile-friendly interface
   - `base_tier_validation` - Approval workflows
   - `auth_session_timeout` - Enhanced security
   - `web_environment_ribbon` - Environment indicator

3. **Set up integrations**:
   - Connect to Supabase via REST API
   - Integrate with n8n workflows
   - Set up Mattermost notifications

4. **Monitor and maintain**:
   - Set up automated backups
   - Configure monitoring (Prometheus + Grafana)
   - Schedule regular isolation verification

---

## Support

- **Documentation**: https://docs.yourdomain.com/odoo
- **Mattermost**: #opex-odoo channel
- **GitHub Issues**: https://github.com/jgtolentino/opex/issues

---

**Last Updated**: 2025-01-19
**Version**: 1.0.0
**Status**: Production Ready
