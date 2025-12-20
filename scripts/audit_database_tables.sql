-- ═══════════════════════════════════════════════════════════════════════════════
-- DATABASE AUDIT SCRIPT
-- Run this in Supabase SQL Editor to verify all tables exist
-- ═══════════════════════════════════════════════════════════════════════════════

-- Check for all critical tables from recent migrations
SELECT 
  t.table_name,
  CASE WHEN t.table_name IS NOT NULL THEN '✅ EXISTS' ELSE '❌ MISSING' END as status,
  (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM (
  VALUES 
    -- Core tables
    ('organizations'),
    ('organization_members'),
    ('profiles'),
    ('subscriptions'),
    
    -- Content tables
    ('master_content'),
    ('content_derivatives'),
    ('brand_collections'),
    ('brand_documents'),
    
    -- DAM tables (Week 5-6)
    ('dam_folders'),
    ('dam_assets'),
    ('dam_asset_tags'),
    ('dam_collections'),
    ('dam_collection_assets'),
    ('dam_favorites'),
    ('dam_usage_logs'),
    
    -- Product Hub tables (Week 6-7)
    ('product_hubs'),
    ('product_formulations'),
    ('product_ingredients'),
    ('ingredient_library'),
    ('product_hub_assets'),
    
    -- Compliance tables (Week 7)
    ('product_packaging'),
    ('product_sds'),
    ('product_certifications'),
    ('allergen_registry'),
    
    -- Team/Roles (Week 12)
    ('role_capabilities'),
    
    -- Other important tables
    ('generated_images'),
    ('prompts'),
    ('brand_scans'),
    ('weekly_schedules'),
    ('scheduled_tasks'),
    ('team_invitations')
) as t(table_name)
LEFT JOIN information_schema.tables it 
  ON it.table_name = t.table_name 
  AND it.table_schema = 'public'
ORDER BY 
  CASE WHEN it.table_name IS NULL THEN 0 ELSE 1 END,
  t.table_name;

-- Check for critical enums
SELECT 
  e.enumtypid::regtype as enum_name,
  '✅ EXISTS' as status,
  string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as values
FROM pg_enum e
WHERE e.enumtypid::regtype::text IN (
  'organization_role',
  'team_role',
  'content_type',
  'formulation_type_enum',
  'scent_family'
)
GROUP BY e.enumtypid::regtype;

-- Check for team_role column on organization_members
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'organization_members'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Summary
SELECT '=== AUDIT COMPLETE ===' as message;
