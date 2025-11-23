# InsightPulse Odoo - Staging Environment
# Terraform configuration for staging Odoo deployment

terraform {
  required_version = ">= 1.0"
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }

  # Uncomment to use remote state (recommended)
  # backend "s3" {
  #   endpoint                    = "sgp1.digitaloceanspaces.com"
  #   key                         = "terraform/odoo/staging.tfstate"
  #   bucket                      = "insightpulse-terraform"
  #   region                      = "us-east-1"  # Not used but required
  #   skip_credentials_validation = true
  #   skip_metadata_api_check     = true
  # }
}

# DigitalOcean provider
provider "digitalocean" {
  token = var.do_token
}

# Odoo staging droplet
module "odoo_staging" {
  source = "../modules/droplet-odoo"

  # Droplet configuration
  droplet_name = "odoo-staging"
  region       = var.region
  droplet_size = var.droplet_size
  environment  = "staging"

  # SSH configuration
  ssh_key_ids    = var.ssh_key_ids
  ssh_source_ips = var.ssh_source_ips

  # Cloud-init bootstrap
  user_data_file = "${path.module}/../../cloud-init/odoo-droplet.yaml"

  # Firewall
  create_firewall             = true
  allow_direct_odoo_access    = true  # Allow direct access for staging
  odoo_source_ips             = var.ssh_source_ips

  # Volume (optional for staging)
  create_volume  = false

  # DNS (optional for staging)
  create_dns_record = var.create_dns_record
  domain_name       = var.domain_name
  subdomain         = "odoo-staging"

  # Features
  enable_monitoring = true
  enable_backups    = false  # Not needed for staging
  enable_ipv6       = false

  # Organization
  project_id = var.project_id
  additional_tags = [
    "cost-center:engineering",
    "auto-destroy:true"
  ]
}
