-- Create brand_products table for multi-tenant product catalog
CREATE TABLE public.brand_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  collection TEXT,
  scent_family TEXT,
  top_notes TEXT,
  middle_notes TEXT,
  base_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.brand_products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for brand_products
CREATE POLICY "Members can view their organization's products"
ON public.brand_products
FOR SELECT
USING (is_organization_member(auth.uid(), organization_id));

CREATE POLICY "Members can insert their organization's products"
ON public.brand_products
FOR INSERT
WITH CHECK (is_organization_member(auth.uid(), organization_id));

CREATE POLICY "Members can update their organization's products"
ON public.brand_products
FOR UPDATE
USING (is_organization_member(auth.uid(), organization_id));

CREATE POLICY "Admins and owners can delete products"
ON public.brand_products
FOR DELETE
USING (
  has_organization_role(auth.uid(), organization_id, 'owner'::organization_role) OR 
  has_organization_role(auth.uid(), organization_id, 'admin'::organization_role)
);

-- Add trigger for updated_at
CREATE TRIGGER update_brand_products_updated_at
BEFORE UPDATE ON public.brand_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing products to Jordan's organization (79c923b3-91e5-4f0a-ad50-9806131107b3) - only if organization exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.organizations WHERE id = '79c923b3-91e5-4f0a-ad50-9806131107b3'::uuid) THEN
    INSERT INTO public.brand_products (organization_id, name, collection, scent_family, top_notes, middle_notes, base_notes) VALUES
