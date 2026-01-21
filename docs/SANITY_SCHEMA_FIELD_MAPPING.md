# Sanity Product Schema - Complete Field Mapping

## Overview

This document provides a complete reference of all Sanity product schema fields and how they map to Madison Studio product data. The Sanity schema uses a unified `product` document type with conditional fields based on `collectionType` (Atlas vs Relic).

**Key Finding:** GPS coordinates ARE present in the schema:
- **Atlas products**: `atlasData.gpsCoordinates` (string format: "45.5017° N, 73.5673° W")
- **Relic products**: `relicData.gpsCoordinates` (string format for provenance)

---

## Schema Organization

Sanity products are organized into 5 groups:
1. **General Info** - Basic product information
2. **Media** - Images and visual content
3. **Collection Data** - Atlas/Relic specific fields
4. **Fragrance Architecture** - Scent notes and perfumer info
5. **Shopify Sync** - E-commerce integration fields

---

## Complete Field Inventory

### GROUP 1: General Info

| Sanity Field | Type | Description | Madison Studio Source | Currently Synced? |
|--------------|------|-------------|----------------------|-------------------|
| `collectionType` | `string` | "atlas" or "relic" - determines which fields are visible | `product.collections` → map to "atlas"/"relic" | ❌ No |
| `generationSource` | `string` (hidden) | "manual" or "madison-studio" | Auto-set to "madison-studio" when pushed | ❌ No |
| `internalName` | `string` | For inventory tracking (required) | `product.name` or `product.sku` | ❌ No |
| `legacyName` | `string` | Previous product name (rebrand transition) | `product.metadata.legacy_name` | ✅ Yes |
| `showLegacyName` | `boolean` | Display legacy name below title | Not in Madison (manual in Sanity) | ❌ No |
| `title` | `string` | Public-facing product name | `product.name` | ✅ Yes |
| `slug` | `slug` | URL-friendly identifier | `product.slug` | ✅ Yes |
| `volume` | `string` | Size (e.g., "9ml", "3ml", "15ml") | Not directly in Madison | ❌ No |
| `scentProfile` | `string` | Brief scent summary for product cards | `product.short_description` or formulation | ❌ No |
| `inspiredBy` | `string` | Reference fragrance/concept | Not in Madison | ❌ No |
| `productFormat` | `string` | Perfume Oil, Atmosphere Mist, etc. | `formulation.concentration_type` → mapped | ✅ Yes |
| `perfumer` | `string` | Perfumer/Nose name | Not in Madison | ❌ No |
| `year` | `number` | Year of release/creation | Not in Madison | ❌ No |

### GROUP 2: Media

| Sanity Field | Type | Description | Madison Studio Source | Currently Synced? |
|--------------|------|-------------|----------------------|-------------------|
| `mainImage` | `image` | Hero product image with hotspot | `product.hero_image_id` (DAM asset) | ❌ No |
| `gallery` | `array[image]` | Additional product images | `product.gallery_image_ids[]` (DAM assets) | ❌ No |
| `shopifyPreviewImageUrl` | `url` | Fallback image from Shopify | `product.featured_image_url` or Shopify sync | ❌ No |

### GROUP 3: Collection Data

#### Atlas-Specific Fields (only visible when `collectionType == "atlas"`)

| Sanity Field | Type | Description | Madison Studio Source | Currently Synced? |
|--------------|------|-------------|----------------------|-------------------|
| `atlasData.atmosphere` | `string` | Territory: "tidal", "ember", "petal", "terra" | `product.collections[]` → map to territory | ❌ No |
| `atlasData.gpsCoordinates` | `string` | Inspiration Point coordinates (e.g., "45.5017° N, 73.5673° W") | **NOT IN MADISON** - needs to be added | ❌ No |
| `atlasData.travelLog` | `array[block]` | Narrative description (Portable Text) | `product.long_description` → convert to blocks | ❌ No |
| `atlasData.badges` | `array[string]` | Trust badges: "Skin-Safe", "Clean", "Cruelty-Free" | `product.tags[]` → filter for badges | ❌ No |
| `atlasData.fieldReport` | `shoppableImage` | Shoppable lifestyle image with hotspots | Not in Madison | ❌ No |

#### Relic-Specific Fields (only visible when `collectionType == "relic"`)

