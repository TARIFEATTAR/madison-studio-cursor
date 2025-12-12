markdown# Madison Operating System - Complete Architecture

**Purpose:** The single source of truth for how all systems connect

**Last Updated:** December 2024  
**Version:** 1.0

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [The Three-Layer System](#the-three-layer-system)
3. [Data Flow Diagram](#data-flow-diagram)
4. [The Three Silos](#the-three-silos)
5. [The 4-Agent Pipeline](#the-4-agent-pipeline)
6. [Database Schema Overview](#database-schema-overview)
7. [Integration Points](#integration-points)
8. [Tech Stack](#tech-stack)
9. [Implementation Roadmap](#implementation-roadmap)
10. [Cost Model](#cost-model)

---

## Executive Summary

### What is Madison?

Madison is a **Brand Operating System** that prevents "Frankenstein Copy" - the generic, confused content that results when AI tries to channel multiple voices simultaneously.

### The Core Innovation

Instead of treating AI as a single writer trying to remember everything, Madison operates like a **Creative Agency**:

1. A **Creative Director** (Router Agent) analyzes each brief
2. Selects **ONE specialist squad** to lead
3. A **Librarian** (Assembler Agent) fetches only relevant materials
4. **Madison** (Generator Agent) writes in that single, focused voice
5. An **Editor** (Quality Control Agent) validates the output

### The Result

Every piece of content has a **distinct, strong point of view** - whether clinical (The Scientists), romantic (The Storytellers), or disruptive (The Disruptors).

### Key Metrics

| Metric | Value |
|--------|-------|
| Brand scan cost | $0.03-$0.10 |
| Content generation cost | $0.15-$0.30 |
| Setup time (user) | 8 seconds (URL scan) |
| Content creation time | 10-15 seconds |
| Supported output formats | Copy, images, composite assets, brand guides |

---

## The Three-Layer System
```
┌─────────────────────────────────────────────────────────┐
│ LAYER 1: BRAND INTELLIGENCE                            │
│ (Ingestion & Storage)                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  INPUT METHODS                  OUTPUT                  │
│  ┌──────────────┐              ┌──────────────┐       │
│  │ URL Scan     │──────────────▶│ Brand DNA    │       │
│  │ (Pomelli)    │              │ (JSONB)      │       │
│  └──────────────┘              └──────────────┘       │
│                                       │                 │
│  ┌──────────────┐                    │                 │
│  │ PDF Upload   │────────────────────┤                 │
│  │ (Claude)     │                    │                 │
│  └──────────────┘                    │                 │
│                                       │                 │
│  ┌──────────────┐                    │                 │
│  │ Manual Entry │────────────────────┤                 │
│  │ (Wizard)     │                    │                 │
│  └──────────────┘                    │                 │
│                                       ▼                 │
│                              ┌──────────────┐          │
│                              │ Squad Auto-  │          │
│                              │ Assignment   │          │
│                              └──────────────┘          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ LAYER 2: CONTENT GENERATION                            │
│ (The 4-Agent Pipeline)                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────┐    │
│  │ 1. ROUTER AGENT (Creative Director)          │    │
│  │    Analyzes brief → Selects squad → Strategy │    │
│  └───────────────────────────────────────────────┘    │
│                          ↓                              │
│  ┌───────────────────────────────────────────────┐    │
│  │ 2. ASSEMBLER AGENT (Librarian)               │    │
│  │    Fetches masters + product data + examples │    │
│  └───────────────────────────────────────────────┘    │
│                          ↓                              │
│  ┌───────────────────────────────────────────────┐    │
│  │ 3. GENERATOR AGENT (Madison)                  │    │
│  │    Creates content using assembled context    │    │
│  └───────────────────────────────────────────────┘    │
│                          ↓                              │
│  ┌───────────────────────────────────────────────┐    │
│  │ 4. EDITOR AGENT (Quality Control)             │    │
│  │    Validates output → Checks constraints      │    │
│  └───────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ LAYER 3: OUTPUT & DOCUMENTATION                        │
│ (Ready-to-Use Assets)                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐    ┌──────────────┐                 │
│  │ Social Posts │    │ Brand Guides │                 │
│  │ (Composite)  │    │ (PDF/Web)    │                 │
│  └──────────────┘    └──────────────┘                 │
│                                                         │
│  ┌──────────────┐    ┌──────────────┐                 │
│  │ Email Copy   │    │ Design       │                 │
│  │ (Multiply)   │    │ Tokens       │                 │
│  └──────────────┘    └──────────────┘                 │
└─────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### Complete Journey: URL → Content → Brand Guide
```
USER ENTERS URL
     │
     ▼
┌─────────────────────────────────────────┐
│ BRAND DNA SCANNER (Layer 1)            │
├─────────────────────────────────────────┤
│ 1. Puppeteer screenshots website       │
│ 2. Gemini Flash extracts colors/fonts  │
│ 3. Clearbit fetches logo                │
│ 4. Claude assigns squads                │
│ 5. Store in brand_dna table             │
└─────────────────────────────────────────┘
     │
     │ Creates: Brand DNA Object
     │ {
     │   visual: { colors, fonts, logo },
     │   essence: { mission, tone, squads },
     │   constraints: { forbidden words/styles }
     │ }
     │
     ▼
┌─────────────────────────────────────────┐
│ STORED IN SUPABASE                      │
├─────────────────────────────────────────┤
│ • brand_dna (JSONB)                     │
│ • design_systems (tokens)               │
│ • madison_masters (full docs)           │
│ • visual_masters (full docs)            │
└─────────────────────────────────────────┘
     │
     │ User clicks "Create Content"
     │
     ▼
┌─────────────────────────────────────────┐
│ AGENT 1: ROUTER (Creative Director)    │
├─────────────────────────────────────────┤
│ Input: User brief                       │
│ "Write Instagram post for rose candle" │
│                                         │
│ Analyzes:                               │
│ • Product type (candle)                 │
│ • Channel (Instagram)                   │
│ • Brand DNA (romantic tone)             │
│                                         │
│ Output: Strategy JSON                   │
│ {                                       │
│   copySquad: "THE_STORYTELLERS",        │
│   visualSquad: "THE_STORYTELLERS",      │
│   primaryCopyMaster: "PETERMAN_ROMANCE",│
│   forbiddenSquads: ["THE_SCIENTISTS"],  │
│   schwartzStage: "product_aware"        │
│ }                                       │
└─────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│ AGENT 2: ASSEMBLER (Librarian)         │
├─────────────────────────────────────────┤
│ Fetches in parallel:                    │
│                                         │
│ 1. FULL Master Documents (Silo A)      │
│    SELECT full_content                  │
│    FROM madison_masters                 │
│    WHERE master_name = 'PETERMAN...'    │
│                                         │
│ 2. Product Data (Silo B)                │
│    SELECT specs                         │
│    FROM brand_products                  │
│    WHERE product_id = 'candle_001'      │
│                                         │
│ 3. Brand Examples (Silo C)              │
│    SELECT content                       │
│    FROM brand_writing_examples          │
│    WHERE embedding <-> query            │
│    LIMIT 3                              │
│                                         │
│ 4. Schwartz Template                    │
│    SELECT template_content              │
│    FROM schwartz_templates              │
│    WHERE stage = 'product_aware'        │
│                                         │
│ Output: Complete context package        │
└─────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│ AGENT 3: GENERATOR (Madison)           │
├─────────────────────────────────────────┤
│ System Prompt:                          │
│ "You are Madison, writing as            │
│  THE_STORYTELLERS.                      │
│                                         │
│  Primary Master: Peterman Romance       │
│                                         │
│  FORBIDDEN: Do NOT use THE_SCIENTISTS   │
│  language (clinical, data, proven).     │
│                                         │
│  Use the Schwartz Product-Aware         │
│  structure."                            │
│                                         │
│ Context:                                │
│ • Full Peterman document                │
│ • Product specs (rose candle)           │
│ • Past brand examples                   │
│                                         │
│ Output:                                 │
│ "There's a valley in Bulgaria where     │
│  roses bloom at dawn..."                │
└─────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│ AGENT 4: EDITOR (Quality Control)      │
├─────────────────────────────────────────┤
│ Checks:                                 │
│ 1. No forbidden words?                  │
│    ✓ No "clinical" or "proven"          │
│                                         │
│ 2. Follows Peterman principles?         │
│    ✓ Romantic, place-based              │
│                                         │
│ 3. Uses Schwartz structure?             │
│    ✓ Product-aware format               │
│                                         │
│ 4. Brand colors in design?              │
│    ✓ Uses #EB008B from brand_dna        │
│                                         │
│ Output: Approved content                │
└─────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│ COMPOSITE GENERATION (Satori)          │
├─────────────────────────────────────────┤
│ 1. Fetch brand DNA visual rules         │
│ 2. Generate image (Storyteller style)   │
│ 3. Overlay copy using brand fonts       │
│ 4. Apply brand colors to CTA            │
│ 5. Export as PNG/JPG                    │
└─────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│ OUTPUT TO USER                          │
├─────────────────────────────────────────┤
│ • Ready-to-post Instagram image         │
│ • Copy (can be edited)                  │
│ • Image (can be regenerated)            │
│ • Download or publish directly          │
└─────────────────────────────────────────┘
```

---

## The Three Silos

Madison's data architecture separates information into three distinct "silos" to prevent the AI from confusing **rules**, **facts**, and **vibes**.

### Silo A: The Masters (Rules & Principles)

**Storage Format:** Full-text markdown documents  
**Retrieval Method:** Exact match by ID (no vector search)  
**Why:** You don't want Madison to "search" for Ogilvy's rules; you want her to read the **entire manual**.

**Contents:**
- Copy Masters (Ogilvy, Hopkins, Peterman, Clow, etc.)
- Visual Masters (Avedon, Leibovitz, Richardson, etc.)
- Schwartz Awareness Stage Templates

**Database Table:**
```sql
CREATE TABLE madison_masters (
  id UUID PRIMARY KEY,
  master_name TEXT UNIQUE, -- e.g., 'OGILVY_SPECIFICITY'
  squad TEXT NOT NULL, -- 'THE_SCIENTISTS', 'THE_STORYTELLERS', 'THE_DISRUPTORS'
  full_content TEXT NOT NULL, -- Complete markdown (never chunked)
  summary TEXT,
  forbidden_language TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Critical Rule:** Never chunk these documents. The Router selects a master by name, and the Assembler loads the **entire document** into context.

**Example Query:**
```sql
SELECT full_content 
FROM madison_masters 
WHERE master_name = 'PETERMAN_ROMANCE';
-- Returns complete 2,000+ word document with examples
```

---

### Silo B: The Facts (Structured Data)

**Storage Format:** JSONB (structured, queryable)  
**Retrieval Method:** Direct SQL lookup by ID  
**Why:** Prevents hallucinations. Madison **looks up** the price ($180); she doesn't **guess** it.

**Contents:**
- Brand DNA (colors, fonts, mission)
- Product catalog (specs, prices, ingredients)
- Design tokens (Tailwind config)

**Database Tables:**
```sql
CREATE TABLE brand_dna (
  id UUID PRIMARY KEY,
  org_id UUID UNIQUE,
  visual JSONB NOT NULL, -- Colors, fonts, logo
  essence JSONB NOT NULL, -- Mission, tone, squad assignments
  constraints JSONB, -- Forbidden words/styles
  scan_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE brand_products (
  id UUID PRIMARY KEY,
  org_id UUID,
  product_id TEXT,
  specs JSONB NOT NULL, -- Price, ingredients, dimensions
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE design_systems (
  id UUID PRIMARY KEY,
  org_id UUID UNIQUE,
  tokens JSONB NOT NULL, -- Tailwind color/font config
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Critical Rule:** Never vector-search this data. Always fetch by exact ID.

**Example Query:**
```sql
SELECT specs 
FROM brand_products 
WHERE product_id = 'serum_retinol_001';
-- Returns exact JSON: { price: 180, ingredients: [...], volume: "30ml" }
```

---

### Silo C: The Vibe (Semantic Examples)

**Storage Format:** Vector embeddings + full text  
**Retrieval Method:** Hybrid search (vector similarity + BM25 keyword)  
**Why:** This is the **only place** for "fuzzy" search. Use this to find past writing that **sounds like** the goal.

**Contents:**
- Brand writing examples (approved copy)
- Brand visual examples (approved images with CLIP embeddings)
- Performance data (what worked)

**Database Tables:**
```sql
CREATE TABLE brand_writing_examples (
  id UUID PRIMARY KEY,
  org_id UUID,
  content TEXT NOT NULL,
  embedding VECTOR(1536), -- OpenAI text-embedding-3-small
  source TEXT, -- 'uploaded_pdf' | 'generated_and_approved'
  metadata JSONB, -- Channel, tone, performance
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE brand_visual_examples (
  id UUID PRIMARY KEY,
  org_id UUID,
  image_url TEXT NOT NULL,
  image_embedding VECTOR(512), -- CLIP embedding
  style_tags TEXT[], -- ['minimalist', 'product_shot']
  metadata JSONB, -- Channel, performance, squad used
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Critical Rule:** Use hybrid search (vector + keyword) for best results.

**Example Query:**
```sql
-- Find similar writing examples
SELECT content, metadata
FROM brand_writing_examples
WHERE org_id = '...'
ORDER BY embedding  query_embedding
LIMIT 3;

-- Hybrid: vector + keyword
SELECT content
FROM brand_writing_examples
WHERE org_id = '...'
  AND to_tsvector('english', content) @@ plainto_tsquery('fragrance launch')
ORDER BY embedding  query_embedding
LIMIT 3;
```

---

## The 4-Agent Pipeline

### Overview

Madison uses a **chain of specialized agents** instead of a single monolithic prompt. Each agent has a specific role and hands off to the next.
```
USER BRIEF
    ↓
[1. ROUTER] → Strategy JSON
    ↓
[2. ASSEMBLER] → Context Package
    ↓
[3. GENERATOR] → Draft Content
    ↓
[4. EDITOR] → Final Content
    ↓
OUTPUT
```

---

### Agent 1: Router (The Creative Director)

**Role:** Analyzes the brief and creates an execution strategy  
**Model:** Claude Sonnet 4 (fast, cheap, strategic)  
**Cost:** ~$0.02 per brief

**Input:**
```typescript
interface RouterInput {
  userBrief: string; // "Write Instagram post for rose candle"
  orgId: string;
  productId?: string;
  channel?: string;
}
```

**Process:**
1. Fetch Brand DNA from Silo B
2. Analyze user intent
3. Determine Schwartz awareness stage
4. Select primary copy squad
5. Select primary visual squad
6. Identify forbidden squads (negative constraints)
7. Output strategy JSON

**Output:**
```typescript
interface StrategyJSON {
  // Squad selection
  copySquad: 'THE_SCIENTISTS' | 'THE_STORYTELLERS' | 'THE_DISRUPTORS';
  visualSquad: 'THE_MINIMALISTS' | 'THE_STORYTELLERS' | 'THE_DISRUPTORS';
  
  // Master selection
  primaryCopyMaster: string; // 'PETERMAN_ROMANCE'
  secondaryCopyMaster?: string; // Optional, same squad only
  primaryVisualMaster: string; // 'LEIBOVITZ_ENVIRONMENT'
  
  // Negative constraints (CRITICAL)
  forbiddenCopySquads: string[]; // ['THE_SCIENTISTS', 'THE_DISRUPTORS']
  forbiddenLanguage: string[]; // ['clinical', 'proven', 'data']
  forbiddenVisualSquads: string[];
  forbiddenStyles: string[]; // ['white_background', 'clinical_lighting']
  
  // Framework
  schwartzStage: 'unaware' | 'problem_aware' | 'solution_aware' | 'product_aware' | 'most_aware';
  
  // Product context
  productId?: string;
  
  // Reasoning (for debugging)
  reasoning: string;
}
```

**Example Implementation:**
```typescript
// File: lib/agents/router.ts

async function routerAgent(input: RouterInput): Promise {
  // Fetch Brand DNA
  const brandDNA = await supabase
    .from('brand_dna')
    .select('*')
    .eq('org_id', input.orgId)
    .single();

  const prompt = `
You are the Creative Director for Madison Studio.
Analyze this brief and create an execution strategy.


${input.userBrief}



Mission: ${brandDNA.essence.mission}
Tone: ${brandDNA.essence.tone}
Default Squads: Copy=${brandDNA.essence.copySquad}, Visual=${brandDNA.essence.visualSquad}
Forbidden Words: ${brandDNA.constraints.forbiddenWords.join(', ')}



${input.channel || 'Not specified'}



[See SQUAD_SYSTEM_COMPLETE.md for full definitions]


Select the ONE primary squad that best fits this brief.
Consider:
1. Product category (if identifiable)
2. Channel constraints
3. Brand DNA defaults
4. Audience awareness stage

Return ONLY valid JSON:
{
  "copySquad": "...",
  "visualSquad": "...",
  "primaryCopyMaster": "...",
  "forbiddenCopySquads": [...],
  "forbiddenLanguage": [...],
  "schwartzStage": "...",
  "reasoning": "..."
}
`;

  const anthropic = new Anthropic();
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }]
  });

  const responseText = message.content[0].type === 'text' 
    ? message.content[0].text 
    : '';
  
  const strategy = JSON.parse(
    responseText.replace(/```json\n?/g, '').replace(/```/g, '').trim()
  );

  return strategy;
}
```

**Key Success Factors:**
- ✅ Always selects ONE primary squad (never multiple)
- ✅ Includes negative constraints (what NOT to do)
- ✅ Considers brand DNA defaults
- ✅ Fast (<2 seconds)

---

### Agent 2: Assembler (The Librarian)

**Role:** Fetches all necessary context based on strategy  
**Model:** None (pure database queries)  
**Cost:** $0.00 (just database reads)

**Input:** Strategy JSON from Router

**Process:**
1. Fetch full master documents (Silo A)
2. Fetch product data (Silo B)
3. Fetch Schwartz template (Silo A)
4. Fetch brand examples (Silo C, semantic search)
5. Assemble into context package

**Output:**
```typescript
interface ContextPackage {
  // From Silo A (full documents)
  masterDocuments: string[]; // Complete markdown files
  schwartzTemplate: string; // Full stage template
  
  // From Silo B (structured data)
  productData: ProductSpecs | null;
  brandDNA: BrandDNA;
  designTokens: DesignTokens;
  
  // From Silo C (semantic search)
  writingExamples: BrandExample[];
  visualExamples: VisualExample[];
}
```

**Example Implementation:**
```typescript
// File: lib/agents/assembler.ts

async function assemblerAgent(strategy: StrategyJSON): Promise {
  
  // Execute all fetches in parallel for speed
  const [
    masterDocs,
    schwartzTemplate,
    productData,
    brandDNA,
    designTokens,
    writingExamples,
    visualExamples
  ] = await Promise.all([
    
    // 1. Fetch full master documents (Silo A - no chunking!)
    supabase
      .from('madison_masters')
      .select('full_content')
      .in('master_name', [
        strategy.primaryCopyMaster,
        strategy.secondaryCopyMaster
      ].filter(Boolean))
      .then(({ data }) => data?.map(d => d.full_content) || []),
    
    // 2. Fetch Schwartz stage template (Silo A)
    supabase
      .from('schwartz_templates')
      .select('template_content')
      .eq('stage', strategy.schwartzStage)
      .single()
      .then(({ data }) => data?.template_content || ''),
    
    // 3. Fetch product data (Silo B - exact lookup)
    strategy.productId
      ? supabase
          .from('brand_products')
          .select('specs')
          .eq('product_id', strategy.productId)
          .single()
          .then(({ data }) => data?.specs || null)
      : Promise.resolve(null),
    
    // 4. Fetch brand DNA (Silo B)
    supabase
      .from('brand_dna')
      .select('*')
      .eq('org_id', strategy.orgId)
      .single()
      .then(({ data }) => data),
    
    // 5. Fetch design tokens (Silo B)
    supabase
      .from('design_systems')
      .select('tokens')
      .eq('org_id', strategy.orgId)
      .single()
      .then(({ data }) => data?.tokens || {}),
    
    // 6. Fetch relevant writing examples (Silo C - semantic search)
    fetchRelevantExamples(strategy.orgId, strategy.userBrief, 'writing'),
    
    // 7. Fetch relevant visual examples (Silo C - semantic search)
    fetchRelevantExamples(strategy.orgId, strategy.userBrief, 'visual')
  ]);

  return {
    masterDocuments: masterDocs,
    schwartzTemplate,
    productData,
    brandDNA,
    designTokens,
    writingExamples,
    visualExamples
  };
}

/**
 * Semantic search for relevant brand examples
 */
async function fetchRelevantExamples(
  orgId: string,
  query: string,
  type: 'writing' | 'visual'
): Promise {
  
  // Generate query embedding
  const embedding = await generateEmbedding(query);
  
  if (type === 'writing') {
    const { data } = await supabase.rpc('match_writing_examples', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: 3,
      org_id: orgId
    });
    return data || [];
  } else {
    const { data } = await supabase.rpc('match_visual_examples', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: 3,
      org_id: orgId
    });
    return data || [];
  }
}
```

**Key Success Factors:**
- ✅ Parallel execution (all fetches happen simultaneously)
- ✅ Full master documents (never chunked)
- ✅ Exact product data (no vector search)
- ✅ Semantic examples (only place for fuzzy search)
- ✅ Fast (<1 second total)

---

### Agent 3: Generator (Madison the Writer)

**Role:** Creates content using assembled context  
**Model:** Claude Sonnet 4 or Opus 4 (for best quality)  
**Cost:** $0.10-$0.20 per generation (depending on length)

**Input:** 
- Strategy JSON (from Router)
- Context Package (from Assembler)
- User Brief (original request)

**Process:**
1. Construct system prompt with identity
2. Load master documents as reference
3. Apply negative constraints (forbidden squads/words)
4. Structure prompt using Schwartz framework
5. Generate content

**Output:** Draft content (copy, or copy + image prompt)

**Example Implementation:**
```typescript
// File: lib/agents/generator.ts

async function generatorAgent(
  userBrief: string,
  strategy: StrategyJSON,
  context: ContextPackage
): Promise {

  const systemPrompt = `
You are Madison, the world-class copywriter and brand designer.


${MADISON_IDENTITY_DOCUMENT}



You are writing as ${strategy.copySquad}.
Your primary master is ${strategy.primaryCopyMaster}.
You must follow the ${strategy.schwartzStage} structure.

`;

  const userPrompt = `

Copy Squad: ${strategy.copySquad}
Visual Squad: ${strategy.visualSquad}
Schwartz Stage: ${strategy.schwartzStage}



${context.masterDocuments.join('\n\n---\n\n')}



${context.schwartzTemplate}



Mission: ${context.brandDNA.essence.mission}
Tone: ${context.brandDNA.essence.tone}
Colors: ${JSON.stringify(context.brandDNA.visual.colors)}
Typography: ${JSON.stringify(context.brandDNA.visual.typography)}


${context.productData ? `

${JSON.stringify(context.productData, null, 2)}

` : ''}


${context.writingExamples.map(ex => ex.content).join('\n\n---\n\n')}



❌ FORBIDDEN SQUADS: ${strategy.forbiddenCopySquads.join(', ')}

You are ${strategy.copySquad}. 
Do NOT use language from ${strategy.forbiddenCopySquads.join(' or ')}.

Specifically avoid these words/phrases:
${strategy.forbiddenLanguage.join(', ')}

Example of what NOT to write:
${generateForbiddenExample(strategy.forbiddenCopySquads[0])}



${userBrief}


Write the content now. Follow the master principles exactly.
Use the Schwartz structure. Respect the forbidden constraints.
`;

  const anthropic = new Anthropic();
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514', // or claude-opus-4 for best quality
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }]
  });

  const draft = message.content[0].type === 'text' 
    ? message.content[0].text 
    : '';

  return draft;
}

/**
 * Generate example of forbidden style (to show what NOT to do)
 */
function generateForbiddenExample(forbiddenSquad: string): string {
  const examples = {
    'THE_SCIENTISTS': 'Clinically proven to reduce wrinkles by 23% in 8 weeks with 12% niacinamide formula tested on 200 subjects.',
    'THE_STORYTELLERS': 'The sun rose over the fields of Grasse, and in that moment we knew we had captured something transcendent.',
    'THE_DISRUPTORS': 'Stop wasting money on serums that don\'t work.'
  };
  return examples[forbiddenSquad] || '';
}
```

**Key Success Factors:**
- ✅ System prompt establishes Madison's identity
- ✅ Full master documents provide deep context
- ✅ Negative constraints prevent voice conflicts
- ✅ Schwartz structure ensures effective messaging
- ✅ Brand examples guide tone

---

### Agent 4: Editor (Quality Control)

**Role:** Validates output against constraints  
**Model:** Claude Sonnet 4 (fast validation)  
**Cost:** ~$0.03 per review

**Input:**
- Draft content (from Generator)
- Strategy JSON (original constraints)
- Context Package (for validation)

**Process:**
1. Check for forbidden language
2. Verify master principles applied
3. Confirm Schwartz structure followed
4. Validate product data accuracy
5. Fix issues or approve

**Output:** Final approved content

**Example Implementation:**
```typescript
// File: lib/agents/editor.ts

async function editorAgent(
  draft: string,
  strategy: StrategyJSON,
  context: ContextPackage
): Promise {

  const editorPrompt = `
You are the Editorial Director reviewing Madison's draft.


${draft}



Copy Squad: ${strategy.copySquad}
Primary Master: ${strategy.primaryCopyMaster}
Schwartz Stage: ${strategy.schwartzStage}
Forbidden Squads: ${strategy.forbiddenCopySquads.join(', ')}
Forbidden Language: ${strategy.forbiddenLanguage.join(', ')}



1. ❌ Did the draft accidentally use ${strategy.forbiddenCopySquads[0]} language?
   Check for: ${strategy.forbiddenLanguage.slice(0, 5).join(', ')}

2. ✅ Does it follow ${strategy.primaryCopyMaster} principles?
   ${getMasterValidationCriteria(strategy.primaryCopyMaster)}

3. ✅ Does it use the ${strategy.schwartzStage} structure?
   ${context.schwartzTemplate.split('\n').slice(0, 5).join('\n')}

${context.productData ? `
4. ✅ Are product facts accurate?
   Price: ${context.productData.price}
   Key ingredients: ${context.productData.ingredients?.slice(0, 3).join(', ')}
` : ''}

5. ✅ Does it match the brand tone?
   Expected: ${context.brandDNA.essence.tone}



If there are violations or errors:
- Rewrite the problematic sections
- Maintain the overall structure
- Fix the issues without changing good parts

If everything is correct:
- Return the draft unchanged
- Add "APPROVED" at the top

Output the final version now.

`;

  const anthropic = new Anthropic();
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: editorPrompt }]
  });

  let finalContent = message.content[0].type === 'text' 
    ? message.content[0].text 
    : '';

  // Remove "APPROVED" marker if present
  finalContent = finalContent.replace(/^APPROVED\n\n?/i, '');

  return finalContent;
}

/**
 * Get validation criteria for specific master
 */
function getMasterValidationCriteria(masterName: string): string {
  const criteria = {
    'OGILVY_SPECIFICITY': 'Uses specific numbers, dates, percentages. Avoids vague claims.',
    'HOPKINS_REASON_WHY': 'Explains mechanism, provides proof, removes risk.',
    'PETERMAN_ROMANCE': 'Transports to a place, builds sensory detail, emotional.',
    'CLOW_DISRUPTION': 'Short, provocative, pattern-interrupting.'
  };
  return criteria[masterName] || 'Follows master principles';
}
```

**Key Success Factors:**
- ✅ Automated validation (catches errors before user sees)
- ✅ Fixes issues without full regeneration
- ✅ Enforces negative constraints
- ✅ Verifies data accuracy
- ✅ Fast (<2 seconds)

---

### Complete Pipeline Implementation
```typescript
// File: lib/pipeline/madison-pipeline.ts

export async function madisonPipeline(
  userBrief: string,
  orgId: string,
  options?: {
    channel?: string;
    productId?: string;
  }
): Promise {

  console.log('[Pipeline] Starting Madison pipeline');
  const startTime = Date.now();

  // ═══════════════════════════════════════════════════════
  // AGENT 1: ROUTER
  // ═══════════════════════════════════════════════════════
  console.log('[Pipeline] Agent 1: Router analyzing brief');
  const strategy = await routerAgent({
    userBrief,
    orgId,
    channel: options?.channel,
    productId: options?.productId
  });
  console.log(`[Pipeline] Strategy: ${strategy.copySquad} / ${strategy.visualSquad}`);

  // ═══════════════════════════════════════════════════════
  // AGENT 2: ASSEMBLER
  // ═══════════════════════════════════════════════════════
  console.log('[Pipeline] Agent 2: Assembler fetching context');
  const context = await assemblerAgent(strategy);
  console.log(`[Pipeline] Loaded ${context.masterDocuments.length} master docs`);

  // ═══════════════════════════════════════════════════════
  // AGENT 3: GENERATOR
  // ═══════════════════════════════════════════════════════
  console.log('[Pipeline] Agent 3: Generator creating content');
  const draft = await generatorAgent(userBrief, strategy, context);
  console.log(`[Pipeline] Draft generated: ${draft.length} characters`);

  // ═══════════════════════════════════════════════════════
  // AGENT 4: EDITOR
  // ═══════════════════════════════════════════════════════
  console.log('[Pipeline] Agent 4: Editor validating output');
  const finalContent = await editorAgent(draft, strategy, context);
  console.log(`[Pipeline] Content approved`);

  const duration = Date.now() - startTime;
  console.log(`[Pipeline] Complete in ${duration}ms`);

  return {
    content: finalContent,
    strategy,
    metadata: {
      duration,
      copySquad: strategy.copySquad,
      visualSquad: strategy.visualSquad,
      schwartzStage: strategy.schwartzStage
    }
  };
}

interface PipelineOutput {
  content: string;
  strategy: StrategyJSON;
  metadata: {
    duration: number;
    copySquad: string;
    visualSquad: string;
    schwartzStage: string;
  };
}
```

---

## Database Schema Overview

### Complete Schema
```sql
-- ═══════════════════════════════════════════════════════
-- ORGANIZATIONS
-- ═══════════════════════════════════════════════════════
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════
-- SILO A: THE MASTERS (Rules & Principles)
-- ═══════════════════════════════════════════════════════

-- Copy Masters
CREATE TABLE madison_masters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_name TEXT UNIQUE NOT NULL, -- e.g., 'OGILVY_SPECIFICITY'
  squad TEXT NOT NULL, -- 'THE_SCIENTISTS', 'THE_STORYTELLERS', 'THE_DISRUPTORS'
  full_content TEXT NOT NULL, -- Complete markdown document (NEVER chunked)
  summary TEXT,
  forbidden_language TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_madison_masters_squad ON madison_masters(squad);

-- Visual Masters
CREATE TABLE visual_masters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_name TEXT UNIQUE NOT NULL, -- e.g., 'AVEDON_ISOLATION'
  squad TEXT NOT NULL, -- 'THE_MINIMALISTS', 'THE_STORYTELLERS', 'THE_DISRUPTORS'
  full_content TEXT NOT NULL, -- Complete guidelines
  example_images TEXT[], -- Reference image URLs
  forbidden_styles TEXT[],
  prompt_template TEXT, -- Midjourney/DALL-E template
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_visual_masters_squad ON visual_masters(squad);

-- Schwartz Templates
CREATE TABLE schwartz_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage TEXT UNIQUE NOT NULL, -- 'unaware', 'problem_aware', etc.
  template_content TEXT NOT NULL, -- Structure outline
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════
-- SILO B: THE FACTS (Structured Data)
-- ═══════════════════════════════════════════════════════

-- Brand DNA (The Central Hub)
CREATE TABLE brand_dna (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID UNIQUE NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  visual JSONB NOT NULL, -- Colors, fonts, logo, visual style
  essence JSONB NOT NULL, -- Mission, tone, squad assignments
  constraints JSONB, -- Forbidden words/styles, voice guidelines
  
  scan_method TEXT NOT NULL, -- 'url_scan' | 'document' | 'manual'
  scan_metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_brand_dna_org_id ON brand_dna(org_id);
CREATE INDEX idx_brand_dna_copy_squad ON brand_dna((essence->>'copySquad'));

-- Product Catalog
CREATE TABLE brand_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  specs JSONB NOT NULL, -- Price, ingredients, dimensions, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, product_id)
);
CREATE INDEX idx_brand_products_org_id ON brand_products(org_id);

-- Design Tokens
CREATE TABLE design_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID UNIQUE NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  tokens JSONB NOT NULL, -- Tailwind config (colors, fonts, spacing)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════
-- SILO C: THE VIBE (Semantic Examples)
-- ═══════════════════════════════════════════════════════

-- Writing Examples
CREATE TABLE brand_writing_examples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding VECTOR(1536), -- OpenAI text-embedding-3-small
  source TEXT NOT NULL, -- 'uploaded_pdf' | 'manual_entry' | 'generated_and_approved'
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_writing_examples_org_id ON brand_writing_examples(org_id);
CREATE INDEX idx_writing_examples_embedding ON brand_writing_examples 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Visual Examples
CREATE TABLE brand_visual_examples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_embedding VECTOR(512), -- CLIP embedding
  style_tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_visual_examples_org_id ON brand_visual_examples(org_id);
CREATE INDEX idx_visual_examples_embedding ON brand_visual_examples 
  USING ivfflat (image_embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_visual_examples_style_tags ON brand_visual_examples USING GIN (style_tags);

-- ═══════════════════════════════════════════════════════
-- GENERATED CONTENT (Output Tracking)
-- ═══════════════════════════════════════════════════════

CREATE TABLE generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL, -- 'copy' | 'image' | 'composite'
  content TEXT,
  image_url TEXT,
  strategy_used JSONB, -- Strategy JSON from Router
  performance JSONB, -- Clicks, conversions, etc.
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_generated_content_org_id ON generated_content(org_id);
CREATE INDEX idx_generated_content_approved ON generated_content(approved);

-- ═══════════════════════════════════════════════════════
-- VECTOR SEARCH FUNCTIONS
-- ═══════════════════════════════════════════════════════

-- Function to find similar writing examples
CREATE OR REPLACE FUNCTION match_writing_examples(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT,
  org_id UUID
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  similarity FLOAT
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    id,
    content,
    1 - (embedding <=> query_embedding) AS similarity
  FROM brand_writing_examples
  WHERE brand_writing_examples.org_id = match_writing_examples.org_id
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Function to find similar visual examples
CREATE OR REPLACE FUNCTION match_visual_examples(
  query_embedding VECTOR(512),
  match_threshold FLOAT,
  match_count INT,
  org_id UUID
)
RETURNS TABLE (
  id UUID,
  image_url TEXT,
  similarity FLOAT
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    id,
    image_url,
    1 - (image_embedding <=> query_embedding) AS similarity
  FROM brand_visual_examples
  WHERE brand_visual_examples.org_id = match_visual_examples.org_id
    AND 1 - (image_embedding <=> query_embedding) > match_threshold
  ORDER BY image_embedding <=> query_embedding
  LIMIT match_count;
$$;
```

---

## Integration Points

### 1. Brand DNA Scanner → Squad System

**Connection:** The scanner automatically assigns squads based on brand analysis.

**File:** `BRAND_DNA_SCANNER_SPEC.md` → Section: "Squad Auto-Assignment"

**Flow:**
```
URL Scan (Gemini extracts colors/tone)
    ↓
Squad Assignment (Claude analyzes brand profile)
    ↓
Store in brand_dna.essence { copySquad, visualSquad }
    ↓
Router uses these as defaults
```

**Example:**
```typescript
// After URL scan completes
const brandProfile = {
  visualStyle: 'minimalist',
  brandTone: 'clinical',
  primaryColor: '#FFFFFF'
};

const squads = await assignSquads(brandProfile);
// Returns: { copySquad: 'THE_SCIENTISTS', visualSquad: 'THE_MINIMALISTS' }

// Store in database
await supabase.from('brand_dna').update({
  essence: {
    ...existing.essence,
    copySquad: squads.copySquad,
    visualSquad: squads.visualSquad
  }
}).eq('org_id', orgId);
```

---

### 2. Squad System → 4-Agent Pipeline

**Connection:** The Router uses squad definitions to create strategy.

**File:** `SQUAD_SYSTEM_COMPLETE.md` → Referenced by Router Agent

**Flow:**
```
User Brief
    ↓
Router reads squad definitions from SQUAD_SYSTEM_COMPLETE.md
    ↓
Selects ONE primary squad
    ↓
Blocks all conflicting squads (negative constraints)
    ↓
Assembler fetches that squad's masters
```

**Example:**
```typescript
// Router decision logic
if (productPrice > 150 && audienceStage === 'problem_aware') {
  return {
    copySquad: 'THE_SCIENTISTS', // From SQUAD_SYSTEM_COMPLETE.md
    forbiddenSquads: ['THE_STORYTELLERS', 'THE_DISRUPTORS'],
    forbiddenLanguage: ['romantic', 'whimsical', 'journey'] // From squad definition
  };
}
```

---

### 3. Design Tokens → Satori Composites

**Connection:** Brand colors/fonts flow into visual generation.

**File:** Brand DNA → Design Tokens → Satori Layout

**Flow:**
```
Brand DNA (colors, fonts)
    ↓
generateDesignTokens() creates Tailwind config
    ↓
Store in design_systems table
    ↓
Satori reads tokens for layout generation
```

**Example:**
```typescript
// Fetch design tokens
const { data } = await supabase
  .from('design_systems')
  .select('tokens')
  .eq('org_id', orgId)
  .single();

// Use in Satori
const svg = await satori(
  
    {content}
  ,
  { width: 1200, height: 630 }
);
```

---

### 4. Pomelli Principles → URL Scanner

**Connection:** Screenshot + AI analysis (not HTML parsing).

**File:** `BRAND_DNA_SCANNER_SPEC.md` → Method 1: URL Scan

**Pomelli Innovation:**
- Take visual screenshot (what user sees)
- Analyze with multimodal AI (Gemini Flash)
- Extract brand DNA automatically
- Zero manual input required

**Implementation:**
```typescript
// Inspired by Pomelli's "zero-click" approach
const screenshot = await page.screenshot({ encoding: 'base64' });
const analysis = await gemini.generateContent([screenshot, prompt]);
// Extracts: colors, fonts, tone, style - all from pixels
```

---

### 5. RAG System → Three Silos

**Connection:** Different retrieval methods for different data types.

**Silo A (Masters):** Exact match, full documents  
**Silo B (Facts):** Direct lookup, no search  
**Silo C (Vibe):** Semantic search, embeddings

**Why This Matters:**
- ❌ Traditional RAG: Everything in one vector database
- ✅ Madison RAG: Specialized retrieval per data type

**Example:**
```typescript
// WRONG: Vector search for everything
const results = await vectorSearch(query); // Might return wrong master

// RIGHT: Targeted retrieval
const master = await exactLookup('OGILVY_SPECIFICITY'); // Silo A
const product = await directFetch('product_123'); // Silo B
const examples = await semanticSearch(query); // Silo C
```

---

## Tech Stack

### Core Technologies

| Layer | Technology | Purpose | Cost Model |
|-------|------------|---------|------------|
| **Frontend** | Next.js 14 (App Router) | UI framework | Free (self-hosted) |
| | React 18 | Component library | Free |
| | Tailwind CSS | Styling | Free |
| | TypeScript | Type safety | Free |
| **Backend** | Next.js API Routes | Serverless functions | Free (Vercel) |
| | Supabase | PostgreSQL + Auth | $25/mo (Pro) |
| | pgvector | Vector similarity | Included |
| **AI Models** | Claude Sonnet 4 | Router, Generator, Editor | $3/$15 per 1M tokens |
| | Claude Opus 4 | Premium generation | $15/$75 per 1M tokens |
| | Gemini 1.5 Flash | Visual analysis | $0.01 per image |
| | OpenAI Embeddings | Text embeddings | $0.02 per 1M tokens |
| **Automation** | Puppeteer-core | Browser automation | Free (self-hosted) |
| | @sparticuz/chromium | Serverless Chromium | Free |
| | Satori | React → Image | Free |
| **Storage** | Supabase Storage | Files, images | $0.021/GB |
| **Deployment** | Vercel | Hosting + Edge | Free (Hobby) / $20/mo (Pro) |

### Why These Choices?

**Next.js + TypeScript:**
- ✅ Full-stack in one codebase
- ✅ Serverless-ready (no server management)
- ✅ Great DX with Cursor

**Supabase (not Firebase or custom DB):**
- ✅ PostgreSQL (not NoSQL) = complex queries
- ✅ pgvector built-in (no separate vector DB)
- ✅ Row-level security
- ✅ Realtime subscriptions

**Claude Sonnet 4 (not GPT-4 or older Claude):**
- ✅ Fast (2-3 seconds)
- ✅ Cheap ($3/$15 vs GPT-4 $30/$60)
- ✅ Long context (200K tokens)
- ✅ Native PDF support

**Gemini Flash (not Pro/Opus for vision):**
- ✅ 5x cheaper than alternatives ($0.01 vs $0.05)
- ✅ Fast (< 1 second)
- ✅ Good enough for brand scanning

**Satori (not Puppeteer for image gen):**
- ✅ Serverless-compatible
- ✅ React components = easy styling
- ✅ No browser overhead
- ✅ Fast (< 500ms)

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

**Goal:** Set up database and basic Brand DNA scanning

**Tasks:**
1. ✅ Set up Supabase project
2. ✅ Create database schema (all tables)
3. ✅ Implement URL scan (Puppeteer + Gemini)
4. ✅ Implement PDF upload (Claude)
5. ✅ Implement manual wizard
6. ✅ Seed master documents (Ogilvy, Hopkins, Peterman)
7. ✅ Test Brand DNA extraction

**Deliverable:** Users can scan their brand and see extracted DNA

**Reference Files:**
- `BRAND_DNA_SCANNER_SPEC.md` (complete implementation guide)

---

### Phase 2: Squad System (Week 3)

**Goal:** Implement squad auto-assignment and Router Agent

**Tasks:**
1. ✅ Create squad assignment function
2. ✅ Implement Router Agent
3. ✅ Add squad selection logic
4. ✅ Test negative constraints
5. ✅ Validate strategy outputs

**Deliverable:** Router correctly selects squads based on briefs

**Reference Files:**
- `SQUAD_SYSTEM_COMPLETE.md` (router logic and squad definitions)

---

### Phase 3: Content Pipeline (Week 4-5)

**Goal:** Build the 4-Agent pipeline end-to-end

**Tasks:**
1. ✅ Implement Assembler Agent
2. ✅ Implement Generator Agent
3. ✅ Implement Editor Agent
4. ✅ Connect pipeline
5. ✅ Test with real briefs
6. ✅ Add error handling

**Deliverable:** Users can generate copy that follows squad principles

**Reference Files:**
- This document (section: "The 4-Agent Pipeline")

---

### Phase 4: Visual Generation (Week 6)

**Goal:** Add image generation and composite assets

**Tasks:**
1. ✅ Implement Satori layouts
2. ✅ Create visual master prompts
3. ✅ Add design token integration
4. ✅ Generate composite images
5. ✅ Test visual squad consistency

**Deliverable:** Users get ready-to-post images with brand-consistent design

---

### Phase 5: Brand Guides (Week 7)

**Goal:** Generate professional PDF brand guides

**Tasks:**
1. ✅ Create brand guide templates (React components)
2. ✅ Implement Satori → PDF pipeline
3. ✅ Add multi-page support
4. ✅ Test print quality
5. ✅ Add download functionality

**Deliverable:** Users can export professional brand guides

---

### Phase 6: Polish & Optimization (Week 8)

**Goal:** Improve performance and UX

**Tasks:**
1. ✅ Add caching (Redis)
2. ✅ Optimize database queries
3. ✅ Improve error messages
4. ✅ Add analytics
5. ✅ User testing
6. ✅ Bug fixes

**Deliverable:** Production-ready system

---

## Cost Model

### Per-User Monthly Costs

Assuming moderate usage (50 content generations/month):

| Operation | Frequency | Unit Cost | Monthly Cost |
|-----------|-----------|-----------|--------------|
| **Brand Scanning** | | | |
| URL Scan | 1x (onboarding) | $0.03 | $0.03 |
| Document Upload | 0-1x | $0.07 | $0.00-$0.07 |
| **Content Generation** | | | |
| Router Agent | 50x | $0.02 | $1.00 |
| Generator Agent | 50x | $0.15 | $7.50 |
| Editor Agent | 50x | $0.03 | $1.50 |
| Image Generation | 25x | $0.00 (Satori) | $0.00 |
| **Embeddings** | | | |
| Writing Examples | 3x | $0.0001 | $0.0003 |
| Semantic Search | 50x | $0.00 (DB query) | $0.00 |
| **Storage** | | | |
| Database | - | Supabase Pro | $25.00 (shared) |
| File Storage | 100MB | $0.021/GB | $0.002 |
| **TOTAL PER USER** | | | **~$10.05** |

### Pricing Tiers (Suggested)

| Plan | Monthly Price | Included Generations | Overage Cost | Margin |
|------|---------------|---------------------|--------------|--------|
| **Free** | $0 | 10 | N/A | Loss leader |
| **Starter** | $29 | 100 | $0.30/gen | ~65% margin |
| **Pro** | $79 | 500 | $0.20/gen | ~75% margin |
| **Agency** | $299 | Unlimited | N/A | ~95% margin |

### Break-Even Analysis

| Metric | Value |
|--------|-------|
| Average cost per generation | $0.20 |
| Starter plan revenue per generation | $0.29 |
| Profit per generation (Starter) | $0.09 |
| Break-even users (Starter) | ~280 users |

---

## Conclusion

Madison is not just an AI copywriter - it's a **Brand Operating System** that:

1. ✅ **Learns brands automatically** (Pomelli-inspired URL scanning)
2. ✅ **Prevents Frankenstein Copy** (Squad System with negative constraints)
3. ✅ **Creates professional assets** (Composite images, brand guides)
4. ✅ **Scales cost-effectively** (~$0.20 per generation)

### The Three Innovations

**Innovation 1: The Three Silos**
- Silo A (Masters): Full documents, no chunking
- Silo B (Facts): Direct lookup, no hallucination
- Silo C (Vibe): Semantic search for examples

**Innovation 2: The Squad System**
- ONE voice per piece (not 8 voices at once)
- Negative constraints (what NOT to do)
- Auto-assignment from Brand DNA

**Innovation 3: The 4-Agent Pipeline**
- Router (strategy)
- Assembler (context)
- Generator (creation)
- Editor (validation)

### Next Steps

Refer to:
- `SQUAD_SYSTEM_COMPLETE.md` for squad definitions and router logic
- `BRAND_DNA_SCANNER_SPEC.md` for ingestion implementation
- Your existing `.cursorrules` for design system integration

**You now have the complete blueprint to build Madison.**

---

**End of MADISON_ARCHITECTURE_MASTER.md**