# 🚀 Vercel Deployment - Quick Start Checklist

## ⚡ 5-Minute Quick Deploy

### Step 1: Connect to Vercel (2 min)
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your `asala-studio` GitHub repository
4. Click "Import"

### Step 2: Add Environment Variables (2 min)
In Vercel → Settings → Environment Variables, add:

```
VITE_SUPABASE_URL=https://likkskifwsrvszxdvufw.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
```

**Get your keys from:**
- Supabase Dashboard → Project Settings → API
- Copy "Project URL" and "anon public" key

**Enable for:** Production, Preview, Development (check all ✅)

### Step 3: Deploy (1 min)
1. Click "Deploy" (or push a commit)
2. Wait for build to complete
3. Visit your site URL: `https://asala-studio-xxxxx.vercel.app`

---

## ✅ Pre-Deployment Checklist

Before deploying, make sure:

- [ ] Code is pushed to GitHub
- [ ] `vercel.json` exists in project root (✅ already created)
- [ ] You have your Supabase URL and anon key
- [ ] You have Stripe Price IDs (if using billing)

---

## 🔐 Required Environment Variables

**Minimum Required:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

**Optional (if using billing):**
- `VITE_STRIPE_PRICE_STARTER`
- `VITE_STRIPE_PRICE_PROFESSIONAL`
- `VITE_STRIPE_PRICE_ENTERPRISE`

---

## 🌐 Custom Domain (Optional)

After deployment:
1. Vercel Dashboard → Settings → Domains
2. Add your domain
3. Update DNS records as shown
4. Wait 5-60 minutes for DNS propagation

---

## 🐛 Common Issues

**"Missing Supabase environment variables"**
→ Check that variables are set in Vercel and enabled for Production

**404 on page refresh**
→ `vercel.json` should handle this automatically

**Edge functions not working**
→ Edge functions are on Supabase, not Vercel. Verify `VITE_SUPABASE_URL` is correct.

---

## 📚 Full Guide

See `VERCEL_DEPLOYMENT_GUIDE.md` for detailed instructions.

---

**Estimated Time:** 5-10 minutes  
**Difficulty:** Easy

