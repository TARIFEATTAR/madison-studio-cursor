-- Script to check Shopify connection encryption status
-- Run this in Supabase SQL Editor to verify your connection

SELECT 
  id,
  shop_domain,
  CASE 
    WHEN access_token_encrypted IS NOT NULL AND access_token_iv IS NOT NULL THEN '✅ Properly Encrypted'
    WHEN access_token_encrypted IS NOT NULL AND access_token_iv IS NULL THEN '⚠️ Missing IV - Needs Reconnection'
    WHEN access_token_encrypted IS NULL THEN '❌ No Token'
    ELSE '❓ Unknown State'
  END as encryption_status,
  LENGTH(access_token_encrypted) as encrypted_token_length,
  LENGTH(access_token_iv) as iv_length,
  sync_status,
  last_synced_at,
  created_at,
  updated_at
FROM shopify_connections
ORDER BY created_at DESC
LIMIT 5;
















