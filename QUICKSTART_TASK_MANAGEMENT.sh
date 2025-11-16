#!/bin/bash
# ==============================================================================
# OpEx Task Management System - Quick Deployment Script
# Run this to deploy the entire system in one go
# ==============================================================================

set -e  # Exit on error

echo "🚀 OpEx Task Management System - Deployment Script"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ==============================================================================
# Step 1: Verify Prerequisites
# ==============================================================================

echo -e "${YELLOW}Step 1: Verifying prerequisites...${NC}"

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found!${NC}"
    echo "Install it with: npm install -g supabase"
    exit 1
fi

echo -e "${GREEN}✅ Supabase CLI found${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Make sure you have SUPABASE_URL configured.${NC}"
fi

echo ""

# ==============================================================================
# Step 2: Link to Supabase Project
# ==============================================================================

echo -e "${YELLOW}Step 2: Linking to Supabase project...${NC}"

# Check if already linked
if [ -f .git/config ] && grep -q "supabase" .git/config 2>/dev/null; then
    echo -e "${GREEN}✅ Already linked to Supabase project${NC}"
else
    echo "Please enter your Supabase project reference (found in Supabase Dashboard → Settings → General):"
    read -p "Project Ref: " PROJECT_REF
    supabase link --project-ref "$PROJECT_REF"
fi

echo ""

# ==============================================================================
# Step 3: Run Database Migration
# ==============================================================================

echo -e "${YELLOW}Step 3: Running database migration...${NC}"

supabase db push

echo -e "${GREEN}✅ Migration completed${NC}"
echo ""

# ==============================================================================
# Step 4: Load Seed Data
# ==============================================================================

echo -e "${YELLOW}Step 4: Loading seed data...${NC}"

supabase db execute --file supabase/seed_task_management.sql

echo -e "${GREEN}✅ Seed data loaded${NC}"
echo ""

# ==============================================================================
# Step 5: Deploy Edge Functions
# ==============================================================================

echo -e "${YELLOW}Step 5: Deploying edge functions...${NC}"

# Deploy task scheduler
echo "Deploying opex-task-scheduler..."
supabase functions deploy opex-task-scheduler

echo -e "${GREEN}✅ Task scheduler deployed${NC}"

# Deploy task notifications
echo "Deploying opex-task-notifications..."

# Check if ROCKETCHAT_WEBHOOK_URL is set
echo ""
echo "Do you have a Rocket.Chat webhook URL? (y/n)"
read -p "> " HAS_WEBHOOK

if [ "$HAS_WEBHOOK" = "y" ]; then
    echo "Please enter your Rocket.Chat webhook URL:"
    read -p "Webhook URL: " WEBHOOK_URL
    supabase secrets set ROCKETCHAT_WEBHOOK_URL="$WEBHOOK_URL"
    echo -e "${GREEN}✅ Rocket.Chat webhook configured${NC}"
fi

supabase functions deploy opex-task-notifications

echo -e "${GREEN}✅ Task notifications deployed${NC}"
echo ""

# ==============================================================================
# Step 6: Test Deployment
# ==============================================================================

echo -e "${YELLOW}Step 6: Testing deployment...${NC}"

# Get project URL
PROJECT_URL=$(supabase status | grep "API URL" | awk '{print $3}')
ANON_KEY=$(supabase status | grep "anon key" | awk '{print $3}')

echo ""
echo "Testing task scheduler (dry run)..."

curl -s -X POST \
  "$PROJECT_URL/functions/v1/opex-task-scheduler" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"days_ahead": 30}' | jq '.'

echo ""
echo -e "${GREEN}✅ Task scheduler test completed${NC}"

echo ""
echo "Testing task notifications (dry run)..."

curl -s -X POST \
  "$PROJECT_URL/functions/v1/opex-task-notifications" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"days_ahead": 7, "dry_run": true}' | jq '.'

echo ""
echo -e "${GREEN}✅ Task notifications test completed${NC}"

# ==============================================================================
# Step 7: Set Up Cron Jobs (Optional)
# ==============================================================================

echo ""
echo -e "${YELLOW}Step 7: Set up automated cron jobs? (y/n)${NC}"
read -p "> " SETUP_CRON

if [ "$SETUP_CRON" = "y" ]; then
    echo "Setting up daily task scheduler (runs at 3 AM)..."
    supabase functions schedule create \
      --function-name opex-task-scheduler \
      --schedule "0 3 * * *" \
      --payload '{"days_ahead": 90}'

    echo -e "${GREEN}✅ Task scheduler cron job created${NC}"

    echo "Setting up daily notifications (runs at 8 AM)..."
    supabase functions schedule create \
      --function-name opex-task-notifications \
      --schedule "0 8 * * *" \
      --payload '{"days_ahead": 7, "include_overdue": true}'

    echo -e "${GREEN}✅ Task notifications cron job created${NC}"
fi

# ==============================================================================
# Deployment Complete
# ==============================================================================

echo ""
echo "=================================================="
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "=================================================="
echo ""
echo "What was deployed:"
echo "  ✅ 7 database tables (opex_teams, opex_users, opex_tasks, etc.)"
echo "  ✅ 2 helper functions (opex_get_upcoming_tasks, opex_get_compliance_health)"
echo "  ✅ Seed data (5 teams, 4 users, 5 recurring tasks)"
echo "  ✅ Task scheduler edge function"
echo "  ✅ Task notifications edge function"
if [ "$SETUP_CRON" = "y" ]; then
echo "  ✅ Automated cron jobs (daily at 3 AM and 8 AM)"
fi
echo ""
echo "Next steps:"
echo "  1. Review deployment: supabase db status"
echo "  2. View edge function logs: supabase functions logs opex-task-scheduler"
echo "  3. Build frontend dashboard (see TASK_MANAGEMENT_DEPLOYMENT.md)"
echo "  4. Integrate with OpEx Portal"
echo ""
echo "Documentation:"
echo "  📄 TASK_MANAGEMENT_DEPLOYMENT.md - Full deployment guide"
echo "  📄 TASK_MANAGEMENT_SUMMARY.md - Feature overview"
echo "  📄 lib/types/tasks.ts - TypeScript types for frontend"
echo ""
echo "To verify deployment, run:"
echo "  supabase db status"
echo "  supabase functions list"
echo ""
echo -e "${GREEN}Happy automating! 🚀${NC}"
