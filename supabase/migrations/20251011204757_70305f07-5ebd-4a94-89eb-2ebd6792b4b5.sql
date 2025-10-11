-- Phase 1: Remove plaintext OAuth token columns for security
-- The edge functions already use encrypted columns exclusively

-- Step 1: Verify all tokens are encrypted (safety check)
-- This will show count of rows with plaintext data
DO $$
DECLARE
  plaintext_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO plaintext_count 
  FROM google_calendar_tokens 
  WHERE access_token IS NOT NULL OR refresh_token IS NOT NULL;
  
  RAISE NOTICE 'Found % rows with plaintext token data', plaintext_count;
END $$;

-- Step 2: Drop plaintext columns
ALTER TABLE google_calendar_tokens 
DROP COLUMN IF EXISTS access_token,
DROP COLUMN IF EXISTS refresh_token;

-- Step 3: Add documentation comments
COMMENT ON COLUMN google_calendar_tokens.encrypted_access_token IS 'AES-256-GCM encrypted Google OAuth access token';
COMMENT ON COLUMN google_calendar_tokens.encrypted_refresh_token IS 'AES-256-GCM encrypted Google OAuth refresh token';
COMMENT ON COLUMN google_calendar_tokens.access_token_iv IS 'Initialization vector for access token encryption';
COMMENT ON COLUMN google_calendar_tokens.refresh_token_iv IS 'Initialization vector for refresh token encryption';