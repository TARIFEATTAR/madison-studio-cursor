import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { organizationId } = await req.json();

    if (!organizationId) {
      return new Response(
        JSON.stringify({ error: 'organizationId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch organization details including industry
    const { data: orgData } = await supabase
      .from('organizations')
      .select('brand_config')
      .eq('id', organizationId)
      .single();

    const brandIndustry = orgData?.brand_config?.industry || 'general';

    // Fetch all brand data
    const [brandKnowledge, products, collections, masterContent, derivatives, previousHealth] = await Promise.all([
      supabase.from('brand_knowledge').select('*').eq('organization_id', organizationId).eq('is_active', true),
      supabase.from('brand_products').select('*').eq('organization_id', organizationId),
      supabase.from('brand_collections').select('*').eq('organization_id', organizationId),
      supabase.from('master_content').select('content_type, collection').eq('organization_id', organizationId).eq('is_archived', false),
      supabase.from('derivative_assets').select('asset_type').eq('organization_id', organizationId).eq('is_archived', false),
      supabase.from('brand_health').select('completeness_score').eq('organization_id', organizationId).single(),
    ]);

    const previousScore = previousHealth.data?.completeness_score || 0;

    // === COMPUTE DETERMINISTIC FACTS ===
    const knowledge = brandKnowledge.data || [];
    const productsCount = products.data?.length || 0;
    const collectionsCount = collections.data?.length || 0;
    const masterCount = masterContent.data?.length || 0;
    const derivativeCount = derivatives.data?.length || 0;

    // Core Identity: At least 2 of mission/vision/values/personality present
    // ALSO check visual_standards raw documents for core identity content
    const coreIdentityDoc = knowledge.find(k => k.knowledge_type === 'core_identity');
    let coreIdentityPresent = coreIdentityDoc ? 
      Object.entries(coreIdentityDoc.content || {}).filter(([k, v]) => 
        ['mission', 'vision', 'values', 'personality'].includes(k) && 
        typeof v === 'string' && v.trim().length > 0
      ).length >= 2 : false;
    
    // If not found in core_identity, check visual_standards documents
    if (!coreIdentityPresent) {
      coreIdentityPresent = knowledge.some(k => {
        if (k.knowledge_type === 'visual_standards' && k.content?.raw_document) {
          const docText = k.content.raw_document.toLowerCase();
          const hasMission = docText.includes('mission');
          const hasVision = docText.includes('vision');
          const hasValues = docText.includes('values');
          const count = [hasMission, hasVision, hasValues].filter(Boolean).length;
          return count >= 2 && docText.length > 500; // At least 2 of 3 with substantial content
        }
        return false;
      });
    }

    // Voice & Tone: voice_tone with voice_guidelines OR tone_spectrum, OR brand_voice with voice/tone keys
    // ALSO check visual_standards for raw_document containing voice/tone content
    const voiceTonePresent = knowledge.some(k => {
      if (k.knowledge_type === 'voice_tone') {
        const content = k.content || {};
        return (content.voice_guidelines && typeof content.voice_guidelines === 'string' && content.voice_guidelines.trim().length > 0) ||
               (content.tone_spectrum && typeof content.tone_spectrum === 'string' && content.tone_spectrum.trim().length > 0);
      }
      if (k.knowledge_type === 'brand_voice') {
        const content = k.content || {};
        const hasVoiceData = Object.keys(content).some(key => 
          key.toLowerCase().includes('voice') || key.toLowerCase().includes('tone')
        );
        return hasVoiceData;
      }
      // CHECK VISUAL_STANDARDS RAW DOCUMENTS FOR VOICE CONTENT
      if (k.knowledge_type === 'visual_standards' && k.content?.raw_document) {
        const docText = k.content.raw_document.toLowerCase();
        // Look for voice/tone sections with substantial content (at least 200 chars)
        const hasVoiceSection = docText.includes('voice') && docText.includes('tone') && docText.length > 200;
        return hasVoiceSection;
      }
      return false;
    });

    // Target Audience: target_audience with descriptive content
    // ALSO check visual_standards raw documents for audience content
    const targetAudiencePresent = knowledge.some(k => {
      if (k.knowledge_type === 'target_audience') {
        return Object.values(k.content || {}).some((v: any) => 
          typeof v === 'string' && v.trim().length > 0
        );
      }
      // CHECK VISUAL_STANDARDS FOR AUDIENCE CONTENT
      if (k.knowledge_type === 'visual_standards' && k.content?.raw_document) {
        const docText = k.content.raw_document.toLowerCase();
        return (docText.includes('audience') || docText.includes('customer') || docText.includes('demographic')) 
          && docText.length > 300;
      }
      return false;
    });

    // Collections Transparency: comprehensive doc OR per-collection coverage
    const hasComprehensiveTransparencyDoc = knowledge.some(k => {
      if (!['collections_transparency', 'general', 'content_guidelines'].includes(k.knowledge_type)) return false;
      const contentStr = JSON.stringify(k.content || {}).toLowerCase();
      return contentStr.includes('transparency') && contentStr.includes('collection');
    });
    const collectionsWithTransparency = (collections.data || []).filter(c => 
      c.transparency_statement && c.transparency_statement.trim().length > 0
    ).length;
    const transparencyCoverage = collectionsCount > 0 ? collectionsWithTransparency / collectionsCount : 0;

    const contentCreated = masterCount > 0 || derivativeCount > 0;

    // === DETERMINISTIC BASE SCORE ===
    let deterministicScore = 0;
    if (coreIdentityPresent) deterministicScore += 30;
    if (voiceTonePresent) deterministicScore += 20;
    if (targetAudiencePresent) deterministicScore += 15;
    if (productsCount > 0) deterministicScore += 15;
    if (collectionsCount > 0) deterministicScore += 10;
    if (transparencyCoverage >= 0.5 || hasComprehensiveTransparencyDoc) deterministicScore += 5;
    if (contentCreated) deterministicScore += 10;
    deterministicScore = Math.min(100, deterministicScore);

    // Prepare context for AI analysis
    const context = {
      brandKnowledge: knowledge,
      productsCount,
      collectionsCount,
      products: products.data || [],
      collections: collections.data || [],
      contentTypes: [...new Set((masterContent.data || []).map(c => c.content_type))],
      assetTypes: [...new Set((derivatives.data || []).map(d => d.asset_type))],
      collectionsUsed: [...new Set((masterContent.data || []).map(c => c.collection).filter(Boolean))],
    };

    // Compute completed knowledge types
    const completedTypes: string[] = [];
    for (const k of context.brandKnowledge) {
      const content = k.content || {};
      const hasContent = Object.values(content).some((v: any) => 
        typeof v === 'string' ? v.trim().length > 0 : v && typeof v === 'object' ? Object.keys(v).length > 0 : false
      );
      if (hasContent) {
        completedTypes.push(k.knowledge_type);
      }
    }
    const completedTypesStr = completedTypes.length > 0 
      ? completedTypes.join(', ') 
      : 'none yet';

    const prompt = `You are a brand health analyzer. Generate gap_analysis and recommendations ONLY (not the score).

BRAND INDUSTRY: ${brandIndustry}
${brandIndustry === 'fragrance' ? '**THIS IS A FRAGRANCE/PERFUME/ATTAR BRAND - Do NOT recommend skincare, cosmetics, or beauty categories. Focus only on fragrance-related categories like personal_fragrance, home_fragrance, candles, incense.**' : ''}

=== COMPUTED FACTS (DO NOT CONTRADICT THESE) ===
- coreIdentityPresent: ${coreIdentityPresent}
- voiceTonePresent: ${voiceTonePresent}
- targetAudiencePresent: ${targetAudiencePresent}
- productsCount: ${productsCount}
- collectionsCount: ${collectionsCount}
- hasComprehensiveTransparencyDoc: ${hasComprehensiveTransparencyDoc}
- transparencyCoverage: ${Math.round(transparencyCoverage * 100)}%
- contentCreated: ${contentCreated}

COMPLETED KNOWLEDGE TYPES: ${completedTypesStr}

CURRENT BRAND SETUP:
- Brand Knowledge Documents: ${context.brandKnowledge.length}
- Knowledge Types: ${context.brandKnowledge.map(k => k.knowledge_type).join(', ')}
- Products: ${productsCount}
- Collections: ${collectionsCount}
- Content Types Created: ${context.contentTypes.join(', ')}
- Asset Types Created: ${context.assetTypes.join(', ')}

BRAND KNOWLEDGE DETAILS:
${context.brandKnowledge.map(k => {
  const fields = Object.keys(k.content || {}).filter(key => k.content[key]);
  return `- ${k.knowledge_type} (v${k.version}): ${fields.length > 0 ? fields.join(', ') : 'empty'}`;
}).join('\n')}

PRODUCT DETAILS:
${context.products.map(p => `- ${p.name} (${p.collection || 'No collection'}): ${p.category || 'No category'}`).join('\n')}

COLLECTION DETAILS:
${context.collections.map(c => `- ${c.name}: ${c.description ? 'Has description' : 'Missing description'}, ${c.transparency_statement ? 'Has transparency' : 'Missing transparency'}`).join('\n')}

**CRITICAL INSTRUCTIONS**:
1. Do NOT mark items missing if facts show they're present (e.g., if coreIdentityPresent=true, do NOT add "Core Identity" to missing_components)
2. If hasComprehensiveTransparencyDoc=true, do NOT recommend "Add transparency statements to collections"
3. Only recommend things that are genuinely missing based on the facts
4. ALWAYS include strengths array showing what IS complete

Generate ONLY gap_analysis and recommendations in this JSON format (DO NOT include completeness_score):
{
  "gap_analysis": {
    "missing_components": ["<component 1>", "<component 2>"],
    "incomplete_areas": ["<area 1>", "<area 2>"],
    "affected_content_types": ["<type 1>", "<type 2>"],
    "strengths": ["<strength 1 - what IS complete>", "<strength 2>"]
  },
  "recommendations": [
    {
      "priority": "<high|medium|low>",
      "category": "<voice|products|collections|content_guidelines>",
      "title": "<brief title>",
      "description": "<what to add>",
      "impact": "<how this helps>",
      "affected_items_count": <number>
    }
  ],
  "quick_wins": ["<quick action 1>", "<quick action 2>"]
}

Be specific and prioritize recommendations by impact.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a brand health expert. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'AI analysis failed', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const analysisText = aiData.choices[0].message.content;

    // Parse the AI response
    let aiAnalysis;
    try {
      const cleanedText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      aiAnalysis = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', analysisText);
      return new Response(
        JSON.stringify({ error: 'Failed to parse analysis', details: analysisText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // === POST-PROCESS: Filter contradictory recommendations ===
    let filteredMissing = (aiAnalysis.gap_analysis?.missing_components || []).filter((item: string) => {
      const lower = item.toLowerCase();
      if (lower.includes('core identity') && coreIdentityPresent) return false;
      if (lower.includes('voice') && lower.includes('tone') && voiceTonePresent) return false;
      if (lower.includes('target audience') && targetAudiencePresent) return false;
      if (lower.includes('product') && productsCount > 0) return false;
      if (lower.includes('collection') && lower.includes('transparency') && hasComprehensiveTransparencyDoc) return false;
      return true;
    });

    let filteredRecommendations = (aiAnalysis.recommendations || []).filter((rec: any) => {
      const text = (rec.title + ' ' + rec.description).toLowerCase();
      if (text.includes('transparency') && text.includes('collection') && hasComprehensiveTransparencyDoc) return false;
      return true;
    });

    const filteredGapAnalysis = {
      ...aiAnalysis.gap_analysis,
      missing_components: filteredMissing,
    };

    // Use actual calculated score (allows score to decrease when knowledge is removed)
    const finalScore = deterministicScore;

    const healthAnalysis = {
      completeness_score: finalScore,
      gap_analysis: filteredGapAnalysis,
      recommendations: filteredRecommendations,
    };

    // Upsert brand health record
    const { error: upsertError } = await supabase
      .from('brand_health')
      .upsert({
        organization_id: organizationId,
        completeness_score: healthAnalysis.completeness_score,
        gap_analysis: healthAnalysis.gap_analysis,
        recommendations: healthAnalysis.recommendations,
        last_analyzed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'organization_id',
      });

    if (upsertError) {
      console.error('Error upserting brand health:', upsertError);
      return new Response(
        JSON.stringify({ error: 'Failed to save health analysis', details: upsertError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Also store in history for tracking progress over time
    await supabase
      .from('brand_health_history')
      .insert({
        organization_id: organizationId,
        completeness_score: healthAnalysis.completeness_score,
        gap_analysis: healthAnalysis.gap_analysis,
        recommendations: healthAnalysis.recommendations,
        analyzed_at: new Date().toISOString(),
      });

    console.log(`Brand health analysis complete for org ${organizationId}: ${healthAnalysis.completeness_score}%`);

    return new Response(
      JSON.stringify({ success: true, healthAnalysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-brand-health:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});