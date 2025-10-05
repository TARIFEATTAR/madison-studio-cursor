-- Harden access to Google OAuth tokens by removing SELECT policy
-- This prevents client-side code from reading tokens
-- Only backend edge functions with service role can access tokens

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can view their own tokens" ON public.google_calendar_tokens;

-- Ensure RLS is still enabled
ALTER TABLE public.google_calendar_tokens ENABLE ROW LEVEL SECURITY;

-- Keep INSERT, UPDATE, DELETE policies for token management
-- These allow authenticated users to manage their tokens without reading them

DROP POLICY IF EXISTS "Users can insert their own tokens" ON public.google_calendar_tokens;
CREATE POLICY "Users can insert their own tokens"
ON public.google_calendar_tokens
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tokens" ON public.google_calendar_tokens;
CREATE POLICY "Users can update their own tokens"
ON public.google_calendar_tokens
FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own tokens" ON public.google_calendar_tokens;
CREATE POLICY "Users can delete their own tokens"
ON public.google_calendar_tokens
FOR DELETE
USING (auth.uid() = user_id);

-- Create a metadata-only view that excludes sensitive token data
DROP VIEW IF EXISTS public.google_calendar_tokens_metadata;
CREATE VIEW public.google_calendar_tokens_metadata AS
SELECT id, user_id, token_expiry, created_at, updated_at
FROM public.google_calendar_tokens;

-- Grant SELECT on the view to authenticated users
GRANT SELECT ON public.google_calendar_tokens_metadata TO authenticated;

-- Add comment explaining the security model
COMMENT ON TABLE public.google_calendar_tokens IS 
'OAuth tokens table. No SELECT policy - tokens can only be accessed by backend edge functions with service role. Client apps can only INSERT/UPDATE/DELETE their own tokens.';
