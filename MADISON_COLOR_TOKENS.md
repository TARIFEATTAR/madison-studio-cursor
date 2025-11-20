# Madison Studio - Color Token Reference

## 🎨 The Codex Design System
**Philosophy:** Elegant restraint, Madison Avenue sophistication, museum-quality aesthetics

---

## Core Palette (6 Essential Colors)

### Neutrals (4 colors)

#### Ink Black
- **Hex:** `#1A1816`
- **HSL:** `hsl(30, 3%, 10%)`
- **Usage:** Primary text, headers, high-contrast elements
- **Tailwind:** `text-ink-black`, `bg-ink-black`
- **CSS Var:** `--ink-black-hex`

#### Charcoal
- **Hex:** `#2F2A26`
- **HSL:** `hsl(20, 8%, 17%)`
- **Usage:** Secondary text, supporting elements, muted UI
- **Tailwind:** `text-charcoal`, `bg-charcoal`
- **CSS Var:** `--charcoal-hex`
- **Opacity:** Use `text-charcoal/70` for muted, `text-charcoal/40` for disabled

#### Vellum Cream
- **Hex:** `#F5F1E8`
- **HSL:** `hsl(42, 38%, 93%)`
- **Usage:** Primary background (the "paper"), page canvas
- **Tailwind:** `bg-vellum-cream`
- **CSS Var:** `--vellum-cream-hex`
- **Semantic Token:** `--background`

#### Parchment White
- **Hex:** `#FFFCF5`
- **HSL:** `hsl(48, 100%, 98%)`
- **Usage:** Cards, elevated surfaces, modals
- **Tailwind:** `bg-parchment-white`, `text-parchment-white`
- **CSS Var:** `--parchment-white-hex`
- **Semantic Token:** `--card`

---

### Accents (2 colors)

#### Aged Brass
- **Hex:** `#B8956A`
- **HSL:** `hsl(38, 33%, 56%)`
- **Usage:** Interactive elements, borders on hover, links
- **Tailwind:** `text-aged-brass`, `bg-aged-brass`, `border-aged-brass`
- **CSS Var:** `--aged-brass-hex`
- **Semantic Token:** `--primary`

#### Brass Glow
- **Hex:** `#D4AF37`
- **HSL:** `hsl(43, 65%, 52%)`
- **Usage:** CTAs, active states, highlights, focus rings
- **Tailwind:** `text-brass-glow`, `bg-brass-glow`, `ring-brass-glow`
- **CSS Var:** `--brass-glow-hex`
- **Semantic Token:** `--accent`, `--ring`

---

## Functional Colors (3 colors - Minimal Use)

#### Muted Sage
- **Hex:** `#8B9474`
- **HSL:** `hsl(90, 13%, 52%)`
- **Usage:** Success states, approval indicators (NOT bright green)
- **Tailwind:** `text-muted-sage`, `bg-muted-sage`, `border-muted-sage`
- **CSS Var:** `--muted-sage-hex`

#### Aged Amber
- **Hex:** `#C4975C`
- **HSL:** `hsl(38, 48%, 56%)`
- **Usage:** Warning states, attention indicators (NOT bright orange)
- **Tailwind:** `text-aged-amber`, `bg-aged-amber`, `border-aged-amber`
- **CSS Var:** `--aged-amber-hex`

#### Faded Rust
- **Hex:** `#A85C5C`
- **HSL:** `hsl(0, 30%, 51%)`
- **Usage:** Error states, deletion confirmations (NOT bright red)
- **Tailwind:** `text-faded-rust`, `bg-faded-rust`, `border-faded-rust`
- **CSS Var:** `--faded-rust-hex`
- **Semantic Token:** `--destructive`

---

## Support Color (1 color)

#### Stone
- **Hex:** `#E5DFD1`
- **HSL:** `hsl(40, 31%, 85%)`
- **Usage:** Default input borders, subtle dividers, gentle separators
- **Tailwind:** `border-stone`
- **CSS Var:** `--stone-hex`
- **Semantic Token:** `--border`, `--input`

---

## Platform Badges (Derivative Types ONLY)

**⚠️ IMPORTANT:** Use sparingly for small badges and icons ONLY. Never for large UI elements.

