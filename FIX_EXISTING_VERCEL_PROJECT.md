# 🔧 Fix Existing Vercel Project - Step-by-Step Guide

Your project `madison-studio-cursor` is already in Vercel but has deployment failures. Let's fix it properly without breaking anything.

---

## 🎯 Step 1: Check What's Failing (2 min)

1. **In Vercel Dashboard:**
   - Click on the `madison-studio-cursor` project
   - Go to the **"Deployments"** tab
   - Click on the **most recent failed deployment** (the one with the red ❌)
   - Scroll down to see the **build logs**

2. **Look for these common errors:**
   - ❌ "Missing environment variable: VITE_SUPABASE_URL"
   - ❌ "Build failed" or "Command failed"
   - ❌ "Module not found" errors
   - ❌ "Missing dependency" errors

**Take note of the exact error message** - this tells us what to fix.

---

## 🔐 Step 2: Verify Environment Variables (5 min)

**This is the #1 cause of deployment failures!**

1. **In Vercel Dashboard:**
   - Go to your project → **Settings** → **Environment Variables**
   - Check if these variables exist:

### Required Variables:
```
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

### Optional (if using billing):
```
VITE_STRIPE_PRICE_STARTER
VITE_STRIPE_PRICE_PROFESSIONAL
VITE_STRIPE_PRICE_ENTERPRISE
```

2. **If variables are missing or incorrect:**

   **To get your Supabase keys:**
   - Go to: https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/settings/api
   - Copy the **"Project URL"** → This is your `VITE_SUPABASE_URL`
   - Copy the **"anon public" key** → This is your `VITE_SUPABASE_PUBLISHABLE_KEY`

   **To add/update in Vercel:**
   - Click **"Add New"** (or edit existing)
   - **Key:** `VITE_SUPABASE_URL`
   - **Value:** `https://likkskifwsrvszxdvufw.supabase.co` (or your actual URL)
   - **Environments:** Check ✅ **Production**, ✅ **Preview**, ✅ **Development**
   - Click **"Save"**
   - Repeat for `VITE_SUPABASE_PUBLISHABLE_KEY`

3. **Important:** After adding/updating environment variables, you MUST redeploy!

---

## ⚙️ Step 3: Verify Project Settings (2 min)

1. **In Vercel Dashboard:**
   - Go to **Settings** → **General**
   - Verify these settings:

   - **Framework Preset:** Should be `Vite` (or auto-detected)
   - **Root Directory:** Should be `./` (leave empty or set to `./`)
   - **Build Command:** Should be `npm run build`
   - **Output Directory:** Should be `dist`
   - **Install Command:** Should be `npm install`

2. **If settings are wrong:**
   - Click **"Edit"** next to each setting
   - Update to match the values above
   - Click **"Save"**

---

## 📁 Step 4: Verify vercel.json is in Repository (1 min)

1. **Check that `vercel.json` is committed to GitHub:**
   - Go to your GitHub repository
   - Look for `vercel.json` in the root directory
   - If it's missing, we need to commit it

2. **If `vercel.json` is missing from GitHub:**
   ```bash
   # In your terminal, from project root:
   git add vercel.json
   git commit -m "Add vercel.json configuration"
   git push origin main
   ```

---

## 🚀 Step 5: Trigger a New Deployment (2 min)

After fixing environment variables and settings:

1. **Option A: Redeploy the latest commit**
   - Go to **Deployments** tab
   - Find the latest deployment (even if failed)
   - Click the **"..."** menu (three dots)
   - Click **"Redeploy"**
   - Select **"Use existing Build Cache"** = OFF (to ensure fresh build)
   - Click **"Redeploy"**

2. **Option B: Push a new commit** (if you made changes)
   ```bash
   git add .
   git commit -m "Fix Vercel deployment configuration"
   git push origin main
   ```
   - Vercel will automatically trigger a new deployment

3. **Watch the deployment:**
   - Click on the new deployment
   - Watch the build logs in real-time
   - Wait for it to complete (usually 2-5 minutes)

