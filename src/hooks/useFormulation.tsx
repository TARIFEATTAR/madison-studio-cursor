import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type NoteType = "top" | "heart" | "base" | "modifier";
export type ConcentrationType = 
  | "parfum" 
  | "eau_de_parfum" 
  | "eau_de_toilette" 
  | "eau_de_cologne"
  | "eau_fraiche"
  | "perfume_oil"
  | "attar"
  | "solid_perfume"
  | "body_mist";

export type BaseCarrier = 
  | "alcohol"
  | "fractionated_coconut"
  | "jojoba"
  | "sweet_almond"
  | "argan"
  | "squalane"
  | "sandalwood_oil"
  | "dpg"
  | "custom";

export type Longevity = "fleeting" | "moderate" | "long_lasting" | "very_long" | "extreme";
export type Sillage = "intimate" | "moderate" | "strong" | "enormous";
export type Season = "spring" | "summer" | "fall" | "winter" | "all_season";
export type Occasion = "daily" | "office" | "evening" | "special_occasion" | "romantic" | "casual" | "formal";
export type SkinType = "normal" | "dry" | "oily" | "combination" | "sensitive" | "mature";
export type SkinConcern = "acne" | "aging" | "dryness" | "dullness" | "hyperpigmentation" | "sensitivity" | "redness" | "pores";

export interface ScentNote {
  id: string;
  name: string;
  note_type: NoteType;
  scent_family: string;
  description: string | null;
  character_tags: string[];
  intensity: string | null;
  pairs_well_with: string[];
  natural_source: string | null;
}

export interface ScentProfile {
  top: string[];
  heart: string[];
  base: string[];
}

export interface ActiveIngredient {
  name: string;
  concentration: string;
  form?: string;
}

export interface ProductFormulation {
  id: string;
  product_id: string;
  formula_code: string | null;
  formula_name: string | null;
  version: number;
  status: string;
  formulation_type: string | null;
  base_type: string | null;
  
  // Fragrance-specific
  scent_profile: ScentProfile;
  concentration_type: ConcentrationType | null;
  concentration_percent: number | null;
  base_carrier: BaseCarrier | null;
  longevity: Longevity | null;
  sillage: Sillage | null;
  season_suitability: Season[];
  occasion_suitability: Occasion[];
  scent_family: string | null;
  scent_style: string | null;
  
  // Skincare-specific
  skin_types: SkinType[];
  skin_concerns: SkinConcern[];
  active_ingredients: ActiveIngredient[];
  
  // Other fields
  ph_target: number | null;
  shelf_life_months: number | null;
  preservative_system: string | null;
  manufacturing_notes: string | null;
  stability_notes: string | null;
  
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

export const CONCENTRATION_OPTIONS: { value: ConcentrationType; label: string; range: string }[] = [
  { value: "parfum", label: "Parfum / Extrait", range: "20-30%" },
  { value: "eau_de_parfum", label: "Eau de Parfum (EDP)", range: "15-20%" },
  { value: "eau_de_toilette", label: "Eau de Toilette (EDT)", range: "5-15%" },
  { value: "eau_de_cologne", label: "Eau de Cologne", range: "2-4%" },
  { value: "eau_fraiche", label: "Eau Fraîche", range: "1-3%" },
  { value: "perfume_oil", label: "Perfume Oil", range: "15-30% in oil" },
  { value: "attar", label: "Attär / Attar", range: "Traditional oil" },
  { value: "solid_perfume", label: "Solid Perfume", range: "Wax-based" },
  { value: "body_mist", label: "Body Mist", range: "1-3%" },
];

export const BASE_CARRIER_OPTIONS: { value: BaseCarrier; label: string; description: string }[] = [
  { value: "alcohol", label: "Perfumer's Alcohol", description: "Traditional, quick evaporation" },
  { value: "fractionated_coconut", label: "Fractionated Coconut (MCT)", description: "Light, non-greasy, long shelf life" },
  { value: "jojoba", label: "Jojoba Oil", description: "Closest to skin's sebum" },
  { value: "sweet_almond", label: "Sweet Almond Oil", description: "Nourishing, subtle nutty scent" },
  { value: "argan", label: "Argan Oil", description: "Luxurious, fast-absorbing" },
  { value: "squalane", label: "Squalane", description: "Ultra-light, non-comedogenic" },
  { value: "sandalwood_oil", label: "Sandalwood Oil", description: "Traditional attar base" },
  { value: "dpg", label: "DPG (Dipropylene Glycol)", description: "Scentless, extends longevity" },
  { value: "custom", label: "Custom Blend", description: "Proprietary carrier blend" },
];

export const LONGEVITY_OPTIONS: { value: Longevity; label: string; duration: string }[] = [
  { value: "fleeting", label: "Fleeting", duration: "< 2 hours" },
  { value: "moderate", label: "Moderate", duration: "2-4 hours" },
  { value: "long_lasting", label: "Long Lasting", duration: "4-8 hours" },
  { value: "very_long", label: "Very Long", duration: "8-12 hours" },
  { value: "extreme", label: "Extreme", duration: "12+ hours" },
];

export const SILLAGE_OPTIONS: { value: Sillage; label: string; description: string }[] = [
  { value: "intimate", label: "Intimate", description: "Skin scent, close wear" },
  { value: "moderate", label: "Moderate", description: "Arm's length projection" },
  { value: "strong", label: "Strong", description: "Room-filling presence" },
  { value: "enormous", label: "Enormous", description: "Announces your arrival" },
];

export const SEASON_OPTIONS: { value: Season; label: string; icon: string }[] = [
  { value: "spring", label: "Spring", icon: "🌸" },
  { value: "summer", label: "Summer", icon: "☀️" },
  { value: "fall", label: "Fall", icon: "🍂" },
  { value: "winter", label: "Winter", icon: "❄️" },
  { value: "all_season", label: "All Season", icon: "🌍" },
];

export const OCCASION_OPTIONS: { value: Occasion; label: string }[] = [
  { value: "daily", label: "Daily Wear" },
  { value: "office", label: "Office/Work" },
  { value: "casual", label: "Casual" },
  { value: "evening", label: "Evening" },
  { value: "formal", label: "Formal" },
  { value: "romantic", label: "Romantic" },
  { value: "special_occasion", label: "Special Occasion" },
];

export const SKIN_TYPE_OPTIONS: { value: SkinType; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "dry", label: "Dry" },
  { value: "oily", label: "Oily" },
  { value: "combination", label: "Combination" },
  { value: "sensitive", label: "Sensitive" },
  { value: "mature", label: "Mature" },
];

