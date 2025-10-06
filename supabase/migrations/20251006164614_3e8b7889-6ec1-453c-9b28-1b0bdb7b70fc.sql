-- Phase 1: Multi-Tenancy Foundation Migration
-- This migration adds organization support while preserving all existing functionality

-- Step 1: Create organization role enum
CREATE TYPE public.organization_role AS ENUM ('owner', 'admin', 'member');

-- Step 2: Create organizations table
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  brand_config JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Step 3: Create organization_members table
CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role organization_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Step 4: Create brand_documents table
CREATE TABLE public.brand_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  file_url TEXT,
  processing_status TEXT DEFAULT 'pending',
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step 5: Create brand_knowledge table
CREATE TABLE public.brand_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.brand_documents(id) ON DELETE SET NULL,
  knowledge_type TEXT NOT NULL, -- 'voice', 'guidelines', 'vocabulary', 'visual_identity'
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step 6: Add organization_id to existing tables (nullable for backward compatibility)
ALTER TABLE public.prompts ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.outputs ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.master_content ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.derivative_assets ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.scheduled_content ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.calendar_schedule ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.calendar_notes ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.calendar_tasks ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.calendar_settings ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Step 7: Create indexes for performance
CREATE INDEX idx_org_members_user_id ON public.organization_members(user_id);
CREATE INDEX idx_org_members_org_id ON public.organization_members(organization_id);
CREATE INDEX idx_brand_docs_org_id ON public.brand_documents(organization_id);
CREATE INDEX idx_brand_knowledge_org_id ON public.brand_knowledge(organization_id);
CREATE INDEX idx_prompts_org_id ON public.prompts(organization_id);
CREATE INDEX idx_outputs_org_id ON public.outputs(organization_id);
CREATE INDEX idx_master_content_org_id ON public.master_content(organization_id);
CREATE INDEX idx_derivative_assets_org_id ON public.derivative_assets(organization_id);
CREATE INDEX idx_scheduled_content_org_id ON public.scheduled_content(organization_id);
CREATE INDEX idx_calendar_schedule_org_id ON public.calendar_schedule(organization_id);

-- Step 8: Create security definer function to check organization membership
CREATE OR REPLACE FUNCTION public.is_organization_member(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE user_id = _user_id
      AND organization_id = _org_id
  )
$$;

-- Step 9: Create security definer function to check organization role
CREATE OR REPLACE FUNCTION public.has_organization_role(_user_id UUID, _org_id UUID, _role organization_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE user_id = _user_id
      AND organization_id = _org_id
      AND role = _role
  )
$$;

-- Step 10: Enable RLS on new tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_knowledge ENABLE ROW LEVEL SECURITY;

-- Step 11: Create RLS policies for organizations table
CREATE POLICY "Users can view their organizations"
  ON public.organizations FOR SELECT
  USING (public.is_organization_member(auth.uid(), id));

CREATE POLICY "Organization owners can update their organization"
  ON public.organizations FOR UPDATE
  USING (public.has_organization_role(auth.uid(), id, 'owner'));

CREATE POLICY "Authenticated users can create organizations"
  ON public.organizations FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Step 12: Create RLS policies for organization_members table
CREATE POLICY "Members can view their organization's members"
  ON public.organization_members FOR SELECT
  USING (public.is_organization_member(auth.uid(), organization_id));

CREATE POLICY "Owners and admins can add members"
  ON public.organization_members FOR INSERT
  WITH CHECK (
    public.has_organization_role(auth.uid(), organization_id, 'owner') OR
    public.has_organization_role(auth.uid(), organization_id, 'admin')
  );

CREATE POLICY "Owners and admins can update members"
  ON public.organization_members FOR UPDATE
  USING (
    public.has_organization_role(auth.uid(), organization_id, 'owner') OR
    public.has_organization_role(auth.uid(), organization_id, 'admin')
  );

CREATE POLICY "Owners can delete members"
  ON public.organization_members FOR DELETE
  USING (public.has_organization_role(auth.uid(), organization_id, 'owner'));

-- Step 13: Create RLS policies for brand_documents table
CREATE POLICY "Members can view their organization's documents"
  ON public.brand_documents FOR SELECT
  USING (public.is_organization_member(auth.uid(), organization_id));

CREATE POLICY "Members can upload documents"
  ON public.brand_documents FOR INSERT
  WITH CHECK (public.is_organization_member(auth.uid(), organization_id));

