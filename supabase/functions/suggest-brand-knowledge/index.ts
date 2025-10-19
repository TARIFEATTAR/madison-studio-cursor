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
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
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

    // Build tool definition based on knowledge_type
    const systemPrompt = `You are Madison, an expert editorial director helping a brand define their identity. 
Your role is to analyze existing brand content and create intelligent, context-aware suggestions that feel authentic to their voice.

CONTEXT ABOUT THIS BRAND:
${context}

${recommendation ? `\nRECOMMENDATION CONTEXT: ${recommendation.title} - ${recommendation.description}` : ''}

GUIDELINES:
- Base suggestions on actual content patterns you observe
- Be specific and actionable
- Maintain consistency with existing brand voice
- Reference what you're seeing (e.g., "Based on your 5 blog posts about sustainability...")
- Keep each suggestion concise but comprehensive (2-4 sentences)`;

    let tools, toolChoice, userPrompt;

    if (knowledge_type === 'core_identity') {
      tools = [{
        type: "function",
        function: {
          name: "suggest_core_identity",
          description: "Generate brand core identity suggestions",
          parameters: {
            type: "object",
            properties: {
              mission: { type: "string", description: "Clear mission statement" },
              vision: { type: "string", description: "Aspirational vision statement" },
              values: { type: "string", description: "3-5 core values" },
              personality: { type: "string", description: "Brand personality traits" },
              sources: { type: "array", items: { type: "string" }, description: "What you based suggestions on" }
            },
            required: ["mission", "vision", "values", "personality", "sources"],
            additionalProperties: false
          }
        }
      }];
      toolChoice = { type: "function", function: { name: "suggest_core_identity" } };
      userPrompt = "Generate brand identity suggestions based on the context above.";
    } else if (knowledge_type === 'voice_tone') {
      tools = [{
        type: "function",
        function: {
          name: "suggest_voice_tone",
          description: "Generate voice and tone guidelines",
          parameters: {
            type: "object",
            properties: {
              voice_guidelines: { type: "string", description: "Consistent voice characteristics" },
              tone_spectrum: { type: "string", description: "How tone varies by context" },
              sources: { type: "array", items: { type: "string" }, description: "What patterns you observed" }
            },
            required: ["voice_guidelines", "tone_spectrum", "sources"],
            additionalProperties: false
          }
        }
      }];
      toolChoice = { type: "function", function: { name: "suggest_voice_tone" } };
      userPrompt = "Generate voice and tone guidelines based on the context above.";
    } else {
      tools = [{
        type: "function",
        function: {
          name: "suggest_brand_guideline",
          description: "Generate brand guideline suggestions",
          parameters: {
            type: "object",
            properties: {
              content: { type: "string", description: "Brand guideline content" },
              sources: { type: "array", items: { type: "string" }, description: "What you based this on" }
            },
            required: ["content", "sources"],
            additionalProperties: false
          }
        }
      }];
      toolChoice = { type: "function", function: { name: "suggest_brand_guideline" } };
      userPrompt = `Generate brand guideline suggestions for: ${knowledge_type}`;
    }

    // Call Lovable AI Gateway with tool-calling
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools,
        tool_choice: toolChoice,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again in a moment.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'AI credits exhausted. Please add credits to continue.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error('Failed to generate suggestions');
    }

    const data = await response.json();
    console.log('AI Gateway response:', JSON.stringify(data));

    // Extract tool call arguments
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let suggestions;

    if (toolCall?.function?.arguments) {
      try {
        suggestions = typeof toolCall.function.arguments === 'string' 
          ? JSON.parse(toolCall.function.arguments)
          : toolCall.function.arguments;
      } catch (parseError) {
        console.error('Failed to parse tool arguments:', parseError);
        return new Response(JSON.stringify({ 
          error: 'Failed to parse AI response' 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else {
      console.error('No tool call in response');
      return new Response(JSON.stringify({ 
        error: 'AI did not return structured suggestions' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
