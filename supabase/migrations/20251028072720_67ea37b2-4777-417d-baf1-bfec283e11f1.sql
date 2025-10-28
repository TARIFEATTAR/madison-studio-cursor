-- Drop the old merge function
DROP FUNCTION IF EXISTS public.merge_duplicate_products_by_name_safe();

-- Create improved merge function that preserves rich field data
CREATE OR REPLACE FUNCTION public.merge_duplicate_products_by_name_safe()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  dup RECORD;
  keeper_id uuid;
  merge_data RECORD;
BEGIN
  FOR dup IN 
    SELECT organization_id, name, array_agg(id ORDER BY created_at) AS ids
    FROM brand_products
    WHERE name IS NOT NULL AND name != ''
    GROUP BY organization_id, name
    HAVING COUNT(*) > 1
  LOOP
    -- Choose keeper: prioritize products with the most non-null rich fields
    SELECT id INTO keeper_id
    FROM brand_products
    WHERE id = ANY(dup.ids)
    ORDER BY (
      -- Count rich field completeness (49-field CSV data)
      (CASE WHEN visual_world IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN top_notes IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN middle_notes IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN base_notes IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN archetype_hero_enabled = true THEN 1 ELSE 0 END) +
      (CASE WHEN archetype_flatlay_enabled = true THEN 1 ELSE 0 END) +
      (CASE WHEN moral_philosophy IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN description IS NOT NULL AND length(description) > 100 THEN 1 ELSE 0 END)
    ) DESC, created_at
    LIMIT 1;

    -- Aggregate values from ALL duplicates (Shopify + CSV data)
    SELECT 
      -- Shopify data (prefer from products with shopify_product_id)
      COALESCE(
        MAX(shopify_product_id) FILTER (WHERE shopify_product_id IS NOT NULL),
        (SELECT shopify_product_id FROM brand_products WHERE id = keeper_id)
      ) AS shopify_product_id_agg,
      COALESCE(
        MAX(shopify_variant_id) FILTER (WHERE shopify_variant_id IS NOT NULL),
        (SELECT shopify_variant_id FROM brand_products WHERE id = keeper_id)
      ) AS shopify_variant_id_agg,
      GREATEST(
        MAX(last_shopify_sync),
        (SELECT last_shopify_sync FROM brand_products WHERE id = keeper_id)
      ) AS last_sync_agg,
      -- Handle
      COALESCE(
        MAX(handle) FILTER (WHERE handle IS NOT NULL AND handle <> ''),
        (SELECT handle FROM brand_products WHERE id = keeper_id)
      ) AS handle_agg,
      -- Description (prefer longer ones)
      COALESCE(
        MAX(description) FILTER (WHERE description IS NOT NULL AND length(description) > 100),
        MAX(description) FILTER (WHERE description IS NOT NULL),
        (SELECT description FROM brand_products WHERE id = keeper_id)
      ) AS description_agg
    INTO merge_data
    FROM brand_products
    WHERE id = ANY(dup.ids);

    -- Delete all non-keeper rows FIRST to avoid unique violations
    DELETE FROM brand_products
    WHERE id = ANY(dup.ids)
      AND id <> keeper_id;

    -- Update keeper with aggregated data (preserving rich CSV fields)
    UPDATE brand_products
    SET 
      shopify_product_id = COALESCE(shopify_product_id, merge_data.shopify_product_id_agg),
      shopify_variant_id = COALESCE(shopify_variant_id, merge_data.shopify_variant_id_agg),
      last_shopify_sync = COALESCE(merge_data.last_sync_agg, last_shopify_sync),
      handle = COALESCE(handle, merge_data.handle_agg),
      description = COALESCE(description, merge_data.description_agg),
      updated_at = now()
    WHERE id = keeper_id;
  END LOOP;
END;
$function$;