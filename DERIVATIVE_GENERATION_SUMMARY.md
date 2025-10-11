# Multiply Page - Derivative Generation Complete Guide

## ✅ What's Already Built

### 1. UI Components Updated ✓
- **9 Derivative Type Cards** displayed in grid:
  1. Instagram (2,200 char limit)
  2. Email (2,000 char limit)
  3. 3-Part Email Series (sequence)
  4. Pinterest (500 char limit)
  5. Product Description (500 char limit)
  6. SMS (160 char limit)
  7. 5-Part Email Series (sequence)
  8. 7-Part Email Series (sequence)
  9. TikTok (300 char limit)

### 2. AI Backend Architecture ✓

**Edge Function:** `supabase/functions/repurpose-content/index.ts`

**What it does:**
- Fetches your full master content
- Pulls ALL your brand knowledge from database
- Generates derivatives using Lovable AI (Gemini 2.5 Flash - FREE during promo)
- Ensures consistency using brand context + transformation prompts
- Saves derivatives to database with metadata

## 🎯 How Consistency is Ensured

### A. Brand Context Injection
**Every** derivative generation request includes:
```
BRAND CONTEXT:
- Organization name
- Brand voice guidelines (from Brand Knowledge Center)
- Brand tone documentation
- Visual guidelines (colors, etc.)
- Industry-specific guidelines
- Collection themes
- Pillar focus definitions
```

### B. Codex v2 Universal Prompt
A sophisticated system prompt that ensures:
- ✓ Clarity & specificity (no vague adjectives)
- ✓ Respects audience intelligence (no condescension)
- ✓ Understated elegance (quality implied, not shouted)
- ✓ Accuracy first (truthfulness over hype)
- ✓ **Banned words list** to avoid AI clichés
  - Banned: "unlock, unleash, delve, tapestry, elevate, game-changing, revolutionary, seamless, amazing"
- ✓ Varied rhythm and structure
- ✓ Plain text output (no markdown)

### C. Master Content as Source of Truth
```typescript
// The COMPLETE master content is sent for EVERY derivative
{
  title: "Noir de Nuit: The Art of Evening Fragrance",
  full_content: "[ENTIRE 1000+ word article]",
  collection: "Signature Collection",
  pillar_focus: "Craftsmanship",
  dip_week: 12
}
```

### D. Transformation Prompts with Consistency Mandates

Each derivative type has specific instructions that include:

**For Single Derivatives (Instagram, Email, SMS, etc.):**
```
CONSISTENCY REQUIREMENTS:
- Maintain brand voice and tone throughout
- Extract core message from master content
- No deviation from original theme
- Preserve pillar focus (if specified)
- Match collection aesthetic
```

**For Email Sequences (3/5/7-part):**
```
SEQUENCE CONSISTENCY:
- Maintain narrative thread across ALL emails
- Each email must stand alone but build on previous
- Reference previous emails: "As I mentioned...", "Remember when..."
- Use consistent brand voice throughout
- Progressive disclosure of master content's core message
- NO deviation from central theme

Arc structure ensures theme permeation:
- Email 1: Introduces core theme
- Middle emails: Develop different facets of SAME theme
- Final email: Synthesizes theme + invites action
```

## 📋 How Each Derivative Type Works

### 1. Instagram (Carousel Format)
**Output:** 5 slides + caption
- Slide 1: Visual hook (10 words max)
- Slides 2-4: One insight per slide (30 words each)
- Slide 5: Clear CTA
- Caption: Condensed narrative (150 words) + hashtags
**Theme Preservation:** Each slide extracts a facet of master content's core message

### 2. Email (Single Newsletter)
**Output:** Subject lines + preview + body
- 3 subject line options (question/statement/intrigue formats)
- Preview text (40-60 chars)
- Email body (400-500 words, condensed from master)
- Personalized opening + CTA
**Theme Preservation:** Condenses to 30-40% while maintaining core philosophy

### 3. 3-Part Email Series
**Output:** 3 emails with subjects, previews, bodies
- **Email 1 - Welcome** (Day 1): Introduce relationship + hint at journey
- **Email 2 - Value** (Day 3): Core philosophy from master (condensed 50%)
- **Email 3 - Invitation** (Day 5): Synthesize + clear CTA
**Theme Preservation:** Single narrative arc across all 3, explicit references between emails

