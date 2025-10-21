-- Create storage bucket for generated images
INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-images', 'generated-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policy for uploading (authenticated users can upload to their org folder)
CREATE POLICY "Users can upload images for their organization"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'generated-images'
);

-- RLS policy for public read access
CREATE POLICY "Anyone can view generated images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'generated-images');

-- RLS policy for deleting own organization's images
CREATE POLICY "Users can delete their organization's images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'generated-images');