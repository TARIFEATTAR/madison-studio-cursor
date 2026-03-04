import { supabase } from "@/integrations/supabase/client";
import type { DAMAsset } from "./types";

const SIGNED_URL_EXPIRY = 3600; // 1 hour

/**
 * Get signed URL for a DAM asset. Use when public URL fails to load.
 * Works for both public and private storage buckets.
 */
export async function getSignedAssetUrl(asset: DAMAsset): Promise<string | null> {
  const storagePath = asset.metadata?.storage_path;
  if (!storagePath) return null;

  const { data, error } = await supabase.storage
    .from("dam-assets")
    .createSignedUrl(storagePath, SIGNED_URL_EXPIRY);

  if (error) {
    console.warn("[DAM] Signed URL failed:", error.message);
    return null;
  }
  return data?.signedUrl || null;
}
