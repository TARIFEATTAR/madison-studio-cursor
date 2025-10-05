-- Fix Critical Security Issue: Add SELECT policy for google_calendar_tokens
-- This prevents any authenticated user from viewing all OAuth tokens
CREATE POLICY "Users can view their own tokens" 
ON public.google_calendar_tokens
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Fix Medium Security Issue: Add DELETE policy for calendar_notes
-- This allows users to delete their own notes
CREATE POLICY "Users can delete their own notes" 
ON public.calendar_notes
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);