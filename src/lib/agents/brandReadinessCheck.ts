/**
 * Brand Readiness Check
 * 
 * Validates if an organization has sufficient brand knowledge
 * before allowing Madison to generate content.
 * 
 * Prevents Madison from generating with wrong assumptions.
 */

import { supabase } from '@/integrations/supabase/client';

export interface BrandReadinessResult {
  isReady: boolean;
  readinessScore: number; // 0-100
  missingElements: string[];
  warnings: string[];
  recommendations: string[];
  hasIndustry: boolean;
  hasBrandKnowledge: boolean;
  hasBrandDNA: boolean;
}

export async function checkBrandReadiness(organizationId: string): Promise<BrandReadinessResult> {
  const result: BrandReadinessResult = {
    isReady: false,
    readinessScore: 0,
    missingElements: [],
    warnings: [],
    recommendations: [],
    hasIndustry: false,
    hasBrandKnowledge: false,
    hasBrandDNA: false,
  };

  let score = 0;

  // 1. Check if industry is set (CRITICAL - 30 points)
  const { data: orgData } = await supabase
    .from('organizations')
    .select('brand_config')
    .eq('id', organizationId)
    .maybeSingle();

  if (orgData?.brand_config) {
    const brandConfig = orgData.brand_config as any;
    const industryId = brandConfig.industry_config?.id || brandConfig.industry;
    
    if (industryId && industryId !== 'expert-brands' && industryId !== 'fragrance-beauty') {
      // Specific industry set (not just default)
      result.hasIndustry = true;
      score += 30;
    } else if (industryId) {
      // Has an industry, but might be default
      result.hasIndustry = true;
      score += 15;
      result.warnings.push('Industry is set to a default value. Consider selecting a more specific industry.');
    } else {
      result.missingElements.push('Industry Selection');
      result.recommendations.push('Go to Settings → Brand Studio and select your industry');
    }
  } else {
    result.missingElements.push('Industry Selection');
    result.recommendations.push('Go to Settings → Brand Studio and select your industry');
  }

  // 2. Check for brand knowledge (uploaded documents) (HIGH PRIORITY - 40 points)
  const { data: knowledgeData } = await supabase
    .from('brand_knowledge')
    .select('knowledge_type, content')
    .eq('organization_id', organizationId)
    .eq('is_active', true);

  if (knowledgeData && knowledgeData.length > 0) {
    result.hasBrandKnowledge = true;
    
    // Check quality of knowledge
    const hasVoice = knowledgeData.some(k => k.knowledge_type === 'brand_voice');
    const hasVocabulary = knowledgeData.some(k => k.knowledge_type === 'vocabulary');
    const hasIdentity = knowledgeData.some(k => k.knowledge_type === 'brandIdentity');
    
    if (hasVoice && hasVocabulary && hasIdentity) {
      score += 40; // Full points for comprehensive knowledge
    } else if (hasVoice || hasVocabulary) {
      score += 25; // Partial points
      result.warnings.push('Brand knowledge is incomplete. Consider uploading more comprehensive brand guidelines.');
    } else {
      score += 10; // Minimal points
      result.warnings.push('Brand knowledge exists but lacks voice and vocabulary guidelines.');
    }
  } else {
    result.missingElements.push('Brand Documentation');
    result.recommendations.push('Upload brand guidelines, voice & tone docs, or scan your website');
  }

  // 3. Check for brand DNA (website scan or manual setup) (MEDIUM PRIORITY - 30 points)
  const { data: dnaData } = await supabase
    .from('brand_dna')
    .select('*')
    .eq('org_id', organizationId)
    .maybeSingle();

  if (dnaData) {
    result.hasBrandDNA = true;
    score += 30;
  } else {
    // Check if there's a brand_dna_scan in brand_knowledge
    const hasDNAScan = knowledgeData?.some(k => k.knowledge_type === 'brand_dna_scan');
    if (hasDNAScan) {
      result.hasBrandDNA = true;
      score += 20;
    } else {
      result.missingElements.push('Brand DNA (Visual Identity)');
      result.recommendations.push('Scan your website or manually set up your brand colors and fonts');
    }
  }

  // Calculate final readiness
  result.readinessScore = score;
  
  // Determine if ready (need at least 50 points)
  if (score >= 50) {
    result.isReady = true;
  } else {
    result.isReady = false;
    result.warnings.push(`Brand readiness score: ${score}/100. Madison needs more information to generate accurate content.`);
  }

  return result;
}

export function getBrandReadinessMessage(result: BrandReadinessResult): string {
  if (result.isReady) {
    return `Brand readiness: ${result.readinessScore}% - Ready to generate!`;
  }

  const missing = result.missingElements.join(', ');
  return `Brand setup incomplete (${result.readinessScore}%). Missing: ${missing}`;
}

export function getBrandReadinessColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 50) return 'text-yellow-600';
  return 'text-red-600';
}
