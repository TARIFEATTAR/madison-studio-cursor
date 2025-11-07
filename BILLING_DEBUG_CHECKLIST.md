# Billing Page Debug Checklist

Based on the console errors shown, here are the specific issues and fixes:

## Error 1: `subscription_plans` table not found
**Console shows:** `Could not find the table 'public.subscription_plans' in the schema cache`

### Fix:
Run this SQL in Supabase SQL Editor (use the file `FIX_BILLING_SETUP.sql`):

Or run the migration directly:
```bash
cd supabase
supabase db push
```

### Verify it worked:
```sql
SELECT * FROM subscription_plans;
```
Should return 3 rows (Atelier, Studio, Maison)

---

## Error 2: CORS blocked from localhost:8080
**Console shows:** `Access to fetch at 'https://...get-subscription' from origin 'http://localhost:8080' has been blocked by CORS`

### Causes:
1. Edge function needs to be redeployed with CORS fix
2. Local dev server might be using wrong port

### Fix Option 1: Deploy function
```bash
supabase functions deploy get-subscription
```

### Fix Option 2: Check if running on correct port
Your app should be on `http://localhost:5173` (Vite default)
Console shows `localhost:8080` which might be wrong

Check your dev server:
```bash
npm run dev
```
And verify it shows port 5173, not 8080

---

## Error 3: Function fetch failed
**Console shows:** `FunctionsFetchError: Failed to send a request to the Edge Function at http://localhost:8080/node_`

### This means:
The app is trying to call the function but it's using the wrong base URL

### Check:
1. What URL is shown when you run `npm run dev`?
2. Is it 5173 or 8080?

---

## Quick Fix Steps (in order):

### Step 1: Create the table
```bash
# Go to Supabase Dashboard → SQL Editor
# Copy and run FIX_BILLING_SETUP.sql
```

### Step 2: Deploy the function
```bash
supabase functions deploy get-subscription
```

### Step 3: Restart dev server
```bash
# Kill the current server (Ctrl+C)
npm run dev
# Verify it shows localhost:5173
```

### Step 4: Clear browser cache
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Or clear site data in DevTools

### Step 5: Test
- Go to Settings → Billing
- Check console for errors
- Should show 3 subscription plans

---

## If still not working

Share:
1. Output of `npm run dev` (what port is it using?)
2. Browser console errors (screenshot or copy/paste)
3. Result of: `SELECT * FROM subscription_plans;` in Supabase SQL Editor




