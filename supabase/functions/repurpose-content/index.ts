import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to build brand context from database
async function buildBrandContext(supabaseClient: any, organizationId: string) {
  try {
    console.log(`Fetching brand context for organization: ${organizationId}`);
    
    // Fetch brand knowledge entries
    const { data: knowledgeData, error: knowledgeError } = await supabaseClient
      .from('brand_knowledge')
      .select('knowledge_type, content')
      .eq('organization_id', organizationId)
      .eq('is_active', true);
    
    if (knowledgeError) {
      console.error('Error fetching brand knowledge:', knowledgeError);
    }
    
    // Fetch organization brand config
    const { data: orgData, error: orgError } = await supabaseClient
      .from('organizations')
      .select('name, brand_config')
      .eq('id', organizationId)
      .single();
    
    if (orgError) {
      console.error('Error fetching organization:', orgError);
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
    
    // Add brand colors if available
    if (orgData?.brand_config) {
      const config = orgData.brand_config as any;
      if (config.brand_colors) {
        contextParts.push('\n=== BRAND VISUAL GUIDELINES ===');
        contextParts.push(`Colors: ${JSON.stringify(config.brand_colors)}`);
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

  linkedin: `Adapt this content for LinkedIn with a more professional tone while maintaining core philosophy.

TRANSFORMATION REQUIREMENTS:
- Condense to 40% of original length (target: 400-600 words)
- Opening: Professional insight or industry observation
- Body: 2-3 paragraphs with core argument
- Tone: Slightly more professional, less allegorical than blog
- Closing: Professional takeaway + link

STRUCTURE:
1. First line: Provocative hook (professional context)
2. 2-3 paragraphs: Core argument from master content
3. Closing: Professional insight
4. Link: "Read more: [URL]"

CONSTRAINTS:
- Maintain brand philosophy
- Avoid corporate jargon
- Keep Confident Whisper essence but professional wrapper
- No hashtags (diminishes sophistication)
- Word count: 400-600 words

Generate LinkedIn post now.`,

  email_3part: `Transform this master content into a 3-part email sequence following the Welcome/Value/Invitation framework.

SEQUENCE STRUCTURE:
EMAIL 1 - THE WELCOME (Day 1):
- Subject: Warm, intriguing introduction
- Body: Establish relationship, set expectations, hint at journey ahead
- Tone: Intimate greeting, "You've arrived at something different"
- CTA: "Tomorrow, we explore [key concept]"
- Length: 300-400 words

EMAIL 2 - THE VALUE (Day 3):
- Subject: Promise delivery from Email 1
- Body: Core philosophy/insight from master content (condensed 50%)
- Tone: This is what we believe, why it matters
- CTA: "One more thing to share with you"
- Length: 400-500 words

EMAIL 3 - THE INVITATION (Day 5):
- Subject: Gentle call to action
- Body: Synthesize journey, extend invitation to engage further
- Tone: "You're ready now" confidence without pressure
- CTA: Clear next step (visit collection, read full post, etc.)
- Length: 300-400 words

SEQUENCE CONSISTENCY:
- Maintain narrative thread across all 3 emails
- Each email must stand alone but build on previous
- Reference previous emails: "As I mentioned..." "Remember when..."
- Use Confident Whisper tone throughout
- Each email ends with signature: "In quiet rebellion, The Tarife Attar Custodians"

TIMING NOTES:
- Day 1, Day 3, Day 5 (2-day gaps for contemplation)

OUTPUT FORMAT:
EMAIL 1:
SUBJECT: [subject line]
PREVIEW: [40-60 chars]
BODY: [email content]

EMAIL 2:
SUBJECT: [subject line]
PREVIEW: [40-60 chars]
BODY: [email content]

EMAIL 3:
SUBJECT: [subject line]
PREVIEW: [40-60 chars]
BODY: [email content]

Generate the complete 3-part sequence now.`,

  email_5part: `Transform this master content into a 5-part email sequence following the extended nurture framework.

SEQUENCE STRUCTURE:
EMAIL 1 - THE OPENING (Day 1):
- Subject: Provocative question or observation
- Body: Hook reader, promise transformation of understanding
- Tone: "Something's off in this industry, you've felt it too"
- CTA: "Tomorrow: Why this matters to you"
- Length: 250-350 words

EMAIL 2 - THE PROBLEM (Day 2):
- Subject: Name the villain (Trophy Perfume culture)
- Body: Articulate what's broken in current paradigm
- Tone: Empathetic critique, not angry rant
- CTA: "There's another way..."
- Length: 350-450 words

EMAIL 3 - THE SOLUTION (Day 4):
- Subject: Introduce your philosophy/approach
- Body: Core content from master (condensed 40%)
- Tone: "This is how we do it differently"
- CTA: "Let me show you what this looks like in practice"
- Length: 400-500 words

EMAIL 4 - THE PROOF (Day 6):
- Subject: Evidence, testimonial, deeper dive
- Body: Expand on one key pillar or benefit from master content
- Tone: "See it in action" confidence
- CTA: "One final insight tomorrow"
- Length: 350-450 words

EMAIL 5 - THE INVITATION (Day 8):
- Subject: Clear next step
- Body: Synthesize journey, extend specific invitation
- Tone: "You're ready now" + gentle urgency
- CTA: Clear action (visit collection, book consultation, etc.)
- Length: 300-400 words

SEQUENCE CONSISTENCY:
- Build narrative tension: problem → solution → proof → invitation
- Reference previous emails to create continuity
- Each email must deliver standalone value
- Maintain Confident Whisper throughout
- Signature on each: "In quiet rebellion, The Tarife Attar Custodians"

TIMING NOTES:
- Days 1, 2, 4, 6, 8 (varied spacing for rhythm)

OUTPUT FORMAT:
EMAIL 1:
SUBJECT: [subject line]
PREVIEW: [40-60 chars]
BODY: [email content]

EMAIL 2:
SUBJECT: [subject line]
PREVIEW: [40-60 chars]
BODY: [email content]

EMAIL 3:
SUBJECT: [subject line]
PREVIEW: [40-60 chars]
BODY: [email content]

EMAIL 4:
SUBJECT: [subject line]
PREVIEW: [40-60 chars]
BODY: [email content]

EMAIL 5:
SUBJECT: [subject line]
PREVIEW: [40-60 chars]
BODY: [email content]

Generate the complete 5-part sequence now.`,

  email_7part: `Transform this master content into a 7-part email sequence following the deep dive journey framework.

SEQUENCE STRUCTURE:
EMAIL 1 - THE ARRIVAL (Day 1):
- Subject: "You've landed somewhere different"
- Body: Welcome, set expectations for 2-week journey
- Tone: Intimate, conspiratorial
- CTA: "Tomorrow: A question to ponder"
- Length: 200-300 words

EMAIL 2 - THE QUESTION (Day 2):
- Subject: Provocative question that reframes thinking
- Body: Challenge assumptions, introduce tension
- Tone: Thoughtful provocation
- CTA: "More tomorrow"
- Length: 250-350 words

EMAIL 3 - THE CONTEXT (Day 4):
- Subject: Historical/cultural background
- Body: "How did we get here?" - Set up the problem
- Tone: Editorial, contemplative
- CTA: "Next: The turning point"
- Length: 400-500 words

EMAIL 4 - THE PHILOSOPHY (Day 6):
- Subject: Core belief system
- Body: Main content from master (condensed 30%)
- Tone: "This is what we believe and why"
- CTA: "Let me show you how this works"
- Length: 500-600 words

EMAIL 5 - THE PRACTICE (Day 8):
- Subject: Practical application
- Body: "Here's how to live this philosophy"
- Tone: Instructive but poetic
- CTA: "Tomorrow: Real-world proof"
- Length: 400-500 words

EMAIL 6 - THE EVIDENCE (Day 10):
- Subject: Testimonials, case studies, deeper dive
- Body: Social proof + expanded pillar content
- Tone: "See it in others, imagine it for yourself"
- CTA: "Final invitation tomorrow"
- Length: 350-450 words

EMAIL 7 - THE THRESHOLD (Day 12):
- Subject: "You're standing at the threshold"
- Body: Synthesize entire journey, clear call to cross over
- Tone: Confident invitation, gentle urgency
- CTA: Specific next step (visit collection, consultation, etc.)
- Length: 300-400 words

SEQUENCE CONSISTENCY:
- Arc from curiosity → understanding → action
- Rich narrative through-line across all 7 emails
- Each email references previous journey steps
- Deep philosophical exploration (not surface tactics)
- Maintain Confident Whisper throughout
- Signature on each: "In quiet rebellion, The Tarife Attar Custodians"

TIMING NOTES:
- Days 1, 2, 4, 6, 8, 10, 12 (2-day gaps after Email 2 for contemplation)

OUTPUT FORMAT:
EMAIL 1:
SUBJECT: [subject line]
PREVIEW: [40-60 chars]
BODY: [email content]

EMAIL 2:
SUBJECT: [subject line]
PREVIEW: [40-60 chars]
BODY: [email content]

EMAIL 3:
SUBJECT: [subject line]
PREVIEW: [40-60 chars]
BODY: [email content]

EMAIL 4:
SUBJECT: [subject line]
PREVIEW: [40-60 chars]
BODY: [email content]

EMAIL 5:
SUBJECT: [subject line]
PREVIEW: [40-60 chars]
BODY: [email content]

EMAIL 6:
SUBJECT: [subject line]
PREVIEW: [40-60 chars]
BODY: [email content]

EMAIL 7:
SUBJECT: [subject line]
PREVIEW: [40-60 chars]
BODY: [email content]

Generate the complete 7-part sequence now.`,
};

// Utility: strip Markdown and common formatting to plain text
const stripMarkdown = (text: string): string => {
  return text
    // Bold/italics
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Headings
    .replace(/^#{1,6}\s*/gm, '')
    // Code fences and inline code
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // Links and images
    .replace(/!\[[^\]]*\]\([^\)]*\)/g, '')
    .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '$1')
    // Blockquotes and HRs
    .replace(/^>\s?/gm, '')
    .replace(/^(-{3,}|\*{3,}|_{3,})$/gm, '')
    // Lists (bulleted and ordered)
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    // Extra whitespace
    .replace(/[\t ]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
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

    // Fetch master content to get organization_id
    const { data: masterContentRecord, error: masterError } = await supabaseClient
      .from('master_content')
      .select('organization_id')
      .eq('id', masterContentId)
      .single();

    if (masterError || !masterContentRecord) {
      console.error('Error fetching master content:', masterError);
      return new Response(JSON.stringify({ 
        error: 'Master content not found or unauthorized',
        success: false,
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Using organization_id: ${masterContentRecord.organization_id}`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Fetch brand context for consistent voice
    const brandContext = await buildBrandContext(supabaseClient, masterContentRecord.organization_id);

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
\n${contextInfo}
\nIMPORTANT OUTPUT RULES:\n- Return PLAIN TEXT only.\n- Do NOT use any Markdown or markup (no **bold**, *italics*, # headings, lists, or backticks).\n- Keep labels like SLIDE 1:, TWEET 1:, SUBJECT LINE 1: as plain text when applicable.\n\nMASTER CONTENT:\n${masterContent.full_content}\n\nGenerate the ${derivativeType} version now.`;

      // Build brand-aware system prompt
      let systemPrompt = 'You are a precise editorial assistant. Follow instructions exactly and return clean text.';
      
      if (brandContext) {
        systemPrompt = `${brandContext}

=== YOUR ROLE ===
You are the official editorial assistant for this organization. You have deep knowledge of their brand voice, values, and aesthetic as detailed above.

=== INSTRUCTIONS ===
- Always adhere to the brand voice guidelines provided
- Use approved vocabulary and avoid forbidden terms as specified
- Maintain tone consistency with the brand personality
- Follow instructions exactly and return clean text`;
      }

      // Call Lovable AI Gateway (default to Gemini 2.5 Flash)
      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // During promo period, Gemini models are free
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: fullPrompt }
          ]
        }),
      });

      if (!aiResponse.ok) {
        const t = await aiResponse.text();
        console.error(`AI gateway error for ${derivativeType}:`, aiResponse.status, t);
        if (aiResponse.status === 429) throw new Error('Rate limits exceeded. Please wait a moment and retry.');
        if (aiResponse.status === 402) throw new Error('Payment required: please add credits to Lovable AI workspace.');
        throw new Error(`AI gateway error: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      const generatedContent = aiData.choices?.[0]?.message?.content ?? '';
      const cleanedContent = stripMarkdown(generatedContent);

      // Parse platform-specific specs (from cleaned text to avoid markdown tokens)
      let platformSpecs: any = {};
      if (derivativeType === 'email') {
        const subjectMatch = cleanedContent.match(/SUBJECT LINE \d+: (.+)/g);
        const previewMatch = cleanedContent.match(/PREVIEW TEXT: (.+)/);
        platformSpecs = {
          subjectLines: subjectMatch?.map((s: string) => s.replace(/SUBJECT LINE \d+: /, '').trim()) || [],
          previewText: previewMatch?.[1]?.trim() || '',
        };
      } else if (derivativeType === 'instagram') {
        const slides = cleanedContent.match(/SLIDE \d+: (.+)/g);
        const captionMatch = cleanedContent.match(/CAPTION: ([\s\S]+)/);
        platformSpecs = {
          slideCount: slides?.length || 5,
          slides: slides?.map((s: string) => s.replace(/SLIDE \d+: /, '').trim()) || [],
          caption: captionMatch?.[1]?.trim() || '',
        };
      } else if (derivativeType === 'twitter') {
        const tweets = cleanedContent.match(/TWEET \d+: (.+)/g);
        platformSpecs = {
          tweetCount: tweets?.length || 0,
          tweets: tweets?.map((t: string) => t.replace(/TWEET \d+: /, '').trim()) || [],
        };
      } else if (derivativeType === 'sms') {
        const smsOptions = cleanedContent.split('\n').filter((line: string) => line.trim() && !line.startsWith('REQUIREMENTS') && !line.startsWith('FORMAT'));
        platformSpecs = { options: smsOptions.slice(0, 3) };
      } else if (derivativeType === 'email_3part' || derivativeType === 'email_5part' || derivativeType === 'email_7part') {
        const emailMatches = cleanedContent.match(/EMAIL \d+:\s*SUBJECT: (.+?)\s*PREVIEW: (.+?)\s*BODY: ([\s\S]+?)(?=EMAIL \d+:|$)/g);
        const emails = emailMatches?.map((match: string) => {
          const subjectMatch = match.match(/SUBJECT: (.+)/);
          const previewMatch = match.match(/PREVIEW: (.+)/);
          const bodyMatch = match.match(/BODY: ([\s\S]+)/);
          return {
            subject: subjectMatch?.[1]?.trim() || '',
            preview: previewMatch?.[1]?.trim() || '',
            body: bodyMatch?.[1]?.trim() || '',
          };
        }) || [];
        platformSpecs = {
          emailCount: emails.length,
          emails: emails,
          sequenceType: derivativeType,
        };
      }

      // Save to database
      const { data: derivative, error: saveError } = await supabaseClient
        .from('derivative_assets')
        .insert({
          master_content_id: masterContentId,
          asset_type: derivativeType,
          generated_content: cleanedContent,
          platform_specs: platformSpecs,
          approval_status: 'pending',
          created_by: user.id,
          organization_id: masterContentRecord.organization_id,
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
