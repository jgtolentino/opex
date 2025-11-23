# InsightPulse Odoo - Terraform Infrastructure

This directory contains Terraform configurations for deploying Odoo infrastructure on DigitalOcean.

## Structure

```
odoo/
├── modules/
│   └── droplet-odoo/     # Reusable module for Odoo droplets
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
├── staging/               # Staging environment
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── terraform.tfvars.example
└── prod/                  # Production environment
    ├── main.tf
    ├── variables.tf
    ├── outputs.tf
    └── terraform.tfvars.example
```

## Prerequisites

### 1. Install Terraform

```bash
# macOS
brew tap hashicorp/tap
brew install hashicorp/tap/terraform

# Linux
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/
```

### 2. Install DigitalOcean CLI (doctl)

```bash
# macOS
brew install doctl

# Linux
cd ~
wget https://github.com/digitalocean/doctl/releases/download/v1.100.0/doctl-1.100.0-linux-amd64.tar.gz
tar xf doctl-1.100.0-linux-amd64.tar.gz
sudo mv doctl /usr/local/bin
```

### 3. Authenticate doctl

```bash
doctl auth init
# Enter your DigitalOcean API token when prompted
```

### 4. Get SSH Key IDs

```bash
# List your SSH keys
doctl compute ssh-key list

# Output example:
# ID         Name      FingerPrint
# 12345678   laptop    aa:bb:cc:...
# 87654321   server    dd:ee:ff:...
```

## Deployment

### Staging Environment

```bash
cd staging

# 1. Copy example vars file
cp terraform.tfvars.example terraform.tfvars

# 2. Edit terraform.tfvars with your values
vim terraform.tfvars

# 3. Initialize Terraform
terraform init

# 4. Review planned changes
terraform plan

# 5. Apply configuration
terraform apply

# 6. Get outputs
terraform output
```

### Production Environment

```bash
cd prod

# 1. Copy example vars file
cp terraform.tfvars.example terraform.tfvars

# 2. Edit terraform.tfvars with your values
# IMPORTANT: Use restrictive SSH source IPs for production
vim terraform.tfvars

# 3. Initialize Terraform
terraform init

# 4. Review planned changes CAREFULLY
terraform plan

# 5. Apply configuration
terraform apply

# 6. Get outputs (note: ssh_command is sensitive)
terraform output
terraform output -raw ssh_command
```

## Post-Deployment Steps

After Terraform creates the infrastructure:

### 1. SSH into the droplet

```bash
# Get SSH command from Terraform output
terraform output -raw ssh_command

# Or manually
ssh root@<droplet_ip>
```

### 2. Clone the repository

```bash
cd /opt/odoo
git clone https://github.com/jgtolentino/opex.git .
```

### 3. Configure environment

```bash
# Copy environment template
cp platform/odoo/docker/.env.example platform/odoo/docker/.env

# Edit with actual credentials
vim platform/odoo/docker/.env
```

### 4. Deploy Odoo

```bash
# Navigate to platform/odoo
cd /opt/odoo/platform/odoo

# Run deployment script
./scripts/deploy.sh prod
```

### 5. Configure NGINX

```bash
# Copy NGINX config
cp docker/nginx/odoo.conf /etc/nginx/sites-available/odoo
ln -s /etc/nginx/sites-available/odoo /etc/nginx/sites-enabled/

# Test configuration
nginx -t

# Reload NGINX
systemctl reload nginx
```

### 6. Set up SSL with Certbot

```bash
# Run Certbot
certbot --nginx -d erp.insightpulseai.net

# Certbot will automatically configure NGINX for HTTPS
```

## Managing Infrastructure

### View current state

```bash
terraform show
```

### Update infrastructure

```bash
# Make changes to .tf files or terraform.tfvars
# Then run:
terraform plan
terraform apply
```

### Destroy infrastructure

```bash
# WARNING: This will delete all resources
terraform destroy
```

### Import existing resources

If you have existing infrastructure that wasn't created with Terraform:

```bash
# Import droplet
terraform import module.odoo_production.digitalocean_droplet.odoo <droplet_id>

# Import volume
terraform import module.odoo_production.digitalocean_volume.odoo_data[0] <volume_id>

# Import DNS record
terraform import module.odoo_production.digitalocean_record.odoo[0] <domain>,<record_id>
```

## Remote State (Recommended)

For production, use remote state storage:

### 1. Create DigitalOcean Space for Terraform state

```bash
doctl compute space create insightpulse-terraform --region sgp1
```

### 2. Create Spaces access keys

```bash
doctl compute space keys create
```

### 3. Configure backend in main.tf

Uncomment the backend configuration and update with your values:

```hcl
backend "s3" {
  endpoint                    = "sgp1.digitaloceanspaces.com"
  key                         = "terraform/odoo/production.tfstate"
  bucket                      = "insightpulse-terraform"
  region                      = "us-east-1"
  access_key                  = "YOUR_SPACES_ACCESS_KEY"
  secret_key                  = "YOUR_SPACES_SECRET_KEY"
  skip_credentials_validation = true
  skip_metadata_api_check     = true
}
```

### 4. Reinitialize Terraform

```bash
terraform init -migrate-state
```

## Troubleshooting

### Error: "Error creating droplet: POST https://api.digitalocean.com/v2/droplets: 401"

**Solution:** Check your DigitalOcean API token is valid:

```bash
doctl account get
```

### Error: "Error: Invalid SSH key ID"

**Solution:** List SSH keys and update terraform.tfvars:

```bash
doctl compute ssh-key list
```

### Error: "Error creating DNS record"

**Solution:** Ensure the domain is added to your DigitalOcean account:

```bash
doctl compute domain list
# If not present:
doctl compute domain create insightpulseai.net
```

### Droplet created but cloud-init failed

**Solution:** SSH into droplet and check cloud-init logs:

```bash
ssh root@<droplet_ip>
cat /var/log/cloud-init-output.log
```

## Security Best Practices

1. **Never commit terraform.tfvars** - Add to .gitignore
2. **Restrict SSH access** - Use specific IP ranges, not 0.0.0.0/0
3. **Use separate tokens** - Different tokens for staging and production
4. **Enable backups** - Set `enable_backups = true` for production
5. **Use remote state** - Store state files in DigitalOcean Spaces
6. **Rotate API tokens** - Periodically rotate DigitalOcean API tokens
7. **Review changes** - Always run `terraform plan` before `apply`

## Cost Optimization

| Resource               | Staging       | Production     | Monthly Cost (USD) |
| ---------------------- | ------------- | -------------- | ------------------ |
| Droplet (2 vCPU, 4GB)  | s-2vcpu-4gb   | -              | ~$24               |
| Droplet (4 vCPU, 8GB)  | -             | s-4vcpu-8gb    | ~$48               |
| Volume (100GB)         | -             | Optional       | ~$10               |
| Volume (200GB)         | -             | Optional       | ~$20               |
| Backups                | Disabled      | Enabled        | ~20% of droplet    |
| Load Balancer          | -             | Optional       | ~$12               |

**Staging Total:** ~$24/month
**Production Total:** ~$58-90/month (depending on volume and backups)

## References

- [Terraform DigitalOcean Provider Docs](https://registry.terraform.io/providers/digitalocean/digitalocean/latest/docs)
- [DigitalOcean API Documentation](https://docs.digitalocean.com/reference/api/)
- [Cloud-Init Documentation](https://cloudinit.readthedocs.io/)
