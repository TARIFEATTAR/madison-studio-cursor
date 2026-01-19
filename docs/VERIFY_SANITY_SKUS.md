# How to Verify Sanity SKUs Are Showing on Product Page

## Step 1: Ensure Database Has Variants Column

First, make sure the `variants` column exists in `product_hubs`:

**Option A: Run the SQL script**
```sql
-- Run this in Supabase SQL Editor
-- File: scripts/add_variants_to_product_hubs.sql
```

**Option B: Check if column exists**
```sql
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'product_hubs'
  AND column_name = 'variants';
```

If the column doesn't exist, run the migration script.

---

## Step 2: Re-sync Products from Sanity

Since we updated the sync function, you need to re-import products:

1. Go to **Settings** → **Integrations** → **Sanity.io**
2. Click **"Import Products from Sanity"**
3. Wait for the sync to complete

This will create variants with SKUs for products that have `sku6ml` and `sku12ml` in Sanity.

---

## Step 3: Verify Variants Are Stored

Check if variants are being stored correctly:

```sql
-- Check if ADEN product has variants
SELECT
  name,
  sku as primary_sku,
  jsonb_array_length(variants) as variant_count,
  jsonb_pretty(variants) as variants_json
FROM product_hubs
WHERE name ILIKE '%ADEN%'
LIMIT 1;
```

You should see:
- `variant_count`: 2 (if both 6ml and 12ml SKUs exist)
- `variants_json`: Array with two objects, each containing:
  - `title`: "6ml" or "12ml"
  - `sku`: "EMBER-ADEN-6ML" or "EMBER-ADEN-12ML"

---

## Step 4: Check Product Page

1. Go to **Products** page in Madison
2. Find and open the **ADEN** product
3. Click on the **"Variants"** tab
4. You should see a table with:
   - **Variant Name**: "6ml" and "12ml"
   - **SKU**: "EMBER-ADEN-6ML" and "EMBER-ADEN-12ML"
   - **Price**, **Inventory**, **Status** columns

---

## Troubleshooting

### Variants Not Showing?

1. **Check if variants column exists:**
   ```sql
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'product_hubs' AND column_name = 'variants';
   ```

2. **Check if product has variants:**
   ```sql
   SELECT name, variants FROM product_hubs WHERE name = 'ADEN';
   ```

3. **Re-sync the product:**
   - Go to Settings → Integrations → Sanity.io
   - Click "Import Products from Sanity" again

4. **Check browser console:**
   - Open browser DevTools (F12)
   - Look for errors when loading the product page
   - Check Network tab for API calls

### Variants Show But SKUs Are Empty?

1. **Verify Sanity has SKUs:**
   - Check in Sanity Studio that `sku6ml` and `sku12ml` fields have values
   - Field names must be exactly: `sku6ml` and `sku12ml`

2. **Check sync function logs:**
   - Go to Supabase Dashboard → Edge Functions → `sync-sanity-products`
   - Check the logs for the last sync
   - Look for: `"Created X variants for [product name]"`

3. **Verify GROQ query:**
   - The sync function queries: `sku6ml, sku12ml`
   - Make sure these field names match your Sanity schema

---

## Expected Result

When viewing the **ADEN** product in the **Variants** tab, you should see:

| Variant | SKU | Price | Compare At | Inventory | Status |
|---------|-----|-------|------------|-----------|--------|
| 6ml (6ml) | `EMBER-ADEN-6ML` | $0.00 | — | 0 | Out of Stock |
| 12ml (12ml) | `EMBER-ADEN-12ML` | $0.00 | — | 0 | Out of Stock |

The SKUs should match exactly what you see in Sanity Studio.
