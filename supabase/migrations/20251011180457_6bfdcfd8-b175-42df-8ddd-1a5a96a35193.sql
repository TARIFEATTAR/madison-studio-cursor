-- Add category support to brand_knowledge table
-- No schema changes needed, we'll use knowledge_type field with new values:
-- 'category_personal_fragrance', 'category_home_fragrance', 'category_skincare'
-- 'product_type_*' for specific product types within each category

-- Add comment to document the category knowledge types
COMMENT ON COLUMN brand_knowledge.knowledge_type IS 'Types: voice, vocabulary, examples, structure, category_personal_fragrance, category_home_fragrance, category_skincare, product_type_*';

-- Add index for faster category queries
CREATE INDEX IF NOT EXISTS idx_brand_knowledge_category 
ON brand_knowledge(organization_id, knowledge_type) 
WHERE knowledge_type LIKE 'category_%' OR knowledge_type LIKE 'product_type_%';