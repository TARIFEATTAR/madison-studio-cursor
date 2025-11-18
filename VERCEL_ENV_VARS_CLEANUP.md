# 🔧 Vercel Environment Variables - What You Actually Need

## ⚠️ The Issue

Vercel auto-detected Supabase and added many variables, but your **Vite app needs specific `VITE_` prefixed variables**.

---

## ✅ What Your App Actually Needs

Your React/Vite app only needs **2 variables**:

### Required Variables:

1. **`VITE_SUPABASE_URL`**
   - **Value:** Your Supabase project URL
   - **Example:** `https://likkskifwsrvszxdvufw.supabase.co`
   - **Where to get it:** Supabase Dashboard → Settings → API → Project URL

2. **`VITE_SUPABASE_PUBLISHABLE_KEY`**
   - **Value:** Your Supabase anon public key
   - **Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long string)
   - **Where to get it:** Supabase Dashboard → Settings → API → anon public key

**Important:** These MUST start with `VITE_` for Vite to expose them to your frontend code.

---

## ❌ What You Can Ignore/Remove

The variables Vercel auto-added are for **backend/server-side** use, not for your frontend:

- `POSTGRES_URL` ❌ (not needed for frontend)
- `POSTGRES_PRISMA_URL` ❌ (not needed for frontend)
- `POSTGRES_URL_NON_POOLING` ❌ (not needed for frontend)
- `POSTGRES_USER` ❌ (not needed for frontend)
- `POSTGRES_HOST` ❌ (not needed for frontend)
- `POSTGRES_PASSWORD` ❌ (not needed for frontend)
- `POSTGRES_DATABASE` ❌ (not needed for frontend)
- `SUPABASE_ANON_KEY` ❌ (wrong name - needs `VITE_` prefix)
- `SUPABASE_URL` ❌ (wrong name - needs `VITE_` prefix)
- `SUPABASE_SERVICE_ROLE_KEY` ❌ (not needed for frontend, and should never be exposed)
- `SUPABASE_JWT_SECRET` ❌ (not needed for frontend)

**You can safely delete or ignore these** - they won't hurt anything, but they're not what your app needs.

---

## 🎯 What to Do

### Option 1: Add the Correct Variables (Recommended)

1. **In Vercel Dashboard:**
   - Go to Settings → Environment Variables
   - Click **"Add New"**

2. **Add `VITE_SUPABASE_URL`:**
   - **Key:** `VITE_SUPABASE_URL`
   - **Value:** Copy from `SUPABASE_URL` (or get from Supabase Dashboard)
   - **Environments:** ✅ Production, ✅ Preview, ✅ Development
   - Click **"Save"**

3. **Add `VITE_SUPABASE_PUBLISHABLE_KEY`:**
   - **Key:** `VITE_SUPABASE_PUBLISHABLE_KEY`
   - **Value:** Copy from `SUPABASE_ANON_KEY` (or get from Supabase Dashboard)
   - **Environments:** ✅ Production, ✅ Preview, ✅ Development
   - Click **"Save"**

4. **Redeploy:**
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"
   - Uncheck "Use existing Build Cache"

### Option 2: Clean Up (Optional)

You can delete the unused variables to keep things clean:

1. Click the "..." menu next to each unused variable
2. Click "Delete"
3. Confirm deletion

**Note:** This is optional - leaving them won't cause issues, but it's cleaner to remove them.

---

## 🔍 How to Get the Correct Values

### From Supabase Dashboard:

1. **Go to:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/settings/api

2. **Copy these values:**
   - **Project URL** → Use for `VITE_SUPABASE_URL`
   - **anon public key** → Use for `VITE_SUPABASE_PUBLISHABLE_KEY`

### Or Copy from Existing Variables:

If the auto-added variables have the right values, you can copy them:

- `SUPABASE_URL` → Copy value to `VITE_SUPABASE_URL`
- `SUPABASE_ANON_KEY` → Copy value to `VITE_SUPABASE_PUBLISHABLE_KEY`

**Just remember to add the `VITE_` prefix!**

---

## ✅ Quick Checklist

- [ ] `VITE_SUPABASE_URL` is set (with `VITE_` prefix)
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` is set (with `VITE_` prefix)
- [ ] Both enabled for Production, Preview, and Development
- [ ] Redeployed after adding variables
- [ ] Site works without "Configuration Error"

---

## 🆘 Why This Matters

**Vite only exposes environment variables that start with `VITE_`** to your frontend code.

Your code uses:
```javascript
import.meta.env.VITE_SUPABASE_URL
import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
```

So if the variables are named `SUPABASE_URL` or `SUPABASE_ANON_KEY` (without `VITE_`), your app won't be able to access them, and you'll see the "Configuration Error" message.

---

## 📊 Summary

**What you have:** 11 auto-detected variables (mostly unused)  
**What you need:** 2 variables with `VITE_` prefix  
**Action:** Add the 2 correct variables, then redeploy

---

**Estimated Time:** 3-5 minutes  
**Difficulty:** Easy

