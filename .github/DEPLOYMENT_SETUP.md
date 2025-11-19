# GitHub Actions Deployment Setup

This guide will help you set up automatic deployment from GitHub to keep your Supabase Edge Functions and frontend up to date.

## 🎯 What This Does

When you push to the `main` branch, GitHub Actions will automatically:
1. **Deploy changed Supabase Edge Functions** - Only functions that were modified
2. **Build the frontend** - Creates production-ready build artifacts

## 📋 Prerequisites

1. GitHub repository with your code
2. Supabase project access
3. GitHub repository secrets configured (see below)

## 🔐 Step 1: Get Your Supabase Access Token

1. Go to: https://supabase.com/dashboard/account/tokens
2. Click **"Generate new token"**
3. Give it a name (e.g., "GitHub Actions Deployment")
4. Copy the token (starts with `sbp_...`)

## 🔑 Step 2: Add GitHub Secrets

1. Go to your GitHub repository
2. Navigate to: **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add these secrets:

### Required Secrets:

| Secret Name | Value | Where to Get It |
|------------|-------|----------------|
| `SUPABASE_ACCESS_TOKEN` | Your Supabase token (starts with `sbp_...`) | https://supabase.com/dashboard/account/tokens |
| `VITE_SUPABASE_URL` | `https://likkskifwsrvszxdvufw.supabase.co` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your anon/public key | Supabase Dashboard → Settings → API |

### How to Get VITE_SUPABASE_PUBLISHABLE_KEY:

1. Go to: https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/settings/api
2. Find the **"anon public"** key (starts with `eyJhbGci...`)
3. Copy the entire key

## 🚀 Step 3: Choose Your Workflow

You have two workflow files:

### Option A: `deploy.yml` (Simple - Deploys Everything)
- Deploys ALL edge functions on every push
- Always builds the frontend
- **Use this if:** You want simplicity and don't mind deploying everything

### Option B: `deploy-optimized.yml` (Smart - Only Changed Files)
- Only deploys functions that changed
- Only builds frontend if UI code changed
- **Use this if:** You want faster deployments and only deploy what changed

**Recommendation:** Start with `deploy-optimized.yml` for better performance.

## 📝 Step 4: Enable the Workflow

1. Make sure your workflow file is committed to the `main` branch
2. Push to GitHub:
   ```bash
   git add .github/workflows/deploy-optimized.yml
   git commit -m "Add GitHub Actions deployment workflow"
   git push origin main
   ```
3. Go to your GitHub repository → **Actions** tab
4. You should see the workflow run automatically!

## ✅ Step 5: Verify It Works

1. Make a small change to an edge function (e.g., add a comment)
2. Commit and push:
   ```bash
   git add supabase/functions/repurpose-content/index.ts
   git commit -m "Test deployment"
   git push origin main
   ```
3. Go to **Actions** tab in GitHub
4. Watch the workflow run
5. Check Supabase Dashboard to verify the function was updated

## 🔍 Monitoring Deployments

- **View workflow runs:** GitHub → Actions tab
- **Check function status:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions
- **View logs:** Click on any workflow run to see detailed logs

## 🐛 Troubleshooting

### "Authentication failed" error
- Check that `SUPABASE_ACCESS_TOKEN` is set correctly
- Make sure the token hasn't expired
- Regenerate the token if needed

### "Function deployment failed"
- Check the workflow logs for specific error messages
- Verify the function has a valid `index.ts` file
- Make sure the function name matches the directory name

### "Build failed"
- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are set
- Verify the values are correct (no extra spaces)
- Check the build logs for specific errors

## 🎉 You're Done!

Now every time you push to `main`, your changes will automatically deploy. No more manual deployments needed!

---

**Note:** If you're using a hosting service like Vercel or Netlify for your frontend, you can connect your GitHub repo directly to those services for automatic frontend deployment. The build artifacts from this workflow can be used for manual deployments or other CI/CD pipelines.




