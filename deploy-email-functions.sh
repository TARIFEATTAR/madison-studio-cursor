#!/bin/bash

# Deploy Email Functions After Domain Setup
# Run this AFTER you've set up your custom domain in Resend and added EMAIL_FROM to Supabase

echo "🚀 Deploying email functions with updated sender configuration..."
echo ""

# Check if logged in to Supabase
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase CLI"
    echo "Run: supabase login"
    exit 1
fi

echo "📧 Deploying send-report-email function..."
supabase functions deploy send-report-email

echo ""
echo "📧 Deploying send-team-invitation function..."
supabase functions deploy send-team-invitation

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Verify EMAIL_FROM environment variable is set in Supabase Dashboard"
echo "2. Send a test email through your app"
echo "3. Check spam score at https://www.mail-tester.com/"
echo ""
echo "Expected sender: Madison Studio <hello@madisonstudio.io>"
