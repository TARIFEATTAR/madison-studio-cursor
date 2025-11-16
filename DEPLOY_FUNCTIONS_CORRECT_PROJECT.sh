#!/bin/bash
# Deploy Stripe Edge Functions to CORRECT Project
# Project ID: likkskifwsrvszxdvufw

echo "🚀 Deploying Stripe Edge Functions to project: likkskifwsrvszxdvufw"

# Deploy create-checkout-session
echo "📦 Deploying create-checkout-session..."
supabase functions deploy create-checkout-session --project-ref likkskifwsrvszxdvufw

# Deploy create-portal-session
echo "📦 Deploying create-portal-session..."
supabase functions deploy create-portal-session --project-ref likkskifwsrvszxdvufw

# Deploy get-subscription
echo "📦 Deploying get-subscription..."
supabase functions deploy get-subscription --project-ref likkskifwsrvszxdvufw

# Deploy stripe-webhook
echo "📦 Deploying stripe-webhook..."
supabase functions deploy stripe-webhook --project-ref likkskifwsrvszxdvufw

echo "✅ All functions deployed!"
echo ""
echo "Next steps:"
echo "1. Go to: https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions"
echo "2. Verify all 4 functions are listed"
echo "3. Set STRIPE_SECRET_KEY in secrets"
echo "4. Test checkout flow"







