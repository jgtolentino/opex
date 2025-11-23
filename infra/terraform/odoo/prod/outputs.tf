# InsightPulse Odoo - Production Environment Outputs

output "droplet_ip" {
  description = "Production droplet public IP address"
  value       = module.odoo_production.ipv4_address
}

output "ssh_command" {
  description = "SSH command to connect to production"
  value       = module.odoo_production.ssh_command
  sensitive   = true  # Don't display in logs
}

output "production_url" {
  description = "Production Odoo URL"
  value       = var.create_dns_record ? "https://${var.subdomain}.${var.domain_name}" : "http://${module.odoo_production.ipv4_address}"
}

output "droplet_id" {
  description = "Production droplet ID"
  value       = module.odoo_production.droplet_id
}

output "volume_id" {
  description = "Data volume ID"
  value       = module.odoo_production.volume_id
}

output "volume_device_path" {
  description = "Data volume device path"
  value       = module.odoo_production.volume_device_path
}
