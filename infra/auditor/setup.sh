#!/bin/bash
# InfraAuditor Setup Script
# Installs required CLI tools and Python dependencies

set -e

echo "=========================================="
echo "InfraAuditor Setup"
echo "=========================================="
echo ""

# Detect OS
OS="unknown"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
fi

echo "Detected OS: $OS"
echo ""

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt
echo "✓ Python dependencies installed"
echo ""

# Check for doctl
echo "Checking for doctl (DigitalOcean CLI)..."
if command -v doctl &> /dev/null; then
    echo "✓ doctl is already installed"
    doctl version
else
    echo "✗ doctl not found"
    echo ""
    echo "To install doctl:"
    if [[ "$OS" == "macos" ]]; then
        echo "  brew install doctl"
    elif [[ "$OS" == "linux" ]]; then
        echo "  cd ~"
        echo "  wget https://github.com/digitalocean/doctl/releases/download/v1.98.1/doctl-1.98.1-linux-amd64.tar.gz"
        echo "  tar xf ~/doctl-1.98.1-linux-amd64.tar.gz"
        echo "  sudo mv ~/doctl /usr/local/bin"
    fi
    echo ""
    echo "After installing, authenticate with:"
    echo "  doctl auth init"
fi
echo ""

# Check for supabase
echo "Checking for supabase CLI..."
if command -v supabase &> /dev/null; then
    echo "✓ supabase is already installed"
    supabase --version
else
    echo "✗ supabase not found"
    echo ""
    echo "To install supabase CLI:"
    if [[ "$OS" == "macos" ]]; then
        echo "  brew install supabase/tap/supabase"
    else
        echo "  npm install -g supabase"
    fi
    echo ""
    echo "After installing, authenticate with:"
    echo "  supabase login"
fi
echo ""

# Check for psql
echo "Checking for psql (PostgreSQL client)..."
if command -v psql &> /dev/null; then
    echo "✓ psql is already installed"
    psql --version
else
    echo "✗ psql not found"
    echo ""
    echo "To install PostgreSQL client:"
    if [[ "$OS" == "macos" ]]; then
        echo "  brew install postgresql"
    elif [[ "$OS" == "linux" ]]; then
        echo "  # Ubuntu/Debian:"
        echo "  sudo apt-get install postgresql-client"
        echo ""
        echo "  # Fedora/RHEL:"
        echo "  sudo dnf install postgresql"
    fi
fi
echo ""

# Make scripts executable
echo "Making scripts executable..."
chmod +x infra_auditor.py
chmod +x dns_auditor.py
chmod +x supabase_auditor.py
echo "✓ Scripts are now executable"
echo ""

# Create config directory if it doesn't exist
mkdir -p config

echo "=========================================="
echo "Setup Summary"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Copy and customize your config:"
echo "   cp config/infra_spec.example.yaml config/infra_spec.yaml"
echo ""
echo "2. Authenticate with services:"
echo "   doctl auth init"
echo "   supabase login"
echo ""
echo "3. Run an audit:"
echo "   python infra_auditor.py --audit-only"
echo ""
echo "See README.md for full documentation."
