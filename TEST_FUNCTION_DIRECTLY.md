# Test get-subscription Function Directly

## The Code Looks Correct ✅

Your deployed code shows:
- ✅ `status: 200` for OPTIONS (line 18)
- ✅ CORS headers are set correctly
- ✅ Environment variables are accessed correctly

## But CORS Errors Persist

This suggests either:
1. **Deployment hasn't propagated yet** (can take 1-2 minutes)
2. **Browser cache** is still using old version
3. **Environment variables** might not be set (though Supabase should set them automatically)

## Test the Function Directly

### Step 1: Test OPTIONS Request

Run this in your browser console:

```javascript
fetch('https://iflwjiwkbxuvmiviqdxv.supabase.co/functions/v1/get-subscription', {
  method: 'OPTIONS',
  headers: {
    'Access-Control-Request-Method': 'GET',
    'Access-Control-Request-Headers': 'authorization',
    'Origin': 'http://localhost:8080'
  }
})
.then(async r => {
  console.log('=== OPTIONS TEST ===');
  console.log('Status:', r.status);
  console.log('Status Text:', r.statusText);
  console.log('OK:', r.ok);
  console.log('Headers:', Object.fromEntries(r.headers.entries()));
  const text = await r.text();
  console.log('Body:', text);
  console.log('===================');
  
  if (r.status === 200 && r.ok) {
    console.log('✅ CORS is FIXED!');
  } else {
    console.log('❌ CORS still broken - Status:', r.status);
  }
})
.catch(error => {
  console.error('=== ERROR ===');
  console.error(error);
});
```

**Expected if fixed:**
- Status: `200`
- OK: `true`
- Body: `""` (empty)

**If still broken:**
- Status: `0` or error
- CORS error in console

### Step 2: Test Actual GET Request

If OPTIONS works, test the actual request:

```javascript
// First get your auth token
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

if (!token) {
  console.error('Not logged in!');
} else {
  fetch('https://iflwjiwkbxuvmiviqdxv.supabase.co/functions/v1/get-subscription', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(async r => {
    console.log('=== GET TEST ===');
    console.log('Status:', r.status);
    console.log('OK:', r.ok);
    const data = await r.json();
    console.log('Response:', data);
    console.log('===============');
  })
  .catch(error => {
    console.error('Error:', error);
  });
}
```

## Check Function Logs

1. **Go to Supabase Dashboard:**
   - Edge Functions → `get-subscription` → **Logs** tab

2. **Look for:**
   - Recent OPTIONS requests
   - Any errors
   - Check if requests are reaching the function

3. **If you see errors about environment variables:**
   - Go to: Project Settings → Edge Functions → Secrets
   - Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
   - (They should be automatically set by Supabase)

## If Still Not Working

### Option 1: Add Explicit Environment Variable Checks

Update the function code to add error handling:

```typescript
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing environment variables:', {
    hasUrl: !!SUPABASE_URL,
    hasKey: !!SUPABASE_SERVICE_ROLE_KEY
  });
}
```

### Option 2: Wait and Retry

- Wait 2-3 minutes after deploying
- Hard refresh browser (Cmd+Shift+R)
- Try incognito window
- Clear browser cache completely

### Option 3: Verify Deployment

- In Supabase Dashboard → Edge Functions → `get-subscription`
- Check "Last Deployed" timestamp
- Make sure it's recent (within last few minutes)

## What to Share

After running the tests, share:
1. What status code the OPTIONS test returns
2. Any errors from the function logs
3. Whether the GET request works (if OPTIONS works)

This will help determine if it's a deployment issue, caching, or something else.



