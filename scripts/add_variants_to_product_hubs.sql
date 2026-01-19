-- Add variants and options JSONB fields to product_hubs if they don't exist
-- This enables variant-level SKU storage (like Shopify sync does)

DO $$
BEGIN
  -- Add variants column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_hubs' AND column_name = 'variants'
  ) THEN
    ALTER TABLE public.product_hubs
    ADD COLUMN variants JSONB DEFAULT '[]'::jsonb;

    COMMENT ON COLUMN public.product_hubs.variants IS 'JSONB array of product variants with SKU, price, inventory per variant. Format: [{ id, title, sku, price, compare_at_price, inventory_quantity, option1, option2, option3, barcode, weight, position }]';
  END IF;

  -- Add options column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_hubs' AND column_name = 'options'
  ) THEN
    ALTER TABLE public.product_hubs
    ADD COLUMN options JSONB DEFAULT '[]'::jsonb;

    COMMENT ON COLUMN public.product_hubs.options IS 'JSONB array of product options (Size, Color, etc.). Format: [{ name: "Size", values: ["6ml", "12ml"], position: 1 }]';
  END IF;
END $$;
