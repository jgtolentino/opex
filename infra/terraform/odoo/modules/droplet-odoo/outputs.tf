# InsightPulse Odoo - Terraform Module Outputs

output "droplet_id" {
  description = "The ID of the Odoo droplet"
  value       = digitalocean_droplet.odoo.id
}

output "droplet_name" {
  description = "The name of the Odoo droplet"
  value       = digitalocean_droplet.odoo.name
}

output "ipv4_address" {
  description = "The public IPv4 address of the droplet"
  value       = digitalocean_droplet.odoo.ipv4_address
}

output "ipv4_address_private" {
  description = "The private IPv4 address of the droplet"
  value       = digitalocean_droplet.odoo.ipv4_address_private
}

output "ipv6_address" {
  description = "The public IPv6 address of the droplet (if enabled)"
  value       = var.enable_ipv6 ? digitalocean_droplet.odoo.ipv6_address : null
}

output "droplet_urn" {
  description = "The URN of the droplet"
  value       = digitalocean_droplet.odoo.urn
}

output "volume_id" {
  description = "The ID of the data volume (if created)"
  value       = var.create_volume ? digitalocean_volume.odoo_data[0].id : null
}

output "volume_device_path" {
  description = "The device path of the attached volume (if created)"
  value       = var.create_volume ? digitalocean_volume_attachment.odoo_data[0].device_path : null
}

output "dns_fqdn" {
  description = "The FQDN of the DNS record (if created)"
  value       = var.create_dns_record ? "${var.subdomain}.${var.domain_name}" : null
}

output "ssh_command" {
  description = "SSH command to connect to the droplet"
  value       = "ssh root@${digitalocean_droplet.odoo.ipv4_address}"
}
