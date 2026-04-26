/**
 * Operator-editable overrides for paper-doll prompt descriptors.
 *
 * Code defaults in src/config/familyShapeDescriptors.ts and
 * src/config/applicatorShapeDescriptors.ts are the safety net. Rows in
 * Supabase `prompt_descriptors` override those defaults per-organization,
 * so the descriptors editor UI can tune prompts without code edits.
 *
 * Lookup convention used by the cache:
 *   "family:<FamilyName>"           e.g. "family:Empire"
 *   "applicator:<ApplicatorName>"   e.g. "applicator:Vintage Bulb Sprayer"
 *   "body_variant:<variant>"        e.g. "body_variant:with-tube"
 */

import { supabase } from "@/integrations/supabase/client";

export type PromptDescriptorType = "family" | "applicator" | "body_variant";

export interface PromptDescriptorRow {
  id: string;
  organization_id: string;
  descriptor_type: PromptDescriptorType;
  descriptor_key: string;
  descriptor_text: string;
  updated_at: string;
  updated_by: string | null;
}

/** In-memory map: "type:key" → descriptor text. Lookup-friendly for the assembler. */
export type PromptDescriptorOverrides = Map<string, string>;

function cacheKey(type: PromptDescriptorType, key: string): string {
  return `${type}:${key}`;
}

export async function loadDescriptorOverrides(
  organizationId: string,
): Promise<PromptDescriptorOverrides> {
  const { data, error } = await supabase
    // Pre-existing tables in the generated types don't include this new
    // table until types are regenerated. Cast to any until then.
    .from("prompt_descriptors" as never)
    .select("descriptor_type, descriptor_key, descriptor_text")
    .eq("organization_id", organizationId);

  if (error) throw error;
  const map: PromptDescriptorOverrides = new Map();
  for (const row of (data ?? []) as Array<{
    descriptor_type: PromptDescriptorType;
    descriptor_key: string;
    descriptor_text: string;
  }>) {
    map.set(cacheKey(row.descriptor_type, row.descriptor_key), row.descriptor_text);
  }
  return map;
}

export async function saveDescriptorOverride(params: {
  organizationId: string;
  userId: string | null;
  descriptorType: PromptDescriptorType;
  descriptorKey: string;
  descriptorText: string;
}): Promise<void> {
  const { error } = await supabase
    .from("prompt_descriptors" as never)
    .upsert(
      {
        organization_id: params.organizationId,
        descriptor_type: params.descriptorType,
        descriptor_key: params.descriptorKey,
        descriptor_text: params.descriptorText,
        updated_by: params.userId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "organization_id,descriptor_type,descriptor_key" },
    );
  if (error) throw error;
}

export async function clearDescriptorOverride(params: {
  organizationId: string;
  descriptorType: PromptDescriptorType;
  descriptorKey: string;
}): Promise<void> {
  const { error } = await supabase
    .from("prompt_descriptors" as never)
    .delete()
    .eq("organization_id", params.organizationId)
    .eq("descriptor_type", params.descriptorType)
    .eq("descriptor_key", params.descriptorKey);
  if (error) throw error;
}

/** Look up a descriptor override by (type, key). Returns undefined when no override exists. */
export function getOverride(
  overrides: PromptDescriptorOverrides | null | undefined,
  type: PromptDescriptorType,
  key: string,
): string | undefined {
  if (!overrides) return undefined;
  return overrides.get(cacheKey(type, key));
}
