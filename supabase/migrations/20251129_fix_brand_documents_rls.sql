-- Fix RLS policies for brand-documents bucket to allow uploads and updates
-- This is necessary because we enabled upsert: true, which requires UPDATE permissions

-- Drop existing policies to avoid conflicts (safely)
DROP POLICY IF EXISTS "Organization members can upload brand documents" ON storage.objects;
DROP POLICY IF EXISTS "Organization members can update brand documents" ON storage.objects;
DROP POLICY IF EXISTS "Organization members can view their brand documents" ON storage.objects;
DROP POLICY IF EXISTS "Organization members can delete their brand documents" ON storage.objects;

-- 1. Allow INSERT (Upload) for any authenticated user to this bucket
CREATE POLICY "Organization members can upload brand documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'brand-documents'
  AND auth.role() = 'authenticated'
);

-- 2. Allow UPDATE (Upsert) - This was likely missing and causing the error
CREATE POLICY "Organization members can update brand documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'brand-documents'
  AND auth.role() = 'authenticated'
);

-- 3. Allow SELECT (View/Download)
-- We restore the secure check that ensures the user belongs to the org that owns the document
CREATE POLICY "Organization members can view their brand documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'brand-documents' 
  AND (
    -- Allow if user is the uploader (immediate access)
    auth.uid() = owner
    OR
    -- Or if they are a member of the org linked to the file (via brand_documents table)
    EXISTS (
      SELECT 1 FROM brand_documents
      WHERE brand_documents.file_url = storage.objects.name
      AND is_organization_member(auth.uid(), brand_documents.organization_id)
    )
  )
);

-- 4. Allow DELETE
CREATE POLICY "Organization members can delete their brand documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'brand-documents'
  AND (
    auth.uid() = owner
    OR
    EXISTS (
      SELECT 1 FROM brand_documents
      WHERE brand_documents.file_url = storage.objects.name
      AND is_organization_member(auth.uid(), brand_documents.organization_id)
    )
  )
);

