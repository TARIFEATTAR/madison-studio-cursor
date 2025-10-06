-- Add archiving columns to outputs table
ALTER TABLE public.outputs
ADD COLUMN is_archived BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE;

-- Create trigger function to automatically set archived_at timestamp
CREATE TRIGGER set_outputs_archived_at
  BEFORE UPDATE ON public.outputs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_prompts_archived_at();