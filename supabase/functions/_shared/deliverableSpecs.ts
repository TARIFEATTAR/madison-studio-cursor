/**
 * Platform-Specific Deliverable Specifications
 * 
 * These specs define the format constraints, best practices, and structural
 * requirements for each content type. They are injected into the AI prompt
 * to ensure platform-appropriate output.
 */

export interface DeliverableSpec {
  // Core constraints
  minWords?: number;
  maxWords?: number;
  minCharacters?: number;
  maxCharacters?: number;
  
  // Structure
  structure?: string[];  // Required sections/elements
  
  // Platform-specific guidance
  platformNotes: string;
  
  // Tone/style notes beyond squad assignment
  toneNotes?: string;
  
  // SEO/hashtag guidance
  hashtagGuidance?: string;
  
  // CTA guidance
  ctaGuidance?: string;
}

export const DELIVERABLE_SPECS: Record<string, DeliverableSpec> = {
  // ═══════════════════════════════════════════════════════════════════════════════
  // HERO / ANCHOR CONTENT (Long-Form)
  // ═══════════════════════════════════════════════════════════════════════════════
  'blog_article': {
    minWords: 800,
    maxWords: 2000,
    structure: [
      'Compelling headline (60-70 chars for SEO)',
      'Hook opening paragraph',
      'Subheadings every 200-300 words',
      'Bullet points or numbered lists where appropriate',
      'Conclusion with clear takeaway or CTA'
    ],
    platformNotes: `
BLOG ARTICLE FORMAT:
- Length: 800-2000 words (aim for 1200-1500 for SEO)
- Use H2 subheadings every 200-300 words for scannability
- Include 1-2 internal link opportunities (mark as [INTERNAL LINK: topic])
- Front-load the value — the first 150 words should hook AND inform
- End with a clear CTA or next step
- Write for a 7th-grade reading level (clear, not dumbed down)
    `,
    toneNotes: 'Authoritative but approachable. Educational with brand personality.',
    ctaGuidance: 'End with a soft CTA related to the topic (explore products, subscribe, learn more)'
  },

  'video_script': {
    minWords: 300,
    maxWords: 1500,
    structure: [
      'HOOK (first 5 seconds) — pattern interrupt',
      'INTRO — what this video covers',
      'BODY — main content in 2-4 sections',
      'CTA — what to do next',
      'OUTRO — subscribe/follow reminder'
    ],
    platformNotes: `
VIDEO SCRIPT FORMAT (3-10 minutes):
- Format as a screenplay: [VISUAL] and [VO/DIALOGUE] cues
- Hook in first 5 seconds — this determines 90% of watch time
- Include B-roll suggestions in brackets
- Pace: ~150 words per minute of finished video
- 3 min video ≈ 450 words, 10 min ≈ 1500 words
- Include timestamps for key sections

EXAMPLE FORMAT:
[HOOK - 0:00]
VISUAL: Close-up of product
VO: "What if I told you..."

[INTRO - 0:05]
VISUAL: Host on camera
VO: "Today we're exploring..."
    `,
    toneNotes: 'Conversational, as if speaking to one person. Energy matches brand.',
    ctaGuidance: 'Clear CTA at 80% mark, reminder at end'
  },

  'podcast_script': {
    minWords: 500,
    maxWords: 3000,
    structure: [
      'Cold open/teaser (30 sec)',
      'Intro music/welcome',
      'Topic introduction',
      'Main content (2-4 segments)',
      'Listener question or engagement moment',
      'Wrap-up and CTA',
      'Outro'
    ],
    platformNotes: `
PODCAST SCRIPT FORMAT:
- Conversational tone — write for the ear, not the eye
- Include [PAUSE] markers for dramatic effect
- Include [MUSIC CUE] and [SFX] suggestions
- 15 min episode ≈ 2000 words, 30 min ≈ 4000 words
- Build in "ear breaks" — moments of levity or change of pace
- Reference listeners directly: "You might be wondering..."
    `,
    toneNotes: 'Intimate, like talking to a friend. Personality-forward.',
    ctaGuidance: 'Weave CTA naturally into content, explicit CTA in outro'
  },

  'long_form_sales_letter': {
    minWords: 1500,
    maxWords: 5000,
    structure: [
      'HEADLINE — Big promise or intrigue',
      'OPENING — Enter the conversation in their mind',
      'PROBLEM AGITATION — Stir the pain',
      'SOLUTION REVEAL — Introduce the product',
      'BENEFITS + PROOF — Features become benefits, backed by proof',
      'SOCIAL PROOF — Testimonials, results',
      'OFFER — What they get, bonuses',
      'GUARANTEE — Risk reversal',
      'URGENCY — Why now',
      'CTA — Clear action step',
      'P.S. — Restate key benefit or urgency'
    ],
    platformNotes: `
LONG-FORM SALES LETTER FORMAT (Halbert/Ogilvy style):
- Write as if writing to ONE specific person
- Use "you" constantly — make it personal
- Subheadings should work as a "mini sales letter" if skimmed
- Include a P.S. (most read part after headline)
- Use short paragraphs (1-3 sentences max)
- Bold key phrases for skimmers
- Price should feel like a bargain compared to value built
- Include guarantee early to reduce anxiety
    `,
    toneNotes: 'Direct, personal, urgent but not hype-y. Confident.',
    ctaGuidance: 'Multiple CTAs throughout. Final CTA should be unmissable.'
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // CONVERSION CONTENT (Direct Response / Sales)
  // ═══════════════════════════════════════════════════════════════════════════════
  'email': {
    minWords: 100,
    maxWords: 400,
    structure: [
      'Subject line (40-50 chars ideal)',
      'Preview text (40-90 chars)',
      'Opening hook',
      'Body (1-3 short paragraphs)',
      'CTA button/link',
      'Sign-off'
    ],
    platformNotes: `
SINGLE EMAIL FORMAT:
- Subject line: 40-50 characters (6-10 words), avoid spam triggers
- Preview text: 40-90 characters, extends the subject line intrigue
- Body: 100-400 words (shorter for promo, longer for story-driven)
- One primary CTA — don't split attention
- Mobile-first: short paragraphs, scannable
- Use the recipient's mental state: What are they doing when they open this?
    `,
    toneNotes: 'Personal, like a note from a friend who happens to sell amazing things.',
    ctaGuidance: 'One clear CTA. Button text should be action-oriented (not "Click here")'
  },

  'email_3part': {
    minWords: 300,
    maxWords: 800,
    structure: [
      'EMAIL 1: Welcome/Value — introduce brand, give immediate value',
      'EMAIL 2: Story/Connection — share origin or customer story',
      'EMAIL 3: Invitation — soft offer with clear benefit'
    ],
    platformNotes: `
3-PART EMAIL SEQUENCE FORMAT:
Deliver as 3 separate emails with clear labels.

EMAIL 1 (Day 0): THE WELCOME
- 100-200 words
- Immediate value (tip, resource, insight)
- Set expectations for what's coming
- No hard sell

EMAIL 2 (Day 2-3): THE CONNECTION
- 150-250 words  
- Share a story (brand origin, customer transformation)
- Build emotional connection
- Light product mention if relevant

EMAIL 3 (Day 5-7): THE INVITATION
- 150-250 words
- Clear offer with specific benefit
- Urgency element (limited time, quantity)
- Strong CTA
    `,
    ctaGuidance: 'Email 1: Explore. Email 2: Learn more. Email 3: Buy/Act now.'
  },

  'email_5part': {
    minWords: 500,
    maxWords: 1200,
    platformNotes: `
5-PART EMAIL SEQUENCE FORMAT:
EMAIL 1: Welcome + Immediate Value
EMAIL 2: Origin Story / Why This Exists
EMAIL 3: Social Proof / Customer Story
EMAIL 4: Overcome Objections / FAQ
EMAIL 5: Final Invitation + Urgency

Each email: 100-250 words. Space 2-3 days apart.
    `
  },

  'email_7part': {
    minWords: 700,
    maxWords: 1800,
    platformNotes: `
7-PART EMAIL SEQUENCE FORMAT:
EMAIL 1: Welcome + Value
EMAIL 2: Problem Awareness
EMAIL 3: Solution Introduction
EMAIL 4: Proof / Testimonials  
EMAIL 5: Address Objections
EMAIL 6: Future Pacing (imagine life with this)
EMAIL 7: Final Call + Urgency

Each email: 100-250 words. Space 1-2 days apart for launches, 2-3 for evergreen.
    `
  },

  'email_newsletter': {
    minWords: 200,
    maxWords: 600,
    structure: [
      'Subject line',
      'Preview text',
      'Personal greeting/hook',
      'Main content (1-2 topics)',
      'Quick hits/links section (optional)',
      'Sign-off with personality'
    ],
    platformNotes: `
NEWSLETTER FORMAT:
- Consistent voice and format subscribers recognize
- 200-600 words (respect their time)
- One main topic/story + 2-3 quick links
- Include personal touches (what you're thinking, reading, excited about)
- End with a question to drive replies
    `,
    toneNotes: 'Like a smart friend sharing insights over coffee.'
  },

  'email_subject_lines': {
    platformNotes: `
EMAIL SUBJECT LINE FORMAT:
Generate 10 variations in these styles:
1-2: Curiosity gap (What happened when...)
3-4: Benefit-driven (Get X without Y)
5-6: Personal/conversational (I noticed something...)
7-8: Urgency/scarcity (Last chance, Only X left)
9-10: Pattern interrupt (unexpected, emoji, lowercase)

RULES:
- 40-50 characters ideal (6-10 words)
- Avoid: FREE, !!!, ALL CAPS, "Act now"
- Test: Would YOU open this from a stranger?
- Include preview text suggestion for top 3
    `
  },

  'ad_copy': {
    minWords: 20,
    maxWords: 150,
    structure: [
      'Primary text (125 chars for Facebook, displays fully)',
      'Headline (40 chars)',
      'Description (30 chars)',
      'CTA button recommendation'
    ],
    platformNotes: `
AD COPY FORMAT (Meta/Facebook/Instagram Ads):
- Primary text: 125 characters visible, 500 max (hook must be in first 125)
- Headline: 40 characters (appears below image)
- Description: 30 characters (optional, below headline)

Generate 3 variations:
1. BENEFIT-LED: Lead with transformation
2. PROBLEM-LED: Call out the pain point  
3. CURIOSITY-LED: Create intrigue

For each variation provide:
- Primary text
- Headline
- Description
- Suggested CTA button (Shop Now, Learn More, Get Offer)
    `,
    toneNotes: 'Scroll-stopping. Speak to ONE person with ONE problem.',
    ctaGuidance: 'Match CTA to funnel stage (awareness = Learn More, conversion = Shop Now)'
  },

  'landing_page_copy': {
    minWords: 400,
    maxWords: 1500,
    structure: [
      'HERO: Headline + subheadline + CTA',
      'PROBLEM: Agitate the pain',
      'SOLUTION: Introduce product as answer',
      'BENEFITS: 3-5 key benefits with proof',
      'SOCIAL PROOF: Testimonials, logos, numbers',
      'HOW IT WORKS: Simple 3-step process',
      'FAQ: Top 3-5 objections answered',
      'FINAL CTA: Restate value + action'
    ],
    platformNotes: `
LANDING PAGE FORMAT:
- Above the fold: Headline, subheadline, CTA, hero image suggestion
- Organize in clear sections with [SECTION: Name] markers
- Include [IMAGE SUGGESTION: description] for visual elements
- Write mobile-first — every section should work on small screens
- Include micro-copy for buttons and form fields
    `,
    ctaGuidance: 'Repeat CTA after every major section. Button text = outcome ("Start My Trial" not "Submit")'
  },

  'website_hero_copy': {
    maxWords: 50,
    structure: [
      'Headline (8-12 words)',
      'Subheadline (15-25 words)',
      'CTA button text (2-4 words)'
    ],
    platformNotes: `
WEBSITE HERO FORMAT:
Generate 3 variations:

HEADLINE (8-12 words max):
- Clear > clever (but clever + clear is best)
- Promise a transformation or call out the audience
- No jargon

SUBHEADLINE (15-25 words):
- Expand on the headline
- Add specificity or proof
- Address "for whom"

CTA BUTTON (2-4 words):
- Action + outcome oriented
- Examples: "Explore the Collection", "Start Your Journey", "Shop Now"
    `,
    toneNotes: 'Bold, confident, clear. This is your 5-second pitch.'
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // PRODUCT & BRAND CONTENT
  // ═══════════════════════════════════════════════════════════════════════════════
  'product_description': {
    minWords: 100,
    maxWords: 400,
    structure: [
      'Hook headline',
      'Sensory/benefit-driven opening',
      'Key features as benefits',
      'Use cases or occasions',
      'Technical details/specs',
      'Ingredients or materials (if applicable)'
    ],
    platformNotes: `
PRODUCT DESCRIPTION FORMAT:
- Opening: Lead with the experience, not the specs
- Middle: Features → Benefits → Proof
- End: Practical details (size, ingredients, care)
- Use bullet points for scannable specs
- Include sensory language (what it feels/smells/looks like)
- SEO: Include relevant keywords naturally
    `,
    toneNotes: 'Blend romance with information. Make them FEEL, then TRUST.',
  },

  'product_story': {
    minWords: 200,
    maxWords: 600,
    platformNotes: `
PRODUCT STORY FORMAT:
- Open with the origin moment (discovery, inspiration, problem)
- Take the reader on a journey
- Include specific sensory details
- Connect to larger meaning/values
- End with invitation to experience it themselves
- This is Peterman style: romantic, evocative, literary
    `,
    toneNotes: 'Narrative, sensory, transporting. As if describing a journey.'
  },

  'collection_page_copy': {
    minWords: 50,
    maxWords: 200,
    structure: [
      'Collection title',
      'Evocative intro paragraph (50-100 words)',
      'What unites this collection',
      'Who it\'s for or when to use'
    ],
    platformNotes: `
COLLECTION PAGE FORMAT:
- Short and evocative (50-200 words)
- Set the mood for the entire collection
- Don't describe individual products — describe the world they create
- End with subtle shopping direction
    `
  },

  'brand_story_page': {
    minWords: 300,
    maxWords: 800,
    structure: [
      'Opening hook — the moment of origin',
      'The problem/gap we saw',
      'Our solution/approach',
      'Values and beliefs',
      'Where we are today',
      'Invitation to join the journey'
    ],
    platformNotes: `
BRAND STORY / ABOUT PAGE FORMAT:
- This is your origin story — make it compelling
- Include the founder's voice if appropriate
- Balance "we" with "you" — it's about the customer too
- Include specific moments and details (not just values)
- End with forward momentum — where you're going
    `,
    toneNotes: 'Authentic, passionate, specific. Avoid generic "we believe in quality."'
  },

  'faq_page_copy': {
    minWords: 300,
    maxWords: 1000,
    structure: [
      '10-20 Q&As covering:',
      '- Product questions (ingredients, usage)',
      '- Shipping and returns',
      '- Brand/values questions',
      '- Comparison questions'
    ],
    platformNotes: `
FAQ FORMAT:
- Generate 10-20 Q&As
- Write questions as customers actually ask them (natural language)
- Answers: 2-4 sentences, direct, helpful
- Include personality — FAQs don't have to be boring
- End answers with next step when relevant
- Group by category if over 10 questions
    `,
    toneNotes: 'Helpful and clear, with brand personality. Not robotic.'
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // SOCIAL MEDIA — PLATFORM SPECIFIC
  // ═══════════════════════════════════════════════════════════════════════════════
  'instagram_post': {
    maxCharacters: 2200,
    structure: [
      'Hook (first line visible)',
      'Body (story/value)',
      'CTA or question',
      'Hashtags (optional)'
    ],
    platformNotes: `
INSTAGRAM POST FORMAT:
- Caption: Up to 2,200 characters, but first 125 are visible before "more"
- HOOK FIRST LINE: This determines if they expand
- Use line breaks for readability
- End with question or CTA to drive comments
- Hashtags: 5-15 relevant tags (can put in comments or end of caption)

CAPTION STRUCTURE:
Line 1: Hook (curiosity, bold statement, question)
Line 2-3: Empty or minimal (creates white space)
Body: Tell the story, deliver value
Final lines: CTA + hashtags

CONTENT TYPES THAT WORK:
- Behind the scenes
- Customer stories
- Educational tips
- Product in context (lifestyle)
- Personal/founder moments
    `,
    hashtagGuidance: '5-15 hashtags. Mix: 3-5 niche, 3-5 medium (10k-500k), 2-3 broad',
    toneNotes: 'Conversational, visual-language, lifestyle-focused.',
    ctaGuidance: 'Ask a question, invite to save/share, or direct to link in bio'
  },

  'instagram_carousel': {
    structure: [
      'Slide 1: Hook/Title (make them swipe)',
      'Slides 2-9: Content (one point per slide)',
      'Final slide: CTA + summary'
    ],
    platformNotes: `
INSTAGRAM CAROUSEL FORMAT:
- 2-10 slides (7-8 is sweet spot)
- Slide 1: HOOK — must compel the swipe
- Each slide: ONE main point, large readable text
- Final slide: CTA (Save this, Share with someone who needs this, Link in bio)
- Caption: Summarize + add context not on slides

PROVIDE:
- Slide-by-slide text content
- Caption text
- Hashtags

CAROUSEL TYPES THAT WORK:
- Educational (5 tips for...)
- Storytelling (The story of...)
- Before/after
- Myth-busting
- Step-by-step tutorial
    `,
    toneNotes: 'Punchy, scannable. One idea per slide.',
    ctaGuidance: 'Final slide CTA: Save, Share, Comment, or Link in Bio'
  },

  'instagram_reel_script': {
    minWords: 30,
    maxWords: 150,
    structure: [
      'HOOK (0-3 sec): Pattern interrupt',
      'BODY (3-45 sec): Main content',
      'CTA (last 5 sec): What to do'
    ],
    platformNotes: `
INSTAGRAM REEL SCRIPT FORMAT (15-60 seconds):
- HOOK IN FIRST 3 SECONDS — this is everything
- Total: 15-60 seconds (30-45 is sweet spot)
- Format as timed script with visual cues

STRUCTURE:
[0:00-0:03] HOOK
Text on screen: "..."
VO/Action: ...

[0:03-0:25] BODY
Text: ...
VO/Action: ...

[0:25-0:30] CTA
Text: ...
VO: ...

HOOK FORMULAS:
- "Stop scrolling if..."
- "POV: [relatable situation]"
- "The [product] that changed my..."
- Start mid-action (no intros)
    `,
    toneNotes: 'Energetic, authentic, native to platform. Not polished/corporate.',
    ctaGuidance: 'Follow for more, Save this, Link in bio, Comment [word]'
  },

  'facebook_post': {
    maxCharacters: 63206,
    maxWords: 400,
    platformNotes: `
FACEBOOK POST FORMAT:
- More text-friendly than Instagram (longer captions work)
- First 3 lines visible before "See more"
- Community/conversation focused
- Questions perform well
- Stories and longer narratives work here

BEST PRACTICES:
- Hook in first line
- 100-400 words typical (can go longer for stories)
- End with question to drive comments
- Less hashtag-dependent than Instagram
- Native video/images perform best

CONTENT THAT WORKS:
- Personal stories
- Asking for opinions
- Behind the scenes
- User-generated content shares
- Local/community focused
    `,
    toneNotes: 'Community-focused, conversational, authentic.',
    ctaGuidance: 'Drive comments with questions. "What do you think?" "Have you experienced this?"'
  },

  'linkedin_post': {
    maxCharacters: 3000,
    maxWords: 300,
    structure: [
      'Hook line (appears before "see more")',
      'Story or insight',
      'Key takeaway',
      'Question or CTA'
    ],
    platformNotes: `
LINKEDIN POST FORMAT:
- Up to 3,000 characters
- First ~140 characters visible before "see more"
- HOOK IS CRUCIAL — professional but intriguing
- Use line breaks liberally (single-line paragraphs)
- End with question to drive comments

STRUCTURE THAT WORKS:
Hook line (bold statement or question)
↳ Single line break
Story or context (2-3 short paragraphs)
↳ Single line break  
The insight or lesson
↳ Single line break
Question for engagement

CONTENT THAT WORKS:
- Professional lessons learned
- Industry insights
- Career stories
- Hot takes (thoughtful, not inflammatory)
- Behind the scenes of business building
    `,
    toneNotes: 'Professional but personal. Thought leadership without jargon.',
    hashtagGuidance: '3-5 relevant hashtags max. Professional/industry focused.',
    ctaGuidance: 'Ask for opinions, invite to share experiences, or tag relevant people'
  },

  'linkedin_article': {
    minWords: 800,
    maxWords: 2000,
    structure: [
      'Compelling headline',
      'Hook opening',
      'Subheadings every 200-300 words',
      'Key takeaways or bullet points',
      'Conclusion with insight',
      'Author bio/CTA'
    ],
    platformNotes: `
LINKEDIN ARTICLE FORMAT:
- 800-2000 words (1200-1500 ideal)
- Appears in LinkedIn's publishing platform
- More formal than posts but still personal
- Include subheadings for scannability
- Can include images (suggest placements)

STRUCTURE:
- Headline: Clear + intriguing (not clickbait)
- Opening: Hook + thesis
- Body: 3-5 main sections with subheads
- Conclusion: Key insight + next steps
- End with question or invitation to connect
    `,
    toneNotes: 'Authoritative, insightful, professional. Demonstrates expertise.'
  },

  'twitter_post': {
    maxCharacters: 280,
    platformNotes: `
TWITTER/X POST FORMAT:
- 280 characters max
- Every character counts
- Generate 5 variations:
  1. Hot take / bold opinion
  2. Question that invites reply
  3. Observation / insight
  4. Quote-worthy statement
  5. Curiosity hook

BEST PRACTICES:
- Front-load the punch
- Use "you" to make it personal
- Leave room for RT quotes (under 240 chars)
- No hashtags in main tweet (or 1 max)
    `,
    toneNotes: 'Punchy, opinionated, conversational. Like texting a smart friend.',
    ctaGuidance: 'Implicit CTAs work best. Questions > "click here"'
  },

  'twitter_thread': {
    structure: [
      'Tweet 1: HOOK (must stand alone)',
      'Tweets 2-7: Main content (1 point per tweet)',
      'Final tweet: Summary + CTA'
    ],
    platformNotes: `
TWITTER/X THREAD FORMAT:
- 8-15 tweets ideal
- Tweet 1 MUST hook AND make sense alone (gets shared)
- Each tweet: 280 chars, one complete thought
- Number tweets: "1/" "2/" etc.
- Final tweet: Recap + CTA (follow, retweet, share)

STRUCTURE:
Tweet 1: [HOOK] - Bold claim or question
Tweet 2-3: Context/setup
Tweet 4-7: Main points (one per tweet)
Tweet 8-9: Examples or proof
Final: Recap + CTA

THREAD FORMULAS:
- "X things I learned about Y"
- "The story of [specific event]"
- "Unpopular opinion: [take]"
- "A thread on [topic]:"
    `,
    toneNotes: 'Punchy, scannable. Each tweet could be a standalone insight.',
    ctaGuidance: 'Final tweet: "If this was helpful, RT the first tweet" or "Follow for more"'
  },

  'tiktok_script': {
    minWords: 30,
    maxWords: 100,
    structure: [
      'HOOK (0-3 sec): Stop the scroll',
      'BODY (3-45 sec): Deliver value fast',
      'CTA (last 2-3 sec): Follow/comment'
    ],
    platformNotes: `
TIKTOK SCRIPT FORMAT (15-60 seconds):
- HOOK IN FIRST 1-3 SECONDS — you have ONE chance
- Fast paced — no slow intros
- Text on screen is expected
- Speak directly to camera (first person)

FORMAT:
[0:00-0:03] HOOK
Text overlay: "..."
VO: "..."

[0:03-0:45] BODY  
Text: ...
VO: ...

[0:45-0:60] CTA
Text: "Follow for more" / "Link in bio"
VO: ...

HOOK FORMULAS THAT WORK:
- "I need to tell you about..."
- "This [product] is a game changer"
- "POV: [relatable scenario]"
- Start mid-sentence/action
- "Wait for it..."
- Controversial opinion

AVOID:
- "Hey guys!" (instant scroll)
- Slow intros
- Over-produced content
    `,
    toneNotes: 'Raw, authentic, energetic. Native to platform = unpolished.',
    ctaGuidance: 'Follow for more, Comment [word], Save this, Link in bio'
  },

  'youtube_description': {
    minWords: 100,
    maxWords: 500,
    structure: [
      'First 2 lines: Summary (shows in search)',
      'Timestamps for sections',
      'Links and resources mentioned',
      'About section',
      'Social links',
      'Hashtags (3-5)'
    ],
    platformNotes: `
YOUTUBE DESCRIPTION FORMAT:
- First 150 characters show in search — front-load keywords and hook
- Include timestamps for sections (helps SEO + UX)
- Include relevant links
- 3-5 hashtags at end

STRUCTURE:
[Lines 1-2] Hook + keywords (visible in search)

[Timestamps]
0:00 - Intro
0:45 - [Section 1]
2:30 - [Section 2]
...

[Links]
🔗 [Resource 1]: link
🔗 [Resource 2]: link

[About]
Brief channel/brand description

[Connect]
📱 Instagram: @handle
🌐 Website: url

#hashtag1 #hashtag2 #hashtag3
    `,
    toneNotes: 'Helpful, organized, keyword-rich without being spammy.'
  },

  'pinterest_pin': {
    maxCharacters: 500,
    structure: [
      'Title (100 chars max)',
      'Description (500 chars max)'
    ],
    platformNotes: `
PINTEREST PIN FORMAT:
- Title: Up to 100 characters (front-load keywords)
- Description: Up to 500 characters
- Pinterest is a SEARCH engine — keywords matter

TITLE FORMULA:
[Primary Keyword] + [Benefit] + [Descriptor]
Example: "Frankincense Oil Benefits for Glowing Skin | Natural Skincare"

DESCRIPTION:
- Front-load primary keywords
- Include secondary keywords naturally
- End with soft CTA
- No hashtags needed (Pinterest doesn't use them for discovery)
- Include relevant categories

PROVIDE:
- Title (100 chars)
- Description (500 chars)
- Board suggestion
- Alt text suggestion
    `,
    toneNotes: 'Aspirational, helpful, keyword-rich. Think: "I want to try this."'
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // MICRO CONTENT (Hooks, Quotes, Testimonials)
  // ═══════════════════════════════════════════════════════════════════════════════
  'quote_hook_generator': {
    platformNotes: `
QUOTE/HOOK GENERATOR FORMAT:
Generate 10 standalone quotes or hooks.

CATEGORIES:
1-3: Inspirational/aspirational
4-6: Educational/insight
7-8: Provocative/pattern interrupt  
9-10: Personal/relatable

EACH QUOTE:
- 10-25 words
- Can stand alone (shareable)
- Brand-aligned tone
- Quotable (would look good as graphic)

ALSO PROVIDE:
- Suggested visual treatment (typography, background)
- Best platform for each quote
    `,
    toneNotes: 'Quotable, shareable, memorable. Think: would someone save this?'
  },

  'customer_testimonial_story': {
    minWords: 150,
    maxWords: 400,
    structure: [
      'The BEFORE: Life/problem before product',
      'The DISCOVERY: How they found you',
      'The EXPERIENCE: Using the product',
      'The TRANSFORMATION: Life now',
      'The RECOMMENDATION: Who should try it'
    ],
    platformNotes: `
CUSTOMER TESTIMONIAL STORY FORMAT:
Transform raw feedback into a narrative story.

STRUCTURE:
1. BEFORE: "Before [product], I was..."
2. DISCOVERY: "I found [brand] when..."  
3. EXPERIENCE: "What surprised me was..."
4. TRANSFORMATION: "Now I..."
5. RECOMMENDATION: "I'd tell anyone who..."

PROVIDE:
- Full narrative version (150-400 words)
- Pull quote (1-2 sentences)
- Social media snippet version
- Key benefit highlighted
    `,
    toneNotes: 'Authentic, specific, transformational. Real voice, real details.'
  },

  'tagline_generator': {
    platformNotes: `
TAGLINE GENERATOR FORMAT:
Generate 10 tagline variations.

CATEGORIES:
1-2: Benefit-focused (What you get)
3-4: Emotional (How you feel)
5-6: Differentiator (Why us)
7-8: Clever/memorable (Wordplay, rhythm)
9-10: Aspirational (Who you become)

EACH TAGLINE:
- 3-8 words
- Easy to say aloud
- Memorable/quotable
- Brand-aligned

ALSO RATE EACH:
- Clarity (1-5)
- Memorability (1-5)
- Best use case (ads, packaging, social, etc.)
    `
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // VISUALS & CREATIVE
  // ═══════════════════════════════════════════════════════════════════════════════
  'campaign_concept_visual': {
    structure: [
      'Campaign name',
      'Core concept/theme',
      'Visual direction',
      'Copy direction',
      'Channel execution ideas'
    ],
    platformNotes: `
CAMPAIGN CONCEPT FORMAT:
Creative brief for a cohesive campaign.

INCLUDE:
1. CAMPAIGN NAME: Working title
2. CONCEPT: Core creative idea in 1-2 sentences
3. KEY MESSAGE: What we want people to remember
4. VISUAL DIRECTION: Mood, colors, imagery style
5. COPY DIRECTION: Tone, key phrases, messaging pillars
6. CHANNEL BREAKDOWN:
   - Social (how it appears on IG, FB, etc.)
   - Email (subject line + preview)
   - Paid ads (headline + primary text)
   - Website (landing page headline)
7. HASHTAG: Campaign hashtag suggestion
    `
  },

  'ad_creative_prompt': {
    platformNotes: `
AD CREATIVE BRIEF FORMAT:
Brief for visual ad creation.

PROVIDE:
1. CONCEPT: Visual idea in 1 sentence
2. FORMAT: Static, video, carousel
3. IMAGERY: What should be shown
4. TEXT OVERLAY: Any text on the image
5. COPY: Primary text, headline, description
6. CTA: Button recommendation
7. MOOD: Lighting, color, energy level
8. REFERENCE: "Think [brand/campaign] meets [other reference]"
    `
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // AI IMAGE GENERATION
  // ═══════════════════════════════════════════════════════════════════════════════
  'visual-asset': {
    platformNotes: `
AI IMAGE GENERATION FORMAT:

VISUAL SQUADS (choose one based on brief):

THE MINIMALISTS (AVEDON_ISOLATION):
- Pure white or neutral backgrounds
- Clinical, precise lighting (soft directional from top-left)
- Product as hero, no distractions
- Best for: Product pages, luxury items, e-commerce, Amazon
- Prompt style: "[Product] centered on pure white background, soft directional light, hyperrealistic, 8k --ar 1:1 --style raw"

THE STORYTELLERS (LEIBOVITZ_ENVIRONMENT):
- Natural settings, environmental context
- Warm window light, golden hour aesthetic
- Lifestyle integration with props
- Best for: Instagram, brand story, fragrance, candles
- Prompt style: "[Product] in natural setting, soft window light, warm color grading, editorial, magazine quality --ar 4:5"

THE DISRUPTORS (RICHARDSON_RAW / ANDERSON_SYMMETRY):
Richardson: Direct flash, high contrast, raw energy, 90s aesthetic
Anderson: Hyper-symmetry, bold colors, perfectly centered
- Best for: Social ads, TikTok, scroll-stopping content
- Richardson style: "[Product] direct flash, high contrast, raw aesthetic --ar 9:16"
- Anderson style: "[Product] overhead flat lay, perfect symmetry, bold [color] background --ar 1:1"

ASPECT RATIOS BY PLATFORM:
- Instagram Feed: 1:1 or 4:5
- Instagram Story/Reel: 9:16
- Facebook Feed: 1:1 or 4:5
- Pinterest: 2:3
- Product Page: 1:1
- Hero Banner: 16:9 or 21:9
- Amazon: 1:1 (white background required)

PROMPT STRUCTURE:
[Subject] + [Style reference] + [Composition] + [Lighting] + [Color/mood] + [--ar X:X] + [--style raw]

NEGATIVE PROMPTS (add to avoid):
--no text --no watermark --no logo --no hands (if applicable)
    `,
    structure: [
      'Subject description',
      'Visual squad/master style',
      'Composition (centered, rule of thirds, overhead)',
      'Lighting direction',
      'Color palette/mood',
      'Aspect ratio parameter',
      'Negative prompts'
    ],
    toneNotes: 'Be specific about materials, textures, lighting angles. Avoid vague words like "beautiful" or "nice."'
  },

  'image_prompt': {
    platformNotes: `
IMAGE PROMPT / RECIPE FORMAT:
Save a reusable image prompt template for consistent visual output.

PROVIDE:
1. FULL PROMPT: Complete prompt with [PRODUCT] placeholder for reuse
2. VISUAL MASTER: Which style this follows (Avedon, Leibovitz, Richardson, Anderson)
3. BEST USE CASES: When to use this recipe
4. VARIATIONS: 2-3 tweaks for different moods
5. NEGATIVE PROMPT: What to exclude

EXAMPLE:
---
PROMPT: [PRODUCT] on weathered marble surface, soft diffused natural light from window, editorial product photography, muted earth tones, film grain, 85mm lens aesthetic --ar 4:5 --style raw --no harsh shadows

MASTER: Leibovitz Environment (Storytellers)
USE FOR: Instagram feed, product story, fragrance/skincare

VARIATIONS:
• Swap marble for aged wood → warmer, rustic
• Add botanical elements → organic/natural brands
• Change to 1:1 → e-commerce ready

NEGATIVE: clinical, pure white background, flash, sterile
---
    `
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // ANNOUNCEMENTS & PR
  // ═══════════════════════════════════════════════════════════════════════════════
  'launch_announcement': {
    minWords: 100,
    maxWords: 300,
    structure: [
      'Headline',
      'The news (what)',
      'Why it matters (so what)',
      'Availability (when/where)',
      'CTA'
    ],
    platformNotes: `
LAUNCH ANNOUNCEMENT FORMAT:
- Lead with the news
- Create excitement without hype
- Include practical details (when, where, how much)
- Clear CTA

PROVIDE:
1. Email version (200-300 words)
2. Social media version (Instagram/Facebook caption)
3. Press snippet (2-3 sentences for PR)
4. Subject line options (3)
    `,
    toneNotes: 'Excited, newsworthy, clear. Make it feel like an event.'
  },

  'press_release': {
    minWords: 300,
    maxWords: 600,
    structure: [
      'Headline',
      'Subheadline',
      'Dateline (City, Date)',
      'Lead paragraph (who, what, when, where, why)',
      'Quote from spokesperson',
      'Supporting details',
      'Boilerplate (about the company)',
      'Media contact'
    ],
    platformNotes: `
PRESS RELEASE FORMAT (AP Style):
- Write in third person
- Inverted pyramid (most important info first)
- Include a compelling quote
- Keep to one page (300-600 words)

STRUCTURE:
FOR IMMEDIATE RELEASE

HEADLINE (Title Case, Not All Caps)
Subheadline in sentence case

CITY, State, Date — Lead paragraph with who, what, when, where, why.

Second paragraph with supporting details.

"Quote from company spokesperson or founder," said [Name], [Title] at [Company]. "Second sentence of quote."

Additional context and details.

About [Company Name]
[2-3 sentence company description]

Media Contact:
[Name]
[Email]
[Phone]
    `,
    toneNotes: 'Professional, factual, newsworthy. AP style.'
  },

  'sms_campaign_copy': {
    maxCharacters: 160,
    platformNotes: `
SMS CAMPAIGN FORMAT:
- 160 characters max (longer = 2 messages = higher cost)
- Include brand name for recognition
- Clear CTA with link
- Comply with regulations (opt-out available)

GENERATE 5 VARIATIONS:
1. Urgency/scarcity focused
2. Benefit focused
3. Curiosity focused
4. Exclusive/VIP tone
5. Casual/friendly

EACH MESSAGE:
- Under 160 characters
- Includes [BRAND NAME]
- Includes [LINK] placeholder
- Clear action

EXAMPLE:
[BRAND]: Your exclusive 20% off expires tonight ✨ Shop now: [LINK] Reply STOP to opt out
    `,
    toneNotes: 'Direct, personal, urgent. Like a text from a friend with good news.',
    ctaGuidance: 'Single clear action. Shop now, Claim offer, etc.'
  }
};

/**
 * Get format specifications for a content type
 */
export function getDeliverableSpec(contentType: string): DeliverableSpec | null {
  return DELIVERABLE_SPECS[contentType] || null;
}

/**
 * Build a format instruction string for AI prompts
 */
export function buildFormatInstructions(contentType: string): string {
  const spec = getDeliverableSpec(contentType);
  
  if (!spec) {
    return '';
  }
  
  const parts: string[] = [];
  
  // Add the main platform notes
  if (spec.platformNotes) {
    parts.push('═══ FORMAT REQUIREMENTS ═══');
    parts.push(spec.platformNotes.trim());
  }
  
  // Add constraints
  const constraints: string[] = [];
  if (spec.minWords) constraints.push(`Minimum: ${spec.minWords} words`);
  if (spec.maxWords) constraints.push(`Maximum: ${spec.maxWords} words`);
  if (spec.minCharacters) constraints.push(`Minimum: ${spec.minCharacters} characters`);
  if (spec.maxCharacters) constraints.push(`Maximum: ${spec.maxCharacters} characters`);
  
  if (constraints.length > 0) {
    parts.push('\nLENGTH CONSTRAINTS:');
    parts.push(constraints.join(' | '));
  }
  
  // Add structure if present
  if (spec.structure && spec.structure.length > 0) {
    parts.push('\nREQUIRED STRUCTURE:');
    spec.structure.forEach((item, i) => {
      parts.push(`${i + 1}. ${item}`);
    });
  }
  
  // Add tone notes
  if (spec.toneNotes) {
    parts.push(`\nTONE: ${spec.toneNotes}`);
  }
  
  // Add hashtag guidance
  if (spec.hashtagGuidance) {
    parts.push(`\nHASHTAGS: ${spec.hashtagGuidance}`);
  }
  
  // Add CTA guidance
  if (spec.ctaGuidance) {
    parts.push(`\nCTA GUIDANCE: ${spec.ctaGuidance}`);
  }
  
  return parts.join('\n');
}
