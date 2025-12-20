-- ═══════════════════════════════════════════════════════════════════════════════
-- MADISON STUDIO - DAM STORAGE BUCKETS SETUP
-- ═══════════════════════════════════════════════════════════════════════════════
-- 
-- This migration sets up storage buckets for the DAM system.
-- Note: Storage bucket creation must be done via Supabase CLI or Dashboard
-- This file documents the configuration and creates the storage policies.
--
-- Created: December 19, 2025
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- BUCKET CONFIGURATION (Apply via Supabase Dashboard or CLI)
-- ═══════════════════════════════════════════════════════════════════════════════

/*
To create the buckets, run these commands in Supabase CLI or create via Dashboard:

-- Bucket 1: dam-assets (main asset storage)
-- Settings:
--   - Public: true
--   - File size limit: 52428800 (50MB)
--   - Allowed MIME types: image/*, video/*, application/pdf, application/msword, 
--                         application/vnd.openxmlformats-officedocument.wordprocessingml.document

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'dam-assets',
  'dam-assets', 
  true,
  52428800,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        'video/mp4', 'video/quicktime', 'video/webm',
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Bucket 2: dam-thumbnails (auto-generated thumbnails)
-- Settings:
--   - Public: true
--   - File size limit: 5242880 (5MB)
--   - Allowed MIME types: image/*

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'dam-thumbnails',
  'dam-thumbnails',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
*/

-- ═══════════════════════════════════════════════════════════════════════════════
-- STORAGE POLICIES
-- ═══════════════════════════════════════════════════════════════════════════════

-- Helper function to check if user belongs to an organization
-- (This may already exist from other migrations)
CREATE OR REPLACE FUNCTION storage.user_has_org_access(org_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = auth.uid()
    AND organization_id::TEXT = org_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ═══════════════════════════════════════════════════════════════════════════════
-- DAM-ASSETS BUCKET POLICIES
-- Path structure: {organization_id}/{filename}
-- ═══════════════════════════════════════════════════════════════════════════════

-- Allow public read access (for serving images)
CREATE POLICY "dam_assets_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'dam-assets');

-- Allow authenticated users to upload to their organization's folder
CREATE POLICY "dam_assets_org_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'dam-assets'
  AND auth.role() = 'authenticated'
  AND storage.user_has_org_access(SPLIT_PART(name, '/', 1))
);

-- Allow authenticated users to update files in their organization's folder
CREATE POLICY "dam_assets_org_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'dam-assets'
  AND auth.role() = 'authenticated'
  AND storage.user_has_org_access(SPLIT_PART(name, '/', 1))
);

-- Allow authenticated users to delete files in their organization's folder
CREATE POLICY "dam_assets_org_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'dam-assets'
  AND auth.role() = 'authenticated'
  AND storage.user_has_org_access(SPLIT_PART(name, '/', 1))
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- DAM-THUMBNAILS BUCKET POLICIES
-- Path structure: {organization_id}/{filename}
-- ═══════════════════════════════════════════════════════════════════════════════

-- Allow public read access (for serving thumbnails)
CREATE POLICY "dam_thumbnails_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'dam-thumbnails');

-- Allow service role to insert thumbnails (called from edge function)
-- Regular users don't upload thumbnails directly
CREATE POLICY "dam_thumbnails_service_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'dam-thumbnails'
  AND (
    auth.role() = 'service_role'
    OR (
      auth.role() = 'authenticated'
      AND storage.user_has_org_access(SPLIT_PART(name, '/', 1))
    )
  )
);

-- Allow service role to update thumbnails
CREATE POLICY "dam_thumbnails_service_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'dam-thumbnails'
  AND (
    auth.role() = 'service_role'
    OR (
      auth.role() = 'authenticated'
      AND storage.user_has_org_access(SPLIT_PART(name, '/', 1))
    )
  )
);

-- Allow deletion by org members
CREATE POLICY "dam_thumbnails_org_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'dam-thumbnails'
  AND auth.role() = 'authenticated'
  AND storage.user_has_org_access(SPLIT_PART(name, '/', 1))
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- COMPLETE
-- ═══════════════════════════════════════════════════════════════════════════════

-- Note: After running this migration, you still need to create the buckets
-- via Supabase Dashboard or CLI. The policies above will apply once the
-- buckets exist.
