-- ═══════════════════════════════════════════════════════════════════════════════
-- MADISON ARCHITECTURE - SEED MASTER DOCUMENTS
-- ═══════════════════════════════════════════════════════════════════════════════
-- 
-- Seeds the Three Silos with initial data:
--   Silo A: Copy Masters, Visual Masters, Schwartz Templates
--
-- Created: December 10, 2025
-- Version: 1.0
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- COPY MASTERS (Silo A)
-- ═══════════════════════════════════════════════════════════════════════════════

-- THE SCIENTISTS Squad
INSERT INTO public.madison_masters (master_name, squad, full_content, summary, forbidden_language, example_output, metadata)
VALUES (
  'OGILVY_SPECIFICITY',
  'THE_SCIENTISTS',
  E'# David Ogilvy — Specificity & Proof

## Philosophy
Trust is earned through specificity, data, and logical proof. The more you tell, the more you sell.

## Core Principles

### 1. "The More You Tell, The More You Sell"
- Replace vague claims with vivid, factual detail
- If you can count it, trace it, weigh it, or date it—say it
- Specificity = authority = trust

### 2. Research Before Rhetoric
- Every line should show you understand the product better than anyone
- Include provenance, processes, tests, approvals, waiting periods
- Know the product intimately before writing a word

### 3. Visual Specificity
- Use details that create imagery: textures, temperatures, craft motions
- "Pearl buttons 1/8" thick, leather seams with 14 stitches per inch"
- Make readers SEE the quality

### 4. Authority Without Arrogance
- Confident tone, never boastful
- Let the facts do the persuasive work
- State claims calmly—proof creates its own emphasis

### 5. Benefit Hierarchy
- Lead with the benefit that matters most to the reader
- Then prove it with specific data
- Then explain the mechanism

## Signature Techniques

### Data-Driven Leads
"Aged eighteen months before blending."
"Contains 12% niacinamide to reduce redness in 4 hours."

### Research Snippets
"Third-party burn chamber certified."
"Clinical study of 200 subjects, peer-reviewed."

### Quote Authority
Reference master perfumers, lab directors, artisans.
"Our head chemist has 30 years at L''Oréal research labs."

### Side-by-Side Proof
"24-hour cure vs 6-hour industry standard."
"Our formula: 8 active ingredients. Theirs: 3."

## Structure Guidelines

### Rhythm
- Use precise sentences of varied length
- Avoid fluff—every word earns its place
- Pair each descriptive sentence with a proof sentence

### Format
- Subheads or bolded lead-ins when copy gets dense
- Numbers formatted consistently (percentages, times, quantities)
- White space for readability

## Example Transformation

**Before (Generic):**
"Our candles are premium and long-lasting."

**After (Ogilvy):**
"Each Atlas candle is poured in micro-batches of 48 and test-burned for 60 hours. The soy-coconut wax blend cures for four full days before a single wick is trimmed, so the flame stays even long after cheaper blends tunnel out."

## Quality Checklist
- [ ] Does every claim contain a specific proof (time, origin, quantity, method)?
- [ ] Can a competitor copy this line honestly? If yes, add more specificity
- [ ] Did you show, not tell, why it costs more?
- [ ] Are the details vivid enough to picture?
- [ ] Is the tone confident and calm—no hype needed?

## When to Use Ogilvy
- Product pages that must earn trust fast
- Headlines and hero sections
- Copy that needs more substance, less adjective
- Anytime a claim risks sounding generic or unproven
- High-price products ($100+) for skeptical audiences',
  'Trust through specificity. Replace vague claims with vivid, factual detail. Data-driven leads, research snippets, side-by-side proof.',
  ARRAY['vague', 'amazing', 'incredible', 'soul', 'journey', 'embrace', 'whimsical', 'wandering', 'poetic', 'mysterious', 'enchanting', 'dreamy', 'ethereal', 'magical', 'transcendent'],
  E'**Product:** $180 Anti-Aging Serum

Retinol Without the Redness

For years, dermatologists recommended retinol for wrinkles—but sensitive skin couldn''t tolerate it.

Our encapsulated retinol delivers 0.5% pure tretinoin gradually over 8 hours. This eliminates the irritation while maintaining clinical efficacy.

In a 12-week study of 200 subjects:
- 87% saw reduced fine lines
- 92% experienced zero redness
- Average wrinkle depth reduced by 23%

The formula combines:
→ Time-released retinol (0.5%)
→ Bakuchiol (1%) - plant-based retinol alternative
→ Ceramides (3%) - barrier repair

Dermatologist-tested. Non-irritating. Results in 8 weeks.',
  '{"use_for": ["product_pages", "technical_products", "high_price_items", "skeptical_audiences"], "strength_areas": ["building_trust", "premium_positioning", "clinical_products"], "best_for_stages": ["problem_aware", "solution_aware", "product_aware"]}'::jsonb
)
ON CONFLICT (master_name) DO UPDATE SET
  full_content = EXCLUDED.full_content,
  summary = EXCLUDED.summary,
  forbidden_language = EXCLUDED.forbidden_language,
  example_output = EXCLUDED.example_output,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

