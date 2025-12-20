# Product Import CSV Guide

## Overview
Use the `product-import-template.csv` to bulk import products into Madison Studio.

---

## Required Fields

| Field | Description | Example |
|-------|-------------|---------|
| `name` | Product name (required) | "Rose Attär Oil" |

---

## Optional Fields

### Basic Information

| Field | Description | Example |
|-------|-------------|---------|
| `sku` | Stock keeping unit | "ATTR-ROSE-001" |
| `barcode` | UPC/EAN code | "012345678901" |
| `short_description` | Brief description (< 200 chars) | "Pure rose attär distilled using traditional methods" |
| `long_description` | Full product description | Extended marketing copy |
| `tagline` | Marketing tagline | "The Essence of a Thousand Roses" |

### Categorization

| Field | Allowed Values |
|-------|----------------|
| `category` | Skincare, Haircare, Body Care, Cosmetics, Fragrance, Wellness, Sun Care, Men's Grooming, Nail Care, Oral Care, Baby & Kids |
| `subcategory` | Free text for additional grouping |
| `product_type` | See types by category below |
| `product_line` | Your product line name |

**Product Types by Category:**
- **Fragrance**: Attär, Eau de Parfum, Eau de Toilette, Perfume Oil, Body Mist, Solid Perfume, Room Spray, Candle, Incense
- **Skincare**: Cleanser, Toner, Serum, Moisturizer, Eye Cream, Mask, Exfoliant, Oil, Mist, SPF
- **Haircare**: Shampoo, Conditioner, Treatment, Styling, Oil, Mask, Serum, Spray
- **Body Care**: Body Wash, Body Lotion, Body Oil, Body Scrub, Hand Cream, Deodorant
- **Cosmetics**: Foundation, Concealer, Powder, Blush, Bronzer, Highlighter, Lipstick, Lip Gloss, Mascara, Eyeliner, Eyeshadow

### Pricing

| Field | Type | Example |
|-------|------|---------|
| `price` | Decimal | 85.00 |
| `compare_at_price` | Decimal (original/MSRP) | 120.00 |
| `cost_per_unit` | Decimal (your cost) | 22.50 |
| `currency` | ISO code | USD, EUR, GBP |

### Status & Visibility

| Field | Allowed Values |
|-------|----------------|
| `status` | draft, active, archived, discontinued |
| `visibility` | private, internal, public |
| `development_stage` | concept, formulation, testing, production, launched |

### Tags & Collections

| Field | Format | Example |
|-------|--------|---------|
| `tags` | Pipe-separated | "rose\|attär\|natural\|luxury" |
| `collections` | Pipe-separated | "Heritage Collection\|Best Sellers" |

### AI & Brand Context

| Field | Description |
|-------|-------------|
| `target_audience` | Who this product is for |
| `key_benefits` | Pipe-separated benefits |
| `key_differentiators` | What makes it unique |
| `brand_voice_notes` | Writing guidance for AI |

### SEO

| Field | Description |
|-------|-------------|
| `seo_title` | Page title (< 60 chars) |
| `seo_description` | Meta description (< 160 chars) |
| `seo_keywords` | Pipe-separated keywords |

### Dates

| Field | Format | Example |
|-------|--------|---------|
| `launch_date` | YYYY-MM-DD | 2024-06-15 |

---

## Tips

1. **Leave fields empty** if not applicable (don't use "N/A")
2. **Use pipe `|` for lists** (tags, collections, benefits)
3. **Wrap text in quotes** if it contains commas
4. **Use UTF-8 encoding** to preserve special characters (Attär, etc.)
5. **Start with a few products** to test before bulk import

---

## After Import

Once imported, you can enrich each product with:
- Hero images and gallery (Media tab)
- Formulation details (Formulation tab)
- Ingredients list (Ingredients tab)
- Safety Data Sheets (SDS tab)
- Packaging specs (Packaging tab)
