# Phase 3: AI-Driven Dynamic Copywriting Style Selection

## Overview

Phase 3 implements intelligent, context-aware copywriting style selection where Claude (Madison) dynamically chooses the best copywriter combination and marketing framework for each piece of content based on:

- Brand voice and lexical mandates from `brand_knowledge`
- Product collection and positioning
- Industry type and content format
- Available copywriting style options from the database

## How It Works

### 1. Automatic Detection

When content generation is requested via `generate-with-claude` edge function:

```typescript
// Phase 3 automatically activates when:
- organizationId is provided
- mode === "generate" 
- organization has industry_type set
- contentType is specified
- copywriting_style_mappings exist for that industry + content format
```

### 2. Style Pool Fetching

The system queries three tables to build an options pool:

**copywriting_style_mappings** → Compatible style combinations
```sql
SELECT * FROM copywriting_style_mappings 
WHERE industry_type = 'fragrance' 
AND content_format = 'product_description';
```

**copywriter_techniques** → Detailed copywriter profiles
```sql
SELECT * FROM copywriter_techniques 
WHERE copywriter_name IN ('J. Peterman', 'David Ogilvy', ...);
```

**marketing_frameworks** → Framework details
```sql
SELECT * FROM marketing_frameworks 
WHERE framework_code IN ('AIDA', 'FAB', 'PAS', ...);
```

### 3. Claude's Selection Process

Claude receives:

```
╔══════════════════════════════════════════════════════════════════╗
║          COPYWRITING STYLE SELECTION PHASE                       ║
╚══════════════════════════════════════════════════════════════════╝

AVAILABLE STYLE COMBINATIONS:

OPTION 1:
  • Primary Copywriter: J. Peterman
  • Secondary Copywriter: David Ogilvy (blend)
  • Framework: AIDA
  • Voice Spectrum: Sophisticated Storytelling
  • Example: "In the amber glow of Marrakech..."

OPTION 2:
  • Primary Copywriter: David Ogilvy
  • Framework: FAB
  • Voice Spectrum: Authoritative & Clear
  • Example: "Three patents. One extraordinary scent."

...

COPYWRITER TECHNIQUES LIBRARY:
[Detailed techniques, philosophies, best use cases]

MARKETING FRAMEWORKS LIBRARY:
[Framework structures, when to use them]

BRAND CONTEXT:
[Complete brand knowledge including lexical mandates]

SELECTION CRITERIA:
1. Brand voice alignment
2. Product positioning
3. Collection theme
4. Content format requirements
5. Diversity (avoid repetition)
```

Claude then outputs:

```
SELECTED_STYLE: J. Peterman|David Ogilvy|AIDA

[Generated content following that style...]
```

### 4. Lexical Mandates Enforcement

**Brand knowledge** acts as a hard constraint:

```typescript
// From brand_knowledge table:
{
  "vocabulary": ["olfactory journey", "artisanal", "timeless"],
  "copy_style_notes": "Never use 'perfume', always 'scent'",
  "forbiddenPhrases": ["cheap", "discount", "bargain"]
}
```

Claude must honor these **regardless** of which copywriting style is selected.

## Database Schema

### copywriting_style_mappings
```
- industry_type: 'fragrance', 'skincare', etc.
- content_format: 'product_description', 'email_campaign', 'social_post', etc.
- primary_copywriter: 'J. Peterman', 'David Ogilvy', 'Leo Burnett', etc.
- secondary_copywriter: Optional blend partner
- persuasion_framework: 'AIDA', 'FAB', 'PAS', 'StoryBrand', etc.
- voice_spectrum: 'Sophisticated Storytelling', 'Authoritative & Clear', etc.
- urgency_level: 'low', 'medium', 'high'
- key_hooks: Array of hook strategies
- example_snippet: Sample output in this style
```

### copywriter_techniques
```
- copywriter_name: Full name
- copywriter_era: Historical context
- core_philosophy: Main principles
- signature_techniques: JSON array of techniques
- writing_style_traits: Array of traits
- best_use_cases: When to use this copywriter
- example_headlines: Sample headlines
- example_body_copy: Sample body text
```