-- Hopkins - Reason Why (THE_SCIENTISTS)
INSERT INTO public.madison_masters (master_name, squad, full_content, summary, forbidden_language, example_output, metadata)
VALUES (
  'HOPKINS_REASON_WHY',
  'THE_SCIENTISTS',
  E'# Claude Hopkins — Reason-Why Architect

## Philosophy
Every benefit needs a "because." Explain the mechanism, expose the alternative, and respect intelligence.

## Core Principles

### 1. Every Benefit Needs a "Because"
- Follow a claim with the mechanism that makes it true
- "Long-lasting scent because oil-based formulas bond with skin warmth"
- The "why" creates believability

### 2. Explain the Process
- Walk the reader through how it''s made, sourced, tested
- Use chronological or step-based structures
- Process details = proof of quality

### 3. Expose the Alternative
- Contrast your method with the common shortcut
- "Most studios rush pour-and-ship in 24 hours; we wait 96 so the wax cures"
- Show why the easy way fails

### 4. Quantify Whenever Possible
- Time, temperature, distance, volume, iterations
- Numbers serve as proof, not decoration
- Specific > vague, always

### 5. Respect Intelligence
- Share the craft without oversimplifying
- Plain language, precise details
- Readers are smart—treat them that way

## Signature Techniques

### Cause → Effect Sequencing
"Because we age lavender 18 months, the dry-down stays elegant."
"Since the oil penetrates deeper, hydration lasts 12 hours instead of 3."

### Comparison Frames
"While X uses alcohol, we use oils—here''s the difference."
"Most formulas flash off in under three hours. Ours stays put through an entire workday."

### Process Narration
"Harvest → macerate → age → pour. No skipped steps."
Step-by-step builds credibility and visualization.

### Evidence Inserts
Test data, burn hours, lab results, expert quotes.
Third-party validation whenever available.

## Structure Guidelines

### Rhythm
- Medium-length sentences with deliberate pacing
- Use bullet or numbered lists to outline steps when clarity improves
- Alternate descriptive lines with proof lines

### Format
- Process steps can be numbered
- "Because" statements bolded for emphasis
- Contrast sections clearly delineated

## Example Transformation

**Before (Generic):**
"Our moisturizer keeps skin hydrated all day."

**After (Hopkins):**
"Our moisturizer keeps skin hydrated for 12 hours because we suspend glycerin in a lipid blend that slows evaporation. Most formulas flash off in under three hours. Ours stays put through an entire workday."

## Quality Checklist
- [ ] Did every benefit receive a reason-why?
- [ ] Are you teaching the mechanism, not just naming it?
- [ ] Did you contrast with the industry''s default shortcut?
- [ ] Are the numbers and facts believable and concrete?
- [ ] Does the copy feel like a master craftsperson explaining their work?

## When to Use Hopkins
- Copy that leans on craft, science, process, or testing
- Product pages that must justify premium pricing
- Situations where the reader keeps asking "why?" after every claim
- Landing pages and editorials
- Problem-aware and solution-aware audiences',
  'Every benefit needs a "because." Explain mechanisms, expose shortcuts competitors take, quantify everything.',
  ARRAY['romantic', 'whimsical', 'journey', 'embrace', 'soul', 'mysterious', 'enchanting', 'dreamy', 'ethereal', 'magical', 'transcendent', 'wandering'],
  E'**Product:** High-Performance Moisturizer

Why This Moisturizer Lasts 12 Hours (When Others Fade in 3)

The secret is in the delivery system.

Most moisturizers use water-based formulas. Water evaporates. By hour 3, your skin is dry again.

We suspend glycerin in a lipid blend—oils that mirror your skin''s natural barrier. Because these lipids don''t evaporate, the glycerin stays locked in place.

The result: continuous hydration for 12+ hours.

Here''s the process:
1. Glycerin molecules are encapsulated in lipid spheres
2. When applied, body heat releases the glycerin gradually
3. The lipid layer prevents evaporation

Clinical testing confirmed: 94% of users reported all-day hydration. Zero reapplication needed.',
  '{"use_for": ["product_pages", "landing_pages", "editorials", "why_it_works_sections"], "strength_areas": ["justifying_premium", "process_explanation", "mechanism_teaching"], "best_for_stages": ["problem_aware", "solution_aware"]}'::jsonb
)
ON CONFLICT (master_name) DO UPDATE SET
  full_content = EXCLUDED.full_content,
  summary = EXCLUDED.summary,
  forbidden_language = EXCLUDED.forbidden_language,
  example_output = EXCLUDED.example_output,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

-- THE STORYTELLERS Squad
INSERT INTO public.madison_masters (master_name, squad, full_content, summary, forbidden_language, example_output, metadata)
VALUES (
  'PETERMAN_ROMANCE',
  'THE_STORYTELLERS',
  E'# J. Peterman — Romance & Wandering Narrative

## Philosophy
Products aren''t just things—they''re portals to adventure, identity, and possibility. Story first, always.

## Core Principles

### 1. Product = Portal to Identity
- Never sell features—sell the life the customer wants to live
- "The coat said something about me that I wanted said"
- Object as vehicle for becoming your true self

### 2. Story First, Always
- Every product needs a narrative—where it came from, who made it, what world it belongs to
- Compress entire novels into paragraphs
- Create mythology around ordinary objects

### 3. Honesty Within Romance
- Can romanticize without lying
- Admits limitations: "They also remind me of more recent things, which (amazingly) we''ve given up"
- Transparent about sourcing, reproductions, imperfections

### 4. Anti-Corporate Voice
- No jargon, no marketing-speak, no hype
- "We didn''t come into being as the result of some grand, well-thought-out business-school plan"
- Conversational, personal, human

### 5. Assume Sophistication
- Readers are worldly, well-read, curious
- Don''t explain everything—trust intelligence
- References without footnotes

### 6. Sensory Authority
- Describe how things feel, smell, sound, look
- "You couldn''t slip a cigarette paper into the seams where mahogany met steel"
- Physical details create trust

## Signature Techniques

### Second-Person Immersion
"You line up a hundred horsemen in a straight line. Guns, sabers, flags."
Put the reader IN the scene.

### Compressed Biography
"A farmer''s son, growing up in Alberta, Canada, sees a lot of sky. It sets him dreaming. At 16 he''s flying a crop duster. At 23 he''s an RCAF volunteer in the Battle of Britain."

### Sensory Cascade
Layer multiple sensory details: smell of honeysuckle, horses, leather.
Visual → Olfactory → Tactile → Auditory

### The Catalog of Loss
"Peaches worth eating and doctors who make housecalls. Real starch in shirt collars. Bakelite. Books sewn in signatures."

### Historical Miniatures
Brief, vivid historical scenes that connect product to larger story.

### Parenthetical Asides
"(Walking, after all, is what most of us do most of the time.)"
Add intimacy, humor, insider knowledge.

## Structure Guidelines

### The Peterman Architecture

**Phase 1: THE HOOK (First 1-3 sentences)**
- Scene in Progress: "You line up a hundred horsemen..."
- Direct Question: "The question, really, is..."
- Bold Statement: "They are old. They are useless. But they are beautiful."
- Never mentions product

**Phase 2: WORLD-BUILDING (60-70% of copy)**
- Backstory, sensory detail, cultural context
- Character development
- Product emerges naturally

**Phase 3: PRODUCT INTEGRATION (20-30%)**
- Physical description through specifics
- Provenance and function through use
- Identity statement

**Phase 4: THE CLOSE**
- Lingering image or simple statement
- Price and sizing at end
- No hard sell

## DON''T Rules
- ❌ Never use exclamation points
- ❌ Never use marketing jargon
- ❌ Never compare to competitors
- ❌ Never use bullet points
- ❌ Never lead with product name
- ❌ Never pressure or create false urgency
- ❌ Never use testimonials
- ❌ Never oversell

## Example Transformation

**Before (Generic):**
"Our limited edition rose candle is now available."

**After (Peterman):**
"There''s a valley in Bulgaria where roses bloom at dawn.

Not the roses you buy at the store—these are Rosa damascena, the ancient kind, with petals so fragile they must be picked by hand before sunrise.

We traveled there in May. The air was cold, the light was pink, and we understood: this is what rose is supposed to smell like. Not sweet. Not powdered. Green and alive and fleeting.

This candle burns for 60 hours, but that morning in Bulgaria? We''ll never get it back.

Only 200 made. $48."

## When to Use Peterman
- Lifestyle products (fragrance, candles, home goods)
- Luxury goods with heritage/craftsmanship story
- Products for individualists who reject mainstream
- Brand-building, welcome emails, Instagram
- Unaware and most-aware audiences
- Products where customer is buying identity, not just utility',
  'Story-first copywriting. Transport readers to a place, build sensory detail, connect to emotion. Product emerges from narrative, never announced.',
  ARRAY['clinical', 'proven', 'efficacy', 'study', 'subjects', 'formula', 'mechanism', 'active', 'ingredient percentage', 'data', 'tested', 'results'],
  E'**Product:** Limited Edition Rose Candle

There''s a valley in Bulgaria where roses bloom at dawn.

Not the roses you buy at the store—these are Rosa damascena, the ancient kind, with petals so fragile they must be picked by hand before sunrise.

We traveled there in May. The air was cold, the light was pink, and we understood: this is what rose is supposed to smell like. Not sweet. Not powdered. Green and alive and fleeting.

This candle burns for 60 hours, but that morning in Bulgaria? We''ll never get it back.

Only 200 made. $48.',
  '{"use_for": ["lifestyle_products", "fragrance", "candles", "luxury_goods", "brand_building", "instagram", "welcome_emails"], "strength_areas": ["emotional_connection", "identity_selling", "heritage_products"], "best_for_stages": ["unaware", "most_aware"]}'::jsonb
)
ON CONFLICT (master_name) DO UPDATE SET
  full_content = EXCLUDED.full_content,
  summary = EXCLUDED.summary,
  forbidden_language = EXCLUDED.forbidden_language,
  example_output = EXCLUDED.example_output,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

