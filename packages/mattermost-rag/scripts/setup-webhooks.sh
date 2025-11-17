#!/bin/bash

# Mattermost Webhook Setup Script
# This script helps configure Mattermost webhooks via CLI

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MM_SITE_URL="${MM_SITE_URL:-https://chat.insightpulseai.net}"
MM_ADMIN_TOKEN="${MM_ADMIN_TOKEN}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."

    # Check if curl is available
    if ! command -v curl &> /dev/null; then
        print_error "curl is required but not installed"
        exit 1
    fi

    # Check if jq is available
    if ! command -v jq &> /dev/null; then
        print_error "jq is required but not installed"
        exit 1
    fi

    # Check if admin token is set
    if [[ -z "$MM_ADMIN_TOKEN" ]]; then
        print_error "MM_ADMIN_TOKEN environment variable is not set"
        print_info "Export your Mattermost admin token:"
        print_info "  export MM_ADMIN_TOKEN=your_admin_token_here"
        exit 1
    fi

    print_success "Prerequisites check passed"
}

# Function to create channel
create_channel() {
    local channel_name="$1"
    local display_name="$2"

    print_info "Creating channel: $channel_name"

    response=$(curl -s -w "%{http_code}" -X POST \
        "$MM_SITE_URL/api/v4/channels" \
        -H "Authorization: Bearer $MM_ADMIN_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"team_id\": \"insightpulaeai\",
            \"name\": \"$channel_name\",
            \"display_name\": \"$display_name\",
            \"type\": \"O\"
        }")

    http_code="${response: -3}"
    response_body="${response%???}"

    if [[ "$http_code" == "201" ]]; then
        channel_id=$(echo "$response_body" | jq -r '.id')
        print_success "Channel created: $channel_name (ID: $channel_id)"
        echo "$channel_id"
    else
        print_warning "Channel may already exist or creation failed: HTTP $http_code"
        # Try to get existing channel ID
        existing_channel=$(curl -s \
            "$MM_SITE_URL/api/v4/teams/insightpulaeai/channels/name/$channel_name" \
            -H "Authorization: Bearer $MM_ADMIN_TOKEN")

        if echo "$existing_channel" | jq -e '.id' > /dev/null 2>&1; then
            channel_id=$(echo "$existing_channel" | jq -r '.id')
            print_info "Using existing channel: $channel_name (ID: $channel_id)"
            echo "$channel_id"
        else
            print_error "Failed to create or find channel: $channel_name"
            exit 1
        fi
    fi
}

# Function to create incoming webhook
create_incoming_webhook() {
    local channel_id="$1"

    print_info "Creating incoming webhook..."

    response=$(curl -s -w "%{http_code}" -X POST \
        "$MM_SITE_URL/api/v4/hooks/incoming" \
        -H "Authorization: Bearer $MM_ADMIN_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"channel_id\": \"$channel_id\",
            \"display_name\": \"OpEx RAG Notifications\",
            \"description\": \"Send notifications from RAG system to Mattermost\"
        }")

    http_code="${response: -3}"
    response_body="${response%???}"

    if [[ "$http_code" == "201" ]]; then
        webhook_url=$(echo "$response_body" | jq -r '.url')
        webhook_id=$(echo "$response_body" | jq -r '.id')
        print_success "Incoming webhook created (ID: $webhook_id)"
        echo "$webhook_url"
    else
        print_error "Failed to create incoming webhook: HTTP $http_code"
        exit 1
    fi
}

# Function to create outgoing webhook
create_outgoing_webhook() {
    local channel_id="$1"
    local callback_url="$2"

    print_info "Creating outgoing webhook..."

    response=$(curl -s -w "%{http_code}" -X POST \
        "$MM_SITE_URL/api/v4/hooks/outgoing" \
        -H "Authorization: Bearer $MM_ADMIN_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"team_id\": \"insightpulaeai\",
            \"channel_id\": \"$channel_id\",
            \"display_name\": \"OpEx RAG Query Handler\",
            \"description\": \"Process RAG queries from Mattermost messages\",
            \"trigger_words\": [\"@opex\", \"@rag\", \"ask about\"],
            \"callback_urls\": [\"$callback_url\"],
            \"content_type\": \"application/json\"
        }")

    http_code="${response: -3}"
    response_body="${response%???}"

    if [[ "$http_code" == "201" ]]; then
        webhook_token=$(echo "$response_body" | jq -r '.token')
        webhook_id=$(echo "$response_body" | jq -r '.id')
        print_success "Outgoing webhook created (ID: $webhook_id)"
        echo "$webhook_token"
    else
        print_error "Failed to create outgoing webhook: HTTP $http_code"
        exit 1
    fi
}

