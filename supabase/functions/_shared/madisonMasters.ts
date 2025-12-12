/**
 * MADISON MASTERS - Shared Utility for Edge Functions
 * 
 * This module provides access to Madison's "Three Silos" architecture:
 * - Silo A: The Masters (copy masters like Ogilvy, Peterman, etc.)
 * - Silo B: Brand Facts (brand DNA, products, design systems)
 * - Silo C: Brand Vibe (writing examples, visual examples)
 * 
 * The Router selects which masters to use based on the content type and brief.
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type CopySquad = 'THE_SCIENTISTS' | 'THE_STORYTELLERS' | 'THE_DISRUPTORS';
export type VisualSquad = 'THE_MINIMALISTS' | 'THE_STORYTELLERS' | 'THE_DISRUPTORS';
export type AwarenessStage = 'unaware' | 'problem_aware' | 'solution_aware' | 'product_aware' | 'most_aware';

export interface MasterDocument {
  master_name: string;
  squad: string;
  full_content: string;
  summary: string;
  forbidden_language: string[] | null;
  example_output: string | null;
}

export interface RoutingStrategy {
  copySquad: CopySquad;
  visualSquad: VisualSquad;
  primaryCopyMaster: string;
  secondaryCopyMaster?: string;
  schwartzStage: AwarenessStage;
  forbiddenLanguage: string[];
  reasoning: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SQUAD DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const SQUAD_DEFINITIONS = {
  THE_SCIENTISTS: {
    philosophy: 'Trust is earned through specificity, data, and logical proof.',
    masters: ['OGILVY_SPECIFICITY', 'HOPKINS_REASON_WHY', 'CAPLES_HEADLINES'],
    useWhen: ['Price > $100', 'technical products', 'skeptical audiences', 'product pages', 'educational content'],
    forbidden: ['romantic imagery', 'vague claims', 'metaphors', 'wandering narratives'],
  },
  THE_STORYTELLERS: {
    philosophy: 'Products are portals to adventure, identity, and possibility.',
    masters: ['PETERMAN_ROMANCE', 'COLLIER_CONVERSATION'],
    useWhen: ['Lifestyle products', 'fragrance', 'candles', 'brand building', 'Instagram', 'social media'],
    forbidden: ['clinical language', 'percentages', 'data-driven claims', 'mechanism talk'],
  },
  THE_DISRUPTORS: {
    philosophy: 'Break patterns to be seen. Challenge assumptions, provoke thought.',
    masters: ['HALBERT_URGENCY', 'BERNBACH_DISRUPTION'],
    useWhen: ['Paid ads', 'scroll-stopping content', 'launches', 'top of funnel', 'email subject lines'],
    forbidden: ['gentle language', 'qualifiers', 'long explanations', 'safe phrasing'],
  },
};

// Map content types to recommended squads
export const CONTENT_TYPE_TO_SQUAD: Record<string, CopySquad> = {
  // Storyteller content
  'instagram_caption': 'THE_STORYTELLERS',
  'social_post': 'THE_STORYTELLERS',
  'brand_story': 'THE_STORYTELLERS',
  'lifestyle_description': 'THE_STORYTELLERS',
  
  // Scientist content
  'product_description': 'THE_SCIENTISTS',
  'product_page': 'THE_SCIENTISTS',
  'technical_spec': 'THE_SCIENTISTS',
  'ingredient_breakdown': 'THE_SCIENTISTS',
  'educational': 'THE_SCIENTISTS',
  
  // Disruptor content
  'ad_copy': 'THE_DISRUPTORS',
  'paid_social': 'THE_DISRUPTORS',
  'email_subject': 'THE_DISRUPTORS',
  'headline': 'THE_DISRUPTORS',
  'launch_announcement': 'THE_DISRUPTORS',
  
  // Default
  'default': 'THE_STORYTELLERS',
};

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTER: Select the right squad and masters
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Simple router that selects the appropriate squad based on content type and brief keywords.
 * This is a lightweight version that doesn't require an AI call.
 */
