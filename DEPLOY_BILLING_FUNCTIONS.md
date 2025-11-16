# Deploy Billing Functions - Quick Fix

## 🎯 Problem
When you click "Subscribe", nothing happens because the `create-checkout-session` function isn't deployed yet.

## ✅ Functions Needed for Billing
1. ✅ `get-subscription` - Already deployed (you just did this!)
2. ❌ `create-checkout-session` - **NEEDS DEPLOYMENT** (for Subscribe button)
3. ❌ `create-portal-session` - Needed for "Manage Plan" button
4. ❌ `stripe-webhook` - Needed for Stripe webhooks (processes payments)

---

## 🚀 Deploy via Dashboard (Easiest)

### Step 1: Deploy `create-checkout-session`
1. **Go to:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions
2. **Click:** "Deploy Function" or "Deploy a new function"
3. **Function name:** `create-checkout-session`
4. **Upload folder:** Navigate to `supabase/functions/create-checkout-session` → Select the folder
5. **Click:** "Deploy"
6. **Wait:** 30-60 seconds

### Step 2: Deploy `create-portal-session`
1. **Still on functions page**
2. **Click:** "Deploy Function" again
3. **Function name:** `create-portal-session`
4. **Upload folder:** Navigate to `supabase/functions/create-portal-session` → Select the folder
5. **Click:** "Deploy"

### Step 3: Deploy `stripe-webhook` (Important!)
1. **Click:** "Deploy Function" again
2. **Function name:** `stripe-webhook`
3. **Upload folder:** Navigate to `supabase/functions/stripe-webhook` → Select the folder
4. **Click:** "Deploy"

---

## 💻 Deploy via CLI (Faster if logged in)

If you're logged into Supabase CLI, run:

```bash
cd "/Users/jordanrichter/Documents/Asala Projects/Asala Studio/asala-studio"

# Deploy all billing functions at once
supabase functions deploy create-checkout-session --project-ref likkskifwsrvszxdvufw
supabase functions deploy create-portal-session --project-ref likkskifwsrvszxdvufw
supabase functions deploy stripe-webhook --project-ref likkskifwsrvszxdvufw
```

**If not logged in:**
```bash
supabase login
# Then run the deploy commands above
```

---

## ⚙️ Set Stripe Secret Key (Required!)

After deploying functions, you MUST set your Stripe secret key:

1. **Go to:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/settings/functions
2. **Scroll to:** "Secrets" section
3. **Click:** "Add new secret"
4. **Name:** `STRIPE_SECRET_KEY`
5. **Value:** Your Stripe secret key (starts with `sk_test_...` or `sk_live_...`)
   - Get from: https://dashboard.stripe.com/test/apikeys
6. **Click:** "Save"

---

## ✅ Verify Everything Works

1. **Check functions are deployed:**
   - Go to: https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions
   - Should see all 4 functions: `get-subscription`, `create-checkout-session`, `create-portal-session`, `stripe-webhook`

2. **Test Subscribe button:**
   - Refresh billing page (hard refresh: Cmd+Shift+R)
   - Open browser console (F12 → Console tab)
   - Click "Subscribe" on any plan
   - Should redirect to Stripe Checkout (not show error)

3. **Check console for errors:**
   - If you see errors, they'll tell you what's missing

---

## 🔍 Troubleshooting

**"All subscribe buttons are activated but nothing happens"**
- ✅ `create-checkout-session` function not deployed → Deploy it now!

**"Edge Function returned a non-2xx status code"**
- Check function logs in Supabase Dashboard → Edge Functions → [function name] → Logs
- Common issues:
  - Missing `STRIPE_SECRET_KEY` secret → Set it in Settings → Functions → Secrets
  - Database tables missing → Check if `subscription_plans` table exists

**"Plan is not yet configured with Stripe"**
- Need to set Stripe Price IDs in database
- Go to SQL Editor and run queries to set `stripe_price_id_monthly` and `stripe_price_id_yearly` for each plan

---

## 📝 Quick Checklist

- [ ] `get-subscription` deployed ✅ (you did this!)
- [ ] `create-checkout-session` deployed
- [ ] `create-portal-session` deployed  
- [ ] `stripe-webhook` deployed
- [ ] `STRIPE_SECRET_KEY` set in secrets
- [ ] Stripe Price IDs configured in database
- [ ] Test Subscribe button works


