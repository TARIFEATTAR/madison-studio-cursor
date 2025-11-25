# ✅ Verify Your Environment Variables Are Correct

## 🔍 What to Check

Since you have variables at the bottom of the list, make sure you have these **exact** variable names:

### Required Variables (Must Have `VITE_` Prefix):

1. **`VITE_SUPABASE_URL`**
   - ✅ Must start with `VITE_`
   - ✅ Value should be your Supabase project URL
   - ✅ Example: `https://likkskifwsrvszxdvufw.supabase.co`

2. **`VITE_SUPABASE_PUBLISHABLE_KEY`**
   - ✅ Must start with `VITE_`
   - ✅ Value should be your Supabase anon public key
   - ✅ Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long string)

---

## ⚠️ Common Mistakes

### Wrong Variable Names:

❌ `NEXT_PUBLIC_SUPABASE_URL` (for Next.js, not Vite)  
❌ `NEXT_PUBLIC_SUPABASE_ANON_KEY` (for Next.js, not Vite)  
❌ `SUPABASE_URL` (missing `VITE_` prefix)  
❌ `SUPABASE_ANON_KEY` (missing `VITE_` prefix)  
❌ `VITE_SUPABASE_ANON_KEY` (wrong name - should be `VITE_SUPABASE_PUBLISHABLE_KEY`)

### Correct Variable Names:

✅ `VITE_SUPABASE_URL`  
✅ `VITE_SUPABASE_PUBLISHABLE_KEY`

---

## ✅ Verification Steps

### Step 1: Check Variable Names

In Vercel Dashboard → Settings → Environment Variables:

- [ ] Look for `VITE_SUPABASE_URL` (exact name, with `VITE_` prefix)
- [ ] Look for `VITE_SUPABASE_PUBLISHABLE_KEY` (exact name, with `VITE_` prefix)

### Step 2: Check Environments

For each variable, verify:
- [ ] Enabled for **Production** ✅
- [ ] Enabled for **Preview** ✅
- [ ] Enabled for **Development** ✅

### Step 3: Check Values

Click the eye icon to reveal values:
- [ ] `VITE_SUPABASE_URL` = Your Supabase project URL (starts with `https://`)
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` = Your anon key (starts with `eyJhbGci...`)

---

## 🧪 Test After Verification

1. **Redeploy** (if you just added/updated variables):
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"
   - Uncheck "Use existing Build Cache"

2. **Visit your site** and check browser console (F12):
   ```javascript
   console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
   console.log('Key:', !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
   ```

3. **Expected Results:**
   - ✅ Should show your Supabase URL (not `undefined`)
   - ✅ Should show `true` for the key
   - ✅ No "Configuration Error" message

---

## 🆘 If Variables Are Wrong

### If you see `NEXT_PUBLIC_` variables:

These are for Next.js, not Vite. You need to:

1. **Add the correct `VITE_` variables:**
   - Copy the value from `NEXT_PUBLIC_SUPABASE_URL` → Use for `VITE_SUPABASE_URL`
   - Copy the value from `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Use for `VITE_SUPABASE_PUBLISHABLE_KEY`

2. **Or rename them:**
   - Delete the `NEXT_PUBLIC_` versions
   - Add new ones with `VITE_` prefix

### If variable names are slightly wrong:

- `VITE_SUPABASE_ANON_KEY` → Should be `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_KEY` → Should be `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PUBLIC_KEY` → Should be `VITE_SUPABASE_PUBLISHABLE_KEY`

**The exact name matters!** Your code looks for `VITE_SUPABASE_PUBLISHABLE_KEY`.

---

## 📋 Quick Checklist

- [ ] `VITE_SUPABASE_URL` exists (exact name)
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` exists (exact name)
- [ ] Both enabled for Production, Preview, Development
- [ ] Values are correct (Supabase URL and anon key)
- [ ] Redeployed after adding/updating
- [ ] Site works without errors

---

**If everything checks out, you're good to go!** 🚀

