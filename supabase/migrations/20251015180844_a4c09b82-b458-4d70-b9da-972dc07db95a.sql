-- Add formulation_type values to products based on collection
-- This enables Madison to use correct terminology for each product line

-- Update Purity collection products
UPDATE brand_products 
SET formulation_type = 'Purity'
WHERE collection = 'Purity';

-- Update Cadence collection products  
UPDATE brand_products
SET formulation_type = 'Composed'
WHERE collection = 'Cadence';

-- Update Sacred Space collection products
UPDATE brand_products
SET formulation_type = 'Natural Resins & Incense'
WHERE collection = 'Sacred Space';

-- Create an enum type for formulation types to ensure data consistency
CREATE TYPE formulation_type_enum AS ENUM ('Purity', 'Composed', 'Natural Resins & Incense');

-- Add a check constraint to ensure only valid formulation types can be used
-- (We use CHECK instead of changing column type to avoid breaking existing code)
ALTER TABLE brand_products 
ADD CONSTRAINT formulation_type_valid 
CHECK (
  formulation_type IS NULL OR 
  formulation_type IN ('Purity', 'Composed', 'Natural Resins & Incense')
);

-- Add index for better query performance when filtering by formulation type
CREATE INDEX idx_brand_products_formulation_type ON brand_products(formulation_type);

-- Add a helpful comment explaining the formulation types
COMMENT ON COLUMN brand_products.formulation_type IS 
'Product line classification: Purity (100% pure oils), Composed (aromatic blends of natural + synthetic), Natural Resins & Incense (traditional burning materials)';