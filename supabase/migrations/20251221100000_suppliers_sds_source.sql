-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION: Suppliers & SDS Source Management
-- ═══════════════════════════════════════════════════════════════════════════════
-- Purpose: Allow businesses to manage suppliers/vendors and store SDS sheets
--          from external sources (not just self-generated)
--
-- Features:
--   1. Suppliers table for managing vendor/manufacturer relationships
--   2. Link products to suppliers (for resellers, white-label, etc.)
--   3. Enhanced SDS tracking with source type (generated, uploaded, linked)
--   4. SDS request tracking for supplier communications
--
-- Created: December 21, 2025
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
    'manufacturer',      -- Makes the product
    'contract_manufacturer', -- White-label/private label manufacturer
    'distributor',       -- Resells products from manufacturers
    'raw_material',      -- Supplies ingredients/raw materials
    'packaging',         -- Supplies packaging/bottles/boxes
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
  typical_response_days INTEGER, -- Average days to get documents
  
  -- Additional Info
  account_number TEXT, -- Your account # with this supplier
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
CREATE UNIQUE INDEX IF NOT EXISTS idx_suppliers_org_name ON public.suppliers(organization_id, name);

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
  ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'generated' 
  CHECK (source_type IN ('generated', 'uploaded', 'linked', 'requested'));

-- Link SDS directly to a supplier (for supplier-provided SDS)
ALTER TABLE public.product_sds 
  ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL;

-- For linked SDS (external URL to supplier portal)
ALTER TABLE public.product_sds 
  ADD COLUMN IF NOT EXISTS external_url TEXT;

-- Track SDS requests
ALTER TABLE public.product_sds 
  ADD COLUMN IF NOT EXISTS request_sent_at TIMESTAMPTZ;

ALTER TABLE public.product_sds 
  ADD COLUMN IF NOT EXISTS request_sent_to TEXT; -- Email address

ALTER TABLE public.product_sds 
  ADD COLUMN IF NOT EXISTS request_notes TEXT;

-- Index for source type filtering
CREATE INDEX IF NOT EXISTS idx_product_sds_source ON public.product_sds(source_type);
CREATE INDEX IF NOT EXISTS idx_product_sds_supplier ON public.product_sds(supplier_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 4: SDS REQUEST LOG (Optional - tracks all requests sent)
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
-- PART 5: UPDATED_AT TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Trigger function (if not exists)
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
DO $$
BEGIN
  RAISE NOTICE 'Migration complete. Tables created/modified:';
  RAISE NOTICE '  - suppliers (new)';
  RAISE NOTICE '  - product_hubs (added supplier_id, is_self_manufactured)';
  RAISE NOTICE '  - product_sds (added source_type, supplier_id, external_url, request fields)';
  RAISE NOTICE '  - sds_requests (new)';
END $$;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
