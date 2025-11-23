# InsightPulse Odoo - Staging Environment Variables

variable "do_token" {
  description = "DigitalOcean API token"
  type        = string
  sensitive   = true
}

variable "ssh_key_ids" {
  description = "List of SSH key IDs for droplet access"
  type        = list(number)
  # Get your SSH key IDs with: doctl compute ssh-key list
}

variable "ssh_source_ips" {
  description = "Source IP addresses allowed for SSH/Odoo access (CIDR notation)"
  type        = list(string)
  default     = ["0.0.0.0/0", "::/0"]  # Restrict in production
}

variable "region" {
  description = "DigitalOcean region"
  type        = string
  default     = "sgp1"
}

variable "droplet_size" {
  description = "Droplet size for staging"
  type        = string
  default     = "s-2vcpu-4gb"
}

variable "create_dns_record" {
  description = "Whether to create DNS record"
  type        = bool
  default     = false
}

variable "domain_name" {
  description = "Domain name for DNS"
  type        = string
  default     = "insightpulseai.net"
}

variable "project_id" {
  description = "DigitalOcean project ID"
  type        = string
  default     = ""
}
