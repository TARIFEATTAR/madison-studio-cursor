-- Enable Row Level Security on google_calendar_tokens table
ALTER TABLE public.google_calendar_tokens ENABLE ROW LEVEL SECURITY;

-- Allow users to view only their own Google Calendar tokens
CREATE POLICY "Users can view their own tokens"
ON public.google_calendar_tokens
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert their own Google Calendar tokens
CREATE POLICY "Users can insert their own tokens"
ON public.google_calendar_tokens
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own Google Calendar tokens
CREATE POLICY "Users can update their own tokens"
ON public.google_calendar_tokens
FOR UPDATE
USING (auth.uid() = user_id);

-- Allow users to delete their own Google Calendar tokens
CREATE POLICY "Users can delete their own tokens"
ON public.google_calendar_tokens
FOR DELETE
USING (auth.uid() = user_id);