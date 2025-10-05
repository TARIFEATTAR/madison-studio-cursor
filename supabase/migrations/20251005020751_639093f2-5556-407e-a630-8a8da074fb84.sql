-- Add archive fields to master_content table
ALTER TABLE public.master_content
ADD COLUMN is_archived BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE;

-- Add archive fields to derivative_assets table
ALTER TABLE public.derivative_assets
ADD COLUMN is_archived BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE;

-- Create function to set archived_at timestamp for master_content
CREATE OR REPLACE FUNCTION public.set_master_content_archived_at()
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

-- Create function to set archived_at timestamp for derivative_assets
CREATE OR REPLACE FUNCTION public.set_derivative_archived_at()
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

-- Create trigger for master_content
CREATE TRIGGER set_master_content_archived_at_trigger
BEFORE UPDATE ON public.master_content
FOR EACH ROW
EXECUTE FUNCTION public.set_master_content_archived_at();

-- Create trigger for derivative_assets
CREATE TRIGGER set_derivative_archived_at_trigger
BEFORE UPDATE ON public.derivative_assets
FOR EACH ROW
EXECUTE FUNCTION public.set_derivative_archived_at();