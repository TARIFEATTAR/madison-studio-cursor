-- ═══════════════════════════════════════════════════════════════════════════════
-- MADISON STUDIO - DAM USAGE TRACKING FUNCTION
-- ═══════════════════════════════════════════════════════════════════════════════
-- 
-- Function to atomically increment asset usage count
-- Created: December 19, 2025
-- ═══════════════════════════════════════════════════════════════════════════════

-- Function to increment usage count and track where asset was used
CREATE OR REPLACE FUNCTION public.increment_dam_asset_usage(
  asset_id UUID,
  used_in_data JSONB DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE public.dam_assets
  SET 
    usage_count = usage_count + 1,
    last_used_at = NOW(),
    last_used_in = COALESCE(used_in_data, last_used_in)
  WHERE id = asset_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.increment_dam_asset_usage(UUID, JSONB) TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════════════
-- COMPLETE
-- ═══════════════════════════════════════════════════════════════════════════════