### 4. Pinterest
**Output:** Pin description (300-500 chars)
- First 50 chars: Most compelling visual/benefit hook
- Middle: Expand concept with natural keywords
- Closing: Gentle CTA
**Theme Preservation:** Extracts most visually compelling angle from master content

### 5. Product Description
**Output:** E-commerce copy (150 words max)
- Opening statement (2-3 sentences capturing essence)
- Key features and benefits
- Emotional/experiential context
**Theme Preservation:** Distills master content's product-relevant insights

### 6. SMS
**Output:** 3 options, each under 160 chars
- ONE most powerful concept from master content
- Clear CTA + link placeholder
- Authentic brand voice despite brevity
**Theme Preservation:** Extracts single most important message

### 7. 5-Part Email Series
**Output:** 5 emails following extended nurture arc
- **Email 1 - Opening** (Day 1): Provocative question
- **Email 2 - Problem** (Day 2): Articulate what's broken
- **Email 3 - Solution** (Day 4): Core content (condensed 40%)
- **Email 4 - Proof** (Day 6): Evidence, deeper dive
- **Email 5 - Invitation** (Day 8): Synthesize + specific CTA
**Theme Preservation:** Problem → Solution → Proof → Invitation arc from master content

### 8. 7-Part Email Series
**Output:** 7 emails following deep dive journey
- **Email 1 - Arrival** (Day 1): Welcome
- **Email 2 - Question** (Day 2): Challenge assumptions
- **Email 3 - Context** (Day 4): Historical/cultural background
- **Email 4 - Philosophy** (Day 6): Core belief (condensed 30%)
- **Email 5 - Practice** (Day 8): Practical application
- **Email 6 - Evidence** (Day 10): Proof + case studies
- **Email 7 - Threshold** (Day 12): Final invitation
**Theme Preservation:** Curiosity → Understanding → Action arc, deep exploration of master content

### 9. TikTok (NEW!)
**Output:** Video script (30-60 seconds, <300 chars)
- Hook (0-3 sec): Attention-grabbing opening
- Setup (3-15 sec): Context or problem
- Content (15-45 sec): Core insight from master
- CTA (45-60 sec): Clear next step
- Visual cues: [VISUAL: description] for editor
**Theme Preservation:** Spoken script format, authentic but on-brand, core message intact

## 🔄 The Generation Flow

### When User Clicks "Generate X Derivatives":

```
1. Frontend (Multiply page)
   ↓
   - User selects derivative types (Instagram, 3-Part Email, etc.)
   - Clicks "Generate" button
   ↓
2. Edge Function (repurpose-content)
   ↓
   - Fetches full master content from database
   - Fetches ALL brand knowledge entries
   - Builds brand context string
   ↓
3. For Each Derivative Type:
   ↓
   - Builds AI prompt:
     * System: Codex v2 + Brand Context
     * User: Transformation Prompt + Master Content
   ↓
   - Sends to Lovable AI Gateway (Gemini 2.5 Flash)
   ↓
   - Receives generated derivative
   ↓
   - Parses platform-specific metadata:
     * Email: Extract subject lines, preview
     * Instagram: Extract slides, caption
     * Email Series: Extract all emails
     * TikTok: Parse script sections
   ↓
   - Strips markdown formatting → clean plain text
   ↓
   - Saves to database (derivative_assets table)
   ↓
4. Returns to Frontend
   ↓
   - Derivatives appear in UI
   - Status: "Pending"
   - User can Approve/Reject/Edit
```

## 🛡️ What Ensures No Deviation

### 1. **Full Master Content Always Included**
- Never truncated
- Never summarized before sending to AI
- Complete context for every derivative

### 2. **Explicit Consistency Instructions**
Every prompt includes:
```
CRITICAL CONSISTENCY REQUIREMENTS:
- Preserve the core message from master content
- Maintain brand voice throughout
- No introduction of concepts not in master content
- Stay true to collection theme
- Align with pillar focus
```

