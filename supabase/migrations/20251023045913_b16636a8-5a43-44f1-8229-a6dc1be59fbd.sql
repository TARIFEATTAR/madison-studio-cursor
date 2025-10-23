-- Add description column to brand_products table for full product descriptions
ALTER TABLE brand_products 
ADD COLUMN IF NOT EXISTS description text;