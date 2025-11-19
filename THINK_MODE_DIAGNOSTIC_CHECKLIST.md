# Think Mode Diagnostic Checklist

## Issue
Think Mode chat is not generating responses. This checklist will help identify the root cause.

## Step 1: Check Browser Console Logs

1. Open Think Mode page (`/think-mode`)
2. Open browser console (F12 or right-click → Inspect → Console)
3. Try sending a message in the chat
4. Look for these log messages:

```
[ThinkMode] Calling chat endpoint: https://...
[ThinkMode] Response status: ...
[ThinkMode] Response content-type: ...
[ThinkMode] Is stream: ...
```

### What the logs tell you:

- **If you see "Response status: 404"**: The edge function is not deployed
- **If you see "Response status: 401"**: Authentication issue
- **If you see "Response status: 500"**: Backend error (likely API key or code error)
- **If you see "AI service is not configured"**: GEMINI_API_KEY is missing in Supabase
- **If the endpoint URL looks wrong**: Environment variable issue

## Step 2: Verify Edge Function Deployment

Go to Supabase Dashboard → Edge Functions

### Check if `think-mode-chat` is deployed:

1. Navigate to: https://supabase.com/dashboard/project/[YOUR_PROJECT_ID]/functions
2. Look for function named: `think-mode-chat`
3. Check deployment status (should show green "Deployed")
4. Check last deployment time (should be recent if you've made changes)

### If NOT deployed:

Deploy the function manually:

```bash
cd "/Users/jordanrichter/Documents/Asala Project/Asala Studio"
npx supabase functions deploy think-mode-chat --project-ref YOUR_PROJECT_REF
```

## Step 3: Verify Supabase Secrets

Go to Supabase Dashboard → Project Settings → Edge Functions → Manage Secrets

### Required secrets:

1. **GEMINI_API_KEY** (CRITICAL - this is what powers Think Mode)
   - Should start with `AIza...`
   - Get from: https://aistudio.google.com/apikey
   
2. **SUPABASE_URL**
   - Your project's API URL
   - Format: `https://[project-id].supabase.co`
   
3. **SUPABASE_SERVICE_ROLE_KEY**
   - Found in: Project Settings → API → service_role key
   
4. **SUPABASE_ANON_KEY**
   - Found in: Project Settings → API → anon public key

### If GEMINI_API_KEY is missing:

1. Get API key from Google AI Studio: https://aistudio.google.com/apikey
2. In Supabase Dashboard, go to Project Settings → Edge Functions
3. Click "Add secret"
4. Name: `GEMINI_API_KEY`
5. Value: Your Gemini API key (starts with `AIza...`)
6. Save

## Step 4: Verify Frontend Environment Variables

Check your `.env` file at project root:

```bash
cat .env
```

### Required variables:

```env
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[your-anon-key]
```

If missing, create `.env` file at project root with these values from Supabase Dashboard → Project Settings → API.

## Step 5: Test Edge Function Directly

Test if the edge function is responding at all:

```bash
curl -i -X POST \
  'https://[your-project-id].supabase.co/functions/v1/think-mode-chat' \
  -H 'Authorization: Bearer [your-anon-key]' \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"test"}]}'
```

Replace:
- `[your-project-id]` with your Supabase project ID
- `[your-anon-key]` with your anon key from Supabase Dashboard

### Expected response:

- **200 OK** with `Content-Type: text/event-stream`: ✅ Working!
- **404**: Function not deployed
- **401**: Authentication issue
- **500 with "not configured"**: API key missing

## Step 6: Check Edge Function Logs

Go to Supabase Dashboard → Edge Functions → think-mode-chat → Logs

Look for recent errors:
- "GEMINI_API_KEY is not configured"
- "Authentication failed"
- "Gemini API error"

## Common Fixes

### Fix 1: Deploy the function
```bash
npx supabase functions deploy think-mode-chat --project-ref YOUR_PROJECT_REF
```

### Fix 2: Add GEMINI_API_KEY secret
1. Get key from: https://aistudio.google.com/apikey
2. Add in Supabase Dashboard → Project Settings → Edge Functions → Add secret

### Fix 3: Recreate .env file
```env
VITE_SUPABASE_URL=https://[your-project-id].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[your-anon-key]
```

### Fix 4: Restart dev server
```bash
npm run dev
```

## Next Steps

After completing these checks, please report back with:
1. What you see in the browser console
2. Whether `think-mode-chat` shows as deployed in Supabase
3. Whether `GEMINI_API_KEY` is set in Supabase secrets
4. Any error messages from edge function logs

This will help us pinpoint the exact issue and fix it quickly.

