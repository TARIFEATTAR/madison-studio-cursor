import { useOrganization } from "@/hooks/useOrganization";

/**
 * Returns true when the current organization has the Grid Pipeline feature
 * enabled via `organizations.brand_config.features.grid_pipeline = true`.
 *
 * Used to gate the Best Bottles-specific Pipeline page + nav entry. Flipping
 * the flag is a one-line SQL/UI update per org; no code deploy needed.
 */
export function useGridPipelineFeatureFlag(): {
  enabled: boolean;
  isLoading: boolean;
  organizationId: string | null;
} {
  const { organization, isLoading } = useOrganization();

  // brand_config is a JSONB column; we use optional chaining against the
  // typed shape defined in src/types/shared.ts, falling back to `any` via
  // index access since `features` isn't strongly typed yet.
  const features = (organization as unknown as { brand_config?: { features?: Record<string, unknown> } })
    ?.brand_config?.features;
  const enabled = features?.grid_pipeline === true;

  return {
    enabled,
    isLoading,
    organizationId: organization?.id ?? null,
  };
}
