# Final Deployment Checklist - get-subscription Function

## ✅ Code Verification

The local code is now correct and matches the working pattern from `create-portal-session` and `create-checkout-session`.

**Key line (16-17):**
```typescript
if (req.method === 'OPTIONS') {
  return new Response('ok', { headers: corsHeaders });
}
```

## 🚀 Deployment Steps (You've Already Done This)

1. ✅ Code updated in Supabase Dashboard
2. ⏳ **Click "Deploy" or "Save"** (if you haven't already)
3. ⏳ **Wait 2-3 minutes** for deployment to propagate

## 🧪 Testing Steps

### Step 1: Wait for Deployment
- After clicking Deploy, wait 2-3 minutes
- Check function status shows "Active"

### Step 2: Clear Browser Cache
```bash
# Hard refresh
Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

# Or use incognito window
```

### Step 3: Test OPTIONS Request
Open browser console and run:
```javascript
fetch('https://iflwjiwkbxuvmiviqdxv.supabase.co/functions/v1/get-subscription', {
  method: 'OPTIONS'
})
.then(r => {
  console.log('Status:', r.status);
  console.log('OK:', r.ok);
  if (r.status === 200 && r.ok) {
    console.log('✅ CORS FIXED!');
  }
});
```

**Expected:** `Status: 200 OK: true`

### Step 4: Test Billing Page
1. Go to: `http://localhost:8080/settings` (Billing tab)
2. Check browser console (F12)
3. Should see:
   - ✅ No CORS errors
   - ✅ Subscription plans loading
   - ✅ No "Failed to send request" errors

## 🔍 If Still Not Working

### Check Function Logs
1. Supabase Dashboard → Edge Functions → `get-subscription` → **Logs** tab
2. Refresh billing page
3. Look for:
   - OPTIONS requests coming in
   - Any errors
   - "OPTIONS preflight request received" (if we added logging)

### Verify Deployment
1. Check "Last Deployed" timestamp in function details
2. Should be within last few minutes
3. If old, redeploy

### Nuclear Option: Delete and Recreate
If nothing works:
1. Delete the function in Supabase Dashboard
2. Create new function named `get-subscription`
3. Paste the code from `supabase/functions/get-subscription/index.ts`
4. Deploy

## 📋 Quick Status Check

After deployment, answer these:
- [ ] Function shows "Active" status?
- [ ] OPTIONS test returns Status 200?
- [ ] Billing page loads without CORS errors?
- [ ] Subscription plans appear?

Let me know what you see after testing!



