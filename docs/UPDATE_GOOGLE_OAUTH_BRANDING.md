# 🎨 Update Google OAuth to Show "Madison Studio"

## 🎯 The Issue

When users sign in with Google, they see:
- "to continue to **likkskifwsrvszxdvufw.supabase.co**"

You want it to show:
- "to continue to **Madison Studio**"

---

## ✅ Solution: Update Google OAuth Consent Screen

This is configured in **Google Cloud Console**, not Supabase.

---

## 🚀 Step-by-Step Instructions

### Step 1: Go to Google Cloud Console

1. **Go to:** https://console.cloud.google.com/
2. **Select your project** (the one with your OAuth credentials)
3. **Navigate to:** APIs & Services → **OAuth consent screen**

### Step 2: Update OAuth Consent Screen

1. **App name:**
   - Change to: `Madison Studio`
   - This is what shows in "to continue to **Madison Studio**"

2. **User support email:**
   - Set to your email (e.g., `jordan@tarifeattar.com`)

3. **App logo (optional):**
   - Upload your Madison Studio logo
   - Recommended: 120x120px PNG or JPG

4. **App domain (optional):**
   - Add: `madison-studio-cursor-asala.vercel.app`
   - Or your custom domain if you have one

5. **Developer contact information:**
   - Add your email

### Step 3: Save Changes

1. **Click "Save and Continue"** at the bottom
2. **Review the scopes** (usually just email/profile)
3. **Click "Save and Continue"** again
4. **Review test users** (if in testing mode)
5. **Click "Back to Dashboard"**

---

## 📋 What You'll See After

When users sign in with Google, they'll see:
- "to continue to **Madison Studio**" ✅

Instead of:
- "to continue to **likkskifwsrvszxdvufw.supabase.co**" ❌

---

## ⚠️ Important Notes

### Publishing Status

- **Testing mode:** Only test users can sign in
- **In production:** Anyone can sign in

If you want to make it public:
1. Go to OAuth consent screen
2. Click "PUBLISH APP"
3. Confirm publishing

### Verification (If Required)

For some scopes, Google may require verification:
- Usually not needed for basic email/profile scopes
- If prompted, you may need to submit for verification

---

## 🎨 Optional: Branding Enhancements

While you're there, you can also:

1. **Add app logo** - Shows in the consent screen
2. **Add privacy policy URL** - Required for production
3. **Add terms of service URL** - Recommended
4. **Add homepage URL** - Your app's main URL

---

## ✅ Quick Checklist

- [ ] Go to Google Cloud Console
- [ ] Navigate to OAuth consent screen
- [ ] Change App name to "Madison Studio"
- [ ] Add user support email
- [ ] (Optional) Upload logo
- [ ] Save changes
- [ ] Test Google sign-in to verify

---

## 🧪 Test It

After updating:

1. **Go to your Vercel app**
2. **Click "Sign in with Google"**
3. **You should see:** "to continue to **Madison Studio**" ✅

---

**That's it!** The change takes effect immediately. Users will see "Madison Studio" instead of the Supabase URL.

