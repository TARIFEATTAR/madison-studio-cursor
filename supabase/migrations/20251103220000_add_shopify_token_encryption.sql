-- Phase 1: Critical Security Fix - Add encryption support for Shopify access tokens
-- Add IV column for proper AES-256-GCM encryption

ALTER TABLE public.shopify_connections
ADD COLUMN IF NOT EXISTS access_token_iv TEXT;

-- Add comment to document encryption approach
COMMENT ON COLUMN public.shopify_connections.access_token_encrypted IS 
'AES-256-GCM encrypted Shopify access token (base64 encoded)';
COMMENT ON COLUMN public.shopify_connections.access_token_iv IS 
'Initialization vector for access token decryption (base64 encoded)';

-- Note: Existing tokens in access_token_encrypted without IV will need to be re-encrypted
-- This should be handled by the connect-shopify edge function when users reconnect


















