# Vercel Deployment Guide for Madison Studios

This guide will walk you through deploying your Madison Studios site from Lovable to Vercel.

## 📋 Prerequisites

- [ ] Vercel account (sign up at https://vercel.com)
- [ ] GitHub repository with your code (already done ✅)
- [ ] Supabase project URL and keys
- [ ] Stripe Price IDs (if using billing)

---

## 🚀 Step 1: Connect Your GitHub Repository to Vercel

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Sign in or create an account

2. **Import Your Project:**
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Find and select your `asala-studio` repository
   - Click "Import"

3. **Configure Project Settings:**
   - **Framework Preset:** Vite (should auto-detect)
   - **Root Directory:** `./` (leave as default)
   - **Build Command:** `npm run build` (auto-filled)
   - **Output Directory:** `dist` (auto-filled)
   - **Install Command:** `npm install` (auto-filled)

---

## 🔐 Step 2: Set Environment Variables in Vercel

**Critical:** You must add all environment variables that start with `VITE_` to Vercel.

### Required Environment Variables:

1. **In Vercel Dashboard:**
   - Go to your project → Settings → Environment Variables
   - Add each variable below:

#### Supabase Configuration:
```
VITE_SUPABASE_URL=https://likkskifwsrvszxdvufw.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
```

**To get your Supabase keys:**
- Go to: https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/settings/api
- Copy the "Project URL" → `VITE_SUPABASE_URL` (should be `https://likkskifwsrvszxdvufw.supabase.co`)
- Copy the "anon public" key → `VITE_SUPABASE_PUBLISHABLE_KEY` (starts with `eyJhbGci...`)

**Note:** If you have a different Supabase project, check your `.env` file for the correct URL.

#### Stripe Configuration (if using billing):
```
VITE_STRIPE_PRICE_STARTER=price_xxxxx
VITE_STRIPE_PRICE_PROFESSIONAL=price_xxxxx
VITE_STRIPE_PRICE_ENTERPRISE=price_xxxxx
```

**To get your Stripe Price IDs:**
- Go to: Stripe Dashboard → Products → Copy Price IDs
- Or check your `.env` file if you have them locally

### How to Add Variables in Vercel:

1. Click "Add New" in Environment Variables
2. Enter the **Key** (e.g., `VITE_SUPABASE_URL`)
3. Enter the **Value** (e.g., `https://likkskifwsrvszxdvufw.supabase.co`)
4. Select environments: **Production**, **Preview**, and **Development** (check all)
5. Click "Save"
6. Repeat for each variable

---

## 🎯 Step 3: Deploy

1. **After setting environment variables:**
   - Go to the "Deployments" tab
   - Click "Redeploy" on the latest deployment (or push a new commit)
   - Vercel will automatically rebuild with your environment variables

2. **Monitor the Build:**
   - Watch the build logs in real-time
   - Check for any errors (should be minimal since we've tested locally)

3. **Verify Deployment:**
   - Once deployed, you'll get a URL like: `https://asala-studio-xxxxx.vercel.app`
   - Click the URL to test your site

---

## 🌐 Step 4: Configure Custom Domain (Optional)

If you want to use your own domain instead of the Vercel URL:

1. **In Vercel Dashboard:**
   - Go to your project → Settings → Domains
   - Click "Add Domain"
   - Enter your domain (e.g., `madisonstudios.com`)

2. **Configure DNS:**
   - Vercel will show you DNS records to add
   - Add them to your domain registrar (GoDaddy, Namecheap, etc.)
   - Wait for DNS propagation (5-60 minutes)

3. **SSL Certificate:**
   - Vercel automatically provisions SSL certificates
   - No additional configuration needed

---

## ✅ Step 5: Post-Deployment Checklist

After deployment, verify these items:

### Frontend Checks:
- [ ] Site loads without errors
- [ ] Authentication works (login/signup)
- [ ] Supabase connection is working
- [ ] All pages load correctly
- [ ] Images and assets load properly
- [ ] Edge functions are accessible

### Environment Variable Verification:
- [ ] Open browser console on your deployed site
- [ ] Run: `console.log(import.meta.env.VITE_SUPABASE_URL)`
- [ ] Should show your Supabase URL (not undefined)

### Edge Functions:
- [ ] Think Mode chat works
- [ ] Image generation works
- [ ] Content generation works
- [ ] All AI features function correctly

### Billing (if applicable):
- [ ] Stripe checkout works
- [ ] Subscription management works
- [ ] Webhooks are configured (if using Stripe)

---

## 🔧 Troubleshooting

### Issue: "Missing Supabase environment variables" error
**Fix:**
- Double-check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are set in Vercel
- Make sure they're enabled for **Production** environment
- Redeploy after adding variables

### Issue: 404 errors on page refresh
**Fix:**
- The `vercel.json` file should handle this with rewrites
- If not working, verify `vercel.json` is in the root directory
- Check that the rewrite rule is correct

### Issue: Edge functions return 404
**Fix:**
- Edge functions are hosted on Supabase, not Vercel
- Verify your `VITE_SUPABASE_URL` is correct
- Check that edge functions are deployed to Supabase

### Issue: Build fails
**Fix:**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version (Vercel auto-detects, but you can set it in `package.json`)

### Issue: Slow initial load
**Fix:**
- Vercel automatically optimizes assets
- Check that large images are optimized
- Consider using Vercel's Image Optimization

---

## 📊 What's Different from Lovable?

| Feature | Lovable | Vercel |
|---------|---------|--------|
| **Hosting** | Managed by Lovable | Self-hosted on Vercel |
| **Domain** | `*.lovable.dev` | Custom domain or `*.vercel.app` |
| **Environment Variables** | Set in Lovable dashboard | Set in Vercel dashboard |
| **Deployments** | Automatic on push | Automatic on push (GitHub integration) |
| **Edge Functions** | Still on Supabase | Still on Supabase (no change) |
| **Build Process** | Managed by Lovable | Managed by Vercel (uses `vite build`) |

---

## 🎉 Next Steps After Deployment

1. **Update any hardcoded URLs:**
   - Search for `localhost:8080` or Lovable URLs
   - Replace with your Vercel domain

2. **Update Supabase Redirect URLs:**
   - Go to: Supabase Dashboard → Authentication → URL Configuration
   - Add your Vercel domain to "Site URL" and "Redirect URLs"

3. **Update Stripe Webhooks (if using):**
   - Go to: Stripe Dashboard → Developers → Webhooks
   - Update webhook endpoints to use your Vercel domain

4. **Set up monitoring:**
   - Consider adding error tracking (Sentry, LogRocket, etc.)
   - Monitor Vercel analytics for performance

5. **Enable Preview Deployments:**
   - Vercel automatically creates preview deployments for PRs
   - Test changes before merging to main

---

## 📝 Quick Reference Commands

### Deploy manually (if needed):
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Check environment variables:
```bash
# List all env vars
vercel env ls

# Pull env vars locally (creates .env.local)
vercel env pull .env.local
```

---

## 🆘 Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **Vite Deployment:** https://vitejs.dev/guide/static-deploy.html#vercel
- **Supabase Docs:** https://supabase.com/docs

---

## ✅ Deployment Checklist Summary

- [ ] Vercel account created
- [ ] GitHub repository connected
- [ ] `vercel.json` file created (already done ✅)
- [ ] Environment variables set in Vercel
- [ ] First deployment successful
- [ ] Custom domain configured (optional)
- [ ] All features tested
- [ ] Supabase redirect URLs updated
- [ ] Stripe webhooks updated (if applicable)

**Estimated Time:** 15-30 minutes

**Difficulty:** Easy (mostly configuration)

---

Good luck with your deployment! 🚀

