# Best Bottles — Design System Skill

Use this skill whenever you're designing for **Best Bottles** (bestbottles.com) — the premium glass-bottle brand.

## Source of truth

- `colors_and_type.css` — all tokens as CSS custom properties. **Always import this** in your HTML: `<link rel="stylesheet" href="colors_and_type.css">`.
- `README.md` — prose reference: voice, how to compose hero/nav/cards, do/don't.
- `preview/` — visual cards for every foundation and component.
- `ui_kits/website/index.html` — a single-page reference implementation.
- `assets/` — real product photography placeholders (hero, cylinders, cream jars, slim bottles, assorted closures).

## Core identity in one breath

Quiet confidence. Editorial serif on warm neutrals. One accent: muted gold. **"Beautifully Contained."**

## Non-negotiables

1. **Default page background is `--bone` (#F5F3EF)**, not white. Use `--warm-white` or `--linen` for cards.
2. **EB Garamond** for all headlines and editorial copy. **Inter** for UI and body. **Cormorant** only for the logotype.
3. **Muted Gold is the only accent.** Don't introduce secondary hues. Never gradient it, never pair it with another bright color.
4. **Radius default is 2px.** Avoid the chunky-rounded look. Pill only for filter chips and avatars.
5. **Eyebrow labels are uppercase Inter, 12px, tracking 0.25em, semibold slate.** Gold variant exists but use it sparingly.
6. **Voice is precise and warm, never salesy.** See `README.md` § Voice. "Beautifully Contained." / "Find your thread." / "Talk with Grace →" — not "Unlock your perfect bottle!"
7. **Restrained shadows.** Use `--shadow-sm` by default; step up only on hover or for drawers.
8. **Section rhythm is py-24 (96px)** on desktop.

## Starting a new artifact

1. Link the CSS: `<link rel="stylesheet" href="colors_and_type.css">` (adjust path).
2. Reach for semantic classes first: `.h1`–`.h4`, `.p`, `.eyebrow`, `.eyebrow-gold`, `.quote`, `.caption`, `.logotype`.
3. Reference tokens (`var(--obsidian)`, `var(--muted-gold)`, `var(--sp-24)`, `var(--shadow-sm)`) rather than hex.
4. Need a product image? Use files in `assets/` as placeholders; set them on a `--parchment` or `--travertine` stage with generous padding.
5. When composing a page, look at `ui_kits/website/index.html` for section-by-section patterns.

## Quick lookups

| Need | Token |
|---|---|
| Page bg | `--bone` |
| Card bg | `--bg-card` (#fff) or `--linen` |
| Primary text | `--obsidian` |
| Muted text | `--slate` |
| Meta/caption | `--ash` |
| Accent | `--muted-gold` |
| Border | `--border-soft` (champagne/50) |
| Section padding | `--sp-24` (96px) |
| Card padding | `--sp-6` or `--sp-8` |
| Default radius | `--radius-sm` (2px) |
| Ease | `--ease-out` |

## When in doubt

Less. Quieter. More air. Editorial > promotional. If a section feels empty, solve it with scale and composition, not more content.
