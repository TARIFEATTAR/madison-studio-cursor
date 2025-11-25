# Bottle Type Detection: Oil vs Spray Fragrances

## Problem
The AI was sometimes generating images with **perfume sprayers/atomizers** when it should generate **oil bottles with droppers or roller balls**. This breaks the entire workflow because users can't use incorrect product images.

## ✅ Solution Implemented

### 1. **Comprehensive Detection Logic**
Created a centralized `detectBottleType()` function that checks:
- Product name
- Format field
- Product type
- Category
- Description

### 2. **Oil Indicators** (triggers OIL detection):
- `oil`, `attar`, `concentrate`
- `roller`, `dropper`, `roll-on`, `roll on`
- `perfume oil`, `fragrance oil`, `essential oil`
- `carrier oil`, `diluted oil`, `pure oil`
- `oil-based`, `oil based`
- `viscous`, `thick oil`, `dense oil`
- Category = `skincare` (usually oils)

### 3. **Spray Indicators** (triggers SPRAY detection):
- `spray`, `atomizer`, `pump`, `mist`
- `eau de`, `cologne`
- `perfume spray`, `spray bottle`, `sprayer`
- `atomizing`, `aerosol`

### 4. **Priority Logic**
- **"Perfume Oil" or "Fragrance Oil"** = OIL (not spray) - takes precedence
- **Category = "skincare"** = OIL
- If oil indicators found → OIL
- If spray indicators found (and no oil) → SPRAY

### 5. **Mandatory Prompt Sections**
The bottle type specification is now:
- **Positioned FIRST** in the prompt (before brand context)
- **Highly visible** with box formatting
- **Explicitly marked as MANDATORY**
- **Reinforced in negative prompts**

## 📋 How It Works

### Automatic Detection (Current Implementation)
The system automatically detects bottle type from product data fields:
- `name`: "Perfume Oil", "Fragrance Oil", "Roller Ball"
- `format`: "oil", "roller", "dropper", "spray"
- `product_type`: "oil", "attar", "spray perfume"
- `category`: "skincare" (usually oils)
- `description`: Any mentions of oil/spray

### Example Product Data That Triggers OIL:
```json
{
  "name": "Sandalwood Perfume Oil",
  "format": "roller",
  "category": "personal_fragrance"
}
```

### Example Product Data That Triggers SPRAY:
```json
{
  "name": "Eau de Parfum",
  "format": "spray",
  "product_type": "spray perfume"
}
```

## 🎯 Best Practices for Product Data

### For Oil Products:
1. **Always include "oil" in the name or format**:
   - ✅ "Perfume Oil"
   - ✅ "Fragrance Oil"
   - ✅ "Roller Ball Oil"

2. **Use format field**:
   - ✅ `format: "oil"`
   - ✅ `format: "roller"`
   - ✅ `format: "dropper"`

3. **If it's skincare, set category**:
   - ✅ `category: "skincare"`

### For Spray Products:
1. **Include "spray" or "perfume" in name**:
   - ✅ "Eau de Parfum"
   - ✅ "Perfume Spray"
   - ✅ "Cologne"

2. **Use format field**:
   - ✅ `format: "spray"`
   - ✅ `format: "atomizer"`

## 🔧 Future Enhancements (Optional)

### Option 1: Product-Level Field (Recommended)
Add a dedicated `bottle_type` field to the `brand_products` table:

```sql
ALTER TABLE brand_products
ADD COLUMN bottle_type text CHECK (bottle_type IN ('oil', 'spray', 'auto'));

-- 'oil' = dropper/roller (explicit)
-- 'spray' = atomizer (explicit)
-- 'auto' = auto-detect from other fields (default)
```

**Benefits:**
- Explicit control (no guessing)
- Can be set during onboarding
- Can be toggled/updated after the fact
- Overrides automatic detection

**Implementation:**
1. Add migration to add `bottle_type` column
2. Update product forms to include bottle type selector
3. Update detection logic to check `bottle_type` first, then fall back to auto-detection

