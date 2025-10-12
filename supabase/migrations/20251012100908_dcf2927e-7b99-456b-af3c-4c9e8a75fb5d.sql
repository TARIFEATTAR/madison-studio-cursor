-- Create storage bucket for worksheet uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('worksheet-uploads', 'worksheet-uploads', false);

-- RLS policies for worksheet-uploads bucket
CREATE POLICY "Users can upload worksheets to their org"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'worksheet-uploads' AND
  (storage.foldername(name))[1] = (
    SELECT organization_id::text 
    FROM organization_members 
    WHERE user_id = auth.uid() 
    LIMIT 1
  )
);

CREATE POLICY "Users can read their org worksheets"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'worksheet-uploads' AND
  (storage.foldername(name))[1] = (
    SELECT organization_id::text 
    FROM organization_members 
    WHERE user_id = auth.uid() 
    LIMIT 1
  )
);

-- Create worksheet_uploads table
CREATE TABLE worksheet_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  extracted_data JSONB,
  confidence_scores JSONB,
  processing_status TEXT CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  error_message TEXT,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX idx_worksheet_uploads_org ON worksheet_uploads(organization_id);
CREATE INDEX idx_worksheet_uploads_status ON worksheet_uploads(processing_status);

-- Enable RLS
ALTER TABLE worksheet_uploads ENABLE ROW LEVEL SECURITY;

-- RLS policies for worksheet_uploads table
CREATE POLICY "Users can view their org's worksheets"
ON worksheet_uploads FOR SELECT
TO authenticated
USING (is_organization_member(auth.uid(), organization_id));

CREATE POLICY "Users can insert worksheets for their org"
ON worksheet_uploads FOR INSERT
TO authenticated
WITH CHECK (is_organization_member(auth.uid(), organization_id));

CREATE POLICY "Users can update their org's worksheets"
ON worksheet_uploads FOR UPDATE
TO authenticated
USING (is_organization_member(auth.uid(), organization_id));

-- Trigger for updated_at
CREATE TRIGGER update_worksheet_uploads_updated_at
  BEFORE UPDATE ON worksheet_uploads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();