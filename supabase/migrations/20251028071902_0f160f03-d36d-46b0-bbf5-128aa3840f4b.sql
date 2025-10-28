-- Create safe merge function that deduplicates by (organization_id, name) without violating unique Shopify constraints
CREATE OR REPLACE FUNCTION public.merge_duplicate_products_by_name_safe()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  dup RECORD;
  keeper_id uuid;
  agg_description text;
  agg_last_sync timestamptz;
  agg_handle text;
BEGIN
  FOR dup IN 
    SELECT organization_id, name, array_agg(id ORDER BY created_at) AS ids
    FROM brand_products
    WHERE name IS NOT NULL AND name != ''
    GROUP BY organization_id, name
    HAVING COUNT(*) > 1
  LOOP
    -- Choose keeper: prefer row that already has Shopify link, else oldest
    SELECT id INTO keeper_id
    FROM brand_products
    WHERE id = ANY(dup.ids)
    ORDER BY (shopify_product_id IS NULL), created_at
    LIMIT 1;

    -- Aggregate values we want to preserve from duplicates BEFORE deleting
    SELECT 
      COALESCE(MAX(description) FILTER (WHERE description IS NOT NULL), (SELECT description FROM brand_products WHERE id = keeper_id)) AS description,
      GREATEST(MAX(last_shopify_sync), (SELECT last_shopify_sync FROM brand_products WHERE id = keeper_id)) AS last_sync,
      COALESCE(MAX(handle) FILTER (WHERE handle IS NOT NULL AND handle <> ''), (SELECT handle FROM brand_products WHERE id = keeper_id)) AS handle_val
    INTO agg_description, agg_last_sync, agg_handle
    FROM brand_products
    WHERE id = ANY(dup.ids);

    -- Delete all non-keeper rows first to avoid unique violations
    DELETE FROM brand_products
    WHERE id = ANY(dup.ids)
      AND id <> keeper_id;

    -- Update keeper with aggregated fields (do NOT touch Shopify IDs)
    UPDATE brand_products
    SET 
      description = COALESCE(description, agg_description),
      last_shopify_sync = COALESCE(agg_last_sync, last_shopify_sync),
      handle = COALESCE(handle, agg_handle),
      updated_at = now()
    WHERE id = keeper_id;
  END LOOP;
END;
$$;

-- Run the safe merge once
SELECT public.merge_duplicate_products_by_name_safe();

-- Add unique constraint on (organization_id, name) to prevent future duplicates
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.brand_products
    ADD CONSTRAINT brand_products_org_name_unique UNIQUE (organization_id, name);
  EXCEPTION WHEN duplicate_table THEN
    -- Constraint already exists; ignore
    NULL;
  END;
END $$;