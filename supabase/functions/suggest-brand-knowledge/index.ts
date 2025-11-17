import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { generateText } from "../_shared/aiProviders.ts";

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

    // Build generation prompt based on knowledge_type
    let systemPrompt, userPrompt;
    let expectedKey = 'content';

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

        expectedKey = "target_audience";
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

        expectedKey = "voice_guidelines";
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

        expectedKey = "mission";
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

        expectedKey = "content";
        userPrompt = `Generate brand guideline suggestions for: ${knowledge_type}`;
    }
    const rawResponse = await generateText({
      systemPrompt,
      prompt: `${userPrompt}\n\nReturn ONLY valid JSON with a top-level "${expectedKey}" property.`,
    });

    let suggestions;
    try {
      suggestions = JSON.parse(rawResponse.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError, rawResponse);
      return new Response(JSON.stringify({
        error: 'Failed to parse AI response',
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!suggestions || !(expectedKey in suggestions)) {
      return new Response(JSON.stringify({
        error: 'AI response missing expected content',
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
