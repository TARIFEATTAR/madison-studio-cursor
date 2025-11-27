# Brand Analyzer Scoring System - Training for Madison
## Complete Guide for Asala.ai Integration

**Purpose:** Educate Madison on the brand analyzer scoring system used in Madison Studio, so she can effectively use and explain it in the Asala.ai build.

---

## Overview

The Brand Analyzer uses **two primary scoring systems**:

1. **Brand Health Score** (`completeness_score`) - Measures how complete a brand's setup is (0-100%)
2. **Brand Consistency Score** (`brand_consistency_score`) - Measures how well individual content pieces align with brand guidelines (0-100%)

---

## 1. BRAND HEALTH SCORE (Completeness Score)

### What It Measures

The Brand Health Score evaluates how comprehensively a brand has configured their brand DNA, products, collections, and content guidelines. It's a **deterministic score** based on specific data points.

### Score Calculation (0-100%)

The score is calculated from **7 components**, each with a specific point value:

#### Component 1: Core Identity (+30 points)
**What it checks:**
- At least 2 of these fields must be present and filled:
  - Mission
  - Vision
  - Values
  - Personality/Brand Personality
  - Brand Positioning
  - Brand Story

**Where it looks:**
- `brand_knowledge` table: `knowledge_type = 'core_identity'`
- `brand_knowledge` table: `knowledge_type = 'brand_voice'` (fallback)
- `organizations.settings.brand_guidelines` (fallback)

**Requirements:**
- Each field must be a string with at least 50 characters
- At least 2 fields must be present

**Example:**
```
✅ Has Mission (150 chars) + Values (200 chars) = Core Identity Present
❌ Only has Mission (30 chars) = Core Identity Missing (too short)
❌ Only has Mission (150 chars) = Core Identity Missing (need 2+ fields)
```

---

#### Component 2: Voice & Tone (+20 points)
**What it checks:**
- Voice guidelines OR tone spectrum must be present

**Where it looks:**
- `brand_knowledge` table: `knowledge_type = 'voice_tone'`
- `brand_knowledge` table: `knowledge_type = 'brand_voice'` (fallback)

**Requirements:**
- `voice_guidelines` field must exist and have content
- OR `tone_spectrum` field must exist and have content
- OR any field with "voice" or "tone" in the name must have content

**Example:**
```
✅ Has voice_guidelines: "Our voice is warm, professional, and approachable..."
✅ Has tone_spectrum: "We adapt from conversational to formal..."
❌ Has voice_guidelines but it's empty or null
```

---

#### Component 3: Target Audience (+15 points)
**What it checks:**
- Target audience information must be present

**Where it looks:**
- `brand_knowledge` table: `knowledge_type = 'target_audience'`
- `brand_knowledge` table: `knowledge_type = 'brand_voice'` (fallback)
- `organizations.settings.brand_guidelines.target_audience` (fallback)

**Requirements:**
- At least one audience field must have content
- Content must be at least 50 characters

**Example:**
```
✅ Has target_audience: "Our primary audience is women aged 25-45 who value..."
✅ Has audience field in brand_voice: "We speak to conscious consumers..."
❌ Has target_audience but it's only 20 characters
```

---

#### Component 4: Products (+15 points)
**What it checks:**
- At least one product must exist in the brand

**Where it looks:**
- `brand_products` table: `organization_id = [org_id]`

**Requirements:**
- `productsCount > 0`

**Example:**
```
✅ Has 3 products = Products Present
❌ Has 0 products = Products Missing
```

---

#### Component 5: Collections (+10 points)
**What it checks:**
- At least one collection must exist

**Where it looks:**
- `brand_collections` table: `organization_id = [org_id]`

**Requirements:**
- `collectionsCount > 0`

**Example:**
```
✅ Has 2 collections = Collections Present
❌ Has 0 collections = Collections Missing
```

---

#### Component 6: Transparency (+5 points)
**What it checks:**
- Either:
  - Comprehensive transparency document exists, OR
  - At least 50% of collections have transparency statements

