-- Create storage bucket for temporary reference images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reference-images',
  'reference-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
);

-- Create RLS policies for reference images bucket
CREATE POLICY "Users can upload their own reference images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'reference-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Reference images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'reference-images');

CREATE POLICY "Users can delete their own reference images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'reference-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Update generated_images table to track reference images and brand context
ALTER TABLE generated_images
ADD COLUMN IF NOT EXISTS reference_image_url text,
ADD COLUMN IF NOT EXISTS brand_context_used jsonb;