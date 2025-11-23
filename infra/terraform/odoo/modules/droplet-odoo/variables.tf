# InsightPulse Odoo - Terraform Module Variables

# ============================================================
# Droplet Configuration
# ============================================================

variable "droplet_name" {
  description = "Name of the Odoo droplet"
  type        = string
}

variable "region" {
  description = "DigitalOcean region (e.g., sgp1, nyc3, sfo3)"
  type        = string
  default     = "sgp1"
}

variable "droplet_size" {
  description = "Droplet size (e.g., s-2vcpu-4gb, s-4vcpu-8gb)"
  type        = string
  default     = "s-2vcpu-4gb"
}

variable "droplet_image" {
  description = "Droplet image (Ubuntu 24.04 recommended)"
  type        = string
  default     = "ubuntu-24-04-x64"
}

variable "environment" {
  description = "Environment name (staging, production)"
  type        = string
  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "Environment must be 'staging' or 'production'."
  }
}

# ============================================================
# SSH Configuration
# ============================================================

variable "ssh_key_ids" {
  description = "List of SSH key IDs for droplet access"
  type        = list(number)
}

variable "ssh_source_ips" {
  description = "Source IP addresses allowed for SSH access (CIDR notation)"
  type        = list(string)
  default     = ["0.0.0.0/0", "::/0"]  # Allow from anywhere (restrict in production)
}

# ============================================================
# Cloud-Init Configuration
# ============================================================

variable "user_data_file" {
  description = "Path to cloud-init user data file"
  type        = string
  default     = ""
}

# ============================================================
# Firewall Configuration
# ============================================================

variable "create_firewall" {
  description = "Whether to create a firewall for the droplet"
  type        = bool
  default     = true
}

variable "allow_direct_odoo_access" {
  description = "Allow direct access to Odoo port 8069 (not recommended for production)"
  type        = bool
  default     = false
}

variable "odoo_source_ips" {
  description = "Source IPs allowed for direct Odoo access (if enabled)"
  type        = list(string)
  default     = ["0.0.0.0/0", "::/0"]
}

# ============================================================
# Volume Configuration
# ============================================================

variable "create_volume" {
  description = "Whether to create a separate volume for data"
  type        = bool
  default     = false
}

variable "volume_size_gb" {
  description = "Size of the data volume in GB"
  type        = number
  default     = 100
}

# ============================================================
# DNS Configuration
# ============================================================

variable "create_dns_record" {
  description = "Whether to create a DNS A record"
  type        = bool
  default     = false
}

variable "domain_name" {
  description = "Domain name for DNS record (e.g., insightpulseai.net)"
  type        = string
  default     = ""
}

variable "subdomain" {
  description = "Subdomain for DNS record (e.g., erp, odoo-staging)"
  type        = string
  default     = "erp"
}

variable "dns_ttl" {
  description = "TTL for DNS record in seconds"
  type        = number
  default     = 3600
}

# ============================================================
# Features
# ============================================================

variable "enable_monitoring" {
  description = "Enable DigitalOcean monitoring"
  type        = bool
  default     = true
}

variable "enable_backups" {
  description = "Enable automated droplet backups (weekly)"
  type        = bool
  default     = false  # Set to true for production
}

variable "enable_ipv6" {
  description = "Enable IPv6 support"
  type        = bool
  default     = false
}

# ============================================================
# Organization
# ============================================================

variable "project_id" {
  description = "DigitalOcean project ID for resource organization"
  type        = string
  default     = ""
}

variable "additional_tags" {
  description = "Additional tags for the droplet"
  type        = list(string)
  default     = []
}
