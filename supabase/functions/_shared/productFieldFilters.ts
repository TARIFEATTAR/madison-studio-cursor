/**
 * Product Field Filtering System
 * 
 * Semantic Fields (for copywriting): Brand story, emotional benefits, target audience
 * Visual Fields (for images): Shot types, lighting, composition, technical specs
 */

// 25 semantic fields - used for copywriting to enhance narrative without visual noise
export const SEMANTIC_FIELDS = [
  // Core identity
  'name',
  'collection',
  'category',
  'product_type',
  
  // Brand story & positioning
  'brand_story',
  'brand_philosophy',
  'heritage_notes',
  'usp',
  'tone',
  'archetype_hero',
  'archetype_everyman',
  'archetype_explorer',
  'archetype_lover',
  
  // Target audience & psychographics
  'target_audience',
  'psychographic_profile',
  'emotional_benefits',
  'aspirational_identity',
  
  // Sensory experience (semantic, not visual)
  'scent_family',
  'top_notes',
  'middle_notes',
  'base_notes',
  'sensory_experience',
  'texture_feel',
  
  // Collections context
  'collection_theme'
] as const;

// All remaining fields are visual/technical - used for image generation
export const VISUAL_FIELDS = [
  // Visual DNA
  'visual_world',
  'aesthetic_codes',
  'symbolic_elements',
  
  // Technical image specs
  'shot_type',
  'shot_type_secondary',
  'camera_settings',
  'lens_type',
  'lighting_mood',
  'lighting_setup',
  'composition_style',
  'depth_of_field',
  'color_grading',
  'background_type',
  'surface_materials',
  
  // Props & styling
  'approved_props',
  'prop_placement',
  'styling_direction',
  
  // Advanced visual controls
  'mood_atmosphere',
  'seasonal_context',
  'time_of_day',
  'weather_conditions',
  'texture_emphasis',
  
  // Archetype visual traits
  'archetype_hero_enabled',
  'archetype_everyman_enabled',
  'archetype_explorer_enabled',
  'archetype_lover_enabled'
] as const;

/**
 * Filter product data to only semantic fields for copywriting
 */
export function getSemanticFields(productData: any): any {
  if (!productData) return null;
  
  const filtered: any = {};
  
  SEMANTIC_FIELDS.forEach(field => {
    if (productData[field] !== undefined && productData[field] !== null && productData[field] !== '') {
      filtered[field] = productData[field];
    }
  });
  
  return Object.keys(filtered).length > 0 ? filtered : null;
}

/**
 * Get all 49 fields for image generation
 */
export function getAllProductFields(productData: any): any {
  return productData; // Return everything - all 49 fields
}

/**
 * Format semantic product context for copywriting prompts
 */
export function formatSemanticContext(productData: any): string {
  const semantic = getSemanticFields(productData);
  if (!semantic) return '';
  
  const parts = [];
  
  parts.push('\n╔══════════════════════════════════════════════════════════════════╗');
  parts.push('║              PRODUCT SEMANTIC CONTEXT                            ║');
  parts.push('║     (Storytelling, Emotion, Audience - No Visual Specs)          ║');
  parts.push('╚══════════════════════════════════════════════════════════════════╝');
  
  // Core identity
  if (semantic.name) parts.push(`\n✦ Product: ${semantic.name}`);
  if (semantic.collection) parts.push(`✦ Collection: ${semantic.collection}`);
  if (semantic.category) parts.push(`✦ Category: ${semantic.category}`);
  
  // Brand story
  if (semantic.brand_story || semantic.brand_philosophy || semantic.heritage_notes) {
    parts.push('\n━━━ BRAND NARRATIVE ━━━');
    if (semantic.brand_story) parts.push(semantic.brand_story);
    if (semantic.brand_philosophy) parts.push(`Philosophy: ${semantic.brand_philosophy}`);
    if (semantic.heritage_notes) parts.push(`Heritage: ${semantic.heritage_notes}`);
  }
  
  // Positioning
  if (semantic.usp || semantic.tone) {
    parts.push('\n━━━ POSITIONING ━━━');
    if (semantic.usp) parts.push(`USP: ${semantic.usp}`);
    if (semantic.tone) parts.push(`Brand Tone: ${semantic.tone}`);
  }
  
  // Archetypes (narrative context)
  const archetypes = [];
  if (semantic.archetype_hero) archetypes.push('Hero');
  if (semantic.archetype_everyman) archetypes.push('Everyman');
  if (semantic.archetype_explorer) archetypes.push('Explorer');
  if (semantic.archetype_lover) archetypes.push('Lover');
  if (archetypes.length > 0) {
    parts.push(`\n━━━ BRAND ARCHETYPES ━━━`);
    parts.push(archetypes.join(', '));
  }
  
  // Target audience
  if (semantic.target_audience || semantic.psychographic_profile) {
    parts.push('\n━━━ AUDIENCE INSIGHTS ━━━');
    if (semantic.target_audience) parts.push(`Target: ${semantic.target_audience}`);
    if (semantic.psychographic_profile) parts.push(`Psychographics: ${semantic.psychographic_profile}`);
    if (semantic.emotional_benefits) parts.push(`Emotional Benefits: ${semantic.emotional_benefits}`);
    if (semantic.aspirational_identity) parts.push(`Aspirational Identity: ${semantic.aspirational_identity}`);
  }
  
  // Sensory (semantic description, not visual)
  if (semantic.scent_family || semantic.top_notes || semantic.sensory_experience) {
    parts.push('\n━━━ SENSORY PROFILE ━━━');
    if (semantic.scent_family) parts.push(`Scent Family: ${semantic.scent_family}`);
    if (semantic.top_notes) parts.push(`Top Notes: ${semantic.top_notes}`);
    if (semantic.middle_notes) parts.push(`Middle Notes: ${semantic.middle_notes}`);
    if (semantic.base_notes) parts.push(`Base Notes: ${semantic.base_notes}`);
    if (semantic.sensory_experience) parts.push(`Sensory Experience: ${semantic.sensory_experience}`);
    if (semantic.texture_feel) parts.push(`Texture/Feel: ${semantic.texture_feel}`);
  }
  
  // Collection theme
  if (semantic.collection_theme) {
    parts.push(`\n━━━ COLLECTION THEME ━━━`);
    parts.push(semantic.collection_theme);
  }
  
  parts.push('\n⚠️ NOTE: This context provides storytelling depth without visual technical specs.');
  
  return parts.join('\n');
}

