-- Fix the security definer view warning by using security invoker instead
-- This ensures the view enforces RLS policies based on the querying user, not the view creator

DROP VIEW IF EXISTS public.google_calendar_tokens_metadata;
CREATE VIEW public.google_calendar_tokens_metadata 
WITH (security_invoker = true)
AS
SELECT id, user_id, token_expiry, created_at, updated_at
FROM public.google_calendar_tokens;

-- Grant SELECT on the view to authenticated users
GRANT SELECT ON public.google_calendar_tokens_metadata TO authenticated;
