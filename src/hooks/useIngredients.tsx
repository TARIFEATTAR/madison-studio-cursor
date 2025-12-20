import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOnboarding } from "./useOnboarding";
import { useToast } from "./use-toast";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type IngredientOrigin = 
  | "natural" 
  | "natural_derived" 
  | "synthetic" 
  | "biotechnology" 
  | "mineral" 
  | "unknown";

export interface IngredientLibraryItem {
  id: string;
  organization_id: string | null; // NULL for global ingredients
  name: string;
  inci_name: string | null;
  common_names?: string[];
  category: string | null;
  function: string[]; // Actual DB column name
  description: string | null;
  benefits?: string[];
  concerns?: string[];
  source: string | null; // plant, synthetic, mineral, animal
  is_natural?: boolean;
  is_organic_available?: boolean;
  ewg_score?: number;
  comedogenic_rating?: number;
  irritation_potential?: string;
  hero_claim?: string;
  story?: string;
  ai_description?: string;
  // Compliance fields (may or may not exist)
  cas_number?: string | null;
  einecs_number?: string | null;
  is_allergen?: boolean;
  allergen_ids?: string[];
  contains_allergens?: string[];
  source_material?: string | null;
  is_vegan?: boolean | null;
  is_cruelty_free?: boolean | null;
  is_organic?: boolean | null;
  is_halal?: boolean | null;
  is_kosher?: boolean | null;
  cosmetic_function?: string[];
  max_usage_percent?: number | null;
  regulatory_notes?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

export interface ProductIngredient {
  id: string;
  product_id: string;
  ingredient_id: string | null;
  sort_order: number;
  concentration_percent: number | null;
  concentration_display: string | null;
  is_hero_ingredient: boolean;
  is_active: boolean;
  role_in_product: string | null;
  highlight_in_copy: boolean;
  marketing_claim: string | null;
  inci_name: string | null;
  origin: string | null;
  contains_allergens: string[];
  requires_disclosure: boolean;
  // Joined from ingredient_library
  ingredient?: IngredientLibraryItem;
  // Manual entry (if not from library)
  custom_name?: string;
}

export interface DetectedAllergen {
  allergen_name: string;
  inci_name: string;
  source_ingredient: string;
  allergen_type: string;
  disclosure_threshold: number;
  requires_disclosure: boolean;
  warning_text: string;
}

export interface Certification {
  id: string;
  product_id: string;
  certification_type: string;
  certifying_body: string | null;
  certificate_number: string | null;
  status: "claimed" | "pending" | "certified" | "expired" | "revoked";
  issued_date: string | null;
  expiry_date: string | null;
  show_on_label: boolean;
  show_on_website: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

export const INGREDIENT_ORIGINS: { value: IngredientOrigin; label: string; description: string }[] = [
  { value: "natural", label: "Natural", description: "Derived directly from plants, animals, or minerals" },
  { value: "natural_derived", label: "Nature-Derived", description: "Chemically modified from natural sources" },
  { value: "synthetic", label: "Synthetic", description: "Created through chemical synthesis" },
  { value: "biotechnology", label: "Biotechnology", description: "Produced using fermentation or bioengineering" },
  { value: "mineral", label: "Mineral", description: "Derived from mineral sources" },
  { value: "unknown", label: "Unknown", description: "Origin not specified" },
];

export const COSMETIC_FUNCTIONS = [
  "Emollient",
  "Humectant",
  "Preservative",
  "Fragrance",
  "Colorant",
  "Surfactant",
  "Emulsifier",
  "Thickener",
  "Antioxidant",
  "pH Adjuster",
  "Chelating Agent",
  "Solvent",
  "Film Former",
  "Conditioning Agent",
  "UV Filter",
  "Active Ingredient",
  "Botanical Extract",
  "Essential Oil",
  "Carrier Oil",
];

export const CERTIFICATION_TYPES: { value: string; label: string; icon: string }[] = [
  { value: "cruelty_free", label: "Cruelty-Free", icon: "🐰" },
  { value: "vegan", label: "Vegan", icon: "🌱" },
  { value: "organic", label: "Organic", icon: "🌿" },
  { value: "natural", label: "Natural", icon: "🍃" },
  { value: "halal", label: "Halal", icon: "☪️" },
  { value: "kosher", label: "Kosher", icon: "✡️" },
  { value: "fair_trade", label: "Fair Trade", icon: "🤝" },
  { value: "leaping_bunny", label: "Leaping Bunny", icon: "🐇" },
  { value: "peta", label: "PETA Approved", icon: "🐾" },
  { value: "ecocert", label: "ECOCERT", icon: "🌍" },
  { value: "cosmos", label: "COSMOS", icon: "✨" },
  { value: "usda_organic", label: "USDA Organic", icon: "🇺🇸" },
  { value: "b_corp", label: "B Corp", icon: "🅱️" },
  { value: "climate_neutral", label: "Climate Neutral", icon: "🌡️" },
  { value: "plastic_free", label: "Plastic-Free", icon: "♻️" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

export function useIngredientLibrary(options: { query?: string; enabled?: boolean } = {}) {
  const { currentOrganizationId } = useOnboarding();
  const { query = "", enabled = true } = options;

  return useQuery({
    queryKey: ["ingredient-library", currentOrganizationId, query],
    queryFn: async () => {
      const searchTerm = query?.trim().toLowerCase() || "";
      
      console.log("[IngredientLibrary] Fetching with:", { 
        orgId: currentOrganizationId, 
        searchTerm,
        enabled 
      });

      // Fetch both global ingredients (org_id IS NULL) and org-specific
      const { data, error } = await supabase
        .from("ingredient_library")
        .select("*")
        .or(
          currentOrganizationId 
            ? `organization_id.is.null,organization_id.eq.${currentOrganizationId}`
            : `organization_id.is.null`
        )
        .order("name", { ascending: true })
        .limit(200);

      console.log("[IngredientLibrary] Raw response:", { 
        dataCount: data?.length || 0, 
        error,
        firstItem: data?.[0]
      });

      if (error) {
        console.error("[IngredientLibrary] Fetch error:", error);
        return [];
      }

      let results = (data || []) as IngredientLibraryItem[];

      // Client-side search filter
      if (searchTerm.length > 0) {
        results = results.filter(
          (ing) =>
            ing.name?.toLowerCase().includes(searchTerm) ||
            ing.inci_name?.toLowerCase().includes(searchTerm)
        );
        console.log("[IngredientLibrary] After filter:", results.length, "results for", searchTerm);
      }

      return results.slice(0, 50);
    },
    enabled: enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useProductIngredients(productId: string | null) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useOnboarding();

  // Fetch ingredients for product
  const {
    data: ingredients = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product-ingredients", productId],
    queryFn: async () => {
      if (!productId) return [];

      const { data, error } = await supabase
        .from("product_ingredients")
        .select(`
          *,
          ingredient:ingredient_library(*)
        `)
        .eq("product_id", productId)
        .order("sort_order", { ascending: true });

      // Handle table not existing gracefully
      if (error) {
        if (error.code === "PGRST116" || error.code === "42P01") {
          return [];
        }
        throw error;
      }
      return (data || []) as ProductIngredient[];
    },
    enabled: !!productId,
    staleTime: 30 * 1000, // Cache for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    retry: 1, // Only retry once
  });

  // Add ingredient to product
  const addIngredient = useMutation({
    mutationFn: async (input: {
      ingredient_id?: string;
      custom_name?: string;
      inci_name?: string;
      concentration_percent?: number;
      origin?: IngredientOrigin;
      is_hero_ingredient?: boolean;
      role_in_product?: string;
    }) => {
      if (!productId) throw new Error("No product selected");

      // Get current max sort order
      const maxOrder = ingredients.reduce(
        (max, ing) => Math.max(max, ing.sort_order),
        -1
      );

      const { data, error } = await supabase
        .from("product_ingredients")
        .insert({
          product_id: productId,
          ingredient_id: input.ingredient_id || null,
          inci_name: input.inci_name || input.custom_name || null,
          concentration_percent: input.concentration_percent,
          origin: input.origin,
          is_hero_ingredient: input.is_hero_ingredient || false,
          role_in_product: input.role_in_product,
          sort_order: maxOrder + 1,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-ingredients", productId] });
      toast({ title: "Ingredient added" });
    },
    onError: (error) => {
      console.error("Error adding ingredient:", error);
      toast({ title: "Error", description: "Failed to add ingredient", variant: "destructive" });
    },
  });

  // Update ingredient
  const updateIngredient = useMutation({
    mutationFn: async (input: Partial<ProductIngredient> & { id: string }) => {
      const { id, ...updates } = input;

      const { data, error } = await supabase
        .from("product_ingredients")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-ingredients", productId] });
    },
    onError: (error) => {
      console.error("Error updating ingredient:", error);
      toast({ title: "Error", description: "Failed to update ingredient", variant: "destructive" });
    },
  });

  // Remove ingredient
  const removeIngredient = useMutation({
    mutationFn: async (ingredientId: string) => {
      const { error } = await supabase
        .from("product_ingredients")
        .delete()
        .eq("id", ingredientId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-ingredients", productId] });
      toast({ title: "Ingredient removed" });
    },
    onError: (error) => {
      console.error("Error removing ingredient:", error);
      toast({ title: "Error", description: "Failed to remove ingredient", variant: "destructive" });
    },
  });

  // Reorder ingredients
  const reorderIngredients = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const updates = orderedIds.map((id, index) => ({
        id,
        sort_order: index,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from("product_ingredients")
          .update({ sort_order: update.sort_order })
          .eq("id", update.id);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-ingredients", productId] });
    },
  });

  // Add to library
  const addToLibrary = useMutation({
    mutationFn: async (input: {
      name: string;
      inci_name?: string;
      source?: string;
      function?: string[];
    }) => {
      if (!currentOrganizationId) throw new Error("No organization");

      const { data, error } = await supabase
        .from("ingredient_library")
        .insert({
          organization_id: currentOrganizationId,
          name: input.name,
          inci_name: input.inci_name,
          source: input.source,
          function: input.function || [],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredient-library"] });
      toast({ title: "Added to library" });
    },
    onError: (error) => {
      console.error("Error adding to library:", error);
      toast({ title: "Error", description: "Failed to add to library", variant: "destructive" });
    },
  });

  return {
    ingredients,
    isLoading,
    error,
    addIngredient,
    updateIngredient,
    removeIngredient,
    reorderIngredients,
    addToLibrary,
  };
}

export function useProductCertifications(productId: string | null) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: certifications = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product-certifications", productId],
    queryFn: async () => {
      if (!productId) return [];

      const { data, error } = await supabase
        .from("product_certifications")
        .select("*")
        .eq("product_id", productId);

      // Handle table not existing gracefully
      if (error) {
        if (error.code === "PGRST116" || error.code === "42P01") {
          return [];
        }
        throw error;
      }
      return (data || []) as Certification[];
    },
    enabled: !!productId,
    staleTime: 60 * 1000, // Cache for 1 minute
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    retry: 1, // Only retry once
  });

  const toggleCertification = useMutation({
    mutationFn: async (certType: string) => {
      if (!productId) throw new Error("No product");

      const existing = certifications.find((c) => c.certification_type === certType);

      if (existing) {
        // Remove
        const { error } = await supabase
          .from("product_certifications")
          .delete()
          .eq("id", existing.id);

        if (error) throw error;
        return { action: "removed", type: certType };
      } else {
        // Add
        const { error } = await supabase
          .from("product_certifications")
          .insert({
            product_id: productId,
            certification_type: certType,
            status: "claimed",
          });

        if (error) throw error;
        return { action: "added", type: certType };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["product-certifications", productId] });
      toast({
        title: result.action === "added" ? "Certification added" : "Certification removed",
      });
    },
    onError: (error) => {
      console.error("Error toggling certification:", error);
      toast({ title: "Error", variant: "destructive" });
    },
  });

  const updateCertification = useMutation({
    mutationFn: async (input: Partial<Certification> & { id: string }) => {
      const { id, ...updates } = input;

      const { data, error } = await supabase
        .from("product_certifications")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-certifications", productId] });
    },
  });

  return {
    certifications,
    isLoading,
    error,
    toggleCertification,
    updateCertification,
    hasCertification: (type: string) => certifications.some((c) => c.certification_type === type),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// API HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

export async function detectAllergens(
  ingredients: Array<{ name: string; inci_name?: string; concentration_percent?: number }>,
  productType: "leave_on" | "rinse_off" = "leave_on"
) {
  const { data, error } = await supabase.functions.invoke("detect-allergens", {
    body: { ingredients, product_type: productType },
  });

  if (error) throw error;
  return data as {
    detected_allergens: DetectedAllergen[];
    allergen_count: number;
    requires_disclosure_count: number;
    warnings: string[];
    label_allergens: string[];
  };
}

export async function generateInciList(
  ingredients: Array<{ name: string; inci_name?: string; concentration_percent?: number; is_allergen?: boolean }>,
  options?: { format?: "eu" | "us" | "simple"; include_percentages?: boolean }
) {
  const { data, error } = await supabase.functions.invoke("generate-inci-list", {
    body: { ingredients, options },
  });

  if (error) throw error;
  return data as {
    formatted_list: string;
    copy_ready: string;
    line_break_list: string;
    ingredient_count: number;
    allergen_list: string[];
    allergen_count: number;
  };
}

export async function generateLabelText(input: {
  product_name: string;
  product_type?: string;
  net_weight?: string;
  ingredients: Array<{ name: string; inci_name?: string; concentration_percent?: number }>;
  allergens: string[];
  certifications: string[];
  warnings?: string[];
  usage_instructions?: string;
  brand_name?: string;
  region: "eu" | "us" | "both";
}) {
  const { data, error } = await supabase.functions.invoke("generate-label-text", {
    body: input,
  });

  if (error) throw error;
  return data as {
    eu_label: string;
    us_label: string;
    inci_list: string;
    allergen_warning: string;
  };
}
