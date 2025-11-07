-- Phase 1: Critical Security Fix - Migration for existing Shopify tokens
-- This migration handles existing tokens that were stored without encryption
-- 
-- IMPORTANT: This migration marks existing tokens as needing re-encryption.
-- Users will need to reconnect their Shopify accounts after this migration.
-- 
-- Alternative: If you have access to the plaintext tokens before migration,
-- you can create a one-time script to encrypt them. Otherwise, users must reconnect.

-- Step 1: Identify existing connections that need re-encryption
-- (Tokens stored in access_token_encrypted without access_token_iv are unencrypted)
DO $$
DECLARE
  unencrypted_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unencrypted_count
  FROM shopify_connections
  WHERE access_token_encrypted IS NOT NULL
    AND (access_token_iv IS NULL OR access_token_iv = '');
  
  IF unencrypted_count > 0 THEN
    RAISE NOTICE 'Found % existing Shopify connections that need re-encryption', unencrypted_count;
    RAISE NOTICE 'Users will need to reconnect their Shopify accounts after this migration';
  ELSE
    RAISE NOTICE 'No existing connections found - all new connections will be encrypted';
  END IF;
END $$;

-- Step 2: Clear unencrypted tokens (they cannot be encrypted without the original plaintext)
-- This forces users to reconnect, ensuring all tokens are properly encrypted
UPDATE shopify_connections
SET 
  access_token_encrypted = NULL,
  access_token_iv = NULL,
  sync_status = 'error',
  updated_at = now()
WHERE access_token_encrypted IS NOT NULL
  AND (access_token_iv IS NULL OR access_token_iv = '');

-- Step 3: Add a comment to track the migration
COMMENT ON TABLE shopify_connections IS 
'Stores Shopify connections with AES-256-GCM encrypted access tokens. 
All tokens must have both access_token_encrypted and access_token_iv columns populated.
Migration 20251103220001 cleared unencrypted tokens - users must reconnect.';










