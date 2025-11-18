# 🔧 Change "to continue to" Text in Google OAuth

## 🎯 The Issue

Google OAuth shows: "to continue to **likkskifwsrvszxdvufw.supabase.co**"

You want it to show: "to continue to **madisonstudio.io**"

---

## ⚠️ Important Note

The "to continue to" text in Google's OAuth screen typically shows the **redirect URI domain**. Since you're using Supabase for OAuth, the redirect goes through Supabase first, so Google shows the Supabase domain.

**However**, we can influence this by configuring the OAuth consent screen properly.

---

## ✅ Solution: Update OAuth Consent Screen

### Step 1: Go to OAuth Consent Screen

1. **Go to:** https://console.cloud.google.com/
2. **Select your project** (Content Machine)
3. **Navigate to:** APIs & Services → **OAuth consent screen**

### Step 2: Update App Domain

1. **Find "App domain"** section (usually near the top)
2. **Add your domain:** `madisonstudio.io`
3. **Save changes**

### Step 3: Update Authorized Domains

1. **Scroll to "Authorized domains"** section
2. **Make sure** `madisonstudio.io` is listed
3. **If not, add it** and verify

### Step 4: Update Homepage URL

1. **Find "Application home page"** or "Homepage URL"**
2. **Set to:** `https://madisonstudio.io` or your Vercel URL
3. **Save changes**

### Step 5: Publish App (If in Testing Mode)

1. **If your app is in "Testing" mode:**
   - Scroll to bottom
   - Click **"PUBLISH APP"**
   - Confirm publishing

2. **This makes the app public** and may help with domain display

---

## 🔍 Alternative: Check Redirect URI

The "to continue to" text is primarily determined by the redirect URI. Since you're using Supabase:

1. **The redirect URI is:** `https://likkskifwsrvszxdvufw.supabase.co/auth/v1/callback`
2. **Google shows this domain** in the "to continue to" text
3. **This is normal** for Supabase OAuth flows

---

## 💡 What Actually Controls This

The "to continue to" text shows:
1. **Primary:** The redirect URI domain (Supabase in your case)
2. **Secondary:** The app domain/homepage if configured
3. **Tertiary:** The app name (which we already set to "Madison Studio")

**Unfortunately**, if Supabase is handling the OAuth callback, Google will typically show the Supabase domain.

---

## 🎯 Best Solution: Update App Domain & Homepage

Even though Google may still show the Supabase domain, setting these correctly helps:

1. **App domain:** `madisonstudio.io`
2. **Homepage URL:** `https://madisonstudio.io` or your Vercel URL
3. **Authorized domains:** Include `madisonstudio.io`

This ensures your domain is associated with the OAuth app, even if Google still shows the redirect URI domain.

---

## ⚠️ Reality Check

**Important:** For Supabase OAuth flows, Google typically shows the Supabase redirect URI domain in the "to continue to" text. This is **normal and expected** behavior.

**What users see:**
- "to continue to **likkskifwsrvszxdvufw.supabase.co**" (redirect domain)
- But the **app name** shows as "Madison Studio" elsewhere

**This is acceptable** because:
- Users are redirected to Supabase first (for security)
- Then Supabase redirects to your app
- The app name "Madison Studio" is still visible in other parts of the OAuth flow

---

## ✅ What You Can Control

You **can** control:
- ✅ App name: "Madison Studio" (already done)
- ✅ App logo: Your Madison logo
- ✅ App domain: `madisonstudio.io`
- ✅ Homepage URL: Your app URL

You **cannot** easily control:
- ❌ The "to continue to" domain (shows redirect URI domain)

---

## 🎯 Recommended Action

1. **Set App domain** to `madisonstudio.io`
2. **Set Homepage URL** to your Vercel URL or `https://madisonstudio.io`
3. **Ensure authorized domains** includes `madisonstudio.io`
4. **Accept** that Google may still show the Supabase domain (this is normal)

**The app name "Madison Studio" will still be visible** in other parts of the OAuth consent screen, which is what matters most for branding.

---

## 🆘 If You Really Need to Change It

If you absolutely need "madisonstudio.io" to show instead of the Supabase domain, you would need to:

1. **Set up your own OAuth server** (not using Supabase)
2. **Handle OAuth callbacks** on your own domain
3. **This is complex** and not recommended

**Recommendation:** Keep using Supabase OAuth. The Supabase domain in "to continue to" is normal and secure. Users will see "Madison Studio" as the app name, which is the important branding element.

---

**Bottom line:** Set the app domain and homepage URL, but understand that Google may still show the Supabase redirect domain. This is normal and acceptable for Supabase OAuth flows.

