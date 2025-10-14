
-- Clean all brand knowledge for Tarife Attar organization
DELETE FROM brand_knowledge 
WHERE organization_id = '79c923b3-91e5-4f0a-ad50-9806131107b3';

-- Clean all brand documents for Tarife Attar organization  
DELETE FROM brand_documents 
WHERE organization_id = '79c923b3-91e5-4f0a-ad50-9806131107b3';

-- Reset brand_config in organizations table for Tarife Attar
UPDATE organizations
SET brand_config = '{}'::jsonb
WHERE id = '79c923b3-91e5-4f0a-ad50-9806131107b3';