('79c923b3-91e5-4f0a-ad50-9806131107b3', 'Blackberry Bourbon', 'Cadence Collection', 'Warm', 'Blackberry, Bourbon', 'Vanilla, Tonka Bean', 'Oakmoss, Cedarwood'),
('79c923b3-91e5-4f0a-ad50-9806131107b3', 'Eucalyptus Rain', 'Cadence Collection', 'Fresh', 'Eucalyptus, Rain', 'Mint, Sage', 'Vetiver, Moss'),
('79c923b3-91e5-4f0a-ad50-9806131107b3', 'White Tea & Ginger', 'Cadence Collection', 'Fresh', 'White Tea, Ginger', 'Jasmine, Lily', 'Musk, Amber'),
('79c923b3-91e5-4f0a-ad50-9806131107b3', 'Oud & Bergamot', 'Cadence Collection', 'Woody', 'Bergamot, Lemon', 'Oud, Patchouli', 'Sandalwood, Musk'),
('79c923b3-91e5-4f0a-ad50-9806131107b3', 'Sea Salt & Sage', 'Cadence Collection', 'Fresh', 'Sea Salt, Sage', 'Lavender, Eucalyptus', 'Driftwood, Amber'),
('79c923b3-91e5-4f0a-ad50-9806131107b3', 'Black Rose', 'Reserve Collection', 'Floral', 'Rose, Black Pepper', 'Violet, Peony', 'Patchouli, Amber'),
('79c923b3-91e5-4f0a-ad50-9806131107b3', 'Cognac & Leather', 'Reserve Collection', 'Warm', 'Cognac, Tobacco', 'Leather, Clove', 'Sandalwood, Vanilla'),
('79c923b3-91e5-4f0a-ad50-9806131107b3', 'Saffron & Cashmere', 'Reserve Collection', 'Warm', 'Saffron, Pink Pepper', 'Cashmere, Iris', 'Suede, Vanilla'),
('79c923b3-91e5-4f0a-ad50-9806131107b3', 'Vetiver & Cedar', 'Reserve Collection', 'Woody', 'Bergamot, Cardamom', 'Vetiver, Cedar', 'Sandalwood, Amber'),
('79c923b3-91e5-4f0a-ad50-9806131107b3', 'Tobacco & Honey', 'Reserve Collection', 'Warm', 'Tobacco Leaf, Honey', 'Cinnamon, Clove', 'Vanilla, Tonka Bean'),
('79c923b3-91e5-4f0a-ad50-9806131107b3', 'Amber & Vanilla', 'Purity Collection', 'Warm', 'Amber, Vanilla', 'Benzoin, Tonka Bean', 'Musk, Sandalwood'),
('79c923b3-91e5-4f0a-ad50-9806131107b3', 'Citrus Grove', 'Purity Collection', 'Fresh', 'Lemon, Orange', 'Grapefruit, Bergamot', 'White Musk, Cedarwood'),
('79c923b3-91e5-4f0a-ad50-9806131107b3', 'Fresh Linen', 'Purity Collection', 'Fresh', 'Cotton Blossom, Linen', 'White Tea, Jasmine', 'Musk, Vanilla'),
('79c923b3-91e5-4f0a-ad50-9806131107b3', 'Lavender Fields', 'Purity Collection', 'Floral', 'Lavender, Bergamot', 'Chamomile, Clary Sage', 'Musk, Vanilla'),
('79c923b3-91e5-4f0a-ad50-9806131107b3', 'Ocean Breeze', 'Purity Collection', 'Fresh', 'Sea Air, Ozone', 'Water Lily, Jasmine', 'Driftwood, Musk'),
('79c923b3-91e5-4f0a-ad50-9806131107b3', 'Frankincense & Myrrh', 'Sacred Space', 'Woody', 'Frankincense, Myrrh', 'Incense, Smoke', 'Cedarwood, Vetiver'),
('79c923b3-91e5-4f0a-ad50-9806131107b3', 'Palo Santo', 'Sacred Space', 'Woody', 'Palo Santo, Sage', 'Eucalyptus, Pine', 'Cedarwood, Amber'),
('79c923b3-91e5-4f0a-ad50-9806131107b3', 'Sacred Garden', 'Sacred Space', 'Floral', 'White Sage, Jasmine', 'Rose, Lavender', 'Sandalwood, Amber'),
('79c923b3-91e5-4f0a-ad50-9806131107b3', 'Sandalwood & Sage', 'Sacred Space', 'Woody', 'Sage, Eucalyptus', 'Sandalwood, Cedar', 'Patchouli, Amber'),
('79c923b3-91e5-4f0a-ad50-9806131107b3', 'White Lotus', 'Sacred Space', 'Floral', 'Lotus, Water Lily', 'Jasmine, White Tea', 'Musk, Sandalwood'),
('79c923b3-91e5-4f0a-ad50-9806131107b3', 'Alpine Pine', 'Seasonal', 'Fresh', 'Pine, Fir Needle', 'Eucalyptus, Cypress', 'Cedarwood, Moss'),
('79c923b3-91e5-4f0a-ad50-9806131107b3', 'Autumn Harvest', 'Seasonal', 'Warm', 'Apple, Cinnamon', 'Pumpkin, Clove', 'Vanilla, Amber'),
('79c923b3-91e5-4f0a-ad50-9806131107b3', 'Fireside', 'Seasonal', 'Warm', 'Smoke, Embers', 'Cedarwood, Pine', 'Leather, Musk'),
('79c923b3-91e5-4f0a-ad50-9806131107b3', 'Spring Meadow', 'Seasonal', 'Fresh', 'Grass, Clover', 'Wildflowers, Freesia', 'Musk, Moss'),
('79c923b3-91e5-4f0a-ad50-9806131107b3', 'Summer Citrus', 'Seasonal', 'Fresh', 'Lemon, Lime', 'Orange Blossom, Bergamot', 'Musk, Driftwood'),
('79c923b3-91e5-4f0a-ad50-9806131107b3', 'Ambergris & Sea Salt', 'Limited Edition', 'Fresh', 'Sea Salt, Bergamot', 'Ambergris, Driftwood', 'Musk, Cedarwood'),
('79c923b3-91e5-4f0a-ad50-9806131107b3', 'Blood Orange & Ginger', 'Limited Edition', 'Fresh', 'Blood Orange, Ginger', 'Jasmine, Neroli', 'Amber, Musk'),
('79c923b3-91e5-4f0a-ad50-9806131107b3', 'Dark Honey & Tobacco', 'Limited Edition', 'Warm', 'Dark Honey, Tobacco', 'Leather, Spice', 'Tonka Bean, Musk'),
('79c923b3-91e5-4f0a-ad50-9806131107b3', 'Midnight Jasmine', 'Limited Edition', 'Floral', 'Jasmine, Tuberose', 'Night Blooming Cereus', 'Musk, Vanilla'),
('79c923b3-91e5-4f0a-ad50-9806131107b3', 'Noir', 'Limited Edition', 'Woody', 'Black Pepper, Bergamot', 'Oud, Leather', 'Patchouli, Amber');
  END IF;
END $$;