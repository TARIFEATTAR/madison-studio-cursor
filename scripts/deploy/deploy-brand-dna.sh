#!/bin/bash
# Deploy analyze-brand-dna function to Supabase

echo "Deploying analyze-brand-dna function..."

# Deploy using npx (no global install needed)
npx supabase@latest functions deploy analyze-brand-dna \
  --project-ref likkskifwsrvszxdvufw \
  --no-verify-jwt

echo "Deployment complete!"
echo "Function URL: https://likkskifwsrvszxdvufw.supabase.co/functions/v1/analyze-brand-dna"
