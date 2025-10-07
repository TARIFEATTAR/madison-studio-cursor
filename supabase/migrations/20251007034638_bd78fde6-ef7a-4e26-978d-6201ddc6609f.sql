-- Remove the sub_collection column from brand_products table
ALTER TABLE public.brand_products DROP COLUMN IF EXISTS sub_collection;