# Deploy Functions to Asala Project

## 🎯 Your Project: Asala
**Project ID:** `likkskifwsrvszxdvufw`

---

## 📍 Step 1: Navigate to Functions List

You're on the Functions overview page. To see/deploy functions:

1. **Look for a tab or section** that says:
   - "Functions" (list view)
   - "Deploy Function" button
   - Or click on the **"Functions"** link in the left sidebar again

2. **Or try this direct link:**
   - https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions

---

## 🚀 Step 2: Deploy `create-checkout-session`

### If you see a "Deploy Function" button:

1. **Click "Deploy Function"** or **"Deploy a new function"**
2. **Function name:** `create-checkout-session`
3. **Upload the folder:** 
   - Navigate to: `supabase/functions/create-checkout-session`
   - Upload the entire folder
4. **Click "Deploy"**
5. **Wait for deployment** (30-60 seconds)

### If functions are already listed:

1. **Look for `create-checkout-session`** in the list
2. **If it exists:**
   - Click on it
   - Check if it's active/deployed
   - If it has errors → Click "Redeploy"
3. **If it doesn't exist:**
   - Click "Deploy Function" button
   - Follow steps above

---

## ✅ Step 3: Deploy Other Functions

Also deploy these (same process):

- `create-portal-session`
- `get-subscription`
- `stripe-webhook`

---

## ✅ Step 4: Set Stripe Secret Key

**Go to:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/settings/functions

**Or:** Click "Settings" → "Edge Functions" → "Secrets"

**Add secret:**
- **Name:** `STRIPE_SECRET_KEY`
- **Value:** Your Stripe secret key (`sk_test_...`)
  - Get from: https://dashboard.stripe.com/test/apikeys
- **Save**

---

## ✅ Step 5: Verify Price IDs Are Set

**Go to:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/sql/new

**Run this SQL to verify:**

```sql
SELECT name, slug, stripe_price_id_monthly, stripe_price_id_yearly 
FROM subscription_plans 
ORDER BY sort_order;
```

**All Price IDs should be set (not NULL).**

If any are NULL, run the UPDATE statements from `UPDATE_PRICE_IDS_NOW.sql`

---

## 🧪 Step 6: Test Checkout!

1. **Refresh browser** (Cmd+Shift+R)
2. **Go to:** Settings → Billing tab
3. **Click "Subscribe"** on any plan
4. **Should redirect to Stripe Checkout!**

---

## 📋 Quick Checklist

- [ ] Navigate to Functions list/deploy page
- [ ] Deploy `create-checkout-session` function
- [ ] Deploy `create-portal-session` function
- [ ] Deploy `get-subscription` function
- [ ] Deploy `stripe-webhook` function
- [ ] Set `STRIPE_SECRET_KEY` in secrets
- [ ] Verify Price IDs are set in database
- [ ] Test checkout flow

---

## 💡 What to Look For

On the Functions page, you should see:
- A list of deployed functions
- A "Deploy Function" or "Deploy a new function" button
- Function status (Active, Deployed, Error, etc.)

If you don't see a deploy button, try:
- Scrolling down
- Looking for tabs (Overview, Functions, etc.)
- Clicking "Functions" in the sidebar again

---

## 🎯 Once Deployed

After deploying `create-checkout-session`, the checkout should work! Let me know what you see on the Functions page and I'll guide you through the deployment.