| Sanity Field | Type | Description | Madison Studio Source | Currently Synced? |
|--------------|------|-------------|----------------------|-------------------|
| `relicData.distillationYear` | `number` | Year material was distilled | Not in Madison | ❌ No |
| `relicData.originRegion` | `string` | Geographic origin (e.g., "Trat, Thailand") | Not in Madison | ❌ No |
| `relicData.gpsCoordinates` | `string` | Provenance coordinates (e.g., "17.0151° N, 54.0924° E") | **NOT IN MADISON** - needs to be added | ❌ No |
| `relicData.viscosity` | `number` | Oil thickness (0-100) | Not in Madison | ❌ No |
| `relicData.museumDescription` | `array[block]` | Curatorial description (Portable Text) | `product.long_description` → convert to blocks | ❌ No |
| `relicData.badges` | `array[string]` | "Pure Origin", "Wild Harvested" | `product.tags[]` → filter for badges | ❌ No |
| `relicData.museumExhibit` | `museumExhibit` | Digital vitrine with macro photography | Not in Madison | ❌ No |
| `relicData.isHeritageDistillation` | `boolean` | Traditional co-distillation flag | Not in Madison | ❌ No |
| `relicData.heritageType` | `string` | Heritage type subtitle | Not in Madison | ❌ No |

#### Shared Collection Fields

| Sanity Field | Type | Description | Madison Studio Source | Currently Synced? |
|--------------|------|-------------|----------------------|-------------------|
| `relatedProducts` | `array[reference]` | Products for "Complete the Journey" section | Not in Madison | ❌ No |

### GROUP 4: Fragrance Architecture

| Sanity Field | Type | Description | Madison Studio Source | Currently Synced? |
|--------------|------|-------------|----------------------|-------------------|
| `notes.top` | `array[string]` | Top notes array | `formulation.scent_profile.top[]` | ✅ Yes (as `scentNotes.top`) |
| `notes.heart` | `array[string]` | Heart notes array | `formulation.scent_profile.heart[]` | ✅ Yes (as `scentNotes.heart`) |
| `notes.base` | `array[string]` | Base notes array | `formulation.scent_profile.base[]` | ✅ Yes (as `scentNotes.base`) |

**Note:** The push function currently maps to `scentNotes` (object with top/heart/base), but the schema also has `notes` (same structure). Both exist - need to verify which one is used on the website.

### GROUP 5: Shopify Sync / Commerce

| Sanity Field | Type | Description | Madison Studio Source | Currently Synced? |
|--------------|------|-------------|----------------------|-------------------|
| `price` | `number` | Price in USD | `product.price` | ✅ Yes |
| `compareAtPrice` | `number` | Original/compare price | `product.compare_at_price` | ✅ Yes |
| `inStock` | `boolean` | Availability status | `product.status === "active"` | ✅ Yes |
| `scarcityNote` | `string` | Limited stock message | Not in Madison | ❌ No |
| `shopifyHandle` | `string` | Shopify product slug | From Shopify sync | ❌ No |
| `shopifyProductId` | `string` | Shopify product GID | `product.external_ids.shopify_product_id` | ✅ Yes |
| `shopifyVariantId` | `string` | Default variant GID | From Shopify variants | ❌ No |
| `shopifyVariant6mlId` | `string` | 6ml variant GID | From Shopify variants | ❌ No |
| `shopifyVariant12mlId` | `string` | 12ml variant GID | From Shopify variants | ❌ No |
| `sku` | `string` | Primary SKU (no size) | `product.metadata.parent_sku` | ✅ Yes (as `parentSku`) |
| `sku6ml` | `string` | 6ml variant SKU | `product.metadata.sku_6ml` | ✅ Yes |
| `sku12ml` | `string` | 12ml variant SKU | `product.metadata.sku_12ml` | ✅ Yes |
| `parentSku` | `string` | Parent SKU (no size suffix) | `product.metadata.parent_sku` | ✅ Yes |

**Note:** The schema has both `sku` (primary) and `parentSku`. The push function sets `parentSku` correctly, but `sku` is set to `product.sku` (which may include size). This might need adjustment.

### Shopify Store Data (Read-Only Object)

The `store` object contains read-only data synced from Shopify Connect. This is NOT pushed from Madison - it's populated by Sanity's Shopify integration.

---

## Currently Synced Fields (Push Function v3.0)

The `push-product-to-sanity` function currently syncs these fields:

