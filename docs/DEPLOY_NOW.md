# Deploy Edge Function - Next Step

## ✅ Step 1 Complete: Price IDs Updated!

Your database now has all Price IDs set. Great work!

---

## 🚀 Step 2: Deploy the Edge Function (Do This Now!)

The "Failed to send a request to the Edge Function" error means the function isn't deployed yet.

### Deploy via Supabase Dashboard:

1. **Go to:** https://supabase.com/dashboard/project/iflwjiwkbxuvmiviqdxv/functions

2. **Check if `create-checkout-session` exists:**
   - ✅ **If you see it** → Click on it → Check status
     - If it shows errors → Click "Redeploy"
     - If it's active → Move to Step 3
   - ❌ **If you DON'T see it** → Continue to deploy

3. **To Deploy:**
   - Click **"Deploy Function"** or **"New Function"** button
   - You'll see options to:
     - **Upload folder** → Select `supabase/functions/create-checkout-session`
     - **Or drag and drop** the entire `create-checkout-session` folder
   - Wait for deployment to complete (usually 30-60 seconds)

4. **Verify Deployment:**
   - Function should appear in the list
   - Status should show "Active" or "Deployed"
   - No red error indicators

---

## ✅ Step 3: Set Stripe Secret Key

**Go to:** https://supabase.com/dashboard/project/iflwjiwkbxuvmiviqdxv/settings/functions

**Scroll to "Secrets" section**

**Add/Verify:**
- **Name:** `STRIPE_SECRET_KEY`
- **Value:** Your Stripe Secret Key
  - Get from: https://dashboard.stripe.com/test/apikeys
  - Copy the **Secret key** (starts with `sk_test_...`)
- Click **"Save"** or **"Add secret"**

---

## ✅ Step 4: Test Checkout!

1. **Refresh your browser** (hard refresh: Cmd+Shift+R)
2. **Go to:** Settings → Billing tab
3. **Open browser console** (F12 → Console tab) - to see any errors
4. **Click "Subscribe"** on any plan (e.g., Atelier $49/month)

**Expected:**
- ✅ Should redirect to Stripe Checkout (not show error)
- ✅ Use test card: `4242 4242 4242 4242`
- ✅ Complete checkout
- ✅ Redirect back to your app
- ✅ Subscription appears in Billing tab

---

## 🐛 If Still Getting Errors

**Check browser console (F12):**
- Share the exact error message
- Look for: "Function not found", "401", "500", etc.

**Check function logs:**
- Go to: Supabase Dashboard → Functions → `create-checkout-session` → Logs
- Try subscribing again
- Check logs for errors

---

## 📋 Quick Checklist

- [x] ✅ Price IDs updated in database
- [ ] ⏳ Deploy `create-checkout-session` function
- [ ] ⏳ Set `STRIPE_SECRET_KEY` in Supabase secrets
- [ ] ⏳ Test checkout flow

---

## 🎯 You're Almost There!

Once you deploy the function and set the secret key, checkout should work perfectly!

Let me know once you've deployed the function and we can test it together! 🚀







