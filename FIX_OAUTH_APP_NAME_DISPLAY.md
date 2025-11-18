# 🔧 Fix OAuth to Show "Madison Studio" Instead of Supabase Domain

## 🎯 The Problem

Google OAuth shows: "You're signing back in to **likkskifwsrvszxdvufw.supabase.co**"

You want it to show: "You're signing back in to **Madison Studio**" or "madisonstudio.io"

---

## ✅ Solution: Configure OAuth Consent Screen Properly

The issue is that Google shows the redirect URI domain when the app name isn't properly configured or the app isn't published.

---

## 🚀 Step-by-Step Fix

### Step 1: Verify App Name is Set

1. **Go to:** Google Cloud Console → OAuth consent screen
2. **Check "App name"** field at the top
3. **Make sure it says:** `Madison Studio`
4. **If not, update it** and save

### Step 2: Publish Your App (CRITICAL)

**This is likely the main issue!**

1. **Scroll to the bottom** of the OAuth consent screen page
2. **Look for "Publishing status"** section
3. **If it says "Testing":**
   - Click **"PUBLISH APP"** button
   - Confirm publishing
   - This makes your app public and helps Google display the app name correctly

**Why this matters:** Unpublished/testing apps often show the redirect URI domain instead of the app name.

### Step 3: Set App Domain

1. **Find "App domain"** section (usually near the top)
2. **Set to:** `madisonstudio.io`
3. **Save**

### Step 4: Set Homepage URL

1. **Find "Application home page"** or "Homepage URL"**
2. **Set to:** `https://madisonstudio.io` or your Vercel URL
3. **Save**

### Step 5: Verify Authorized Domains

1. **Make sure** `madisonstudio.io` is in authorized domains
2. **Keep** `likkskifwsrvszxdvufw.supabase.co` (required for Supabase)

---

## 🔍 Why Other Companies Show Their Name

Companies that show their own name typically:

1. **Handle OAuth on their own domain** (not through Supabase)
   - Example: `auth.company.com` handles OAuth
   - Google shows "company.com" in the consent screen

2. **Have published OAuth apps** with proper configuration
   - App name is set correctly
   - App is published (not in testing mode)
   - App domain is configured

3. **Use custom OAuth servers** instead of third-party services

---

## ⚠️ Supabase Limitation

**Important:** When using Supabase for OAuth, Google may still show the Supabase redirect domain in some parts of the flow because:

- The OAuth callback goes to Supabase first
- Google sees the redirect URI as the Supabase domain
- This is a known limitation of using Supabase OAuth

**However**, publishing your app and setting the app name correctly should help Google display "Madison Studio" in most places.

---

## 🎯 What to Expect After Fixing

**After publishing and configuring:**

- ✅ App name "Madison Studio" should show in most places
- ✅ Some screens may still show Supabase domain (this is normal)
- ✅ Users will see "Madison Studio" as the app name
- ✅ The consent screen will be more branded

---

## 📋 Quick Checklist

- [ ] App name set to "Madison Studio"
- [ ] **App is PUBLISHED** (not in testing mode) ⚠️ CRITICAL
- [ ] App domain set to `madisonstudio.io`
- [ ] Homepage URL set to your app URL
- [ ] Authorized domains include `madisonstudio.io`
- [ ] Test Google sign-in to verify

---

## 🆘 If It Still Shows Supabase Domain

If after publishing and configuring, Google still shows the Supabase domain:

1. **This is partially normal** for Supabase OAuth flows
2. **The app name "Madison Studio"** should still be visible in other parts
3. **Users will understand** they're signing into your app
4. **The Supabase domain is secure** and trusted

**Alternative (Advanced):**
- Set up your own OAuth server on your domain
- This is complex and not recommended unless necessary

---

## ✅ Most Important Step

**PUBLISH YOUR APP!** This is likely the main issue. Unpublished/testing apps often show the redirect URI domain instead of the app name.

---

**After publishing, test Google sign-in again. You should see "Madison Studio" in most places!**

