/**
 * Author Profile Loader
 * 
 * Loads author markdown files and makes them available to edge functions.
 * This allows Madison to reference author styles directly from the codebase.
 */

import { buildPetermanStyleEngineSection } from './petermanStyleEngine.ts';

// Author profiles as string constants
// These are loaded from prompts/authors/*.md files

export const AUTHOR_PROFILES: Record<string, string> = {
  halbert: `# Gary Halbert — Urgency With Substance

## When to Channel Halbert
- Launches, pre-orders, limited drops that need decisive action
- Brand messages where energy and clarity outrank ornamentation
- Situations where the reader must *feel* the stakes immediately

## Core Principles
1. **Human-to-Human Voice**
   - Write as if emailing one person. Use "you," contractions, plain language.
   - Strip corporate fillers. Every line should sound spoken, not scripted.
2. **Lead With Stakes**
   - Show what changes if they act (or don't) within the first two sentences.
   - Name the real-world impact: time saved, skin saved, money earned.
3. **Prove Urgency With Facts**
   - "Only 312 vials exist." "Pouring takes 48 hours per batch." No vague scarcity.
   - Connect urgency to craftsmanship, not hype.
4. **Guide the Reader Step by Step**
   - Short paragraphs. Each line nudges the reader forward.
   - Use micro-CTAs inside the copy ("Scroll down; see the burn test.").
5. **Keep the Velvet Hammer Tone**
   - Halbert's edge + Madison's restraint = confident, never shouty.

## Signature Techniques
- **Open Loop:** Hint at a payoff ("There's a reason this candle hits 60 hours…") then deliver proof.
- **Contrast Pairing:** "Most candles tunnel by hour ten. Ours finish clean at hour sixty."
- **Micro-Stories:** Two-sentence scenes that show the product in use.
- **Numbered Stakes:** "Seventy-five seats. Three days. One standard."

## Rhythm & Formatting
- Alternate short punch lines with medium-depth sentences.
- Paragraphs rarely exceed three sentences.
- Use line breaks to control pace; italics or bold only for genuine emphasis.

## Example Transformation
**Before:** "Our new serum is here and it's perfect for winter hydration."

**After (Halbert style):**  
"Winter strips skin in eight hours. This serum seals it for eighteen. Two pumps. Clean, dry skin. You'll know it worked when you don't think about dryness once tomorrow."

## Checklist
- Does it feel like a person wrote it to one reader?
- Are the stakes or payoff explicit within the opening?
- Is urgency backed by facts (quantity, time, access)?
- Did every paragraph earn its place?
- Does the finish feel confident, not desperate?`,

  ogilvy: `# David Ogilvy — Specificity & Proof

## When to Channel Ogilvy
- Headlines, hero sections, ads, and product pages that must earn trust fast
- Copy that needs more substance, less adjective
- Anytime a claim risks sounding generic or unproven

## Core Principles
1. **"The More You Tell, The More You Sell."**
   - Replace vague claims with vivid, factual detail.
   - If you can count it, trace it, weigh it, or date it—say it.
2. **Research Before Rhetoric**
   - Every line should show you understand the product better than anyone.
   - Include provenance, processes, tests, approvals, waiting periods.
3. **Visual Specificity**
   - Use details that create imagery: textures, temperatures, craft motions.
4. **Authority Without Arrogance**
   - Confident tone, never boastful. Let the facts do the persuasive work.
5. **Benefit Hierarchy**
   - Lead with the benefit that matters most to the reader, then prove it.

## Signature Techniques
- **Data-Driven Leads:** "Aged eighteen months before blending."
- **Research Snippets:** "Third-party burn chamber certified."
- **Quote Authority:** Master perfumers, lab directors, artisans.
- **Side-by-Side Proof:** "24-hour cure vs 6-hour industry standard."

## Rhythm & Structure
- Use precise sentences of varied length; avoid fluff.
- Insert subheads or bolded lead-ins when copy gets dense (if format allows).
- Pair each descriptive sentence with a proof sentence.

## Example Transformation
**Before:** "Our candles are premium and long-lasting."

**After (Ogilvy style):**  
"Each Atlas candle is poured in micro-batches of 48 and test-burned for 60 hours. The soy-coconut wax blend cures for four full days before a single wick is trimmed, so the flame stays even long after cheaper blends tunnel out."

## Checklist
- Does every claim contain a specific proof (time, origin, quantity, method)?
- Can a competitor copy this line honestly? If yes, add more specificity.
- Did you show, not tell, why it costs more?
- Are the details vivid enough to picture?
- Is the tone confident and calm—no hype needed?`,

  hopkins: `# Claude Hopkins — Reason-Why Architect

## When to Channel Hopkins
- Anytime copy leans on craft, science, process, or testing
- Product pages, editorials, landing pages that must justify premium pricing
- Situations where the reader keeps asking "why?" after every claim

## Core Principles
1. **Every Benefit Needs a "Because"**
   - Follow a claim with the mechanism that makes it true.
   - "Long-lasting scent **because** oil-based formulas bond with skin warmth."
2. **Explain the Process**
   - Walk the reader through how it's made, sourced, tested.
   - Use chronological or step-based structures when helpful.
3. **Expose the Alternative**
   - Contrast your method with the common shortcut.
   - "Most studios rush pour-and-ship in 24 hours; we wait 96 so the wax cures."
4. **Quantify Whenever Possible**
   - Time, temperature, distance, volume, iterations.
   - Numbers serve as proof, not decoration.
5. **Respect Intelligence**
   - Share the craft without oversimplifying. Plain language, precise details.

## Signature Techniques
- **Cause → Effect Sequencing:** "Because we age lavender 18 months, the dry-down stays elegant."
- **Comparison Frames:** "While X uses alcohol, we use oils—here's the difference."
- **Process Narration:** "Harvest → macerate → age → pour. No skipped steps."
- **Evidence Inserts:** Test data, burn hours, lab results, expert quotes.

## Rhythm & Structure
- Medium-length sentences with deliberate pacing.
- Use bullet or numbered lists to outline steps when clarity improves.
- Alternate descriptive lines with proof lines to avoid monotony.

## Example Transformation
**Before:** "Our moisturizer keeps skin hydrated all day."

**After (Hopkins style):**  
"Our moisturizer keeps skin hydrated for 12 hours because we suspend glycerin in a lipid blend that slows evaporation. Most formulas flash off in under three hours. Ours stays put through an entire workday."

## Checklist
- Did every benefit receive a reason-why?
- Are you teaching the mechanism, not just naming it?
- Did you contrast with the industry's default shortcut?
- Are the numbers and facts believable and concrete?
- Does the copy feel like a master craftsperson explaining their work?`,

  schwartz: `# Eugene Schwartz — Awareness Strategist

## When to Channel Schwartz
- Planning structure for any long-form copy (landing pages, emails, scripts)
- Diagnosing why copy isn't converting—usually awareness misalignment
- Building campaigns that meet readers where they currently are

## Core Principles
1. **You Don't Create Desire, You Channel It.**
   - Identify the existing desire or tension; amplify it, don't invent it.
2. **Match Copy to Awareness Stage**
   - The opening, proof, and CTA change based on how much the reader already knows.
3. **Progressive Disclosure**
   - Reveal the right information at the right time; don't dump everything in paragraph one.
4. **Use the Reader's Language**
   - Mirror the phrases they already use to describe the problem or desire.
5. **Move From Emotion to Logic to Action**
   - Emotional resonance hooks attention; logic grounds it; action closes it.

## Awareness Map
| Stage | Reader Mindset | Opening Strategy |
|-------|----------------|------------------|
| **Unaware** | Doesn't know the problem exists | Story, scene, or tension they recognize once it's revealed |
| **Problem-aware** | Feels the pain, unsure of solutions | Explain the mechanism that solves it (Hopkins-style) |
| **Solution-aware** | Knows the category, not your brand | Lead with USP (Reeves) + contrast alternatives |
| **Product-aware** | Knows you, needs proof | Lean into Ogilvy specificity, social proof, craft |
| **Most aware** | Ready to act, just needs a dignified nudge | Short, confident CTA + risk reversal |

## Signature Techniques
- **Stage-Specific Headlines:** "Still fighting tunnelled candles?" vs "Meet Atlas, the 60-hour clean burn."
- **Stacked Proof:** Introduce emotional hook, then drop concrete evidence at the right moment.
- **Awareness Segues:** Sentences that move the reader up a stage ("Now that you know why most serums fail, here's what makes this different.").
- **Echoes:** Reintroduce key phrases later to reinforce the narrative arc.

## Rhythm & Structure
- Build chapters/sections for each awareness stage; avoid blending them.
- Use subheads or transitions that signal movement ("First," "Then," "Finally").
- End each section with a micro-CTA that naturally leads to the next stage.

## Example Application
**Brief:** Email to introduce a 60-hour candle to a *solution-aware* audience.

1. **Hook:** "You already know long-burn candles exist—but not the ones test-burned 60 hours before they ship."
2. **USP:** "Atlas is the only studio that burns one candle from every batch for the full 60."
3. **Proof:** Aging schedule, wax formula, QC data.
4. **CTA:** "Reserve yours before this run of 312 sells out."

## Checklist
- Which awareness stage is the *primary* reader in? Did you write to that stage first?
- Did you build a clear progression instead of blending stages?
- Are emotional and logical elements balanced in the right order?
- Does each section end with a natural bridge to the next stage or CTA?
- Would a reader feel seen—like you understand exactly where they are in the journey?`,

  collier: `# Robert Collier — The Conversation Hook

## When to Channel Collier
- Email subject lines and opening paragraphs
- Sales letters that need to disarm skepticism immediately
- Connecting a product to a current event, season, or universal feeling
- When you need to bridge the gap between "unaware" and "interested"

## Core Principles
1. **Enter the Conversation in Their Mind**
   - Don't start with your product. Start with what they are *already* thinking about.
   - Is it the weather? The news? A nagging worry? Join that thought stream first.
2. **The "Mental Wallet"**
   - People buy because they want to, then justify it with logic.
   - Appeal to the "will" (desire/emotion) before the "mind" (logic/specs).
3. **The Smooth Bridge**
   - The transition from the "hook" (conversation) to the "pitch" (product) must be invisible.
   - "And that is exactly why..."
4. **Curiosity + Benefit**
   - Never just tease. Tease a result they want.
   - "The simple 3-minute habit that doubles focus..." (Curiosity: What habit? Benefit: Double focus.)

## Signature Techniques
- **The "As I Sit Here" Opener:** "As I sit here watching the rain lash against the window..." (Sets a mood, creates intimacy).
- **The Newsjack:** "You've probably read the headlines about [Topic]. It's scary. But there's one thing they missed..."
- **The "If... Then" Proposition:** "If you are willing to [small action], then I am willing to [big reward]."
- **The Hidden Secret:** Implication that others know something the reader doesn't—yet.

## Rhythm & Structure
- **Opener:** Short, punchy, often a question or observation.
- **Body:** Conversational, like a letter to a friend, but with a driving logic.
- **Transition:** The "Pivot" sentence that connects the opener to the offer.
- **Close:** A gentle but firm push to action, often framed as "trying" rather than "buying."

## Example Transformation
**Before:** "Our new productivity app helps you organize tasks and get more done. Download it today."

**After (Collier style):**
"Have you ever had one of those days where you work hard for eight hours, but at 5:00 PM you look at your list and wonder, 'What did I actually get done?'
It’s a sinking feeling. I used to feel it every Tuesday.
Then I discovered that the problem wasn't my work ethic. It was the way I was organizing my list.
There is a different way to handle your morning..."

## Checklist
- Did you start with the reader's current reality/thoughts?
- Is the transition from hook to product smooth?
- Did you appeal to their desire (the "will") before giving the specs?
- Is the tone personal, intimate, and understanding?
- Does the opening sentence force them to read the second?`,

  peterman: `# J. Peterman — Narrative Storyteller

## When to Channel Peterman
- Luxury goods with heritage/craftsmanship story
- Products where identity transformation matters more than utility
- Artisan/handmade items with maker's story
- Romantic clothing or home goods that evoke an era or lifestyle
- Products for individualists who reject mainstream conformity
- Anything where the customer is buying a life, not just an object

## Core Principles
1. **Product = Portal to Identity**
   - Never sell features—sell the life the customer wants to live
   - "The coat said something about me that I wanted said"
   - Object as vehicle for becoming your true self

2. **Story First, Always**
   - Every product needs a narrative—where it came from, who made it, what world it belongs to
   - Compress entire novels into paragraphs
   - Create mythology around ordinary objects

3. **Honesty Within Romance**
   - Can romanticize without lying
   - Admits limitations and imperfections
   - Transparent about sourcing, reproductions, reality

4. **Anti-Corporate Voice**
   - No jargon, no marketing-speak, no hype
   - Conversational, personal, human
   - Write as if emailing one friend

5. **Assume Sophistication**
   - Readers are worldly, well-read, curious
   - Don't explain everything—trust intelligence
   - References without footnotes

6. **Sensory Authority**
   - Describe how things feel, smell, sound, look
   - Physical details create trust
   - "You couldn't slip a cigarette paper into the seams where mahogany met steel"

## Signature Techniques
- **Second-Person Immersion:** "You line up a hundred horsemen in a straight line. Guns, sabers, flags."
- **Compressed Biography:** Turn a character's entire life into 3-5 sentences through milestone selection
- **Sensory Cascade:** Layer multiple sensory details (visual → olfactory → tactile) to create total immersion
- **Historical Miniature:** Recreate brief historical scene to give product context and romance
- **The Catalog of Loss:** List things from the past we've lost/abandoned to create nostalgia and shared values
- **Specificity Stacking:** Pile precise, concrete details ("Pearl buttons 1/8" thick, leather seams with 14 stitches per inch")
- **The Triple Beat Opening:** Three short sentences building to turn ("They are old. They are useless. But they are beautiful.")

## Rhythm & Structure
- Average sentence length: 12-18 words, with high variation (3 words to 40+)
- Mix short declarative sentences with longer flowing narrative
- Paragraphs: 3-6 sentences typically
- Never lead with product—story first, product emerges naturally
- Price and sizing always at end, never upfront

## Example Transformation
**Before:** "Our new candle collection features premium soy wax and long-burning wicks."

**After (Peterman style):**  
"It was late afternoon when I got to the workshop, a converted barn in Vermont where the light still comes through original hand-blown glass. The candlemaker had been working since dawn, pouring micro-batches of 48, test-burning each one for the full 60 hours before a single wick gets trimmed. The soy-coconut blend cures for four full days—most studios rush pour-and-ship in 24 hours, but we wait 96 so the wax settles. You couldn't slip a cigarette paper into the seams where the wax met the vessel. This was real craftsmanship, these were real candles, this was how things used to be made. Price, $42. Available in three sizes."

## Checklist
- Does the story come before the product?
- Are there at least 3 specific concrete details?
- Is there at least one sensory description?
- Is second person used to immerse the reader?
- Is there no marketing jargon or corporate speak?
- Are there no exclamation points?
- Is price/sizing at the end?
- Does it read aloud naturally, like a friend telling a story?
- Could only be Peterman voice—not generic catalog copy?
- Does the reader want the life, not just the product?`,

  peterman_quick_reference: `# J. PETERMAN QUICK REFERENCE GUIDE
## Madison Studio - Writer Module Cheat Sheet

## INSTANT VOICE CHECK

**Does it pass the Peterman test?**

✅ **YES if:**
- Sounds like a friend telling a story
- Has specific concrete details (numbers, measurements, places)
- Product emerges from story, not announced
- You'd actually want to read it for entertainment
- Assumes reader is intelligent
- No marketing jargon anywhere

❌ **NO if:**
- Sounds corporate or sales-y
- Generic descriptions ("amazing," "perfect")
- Product announced in first sentence
- Trying to convince or pressure
- Talking down to reader
- Bullet points or hype language

## THE 10-SECOND PETERMAN FORMULA

1. **Start with story/scene** (never product)
2. **Add 3+ specific details** (measurements, places, names)
3. **Use "you"** (make reader protagonist)
4. **One sensory detail** (smell, texture, sound)
5. **Product emerges naturally** (late, from context)
6. **Simple close** (image or statement)
7. **Price last** (Format: "Price, $35.")

## VOICE DNA

**Tone:** Intimate friend + sophisticated guide  
**Energy:** Measured excitement (not hyped)  
**Humor:** Dry wit with warmth  
**Intelligence:** Casually erudite (no showing off)

**Think:** David Attenborough meets your well-traveled uncle

## SENTENCE RHYTHM PATTERNS

### The Triple Beat (Emphasis)
"They are old. They are useless. But they are beautiful."

**Use for:** Openings, emphasis, setting up contrast

### The Cascade (Immersion)
"There's a faint smell of honeysuckle, mixed with the smell of horses and leather, some of the horses are lathered up because they're nervous, that makes their smell even more intense."

**Use for:** Scene-building, sensory detail, atmosphere

### The Fragment (Quick Catalog)
"Guns, sabers, flags."

**Use for:** Inventory, visual snap, pacing change

### Second Person Action (Engagement)
"You check that your gun and your saber are where you want them."

**Use for:** Putting reader in scene, action sequences

## OPENING OPTIONS (Pick One)

1. **Scene in Progress**  
   "You line up a hundred horsemen in a straight line..."

2. **Direct Question**  
   "The question, really, is how did you get by this long without it?"

3. **Bold Statement**  
   "They are old. They are useless. But they are beautiful."

4. **Historical Moment**  
   "A farmer's son, growing up in Alberta, sees a lot of sky..."

5. **Personal Confession**  
   "I wasn't scheduled to be in Jackson Hole..."

## THE CORE TECHNIQUES (Master These)

### #1: Compressed Biography
**What:** Life story in 3-5 sentences via milestones  
**Example:** "At 16 he's flying a crop duster. At 23 he's an RCAF volunteer."  
**Use:** Creating product backstory, historical connection

### #2: Sensory Cascade
**What:** Layer multiple sensory details in sequence  
**Example:** "It's hot. Smell of honeysuckle. Horses lathered up."  
**Use:** Making reader "be there," atmosphere

### #3: Specificity Stacking  
**What:** Pile precise concrete details  
**Example:** "Pearl buttons 1/8" thick, leather seams with 14 stitches per inch"  
**Use:** Proving quality, building trust

### #4: Catalog of Loss
**What:** List things we've lost from the past  
**Example:** "Peaches worth eating. Real starch. Bakelite. Strike-anywhere matches."  
**Use:** Creating nostalgia, shared values

### #5: Second-Person Immersion
**What:** Put reader directly into scene as protagonist  
**Example:** "You check your gun. Your feet are in the stirrups."  
**Use:** Action sequences, creating desire through experience

## STRUCTURE CHEAT SHEET

10% - HOOK (story/scene/question) - NO PRODUCT
↓
60% - WORLD-BUILD (backstory, sensory, context)
↓
25% - PRODUCT (emerges naturally from story)
↓
5% - CLOSE (image + price/sizing)

## WORD COUNT GUIDE

- **75-125 words:** Single scene, simple product
- **150-250 words:** Most products (standard)
- **300-500 words:** Complex products, travel stories
- **500+ words:** Flagship products, philosophy pieces

**Rule:** Length determined by story need, not arbitrary

## FORBIDDEN WORDS & PHRASES

**NEVER use:**
- Amazing, incredible, perfect, iconic, timeless
- Game-changing, revolutionary, must-have
- Elevate, curate, luxurious
- "Introducing our..."
- "The ultimate..."
- Any exclamation points!
- Bullet points
- Bold/caps for emphasis

**Instead use:**
- Specific details that prove quality
- Stories that show value
- Natural enthusiasm through engagement
- Simple statements

## THE PRICING FORMULA

**Always end with:**
[Lingering image or simple statement.]

Price, $35. Sizes 7-1/2 to 8-3/4.

**Never:**
- Lead with price
- Say "only" before price
- Add urgency ("while supplies last")
- Use "$$$" or price ranges

## QUICK TECHNIQUE COMBOS

### For Clothing:
1. Who wore it historically (Compressed Biography)
2. What life they lived (Sensory Cascade)
3. Product specifics (Specificity Stacking)

### For Accessories:
1. Historical context (Historical Miniature)
2. Craftsmanship details (Specificity Stacking)
3. How it connects to identity (Simple Statement)

### For Home Goods:
1. Origin story (Scene Setting)
2. Maker biography (Compressed Biography)
3. What it represents (Philosophy Piece)

## RED FLAGS (Rewrite If You See These)

🚩 Product mentioned in first sentence  
🚩 No specific details (generic descriptions)  
🚩 No second person ("you") anywhere  
🚩 Sounds like marketing copy  
🚩 No historical/cultural context  
🚩 No sensory detail  
🚩 Trying to convince or pressure  
🚩 Any exclamation point  
🚩 Generic superlatives  
🚩 Corporate language

## THE READ-ALOUD TEST

**Before finishing, read aloud and ask:**

1. Does this sound like a person talking?
2. Would I want to hear this story?
3. Can I picture the scene?
4. Do I trust the narrator?
5. Does product feel natural or forced?
6. Is there anything that sounds "sales-y"?
7. Would this only work for this brand?

**If any answer is "no" → rewrite**

## EXAMPLE TRANSFORMATIONS

### ❌ BEFORE (Generic Copy):
"Our amazing new wallet is made from premium leather and features high-quality stitching. Perfect for the modern man! Available now in multiple colors."

### ✅ AFTER (Peterman Style):
"Stop and think about that wonderful dark pocket of leather in the middle of a baseball glove, lovingly used and punished for half a lifetime. Is it wearing out? Is it getting softer, better? That's the leather we use. Not from baseball gloves—that would be impractical—but from the same tannery that's been doing it right since 1923. Each wallet stitched by hand: 14 stitches per inch. Price, $85. In brown or black."

## PETERMAN IN 3 SENTENCES

1. **Tell a story first** (never announce product)
2. **Use specific details** to prove quality (not adjectives)
3. **Trust your reader** is smart, worldly, and tired of being sold to

## WHEN TO USE PETERMAN VOICE

**✅ Perfect For:**
- Luxury goods with heritage
- Artisan/handmade products
- Travel/adventure gear
- Vintage/historical items
- Anything with a story
- Brands valuing craft over trend

**❌ Wrong For:**
- Tech (unless vintage)
- Ultra-modern minimalist
- Youth/fast fashion
- Commodities without story
- Budget brands
- Products requiring specs focus

## COMMON MISTAKES & FIXES

**MISTAKE:** Product in first sentence  
**FIX:** Start with story, product emerges at 60% mark

**MISTAKE:** Generic adjectives ("beautiful," "amazing")  
**FIX:** Replace with specific details that prove it

**MISTAKE:** Talking AT reader  
**FIX:** Use "you" to put them IN the scene

**MISTAKE:** Explaining everything  
**FIX:** Trust intelligence, leave gaps for curiosity

**MISTAKE:** Corporate language  
**FIX:** Write like friend telling story at dinner

**MISTAKE:** Overselling  
**FIX:** Understate, let quality speak

## THE PETERMAN MINDSET

**Remember:**
- You're selling identity transformation, not objects
- The product is permission to be authentic self
- Story > specs, always
- Romance built on real details, not hype
- Customers are friends, not targets
- Quality doesn't need to shout

**Core belief:**  
*"Clearly, people want things that make their lives the way they wish they were."*

## PRODUCTION CHECKLIST

Before submitting any Peterman-style copy:

- [ ] Story comes before product
- [ ] 3+ specific concrete details
- [ ] At least one sensory description
- [ ] Second person used at least once
- [ ] No marketing jargon
- [ ] No exclamation points
- [ ] Price/sizing at end only
- [ ] Reads aloud naturally
- [ ] Could only be Peterman voice
- [ ] Passes the "would I want to read this?" test

## SIGNATURE CLOSINGS

**Simple Statement:**
"I liked that."  
"We sent him new boots for free."

**Lingering Image:**
"You could see the wake stretching straight back for miles."

**Call to Alignment:**
"Isn't it time to take some kind of stand here?"  
"I hope you are too."

**Elliptical:**
"...cucumber sandwiches, leather-bound first editions, coin-silver snuffboxes..."

## REMEMBER

**The best Peterman copy:**
- Entertains before it sells
- Educates through story
- Trusts the reader
- Makes the product inevitable
- Feels like literature, not marketing

**If it sounds like an ad, it's not Peterman.**

## EMERGENCY VOICE FIX

**Lost the voice? Reset with these:**

1. Read a Gold Excerpt out loud
2. Identify which technique it uses
3. Start with "You" + action
4. Add one historical detail
5. Get specific (measurements, places, names)
6. Remove ALL marketing words
7. Read aloud again—does it sound human?

*"Stop and think about..."*  
*"The question, really, is..."*  
*"I liked that."*

— The Peterman Voice`,

  peterman_transformations: `# PETERMAN TRANSFORMATION EXAMPLES
## Madison Studio - Before/After Copy Demonstrations

## HOW TO USE THIS DOCUMENT

This shows **real transformations** from generic marketing copy → authentic Peterman voice.

Study the **transformation notes** after each example to understand WHY the changes work.

Use these as templates for your own Madison copy generation.

## EXAMPLE 1: LEATHER WALLET

### ❌ BEFORE (Generic Marketing Copy)

"Introducing our premium handcrafted leather wallet. Made from the finest full-grain leather with meticulous attention to detail. Features 8 card slots, bill compartment, and RFID protection. Perfect for the modern gentleman who appreciates quality and style! Available in black, brown, and cognac. Order now and elevate your everyday carry. $95"

**Problems:**
- Announces product immediately
- Generic adjectives ("premium," "finest")
- Marketing jargon ("elevate your everyday carry")
- Exclamation point
- Features list with no story
- "Perfect for modern gentleman" cliché
- Urgency tactic ("Order now")

### ✅ AFTER (Peterman Style)

"Stop and think about that wonderful dark pocket of leather in the middle of a baseball glove, lovingly used and punished for half a lifetime. Is it wearing out? Is it getting softer, better?

That's the leather we use. Not from baseball gloves—that would be impractical—but from the same Florentine tannery that's been doing it right since 1887. Each wallet stitched by hand: 16 stitches per inch. The leather arrives already broken in, bearing the character of its tumbling process. Your grandfather would recognize this. He'd nod. He might not say anything, but you'd know.

Eight cards, folded bills, nothing you don't need. The RFID lining is there—invisible, necessary, unobtrusive. Like a good butler.

Price, $95. In saddle brown, black, or cognac."

**What Changed:**
- Opens with sensory question/image (baseball glove)
- Specific detail: "16 stitches per inch," "since 1887"
- Story before product (tannery history)
- Character sketch (grandfather's nod) creates identity connection
- Features woven into narrative ("like a good butler")
- Humor through understatement
- Price last, simple format
- No hype, no urgency, no exclamation

**Techniques Used:**
- Rhetorical question opening
- Specificity stacking (tannery date, stitch count)
- Character development (grandfather)
- Parenthetical aside (baseball gloves impractical)
- Simple statement close

## EXAMPLE 2: WOMEN'S CASHMERE SWEATER

### ❌ BEFORE

"Experience ultimate luxury with our incredibly soft cashmere sweater! This timeless piece features a classic crew neck and ribbed cuffs. Made from 100% Grade A Mongolian cashmere. Machine washable for easy care. Versatile enough to dress up or down. Perfect for any occasion! Available in 8 beautiful colors. Reg. $298, NOW ONLY $198! Limited quantities—order today!"

**Problems:**
- "Ultimate luxury" = meaningless
- Multiple exclamation points
- "Timeless," "classic," "versatile" = empty words
- Urgent discount tactics
- "Perfect for any occasion" = everything/nothing
- No story, no context
- Talking AT customer, not TO them

### ✅ AFTER (Peterman Style)

"In the high plateaus of Inner Mongolia, where winter temperatures drop to -40°F, the cashmere goats grow an undercoat so fine that it takes four goats to make one sweater. The herders comb it out by hand each spring—they don't shear, they comb. Slowly. This is why it's soft.

This particular yarn comes from a women's cooperative near Erdenet. Third generation. They card, spin, and dye using methods their grandmothers would recognize. The woman who knit your sweater—her name is on a card inside—has been doing this since she was twelve. She's 47 now.

Crew neck. Long enough to cover what you want covered. Ribbed cuffs that won't stretch out because they're knit separately and joined. (Yes, it adds time. Yes, it matters.) The color they call Camel Brown is actually closer to the color of sand at Gobi Desert sunset, but you don't name colors by committee.

You can wash this in a machine on the wool cycle with cold water, though we can't imagine why you'd want to. Hand wash takes four minutes.

Price, $298. In eight colors including that Gobi brown. Sizes XS-XL."

**What Changed:**
- Opens with place and process (Mongolia, -40°F)
- Specific makers (women's cooperative, knitter's name)
- Explains why it's good (combing vs. shearing)
- Parenthetical commentary adds personality
- Practical details woven in (washing, sizing)
- Price is price—no "only," no urgency
- Story creates value, not adjectives
- Reader learns something interesting

**Techniques Used:**
- Scene-setting (Mongolia, temperature)
- Compressed biography (knitter background)
- Specificity stacking (4 goats, 47 years old, 3rd generation)
- Parenthetical asides (adds time/matters, can't imagine why)
- Sensory detail (Gobi sunset sand)

## EXAMPLE 3: MEN'S FIELD JACKET

### ❌ BEFORE

"Our rugged field jacket is perfect for adventure! Water-resistant canvas with multiple pockets for all your gear. Vintage-inspired military styling meets modern functionality. Comfortable fit, durable construction, timeless design. Great for hiking, camping, or everyday wear. Built to last! Shop now."

**Problems:**
- "Perfect for adventure!" = empty promise
- "Vintage-inspired" but no actual vintage reference
- Feature list without context
- "Built to last" with no proof
- "Timeless" cliché
- No personality, could be any brand

### ✅ AFTER (Peterman Style)

"The British called them 'smocks' during the First War—loose canvas pullovers the officers wore over their uniforms in the trenches of the Somme. Not for warmth, though they helped with that. For pockets. Field glasses, maps, compass, writing kit, letters from home. Everything at hand when you needed it, because the trenches were too narrow to wear a pack.

This one isn't a reproduction—it's a rethinking. Same canvas weight (12 oz.), same idea (eight pockets, each placed where you'd actually use it), but cut for someone who isn't running through barbed wire. The left chest pocket fits a Moleskine notebook exactly. The right holds your phone without looking like it was designed to hold your phone. Two at the hips: right for keys, left for whatever you're always losing.

Water-resistant but not waterproof, which is honest. Breaks in rather than breaks down. The arms will show creases at the elbows after a month or so. That's how you know it's working.

Price, $265. In British khaki or field gray. Sizes S-XXL, and yes, we actually measured on real humans with different builds."

**What Changed:**
- Historical context (WWI officers, trenches)
- Explains why it exists (pocket placement problem)
- "Rethinking not reproduction" = honest positioning
- Specific details (12 oz. canvas, Moleskine fit, 8 pockets)
- Anticipates objection (not waterproof, but honest)
- Humor (whatever you're always losing)
- Philosophy (breaks in, not breaks down)
- Price justified through story

**Techniques Used:**
- Historical miniature (WWI smocks)
- Specificity (canvas weight, pocket count, notebook brand)
- Honesty within romance (not waterproof)
- Second-person address (implied "you")
- Simple statement (that's how you know it's working)

## EXAMPLE 4: FOUNTAIN PEN

### ❌ BEFORE

"Discover the art of fine writing with our luxury fountain pen! Features a smooth German nib, elegant design, and comes in a beautiful gift box. Perfect gift for executives, writers, or anyone who appreciates the finer things. Makes a statement at any meeting! Lifetime warranty included. $185"

**Problems:**
- "Luxury" and "elegant" = vague
- "Perfect gift" = says nothing
- "Makes a statement" = what statement?
- "Anyone who appreciates the finer things" = condescending
- No story, no history, no reason

### ✅ AFTER (Peterman Style)

"Most people under 40 have never used a fountain pen. They've seen them in movies—signing treaties, writing in leather journals during train journeys through Europe—but they've never held one.

You should.

Not because it's refined or because it makes you look serious in meetings (though it will). Because it changes what writing feels like. You have to slow down. Not much—just enough to make contact with what you're writing instead of transcribing what you're thinking. The nib is German, from Osmiroid, a company that's been making them since 1924. It's slightly softer than their #4 grade, which means your handwriting will look better than it actually is.

The body is turned from a single piece of ebonite—a hard rubber that was used for telephone casings in the 1940s before anyone knew what plastic would become. Weighs almost nothing. Won't crack if you drop it, though we hope you won't.

Comes with a piston converter so you can use bottled ink, plus six cartridges to start. The box is plain cardboard because we spent the money on the pen instead. Lifetime guarantee on the nib, which is where it matters.

Price, $185. In black or Bombay red."

**What Changed:**
- Opens with cultural observation (under 40, movies)
- Direct address: "You should"
- Explains why, not just what (changes writing feel)
- Specific makers (Osmiroid, 1924, #4 grade)
- Material story (ebonite, telephone history)
- Honest about packaging (plain cardboard, money on pen)
- Guarantee positioned as serious, not sales tactic

**Techniques Used:**
- Cultural context (generational observation)
- Direct address (You should)
- Historical connection (telephone casings, 1940s)
- Specificity (Osmiroid, grade #4, 1924)
- Honest aside (plain box, where money went)
- Philosophy (contact with writing vs transcription)

## EXAMPLE 5: TRAVEL DUFFEL BAG

### ❌ BEFORE

"Take your travels to the next level with our premium leather duffel! Spacious main compartment with interior pockets. Adjustable shoulder strap. Genuine full-grain leather. Airport-friendly size. Perfect for weekend getaways or business trips. Sophisticated style that never goes out of fashion. $425"

**Problems:**
- "Take to next level" = meaningless
- "Premium," "sophisticated," "never goes out of fashion" = empty
- Feature list without story
- No reason to believe quality claims
- Generic travel language

### ✅ AFTER (Peterman Style)

"The overnight bag that Douglas Fairbanks carried to Tangier in 1926 held: two linen suits, three silk shirts, a bottle of gin disguised as aftershave, and a loaded pistol he never intended to use. The bag itself was more important than what was in it. It said: I travel light because I know where I'm going.

This one says the same thing.

Made in a workshop outside Tuscany where they've been doing leather since leather meant saddles, not accessories. The hides are vegetable-tanned for six months, which means they'll darken and develop character instead of wearing out. One main compartment because you're not the kind of person who needs seventeen organizational pockets. An adjustable strap that's long enough for your shoulder or short enough to carry by hand, depending on whether you want to look like you're rushing.

Fits in the overhead bin on every aircraft except regional props, and if you're flying on regional props, you have bigger problems than your bag. Two outside pockets sized for passport and paperback novel, the things you need without unpacking. Interior pocket for whatever you don't want the security scanner to see—though we assume that's just your grandmother's jewelry.

Price, $425. In cognac brown or black. Both age well."

**What Changed:**
- Opens with character (Douglas Fairbanks, Tangier, 1926)
- Inventory of what he carried adds personality
- "It said..." = product as statement without saying it
- Workshop story (Tuscany, saddles-to-accessories)
- Specific process (6 months vegetable tanning)
- Philosophy (not 17 pockets—you're better than that)
- Practical honesty (regional props problem)
- Humor (grandmother's jewelry)
- Both colors mentioned as aging well (quality signal)

**Techniques Used:**
- Historical character sketch (Douglas Fairbanks)
- Catalog/inventory (what he carried)
- Compressed backstory (workshop history)
- Specificity (6 months, regional props)
- Assumed sophistication (you're not that person)
- Humor through parenthetical

## EXAMPLE 6: WOMEN'S ANKLE BOOTS

### ❌ BEFORE

"Step into style with our luxe ankle boots! Buttery-soft Italian leather with a comfortable 2" heel. Perfect for work or weekend. Versatile enough to pair with anything from jeans to dresses. Quality craftsmanship in every stitch. Available in three gorgeous colors. Treat yourself—you deserve it! $295"

**Problems:**
- "Step into style" = cliché opening
- "Luxe," "buttery-soft," "gorgeous" = generic adjectives
- "You deserve it" = presumptuous
- "Perfect for work or weekend" = says nothing
- Exclamation point
- No story, no maker, no reason

### ✅ AFTER (Peterman Style)

"In a workshop in Le Marche, Italy—the boot-making region even Italians respect—there's a man named Giulio who has strong opinions about heels. Two inches, he says. Not two-and-a-quarter, not one-and-three-quarters. Two inches is where your weight falls forward just enough to make you walk differently without making you teeter. He's been making boots for 40 years. We're inclined to believe him.

These boots took him three days, start to finish. The leather comes from Tuscany, tanned for eight months until it's soft enough to feel like it's already been broken in but strong enough to last a decade. He cuts each piece from a paper pattern his father made in 1968. Stitches the uppers by hand, 14 stitches per inch. The soles are Vibram—Italian rubber that won't slip on marble floors or wet sidewalks, though it's thick enough that you can't feel every crack in the pavement.

They'll fit snug at first. After a week, they'll fit perfectly. After a year, they'll fit like they were made for you specifically, which, in a sense, they were.

Price, $295. In cognac brown, black, or charcoal. Sizes 6-11, including half sizes."

**What Changed:**
- Opens with place and person (Giulio in Le Marche)
- Explains why 2" heel specifically (Giulio's opinion)
- Maker biography (40 years, father's pattern from 1968)
- Process details (3 days, 8 months tanning, 14 stitches)
- Practical benefits woven in (Vibram, won't slip)
- Honest about fit progression (snug → perfect → yours)
- Price justified through craft story

**Techniques Used:**
- Character introduction (Giulio)
- Specificity (2 inches, 40 years, 1968 pattern, 14 stitches)
- Maker authority (his opinion validated by experience)
- Process explanation (why soft yet strong)
- Time progression (week → year → lifetime)
- Parenthetical philosophy (in a sense, made for you)

## TRANSFORMATION FORMULA

### STEP 1: Kill the Opening
**Delete:** "Introducing," "Discover," "Experience," "Step into"  
**Replace with:** Story, scene, question, or character

### STEP 2: Find the Real Story
**Ask:**
- Where was this made?
- Who made it?
- Why does it exist?
- What historical precedent?
- What problem did it solve originally?

### STEP 3: Get Specific
**Replace vague with precise:**
- "Premium" → "14 stitches per inch"
- "Quality" → "Vegetable-tanned for 6 months"
- "Comfortable" → "2-inch heel that shifts weight forward just enough"

### STEP 4: Add a Person
**Options:**
- The maker (Giulio, 40 years experience)
- Historical figure (Douglas Fairbanks in Tangier)
- Implied user (your grandfather would nod)
- You, the narrator (I thought...)

### STEP 5: Weave Features
**Transform list into narrative:**
- Not: "Features 8 pockets"
- Yes: "Eight pockets, each placed where you'd actually use it"

### STEP 6: Close Simply
**Delete:** Urgency, hype, calls to action  
**Replace with:** Image, statement, or natural trail-off  
**Then:** Price, sizing, done

## COMMON TRANSFORMATIONS

### HYPE → SPECIFICITY
- "Amazing quality!" → "14 stitches per inch, the same count used in pre-war Savile Row"
- "Incredibly soft!" → "Tumbled for 40 hours until it feels broken in"
- "Perfect fit!" → "Cut using a 1968 pattern that's been adjusted exactly twice"

### FEATURES → STORY
- "Water-resistant coating" → "Not waterproof but honest—resists rain for 20 minutes, enough to get to shelter"
- "Multiple pockets" → "Eight pockets because that's how many things you actually need at hand"
- "Durable construction" → "The same leather used in saddles, which take more punishment than you ever will"

### MARKETING SPEAK → PETERMAN VOICE
- "Perfect for the modern man" → "Your grandfather would recognize this"
- "Elevate your style" → "It says: I know what I'm doing"
- "Limited time offer" → [Delete completely]
- "You deserve it" → [Delete completely]

## THE TRANSFORMATION TEST

**Take any generic copy and ask:**

1. **Where's the story?** (Must exist)
2. **Who made this?** (Find the maker)
3. **What's the specific detail?** (Numbers, measurements, dates)
4. **Where's the second person?** (Add "you")
5. **What historical context?** (Find the precedent)
6. **Where's the honesty?** (Admit limitations)
7. **What's the simple close?** (Remove hype)

**If you can answer all 7 → You've got Peterman voice**

## MADISON IMPLEMENTATION

### WHEN GENERATING COPY:

**Step 1:** Feed Madison the product info + research  
**Step 2:** Specify "Peterman voice"  
**Step 3:** Check output against this document  
**Step 4:** Look for red flags (see Quick Reference)  
**Step 5:** Read aloud—does it sound like a person?  
**Step 6:** Add one specific detail if missing  
**Step 7:** Remove any marketing words that snuck in

### RED FLAG CHECKLIST:

- [ ] No "amazing," "perfect," "luxury"
- [ ] No exclamation points
- [ ] Story before product
- [ ] At least one specific measurement/date/name
- [ ] Price last, simple format
- [ ] Second person used somewhere
- [ ] Sounds like a friend, not a brand

## FINAL NOTES

**Remember:**
- Peterman sells identity, not objects
- Story creates desire, features confirm decision
- Specific details build trust more than adjectives
- Honesty within romance is the key
- If it sounds like an ad, you've failed

**The goal:**
Make them want the story first.  
The product is how they get it.

*Transform generic → authentic*  
*Transform features → story*  
*Transform hype → trust*

**That's the Peterman way.**`,

  joyner: `# Mark Joyner — The Irresistible Simplifier

## When to Channel Joyner
- Business strategy and high-level marketing methodology
- Product positioning that needs to cut through noise
- Situations where you need to simplify complexity into a "formula"
- When the audience feels overwhelmed and needs a clear path
- Sales copy that relies on an "Irresistible Offer"

## Core Principles
1. **Simplicity is Power**
   - Reduce complex business strategies to elegant, 3-step formulas.
   - If it's not simple, it's not actionable.
2. **The Irresistible Offer (TIO)**
   - An offer where the ROI is so clear, you'd be a fool to pass it up.
   - Components: High ROI, Touchstone, Believability.
3. **The Great Formula**
   - 1. Create The Irresistible Offer.
   - 2. Present it to a Thirsty Crowd.
   - 3. Sell them a Second Glass.
4. **Conversational Authority**
   - Speak directly to the reader ("Are you back?", "Make sense?").
   - Challenge them to disprove you ("Go on, tough guy—give it a shot").

## Signature Techniques
- **The Thirsty Crowd Metaphor:** Transform "target market" into visceral imagery of people dying of thirst.
- **The Formula Reveal:** Build anticipation, then reveal a shockingly simple 3-step framework.
- **The Defiant Challenge:** Challenge the reader to find an exception to your rule, then demolish objections.
- **The Chunking Frame:** Position your formula as the ultimate way to organize complex information (7±2 rule).
- **The Historical Proof:** Validate formulas with iconic cases (Ford, Domino's, Columbia House).

## Rhythm & Structure
- **Punchy & Direct:** Short sentences for impact. "That's it." "Simple as pie."
- **Interrogative Engagement:** Frequent questions to check in. "Read on..." "Make sense?"
- **Visual Formatting:** Use bolding for formulas, numbered lists for steps.
- **The "Reveal" Structure:** Setup -> Story/Evidence -> The Simple Formula -> "That's it."

## Example Transformation
**Before:** "We have a comprehensive marketing strategy that involves optimizing your product appeal, finding the right audience segments, and maximizing customer lifetime value through retention."

**After (Joyner style):**
"Let's cut through the rubbish. You don't need a 50-page marketing plan. You need The Great Formula.
1. Create an Irresistible Offer (make it foolish to refuse).
2. Put it in front of a Thirsty Crowd (people actively looking for it).
3. Sell them a Second Glass (upsell the backend).
That's it. Every successful business in history fits into these three steps. I defy you to find one that doesn't."

## Checklist
- Did you reduce the complexity to a simple (ideally 3-step) formula?
- Did you use the "Thirsty Crowd" or physical metaphors?
- Is the offer positioned as "Irresistible" (High ROI)?
- Did you challenge the reader or speak directly to them?
- Did you end a section with "That's it" or a similar definitive closer?`,

  caples: `# John Caples — Tested Headlines & Curiosity Gaps

## When to Channel Caples
- Headlines, subject lines, and opening hooks that must grab attention
- A/B testing scenarios where data-driven approaches matter
- Situations requiring curiosity gaps that demand resolution
- When you need to test multiple approaches and let data decide

## Core Principles
1. **Headline is Everything**
   - 80% of success comes from the headline
   - Spend disproportionate time crafting and testing headlines
   - A weak headline kills even the best copy

2. **Test Everything**
   - Never assume—test headlines, offers, angles
   - Let data guide decisions, not opinions
   - Small changes can yield massive differences

3. **Curiosity Gaps**
   - Create gaps in knowledge that must be filled
   - "They Laughed When I Sat Down at the Piano—But When I Started to Play!"
   - Promise a revelation, then deliver it

4. **Specificity Wins**
   - "How a Fool Stunt Made Me a Star Salesman" beats "How to Sell"
   - Specific situations, numbers, and outcomes
   - Concrete beats abstract every time

5. **Benefit-First Thinking**
   - Lead with what the reader gets, not what you're selling
   - "Lose 10 Pounds in 10 Days" not "Our New Diet Program"
   - Reader-centric, not product-centric

## Signature Techniques
- **Curiosity Headlines:** "They Laughed When I Sat Down at the Piano..."
- **How-To Headlines:** "How I Improved My Memory in One Evening"
- **Question Headlines:** "Do You Make These Mistakes in English?"
- **Testimonial Headlines:** "Little-Known Ways to a $100,000 Income"
- **News Headlines:** "New Discovery Adds 6 Inches to Your Height"

## Rhythm & Structure
- Headline must stop the reader immediately
- First paragraph must deliver on headline promise
- Use subheads to maintain curiosity and guide reading
- Test multiple headlines—let data decide the winner

## Example Transformation
**Before:** "Our New Candle Collection is Here"

**After (Caples style):**  
"They Laughed When I Said I Could Make a Candle That Burns for 60 Hours—But When They Saw the Test Results..."

Or: "How a 19th-Century French Perfumer's Secret Led to Our Best-Selling Candle (And Why Most Companies Don't Want You to Know)"

## Checklist
- Does the headline create curiosity that must be satisfied?
- Is it specific rather than generic?
- Does it promise a clear benefit or revelation?
- Would you want to read more after seeing just the headline?
- Have you tested multiple headline variations?
- Does the first paragraph deliver on the headline promise?
- Is it reader-centric, not product-centric?`
};

