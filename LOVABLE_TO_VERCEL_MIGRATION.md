# 🔄 Clean Migration from Lovable to Vercel

## 🎯 The Problem

You have:
- **Lovable build** still running and using Google OAuth
- **Vercel deployment** (new) also trying to use Google OAuth
- **Same Supabase project** connected to both

This can cause conflicts with redirect URLs and OAuth flows.

---

## ✅ Solution: Clean Migration Strategy

You have **two options**:

### Option 1: Support Both Temporarily (Recommended for Testing)
Keep both working while you test, then remove Lovable URLs later.

### Option 2: Switch to Vercel Only (Clean Break)
Remove Lovable URLs immediately and use only Vercel.

---

## 🔧 Option 1: Support Both (Temporary)

### Step 1: Update Supabase Redirect URLs

**Go to:** Supabase Dashboard → Authentication → URL Configuration

**Add ALL these redirect URLs** (both Lovable and Vercel):

#### For Google Sign-In (Supabase Auth):
```
https://your-lovable-app.lovable.dev/auth
https://your-lovable-app.lovable.dev/auth/callback
https://madison-studio-cursor.vercel.app/auth
https://madison-studio-cursor.vercel.app/auth/callback
https://madison-studio-cursor-*.vercel.app/auth
https://madison-studio-cursor-*.vercel.app/auth/callback
```

**Or use wildcards:**
```
https://your-lovable-app.lovable.dev/**
https://madison-studio-cursor*.vercel.app/**
```

#### For Google Calendar OAuth (Edge Function):
The edge function uses `window.location.origin`, so it will automatically use the correct origin.

### Step 2: Update Google Cloud Console

**Go to:** https://console.cloud.google.com/ → Your Project → APIs & Services → Credentials

**Find your OAuth 2.0 Client ID** and add **all** authorized redirect URIs:

1. **Supabase callback** (for auth):
   ```
   https://likkskifwsrvszxdvufw.supabase.co/auth/v1/callback
   ```

2. **Edge function callback** (for Google Calendar):
   ```
   https://likkskifwsrvszxdvufw.supabase.co/functions/v1/google-calendar-oauth/callback
   ```

**Note:** Google OAuth doesn't need individual app URLs - it redirects to Supabase first, then Supabase redirects to your app.

### Step 3: Test Both Environments

1. **Test Lovable:**
   - Go to your Lovable app
   - Try Google sign-in
   - Should work ✅

2. **Test Vercel:**
   - Go to your Vercel app
   - Try Google sign-in
   - Should work ✅

### Step 4: Remove Lovable URLs (After Testing)

Once you've confirmed Vercel works and you're ready to fully migrate:

1. **Remove Lovable URLs from Supabase:**
   - Go to Supabase → Authentication → URL Configuration
   - Remove all `*.lovable.dev` URLs
   - Keep only Vercel URLs

2. **Update Site URL:**
   - Set Site URL to your Vercel domain
   - Example: `https://madison-studio-cursor.vercel.app`

---

## 🔧 Option 2: Switch to Vercel Only (Clean Break)

### Step 1: Update Supabase Redirect URLs

**Go to:** Supabase Dashboard → Authentication → URL Configuration

**Remove all Lovable URLs** and **add only Vercel URLs**:

#### Site URL:
```
https://madison-studio-cursor.vercel.app
```

#### Redirect URLs:
```
https://madison-studio-cursor.vercel.app/**
https://madison-studio-cursor.vercel.app
https://madison-studio-cursor-*.vercel.app/**
```

**Remove:**
- ❌ Any `*.lovable.dev` URLs
- ❌ Any old Lovable domains

### Step 2: Verify Google Cloud Console

**Go to:** Google Cloud Console → Credentials

**Make sure you have:**
- ✅ Supabase callback: `https://likkskifwsrvszxdvufw.supabase.co/auth/v1/callback`
- ✅ Edge function callback: `https://likkskifwsrvszxdvufw.supabase.co/functions/v1/google-calendar-oauth/callback`

**You don't need** individual app URLs in Google Cloud - Supabase handles the redirect.

### Step 3: Test Vercel

