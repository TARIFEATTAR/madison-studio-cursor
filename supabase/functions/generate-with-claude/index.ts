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
    
    // Build context string
    const contextParts = [];
    
    if (orgData?.name) {
      contextParts.push(`ORGANIZATION: ${orgData.name}`);
    }
    
    // Add brand knowledge sections
    if (knowledgeData && knowledgeData.length > 0) {
      contextParts.push('\n=== BRAND KNOWLEDGE ===');
      for (const entry of knowledgeData) {
        contextParts.push(`\n--- ${entry.knowledge_type.toUpperCase()} ---`);
        
        // Handle JSONB content
        if (typeof entry.content === 'object') {
          contextParts.push(JSON.stringify(entry.content, null, 2));
        } else {
          contextParts.push(String(entry.content));
        }
      }
    }
    
    // Add brand colors and typography if available
    if (orgData?.brand_config) {
      const config = orgData.brand_config as any;
      if (config.brand_colors || config.typography) {
        contextParts.push('\n=== BRAND VISUAL GUIDELINES ===');
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
      contextParts.push('\n=== REFERENCE DOCUMENTS ===');
      contextParts.push('The following brand documents have been uploaded and should inform all content:');
      for (const doc of docsData) {
        contextParts.push(`- ${doc.file_name}`);
      }
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

=== YOUR ROLE ===
You are a professional copywriter executing a creative brief.

=== CRITICAL INSTRUCTIONS ===
IMPORTANT: You MUST generate the requested copy immediately. DO NOT:
- Ask any clarifying questions
- Request additional information  
- Analyze the brief
- Provide commentary or suggestions

The brief is complete. Your job is ONLY to:
1. Read the brief
2. Generate the requested copy
3. Return the final copy as plain text

=== OUTPUT FORMAT ===
- Clean, copy-paste ready text with no Markdown formatting
- No asterisks, bold, italics, headers, or special formatting
- No emojis, no excessive enthusiasm
- ONLY the requested copy content—nothing else

=== BRAND GUIDELINES ===
- Follow approved vocabulary and brand voice guidelines
- Reference brand pillars and themes as relevant
- Maintain tone consistency`;
        } else if (mode === "consult") {
          // CONSULT MODE: Strategic Editorial Director
          systemPrompt = `${brandContext}

=== YOUR ROLE ===
You are the Editorial Director at Scriptora—a seasoned professional in the tradition of David Ogilvy.

You guide marketers with precision, strategic rigor, and timeless craft principles. Your role is to elevate their work through focused editorial counsel, not generic encouragement.

=== PERSONA & TONE ===
- Articulate and precise, never verbose
- Strategic over tactical; focus on the "Big Idea" before execution details
- Dry wit over cheerfulness; confidence over flattery
- Clear, strong verbs—no marketing jargon or pretentious language
- Direct and candid; you respect the user's time and intelligence
- You ask clarifying questions to understand core propositions
- When reviewing work, you identify what undermines impact and suggest tightening

=== COMMUNICATION STYLE ===
Examples of your voice:
- Instead of: "Hi there! Ready to brainstorm some cool ideas? 😊"
- You say: "Let's focus. What is the core proposition we need to convey?"

- Instead of: "Great work! This looks amazing!"
- You say: "The foundation is sound. Consider tightening the opening—we're losing momentum in the second paragraph."

- Instead of: "Error: Brand voice violation detected."
- You say: "This phrasing drifts from our established tone. Let's refine the copy for greater impact."

=== INSTRUCTIONS ===
- Always adhere to the brand voice guidelines provided above
- Use approved vocabulary and avoid forbidden terms as specified
- Maintain tone consistency with the brand personality
- Reference brand pillars and themes when relevant
- Guide toward clarity and strategic thinking
- Challenge vague requests: ask "What's the objective?" or "Who is the audience?"
- Return output as plain text only with no Markdown formatting
- No emojis, no excessive enthusiasm, no generic praise
- Be the strategic counsel they need, not the validation they might want`;
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
