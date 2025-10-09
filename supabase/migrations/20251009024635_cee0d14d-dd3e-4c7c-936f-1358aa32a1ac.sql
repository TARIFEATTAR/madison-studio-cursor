-- Remove the problematic foreign key constraint
-- This constraint prevents organizations from being created when the auth.users reference fails
ALTER TABLE public.organizations
DROP CONSTRAINT IF EXISTS organizations_created_by_fkey;

-- We keep the created_by column (it will still store user UUIDs) but without the foreign key
-- This is the recommended approach for referencing auth.users from custom tables