### 3. **Sequential Email Architecture**
Email series prompts explicitly mandate:
```
- Reference previous emails ("As I mentioned in Email 1...")
- Build narrative arc from SAME core theme
- Each email explores different facet of SAME message
- Final email synthesizes entire journey
```

### 4. **Brand Knowledge Integration**
Your uploaded brand guidelines are injected into EVERY request:
- Voice & tone rules
- Vocabulary preferences
- Forbidden phrases
- Industry-specific terminology
- Collection-specific themes

### 5. **Low Temperature Setting**
AI model configured for consistency:
- Model: Gemini 2.5 Flash (fast, high quality)
- Temperature: Low (more deterministic, less creative deviation)
- Focus: Transformation, not invention

## 📚 What You Need to Provide for Best Results

### Critical for Consistency:

1. **Brand Voice & Tone** (Upload to Brand Knowledge Center)
   - Examples of your best writing
   - Voice characteristics: "Understated, sophisticated, never promotional"
   - Tone guidelines: "Educational, inspiring, authentic"
   - Do's and Don'ts list

2. **Vocabulary Preferences**
   - Words you love: "craftsmanship, artistry, intentional"
   - Words you hate: "amazing, incredible, must-have"
   - Industry-specific terms to use

3. **Collection Definitions**
   - What does "Signature Collection" represent?
   - What themes should derivatives emphasize per collection?
   - Any specific messaging for each collection?

4. **Pillar Focus Meanings**
   - Define each pillar (Craftsmanship, Sustainability, etc.)
   - Provide examples of content that nails each pillar
   - Key concepts to emphasize for each

### Optional but Helpful:

5. **Example Derivatives**
   - Show us Instagram posts you love
   - Share email newsletters that feel on-brand
   - Product descriptions that capture your voice

6. **Target Audience Profiles**
   - Who reads your Instagram vs email?
   - Different tone for different platforms?
   - Any platform-specific guidelines?

## ⚙️ Technical Implementation

### Database Schema
```sql
derivative_assets
  ├── id (uuid)
  ├── master_content_id (references master_content)
  ├── asset_type ('instagram', 'email_3part', 'tiktok', etc.)
  ├── generated_content (text - the derivative)
  ├── platform_specs (jsonb - metadata)
  │   ├── For email: { subjectLines, previewText }
  │   ├── For instagram: { slides, caption, slideCount }
  │   ├── For email series: { emails: [{ subject, preview, body }], sequenceType }
  │   └── For tiktok: { hook, setup, content, cta, visuals }
  ├── approval_status ('pending', 'approved', 'rejected')
  ├── created_by (uuid)
  ├── organization_id (uuid)
  └── created_at (timestamp)
```

### AI Model Details
- **Provider:** Lovable AI Gateway
- **Model:** `google/gemini-2.5-flash`
- **Cost:** FREE during promotional period (until Oct 13, 2025)
- **Rate Limits:** Workspace-based (increase with paid plans)
- **Context Window:** 200K tokens
- **Output:** Up to 8K tokens per request

### Error Handling
```typescript
// Rate limiting
if (response.status === 429) {
  // Show user: "Rate limits exceeded. Please wait and retry."
}

// Payment required (after promo ends)
if (response.status === 402) {
  // Show user: "Add credits to Lovable AI workspace"
}

// Generation failures
// User can retry generation for failed derivatives
```

## 🧪 Testing Consistency

### What to Check After Generation:

1. **Voice Match Test**
   - Read each derivative aloud
   - Does it sound like your brand?
   - Are banned words avoided?
   - Is the tone consistent?

2. **Theme Preservation Test**
   - Compare derivative to master content
   - Is core message intact?
   - Are new concepts introduced?
   - Does it feel like the same story?

3. **Sequential Coherence Test** (for email series)
   - Read all emails in sequence
   - Do they reference each other?
   - Is there a clear narrative arc?
   - Does each build on the previous?

4. **No Contradictions Test**
   - Do all derivatives align?
   - Are facts consistent?
   - Is positioning the same across channels?

### Red Flags 🚩

- ❌ Derivative introduces concepts not in master content
- ❌ Tone shifts dramatically between derivatives
- ❌ Email series emails feel disconnected
- ❌ Brand voice not recognizable
- ❌ Uses banned words or clichés
- ❌ Contradicts master content facts or positioning

