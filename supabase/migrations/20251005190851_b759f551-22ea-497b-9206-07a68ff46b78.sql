-- Drop the google_calendar_tokens_metadata view
-- This view exposes metadata that could help attackers
DROP VIEW IF EXISTS public.google_calendar_tokens_metadata CASCADE;

-- Add security documentation comment
COMMENT ON TABLE public.google_calendar_tokens IS 
'OAuth tokens storage. SECURITY: No SELECT policy by design - tokens must only be accessed via edge functions using service role. This prevents XSS attacks and client-side token theft. Client applications should never read these tokens directly.';