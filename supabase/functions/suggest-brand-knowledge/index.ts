import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { knowledge_type, recommendation } = await req.json();

    // Get organization ID
    const { data: orgMember } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!orgMember) {
      throw new Error('Organization not found');
    }

    const organizationId = orgMember.organization_id;

    // Fetch existing brand knowledge
    const { data: existingKnowledge } = await supabase
      .from('brand_knowledge')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true);

    // Fetch sample content (limited to recent items)
    const { data: masterContent } = await supabase
      .from('master_content')
      .select('title, content_type, full_content')
      .eq('organization_id', organizationId)
      .limit(5)
      .order('created_at', { ascending: false });

    // Fetch products
    const { data: products } = await supabase
      .from('brand_products')
      .select('name, collection, category, usp, tone')
      .eq('organization_id', organizationId)
      .limit(10);

    // Build context for AI
    const contextParts = [];
    
    if (existingKnowledge && existingKnowledge.length > 0) {
      contextParts.push('EXISTING BRAND KNOWLEDGE:');
      existingKnowledge.forEach(kb => {
        contextParts.push(`${kb.knowledge_type}: ${JSON.stringify(kb.content)}`);
      });
    }

    if (masterContent && masterContent.length > 0) {
      contextParts.push('\nRECENT CONTENT SAMPLES:');
      masterContent.forEach(content => {
        const preview = content.full_content?.substring(0, 300) || '';
        contextParts.push(`- ${content.title} (${content.content_type}): ${preview}...`);
      });
    }

    if (products && products.length > 0) {
      contextParts.push('\nPRODUCTS:');
      products.forEach(product => {
        contextParts.push(`- ${product.name}: ${product.usp || product.tone || ''}`);
      });
    }

    const context = contextParts.join('\n');

    // Build the prompt based on knowledge_type
    let systemPrompt = `You are Madison, an expert editorial director helping a brand define their identity. 
Your role is to analyze existing brand content and create intelligent, context-aware suggestions that feel authentic to their voice.

CONTEXT ABOUT THIS BRAND:
${context}

TASK: Generate ${knowledge_type} suggestions based on the brand's existing content and products.
${recommendation ? `\nRECOMMENDATION CONTEXT: ${recommendation.title} - ${recommendation.description}` : ''}

GUIDELINES:
- Base suggestions on actual content patterns you observe
- Be specific and actionable
- Maintain consistency with existing brand voice
- Reference what you're seeing (e.g., "Based on your 5 blog posts about sustainability...")
- Keep each suggestion concise but comprehensive (2-4 sentences)`;

    let userPrompt = '';
    
    if (knowledge_type === 'core_identity') {
      userPrompt = `Generate brand identity suggestions with these fields:
- mission: A clear mission statement (what the brand does and why)
- vision: An aspirational vision statement (the future they're creating)
- values: 3-5 core values that guide decisions
- personality: Brand personality traits (if the brand were a person)

Format as JSON with these exact keys. Include a "sources" array explaining what you based each suggestion on.`;
    } else if (knowledge_type === 'voice_tone') {
      userPrompt = `Generate voice and tone guidelines with these fields:
- voice_guidelines: Consistent voice characteristics (e.g., "warm, knowledgeable, never condescending")
- tone_spectrum: How tone varies by context (e.g., "Educational: patient and detailed. Promotional: exciting but authentic")

Format as JSON with these exact keys. Include a "sources" array explaining what patterns you observed.`;
    } else {
      userPrompt = `Generate brand guideline suggestions for: ${knowledge_type}
Return as JSON with relevant fields and a "sources" array.`;
    }

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `${systemPrompt}\n\n${userPrompt}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Claude API error:', error);
      throw new Error('Failed to generate suggestions');
    }

    const data = await response.json();
    const assistantMessage = data.content[0].text;

    // Parse JSON from response (Claude usually wraps it in markdown)
    const jsonMatch = assistantMessage.match(/```json\n([\s\S]*?)\n```/) || 
                      assistantMessage.match(/\{[\s\S]*\}/);
    
    let suggestions;
    if (jsonMatch) {
      suggestions = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    } else {
      // Fallback: try to parse the whole response
      suggestions = JSON.parse(assistantMessage);
    }

    console.log('Generated suggestions:', suggestions);

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in suggest-brand-knowledge:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