CREATE POLICY "Members can update their organization's documents"
  ON public.brand_documents FOR UPDATE
  USING (public.is_organization_member(auth.uid(), organization_id));

CREATE POLICY "Admins and owners can delete documents"
  ON public.brand_documents FOR DELETE
  USING (
    public.has_organization_role(auth.uid(), organization_id, 'owner') OR
    public.has_organization_role(auth.uid(), organization_id, 'admin')
  );

-- Step 14: Create RLS policies for brand_knowledge table
CREATE POLICY "Members can view their organization's brand knowledge"
  ON public.brand_knowledge FOR SELECT
  USING (public.is_organization_member(auth.uid(), organization_id));

CREATE POLICY "Admins and owners can manage brand knowledge"
  ON public.brand_knowledge FOR ALL
  USING (
    public.has_organization_role(auth.uid(), organization_id, 'owner') OR
    public.has_organization_role(auth.uid(), organization_id, 'admin')
  );

-- Step 15: Update existing RLS policies to be organization-aware
-- Prompts policies
DROP POLICY IF EXISTS "Users can view their own prompts" ON public.prompts;
CREATE POLICY "Users can view their own or organization prompts"
  ON public.prompts FOR SELECT
  USING (
    auth.uid() = created_by OR 
    (organization_id IS NOT NULL AND public.is_organization_member(auth.uid(), organization_id))
  );

DROP POLICY IF EXISTS "Users can insert their own prompts" ON public.prompts;
CREATE POLICY "Users can insert their own or organization prompts"
  ON public.prompts FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    (organization_id IS NULL OR public.is_organization_member(auth.uid(), organization_id))
  );

DROP POLICY IF EXISTS "Users can update their own prompts" ON public.prompts;
CREATE POLICY "Users can update their own or organization prompts"
  ON public.prompts FOR UPDATE
  USING (
    auth.uid() = created_by OR 
    (organization_id IS NOT NULL AND public.is_organization_member(auth.uid(), organization_id))
  );

DROP POLICY IF EXISTS "Users can delete their own prompts" ON public.prompts;
CREATE POLICY "Users can delete their own or organization prompts"
  ON public.prompts FOR DELETE
  USING (
    auth.uid() = created_by OR 
    (organization_id IS NOT NULL AND public.is_organization_member(auth.uid(), organization_id))
  );

-- Outputs policies
DROP POLICY IF EXISTS "Users can view their own outputs" ON public.outputs;
CREATE POLICY "Users can view their own or organization outputs"
  ON public.outputs FOR SELECT
  USING (
    auth.uid() = created_by OR 
    (organization_id IS NOT NULL AND public.is_organization_member(auth.uid(), organization_id))
  );

DROP POLICY IF EXISTS "Users can insert their own outputs" ON public.outputs;
CREATE POLICY "Users can insert their own or organization outputs"
  ON public.outputs FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    (organization_id IS NULL OR public.is_organization_member(auth.uid(), organization_id))
  );

DROP POLICY IF EXISTS "Users can update their own outputs" ON public.outputs;
CREATE POLICY "Users can update their own or organization outputs"
  ON public.outputs FOR UPDATE
  USING (
    auth.uid() = created_by OR 
    (organization_id IS NOT NULL AND public.is_organization_member(auth.uid(), organization_id))
  );

DROP POLICY IF EXISTS "Users can delete their own outputs" ON public.outputs;
CREATE POLICY "Users can delete their own or organization outputs"
  ON public.outputs FOR DELETE
  USING (
    auth.uid() = created_by OR 
    (organization_id IS NOT NULL AND public.is_organization_member(auth.uid(), organization_id))
  );

-- Master content policies
DROP POLICY IF EXISTS "Users can view their own master content" ON public.master_content;
CREATE POLICY "Users can view their own or organization master content"
  ON public.master_content FOR SELECT
  USING (
    auth.uid() = created_by OR 
    (organization_id IS NOT NULL AND public.is_organization_member(auth.uid(), organization_id))
  );

DROP POLICY IF EXISTS "Users can insert their own master content" ON public.master_content;
CREATE POLICY "Users can insert their own or organization master content"
  ON public.master_content FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    (organization_id IS NULL OR public.is_organization_member(auth.uid(), organization_id))
  );

DROP POLICY IF EXISTS "Users can update their own master content" ON public.master_content;
CREATE POLICY "Users can update their own or organization master content"
  ON public.master_content FOR UPDATE
  USING (
    auth.uid() = created_by OR 
    (organization_id IS NOT NULL AND public.is_organization_member(auth.uid(), organization_id))
  );

