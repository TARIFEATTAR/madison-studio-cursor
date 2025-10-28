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

    const { knowledge_type, recommendation, organizationId: passedOrgId } = await req.json();

    // Get organization ID
    let organizationId = passedOrgId;
    if (!organizationId) {
      const { data: orgMember } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!orgMember) {
        throw new Error('Organization not found');
      }
      organizationId = orgMember.organization_id;
    }

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
    let systemPrompt, tools, toolChoice, userPrompt;

    switch (knowledge_type) {
      case 'target_audience':
        systemPrompt = `You are Madison, an expert editorial director. Based on the brand context below, create a clear, specific target audience description.

CONTEXT:
${context}

GUIDELINES:
- Be specific about demographics, psychographics, and needs
- Include pain points and motivations
- Keep it 2-3 sentences, actionable and clear
- Reference patterns you observe in their content/products`;

        tools = [{
          type: "function",
          function: {
            name: "suggest_target_audience",
            description: "Generate target audience suggestion",
            parameters: {
              type: "object",
              properties: {
                target_audience: { 
                  type: "string", 
                  description: "Clear, specific description of ideal customers (2-3 sentences)" 
                }
              },
              required: ["target_audience"],
              additionalProperties: false
            }
          }
        }];
        toolChoice = { type: "function", function: { name: "suggest_target_audience" } };
        userPrompt = "Generate a target audience suggestion based on the context.";
        break;

      case 'brand_voice':
        systemPrompt = `You are Madison, an expert editorial director. Based on the brand context below, define their brand voice and tone.

CONTEXT:
${context}

GUIDELINES:
- Describe personality traits and communication style
- Be specific about tone (warm, professional, playful, etc.)
- Include do's and don'ts if patterns are clear
- Keep it 3-4 sentences, actionable`;

        tools = [{
          type: "function",
          function: {
            name: "suggest_voice",
            description: "Generate brand voice guidelines",
            parameters: {
              type: "object",
              properties: {
                voice_guidelines: { 
                  type: "string", 
                  description: "Brand voice description with personality and tone (3-4 sentences)" 
                }
              },
              required: ["voice_guidelines"],
              additionalProperties: false
            }
          }
        }];
        toolChoice = { type: "function", function: { name: "suggest_voice" } };
        userPrompt = "Generate brand voice guidelines based on the context.";
        break;

      case 'mission':
        systemPrompt = `You are Madison, an expert editorial director. Based on the brand context below, craft a clear mission statement.

CONTEXT:
${context}

GUIDELINES:
- Answer "Why does this brand exist?"
- Focus on the value they create or problem they solve
- Keep it inspiring but grounded
- 2-3 sentences maximum`;

        tools = [{
          type: "function",
          function: {
            name: "suggest_mission",
            description: "Generate mission statement",
            parameters: {
              type: "object",
              properties: {
                mission: { 
                  type: "string", 
                  description: "Clear, inspiring mission statement (2-3 sentences)" 
                }
              },
              required: ["mission"],
              additionalProperties: false
            }
          }
        }];
        toolChoice = { type: "function", function: { name: "suggest_mission" } };
        userPrompt = "Generate a mission statement based on the context.";
        break;

      case 'usp':
        systemPrompt = `You are Madison, an expert editorial director. Based on the brand context below, identify what makes this brand unique.

CONTEXT:
${context}

GUIDELINES:
- Focus on what they do differently or better
- Be specific and credible
- Highlight competitive advantages
- 2-3 sentences`;

        tools = [{
          type: "function",
          function: {
            name: "suggest_usp",
            description: "Generate unique selling proposition",
            parameters: {
              type: "object",
              properties: {
                differentiator: { 
                  type: "string", 
                  description: "Clear USP highlighting what makes them unique (2-3 sentences)" 
                }
              },
              required: ["differentiator"],
              additionalProperties: false
            }
          }
        }];
        toolChoice = { type: "function", function: { name: "suggest_usp" } };
        userPrompt = "Generate a USP based on the context.";
        break;

      case 'key_messages':
        systemPrompt = `You are Madison, an expert editorial director. Based on the brand context below, identify 3-5 core messages.

CONTEXT:
${context}

GUIDELINES:
- Short, memorable phrases (not full sentences)
- Cover different aspects: quality, values, benefits, etc.
- Easy to remember and repeat
- Return exactly 3-5 messages`;

        tools = [{
          type: "function",
          function: {
            name: "suggest_messages",
            description: "Generate key brand messages",
            parameters: {
              type: "object",
              properties: {
                messages: { 
                  type: "array",
                  items: { type: "string" },
                  description: "3-5 short, memorable brand messages" 
                }
              },
              required: ["messages"],
              additionalProperties: false
            }
          }
        }];
        toolChoice = { type: "function", function: { name: "suggest_messages" } };
        userPrompt = "Generate 3-5 key brand messages based on the context.";
        break;

      default:
        // Fallback for old knowledge types
        systemPrompt = `You are Madison, an expert editorial director. Based on the brand context below, create suggestions.

CONTEXT:
${context}

${recommendation ? `\nRECOMMENDATION CONTEXT: ${recommendation.title} - ${recommendation.description}` : ''}`;

        tools = [{
          type: "function",
          function: {
            name: "suggest_brand_guideline",
            description: "Generate brand guideline suggestions",
            parameters: {
              type: "object",
              properties: {
                content: { type: "string", description: "Brand guideline content" }
              },
              required: ["content"],
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
