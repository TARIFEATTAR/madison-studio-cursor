# Collections Terminology Reference

**Last Updated**: December 2025  
**Status**: Official Product Line Collections

---

## Purpose

This document defines the official **product line collections** used in Scriptora. Collections are product groupings that represent different themes and positioning strategies for the organization's product catalog.

**Important Distinction**: Collections refer to product lines (e.g., Humanities, Reserve), NOT content categories or content types (e.g., Blog, Email, Social).

---

## Official Collections

Scriptora supports **four primary product line collections**:

### 1. Humanities Collection
**Theme**: Accessible sophistication  
**Positioning**: Everyday luxury that makes fine fragrance approachable  
**Target Audience**: Fragrance enthusiasts seeking quality without pretension  
**Voice**: Warm, knowledgeable, inviting

**Legacy Names**: Previously called "Cadence Collection"

### 2. Reserve Collection
**Theme**: Premium exclusivity  
**Positioning**: Limited edition, high-end products for discerning customers  
**Target Audience**: Luxury consumers seeking rare, exceptional quality  
**Voice**: Refined, authoritative, sophisticated

### 3. Purity Collection
**Theme**: Clean, minimalist elegance  
**Positioning**: Simple formulations with transparent ingredient sourcing  
**Target Audience**: Health-conscious consumers valuing authenticity  
**Voice**: Clear, honest, educational

### 4. Elemental Collection
**Theme**: Raw, foundational beauty  
**Positioning**: Essential products celebrating natural ingredients  
**Target Audience**: Naturalists seeking uncompromising ingredient integrity  
**Voice**: Grounded, authentic, confident

**Legacy Names**: Previously called "Sacred Space Collection"

---

## Database Storage

Collections are stored in the `brand_collections` table:

```sql
brand_collections
├── id (uuid)
├── organization_id (uuid)
├── name (text) - "humanities", "reserve", "purity", "elemental"
├── description (text)
├── transparency_statement (text)
├── color_theme (text)
└── sort_order (integer)
```

Products are linked to collections via:

```sql
brand_products
├── collection (text) - References brand_collections.name
└── ...product details
```

---

## Legacy Collection Names (Deprecated)

The following collection names are **deprecated** but still supported for backward compatibility:

| Legacy Name | Current Name |
|-------------|--------------|
| Cadence     | Humanities   |
| Sacred Space| Elemental    |

**Code Support**: The codebase automatically maps legacy names to current names:
- `src/utils/forgeHelpers.ts` - `mapCollectionToEnum()` function
- `src/utils/collectionIcons.ts` - Icon mapping with legacy support

---

## Collections vs Content Types

### Collections (Product Lines)
- **What**: Groupings of products (Humanities, Reserve, Purity, Elemental)
- **Purpose**: Categorize products by theme and positioning
- **Example**: "Purity Collection" includes all clean, minimalist products
- **Database**: `brand_collections` table

### Content Types (Content Categories)
- **What**: Types of content Madison creates (Blog, Email, Social, Product Story)
- **Purpose**: Specify the format/channel for content delivery
- **Example**: "Blog Post", "Email Newsletter", "Instagram Post"
- **Database**: `content_type` field in various tables

### How They Work Together

When creating content:
1. **Select Content Type** → What format? (Blog, Email, Social)
2. **Select Collection (Optional)** → Which product line to feature? (Humanities, Purity)
3. **Select Products (Optional)** → Which specific products from that collection?

Madison uses:
- **Content Type** guidelines to know *how* to write (blog structure, email format)
- **Collection** positioning to know *what tone* to use (accessible vs refined)
- **Product** details to include *specific information* (ingredients, scent notes)

---

## Usage in UI Components

### Product Selection Flow
```
src/components/forge/ProductSelector.tsx
└── Shows products grouped by collection
    ├── Filter by collection dropdown
    └── Products displayed under collection headers
```

### Library Filters
```
src/components/library/LibraryFilters.tsx
└── Collection filter = Product collections only
    └── Shows: Humanities, Reserve, Purity, Elemental
```

### Prompt Library
```
src/components/prompt-library/PromptLibrarySidebar.tsx
└── Collection filter = Which product line the prompt is optimized for
```

---

## Brand Knowledge Storage

For detailed collection positioning, terminology standards, and voice guidelines:

**Location**: `brand_knowledge` table  
**Knowledge Type**: `product_terminology` or `collection_guidelines`  
**Organization-Specific**: Each organization can upload their own collection standards

Example brand knowledge document: "Madison Script Product Line Terminology Standards"

---

## Key Takeaways

✅ **Collections = Product Lines** (Humanities, Reserve, Purity, Elemental)  
✅ **Content Types = Content Formats** (Blog, Email, Social, etc.)  
✅ **Collections have themes and positioning strategies**  
✅ **Legacy names (Cadence, Sacred Space) are deprecated but supported**  
✅ **Brand knowledge documents provide detailed collection positioning**

---

## See Also

- `PROJECT-REFERENCE.md` - Complete project documentation
- `PRODUCT-REQUIREMENTS-DOCUMENT.md` - Product requirements and specifications
- `src/utils/forgeHelpers.ts` - Collection mapping utilities
- `src/utils/collectionIcons.ts` - Collection icon helpers
- `src/hooks/useCollections.tsx` - Collection data hook
