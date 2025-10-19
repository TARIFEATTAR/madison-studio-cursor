-- Add published_at column to master_content table to track when content was published
ALTER TABLE public.master_content 
ADD COLUMN IF NOT EXISTS published_at timestamp with time zone;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_master_content_published_at 
ON public.master_content(published_at) 
WHERE published_at IS NOT NULL;

-- Update existing published content to have published_at set
UPDATE public.master_content
SET published_at = updated_at
WHERE status = 'published' AND published_at IS NULL;