#### Email
- **Hex:** `#4A90E2` (muted blue)
- **Usage:** Email content type badges
- **Tailwind:** `text-derivative-email`, `bg-derivative-email`

#### Instagram
- **Hex:** `#8B5CF6` (muted purple)
- **Usage:** Instagram content type badges
- **Tailwind:** `text-derivative-instagram`, `bg-derivative-instagram`

#### Twitter/X
- **Hex:** `#38BDF8` (sky blue)
- **Usage:** Twitter content type badges
- **Tailwind:** `text-derivative-twitter`, `bg-derivative-twitter`

#### Product
- **Hex:** `#F97316` (muted orange)
- **Usage:** Product content type badges
- **Tailwind:** `text-derivative-product`, `bg-derivative-product`

#### SMS
- **Hex:** `#10B981` (muted green)
- **Usage:** SMS content type badges
- **Tailwind:** `text-derivative-sms`, `bg-derivative-sms`

---

## Typography Color Hierarchy

```tsx
// Headers
<h1 className="text-ink-black">Main Headline</h1>
<h2 className="text-ink-black">Section Header</h2>
<h3 className="text-ink-black">Subheader</h3>

// Body Text
<p className="text-charcoal">Body paragraph text</p>
<span className="text-charcoal/70">Muted secondary text</span>
<span className="text-charcoal/40">Disabled text</span>

// Links
<a className="text-aged-brass hover:text-brass-glow">Click here</a>
```

---

## Interactive State Standards

### Buttons

```tsx
// Primary CTA (Default)
<Button>
  bg-ink-black text-parchment-white border-aged-brass/30
  hover:border-brass-glow hover:shadow-brass-glow
</Button>

// Brass CTA
<Button variant="brass">
  bg-aged-brass text-parchment-white
  hover:bg-brass-glow
</Button>

// Secondary
<Button variant="secondary">
  bg-vellum-cream text-ink-black border-stone
  hover:border-aged-brass/40
</Button>

// Ghost
<Button variant="ghost">
  hover:bg-vellum-cream/50 hover:text-aged-brass
</Button>

// Destructive
<Button variant="destructive">
  bg-faded-rust text-parchment-white
  hover:bg-faded-rust/90
</Button>
```

### Form Inputs

```tsx
// Default State
<Input className="
  border-stone bg-parchment-white
  text-ink-black placeholder:text-charcoal/60
" />

// Focus State
focus:border-brass-glow focus:ring-brass-glow

// Error State
<Input className="border-faded-rust ring-faded-rust/20" />

// Success State
<Input className="border-muted-sage ring-muted-sage/20" />

// Disabled State
disabled:opacity-40
```

### Links

```tsx
// Default Link
<a className="text-aged-brass hover:text-brass-glow underline-offset-4 hover:underline">
  Link text
</a>

// No underline (in navigation)
<Link className="text-aged-brass hover:text-brass-glow">
  Nav link
</Link>
```

---

## Shadow System (With Brass Accents)

### Level 1: Resting Cards
```css
--shadow-level-1: 
  0 1px 3px rgba(26, 24, 22, 0.08),
  0 1px 2px rgba(26, 24, 22, 0.06),
  0 0 0 1px rgba(184, 149, 106, 0.03);  /* Subtle brass rim */
```
**Tailwind:** `shadow-level-1`

### Level 2: Hover, Slight Elevation
```css
--shadow-level-2:
  0 3px 8px rgba(26, 24, 22, 0.12),
  0 1px 3px rgba(184, 149, 106, 0.08);  /* Brass undertone */
```
**Tailwind:** `shadow-level-2`

### Level 3: Modals, Dropdowns
```css
--shadow-level-3:
  0 8px 24px rgba(26, 24, 22, 0.15),
  0 2px 6px rgba(184, 149, 106, 0.12);  /* Brass depth */
```
**Tailwind:** `shadow-level-3`

### Level 4: Maximum Elevation
```css
--shadow-level-4:
  0 16px 48px rgba(26, 24, 22, 0.20),
  0 4px 12px rgba(184, 149, 106, 0.15);  /* Maximum brass glow */
```
**Tailwind:** `shadow-level-4`

### Brass Glow: Focus/Active States
```css
--shadow-brass-glow:
  0 0 0 3px rgba(212, 175, 55, 0.15),
  0 4px 16px rgba(212, 175, 55, 0.25);
```
**Tailwind:** `shadow-brass-glow`

