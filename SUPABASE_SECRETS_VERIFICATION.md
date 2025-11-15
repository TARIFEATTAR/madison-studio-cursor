# Supabase Secrets Verification Guide

**Location:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/settings/functions

**Scroll to "Secrets" section**

---

## 🔐 CRITICAL SECRETS (Required for Launch)

### 1. Stripe Payment System

#### `STRIPE_SECRET_KEY` ⚠️ REQUIRED
- **Used by:** `create-checkout-session`, `create-portal-session`, `stripe-webhook`
- **Format:** Starts with `sk_test_` (test) or `sk_live_` (production)
- **Get from:** https://dashboard.stripe.com/apikeys
- **Status:** [ ] Set / [ ] Missing

**To set:**
1. Go to Stripe Dashboard → API Keys
2. Copy "Secret key" (starts with `sk_test_...` or `sk_live_...`)
3. Add to Supabase secrets:
   - Name: `STRIPE_SECRET_KEY`
   - Value: `sk_test_...` (paste your key)

#### `STRIPE_WEBHOOK_SECRET` ⚠️ REQUIRED
- **Used by:** `stripe-webhook` (for signature verification)
- **Format:** Starts with `whsec_`
- **Get from:** Stripe Dashboard → Webhooks → Your webhook → Signing secret
- **Status:** [ ] Set / [ ] Missing

**To set:**
1. Go to Stripe Dashboard → Webhooks
2. Click on your webhook endpoint
3. Click "Reveal" on "Signing secret"
4. Copy the secret (starts with `whsec_...`)
5. Add to Supabase secrets:
   - Name: `STRIPE_WEBHOOK_SECRET`
   - Value: `whsec_...` (paste your secret)

**Note:** If webhook doesn't exist yet, create it first (see Stripe Webhook Setup)

#### `APP_URL` ⚠️ OPTIONAL (Recommended)
- **Used by:** `create-checkout-session`, `create-portal-session` (for redirect URLs)
- **Format:** Your app URL (e.g., `https://yourdomain.com` or `http://localhost:5173`)
- **Default:** `http://localhost:5173` (if not set)
- **Status:** [ ] Set / [ ] Using default

**To set:**
- Name: `APP_URL`
- Value: `https://yourdomain.com` (production) or `http://localhost:5173` (development)

---

### 2. Google OAuth (Authentication & Calendar)

#### `GOOGLE_CLIENT_ID` ⚠️ REQUIRED
- **Used by:** `google-calendar-oauth`
- **Format:** Google OAuth Client ID
- **Get from:** https://console.cloud.google.com/apis/credentials
- **Status:** [ ] Set / [ ] Missing

**To set:**
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Find your OAuth 2.0 Client ID
3. Copy the "Client ID"
4. Add to Supabase secrets:
   - Name: `GOOGLE_CLIENT_ID`
   - Value: (paste your Client ID)

#### `GOOGLE_CLIENT_SECRET` ⚠️ REQUIRED
- **Used by:** `google-calendar-oauth`
- **Format:** Google OAuth Client Secret
- **Get from:** Same location as Client ID
- **Status:** [ ] Set / [ ] Missing

**To set:**
1. Same location as above
2. Click on your OAuth client
3. Copy the "Client secret"
4. Add to Supabase secrets:
   - Name: `GOOGLE_CLIENT_SECRET`
   - Value: (paste your Client Secret)

#### `GOOGLE_TOKEN_ENCRYPTION_KEY` ⚠️ REQUIRED
- **Used by:** `google-calendar-oauth`, `sync-to-google-calendar`
- **Format:** Base64 encoded 32-byte key
- **Generate:** Run command below
- **Status:** [ ] Set / [ ] Missing

**To generate and set:**
```bash
# Generate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output and add to Supabase secrets:
- Name: `GOOGLE_TOKEN_ENCRYPTION_KEY`
- Value: (paste generated key)

---

### 3. AI API Keys (At Least One Required)

#### `GEMINI_API_KEY` ✅ RECOMMENDED
- **Used by:** Multiple AI functions (content generation, image generation, etc.)
- **Format:** Starts with `AIza...`
- **Get from:** https://aistudio.google.com
- **Status:** [ ] Set / [ ] Missing

**To set:**
1. Go to Google AI Studio
2. Click "Get API Key"
3. Create or select API key
4. Copy the key (starts with `AIza...`)
5. Add to Supabase secrets:
   - Name: `GEMINI_API_KEY`
   - Value: `AIza...` (paste your key)

#### `ANTHROPIC_API_KEY` ⚠️ ALTERNATIVE
- **Used by:** `generate-with-claude` (fallback if Gemini not available)
- **Format:** Anthropic API key
- **Get from:** https://console.anthropic.com
- **Status:** [ ] Set / [ ] Missing

**To set:**
1. Go to Anthropic Console
2. Navigate to API Keys
3. Create new API key
4. Copy the key
5. Add to Supabase secrets:
   - Name: `ANTHROPIC_API_KEY`
   - Value: (paste your key)

#### `LOVABLE_API_KEY` ⚠️ FALLBACK
- **Used by:** Various functions as fallback
- **Format:** Lovable API key
- **Get from:** https://gateway.lovable.dev
- **Status:** [ ] Set / [ ] Missing

**To set:**
1. Go to Lovable Gateway
2. Get your API key
3. Add to Supabase secrets:
   - Name: `LOVABLE_API_KEY`
   - Value: (paste your key)

**Priority:** Gemini → Claude → Lovable (functions try in this order)

---

### 4. Shopify Integration (If Using)

#### `SHOPIFY_TOKEN_ENCRYPTION_KEY` ⚠️ REQUIRED (if using Shopify)
- **Used by:** `connect-shopify`
- **Format:** Base64 encoded 32-byte key
- **Generate:** Run command below
- **Status:** [ ] Set / [ ] Missing / [ ] Not using Shopify

**To generate and set:**
```bash
# Generate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output and add to Supabase secrets:
- Name: `SHOPIFY_TOKEN_ENCRYPTION_KEY`
- Value: (paste generated key)

