import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { getSemanticFields, formatSemanticContext } from '../_shared/productFieldFilters.ts';
import { buildAuthorProfilesSection } from '../_shared/authorProfiles.ts';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// Helper function to verify user has access to organization
async function verifyOrganizationAccess(userId: string, organizationId: string): Promise<boolean> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  try {
    const { data, error } = await supabase
      .from('organization_members')
      .select('user_id')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .maybeSingle();
    
    if (error) {
      console.error('Error verifying organization access:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error in verifyOrganizationAccess:', error);
    return false;
  }
}

// Helper function to fetch Madison's system training
async function getMadisonSystemConfig() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  try {
    const { data, error } = await supabase
      .from('madison_system_config')
      .select('*')
      .limit(1)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching Madison system config:', error);
      return '';
    }
    
    if (!data) return '';
    
    const configParts: string[] = [];
    configParts.push('\n╔══════════════════════════════════════════════════════════════════╗');
    configParts.push('║             MADISON\'S SYSTEM-WIDE TRAINING                       ║');
    configParts.push('║              (Applied to All Organizations)                      ║');
    configParts.push('╚══════════════════════════════════════════════════════════════════╝');
    
    if (data.persona) {
      configParts.push('\n━━━ MADISON\'S PERSONA ━━━');
      configParts.push(data.persona);
    }
    
    if (data.editorial_philosophy) {
      configParts.push('\n━━━ EDITORIAL PHILOSOPHY ━━━');
      configParts.push(data.editorial_philosophy);
    }
    
    if (data.writing_influences) {
      configParts.push('\n━━━ WRITING INFLUENCES ━━━');
      configParts.push(data.writing_influences);
    }
    
    if (data.voice_spectrum) {
      configParts.push('\n━━━ VOICE SPECTRUM ━━━');
      configParts.push(data.voice_spectrum);
    }
    
    if (data.forbidden_phrases) {
      configParts.push('\n━━━ SYSTEM-WIDE FORBIDDEN PHRASES ━━━');
      configParts.push(data.forbidden_phrases);
    }
    
    if (data.quality_standards) {
      configParts.push('\n━━━ QUALITY STANDARDS ━━━');
      configParts.push(data.quality_standards);
    }
    
    configParts.push('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // ✨ Add author profiles directly from codebase
    try {
      const authorProfilesSection = buildAuthorProfilesSection();
      configParts.push(authorProfilesSection);
    } catch (error) {
      console.error('Error loading author profiles:', error);
      // Continue without author profiles if there's an error
    }
    
    // ✨ PERFORMANCE FIX: Limit training documents and truncate long content
    // ✨ Prioritize Peterman documents for adventure/romance style
    const { data: trainingDocs, error: docsError } = await supabase
      .from('madison_training_documents')
      .select('file_name, extracted_content')
      .eq('processing_status', 'completed')
      .not('extracted_content', 'is', null)
      .order('created_at', { ascending: false }) // Get most recent documents first
      .limit(5); // Increased to 5 to accommodate Peterman documents
    
    // Sort to prioritize Peterman documents (they're important for adventure/romance style)
    const sortedDocs = trainingDocs ? [...trainingDocs].sort((a, b) => {
      const aIsPeterman = a.file_name.toLowerCase().includes('peterman');
      const bIsPeterman = b.file_name.toLowerCase().includes('peterman');
      if (aIsPeterman && !bIsPeterman) return -1;
      if (!aIsPeterman && bIsPeterman) return 1;
      return 0; // Keep original order for non-Peterman docs
    }).slice(0, 5) : []; // Take top 5 after sorting
    
    if (!docsError && sortedDocs && sortedDocs.length > 0) {
      configParts.push('\n╔══════════════════════════════════════════════════════════════════╗');
      configParts.push('║           MADISON\'S CORE TRAINING DOCUMENTS                      ║');
      configParts.push('║          (Foundational Editorial Guidelines)                     ║');
      configParts.push('╚══════════════════════════════════════════════════════════════════╝');
      
      const MAX_TRAINING_DOC_LENGTH = 3000; // Limit each training doc to 3000 chars
      sortedDocs.forEach((doc, index) => {
        configParts.push(`\n━━━ TRAINING DOCUMENT ${index + 1}: ${doc.file_name} ━━━`);
        const content = doc.extracted_content.length > MAX_TRAINING_DOC_LENGTH
          ? doc.extracted_content.substring(0, MAX_TRAINING_DOC_LENGTH) + '\n[... truncated for performance ...]'
          : doc.extracted_content;
        configParts.push(content);
        configParts.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      });
      
      configParts.push('\n⚠️ CRITICAL: These training documents define your core editorial standards.');
      configParts.push('All responses must align with these principles and guidelines.');
      
      configParts.push('\n╔══════════════════════════════════════════════════════════════════╗');
      configParts.push('║        CRITICAL: TRAINING EXAMPLES - STYLE ONLY                    ║');
      configParts.push('╚══════════════════════════════════════════════════════════════════╝');
      configParts.push('');
      configParts.push('⚠️ PRODUCT REFERENCE PROTOCOL:');
      configParts.push('');
      configParts.push('The training documents above contain examples from legendary copywriters.');
      configParts.push('These examples may reference products (e.g., leather wallets, sunglasses,');
      configParts.push('watches, etc.) that are NOT relevant to the current user\'s business.');
      configParts.push('');
      configParts.push('YOUR RESPONSIBILITY:');
      configParts.push('• Extract the WRITING TECHNIQUE, CADENCE, and STYLISTIC APPROACH from examples');
      configParts.push('• NEVER reference products from training examples that don\'t match the user\'s actual products');
      configParts.push('• ALWAYS use the user\'s actual product data and brand context (provided separately)');
      configParts.push('• Apply the STYLE and STRUCTURE, not the literal product references');
      configParts.push('');
      configParts.push('EXAMPLE:');
      configParts.push('If a training example shows: "This leather wallet ages beautifully over 10 years..."');
      configParts.push('And the user sells candles, you should extract:');
      configParts.push('  ✓ The specificity technique (10 years = concrete timeframe)');
      configParts.push('  ✓ The cadence and sentence structure');
      configParts.push('  ✓ The benefit framing approach');
      configParts.push('But write about: "This candle burns cleanly for 60 hours..." (using their actual product)');
      configParts.push('');
      configParts.push('NEVER write: "This leather wallet..." when the user sells candles.');
      configParts.push('ALWAYS write about the user\'s actual products using the stylistic techniques from training.');
    }
    
    return configParts.join('\n');
  } catch (error) {
    console.error('Error in getMadisonSystemConfig:', error);
    return '';
  }
}

// Helper function to fetch copywriting style options
async function fetchCopywritingOptions(industryType: string, contentFormat: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  try {
    console.log(`Fetching copywriting options for industry: ${industryType}, format: ${contentFormat}`);
    
    // Query copywriting_style_mappings for compatible options
    const { data: mappings, error: mappingsError } = await supabase
      .from('copywriting_style_mappings')
      .select('*')
      .eq('industry_type', industryType)
      .eq('content_format', contentFormat);
    
    if (mappingsError) {
      console.error('Error fetching copywriting mappings:', mappingsError);
      return null;
    }
    
    if (!mappings || mappings.length === 0) {
      console.log('No copywriting mappings found for this combination');
      return null;
    }
    
    // Get unique copywriter names from mappings
    const copywriterNames = new Set<string>();
    mappings.forEach(m => {
      copywriterNames.add(m.primary_copywriter);
      if (m.secondary_copywriter) copywriterNames.add(m.secondary_copywriter);
    });
    
    // Get unique framework codes from mappings
    const frameworkCodes = new Set<string>();
    mappings.forEach(m => frameworkCodes.add(m.persuasion_framework));
    
    // ✨ PERFORMANCE FIX: Fetch techniques and frameworks in parallel
    const [
      { data: techniques, error: techniquesError },
      { data: frameworks, error: frameworksError }
    ] = await Promise.all([
      // Fetch copywriter techniques
      supabase
        .from('copywriter_techniques')
        .select('*')
        .in('copywriter_name', Array.from(copywriterNames)),
      
      // Fetch marketing frameworks
      supabase
        .from('marketing_frameworks')
        .select('*')
        .in('framework_code', Array.from(frameworkCodes))
    ]);
    
    if (techniquesError) {
      console.error('Error fetching copywriter techniques:', techniquesError);
    }
    
    if (frameworksError) {
      console.error('Error fetching marketing frameworks:', frameworksError);
    }
    
    return {
      mappings,
      techniques: techniques || [],
      frameworks: frameworks || []
    };
  } catch (error) {
    console.error('Error in fetchCopywritingOptions:', error);
    return null;
  }
}

