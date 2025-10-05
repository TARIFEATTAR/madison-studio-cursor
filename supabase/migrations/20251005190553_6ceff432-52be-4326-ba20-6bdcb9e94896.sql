-- Add sync_status column to track Google Calendar synchronization state
ALTER TABLE public.scheduled_content 
ADD COLUMN IF NOT EXISTS sync_status text DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'failed', 'disabled'));

-- Add index for efficient sync status queries
CREATE INDEX IF NOT EXISTS idx_scheduled_content_sync_status ON public.scheduled_content(sync_status);

-- Add comment to document the column
COMMENT ON COLUMN public.scheduled_content.sync_status IS 'Tracks Google Calendar sync state: pending (not yet synced), synced (successfully synced), failed (sync error), disabled (sync turned off)';