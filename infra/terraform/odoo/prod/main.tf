# InsightPulse Odoo - Production Environment
# Terraform configuration for production Odoo deployment

terraform {
  required_version = ">= 1.0"
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }

  # Remote state (REQUIRED for production)
  # backend "s3" {
  #   endpoint                    = "sgp1.digitaloceanspaces.com"
  #   key                         = "terraform/odoo/production.tfstate"
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

# Odoo production droplet
module "odoo_production" {
  source = "../modules/droplet-odoo"

  # Droplet configuration
  droplet_name = "odoo-prod"
  region       = var.region
  droplet_size = var.droplet_size
  environment  = "production"

  # SSH configuration
  ssh_key_ids    = var.ssh_key_ids
  ssh_source_ips = var.ssh_source_ips  # Restrict to office/VPN IPs

  # Cloud-init bootstrap
  user_data_file = "${path.module}/../../cloud-init/odoo-droplet.yaml"

  # Firewall
  create_firewall          = true
  allow_direct_odoo_access = false  # All traffic via NGINX proxy

  # Volume for database (recommended for production)
  create_volume   = var.create_volume
  volume_size_gb  = var.volume_size_gb

  # DNS
  create_dns_record = var.create_dns_record
  domain_name       = var.domain_name
  subdomain         = var.subdomain

  # Features
  enable_monitoring = true
  enable_backups    = var.enable_backups  # Weekly snapshots
  enable_ipv6       = false

  # Organization
  project_id = var.project_id
  additional_tags = [
    "cost-center:operations",
    "critical:true",
    "auto-destroy:false"
  ]
}

# Load balancer (optional, for high availability)
# resource "digitalocean_loadbalancer" "odoo" {
#   count = var.create_load_balancer ? 1 : 0
#
#   name   = "odoo-lb"
#   region = var.region
#
#   forwarding_rule {
#     entry_port     = 443
#     entry_protocol = "https"
#
#     target_port     = 8069
#     target_protocol = "http"
#
#     certificate_name = var.ssl_certificate_name
#   }
#
#   forwarding_rule {
#     entry_port     = 80
#     entry_protocol = "http"
#
#     target_port     = 8069
#     target_protocol = "http"
#   }
#
#   healthcheck {
#     port     = 8069
#     protocol = "http"
#     path     = "/web/health"
#   }
#
#   droplet_ids = [module.odoo_production.droplet_id]
# }
