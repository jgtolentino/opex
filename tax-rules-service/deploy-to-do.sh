#!/bin/bash

# Odoo T&E + PH Tax Copilot Deployment Script
# Deploys tax rules service to DigitalOcean droplet

set -e

echo "🚀 Deploying Odoo T&E + PH Tax Copilot to DigitalOcean..."

# Configuration
DROPLET_IP="188.166.237.231"  # OCR service droplet
SERVICE_DOMAIN="tax.insightpulseai.net"
ODOO_DOMAIN="erp.insightpulseai.net"

echo "📦 Building and deploying tax rules service..."

# Build Docker image
echo "Building Docker image..."
docker build -t tax-rules-service:latest .

# Tag and push to registry (if using DO Container Registry)
# docker tag tax-rules-service:latest registry.digitalocean.com/your-registry/tax-rules-service:latest
# docker push registry.digitalocean.com/your-registry/tax-rules-service:latest

echo "📋 Creating deployment configuration..."

# Create production Caddyfile
cat > Caddyfile.prod << EOF
${SERVICE_DOMAIN} {
	encode gzip

	# Reverse proxy to tax rules service
	reverse_proxy tax_rules_service:8000

	@healthcheck path /health
	handle @healthcheck {
		respond "ok" 200
	}

	# Logging
	log {
		output file /var/log/caddy/tax_access.log
		format single_field common_log
	}
}
EOF

echo "🔧 Creating production docker-compose file..."

# Create production docker-compose
cat > docker-compose.prod.yml << EOF
version: '3.8'

services:
  tax_rules_service:
    image: tax-rules-service:latest
    container_name: tax_rules_service
    restart: unless-stopped
    environment:
      - PYTHONPATH=/app
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - tax_network

  caddy:
    image: caddy:2-alpine
    container_name: tax_caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile.prod:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - tax_rules_service
    networks:
      - tax_network

volumes:
  caddy_data:
  caddy_config:

networks:
  tax_network:
    driver: bridge
EOF

echo "📤 Deploying to DigitalOcean droplet..."

# Copy files to droplet (you'll need SSH access configured)
echo "Copying deployment files to droplet..."
scp -r ./* root@${DROPLET_IP}:/opt/tax-rules-service/

echo "🔄 Starting services on droplet..."
ssh root@${DROPLET_IP} "cd /opt/tax-rules-service && docker-compose -f docker-compose.prod.yml up -d"

echo "✅ Deployment complete!"
echo ""
echo "📊 Service Information:"
echo "   - Tax Rules Service: https://${SERVICE_DOMAIN}"
echo "   - Health Check: https://${SERVICE_DOMAIN}/health"
echo "   - Odoo Integration: ${ODOO_DOMAIN}"
echo ""
echo "🔍 To check service status:"
echo "   ssh root@${DROPLET_IP} 'cd /opt/tax-rules-service && docker-compose ps'"
echo ""
echo "📝 Next steps:"
echo "   1. Configure DNS for ${SERVICE_DOMAIN} to point to ${DROPLET_IP}"
echo "   2. Deploy Supabase Edge Functions"
echo "   3. Implement Odoo connector module"
echo "   4. Configure n8n workflows"
