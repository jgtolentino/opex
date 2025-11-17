#!/bin/bash

# Complete Mattermost RAG Stack Setup Script
# CLI-only setup for Mattermost + RAG backend + Supabase Edge Functions

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
SUPABASE_PROJECT_REF="${SUPABASE_PROJECT_REF:-ublqmilcjtpnflofprkr}"
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

    # Check if required tools are available
    for cmd in curl jq; do
        if ! command -v $cmd &> /dev/null; then
            print_error "$cmd is required but not installed"
            exit 1
        fi
    done

    # Check if admin token is set
    if [[ -z "$MM_ADMIN_TOKEN" ]]; then
        print_error "MM_ADMIN_TOKEN environment variable is not set"
        print_info "Export your Mattermost admin token:"
        print_info "  export MM_ADMIN_TOKEN=your_admin_token_here"
        exit 1
    fi

    # Check if supabase CLI is available
    if ! command -v supabase &> /dev/null; then
        print_warning "Supabase CLI not found - some features will be skipped"
    fi

    print_success "Prerequisites check passed"
}

# Function to create Mattermost bot and channels
setup_mattermost_bot() {
    print_info "Setting up Mattermost bot and channels..."

    # Create bot (using API since mmctl might not be available)
    print_info "Creating RAG bot..."
    bot_response=$(curl -s -w "%{http_code}" -X POST \
        "$MM_SITE_URL/api/v4/bots" \
        -H "Authorization: Bearer $MM_ADMIN_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "username": "ragbot",
            "display_name": "RAG Assistant Bot",
            "description": "Internal RAG assistant for team chat"
        }')

    http_code="${bot_response: -3}"
    response_body="${bot_response%???}"

    if [[ "$http_code" == "201" ]]; then
        BOT_USER_ID=$(echo "$response_body" | jq -r '.user_id')
        print_success "Bot created (User ID: $BOT_USER_ID)"
    else
        print_warning "Bot may already exist or creation failed: HTTP $http_code"
        # Try to get existing bot
        existing_bot=$(curl -s \
            "$MM_SITE_URL/api/v4/bots" \
            -H "Authorization: Bearer $MM_ADMIN_TOKEN" | jq -r '.[] | select(.username=="ragbot") | .user_id')

        if [[ -n "$existing_bot" ]]; then
            BOT_USER_ID="$existing_bot"
            print_info "Using existing bot (User ID: $BOT_USER_ID)"
        else
            print_error "Failed to create or find bot"
            exit 1
        fi
    fi

    # Create bot token
    print_info "Creating bot token..."
    token_response=$(curl -s -w "%{http_code}" -X POST \
        "$MM_SITE_URL/api/v4/users/$BOT_USER_ID/tokens" \
        -H "Authorization: Bearer $MM_ADMIN_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "description": "RAG Bot Token"
        }')

    http_code="${token_response: -3}"
    response_body="${token_response%???}"

    if [[ "$http_code" == "201" ]]; then
        MM_BOT_TOKEN=$(echo "$response_body" | jq -r '.token')
        print_success "Bot token created"
    else
        print_warning "Token may already exist or creation failed: HTTP $http_code"
        # Try to get existing token
        existing_tokens=$(curl -s \
            "$MM_SITE_URL/api/v4/users/$BOT_USER_ID/tokens" \
            -H "Authorization: Bearer $MM_ADMIN_TOKEN")

        MM_BOT_TOKEN=$(echo "$existing_tokens" | jq -r '.[0].token // empty')
        if [[ -n "$MM_BOT_TOKEN" ]]; then
            print_info "Using existing bot token"
        else
            print_error "Failed to create or find bot token"
            exit 1
        fi
    fi

    # Create channels
    print_info "Creating channels..."

    # Create ask-ai channel
    channel_response=$(curl -s -w "%{http_code}" -X POST \
        "$MM_SITE_URL/api/v4/channels" \
        -H "Authorization: Bearer $MM_ADMIN_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "team_id": "insightpulaeai",
            "name": "ask-ai",
            "display_name": "Ask AI",
            "type": "O"
        }')

    http_code="${channel_response: -3}"
    response_body="${channel_response%???}"

    if [[ "$http_code" == "201" ]]; then
        ASK_AI_CHANNEL_ID=$(echo "$response_body" | jq -r '.id')
        print_success "Ask AI channel created (ID: $ASK_AI_CHANNEL_ID)"
    else
        print_warning "Channel may already exist or creation failed: HTTP $http_code"
        # Try to get existing channel
        existing_channel=$(curl -s \
            "$MM_SITE_URL/api/v4/teams/insightpulaeai/channels/name/ask-ai" \
            -H "Authorization: Bearer $MM_ADMIN_TOKEN")

        if echo "$existing_channel" | jq -e '.id' > /dev/null 2>&1; then
            ASK_AI_CHANNEL_ID=$(echo "$existing_channel" | jq -r '.id')
            print_info "Using existing Ask AI channel (ID: $ASK_AI_CHANNEL_ID)"
        else
            print_error "Failed to create or find Ask AI channel"
            exit 1
        fi
    fi

    # Add bot to channel
    print_info "Adding bot to Ask AI channel..."
    add_response=$(curl -s -w "%{http_code}" -X POST \
        "$MM_SITE_URL/api/v4/channels/$ASK_AI_CHANNEL_ID/members" \
        -H "Authorization: Bearer $MM_ADMIN_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"user_id\": \"$BOT_USER_ID\"}")

    http_code="${add_response: -3}"
    if [[ "$http_code" == "201" ]]; then
        print_success "Bot added to Ask AI channel"
    else
        print_warning "Bot may already be in channel: HTTP $http_code"
    fi

    # Export variables for later use
    export BOT_USER_ID
    export MM_BOT_TOKEN
    export ASK_AI_CHANNEL_ID
}

