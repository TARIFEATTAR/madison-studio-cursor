markdown# The Squad System - Complete Specification

**Purpose:** The definitive guide to preventing "Frankenstein Copy" through intelligent squad-based content generation.

**Last Updated:** December 2024  
**Version:** 1.0

---

## Table of Contents

1. [Overview](#overview)
2. [The Universal Framework](#the-universal-framework)
3. [Copy Squads](#copy-squads)
4. [Visual Squads](#visual-squads)
5. [Router Decision Logic](#router-decision-logic)
6. [Critical Implementation Rules](#critical-implementation-rules)
7. [Database Integration](#database-integration)
8. [Examples](#examples)

---
## Overview

### The Problem: Frankenstein Copy

When AI systems try to channel multiple masters simultaneously, they produce generic, confused content that satisfies no one. Asking an AI to "write like Ogilvy (clinical facts), Peterman (wandering romance), and Clow (minimalist disruption)" creates contradictory constraints that result in bland, unfocused output.

### The Solution: The Squad System

Madison operates like a **Creative Director managing a team of specialists**. For each brief:

1. **The Router Agent** analyzes the task
2. **Selects ONE primary squad** to lead
3. **Blocks all conflicting squads** (negative constraints)
4. **The Generator** channels only that squad's principles

This ensures every piece of content has a **distinct, strong point of view**.

---

## The Universal Framework

### Eugene Schwartz (Always Active)

**Role:** The Operating System  
**Applies To:** All content, regardless of squad  
**Storage Location:** Silo A (full markdown documents)

Eugene Schwartz is not a "writer" - he is a **strategist**. His five awareness stages define the **structure of the argument**, not the voice or style.

#### The Five Awareness Stages
```typescript
type AwarenessStage = 
  | 'unaware'           // Customer doesn't know they have a problem
  | 'problem_aware'     // Knows the problem, not the solution
  | 'solution_aware'    // Knows solutions exist, evaluating options
  | 'product_aware'     // Knows your product, needs final push
  | 'most_aware';       // Ready to buy, just needs the offer
```

#### Stage Templates

**Unaware (Stage 1):**
```
Structure:
1. Open with a relatable observation
2. Reveal the hidden problem
3. Show why it matters
4. Introduce your solution category
```

**Problem-Aware (Stage 2):**
```
Structure:
1. Validate their pain point immediately
2. Explain why the problem persists
3. Present your unique mechanism
4. Provide proof it works
```

**Solution-Aware (Stage 3):**
```
Structure:
1. Acknowledge they're evaluating options
2. Highlight the unique aspect of your approach
3. Compare (subtly) to alternatives
4. Remove final objections
```

**Product-Aware (Stage 4):**
```
Structure:
1. Reinforce their good judgment
2. Add new information (ingredient, use case, etc.)
3. Create urgency without pressure
4. Make buying easy
```

**Most-Aware (Stage 5):**
```
Structure:
1. The offer (clear and prominent)
2. Bonuses/guarantees
3. Single CTA
4. Minimal copy
```

#### Database Query for Schwartz Templates
```sql
SELECT template_content 
FROM schwartz_templates 
WHERE stage = 'problem_aware';
-- Returns full markdown template for that stage
```

**Critical Rule:** Schwartz templates apply to **all squads**. Whether you're writing as The Scientists or The Storytellers, you still follow the awareness stage structure.

---

## Copy Squads

### Squad Selection Principle

**Choose ONE squad per brief.** The squad determines voice, tone, and language style. Never mix squad principles in a single piece of content.

---

### THE SCIENTISTS

**Philosophy:** Trust is earned through specificity, data, and logical proof.

**Masters:**
- **David Ogilvy** (Specificity & Facts)
- **Claude Hopkins** (Reason-Why)
- **Rosser Reeves** (Unique Selling Proposition)

#### Use When

| Condition | Threshold | Example |
|-----------|-----------|---------|
| Product Price | > $100 | $180 serum, $250 supplement |
| Audience Stage | Problem-Aware or Solution-Aware | Comparing anti-aging options |
| Product Type | Technical/Clinical | Skincare with actives, supplements |
| Audience Disposition | Skeptical | Educated buyers, professionals |
| Channel | Product pages, "Why It Works" emails | Not social ads |

#### Forbidden Language

**Never use:**
- Romantic imagery ("sun-kissed", "journey", "embrace")
- Vague claims ("amazing", "incredible", "life-changing")
- Metaphors or poetry
- Wandering narratives
- Emotional appeals without data

**Banned words:**
```
whimsical, wandering, poetic, mysterious, enchanting, 
dreamy, ethereal, magical, transcendent, soul, essence
```

#### Master Principles

**Ogilvy: Specificity**
```
Bad:  "Our serum is highly effective"
Good: "Contains 12% niacinamide to reduce redness in 4 hours"

Bad:  "Made with premium ingredients"
Good: "Formulated with Cambodian oud aged 7 years in teak barrels"
```

**Hopkins: Reason-Why**
```
Structure:
1. State the benefit
2. Explain the mechanism
3. Provide proof
4. Remove risk

Example:
"Reduces fine lines by 23% in 8 weeks. 
The encapsulated retinol penetrates deeper without irritation.
Clinical study of 200 subjects, peer-reviewed.
100% money-back guarantee."
```

**Reeves: USP**
```
What makes this product uniquely different?
Can competitors claim the same thing?
Is it meaningful to customers?

Example:
"The only serum with time-released retinol AND bakuchiol 
for sensitive skin users."
```

#### Example Output

**Brief:** Write product page copy for a $180 anti-aging serum for problem-aware customers.

**Output:**
```
Retinol Without the Redness

For years, dermatologists recommended retinol for wrinkles—
but sensitive skin couldn't tolerate it.

Our encapsulated retinol delivers 0.5% pure tretinoin 
gradually over 8 hours. This eliminates the irritation 
while maintaining clinical efficacy.

In a 12-week study of 200 subjects:
- 87% saw reduced fine lines
- 92% experienced zero redness
- Average wrinkle depth reduced by 23%

The formula combines:
→ Time-released retinol (0.5%)
→ Bakuchiol (1%) - plant-based retinol alternative
→ Ceramides (3%) - barrier repair

Dermatologist-tested. Non-irritating. Results in 8 weeks.

[Shop Now - $180]
```

**Notice:**
- Opens with the problem (Schwartz: Problem-Aware)
- Specific percentages and timelines
- Clinical study data
- Clear mechanism explanation
- No romantic language
- Factual, trustworthy tone

#### Database Query
```sql
SELECT full_content 
FROM madison_masters 
WHERE master_name IN ('OGILVY_SPECIFICITY', 'HOPKINS_REASON_WHY', 'REEVES_USP')
AND squad = 'THE_SCIENTISTS'
ORDER BY master_name;
```

**Returns:** Full markdown documents for each master (not chunked).

---

### THE STORYTELLERS

**Philosophy:** Brand loyalty is built through emotion, narrative, and authenticity.

**Masters:**
- **J. Peterman** (Romance & Wandering Narrative)
- **Leo Burnett** (Inherent Drama)
- **Dan Wieden** (Authenticity & Humanity)

#### Use When

| Condition | Threshold | Example |
|-----------|-----------|---------|
| Product Price | < $100 or luxury lifestyle | $45 candle, $200 fragrance |
| Audience Stage | Unaware or Most-Aware | Discovery or loyal customers |
| Product Type | Lifestyle, Fragrance, Candles | Not clinical/technical |
| Audience Disposition | Loyal, emotionally-driven | Brand lovers |
| Channel | Welcome emails, Instagram, "Our Story" | Not product specs |

#### Forbidden Language

**Never use:**
- Clinical terminology ("efficacy", "clinical study", "active ingredients")
- Percentages or data points (unless poetic)
- Lists of specifications
- Comparative claims
- Overly logical structure

**Banned words:**
```
efficacy, clinical, proven, tested, study, subjects,
formula, mechanism, active, ingredient percentage
```

#### Master Principles

**Peterman: Romance**
```
Structure:
1. Transport to a place/moment
2. Build sensory detail
3. Connect to emotion
4. Subtle product integration

Example:
"The sun had just begun to set over the fields of Grasse.
The air hung thick with the scent of jasmine—
not the jasmine you know, but the wild, green kind
that only blooms at dusk.

This is where we found the heart of our fragrance."
```

**Burnett: Inherent Drama**
```
Find the drama already in the product:
- The origin story of an ingredient
- The moment of discovery
- The transformation it creates

Example:
"Oud doesn't grow. It forms. When the Aquilaria tree 
is wounded, it bleeds a dark resin to heal itself.
This resin, aged for decades, becomes oud.

You're not buying a candle. You're burning a tree's
memory of survival."
```

**Wieden: Authenticity**
```
Speak like a real person, not a brand:
- Use contractions
- Admit imperfections
- Share real moments
- Avoid marketing speak

Example:
"We're not going to tell you this candle will change your life.
It won't. It's a candle.

But if you light it on a Tuesday night when you're 
exhausted, and the scent reminds you of your grandmother's 
garden, well... that's not nothing."
```

#### Example Output

**Brief:** Write Instagram caption for a limited edition rose candle for product-aware customers.

**Output:**
```
There's a valley in Bulgaria where roses bloom at dawn.

Not the roses you buy at the store—these are Rosa damascena,
the ancient kind, with petals so fragile they must be 
picked by hand before sunrise.

We traveled there in May. The air was cold, the light
was pink, and we understood: this is what rose is 
supposed to smell like. Not sweet. Not powdered.
Green and alive and fleeting.

This candle burns for 60 hours, but that morning
in Bulgaria? We'll never get it back.

Only 200 made. Link in bio.
```

**Notice:**
- Opens with a place (Peterman)
- Sensory detail ("cold air", "pink light")
- Emotional undertone (fleeting beauty)
- Authentic voice ("We'll never get it back")
- No data points or clinical language
- Subtle scarcity ("Only 200 made")

#### Database Query
```sql
SELECT full_content 
FROM madison_masters 
WHERE master_name IN ('PETERMAN_ROMANCE', 'BURNETT_DRAMA', 'WIEDEN_AUTHENTICITY')
AND squad = 'THE_STORYTELLERS'
ORDER BY master_name;
```

---

### THE DISRUPTORS

**Philosophy:** In a noisy world, you must break the pattern to be seen.

**Masters:**
- **Lee Clow** (Think Different - Disruption)

#### Use When

| Condition | Threshold | Example |
|-----------|-----------|---------|
| Channel | Paid ads, subject lines | Facebook, TikTok, email open rates |
| Goal | Attention, not conversion | Top of funnel |
| Context | Scroll-stopping required | Crowded feeds |
| Tone | Bold, confident | Not apologetic |

#### Forbidden Language

**Never use:**
- Long explanations
- Safe, expected phrasing
- Corporate speak
- Qualifiers ("maybe", "possibly", "try")

**Banned words:**
```
perhaps, possibly, consider, maybe, might, could,
we believe, in our opinion, arguably
```

#### Master Principles

**Clow: Disruption**
```
Techniques:
1. Contradiction ("Stop buying perfume that vanishes")
2. Provocation ("Most skincare is a lie")
3. Brevity (5-7 words max for headlines)
4. Pattern interruption (say what competitors won't)

Example Headlines:
"Throw away your serums"
"Your moisturizer is making it worse"
"Stop buying candles that smell like headaches"
```

#### Example Output

**Brief:** Write a Facebook ad headline for anti-aging serum to cold audience.

**Output:**
```
Headline: "Retinol is hurting your skin"

Body:
Not the ingredient. The delivery.

Most retinol serums dump the active on your face all at once.
That's why you're red and peeling.

We encapsulate it. Time-release over 8 hours.
Same results. Zero irritation.

[Shop the Fix]
```

**Notice:**
- Provocative opening (contradicts expectations)
- Short, punchy sentences
- No wandering narrative
- Direct call-to-action
- Pattern interruption (challenges industry norm)

#### Database Query
```sql
SELECT full_content 
FROM madison_masters 
WHERE master_name = 'CLOW_DISRUPTION'
AND squad = 'THE_DISRUPTORS';
```

---

## Visual Squads

Visual style conflicts are even more severe than copy conflicts. You cannot create a "minimalist lifestyle" photograph—these are opposing aesthetics.

---

### THE MINIMALISTS

**Philosophy:** Clarity through subtraction. Let the product speak.

**Visual Masters:**
- **Richard Avedon** (Stark white backgrounds, subject isolation)
- **Apple Design Language** (Whitespace as a luxury signal)
- **Jony Ive Principles** (Restraint, precision, honesty)

#### Use When

| Condition | Threshold | Example |
|-----------|-----------|---------|
| Product Type | Luxury skincare, tech | $200+ serums, devices |
| Channel | Product pages, email | Not social storytelling |
| Brand Positioning | Clinical, professional | Medical-grade, minimalist brands |
| Price Point | > $150 | Premium positioning |

#### Forbidden Styles

**Never use:**
- Busy backgrounds (wood, marble, fabrics)
- Multiple products in frame
- Lifestyle context (hands, tables, props)
- Ornate borders or frames
- Vintage textures
- Multiple fonts
- Gradients or color overlays

#### Composition Rules

**Background:**
- Pure white (#FFFFFF) or vellum cream (#FFFCF5)
- Zero texture
- No shadows (or minimal, soft directional)

**Product Placement:**
- Centered, isolated
- Single product only
- 60% negative space minimum
- Product takes 30-40% of frame

**Typography:**
- Single serif font (Cormorant Garamond)
- Minimal text (product name + one benefit)
- Black (#1A1816) or charcoal (#3D3935)
- No decorative elements

**Lighting:**
- Soft, directional (simulates north-facing window)
- No harsh shadows
- Even illumination
- Clinical, not dramatic

#### Image Generation Prompt Template
```
[Product name] on pure white background, 
Richard Avedon style product photography, 
centered composition, clinical lighting, 
soft directional light from top-left, 
no shadows, isolated subject, 
minimalist aesthetic, professional commercial photography,
hyperrealistic, 8k resolution 
--ar 1:1 --style raw --no props --no context
```

#### Example Prompts

**Skincare serum:**
```
Luxury anti-aging serum bottle on pure white background,
Richard Avedon style, centered composition,
glass bottle with gold cap, clinical photography,
soft directional lighting, no shadows,
minimalist, hyperrealistic --ar 1:1 --style raw
```

**Supplement bottle:**
```
Premium supplement bottle on white background,
Apple product photography style, centered,
matte black bottle with minimal label,
studio lighting, no context, clean aesthetic,
professional commercial photo --ar 4:5 --style raw
```

#### Layout Integration

When compositing with Satori:
```typescript
// Minimalist Layout Rules
const minimalistLayout = {
  background: '#FFFCF5', // Vellum cream
  productImage: {
    width: '40%',
    position: 'center',
    margin: '60px auto'
  },
  typography: {
    fontFamily: 'Cormorant Garamond',
    fontSize: '48px',
    color: '#1A1816',
    textAlign: 'center',
    maxWidth: '60%'
  },
  spacing: {
    padding: '80px',
    lineHeight: 1.2
  },
  restrictions: {
    maxTextLines: 2,
    noDecorations: true,
    noBorders: true
  }
};
```

#### Database Query
```sql
SELECT full_content, example_images 
FROM visual_masters 
WHERE master_name IN ('AVEDON_ISOLATION', 'APPLE_WHITESPACE', 'IVE_RESTRAINT')
AND squad = 'THE_MINIMALISTS'
ORDER BY master_name;
```

---

### THE STORYTELLERS (Visual)

**Philosophy:** Context creates emotion. Show the product in its world.

**Visual Masters:**
- **Annie Leibovitz** (Environmental portraits, narrative)
- **Kinfolk Aesthetic** (Natural light, lifestyle context)
- **Editorial Photography** (Magazine-quality, styled scenes)

#### Use When

| Condition | Threshold | Example |
|-----------|-----------|---------|
| Product Type | Fragrance, candles, lifestyle | Not clinical products |
| Channel | Instagram, brand story | Not product pages |
| Brand Positioning | Romantic, authentic | Not corporate |
| Price Point | $40-$200 | Mid-luxury to luxury |

#### Forbidden Styles

**Never use:**
- Pure white backgrounds
- Clinical lighting
- Isolated products (no context)
- Corporate stock photography
- Sterile environments
- Flash photography

#### Composition Rules

**Background:**
- Natural settings (linen, wood, stone)
- Soft textures (fabrics, organic materials)
- Muted, warm color palettes
- Environmental context (tables, shelves, nature)

**Product Placement:**
- Integrated into scene (not centered)
- Hands in frame (optional)
- Other lifestyle elements (books, plants, textiles)
- Rule of thirds composition

**Typography:**
- Accent font (Crimson Text italic)
- Handwritten feel acceptable
- Text integrated into image (not floating)
- Warm tones (charcoal, sepia)

**Lighting:**
- Golden hour natural light
- Soft window light
- No harsh shadows
- Warm color grading

#### Image Generation Prompt Template
```
[Product] in natural setting, 
Annie Leibovitz style environmental portrait,
lifestyle photography, soft natural window light,
warm color grading, [context elements],
editorial magazine quality, film grain texture,
Kinfolk aesthetic, intimate atmosphere
--ar 4:5 --style raw --no clinical --no white background
```

#### Example Prompts

**Candle in living room:**
```
Luxury rose candle on linen-covered table,
soft afternoon light through sheer curtains,
Annie Leibovitz style, editorial lifestyle photography,
warm muted tones, open book and reading glasses nearby,
cozy intimate atmosphere, film grain,
Kinfolk magazine aesthetic --ar 4:5 --style raw
```

**Fragrance with ingredients:**
```
Oud perfume bottle surrounded by oud wood chips,
natural light on white marble surface,
lifestyle product photography, warm golden hour lighting,
editorial style, organic textures, 
intimate composition --ar 1:1 --style raw
```

#### Layout Integration
```typescript
// Storyteller Layout Rules
const storytellerLayout = {
  background: 'image', // Full-bleed lifestyle photo
  overlay: {
    gradient: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.1))',
    position: 'bottom'
  },
  typography: {
    fontFamily: 'Crimson Text',
    fontStyle: 'italic',
    fontSize: '36px',
    color: '#FFFCF5',
    textAlign: 'left',
    position: 'bottom-left',
    padding: '40px'
  },
  imageStyle: {
    colorGrading: 'warm',
    grain: true,
    vignette: 'subtle'
  }
};
```

#### Database Query
```sql
SELECT full_content, example_images 
FROM visual_masters 
WHERE master_name IN ('LEIBOVITZ_ENVIRONMENT', 'KINFOLK_NATURAL', 'EDITORIAL_LIFESTYLE')
AND squad = 'THE_STORYTELLERS'
ORDER BY master_name;
```

---

### THE DISRUPTORS (Visual)

**Philosophy:** Break visual patterns to stop the scroll.

**Visual Masters:**
- **Terry Richardson** (Flash, raw energy, confrontational)
- **Wes Anderson** (Hyper-symmetry, bold color blocks)
- **Michel Gondry** (Surreal, unexpected compositions)

#### Use When

| Condition | Threshold | Example |
|-----------|-----------|---------|
| Channel | Paid social ads | Facebook, TikTok, Pinterest |
| Goal | Scroll-stopping | Top of funnel awareness |
| Competition | High visual noise | Crowded feeds |
| Brand Tone | Bold, confident | Not subtle or refined |

#### Forbidden Styles

**Never use:**
- Safe, expected layouts
- Subtle compositions
- Muted colors
- Conventional product photography
- Corporate aesthetics

#### Composition Rules

**Background:**
- High contrast (black, neon, bold colors)
- Unexpected colors (not brand palette)
- Graphic, flat design acceptable
- Pattern interruption

**Product Placement:**
- Extreme close-ups OR overhead flat lays
- Asymmetric, off-center
- Multiple angles simultaneously (cubist)
- Unexpected scale

**Typography:**
- Bold, oversized text
- High contrast with background
- Sans-serif, modern fonts
- Text as visual element (not subtle)

**Lighting:**
- Direct flash (Richardson style)
- High contrast, dramatic shadows
- Unconventional light sources
- Hyper-saturated colors

#### Image Generation Prompt Template
```
[Product] on [bold color] background,
high contrast, bold graphic style,
[unexpected angle/composition],
commercial advertising photography,
dramatic lighting, scroll-stopping visual,
modern bold aesthetic
--ar 9:16 --style raw --no subtle --no muted
```

#### Example Prompts

**Serum for social ad:**
```
Anti-aging serum bottle on pure black background,
extreme close-up of dropper,
dramatic side lighting creating strong shadows,
high contrast, bold commercial photography,
Terry Richardson style flash aesthetic,
hyperrealistic product shot --ar 9:16 --style raw
```

**Candle for TikTok:**
```
Rose candle overhead flat lay on hot pink background,
Wes Anderson symmetrical composition,
bold graphic style, centered perfectly,
surrounded by rose petals in perfect circle,
hyperrealistic, bold colors --ar 9:16 --style raw
```

#### Layout Integration
```typescript
// Disruptor Layout Rules
const disruptorLayout = {
  background: '#000000', // Bold, high-contrast
  productImage: {
    width: '80%', // Larger, more dominant
    position: 'center',
    filter: 'contrast(1.2) saturate(1.3)'
  },
  typography: {
    fontFamily: 'Lato',
    fontWeight: 900,
    fontSize: '72px',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    textAlign: 'center',
    letterSpacing: '2px'
  },
  effects: {
    shadows: 'dramatic',
    contrast: 'high',
    colorPop: true
  }
};
```

#### Database Query
```sql
SELECT full_content, example_images 
FROM visual_masters 
WHERE master_name IN ('RICHARDSON_RAW', 'ANDERSON_SYMMETRY', 'GONDRY_SURREAL')
AND squad = 'THE_DISRUPTORS'
ORDER BY master_name;
```

---

## Router Decision Logic

The Router Agent is the "Creative Director" that analyzes each brief and selects the appropriate squads.

### Input Analysis Interface
```typescript
interface BriefAnalysis {
  // Product Context
  productId: string;
  productPrice: number;
  productCategory: 'skincare' | 'fragrance' | 'candle' | 'supplement' | 'other';
  
  // Audience Context
  audienceStage: 'unaware' | 'problem_aware' | 'solution_aware' | 'product_aware' | 'most_aware';
  audienceDisposition: 'skeptical' | 'curious' | 'loyal';
  
  // Channel Context
  channel: 'product_page' | 'email' | 'instagram' | 'facebook_ad' | 'subject_line';
  channelConstraints: {
    characterLimit?: number;
    imageAspectRatio?: string;
  };
  
  // Brand Context (from Brand DNA)
  brandTone: string;
  brandPrimaryColor: string;
  brandSquadPreference?: string; // If brand has a default squad
}
```

### Squad Selection Algorithm
```typescript
async function selectSquads(brief: BriefAnalysis): Promise {
  // ════════════════════════════════════════════════
  // RULE 1: Channel trumps everything for attention-based content
  // ════════════════════════════════════════════════
  if (brief.channel === 'facebook_ad' || brief.channel === 'subject_line') {
    return {
      copySquad: 'THE_DISRUPTORS',
      visualSquad: 'THE_DISRUPTORS',
      primaryCopyMaster: 'CLOW_DISRUPTION',
      reasoning: 'Attention-based channel requires scroll-stopping content'
    };
  }
  
  // ════════════════════════════════════════════════
  // RULE 2: High price + skeptical audience = Scientists
  // ════════════════════════════════════════════════
  if (brief.productPrice > 150 && 
      (brief.audienceStage === 'problem_aware' || brief.audienceStage === 'solution_aware')) {
    return {
      copySquad: 'THE_SCIENTISTS',
      visualSquad: 'THE_MINIMALISTS',
      primaryCopyMaster: 'HOPKINS_REASON_WHY',
      primaryVisualMaster: 'AVEDON_ISOLATION',
      reasoning: 'High-price product with skeptical audience requires clinical trust-building'
    };
  }
  
  // ════════════════════════════════════════════════
  // RULE 3: Lifestyle products = Storytellers
  // ════════════════════════════════════════════════
  if (brief.productCategory === 'fragrance' || brief.productCategory === 'candle') {
    return {
      copySquad: 'THE_STORYTELLERS',
      visualSquad: 'THE_STORYTELLERS',
      primaryCopyMaster: 'PETERMAN_ROMANCE',
      primaryVisualMaster: 'LEIBOVITZ_ENVIRONMENT',
      reasoning: 'Lifestyle products sell through emotion and narrative'
    };
  }
  
  // ════════════════════════════════════════════════
  // RULE 4: Technical products with specs = Scientists
  // ════════════════════════════════════════════════
  if (brief.productCategory === 'skincare' || brief.productCategory === 'supplement') {
    return {
      copySquad: 'THE_SCIENTISTS',
      visualSquad: 'THE_MINIMALISTS',
      primaryCopyMaster: 'OGILVY_SPECIFICITY',
      primaryVisualMaster: 'APPLE_WHITESPACE',
      reasoning: 'Technical products require specific, data-driven communication'
    };
  }
  
  // ════════════════════════════════════════════════
  // RULE 5: Loyal audience + brand building = Storytellers
  // ════════════════════════════════════════════════
  if (brief.audienceDisposition === 'loyal' || brief.audienceStage === 'most_aware') {
    return {
      copySquad: 'THE_STORYTELLERS',
      visualSquad: 'THE_STORYTELLERS',
      primaryCopyMaster: 'WIEDEN_AUTHENTICITY',
      primaryVisualMaster: 'KINFOLK_NATURAL',
      reasoning: 'Loyal customers respond to authentic brand storytelling'
    };
  }
  
  // ════════════════════════════════════════════════
  // DEFAULT: Scientists (safe, trustworthy)
  // ════════════════════════════════════════════════
  return {
    copySquad: 'THE_SCIENTISTS',
    visualSquad: 'THE_MINIMALISTS',
    primaryCopyMaster: 'OGILVY_SPECIFICITY',
    primaryVisualMaster: 'AVEDON_ISOLATION',
    reasoning: 'Default to trust-building approach'
  };
}
```

### Strategy Output Interface
```typescript
interface SquadStrategy {
  // Squad Assignments
  copySquad: 'THE_SCIENTISTS' | 'THE_STORYTELLERS' | 'THE_DISRUPTORS';
  visualSquad: 'THE_MINIMALISTS' | 'THE_STORYTELLERS' | 'THE_DISRUPTORS';
  
  // Master References
  primaryCopyMaster: string; // e.g., 'HOPKINS_REASON_WHY'
  secondaryCopyMaster?: string; // Optional, must be from same squad
  primaryVisualMaster: string; // e.g., 'AVEDON_ISOLATION'
  
  // Negative Constraints (CRITICAL)
  forbiddenCopySquads: string[]; // Squads to block
  forbiddenVisualSquads: string[];
  forbiddenLanguage: string[]; // Specific words/phrases
  forbiddenStyles: string[]; // Visual elements to avoid
  
  // Schwartz Framework
  schwartzStage: 'unaware' | 'problem_aware' | 'solution_aware' | 'product_aware' | 'most_aware';
  
  // Reasoning (for debugging)
  reasoning: string;
}
```

### Example Router Outputs

**Example 1: $250 Anti-Aging Serum for Product Page**
```json
{
  "copySquad": "THE_SCIENTISTS",
  "visualSquad": "THE_MINIMALISTS",
  "primaryCopyMaster": "HOPKINS_REASON_WHY",
  "secondaryCopyMaster": "OGILVY_SPECIFICITY",
  "primaryVisualMaster": "AVEDON_ISOLATION",
  "forbiddenCopySquads": ["THE_STORYTELLERS", "THE_DISRUPTORS"],
  "forbiddenLanguage": ["romantic", "whimsical", "journey", "soul", "embrace"],
  "forbiddenVisualSquads": ["THE_STORYTELLERS", "THE_DISRUPTORS"],
  "forbiddenStyles": ["lifestyle_context", "busy_backgrounds", "bold_colors"],
  "schwartzStage": "problem_aware",
  "reasoning": "High-price clinical product for skeptical audience requires data-driven trust"
}
```

**Example 2: $45 Rose Candle for Instagram**
```json
{
  "copySquad": "THE_STORYTELLERS",
  "visualSquad": "THE_STORYTELLERS",
  "primaryCopyMaster": "PETERMAN_ROMANCE",
  "primaryVisualMaster": "LEIBOVITZ_ENVIRONMENT",
  "forbiddenCopySquads": ["THE_SCIENTISTS", "THE_DISRUPTORS"],
  "forbiddenLanguage": ["clinical", "proven", "efficacy", "study", "data"],
  "forbiddenVisualSquads": ["THE_MINIMALISTS", "THE_DISRUPTORS"],
  "forbiddenStyles": ["white_background", "clinical_lighting", "isolated_product"],
  "schwartzStage": "product_aware",
  "reasoning": "Lifestyle product on social channel requires emotional storytelling"
}
```

**Example 3: Facebook Ad for New Supplement**
```json
{
  "copySquad": "THE_DISRUPTORS",
  "visualSquad": "THE_DISRUPTORS",
  "primaryCopyMaster": "CLOW_DISRUPTION",
  "primaryVisualMaster": "RICHARDSON_RAW",
  "forbiddenCopySquads": ["THE_SCIENTISTS", "THE_STORYTELLERS"],
  "forbiddenLanguage": ["perhaps", "consider", "maybe", "wandering_narratives"],
  "forbiddenVisualSquads": ["THE_MINIMALISTS", "THE_STORYTELLERS"],
  "forbiddenStyles": ["subtle", "muted_colors", "safe_layouts"],
  "schwartzStage": "unaware",
  "reasoning": "Cold audience on paid channel requires pattern interruption"
}
```

---

## Critical Implementation Rules

### Rule 1: Never Load Multiple Squads

**The Problem:**
```typescript
// ❌ WRONG - This creates Frankenstein Copy
const context = await Promise.all([
  fetchMasters(['OGILVY', 'PETERMAN', 'CLOW']), // Mixing all squads
  fetchVisualMasters(['AVEDON', 'LEIBOVITZ', 'RICHARDSON'])
]);
```

**The Solution:**
```typescript
// ✅ CORRECT - Single squad only
const context = await Promise.all([
  fetchMasters(['OGILVY_SPECIFICITY', 'HOPKINS_REASON_WHY']), // Scientists only
  fetchVisualMasters(['AVEDON_ISOLATION']) // Minimalists only
]);
```

### Rule 2: Use Negative Constraints in Prompts

The Generator prompt MUST include explicit forbidden lists:
```typescript
const generatorPrompt = `
You are Madison, writing as ${strategy.copySquad}.


Primary Master: ${strategy.primaryCopyMaster}
Schwartz Stage: ${strategy.schwartzStage}



${productData}
${masterDocuments}
${brandExamples}



❌ FORBIDDEN SQUADS: ${strategy.forbiddenCopySquads.join(', ')}

You are ${strategy.copySquad}. 
Do NOT use language from ${strategy.forbiddenCopySquads[0]}.

Specifically avoid these words/phrases:
${strategy.forbiddenLanguage.join(', ')}

Example of what NOT to write:
${getForbiddenExample(strategy.forbiddenCopySquads[0])}



${userBrief}

`;
```

### Rule 3: Full Master Documents (No Chunking)

**The Problem:**
```sql
-- ❌ WRONG - Chunked retrieval loses context
SELECT chunk_content 
FROM madison_masters_chunked
WHERE embedding  query_embedding < 0.8
LIMIT 3;
```

**The Solution:**
```sql
-- ✅ CORRECT - Full document retrieval
SELECT full_content 
FROM madison_masters
WHERE master_name = 'OGILVY_SPECIFICITY';
-- Returns the ENTIRE Ogilvy document with examples
```

### Rule 4: Secondary Masters Must Be From Same Squad
```typescript
// ✅ CORRECT
{
  primaryCopyMaster: 'OGILVY_SPECIFICITY',
  secondaryCopyMaster: 'HOPKINS_REASON_WHY', // Both from THE_SCIENTISTS
  copySquad: 'THE_SCIENTISTS'
}

// ❌ WRONG
{
  primaryCopyMaster: 'OGILVY_SPECIFICITY', // THE_SCIENTISTS
  secondaryCopyMaster: 'PETERMAN_ROMANCE', // THE_STORYTELLERS - CONFLICT!
  copySquad: 'THE_SCIENTISTS'
}
```

### Rule 5: Visual and Copy Squads Must Align

**Acceptable combinations:**

| Copy Squad | Visual Squad | Result |
|------------|--------------|--------|
| THE_SCIENTISTS | THE_MINIMALISTS | ✅ Clinical copy + clean visuals |
| THE_STORYTELLERS | THE_STORYTELLERS | ✅ Romantic copy + lifestyle visuals |
| THE_DISRUPTORS | THE_DISRUPTORS | ✅ Bold copy + bold visuals |
| THE_SCIENTISTS | THE_STORYTELLERS | ⚠️ Possible but creates tension |

**Forbidden combinations:**

| Copy Squad | Visual Squad | Problem |
|------------|--------------|---------|
| THE_SCIENTISTS | THE_DISRUPTORS | ❌ Clinical copy with loud visuals |
| THE_STORYTELLERS | THE_MINIMALISTS | ❌ Romantic copy with sterile visuals |

---

## Database Integration

### Master Documents Table
```sql
CREATE TABLE madison_masters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_name TEXT NOT NULL UNIQUE, -- e.g., 'OGILVY_SPECIFICITY'
  squad TEXT NOT NULL, -- 'THE_SCIENTISTS', 'THE_STORYTELLERS', 'THE_DISRUPTORS'
  full_content TEXT NOT NULL, -- Complete markdown document
  summary TEXT, -- Brief description for Router selection
  forbidden_language TEXT[], -- Words this master never uses
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast squad-based retrieval
CREATE INDEX idx_madison_masters_squad ON madison_masters(squad);

-- Example data
INSERT INTO madison_masters (master_name, squad, full_content, forbidden_language) VALUES
('OGILVY_SPECIFICITY', 'THE_SCIENTISTS', '# David Ogilvy: The Power of Specificity...', 
 ARRAY['vague', 'amazing', 'incredible', 'soul', 'journey']),
('PETERMAN_ROMANCE', 'THE_STORYTELLERS', '# J. Peterman: The Art of Romance...', 
 ARRAY['clinical', 'proven', 'efficacy', 'data', 'study']),
('CLOW_DISRUPTION', 'THE_DISRUPTORS', '# Lee Clow: Think Different...', 
 ARRAY['perhaps', 'maybe', 'consider', 'possibly']);
```

### Visual Masters Table
```sql
CREATE TABLE visual_masters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_name TEXT NOT NULL UNIQUE, -- e.g., 'AVEDON_ISOLATION'
  squad TEXT NOT NULL, -- 'THE_MINIMALISTS', 'THE_STORYTELLERS', 'THE_DISRUPTORS'
  full_content TEXT NOT NULL, -- Complete guidelines
  example_images TEXT[], -- Reference image URLs
  forbidden_styles TEXT[], -- Visual elements to avoid
  prompt_template TEXT, -- Midjourney/DALL-E template
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for squad retrieval
CREATE INDEX idx_visual_masters_squad ON visual_masters(squad);
```

### Schwartz Templates Table
```sql
CREATE TABLE schwartz_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage TEXT NOT NULL UNIQUE, -- 'unaware', 'problem_aware', etc.
  template_content TEXT NOT NULL, -- Structure outline
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Example data
INSERT INTO schwartz_templates (stage, template_content) VALUES
('problem_aware', '# Problem-Aware Structure
1. Validate the pain immediately
2. Explain why the problem persists
3. Present your unique mechanism
4. Provide proof it works
5. Remove final objections');
```

---

## Examples

### Complete Example: Anti-Aging Serum Campaign

**Input Brief:**
```typescript
{
  productId: 'serum_retinol_001',
  productPrice: 180,
  productCategory: 'skincare',
  audienceStage: 'problem_aware',
  channel: 'product_page',
  goal: 'Convert visitors who are researching retinol but hesitant about irritation'
}
```

**Router Output:**
```json
{
  "copySquad": "THE_SCIENTISTS",
  "visualSquad": "THE_MINIMALISTS",
  "primaryCopyMaster": "HOPKINS_REASON_WHY",
  "secondaryCopyMaster": "OGILVY_SPECIFICITY",
  "primaryVisualMaster": "AVEDON_ISOLATION",
  "forbiddenCopySquads": ["THE_STORYTELLERS", "THE_DISRUPTORS"],
  "forbiddenLanguage": ["journey", "embrace", "soul", "mysterious", "enchanting"],
  "forbiddenVisualSquads": ["THE_STORYTELLERS", "THE_DISRUPTORS"],
  "forbiddenStyles": ["lifestyle_context", "busy_backgrounds", "dramatic_lighting"],
  "schwartzStage": "problem_aware"
}
```

**Generated Copy:**
```
Retinol Without the Redness

For years, dermatologists recommended retinol for wrinkles—but sensitive skin couldn't tolerate it.

Why Retinol Causes Irritation:
Traditional serums dump 0.5% retinol on your face all at once. Your skin can't process it that fast, causing redness and peeling.

Our Solution: Time-Release Technology
We encapsulate retinol in lipid microspheres that dissolve gradually over 8 hours. This delivers the same anti-aging benefits without overwhelming your skin barrier.

Clinical Results (12-week study, 200 subjects):
- 87% saw reduced fine lines
- 92% experienced zero redness
- 23% average reduction in wrinkle depth
- Suitable for sensitive skin

The Formula:
→ Encapsulated Retinol (0.5%) - time-released
→ Bakuchiol (1%) - plant-based retinol alternative
→ Ceramides (3%) - repairs skin barrier
→ Hyaluronic Acid (2%) - hydration

Dermatologist-tested. Non-irritating. Results in 8 weeks.

100% Money-Back Guarantee: If you experience irritation, we'll refund your purchase. No questions asked.

[Add to Cart - $180]
```

**Generated Visual:**
- Pure white background (#FFFFFF)
- Serum bottle centered, isolated
- Soft directional lighting (no shadows)
- Product takes 35% of frame
- 65% negative space
- Minimal text overlay: "Retinol Without Redness"

**Why It Works:**
- ✅ Hopkins: Explains the mechanism (time-release)
- ✅ Ogilvy: Specific numbers (0.5%, 8 hours, 87%)
- ✅ Schwartz: Problem-aware structure (validates pain first)
- ✅ Avedon: Clean, clinical visual
- ❌ No romantic language (blocked)
- ❌ No lifestyle imagery (blocked)

---

### Complete Example: Rose Candle Instagram Post

**Input Brief:**
```typescript
{
  productId: 'candle_rose_limited',
  productPrice: 45,
  productCategory: 'candle',
  audienceStage: 'product_aware',
  channel: 'instagram',
  goal: 'Generate desire for limited edition launch'
}
```

**Router Output:**
```json
{
  "copySquad": "THE_STORYTELLERS",
  "visualSquad": "THE_STORYTELLERS",
  "primaryCopyMaster": "PETERMAN_ROMANCE",
  "primaryVisualMaster": "LEIBOVITZ_ENVIRONMENT",
  "forbiddenCopySquads": ["THE_SCIENTISTS", "THE_DISRUPTORS"],
  "forbiddenLanguage": ["clinical", "proven", "study", "efficacy", "data"],
  "forbiddenVisualSquads": ["THE_MINIMALISTS", "THE_DISRUPTORS"],
  "forbiddenStyles": ["white_background", "clinical_lighting", "isolated"],
  "schwartzStage": "product_aware"
}
```

**Generated Copy:**
```
There's a valley in Bulgaria where roses bloom at dawn.

Not the roses you buy at the store—these are Rosa damascena, the ancient kind, with petals so fragile they must be picked by hand before sunrise.

We traveled there in May. The air was cold, the light was pink, and for one morning, we understood what rose is supposed to smell like.

Not sweet. Not powdered. Green and alive and fleeting.

This candle burns for 60 hours, but that morning in Bulgaria? We'll never get it back.

Only 200 made. Link in bio.
```

**Generated Visual:**
- Rose candle on linen-covered table
- Soft golden hour window light
- Rose petals scattered naturally
- Open book in background (blurred)
- Warm, muted color grading
- Film grain texture
- Text overlay in Crimson Text italic

**Why It Works:**
- ✅ Peterman: Transports to a place (Bulgaria)
- ✅ Sensory detail (cold air, pink light, green scent)
- ✅ Burnett: Inherent drama (fragile, fleeting)
- ✅ Leibovitz: Environmental context
- ❌ No clinical language (blocked)
- ❌ No white background (blocked)

---

## Conclusion

The Squad System is Madison's core innovation. By forcing a single point of view per piece of content, we eliminate the "confused AI voice" that plagues most systems.

**Key Takeaways:**

1. **Eugene Schwartz = Operating System** (always on, defines structure)
2. **Squads = Applications** (one at a time, defines voice)
3. **Negative constraints are as important as positive** (forbid conflicting styles)
4. **Full master documents, never chunked** (preserve context and examples)
5. **Visual and copy squads must align** (coherent brand experience)

**Next Steps:**

Refer to:
- `BRAND_DNA_SCANNER_SPEC.md` for squad auto-assignment implementation
- `MADISON_ARCHITECTURE_MASTER.md` for how squads fit into the 4-agent pipeline

---

**End of SQUAD_SYSTEM_COMPLETE.md**