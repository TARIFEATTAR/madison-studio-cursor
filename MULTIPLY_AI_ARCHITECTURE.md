# Multiply Page - AI Derivative Generation Architecture

## Overview
This document explains how Madison (the AI) ensures consistency and theme preservation when generating derivatives from master content.

## Current Architecture

### 1. Edge Function: `repurpose-content`
Location: `supabase/functions/repurpose-content/index.ts`

**Purpose:** Transforms master content into channel-specific derivatives while maintaining brand voice, theme, and consistency.

### 2. Consistency Mechanisms

#### A. Brand Context Integration
The system automatically pulls brand knowledge from your database:
- Organization name and brand config
- Brand knowledge entries (voice, tone, guidelines)
- Brand colors and visual guidelines
- All active brand documentation

This context is injected into EVERY derivative generation request.

#### B. Transformation Prompts
Each derivative type has a carefully crafted transformation prompt that includes:

1. **Structural Requirements** - Specific format and length constraints
2. **Content Transformation Rules** - How to condense/adapt while preserving theme
3. **Brand Voice Mandate** - Explicit instruction to maintain your brand voice
4. **Narrative Consistency** - Rules for maintaining the original content's core message

#### C. Email Sequence Consistency
For 3-part, 5-part, and 7-part email sequences, the system ensures:

**Narrative Arc:**
- Each email builds on previous emails
- Explicit references to previous emails ("As I mentioned...", "Remember when...")
- Progressive disclosure of the master content's core message
- Consistent brand voice across all emails in sequence

**Theme Preservation:**
- Email 1: Introduces core theme from master content
- Middle emails: Develop different facets of the same theme
- Final email: Synthesizes the theme and invites action
- NO deviation from master content's central message

### 3. What Ensures Consistency

#### Master Content as Source of Truth
```typescript
// The FULL master content is passed to AI for EVERY derivative
{
  masterContent: {
    title: "...",
    full_content: "...",  // Complete original text
    collection: "...",
    pillar_focus: "..."
  }
}
```

#### Explicit Consistency Instructions
Every transformation prompt includes:
```
CONSISTENCY REQUIREMENTS:
- Maintain brand voice and tone throughout
- Preserve core message from master content
- No deviation from original theme
- Every derivative must feel like it came from the same source
```

#### Sequential Email Constraints
For email sequences specifically:
```
SEQUENCE CONSISTENCY:
- Maintain narrative thread across all X emails
- Each email must stand alone but build on previous
- Reference previous emails explicitly
- Use consistent brand voice throughout
```

## How It Works (Step-by-Step)

### When User Clicks "Generate Derivatives":

1. **Fetch Full Master Content** from database
2. **Fetch Brand Context** (voice, tone, guidelines)
3. **For Each Selected Derivative Type:**
   - Build AI prompt with:
     - System context (you are Madison, the Editorial Director)
     - Brand context (voice, tone, colors, guidelines)
     - Full master content
     - Transformation prompt for specific derivative type
     - Consistency requirements
   - Send to Claude AI
   - Receive generated derivative
   - Strip markdown to plain text
   - Save to database

4. **For Email Sequences (3/5/7-part):**
   - Uses extended prompts with narrative arc structure
   - Generates ALL emails in one request to ensure consistency
   - Explicitly instructs AI to reference previous emails
   - Mandates thematic consistency across sequence

### Example Prompt Structure:
```
SYSTEM: You are Madison, Madison Studio's Editorial Director...

BRAND CONTEXT:
Organization: [Brand Name]
Voice: [Brand voice guidelines]
Tone: [Brand tone]
Visual Guidelines: [Colors, etc.]

MASTER CONTENT:
Title: "Noir de Nuit: The Art of Evening Fragrance"
Content: [Full 1000+ word article]
Collection: Signature Collection
Pillar: Craftsmanship

TASK: Transform this into a 3-part email sequence...
[Detailed transformation prompt]

CONSISTENCY MANDATE:
- Every email must feel authored by the same brand
- Core message about craftsmanship must permeate all 3 emails
- Reference the fragrance's story consistently
- Maintain elevated, artistic tone throughout
```

## What We Need From You

To ensure perfect consistency, we need:

### 1. Brand Voice & Tone Documentation
- Upload to Brand Knowledge Center
- Examples of your brand's writing style
- Do's and don'ts for brand voice
- Key phrases or vocabulary to use/avoid

### 2. Pillar Content Definitions
- If you use pillar focuses (Craftsmanship, Sustainability, etc.)
- Define what each pillar means for your brand
- Provide examples of content for each pillar

### 3. Collection Themes
- What does each collection represent?
- What themes should derivatives emphasize?
- Any specific messaging per collection?

### 4. Example Derivatives (Optional but Helpful)
- Show us examples of Instagram posts you love
- Sample email newsletters that nail your voice
- Product descriptions that feel "on brand"

## Current Derivative Types (9 Total)

1. **Instagram** - Visual storytelling with captions (2,200 char limit)
2. **Email** - Single newsletter format (2,000 char limit)
3. **X/Twitter** - Short-form posts (280 char limit) - REMOVED, replaced with TikTok
4. **Pinterest** - Pin descriptions (500 char limit)
5. **Product Description** - E-commerce copy (500 char limit)
6. **SMS** - Text message marketing (160 char limit)
7. **3-Part Email Series** - Welcome/Value/Invitation sequence
8. **5-Part Email Series** - Extended nurture sequence
9. **7-Part Email Series** - Deep dive journey sequence
10. **TikTok** - Video scripts (300 char limit) - NEW

## Testing Consistency

### What to Check:
1. **Voice Match** - Does each derivative sound like your brand?
2. **Theme Preservation** - Is the core message intact?
3. **Sequential Coherence** (for email series) - Do emails build on each other?
4. **No Contradictions** - Do all derivatives align with master content?

### Red Flags:
- Derivative introduces concepts not in master content
- Tone shifts dramatically between derivatives
- Email sequence emails feel disconnected
- Brand voice isn't recognizable

## Iteration & Refinement

The system is designed to:
1. **Learn from your brand knowledge** - The more you add, the better
2. **Use Editorial Director for refinement** - Human-in-the-loop editing
3. **Approve/Reject workflow** - You control what gets used

## Technical Details

### AI Model
- Uses Claude (Anthropic) via existing edge function
- Model: Claude Sonnet (high quality, fast)
- Temperature: Low (for consistency)
- Max tokens: Varies by derivative type

### Error Handling
- If generation fails, user sees error message
- Can retry generation
- Can edit generated content with Editorial Director

### Database Schema
```sql
derivative_assets (
  id,
  master_content_id,  -- Links back to original
  asset_type,         -- 'instagram', 'email_3part', etc.
  generated_content,  -- The derivative text
  platform_specs,     -- Additional metadata
  approval_status     -- 'pending', 'approved', 'rejected'
)
```

## Next Steps to Improve Consistency

1. **Add TikTok transformation prompt** to edge function
2. **Update email sequence parsing** to handle new formats
3. **Add brand knowledge examples** to your Brand Knowledge Center
4. **Test with real master content** and provide feedback
5. **Refine transformation prompts** based on your preferences

## Questions to Answer

1. Do you want TikTok scripts to be video descriptions or spoken scripts?
2. Should Pinterest descriptions focus on visual elements or product benefits?
3. For email sequences, do you prefer formal or conversational tone?
4. Should SMS messages always include a link, or sometimes just awareness?
5. What's your preferred CTA style across different platforms?
