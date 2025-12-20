-- ═══════════════════════════════════════════════════════════════════════════════
-- SCRIPT: Apply Suppliers & SDS Source Management
-- ═══════════════════════════════════════════════════════════════════════════════
-- Run this script in your Supabase SQL Editor to enable:
--   1. Suppliers/Vendors management
--   2. Product-to-supplier linking
--   3. SDS upload from suppliers
--   4. SDS request tracking
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 1: SUPPLIERS TABLE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Basic Info
  name TEXT NOT NULL,
  company_type TEXT CHECK (company_type IN (
    'manufacturer',
    'contract_manufacturer',
    'distributor',
    'raw_material',
    'packaging',
    'other'
  )),
  
  -- Contact Information
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  
  -- Address
  address_line_1 TEXT,
  address_line_2 TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  
  -- Compliance & Documentation
  has_sds_portal BOOLEAN DEFAULT false,
  sds_portal_url TEXT,
  typical_response_days INTEGER,
  
  -- Additional Info
  account_number TEXT,
  payment_terms TEXT,
  notes TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_suppliers_org ON public.suppliers(organization_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON public.suppliers(organization_id, is_active);

-- Unique constraint for supplier name within org
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_suppliers_org_name'
  ) THEN
    CREATE UNIQUE INDEX idx_suppliers_org_name ON public.suppliers(organization_id, name);
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Index idx_suppliers_org_name may already exist or failed: %', SQLERRM;
END $$;

-- RLS Policies
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view suppliers in their organization" ON public.suppliers;
CREATE POLICY "Users can view suppliers in their organization"
  ON public.suppliers FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can manage suppliers in their organization" ON public.suppliers;
CREATE POLICY "Users can manage suppliers in their organization"
  ON public.suppliers FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  ));

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 2: ADD SUPPLIER REFERENCE TO PRODUCTS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Add supplier link to products
ALTER TABLE public.product_hubs 
  ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL;

-- Track whether this is self-manufactured or sourced from supplier
ALTER TABLE public.product_hubs 
  ADD COLUMN IF NOT EXISTS is_self_manufactured BOOLEAN DEFAULT true;

-- Index for supplier filtering
CREATE INDEX IF NOT EXISTS idx_product_hubs_supplier ON public.product_hubs(supplier_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 3: ENHANCE SDS TABLE WITH SOURCE TRACKING
-- ═══════════════════════════════════════════════════════════════════════════════

-- Add source type to track where the SDS came from
ALTER TABLE public.product_sds 
  ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'generated';

-- Add check constraint (handle if it doesn't support IF NOT EXISTS)
DO $$
BEGIN
  ALTER TABLE public.product_sds 
    ADD CONSTRAINT chk_sds_source_type 
    CHECK (source_type IN ('generated', 'uploaded', 'linked', 'requested'));
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Constraint chk_sds_source_type already exists';
END $$;

-- Link SDS directly to a supplier
ALTER TABLE public.product_sds 
  ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL;

-- For linked SDS (external URL to supplier portal)
ALTER TABLE public.product_sds 
  ADD COLUMN IF NOT EXISTS external_url TEXT;

-- Track SDS requests
ALTER TABLE public.product_sds 
  ADD COLUMN IF NOT EXISTS request_sent_at TIMESTAMPTZ;

ALTER TABLE public.product_sds 
  ADD COLUMN IF NOT EXISTS request_sent_to TEXT;

ALTER TABLE public.product_sds 
  ADD COLUMN IF NOT EXISTS request_notes TEXT;

-- Index for source type filtering
CREATE INDEX IF NOT EXISTS idx_product_sds_source ON public.product_sds(source_type);
CREATE INDEX IF NOT EXISTS idx_product_sds_supplier ON public.product_sds(supplier_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 4: SDS REQUEST LOG
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.sds_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.product_hubs(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  
  -- Request Details
  sent_to_email TEXT NOT NULL,
  sent_to_name TEXT,
  subject TEXT,
  message TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'received', 'cancelled')),
  sent_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  
  -- Response
  received_sds_id UUID REFERENCES public.product_sds(id),
  response_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sds_requests_org ON public.sds_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_sds_requests_product ON public.sds_requests(product_id);
CREATE INDEX IF NOT EXISTS idx_sds_requests_status ON public.sds_requests(status);

-- RLS
ALTER TABLE public.sds_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view SDS requests in their organization" ON public.sds_requests;
CREATE POLICY "Users can view SDS requests in their organization"
  ON public.sds_requests FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can manage SDS requests in their organization" ON public.sds_requests;
CREATE POLICY "Users can manage SDS requests in their organization"
  ON public.sds_requests FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  ));

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 5: UPDATED_AT TRIGGER
-- ═══════════════════════════════════════════════════════════════════════════════

-- Trigger function (create if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Suppliers updated_at trigger
DROP TRIGGER IF EXISTS update_suppliers_updated_at ON public.suppliers;
CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════════
-- VERIFICATION
-- ═══════════════════════════════════════════════════════════════════════════════

-- Verify tables exist
SELECT 
  'suppliers' as table_name,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'suppliers') as exists
UNION ALL
SELECT 
  'sds_requests' as table_name,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sds_requests') as exists;

-- Verify columns added
SELECT 
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'product_hubs' 
  AND column_name IN ('supplier_id', 'is_self_manufactured');

SELECT 
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'product_sds' 
  AND column_name IN ('source_type', 'supplier_id', 'external_url', 'request_sent_at', 'request_sent_to', 'request_notes');

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';

-- Done!
DO $$
BEGIN
  RAISE NOTICE '✅ Suppliers & SDS Source Management applied successfully!';
  RAISE NOTICE 'Tables created/modified:';
  RAISE NOTICE '  - suppliers (new)';
  RAISE NOTICE '  - sds_requests (new)';
  RAISE NOTICE '  - product_hubs (added supplier_id, is_self_manufactured)';
  RAISE NOTICE '  - product_sds (added source_type, supplier_id, external_url, request fields)';
END $$;
