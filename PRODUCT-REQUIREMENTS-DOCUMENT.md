# Scriptora - Product Requirements Document (PRD)

**Version**: 1.0  
**Last Updated**: October 9, 2025  
**Document Owner**: Product Team  
**Status**: Living Document

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Strategy](#2-product-vision--strategy)
3. [Design System & Brand Identity](#3-design-system--brand-identity)
4. [Features & Functionality](#4-features--functionality)
5. [User Experience & Workflows](#5-user-experience--workflows)
6. [Technical Architecture](#6-technical-architecture)
7. [Data Models & Schema](#7-data-models--schema)
8. [Integration Specifications](#8-integration-specifications)
9. [Success Metrics](#9-success-metrics)
10. [Future Roadmap](#10-future-roadmap)

---

## 1. Executive Summary

### 1.1 Product Overview

**Product Name**: Scriptora  
**Tagline**: Brand Intelligence Platform  
**Category**: SaaS, Content Marketing, AI-Powered Creative Tools

Scriptora is an AI-powered brand intelligence platform that enables businesses to create consistent, on-brand content at scale. By uploading brand guidelines once, users can generate master content pieces and automatically repurpose them into multiple derivative formats optimized for different channels (email, social media, SMS, etc.).

### 1.2 Core Value Propositions

1. **Brand Consistency**: Upload brand guidelines once, enforce across all content automatically
2. **Content Efficiency**: Create master content, then repurpose into 6+ channel-specific formats
3. **Editorial Excellence**: AI-powered assistant refines and polishes content to match brand voice
4. **Strategic Planning**: Integrated calendar for content scheduling and campaign management
5. **Time Savings**: Reduce content creation time by 70% through intelligent repurposing

### 1.3 Target Users

**Primary Audience**:
- Small to medium-sized businesses (SMBs) with 1-50 employees
- E-commerce brands managing multiple products
- Content marketing teams (2-10 people)
- Brand managers and marketing directors

**Secondary Audience**:
- Marketing agencies managing multiple client brands
- Solo entrepreneurs and solopreneurs
- Fragrance and luxury goods brands (initial vertical focus)

### 1.4 Key Success Metrics

- **Adoption**: 1,000+ active organizations in first 6 months
- **Engagement**: Average 3+ master content pieces created per user per week
- **Retention**: 80% monthly active user retention
- **Content Volume**: Average 15+ derivative assets generated per master content
- **Time Savings**: 70% reduction in content creation time vs manual workflows

---

## 2. Product Vision & Strategy

### 2.1 Vision Statement

To become the definitive brand intelligence platform that empowers businesses to maintain perfect brand consistency across all customer touchpoints, powered by AI that understands and enforces their unique voice.

### 2.2 Design Philosophy: "The Codex"

Scriptora's design philosophy draws inspiration from traditional luxury publishing houses and David Ogilvy's editorial approach. The aesthetic evokes:

- **Leather-bound journals** - Timeless, premium quality
- **Brass accents** - Craftsmanship and attention to detail
- **Cream paper and black ink** - Classic editorial excellence
- **Museum-quality interfaces** - Intimate luxury experience

This creates a sophisticated yet approachable experience that positions content creation as a craft, not a commodity.

### 2.3 Competitive Positioning

| Competitor | Strength | Our Advantage |
|------------|----------|---------------|
| Copy.ai | Fast generation | Brand voice enforcement through uploaded guidelines |
| Jasper | Template variety | Master-to-derivative workflow, strategic repurposing |
| ChatGPT | General AI power | Industry-specific templates, editorial quality control |
| Later/Buffer | Social scheduling | Integrated content creation + scheduling in one platform |

**Unique Differentiation**: Scriptora is the only platform that combines brand guideline ingestion, master content creation, intelligent multi-channel repurposing, and calendar scheduling in a single unified workflow.

---

## 3. Design System & Brand Identity

### 3.1 Visual Design System: The Codex

#### 3.1.1 Color Palette

**Neutrals Foundation**
```
Ink Black      #1A1816    Navigation, primary buttons, deep text
Charcoal       #2F2A26    Body text, secondary buttons
Warm Gray      #6B6560    Secondary text, muted elements
Soft Gray      #A8A39E    Tertiary text, disabled states
Stone          #D4CFC8    Borders, dividers
Vellum Cream   #F5F1E8    Page background
Parchment White #FFFCF5   Card backgrounds, input fields
```

**Brand Accents**
```
Aged Brass     #B8956A    Primary accent, CTA buttons
Brass Glow     #D4AF37    Hover states, focus rings
Antique Gold   #D4AF37    Secondary accent
Deep Burgundy  #6B2C3E    Error states, destructive actions
Forest Ink     #3A4A3D    Success states, confirmations
Midnight Blue  #2C3E50    Info states, secondary CTAs
```

**Derivative Type Colors**
```
Email          #3B82F6    Blue
Instagram      #A855F7    Purple
Twitter        #0EA5E9    Sky Blue
Product        #FB923C    Orange
SMS            #22C55E    Green
LinkedIn       #3B82F6    Professional Blue
Visual         #EC4899    Pink
```

#### 3.1.2 Typography System

**Font Families**
- **Serif**: Cormorant Garamond - Headlines, editorial elements, display text
- **Sans**: Lato - Body text, UI elements, labels
- **Accent**: Crimson Text - Editorial quotes, italicized emphasis

**Type Scale**
```
Display (h1)         48px, weight 600, -0.02em tracking, 1.2 line-height
Section Headers (h2) 36px, weight 600, -0.01em tracking, 1.3 line-height
Card Titles (h3)     24px, weight 500, 1.4 line-height
Subsections (h4)     20px, weight 500, 1.5 line-height
Body Large           18px, 1.7 line-height
Body Regular         16px, 1.6 line-height
Body Small           14px, 1.5 line-height
Label Tiny           12px, weight 500, uppercase, 0.03em tracking
```

#### 3.1.3 Shadow System

```css
Level 1 (Resting cards)    0 2px 4px rgba(26, 24, 22, 0.1)
Level 2 (Hover states)     0 4px 12px rgba(26, 24, 22, 0.15)
Level 3 (Modals)           0 8px 24px rgba(26, 24, 22, 0.2)
Level 4 (High elevation)   0 16px 48px rgba(26, 24, 22, 0.25)
Brass Glow (Focus)         0 0 0 3px rgba(212, 175, 55, 0.3)
```

#### 3.1.4 Component Patterns

**Cards**
- Background: Parchment white (#FFFCF5)
- Border: 1px solid Stone
- Border radius: 12px
- Hover: Lift with shadow increase + brass border

**Buttons**
- Primary: Ink black background, parchment text, brass border
- Brass: Brass gradient background, ink black text
- Secondary: Transparent, charcoal text, stone border
- Transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1)

**Inputs**
- Background: Parchment white
- Border: 2px solid Stone
- Focus: Brass border + brass glow shadow
- Manuscript style: Vellum cream background, Crimson Text font

### 3.2 Brand Voice Guidelines

#### 3.2.1 Writing Principles

**Do's**:
✓ Use sophisticated fragrance terminology  
✓ Maintain editorial, magazine-quality tone  
✓ Reference specific product details  
✓ Employ storytelling techniques  
✓ Include sensory descriptions  
✓ Cite traditional distillation methods  
✓ Mention ethical sourcing practices  
✓ Write in clear, concise sentences  
✓ Use active voice predominantly  

**Don'ts**:
✗ Avoid generic marketing clichés  
✗ Don't overuse emojis (1-2 max per piece)  
✗ Skip vague descriptions like "amazing" or "incredible"  
✗ Avoid ALL CAPS (except brand names)  
✗ Don't use excessive exclamation points  
✗ Skip clickbait language  
✗ Avoid jargon without explanation  

#### 3.2.2 Forbidden Marketing Clichés

❌ "Game-changer"  
❌ "Revolutionary"  
❌ "One-of-a-kind"  
❌ "Like no other"  
❌ "Best kept secret"  
❌ "You won't believe"  
❌ "Mind-blowing"  

#### 3.2.3 Approved Vocabulary

**Fragrance Terms**:
- Top notes, heart notes, base notes
- Sillage, longevity, projection
- Accords, blends, compositions
- Distillation, extraction, infusion

**Editorial Phrases**:
- "Thoughtfully crafted"
- "Carefully curated"
- "Mindfully sourced"
- "Expertly blended"
- "Traditionally distilled"

#### 3.2.4 Tone Attributes

- **Sophisticated** yet approachable
- **Knowledgeable** without pretension
- **Warm** and inviting
- **Confident** but not arrogant
- **Educational** without being preachy
- **Authoritative** and elegant
- **Authentic** and refined

### 3.3 Editorial Terminology

The interface uses publishing-inspired terminology to elevate the experience:

| Standard Term | Scriptora Term |
|---------------|----------------|
| Library | The Archives |
| Composer | The Editorial Desk |
| Amplify | The Syndicate |
| Calendar | The Planner |
| Content Types | Editions |
| Master Content | Master Manuscript |
| Derivatives | Derivative Editions |

---

## 4. Features & Functionality

### 4.1 Feature Overview

Scriptora consists of 6 core feature areas:

1. **Library (The Archives)** - Content repository and management
2. **Composer (The Editorial Desk)** - AI-powered content creation
3. **Amplify (The Syndicate)** - Multi-channel content repurposing
4. **Prompt Library** - Template management and reusable prompts
5. **Calendar (The Planner)** - Content scheduling and planning
6. **Settings** - Brand configuration and product management

---

### 4.2 Feature 1: Library (The Archives)

**Purpose**: Central repository for all created content, both master pieces and derivative assets.

#### 4.2.1 Core Functionality

**Browse & Filter**
- Grid view of all master content and generated outputs
- Filter by content type (blog, email, product story, etc.)
- Filter by collection (Cadence, Reserve, Purity, Sacred Space)
- Filter by DIP week (Week 1-4 production cycle)
- Real-time search across titles and content
- Archive/unarchive content management

**View Modes**
- Comfortable density: Large cards with previews
- Compact density: Smaller cards, more per row
- Date grouping: Today, This Week, Last Week, Earlier

**Sort Options**
- Newest first (default)
- Oldest first
- Recently updated
- Alphabetical A-Z

#### 4.2.2 Content Card Display

Each content card shows:
- Content title
- Content type badge (with color coding)
- Collection icon and name
- Creation date with "Published:" label
- Content preview (first 150 characters)
- Quality rating (1-5 stars, if rated)
- Word count
- Archive status badge

#### 4.2.3 Detail Modal

Clicking a card opens full content view:
- Complete content text with formatting
- Full metadata display
- Quality rating
- Edit capabilities
- Archive/restore button
- Schedule to calendar
- Delete option

#### 4.2.4 Empty States

When library is empty:
- Illustration with pen and paper
- "Your Archive Awaits" headline
- Description of how to create first content
- CTA button: "Create Your First Piece"

#### 4.2.5 User Workflows

**Browse Content Flow**:
1. User lands on library page
2. Views grid of all content (newest first)
3. Can scroll infinitely (pagination)
4. Content loads progressively

**Filter Content Flow**:
1. User opens sidebar filters
2. Selects content type filter
3. Grid updates in real-time
4. Can add collection filter
5. Can add DIP week filter
6. Filters show counts: "Blog Posts (12)"

**View Details Flow**:
1. User clicks content card
2. Modal opens with full content
3. Can read, edit, or schedule
4. Closes modal to return to grid

**Search Flow**:
1. User types in search box
2. Results filter as they type
3. Search across titles and content text
4. No results state: "No content found matching '[query]'"

**Archive Flow**:
1. User clicks archive button on card or in modal
2. Confirmation toast: "Content archived"
3. Content removed from main view
4. Can filter to show archived: "Show Archived"
5. Restore button available on archived content

---

### 4.3 Feature 2: Composer (The Editorial Desk)

**Purpose**: AI-powered content creation workspace with two distinct generation modes.

#### 4.3.1 Mode Selection

**Two Modes Available**:

1. **Single Content Mode** (Default)
   - Generate standalone content pieces
   - Not designed for repurposing
   - Faster, simpler workflow
   - Types: Blog posts, visual assets, single emails

2. **Master Content Mode**
   - Generate long-form master content
   - Designed for repurposing into derivatives
   - Strategic content approach
   - Types: Blog posts, newsletters, product stories, announcements

Mode switcher at top: Toggle buttons "Single Content" | "Master Content"

#### 4.3.2 Single Content Generation

**Content Types**:
- Blog Posts (Philosophy, Educational, Announcement)
- Visual Assets (AI-generated images)
- Single Emails
- Product Stories

**Blog Post Form Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Post Type | Select | Yes | Philosophy, Educational, Announcement |
| Word Count | Select | Yes | 500, 750, 1000, 1250, 1500+ |
| Product | Select | No | Link to product from catalog |
| Collection | Select | Yes | Cadence, Reserve, Purity, Sacred Space |
| Subject | Text | Yes | Main topic of the post |
| Themes | Text | No | Supporting themes (comma-separated) |
| Takeaway | Textarea | Yes | Key message for reader |
| Custom Instructions | Textarea | No | Additional AI instructions |

**Visual Asset Form Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Product | Select | Yes | Product to feature in image |
| Image Type | Select | Yes | Product photo, lifestyle, flat lay, etc. |
| Style | Select | Yes | Minimal, dramatic, editorial, etc. |
| Aspect Ratio | Select | Yes | 1:1, 16:9, 4:5, 9:16 |
| Custom Instructions | Textarea | No | Additional visual details |

**Generation Flow**:
1. User selects "Single Content" mode
2. Chooses content type from dropdown
3. Fills in all required fields
4. Adds custom instructions (optional)
5. Clicks "Generate with Claude"
6. Loading state: "Crafting your content..."
7. Output appears in right panel
8. Quality rating displayed (AI-generated)
9. Can refine with Editorial Assistant
10. Clicks "Save to Library"

#### 4.3.3 Master Content Generation

**Content Types**:
- Blog Posts (500-1500+ words)
- Email Newsletters (400-800 words)
- Product Stories (100-300 words)
- Brand Announcements (200-500 words)

**Master Content Form Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Content Type | Select | Yes | Blog, Email Newsletter, Product Story, Announcement |
| Title | Text | Yes | Master content title |
| Product | Select | No | Associated product |
| Collection | Select | Yes | Cadence, Reserve, Purity, Sacred Space |
| Subject | Text | Yes | Main topic |
| Themes | Text | No | Supporting themes |
| Takeaway | Textarea | Yes | Key message |
| Target Word Count | Select | Yes | Based on content type |
| Custom Instructions | Textarea | No | Brand voice adjustments |

**Generation Flow**:
1. User selects "Master Content" mode
2. Chooses master content type
3. Fills in comprehensive form
4. Clicks "Generate with Claude"
5. AI generates long-form master content
6. Quality rating displayed
7. User reviews and refines
8. Clicks "Save as Master Content"
9. Content saved to library
10. Banner appears: "Ready to repurpose? Go to Amplify →"

#### 4.3.4 Editorial Assistant

**Purpose**: AI-powered refinement panel for improving generated content.

**Features**:
- Conversational interface (chat-style)
- Contextual awareness of current content
- Multiple refinement capabilities
- Preserves edit history
- Toggle open/closed (sidebar panel)

**Capabilities**:

1. **Brand Voice Check**
   - Analyze alignment with brand guidelines
   - Suggest voice adjustments
   - Highlight inconsistencies

2. **Content Refinement**
   - "Make this more conversational"
   - "Add more sensory details"
   - "Shorten by 20%"
   - "Emphasize [theme]"

3. **Structural Changes**
   - "Add a conclusion paragraph"
   - "Restructure with subheadings"
   - "Create a stronger opening"

4. **Tone Adjustments**
   - "Make more formal"
   - "Add warmth"
   - "Increase urgency"
   - "More educational tone"

5. **Factual Questions**
   - "What products are mentioned?"
   - "What's the main takeaway?"
   - "Is this on-brand?"

**User Interface**:
- Trigger button: "Refine with Assistant" (brass button)
- Slides in from right side
- Chat input at bottom
- Conversation history above
- "Apply Changes" button for each suggestion
- Loading indicator: "Analyzing..."

**Example Interaction**:
```
User: Make this more conversational and add a sensory detail about the scent.