### Green Lights ✅

- ✓ All derivatives feel authored by same brand
- ✓ Core message clear in every derivative
- ✓ Email series builds cohesive narrative
- ✓ Brand voice consistent across platforms
- ✓ Facts and positioning align perfectly
- ✓ Reads naturally, not AI-generated

## 🔧 Customization Options

### Adjust Transformation Prompts
Location: `supabase/functions/repurpose-content/index.ts`

You can customize:
- Length targets (currently 30-40% for email, 50% for email series)
- Structural requirements (number of slides, tweets, etc.)
- Tone guidelines (more formal/casual)
- CTA placement and style
- Visual cue formatting

### Adjust System Prompt (Codex v2)
Customize:
- Banned words list
- Voice principles
- Output formatting rules
- Industry-specific guidelines

### Platform-Specific Customization
For each derivative type, you can adjust:
- Character limits
- Structural templates
- Metadata parsing
- Display formatting

## 📊 Success Metrics

Track these to measure consistency:

1. **Approval Rate**
   - % of derivatives approved on first generation
   - Target: >80% for well-established brands

2. **Edit Distance**
   - How much editing is needed before approval?
   - Target: Minor tweaks only (<10% content change)

3. **Voice Consistency Score**
   - Do derivatives pass your "sounds like us" test?
   - Target: 9/10 or higher

4. **Theme Deviation Incidents**
   - Count of derivatives that introduced off-brand concepts
   - Target: 0

## 🎓 Best Practices

### Before Generating:
1. ✅ Upload comprehensive brand voice guidelines
2. ✅ Define all collections and pillars
3. ✅ Review master content for clarity
4. ✅ Ensure master content is on-brand

### During Generation:
1. ✅ Select derivative types strategically (don't generate all 9 if you only need 3)
2. ✅ Wait for generation to complete (20-30 seconds)
3. ✅ Review in batch, not one-by-one

### After Generation:
1. ✅ Use Editorial Director for refinements (not regeneration)
2. ✅ Approve derivatives that nail your voice
3. ✅ Reject clear misses (AI learns from rejections)
4. ✅ Save approved derivatives to library for reference

## 🔮 Future Enhancements

Planned improvements:
1. **Learning from approvals/rejections** - AI adapts to your preferences
2. **Custom transformation templates** - Define your own derivative types
3. **A/B testing** - Generate multiple versions, pick best
4. **Voice consistency scoring** - Automated brand voice match percentage
5. **Sequential dependency** - Email 2 generation uses approved Email 1

## 🆘 Troubleshooting

### "Generated content doesn't sound like my brand"
**Solution:** Upload more brand voice examples to Brand Knowledge Center

### "Email series feels disconnected"
**Solution:** Ensure master content has clear narrative structure for AI to follow

### "Too many AI clichés"
**Solution:** Add specific forbidden words to your brand guidelines

### "Derivatives are too short/long"
**Solution:** Customize transformation prompts with different length targets

### "TikTok scripts don't feel natural"
**Solution:** Provide examples of TikTok scripts you love in brand knowledge

## ✨ Key Takeaway

The system is designed to:
1. **Preserve your brand DNA** through comprehensive context injection
2. **Maintain thematic consistency** through explicit prompts and full content sharing
3. **Enable human refinement** through Editorial Director integration
4. **Learn from your feedback** through approval/rejection workflow

**The original piece of content WILL permeate through every single derivative** because:
- ✅ Full master content is included in EVERY request
- ✅ Brand context is injected EVERY time
- ✅ Transformation prompts mandate consistency
- ✅ Sequential email prompts require narrative coherence
- ✅ Low AI temperature prevents creative deviation
- ✅ Codex v2 bans vague generalizations
- ✅ You have final approval on everything

**Your role:**
- Provide comprehensive brand guidelines
- Review and approve/reject derivatives
- Use Editorial Director to refine (not regenerate)
- Build your derivative library over time

**The AI's role:**
- Transform, not invent
- Maintain, not deviate
- Condense, not contradict
- Adapt, not abandon