### marketing_frameworks
```
- framework_code: 'AIDA', 'FAB', etc.
- framework_name: Full name
- framework_category: 'Attention-Action', 'Benefit-Focused', etc.
- description: What it does
- when_to_use: Use cases
- structure_template: JSON structure
- examples: JSON array of examples
- strengths: Array of strengths
- weaknesses: Array of weaknesses
```

## Content Type Mappings

Phase 3 supports these content formats (must match `content_format` in mappings):

- `product_description`
- `email_campaign`
- `social_post`
- `blog_post`
- `landing_page`
- `ad_copy`
- `video_script`
- `short_form_video_script`

## Fallback Behavior

If Phase 3 cannot activate (no mappings found), the system falls back to:

1. Legacy hardcoded style overlays (`styleOverlay` parameter)
2. Default TARIFE_NATIVE style (brand voice only)

```typescript
console.log('[PHASE 3] No copywriting options found, falling back to legacy style overlays');
```

## For Tarife Attar: How Lexical Mandates Work

When Tarife Attar generates content:

1. **Phase 3 activates** → Fetches compatible J. Peterman, David Ogilvy, Leo Burnett options
2. **Claude analyzes** → Reviews all options + Tarife Attar's brand voice
3. **Claude selects** → Picks "J. Peterman + AIDA" (hypothetically)
4. **Lexical enforcement** → Claude generates using Peterman's storytelling style BUT:
   - ✓ Must use "olfactory journey" (approved term)
   - ✓ Must use "scent" not "perfume" (preferred phrasing)
   - ✗ Cannot use "cheap" (forbidden)
   - ✓ Must maintain artisanal, timeless vocabulary

**Result**: Sophisticated Peterman-style storytelling that perfectly honors Tarife Attar's unique vocabulary rules.

## Configuration Requirements

For Phase 3 to work:

### 1. Organization Setup
- `organizations.industry_type` must be set
- Brand knowledge must exist in `brand_knowledge` table

### 2. Database Population
- `copywriting_style_mappings` must have entries for your industry + content formats
- `copywriter_techniques` must have copywriter profiles
- `marketing_frameworks` must have framework details

### 3. Content Request
```typescript
await supabase.functions.invoke('generate-with-claude', {
  body: {
    prompt: "Product description for Oud Mystique",
    organizationId: "uuid-here",
    contentType: "product_description", // Critical!
    productData: { name: "Oud Mystique", collection: "Signature" },
    mode: "generate"
  }
});
```

## Benefits

✅ **Zero configuration** - Works automatically when tables are populated
✅ **Natural diversity** - Different style for each content piece
✅ **Brand alignment** - Always honors lexical mandates
✅ **Intelligent adaptation** - Considers product collection, positioning, brand voice
✅ **Scalable** - Add new copywriters/frameworks without code changes

## Next Steps

1. ✅ Phase 3 backend complete
2. ⏳ Populate `copywriting_style_mappings` with fragrance industry options
3. ⏳ Add copywriter techniques (J. Peterman, Ogilvy, Burnett, etc.)
4. ⏳ Add marketing frameworks (AIDA, FAB, PAS, StoryBrand, etc.)
5. ⏳ Optional: Build UI to let users view/customize style preferences
6. ⏳ Optional: Add style selection logging and analytics

## Testing Phase 3

To test if Phase 3 is working:

1. Check edge function logs:
```
[PHASE 3] Attempting dynamic style selection
[PHASE 3] Industry: fragrance, Content Type: product_description
[PHASE 3] Found 3 style options
```

2. Look for `SELECTED_STYLE:` in Claude's response

3. Verify lexical mandates are honored in output

## Architecture Diagram

```
User Request → Edge Function
                  ↓
            [Phase 3 Check]
                  ↓
          Has industry_type? ──No──→ Legacy Style Overlays
                  ↓ Yes
       Query copywriting_style_mappings
                  ↓
       Found options? ──No──→ Legacy Style Overlays  
                  ↓ Yes
          Fetch techniques & frameworks
                  ↓
          Build selection prompt
                  ↓
       Pass to Claude with brand knowledge
                  ↓
       Claude selects best style + generates content
                  ↓
       Enforce lexical mandates throughout
                  ↓
          Return styled content
```
