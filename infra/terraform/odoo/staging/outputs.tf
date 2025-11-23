# InsightPulse Odoo - Staging Environment Outputs

output "droplet_ip" {
  description = "Staging droplet public IP address"
  value       = module.odoo_staging.ipv4_address
}

output "ssh_command" {
  description = "SSH command to connect to staging"
  value       = module.odoo_staging.ssh_command
}

output "staging_url" {
  description = "Staging Odoo URL"
  value       = var.create_dns_record ? "https://odoo-staging.${var.domain_name}" : "http://${module.odoo_staging.ipv4_address}:8069"
}

output "droplet_id" {
  description = "Staging droplet ID"
  value       = module.odoo_staging.droplet_id
}
