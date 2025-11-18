# 🔐 Add Environment Variables to Vercel - Quick Guide

Your build succeeded! ✅ But the site needs environment variables to connect to Supabase.

---

## 🎯 Step-by-Step: Add Environment Variables

### Step 1: Go to Vercel Project Settings (1 min)

1. **In Vercel Dashboard:**
   - Click on your `madison-studio-cursor` project
   - Click **"Settings"** (in the top navigation)
   - Click **"Environment Variables"** (in the left sidebar)

### Step 2: Get Your Supabase Keys (2 min)

**Open a new tab and go to:**
- https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/settings/api

**You'll see:**
- **Project URL:** `https://likkskifwsrvszxdvufw.supabase.co` (or similar)
- **anon public key:** A long string starting with `eyJhbGci...`

**Copy both values** - you'll need them in the next step.

---

### Step 3: Add Environment Variables in Vercel (3 min)

**Back in Vercel, add these two variables:**

#### Variable 1: VITE_SUPABASE_URL

1. Click **"Add New"** button
2. **Key:** `VITE_SUPABASE_URL`
3. **Value:** Paste your Supabase Project URL (e.g., `https://likkskifwsrvszxdvufw.supabase.co`)
4. **Environments:** Check ALL three boxes:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
5. Click **"Save"**

#### Variable 2: VITE_SUPABASE_PUBLISHABLE_KEY

1. Click **"Add New"** button again
2. **Key:** `VITE_SUPABASE_PUBLISHABLE_KEY`
3. **Value:** Paste your Supabase anon public key (starts with `eyJhbGci...`)
4. **Environments:** Check ALL three boxes:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click **"Save"**

---

### Step 4: Redeploy (2 min)

**Important:** After adding environment variables, you MUST redeploy!

1. Go to **"Deployments"** tab
2. Find the latest deployment
3. Click the **"..."** menu (three dots)
4. Click **"Redeploy"**
5. **Uncheck** "Use existing Build Cache" (to ensure fresh build with new env vars)
6. Click **"Redeploy"**

---

### Step 5: Wait and Verify (2 min)

1. **Wait 2-5 minutes** for the deployment to complete
2. **Visit your site URL** (e.g., `https://madison-studio-cursor.vercel.app`)
3. **The error should be gone!** ✅
4. **Test the site:**
   - Try logging in
   - Navigate around
   - Verify everything works

---

## ✅ Quick Checklist

- [ ] Opened Supabase Dashboard → Settings → API
- [ ] Copied Project URL
- [ ] Copied anon public key
- [ ] Added `VITE_SUPABASE_URL` to Vercel
- [ ] Added `VITE_SUPABASE_PUBLISHABLE_KEY` to Vercel
- [ ] Enabled variables for Production, Preview, and Development
- [ ] Redeployed the project
- [ ] Verified site works

---

## 🎯 Direct Links

**Vercel Environment Variables:**
- Go to your project → Settings → Environment Variables
- Or: https://vercel.com/dashboard → Select project → Settings → Environment Variables

**Supabase API Settings:**
- https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/settings/api

---

## 🆘 Troubleshooting

### "Still showing configuration error after redeploy"
- **Wait a few more minutes** - sometimes it takes time to propagate
- **Hard refresh** your browser (Cmd+Shift+R or Ctrl+Shift+R)
- **Check the deployment logs** to ensure the build completed successfully

### "Can't find Supabase keys"
- Make sure you're logged into the correct Supabase account
- Verify the project ID is correct: `likkskifwsrvszxdvufw`
- Check that you're copying the **anon public** key (not the service_role key)

### "Variables are set but still not working"
- Verify variables are enabled for **Production** environment
- Make sure variable names are EXACTLY: `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
- Check for extra spaces or quotes in the values
- Redeploy after making changes

---

**Estimated Time:** 5-10 minutes  
**Difficulty:** Easy

Once you add these variables and redeploy, your site should work perfectly! 🚀