# Function to update environment file
update_env_file() {
    local incoming_webhook_url="$1"
    local outgoing_webhook_token="$2"

    local env_file="$PROJECT_ROOT/.env"
    local env_example_file="$PROJECT_ROOT/.env.example"

    print_info "Updating environment files..."

    # Update .env file
    if [[ -f "$env_file" ]]; then
        # Remove existing webhook variables
        sed -i.bak '/^MM_INCOMING_WEBHOOK_URL=/d' "$env_file"
        sed -i.bak '/^MM_OUTGOING_WEBHOOK_TOKEN=/d' "$env_file"

        # Add new webhook variables
        echo "MM_INCOMING_WEBHOOK_URL=$incoming_webhook_url" >> "$env_file"
        echo "MM_OUTGOING_WEBHOOK_TOKEN=$outgoing_webhook_token" >> "$env_file"

        print_success "Updated $env_file"
    fi

    # Update .env.example file
    if [[ -f "$env_example_file" ]]; then
        # Remove existing webhook variables
        sed -i.bak '/^MM_INCOMING_WEBHOOK_URL=/d' "$env_example_file"
        sed -i.bak '/^MM_OUTGOING_WEBHOOK_TOKEN=/d' "$env_example_file"

        # Add new webhook variables
        echo "MM_INCOMING_WEBHOOK_URL=" >> "$env_example_file"
        echo "MM_OUTGOING_WEBHOOK_TOKEN=" >> "$env_example_file"

        print_success "Updated $env_example_file"
    fi

    # Clean up backup files
    rm -f "$env_file.bak" "$env_example_file.bak" 2>/dev/null || true
}

# Function to test webhooks
test_webhooks() {
    local incoming_webhook_url="$1"

    print_info "Testing incoming webhook..."

    test_response=$(curl -s -w "%{http_code}" -X POST \
        "$incoming_webhook_url" \
        -H "Content-Type: application/json" \
        -d '{
            "text": "✅ Webhook test successful! RAG system webhooks are configured and working.",
            "username": "OpEx RAG Setup",
            "icon_url": "https://example.com/success.png"
        }')

    http_code="${test_response: -3}"

    if [[ "$http_code" == "200" ]]; then
        print_success "Incoming webhook test passed"
    else
        print_warning "Incoming webhook test returned HTTP $http_code (may still be working)"
    fi
}

# Main setup function
setup_webhooks() {
    print_info "Starting Mattermost webhook setup..."

    # Check prerequisites
    check_prerequisites

    # Create channels
    local alerts_channel_id=$(create_channel "opex-rag-alerts" "OpEx RAG Alerts")
    local general_channel_id=$(create_channel "general" "General")

    # Create webhooks
    local incoming_webhook_url=$(create_incoming_webhook "$alerts_channel_id")
    local outgoing_webhook_token=$(create_outgoing_webhook "$general_channel_id" "https://mattermost-rag-egb6n.ondigitalocean.app/mm/outgoing-webhook")

    # Update environment files
    update_env_file "$incoming_webhook_url" "$outgoing_webhook_token"

    # Test webhooks
    test_webhooks "$incoming_webhook_url"

    print_success "Mattermost webhook setup completed!"

    # Print summary
    echo
    print_info "Setup Summary:"
    echo "  - Incoming Webhook URL: $incoming_webhook_url"
    echo "  - Outgoing Webhook Token: $outgoing_webhook_token"
    echo "  - Environment files updated"
    echo
    print_info "Next steps:"
    echo "  1. Deploy the updated RAG service"
    echo "  2. Test natural language queries in Mattermost"
    echo "  3. Monitor webhook performance"
}

# Function to show usage
usage() {
    echo "Usage: $0 [command]"
    echo
    echo "Commands:"
    echo "  setup     - Set up Mattermost webhooks (default)"
    echo "  test      - Test existing webhooks"
    echo "  help      - Show this help message"
    echo
    echo "Environment variables:"
    echo "  MM_SITE_URL      - Mattermost instance URL (default: https://chat.insightpulseai.net)"
    echo "  MM_ADMIN_TOKEN   - Mattermost admin access token (required)"
}

# Function to test existing webhooks
test_existing_webhooks() {
    check_prerequisites

    local incoming_webhook_url=$(grep "MM_INCOMING_WEBHOOK_URL" "$PROJECT_ROOT/.env" 2>/dev/null | cut -d '=' -f2-)

    if [[ -z "$incoming_webhook_url" ]]; then
        print_error "No incoming webhook URL found in .env file"
        exit 1
    fi

    test_webhooks "$incoming_webhook_url"
}

# Parse command line arguments
case "${1:-setup}" in
    "setup")
        setup_webhooks
        ;;
    "test")
        test_existing_webhooks
        ;;
    "help"|"-h"|"--help")
        usage
        ;;
    *)
        print_error "Unknown command: $1"
        usage
        exit 1
        ;;
esac
