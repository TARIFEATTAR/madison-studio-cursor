# Deploy get-subscription Function - CORS Fix

## What Was Fixed

The CORS preflight handler was returning the wrong status code. Updated to:
- Return `204 No Content` status for OPTIONS requests (proper HTTP standard)
- Return `null` body instead of `'ok'`
- Added `Access-Control-Max-Age` header for better caching

## How to Deploy

### Option 1: Supabase Dashboard (Recommended)

1. Go to: https://supabase.com/dashboard/project/iflwjiwkbxuvmiviqdxv/functions
2. Find `get-subscription` in the list
3. Click the **"Deploy"** or **"Redeploy"** button
4. Wait for deployment to complete (~30 seconds)

### Option 2: CLI with Access Token

If you have your Supabase access token:

```bash
npx supabase@latest functions deploy get-subscription \
  --project-ref iflwjiwkbxuvmiviqdxv \
  --access-token YOUR_ACCESS_TOKEN
```

## Verify Deployment

After deploying, check the function logs:
1. Go to: https://supabase.com/dashboard/project/iflwjiwkbxuvmiviqdxv/functions/get-subscription/logs
2. Look for any errors

## Test the Fix

1. Refresh your browser (hard refresh: Cmd+Shift+R or Ctrl+Shift+R)
2. Navigate to Settings → Billing
3. Check browser console - CORS errors should be gone
4. Plans should load from database

## What Changed in the Code

**Before:**
```typescript
if (req.method === 'OPTIONS') {
  return new Response('ok', { headers: corsHeaders });
}
```

**After:**
```typescript
if (req.method === 'OPTIONS') {
  return new Response(null, { 
    status: 204,
    headers: corsHeaders 
  });
}
```

The key changes:
- Status code: `204 No Content` (proper for OPTIONS)
- Body: `null` instead of `'ok'`
- Added `Access-Control-Max-Age` header

---

**After deploying, the CORS error should be resolved!** 🚀


