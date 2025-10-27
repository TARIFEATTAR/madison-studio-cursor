-- Complete brand knowledge reset for Tarife Attär organization
-- This only affects the Tarife Attär org, Madison system remains untouched

-- Step 1: Delete all brand knowledge entries for Tarife Attär
DELETE FROM brand_knowledge 
WHERE organization_id IN (
  SELECT id FROM organizations 
  WHERE name ILIKE '%Tarife%' OR name ILIKE '%Attär%' OR name ILIKE '%Attar%'
);

-- Step 2: Delete all brand documents for Tarife Attär
DELETE FROM brand_documents
WHERE organization_id IN (
  SELECT id FROM organizations 
  WHERE name ILIKE '%Tarife%' OR name ILIKE '%Attär%' OR name ILIKE '%Attar%'
);

-- Step 3: Clear brand_config JSON in organizations table
UPDATE organizations
SET brand_config = '{}'::jsonb,
    updated_at = now()
WHERE name ILIKE '%Tarife%' OR name ILIKE '%Attär%' OR name ILIKE '%Attar%';

-- Verification query (optional - just to confirm)
-- SELECT COUNT(*) as remaining_knowledge FROM brand_knowledge WHERE organization_id IN (SELECT id FROM organizations WHERE name ILIKE '%Tarife%');
-- Should return 0