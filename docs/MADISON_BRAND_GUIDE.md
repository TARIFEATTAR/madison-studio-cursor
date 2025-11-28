# Madison Studio Brand Guidelines

_Last updated: 2025-02-14_

> **Purpose**  
> This document is the canonical reference for Madison Studio’s tone, visuals, and implementation rules. Every touchpoint—from UI to PDFs to AI-generated content—should reflect these guidelines.

---

## 1. Brand Essence

| Attribute | Description |
|-----------|-------------|
| **Archetype** | The Strategist × The Muse — analytical, insightful, and tastefully aspirational. |
| **Mission** | Equip modern creative teams with strategic clarity and handcrafted AI systems that feel like an in-house agency. |
| **Values** | Insight over noise · Craft over haste · Reliability without rigidity · Inclusive intelligence. |
| **Promise** | “A calm, strategic partner that turns chaos into elegant plans.” |

### Tone Pillars
1. **Calm Authority** – Confident, never loud. Uses decisive verbs and data-backed statements.  
2. **Refined Warmth** – Human and encouraging, avoids corporate jargon.  
3. **Strategic Precision** – Prioritizes clarity, structure, and next steps.  
4. **Modern Heritage** – Blends timeless editorial cues with contemporary product UX.

### Personality Snapshot
- **Sound**: Editorial strategist meets boutique creative director.  
- **Pace**: Measured. Average sentences 12–17 words.  
- **Point of View**: Uses “we” when representing Madison; switches to “you” when directing the client.  
- **Tagline**: _“Strategic intelligence, handcrafted for modern commerce.”_

---

## 2. Voice & Copy Framework

### 2.1 Voice Compass
| Dimension | Dial Position | Notes |
|-----------|---------------|-------|
| Formal ↔ Casual | **60% formal** | Use polished vocabulary, avoid slang. |
| Friendly ↔ Objective | **Balanced** | Warm intros, precise instructions. |
| Playful ↔ Serious | **Serious with sparks** | Use metaphors sparingly to clarify strategy. |
| Passive ↔ Directive | **Directive** | End sections with explicit actions (“Next, do…”) |

### 2.2 Writing Rules
1. Start with context, end with action (diagnosis → insight → next step).  
2. Use numbered or bulleted lists once content exceeds three sentences.  
3. Limit adjectives; prioritize verbs that show motion (align, map, craft, orchestrate).  
4. Avoid filler phrases (“just,” “maybe,” “kind of”).  
5. Spell out numbers zero–nine; use numerals for 10+.  
6. Use en-dashes (–) for ranges and em-dashes (—) for emphasis.  
7. Headlines: Title Case. Section labels: ALL CAPS tracking 0.2em.

### 2.3 Vocabulary Guide
| Use | Avoid |
|-----|-------|
| strategic, measured, craft, orchestration, cadence | hustle, blitz, hack, wizardry |
| audit, framework, ritual | sprint (unless literal dev sprint) |
| calm, confident, consistent | crushing it, killer, insane |

### 2.4 Example (Before/After)
> **Before:** “We can totally whip up a content plan fast.”  
> **After:** “We’ll map a 7-day content cadence that reuses your strongest assets.”

---

## 3. Visual Identity System

### 3.1 Color Palette
| Role | Name | Hex | Usage |
|------|------|-----|-------|
| **Background** | Vellum Cream | `#F5F1E8` | Primary canvas, large surfaces. |
| **Surface** | Parchment White | `#FDFBF7` | Cards, modals, PDF spreads. |
| **Ink** | Ink Black | `#1C150D` | Headlines, primary body text. |
| **Charcoal** | Rich Charcoal | `#2F2A26` | Secondary text, borders. |
| **Accent** | Aged Brass | `#B8956A` | Buttons, highlights, charts. |
| **Highlight** | Brass Glow | `#D0A96C` | Hover glow, status badges. |
| **Success** | Forest Ink | `#1E6C4E` | Success states. |
| **Alert** | Ember Clay | `#B34C38` | Errors + destructive actions. |

Guidelines:
- Never use pure black or pure white; always soft equivalents.  
- Limit brass usage to ≤20% of a layout to retain premium feel.  
- Charts use monochrome variants first; add accent colors only for callouts.

### 3.2 Typography
| Role | Font | Size/Line | Notes |
|------|------|-----------|-------|
| Display | `Cormorant Garamond` (serif) | 48/56, 64/72 | Used in hero titles, PDF covers. |
| Headline | `Fraunces` or fallback `Times Bold` | 28/36, 32/40 | Title case, tracking +2%. |
| Body | `Inter` or fallback `Helvetica` | 14/22 | System UI copy. |
| Meta / Labels | `Inter` uppercase | 11/16 | Tracking 0.2em, charcoal/70. |
| Mono | `IBM Plex Mono` | 13/20 | Code samples, numbers. |

