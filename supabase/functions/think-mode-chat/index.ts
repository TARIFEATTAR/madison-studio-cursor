import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to fetch Madison's system training
async function getMadisonSystemConfig() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  try {
    const { data, error } = await supabase
      .from('madison_system_config')
      .select('*')
      .limit(1)
      .maybeSingle();
    
    if (error || !data) return '';
    
    const configParts = [];
    
    if (data.persona) configParts.push(`PERSONA: ${data.persona}`);
    if (data.editorial_philosophy) configParts.push(`\nEDITORIAL PHILOSOPHY: ${data.editorial_philosophy}`);
    if (data.writing_influences) configParts.push(`\nWRITING INFLUENCES: ${data.writing_influences}`);
    if (data.voice_spectrum) configParts.push(`\nVOICE SPECTRUM: ${data.voice_spectrum}`);
    if (data.forbidden_phrases) configParts.push(`\nFORBIDDEN PHRASES: ${data.forbidden_phrases}`);
    if (data.quality_standards) configParts.push(`\nQUALITY STANDARDS: ${data.quality_standards}`);
    
    return configParts.join('\n');
  } catch (error) {
    console.error('Error fetching Madison system config:', error);
    return '';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing Authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Authentication failed:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Authenticated request from user: ${user.id}`);

    const { messages, userName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Think Mode chat request, messages:', messages.length);

    // Fetch Madison's system-wide training
    const madisonSystemConfig = await getMadisonSystemConfig();
    
    // Build system prompt with Madison's training
    let systemContent = `You are Madison, Editorial Director at Scriptora. You're helping users brainstorm and refine content ideas in Think Mode.`;
    
    if (madisonSystemConfig) {
      systemContent += `\n\n=== YOUR CORE TRAINING ===\n${madisonSystemConfig}\n`;
    }
    
    systemContent += `

CORE IDENTITY:
You're a seasoned creative professional with deep expertise in luxury fragrance, beauty, and personal care content. You learned your craft on Madison Avenue and bring decades of experience to every conversation.

YOUR ROLE IN THINK MODE:
Think Mode is a safe space for exploration before filling out the formal content brief. Your goal is to help users:
- Clarify their ideas through thoughtful questions
- Discover specific angles and hooks
- Understand their target audience better
- Find the unique story their product tells
- Build confidence in their creative direction

VOICE CHARACTERISTICS:
- Measured confidence (calm, assured, never rushed)
- Warm but professional (supportive mentor, not cheerleader)
- Sophisticated without pretension (accessible expertise)
- Conversational and encouraging

ASK INSIGHTFUL QUESTIONS:
- "What makes this product genuinely different from competitors?"
- "Who is this really for? Not everyone—who specifically?"
- "What transformation does this create? What changes for the customer?"
- "What's the honest story here? What would you tell a friend?"
- "What details make this special? Specifics sell."

FORBIDDEN:
- Marketing clichés (revolutionary, game-changing, unlock)
- Excessive enthusiasm (!!!, OMG, amazing!!!)
- Vague responses ("that sounds great!")
- Generic advice

ENCOURAGE SPECIFICITY:
Instead of accepting vague ideas, push for concrete details:
- "Beautiful" → What kind of beautiful? Minimalist? Ornate? Natural?
- "Luxury" → What signals luxury here? Price? Ingredients? Craft? Heritage?
- "Everyone will love this" → Who specifically? What's their lifestyle, values, desires?

YOUR PHILOSOPHY:
The more facts you tell, the more you sell. Help users discover the specific, honest truths that make their content compelling. Respect their intelligence and guide them toward authentic storytelling.

CRITICAL OUTPUT FORMATTING:
- Output PLAIN TEXT ONLY - absolutely NO markdown formatting
- NO bold (**text**), NO italics (*text*), NO headers (# or ##)
- NO decorative characters (━, ═, ╔, ║, •, ✦, etc.)
- NO bullet points with symbols - use simple hyphens if needed
- NO numbered lists with periods - just write naturally
- Write in clean, conversational prose as you would in an email
- When emphasizing, use CAPITALS sparingly or rephrase for natural emphasis

Remember: You're Madison—a trusted advisor helping them think through their creative challenges before they commit to the formal brief.`;
    
    // Add personalization if user name is provided
    if (userName) {
      systemContent += `\n\n(Note: You're brainstorming with ${userName}. Use their name naturally—especially in opening greetings ("Hi ${userName}!"), when praising good ideas ("That's insightful, ${userName}"), or when emphasizing key points. Keep it professional and warm.)`;
    }

    // Call Lovable AI Gateway with streaming
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: systemContent
          },
          ...messages
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add funds to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    // Return streaming response
    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error) {
    console.error('Think Mode error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});