-- Collier - Conversation Hook (THE_STORYTELLERS)
INSERT INTO public.madison_masters (master_name, squad, full_content, summary, forbidden_language, example_output, metadata)
VALUES (
  'COLLIER_CONVERSATION',
  'THE_STORYTELLERS',
  E'# Robert Collier — The Conversation Hook

## Philosophy
Enter the conversation already happening in their mind. Don''t start with your product—start with what they''re already thinking about.

## Core Principles

### 1. Enter the Conversation in Their Mind
- Don''t start with your product
- Start with what they are already thinking about
- Is it the weather? The news? A nagging worry? Join that thought stream first

### 2. The "Mental Wallet"
- People buy because they want to, then justify it with logic
- Appeal to the "will" (desire/emotion) before the "mind" (logic/specs)
- Desire drives, logic justifies

### 3. The Smooth Bridge
- The transition from the "hook" (conversation) to the "pitch" (product) must be invisible
- "And that is exactly why..."
- Reader shouldn''t feel the shift

### 4. Curiosity + Benefit
- Never just tease. Tease a result they want
- "The simple 3-minute habit that doubles focus..." (Curiosity: What habit? Benefit: Double focus)
- Incomplete patterns demand completion

## Signature Techniques

### The "As I Sit Here" Opener
"As I sit here watching the rain lash against the window..."
Sets a mood, creates intimacy, starts with shared moment.

### The Newsjack
"You''ve probably read the headlines about [Topic]. It''s scary. But there''s one thing they missed..."
Current events → your solution.

### The "If... Then" Proposition
"If you are willing to [small action], then I am willing to [big reward]."
Creates mutual commitment frame.

### The Hidden Secret
Implication that others know something the reader doesn''t—yet.
Insider knowledge creates urgency.

## Structure Guidelines

### Rhythm & Structure
- **Opener:** Short, punchy, often a question or observation
- **Body:** Conversational, like a letter to a friend, but with driving logic
- **Transition:** The "Pivot" sentence that connects the opener to the offer
- **Close:** A gentle but firm push to action, framed as "trying" rather than "buying"

## Example Transformation

**Before (Product-First):**
"Our new productivity app helps you organize tasks and get more done. Download it today."

**After (Collier):**
"Have you ever had one of those days where you work hard for eight hours, but at 5:00 PM you look at your list and wonder, ''What did I actually get done?''

It''s a sinking feeling. I used to feel it every Tuesday.

Then I discovered that the problem wasn''t my work ethic. It was the way I was organizing my list.

There is a different way to handle your morning..."

## Quality Checklist
- [ ] Did you start with the reader''s current reality/thoughts?
- [ ] Is the transition from hook to product smooth?
- [ ] Did you appeal to their desire (the "will") before giving the specs?
- [ ] Is the tone personal, intimate, and understanding?
- [ ] Does the opening sentence force them to read the second?

## When to Use Collier
- Email subject lines and opening paragraphs
- Sales letters that need to disarm skepticism immediately
- Connecting a product to a current event, season, or universal feeling
- Bridging the gap between "unaware" and "interested"',
  'Enter the conversation in their mind. Start with what they''re thinking, then bridge smoothly to your product. Appeal to desire before logic.',
  ARRAY['clinical', 'proven', 'efficacy', 'data', 'percentage', 'study', 'tested'],
  E'**Product:** Productivity App

Have you ever had one of those days where you work hard for eight hours, but at 5:00 PM you look at your list and wonder, "What did I actually get done?"

It''s a sinking feeling. I used to feel it every Tuesday.

Then I discovered that the problem wasn''t my work ethic. It was the way I was organizing my list.

Most to-do apps treat all tasks equally. But some tasks drain you while others energize you. When you front-load the draining ones, you''re exhausted by 2 PM.

There is a different way to handle your morning...',
  '{"use_for": ["emails", "subject_lines", "sales_letters", "opening_paragraphs"], "strength_areas": ["disarming_skepticism", "creating_connection", "bridging_awareness"], "best_for_stages": ["unaware", "problem_aware"]}'::jsonb
)
ON CONFLICT (master_name) DO UPDATE SET
  full_content = EXCLUDED.full_content,
  summary = EXCLUDED.summary,
  forbidden_language = EXCLUDED.forbidden_language,
  example_output = EXCLUDED.example_output,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

