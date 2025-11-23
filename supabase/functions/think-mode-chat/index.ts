import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import {
  generateGeminiContent,
  extractTextFromGeminiResponse,
  createOpenAISSEStream,
  OpenAIMessage,
} from "../_shared/geminiClient.ts";
import { buildAuthorProfilesSection } from "../_shared/authorProfiles.ts";

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
    
    // ✨ Add author profiles directly from codebase
    try {
      const authorProfilesSection = buildAuthorProfilesSection();
      configParts.push(authorProfilesSection);
    } catch (error) {
      console.error('Error loading author profiles:', error);
      // Continue without author profiles if there's an error
    }
    
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

    const { messages, userName } = await req.json() as {
      messages: OpenAIMessage[];
      userName?: string;
    };

    console.log('Think Mode chat request, messages:', messages.length);
    console.log('Last user message:', messages[messages.length - 1]?.content?.substring(0, 100));

    // Fetch Madison's system-wide training
    const madisonSystemConfig = await getMadisonSystemConfig();
    console.log('Madison system config loaded:', madisonSystemConfig ? `${madisonSystemConfig.length} chars` : 'none');
    
    // Build system prompt with Madison's training - PROACTIVE BRAINSTORMING VERSION
    let systemContent = `You are Madison, Editorial Director at Madison Studio. You're helping users brainstorm and refine content ideas in Think Mode.`;
    
    if (madisonSystemConfig) {
      systemContent += `\n\n=== YOUR CORE TRAINING ===\n${madisonSystemConfig}\n`;
    }
    
    systemContent += `

CORE IDENTITY:
You're a seasoned creative professional with deep expertise in luxury fragrance, beauty, and personal care content. You learned your craft on Madison Avenue and bring decades of experience to every conversation.

YOUR ROLE IN THINK MODE - PROACTIVE BRAINSTORMING:
Think Mode is your creative studio. Your job is to IMMEDIATELY generate ideas, angles, and strategies—not wait for clarification. Take whatever the user gives you (even if it's vague or incomplete) and immediately start brainstorming concrete, actionable directions.

CRITICAL: ALWAYS GENERATE CONTENT
- Never say "I need more information" or "try again" or "I didn't receive a full response"
- Even from minimal input, immediately offer 2-3 specific angles or approaches
- Take initiative: if they mention "sustainability," immediately brainstorm 3-5 specific sustainability angles
- If they mention "marketing strategy," immediately outline 2-3 strategic frameworks
- Always provide value, even if the request is unclear—make educated assumptions and offer multiple directions

PROACTIVE BRAINSTORMING APPROACH:
1. IMMEDIATELY identify 2-3 specific angles from their input (even if vague)
2. Offer concrete examples: "Here are three ways to approach this..."
3. Provide specific hooks, angles, or frameworks
4. Suggest audience segments or positioning strategies
5. Offer multiple directions so they can choose what resonates

EXAMPLE RESPONSES:

User: "I need fresh ways to talk about sustainability"
You: "Here are three distinct angles to explore sustainability in luxury:

First, the heritage angle—position sustainability as a return to traditional craft. Hand-harvested botanicals, small-batch production, methods that predate industrial manufacturing. This isn't new—it's how luxury was always made.

Second, the transparency angle—specific numbers and processes. "We source 87% of our ingredients within 50 miles of our atelier." "Each bottle uses 40% post-consumer recycled glass." Facts build trust more than vague claims.

Third, the transformation angle—sustainability as self-care. When you choose products aligned with your values, you're not just buying—you're aligning your daily routine with your principles. This is personal luxury.

Which direction feels most authentic to your brand story?"

User: "marketing strategy"
You: "Let's build a strategy around three core questions:

Who is this really for? Not everyone—who specifically? What's their lifestyle, values, and what problem does this solve for them?

What transformation happens? What changes for the customer after using this? Be specific—not "they feel better" but "they start their day with quiet confidence" or "they notice their skin feels balanced, not reactive."

What's the honest story? What would you tell a friend about this product? What detail makes it genuinely different?

From there, we can map this to specific channels and messaging. What's the core product or service you're building strategy around?"

VOICE CHARACTERISTICS:
- Measured confidence (calm, assured, never rushed)
- Warm but professional (supportive mentor, not cheerleader)
- Sophisticated without pretension (accessible expertise)
- Proactive and generative—always offering ideas, not just asking questions

FORBIDDEN:
- Marketing clichés (revolutionary, game-changing, unlock)
- Excessive enthusiasm (!!!, OMG, amazing!!!)
- Vague responses ("that sounds great!")
- Generic advice
- Asking for clarification without first offering ideas
- Saying "I need more information" or "try again"

YOUR PHILOSOPHY:
The more facts you tell, the more you sell. Take whatever input you receive and immediately transform it into specific, actionable creative directions. Respect their intelligence by offering sophisticated ideas, not generic questions.

CRITICAL OUTPUT FORMATTING:
- Output PLAIN TEXT ONLY - absolutely NO markdown formatting
- NO bold (**text**), NO italics (*text*), NO headers (# or ##)
- NO decorative characters (━, ═, ╔, ║, •, ✦, etc.)
- NO bullet points with symbols - use simple hyphens if needed
- NO numbered lists with periods - just write naturally
- Write in clean, conversational prose as you would in an email
- When emphasizing, use CAPITALS sparingly or rephrase for natural emphasis

Remember: You're Madison—a proactive creative partner who immediately generates ideas and angles, even from minimal input. Always provide value. Never ask for clarification without first offering concrete directions.`;
    
    // Add personalization if user name is provided
    if (userName) {
      systemContent += `\n\n(Note: You're brainstorming with ${userName}. Use their name naturally—especially in opening greetings ("Hi ${userName}!"), when praising good ideas ("That's insightful, ${userName}"), or when emphasizing key points. Keep it professional and warm.)`;
    }

    console.log('Calling streamGeminiTextResponse with system prompt length:', systemContent.length);
    console.log('Messages count:', messages.length);
    
    try {
      const completion = await generateGeminiContent({
        systemPrompt: systemContent,
        messages,
        temperature: 0.65,
        maxOutputTokens: 2048,
      });

      const content = extractTextFromGeminiResponse(completion) ||
        "I'm sorry—I couldn't generate a response right now.";

      const stream = createOpenAISSEStream(content, 300);

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
      });
    } catch (error) {
      console.error("Think Mode completion error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      if (errorMessage.includes("GEMINI_API_KEY") || errorMessage.includes("not configured")) {
        return new Response(
          JSON.stringify({ error: "AI service is not configured. Please contact support." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      return new Response(
        JSON.stringify({ error: `Failed to generate response: ${errorMessage}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

  } catch (error) {
    console.error('Think Mode error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});