DROP POLICY IF EXISTS "Users can delete their own master content" ON public.master_content;
CREATE POLICY "Users can delete their own or organization master content"
  ON public.master_content FOR DELETE
  USING (
    auth.uid() = created_by OR 
    (organization_id IS NOT NULL AND public.is_organization_member(auth.uid(), organization_id))
  );

-- Derivative assets policies
DROP POLICY IF EXISTS "Users can view their own derivative assets" ON public.derivative_assets;
CREATE POLICY "Users can view their own or organization derivative assets"
  ON public.derivative_assets FOR SELECT
  USING (
    auth.uid() = created_by OR 
    (organization_id IS NOT NULL AND public.is_organization_member(auth.uid(), organization_id))
  );

DROP POLICY IF EXISTS "Users can insert their own derivative assets" ON public.derivative_assets;
CREATE POLICY "Users can insert their own or organization derivative assets"
  ON public.derivative_assets FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    (organization_id IS NULL OR public.is_organization_member(auth.uid(), organization_id))
  );

DROP POLICY IF EXISTS "Users can update their own derivative assets" ON public.derivative_assets;
CREATE POLICY "Users can update their own or organization derivative assets"
  ON public.derivative_assets FOR UPDATE
  USING (
    auth.uid() = created_by OR 
    (organization_id IS NOT NULL AND public.is_organization_member(auth.uid(), organization_id))
  );

DROP POLICY IF EXISTS "Users can delete their own derivative assets" ON public.derivative_assets;
CREATE POLICY "Users can delete their own or organization derivative assets"
  ON public.derivative_assets FOR DELETE
  USING (
    auth.uid() = created_by OR 
    (organization_id IS NOT NULL AND public.is_organization_member(auth.uid(), organization_id))
  );

-- Scheduled content policies
DROP POLICY IF EXISTS "Users can view their own scheduled content" ON public.scheduled_content;
CREATE POLICY "Users can view their own or organization scheduled content"
  ON public.scheduled_content FOR SELECT
  USING (
    auth.uid() = user_id OR 
    (organization_id IS NOT NULL AND public.is_organization_member(auth.uid(), organization_id))
  );

DROP POLICY IF EXISTS "Users can insert their own scheduled content" ON public.scheduled_content;
CREATE POLICY "Users can insert their own or organization scheduled content"
  ON public.scheduled_content FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    (organization_id IS NULL OR public.is_organization_member(auth.uid(), organization_id))
  );

DROP POLICY IF EXISTS "Users can update their own scheduled content" ON public.scheduled_content;
CREATE POLICY "Users can update their own or organization scheduled content"
  ON public.scheduled_content FOR UPDATE
  USING (
    auth.uid() = user_id OR 
    (organization_id IS NOT NULL AND public.is_organization_member(auth.uid(), organization_id))
  );

DROP POLICY IF EXISTS "Users can delete their own scheduled content" ON public.scheduled_content;
CREATE POLICY "Users can delete their own or organization scheduled content"
  ON public.scheduled_content FOR DELETE
  USING (
    auth.uid() = user_id OR 
    (organization_id IS NOT NULL AND public.is_organization_member(auth.uid(), organization_id))
  );

-- Calendar schedule policies
DROP POLICY IF EXISTS "Users can view their own calendar schedules" ON public.calendar_schedule;
CREATE POLICY "Users can view their own or organization calendar schedules"
  ON public.calendar_schedule FOR SELECT
  USING (
    auth.uid() = created_by OR 
    (organization_id IS NOT NULL AND public.is_organization_member(auth.uid(), organization_id))
  );

DROP POLICY IF EXISTS "Users can insert their own calendar schedules" ON public.calendar_schedule;
CREATE POLICY "Users can insert their own or organization calendar schedules"
  ON public.calendar_schedule FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    (organization_id IS NULL OR public.is_organization_member(auth.uid(), organization_id))
  );

DROP POLICY IF EXISTS "Users can update their own calendar schedules" ON public.calendar_schedule;
CREATE POLICY "Users can update their own or organization calendar schedules"
  ON public.calendar_schedule FOR UPDATE
  USING (
    auth.uid() = created_by OR 
    (organization_id IS NOT NULL AND public.is_organization_member(auth.uid(), organization_id))
  );