-- THE DISRUPTORS Squad
INSERT INTO public.madison_masters (master_name, squad, full_content, summary, forbidden_language, example_output, metadata)
VALUES (
  'CLOW_DISRUPTION',
  'THE_DISRUPTORS',
  E'# Lee Clow — Think Different / Disruption

## Philosophy
In a noisy world, you must break the pattern to be seen. Challenge conventions, provoke thought, stop the scroll.

## Core Principles

### 1. Pattern Interruption
- Say what competitors won''t
- Challenge industry assumptions
- Provoke before you persuade

### 2. Contradiction as Hook
- "Stop buying perfume that vanishes"
- "Most skincare is a lie"
- State the opposite of expected

### 3. Extreme Brevity
- 5-7 words max for headlines
- Every word must earn its place
- Density over length

### 4. Bold Confidence
- No qualifiers, no hedging
- State it like truth
- Let them disagree—at least they''re engaged

### 5. Visual-Verbal Unity
- Words and images must hit the same note
- One idea, one execution
- Simplicity is power

## Signature Techniques

### Contradiction Headlines
"Throw away your serums"
"Your moisturizer is making it worse"
"Stop buying candles that smell like headaches"

### Provocation
State the uncomfortable truth others avoid.
"Most [category] is a lie."

### Minimalism
Strip everything unnecessary.
Short. Punchy. Done.

### Pattern Interruption
Say what no competitor would dare say.
Challenge the category, not just competitors.

## Structure Guidelines

### Format
- Headlines: 5-7 words maximum
- Body: Short, punchy sentences
- No explanations—just statements
- Whitespace as design element

### Tone
- Confident, not arrogant
- Provocative, not offensive
- Direct, never passive
- Bold, never desperate

## What NOT to Do
- ❌ Never use qualifiers: "perhaps," "possibly," "consider," "maybe," "might," "could"
- ❌ Never use: "we believe," "in our opinion," "arguably"
- ❌ Never use long explanations
- ❌ Never use safe, expected phrasing
- ❌ Never use corporate speak

## Example Transformation

**Before (Safe):**
"Introducing our new anti-aging serum with advanced technology."

**After (Clow):**
**Headline:** "Retinol is hurting your skin"

**Body:**
Not the ingredient. The delivery.

Most retinol serums dump the active on your face all at once.
That''s why you''re red and peeling.

We encapsulate it. Time-release over 8 hours.
Same results. Zero irritation.

[Shop the Fix]

## Quality Checklist
- [ ] Is the headline 7 words or fewer?
- [ ] Does it challenge an assumption?
- [ ] Would a competitor be scared to say this?
- [ ] Is every word necessary?
- [ ] Does it stop the scroll?

## When to Use Clow
- Paid ads (Facebook, TikTok, Instagram)
- Subject lines
- Cold audience, top of funnel
- Scroll-stopping required
- Bold brands that don''t apologize',
  'Break patterns to be seen. Challenge assumptions, provoke thought, extreme brevity. 5-7 word headlines. No qualifiers.',
  ARRAY['perhaps', 'possibly', 'consider', 'maybe', 'might', 'could', 'we believe', 'in our opinion', 'arguably', 'arguably', 'gentle', 'soft', 'subtle'],
  E'**Product:** Anti-Aging Serum (Facebook Ad)

**Headline:** "Retinol is hurting your skin"

**Body:**
Not the ingredient. The delivery.

Most retinol serums dump the active on your face all at once.
That''s why you''re red and peeling.

We encapsulate it. Time-release over 8 hours.
Same results. Zero irritation.

[Shop the Fix]',
  '{"use_for": ["paid_ads", "facebook", "tiktok", "subject_lines", "headlines"], "strength_areas": ["attention_grabbing", "scroll_stopping", "pattern_interruption"], "best_for_stages": ["unaware"]}'::jsonb
)
ON CONFLICT (master_name) DO UPDATE SET
  full_content = EXCLUDED.full_content,
  summary = EXCLUDED.summary,
  forbidden_language = EXCLUDED.forbidden_language,
  example_output = EXCLUDED.example_output,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

-- Halbert - Urgency With Substance (THE_DISRUPTORS)
INSERT INTO public.madison_masters (master_name, squad, full_content, summary, forbidden_language, example_output, metadata)
VALUES (
  'HALBERT_URGENCY',
  'THE_DISRUPTORS',
  E'# Gary Halbert — Urgency With Substance

## Philosophy
Human-to-human voice. Lead with stakes. Prove urgency with facts, not hype.

## Core Principles

### 1. Human-to-Human Voice
- Write as if emailing one person
- Use "you," contractions, plain language
- Strip corporate fillers
- Every line should sound spoken, not scripted

### 2. Lead With Stakes
- Show what changes if they act (or don''t) within the first two sentences
- Name the real-world impact: time saved, skin saved, money earned
- Stakes = attention

### 3. Prove Urgency With Facts
- "Only 312 vials exist"
- "Pouring takes 48 hours per batch"
- No vague scarcity
- Connect urgency to craftsmanship, not hype

### 4. Guide the Reader Step by Step
- Short paragraphs
- Each line nudges the reader forward
- Use micro-CTAs inside the copy: "Scroll down; see the burn test"

### 5. The Velvet Hammer Tone
- Halbert''s edge + Madison''s restraint
- Confident, never shouty
- Firm but not aggressive

## Signature Techniques

### Open Loop
Hint at a payoff: "There''s a reason this candle hits 60 hours..."
Then deliver proof.

### Contrast Pairing
"Most candles tunnel by hour ten. Ours finish clean at hour sixty."
Direct comparison with specifics.

### Micro-Stories
Two-sentence scenes that show the product in use.
"You light it on a Tuesday. It''s still burning on Thursday."

### Numbered Stakes
"Seventy-five seats. Three days. One standard."
Numbers create reality.

## Structure Guidelines

### Rhythm & Formatting
- Alternate short punch lines with medium-depth sentences
- Paragraphs rarely exceed three sentences
- Line breaks control pace
- Italics or bold only for genuine emphasis

## Example Transformation

**Before (Generic):**
"Our new serum is here and it''s perfect for winter hydration."

**After (Halbert):**
"Winter strips skin in eight hours. This serum seals it for eighteen.

Two pumps. Clean, dry skin.

You''ll know it worked when you don''t think about dryness once tomorrow."

## Quality Checklist
- [ ] Does it feel like a person wrote it to one reader?
- [ ] Are the stakes or payoff explicit within the opening?
- [ ] Is urgency backed by facts (quantity, time, access)?
- [ ] Did every paragraph earn its place?
- [ ] Does the finish feel confident, not desperate?

## When to Use Halbert
- Launches, pre-orders, limited drops
- Brand messages where energy and clarity outrank ornamentation
- Situations where the reader must feel the stakes immediately
- Email sequences
- Countdown situations with real scarcity',
  'Human-to-human voice. Lead with stakes. Prove urgency with facts—quantity, time, access—not vague hype. Short paragraphs, velvet hammer tone.',
  ARRAY['perhaps', 'possibly', 'consider', 'maybe', 'might', 'gentle', 'soft'],
  E'**Product:** Winter Hydration Serum

Winter strips skin in eight hours. This serum seals it for eighteen.

Two pumps. Clean, dry skin.

You''ll know it worked when you don''t think about dryness once tomorrow.

Only 200 bottles in this batch. We pour in small runs because the peptide complex degrades at scale.

When these are gone, it''s 6 weeks until the next batch.

[Secure Your Bottle]',
  '{"use_for": ["launches", "pre_orders", "limited_drops", "email_sequences", "scarcity_campaigns"], "strength_areas": ["urgency", "stakes", "direct_response"], "best_for_stages": ["product_aware", "most_aware"]}'::jsonb
)
ON CONFLICT (master_name) DO UPDATE SET
  full_content = EXCLUDED.full_content,
  summary = EXCLUDED.summary,
  forbidden_language = EXCLUDED.forbidden_language,
  example_output = EXCLUDED.example_output,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