# Function to create slash command
setup_slash_command() {
    print_info "Setting up slash command..."

    # Get team ID
    team_response=$(curl -s \
        "$MM_SITE_URL/api/v4/teams/name/insightpulaeai" \
        -H "Authorization: Bearer $MM_ADMIN_TOKEN")

    TEAM_ID=$(echo "$team_response" | jq -r '.id')

    # Create slash command
    command_response=$(curl -s -w "%{http_code}" -X POST \
        "$MM_SITE_URL/api/v4/commands" \
        -H "Authorization: Bearer $MM_ADMIN_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"team_id\": \"$TEAM_ID\",
            \"trigger\": \"ask\",
            \"method\": \"P\",
            \"url\": \"https://mattermost-rag-egb6n.ondigitalocean.app/mm/ask\",
            \"display_name\": \"RAG Assistant\",
            \"description\": \"Ask the RAG assistant\",
            \"auto_complete\": true,
            \"auto_complete_desc\": \"Ask the AI assistant\",
            \"auto_complete_hint\": \"[question]\"
        }")

    http_code="${command_response: -3}"
    response_body="${command_response%???}"

    if [[ "$http_code" == "201" ]]; then
        SLASH_TOKEN=$(echo "$response_body" | jq -r '.token')
        print_success "Slash command created (Token: $SLASH_TOKEN)"
    else
        print_warning "Slash command may already exist or creation failed: HTTP $http_code"
        # Try to get existing command
        existing_commands=$(curl -s \
            "$MM_SITE_URL/api/v4/commands" \
            -H "Authorization: Bearer $MM_ADMIN_TOKEN")

        SLASH_TOKEN=$(echo "$existing_commands" | jq -r '.[] | select(.trigger=="ask") | .token // empty')
        if [[ -n "$SLASH_TOKEN" ]]; then
            print_info "Using existing slash command (Token: $SLASH_TOKEN)"
        else
            print_error "Failed to create or find slash command"
            exit 1
        fi
    fi

    export SLASH_TOKEN
}