### ✅ Basic Information
- `title` ← `product.name`
- `slug` ← `product.slug`
- `legacyName` ← `product.metadata.legacy_name`
- `parentSku` ← `product.metadata.parent_sku`
- `sku` ← `product.sku` (primary SKU)
- `sku6ml` ← `product.metadata.sku_6ml`
- `sku12ml` ← `product.metadata.sku_12ml`
- `shortDescription` ← `product.short_description` or `product.tagline`

### ✅ Formulation Data (from `product_formulations` table)
- `scentNotes` (object with `top`, `heart`, `base` arrays) ← `formulation.scent_profile`
- `scentFamily` ← `formulation.scent_family` (lowercased)
- `productFormat` ← `formulation.concentration_type` (mapped to display text)
- `baseCarrier` ← `formulation.base_carrier` (mapped to display text)
- `longevity` ← `formulation.longevity` (mapped to display text like "4-8 hours")
- `sillage` ← `formulation.sillage` (mapped: "enormous" → "beast")
- `bestSeasons` ← `formulation.season_suitability[]` (mapped with emojis)
- `bestOccasions` ← `formulation.occasion_suitability[]` (mapped to display text)

### ✅ Commerce
- `price` ← `product.price`
- `compareAtPrice` ← `product.compare_at_price`
- `inStock` ← `product.status === "active"`
- `shopifyProductId` ← `product.external_ids.shopify_product_id`

### ✅ Metadata
- `madisonProductId` ← `product.id`
- `madisonSyncedAt` ← Current timestamp

---

## NOT Currently Synced (Available in Schema)

### Missing from Push Function

1. **Collection Type & Data**
   - `collectionType` (atlas/relic)
   - `atlasData.*` (atmosphere, GPS, travelLog, badges, fieldReport)
   - `relicData.*` (distillationYear, originRegion, GPS, viscosity, museumDescription, badges, museumExhibit)

2. **Media**
   - `mainImage` (hero image from DAM)
   - `gallery[]` (gallery images from DAM)
   - `shopifyPreviewImageUrl`

3. **Additional General Fields**
   - `internalName`
   - `showLegacyName`
   - `volume`
   - `scentProfile` (brief summary)
   - `inspiredBy`
   - `perfumer`
   - `year`

4. **Long Description**
   - `longDescription` (Portable Text) - exists in transform function but NOT in patch operation
   - `atlasData.travelLog` (Portable Text)
   - `relicData.museumDescription` (Portable Text)

5. **Additional Commerce**
   - `scarcityNote`
   - `shopifyHandle`
   - `shopifyVariantId`, `shopifyVariant6mlId`, `shopifyVariant12mlId`

6. **Relationships**
   - `relatedProducts[]` (product references)

7. **SEO** (exists in transform but NOT in patch)
   - `seo.title`
   - `seo.description`
   - `seo.keywords[]`

8. **Benefits & Features** (exists in transform but NOT in patch)
   - `keyBenefits[]` ← `product.key_benefits[]`
   - `features[]` ← `product.key_differentiators[]` or `product.tags[]`

---

## GPS Coordinates Status

### Current State
- ✅ **Schema HAS GPS fields:**
  - `atlasData.gpsCoordinates` (string format: "45.5017° N, 73.5673° W")
  - `relicData.gpsCoordinates` (string format for provenance)

- ❌ **Madison Studio does NOT have GPS fields:**
  - No latitude/longitude fields in `product_hubs` table
  - No GPS fields in `product_formulations` table
  - No GPS fields in product metadata

### Recommendation
To sync GPS coordinates, you need to:
1. Add GPS fields to Madison Studio (either in `product_hubs` or `product_formulations`)
2. Update the push function to map GPS data to `atlasData.gpsCoordinates` or `relicData.gpsCoordinates`

**Note:** The schema uses string format, not separate lat/lng numbers. However, the `fieldJournal` schema does have separate `latitude` and `longitude` number fields if you want to use that pattern.

---

## Field Mapping Summary

### Madison Studio → Sanity Mapping

