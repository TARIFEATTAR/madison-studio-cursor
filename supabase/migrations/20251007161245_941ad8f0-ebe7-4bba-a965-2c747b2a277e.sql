-- Phase 1: Prepare for Application-Level Token Encryption

-- Add columns to store encrypted tokens (as base64 strings) and their initialization vectors
ALTER TABLE public.google_calendar_tokens
ADD COLUMN IF NOT EXISTS encrypted_access_token TEXT,
ADD COLUMN IF NOT EXISTS access_token_iv TEXT,
ADD COLUMN IF NOT EXISTS encrypted_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS refresh_token_iv TEXT;

-- Temporarily keep old columns for migration
-- (Will be dropped after edge functions are updated)

-- Create index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_google_calendar_tokens_user_id 
ON public.google_calendar_tokens(user_id);

-- Add comment to document encryption approach
COMMENT ON COLUMN public.google_calendar_tokens.encrypted_access_token IS 
'AES-256-GCM encrypted access token (base64 encoded)';
COMMENT ON COLUMN public.google_calendar_tokens.encrypted_refresh_token IS 
'AES-256-GCM encrypted refresh token (base64 encoded)';
COMMENT ON COLUMN public.google_calendar_tokens.access_token_iv IS 
'Initialization vector for access token decryption (base64 encoded)';
COMMENT ON COLUMN public.google_calendar_tokens.refresh_token_iv IS 
'Initialization vector for refresh token decryption (base64 encoded)';