export function routeToSquad(
  contentType: string | undefined,
  brief: string,
  styleOverlay?: string
): RoutingStrategy {
  const briefLower = brief.toLowerCase();
  
  // Check for explicit style overlay
  if (styleOverlay) {
    const styleMap: Record<string, CopySquad> = {
      'poetic': 'THE_STORYTELLERS',
      'story': 'THE_STORYTELLERS',
      'direct': 'THE_SCIENTISTS',
      'educational': 'THE_SCIENTISTS',
      'minimal': 'THE_SCIENTISTS',
      'disruptive': 'THE_DISRUPTORS',
      'urgent': 'THE_DISRUPTORS',
    };
    
    if (styleMap[styleOverlay]) {
      const squad = styleMap[styleOverlay];
      return buildStrategy(squad, briefLower);
    }
  }
  
  // Check content type mapping
  if (contentType && CONTENT_TYPE_TO_SQUAD[contentType]) {
    const squad = CONTENT_TYPE_TO_SQUAD[contentType];
    return buildStrategy(squad, briefLower);
  }
  
  // Keyword-based detection
  const scientistKeywords = ['specific', 'data', 'proof', 'technical', 'ingredients', 'clinical', 'efficacy', 'percentage', 'features', 'specs'];
  const storytellerKeywords = ['story', 'romance', 'lifestyle', 'fragrance', 'candle', 'journey', 'adventure', 'dream', 'imagine', 'evoke', 'atmosphere'];
  const disruptorKeywords = ['ad', 'scroll', 'attention', 'launch', 'urgent', 'bold', 'break', 'stop', 'now', 'limited', 'exclusive'];
  
  // Count keyword matches
  const scientistScore = scientistKeywords.filter(kw => briefLower.includes(kw)).length;
  const storytellerScore = storytellerKeywords.filter(kw => briefLower.includes(kw)).length;
  const disruptorScore = disruptorKeywords.filter(kw => briefLower.includes(kw)).length;
  
  // Select based on highest score
  if (disruptorScore > scientistScore && disruptorScore > storytellerScore) {
    return buildStrategy('THE_DISRUPTORS', briefLower);
  }
  if (scientistScore > storytellerScore) {
    return buildStrategy('THE_SCIENTISTS', briefLower);
  }
  
  // Default to Storytellers
  return buildStrategy('THE_STORYTELLERS', briefLower);
}

function buildStrategy(squad: CopySquad, brief: string): RoutingStrategy {
  const squadDef = SQUAD_DEFINITIONS[squad];
  const primaryMaster = squadDef.masters[0];
  const secondaryMaster = squadDef.masters[1];
  
  // Detect awareness stage from brief
  const awarenessStage = detectAwarenessStage(brief);
  
  return {
    copySquad: squad,
    visualSquad: squad === 'THE_SCIENTISTS' ? 'THE_MINIMALISTS' : squad,
    primaryCopyMaster: primaryMaster,
    secondaryCopyMaster: secondaryMaster,
    schwartzStage: awarenessStage,
    forbiddenLanguage: squadDef.forbidden,
    reasoning: `Selected ${squad} based on content analysis. Primary master: ${primaryMaster}.`,
  };
}

function detectAwarenessStage(brief: string): AwarenessStage {
  const lower = brief.toLowerCase();
  
  if (lower.includes('unaware') || lower.includes('introduce') || lower.includes('discover')) {
    return 'unaware';
  }
  if (lower.includes('problem') || lower.includes('pain point') || lower.includes('struggle')) {
    return 'problem_aware';
  }
  if (lower.includes('compare') || lower.includes('alternative') || lower.includes('option')) {
    return 'solution_aware';
  }
  if (lower.includes('buy') || lower.includes('purchase') || lower.includes('ready')) {
    return 'most_aware';
  }
  
  // Default to solution_aware (most common)
  return 'solution_aware';
}

// ═══════════════════════════════════════════════════════════════════════════════
// FETCH MASTERS FROM DATABASE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Fetch full master documents from the madison_masters table.
 */
export async function fetchMasterDocuments(
  supabase: SupabaseClient,
  masterNames: string[]
): Promise<MasterDocument[]> {
  if (masterNames.length === 0) {
    console.log('[MadisonMasters] No masters specified');
    return [];
  }

  const { data, error } = await supabase
    .from('madison_masters')
    .select('master_name, squad, full_content, summary, forbidden_language, example_output')
    .in('master_name', masterNames);

  if (error) {
    console.error('[MadisonMasters] Error fetching masters:', error);
    return [];
  }

  console.log(`[MadisonMasters] Loaded ${data?.length || 0} master documents`);
  return data || [];
}

/**
 * Fetch masters by squad name.
 */
