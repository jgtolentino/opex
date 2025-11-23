# InsightPulse Odoo - Terraform Module for DigitalOcean Droplet
# Creates and configures a droplet for Odoo deployment

terraform {
  required_version = ">= 1.0"
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

# Odoo application droplet
resource "digitalocean_droplet" "odoo" {
  name   = var.droplet_name
  region = var.region
  size   = var.droplet_size
  image  = var.droplet_image

  # SSH keys for access
  ssh_keys = var.ssh_key_ids

  # Cloud-init user data for bootstrap
  user_data = var.user_data_file != "" ? file(var.user_data_file) : null

  # Enable monitoring
  monitoring = var.enable_monitoring

  # Enable backups (recommended for production)
  backups = var.enable_backups

  # IPv6
  ipv6 = var.enable_ipv6

  # Tags for organization
  tags = concat(
    ["odoo", var.environment, "managed-by-terraform"],
    var.additional_tags
  )

  # Prevent accidental destruction
  lifecycle {
    prevent_destroy = false  # Set to true for production
  }
}

# Firewall rules
resource "digitalocean_firewall" "odoo" {
  count = var.create_firewall ? 1 : 0

  name = "${var.droplet_name}-firewall"

  droplet_ids = [digitalocean_droplet.odoo.id]

  # SSH access
  inbound_rule {
    protocol         = "tcp"
    port_range       = "22"
    source_addresses = var.ssh_source_ips
  }

  # HTTP
  inbound_rule {
    protocol         = "tcp"
    port_range       = "80"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  # HTTPS
  inbound_rule {
    protocol         = "tcp"
    port_range       = "443"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  # Odoo (only if needed for direct access, usually proxied via NGINX)
  dynamic "inbound_rule" {
    for_each = var.allow_direct_odoo_access ? [1] : []
    content {
      protocol         = "tcp"
      port_range       = "8069"
      source_addresses = var.odoo_source_ips
    }
  }

  # Allow all outbound traffic
  outbound_rule {
    protocol              = "tcp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "udp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "icmp"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }
}

# Volume for database data (optional, recommended for production)
resource "digitalocean_volume" "odoo_data" {
  count = var.create_volume ? 1 : 0

  region                  = var.region
  name                    = "${var.droplet_name}-data"
  size                    = var.volume_size_gb
  description             = "Odoo data volume for ${var.droplet_name}"
  initial_filesystem_type = "ext4"

  tags = concat(
    ["odoo-data", var.environment],
    var.additional_tags
  )
}

# Attach volume to droplet
resource "digitalocean_volume_attachment" "odoo_data" {
  count = var.create_volume ? 1 : 0

  droplet_id = digitalocean_droplet.odoo.id
  volume_id  = digitalocean_volume.odoo_data[0].id
}

# DNS A record (if domain management is enabled)
resource "digitalocean_record" "odoo" {
  count = var.create_dns_record ? 1 : 0

  domain = var.domain_name
  type   = "A"
  name   = var.subdomain
  value  = digitalocean_droplet.odoo.ipv4_address
  ttl    = var.dns_ttl
}

# Project (for organization in DO dashboard)
resource "digitalocean_project_resources" "odoo" {
  count = var.project_id != "" ? 1 : 0

  project = var.project_id
  resources = concat(
    [digitalocean_droplet.odoo.urn],
    var.create_volume ? [digitalocean_volume.odoo_data[0].urn] : []
  )
}
