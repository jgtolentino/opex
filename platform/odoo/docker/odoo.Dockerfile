# InsightPulse Odoo 18 CE - Production Image
# Based on official Odoo image with IPAI custom addons baked in

FROM odoo:18.0

# Metadata
LABEL maintainer="InsightPulse AI <devops@insightpulseai.net>"
LABEL description="Odoo 18 CE with IPAI custom addons for TBWA operations"
LABEL version="1.0"

# Switch to root for installation
USER root

# Install system dependencies for custom modules
RUN apt-get update && apt-get install -y \
    # Python build dependencies
    python3-dev \
    build-essential \
    # Image processing (for OCR module)
    tesseract-ocr \
    tesseract-ocr-eng \
    # PDF processing
    poppler-utils \
    # Utilities
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN pip3 install --upgrade pip setuptools wheel

# Install Python dependencies for IPAI modules
COPY requirements.txt /tmp/requirements.txt
RUN pip3 install --no-cache-dir -r /tmp/requirements.txt

# Copy IPAI custom addons into image
COPY ./addons /mnt/ipai-addons/

# Set up addons path to include both default and custom addons
ENV ADDONS_PATH="/mnt/extra-addons,/mnt/ipai-addons"

# Create directory for logs
RUN mkdir -p /var/log/odoo && chown odoo:odoo /var/log/odoo

# Switch back to odoo user for runtime
USER odoo

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8069/web/health || exit 1

# Default command (can be overridden in docker-compose)
CMD ["odoo", "--logfile=/var/log/odoo/odoo.log"]
