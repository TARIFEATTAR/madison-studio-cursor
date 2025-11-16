# Debug: Why Checkout Redirect Isn't Working

## Quick Debugging Steps

### Step 1: Check Browser Console
1. Open your app: `http://localhost:8080`
2. Open DevTools (F12 or Cmd+Option+I)
3. Go to **Console** tab
4. Click "Subscribe" button
5. **Look for any red error messages** - copy them here

### Step 2: Check Network Tab
1. In DevTools, go to **Network** tab
2. Click "Subscribe" button
3. Look for a request to `create-checkout-session`
4. Click on it and check:
   - **Status**: Should be 200 (green) or show error code
   - **Response**: Click "Response" tab to see what the function returned
   - **Preview**: Click "Preview" tab to see formatted response

### Step 3: Check Edge Function Logs
1. Go to: https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions/create-checkout-session/logs
2. Click "Subscribe" in your app
3. **Refresh the logs page**
4. Look for any error messages

---

## Common Issues & Fixes

### Issue 1: "Failed to send request to Edge Function"
**Cause:** Function not deployed or wrong function name
**Fix:** 
- Verify function exists: https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions
- Check function name is exactly `create-checkout-session`

### Issue 2: "Unauthorized" or 401 error
**Cause:** Auth token missing or invalid
**Fix:**
- Make sure you're logged in
- Check browser console for auth errors

### Issue 3: "No organization found"
**Cause:** User hasn't completed onboarding
**Fix:**
- User needs to be part of an organization
- Check `organization_members` table

### Issue 4: "Plan not found"
**Cause:** Price IDs not set in database
**Fix:**
- Run the SQL script to update Price IDs
- Verify with: `SELECT name, slug, stripe_price_id_monthly FROM subscription_plans;`

### Issue 5: Function returns error but no redirect
**Cause:** Function is failing silently
**Fix:**
- Check function logs for the actual error
- Common: Missing `STRIPE_SECRET_KEY` secret

### Issue 6: Function succeeds but `data.url` is undefined
**Cause:** Response format mismatch
**Fix:**
- Check function returns `{ url: session.url }`
- Check browser console for what `data` actually contains

---

## What to Report Back

When debugging, please share:
1. **Browser Console Errors** (any red text)
2. **Network Request Status** (200, 400, 500, etc.)
3. **Network Response Body** (what the function returned)
4. **Edge Function Logs** (any errors from Supabase)







