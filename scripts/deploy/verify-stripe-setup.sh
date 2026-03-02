#!/bin/bash

# Stripe Payment System Verification Script
# This script verifies the codebase setup for Stripe integration

echo "🔍 Stripe Payment System Verification"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $2"
        return 0
    else
        echo -e "${RED}❌${NC} $2 - File not found: $1"
        ((ERRORS++))
        return 1
    fi
}

# Function to check if directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅${NC} $2"
        return 0
    else
        echo -e "${RED}❌${NC} $2 - Directory not found: $1"
        ((ERRORS++))
        return 1
    fi
}

# Function to check if file contains string
check_contains() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✅${NC} $3"
        return 0
    else
        echo -e "${RED}❌${NC} $3 - Not found in $1"
        ((ERRORS++))
        return 1
    fi
}

echo "📁 CODE VERIFICATION"
echo "-------------------"

# Check Edge Functions
echo ""
echo "Edge Functions:"
check_dir "supabase/functions/create-checkout-session" "create-checkout-session function"
check_file "supabase/functions/create-checkout-session/index.ts" "  └─ index.ts"
check_contains "supabase/functions/create-checkout-session/index.ts" "STRIPE_SECRET_KEY" "  └─ Uses STRIPE_SECRET_KEY"

check_dir "supabase/functions/create-portal-session" "create-portal-session function"
check_file "supabase/functions/create-portal-session/index.ts" "  └─ index.ts"
check_contains "supabase/functions/create-portal-session/index.ts" "STRIPE_SECRET_KEY" "  └─ Uses STRIPE_SECRET_KEY"

check_dir "supabase/functions/stripe-webhook" "stripe-webhook function"
check_file "supabase/functions/stripe-webhook/index.ts" "  └─ index.ts"
check_contains "supabase/functions/stripe-webhook/index.ts" "STRIPE_SECRET_KEY" "  └─ Uses STRIPE_SECRET_KEY"
check_contains "supabase/functions/stripe-webhook/index.ts" "STRIPE_WEBHOOK_SECRET" "  └─ Uses STRIPE_WEBHOOK_SECRET"

check_dir "supabase/functions/get-subscription" "get-subscription function"
check_file "supabase/functions/get-subscription/index.ts" "  └─ index.ts"

# Check Frontend
echo ""
echo "Frontend Components:"
check_file "src/components/settings/BillingTab.tsx" "BillingTab.tsx"
check_file "src/config/subscriptionTiers.ts" "subscriptionTiers.ts"

# Check Database Migrations
echo ""
echo "Database Migrations:"
check_file "supabase/migrations/20251105103711_add_billing_tables.sql" "Billing tables migration"
check_file "supabase/migrations/20251105120000_update_madison_pricing_tiers.sql" "Pricing tiers migration"

# Check Configuration Files
echo ""
echo "Configuration Files:"
check_file "update_stripe_price_ids.sql" "Price IDs update script"

# Check for Price IDs in update script
echo ""
echo "Price IDs Configuration:"
if grep -q "price_1SQ" "update_stripe_price_ids.sql" 2>/dev/null; then
    echo -e "${GREEN}✅${NC} Atelier Price IDs configured"
else
    echo -e "${YELLOW}⚠️${NC}  Atelier Price IDs may need verification"
    ((WARNINGS++))
fi

if grep -q "price_1SQLg" "update_stripe_price_ids.sql" 2>/dev/null; then
    echo -e "${GREEN}✅${NC} Studio Price IDs configured"
else
    echo -e "${YELLOW}⚠️${NC}  Studio Price IDs may need verification"
    ((WARNINGS++))
fi

if grep -q "price_1SQLi" "update_stripe_price_ids.sql" 2>/dev/null; then
    echo -e "${GREEN}✅${NC} Maison Price IDs configured"
else
    echo -e "${YELLOW}⚠️${NC}  Maison Price IDs may need verification"
    ((WARNINGS++))
fi

# Check for placeholder Price IDs (add-ons)
if grep -q "price_xxxxx" "update_stripe_price_ids.sql" 2>/dev/null; then
    echo -e "${YELLOW}⚠️${NC}  Add-on Price IDs still have placeholders (optional)"
    ((WARNINGS++))
fi

echo ""
echo "========================================"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ CODE VERIFICATION: PASSED${NC}"
    echo ""
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC} (non-critical)"
        echo ""
    fi
    echo "📋 NEXT STEPS (Manual Verification Required):"
    echo ""
    echo "1. Database Check:"
    echo "   → Run verify-stripe-status.sql in Supabase SQL Editor"
    echo ""
    echo "2. Edge Functions Deployment:"
    echo "   → Visit: https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions"
    echo "   → Verify all 4 functions are deployed"
    echo ""
    echo "3. Supabase Secrets:"
    echo "   → Visit: https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/settings/functions"
    echo "   → Verify: STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET are set"
    echo ""
    echo "4. Stripe Webhook:"
    echo "   → Visit: https://dashboard.stripe.com/test/webhooks"
    echo "   → Verify webhook endpoint exists"
    echo ""
    echo "5. Test:"
    echo "   → Visit: http://localhost:5173/settings?tab=billing"
    echo ""
    exit 0
else
    echo -e "${RED}❌ CODE VERIFICATION: FAILED${NC}"
    echo -e "${RED}   Errors found: $ERRORS${NC}"
    echo ""
    exit 1
fi












