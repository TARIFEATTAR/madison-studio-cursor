-- Add archive fields to prompts table
ALTER TABLE public.prompts
ADD COLUMN is_archived BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE;

-- Create function to set archived_at timestamp for prompts
CREATE OR REPLACE FUNCTION public.set_prompts_archived_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_archived = true AND OLD.is_archived = false THEN
    NEW.archived_at = now();
  ELSIF NEW.is_archived = false THEN
    NEW.archived_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for prompts
CREATE TRIGGER set_prompts_archived_at_trigger
BEFORE UPDATE ON public.prompts
FOR EACH ROW
EXECUTE FUNCTION public.set_prompts_archived_at();