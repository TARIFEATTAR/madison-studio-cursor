-- Create a secure tokens table with NO client access
CREATE TABLE IF NOT EXISTS public.google_calendar_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  token_expiry timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS but provide NO policies for regular users
-- Only service role (edge functions) can access this table
ALTER TABLE public.google_calendar_tokens ENABLE ROW LEVEL SECURITY;

-- Add trigger for updated_at on tokens table
CREATE TRIGGER update_google_calendar_tokens_updated_at
  BEFORE UPDATE ON public.google_calendar_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Note: The google_calendar_sync table already has access_token and refresh_token columns
-- but they will no longer be used by the client. Edge functions will use the new secure table.