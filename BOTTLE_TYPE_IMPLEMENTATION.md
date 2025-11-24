# Bottle Type Field Implementation

## ✅ Implementation Complete

The `bottle_type` field has been successfully added to provide explicit control over oil vs spray detection for image generation.

## What Was Implemented

### 1. **Database Migration**
- **File**: `supabase/migrations/20251124081148_add_bottle_type_to_products.sql`
- Added `bottle_type` column to `brand_products` table
- Values: `'oil'`, `'spray'`, or `'auto'` (default)
- Added CHECK constraint to ensure valid values
- Created index for performance
- Auto-populated existing products based on their data

### 2. **Detection Logic Update**
- **File**: `supabase/functions/generate-madison-image/index.ts`
- Updated `detectBottleType()` function to check `bottle_type` field FIRST
- Priority order:
  1. **Explicit `bottle_type`** (if set to 'oil' or 'spray') - HIGHEST PRIORITY
  2. **Auto-detection** (if 'auto' or null) - Falls back to keyword matching

### 3. **TypeScript Interface**
- **File**: `src/hooks/useProducts.tsx`
- Added `bottle_type: 'oil' | 'spray' | 'auto' | null` to `Product` interface

### 4. **Product Form UI**
- **File**: `src/components/settings/ProductsTab.tsx`
- Added `bottle_type` to form state
- Added Select dropdown in product form (shown for Personal Fragrance and Skincare categories)
- Options:
  - **Auto-detect**: Uses smart keyword detection (default)
  - **Oil**: Explicitly sets as oil (dropper/roller, no spray)
  - **Spray**: Explicitly sets as spray (atomizer, no dropper)
- Added helpful description text

## How It Works

### For Users:

1. **Creating/Editing Products**:
   - When creating or editing a Personal Fragrance or Skincare product
   - A "Bottle Type" dropdown appears next to "Product Type"
   - Select:
     - **Auto-detect**: System will detect from product name/format (recommended)
     - **Oil**: Force oil detection (for edge cases)
     - **Spray**: Force spray detection (for edge cases)

2. **Default Behavior**:
   - New products default to `'auto'`
   - Existing products were auto-populated based on their data
   - If `'auto'`, system uses comprehensive keyword detection

3. **Explicit Override**:
   - If user sets `'oil'` or `'spray'`, that value takes absolute priority
   - No keyword detection is performed
   - Ensures 100% accuracy for edge cases

### For Image Generation:

1. **Priority Check**:
   ```
   IF bottle_type === 'oil' → Return { isOil: true, confidence: 'high' }
   IF bottle_type === 'spray' → Return { isSpray: true, confidence: 'high' }
   IF bottle_type === 'auto' OR null → Run auto-detection
   ```

2. **Auto-Detection** (when `bottle_type` is 'auto' or null):
   - Checks product name, format, product_type, category, description
   - Uses 18+ oil indicators and 11+ spray indicators
   - Handles special cases (e.g., "Perfume Oil" = oil, not spray)

3. **Prompt Generation**:
   - If oil detected → Adds mandatory "NO SPRAY" instructions
   - If spray detected → Adds mandatory "ATOMIZER REQUIRED" instructions
   - Positioned at the TOP of prompts (highest priority)

## Benefits

1. **Explicit Control**: Users can override auto-detection for edge cases
2. **Backward Compatible**: Existing products work with auto-detection
3. **User-Friendly**: Clear dropdown with helpful descriptions
4. **Enforced**: Explicit values take absolute priority
5. **Flexible**: Can be updated after product creation

## Migration Notes

The migration automatically:
- Sets `bottle_type = 'auto'` for all existing products
- Then analyzes existing data to set `bottle_type = 'oil'` for products that clearly contain oil indicators
- Sets `bottle_type = 'spray'` for products that clearly contain spray indicators (and no oil indicators)

This ensures existing products continue to work correctly while new products can use explicit control.

## Testing Checklist

- [ ] Create new product with `bottle_type = 'oil'` → Verify image shows dropper/roller
- [ ] Create new product with `bottle_type = 'spray'` → Verify image shows atomizer
- [ ] Create new product with `bottle_type = 'auto'` → Verify auto-detection works
- [ ] Edit existing product → Verify `bottle_type` field appears and saves correctly
- [ ] Generate image for oil product → Verify no spray mechanism appears
- [ ] Generate image for spray product → Verify atomizer appears

## Next Steps (Optional)

1. **Bulk Update Tool**: Add ability to bulk update `bottle_type` for multiple products
2. **Onboarding Question**: Ask during brand setup: "Do you sell oils, sprays, or both?"
3. **Brand-Level Default**: Set brand-level default `bottle_type` that applies to all products
4. **Analytics**: Track how often explicit `bottle_type` is used vs auto-detection


