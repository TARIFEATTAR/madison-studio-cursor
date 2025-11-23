# Madison Training: Product Reference Protocol

## Problem Statement

Madison's training documents contain examples from legendary copywriters (Gary Halbert, David Ogilvy, etc.). Some of these examples may reference products (e.g., leather wallets, sunglasses, watches) that are **not relevant** to the Madison Studio user's actual business (e.g., candles, fragrance, skincare).

**Risk**: Madison might literally reference products from training examples instead of applying the stylistic techniques to the user's actual products.

## Solution Implemented

Added explicit instructions in the prompt construction to ensure Madison:
1. **Extracts STYLE and CADENCE** from training examples, not literal product references
2. **NEVER references products** from training examples that don't match the user's actual products
3. **ALWAYS uses the user's actual product data** from brand context
4. **Applies the writing technique**, not the literal product reference

## Changes Made

### 1. Training Document Section (`getMadisonSystemConfig()`)

Added a new "CRITICAL: TRAINING EXAMPLES - STYLE ONLY" section that appears after training documents are loaded:

```
╔══════════════════════════════════════════════════════════════════╗
║        CRITICAL: TRAINING EXAMPLES - STYLE ONLY                    ║
╚══════════════════════════════════════════════════════════════════╝

⚠️ PRODUCT REFERENCE PROTOCOL:

The training documents above contain examples from legendary copywriters.
These examples may reference products (e.g., leather wallets, sunglasses,
watches, etc.) that are NOT relevant to the current user's business.

YOUR RESPONSIBILITY:
• Extract the WRITING TECHNIQUE, CADENCE, and STYLISTIC APPROACH from examples
• NEVER reference products from training examples that don't match the user's actual products
• ALWAYS use the user's actual product data and brand context (provided separately)
• Apply the STYLE and STRUCTURE, not the literal product references

EXAMPLE:
If a training example shows: "This leather wallet ages beautifully over 10 years..."
And the user sells candles, you should extract:
  ✓ The specificity technique (10 years = concrete timeframe)
  ✓ The cadence and sentence structure
  ✓ The benefit framing approach
But write about: "This candle burns cleanly for 60 hours..." (using their actual product)

NEVER write: "This leather wallet..." when the user sells candles.
ALWAYS write about the user's actual products using the stylistic techniques from training.
```

### 2. Content Generation Hierarchy

Added explicit reminder in the "PRODUCT DATA FIRST" section:

```
1. PRODUCT DATA FIRST:
   - ⚠️ CRITICAL: NEVER reference products from training examples (e.g., wallets, sunglasses, watches)
   - ⚠️ ALWAYS write about the user's ACTUAL products using stylistic techniques from training
```

### 3. Pre-Flight Checklist

Added two new checklist items:

```
☑ Did I extract STYLE and CADENCE from training examples, not literal product references?
☑ Am I writing about the user's ACTUAL products, not products from training examples?
```

## How It Works

1. **Training documents are loaded** with examples from copywriters
2. **Explicit instruction is injected** immediately after training documents explaining the protocol
3. **Brand context is loaded separately** with the user's actual products and brand information
4. **Content generation hierarchy** reinforces that product data comes first
5. **Pre-flight checklist** ensures Madison self-checks before output

## Files Modified

- `supabase/functions/generate-with-claude/index.ts`
  - Updated `getMadisonSystemConfig()` function to add product reference protocol
  - Updated content generation hierarchy section
  - Updated pre-flight checklist

## Testing Recommendations

1. Upload a training document with examples mentioning irrelevant products (e.g., "leather wallet", "sunglasses")
2. Generate content for a user who sells candles
3. Verify that:
   - Madison uses stylistic techniques from the training (specificity, cadence, structure)
   - Madison writes about candles, not wallets or sunglasses
   - The writing style matches the training examples but the product references match the user's actual products

## Example Test Case

**Training Example:**
> "This leather wallet ages beautifully over 10 years. The Italian leather develops a patina that tells your story."

**User's Product:**
> Candle with 60-hour burn time, soy-coconut wax blend

**Expected Output:**
> "This candle burns cleanly for 60 hours. The soy-coconut wax blend cures for four full days before a single wick is trimmed, so the flame stays even long after cheaper blends tunnel out."

**What Madison Should Extract:**
- ✓ Specificity technique (concrete timeframe: "10 years" → "60 hours")
- ✓ Benefit framing ("ages beautifully" → "burns cleanly")
- ✓ Process detail ("Italian leather develops" → "soy-coconut wax blend cures")
- ✓ Contrast with alternatives ("tells your story" → "stays even long after cheaper blends tunnel out")

**What Madison Should NOT Do:**
- ✗ Reference "leather wallet" in any way
- ✗ Use "Italian leather" terminology
- ✗ Write about aging or patina

## Status

✅ **IMPLEMENTED** - Changes are in place and ready for testing.

