# 🔧 Add MadisonStudio.io Domain to Google OAuth Consent Screen

## 🎯 The Problem

You have `madisonstudio.io` in Google Workspace, but it's not showing up as an option in the OAuth consent screen email dropdown.

## ✅ Solution: Add Domain to Authorized Domains

Google Cloud Console needs to know that `madisonstudio.io` is an authorized domain for your OAuth app.

---

## 🚀 Step-by-Step Instructions

### Step 1: Go to OAuth Consent Screen

1. **Go to:** https://console.cloud.google.com/
2. **Select your project** (Content Machine)
3. **Navigate to:** APIs & Services → **OAuth consent screen**

### Step 2: Add Authorized Domain

1. **Scroll down** to the **"Authorized domains"** section
2. **Click "Add domain"** or the **"+"** button
3. **Enter:** `madisonstudio.io`
4. **Click "Add"** or "Save"

### Step 3: Verify Domain (If Required)

Google may ask you to verify domain ownership. If so:

1. **Google will show you a verification method:**
   - Usually adding a TXT record to your DNS
   - Or verifying through Google Workspace

2. **If using Google Workspace:**
   - Since you already have the domain in Google Workspace, it might auto-verify
   - Or you may need to verify through Google Workspace admin console

3. **If using DNS verification:**
   - Go to your domain's DNS settings
   - Add the TXT record Google provides
   - Wait for DNS propagation (usually a few minutes)
   - Click "Verify" in Google Cloud Console

### Step 4: Update Email Addresses

Once the domain is authorized:

1. **Go back to the top** of the OAuth consent screen
2. **Click on "User support email"** dropdown
3. **You should now see** emails from `madisonstudio.io` domain
4. **Select:** `support@madisonstudio.io` or `jordan@madisonstudio.io` (or whatever email you want)

5. **Do the same for "Developer contact information"**
6. **Save changes**

---

## 📋 Quick Checklist

- [ ] Go to OAuth consent screen
- [ ] Scroll to "Authorized domains" section
- [ ] Click "Add domain"
- [ ] Enter `madisonstudio.io`
- [ ] Verify domain (if required)
- [ ] Update email dropdowns to use Madison domain email
- [ ] Save changes

---

## 🆘 Troubleshooting

### Domain Not Showing in Dropdown After Adding

**Fix:**
1. Make sure domain is verified (check for green checkmark)
2. Refresh the page
3. Make sure you have email addresses created in Google Workspace for that domain

### "Domain verification required" Message

**Fix:**
1. Click "Verify" next to the domain
2. Follow Google's verification steps
3. If using Google Workspace, verify through Workspace admin console

### Can't Find "Authorized domains" Section

**Fix:**
1. Make sure you're on the OAuth consent screen (not client credentials page)
2. Scroll down - it's usually below the app information section
3. If you don't see it, you may need to publish the app first (if in testing mode)

---

## 🎯 What You Should See

**Before:**
- Email dropdown only shows `jordan@tarifeattar.com`

**After:**
- Email dropdown shows:
  - `jordan@tarifeattar.com`
  - `support@madisonstudio.io` ✅
  - `jordan@madisonstudio.io` ✅
  - Any other emails you have on that domain ✅

---

## 💡 Pro Tip

If you don't have a `support@madisonstudio.io` email yet:

1. **Go to Google Workspace Admin Console:**
   - https://admin.google.com/
2. **Navigate to:** Users → Add user
3. **Create:** `support@madisonstudio.io`
4. **Or set up email alias/group** if you prefer

Then it will show up in the OAuth consent screen dropdown!

---

**That's it!** Once you add `madisonstudio.io` to authorized domains and verify it, your Madison domain emails will appear in the dropdown.

