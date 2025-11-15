# Billing Page Troubleshooting Guide

## Quick Checks

### 1. Check Browser Console
**Open browser DevTools (F12) → Console tab**

Look for errors like:
- `[BillingTab] get-subscription response:` - This will show what the function returned
- `[BillingTab] Function error:` - This will show the actual error
- Network errors (401, 404, 500)

### 2. Check if Function is Deployed

**Go to:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions

**Verify:**
- [ ] `get-subscription` appears in the list
- [ ] Status shows "Active" or "Deployed"
- [ ] No error indicators

**If NOT deployed:**
```bash
supabase functions deploy get-subscription
```

### 3. Check Function Logs

**Go to:** Supabase Dashboard → Edge Functions → `get-subscription` → Logs

**Look for:**
- Errors when you load the billing page
- Missing environment variables
- Database connection issues

### 4. Common Issues

#### Issue: Function not found (404)
**Symptom:** Console shows "Function not found" or 404 error
**Fix:** Deploy the function:
```bash
supabase functions deploy get-subscription
```

#### Issue: Unauthorized (401)
**Symptom:** Console shows 401 error
**Fix:** Check that you're logged in and session is valid

#### Issue: No organization found
**Symptom:** Console logs show "No organization found"
**Fix:** Complete onboarding first - this is expected if you haven't completed onboarding yet

#### Issue: Function error but page loads blank
**Symptom:** Console shows error, page is blank
**Fix:** The function may need to handle your specific case. Check logs.

---

## Manual Test

Open browser console and run:
```javascript
const { data: { session } } = await supabase.auth.getSession();
const response = await supabase.functions.invoke('get-subscription', {
  headers: { Authorization: `Bearer ${session.access_token}` }
});
console.log('Response:', response);
```

This will show you exactly what error is happening.

---

## What to Share for Help

If still not working, please share:
1. Browser console errors (screenshot or copy/paste)
2. Supabase function logs (from Dashboard → Functions → get-subscription → Logs)
3. What you see on the billing page (blank, error message, loading forever?)












