#!/bin/bash
# Deploy Stripe Edge Functions to Supabase
# Run this script after logging in: supabase login

echo "🚀 Deploying Stripe Edge Functions..."

# Deploy create-checkout-session
echo "📦 Deploying create-checkout-session..."
supabase functions deploy create-checkout-session --project-ref iflwjiwkbxuvmiviqdxv

# Deploy create-portal-session
echo "📦 Deploying create-portal-session..."
supabase functions deploy create-portal-session --project-ref iflwjiwkbxuvmiviqdxv

# Deploy get-subscription
echo "📦 Deploying get-subscription..."
supabase functions deploy get-subscription --project-ref iflwjiwkbxuvmiviqdxv

# Deploy stripe-webhook
echo "📦 Deploying stripe-webhook..."
supabase functions deploy stripe-webhook --project-ref iflwjiwkbxuvmiviqdxv

echo "✅ All functions deployed!"
echo ""
echo "Next steps:"
echo "1. Verify functions appear in Supabase Dashboard"
echo "2. Set STRIPE_SECRET_KEY in Supabase secrets"
echo "3. Test checkout flow"