// Helper function to build copywriting style context for Claude selection
function buildStyleSelectionPrompt(options: any, brandContext: string, productData: any, contentType: string) {
  const parts: string[] = [];
  
  parts.push('╔══════════════════════════════════════════════════════════════════╗');
  parts.push('║          COPYWRITING STYLE SELECTION PHASE                       ║');
  parts.push('║     (Intelligently select the best approach for this content)   ║');
  parts.push('╚══════════════════════════════════════════════════════════════════╝');
  parts.push('');
  
  parts.push('🎯 YOUR TASK:');
  parts.push('Analyze the brand context, product details, and available copywriting styles below.');
  parts.push('Select ONE style combination that will best serve this specific content piece.');
  parts.push('');
  
  // Available mappings
  parts.push('━━━ AVAILABLE STYLE COMBINATIONS ━━━');
  parts.push('');
  options.mappings.forEach((mapping: any, index: number) => {
    parts.push(`OPTION ${index + 1}:`);
    parts.push(`  • Primary Copywriter: ${mapping.primary_copywriter}`);
    if (mapping.secondary_copywriter) {
      parts.push(`  • Secondary Copywriter: ${mapping.secondary_copywriter} (blend)`);
    }
    parts.push(`  • Framework: ${mapping.persuasion_framework}`);
    parts.push(`  • Voice Spectrum: ${mapping.voice_spectrum}`);
    parts.push(`  • Urgency Level: ${mapping.urgency_level}`);
    if (mapping.key_hooks && mapping.key_hooks.length > 0) {
      parts.push(`  • Key Hooks: ${mapping.key_hooks.join(', ')}`);
    }
    if (mapping.example_snippet) {
      parts.push(`  • Example: "${mapping.example_snippet}"`);
    }
    parts.push('');
  });
  
  // Copywriter techniques detail
  parts.push('━━━ COPYWRITER TECHNIQUES LIBRARY ━━━');
  parts.push('');
  options.techniques.forEach((technique: any) => {
    parts.push(`${technique.copywriter_name.toUpperCase()} (${technique.copywriter_era}):`);
    parts.push(`  Philosophy: ${technique.core_philosophy}`);
    if (technique.writing_style_traits && technique.writing_style_traits.length > 0) {
      parts.push(`  Style Traits: ${technique.writing_style_traits.join(', ')}`);
    }
    if (technique.best_use_cases && technique.best_use_cases.length > 0) {
      parts.push(`  Best For: ${technique.best_use_cases.join(', ')}`);
    }
    parts.push('');
  });
  
  // Framework details
  parts.push('━━━ MARKETING FRAMEWORKS LIBRARY ━━━');
  parts.push('');
  options.frameworks.forEach((framework: any) => {
    parts.push(`${framework.framework_code} - ${framework.framework_name}:`);
    parts.push(`  Category: ${framework.framework_category}`);
    parts.push(`  Description: ${framework.description}`);
    parts.push(`  When to Use: ${framework.when_to_use}`);
    parts.push('');
  });
  
  parts.push('━━━ SELECTION CRITERIA ━━━');
  parts.push('');
  parts.push('Consider:');
  parts.push('1. Brand voice and tone from the brand guidelines');
  parts.push('2. Product collection theme and positioning');
  parts.push('3. Content format requirements');
  parts.push('4. What style will resonate best with this specific product/message');
  parts.push('5. Diversity - avoid repeating the same style if this is part of a series');
  parts.push('');
  parts.push('⚠️ OUTPUT FORMAT:');
  parts.push('First, output EXACTLY ONE line in this format:');
  parts.push('SELECTED_STYLE: [primary_copywriter]|[secondary_copywriter or NONE]|[framework_code]');
  parts.push('');
  parts.push('Example: SELECTED_STYLE: J. Peterman|David Ogilvy|AIDA');
  parts.push('Example: SELECTED_STYLE: David Ogilvy|NONE|FAB');
  parts.push('');
  parts.push('Then, generate the content using that selected style.');
  parts.push('');
  
  return parts.join('\n');
}

