-- Create shot_types table to track user selections
CREATE TABLE IF NOT EXISTS public.shot_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  label text NOT NULL,
  prompt text NOT NULL,
  session_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shot_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their org's shot types"
  ON public.shot_types FOR SELECT
  USING (is_organization_member(auth.uid(), organization_id));

CREATE POLICY "Users can insert their org's shot types"
  ON public.shot_types FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND is_organization_member(auth.uid(), organization_id)
  );

-- Index for performance
CREATE INDEX idx_shot_types_user_id ON public.shot_types(user_id);
CREATE INDEX idx_shot_types_session_id ON public.shot_types(session_id);
CREATE INDEX idx_shot_types_created_at ON public.shot_types(created_at DESC);