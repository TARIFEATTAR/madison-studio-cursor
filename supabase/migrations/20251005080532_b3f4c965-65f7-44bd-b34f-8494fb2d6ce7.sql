-- Remove SELECT access to sensitive OAuth tokens entirely from client context
-- This ensures no authenticated user can read any tokens via SQL
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'google_calendar_tokens' 
      AND policyname = 'Users can view their own tokens'
  ) THEN
    DROP POLICY "Users can view their own tokens" ON public.google_calendar_tokens;
  END IF;
END $$;

-- (Optional hardening) Add a comment to document the decision
COMMENT ON TABLE public.google_calendar_tokens IS 'Stores Google OAuth tokens. Reading tokens is disabled for all client roles. Access must happen via server-side (service role) only.';