-- Caples - Headlines (THE_SCIENTISTS - but also useful across)
INSERT INTO public.madison_masters (master_name, squad, full_content, summary, forbidden_language, example_output, metadata)
VALUES (
  'CAPLES_HEADLINES',
  'THE_SCIENTISTS',
  E'# John Caples — Tested Headlines & Curiosity Gaps

## Philosophy
Headline is everything. 80% of success comes from the headline. Test everything, let data decide.

## Core Principles

### 1. Headline is Everything
- 80% of success comes from the headline
- Spend disproportionate time crafting and testing headlines
- A weak headline kills even the best copy

### 2. Test Everything
- Never assume—test headlines, offers, angles
- Let data guide decisions, not opinions
- Small changes can yield massive differences

### 3. Curiosity Gaps
- Create gaps in knowledge that must be filled
- "They Laughed When I Sat Down at the Piano—But When I Started to Play!"
- Promise a revelation, then deliver it

### 4. Specificity Wins
- "How a Fool Stunt Made Me a Star Salesman" beats "How to Sell"
- Specific situations, numbers, and outcomes
- Concrete beats abstract every time

### 5. Benefit-First Thinking
- Lead with what the reader gets, not what you''re selling
- "Lose 10 Pounds in 10 Days" not "Our New Diet Program"
- Reader-centric, not product-centric

## Signature Headline Types

### Curiosity Headlines
"They Laughed When I Sat Down at the Piano—But When I Started to Play!"
Setup → twist → implied revelation

### How-To Headlines
"How I Improved My Memory in One Evening"
Promise of learnable transformation

### Question Headlines
"Do You Make These Mistakes in English?"
Challenge that demands self-assessment

### News Headlines
"New Discovery Adds 6 Inches to Your Height"
Framing as breakthrough or discovery

### Testimonial Headlines
"Little-Known Ways to a $100,000 Income"
Implied proof through others'' success

## Structure Guidelines

### Headline → First Paragraph Flow
- Headline must stop the reader immediately
- First paragraph must deliver on headline promise
- Use subheads to maintain curiosity and guide reading

### Testing Protocol
- Test multiple headlines
- Let data decide the winner
- Small words can make massive differences

## Example Transformation

**Before (Generic):**
"Our New Candle Collection is Here"

**After (Caples):**
"They Laughed When I Said I Could Make a Candle That Burns for 60 Hours—But When They Saw the Test Results..."

Or: "How a 19th-Century French Perfumer''s Secret Led to Our Best-Selling Candle (And Why Most Companies Don''t Want You to Know)"

## Quality Checklist
- [ ] Does the headline create curiosity that must be satisfied?
- [ ] Is it specific rather than generic?
- [ ] Does it promise a clear benefit or revelation?
- [ ] Would you want to read more after seeing just the headline?
- [ ] Have you tested multiple headline variations?
- [ ] Does the first paragraph deliver on the headline promise?
- [ ] Is it reader-centric, not product-centric?

## When to Use Caples
- Headlines and subject lines
- A/B testing scenarios
- Situations requiring curiosity gaps
- When data-driven approaches matter
- Opening hooks that must grab attention',
  'Headlines are 80% of success. Create curiosity gaps that must be filled. Specificity beats generic. Test everything, let data decide.',
  ARRAY['vague', 'generic', 'exciting', 'amazing', 'incredible'],
  E'**Headline Options:**

1. "They Laughed When I Said I Could Make a Candle That Burns for 60 Hours—But When They Saw the Test Results..."

2. "How a 19th-Century French Perfumer''s Secret Led to Our Best-Selling Candle"

3. "Do You Make These 3 Mistakes When Buying Candles?"

4. "The Strange Reason Your Candles Keep Tunneling (And the 60-Hour Solution)"

5. "New: A Candle That Outlasts 4 Regular Candles—For the Same Price"',
  '{"use_for": ["headlines", "subject_lines", "opening_hooks", "a_b_testing"], "strength_areas": ["attention_grabbing", "curiosity_creation", "testing_frameworks"], "best_for_stages": ["unaware", "problem_aware"]}'::jsonb
)
ON CONFLICT (master_name) DO UPDATE SET
  full_content = EXCLUDED.full_content,
  summary = EXCLUDED.summary,
  forbidden_language = EXCLUDED.forbidden_language,
  example_output = EXCLUDED.example_output,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

-- ═══════════════════════════════════════════════════════════════════════════════
-- SCHWARTZ AWARENESS TEMPLATES (Silo A)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO public.schwartz_templates (stage, template_content, description, key_principles, opening_strategies, forbidden_approaches, example_headlines, metadata)
VALUES (
  'unaware',
  E'# Unaware Stage Template

## Reader Mindset
Customer doesn''t know they have a problem. They''re not actively looking for solutions.

## Structure

### 1. Open With a Relatable Observation (40% of copy)
- Start with something they recognize from their daily life
- Don''t mention the problem yet—just the situation
- Build familiarity and nodding agreement

### 2. Reveal the Hidden Problem (25% of copy)
- Gently introduce the problem they didn''t know they had
- Use "did you know" or "most people don''t realize" framing
- Make them curious, not defensive

### 3. Show Why It Matters (20% of copy)
- Connect the problem to something they care about
- Paint the consequence picture
- Create emotional resonance

### 4. Introduce Your Solution Category (15% of copy)
- Don''t sell yet—just introduce the type of solution
- Hint at what''s possible
- Create desire to learn more

## Example Opening Strategies

- Story or scene they recognize
- Tension they feel but haven''t named
- Universal experience everyone shares
- "Most people..." observation

## Tone Guidelines
- Curiosity over alarm
- Discovery over warning
- Gentle revelation, not shock',
  'Customer doesn''t know they have a problem. Start with relatable observation, gently reveal the hidden problem.',
  ARRAY['Start with something they recognize', 'Don''t mention the problem immediately', 'Build nodding agreement first', 'Gentle revelation over shock'],
  ARRAY['Story or scene they recognize', 'Universal experience opening', '"Most people" observation', 'Tension they feel but haven''t named'],
  ARRAY['Don''t lead with the problem', 'Don''t be alarmist', 'Don''t assume they know your category', 'Don''t use industry jargon'],
  ARRAY['Have you ever noticed...', 'Most people don''t realize...', 'There''s something happening that...', 'What if I told you...'],
  '{"target_copy_length": "longer", "emotion_logic_ratio": "80_20", "cta_style": "soft_learn_more"}'::jsonb
)
ON CONFLICT (stage) DO UPDATE SET
  template_content = EXCLUDED.template_content,
  description = EXCLUDED.description,
  key_principles = EXCLUDED.key_principles,
  opening_strategies = EXCLUDED.opening_strategies,
  forbidden_approaches = EXCLUDED.forbidden_approaches,
  example_headlines = EXCLUDED.example_headlines,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

