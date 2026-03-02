#!/bin/bash
# Deploy Edge Functions with Brand Intelligence Integration
# Project ID: likkskifwsrvszxdvufw

echo "🚀 Deploying Edge Functions with Brand Intelligence..."
echo "Project: likkskifwsrvszxdvufw"
echo ""

# Functions that now include Brand Intelligence Authorities
FUNCTIONS=(
  "generate-with-claude"
  "think-mode-chat"
  "marketplace-assistant"
  "repurpose-content"
)

for func in "${FUNCTIONS[@]}"; do
  echo "📦 Deploying $func..."
  npx supabase functions deploy "$func" --project-ref likkskifwsrvszxdvufw
  
  if [ $? -eq 0 ]; then
    echo "✅ $func deployed successfully"
  else
    echo "❌ Failed to deploy $func"
  fi
  echo ""
done

echo "✅ Deployment complete!"
echo ""
echo "What was deployed:"
echo "  ✓ Copywriting Expertise (8 authors: Halbert, Ogilvy, Hopkins, Schwartz, Collier, Peterman, Joyner, Caples)"
echo "  ✓ Brand Intelligence (3 authorities: Wheeler, Neumeier, Clow)"
echo "  ✓ Client Brand Knowledge (from database)"
echo "  ✓ System Training (from madison_system_config table)"
echo ""
echo "Next steps:"
echo "1. Verify functions in Supabase Dashboard"
echo "2. Test brand intelligence features"
echo "3. Review status document: BRAND_INTELLIGENCE_STATUS.md"