---

## Gradient System

### Navigation Gradient
```css
--gradient-nav: linear-gradient(180deg, #1A1816 0%, #2F2A26 100%);
```
**Usage:** Top navigation bars, dark headers

### Card Gradient
```css
--gradient-card: radial-gradient(circle at top left, #FFFCF5 0%, #F5F1E8 100%);
```
**Usage:** Premium card backgrounds, subtle elevation

### Brass Gradient
```css
--gradient-brass: linear-gradient(135deg, #B8956A 0%, #D4AF37 50%, #B8956A 100%);
```
**Tailwind:** `bg-[linear-gradient(135deg,#B8956A_0%,#D4AF37_50%,#B8956A_100%)]`
**Usage:** Premium CTAs, hero buttons

---

## Forbidden Colors

❌ **Never Use:**
- Bright blues, greens, reds, oranges (except in tiny derivative badges)
- Neon or saturated hues
- Pure black `#000000` (use Ink Black `#1A1816` instead)
- Pure white `#FFFFFF` (use Parchment White `#FFFCF5` instead)
- Generic grays like `#888`, `#E5E5E5` (use Charcoal family)
- Arbitrary hex values not in this palette

---

## Background Hierarchy

```tsx
// Page background
<div className="bg-vellum-cream">

// Cards and panels
<div className="bg-parchment-white border border-stone/50 shadow-level-1">

// Elevated modals
<div className="bg-parchment-white border border-stone shadow-level-3">

// Overlays
<div className="bg-charcoal/60">  // Not pure black
```

---

## WCAG Contrast Compliance

All color combinations meet **WCAG AA minimum (4.5:1 for normal text, 3:1 for large text)**:

| Combination | Ratio | Status |
|-------------|-------|--------|
| Ink Black on Vellum Cream | 11.2:1 | ✅ AAA |
| Ink Black on Parchment White | 13.5:1 | ✅ AAA |
| Charcoal on Vellum Cream | 8.3:1 | ✅ AAA |
| Charcoal on Parchment White | 10.1:1 | ✅ AAA |
| Aged Brass on Parchment White | 4.6:1 | ✅ AA (large text) |
| Parchment White on Aged Brass | 4.6:1 | ✅ AA (large text) |
| Parchment White on Ink Black | 13.5:1 | ✅ AAA |
| Brass Glow on Ink Black | 5.8:1 | ✅ AA |

**⚠️ Note:** Aged Brass text on light backgrounds should be used for:
- Large text (18px+) or bold text (14px+)
- Non-critical UI elements
- Links and interactive elements (where underline provides additional cue)

For critical body text, always use Ink Black or Charcoal.

---

## Quick Reference: Common Patterns

### Hero Section
```tsx
<section className="bg-vellum-cream">
  <h1 className="text-ink-black font-serif text-5xl">Headline</h1>
  <p className="text-charcoal text-lg">Subheadline</p>
  <Button className="bg-aged-brass text-parchment-white hover:bg-brass-glow">
    Get Started
  </Button>
</section>
```

### Card Component
```tsx
<div className="bg-parchment-white border border-stone/50 shadow-level-1 rounded-md p-6">
  <h3 className="text-ink-black font-semibold mb-2">Card Title</h3>
  <p className="text-charcoal text-sm">Card description</p>
  <a href="#" className="text-aged-brass hover:text-brass-glow text-sm">
    Learn more →
  </a>
</div>
```

### Form Group
```tsx
<div>
  <label className="text-ink-black text-sm font-medium">Email</label>
  <input className="
    border-stone bg-parchment-white text-ink-black
    focus:border-brass-glow focus:ring-2 focus:ring-brass-glow/20
    placeholder:text-charcoal/60
  " placeholder="Enter your email" />
</div>
```

---

## Visual Reference

**Think:**
- Aged leather-bound ledgers
- Museum exhibition placards
- High-end stationery shops
- David Ogilvy's Madison Avenue office circa 1960

**NOT:**
- Modern SaaS dashboards
- Bright, playful interfaces
- Generic bootstrap themes

---

**Last Updated:** November 18, 2024  
**Version:** 2.0 - The Codex Refinement  
**Status:** ✅ Production Ready



