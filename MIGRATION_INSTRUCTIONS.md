# How to Run the Database Migration

## Option 1: Supabase Dashboard (Recommended) ✅

### Step-by-Step:

1. **Go to Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/likkskifwsrvszxdvufw

2. **Navigate to SQL Editor**
   - Click **SQL Editor** in the left sidebar
   - Or go directly: https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/sql/new

3. **Open the Migration File**
   - File location: `supabase/migrations/20251105120000_update_madison_pricing_tiers.sql`
   - Open it in your code editor (Cursor/VS Code)
   - Copy ALL the contents (Cmd+A, then Cmd+C)

4. **Paste into SQL Editor**
   - Paste the SQL into the Supabase SQL Editor text area
   - Review the SQL (it should start with `-- Update Madison Studio Pricing Tiers`)

5. **Run the Migration**
   - Click the green **Run** button (or press Cmd+Enter)
   - Wait for completion (should take a few seconds)

6. **Verify Success**
   - You should see: "Success. No rows returned" or similar
   - If you see errors, read them carefully and let me know

---

## Option 2: Supabase CLI (Alternative)

If you have Supabase CLI set up and linked:

```bash
npx supabase db push
```

This will apply all pending migrations.

---

## Verify Migration Ran Successfully

After running, verify the tiers were created:

1. In Supabase Dashboard, go to **Table Editor**
2. Click on `subscription_plans` table
3. You should see 3 rows:
   - **Atelier** ($49/month, $470/year)
   - **Studio** ($199/month, $1,990/year)
   - **Maison** ($599/month, $5,990/year)

4. Also check `subscription_addons` table (should have 6 rows)

---

## Quick Verification Query

Run this in SQL Editor to verify:

```sql
SELECT name, slug, price_monthly, price_yearly 
FROM subscription_plans 
ORDER BY sort_order;
```

Expected output:
- Atelier: $49.00, $470.00
- Studio: $199.00, $1,990.00
- Maison: $599.00, $5,990.00

---

## Troubleshooting

**If you see "relation already exists" errors:**
- The migration uses `CREATE TABLE IF NOT EXISTS` - this is safe to ignore
- The important part is the `INSERT` statements updating the tiers

**If plans don't update:**
- Check if you see the old plans (Free, Premium, Enterprise) still there
- The migration uses `ON CONFLICT (slug) DO UPDATE` - it should replace them
- If needed, manually delete old plans first:
  ```sql
  DELETE FROM subscription_plans WHERE slug IN ('free', 'premium', 'enterprise');
  ```

**If you get permission errors:**
- Make sure you're logged in as a project owner/admin
- Try running individual sections of the migration separately
