DROP POLICY IF EXISTS "Users can delete their own calendar schedules" ON public.calendar_schedule;
CREATE POLICY "Users can delete their own or organization calendar schedules"
  ON public.calendar_schedule FOR DELETE
  USING (
    auth.uid() = created_by OR 
    (organization_id IS NOT NULL AND public.is_organization_member(auth.uid(), organization_id))
  );

-- Calendar notes policies
DROP POLICY IF EXISTS "Users can view their own notes" ON public.calendar_notes;
CREATE POLICY "Users can view their own or organization notes"
  ON public.calendar_notes FOR SELECT
  USING (
    auth.uid() = user_id OR 
    (organization_id IS NOT NULL AND public.is_organization_member(auth.uid(), organization_id))
  );

DROP POLICY IF EXISTS "Users can insert their own notes" ON public.calendar_notes;
CREATE POLICY "Users can insert their own or organization notes"
  ON public.calendar_notes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    (organization_id IS NULL OR public.is_organization_member(auth.uid(), organization_id))
  );

DROP POLICY IF EXISTS "Users can update their own notes" ON public.calendar_notes;
CREATE POLICY "Users can update their own or organization notes"
  ON public.calendar_notes FOR UPDATE
  USING (
    auth.uid() = user_id OR 
    (organization_id IS NOT NULL AND public.is_organization_member(auth.uid(), organization_id))
  );

DROP POLICY IF EXISTS "Users can delete their own notes" ON public.calendar_notes;
CREATE POLICY "Users can delete their own or organization notes"
  ON public.calendar_notes FOR DELETE
  USING (
    auth.uid() = user_id OR 
    (organization_id IS NOT NULL AND public.is_organization_member(auth.uid(), organization_id))
  );

-- Calendar tasks policies
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.calendar_tasks;
CREATE POLICY "Users can view their own or organization tasks"
  ON public.calendar_tasks FOR SELECT
  USING (
    auth.uid() = user_id OR 
    (organization_id IS NOT NULL AND public.is_organization_member(auth.uid(), organization_id))
  );

DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.calendar_tasks;
CREATE POLICY "Users can insert their own or organization tasks"
  ON public.calendar_tasks FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    (organization_id IS NULL OR public.is_organization_member(auth.uid(), organization_id))
  );

DROP POLICY IF EXISTS "Users can update their own tasks" ON public.calendar_tasks;
CREATE POLICY "Users can update their own or organization tasks"
  ON public.calendar_tasks FOR UPDATE
  USING (
    auth.uid() = user_id OR 
    (organization_id IS NOT NULL AND public.is_organization_member(auth.uid(), organization_id))
  );

DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.calendar_tasks;
CREATE POLICY "Users can delete their own or organization tasks"
  ON public.calendar_tasks FOR DELETE
  USING (
    auth.uid() = user_id OR 
    (organization_id IS NOT NULL AND public.is_organization_member(auth.uid(), organization_id))
  );

-- Calendar settings policies
DROP POLICY IF EXISTS "Users can view their own calendar settings" ON public.calendar_settings;
CREATE POLICY "Users can view their own or organization calendar settings"
  ON public.calendar_settings FOR SELECT
  USING (
    auth.uid() = user_id OR 
    (organization_id IS NOT NULL AND public.is_organization_member(auth.uid(), organization_id))
  );

DROP POLICY IF EXISTS "Users can insert their own calendar settings" ON public.calendar_settings;
CREATE POLICY "Users can insert their own or organization calendar settings"
  ON public.calendar_settings FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    (organization_id IS NULL OR public.is_organization_member(auth.uid(), organization_id))
  );

DROP POLICY IF EXISTS "Users can update their own calendar settings" ON public.calendar_settings;
CREATE POLICY "Users can update their own or organization calendar settings"
  ON public.calendar_settings FOR UPDATE
  USING (
    auth.uid() = user_id OR 
    (organization_id IS NOT NULL AND public.is_organization_member(auth.uid(), organization_id))
  );

DROP POLICY IF EXISTS "Users can delete their own calendar settings" ON public.calendar_settings;
CREATE POLICY "Users can delete their own or organization calendar settings"
  ON public.calendar_settings FOR DELETE
  USING (
    auth.uid() = user_id OR 
    (organization_id IS NOT NULL AND public.is_organization_member(auth.uid(), organization_id))
  );

-- Step 16: Create trigger for updated_at timestamps
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organization_members_updated_at
  BEFORE UPDATE ON public.organization_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_brand_documents_updated_at
  BEFORE UPDATE ON public.brand_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_brand_knowledge_updated_at
  BEFORE UPDATE ON public.brand_knowledge
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();