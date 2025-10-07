-- Create storage bucket for brand documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-documents', 'brand-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for brand documents bucket
CREATE POLICY "Organization members can view their brand documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'brand-documents' 
  AND EXISTS (
    SELECT 1 FROM brand_documents
    WHERE brand_documents.file_url = storage.objects.name
    AND is_organization_member(auth.uid(), brand_documents.organization_id)
  )
);

CREATE POLICY "Organization members can upload brand documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'brand-documents'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Organization members can delete their brand documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'brand-documents'
  AND EXISTS (
    SELECT 1 FROM brand_documents
    WHERE brand_documents.file_url = storage.objects.name
    AND is_organization_member(auth.uid(), brand_documents.organization_id)
  )
);