Fallback stack for environments without web fonts: `"Times New Roman", Times, serif` for serif; `"Helvetica Neue", Helvetica, Arial, sans-serif` for sans.

### 3.3 Layout & Components
| Element | Spec |
|---------|------|
| Grid | 12-column, 80px max column width on desktop. Section max width 1200px. |
| Spacing scale | 4/8/12/16/20/32/48/64. Use 32px vertical rhythm for major blocks. |
| Cards | Radius 16px, border `1px solid rgba(26,24,22,0.08)`, shadow `0 12px 30px rgba(26,24,22,0.07)`. |
| Buttons | Primary: brass fill, ink text. Secondary: parchment fill, brass border. Rounded 999px for pills, 12px for standard. |
| Dividers | `1px solid rgba(26,24,22,0.12)` with 24px padding top/bottom. |

### 3.4 Iconography & Illustration
- Use thin-line icons (1.5px stroke) with rounded terminals.  
- Color: brass on light backgrounds, parchment on dark overlays.  
- Illustrations: abstract linework mixed with soft gradients (`linear-gradient(135deg, #F5F1E8 0%, #FFF 100%)`).

### 3.5 Imagery
- **Lighting:** Soft, diffused, golden hour tones.  
- **Subject:** Workspace flat-lays, artisanship, strategic rituals (whiteboards, sketching).  
- **Composition:** Off-center focal point, negative space for copy overlays.  
- **Filters:** Slight warm tint (+5 saturation, +3 warmth). Avoid high contrast black backgrounds outside of Image Studio.

---

## 4. Application Patterns

### 4.1 Dashboard / Web UI
1. Top bar on parchment white with brass indicators.  
2. Sections separated by 64px vertical space.  
3. CTA buttons always appear in pairs: primary (brass) + secondary (outline).  
4. Use serif headings only once per view to emphasize the hero section.

### 4.2 PDF & Reports
- Margins 1" all sides, body copy 12pt.  
- Cover page uses serif headline + subtitle line with uppercase tracking.  
- Page numbers + “Generated by Madison Studio” footers in charcoal/50.  
- Charts should have no gridlines; use soft tonal blocks instead.

### 4.3 Marketing Emails
- Max width 640px, center aligned.  
- Hero area: serif headline 36pt, supporting copy 16pt.  
- Buttons: full-width brass with 48px height.  
- Include a micro “Strategy insight” callout with italic serif text.

### 4.4 AI-generated Deliverables
- Prompt templates must include: tone pillars, structural instructions (context → insight → next step), and CTA phrasing.  
- Always append accessibility instructions (headings, bullet lists, final “Choose Your Next Step” block).

---

## 5. Accessibility & QA

| Checklist | Target |
|-----------|--------|
| Contrast | Minimum 4.5:1 for body, 3:1 for large text. Brass on vellum requires bold weight for compliance. |
| Focus states | 2px brass outline plus 4px offset glow `rgba(200,165,100,0.35)`. |
| Motion | Entrance animations ≤ 300ms, easing `cubic-bezier(0.4, 0, 0.2, 1)`. Provide `prefers-reduced-motion` fallbacks. |
| Forms | Label+helper text always visible, placeholders never used as labels. |
| PDFs | Use native fonts (`Times`, `Helvetica`) to avoid download failures. Embed document metadata: Title, Author, Subject. |

---

## 6. Implementation References

- **Color Tokens:** `docs/MADISON_COLOR_TOKENS.md`  
- **Components:** `src/components/dashboard`, `src/pages/BrandBuilder.tsx`  
- **PDF Template:** `src/components/pdf/BrandBookPDF.tsx`  
- **Tone Training:** `docs/MADISON_TRAINING_STATUS.md`, `prompts/madison-brand-analyzer-training.md`  
- **AI Instructions:** `supabase/functions/generate-with-claude`, `supabase/functions/think-mode-chat`

---

## 7. Governance & Updates

| Action | Owner | Cadence |
|--------|-------|---------|
| Visual design changes | Design Lead | Quarterly or when major UI changes occur. |
| Tone/voice audit | Brand or Content Lead | Monthly review of AI outputs. |
| PDF/Template QA | Product Designer + PM | Before each major release. |
| Documentation sync | Whoever updates tokens/components | Update this doc + Notion same day. |

Change requests should include a rationale, mockups, and updated tokens. Submit via PR referencing this guide.

---

_Madison Studio · Strategic Intelligence Team_

