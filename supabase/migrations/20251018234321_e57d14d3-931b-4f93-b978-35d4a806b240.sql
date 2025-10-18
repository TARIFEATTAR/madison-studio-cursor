-- Add unique constraint on organization_id to brand_health table
ALTER TABLE public.brand_health 
ADD CONSTRAINT brand_health_organization_id_key UNIQUE (organization_id);