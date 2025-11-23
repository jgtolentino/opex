# InsightPulse Odoo - Production Environment Variables

variable "do_token" {
  description = "DigitalOcean API token"
  type        = string
  sensitive   = true
}

variable "ssh_key_ids" {
  description = "List of SSH key IDs for droplet access"
  type        = list(number)
}

variable "ssh_source_ips" {
  description = "Source IP addresses allowed for SSH access (CIDR notation)"
  type        = list(string)
  # Restrict to office/VPN IPs in production
}

variable "region" {
  description = "DigitalOcean region"
  type        = string
  default     = "sgp1"
}

variable "droplet_size" {
  description = "Droplet size for production"
  type        = string
  default     = "s-4vcpu-8gb"
}

variable "create_volume" {
  description = "Create separate volume for database data"
  type        = bool
  default     = true
}

variable "volume_size_gb" {
  description = "Size of data volume in GB"
  type        = number
  default     = 200
}

variable "create_dns_record" {
  description = "Whether to create DNS record"
  type        = bool
  default     = true
}

variable "domain_name" {
  description = "Domain name for DNS"
  type        = string
  default     = "insightpulseai.net"
}

variable "subdomain" {
  description = "Subdomain for Odoo"
  type        = string
  default     = "erp"
}

variable "enable_backups" {
  description = "Enable weekly automated backups"
  type        = bool
  default     = true
}

variable "project_id" {
  description = "DigitalOcean project ID"
  type        = string
  default     = ""
}

# Optional: Load balancer configuration
variable "create_load_balancer" {
  description = "Create a load balancer (for HA setup)"
  type        = bool
  default     = false
}

variable "ssl_certificate_name" {
  description = "Name of SSL certificate in DigitalOcean"
  type        = string
  default     = ""
}
