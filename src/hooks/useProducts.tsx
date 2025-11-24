import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOnboarding } from './useOnboarding';

export type ProductCategory = 'personal_fragrance' | 'home_fragrance';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  product_type: string | null;
  collection: string | null;
  
  // Core Identity
  handle: string | null;
  collection_tier: string | null;
  scent_family_detailed: string | null;
  
  // Personal Fragrance specific
  scentFamily: string | null;
  topNotes: string | null;
  middleNotes: string | null;
  baseNotes: string | null;
  
  // Home Fragrance specific
  scentProfile: string | null;
  format: string | null;
  burnTime: string | null;
  
  // Bottle Type (explicit control: 'oil' | 'spray' | 'auto')
  bottle_type: 'oil' | 'spray' | 'auto' | null;
  
  // Skincare specific
  keyIngredients: string | null;
  benefits: string | null;
  usage: string | null;
  formulationType: string | null;
  
  // Universal fields
  description: string | null;
  usp: string | null;
  tone: string | null;
  
  // Visual DNA
  platform_type: string | null;
  platform_material: string | null;
  visual_world: string | null;
  visual_world_week: number | null;
  color_palette_hex_codes: string | null;
  lighting_spec: string | null;
  lighting_direction: string | null;
  depth_of_field: string | null;
  composition_style: string | null;
  aspect_ratio_primary: string | null;
  shadow_treatment: string | null;
  image_type_primary: string | null;
  textile_backdrop: string | null;
  
  // Archetype & Context
  archetype_hero_enabled: boolean | null;
  archetype_flatlay_enabled: boolean | null;
  archetype_lived_enabled: boolean | null;
  archetype_travel_enabled: boolean | null;
  archetype_environmental_enabled: boolean | null;
  archetype_ritual_enabled: boolean | null;
  hero_primary_artifacts: string | null;
  hero_artifact_placement: string | null;
  flatlay_ingredients: string | null;
  lived_life_context: string | null;
  travel_context: string | null;
  environmental_location: string | null;
  ritual_skin_tone: string | null;
  
  // Scent Profile Extended
  longevity_hours: string | null;
  sillage_description: string | null;
  
  // Brand Philosophy & Messaging
  dip_layer_moral: string | null;
  moral_philosophy: string | null;
  philosophy_keywords: string | null;
  semantic_categories: string | null;
  approved_descriptors: string | null;
  primary_avatar: string | null;
  avatar_motivation: string | null;
  use_case_primary: string | null;
  occasion_tags: string | null;
  transparency_statement: string | null;
  craftsmanship_term: string | null;
  ingredient_disclosure: string | null;
  
  // AI Instructions
  prompt_template_id: string | null;
  use_case_templates: string | null;
}

export const useProducts = () => {
  const { currentOrganizationId } = useOnboarding();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    if (!currentOrganizationId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('brand_products')
        .select('*')
        .eq('organization_id', currentOrganizationId)
        .order('name');

      if (fetchError) throw fetchError;

      const formattedProducts: Product[] = (data || []).map((p) => ({
        id: p.id,
        name: p.name,
        category: (p.category || 'personal_fragrance') as ProductCategory,
        product_type: p.product_type,
        collection: p.collection,
        
        // Core Identity
        handle: p.handle,
        collection_tier: p.collection_tier,
        scent_family_detailed: p.scent_family_detailed,
        
        // Personal Fragrance
        scentFamily: p.scent_family,
        topNotes: p.top_notes,
        middleNotes: p.middle_notes,
        baseNotes: p.base_notes,
        
        // Home Fragrance
        scentProfile: p.scent_profile,
        format: p.format,
        burnTime: p.burn_time,
        
        // Skincare
        keyIngredients: p.key_ingredients,
        benefits: p.benefits,
        usage: p.usage,
        formulationType: p.formulation_type,
        
        // Universal
        description: p.description,
        usp: p.usp,
        tone: p.tone,
        
        // Visual DNA
        platform_type: p.platform_type,
        platform_material: p.platform_material,
        visual_world: p.visual_world,
        visual_world_week: p.visual_world_week,
        color_palette_hex_codes: p.color_palette_hex_codes,
        lighting_spec: p.lighting_spec,
        lighting_direction: p.lighting_direction,
        depth_of_field: p.depth_of_field,
        composition_style: p.composition_style,
        aspect_ratio_primary: p.aspect_ratio_primary,
        shadow_treatment: p.shadow_treatment,
        image_type_primary: p.image_type_primary,
        textile_backdrop: p.textile_backdrop,
        
        // Archetype & Context
        archetype_hero_enabled: p.archetype_hero_enabled,
        archetype_flatlay_enabled: p.archetype_flatlay_enabled,
        archetype_lived_enabled: p.archetype_lived_enabled,
        archetype_travel_enabled: p.archetype_travel_enabled,
        archetype_environmental_enabled: p.archetype_environmental_enabled,
        archetype_ritual_enabled: p.archetype_ritual_enabled,
        hero_primary_artifacts: p.hero_primary_artifacts,
        hero_artifact_placement: p.hero_artifact_placement,
        flatlay_ingredients: p.flatlay_ingredients,
        lived_life_context: p.lived_life_context,
        travel_context: p.travel_context,
        environmental_location: p.environmental_location,
        ritual_skin_tone: p.ritual_skin_tone,
        
        // Scent Profile Extended
        longevity_hours: p.longevity_hours,
        sillage_description: p.sillage_description,
        
        // Brand Philosophy & Messaging
        dip_layer_moral: p.dip_layer_moral,
        moral_philosophy: p.moral_philosophy,
        philosophy_keywords: p.philosophy_keywords,
        semantic_categories: p.semantic_categories,
        approved_descriptors: p.approved_descriptors,
        primary_avatar: p.primary_avatar,
        avatar_motivation: p.avatar_motivation,
        use_case_primary: p.use_case_primary,
        occasion_tags: p.occasion_tags,
        transparency_statement: p.transparency_statement,
        craftsmanship_term: p.craftsmanship_term,
        ingredient_disclosure: p.ingredient_disclosure,
        
        // AI Instructions
        prompt_template_id: p.prompt_template_id,
        use_case_templates: p.use_case_templates,
      }));

      setProducts(formattedProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentOrganizationId]);

  return { products, loading, error, refetch: fetchProducts };
};