1. **Go to your Vercel app**
2. **Try Google sign-in**
3. **Should work** ✅

---

## 🔍 How It Works

### Google Sign-In Flow:

1. **User clicks "Sign in with Google"** on your app (Vercel or Lovable)
2. **App calls Supabase:** `supabase.auth.signInWithOAuth({ provider: 'google' })`
3. **Supabase redirects to Google** with callback: `https://your-supabase-project.supabase.co/auth/v1/callback`
4. **User signs in on Google**
5. **Google redirects back to Supabase** callback URL
6. **Supabase processes auth** and redirects to your app's `redirectTo` URL
7. **User lands back on your app** (authenticated)

**Key Point:** The redirect URL in your code (`window.location.origin`) determines where users land after auth. Supabase needs to have that URL in its allowed list.

---

## 📋 Migration Checklist

### Before Migration:
- [ ] Identify your Lovable app URL
- [ ] Identify your Vercel app URL
- [ ] Note current Supabase redirect URLs
- [ ] Note current Google OAuth redirect URIs

### During Migration (Option 1):
- [ ] Add Vercel URLs to Supabase redirect URLs
- [ ] Keep Lovable URLs temporarily
- [ ] Test both environments
- [ ] Verify Google sign-in works on both

### After Migration (Option 2):
- [ ] Remove Lovable URLs from Supabase
- [ ] Set Vercel URL as Site URL
- [ ] Test Vercel Google sign-in
- [ ] Verify everything works

### Final Cleanup:
- [ ] Remove Lovable URLs from Supabase
- [ ] Update any hardcoded Lovable URLs in code
- [ ] Test all authentication flows on Vercel
- [ ] Document new URLs

---

## 🆘 Troubleshooting

### "Redirect URI mismatch" Error

**Cause:** The redirect URL isn't in Supabase's allowed list.

**Fix:**
1. Go to Supabase → Authentication → URL Configuration
2. Add the exact URL that's failing
3. Use wildcards if needed: `https://your-domain.com/**`

### Google Sign-In Works on Lovable but Not Vercel

**Cause:** Vercel URL not in Supabase redirect URLs.

**Fix:**
1. Add Vercel URL to Supabase redirect URLs
2. Make sure Site URL is set correctly
3. Redeploy Vercel (if needed)

### Google Sign-In Redirects to Wrong Domain

**Cause:** `redirectTo` in code doesn't match Supabase allowed URLs.

**Fix:**
1. Check `src/pages/Auth.tsx` - `redirectTo: ${window.location.origin}/auth`
2. Make sure that URL is in Supabase redirect URLs
3. The code automatically uses the current domain, so it should work

### Both Apps Work But You Want to Disable Lovable

**Fix:**
1. Remove Lovable URLs from Supabase
2. Users on Lovable will get redirect errors (expected)
3. Only Vercel will work

---

## 🎯 Recommended Approach

**For a clean migration, I recommend:**

1. **Phase 1 (Now):** Add Vercel URLs alongside Lovable URLs
2. **Phase 2 (Test):** Test Vercel thoroughly for 1-2 days
3. **Phase 3 (Switch):** Remove Lovable URLs, set Vercel as primary
4. **Phase 4 (Cleanup):** Remove any Lovable references from code/docs

This gives you a safe rollback option if something goes wrong.

---

## 📝 Quick Reference

### Your Current Setup:
- **Supabase Project:** `likkskifwsrvszxdvufw`
- **Supabase URL:** `https://likkskifwsrvszxdvufw.supabase.co`
- **Vercel Domain:** `https://madison-studio-cursor.vercel.app` (or similar)
- **Lovable Domain:** `https://your-app.lovable.dev` (your actual domain)

### Supabase Redirect URLs Should Include:
```
https://madison-studio-cursor.vercel.app/**
https://madison-studio-cursor-*.vercel.app/**
```

### Google Cloud Console Should Have:
```
https://likkskifwsrvszxdvufw.supabase.co/auth/v1/callback
https://likkskifwsrvszxdvufw.supabase.co/functions/v1/google-calendar-oauth/callback
```

---

**Need help?** Share your specific Lovable URL and I can help you configure the exact redirect URLs needed!

