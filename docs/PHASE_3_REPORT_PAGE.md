# Phase 3: Report Page and "Living Report" - Complete

## Overview

Phase 3 implements a high-quality, agency-style report page that serves as both the "living report" view in the browser and the target for PDF generation.

## Implementation

### Report Route: `/reports/[domain]`

**Route**: `/reports/:domainId?scanId=latest`

- Fetches latest BrandReport for the given domain
- Supports `scanId=latest` (default) or specific scan ID
- Displays using BrandReportTemplate component
- Includes "Download PDF" button

### BrandReportTemplate Component

A comprehensive, agency-quality template with:

1. **Cover Page**
   - Client logo (if available)
   - Brand name (large, serif font)
   - Domain (monospace)
   - Tagline (if present, italic)
   - mapsystem.io branding
   - Scan date

2. **Section 1: Snapshot**
   - Logo & brand name
   - Tagline
   - Quick scores (Brand Consistency, Visual Consistency, Message Clarity)
   - Overall score with visual bar
   - Positioning statement

3. **Section 2: Brand Identity**
   - Brand Profile:
     - Mission statement
     - Core values (tags)
     - Primary audience (list)
     - Brand archetype
   - Tone & Voice:
     - Tone traits (tags)
     - Writing style
     - Perspective
     - Brand essence

4. **Section 3: Visual Language**
   - Color Palette:
     - Primary colors (swatches with hex codes)
     - Secondary colors (swatches)
     - Neutral colors (swatches)
     - Color analysis commentary
   - Typography:
     - Headline font (preview)
     - Body font (preview)

5. **Section 4: Messaging & Website Copy Assessment**
   - Vocabulary:
     - Keywords to use (green tags)
     - Key phrases (bulleted list)
     - Words to avoid (red tags)
   - Content Strategy:
     - Core themes (tags)
     - Narrative hooks (bulleted list)

6. **Section 5: Recommendations & Next Steps**
   - Recommendation cards (if available)
   - Priority indicators (high/medium/low)
   - Default recommendations (if none provided)
   - Actionable next steps

## Design System

### Design Tokens (mapsystem.io Base)

- **Colors**:
  - `vellum-cream` - Background
  - `parchment-white` - Section backgrounds
  - `ink-black` - Primary text
  - `charcoal` - Secondary text
  - `brass` - Accents, borders, highlights

- **Typography**:
  - Serif fonts for headings (Cormorant Garamond)
  - Sans-serif for body text (Lato)
  - Monospace for technical info (domain, hex codes)

- **Spacing**:
  - Consistent padding: `p-8 md:p-12 lg:p-16`
  - Section gaps: `mb-12`
  - Component spacing: `gap-4`, `gap-6`, `gap-8`

- **Layout**:
  - Max width: `max-w-6xl mx-auto`
  - Grid layouts: `grid md:grid-cols-2`
  - Responsive breakpoints: `md:`, `lg:`

### Brand Color Integration

- **Scanned brand colors** used ONLY as:
  - Color swatches (visual reference)
  - Accent highlights (minimal)
  - NOT used for backgrounds, text, or primary UI elements

- **mapsystem.io colors** used for:
  - All backgrounds
  - All text
  - Borders and dividers
  - UI elements (buttons, cards, etc.)

This ensures:
- Consistent visual hierarchy
- Professional, agency-quality appearance
- Brand colors don't interfere with readability
- Report maintains mapsystem.io brand identity

## Features

### Score Calculation

If scores aren't provided in the BrandReport, they're calculated from data completeness:

- **Brand Consistency**: Based on presence of brand name, positioning, mission, values, audience, tone
- **Visual Consistency**: Based on logo, color palette, typography
- **Message Clarity**: Based on tagline, positioning, vocabulary, content strategy

### Color Commentary

Automatically generates commentary about the color palette:
- Total color count
- Palette structure analysis
- Extraction source information

### Default Recommendations

If no recommendations are provided, generates default recommendations based on:
- Missing logo
- Incomplete color palette
- Missing tagline/positioning
- Incomplete vocabulary
- General brand consistency improvements

## Print/PDF Optimization

- Page breaks: `print:page-break-after-always` on major sections
- Print styles: Optimized for A4/Letter paper
- Background colors: Preserved in print
- Images: Proper sizing and positioning

## Usage

### Viewing a Report

```typescript
// Navigate to report
navigate(`/reports/${encodeURIComponent(domain)}?scanId=latest`);

// Or specific scan
navigate(`/reports/${encodeURIComponent(domain)}?scanId=${scanId}`);
```

### PDF Generation

The report page is designed to be rendered as PDF using:
- Playwright/Puppeteer headless browser
- `render-pdf-from-url` function
- Print-to-PDF functionality

The template includes print-optimized styles and page breaks.

## Component Structure

```
BrandReportTemplate
├── Cover Page
├── Section 1: Snapshot
│   ├── Logo & Brand Name
│   ├── Quick Scores
│   └── Positioning Statement
├── Section 2: Brand Identity
│   ├── Brand Profile
│   └── Tone & Voice
├── Section 3: Visual Language
│   ├── Color Palette
│   └── Typography
├── Section 4: Messaging & Copy Assessment
│   ├── Vocabulary
│   └── Content Strategy
└── Section 5: Recommendations
```

## Responsive Design

- **Mobile**: Single column, stacked sections
- **Tablet**: 2-column grids where appropriate
- **Desktop**: Full layout with optimal spacing
- **Print**: Optimized page breaks and sizing

## Accessibility

- Semantic HTML structure
- Proper heading hierarchy
- Color contrast (mapsystem.io colors ensure readability)
- Alt text for logos
- Screen reader friendly

## Next Steps

1. **PDF Rendering**: Implement Playwright/Puppeteer integration
2. **Report Sharing**: Add shareable links
3. **Report History**: Show scan history and comparisons
4. **Customization**: Allow users to customize report sections
5. **Export Options**: Add JSON/CSV export

