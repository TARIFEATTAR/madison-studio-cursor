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

    // Fetch all brand data
    const [brandKnowledge, products, collections, masterContent, derivatives] = await Promise.all([
      supabase.from('brand_knowledge').select('*').eq('organization_id', organizationId).eq('is_active', true),
      supabase.from('brand_products').select('*').eq('organization_id', organizationId),
      supabase.from('brand_collections').select('*').eq('organization_id', organizationId),
      supabase.from('master_content').select('content_type, collection').eq('organization_id', organizationId).eq('is_archived', false),
      supabase.from('derivative_assets').select('asset_type').eq('organization_id', organizationId).eq('is_archived', false),
    ]);

    // Prepare context for AI analysis
    const context = {
      brandKnowledge: brandKnowledge.data || [],
      productsCount: products.data?.length || 0,
      collectionsCount: collections.data?.length || 0,
      products: products.data || [],
      collections: collections.data || [],
      contentTypes: [...new Set((masterContent.data || []).map(c => c.content_type))],
      assetTypes: [...new Set((derivatives.data || []).map(d => d.asset_type))],
      collectionsUsed: [...new Set((masterContent.data || []).map(c => c.collection).filter(Boolean))],
    };

    const prompt = `You are a brand health analyzer. Analyze this organization's brand documentation completeness and identify gaps.

CURRENT BRAND SETUP:
- Brand Knowledge Documents: ${context.brandKnowledge.length}
- Knowledge Types: ${context.brandKnowledge.map(k => k.knowledge_type).join(', ')}
- Products: ${context.productsCount}
- Collections: ${context.collectionsCount}
- Content Types Created: ${context.contentTypes.join(', ')}
- Asset Types Created: ${context.assetTypes.join(', ')}
- Collections Used: ${context.collectionsUsed.join(', ')}

PRODUCT DETAILS:
${context.products.map(p => `- ${p.name} (${p.collection || 'No collection'}): ${p.category || 'No category'}`).join('\n')}

COLLECTION DETAILS:
${context.collections.map(c => `- ${c.name}: ${c.description ? 'Has description' : 'Missing description'}, ${c.transparency_statement ? 'Has transparency' : 'Missing transparency'}`).join('\n')}

Analyze what's missing or incomplete and provide actionable recommendations in this JSON format:
{
  "completeness_score": <number 0-100>,
  "gap_analysis": {
    "missing_components": ["<component 1>", "<component 2>"],
    "incomplete_areas": ["<area 1>", "<area 2>"],
    "affected_content_types": ["<type 1>", "<type 2>"]
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
  "strengths": ["<strength 1>", "<strength 2>"],
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
    let healthAnalysis;
    try {
      const cleanedText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      healthAnalysis = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', analysisText);
      return new Response(
        JSON.stringify({ error: 'Failed to parse analysis', details: analysisText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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