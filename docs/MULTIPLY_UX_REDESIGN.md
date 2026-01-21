# Madison Studio: Multiply Page UX Redesign

**Document Version:** 1.0
**Date:** January 21, 2026
**Status:** Ready for Implementation
**Author:** UX Consultation Session

---

## Executive Summary

The Multiply page ("The Syndicate") currently presents cognitive overload for users, particularly those with ADHD or attention challenges. This document outlines a strategic redesign that reduces decision paralysis while preserving all existing functionality.

### The Problem
- **12+ derivative options** visible simultaneously
- **909-word content preview** displayed in full
- **Two separate generate buttons** competing for attention
- **No guided path** for users who don't know what they want

### The Solution
A four-part redesign using progressive disclosure:
1. Collapsed master content (expandable on demand)
2. Category-based grouping (3 categories instead of 12 cards)
3. Single primary action button
4. Madison's AI suggestion card for guided decisions

---

## Implementation Phases

### Phase 1: Quick Wins (Week 1) ✅ IN PROGRESS
- Add collapse/expand to Master Content
- Move Visual Prompts to collapsible area
- Combine generate buttons into single adaptive button

### Phase 2: Category Grouping (Weeks 2-3)
- Create DerivativeCategoryAccordion component
- Implement accordion behavior (one open at a time)
- A/B test with feature flag

### Phase 3: Madison's Suggestion (Weeks 4-5)
- Surface existing Smart Amplify analysis
- Implement "Use Madison's Picks" one-click action
- Track usage metrics

---

## Component Specifications

### 1. CollapsibleMasterContent
- Default: Collapsed (shows title, type, word count)
- Expandable: Full content in ScrollArea (max-height: 300px)
- Persist preference in localStorage

### 2. DerivativeCategoryAccordion
Categories:
- 📱 Social Media: Instagram, LinkedIn, Facebook, Pinterest, TikTok, Twitter
- ✉️ Email: Single, 3-Part, 5-Part, 7-Part Sequences
- 🛍️ Product & Commerce: Product Description, SMS, YouTube

### 3. VisualPromptsToggle
- Checkbox to enable/disable visual prompts section
- Collapsed by default
- Options: Image Pack, Video Script, Product Backgrounds

### 4. UnifiedGenerateButton
States:
- "GENERATE" (disabled, nothing selected)
- "GENERATE (3 selected)" (content types)
- "GENERATE (3 + visuals)" (with visual prompts)

### 5. MadisonSuggestionCard
- Surfaces existing Smart Amplify analysis
- "Use Madison's Picks" one-click action
- Recommended types based on content analysis

---

## Design System Compliance

### Colors
- Primary Background: Parchment White (#FFFCF5)
- Card Background: Vellum Cream (#F5F1E8)
- Accent: Aged Brass (#B8956A)
- Text: Ink Black (#1A1816)

### Typography
- Headers: Cormorant Garamond (serif)
- Body: Lato (sans-serif)

### Animations
- Expand/Collapse: 200ms ease-out
- Hover States: 150ms transition

---

## Success Metrics

| KPI | Target |
|-----|--------|
| Time to first generation | < 30 seconds |
| Selections per session | 3-5 optimal |
| Page abandonment rate | < 20% |
| Madison's Picks usage | > 30% |

---

## File Structure

```
src/components/multiply/
├── CollapsibleMasterContent.tsx    # Phase 1
├── DerivativeCategoryAccordion.tsx # Phase 2
├── MadisonSuggestionCard.tsx       # Phase 3
├── VisualPromptsToggle.tsx         # Phase 1
└── UnifiedGenerateButton.tsx       # Phase 1
```