# Function to setup webhooks
setup_webhooks() {
    print_info "Setting up webhooks..."

    # Create incoming webhook for alerts
    incoming_response=$(curl -s -w "%{http_code}" -X POST \
        "$MM_SITE_URL/api/v4/hooks/incoming" \
        -H "Authorization: Bearer $MM_ADMIN_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"channel_id\": \"$ASK_AI_CHANNEL_ID\",
            \"display_name\": \"RAG System Alerts\",
            \"description\": \"System alerts and notifications from RAG\"
        }")

    http_code="${incoming_response: -3}"
    response_body="${incoming_response%???}"

    if [[ "$http_code" == "201" ]]; then
        INCOMING_WEBHOOK_URL=$(echo "$response_body" | jq -r '.url')
        print_success "Incoming webhook created (URL: $INCOMING_WEBHOOK_URL)"
    else
        print_warning "Incoming webhook may already exist or creation failed: HTTP $http_code"
        # Try to get existing webhook
        existing_webhooks=$(curl -s \
            "$MM_SITE_URL/api/v4/hooks/incoming" \
            -H "Authorization: Bearer $MM_ADMIN_TOKEN")

        INCOMING_WEBHOOK_URL=$(echo "$existing_webhooks" | jq -r '.[] | select(.display_name=="RAG System Alerts") | .url // empty')
        if [[ -n "$INCOMING_WEBHOOK_URL" ]]; then
            print_info "Using existing incoming webhook (URL: $INCOMING_WEBHOOK_URL)"
        else
            print_error "Failed to create or find incoming webhook"
            exit 1
        fi
    fi

    # Create outgoing webhook for natural language queries
    outgoing_response=$(curl -s -w "%{http_code}" -X POST \
        "$MM_SITE_URL/api/v4/hooks/outgoing" \
        -H "Authorization: Bearer $MM_ADMIN_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"team_id\": \"insightpulaeai\",
            \"channel_id\": \"$ASK_AI_CHANNEL_ID\",
            \"display_name\": \"RAG Query Handler\",
            \"description\": \"Process RAG queries from Mattermost messages\",
            \"trigger_words\": [\"@opex\", \"@rag\", \"ask about\"],
            \"callback_urls\": [\"https://mattermost-rag-egb6n.ondigitalocean.app/mm/outgoing-webhook\"],
            \"content_type\": \"application/json\"
        }")

    http_code="${outgoing_response: -3}"
    response_body="${outgoing_response%???}"

    if [[ "$http_code" == "201" ]]; then
        OUTGOING_WEBHOOK_TOKEN=$(echo "$response_body" | jq -r '.token')
        print_success "Outgoing webhook created (Token: $OUTGOING_WEBHOOK_TOKEN)"
    else
        print_warning "Outgoing webhook may already exist or creation failed: HTTP $http_code"
        # Try to get existing webhook
        existing_outgoing=$(curl -s \
            "$MM_SITE_URL/api/v4/hooks/outgoing" \
            -H "Authorization: Bearer $MM_ADMIN_TOKEN")

        OUTGOING_WEBHOOK_TOKEN=$(echo "$existing_outgoing" | jq -r '.[] | select(.display_name=="RAG Query Handler") | .token // empty')
        if [[ -n "$OUTGOING_WEBHOOK_TOKEN" ]]; then
            print_info "Using existing outgoing webhook (Token: $OUTGOING_WEBHOOK_TOKEN)"
        else
            print_error "Failed to create or find outgoing webhook"
            exit 1
        fi
    fi

    export INCOMING_WEBHOOK_URL
    export OUTGOING_WEBHOOK_TOKEN
}

# Function to setup Supabase Edge Functions
setup_supabase_functions() {
    if ! command -v supabase &> /dev/null; then
        print_warning "Supabase CLI not available - skipping Edge Function setup"
        return
    fi

    print_info "Setting up Supabase Edge Functions..."

    # Deploy existing functions
    for function in opex-rag-query rag-feedback alert-notifier; do
        print_info "Deploying $function..."
        if supabase functions deploy $function --project-ref $SUPABASE_PROJECT_REF 2>/dev/null; then
            print_success "$function deployed successfully"
        else
            print_warning "Failed to deploy $function - may already be deployed"
        fi
    done

    # Set environment variables for alert-notifier to point to Mattermost
    if [[ -n "$INCOMING_WEBHOOK_URL" ]]; then
        print_info "Configuring alert-notifier webhook URL..."
        if supabase secrets set WEBHOOK_URL="$INCOMING_WEBHOOK_URL" --project-ref $SUPABASE_PROJECT_REF 2>/dev/null; then
            print_success "alert-notifier configured for Mattermost"
        else
            print_warning "Failed to set alert-notifier webhook URL"
        fi
    fi
}

