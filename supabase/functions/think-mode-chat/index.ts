import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Think Mode chat request, messages:', messages.length);

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
            content: `You are Madison, Editorial Director at Scriptora. You're helping users brainstorm and refine content ideas in Think Mode.

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

Remember: You're Madison—a trusted advisor helping them think through their creative challenges before they commit to the formal brief.` 
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