INSERT INTO public.schwartz_templates (stage, template_content, description, key_principles, opening_strategies, forbidden_approaches, example_headlines, metadata)
VALUES (
  'problem_aware',
  E'# Problem-Aware Stage Template

## Reader Mindset
Knows the problem, unsure of solutions. Actively feeling the pain but doesn''t know what to do about it.

## Structure

### 1. Validate Their Pain Immediately (25% of copy)
- Name the problem they''re experiencing
- Show you understand exactly how it feels
- Create "finally, someone gets it" moment

### 2. Explain Why the Problem Persists (30% of copy)
- Reveal the mechanism causing the problem
- Show why their previous attempts failed
- Build credibility through insight

### 3. Present Your Unique Mechanism (30% of copy)
- Introduce HOW your solution works
- Focus on the mechanism, not the product
- Use Hopkins "reason-why" approach

### 4. Provide Proof It Works (15% of copy)
- Data, testimonials, results
- Specific numbers and timelines
- Remove skepticism with evidence

## Example Opening Strategies

- "Still fighting [problem]?"
- Name the frustration directly
- "If you''ve tried X, Y, Z and nothing worked..."
- Acknowledge their struggle

## Tone Guidelines
- Empathetic and understanding
- Solution-focused, not doom-focused
- Educational and helpful
- Build trust through knowledge',
  'Knows the problem, unsure of solutions. Validate their pain, explain why it persists, present your mechanism.',
  ARRAY['Validate the pain immediately', 'Explain why the problem persists', 'Present unique mechanism', 'Provide proof with data'],
  ARRAY['"Still fighting [problem]?"', 'Name the frustration directly', '"If you''ve tried X, Y, Z..."', 'Acknowledge their struggle'],
  ARRAY['Don''t assume they know solutions exist', 'Don''t jump to product features', 'Don''t skip the mechanism explanation', 'Don''t forget the proof'],
  ARRAY['Still dealing with...?', 'Here''s why nothing has worked...', 'The real reason behind...', 'What they don''t tell you about...'],
  '{"target_copy_length": "medium_long", "emotion_logic_ratio": "60_40", "cta_style": "learn_how"}'::jsonb
)
ON CONFLICT (stage) DO UPDATE SET
  template_content = EXCLUDED.template_content,
  description = EXCLUDED.description,
  key_principles = EXCLUDED.key_principles,
  opening_strategies = EXCLUDED.opening_strategies,
  forbidden_approaches = EXCLUDED.forbidden_approaches,
  example_headlines = EXCLUDED.example_headlines,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

INSERT INTO public.schwartz_templates (stage, template_content, description, key_principles, opening_strategies, forbidden_approaches, example_headlines, metadata)
VALUES (
  'solution_aware',
  E'# Solution-Aware Stage Template

## Reader Mindset
Knows solutions exist, evaluating options. Comparing alternatives, looking for the best fit.

## Structure

### 1. Acknowledge They''re Evaluating (15% of copy)
- Show you know they''re shopping around
- Position yourself as a helpful guide
- Don''t be defensive about comparison

### 2. Highlight Your Unique Aspect (35% of copy)
- What makes you different from alternatives?
- Lead with USP (Reeves approach)
- Focus on the ONE thing that matters most

### 3. Compare Subtly to Alternatives (30% of copy)
- Don''t name competitors
- Compare approaches, not brands
- Show why your approach is superior

### 4. Remove Final Objections (20% of copy)
- Address common concerns
- Risk reversal (guarantees, trials)
- Social proof from similar customers

## Example Opening Strategies

- "You already know long-burn candles exist..."
- "If you''re comparing options..."
- "Most [category] products do X. We do Y."
- "Before you decide..."

## Tone Guidelines
- Confident but not pushy
- Comparative without being negative
- Focus on differentiation
- Respect their research',
  'Knows solutions exist, evaluating options. Lead with USP, compare approaches subtly, remove objections.',
  ARRAY['Acknowledge they''re evaluating', 'Lead with your USP', 'Compare approaches, not brands', 'Remove final objections'],
  ARRAY['"You already know X exists..."', '"If you''re comparing options..."', '"Most products do X. We do Y."', '"Before you decide..."'],
  ARRAY['Don''t name competitors directly', 'Don''t be defensive', 'Don''t assume they''re convinced', 'Don''t skip objection handling'],
  ARRAY['The difference between X and Y', 'Why we do it differently', 'What to look for when choosing', 'Before you decide, consider...'],
  '{"target_copy_length": "medium", "emotion_logic_ratio": "40_60", "cta_style": "compare_try"}'::jsonb
)
ON CONFLICT (stage) DO UPDATE SET
  template_content = EXCLUDED.template_content,
  description = EXCLUDED.description,
  key_principles = EXCLUDED.key_principles,
  opening_strategies = EXCLUDED.opening_strategies,
  forbidden_approaches = EXCLUDED.forbidden_approaches,
  example_headlines = EXCLUDED.example_headlines,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

INSERT INTO public.schwartz_templates (stage, template_content, description, key_principles, opening_strategies, forbidden_approaches, example_headlines, metadata)
VALUES (
  'product_aware',
  E'# Product-Aware Stage Template

## Reader Mindset
Knows your product, needs final push. Interested but hasn''t committed yet.

## Structure

### 1. Reinforce Their Good Judgment (15% of copy)
- Validate they''re making a smart choice
- Remind them why they were interested
- Build confidence in their decision

### 2. Add New Information (35% of copy)
- Share something they don''t know yet
- New use case, ingredient detail, behind-the-scenes
- Give them a new reason to be excited

### 3. Create Urgency Without Pressure (30% of copy)
- Genuine scarcity if it exists
- Seasonal relevance
- Limited batches, production constraints

### 4. Make Buying Easy (20% of copy)
- Clear CTA
- Remove friction
- Address last-minute concerns

## Example Opening Strategies

- "You''ve been eyeing [product]..."
- "Here''s something we haven''t shared yet..."
- "Remember why you saved this?"
- "A few people asked about..."

## Tone Guidelines
- Warm and reassuring
- Excited but not pushy
- Helpful, removing barriers
- Celebratory about their choice',
  'Knows your product, needs final push. Reinforce good judgment, add new info, create genuine urgency.',
  ARRAY['Reinforce their good judgment', 'Add new information they don''t know', 'Create genuine urgency', 'Make buying frictionless'],
  ARRAY['"You''ve been eyeing..."', '"Here''s something we haven''t shared..."', '"Remember why you saved this?"', '"A few people asked about..."'],
  ARRAY['Don''t repeat what they already know', 'Don''t create fake urgency', 'Don''t be too sales-y', 'Don''t add friction'],
  ARRAY['Here''s what makes this special', 'One more thing you should know', 'Why now is the right time', 'Your [product] is waiting'],
  '{"target_copy_length": "short_medium", "emotion_logic_ratio": "50_50", "cta_style": "buy_now"}'::jsonb
)
ON CONFLICT (stage) DO UPDATE SET
  template_content = EXCLUDED.template_content,
  description = EXCLUDED.description,
  key_principles = EXCLUDED.key_principles,
  opening_strategies = EXCLUDED.opening_strategies,
  forbidden_approaches = EXCLUDED.forbidden_approaches,
  example_headlines = EXCLUDED.example_headlines,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