# Function to update environment files
update_environment_files() {
    print_info "Updating environment files..."

    local env_file="$PROJECT_ROOT/.env"
    local env_example_file="$PROJECT_ROOT/.env.example"

    # Create backup of existing files
    if [[ -f "$env_file" ]]; then
        cp "$env_file" "$env_file.backup.$(date +%s)"
    fi
    if [[ -f "$env_example_file" ]]; then
        cp "$env_example_file" "$env_example_file.backup.$(date +%s)"
    fi

    # Update .env file
    if [[ -f "$env_file" ]]; then
        # Remove existing Mattermost variables
        sed -i.bak '/^MM_/d' "$env_file"

        # Add new variables
        cat >> "$env_file" << EOF

# Mattermost Configuration
MM_SITE_URL=$MM_SITE_URL
MM_BOT_TOKEN=$MM_BOT_TOKEN
MM_SLASH_TOKEN=$SLASH_TOKEN
MM_INCOMING_WEBHOOK_URL=$INCOMING_WEBHOOK_URL
MM_OUTGOING_WEBHOOK_TOKEN=$OUTGOING_WEBHOOK_TOKEN
EOF

        print_success "Updated $env_file"
    fi

    # Update .env.example file
    if [[ -f "$env_example_file" ]]; then
        # Remove existing Mattermost variables
        sed -i.bak '/^MM_/d' "$env_example_file"

        # Add new variables
        cat >> "$env_example_file" << EOF

# Mattermost Configuration
MM_SITE_URL=
MM_BOT_TOKEN=
MM_SLASH_TOKEN=
MM_INCOMING_WEBHOOK_URL=
MM_OUTGOING_WEBHOOK_TOKEN=
EOF

        print_success "Updated $env_example_file"
    fi

    # Clean up backup files
    rm -f "$env_file.bak" "$env_example_file.bak" 2>/dev/null || true
}

# Function to test the setup
test_setup() {
    print_info "Testing the setup..."

    # Test incoming webhook
    if [[ -n "$INCOMING_WEBHOOK_URL" ]]; then
        print_info "Testing incoming webhook..."
        test_response=$(curl -s -w "%{http_code}" -X POST \
            "$INCOMING_WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d '{
                "text": "✅ RAG system setup complete! Bot is ready for queries.",
                "username": "RAG Setup",
                "icon_url": "https://example.com/success.png"
            }')

        http_code="${test_response: -3}"
        if [[ "$http_code" == "200" ]]; then
            print_success "Incoming webhook test passed"
        else
            print_warning "Incoming webhook test returned HTTP $http_code (may still be working)"
        fi
    fi

    print_success "Setup testing completed"
}

# Main setup function
setup_complete_stack() {
    print_info "Starting complete Mattermost RAG stack setup..."

    # Check prerequisites
    check_prerequisites

    # Setup Mattermost components
    setup_mattermost_bot
    setup_slash_command
    setup_webhooks

    # Setup Supabase Edge Functions
    setup_supabase_functions

    # Update environment files
    update_environment_files

    # Test the setup
    test_setup

    print_success "Complete Mattermost RAG stack setup completed!"

    # Print summary
    echo
    print_info "Setup Summary:"
    echo "  - Bot User ID: $BOT_USER_ID"
    echo "  - Bot Token: $MM_BOT_TOKEN"
    echo "  - Slash Command Token: $SLASH_TOKEN"
    echo "  - Incoming Webhook URL: $INCOMING_WEBHOOK_URL"
    echo "  - Outgoing Webhook Token: $OUTGOING_WEBHOOK_TOKEN"
    echo "  - Environment files updated"
    echo
    print_info "Next steps:"
    echo "  1. Deploy the updated RAG service"
    echo "  2. Test slash command: /ask 'How do I process expenses?'"
    echo "  3. Test natural language: @opex what are the BIR deadlines?"
    echo "  4. Monitor webhook performance"
}

# Function to show usage
usage() {
    echo "Usage: $0 [command]"
    echo
    echo "Commands:"
    echo "  setup     - Set up complete Mattermost RAG stack (default)"
    echo "  help      - Show this help message"
    echo
    echo "Environment variables:"
    echo "  MM_SITE_URL          - Mattermost instance URL (default: https://chat.insightpulseai.net)"
    echo "  MM_ADMIN_TOKEN       - Mattermost admin access token (required)"
    echo "  SUPABASE_PROJECT_REF - Supabase project reference (default: ublqmilcjtpnflofprkr)"
}

# Parse command line arguments
case "${1:-setup}" in
    "setup")
        setup_complete_stack
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
