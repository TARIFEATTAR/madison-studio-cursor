-- Add missing SELECT policy to google_calendar_tokens table
-- This prevents authenticated users from reading other users' OAuth tokens
CREATE POLICY "Users can view their own tokens"
ON public.google_calendar_tokens
FOR SELECT
USING (auth.uid() = user_id);