# Quick Start: GitHub Actions Deployment

## 🚀 3-Step Setup

### 1. Get Supabase Token
- Go to: https://supabase.com/dashboard/account/tokens
- Click "Generate new token"
- Copy the token (starts with `sbp_...`)

### 2. Add GitHub Secrets
Go to: **Your Repo → Settings → Secrets and variables → Actions**

Add these 3 secrets:
- `SUPABASE_ACCESS_TOKEN` = Your token from step 1
- `VITE_SUPABASE_URL` = `https://likkskifwsrvszxdvufw.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY` = Get from Supabase Dashboard → Settings → API → "anon public" key

### 3. Push to GitHub
```bash
git add .github/workflows/
git commit -m "Add automatic deployment"
git push origin main
```

**That's it!** 🎉 

Every push to `main` will now automatically deploy your edge functions and build your frontend.

---

## 📋 Which Workflow to Use?

- **`deploy-optimized.yml`** ← **Recommended** (only deploys what changed)
- `deploy.yml` (deploys everything every time)

The optimized workflow is already set up and ready to use!




