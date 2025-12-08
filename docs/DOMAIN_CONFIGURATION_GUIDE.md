# Domain Configuration Guide for Vercel

## 🎯 Which Domain to Use

You have two domains:
- **`madisonstudio.io`** - Main domain (likely for marketing/landing page)
- **`app.madisonstudio.io`** - App subdomain (for the actual application)

## ✅ Use `app.madisonstudio.io` for Vercel

**For this application codebase, use: `app.madisonstudio.io`**

This is the standard pattern:
- `madisonstudio.io` → Marketing site / landing page
- `app.madisonstudio.io` → Your actual application (dashboard, onboarding, etc.)

---

## 🚀 Step-by-Step Configuration

### Step 1: Add Domain in Vercel

1. **Go to Vercel Dashboard:**
   - Navigate to your project
   - Go to **Settings** → **Domains**

2. **Add Custom Domain:**
   - Click **"Add Domain"**
   - Enter: `app.madisonstudio.io`
   - Click **"Add"**

3. **Configure DNS:**
   - Vercel will show you DNS records to add
   - Go to your domain registrar (where you bought `madisonstudio.io`)
   - Add a **CNAME record**:
     - **Type:** CNAME
     - **Name:** `app`
     - **Value:** `cname.vercel-dns.com` (or whatever Vercel shows)
     - **TTL:** 3600 (or default)

4. **Wait for DNS Propagation:**
   - Usually takes 5-60 minutes
   - Vercel will show "Valid Configuration" when ready

---

### Step 2: Update Environment Variables in Vercel

**Go to:** Vercel Dashboard → Your Project → Settings → Environment Variables

**Update `VITE_FRONTEND_URL`:**
- **Key:** `VITE_FRONTEND_URL`
- **Value:** `https://app.madisonstudio.io`
- **Environment:** Production, Preview, Development (check all ✅)
- Click **"Save"**

**Redeploy** your Vercel app after updating this variable.

---

### Step 3: Update Supabase Redirect URLs

**Go to:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/auth/url-configuration

**Update Site URL:**
```
https://app.madisonstudio.io
```

**Add/Update Redirect URLs:**
Add these URLs to the **Redirect URLs** list:
```
https://app.madisonstudio.io/**
https://app.madisonstudio.io/onboarding
https://app.madisonstudio.io/auth
https://app.madisonstudio.io/**
```

**Keep your Vercel preview URLs too:**
```
https://madison-studio-cursor-asala.vercel.app/**
https://madison-studio-cursor-asala-*.vercel.app/**
```

---

### Step 4: Update Supabase Edge Functions

**Update `FRONTEND_URL` environment variable in Supabase:**

**Go to:** Supabase Dashboard → Project Settings → Edge Functions → Environment Variables

**Add/Update:**
- **Key:** `FRONTEND_URL`
- **Value:** `https://app.madisonstudio.io`
- **Scope:** All Functions

**Functions that use `FRONTEND_URL`:**
- `scan-website` - For email report links
- `generate-report-pdf` - For PDF generation
- `send-report-email` - For email links

---

### Step 5: Update Code References (Optional)

The code already uses `VITE_FRONTEND_URL` environment variable, so it will automatically use the correct domain once you set it in Vercel.

However, you may want to update hardcoded references in:
- Email templates (currently show `madisonstudio.io` links)
- Documentation

---

## 📋 Quick Checklist

- [ ] Added `app.madisonstudio.io` domain in Vercel
- [ ] Configured DNS CNAME record
- [ ] Updated `VITE_FRONTEND_URL` in Vercel to `https://app.madisonstudio.io`
- [ ] Updated Supabase Site URL to `https://app.madisonstudio.io`
- [ ] Added `app.madisonstudio.io/**` to Supabase Redirect URLs
- [ ] Updated `FRONTEND_URL` in Supabase Edge Functions
- [ ] Redeployed Vercel app
- [ ] Tested authentication flow
- [ ] Tested email confirmation redirects

---

## 🔍 Testing

After configuration:

1. **Visit:** `https://app.madisonstudio.io`
2. **Test sign up:** Should redirect to `/onboarding` after email confirmation
3. **Test login:** Should work correctly
4. **Check email links:** Should point to `app.madisonstudio.io`

---

## 💡 Why `app.madisonstudio.io`?

**Benefits:**
- ✅ Clear separation: Marketing site vs. application
- ✅ Easy to scale: Can add more subdomains later (`api.madisonstudio.io`, `docs.madisonstudio.io`, etc.)
- ✅ Professional: Standard SaaS pattern
- ✅ Flexible: Can move app to different hosting without affecting main domain

**Common Pattern:**
- `company.com` → Marketing site
- `app.company.com` → Application
- `www.company.com` → Usually redirects to `company.com` or `app.company.com`

---

## 🆘 Troubleshooting

### Domain not working?
- Check DNS propagation: https://dnschecker.org
- Verify CNAME record is correct
- Wait up to 60 minutes for DNS propagation

### Authentication not working?
- Verify Supabase redirect URLs include `app.madisonstudio.io/**`
- Check `VITE_FRONTEND_URL` is set correctly in Vercel
- Redeploy Vercel after changing environment variables

### SSL Certificate issues?
- Vercel automatically provisions SSL certificates
- Wait 5-10 minutes after adding domain
- Check Vercel dashboard for SSL status










