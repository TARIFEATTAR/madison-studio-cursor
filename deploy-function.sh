#!/bin/bash
# Deploy get-subscription function to Supabase

echo "Deploying get-subscription function..."

# Navigate to project root
cd "/Users/jordanrichter/Documents/Asala Project/Asala Studio"

# Deploy using npx (no global install needed)
npx supabase@latest functions deploy get-subscription \
  --project-ref iflwjiwkbxuvmiviqdxv \
  --no-verify-jwt

echo "Deployment complete!"
echo "Function URL: https://iflwjiwkbxuvmiviqdxv.supabase.co/functions/v1/get-subscription"