**Where it looks:**
- `brand_knowledge` table: `knowledge_type IN ('collections_transparency', 'general', 'content_guidelines')`
- `brand_collections` table: `transparency_statement` field

**Requirements:**
- Comprehensive doc: Content must include both "transparency" and "collection" keywords
- OR: `transparencyCoverage >= 0.5` (at least half of collections have transparency statements)

**Example:**
```
✅ Has comprehensive transparency doc = Transparency Present
✅ Has 3 collections, 2 have transparency statements (66%) = Transparency Present
❌ Has 3 collections, only 1 has transparency (33%) = Transparency Missing
```

---

#### Component 7: Content Created (+10 points)
**What it checks:**
- At least one piece of content has been created

**Where it looks:**
- `master_content` table: `organization_id = [org_id]` AND `is_archived = false`
- `derivative_assets` table: `organization_id = [org_id]` AND `is_archived = false`

**Requirements:**
- `masterCount > 0` OR `derivativeCount > 0`

**Example:**
```
✅ Has 5 master content pieces = Content Created
✅ Has 10 derivative assets = Content Created
❌ Has 0 content pieces = Content Not Created
```

---

### Score Breakdown Example

```
Core Identity: ✅ (+30)
Voice/Tone: ✅ (+20)
Target Audience: ✅ (+15)
Products: ✅ (+15) - 3 products
Collections: ✅ (+10) - 2 collections
Transparency: ✅ (+5) - 66% coverage
Content Created: ✅ (+10) - 5 pieces

TOTAL SCORE: 105 → Capped at 100%
```

---

### Score Interpretation

**90-100%: Excellent**
- Brand is comprehensively set up
- All major components are in place
- Ready for advanced content generation

**70-89%: Good**
- Most components are present
- Some gaps may exist
- Can generate quality content with minor limitations

**40-69%: Needs Attention**
- Several components missing
- Content generation may be limited
- Should focus on completing brand setup

**0-39%: Incomplete**
- Critical components missing
- Brand setup is minimal
- Should prioritize brand DNA completion

---

### How to Help Clients Improve Score

**Quick Wins (High Impact):**
1. **Add Core Identity** (+30 points) - Add mission, vision, or values
2. **Add Voice & Tone** (+20 points) - Define voice guidelines
3. **Add Target Audience** (+15 points) - Describe ideal customer
4. **Add Products** (+15 points) - Add at least one product
5. **Add Collections** (+10 points) - Create at least one collection
6. **Create Content** (+10 points) - Generate first piece of content

**Medium Priority:**
- Add transparency statements to collections (+5 points)

**Recommended Order:**
1. Core Identity (biggest impact)
2. Voice & Tone (essential for content quality)
3. Target Audience (helps with personalization)
4. Products (enables product-specific content)
5. Collections (organizes products)
6. Content Creation (demonstrates system use)
7. Transparency (nice to have)

---

## 2. BRAND CONSISTENCY SCORE

### What It Measures

The Brand Consistency Score evaluates how well a **specific piece of content** aligns with the brand's guidelines. It analyzes individual content pieces (master content or derivative assets) against brand voice, tone, and terminology.

### Score Calculation (0-100%)

The score is calculated by AI analysis comparing content against brand guidelines. It includes:

#### Sub-Scores:
- **Overall Score** (0-100%) - Primary consistency score
- **Voice Alignment** (0-100%) - How well voice matches guidelines
- **Tone Alignment** (0-100%) - How well tone matches guidelines
- **Terminology Alignment** (0-100%) - How well vocabulary matches approved terms

### Analysis Components

**Strengths:**
- What the content does well
- Areas where it aligns with brand guidelines
- Positive aspects of brand consistency

**Weaknesses:**
- Where content deviates from guidelines
- Areas needing improvement
- Brand voice violations

**Recommendations:**
- Specific, actionable suggestions
- How to improve alignment
- What to change to better match brand

### Example Analysis

