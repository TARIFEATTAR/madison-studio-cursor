-- Add product_type column to brand_products table
ALTER TABLE public.brand_products 
ADD COLUMN product_type TEXT;