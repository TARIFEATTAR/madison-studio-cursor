import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TRANSFORMATION_PROMPTS = {
  email: `Transform this master content into an email newsletter while maintaining Tarife Attar's "Confident Whisper" voice.

TRANSFORMATION REQUIREMENTS:
- Condense to 30-40% of original length (target: 400-500 words)
- Add personalized opening: "You asked about..." or "In our conversation about..."
- Convert headings into bold sentences (no formal headers)
- Add email-specific CTA at end using invitation language
- Emphasize intimate, never promotional tone

STRUCTURE:
1. Personal greeting (reference reader's journey)
2. Hook (main concept from master content)
3. 2-3 key insights (condensed from master)
4. Gentle CTA: "Read the full exploration →" or "Continue the journey →"
5. Signature: "In quiet rebellion, The Tarife Attar Custodians"

CONSTRAINTS:
- Avoid: perfume, cologne, loud, broadcast
- Include: presence, movement, cadence (where natural)
- Tone: Intimate, never promotional

Generate 3 subject line options in this format at the start:
SUBJECT LINE 1: [question format]
SUBJECT LINE 2: [statement format]
SUBJECT LINE 3: [intrigue format]

PREVIEW TEXT: [40-60 characters]

Then generate the email body.`,

  instagram: `Repurpose this content for Instagram carousel format (5 slides + caption).

TRANSFORMATION REQUIREMENTS:
- Extract 4-5 key concepts that work as standalone slides
- Slide 1: Visual hook (one powerful statement, max 10 words)
- Slides 2-4: One insight per slide (max 30 words each, punchy)
- Slide 5: CTA using gentle invitation language
- Caption: Condensed narrative version (150 words max) with allegorical opening
- Hashtags: ONLY use from approved list

SLIDE DESIGN NOTES:
- Each slide must stop the scroll on its own
- Use short sentences, ample white space
- Build narrative: Slide 1 hooks → 2-4 develop → 5 invites action

CAPTION STRUCTURE:
1. Allegorical opening
2. Core message (condensed from master)
3. Gentle invitation
4. Approved hashtags only

APPROVED HASHTAGS (use 3-5):
#IntimateLuxury #TheCadence #QuietRebellion #AttarLife #ScentAnchor #PresenceNotProjection

Format your response as:
SLIDE 1: [text]
SLIDE 2: [text]
SLIDE 3: [text]
SLIDE 4: [text]
SLIDE 5: [text]

CAPTION: [text with hashtags at the end]`,

  twitter: `Break this content into a Twitter/X thread (8-12 tweets) maintaining narrative flow.

THREAD REQUIREMENTS:
- Tweet 1: Most compelling hook from content (must stop scroll)
- Tweets 2-9: Build argument/story progressively
- Each tweet stands alone but connects to thread
- Tweet 10-12: Summary + CTA + link back
- Each tweet max 280 characters (aim for 240-260 for readability)

THREAD STRUCTURE:
1. Hook (provocation or question)
2-3. Problem/villain (trophy perfume culture)
4-6. Solution/philosophy (your approach)
7-9. Proof/deepening (pillars, benefits)
10. Summary
11. CTA + link

CONSTRAINTS:
- Avoid forbidden vocabulary (perfume, cologne, loud, broadcast)
- Use approved allegorical terms naturally
- Each tweet builds momentum
- Maintain Confident Whisper tone
- No hashtags in thread
- Link only in final tweet

Format as:
TWEET 1: [text]
TWEET 2: [text]
etc.`,

  product: `Adapt this content into a product description following the 3-step hierarchy.

TRANSFORMATION REQUIREMENTS:
Follow strict Hierarchy of Description:
1. Philosophy/Emotion (2-3 sentences from essence of content)
2. Notes Integration using allegorical terminology:
   - Top Notes = "The Opening Cadence" or "The Initial Whisper"
   - Middle Notes = "The Heart of the Journey" or "The Narrative Core"
   - Base Notes = "The Deep Anchor" or "The Persistent Foundation"
3. Emotional/ritual context (1-2 sentences)

STRICT CONSTRAINTS:
- Max 150 words total
- Extract the most product-relevant philosophical content
- Maintain Confident Whisper voice

STANDARD DETAILS FOOTER:
- 8-10 hours of intimate presence
- Wears close to the skin—noticed in embrace, not across a room
- Alcohol-free, vegan, cruelty-free
- Hand-decanted in Union City, California

Generate product description now.`,

  sms: `Ultra-condense this content to a single SMS message (160 characters max).

REQUIREMENTS:
- Extract ONE most powerful concept
- Include clear CTA with link placeholder [LINK]
- Maintain Confident Whisper tone despite brevity
- Must feel intentional, not rushed

FORMAT:
[Core concept in 8-12 words]. [CTA + link].

EXAMPLES OF GOOD SMS TONE:
✓ "Presence, not projection. Begin your quiet rebellion: [LINK]"
✓ "Luxury meant for living, not shelves: [LINK]"
✓ "Your signature awaits. Discover the Cadence: [LINK]"

AVOID:
✗ "Amazing deals on perfume!" (too loud)
✗ "Click here now!" (aggressive)
✗ "Limited time offer!" (creates panic)

Generate 3 SMS options, each under 160 chars.`,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { masterContentId, derivativeTypes, masterContent } = await req.json();
    
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(JSON.stringify({ 
        error: 'Missing authorization header',
        success: false,
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { 
        global: { 
          headers: { Authorization: authHeader } 
        },
        auth: {
          persistSession: false
        }
      }
    );

    // Get user using the bearer token explicitly to avoid session issues
    const token = authHeader.replace(/^Bearer\s+/i, '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ 
        error: 'Authentication failed: ' + userError.message,
        success: false,
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (!user) {
      console.error('No user found');
      return new Response(JSON.stringify({ 
        error: 'User not authenticated',
        success: false,
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Repurposing content for user ${user.id}, master: ${masterContentId}`);
    console.log(`Derivative types requested:`, derivativeTypes);

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const results: any[] = [];

    // Generate each derivative type
    for (const derivativeType of derivativeTypes) {
      console.log(`Generating ${derivativeType} derivative...`);
      
      const transformationPrompt = TRANSFORMATION_PROMPTS[derivativeType as keyof typeof TRANSFORMATION_PROMPTS];
      if (!transformationPrompt) {
        console.warn(`No transformation prompt for type: ${derivativeType}`);
        continue;
      }

      // Build context
      let contextInfo = '';
      if (masterContent.collection) {
        contextInfo += `\nCOLLECTION: ${masterContent.collection}`;
      }
      if (masterContent.dip_week) {
        contextInfo += `\nDIP WEEK: Week ${masterContent.dip_week}`;
      }
      if (masterContent.pillar_focus) {
        contextInfo += `\nPILLAR FOCUS: ${masterContent.pillar_focus}`;
      }

      const fullPrompt = `${transformationPrompt}

${contextInfo}

MASTER CONTENT:
${masterContent.full_content}

Generate the ${derivativeType} version now.`;

      // Call Claude API
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [
            {
              role: 'user',
              content: fullPrompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Claude API error for ${derivativeType}:`, response.status, errorText);
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedContent = data.content[0].text;

      // Parse platform-specific specs
      let platformSpecs: any = {};
      
      if (derivativeType === 'email') {
        // Extract subject lines and preview text
        const subjectMatch = generatedContent.match(/SUBJECT LINE \d+: (.+)/g);
        const previewMatch = generatedContent.match(/PREVIEW TEXT: (.+)/);
        platformSpecs = {
          subjectLines: subjectMatch?.map((s: string) => s.replace(/SUBJECT LINE \d+: /, '').trim()) || [],
          previewText: previewMatch?.[1]?.trim() || '',
        };
      } else if (derivativeType === 'instagram') {
        const slides = generatedContent.match(/SLIDE \d+: (.+)/g);
        const captionMatch = generatedContent.match(/CAPTION: ([\s\S]+)/);
        platformSpecs = {
          slideCount: slides?.length || 5,
          slides: slides?.map((s: string) => s.replace(/SLIDE \d+: /, '').trim()) || [],
          caption: captionMatch?.[1]?.trim() || '',
        };
      } else if (derivativeType === 'twitter') {
        const tweets = generatedContent.match(/TWEET \d+: (.+)/g);
        platformSpecs = {
          tweetCount: tweets?.length || 0,
          tweets: tweets?.map((t: string) => t.replace(/TWEET \d+: /, '').trim()) || [],
        };
      } else if (derivativeType === 'sms') {
        const smsOptions = generatedContent.split('\n').filter((line: string) => line.trim() && !line.startsWith('REQUIREMENTS') && !line.startsWith('FORMAT'));
        platformSpecs = {
          options: smsOptions.slice(0, 3),
        };
      }

      // Save to database
      const { data: derivative, error: saveError } = await supabaseClient
        .from('derivative_assets')
        .insert({
          master_content_id: masterContentId,
          asset_type: derivativeType,
          generated_content: generatedContent,
          platform_specs: platformSpecs,
          approval_status: 'pending',
          created_by: user.id,
        })
        .select()
        .single();

      if (saveError) {
        console.error(`Error saving ${derivativeType} derivative:`, saveError);
        throw saveError;
      }

      console.log(`Successfully generated and saved ${derivativeType} derivative`);
      results.push(derivative);
    }

    return new Response(JSON.stringify({ 
      success: true,
      derivatives: results,
      message: `Generated ${results.length} derivative assets`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in repurpose-content function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
