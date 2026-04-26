import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { PipelineGroup } from "@/lib/bestBottlesPipeline";

function normalizeSku(s: string | null | undefined): string | null {
  if (s == null || typeof s !== "string") return null;
  const t = s.trim();
  return t.length > 0 ? t : null;
}

/**
 * Resolves the Best Bottles grid-pipeline tracker row for a Product Hub SKU.
 * Matches, in order: primary_website_sku, primary_grace_sku, then tokens in
 * all_legacy_skus (comma/semicolon separated). Fetches org rows once and
 * scans client-side so SKUs with special characters do not break PostgREST
 * `or()` strings.
 */
export function usePipelineGroupForProduct(
  organizationId: string | null | undefined,
  sku: string | null | undefined,
  parentSku: string | null | undefined,
) {
  const primary = normalizeSku(sku);
  const parent = normalizeSku(parentSku);
  const lookupSet = new Set(
    [primary, parent].filter((x): x is string => x != null).map((s) => s.toLowerCase()),
  );

  return useQuery({
    queryKey: ["pipeline-group-for-product", organizationId, primary, parent],
    enabled: !!organizationId && lookupSet.size > 0,
    staleTime: 60 * 1000,
    queryFn: async (): Promise<PipelineGroup | null> => {
      if (!organizationId || lookupSet.size === 0) return null;

      const { data: rows, error } = await supabase
        .from("best_bottles_pipeline_groups")
        .select("*")
        .eq("organization_id", organizationId);

      if (error) throw error;
      const list = (rows ?? []) as PipelineGroup[];

      for (const row of list) {
        const pws = normalizeSku(row.primary_website_sku)?.toLowerCase();
        const pgs = normalizeSku(row.primary_grace_sku)?.toLowerCase();
        if (pws && lookupSet.has(pws)) return row;
        if (pgs && lookupSet.has(pgs)) return row;
      }

      const legacyParts = (row: PipelineGroup): string[] => {
        const raw = row.all_legacy_skus;
        if (raw == null || String(raw).trim() === "") return [];
        return String(raw)
          .split(/[,;]/)
          .map((p) => p.trim().toLowerCase())
          .filter(Boolean);
      };

      for (const row of list) {
        for (const part of legacyParts(row)) {
          if (lookupSet.has(part)) return row;
        }
      }

      return null;
    },
  });
}
