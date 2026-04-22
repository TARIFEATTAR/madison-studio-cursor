-- Best Bottles Grid Pipeline — P0a
--
-- Creates the tracker table that drives the Best Bottles hero-image
-- orchestration UI. Rows seed from the Grid-Image-Tracker.xlsx in the
-- best-bottles-website repo via a client-side CSV upload, then Madison
-- becomes the live tracker as hero images get generated and approved.
--
-- Every catalog row ("one product group that needs one hero image") gets
-- one row here. Madison-managed status columns (madison_status, consistency
-- set id, approved image id, destination-sync timestamps) layer on top of
-- the catalog columns imported from the xlsx.
--
-- Gated behind the `brand_config.features.grid_pipeline = true` flag on the
-- organization — only Best Bottles sees the UI for now.

CREATE TABLE IF NOT EXISTS public.best_bottles_pipeline_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- ── Catalog columns (from xlsx) ─────────────────────────────────
  tracker_row_number INT,
  family TEXT NOT NULL,
  capacity_ml INT,
  capacity_label TEXT,
  glass_color TEXT,
  applicator_types TEXT,
  thread_size TEXT,
  display_name TEXT NOT NULL,
  category TEXT,
  collection TEXT,
  convex_slug TEXT,
  convex_id TEXT,
  primary_grace_sku TEXT,
  primary_website_sku TEXT,
  all_legacy_skus TEXT,
  product_url TEXT,
  variant_count INT,
  price_min_cents INT,
  price_max_cents INT,

  -- Legacy hero-image fields from the xlsx (what the catalog shipped with,
  -- if any). Read-only — the source of truth for live state is the
  -- madison_* columns below.
  legacy_has_hero_image BOOLEAN DEFAULT FALSE,
  legacy_hero_image_url TEXT,

  -- ── Madison-managed status ──────────────────────────────────────
  madison_status TEXT NOT NULL DEFAULT 'not-started'
    CHECK (madison_status IN (
      'not-started',
      'queued',
      'generating',
      'generated',
      'qa-pending',
      'approved',
      'rejected',
      'synced'
    )),
  madison_consistency_set_id UUID,
  madison_approved_image_id UUID,
  madison_approved_at TIMESTAMPTZ,
  madison_approved_by UUID REFERENCES auth.users(id),
  madison_notes TEXT,

  -- Destination sync timestamps (P0b wires these up)
  madison_sanity_asset_id TEXT,
  madison_sanity_synced_at TIMESTAMPTZ,
  madison_convex_synced_at TIMESTAMPTZ,
  madison_shopify_synced_at TIMESTAMPTZ,
  madison_last_error TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Prevent duplicate imports per org per convex slug
  CONSTRAINT best_bottles_pipeline_groups_org_slug_unique
    UNIQUE (organization_id, convex_slug)
);

-- Indexes for common filter axes in the pipeline UI
CREATE INDEX IF NOT EXISTS idx_best_bottles_pipeline_org_family
  ON public.best_bottles_pipeline_groups (organization_id, family);

CREATE INDEX IF NOT EXISTS idx_best_bottles_pipeline_org_status
  ON public.best_bottles_pipeline_groups (organization_id, madison_status);

CREATE INDEX IF NOT EXISTS idx_best_bottles_pipeline_org_capacity
  ON public.best_bottles_pipeline_groups (organization_id, family, capacity_ml);

CREATE INDEX IF NOT EXISTS idx_best_bottles_pipeline_org_thread
  ON public.best_bottles_pipeline_groups (organization_id, family, thread_size);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.best_bottles_pipeline_groups_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS best_bottles_pipeline_groups_touch_updated_at
  ON public.best_bottles_pipeline_groups;
CREATE TRIGGER best_bottles_pipeline_groups_touch_updated_at
  BEFORE UPDATE ON public.best_bottles_pipeline_groups
  FOR EACH ROW EXECUTE FUNCTION public.best_bottles_pipeline_groups_touch_updated_at();

-- RLS: organization_members only. Policies are dropped-then-created so
-- this migration is idempotent on replay.
ALTER TABLE public.best_bottles_pipeline_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pipeline_groups_select_own_org" ON public.best_bottles_pipeline_groups;
CREATE POLICY "pipeline_groups_select_own_org"
  ON public.best_bottles_pipeline_groups
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "pipeline_groups_insert_own_org" ON public.best_bottles_pipeline_groups;
CREATE POLICY "pipeline_groups_insert_own_org"
  ON public.best_bottles_pipeline_groups
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "pipeline_groups_update_own_org" ON public.best_bottles_pipeline_groups;
CREATE POLICY "pipeline_groups_update_own_org"
  ON public.best_bottles_pipeline_groups
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "pipeline_groups_delete_own_org" ON public.best_bottles_pipeline_groups;
CREATE POLICY "pipeline_groups_delete_own_org"
  ON public.best_bottles_pipeline_groups
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

COMMENT ON TABLE public.best_bottles_pipeline_groups IS
  'Best Bottles Grid Pipeline tracker. Seeded from Grid-Image-Tracker.xlsx. Each row is one product group that needs one hero image.';
