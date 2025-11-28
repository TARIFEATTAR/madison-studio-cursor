# Madison Studio Brand Intelligence Authorities

This directory contains training profiles for legendary brand strategists, visual identity experts, and creative directors that Madison can reference for Brand Intelligence training.

## Purpose

Unlike the **copywriting authors** (in `prompts/authors/`), these authorities focus on:
- **Visual Identity Systems** - Logo, color, typography, brand guidelines
- **Brand Positioning** - Differentiation, brand gap, competitive positioning
- **Brand Campaigns** - Creative direction, cultural resonance, brand storytelling
- **Brand Strategy** - Brand architecture, brand equity, brand portfolio

## Current Authorities

1. **Alina Wheeler** (`wheeler.md`) - Visual identity systems, brand guidelines
2. **Marty Neumeier** (`neumeier.md`) - Brand positioning, differentiation, brand gap
3. **Lee Clow** (`clow.md`) - Brand campaigns, creative direction, cultural resonance

## File Structure

Each authority has a condensed reference guide:
- **Format**: Concise ~40-60 line reference guide
- **Purpose**: Quick lookup for Madison during brand intelligence tasks
- **Structure**:
  - When to Reference [Authority]
  - Core Principles
  - Key Frameworks
  - Signature Techniques
  - Example Applications
  - Checklist

## Usage

### For Brand Intelligence Training
These profiles are used in:
- Brand DNA scanning and analysis
- Visual identity guidance
- Brand positioning recommendations
- Brand campaign strategy
- Brand guidelines generation

### Integration
The profiles are loaded via `supabase/functions/_shared/brandAuthorities.ts` and automatically included in all edge functions that need brand intelligence capabilities.

## Adding New Authorities

1. Create a condensed version (`[authority].md`) following the existing format
2. Add to `BRAND_AUTHORITIES` in `supabase/functions/_shared/brandAuthorities.ts`
3. Add to `authorityOrder` array in `buildBrandAuthoritiesSection()`
4. Update this README with the new authority
5. Deploy edge functions

## Integration Status

✅ **Integrated Authorities:**
- Wheeler (visual identity systems)
- Neumeier (brand positioning)
- Clow (brand campaigns)

📝 **Future Additions:**
- Wally Olins (corporate identity)
- Michael Johnson (brand system design)
- Debbie Millman (brand thinking)

## Relationship to Other Systems

- **Copywriting Authors** (`prompts/authors/`) - For written word/style
- **Brand Authorities** (`prompts/brand-authorities/`) - For visual identity & brand strategy
- **Film Directors** (future) - For video/film direction
- **Strategy Thinkers** (future) - For business strategy (Drucker, etc.)