---

## ✅ Step 6: Verify Deployment Success (3 min)

1. **Check deployment status:**
   - Should show ✅ **"Ready"** (green checkmark)
   - Should have a URL like: `https://madison-studio-cursor.vercel.app`

2. **Test the deployed site:**
   - Click the deployment URL
   - Open browser console (F12)
   - Check for errors
   - Verify the site loads correctly

3. **Verify environment variables are working:**
   - In browser console, run:
     ```javascript
     console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
     console.log('Has Key:', !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
     ```
   - Should show your Supabase URL (not `undefined`)
   - Should show `true` for the key

---

## 🔄 Step 7: Update Supabase Redirect URLs (3 min)

**Important:** After successful deployment, update Supabase to allow your Vercel domain.

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/auth/url-configuration

2. **Update these fields:**
   - **Site URL:** `https://madison-studio-cursor.vercel.app` (your Vercel URL)
   - **Redirect URLs:** Add:
     - `https://madison-studio-cursor.vercel.app/**`
     - `https://madison-studio-cursor.vercel.app`
     - `https://madison-studio-cursor-*.vercel.app/**` (for preview deployments)

3. **Click "Save"**

---

## 🐛 Common Issues & Fixes

### Issue: "Build failed - Missing environment variable"
**Fix:**
- Go to Settings → Environment Variables
- Add the missing variable
- Make sure it's enabled for **Production**
- Redeploy

### Issue: "Build failed - Command failed"
**Fix:**
- Check the build logs for the exact error
- Common causes:
  - Missing dependencies → Check `package.json`
  - TypeScript errors → Fix the errors locally first
  - Build command wrong → Verify in Settings → General

### Issue: "404 on page refresh"
**Fix:**
- Verify `vercel.json` exists in the repository
- Check that it has the rewrite rule for SPA routing
- Redeploy after adding `vercel.json`

### Issue: "Module not found"
**Fix:**
- Check that all dependencies are in `package.json`
- Verify `node_modules` is in `.gitignore` (it should be)
- Vercel will install dependencies automatically

### Issue: "Deployment succeeds but site shows errors"
**Fix:**
- Check browser console for errors
- Verify environment variables are set correctly
- Check that Supabase redirect URLs are updated
- Verify edge functions are deployed to Supabase

---

## 📋 Quick Checklist

Before redeploying, verify:

- [ ] Environment variables are set in Vercel
- [ ] Environment variables are enabled for Production
- [ ] Project settings are correct (Framework: Vite, Output: dist)
- [ ] `vercel.json` is in the repository
- [ ] Latest code is pushed to GitHub
- [ ] Build logs checked for specific errors

After deployment:

- [ ] Deployment shows ✅ "Ready"
- [ ] Site loads without errors
- [ ] Browser console shows no critical errors
- [ ] Environment variables are accessible
- [ ] Supabase redirect URLs are updated

---

## 🎯 Most Likely Issue

Based on the deployment failures, the **most common cause** is:

**Missing or incorrect environment variables**

**Quick fix:**
1. Go to Settings → Environment Variables
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
3. Enable for Production, Preview, and Development
4. Redeploy

---

## 🆘 Still Having Issues?

If deployment still fails after following these steps:

1. **Check the build logs** - They'll tell you exactly what's wrong
2. **Share the error message** - I can help diagnose specific issues
3. **Try building locally first:**
   ```bash
   npm install
   npm run build
   ```
   - If this fails locally, fix the errors first
   - Then push and redeploy

---

## ✅ Success Indicators

You'll know it's working when:

- ✅ Deployment shows "Ready" (green)
- ✅ Site loads at `https://madison-studio-cursor.vercel.app`
- ✅ No errors in browser console
- ✅ Authentication works
- ✅ All features function correctly

---

**Estimated Time:** 15-20 minutes  
**Difficulty:** Easy (mostly configuration)

Good luck! 🚀

