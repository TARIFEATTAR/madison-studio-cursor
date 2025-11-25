# 🔍 Secrets Verification - Step by Step

**Location:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/settings/functions

---

## 📋 VERIFICATION CHECKLIST

### Step 1: Open Supabase Dashboard

1. **Go to:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/settings/functions
2. **Scroll down** to the **"Secrets"** section
3. **Look for** the list of secrets

---

## ✅ CHECK EACH SECRET

### 🔴 CRITICAL SECRET #1: STRIPE_SECRET_KEY

**What to look for:**
- [ ] Secret name: `STRIPE_SECRET_KEY`
- [ ] Value starts with: `sk_test_` or `sk_live_`
- [ ] Status: ✅ **FOUND** / ❌ **MISSING**

**If MISSING:**
- Get from: https://dashboard.stripe.com/apikeys
- Copy "Secret key"
- Add to Supabase secrets

---

### 🔴 CRITICAL SECRET #2: STRIPE_WEBHOOK_SECRET

**What to look for:**
- [ ] Secret name: `STRIPE_WEBHOOK_SECRET`
- [ ] Value starts with: `whsec_`
- [ ] Status: ✅ **FOUND** / ❌ **MISSING**

**If MISSING:**
- Get from: Stripe Dashboard → Webhooks → Your webhook → Signing secret
- Add to Supabase secrets

---

### 🔴 CRITICAL SECRET #3: GOOGLE_CLIENT_ID

**What to look for:**
- [ ] Secret name: `GOOGLE_CLIENT_ID`
- [ ] Value is a Google OAuth Client ID
- [ ] Status: ✅ **FOUND** / ❌ **MISSING**

**If MISSING:**
- Get from: https://console.cloud.google.com/apis/credentials
- Copy "Client ID"
- Add to Supabase secrets

---

### 🔴 CRITICAL SECRET #4: GOOGLE_CLIENT_SECRET

**What to look for:**
- [ ] Secret name: `GOOGLE_CLIENT_SECRET`
- [ ] Value is a Google OAuth Client Secret
- [ ] Status: ✅ **FOUND** / ❌ **MISSING**

**If MISSING:**
- Get from: Same location as Client ID
- Copy "Client secret"
- Add to Supabase secrets

---

### 🔴 CRITICAL SECRET #5: GOOGLE_TOKEN_ENCRYPTION_KEY

**What to look for:**
- [ ] Secret name: `GOOGLE_TOKEN_ENCRYPTION_KEY`
- [ ] Value is a base64 encoded string
- [ ] Status: ✅ **FOUND** / ❌ **MISSING**

**If MISSING:**
- Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
- Copy the output
- Add to Supabase secrets

---

### 🔴 CRITICAL SECRET #6: GEMINI_API_KEY (or other AI API)

**What to look for:**
- [ ] Secret name: `GEMINI_API_KEY` (recommended)
  - OR `ANTHROPIC_API_KEY`
- [ ] `GEMINI_API_KEY` starts with: `AIza...`
- [ ] Status: ✅ **FOUND** / ❌ **MISSING**

**If MISSING:**
- Get from: https://aistudio.google.com
- Copy API key
- Add to Supabase secrets

---

### ⚠️ OPTIONAL SECRETS

**APP_URL:**
- [ ] Status: ✅ **FOUND** / ⚠️ **Using default** (OK)
- Default: `http://localhost:5173`

**SHOPIFY_TOKEN_ENCRYPTION_KEY:**
- [ ] Status: ✅ **FOUND** / ❌ **MISSING** / ⚠️ **Not using** (OK if not using Shopify)

---

## 📊 VERIFICATION RESULTS

**Fill this in as you check:**

```
STRIPE_SECRET_KEY:           [ ] ✅ FOUND  [ ] ❌ MISSING
STRIPE_WEBHOOK_SECRET:       [ ] ✅ FOUND  [ ] ❌ MISSING
GOOGLE_CLIENT_ID:            [ ] ✅ FOUND  [ ] ❌ MISSING
GOOGLE_CLIENT_SECRET:        [ ] ✅ FOUND  [ ] ❌ MISSING
GOOGLE_TOKEN_ENCRYPTION_KEY: [ ] ✅ FOUND  [ ] ❌ MISSING
GEMINI_API_KEY:              [ ] ✅ FOUND  [ ] ❌ MISSING
APP_URL:                     [ ] ✅ FOUND  [ ] ⚠️ DEFAULT
```

---

## 🚨 IF ANY SECRETS ARE MISSING

**Quick Setup:**

1. **Click "+ New secret"** or **"Add new secret"** in Supabase Dashboard
2. **Enter:**
   - **Name:** (e.g., `STRIPE_SECRET_KEY`)
   - **Value:** (paste your secret)
3. **Click "Save"**
4. **Repeat** for each missing secret

---

## 🧪 FUNCTIONAL VERIFICATION

**After checking secrets, test if they work:**

### Test Stripe:
1. Visit: http://localhost:5173/settings?tab=billing
2. Click "Subscribe"
3. **If works:** ✅ Secrets are correct
4. **If error:** Check browser console for specific error

### Test Google OAuth:
1. Try connecting Google Calendar
2. **If works:** ✅ Secrets are correct
3. **If error:** Check for "credentials not configured" message

### Test AI:
1. Try generating content
2. **If works:** ✅ Secrets are correct
3. **If error:** Check for "No AI API configured" message

---

## ✅ VERIFICATION COMPLETE

**Once all critical secrets are verified:**
- ✅ Payment system ready
- ✅ Google OAuth ready
- ✅ AI features ready
- ✅ Ready to launch! 🚀

---

## 📝 NOTES

**Write any issues or notes here:**









