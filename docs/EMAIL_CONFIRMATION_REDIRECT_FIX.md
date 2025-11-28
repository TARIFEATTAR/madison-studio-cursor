# Email Confirmation Redirect Fix

## Issue
After users click the email confirmation link, they're being redirected back to the Vercel URL root instead of `/onboarding`.

## Root Cause
Supabase needs to have the exact redirect URLs configured in its allowed list. The code was using `window.location.origin` which works, but Supabase must explicitly allow these URL patterns.

## Code Changes Made ✅

1. **Updated `src/pages/Auth.tsx`:**
   - Sign up now uses `VITE_FRONTEND_URL` environment variable if available
   - Falls back to `window.location.origin` for local development
   - Magic link handler updated with same logic
   - Better callback handling with logging

2. **Updated `env.example`:**
   - Added `VITE_FRONTEND_URL` variable

## Required Supabase Configuration 🔧

**Go to:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/auth/url-configuration

### Step 1: Update Site URL
Set **Site URL** to:
```
https://app.madisonstudio.io
```

**Note:** If you're using a Vercel preview URL for testing, you can use that temporarily, but for production use `app.madisonstudio.io`.

### Step 2: Add Redirect URLs
Add these URLs to the **Redirect URLs** list:
```
https://app.madisonstudio.io/**
https://app.madisonstudio.io/onboarding
https://app.madisonstudio.io/auth
```

**For Vercel preview deployments (keep these for testing):**
```
https://madison-studio-cursor-asala.vercel.app/**
https://madison-studio-cursor-asala-*.vercel.app/**
```

**Important:** The `/**` wildcard pattern allows all paths under that domain, which is what we need for email confirmation redirects.

### Step 3: Set Environment Variable in Vercel

**Go to:** Vercel Dashboard → Your Project → Settings → Environment Variables

Add/Update:
- **Key:** `VITE_FRONTEND_URL`
- **Value:** `https://app.madisonstudio.io` (or your Vercel preview URL for testing)
- **Environment:** Production, Preview, Development

Then **redeploy** your Vercel app.

## How It Works Now

1. **User signs up** → Code sets `emailRedirectTo: ${VITE_FRONTEND_URL}/onboarding`
2. **User clicks confirmation link** → Supabase validates the redirect URL is in allowed list
3. **Supabase redirects** → User lands on `/onboarding` page (not root)
4. **Auth callback handler** → Detects new user and ensures they're on onboarding

## Testing

1. Sign up with a new email
2. Check your email for confirmation link
3. Click the confirmation link
4. **Expected:** You should land on `/onboarding` page
5. **If wrong:** Check Supabase redirect URLs configuration

## Troubleshooting

### Still redirecting to root URL?
- ✅ Check Supabase redirect URLs include `/onboarding` path
- ✅ Verify `VITE_FRONTEND_URL` is set in Vercel
- ✅ Check browser console for redirect errors
- ✅ Verify Site URL in Supabase matches your Vercel domain

### Redirect URL mismatch error?
- The redirect URL in the email must exactly match one in Supabase's allowed list
- Use wildcard pattern `/**` to allow all paths
- Make sure no trailing slashes mismatch

