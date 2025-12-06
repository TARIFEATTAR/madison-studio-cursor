# MADISON STUDIO - COMPONENT STANDARDS

> Single source of truth for component styling patterns.
> Reference: `src/design/tokens.ts` for values.

---

## 🎯 PHILOSOPHY

**"Black Books & Cream Paper"** - Every component should feel like it belongs in a luxury museum catalog.

- **Restraint over excess**: Fewer colors, consistent spacing
- **Warmth over coldness**: Cream backgrounds, brass accents
- **Quality over quantity**: Every element serves a purpose

---

## 🔘 BUTTONS

### Variants

| Variant | Use Case | Classes |
|---------|----------|---------|
| **Primary (Default)** | Main CTAs, important actions | `bg-primary text-primary-foreground hover:bg-primary/90` |
| **Secondary** | Alternative actions | `bg-secondary text-secondary-foreground hover:bg-secondary/80` |
| **Outline** | Tertiary actions | `border border-input bg-background hover:bg-accent hover:text-accent-foreground` |
| **Ghost** | Subtle actions | `hover:bg-accent hover:text-accent-foreground` |
| **Link** | Text-only actions | `text-primary underline-offset-4 hover:underline` |
| **Destructive** | Dangerous actions | `bg-destructive text-destructive-foreground hover:bg-destructive/90` |

### Sizes

| Size | Classes |
|------|---------|
| sm | `h-9 px-3 text-sm` |
| md (default) | `h-10 px-4 py-2` |
| lg | `h-11 px-8 text-base` |
| icon | `h-10 w-10` |

### Standard Implementation

```tsx
<Button 
  variant="default" // default | secondary | outline | ghost | link | destructive
  size="default"    // default | sm | lg | icon
>
  Button Text
</Button>
```

### ✅ DO
- Always include transition: `transition-colors` (built into Button component)
- Use semantic variants (don't override with custom colors)

### ❌ DON'T
- Use hardcoded colors on buttons
- Create custom button styles outside the variant system

---

## 📦 CARDS

### Standard Card

```tsx
<Card className="bg-card border border-border">
  <CardHeader>
    <CardTitle className="font-serif text-2xl">Title</CardTitle>
    <CardDescription>Description text</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### Card Variants

| Variant | Classes |
|---------|---------|
| Default | `bg-card border border-border` |
| Elevated | `bg-card border border-border shadow-level-2` |
| Interactive | `bg-card border border-border hover:border-primary hover:shadow-level-2 transition-all cursor-pointer` |

### Card Padding

- **CardHeader**: Built-in padding `p-6`
- **CardContent**: Built-in padding `p-6 pt-0`
- **Full-width content**: Use negative margins if needed

---

## 📝 INPUTS & FORMS

### Text Input

```tsx
<Input 
  className="bg-background border-input focus:border-ring focus:ring-2 focus:ring-ring/20"
  placeholder="Enter value..."
/>
```

### Textarea

```tsx
<Textarea 
  className="bg-background border-input focus:border-ring focus:ring-2 focus:ring-ring/20 min-h-[100px]"
  placeholder="Enter longer text..."
/>
```

### Select

```tsx
<Select>
  <SelectTrigger className="bg-background">
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
  </SelectContent>
</Select>
```

### Form Labels

```tsx
<Label className="text-sm font-medium text-foreground">
  Field Label
</Label>
```

### Input States

| State | Classes |
|-------|---------|
| Default | `border-input` |
| Focus | `border-ring ring-2 ring-ring/20` |
| Error | `border-destructive ring-2 ring-destructive/20` |
| Disabled | `opacity-50 cursor-not-allowed` |

---

## ✍️ TYPOGRAPHY

### Headings

```tsx
// Page Title (H1)
<h1 className="font-serif text-3xl font-semibold text-foreground tracking-tight">
  Page Title
</h1>

// Section Header (H2)
<h2 className="font-serif text-2xl font-semibold text-foreground">
  Section Header
</h2>

// Card Title (H3)
<h3 className="font-sans text-xl font-semibold text-foreground">
  Card Title
</h3>

// Subsection (H4)
<h4 className="font-sans text-lg font-medium text-foreground">
  Subsection
</h4>
```

### Body Text

```tsx
// Default body
<p className="font-sans text-base text-foreground leading-relaxed">
  Body text content...
</p>

// Secondary/muted text
<p className="font-sans text-sm text-muted-foreground">
  Secondary information...
</p>

// Small/caption
<span className="font-sans text-xs text-muted-foreground">
  Caption text
</span>
```

### Font Family Rules

| Element | Font | Class |
|---------|------|-------|
| Headlines (H1, H2) | Cormorant Garamond | `font-serif` |
| UI Text (H3+, body) | Lato | `font-sans` |
| Quotes, Italics | Crimson Text | `font-accent` |

---

## 🎨 COLORS - USAGE GUIDE

### Text Colors

| Use | Class |
|-----|-------|
| Primary text | `text-foreground` |
| Secondary text | `text-muted-foreground` |
| Brand accent | `text-primary` |
| Error | `text-destructive` |

### Background Colors

| Use | Class |
|-----|-------|
| Page background | `bg-background` |
| Cards/elevated | `bg-card` |
| Muted sections | `bg-muted` |
| Hover states | `bg-accent` |

### Border Colors

| Use | Class |
|-----|-------|
| Default borders | `border-border` |
| Input borders | `border-input` |
| Active/focus | `border-ring` |

---

## 📐 SPACING PATTERNS

### Standard Spacing Scale

Use Tailwind's 4px-based scale: `1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24`

### Common Patterns

| Pattern | Spacing |
|---------|---------|
| Section gaps | `space-y-8` or `gap-8` |
| Card internal | `p-6` |
| Between cards | `gap-6` |
| Form fields | `space-y-4` |
| Compact lists | `space-y-2` |
| Button groups | `gap-2` or `gap-3` |

---

## 🌊 ANIMATIONS & TRANSITIONS

### Standard Transition

```tsx
// For hover/interactive states
className="transition-colors"
// or for more properties
className="transition-all duration-300"
```

### Transition Durations

| Speed | Class | Use Case |
|-------|-------|----------|
| Fast | `duration-150` | Buttons, toggles |
| Normal | `duration-300` | Cards, modals |
| Slow | `duration-500` | Page transitions |

### Easing

Default easing is built into Tailwind (`ease-out`). For custom:

```tsx
className="ease-[cubic-bezier(0.4,0,0.2,1)]"
```

---

## 🔲 SHADOWS

| Level | Class | Use |
|-------|-------|-----|
| Level 1 | `shadow-level-1` | Resting cards |
| Level 2 | `shadow-level-2` | Hover states |
| Level 3 | `shadow-level-3` | Modals, dropdowns |
| Brass Glow | `shadow-brass-glow` | Focus states, CTAs |

---

## ✅ CONSISTENCY CHECKLIST

When creating/editing components, verify:

- [ ] Colors use semantic tokens (not hardcoded hex)
- [ ] Typography uses `font-serif` or `font-sans` appropriately
- [ ] Spacing uses the 4px scale
- [ ] Interactive elements have transitions
- [ ] Focus states are visible and use `ring`
- [ ] Cards use standard border and padding
- [ ] Buttons use variant system
