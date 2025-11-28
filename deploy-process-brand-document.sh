#!/bin/bash
# Deploy process-brand-document Edge Function to Supabase
# Project ID: likkskifwsrvszxdvufw

echo "🚀 Deploying process-brand-document Edge Function..."
echo "Project: likkskifwsrvszxdvufw"
echo ""

# Check if user is logged in
if ! npx supabase projects list &>/dev/null; then
  echo "❌ Not logged in to Supabase CLI"
  echo "Please run: npx supabase login"
  exit 1
fi

# Deploy the function
echo "📦 Deploying process-brand-document..."
npx supabase functions deploy process-brand-document \
  --project-ref likkskifwsrvszxdvufw \
  --no-verify-jwt

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ process-brand-document deployed successfully!"
  echo ""
  echo "Next steps:"
  echo "1. Verify function appears in Supabase Dashboard:"
  echo "   https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions"
  echo ""
  echo "2. Test the function by uploading a brand document in Settings"
  echo ""
  echo "3. Check function logs if there are any issues:"
  echo "   https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions/process-brand-document/logs"
else
  echo ""
  echo "❌ Failed to deploy process-brand-document"
  echo "Please check the error message above"
  exit 1
fi

