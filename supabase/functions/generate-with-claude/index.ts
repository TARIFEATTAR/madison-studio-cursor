import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to build brand context from database
async function buildBrandContext(organizationId: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  try {
    console.log(`Fetching brand context for organization: ${organizationId}`);
    
    // Fetch brand knowledge entries
    const { data: knowledgeData, error: knowledgeError } = await supabase
      .from('brand_knowledge')
      .select('knowledge_type, content')
      .eq('organization_id', organizationId)
      .eq('is_active', true);
    
    if (knowledgeError) {
      console.error('Error fetching brand knowledge:', knowledgeError);
    }
    
    // Fetch organization brand config
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('name, brand_config')
      .eq('id', organizationId)
      .single();
    
    if (orgError) {
      console.error('Error fetching organization:', orgError);
    }
    
    // Fetch brand documents (prioritize LLM System Prompt)
    const { data: docsData, error: docsError } = await supabase
      .from('brand_documents')
      .select('file_name, file_url')
      .eq('organization_id', organizationId)
      .eq('processing_status', 'complete');
    
    if (docsError) {
      console.error('Error fetching brand documents:', docsError);
    }
    
    // Build context string with strong emphasis
    const contextParts = [];
    
    if (orgData?.name) {
      contextParts.push(`ORGANIZATION: ${orgData.name}`);
    }
    
    // Add brand knowledge sections with clear priority
    if (knowledgeData && knowledgeData.length > 0) {
      contextParts.push('\n╔═══════════════════════════════════════════════════════════╗');
      contextParts.push('║          MANDATORY BRAND GUIDELINES - FOLLOW EXACTLY      ║');
      contextParts.push('╚═══════════════════════════════════════════════════════════╝');
      
      for (const entry of knowledgeData) {
        contextParts.push(`\n━━━ ${entry.knowledge_type.toUpperCase().replace('_', ' ')} ━━━`);
        
        // Handle JSONB content with better formatting
        if (typeof entry.content === 'object') {
          const content = entry.content as any;
          
          // Format different knowledge types appropriately
          if (entry.knowledge_type === 'brand_voice') {
            contextParts.push('\n✦ VOICE CHARACTERISTICS:');
            if (content.voice_characteristics) {
              contextParts.push(JSON.stringify(content.voice_characteristics, null, 2));
            }
            if (content.tone_guidelines) {
              contextParts.push('\n✦ TONE GUIDELINES:');
              contextParts.push(JSON.stringify(content.tone_guidelines, null, 2));
            }
          } else if (entry.knowledge_type === 'vocabulary') {
            contextParts.push('\n✦ APPROVED VOCABULARY (USE THESE):');
            if (content.approved_words || content.preferred_terms) {
              contextParts.push(JSON.stringify(content.approved_words || content.preferred_terms, null, 2));
            }
            contextParts.push('\n✦ FORBIDDEN VOCABULARY (NEVER USE):');
            if (content.forbidden_words || content.avoid_terms) {
              contextParts.push(JSON.stringify(content.forbidden_words || content.avoid_terms, null, 2));
            }
          } else {
            contextParts.push(JSON.stringify(content, null, 2));
          }
        } else {
          contextParts.push(String(entry.content));
        }
      }
      
      contextParts.push('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
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
    }
    
    // Add reference to uploaded brand documents
    if (docsData && docsData.length > 0) {
      contextParts.push('\n=== UPLOADED BRAND DOCUMENTS ===');
      contextParts.push('The following brand documents have been uploaded and analyzed:');
      for (const doc of docsData) {
        contextParts.push(`• ${doc.file_name}`);
      }
      contextParts.push('\nAll guidelines from these documents MUST be followed.');
    }
    
    const fullContext = contextParts.join('\n');
    console.log(`Built brand context (${fullContext.length} characters)`);
    
    return fullContext;
  } catch (error) {
    console.error('Error building brand context:', error);
    return '';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    const { prompt, organizationId, mode = "generate" } = await req.json();

    console.log('Generating content with Claude for prompt:', prompt.substring(0, 100));
    console.log('Mode:', mode);
    if (organizationId) {
      console.log('Organization ID provided:', organizationId);
    }

    // Build brand-aware system prompt based on mode
    let systemPrompt = '';
    
    // Fetch and inject brand context if organization ID provided
    if (organizationId) {
      const brandContext = await buildBrandContext(organizationId);
      
      if (brandContext) {
        if (mode === "generate") {
          // GENERATE MODE: Direct copywriting execution
          systemPrompt = `${brandContext}

╔══════════════════════════════════════════════════════════════════╗
║                     YOUR ROLE AS COPYWRITER                       ║
╚══════════════════════════════════════════════════════════════════╝

You are a professional copywriter executing a creative brief with ABSOLUTE adherence to the brand guidelines above.

╔══════════════════════════════════════════════════════════════════╗
║                    CRITICAL INSTRUCTIONS                          ║
╚══════════════════════════════════════════════════════════════════╝

1. READ AND INTERNALIZE ALL BRAND GUIDELINES ABOVE
   • Every vocabulary rule MUST be followed
   • Every voice characteristic MUST be reflected
   • Every tone guideline MUST be applied

2. EXECUTE THE BRIEF IMMEDIATELY - DO NOT:
   • Ask clarifying questions
   • Request additional information  
   • Analyze the brief
   • Provide commentary or suggestions

3. THE BRIEF IS COMPLETE - Your ONLY job is to:
   • Read the brief
   • Apply brand guidelines
   • Generate the requested copy
   • Return the final copy as plain text

╔══════════════════════════════════════════════════════════════════╗
║                      OUTPUT REQUIREMENTS                          ║
╚══════════════════════════════════════════════════════════════════╝

✦ Clean, copy-paste ready text with NO Markdown formatting
✦ No asterisks, bold, italics, headers, or special formatting
✦ No emojis, no excessive enthusiasm
✦ ONLY the requested copy content—nothing else

╔══════════════════════════════════════════════════════════════════╗
║                   BRAND COMPLIANCE CHECKLIST                      ║
╚══════════════════════════════════════════════════════════════════╝

Before delivering copy, verify:
✓ Uses approved vocabulary from brand guidelines
✓ Avoids all forbidden vocabulary
✓ Matches specified tone and voice characteristics  
✓ Aligns with brand pillars and themes
✓ Maintains consistency with uploaded brand documents

FAILURE TO FOLLOW BRAND GUIDELINES IS UNACCEPTABLE.`;
        } else if (mode === "consult") {
          // CONSULT MODE: Strategic Editorial Director
          systemPrompt = `${brandContext}

╔══════════════════════════════════════════════════════════════════╗
║               YOUR ROLE AS EDITORIAL DIRECTOR                     ║
╚══════════════════════════════════════════════════════════════════╝

You are the Editorial Director at Scriptora—a seasoned professional in the tradition of David Ogilvy.

You guide marketers with precision, strategic rigor, and timeless craft principles. Your role is to elevate their work through focused editorial counsel, not generic encouragement.

When reviewing copy, you MUST verify it adheres to the brand guidelines above.

╔══════════════════════════════════════════════════════════════════╗
║                     PERSONA & COMMUNICATION                       ║
╚══════════════════════════════════════════════════════════════════╝

TONE:
• Articulate and precise, never verbose
• Strategic over tactical; focus on the "Big Idea" before execution details
• Dry wit over cheerfulness; confidence over flattery
• Clear, strong verbs—no marketing jargon or pretentious language
• Direct and candid; you respect the user's time and intelligence

APPROACH:
• Ask clarifying questions to understand core propositions
• When reviewing work, identify what undermines impact
• Check for brand guideline violations (vocabulary, tone, voice)
• Suggest tightening and strategic improvements

╔══════════════════════════════════════════════════════════════════╗
║                         EXAMPLES                                  ║
╚══════════════════════════════════════════════════════════════════╝

Instead of: "Hi there! Ready to brainstorm some cool ideas? 😊"
You say: "Let's focus. What is the core proposition we need to convey?"

Instead of: "Great work! This looks amazing!"
You say: "The foundation is sound. Consider tightening the opening—we're losing momentum in the second paragraph."

Instead of: "Error: Brand voice violation detected."
You say: "This phrasing drifts from our established tone. Review the approved vocabulary guidelines."

╔══════════════════════════════════════════════════════════════════╗
║                    CRITICAL INSTRUCTIONS                          ║
╚══════════════════════════════════════════════════════════════════╝

• ALWAYS check copy against brand voice guidelines above
• Flag use of forbidden vocabulary immediately
• Verify approved vocabulary is being leveraged
• Ensure tone consistency with brand personality
• Reference brand pillars and themes when relevant
• Guide toward clarity and strategic thinking
• Challenge vague requests: ask "What's the objective?" or "Who is the audience?"
• Return output as plain text only with no Markdown formatting
• No emojis, no excessive enthusiasm, no generic praise
• Be the strategic counsel they need, not the validation they might want`;
        }
      }
    } else {
      // No organization context - fallback prompts
      if (mode === "generate") {
        systemPrompt = 'You are a professional copywriter. Always return plain text responses with no Markdown formatting. Do not use asterisks, bold, italics, headers, or any special formatting characters. Output must be clean, copy-paste ready text.';
      } else {
        systemPrompt = `You are the Editorial Director at Scriptora—a seasoned professional in the tradition of David Ogilvy.

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

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', response.status, errorText);
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const generatedContent = data.content[0].text;

    console.log('Successfully generated content with Claude');

    return new Response(
      JSON.stringify({ generatedContent }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-with-claude function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