export const SKIN_CONCERN_OPTIONS: { value: SkinConcern; label: string }[] = [
  { value: "acne", label: "Acne & Breakouts" },
  { value: "aging", label: "Aging & Fine Lines" },
  { value: "dryness", label: "Dryness & Dehydration" },
  { value: "dullness", label: "Dullness" },
  { value: "hyperpigmentation", label: "Hyperpigmentation" },
  { value: "sensitivity", label: "Sensitivity" },
  { value: "redness", label: "Redness & Rosacea" },
  { value: "pores", label: "Large Pores" },
];

export const SCENT_FAMILY_OPTIONS = [
  "Citrus",
  "Floral",
  "Oriental",
  "Woody",
  "Fresh",
  "Fougère",
  "Chypre",
  "Gourmand",
  "Aquatic",
  "Green",
  "Leather",
  "Spicy",
];

// ═══════════════════════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

export function useScentNotes(options: {
  query?: string;
  noteType?: NoteType | "all";
  scentFamily?: string;
  existingNotes?: string[];
  enabled?: boolean;
}) {
  const { query = "", noteType = "all", scentFamily, existingNotes = [], enabled = true } = options;

  return useQuery({
    queryKey: ["scent-notes", query, noteType, scentFamily, existingNotes],
    queryFn: async () => {
      // For now, fetch directly from database (edge function can be used for more complex logic)
      let dbQuery = supabase
        .from("scent_notes")
        .select("*")
        .eq("is_active", true);

      if (noteType && noteType !== "all") {
        dbQuery = dbQuery.eq("note_type", noteType);
      }

      if (scentFamily) {
        dbQuery = dbQuery.eq("scent_family", scentFamily);
      }

      if (query && query.trim().length > 0) {
        dbQuery = dbQuery.ilike("name", `%${query.trim()}%`);
      }

      if (existingNotes.length > 0) {
        dbQuery = dbQuery.not("name", "in", `(${existingNotes.join(",")})`);
      }

      dbQuery = dbQuery
        .order("usage_count", { ascending: false })
        .order("name", { ascending: true })
        .limit(20);

      const { data, error } = await dbQuery;

      if (error) throw error;
      return (data || []) as ScentNote[];
    },
    enabled: enabled,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

export function useProductFormulation(productId: string | null) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch formulation for a product
  const {
    data: formulation,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product-formulation", productId],
    queryFn: async () => {
      if (!productId) return null;

      const { data, error } = await supabase
        .from("product_formulations")
        .select("*")
        .eq("product_id", productId)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      // Parse scent_profile if it's a string
      if (data && typeof data.scent_profile === "string") {
        data.scent_profile = JSON.parse(data.scent_profile);
      }
      
      // Ensure scent_profile has default structure
      if (data && !data.scent_profile) {
        data.scent_profile = { top: [], heart: [], base: [] };
      }
      
      return data as ProductFormulation | null;
    },
    enabled: !!productId,
  });

  // Create or update formulation
  const saveFormulation = useMutation({
    mutationFn: async (input: Partial<ProductFormulation> & { product_id: string }) => {
      const { product_id, ...updates } = input;

      // Check if formulation exists
      const { data: existing } = await supabase
        .from("product_formulations")
        .select("id")
        .eq("product_id", product_id)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from("product_formulations")
          .update(updates)
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from("product_formulations")
          .insert({
            product_id,
            ...updates,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-formulation", productId] });
      toast({
        title: "Formulation saved",
        description: "Your changes have been saved",
      });
    },
    onError: (error) => {
      console.error("Error saving formulation:", error);
      toast({
        title: "Error",
        description: "Failed to save formulation",
        variant: "destructive",
      });
    },
  });

  return {
    formulation,
    isLoading,
    error,
    saveFormulation,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export function getDefaultFormulation(): Partial<ProductFormulation> {
  return {
    scent_profile: { top: [], heart: [], base: [] },
    concentration_type: null,
    concentration_percent: null,
    base_carrier: null,
    longevity: null,
    sillage: null,
    season_suitability: [],
    occasion_suitability: [],
    scent_family: null,
    skin_types: [],
    skin_concerns: [],
    active_ingredients: [],
  };
}

export function getScentProfileSummary(profile: ScentProfile): string {
  const parts: string[] = [];
  
  if (profile.top.length > 0) {
    parts.push(`Top: ${profile.top.slice(0, 3).join(", ")}`);
  }
  if (profile.heart.length > 0) {
    parts.push(`Heart: ${profile.heart.slice(0, 3).join(", ")}`);
  }
  if (profile.base.length > 0) {
    parts.push(`Base: ${profile.base.slice(0, 3).join(", ")}`);
  }
  
  return parts.join(" · ") || "No notes selected";
}