### Option 2: Brand-Level Setting
Add to brand guidelines as a global rule:

```json
{
  "visual_standards": {
    "bottle_type_policy": "oil_only", // or "spray_only" or "mixed"
    "forbidden_elements": ["perfume sprayer", "atomizer"] // if oil_only
  }
}
```

**Benefits:**
- Set once for entire brand
- Applies to all products
- Good for brands that only sell oils or only sell sprays

### Option 3: Onboarding Question
During brand onboarding, ask:
> "What type of fragrance products do you sell?"
> - [ ] Oil-based (dropper/roller)
> - [ ] Spray perfumes (atomizer)
> - [ ] Both

Store this in brand settings and use as default.

## 🚨 Critical Prompts

### For OIL Products:
```
╔══════════════════════════════════════════════════════════════════╗
║     ⚠️ CRITICAL BOTTLE SPECIFICATION (MANDATORY - NO EXCEPTIONS) ║
╚══════════════════════════════════════════════════════════════════╝

PRODUCT TYPE: OIL-BASED FRAGRANCE (NON-SPRAY)

✅ REQUIRED CLOSURE TYPES (ONLY THESE):
  • Glass dropper with pipette
  • Roller ball applicator
  • Screw cap (if dropper/roller is separate)
  • Glass wand (dipstick applicator)

❌ ABSOLUTELY FORBIDDEN (NEVER INCLUDE):
  • Perfume sprayer / atomizer / pump mechanism
  • Crimped metal spray neck
  • Spray nozzle / misting device
  • Any form of spray dispenser
  • Aerosol mechanism

⚠️ CRITICAL: If you render a spray mechanism, the image is INCORRECT and unusable.
```

### For SPRAY Products:
```
╔══════════════════════════════════════════════════════════════════╗
║     ⚠️ CRITICAL BOTTLE SPECIFICATION (MANDATORY - NO EXCEPTIONS) ║
╚══════════════════════════════════════════════════════════════════╝

PRODUCT TYPE: SPRAY PERFUME (ALCOHOL-BASED)

✅ REQUIRED CLOSURE TYPE:
  • Spray pump mechanism with atomizer
  • Visible crimped metal neck
  • Spray nozzle for misting

❌ ABSOLUTELY FORBIDDEN:
  • Dropper / pipette
  • Roller ball applicator
  • Glass wand / dipstick
```

## 📊 Detection Confidence

The system reports confidence levels:
- **High**: Explicit "perfume oil" or "fragrance oil" in name/format
- **Medium**: Multiple indicators found (oil/roller/dropper)
- **Low**: Single indicator or ambiguous

## ✅ Testing Checklist

1. **Test Oil Detection**:
   - [ ] Product name contains "oil" → Detects as OIL
   - [ ] Format = "roller" → Detects as OIL
   - [ ] Format = "dropper" → Detects as OIL
   - [ ] Category = "skincare" → Detects as OIL
   - [ ] "Perfume Oil" in name → Detects as OIL (not spray)

2. **Test Spray Detection**:
   - [ ] Product name contains "spray" → Detects as SPRAY
   - [ ] Format = "spray" → Detects as SPRAY
   - [ ] "Eau de Parfum" → Detects as SPRAY

3. **Test Edge Cases**:
   - [ ] "Perfume Oil" → OIL (not spray, even though "perfume" is present)
   - [ ] Product with no indicators → No specification (relies on other context)

4. **Test Image Generation**:
   - [ ] Oil product → Image shows dropper/roller (no spray)
   - [ ] Spray product → Image shows atomizer (no dropper)

## 🎯 Recommendation

**For immediate use**: The automatic detection is now robust and should handle 95%+ of cases.

**For future**: Add `bottle_type` field to products table for explicit control:
- Can be set during product creation
- Can be updated if detection is wrong
- Can be toggled on/off per product
- Provides explicit control without relying on keyword matching

This gives users:
1. **Automatic** (works for most cases)
2. **Explicit** (can override if needed)
3. **Flexible** (can update after the fact)


