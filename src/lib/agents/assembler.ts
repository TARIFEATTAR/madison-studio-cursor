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
import { checkBrandReadiness, getBrandReadinessMessage } from './brandReadinessCheck';

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ASSEMBLER FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

export async function assemblerAgent(
  strategy: StrategyJSON,
  orgId: string,
  userBrief: string
): Promise<ContextPackage> {
  console.log('[Assembler] Fetching context for strategy:', strategy.copySquad);

  // CRITICAL: Check brand readiness before proceeding
  const readiness = await checkBrandReadiness(orgId);
  console.log(`[Assembler] Brand readiness: ${readiness.readinessScore}%`);
  
  if (!readiness.isReady) {
    const errorMessage = getBrandReadinessMessage(readiness);
    const recommendations = readiness.recommendations.length > 0 
      ? `\n\nTo fix this:\n${readiness.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}`
      : '';
    
    throw new Error(
      `${errorMessage}${recommendations}\n\nMadison cannot generate accurate content without proper brand setup. Please complete your brand profile first.`
    );
  }
  
  if (readiness.warnings.length > 0) {
    console.warn('[Assembler] Brand readiness warnings:', readiness.warnings);
  }

  // Execute all fetches in parallel for speed
  const [
    masterDocs,
    schwartzTemplate,
    productData,
    brandDNA,
    designTokens,
    writingExamples,
    visualExamples,
    industryConfig,
    brandKnowledge,
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

    // 8. Fetch industry configuration
    fetchIndustryConfig(orgId),

    // 9. Fetch brand knowledge from uploaded documents
    fetchBrandKnowledge(orgId),
  ]);

  console.log(`[Assembler] Loaded ${masterDocs.length} master docs, ${writingExamples.length} writing examples, ${brandKnowledge ? 'brand knowledge found' : 'no brand knowledge'}, industry: ${industryConfig?.id || 'none'}`);

  return {
    masterDocuments: masterDocs,
    schwartzTemplate,
    productData,
    brandDNA: brandDNA!,
    designTokens,
    writingExamples,
    visualExamples,
    industryConfig,
    brandKnowledge,
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
    console.log('[Assembler] No brand DNA found in brand_dna table, checking brand_knowledge...');
    
    // FALLBACK: Try to synthesize from brand_knowledge table
    const synthesizedDNA = await synthesizeBrandDNAFromKnowledge(orgId);
    if (synthesizedDNA) {
      console.log('[Assembler] Synthesized brand DNA from brand_knowledge entries');
      return synthesizedDNA;
    }
    
    return getDefaultBrandDNA(orgId);
  }

  return data as BrandDNA;
}

async function synthesizeBrandDNAFromKnowledge(orgId: string): Promise<BrandDNA | null> {
  // Fetch all active brand knowledge entries
  const { data: knowledgeEntries, error } = await supabase
    .from('brand_knowledge')
    .select('knowledge_type, content')
    .eq('organization_id', orgId)
    .eq('is_active', true);

  if (error || !knowledgeEntries || knowledgeEntries.length === 0) {
    console.log('[Assembler] No brand knowledge entries found');
    return null;
  }

  console.log(`[Assembler] Found ${knowledgeEntries.length} brand knowledge entries`);

  // Build a synthesized BrandDNA from knowledge entries
  const synthesized: BrandDNA = {
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
    scan_method: 'document_upload',
    scan_metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Extract data from knowledge entries
  for (const entry of knowledgeEntries) {
    const content = entry.content as any;
    
    switch (entry.knowledge_type) {
      case 'brand_voice':
        if (content.toneAttributes && content.toneAttributes.length > 0) {
          synthesized.essence!.tone = content.toneAttributes.join(', ');
        }
        break;
        
      case 'vocabulary':
        if (content.forbiddenPhrases && content.forbiddenPhrases.length > 0) {
          synthesized.constraints!.forbiddenWords = content.forbiddenPhrases;
        }
        break;
        
      case 'brandIdentity':
        if (content.mission) {
          synthesized.essence!.mission = content.mission;
        }
        if (content.values) {
          synthesized.essence!.values = content.values;
        }
        break;
    }
  }

  return synthesized;
}

function getDefaultBrandDNA(orgId: string): BrandDNA {
  // IMPORTANT: This is a minimal fallback only used when brand readiness check passes
  // but no specific DNA exists. It provides neutral defaults that won't mislead.
  console.warn('[Assembler] Using default brand DNA - brand should complete their profile');
  
  return {
    id: '',
    org_id: orgId,
    visual: {
      colors: {
        primary: '#1A1816', // Neutral ink black
        secondary: '#B8956A', // Neutral brass
        accent: '#D4AF37', // Neutral gold
      },
    },
    essence: {
      tone: 'professional', // Changed from 'sophisticated' to more neutral
      copySquad: 'THE_STORYTELLERS', // Most versatile squad
      visualSquad: 'THE_STORYTELLERS',
    },
    constraints: {
      forbiddenWords: [], // No assumptions about forbidden words
    },
    scan_method: 'manual',
    scan_metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

async function fetchIndustryConfig(orgId: string): Promise<{ id: string; subIndustry?: string } | undefined> {
  const { data, error } = await supabase
    .from('organizations')
    .select('brand_config')
    .eq('id', orgId)
    .maybeSingle();

  if (error || !data) {
    console.log('[Assembler] No industry config found');
    return undefined;
  }

  const brandConfig = (data.brand_config as any) || {};
  const industryConfig = brandConfig.industry_config;
  
  if (!industryConfig?.id) {
    // Try legacy industry field
    const legacyIndustry = brandConfig.industry;
    if (legacyIndustry) {
      return { id: legacyIndustry };
    }
    return undefined;
  }

  return {
    id: industryConfig.id,
    subIndustry: industryConfig.subIndustry,
  };
}

async function fetchBrandKnowledge(orgId: string): Promise<any> {
  const { data, error } = await supabase
    .from('brand_knowledge')
    .select('knowledge_type, content')
    .eq('organization_id', orgId)
    .eq('is_active', true);

  if (error || !data || data.length === 0) {
    console.log('[Assembler] No brand knowledge found');
    return undefined;
  }

  console.log(`[Assembler] Found ${data.length} brand knowledge entries`);

  // Organize knowledge by type
  const knowledge: any = {};
  
  for (const entry of data) {
    switch (entry.knowledge_type) {
      case 'brand_voice':
        knowledge.voice = entry.content;
        break;
      case 'vocabulary':
        knowledge.vocabulary = entry.content;
        break;
      case 'brandIdentity':
        knowledge.brandIdentity = entry.content;
        break;
      case 'writing_examples':
        knowledge.examples = entry.content;
        break;
      case 'structural_guidelines':
        knowledge.structure = entry.content;
        break;
    }
  }

  return Object.keys(knowledge).length > 0 ? knowledge : undefined;
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