---

## ✅ AUTO-SET SECRETS (No Action Needed)

These are automatically set by Supabase:
- ✅ `SUPABASE_URL` - Your project URL
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Service role key
- ✅ `SUPABASE_ANON_KEY` - Anon key (if needed by functions)

---

## 📋 VERIFICATION CHECKLIST

### Critical for Launch:
- [ ] `STRIPE_SECRET_KEY` - Required for payments
- [ ] `STRIPE_WEBHOOK_SECRET` - Required for webhook
- [ ] `GOOGLE_CLIENT_ID` - Required for Google OAuth
- [ ] `GOOGLE_CLIENT_SECRET` - Required for Google OAuth
- [ ] `GOOGLE_TOKEN_ENCRYPTION_KEY` - Required for Google Calendar
- [ ] At least one AI API key (`GEMINI_API_KEY` recommended)

### Optional but Recommended:
- [ ] `APP_URL` - For production redirects
- [ ] `SHOPIFY_TOKEN_ENCRYPTION_KEY` - If using Shopify

---

## 🚀 QUICK SETUP COMMANDS

**If using Supabase CLI:**

```bash
# Stripe
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxx
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx
npx supabase secrets set APP_URL=http://localhost:5173

# Google OAuth
npx supabase secrets set GOOGLE_CLIENT_ID=your_client_id
npx supabase secrets set GOOGLE_CLIENT_SECRET=your_client_secret
npx supabase secrets set GOOGLE_TOKEN_ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")

# AI APIs
npx supabase secrets set GEMINI_API_KEY=AIza...
npx supabase secrets set ANTHROPIC_API_KEY=your_key  # Optional
npx supabase secrets set LOVABLE_API_KEY=your_key    # Optional

# Shopify (if using)
npx supabase secrets set SHOPIFY_TOKEN_ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
```

---

## 🔍 HOW TO VERIFY SECRETS ARE SET

### Option 1: Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/settings/functions
2. Scroll to "Secrets" section
3. Check that all required secrets are listed
4. Secrets show first few characters (for security)

### Option 2: Test Functions
- **Test Stripe:** Try subscribing on billing page
- **Test Google OAuth:** Try connecting Google Calendar
- **Test AI:** Try generating content
- Check function logs for errors about missing secrets

---

## ⚠️ COMMON ISSUES

### "STRIPE_SECRET_KEY not configured"
- **Fix:** Add `STRIPE_SECRET_KEY` to Supabase secrets
- **Get from:** Stripe Dashboard → API Keys

### "STRIPE_WEBHOOK_SECRET not configured"
- **Fix:** Add `STRIPE_WEBHOOK_SECRET` to Supabase secrets
- **Get from:** Stripe Dashboard → Webhooks → Your webhook → Signing secret

### "Google OAuth credentials not configured"
- **Fix:** Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- **Get from:** Google Cloud Console → Credentials

### "No AI API configured"
- **Fix:** Add at least one: `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`, or `LOVABLE_API_KEY`
- **Recommended:** `GEMINI_API_KEY` (most cost-effective)

---

## 📊 SECRETS STATUS SUMMARY

| Secret | Required | Status | Priority |
|--------|----------|--------|----------|
| `STRIPE_SECRET_KEY` | ✅ Yes | [ ] Set | 🔴 Critical |
| `STRIPE_WEBHOOK_SECRET` | ✅ Yes | [ ] Set | 🔴 Critical |
| `GOOGLE_CLIENT_ID` | ✅ Yes | [ ] Set | 🔴 Critical |
| `GOOGLE_CLIENT_SECRET` | ✅ Yes | [ ] Set | 🔴 Critical |
| `GOOGLE_TOKEN_ENCRYPTION_KEY` | ✅ Yes | [ ] Set | 🔴 Critical |
| `GEMINI_API_KEY` | ✅ Yes* | [ ] Set | 🟡 High |
| `APP_URL` | ⚠️ Optional | [ ] Set | 🟢 Low |
| `ANTHROPIC_API_KEY` | ⚠️ Optional | [ ] Set | 🟢 Low |
| `LOVABLE_API_KEY` | ⚠️ Optional | [ ] Set | 🟢 Low |
| `SHOPIFY_TOKEN_ENCRYPTION_KEY` | ⚠️ If using | [ ] Set | 🟢 Low |

*At least one AI API key required

---

## ✅ VERIFICATION COMPLETE

Once all critical secrets are set:
- ✅ Stripe payments will work
- ✅ Google OAuth will work
- ✅ AI features will work
- ✅ App is ready for launch!

---

## 🎯 NEXT STEPS

After verifying secrets:
1. Test Stripe checkout flow
2. Test Google Calendar connection
3. Test content generation
4. Check function logs for any errors
5. Proceed with launch! 🚀




