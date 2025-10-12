-- Create table for Madison training documents
CREATE TABLE public.madison_training_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size integer,
  processing_status text DEFAULT 'pending',
  extracted_content text,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.madison_training_documents ENABLE ROW LEVEL SECURITY;

-- Super admins can view all documents
CREATE POLICY "Super admins can view Madison training documents"
ON public.madison_training_documents
FOR SELECT
USING (is_super_admin(auth.uid()));

-- Super admins can upload documents
CREATE POLICY "Super admins can upload Madison training documents"
ON public.madison_training_documents
FOR INSERT
WITH CHECK (is_super_admin(auth.uid()));

-- Super admins can update documents
CREATE POLICY "Super admins can update Madison training documents"
ON public.madison_training_documents
FOR UPDATE
USING (is_super_admin(auth.uid()));

-- Super admins can delete documents
CREATE POLICY "Super admins can delete Madison training documents"
ON public.madison_training_documents
FOR DELETE
USING (is_super_admin(auth.uid()));

-- Create storage bucket for Madison training documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('madison-training-docs', 'madison-training-docs', false);

-- Super admins can view documents in bucket
CREATE POLICY "Super admins can view Madison training documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'madison-training-docs' AND is_super_admin(auth.uid()));

-- Super admins can upload documents to bucket
CREATE POLICY "Super admins can upload Madison training documents"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'madison-training-docs' AND is_super_admin(auth.uid()));

-- Super admins can delete documents from bucket
CREATE POLICY "Super admins can delete Madison training documents"
ON storage.objects
FOR DELETE
USING (bucket_id = 'madison-training-docs' AND is_super_admin(auth.uid()));