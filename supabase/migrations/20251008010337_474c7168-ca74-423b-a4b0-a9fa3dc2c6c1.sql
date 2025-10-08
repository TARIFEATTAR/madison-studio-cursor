-- Create storage bucket for brand visual assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'brand-assets',
  'brand-assets',
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']
);

-- Create RLS policies for brand-assets bucket
CREATE POLICY "Organization members can view brand assets"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'brand-assets' 
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM organizations 
    WHERE is_organization_member(auth.uid(), id)
  )
);

CREATE POLICY "Organization members can upload brand assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'brand-assets'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM organizations 
    WHERE is_organization_member(auth.uid(), id)
  )
);

CREATE POLICY "Organization members can update brand assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'brand-assets'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM organizations 
    WHERE is_organization_member(auth.uid(), id)
  )
);

CREATE POLICY "Organization members can delete brand assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'brand-assets'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM organizations 
    WHERE is_organization_member(auth.uid(), id)
  )
);