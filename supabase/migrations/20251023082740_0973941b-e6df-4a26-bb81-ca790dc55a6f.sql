-- Add push tracking columns to marketplace_listings
ALTER TABLE marketplace_listings
ADD COLUMN IF NOT EXISTS last_pushed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS push_status text DEFAULT 'pending' CHECK (push_status IN ('pending', 'success', 'failed')),
ADD COLUMN IF NOT EXISTS push_error text;