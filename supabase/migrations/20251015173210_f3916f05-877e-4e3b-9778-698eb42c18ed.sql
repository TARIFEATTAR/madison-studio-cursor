-- Migration to use Supabase Vault for secure token storage
-- This removes plaintext IV storage and uses vault.secrets instead

-- First, create a new table that references vault secrets instead of storing encrypted data
CREATE TABLE IF NOT EXISTS public.google_calendar_vault_refs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token_secret_id uuid NOT NULL,
  refresh_token_secret_id uuid NOT NULL,
  token_expiry timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on the new table
ALTER TABLE public.google_calendar_vault_refs ENABLE ROW LEVEL SECURITY;

-- Users can only access their own vault references
CREATE POLICY "Users can view their own vault references"
ON public.google_calendar_vault_refs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vault references"
ON public.google_calendar_vault_refs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vault references"
ON public.google_calendar_vault_refs
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vault references"
ON public.google_calendar_vault_refs
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_google_calendar_vault_refs_updated_at
BEFORE UPDATE ON public.google_calendar_vault_refs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_google_calendar_vault_refs_user_id 
ON public.google_calendar_vault_refs(user_id);

-- Note: We'll keep the old google_calendar_tokens table temporarily for backward compatibility
-- Edge functions will be updated to use vault, then we can drop the old table
-- The old table will be marked as deprecated in comments

COMMENT ON TABLE public.google_calendar_tokens IS 'DEPRECATED: Use google_calendar_vault_refs instead. This table will be removed in a future migration.';