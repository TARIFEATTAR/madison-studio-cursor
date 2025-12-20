-- Add jordan@tarifeattar.com as super admin (if not already added)
-- This ensures the super admin is set even if the original migration ran before the user existed

INSERT INTO public.super_admins (user_id, created_by)
SELECT id, id
FROM auth.users
WHERE email = 'jordan@tarifeattar.com'
ON CONFLICT (user_id) DO NOTHING;

-- Verify the super admin was added
DO $$
DECLARE
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count FROM public.super_admins;
  RAISE NOTICE 'Total super admins: %', admin_count;
END $$;
