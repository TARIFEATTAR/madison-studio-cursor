-- Add sub_collection column to brand_products table
ALTER TABLE public.brand_products 
ADD COLUMN sub_collection TEXT;