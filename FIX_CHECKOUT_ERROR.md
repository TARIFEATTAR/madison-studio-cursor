# Fix "Failed to send a request to the Edge Function" Error

## 🔍 Diagnosis

The error "Failed to send a request to the Edge Function" means the frontend can't reach the `create-checkout-session` function. This is usually because:

1. **Function not deployed** (most common)
2. **Missing environment variables** in the function
3. **CORS issue** (less likely with Supabase)
4. **Network/firewall issue**

---

## ✅ Step 1: Deploy the Edge Function

The function needs to be deployed to Supabase. Run this:

```bash
cd asala-studio
supabase functions deploy create-checkout-session --project-ref iflwjiwkbxuvmiviqdxv
```

**Or deploy via Supabase Dashboard:**
1. Go to: https://supabase.com/dashboard/project/iflwjiwkbxuvmiviqdxv/functions
2. Click "Deploy Function" or "New Function"
3. Upload the `supabase/functions/create-checkout-session` folder

---

## ✅ Step 2: Verify Function is Deployed

**Check:**
1. Go to: https://supabase.com/dashboard/project/iflwjiwkbxuvmiviqdxv/functions
2. Look for `create-checkout-session` in the list
3. Status should show "Active" or "Deployed"

---

## ✅ Step 3: Set Required Environment Variables

The function needs these secrets in Supabase:

**Go to:** https://supabase.com/dashboard/project/iflwjiwkbxuvmiviqdxv/settings/functions

**Scroll to "Secrets" section and verify:**

1. **STRIPE_SECRET_KEY** (required)
   - Should start with `sk_test_...` (for test mode)
   - Get from: Stripe Dashboard → Developers → API keys → Secret key

2. **APP_URL** (optional, defaults to localhost:5173)
   - Set to: `http://localhost:8080` (your dev server URL)
   - Or your production URL when deployed

**Note:** `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically set by Supabase.

**To add secrets:**
```bash
# Via CLI (if you have Supabase CLI configured)
supabase secrets set STRIPE_SECRET_KEY="sk_test_..." --project-ref iflwjiwkbxuvmiviqdxv
supabase secrets set APP_URL="http://localhost:8080" --project-ref iflwjiwkbxuvmiviqdxv
```

**Or via Dashboard:**
- Click "Add new secret"
- Name: `STRIPE_SECRET_KEY`
- Value: Your Stripe secret key
- Click "Save"

---

## ✅ Step 4: Test the Function

After deploying and setting secrets, test:

1. **Refresh your browser** (hard refresh: Cmd+Shift+R)
2. **Go to:** Settings → Billing tab
3. **Click "Subscribe"** on any plan
4. **Check browser console** (F12) for any errors

**Expected:** Should redirect to Stripe Checkout

**If still failing:**
- Check browser console for the exact error message
- Check Supabase function logs: Dashboard → Edge Functions → create-checkout-session → Logs

---

## 🔍 Debugging Steps

### Check Browser Console

Open DevTools (F12) → Console tab and look for:
- Network errors (404, 500, etc.)
- CORS errors
- Authentication errors

### Check Function Logs

1. Go to: Supabase Dashboard → Edge Functions → `create-checkout-session` → Logs
2. Try subscribing again
3. Check logs for errors

**Common errors in logs:**
- `STRIPE_SECRET_KEY not found` → Secret not set
- `No organization found` → User hasn't completed onboarding
- `Plan not found` → Price IDs not in database

---

## 🎯 Quick Fix Checklist

- [ ] Deploy `create-checkout-session` function
- [ ] Set `STRIPE_SECRET_KEY` in Supabase secrets
- [ ] Set `APP_URL` in Supabase secrets (optional but recommended)
- [ ] Verify function appears in Supabase Dashboard
- [ ] Test subscribe button again
- [ ] Check browser console for errors
- [ ] Check function logs if still failing

---

## 📝 Next Steps After Fix

Once checkout works:
1. Test with test card: `4242 4242 4242 4242`
2. Verify subscription appears in database
3. Verify webhook receives events
4. Test "Manage Plan" button (portal session)







