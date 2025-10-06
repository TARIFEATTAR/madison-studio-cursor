-- Multi-Tenancy Fix: Clean Up Orphaned Content & Enforce Data Isolation

-- Step 1: Delete ghost organizations with NULL created_by
DELETE FROM public.organizations 
WHERE created_by IS NULL;

-- Step 2: Assign all orphaned content to Jordan's organization
-- Update orphaned prompts (5 records)
UPDATE public.prompts 
SET organization_id = '79c923b3-91e5-4f0a-ad50-9806131107b3'::uuid
WHERE organization_id IS NULL 
AND created_by = 'cbeb5b7b-6a71-47ce-a529-bad4cbae9bc9'::uuid;

-- Update orphaned master_content (11 records)
UPDATE public.master_content 
SET organization_id = '79c923b3-91e5-4f0a-ad50-9806131107b3'::uuid
WHERE organization_id IS NULL 
AND created_by = 'cbeb5b7b-6a71-47ce-a529-bad4cbae9bc9'::uuid;

-- Update orphaned outputs (5 records)
UPDATE public.outputs 
SET organization_id = '79c923b3-91e5-4f0a-ad50-9806131107b3'::uuid
WHERE organization_id IS NULL 
AND created_by = 'cbeb5b7b-6a71-47ce-a529-bad4cbae9bc9'::uuid;

-- Update orphaned derivative_assets (26 records)
UPDATE public.derivative_assets 
SET organization_id = '79c923b3-91e5-4f0a-ad50-9806131107b3'::uuid
WHERE organization_id IS NULL 
AND created_by = 'cbeb5b7b-6a71-47ce-a529-bad4cbae9bc9'::uuid;

-- Step 3: Make organization_id required on all content tables
ALTER TABLE public.prompts 
ALTER COLUMN organization_id SET NOT NULL;

ALTER TABLE public.master_content 
ALTER COLUMN organization_id SET NOT NULL;

ALTER TABLE public.outputs 
ALTER COLUMN organization_id SET NOT NULL;

ALTER TABLE public.derivative_assets 
ALTER COLUMN organization_id SET NOT NULL;

-- Step 4: Ensure one user = one organization
ALTER TABLE public.organizations
ADD CONSTRAINT unique_created_by UNIQUE (created_by);