INSERT INTO public.schwartz_templates (stage, template_content, description, key_principles, opening_strategies, forbidden_approaches, example_headlines, metadata)
VALUES (
  'most_aware',
  E'# Most-Aware Stage Template

## Reader Mindset
Ready to buy, just needs the offer. Loyal customers or those who''ve made their decision.

## Structure

### 1. The Offer — Clear and Prominent (50% of copy)
- Lead with the deal
- Price, what''s included, timeline
- No burying the lede

### 2. Bonuses and Guarantees (25% of copy)
- What extras do they get?
- Risk reversal (money-back, free returns)
- Added value beyond the core product

### 3. Single, Clear CTA (15% of copy)
- One action, one button
- No confusion about next step
- Make it obvious

### 4. Minimal Copy (10% of copy)
- They don''t need convincing
- Get out of the way
- Let them buy

## Example Opening Strategies

- Direct offer statement
- "Here''s the deal..."
- "[Product] is back in stock"
- Price + CTA immediately visible

## Tone Guidelines
- Direct and efficient
- Confident, not desperate
- Celebratory
- Grateful for their loyalty',
  'Ready to buy, just needs the offer. Lead with deal, bonuses, single CTA. Minimal copy—get out of the way.',
  ARRAY['Lead with the offer', 'Include bonuses and guarantees', 'Single clear CTA', 'Minimal convincing copy'],
  ARRAY['Direct offer statement', '"Here''s the deal..."', '"Back in stock"', 'Price + CTA immediately'],
  ARRAY['Don''t over-explain', 'Don''t add friction', 'Don''t make them search for the CTA', 'Don''t undersell the offer'],
  ARRAY['Your exclusive offer', 'Ready when you are', 'Here''s what you get', '[Product] + [Bonus] = [Price]'],
  '{"target_copy_length": "short", "emotion_logic_ratio": "30_70", "cta_style": "direct_buy"}'::jsonb
)
ON CONFLICT (stage) DO UPDATE SET
  template_content = EXCLUDED.template_content,
  description = EXCLUDED.description,
  key_principles = EXCLUDED.key_principles,
  opening_strategies = EXCLUDED.opening_strategies,
  forbidden_approaches = EXCLUDED.forbidden_approaches,
  example_headlines = EXCLUDED.example_headlines,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

