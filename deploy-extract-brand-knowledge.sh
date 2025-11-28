#!/bin/bash
# Deploy extract-brand-knowledge Edge Function to Supabase
# Project ID: likkskifwsrvszxdvufw

echo "🚀 Deploying extract-brand-knowledge Edge Function..."
echo "Project: likkskifwsrvszxdvufw"
echo ""

# Check if user is logged in
if ! npx supabase projects list &>/dev/null; then
  echo "❌ Not logged in to Supabase CLI"
  echo "Please run: npx supabase login"
  exit 1
fi

# Deploy the function
echo "📦 Deploying extract-brand-knowledge..."
npx supabase functions deploy extract-brand-knowledge \
  --project-ref likkskifwsrvszxdvufw \
  --no-verify-jwt

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ extract-brand-knowledge deployed successfully!"
  echo ""
  echo "⚠️ IMPORTANT: Ensure you have set the GEMINI_API_KEY secret:"
  echo "Run: npx supabase secrets set GEMINI_API_KEY=your_api_key --project-ref likkskifwsrvszxdvufw"
  echo ""
  echo "Next steps:"
  echo "1. Verify function appears in Supabase Dashboard:"
  echo "   https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions"
  echo ""
  echo "2. Upload a brand document again to trigger extraction."
  echo ""
  echo "3. Check function logs if issues persist:"
  echo "   https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions/extract-brand-knowledge/logs"
else
  echo ""
  echo "❌ Failed to deploy extract-brand-knowledge"
  echo "Please check the error message above"
  exit 1
fi

