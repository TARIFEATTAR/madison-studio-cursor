# ✅ Update Configuration to Use app.madisonstudio.io

## Current Status
You already have `app.madisonstudio.io` configured in Vercel! ✅

Now we need to update all configurations to use this domain instead of the Vercel preview URL.

---

## 🔧 Required Updates

### 1. Update Vercel Environment Variable

**Go to:** Vercel Dashboard → Your Project → Settings → Environment Variables

**Update `VITE_FRONTEND_URL`:**
- **Key:** `VITE_FRONTEND_URL`
- **Value:** `https://app.madisonstudio.io`
- **Environment:** Production, Preview, Development (check all ✅)
- Click **"Save"**

**Then redeploy** your Vercel app.

---

### 2. Update Supabase Site URL & Redirect URLs

**Go to:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/auth/url-configuration

**Update Site URL:**
```
https://app.madisonstudio.io
```

**Update Redirect URLs:**
Make sure these are in the list:
```
https://app.madisonstudio.io/**
https://app.madisonstudio.io/onboarding
https://app.madisonstudio.io/auth
```

**Keep Vercel preview URLs for testing:**
```
https://madison-studio-cursor-asala.vercel.app/**
https://madison-studio-cursor-*.vercel.app/**
```

---

### 3. Update Supabase Edge Functions Environment Variable

**Go to:** Supabase Dashboard → Project Settings → Edge Functions → Environment Variables

**Update `FRONTEND_URL`:**
- **Key:** `FRONTEND_URL`
- **Value:** `https://app.madisonstudio.io`
- **Scope:** All Functions

**Functions that use this:**
- `scan-website` - For email report links
- `generate-report-pdf` - For PDF generation URLs
- `send-report-email` - For email links

---

## ✅ Quick Checklist

- [ ] Updated `VITE_FRONTEND_URL` in Vercel to `https://app.madisonstudio.io`
- [ ] Redeployed Vercel app
- [ ] Updated Supabase Site URL to `https://app.madisonstudio.io`
- [ ] Added `app.madisonstudio.io/**` to Supabase Redirect URLs
- [ ] Updated `FRONTEND_URL` in Supabase Edge Functions
- [ ] Tested email confirmation redirects
- [ ] Tested brand report links in emails

---

## 🧪 Testing

After updates:

1. **Sign up with a new email**
2. **Click confirmation link** → Should redirect to `app.madisonstudio.io/onboarding`
3. **Check brand scan email** → Report links should point to `app.madisonstudio.io/reports/...`
4. **Test PDF generation** → Should use `app.madisonstudio.io` URLs

---

## 📝 Notes

- The Vercel preview URL (`madison-studio-cursor-asala.vercel.app`) will still work for testing
- Keep both domains in Supabase redirect URLs for flexibility
- Production should use `app.madisonstudio.io` for all user-facing links