-- ═══════════════════════════════════════════════════════════════════════════════
-- VISUAL MASTERS (Silo A)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO public.visual_masters (master_name, squad, full_content, summary, example_images, forbidden_styles, prompt_template, composition_rules, lighting_rules, metadata)
VALUES (
  'AVEDON_ISOLATION',
  'THE_MINIMALISTS',
  E'# Richard Avedon — Stark Isolation

## Philosophy
Clarity through subtraction. Let the product speak. Pure white backgrounds, subject isolation, clinical precision.

## Visual Principles

### Background
- Pure white (#FFFFFF) or vellum cream (#FFFCF5)
- Zero texture
- No shadows (or minimal, soft directional)

### Product Placement
- Centered, isolated
- Single product only
- 60% negative space minimum
- Product takes 30-40% of frame

### Typography
- Single serif font (Cormorant Garamond)
- Minimal text (product name + one benefit)
- Black (#1A1816) or charcoal (#3D3935)
- No decorative elements

### Lighting
- Soft, directional (simulates north-facing window)
- No harsh shadows
- Even illumination
- Clinical, not dramatic

## Forbidden Styles
- Busy backgrounds (wood, marble, fabrics)
- Multiple products in frame
- Lifestyle context (hands, tables, props)
- Ornate borders or frames
- Vintage textures
- Multiple fonts
- Gradients or color overlays

## When to Use
- Luxury skincare, tech products
- Product pages, email
- Clinical, professional positioning
- Price point > $150',
  'Stark white backgrounds, subject isolation, clinical precision. 60% negative space, single product, minimal text.',
  ARRAY[]::TEXT[],
  ARRAY['busy_backgrounds', 'multiple_products', 'lifestyle_context', 'ornate_borders', 'vintage_textures', 'gradients', 'color_overlays'],
  E'[Product name] on pure white background, Richard Avedon style product photography, centered composition, clinical lighting, soft directional light from top-left, no shadows, isolated subject, minimalist aesthetic, professional commercial photography, hyperrealistic, 8k resolution --ar 1:1 --style raw --no props --no context',
  '{"background": "pure_white_or_cream", "product_placement": "centered_isolated", "negative_space": "60_percent_minimum", "product_frame_percentage": "30_40_percent", "typography": "single_serif_minimal"}'::jsonb,
  '{"direction": "soft_directional_top_left", "quality": "soft_even", "shadows": "minimal_to_none", "color_temperature": "neutral_to_cool"}'::jsonb,
  '{"use_for": ["luxury_skincare", "tech_products", "product_pages", "email"], "price_point": "150_plus", "positioning": "clinical_professional"}'::jsonb
)
ON CONFLICT (master_name) DO UPDATE SET
  full_content = EXCLUDED.full_content,
  summary = EXCLUDED.summary,
  forbidden_styles = EXCLUDED.forbidden_styles,
  prompt_template = EXCLUDED.prompt_template,
  composition_rules = EXCLUDED.composition_rules,
  lighting_rules = EXCLUDED.lighting_rules,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

INSERT INTO public.visual_masters (master_name, squad, full_content, summary, example_images, forbidden_styles, prompt_template, composition_rules, lighting_rules, metadata)
VALUES (
  'LEIBOVITZ_ENVIRONMENT',
  'THE_STORYTELLERS',
  E'# Annie Leibovitz — Environmental Context

## Philosophy
Context creates emotion. Show the product in its world. Natural settings, lifestyle integration, narrative imagery.

## Visual Principles

### Background
- Natural settings (linen, wood, stone)
- Soft textures (fabrics, organic materials)
- Muted, warm color palettes
- Environmental context (tables, shelves, nature)

### Product Placement
- Integrated into scene (not centered)
- Hands in frame (optional)
- Other lifestyle elements (books, plants, textiles)
- Rule of thirds composition

### Typography
- Accent font (Crimson Text italic)
- Handwritten feel acceptable
- Text integrated into image (not floating)
- Warm tones (charcoal, sepia)

### Lighting
- Golden hour natural light
- Soft window light
- No harsh shadows
- Warm color grading

## Forbidden Styles
- Pure white backgrounds
- Clinical lighting
- Isolated products (no context)
- Corporate stock photography
- Sterile environments
- Flash photography

## When to Use
- Fragrance, candles, lifestyle products
- Instagram, brand story
- Romantic, authentic positioning
- Price point $40-$200',
  'Environmental context, natural light, lifestyle integration. Rule of thirds, warm color grading, soft textures.',
  ARRAY[]::TEXT[],
  ARRAY['white_backgrounds', 'clinical_lighting', 'isolated_products', 'corporate_stock', 'sterile_environments', 'flash_photography'],
  E'[Product] in natural setting, Annie Leibovitz style environmental portrait, lifestyle photography, soft natural window light, warm color grading, [context elements], editorial magazine quality, film grain texture, Kinfolk aesthetic, intimate atmosphere --ar 4:5 --style raw --no clinical --no white background',
  '{"background": "natural_settings_textured", "product_placement": "integrated_rule_of_thirds", "context_elements": "lifestyle_props", "typography": "accent_font_integrated"}'::jsonb,
  '{"direction": "golden_hour_or_window", "quality": "soft_natural", "shadows": "soft_natural", "color_temperature": "warm"}'::jsonb,
  '{"use_for": ["fragrance", "candles", "lifestyle_products", "instagram", "brand_story"], "price_point": "40_200", "positioning": "romantic_authentic"}'::jsonb
)
ON CONFLICT (master_name) DO UPDATE SET
  full_content = EXCLUDED.full_content,
  summary = EXCLUDED.summary,
  forbidden_styles = EXCLUDED.forbidden_styles,
  prompt_template = EXCLUDED.prompt_template,
  composition_rules = EXCLUDED.composition_rules,
  lighting_rules = EXCLUDED.lighting_rules,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

INSERT INTO public.visual_masters (master_name, squad, full_content, summary, example_images, forbidden_styles, prompt_template, composition_rules, lighting_rules, metadata)
VALUES (
  'RICHARDSON_RAW',
  'THE_DISRUPTORS',
  E'# Terry Richardson — Raw Energy

## Philosophy
Break visual patterns to stop the scroll. Flash, raw energy, confrontational, bold.

## Visual Principles

### Background
- High contrast (black, neon, bold colors)
- Unexpected colors (not brand palette)
- Graphic, flat design acceptable
- Pattern interruption

### Product Placement
- Extreme close-ups OR overhead flat lays
- Asymmetric, off-center
- Multiple angles simultaneously (cubist)
- Unexpected scale

### Typography
- Bold, oversized text
- High contrast with background
- Sans-serif, modern fonts
- Text as visual element (not subtle)

### Lighting
- Direct flash (Richardson style)
- High contrast, dramatic shadows
- Unconventional light sources
- Hyper-saturated colors

## Forbidden Styles
- Safe, expected layouts
- Subtle compositions
- Muted colors
- Conventional product photography
- Corporate aesthetics

## When to Use
- Paid social ads (Facebook, TikTok, Pinterest)
- Scroll-stopping content
- Top of funnel awareness
- Bold, confident brands',
  'Raw energy, flash photography, bold colors. Pattern interruption, high contrast, scroll-stopping.',
  ARRAY[]::TEXT[],
  ARRAY['safe_layouts', 'subtle_compositions', 'muted_colors', 'conventional_photography', 'corporate_aesthetics'],
  E'[Product] on [bold color] background, high contrast, bold graphic style, [unexpected angle/composition], commercial advertising photography, dramatic lighting, scroll-stopping visual, modern bold aesthetic --ar 9:16 --style raw --no subtle --no muted',
  '{"background": "high_contrast_bold", "product_placement": "extreme_angles_asymmetric", "scale": "unexpected", "typography": "bold_oversized"}'::jsonb,
  '{"direction": "direct_flash", "quality": "high_contrast", "shadows": "dramatic", "color_temperature": "hyper_saturated"}'::jsonb,
  '{"use_for": ["paid_social", "facebook", "tiktok", "pinterest", "scroll_stopping"], "positioning": "bold_confident"}'::jsonb
)
ON CONFLICT (master_name) DO UPDATE SET
  full_content = EXCLUDED.full_content,
  summary = EXCLUDED.summary,
  forbidden_styles = EXCLUDED.forbidden_styles,
  prompt_template = EXCLUDED.prompt_template,
  composition_rules = EXCLUDED.composition_rules,
  lighting_rules = EXCLUDED.lighting_rules,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

INSERT INTO public.visual_masters (master_name, squad, full_content, summary, example_images, forbidden_styles, prompt_template, composition_rules, lighting_rules, metadata)
VALUES (
  'ANDERSON_SYMMETRY',
  'THE_DISRUPTORS',
  E'# Wes Anderson — Hyper-Symmetry

## Philosophy
Perfect symmetry as pattern interruption. Bold color blocks, centered composition, visual satisfaction.

## Visual Principles

### Background
- Bold, flat color blocks
- Pastel or saturated palettes
- Geometric precision
- Architectural elements

### Product Placement
- Perfect center
- Symmetrical arrangement
- Props arranged with mathematical precision
- Overhead flat lay common

### Typography
- Centered, symmetric
- Vintage-inspired fonts
- Color coordinated with palette
- Clean, precise placement

### Lighting
- Even, flat lighting
- No harsh shadows
- Soft, diffused
- Color-matched to scene

## Forbidden Styles
- Asymmetry
- Organic compositions
- Dark/moody aesthetics
- Chaotic arrangements

## When to Use
- TikTok, Instagram Reels
- Pattern-interrupting content
- Playful brands
- Visual satisfaction seekers',
  'Perfect symmetry, bold color blocks, mathematical precision. Centered composition, vintage-inspired, visually satisfying.',
  ARRAY[]::TEXT[],
  ARRAY['asymmetry', 'organic_compositions', 'dark_moody', 'chaotic_arrangements'],
  E'[Product] overhead flat lay on [bold color] background, Wes Anderson symmetrical composition, bold graphic style, centered perfectly, surrounded by [props] in perfect symmetry, hyperrealistic, bold colors --ar 9:16 --style raw',
  '{"background": "bold_flat_color", "product_placement": "perfect_center_symmetric", "props": "mathematical_precision", "typography": "centered_vintage"}'::jsonb,
  '{"direction": "even_overhead", "quality": "flat_soft", "shadows": "minimal", "color_temperature": "matched_to_palette"}'::jsonb,
  '{"use_for": ["tiktok", "instagram_reels", "pattern_interrupting", "playful_brands"]}'::jsonb
)
ON CONFLICT (master_name) DO UPDATE SET
  full_content = EXCLUDED.full_content,
  summary = EXCLUDED.summary,
  forbidden_styles = EXCLUDED.forbidden_styles,
  prompt_template = EXCLUDED.prompt_template,
  composition_rules = EXCLUDED.composition_rules,
  lighting_rules = EXCLUDED.lighting_rules,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

-- ═══════════════════════════════════════════════════════════════════════════════
-- LOG COMPLETION
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  RAISE NOTICE 'Madison Masters seeding completed!';
  RAISE NOTICE 'Seeded: madison_masters (7 copy masters), visual_masters (4 visual masters), schwartz_templates (5 stages)';
END $$;

