-- ═══════════════════════════════════════════════════════════════════════════════
-- VERIFY ALL TABLES WERE CREATED
-- Run this to confirm everything is set up correctly
-- ═══════════════════════════════════════════════════════════════════════════════

-- Check all new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'madison_masters',
  'visual_masters', 
  'schwartz_templates',
  'brand_dna',
  'brand_products',
  'design_systems',
  'brand_writing_examples',
  'brand_visual_examples',
  'generated_content'
)
ORDER BY table_name;

-- Check pgvector extension is enabled
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check brand_dna has correct columns
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'brand_dna'
ORDER BY ordinal_position;

-- Verify seed data (you already did this - showing for reference)
SELECT 
  'madison_masters' as table_name, COUNT(*) as count FROM madison_masters
UNION ALL
SELECT 'visual_masters', COUNT(*) FROM visual_masters
UNION ALL
SELECT 'schwartz_templates', COUNT(*) FROM schwartz_templates;











