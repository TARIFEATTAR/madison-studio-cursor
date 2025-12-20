// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT MEDIA HOOK
// Manages product images/videos from DAM and external URLs
// ═══════════════════════════════════════════════════════════════════════════════

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type RelationshipType = 
  | "hero_image"
  | "gallery"
  | "lifestyle"
  | "detail"
  | "packaging"
  | "ingredient"
  | "before_after"
  | "video"
  | "document"
  | "social"
  | "email"
  | "other";

export type ExternalProvider = 
  | "google_drive"
  | "dropbox"
  | "onedrive"
  | "box"
  | "s3"
  | "cloudflare_r2"
  | "direct_url"
  | "other";

export interface ProductMediaAsset {
  id: string;
  product_id: string;
  asset_id: string | null;
  relationship_type: RelationshipType;
  label: string | null;
  notes: string | null;
  position: number;
  is_primary: boolean;
  external_url: string | null;
  external_provider: ExternalProvider | null;
  external_thumbnail_url: string | null;
  external_filename: string | null;
  external_mime_type: string | null;
  created_at: string;
  // Joined DAM asset data
  dam_asset?: {
    id: string;
    file_url: string;
    thumbnail_url: string | null;
    filename: string;
    mime_type: string;
  } | null;
}

export interface AddExternalAssetInput {
  product_id: string;
  external_url: string;
  external_provider: ExternalProvider;
  relationship_type: RelationshipType;
  label?: string;
  is_primary?: boolean;
}

export interface AddDamAssetInput {
  product_id: string;
  asset_id: string;
  relationship_type: RelationshipType;
  label?: string;
  is_primary?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function useProductMedia(productId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey = ["product-media", productId];

  // ─────────────────────────────────────────────────────────────────────────────
  // FETCH ASSETS
  // ─────────────────────────────────────────────────────────────────────────────

  const {
    data: assets = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_hub_assets")
        .select(`
          *,
          dam_asset:dam_assets(
            id,
            file_url,
            thumbnail_url,
            filename,
            mime_type
          )
        `)
        .eq("product_id", productId)
        .order("position", { ascending: true })
        .order("created_at", { ascending: true });

      // Handle table not existing gracefully
      if (error) {
        if (error.code === "PGRST116" || error.code === "42P01") {
          return [];
        }
        throw error;
      }
      return (data || []) as ProductMediaAsset[];
    },
    enabled: !!productId,
    staleTime: 60 * 1000, // Cache for 1 minute
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    retry: 1, // Only retry once
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // ADD EXTERNAL ASSET
  // ─────────────────────────────────────────────────────────────────────────────

  const addExternalAsset = useMutation({
    mutationFn: async (input: AddExternalAssetInput) => {
      // Get next position
      const maxPosition = assets
        .filter((a) => a.relationship_type === input.relationship_type)
        .reduce((max, a) => Math.max(max, a.position), -1);

      const { data, error } = await supabase
        .from("product_hub_assets")
        .insert({
          product_id: input.product_id,
          external_url: input.external_url,
          external_provider: input.external_provider,
          relationship_type: input.relationship_type,
          label: input.label || null,
          is_primary: input.is_primary || false,
          position: maxPosition + 1,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Image added",
        description: "External image has been linked to this product.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add image",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // ADD DAM ASSET
  // ─────────────────────────────────────────────────────────────────────────────

  const addDamAsset = useMutation({
    mutationFn: async (input: AddDamAssetInput) => {
      const maxPosition = assets
        .filter((a) => a.relationship_type === input.relationship_type)
        .reduce((max, a) => Math.max(max, a.position), -1);

      const { data, error } = await supabase
        .from("product_hub_assets")
        .insert({
          product_id: input.product_id,
          asset_id: input.asset_id,
          relationship_type: input.relationship_type,
          label: input.label || null,
          is_primary: input.is_primary || false,
          position: maxPosition + 1,
        })
        .select(`
          *,
          dam_asset:dam_assets(
            id,
            file_url,
            thumbnail_url,
            filename,
            mime_type
          )
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Asset linked",
        description: "DAM asset has been linked to this product.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to link asset",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // REMOVE ASSET
  // ─────────────────────────────────────────────────────────────────────────────

  const removeAsset = useMutation({
    mutationFn: async (assetId: string) => {
      const { error } = await supabase
        .from("product_hub_assets")
        .delete()
        .eq("id", assetId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Image removed",
        description: "Image has been unlinked from this product.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove image",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // SET PRIMARY ASSET
  // ─────────────────────────────────────────────────────────────────────────────

  const setPrimaryAsset = useMutation({
    mutationFn: async ({ assetId, relationshipType }: { assetId: string; relationshipType: RelationshipType }) => {
      // First, unset all primary for this relationship type
      const { error: unsetError } = await supabase
        .from("product_hub_assets")
        .update({ is_primary: false })
        .eq("product_id", productId)
        .eq("relationship_type", relationshipType);

      if (unsetError) throw unsetError;

      // Then set the new primary
      const { error: setError } = await supabase
        .from("product_hub_assets")
        .update({ is_primary: true })
        .eq("id", assetId);

      if (setError) throw setError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Primary image updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update primary",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // UPDATE ASSET
  // ─────────────────────────────────────────────────────────────────────────────

  const updateAsset = useMutation({
    mutationFn: async ({ assetId, updates }: { assetId: string; updates: Partial<ProductMediaAsset> }) => {
      const { data, error } = await supabase
        .from("product_hub_assets")
        .update(updates)
        .eq("id", assetId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // REORDER ASSETS
  // ─────────────────────────────────────────────────────────────────────────────

  const reorderAssets = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const updates = orderedIds.map((id, index) => ({
        id,
        position: index,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from("product_hub_assets")
          .update({ position: update.position })
          .eq("id", update.id);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to reorder",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────────

  const getHeroImage = () => {
    return assets.find((a) => a.relationship_type === "hero_image" && a.is_primary);
  };

  const getGalleryImages = () => {
    return assets.filter((a) => a.relationship_type === "gallery");
  };

  const getAssetsByType = (type: RelationshipType) => {
    return assets.filter((a) => a.relationship_type === type);
  };

  return {
    assets,
    isLoading,
    error,
    refetch,
    addExternalAsset,
    addDamAsset,
    removeAsset,
    setPrimaryAsset,
    updateAsset,
    reorderAssets,
    // Helpers
    getHeroImage,
    getGalleryImages,
    getAssetsByType,
  };
}
