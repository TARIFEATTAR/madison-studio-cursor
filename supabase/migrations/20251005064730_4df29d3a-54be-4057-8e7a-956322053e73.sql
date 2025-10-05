-- Remove deprecated OAuth token columns from google_calendar_sync table
-- These tokens should only be stored in the secure google_calendar_tokens table
-- which is not accessible from the client side

ALTER TABLE public.google_calendar_sync 
DROP COLUMN IF EXISTS access_token,
DROP COLUMN IF EXISTS refresh_token;