// Helper function to build brand context from database
async function buildBrandContext(organizationId: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  try {
    console.log(`Fetching brand context for organization: ${organizationId}`);
    
    // ✨ PERFORMANCE FIX: Run all database queries in parallel instead of sequentially
    const [
      { data: madisonSystemData },
      { data: knowledgeData, error: knowledgeError },
      { data: orgData, error: orgError },
      { data: docsData, error: docsError }
    ] = await Promise.all([
      // Fetch Madison system config
      supabase
        .from('madison_system_config')
        .select('*')
        .limit(1)
        .maybeSingle(),
      
      // ✨ PERFORMANCE FIX: Fetch brand knowledge entries (limit to prevent excessive context)
      supabase
        .from('brand_knowledge')
        .select('knowledge_type, content')
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .limit(20), // Limit to 20 most recent knowledge entries
      
      // Fetch organization brand config
      supabase
        .from('organizations')
        .select('name, brand_config')
        .eq('id', organizationId)
        .single(),
      
      // Fetch brand documents with extracted content (limit to 5 most recent to reduce context size)
      supabase
        .from('brand_documents')
        .select('file_name, file_type, extracted_content, created_at')
        .eq('organization_id', organizationId)
        .eq('processing_status', 'completed')
        .order('created_at', { ascending: false })
        .limit(5)
    ]);
    
    if (knowledgeError) {
      console.error('Error fetching brand knowledge:', knowledgeError);
    }
    
    if (orgError) {
      console.error('Error fetching organization:', orgError);
    }
    
    if (docsError) {
      console.error('Error fetching brand documents:', docsError);
    }
    
    // ✨ BRAND KNOWLEDGE TRANSPARENCY LOGGING
    console.log('[BRAND KNOWLEDGE CHECK]', {
      organizationId,
      knowledgeCount: knowledgeData?.length || 0,
      knowledgeTypes: knowledgeData?.map(k => k.knowledge_type) || [],
      activeDocuments: knowledgeData?.map(k => ({
        type: k.knowledge_type,
        contentSize: k.content ? JSON.stringify(k.content).length : 0,
        hasRawDocument: !!(k.content as any)?.raw_document,
        rawDocLength: (k.content as any)?.raw_document?.length || 0
      })) || [],
      totalContentSize: knowledgeData?.reduce((sum, k) => 
        sum + (k.content ? JSON.stringify(k.content).length : 0), 0
      ) || 0
    });
    
    // Extract visual standards separately
    const visualStandardsEntry = knowledgeData?.find(k => k.knowledge_type === 'visual_standards');
    const visualStandards = visualStandardsEntry?.content as any;
    
    // Build context string with proper hierarchy
    const contextParts: string[] = [];
    
    // LAYER 1: Madison's System Training (Foundation)
    if (madisonSystemData) {
      contextParts.push('\n╔══════════════════════════════════════════════════════════════════╗');
      contextParts.push('║              MADISON\'S CORE EDITORIAL TRAINING                   ║');
      contextParts.push('║         (Your foundational AI editorial guidelines)             ║');
      contextParts.push('╚══════════════════════════════════════════════════════════════════╝');
      
      if (madisonSystemData.persona) {
        contextParts.push('\n━━━ MADISON\'S PERSONA ━━━');
        contextParts.push(madisonSystemData.persona);
      }
      
      if (madisonSystemData.editorial_philosophy) {
        contextParts.push('\n━━━ EDITORIAL PHILOSOPHY ━━━');
        contextParts.push(madisonSystemData.editorial_philosophy);
      }
      
      if (madisonSystemData.forbidden_phrases) {
        contextParts.push('\n━━━ FORBIDDEN PHRASES (NEVER USE) ━━━');
        contextParts.push(madisonSystemData.forbidden_phrases);
      }
      
      if (madisonSystemData.quality_standards) {
        contextParts.push('\n━━━ QUALITY STANDARDS ━━━');
        contextParts.push(madisonSystemData.quality_standards);
      }
    }
    
    // LAYER 2: Client Brand Knowledge
    if (orgData?.name) {
      contextParts.push(`\n\nORGANIZATION: ${orgData.name}`);
    }
    
    // Add structured brand knowledge with enhanced formatting
    if (knowledgeData && knowledgeData.length > 0) {
      contextParts.push('\n╔══════════════════════════════════════════════════════════════════╗');
      contextParts.push('║          MANDATORY BRAND GUIDELINES - FOLLOW EXACTLY             ║');
      contextParts.push('║         (Client-specific brand voice and requirements)           ║');
      contextParts.push('╚══════════════════════════════════════════════════════════════════╝');
      
      // Organize by knowledge type for better prompt structure
      const voiceData = knowledgeData.find(k => k.knowledge_type === 'brand_voice')?.content as any;
      const vocabularyData = knowledgeData.find(k => k.knowledge_type === 'vocabulary')?.content as any;
      const examplesData = knowledgeData.find(k => k.knowledge_type === 'writing_examples')?.content as any;
      const structureData = knowledgeData.find(k => k.knowledge_type === 'structural_guidelines')?.content as any;
      
      // BRAND VOICE PROFILE
      if (voiceData) {
        contextParts.push('\n━━━ BRAND VOICE PROFILE ━━━');
        
        if (voiceData.toneAttributes && voiceData.toneAttributes.length > 0) {
          contextParts.push(`\n✦ TONE ATTRIBUTES (mandatory):`);
          contextParts.push(`   ${voiceData.toneAttributes.join(' • ')}`);
        }
        
        if (voiceData.personalityTraits && voiceData.personalityTraits.length > 0) {
          contextParts.push(`\n✦ PERSONALITY TRAITS:`);
          contextParts.push(`   ${voiceData.personalityTraits.join(' • ')}`);
        }
        
        if (voiceData.writingStyle) {
          contextParts.push(`\n✦ WRITING STYLE:`);
          contextParts.push(`   ${voiceData.writingStyle}`);
        }
        
        if (voiceData.keyCharacteristics && voiceData.keyCharacteristics.length > 0) {
          contextParts.push(`\n✦ KEY CHARACTERISTICS:`);
          voiceData.keyCharacteristics.forEach((char: string) => {
            contextParts.push(`   • ${char}`);
          });
        }
      }
      
      // VOCABULARY RULES
      if (vocabularyData) {
        contextParts.push('\n━━━ VOCABULARY RULES ━━━');
        
        if (vocabularyData.approvedTerms && vocabularyData.approvedTerms.length > 0) {
          contextParts.push(`\n✦ APPROVED TERMS (use naturally):`);
          contextParts.push(`   ${vocabularyData.approvedTerms.join(', ')}`);
        }
        
        if (vocabularyData.industryTerminology && vocabularyData.industryTerminology.length > 0) {
          contextParts.push(`\n✦ INDUSTRY TERMINOLOGY:`);
          contextParts.push(`   ${vocabularyData.industryTerminology.join(', ')}`);
        }
        
        if (vocabularyData.forbiddenPhrases && vocabularyData.forbiddenPhrases.length > 0) {
          contextParts.push(`\n✦ FORBIDDEN PHRASES (NEVER USE):`);
          vocabularyData.forbiddenPhrases.forEach((phrase: string) => {
            contextParts.push(`   ✗ "${phrase}"`);
          });
        }
        
        if (vocabularyData.preferredPhrasing) {
          contextParts.push(`\n✦ PREFERRED PHRASING:`);
          Object.entries(vocabularyData.preferredPhrasing).forEach(([preferred, avoid]) => {
            contextParts.push(`   ✓ Use "${preferred}" NOT "${avoid}"`);
          });
        }
      }
      
      // WRITING EXAMPLES (Few-Shot Learning)
      if (examplesData) {
        if (examplesData.goodExamples && examplesData.goodExamples.length > 0) {
          contextParts.push('\n━━━ ON-BRAND WRITING EXAMPLES ━━━');
          contextParts.push('Study these examples of excellent brand voice:');
          
          examplesData.goodExamples.forEach((example: any, i: number) => {
            contextParts.push(`\n📝 EXAMPLE ${i + 1}:`);
            contextParts.push(`"${example.text}"`);
            if (example.analysis) {
              contextParts.push(`Why it works: ${example.analysis}`);
            }
          });
        }
        
        if (examplesData.badExamples && examplesData.badExamples.length > 0) {
          contextParts.push('\n━━━ EXAMPLES TO AVOID ━━━');
          
          examplesData.badExamples.forEach((example: any, i: number) => {
            contextParts.push(`\n❌ BAD EXAMPLE ${i + 1}:`);
            contextParts.push(`"${example.text}"`);
            if (example.analysis) {
              contextParts.push(`Why to avoid: ${example.analysis}`);
            }
          });
        }
      }
      
      // STRUCTURAL GUIDELINES
      if (structureData) {
        contextParts.push('\n━━━ STRUCTURAL GUIDELINES ━━━');
        
        if (structureData.sentenceStructure) {
          contextParts.push(`\n✦ SENTENCE STRUCTURE: ${structureData.sentenceStructure}`);
        }
        
        if (structureData.paragraphLength) {
          contextParts.push(`✦ PARAGRAPH LENGTH: ${structureData.paragraphLength}`);
        }
        
        if (structureData.punctuationStyle) {
          contextParts.push(`✦ PUNCTUATION STYLE: ${structureData.punctuationStyle}`);
        }
        
        if (structureData.rhythmPatterns) {
          contextParts.push(`✦ RHYTHM PATTERNS: ${structureData.rhythmPatterns}`);
        }
      }
      
      contextParts.push('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      contextParts.push('⚠️ CRITICAL: Every sentence you write must embody these guidelines.');
      contextParts.push('Write AS the brand, not FOR the brand.');
      contextParts.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
    
    // Add brand colors and typography if available
    if (orgData?.brand_config) {
      const config = orgData.brand_config as any;
      if (config.brand_colors || config.typography) {
        contextParts.push('\n=== BRAND VISUAL IDENTITY ===');
        if (config.brand_colors) {
          contextParts.push(`Colors: ${JSON.stringify(config.brand_colors)}`);
        }
        if (config.typography) {
          contextParts.push(`Typography: ${JSON.stringify(config.typography)}`);
        }
      }
      
      // Add industry schema instructions
      if (config.industry_config) {
        const industryConfig = config.industry_config;
        contextParts.push('\n╔════ INDUSTRY CONTEXT ════╗');
        contextParts.push(`Industry: ${industryConfig.name}`);
        contextParts.push(`\nWhen you see the following fields in the brief, understand them in the context of ${industryConfig.name}:`);
        industryConfig.fields?.forEach((field: any, index: number) => {
          contextParts.push(`  • ${field.label}: This describes the product's ${field.label.toLowerCase()}`);
        });
        contextParts.push(`\nThese fields replace generic product details and should be interpreted accordingly.`);
        contextParts.push('╚' + '═'.repeat(26) + '╝\n');
      }
    }
    
    // Add processed brand documents with full content
    if (docsData && docsData.length > 0) {
      contextParts.push(`\n╔════ UPLOADED BRAND DOCUMENTS ════╗`);
      contextParts.push(`📄 ${docsData.length} brand document(s) with detailed guidelines:\n`);
      
      // ✨ PERFORMANCE FIX: Truncate very long documents to prevent excessive context
      const MAX_DOCUMENT_LENGTH = 5000; // Limit each document to 5000 chars
      docsData.forEach((doc, index) => {
        contextParts.push(`━━━ DOCUMENT ${index + 1}: ${doc.file_name} ━━━`);
        if (doc.extracted_content) {
          const content = doc.extracted_content.length > MAX_DOCUMENT_LENGTH
            ? doc.extracted_content.substring(0, MAX_DOCUMENT_LENGTH) + '\n[... content truncated for performance ...]'
            : doc.extracted_content;
          contextParts.push(content);
          contextParts.push(''); // Empty line for separation
        } else {
          contextParts.push(`   • ${doc.file_name} (${doc.file_type}) - Content not yet extracted`);
        }
      });
      
      contextParts.push(`\n⚠️ CRITICAL: All guidelines from these documents are MANDATORY and MUST be followed exactly.`);
      contextParts.push(`╚${'═'.repeat(38)}╝\n`);
    }
    
    // Add visual standards for AI image generation
    if (visualStandards) {
      contextParts.push('\n╔══════════════════════════════════════════════════════════════════╗');
      contextParts.push('║         VISUAL STANDARDS FOR AI IMAGE GENERATION                 ║');
      contextParts.push('║              (MANDATORY FOR IMAGE STUDIO)                        ║');
      contextParts.push('╚══════════════════════════════════════════════════════════════════╝');
      
      if (visualStandards.golden_rule) {
        contextParts.push('\n━━━ GOLDEN RULE ━━━');
        contextParts.push(`✦ ${visualStandards.golden_rule}`);
      }
      
      if (visualStandards.color_palette && visualStandards.color_palette.length > 0) {
        contextParts.push('\n━━━ MANDATORY COLOR PALETTE ━━━');
        contextParts.push('Use these exact colors in all image generation prompts:');
        visualStandards.color_palette.forEach((color: any) => {
          contextParts.push(`  • ${color.name} (${color.hex}): ${color.usage}`);
        });
      }
      
      if (visualStandards.lighting_mandates) {
        contextParts.push('\n━━━ LIGHTING STANDARDS ━━━');
        contextParts.push(`✦ ${visualStandards.lighting_mandates}`);
      }
      
      if (visualStandards.templates && visualStandards.templates.length > 0) {
        contextParts.push('\n━━━ APPROVED PROMPT TEMPLATES ━━━');
        contextParts.push('Reference these templates by name when suggesting prompts:');
        visualStandards.templates.forEach((template: any, index: number) => {
          contextParts.push(`\n  ${index + 1}. ${template.name} (${template.aspectRatio})`);
          contextParts.push(`     Template: "${template.prompt}"`);
        });
      }
      
      if (visualStandards.forbidden_elements && visualStandards.forbidden_elements.length > 0) {
        contextParts.push('\n━━━ FORBIDDEN ELEMENTS ━━━');
        contextParts.push('⚠️ NEVER suggest or allow these in prompts:');
        visualStandards.forbidden_elements.forEach((element: string) => {
          contextParts.push(`  ✗ ${element}`);
        });
      }
      
      if (visualStandards.approved_props && visualStandards.approved_props.length > 0) {
        contextParts.push('\n━━━ APPROVED PROPS ━━━');
        contextParts.push('✓ Use these props in compositions:');
        visualStandards.approved_props.forEach((prop: string) => {
          contextParts.push(`  • ${prop}`);
        });
      }
      
      if (visualStandards.raw_document) {
        contextParts.push('\n━━━ FULL VISUAL STANDARDS DOCUMENT ━━━');
        contextParts.push(visualStandards.raw_document);
      }
      
      contextParts.push('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      contextParts.push('⚠️ CRITICAL MADISON INSTRUCTIONS:');
      contextParts.push('- Reference templates by name (e.g., "Use the Hero Product Shot template")');
      contextParts.push('- Always include hex color codes (e.g., "Stone Beige #D8C8A9")');
      contextParts.push('- Warn users if they request forbidden elements');
      contextParts.push('- Inject lighting mandates into every prompt suggestion');
      contextParts.push('- Follow the golden rule in all creative direction');
      contextParts.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
    
    const fullContext = contextParts.join('\n');
    console.log(`Built brand context (${fullContext.length} characters)`);
    
    return fullContext;
  } catch (error) {
    console.error('Error building brand context:', error);
    return '';
  }
}

// Helper function to fetch copywriting sequence for Phase 3.5
async function fetchCopywritingSequence(industryType: string, contentFormat: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  try {
    console.log(`[PHASE 3.5] Fetching sequence for industry: ${industryType}, format: ${contentFormat}`);
    
    // ✨ PERFORMANCE FIX: Run database queries in parallel
    // Query sequences ordered by sequence_order
    const { data: sequences, error: sequencesError } = await supabase
      .from('copywriting_sequences')
      .select('*')
      .eq('industry_type', industryType)
      .eq('content_format', contentFormat)
      .eq('is_forbidden', false)
      .order('sequence_order', { ascending: true });
    
    if (sequencesError) {
      console.error('[PHASE 3.5] Error fetching sequences:', sequencesError);
      return null;
    }
    
    if (!sequences || sequences.length === 0) {
      console.log('[PHASE 3.5] No sequence found, will fall back to Phase 3');
      return null;
    }
    
    // Get unique copywriter names from sequence
    const copywriterNames = [...new Set(sequences.map(s => s.copywriter_name))];
    
    // ✨ PERFORMANCE FIX: Fetch forbidden copywriters and techniques in parallel
    const [
      { data: forbidden },
      { data: techniques }
    ] = await Promise.all([
      // Fetch forbidden copywriters for this format
      supabase
        .from('copywriting_sequences')
        .select('copywriter_name')
        .eq('industry_type', industryType)
        .eq('content_format', contentFormat)
        .eq('is_forbidden', true),
      
      // Fetch copywriter techniques
      supabase
        .from('copywriter_techniques')
        .select('*')
        .in('copywriter_name', copywriterNames)
    ]);
    
    // Build techniques lookup
    const techniquesMap: Record<string, any> = {};
    techniques?.forEach(t => {
      techniquesMap[t.copywriter_name] = t;
    });
    
    console.log(`[PHASE 3.5] Found ${sequences.length}-step sequence: ${sequences.map(s => s.copywriter_name).join(' → ')}`);
    
    return {
      sequences,
      techniques: techniquesMap,
      forbiddenCopywriters: forbidden?.map(f => f.copywriter_name) || []
    };
  } catch (error) {
    console.error('[PHASE 3.5] Error in fetchCopywritingSequence:', error);
    return null;
  }
}

// Build sequencing prompt for Phase 3.5 (single-pass approach)
function buildSequencingPrompt(sequenceData: any, contentType: string) {
  const parts: string[] = [];
  
  parts.push('╔══════════════════════════════════════════════════════════════════╗');
  parts.push('║          PHASE 3.5: COPYWRITING SEQUENCE EXECUTION              ║');
  parts.push('║        (Apply Multi-Step Copywriter Technique Layering)         ║');
  parts.push('╚══════════════════════════════════════════════════════════════════╝');
  parts.push('');
  
  parts.push('🎯 YOUR TASK:');
  parts.push(`Generate ${contentType} content by flowing through the prescribed copywriting sequence below.`);
  parts.push('Each step should blend naturally into the next, creating ONE cohesive piece.');
  parts.push('Do NOT create separate sections - weave the techniques together fluidly.');
  parts.push('');
  
  // Show the sequence flow
  parts.push('━━━ COPYWRITING SEQUENCE FLOW ━━━');
  parts.push('');
  const sequenceFlow = sequenceData.sequences.map((s: any) => 
    `${s.copywriter_name} (${s.copywriter_role})`
  ).join(' → ');
  parts.push(`${sequenceFlow}`);
  parts.push('');
  
  // Detail each step
  parts.push('━━━ STEP-BY-STEP TECHNIQUE APPLICATION ━━━');
  parts.push('');
  
  sequenceData.sequences.forEach((step: any, index: number) => {
    const technique = sequenceData.techniques[step.copywriter_name];
    
    parts.push(`STEP ${index + 1}: ${step.copywriter_name.toUpperCase()} — ${step.copywriter_role}`);
    parts.push('');
    
    if (technique) {
      parts.push(`  Core Philosophy: ${technique.core_philosophy}`);
      parts.push('');
      
      if (technique.signature_techniques) {
        parts.push('  Signature Techniques to Apply:');
        technique.signature_techniques.forEach((t: any) => {
          parts.push(`    • ${t.name}: ${t.description}`);
        });
        parts.push('');
      }
      
      if (technique.writing_style_traits) {
        parts.push(`  Style Traits: ${technique.writing_style_traits.join(', ')}`);
        parts.push('');
      }
    }
    
    parts.push(`  → What This Step Accomplishes: ${step.copywriter_role}`);
    parts.push('');
    parts.push('  ─────────────────────────────────────────');
    parts.push('');
  });
  
  // Forbidden copywriters enforcement
  if (sequenceData.forbiddenCopywriters.length > 0) {
    parts.push('━━━ FORBIDDEN COPYWRITERS FOR THIS FORMAT ━━━');
    parts.push('');
    parts.push('⚠️ DO NOT apply techniques from these copywriters:');
    sequenceData.forbiddenCopywriters.forEach((name: string) => {
      parts.push(`  ✗ ${name}`);
    });
    parts.push('');
    parts.push('These styles are incompatible with this content format.');
    parts.push('');
  }
  
  // Integration instructions
  parts.push('━━━ INTEGRATION INSTRUCTIONS ━━━');
  parts.push('');
  parts.push('1. Start with Step 1\'s technique, establishing the foundation');
  parts.push('2. Transition smoothly to Step 2, building upon Step 1');
  parts.push('3. Continue layering each subsequent step naturally');
  parts.push('4. The final output should read as ONE unified voice, not separate sections');
  parts.push('5. Each technique should enhance the previous, creating sophisticated depth');
  parts.push('');
  
  parts.push('⚠️ CRITICAL: Brand lexical mandates (vocabulary, forbidden phrases) MUST be honored');
  parts.push('throughout the entire sequence, regardless of copywriter techniques applied.');
  parts.push('');
  
  return parts.join('\n');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('CORS preflight request received');
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    // Authentication check - verify JWT token is present and valid
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing Authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Authentication required' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract and verify the JWT token
    const token = authHeader.replace('Bearer ', '');
    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Authentication failed:', authError?.message || 'Invalid user');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid or expired token' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Authenticated request from user: ${user.id}`);
    
    // Determine model availability - Priority: Gemini Direct > Claude
    // Gemini Direct is most cost-effective (subscription-based), Claude is high quality but pay-per-use
    const hasGeminiDirect = !!GEMINI_API_KEY;
    const hasAnthropicAPI = !!ANTHROPIC_API_KEY;
    
    if (!hasGeminiDirect && !hasAnthropicAPI) {
      throw new Error('No AI API configured. Please set GEMINI_API_KEY or ANTHROPIC_API_KEY.');
    }
    
    // Log which APIs are available
    const availableAPIs = [];
    if (hasGeminiDirect) availableAPIs.push('Gemini Direct');
    if (hasAnthropicAPI) availableAPIs.push('Claude');
    
    console.log(`Using API priority: ${availableAPIs.join(' → ')}`);
    if (hasGeminiDirect) {
      console.log('Using Gemini Direct API as primary (cost-effective subscription)');
    } else {
      console.log('Using Anthropic Claude for generation');
    }

    // Parse request body with error handling
    let requestBody: any;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.error('Error parsing request body:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid request body. Please check your request format.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { prompt, organizationId, mode = "generate", styleOverlay = "brand-voice", productData, contentType, userName, images, product_id } = requestBody;
    
    // Validate required fields
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: prompt' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate images if provided (limit count and size)
    if (images && Array.isArray(images)) {
      if (images.length > 3) {
        return new Response(
          JSON.stringify({ error: 'Too many images. Please upload up to 3 images.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const BYTES_LIMIT = 5 * 1024 * 1024; // 5MB per image (Claude's limit)
      for (const img of images) {
        const match = /^data:([^;]+);base64,(.+)$/.exec(img);
        if (!match) continue;
        const base64 = match[2];
        const sizeBytes = Math.floor((base64.length * 3) / 4);
        if (sizeBytes > BYTES_LIMIT) {
          return new Response(
            JSON.stringify({ error: 'Image too large. Claude API requires images under 5MB. Please compress or resize your image.' }),
            { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }
    
    // Verify user has access to the requested organization
    if (organizationId) {
      const hasAccess = await verifyOrganizationAccess(user.id, organizationId);
      if (!hasAccess) {
        console.error(`User ${user.id} does not have access to organization ${organizationId}`);
        return new Response(
          JSON.stringify({ error: 'Forbidden - You do not have access to this organization' }), 
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log(`User ${user.id} verified for organization ${organizationId}`);
    }

    console.log('Generating content with Claude:', {
      promptLength: prompt?.length || 0,
      promptPreview: prompt?.substring(0, 100) || 'N/A',
      mode,
      styleOverlay,
      contentType,
      organizationId: organizationId || 'N/A',
      hasProductData: !!productData,
      productCategory: productData?.category || 'N/A',
      hasAnthropicAPI
    });

    // Fetch full product data from database if product_id is provided
    let enrichedProductData = productData;
    if (product_id && organizationId) {
      console.log('Fetching product data from database for ID:', product_id);
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data: dbProductData, error: productError } = await supabase
        .from('brand_products')
        .select('*')
        .eq('id', product_id)
        .eq('organization_id', organizationId)
        .maybeSingle();
      
      if (productError) {
        console.error('Error fetching product data:', productError);
      } else if (dbProductData) {
        console.log('Product data fetched from database:', dbProductData.name);
        // Merge database data with any passed productData (database takes priority)
        enrichedProductData = { ...productData, ...dbProductData };
        
        // 🎯 FILTER TO SEMANTIC FIELDS ONLY FOR COPYWRITING
        // This prevents visual/technical fields from cluttering the copywriting prompt
        enrichedProductData = getSemanticFields(enrichedProductData);
        console.log('✅ Filtered to semantic fields for copywriting (25 fields max)');
      }
    }

    // ========== PHASE 3.5 & PHASE 3: DYNAMIC COPYWRITING STYLE SYSTEM ==========
    let copywritingStyleContext = '';
    let usePhase3 = false;
    let usePhase35 = false;
    
    // Fetch organization's industry type for Phase 3.5/3
    if (organizationId && mode === "generate") {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data: orgData } = await supabase
        .from('organizations')
        .select('industry_type')
        .eq('id', organizationId)
        .maybeSingle();
      
      if (orgData?.industry_type && contentType) {
        // Try Phase 3.5 sequencing first
        const sequenceData = await fetchCopywritingSequence(orgData.industry_type, contentType);
        
        if (sequenceData) {
          // Phase 3.5: Use multi-step sequencing
          console.log('[PHASE 3.5] Activating multi-step copywriter sequencing');
          usePhase35 = true;
          copywritingStyleContext = buildSequencingPrompt(sequenceData, contentType);
        } else {
          // Phase 3: Fall back to single-selection
          console.log('[PHASE 3] Attempting dynamic style selection (Phase 3.5 sequence not found)');
          console.log(`[PHASE 3] Industry: ${orgData.industry_type}, Content Type: ${contentType}`);
          
          const copywritingOptions = await fetchCopywritingOptions(orgData.industry_type, contentType);
          
          if (copywritingOptions && copywritingOptions.mappings.length > 0) {
            console.log(`[PHASE 3] Found ${copywritingOptions.mappings.length} style options`);
            usePhase3 = true;
            
            // Build brand context for selection
            const brandContext = await buildBrandContext(organizationId);
            
            // Build style selection prompt
            copywritingStyleContext = buildStyleSelectionPrompt(
              copywritingOptions,
              brandContext,
              enrichedProductData,
              contentType
            );
          } else {
            console.log('[PHASE 3] No copywriting options found, falling back to legacy style overlays');
          }
        }
      }
    }
    
    // Build brand-aware system prompt based on mode
    let systemPrompt = '';
    
    // Category-specific prompt templates
    const CATEGORY_PROMPTS = {
      personal_fragrance: (product: any) => `
╔══════════════════════════════════════════════════════════════════╗
║           PRODUCT CATEGORY: PERSONAL FRAGRANCE                    ║
╚══════════════════════════════════════════════════════════════════╝

PRODUCT METADATA (USE EXACTLY AS PROVIDED):
• Product Name: ${product.name}
• Collection: ${product.collection || 'Not specified'}
• Product Type: ${product.product_type || 'Not specified'}

FRAGRANCE STRUCTURE:
• Scent Family: ${product.scentFamily || 'Not specified'}
• Top Notes: ${product.topNotes || 'Not specified'} (first impression)
• Middle Notes: ${product.middleNotes || 'Not specified'} (heart of the scent)
• Base Notes: ${product.baseNotes || 'Not specified'} (lasting foundation)

BRAND POSITIONING:
• USP: ${product.usp || 'Not specified'}
• Brand Tone: ${product.tone || 'Not specified'}

⚠️ CRITICAL INSTRUCTIONS:
- Use fragrance pyramid language (top/middle/base notes)
- DO NOT invent additional notes or modify the scent profile
- DO NOT mention bottle sizes unless explicitly provided
- Maintain the exact product name and collection as shown above
`,
      
      home_fragrance: (product: any) => `
╔══════════════════════════════════════════════════════════════════╗
║              PRODUCT CATEGORY: HOME FRAGRANCE                     ║
╚══════════════════════════════════════════════════════════════════╝

PRODUCT METADATA (USE EXACTLY AS PROVIDED):
• Product Name: ${product.name}
• Collection: ${product.collection || 'Not specified'}
• Product Type: ${product.product_type || 'Not specified'}
• Format: ${product.format || 'Not specified'} (candle, diffuser, spray, etc.)

SCENT DETAILS:
• Overall Scent Profile: ${product.scentProfile || 'Not specified'}
• Burn Time / Duration: ${product.burnTime || 'Not specified'}

BRAND POSITIONING:
• USP: ${product.usp || 'Not specified'}
• Brand Tone: ${product.tone || 'Not specified'}

⚠️ CRITICAL INSTRUCTIONS:
- DO NOT use perfume pyramid language (top/middle/base notes) for home fragrance
- Describe the scent holistically, not in layers
- DO NOT invent additional product details or sizes
- Maintain the exact product name and collection as shown above
`,
      
      skincare: (product: any) => `
╔══════════════════════════════════════════════════════════════════╗
║           PRODUCT CATEGORY: SKINCARE / BEAUTY                     ║
╚══════════════════════════════════════════════════════════════════╝

PRODUCT METADATA (USE EXACTLY AS PROVIDED):
• Product Name: ${product.name}
• Collection: ${product.collection || 'Not specified'}
• Product Type: ${product.product_type || 'Not specified'}
• Formulation Type: ${product.formulationType || 'Not specified'}

FORMULA DETAILS:
• Key Ingredients: ${product.keyIngredients || 'Not specified'}
• Benefits: ${product.benefits || 'Not specified'}
• Usage Instructions: ${product.usage || 'Not specified'}

BRAND POSITIONING:
• USP: ${product.usp || 'Not specified'}
• Brand Tone: ${product.tone || 'Not specified'}

⚠️ CRITICAL INSTRUCTIONS:
- DO NOT use fragrance notes language for skincare products
- Focus on ingredients, benefits, and results
- DO NOT invent ingredients, benefits, or sizes
- Maintain the exact product name and collection as shown above
`
    };
    
    // Build style overlay instructions
    const styleOverlayInstructions = {
      TARIFE_NATIVE: `
╔══════════════════════════════════════════════════════════════════╗
║                    STYLE OVERLAY: TARIFE NATIVE                   ║
║                    (In-House Brand Voice)                         ║
╚══════════════════════════════════════════════════════════════════╝

Apply the brand's authentic voice as established in the brand guidelines above.
This is the default style—trust the brand DNA and maintain consistency.`,

      JAY_PETERMAN: `
╔══════════════════════════════════════════════════════════════════╗
║                  STYLE OVERLAY: J PETERMAN                        ║
║                      (Vignette Style)                             ║
╚══════════════════════════════════════════════════════════════════╝

VIGNETTE NARRATIVE APPROACH:
• Open with a vivid scene or moment in time
• Use sensory details to create immersion
• Tell a micro-story that embodies the product's essence
• Let the product emerge naturally from the narrative
• Avoid direct selling—let the story do the work

STRUCTURAL ELEMENTS:
• First-person or intimate second-person perspective
• Present tense for immediacy
• Short, punchy sentences mixed with flowing descriptive passages
• Cinematic imagery—what would you see, smell, hear, feel?

TONE:
• Sophisticated storytelling
• Evocative without being flowery
• A touch of wanderlust or nostalgia
• Confident but never pushy`,

      OGILVY: `
╔══════════════════════════════════════════════════════════════════╗
║                     STYLE OVERLAY: OGILVY                         ║
║                      (Benefit + Proof)                            ║
╚══════════════════════════════════════════════════════════════════╝

OGILVY ADVERTISING APPROACH:
• Lead with the primary benefit (what's in it for them?)
• Support with proof points (specifics, facts, credentials)
• Clear value proposition—no vague claims
• Rational persuasion rooted in product truth

STRUCTURAL ELEMENTS:
• Benefit headline or opening
• Specific product attributes that deliver the benefit
• Credentials or provenance that add authority
• Close with a clear next step or reinforcement of value

TONE:
• Authoritative but accessible
• Fact-based and specific
• No hyperbole—let the facts speak
• Respectful of reader intelligence`,

      HYBRID_JP_OGILVY: `
╔══════════════════════════════════════════════════════════════════╗
║                STYLE OVERLAY: HYBRID JP × OGILVY                  ║
║                      (Scene + Proof)                              ║
╚══════════════════════════════════════════════════════════════════╝

HYBRID NARRATIVE + BENEFIT APPROACH:
• Open with a vivid vignette or evocative scene (Jay Peterman style)
• Transition to clear benefit statements and proof points (Ogilvy method)
• Blend storytelling with strategic persuasion
• Emotional engagement followed by rational validation

STRUCTURAL ELEMENTS:
• Act 1: The Scene — Immersive narrative moment
• Act 2: The Why — Benefits and supporting details
• Act 3: The Close — Reinforcement or call to awareness

TONE:
• Sophisticated storytelling that earns trust
• Emotional resonance supported by product truth
• Cinematic opening, authoritative middle, confident close
• Balance poetry with precision`,

      MINIMAL_MODERN: `
╔══════════════════════════════════════════════════════════════════╗
║                STYLE OVERLAY: MINIMAL & MODERN                    ║
║                    (Clean & Direct)                               ║
╚══════════════════════════════════════════════════════════════════╝

MINIMAL & MODERN APPROACH:
• Strip away ornamental language—favor clarity and precision
• Short sentences with strong verbs
• Clean, scannable structure (use whitespace strategically)
• No fluff, filler, or unnecessary adjectives
• Lead with the essential truth of the product/brand

STRUCTURAL ELEMENTS:
• Crisp opening statement (no preamble)
• 1-2 sentence paragraphs maximum
• Bullet points or short stacks of information
• Active voice, present tense
• Confident assertions over hedging language

TONE:
• Contemporary and urbane
• Confident minimalism—less is more
• Smart but accessible (no jargon unless necessary)
• Clean aesthetic—like a well-designed space
• No nostalgia, no overwrought emotion—modern clarity

INSPIRATION:
Think Apple product copy, Kinfolk magazine, or Scandinavian design philosophy—
beauty through reduction, meaning through precision.`
    };
    
    // Map UI values to system values
    const styleMapping: Record<string, string> = {
      'brand-voice': 'BRAND_VOICE', // Generic, uses brand knowledge only
      'poetic': 'JAY_PETERMAN',
      'direct': 'OGILVY',
      'story': 'HYBRID_JP_OGILVY',
      'minimal': 'MINIMAL_MODERN',
    };

    const mappedStyle = styleMapping[styleOverlay] || 'BRAND_VOICE';
    const selectedStyleOverlay = mappedStyle === 'BRAND_VOICE' 
      ? '' // No style overlay, just use brand knowledge
      : styleOverlayInstructions[mappedStyle as keyof typeof styleOverlayInstructions] || '';
    
    // Fetch Madison's system-wide training first
    const madisonSystemConfig = await getMadisonSystemConfig();
    
    // Build category-specific product context
    let productContext = '';
    if (enrichedProductData && enrichedProductData.category) {
      const categoryPromptBuilder = CATEGORY_PROMPTS[enrichedProductData.category as keyof typeof CATEGORY_PROMPTS];
      if (categoryPromptBuilder) {
        productContext = categoryPromptBuilder(enrichedProductData);
      }
    } else if (!enrichedProductData) {
      // No product selected - brand-level request
      productContext = `
╔══════════════════════════════════════════════════════════════════╗
║                    BRAND-LEVEL CONTENT REQUEST                    ║
╚══════════════════════════════════════════════════════════════════╝

⚠️ NO SPECIFIC PRODUCT SELECTED

This is a brand-level content request. Write about:
• The organization's mission, values, or philosophy
• General product category or offerings (not specific SKUs)
• Brand story, heritage, or positioning
• Audience benefits at a macro level

DO NOT invent or reference specific products, SKUs, or product details.
`;
    }
    
    // Build mandatory product specifications section (Phase 1 fix)
    let mandatoryProductSpecs = '';
    if (enrichedProductData && enrichedProductData.category === 'personal_fragrance') {
      const contextParts: string[] = [];
      
      contextParts.push('\n╔══════════════════════════════════════════════════════════════════╗');
      contextParts.push('║           MANDATORY PRODUCT SPECIFICATIONS                       ║');
      contextParts.push('║        (THESE MUST BE REFERENCED IN YOUR OUTPUT)                ║');
      contextParts.push('╚══════════════════════════════════════════════════════════════════╝');
      
      contextParts.push('\n━━━ FRAGRANCE PROFILE ━━━');
      if (enrichedProductData.top_notes) contextParts.push(`✦ TOP NOTES (opening): ${enrichedProductData.top_notes}`);
      if (enrichedProductData.middle_notes) contextParts.push(`✦ MIDDLE NOTES (heart): ${enrichedProductData.middle_notes}`);
      if (enrichedProductData.base_notes) contextParts.push(`✦ BASE NOTES (dry-down): ${enrichedProductData.base_notes}`);
      if (enrichedProductData.scent_family) contextParts.push(`✦ SCENT FAMILY: ${enrichedProductData.scent_family}`);
      
      contextParts.push('\n⚠️ CRITICAL RULE FOR FRAGRANCE DESCRIPTIONS:');
      contextParts.push('1. You MUST weave these specific notes into your description');
      contextParts.push('2. DO NOT invent or substitute different notes');
      contextParts.push('3. Reference at least 2-3 specific note names from the data above');
      contextParts.push('4. Use sensory language to describe how these notes interact');
      
      if (enrichedProductData.collection) {
        contextParts.push(`\n━━━ COLLECTION CONTEXT ━━━`);
        contextParts.push(`✦ Collection: ${enrichedProductData.collection}`);
        contextParts.push('\n⚠️ COLLECTION MENTION RULES:');
        contextParts.push('- Mention the collection name ONCE at most (if contextually relevant)');
        contextParts.push('- DO NOT repeat the collection name in every paragraph');
        contextParts.push('- Focus on the PRODUCT itself, not the collection branding');
        contextParts.push('- The collection provides context for tone, not a phrase to repeat');
      }
      
      mandatoryProductSpecs = contextParts.join('\n');
    }
    
    // Product guidance for system prompt
    const productGuidance = enrichedProductData 
      ? `\n⚠️ PRODUCT-SPECIFIC COPY: This request is for a specific product. Reference product details naturally.`
      : `\n⚠️ BRAND-LEVEL COPY: No specific product selected. Write at the brand/organizational level. Focus on brand values, mission, or general offerings.`;
    
    // Fetch and inject brand context if organization ID provided
    if (organizationId) {
      const brandContext = await buildBrandContext(organizationId);
      
      if (brandContext) {
        if (mode === "generate") {
          // GENERATE MODE: Ghostwriter role with Codex v2
          
          // Use Phase 3 dynamic style selection if available, otherwise use legacy style overlays
          const styleSection = usePhase3 
            ? copywritingStyleContext 
            : selectedStyleOverlay;
          
          systemPrompt = `${madisonSystemConfig}

${brandContext}

${mandatoryProductSpecs}

${productContext}

${styleSection}

${productGuidance}

╔══════════════════════════════════════════════════════════════════╗
║              CONTENT GENERATION HIERARCHY                        ║
║           (Follow This Order of Priority)                        ║
╚══════════════════════════════════════════════════════════════════╝

1. PRODUCT DATA FIRST:
   - If fragrance notes are provided, you MUST use them verbatim
   - If scent family is specified, describe within that family
   - Never invent or substitute product specifications
   - Product details are your SOURCE OF TRUTH
   - ⚠️ CRITICAL: NEVER reference products from training examples (e.g., wallets, sunglasses, watches)
   - ⚠️ ALWAYS write about the user's ACTUAL products using stylistic techniques from training

2. BRAND VOICE SECOND:
   - Apply the brand voice TO the product data, not instead of it
   - Use approved vocabulary to describe the specific product
   - Brand voice shapes HOW you say it, not WHAT you say

3. COLLECTION CONTEXT LAST:
   - Mention collection name 0-1 times maximum
   - Focus on the product, not the brand architecture
   - Collection provides tonal context, not repetitive branding

━━━ PRE-FLIGHT CHECKLIST (Ask yourself before sending output) ━━━
☑ Did I use the specific fragrance notes provided (not made-up ones)?
☑ Did I avoid repeating the collection name?
☑ Is this description specific to THIS product (not generic)?
☑ Would a customer understand what this smells like?
☑ Am I writing about the PRODUCT, not just the COLLECTION?
☑ Did I extract STYLE and CADENCE from training examples, not literal product references?
☑ Am I writing about the user's ACTUAL products, not products from training examples?

╔══════════════════════════════════════════════════════════════════╗
║                      GLOBAL SYSTEM PROMPT                         ║
║                        (Codex v2 — Universal)                     ║
╚══════════════════════════════════════════════════════════════════╝

IDENTITY & ROLES:

**Ghostwriter**: Generates first drafts of manuscripts, assets, and editions. Produces copy aligned to brand DNA and task schema.

**Curator**: Reviews and critiques Ghostwriter output. Ensures alignment to global rules, tone, and quality standards. Provides structured feedback and suggested refinements.

CORE PRINCIPLES:

1. Clarity & Specificity
   - Always prefer concrete details over vague adjectives
   - Replace generalizations ("great," "amazing") with tangible attributes

2. Respect Intelligence
   - Assume the audience is sophisticated
   - Never condescend, oversimplify, or use filler hype

3. Understated Elegance
   - Quality is implied through substance, not shouted through superlatives
   - Vary rhythm and structure; avoid monotony

4. Accuracy First
   - Prioritize truthfulness, fact-checking, and alignment with provided brand or industry data

WORKFLOW (Universal Sequence):

1. Analyze → Read the task, brand DNA, and industry baseline
2. Context → Identify audience, medium, and purpose
3. Angle → Choose a narrative or rhetorical angle appropriate to the task
4. Voice → Adopt the brand's voice and tone, respecting do's/don'ts
5. Draft → Compose the copy according to schema
6. Self-Review → Check banned words, tone alignment, specificity, rhythm. Revise

BANNED WORDS (Universal):

Aggressively avoid the following categories:
- AI clichés: unlock, unleash, delve, tapestry, elevate, landscape
- Marketing clichés: game-changing, revolutionary, must-have, seamlessly, holy grail
- Empty adjectives: amazing, beautiful, incredible, fantastic

EVALUATION CHECKLIST:

Before final output, verify:
✓ Is the copy specific and free of vague adjectives?
✓ Does it align with the injected Brand DNA pillars?
✓ Does it avoid banned words?
✓ Is the rhythm and structure varied?
✓ Is it factually accurate?

OUTPUT RULES:

- Always return text in the required schema (PDP, email, blog, social, etc.)
- Stay concise where schema limits apply (e.g., ≤50 words for PDP short descriptions)
- Return clean, copy-paste ready text with NO Markdown formatting
- No asterisks, bold, italics, headers, or special formatting
- No emojis, no excessive enthusiasm
- ONLY the requested copy content—nothing else

╔══════════════════════════════════════════════════════════════════╗
║                  FORMAT-SPECIFIC GUIDELINES                       ║
╚══════════════════════════════════════════════════════════════════╝

${contentType === 'video_script' || contentType === 'short_form_video_script' ? `
━━━ VIDEO SCRIPT FORMAT ━━━

You are writing a VIDEO SCRIPT, not a blog post. Follow this structure EXACTLY:

${contentType === 'short_form_video_script' ? `
SHORT-FORM VIDEO (30-60 seconds for Reels/TikTok/Shorts):

[HOOK - 0:03]
First 3 seconds to grab attention
(Write as spoken dialogue, natural and conversational)

[SETUP - 0:10]
Context or problem introduction
(Visual cues in brackets [like this])

[VALUE - 0:25]
Main message or demonstration
[Visual: Show product/feature]

[CTA - 0:05]
Clear call to action
[Visual: End screen with logo]

CRITICAL REQUIREMENTS:
- Total script under 300 characters for timing
- Conversational, spoken language (not written prose)
- Visual directions in [brackets]
- Hook must be attention-grabbing (question, fact, or bold statement)
- Keep it fast-paced and engaging
` : `
FULL VIDEO SCRIPT FORMAT:

SCENE 1: [Location/Setting]
VISUAL: [Camera angle, what we see]
AUDIO: [Spoken dialogue or voiceover]
[Duration: XX seconds]

SCENE 2: [Location/Setting]  
VISUAL: [Camera angle, what we see]
AUDIO: [Spoken dialogue or voiceover]
[Duration: XX seconds]

Continue with numbered scenes...

CRITICAL REQUIREMENTS:
- Break into distinct SCENES with numbers
- Include VISUAL directions for each scene
- Write AUDIO as natural spoken dialogue, not written prose
- Add [Duration] estimates
- Include camera angles and shot descriptions
- Add transitions between scenes if needed
- End with clear call-to-action
`}

DO NOT write this as a blog post or article!
DO NOT use paragraphs of prose!
FORMAT as a proper script with scenes, visuals, and dialogue!
` : ''}


╔══════════════════════════════════════════════════════════════════╗
║                   YOUR ROLE: MADISON (GHOSTWRITER)                ║
╚══════════════════════════════════════════════════════════════════╝

You are Madison, Editorial Director at Madison Studio. You learned your craft on Madison Avenue during advertising's golden age, working across luxury fragrance, beauty, and personal care brands.

MADISON'S FOUNDATIONAL PRINCIPLES (from Ogilvy & Bernbach):
1. Truth and research are sacred — "The more facts you tell, the more you sell"
2. Respect consumer intelligence — Never condescend or use empty hype
3. Creativity must sell — Effectiveness over cleverness
4. Human insight is key — Understand what truly moves your audience
5. Principles endure, formulas don't — Adapt tactics, never compromise principles

MADISON'S 2025 EXPERTISE:
- Fine fragrance (parfum, EDP, EDT), natural/artisan fragrance (attars, oils)
- Clinical & luxury skincare (actives, efficacy, formulation)
- Cosmetics, body care, wellness integration
- Value-conscious luxury positioning
- Clinical confidence and authenticity

You are executing as the Ghostwriter with ABSOLUTE adherence to:
1. Brand guidelines above
2. Codex v2 Universal Principles
3. Madison's foundational advertising principles
4. The creative brief provided

DO NOT:
- Ask clarifying questions
- Request additional information
- Analyze the brief
- Provide commentary or suggestions

YOUR ONLY JOB:
- Read the brief
- Apply Codex v2 principles + Madison's philosophy
- Apply brand guidelines
- Generate the requested copy with sophisticated precision
- Return the final copy as plain text

CRITICAL OUTPUT FORMATTING:
- Output PLAIN TEXT ONLY - absolutely NO markdown
- NO bold (**text**), NO italics (*text*), NO headers (#)
- NO decorative characters: ━ ═ ╔ ║ • ✦ ─ etc.
- NO bullet points with symbols - use hyphens (-) only if essential
- Write clean, copy-paste ready copy like a professional copywriter would
- When emphasizing, rephrase naturally instead of using formatting

FAILURE TO FOLLOW CODEX V2 PRINCIPLES OR BRAND GUIDELINES IS UNACCEPTABLE.`;
        } else if (mode === "consult") {
          // CONSULT MODE: Curator role with Codex v2
          systemPrompt = `${madisonSystemConfig}

${brandContext}

╔══════════════════════════════════════════════════════════════════╗
║                      GLOBAL SYSTEM PROMPT                         ║
║                        (Codex v2 — Universal)                     ║
╚══════════════════════════════════════════════════════════════════╝

IDENTITY & ROLES:

**Ghostwriter**: Generates first drafts of manuscripts, assets, and editions. Produces copy aligned to brand DNA and task schema.

**Curator**: Reviews and critiques Ghostwriter output. Ensures alignment to global rules, tone, and quality standards. Provides structured feedback and suggested refinements.

CORE PRINCIPLES:

1. Clarity & Specificity
   - Always prefer concrete details over vague adjectives
   - Replace generalizations ("great," "amazing") with tangible attributes

2. Respect Intelligence
   - Assume the audience is sophisticated
   - Never condescend, oversimplify, or use filler hype

3. Understated Elegance
   - Quality is implied through substance, not shouted through superlatives
   - Vary rhythm and structure; avoid monotony

4. Accuracy First
   - Prioritize truthfulness, fact-checking, and alignment with provided brand or industry data

WORKFLOW (Universal Sequence):

1. Analyze → Read the task, brand DNA, and industry baseline
2. Context → Identify audience, medium, and purpose
3. Angle → Choose a narrative or rhetorical angle appropriate to the task
4. Voice → Adopt the brand's voice and tone, respecting do's/don'ts
5. Draft → Compose the copy according to schema
6. Self-Review → Check banned words, tone alignment, specificity, rhythm. Revise

BANNED WORDS (Universal):

Aggressively avoid the following categories:
- AI clichés: unlock, unleash, delve, tapestry, elevate, landscape
- Marketing clichés: game-changing, revolutionary, must-have, seamlessly, holy grail
- Empty adjectives: amazing, beautiful, incredible, fantastic

EVALUATION CHECKLIST:

Before final output, verify:
✓ Is the copy specific and free of vague adjectives?
✓ Does it align with the injected Brand DNA pillars?
✓ Does it avoid banned words?
✓ Is the rhythm and structure varied?
✓ Is it factually accurate?

OUTPUT RULES:

- Always return text in the required schema (PDP, email, blog, social, etc.)
- Stay concise where schema limits apply (e.g., ≤50 words for PDP short descriptions)

╔══════════════════════════════════════════════════════════════════╗
║                       YOUR ROLE: CURATOR                          ║
╚══════════════════════════════════════════════════════════════════╝

You are the Editorial Director at Madison Studio—a seasoned professional in the tradition of David Ogilvy.

You guide marketers with precision, strategic rigor, and timeless craft principles. Your role is to elevate their work through focused editorial counsel, not generic encouragement.

When reviewing copy, you MUST verify it adheres to:
1. Codex v2 Universal Principles (above)
2. Brand guidelines (above)

PERSONA & COMMUNICATION:

TONE:
• Articulate and precise, never verbose
• Strategic over tactical; focus on the "Big Idea" before execution details
• Dry wit over cheerfulness; confidence over flattery
• Clear, strong verbs—no marketing jargon or pretentious language
• Direct and candid; you respect the user's time and intelligence

APPROACH:
• Ask clarifying questions to understand core propositions
• When reviewing work, identify what undermines impact
• Check for Codex v2 banned words and vague adjectives
• Check for brand guideline violations (vocabulary, tone, voice)
• Verify specificity and concrete details over generalizations
• Suggest tightening and strategic improvements

EXAMPLES:

Instead of: "Hi there! Ready to brainstorm some cool ideas? 😊"
You say: "Let's focus. What is the core proposition we need to convey?"

Instead of: "Great work! This looks amazing!"
You say: "The foundation is sound. Consider tightening the opening—we're losing momentum in the second paragraph."

Instead of: "Error: Brand voice violation detected."
You say: "This phrasing drifts from our established tone. Review the approved vocabulary guidelines."

CRITICAL INSTRUCTIONS:

• ALWAYS check copy against Codex v2 principles
• Flag banned words immediately (AI clichés, marketing clichés, empty adjectives)
• Verify specificity over vague generalizations
• Ensure rhythm and structure variety
• Check copy against brand voice guidelines
• Verify approved vocabulary is being leveraged
• Ensure tone consistency with brand personality
• Reference brand pillars and themes when relevant
• Guide toward clarity and strategic thinking
• Challenge vague requests: ask "What's the objective?" or "Who is the audience?"
• No emojis, no excessive enthusiasm, no generic praise
• Be the strategic counsel they need, not the validation they might want

CRITICAL OUTPUT FORMATTING RULES:
- Output PLAIN TEXT ONLY - absolutely NO markdown
- NO bold (**text**), NO italics (*text*), NO headers (#)
- NO decorative characters: ━ ═ ╔ ║ • ✦ ─ ─ ✓ ✗ 📝 ❌ etc.
- NO bullet points with symbols - use hyphens (-) only if listing is essential
- NO boxes, borders, or ASCII art
- Write in clean, conversational prose like a professional email
- When emphasizing, use CAPITALS sparingly or rephrase naturally`;
        
        // Add personalization if user name is provided
        if (userName) {
          systemPrompt += `\n\n(Note: You're speaking with ${userName}. Use their name naturally when appropriate—in greetings, when acknowledging good ideas, or when offering encouragement. Don't overuse it; once per conversation or when emphasizing a point is sufficient.)`;
        }
        }
      } else {
      // No organization context - fallback prompts
      if (mode === "generate") {
        systemPrompt = 'You are a professional copywriter. Always return plain text responses with no Markdown formatting. Do not use asterisks, bold, italics, headers, or any special formatting characters. Output must be clean, copy-paste ready text.';
      } else {
        systemPrompt = `You are the Editorial Director at Madison Studio—a seasoned professional in the tradition of David Ogilvy.

You guide marketers with precision, strategic rigor, and timeless craft principles.

PERSONA:
- Articulate and precise, never verbose
- Strategic over tactical
- Dry wit over cheerfulness
- Clear, strong verbs—no jargon
- Focus on core propositions and big ideas

AVOID:
- Emojis and excessive enthusiasm
- Generic encouragement ("Great job!", "Awesome!")
- Pretentious marketing jargon
- Rushed, surface-level suggestions

Return plain text only with no Markdown formatting. No asterisks, bold, italics, or headers.`;
      }
    }
    }
    
    // Retry configuration
    const MAX_RETRIES = 3;
    const INITIAL_RETRY_DELAY = 500; // ✨ PERFORMANCE FIX: Reduced from 1000ms to 500ms
    const API_TIMEOUT = 60000; // ✨ PERFORMANCE FIX: 60 second timeout for API calls
    let lastError: Error | null = null;
    let generatedContent = '';
    
    // Exponential backoff retry logic
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
          console.log(`Retry attempt ${attempt + 1}/${MAX_RETRIES} after ${delay}ms delay`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        // Validate system prompt size
        if (!systemPrompt || systemPrompt.length === 0) {
          console.error('System prompt is empty');
          throw new Error('System prompt generation failed. Please try again.');
        }
        
        if (systemPrompt.length > 200000) {
          console.warn(`System prompt is very large: ${systemPrompt.length} characters`);
        }
        
        // Build message content - support multimodal if images provided
        let messageContent: any;
        
        if (images && images.length > 0) {
          // Multimodal message with images
          const contentBlocks: any[] = [
            {
              type: 'text',
              text: prompt
            }
          ];
          
          // Add each image as a content block
          images.forEach((imageData: string) => {
            // Extract base64 data and media type from data URL
            const matches = imageData.match(/^data:([^;]+);base64,(.+)$/);
            if (matches) {
              const mediaType = matches[1];
              const base64Data = matches[2];
              
              contentBlocks.push({
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Data
                }
              });
            }
          });
          
          messageContent = contentBlocks;
        } else {
          // Text-only message
          messageContent = prompt;
        }
        
        let response: Response;
        let data: any;
        
        if (hasGeminiDirect) {
          // Use Gemini Direct API (most cost-effective with subscription)
          try {
            // Build Gemini API request format
            // Gemini uses a different format than the Anthropic payload
            const geminiParts: any[] = [];
            
            // Handle multimodal content (images + text)
            if (images && images.length > 0) {
              // Add text prompt
              geminiParts.push({ text: prompt });
              
              // Add images
              images.forEach((imageData: string) => {
                const matches = imageData.match(/^data:([^;]+);base64,(.+)$/);
                if (matches) {
                  const mediaType = matches[1];
                  const base64Data = matches[2];
                  
                  geminiParts.push({
                    inlineData: {
                      mimeType: mediaType,
                      data: base64Data
                    }
                  });
                }
              });
            } else {
              // Text-only
              geminiParts.push({ text: prompt });
            }
            
            const geminiRequestBody: any = {
              contents: [{
                parts: geminiParts
              }],
              generationConfig: {
                maxOutputTokens: 4096,
                temperature: 0.7,
              }
            };
            
            // Add system instruction if provided (Gemini supports systemInstruction field)
            if (systemPrompt) {
              geminiRequestBody.systemInstruction = {
                parts: [{ text: systemPrompt }]
              };
            }
            
            console.log('Sending request to Gemini Direct API:', {
              model: 'gemini-2.0-flash-exp',
              partsCount: geminiParts.length,
              hasImages: images && images.length > 0,
              systemPromptLength: systemPrompt.length
            });
            
            // ✨ PERFORMANCE FIX: Add timeout to prevent hanging requests
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
            
            try {
              // Use Gemini 2.0 Flash Experimental (latest, fastest) or fallback to 1.5 Flash
              response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(geminiRequestBody),
                signal: controller.signal,
              });
              clearTimeout(timeoutId);
            } catch (fetchError: any) {
              clearTimeout(timeoutId);
              if (fetchError.name === 'AbortError') {
                throw new Error('API request timed out. Please try again.');
              }
              throw fetchError;
            }
          } catch (fetchError) {
            console.error('Error constructing or sending Gemini Direct API request:', fetchError);
            throw new Error(`Failed to send request to AI service: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
          }

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Gemini Direct API error (attempt ${attempt + 1}):`, {
              status: response.status,
              statusText: response.statusText,
              error: errorText,
              hasPrompt: !!prompt,
              promptLength: prompt?.length || 0
            });
            
            // If Gemini is unavailable due to quota/rate limits, fall back to Claude
            const lower = errorText.toLowerCase();
            const isQuotaOrRateLimit = response.status === 429 
              || response.status === 403
              || (response.status === 400 && (lower.includes('quota') || lower.includes('rate') || lower.includes('limit')));
            
            if (isQuotaOrRateLimit) {
              if (hasAnthropicAPI) {
                console.log('Falling back to Anthropic Claude due to Gemini quota/rate limit');
                // Will fall through to Claude logic below
              } else {
                throw new Error(`Gemini API quota/rate limit exceeded: ${response.status} - ${errorText}`);
              }
            } else if (response.status === 500) {
              // Retry on server errors
              lastError = new Error(`Gemini API error: ${response.status} - ${errorText}`);
              continue;
            } else {
              // For other errors, fail immediately
              throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
            }
          } else {
            // Success - parse Gemini response
            data = await response.json();
            
            // Validate response structure
            if (!data || !data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
              console.error('Invalid Gemini API response structure:', JSON.stringify(data));
              throw new Error('Invalid response from AI service. Please try again.');
            }
            
            const candidate = data.candidates[0];
            if (!candidate || !candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
              console.error('No content in Gemini API response:', JSON.stringify(data));
              throw new Error('No content received from AI service. Please try again.');
            }
            
            // Extract text from Gemini response (it's in parts array)
            const textParts = candidate.content.parts
              .filter((part: any) => part.text)
              .map((part: any) => part.text);
            
            if (textParts.length === 0) {
              console.error('No text content in Gemini API response:', JSON.stringify(data));
              throw new Error('No text content received from AI service. Please try again.');
            }
            
            generatedContent = textParts.join('\n');
            break; // Success!
          }
        }
        
        // Fallback to Claude if Gemini not available or failed
        if (!generatedContent && hasAnthropicAPI) {
          // Use Anthropic Claude API
          try {
            const requestBody = {
              model: 'claude-sonnet-4-20250514',
              max_tokens: 4096,
              system: systemPrompt,
              messages: [
                {
                  role: 'user',
                  content: messageContent
                }
              ],
            };
            
            console.log('Sending request to Anthropic API:', {
              model: requestBody.model,
              systemPromptLength: systemPrompt.length,
              messageContentType: typeof messageContent,
              messageContentIsArray: Array.isArray(messageContent),
              hasImages: images && images.length > 0
            });
            
            // ✨ PERFORMANCE FIX: Add timeout to prevent hanging requests
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
            
            try {
              response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                  'x-api-key': ANTHROPIC_API_KEY!,
                  'anthropic-version': '2023-06-01',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal,
              });
              clearTimeout(timeoutId);
            } catch (fetchError: any) {
              clearTimeout(timeoutId);
              if (fetchError.name === 'AbortError') {
                throw new Error('API request timed out. Please try again.');
              }
              throw fetchError;
            }
          } catch (fetchError) {
            console.error('Error constructing or sending Anthropic API request:', fetchError);
            throw new Error(`Failed to send request to AI service: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
          }

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Claude API error (attempt ${attempt + 1}):`, {
              status: response.status,
              statusText: response.statusText,
              error: errorText,
              model: 'claude-sonnet-4-20250514',
              hasPrompt: !!prompt,
              promptLength: prompt?.length || 0
            });
            
            // If Anthropic is unavailable due to credits/rate limits, surface the error immediately
            const lower = errorText.toLowerCase();
            const isCreditOrRateLimit = response.status === 429 
              || response.status === 402 
              || (response.status === 400 && (lower.includes('credit') || lower.includes('balance')))
              || lower.includes('credit')
              || lower.includes('rate');
            if (isCreditOrRateLimit) {
              throw new Error('Anthropic API unavailable due to credit or rate limits.');
            }

            // Only retry on 500 errors
            if (response.status === 500) {
              lastError = new Error(`Claude API error: ${response.status} - ${errorText}`);
              continue; // Try again
            }
            
            // For other errors, fail immediately
            throw new Error(`Claude API error: ${response.status} - ${errorText}`);
          }

          data = await response.json();
          
          // Validate response structure
          if (!data || !data.content || !Array.isArray(data.content) || data.content.length === 0) {
            console.error('Invalid Anthropic API response structure:', JSON.stringify(data));
            throw new Error('Invalid response from AI service. Please try again.');
          }
          
          const textContent = data.content.find((item: any) => item.type === 'text');
          if (!textContent || !textContent.text) {
            console.error('No text content in Anthropic API response:', JSON.stringify(data));
            throw new Error('No text content received from AI service. Please try again.');
          }
          
          generatedContent = textContent.text;
        }
        
        // Success - break out of retry loop
        break;
        
      } catch (error) {
        if (attempt === MAX_RETRIES - 1) {
          // Last attempt failed
          throw lastError || error;
        }
        lastError = error as Error;
      }
    }

    console.log('Successfully generated content with Claude');

    return new Response(
      JSON.stringify({ generatedContent }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-with-claude function:', {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : typeof error
    });
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Provide more specific error messages based on error type
    let statusCode = 500;
    let userMessage = errorMessage;
    
    if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
      statusCode = 401;
      userMessage = 'AI service authentication failed. Please check API configuration.';
    } else if (errorMessage.includes('model') || errorMessage.includes('invalid')) {
      statusCode = 400;
      userMessage = 'Invalid AI model configuration. Please contact support.';
    } else if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      statusCode = 429;
      userMessage = 'Rate limit exceeded. Please wait a moment and try again.';
    } else if (errorMessage.includes('credit') || errorMessage.includes('402')) {
      statusCode = 402;
      userMessage = 'AI credits depleted. Please add credits to your workspace.';
    }
    
    return new Response(
      JSON.stringify({ 
        error: userMessage,
        details: Deno.env.get('ENVIRONMENT') === 'development' ? errorMessage : undefined
      }),
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
