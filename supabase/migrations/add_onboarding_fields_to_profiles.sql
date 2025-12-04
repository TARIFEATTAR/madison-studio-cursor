-- Add onboarding fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS current_onboarding_step integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS onboarding_status text DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS has_scanned_website boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_uploaded_docs boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_scheduled_call boolean DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN profiles.current_onboarding_step IS 'Current step in the onboarding process (1-5)';
COMMENT ON COLUMN profiles.onboarding_status IS 'Status of onboarding: not_started, in_progress, complete';
COMMENT ON COLUMN profiles.has_scanned_website IS 'Whether user has scanned their website during onboarding';
COMMENT ON COLUMN profiles.has_uploaded_docs IS 'Whether user has uploaded documents during onboarding';
COMMENT ON COLUMN profiles.has_scheduled_call IS 'Whether user has scheduled a call during onboarding';
