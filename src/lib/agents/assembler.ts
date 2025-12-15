/**
 * AGENT 2: ASSEMBLER (The Librarian)
 * 
 * Fetches all necessary context from the Three Silos based on the Router's strategy.
 * No AI model needed - pure database queries executed in parallel.
 * 
 * Model: None
 * Cost: $0.00 (just database reads)
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  StrategyJSON,
  ContextPackage,
  BrandDNA,
  ProductSpecs,
  DesignTokens,
  BrandWritingExample,
  BrandVisualExample,
} from '@/types/madison';

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ASSEMBLER FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

export async function assemblerAgent(
  strategy: StrategyJSON,
  orgId: string,
  userBrief: string
): Promise<ContextPackage> {
  console.log('[Assembler] Fetching context for strategy:', strategy.copySquad);

  // Execute all fetches in parallel for speed
  const [
    masterDocs,
    schwartzTemplate,
    productData,
    brandDNA,
    designTokens,
    writingExamples,
    visualExamples,
  ] = await Promise.all([
    // 1. Fetch full master documents (Silo A - no chunking!)
    fetchMasterDocuments(strategy.primaryCopyMaster, strategy.secondaryCopyMaster),
    
    // 2. Fetch Schwartz stage template (Silo A)
    fetchSchwartzTemplate(strategy.schwartzStage),
    
    // 3. Fetch product data (Silo B - exact lookup)
    fetchProductData(strategy.productId, orgId),
    
    // 4. Fetch brand DNA (Silo B)
    fetchBrandDNA(orgId),
    
    // 5. Fetch design tokens (Silo B)
    fetchDesignTokens(orgId),
    
    // 6. Fetch relevant writing examples (Silo C - semantic search)
    fetchWritingExamples(orgId, userBrief),
    
    // 7. Fetch relevant visual examples (Silo C - semantic search)
    fetchVisualExamples(orgId, userBrief),
  ]);

  console.log(`[Assembler] Loaded ${masterDocs.length} master docs, ${writingExamples.length} writing examples`);

  return {
    masterDocuments: masterDocs,
    schwartzTemplate,
    productData,
    brandDNA: brandDNA!,
    designTokens,
    writingExamples,
    visualExamples,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SILO A: THE MASTERS (Full Documents)
// ═══════════════════════════════════════════════════════════════════════════════

async function fetchMasterDocuments(
  primaryMaster: string,
  secondaryMaster?: string
): Promise<string[]> {
  const masters = [primaryMaster, secondaryMaster].filter(Boolean);
  
  if (masters.length === 0) {
    console.warn('[Assembler] No masters specified');
    return [];
  }

  const { data, error } = await supabase
    .from('madison_masters')
    .select('full_content, master_name')
    .in('master_name', masters);

  if (error) {
    console.error('[Assembler] Error fetching masters:', error);
    return [];
  }

  return data?.map(d => d.full_content) || [];
}

async function fetchSchwartzTemplate(stage: string): Promise<string> {
  const { data, error } = await supabase
    .from('schwartz_templates')
    .select('template_content')
    .eq('stage', stage)
    .single();

  if (error) {
    console.error('[Assembler] Error fetching Schwartz template:', error);
    return getDefaultSchwartzTemplate(stage);
  }

  return data?.template_content || getDefaultSchwartzTemplate(stage);
}

function getDefaultSchwartzTemplate(stage: string): string {
  const templates: Record<string, string> = {
    unaware: `
# Unaware Stage
1. Open with a relatable observation
2. Reveal the hidden problem  
3. Show why it matters
4. Introduce your solution category`,
    problem_aware: `
# Problem-Aware Stage
1. Validate their pain immediately
2. Explain why the problem persists
3. Present your unique mechanism
4. Provide proof it works`,
    solution_aware: `
# Solution-Aware Stage
1. Acknowledge they're evaluating
2. Highlight your unique aspect (USP)
3. Compare subtly to alternatives
4. Remove final objections`,
    product_aware: `
# Product-Aware Stage
1. Reinforce their good judgment
2. Add new information they don't know
3. Create urgency without pressure
4. Make buying easy`,
    most_aware: `
# Most-Aware Stage
1. The offer - clear and prominent
2. Bonuses and guarantees
3. Single, clear CTA
4. Minimal copy`,
  };
  return templates[stage] || templates['solution_aware'];
}

// ═══════════════════════════════════════════════════════════════════════════════
// SILO B: THE FACTS (Structured Data)
// ═══════════════════════════════════════════════════════════════════════════════

async function fetchProductData(
  productId: string | undefined,
  orgId: string
): Promise<ProductSpecs | null> {
  if (!productId) {
    return null;
  }

  const { data, error } = await supabase
    .from('brand_products')
    .select('specs')
    .eq('org_id', orgId)
    .eq('product_id', productId)
    .single();

  if (error) {
    console.log('[Assembler] No product data found for:', productId);
    return null;
  }

  return data?.specs as ProductSpecs || null;
}

async function fetchBrandDNA(orgId: string): Promise<BrandDNA | null> {
  const { data, error } = await supabase
    .from('brand_dna')
    .select('*')
    .eq('org_id', orgId)
    .single();

  if (error) {
    console.log('[Assembler] No brand DNA found');
    return getDefaultBrandDNA(orgId);
  }

  return data as BrandDNA;
}

function getDefaultBrandDNA(orgId: string): BrandDNA {
  return {
    id: '',
    org_id: orgId,
    visual: {
      colors: {
        primary: '#1A1816',
        secondary: '#B8956A',
        accent: '#D4AF37',
      },
    },
    essence: {
      tone: 'sophisticated',
      copySquad: 'THE_STORYTELLERS',
      visualSquad: 'THE_STORYTELLERS',
    },
    constraints: {
      forbiddenWords: [],
    },
    scan_method: 'manual',
    scan_metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

async function fetchDesignTokens(orgId: string): Promise<DesignTokens> {
  const { data, error } = await supabase
    .from('design_systems')
    .select('tokens')
    .eq('org_id', orgId)
    .single();

  if (error) {
    console.log('[Assembler] No design tokens found, using defaults');
    return getDefaultDesignTokens();
  }

  return data?.tokens as DesignTokens || getDefaultDesignTokens();
}

function getDefaultDesignTokens(): DesignTokens {
  return {
    colors: {
      background: '#F5F1E8',
      foreground: '#1A1816',
      card: '#FFFCF5',
      primary: '#B8956A',
      secondary: '#2F2A26',
      accent: '#D4AF37',
      muted: '#E5DFD1',
      border: '#D1C7B5',
    },
    typography: {
      fontFamily: {
        serif: 'Cormorant Garamond',
        sans: 'Lato',
      },
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SILO C: THE VIBE (Semantic Examples)
// ═══════════════════════════════════════════════════════════════════════════════

async function fetchWritingExamples(
  orgId: string,
  query: string
): Promise<BrandWritingExample[]> {
  // First, try to use the semantic search RPC if embeddings are available
  // For now, fall back to simple text search
  
  const { data, error } = await supabase
    .from('brand_writing_examples')
    .select('*')
    .eq('org_id', orgId)
    .limit(5);

  if (error) {
    console.log('[Assembler] Error fetching writing examples:', error);
    return [];
  }

  // If we have embeddings in the future, we'd do:
  // const embedding = await generateEmbedding(query);
  // const { data } = await supabase.rpc('match_writing_examples', {
  //   query_embedding: embedding,
  //   match_threshold: 0.7,
  //   match_count: 3,
  //   p_org_id: orgId
  // });

  return (data as BrandWritingExample[]) || [];
}

async function fetchVisualExamples(
  orgId: string,
  query: string
): Promise<BrandVisualExample[]> {
  const { data, error } = await supabase
    .from('brand_visual_examples')
    .select('*')
    .eq('org_id', orgId)
    .limit(3);

  if (error) {
    console.log('[Assembler] Error fetching visual examples:', error);
    return [];
  }

  return (data as BrandVisualExample[]) || [];
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMBEDDING GENERATION (for future semantic search)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate embedding for semantic search
 * Uses OpenAI text-embedding-3-small (1536 dimensions)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  // This would use OpenAI's embedding API
  // For now, return empty array as placeholder
  console.log('[Assembler] Embedding generation not yet implemented');
  return [];
}

/**
 * Fetch visual master for image generation
 */
export async function fetchVisualMaster(masterName: string): Promise<{
  promptTemplate: string;
  compositionRules: Record<string, unknown>;
  lightingRules: Record<string, unknown>;
} | null> {
  const { data, error } = await supabase
    .from('visual_masters')
    .select('prompt_template, composition_rules, lighting_rules')
    .eq('master_name', masterName)
    .single();

  if (error) {
    console.error('[Assembler] Error fetching visual master:', error);
    return null;
  }

  return {
    promptTemplate: data?.prompt_template || '',
    compositionRules: data?.composition_rules || {},
    lightingRules: data?.lighting_rules || {},
  };
}

export default assemblerAgent;