| Madison Field | Sanity Field | Status | Notes |
|---------------|--------------|--------|-------|
| `product.name` | `title` | ✅ Synced | Direct mapping |
| `product.slug` | `slug.current` | ✅ Synced | Direct mapping |
| `product.metadata.legacy_name` | `legacyName` | ✅ Synced | Direct mapping |
| `product.metadata.parent_sku` | `parentSku` | ✅ Synced | Direct mapping |
| `product.sku` | `sku` | ✅ Synced | May need to use parent_sku instead |
| `product.metadata.sku_6ml` | `sku6ml` | ✅ Synced | Direct mapping |
| `product.metadata.sku_12ml` | `sku12ml` | ✅ Synced | Direct mapping |
| `product.short_description` | `shortDescription` | ✅ Synced | Direct mapping |
| `product.long_description` | `longDescription` | ⚠️ Partial | In transform but NOT in patch |
| `product.price` | `price` | ✅ Synced | Direct mapping |
| `product.compare_at_price` | `compareAtPrice` | ✅ Synced | Direct mapping |
| `product.status` | `inStock` | ✅ Synced | `status === "active"` |
| `formulation.scent_profile` | `scentNotes` | ✅ Synced | Object with top/heart/base |
| `formulation.scent_family` | `scentFamily` | ✅ Synced | Lowercased |
| `formulation.concentration_type` | `productFormat` | ✅ Synced | Mapped to display text |
| `formulation.base_carrier` | `baseCarrier` | ✅ Synced | Mapped to display text |
| `formulation.longevity` | `longevity` | ✅ Synced | Mapped to display text |
| `formulation.sillage` | `sillage` | ✅ Synced | Mapped ("enormous" → "beast") |
| `formulation.season_suitability` | `bestSeasons` | ✅ Synced | Mapped with emojis |
| `formulation.occasion_suitability` | `bestOccasions` | ✅ Synced | Mapped to display text |
| `product.key_benefits[]` | `keyBenefits[]` | ⚠️ Partial | In transform but NOT in patch |
| `product.key_differentiators[]` | `features[]` | ⚠️ Partial | In transform but NOT in patch |
| `product.seo_title` | `seo.title` | ⚠️ Partial | In transform but NOT in patch |
| `product.seo_description` | `seo.description` | ⚠️ Partial | In transform but NOT in patch |
| `product.seo_keywords[]` | `seo.keywords[]` | ⚠️ Partial | In transform but NOT in patch |
| `product.collections[]` | `atlasData.atmosphere` | ❌ Not Synced | Needs mapping logic |
| `product.hero_image_id` | `mainImage` | ❌ Not Synced | Needs DAM asset URL conversion |
| `product.gallery_image_ids[]` | `gallery[]` | ❌ Not Synced | Needs DAM asset URL conversion |
| GPS coordinates | `atlasData.gpsCoordinates` | ❌ Not Synced | Field doesn't exist in Madison |
| GPS coordinates | `relicData.gpsCoordinates` | ❌ Not Synced | Field doesn't exist in Madison |

---

## Critical Issues & Recommendations

### 1. Patch vs Transform Mismatch
The `transformProductToSanity` function creates a complete document with many fields, but the actual patch operation only includes a subset. Fields like `longDescription`, `keyBenefits`, `features`, and `seo` are in the transform but NOT in the patch.

**Recommendation:** Add these fields to the patch operation in `push-product-to-sanity/index.ts` around line 569.

### 2. Collection Type Not Set
The schema requires `collectionType` to be "atlas" or "relic" to show collection-specific fields, but the push function doesn't set this.

**Recommendation:** Map `product.collections[]` to determine collection type:
- If collections include "atlas", "tidal", "ember", "petal", "terra" → set `collectionType: "atlas"`
- If collections include "relic" → set `collectionType: "relic"`

### 3. GPS Coordinates Missing
GPS fields exist in Sanity but not in Madison Studio.

**Recommendation:**
- Add `gps_coordinates` field to `product_hubs` table (string format)
- Or add `latitude` and `longitude` to `product_formulations` table (number format)
- Update push function to map to `atlasData.gpsCoordinates` or `relicData.gpsCoordinates`

### 4. Media Not Synced
Images from DAM are not being pushed to Sanity.

**Recommendation:**
- Fetch DAM asset URLs from `hero_image_id` and `gallery_image_ids[]`
- Convert to Sanity image format
- Set `mainImage` and `gallery[]` fields

### 5. Notes vs ScentNotes
The schema has both `notes` (object with top/heart/base) and the push function uses `scentNotes`. Need to verify which one the website actually uses.

**Recommendation:** Check the website code to see which field is queried, then align the push function accordingly.
