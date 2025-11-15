# Secrets Verification Status

## 🔍 How to Verify Secrets

**Go to:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/settings/functions

**Scroll to "Secrets" section**

---

## ✅ SECRETS CHECKLIST

### Critical Secrets (Required for Launch):

**Stripe:**
- [ ] `STRIPE_SECRET_KEY` 
  - Should start with: `sk_test_` or `sk_live_`
  - Status: [ ] ✅ Set / [ ] ❌ Missing
  - First chars visible: `sk_...`

- [ ] `STRIPE_WEBHOOK_SECRET`
  - Should start with: `whsec_`
  - Status: [ ] ✅ Set / [ ] ❌ Missing
  - First chars visible: `whsec_...`

- [ ] `APP_URL` (Optional)
  - Status: [ ] ✅ Set / [ ] ⚠️ Using default
  - Value: `http://localhost:5173` or your production URL

**Google OAuth:**
- [ ] `GOOGLE_CLIENT_ID`
  - Status: [ ] ✅ Set / [ ] ❌ Missing
  - First chars visible: (Google Client ID)

- [ ] `GOOGLE_CLIENT_SECRET`
  - Status: [ ] ✅ Set / [ ] ❌ Missing
  - First chars visible: (Google Client Secret)

- [ ] `GOOGLE_TOKEN_ENCRYPTION_KEY`
  - Status: [ ] ✅ Set / [ ] ❌ Missing
  - First chars visible: (Base64 encoded key)

**AI APIs (At least one required):**
- [ ] `GEMINI_API_KEY` ⭐ Recommended
  - Should start with: `AIza...`
  - Status: [ ] ✅ Set / [ ] ❌ Missing
  - First chars visible: `AIza...`

- [ ] `ANTHROPIC_API_KEY` (Optional)
  - Status: [ ] ✅ Set / [ ] ❌ Missing

**Shopify (If using):**
- [ ] `SHOPIFY_TOKEN_ENCRYPTION_KEY`
  - Status: [ ] ✅ Set / [ ] ❌ Missing / [ ] Not using Shopify

---

## 🧪 FUNCTIONAL VERIFICATION

### Test Stripe Secrets:

**Test 1: Checkout Function**
1. Visit: http://localhost:5173/settings?tab=billing
2. Click "Subscribe" on any plan
3. **If error:** Check browser console for:
   - "STRIPE_SECRET_KEY not configured" → Secret missing
   - "Unauthorized" → Auth issue (not secret issue)
   - "Failed to create checkout" → Check Stripe key validity

**Test 2: Webhook Function**
1. Go to: Stripe Dashboard → Webhooks
2. Click "Send test webhook"
3. Select: `customer.subscription.created`
4. **If error:** Check Stripe webhook logs for:
   - "Webhook signature verification failed" → `STRIPE_WEBHOOK_SECRET` missing or wrong
   - "500 error" → Check Supabase function logs

### Test Google OAuth Secrets:

**Test 1: Calendar Connection**
1. Visit: Your app → Calendar/Schedule page
2. Click "Connect Google Calendar"
3. **If error:** Check browser console for:
   - "Google OAuth credentials not configured" → Secrets missing
   - "Failed to redirect" → Check redirect URI configuration

### Test AI API Secrets:

**Test 1: Content Generation**
1. Visit: Your app → Create content
2. Try generating content
3. **If error:** Check browser console for:
   - "No AI API configured" → No API keys set
   - "API key invalid" → Key is wrong or expired
   - "Rate limit" → Key is valid but hit limits

---

## 📊 VERIFICATION RESULTS

**Fill in as you check:**

| Secret | Status | Notes |
|--------|--------|-------|
| `STRIPE_SECRET_KEY` | [ ] ✅ / [ ] ❌ | |
| `STRIPE_WEBHOOK_SECRET` | [ ] ✅ / [ ] ❌ | |
| `APP_URL` | [ ] ✅ / [ ] ⚠️ Default | |
| `GOOGLE_CLIENT_ID` | [ ] ✅ / [ ] ❌ | |
| `GOOGLE_CLIENT_SECRET` | [ ] ✅ / [ ] ❌ | |
| `GOOGLE_TOKEN_ENCRYPTION_KEY` | [ ] ✅ / [ ] ❌ | |
| `GEMINI_API_KEY` | [ ] ✅ / [ ] ❌ | |
| `ANTHROPIC_API_KEY` | [ ] ✅ / [ ] ❌ | |
| `SHOPIFY_TOKEN_ENCRYPTION_KEY` | [ ] ✅ / [ ] ❌ / [ ] N/A | |

---

## 🚨 IF SECRETS ARE MISSING

**Quick Setup Commands:**

```bash
# Generate encryption keys
GOOGLE_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
SHOPIFY_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")

# Set via Supabase CLI (if you have access)
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxx
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx
npx supabase secrets set GOOGLE_CLIENT_ID=your_client_id
npx supabase secrets set GOOGLE_CLIENT_SECRET=your_client_secret
npx supabase secrets set GOOGLE_TOKEN_ENCRYPTION_KEY=$GOOGLE_KEY
npx supabase secrets set GEMINI_API_KEY=AIza...
```

**Or set via Dashboard:**
- Go to Supabase Dashboard → Settings → Edge Functions → Secrets
- Click "+ New secret" or "Add new secret"
- Enter name and value
- Click "Save"

---

## ✅ VERIFICATION COMPLETE

Once all critical secrets are verified:
- ✅ Stripe payments will work
- ✅ Google OAuth will work  
- ✅ AI features will work
- ✅ Ready for launch! 🚀






