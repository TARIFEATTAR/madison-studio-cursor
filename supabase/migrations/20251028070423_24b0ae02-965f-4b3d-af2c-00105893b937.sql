-- Add unique constraint on organization_id and handle to prevent future duplicates
-- First, we need to handle existing duplicates by creating a function to merge them

-- Function to merge duplicate products (keeps first one, transfers any unique data)
CREATE OR REPLACE FUNCTION merge_duplicate_products()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  dup_record RECORD;
  first_product_id uuid;
BEGIN
  -- For each organization and handle combination that has duplicates
  FOR dup_record IN 
    SELECT organization_id, handle, array_agg(id ORDER BY created_at) as product_ids
    FROM brand_products
    WHERE handle IS NOT NULL AND handle != ''
    GROUP BY organization_id, handle
    HAVING COUNT(*) > 1
  LOOP
    -- Keep the first product (oldest)
    first_product_id := dup_record.product_ids[1];
    
    -- Update the first product with any non-null values from duplicates
    -- This preserves important data like shopify_product_id, visual specs, etc.
    UPDATE brand_products bp1
    SET 
      shopify_product_id = COALESCE(bp1.shopify_product_id, 
        (SELECT shopify_product_id FROM brand_products WHERE id = ANY(dup_record.product_ids[2:]) AND shopify_product_id IS NOT NULL LIMIT 1)),
      shopify_variant_id = COALESCE(bp1.shopify_variant_id,
        (SELECT shopify_variant_id FROM brand_products WHERE id = ANY(dup_record.product_ids[2:]) AND shopify_variant_id IS NOT NULL LIMIT 1)),
      last_shopify_sync = GREATEST(bp1.last_shopify_sync,
        (SELECT MAX(last_shopify_sync) FROM brand_products WHERE id = ANY(dup_record.product_ids[2:]))),
      -- Update other important fields if they're null in the first record
      description = COALESCE(bp1.description,
        (SELECT description FROM brand_products WHERE id = ANY(dup_record.product_ids[2:]) AND description IS NOT NULL LIMIT 1)),
      updated_at = now()
    WHERE bp1.id = first_product_id;
    
    -- Delete the duplicate products
    DELETE FROM brand_products
    WHERE id = ANY(dup_record.product_ids[2:]);
    
  END LOOP;
END;
$$;

-- Run the function to clean up existing duplicates
SELECT merge_duplicate_products();

-- Now add the unique constraint
ALTER TABLE brand_products
ADD CONSTRAINT brand_products_org_handle_unique UNIQUE (organization_id, handle);