/**
 * Format all product fields for image generation prompts
 */
export function formatVisualContext(productData: any): string {
  if (!productData) return '';
  
  const parts = [];
  
  parts.push('\n╔══════════════════════════════════════════════════════════════════╗');
  parts.push('║              COMPLETE PRODUCT VISUAL DNA                         ║');
  parts.push('║         (All 49 Fields - Semantic + Technical Specs)             ║');
  parts.push('╚══════════════════════════════════════════════════════════════════╝');
  
  // Product identity
  if (productData.name) parts.push(`\n✦ Product: ${productData.name}`);
  if (productData.collection) parts.push(`✦ Collection: ${productData.collection}`);
  if (productData.category) parts.push(`✦ Category: ${productData.category}`);
  
  // Visual world & aesthetic
  if (productData.visual_world || productData.aesthetic_codes) {
    parts.push('\n━━━ VISUAL WORLD ━━━');
    if (productData.visual_world) parts.push(productData.visual_world);
    if (productData.aesthetic_codes) parts.push(`Aesthetic Codes: ${productData.aesthetic_codes}`);
    if (productData.symbolic_elements) parts.push(`Symbolic Elements: ${productData.symbolic_elements}`);
  }
  
  // Technical photography specs
  if (productData.shot_type || productData.camera_settings || productData.lighting_mood) {
    parts.push('\n━━━ PHOTOGRAPHY SPECIFICATIONS ━━━');
    if (productData.shot_type) parts.push(`Shot Type: ${productData.shot_type}`);
    if (productData.shot_type_secondary) parts.push(`Secondary Shot: ${productData.shot_type_secondary}`);
    if (productData.camera_settings) parts.push(`Camera: ${productData.camera_settings}`);
    if (productData.lens_type) parts.push(`Lens: ${productData.lens_type}`);
    if (productData.lighting_mood) parts.push(`Lighting: ${productData.lighting_mood}`);
    if (productData.lighting_setup) parts.push(`Setup: ${productData.lighting_setup}`);
    if (productData.composition_style) parts.push(`Composition: ${productData.composition_style}`);
    if (productData.depth_of_field) parts.push(`DOF: ${productData.depth_of_field}`);
    if (productData.color_grading) parts.push(`Color Grading: ${productData.color_grading}`);
  }
  
  // Environment & scene
  if (productData.background_type || productData.surface_materials || productData.mood_atmosphere) {
    parts.push('\n━━━ SCENE & ENVIRONMENT ━━━');
    if (productData.background_type) parts.push(`Background: ${productData.background_type}`);
    if (productData.surface_materials) parts.push(`Surface: ${productData.surface_materials}`);
    if (productData.mood_atmosphere) parts.push(`Mood: ${productData.mood_atmosphere}`);
    if (productData.seasonal_context) parts.push(`Season: ${productData.seasonal_context}`);
    if (productData.time_of_day) parts.push(`Time: ${productData.time_of_day}`);
    if (productData.weather_conditions) parts.push(`Weather: ${productData.weather_conditions}`);
  }
  
  // Props & styling
  if (productData.approved_props || productData.prop_placement) {
    parts.push('\n━━━ PROPS & STYLING ━━━');
    if (productData.approved_props) parts.push(`Props: ${productData.approved_props}`);
    if (productData.prop_placement) parts.push(`Placement: ${productData.prop_placement}`);
    if (productData.styling_direction) parts.push(`Direction: ${productData.styling_direction}`);
    if (productData.texture_emphasis) parts.push(`Texture: ${productData.texture_emphasis}`);
  }
  
  // Semantic context (still useful for images)
  if (productData.brand_story || productData.emotional_benefits) {
    parts.push('\n━━━ BRAND NARRATIVE (Context) ━━━');
    if (productData.brand_story) parts.push(productData.brand_story);
    if (productData.emotional_benefits) parts.push(`Emotional Goal: ${productData.emotional_benefits}`);
  }
  
  parts.push('\n⚠️ Use ALL fields above to create brand-consistent, technically precise imagery.');
  
  return parts.join('\n');
}
