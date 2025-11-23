#!/bin/bash
# Deploy Madison Training-Dependent Functions to Supabase
# Project: likkskifwsrvszxdvufw (Madison Studio)

echo "🚀 Deploying Madison Training Functions..."

# 1. repurpose-content (Uses author profiles for derivatives)
echo "📦 Deploying repurpose-content..."
npx supabase@latest functions deploy repurpose-content --project-ref likkskifwsrvszxdvufw --no-verify-jwt

# 2. think-mode-chat (Uses author profiles for brainstorming)
echo "📦 Deploying think-mode-chat..."
npx supabase@latest functions deploy think-mode-chat --project-ref likkskifwsrvszxdvufw --no-verify-jwt

# 3. generate-with-claude (Uses author profiles for generation)
echo "📦 Deploying generate-with-claude..."
npx supabase@latest functions deploy generate-with-claude --project-ref likkskifwsrvszxdvufw --no-verify-jwt

# 4. marketplace-assistant (Uses author profiles for listings)
echo "📦 Deploying marketplace-assistant..."
npx supabase@latest functions deploy marketplace-assistant --project-ref likkskifwsrvszxdvufw --no-verify-jwt

echo "✅ Madison Training deployment complete!"
echo "The AI now has access to the latest Author Profiles (Peterman, Ogilvy, etc.)"

