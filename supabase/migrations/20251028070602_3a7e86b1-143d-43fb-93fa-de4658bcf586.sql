-- Fix the security warning by setting search_path on the merge function
CREATE OR REPLACE FUNCTION merge_duplicate_products()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    UPDATE brand_products bp1
    SET 
      shopify_product_id = COALESCE(bp1.shopify_product_id, 
        (SELECT shopify_product_id FROM brand_products WHERE id = ANY(dup_record.product_ids[2:]) AND shopify_product_id IS NOT NULL LIMIT 1)),
      shopify_variant_id = COALESCE(bp1.shopify_variant_id,
        (SELECT shopify_variant_id FROM brand_products WHERE id = ANY(dup_record.product_ids[2:]) AND shopify_variant_id IS NOT NULL LIMIT 1)),
      last_shopify_sync = GREATEST(bp1.last_shopify_sync,
        (SELECT MAX(last_shopify_sync) FROM brand_products WHERE id = ANY(dup_record.product_ids[2:]))),
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