```json
{
  "score": 85,
  "overall_assessment": "Content aligns well with brand voice but could use more approved terminology",
  "strengths": [
    "Tone matches brand guidelines",
    "Voice is consistent with brand personality",
    "Message aligns with brand values"
  ],
  "weaknesses": [
    "Uses some generic terms instead of brand-specific vocabulary",
    "Could be more specific in product descriptions"
  ],
  "voice_alignment": 90,
  "tone_alignment": 85,
  "terminology_alignment": 75,
  "recommendations": [
    "Replace 'premium' with 'artisan-crafted' (approved term)",
    "Use 'scent journey' instead of 'fragrance experience'",
    "Add more specific product details per brand guidelines"
  ]
}
```

### Score Interpretation

**90-100%: Excellent Alignment**
- Content perfectly matches brand guidelines
- Ready to publish
- No changes needed

**80-89%: Good Alignment**
- Content aligns well with brand
- Minor adjustments may improve consistency
- Generally ready to publish

**70-79%: Needs Improvement**
- Some brand alignment issues
- Should revise before publishing
- Review recommendations

**Below 70%: Poor Alignment**
- Significant brand voice violations
- Needs substantial revision
- Should not publish without changes

---

## 3. HOW TO USE THE SCORING SYSTEM

### For Brand Health Score

**When to Check:**
- After completing brand setup
- When onboarding new clients
- After adding brand knowledge
- When troubleshooting content quality issues

**How to Explain to Clients:**
- "Your Brand Health Score measures how complete your brand setup is. Higher scores mean better content quality."
- "Think of it like a foundation - the stronger your brand setup, the better your content will be."
- "We'll help you improve your score by completing missing components."

**How to Help Improve:**
1. Identify missing components
2. Prioritize high-impact additions (Core Identity, Voice/Tone)
3. Guide clients through completing each component
4. Re-run analysis after additions
5. Celebrate score improvements

---

### For Brand Consistency Score

**When to Check:**
- Before publishing content
- When reviewing drafts
- When content feels off-brand
- As part of quality assurance

**How to Explain to Clients:**
- "This score shows how well your content matches your brand guidelines."
- "Higher scores mean your content sounds like your brand."
- "We'll revise content to improve alignment before publishing."

**How to Use:**
1. Generate or review content
2. Run brand consistency analysis
3. Review score and recommendations
4. Revise content based on feedback
5. Re-analyze until score is acceptable (80%+)

---

## 4. INTEGRATION WITH ASALA.AI

### Synergistic Benefits

**For Asala.ai:**
- Use same scoring system across both platforms
- Consistent brand evaluation methodology
- Unified brand health tracking
- Cross-platform brand insights

**For Clients:**
- Single source of truth for brand health
- Consistent scoring methodology
- Seamless experience across platforms
- Unified brand management

### How Madison Uses It

**In Conversations:**
- "Your Brand Health Score is 65%. Let's improve it by adding your brand voice guidelines."
- "This content scored 78% for brand consistency. Let's revise it to get it above 85%."
- "Your score improved from 40% to 75%! Great work completing your brand setup."

**In Content Generation:**
- Reference brand health score when explaining content quality
- Use consistency scores to refine content
- Guide clients to improve scores for better results

**In Strategy:**
- Prioritize improvements based on score impact
- Track progress over time
- Celebrate milestones (70%, 85%, 90%+)

---

## 5. TECHNICAL DETAILS

### API Endpoints

**Brand Health Analysis:**
- Endpoint: `analyze-brand-health`
- Method: POST
- Input: `{ organizationId }`
- Output: `{ completeness_score, gap_analysis, recommendations }`

**Brand Consistency Analysis:**
- Endpoint: `analyze-brand-consistency`
- Method: POST
- Input: `{ contentId, contentType, content, title, organizationId }`
- Output: `{ score, overall_assessment, strengths, weaknesses, voice_alignment, tone_alignment, terminology_alignment, recommendations }`

### Data Storage

**Brand Health:**
- Table: `brand_health`
- Fields: `organization_id`, `completeness_score`, `gap_analysis`, `recommendations`, `last_analyzed_at`
- History: `brand_health_history` (tracks changes over time)

**Brand Consistency:**
- Tables: `master_content`, `derivative_assets`
- Fields: `brand_consistency_score`, `brand_analysis`, `last_brand_check_at`

---

## 6. BEST PRACTICES