export async function fetchMastersBySquad(
  supabase: SupabaseClient,
  squad: CopySquad
): Promise<MasterDocument[]> {
  const { data, error } = await supabase
    .from('madison_masters')
    .select('master_name, squad, full_content, summary, forbidden_language, example_output')
    .eq('squad', squad);

  if (error) {
    console.error('[MadisonMasters] Error fetching masters by squad:', error);
    return [];
  }

  console.log(`[MadisonMasters] Loaded ${data?.length || 0} masters for squad ${squad}`);
  return data || [];
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUILD MASTER CONTEXT FOR PROMPTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Build the master training section for injection into prompts.
 */
export function buildMasterContext(
  masters: MasterDocument[],
  strategy: RoutingStrategy
): string {
  if (masters.length === 0) {
    return '';
  }

  const parts: string[] = [];
  
  parts.push('╔══════════════════════════════════════════════════════════════════╗');
  parts.push('║           MADISON MASTERS — COPY TRAINING                        ║');
  parts.push('║        (Apply these techniques to your writing)                  ║');
  parts.push('╚══════════════════════════════════════════════════════════════════╝');
  parts.push('');
  parts.push(`SELECTED SQUAD: ${strategy.copySquad}`);
  parts.push(`AWARENESS STAGE: ${strategy.schwartzStage.toUpperCase()}`);
  parts.push(`REASONING: ${strategy.reasoning}`);
  parts.push('');
  
  // Add each master's training content
  masters.forEach((master, index) => {
    parts.push(`━━━ MASTER ${index + 1}: ${master.master_name.replace(/_/g, ' ')} ━━━`);
    parts.push('');
    parts.push(master.full_content);
    parts.push('');
    
    if (master.forbidden_language && master.forbidden_language.length > 0) {
      parts.push(`⚠️ FORBIDDEN (${master.master_name}): ${master.forbidden_language.join(', ')}`);
      parts.push('');
    }
    
    if (master.example_output) {
      parts.push('📝 EXAMPLE OUTPUT:');
      parts.push(master.example_output);
      parts.push('');
    }
  });
  
  // Add forbidden language from strategy
  if (strategy.forbiddenLanguage && strategy.forbiddenLanguage.length > 0) {
    parts.push('━━━ SQUAD-LEVEL FORBIDDEN LANGUAGE ━━━');
    parts.push(`The ${strategy.copySquad} squad FORBIDS: ${strategy.forbiddenLanguage.join(', ')}`);
    parts.push('');
  }
  
  parts.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  parts.push('⚠️ CRITICAL INSTRUCTIONS:');
  parts.push('1. Apply the TECHNIQUES and PHILOSOPHY from these masters');
  parts.push('2. DO NOT copy example products — use the USER\'S actual products');
  parts.push('3. Extract STYLE and CADENCE, not literal content');
  parts.push('4. Respect the FORBIDDEN language — these words break the style');
  parts.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  return parts.join('\n');
}

/**
 * Get the full Madison context including routing and masters.
 * This is the main function to call from edge functions.
 */
export async function getMadisonMasterContext(
  supabase: SupabaseClient,
  contentType: string | undefined,
  brief: string,
  styleOverlay?: string
): Promise<{ strategy: RoutingStrategy; masterContext: string }> {
  // 1. Route to the appropriate squad
  const strategy = routeToSquad(contentType, brief, styleOverlay);
  console.log(`[MadisonMasters] Routed to squad: ${strategy.copySquad}, master: ${strategy.primaryCopyMaster}`);
  
  // 2. Fetch the master documents
  const masterNames = [strategy.primaryCopyMaster];
  if (strategy.secondaryCopyMaster) {
    masterNames.push(strategy.secondaryCopyMaster);
  }
  
  const masters = await fetchMasterDocuments(supabase, masterNames);
  
  // 3. Build the context string
  const masterContext = buildMasterContext(masters, strategy);
  
  return { strategy, masterContext };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCHWARTZ STAGE TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════════

export const SCHWARTZ_TEMPLATES: Record<AwarenessStage, string> = {
  unaware: `
UNAWARE STAGE TEMPLATE:
1. Open with a relatable observation about their life
2. Reveal a hidden problem they didn't know they had
3. Show why this problem matters to them
4. Introduce your solution category (not your product yet)
`,
  problem_aware: `
PROBLEM-AWARE STAGE TEMPLATE:
1. Validate their pain immediately — show you understand
2. Explain WHY the problem persists (mechanism)
3. Present your unique approach (USP)
4. Provide proof it works (testimonials, data, specifics)
`,
  solution_aware: `
SOLUTION-AWARE STAGE TEMPLATE:
1. Acknowledge they're evaluating options
2. Lead with what makes you different (unique mechanism)
3. Subtly compare to alternatives (without naming)
4. Remove objections before they arise
`,
  product_aware: `
PRODUCT-AWARE STAGE TEMPLATE:
1. Reinforce their good judgment in considering you
2. Add NEW information they haven't heard
3. Create gentle urgency (limited, seasonal, etc.)
4. Make the next step crystal clear
`,
  most_aware: `
MOST-AWARE STAGE TEMPLATE:
1. Lead with the offer/deal
2. Stack bonuses and value
3. Single, clear CTA — no confusion
4. Minimal copy — they're ready, don't oversell
`,
};

export function getSchwartzTemplate(stage: AwarenessStage): string {
  return SCHWARTZ_TEMPLATES[stage] || SCHWARTZ_TEMPLATES.solution_aware;
}