/**
 * Get author profile by name
 * @param authorName - Name of the author (halbert, ogilvy, hopkins, schwartz, peterman)
 * @returns Author profile markdown content or empty string
 */
export function getAuthorProfile(authorName: string): string {
  const normalized = authorName.toLowerCase().replace(/[^a-z]/g, '');
  return AUTHOR_PROFILES[normalized] || '';
}

/**
 * Get all available author profiles
 * @returns Object mapping author names to their profiles
 */
export function getAllAuthorProfiles(): Record<string, string> {
  return AUTHOR_PROFILES;
}

/**
 * Build a formatted section with all author profiles for inclusion in prompts
 * @returns Formatted string with all author profiles
 */
export function buildAuthorProfilesSection(): string {
  const parts: string[] = [];
  
  parts.push('\n╔══════════════════════════════════════════════════════════════════╗');
  parts.push('║              LEGENDARY COPYWRITER PROFILES                        ║');
  parts.push('║         (Reference these styles when generating content)          ║');
  parts.push('╚══════════════════════════════════════════════════════════════════╝');
  parts.push('');
  parts.push('These are the foundational writing styles Madison can channel:');
  parts.push('');
  
  const authorOrder = ['halbert', 'ogilvy', 'hopkins', 'schwartz', 'collier', 'peterman', 'joyner', 'caples'];
  
  authorOrder.forEach((author, index) => {
    const profile = AUTHOR_PROFILES[author];
    if (profile) {
      parts.push(`━━━ ${index + 1}. ${profile.split('\n')[0].replace('# ', '').replace(' — ', ' — ')} ━━━`);
      parts.push(profile);
      parts.push('');
      parts.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      parts.push('');
    }
  });
  
  // Add Peterman Quick Reference Guide (daily use cheat sheet)
  const quickRef = AUTHOR_PROFILES['peterman_quick_reference'];
  if (quickRef) {
    parts.push('\n╔══════════════════════════════════════════════════════════════════╗');
    parts.push('║        J. PETERMAN QUICK REFERENCE GUIDE                        ║');
    parts.push('║              (Daily Use Cheat Sheet for Madison)                 ║');
    parts.push('╚══════════════════════════════════════════════════════════════════╝');
    parts.push('');
    parts.push('This is your go-to reference when writing in Peterman style:');
    parts.push('');
    parts.push(quickRef);
    parts.push('');
    parts.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    parts.push('');
  }
  
  // Add Peterman Transformation Examples (before/after demonstrations)
  const transformations = AUTHOR_PROFILES['peterman_transformations'];
  if (transformations) {
    parts.push('\n╔══════════════════════════════════════════════════════════════════╗');
    parts.push('║        PETERMAN TRANSFORMATION EXAMPLES                       ║');
    parts.push('║         (Before/After Copy Demonstrations)                     ║');
    parts.push('╚══════════════════════════════════════════════════════════════════╝');
    parts.push('');
    parts.push('Study these real transformations from generic marketing copy → authentic Peterman voice.');
    parts.push('Use the transformation notes to understand WHY the changes work.');
    parts.push('Apply these techniques to transform any generic copy into Peterman style.');
    parts.push('');
    parts.push(transformations);
    parts.push('');
    parts.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    parts.push('');
  }
  
  parts.push('⚠️ CRITICAL: When channeling these authors, extract their STYLE and TECHNIQUES,');
  parts.push('not literal product references from examples. Always apply techniques to the');
  parts.push('user\'s actual products and brand context.');
  
  // Add Peterman Style Engine (machine-readable profile)
  try {
    const petermanEngine = buildPetermanStyleEngineSection();
    parts.push(petermanEngine);
  } catch (error) {
    console.error('Error loading Peterman Style Engine:', error);
    // Continue without style engine if there's an error
  }
  
  return parts.join('\n');
}