### For Madison

1. **Always Check Brand Health First**
   - Before generating content, check client's brand health score
   - If score is low, recommend completing brand setup first
   - Explain how score impacts content quality

2. **Use Scores to Guide Conversations**
   - Reference scores naturally in discussions
   - Use scores to prioritize improvements
   - Celebrate score improvements

3. **Be Specific in Recommendations**
   - Don't just say "improve your score"
   - Say "Add your brand voice guidelines to improve from 60% to 80%"
   - Explain the impact of each component

4. **Track Progress**
   - Note score improvements over time
   - Reference previous scores when discussing progress
   - Show clients their improvement journey

5. **Set Realistic Expectations**
   - 100% is not always necessary
   - 85%+ is excellent for most brands
   - Focus on high-impact components first

---

## 7. EXAMPLE CONVERSATIONS

### Example 1: Explaining Brand Health Score

**Client:** "What does my Brand Health Score mean?"

**Madison:** "Your Brand Health Score of 65% measures how complete your brand setup is. It's calculated from 7 components: Core Identity (30 points), Voice & Tone (20 points), Target Audience (15 points), Products (15 points), Collections (10 points), Transparency (5 points), and Content Created (10 points).

Right now, you have Products and Collections set up, which is great. To improve your score, I'd recommend adding your Core Identity - that's your mission, vision, or values. That alone would add 30 points and bring you to 95%. Would you like help setting that up?"

---

### Example 2: Using Consistency Score

**Client:** "Is this content ready to publish?"

**Madison:** "Let me check the brand consistency score for this piece... It's scoring 78%, which is good but could be better. The analysis shows it aligns well with your brand voice and tone, but it's using some generic terms instead of your approved vocabulary.

Specifically, it's using 'premium quality' where your brand guidelines prefer 'artisan-crafted.' If we make that change and a few others, we can get this to 90%+. Should I revise it?"

---

### Example 3: Celebrating Improvement

**Client:** "I just added my brand voice guidelines."

**Madison:** "Excellent! Let me recalculate your Brand Health Score... You've improved from 50% to 70%! That's a 20-point jump. Your brand setup is now in the 'Good' range, which means you'll get much better content quality.

The next highest-impact addition would be your Target Audience description - that would add another 15 points and bring you to 85%. Would you like help with that?"

---

## 8. QUICK REFERENCE

### Score Components (Brand Health)

| Component | Points | Priority | Quick Win? |
|-----------|--------|----------|------------|
| Core Identity | +30 | High | ✅ Yes |
| Voice & Tone | +20 | High | ✅ Yes |
| Target Audience | +15 | High | ✅ Yes |
| Products | +15 | Medium | ✅ Yes |
| Collections | +10 | Medium | ✅ Yes |
| Content Created | +10 | Low | ✅ Yes |
| Transparency | +5 | Low | ⚠️ Maybe |

### Score Ranges

| Range | Status | Action |
|-------|--------|--------|
| 90-100% | Excellent | Maintain, optimize |
| 70-89% | Good | Minor improvements |
| 40-69% | Needs Attention | Complete setup |
| 0-39% | Incomplete | Prioritize setup |

### Consistency Score Ranges

| Range | Status | Action |
|-------|--------|--------|
| 90-100% | Excellent | Publish |
| 80-89% | Good | Minor edits, publish |
| 70-79% | Needs Improvement | Revise before publish |
| <70% | Poor | Major revision needed |

---

## 9. INTEGRATION CHECKLIST

**For Asala.ai Build:**

- [ ] Implement Brand Health Score calculation
- [ ] Implement Brand Consistency Score analysis
- [ ] Display scores in dashboard/UI
- [ ] Create score improvement recommendations
- [ ] Track score history over time
- [ ] Integrate with content generation workflow
- [ ] Add score explanations and tooltips
- [ ] Create score improvement workflows
- [ ] Sync scores between Madison Studio and Asala.ai (if needed)

---

**This scoring system is a core part of Madison Studio's brand intelligence. Understanding it fully enables Madison to provide better guidance and demonstrate the value of comprehensive brand setup.**

