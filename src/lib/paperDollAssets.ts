/**
 * Persistence layer for approved paper-doll component assets.
 *
 * When an operator approves a slot in the Studio's Components tab, the
 * approved transparent PNG URL is written here. Sanity / Convex sync runs
 * downstream of this table — either via the existing local
 * `sanity_upload_components.py` pipeline (which can read from a CSV export
 * of this table) or a future automated push.
 */

import { supabase } from "@/integrations/supabase/client";

export type PaperDollAssetRole = "body" | "fitment" | "cap" | "roller";
export type PaperDollBodyVariant = "no-tube" | "with-tube";
export type PaperDollAssetSource = "uploaded" | "generated" | "enhanced";

export interface PaperDollApprovedAssetInput {
  organizationId: string;
  userId: string | null;
  cohortSlug: string;
  family: string;
  capacityMl: number | null;
  glassColor: string | null;
  role: PaperDollAssetRole;
  bodyVariant: PaperDollBodyVariant | null;
  applicator: string | null;
  capColor: string | null;
  imageUrl: string;
  sourceImageUrl: string | null;
  source: PaperDollAssetSource;
  libraryImageId: string | null;
  notes?: string | null;
}

export interface PaperDollApprovedAssetRow {
  id: string;
  organization_id: string;
  cohort_slug: string;
  family: string;
  capacity_ml: number | null;
  glass_color: string | null;
  role: PaperDollAssetRole;
  body_variant: PaperDollBodyVariant | null;
  applicator: string | null;
  cap_color: string | null;
  image_url: string;
  library_image_id: string | null;
  source_image_url: string | null;
  source: PaperDollAssetSource;
  approved_at: string;
  approved_by: string | null;
  notes: string | null;
}

/**
 * Upsert an approved asset for a cohort slot. Re-approving the same slot
 * overwrites the prior URL (matched on org × cohort × role × body_variant
 * × applicator × cap_color).
 */
export async function upsertApprovedAsset(
  input: PaperDollApprovedAssetInput,
): Promise<PaperDollApprovedAssetRow> {
  const payload = {
    organization_id: input.organizationId,
    cohort_slug: input.cohortSlug,
    family: input.family,
    capacity_ml: input.capacityMl,
    glass_color: input.glassColor,
    role: input.role,
    body_variant: input.bodyVariant,
    applicator: input.applicator,
    cap_color: input.capColor,
    image_url: input.imageUrl,
    source_image_url: input.sourceImageUrl,
    source: input.source,
    library_image_id: input.libraryImageId,
    approved_by: input.userId,
    approved_at: new Date().toISOString(),
    notes: input.notes ?? null,
  };

  // Delete any existing row for this slot, then insert — simulates upsert on
  // the composite unique index. Postgres-level upsert on functional unique
  // indexes is finicky through PostgREST; this two-step is more robust.
  const filterBuilder = supabase
    .from("paper_doll_approved_assets" as never)
    .delete()
    .eq("organization_id", input.organizationId)
    .eq("cohort_slug", input.cohortSlug)
    .eq("role", input.role);

  const { error: deleteError } = input.bodyVariant
    ? await filterBuilder.eq("body_variant", input.bodyVariant)
    : input.applicator
      ? await filterBuilder.eq("applicator", input.applicator).eq("cap_color", input.capColor ?? "")
      : await filterBuilder;

  if (deleteError && deleteError.code !== "PGRST116") {
    // PGRST116 = no rows found; that's fine.
    throw deleteError;
  }

  const { data, error } = await supabase
    .from("paper_doll_approved_assets" as never)
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as unknown as PaperDollApprovedAssetRow;
}

/** List all approved assets for a cohort (family + capacity + color). */
export async function listApprovedAssetsForCohort(
  organizationId: string,
  cohortSlug: string,
): Promise<PaperDollApprovedAssetRow[]> {
  const { data, error } = await supabase
    .from("paper_doll_approved_assets" as never)
    .select("*")
    .eq("organization_id", organizationId)
    .eq("cohort_slug", cohortSlug)
    .order("approved_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as PaperDollApprovedAssetRow[];
}

/** Clear approval for one slot (revert to unapproved state). */
export async function clearApprovedAsset(params: {
  organizationId: string;
  cohortSlug: string;
  role: PaperDollAssetRole;
  bodyVariant?: PaperDollBodyVariant | null;
  applicator?: string | null;
  capColor?: string | null;
}): Promise<void> {
  let q = supabase
    .from("paper_doll_approved_assets" as never)
    .delete()
    .eq("organization_id", params.organizationId)
    .eq("cohort_slug", params.cohortSlug)
    .eq("role", params.role);
  if (params.bodyVariant != null) q = q.eq("body_variant", params.bodyVariant);
  if (params.applicator != null) q = q.eq("applicator", params.applicator);
  if (params.capColor != null) q = q.eq("cap_color", params.capColor);
  const { error } = await q;
  if (error) throw error;
}

/**
 * Build a cache key matching the Components-tab slot.id pattern so the UI
 * can hydrate slot approval state from the DB on mount.
 *
 * Pattern (mirrors buildSlots in ComponentsTabPanel):
 *   body-${family}-${capacity}-${color}-${variantSuffix}
 *   fitment-${applicator}-${capColor}
 */
export function slotIdForApprovedRow(row: PaperDollApprovedAssetRow): string {
  if (row.role === "body") {
    const baseKey = `${row.family}-${row.capacity_ml ?? "?"}-${row.glass_color ?? "?"}`;
    if (row.body_variant === "with-tube") return `body-${baseKey}-withtube`;
    if (row.body_variant === "no-tube") return `body-${baseKey}-notube`;
    return `body-${baseKey}`;
  }
  return `fitment-${row.applicator ?? "?"}-${row.cap_color ?? "unspec"}`;
}
