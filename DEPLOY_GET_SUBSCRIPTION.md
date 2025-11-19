# Deploy get-subscription Function

## Quick Deploy via Supabase Dashboard

You're at: https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions

### Steps:

1. **Click "Deploy a new function"** (green button, top right)

2. **Fill in the form:**
   - **Name:** `get-subscription`
   - **Select deployment method:** Choose one below

### Method 1: Deploy from GitHub (if connected)
- If your repo is connected to Supabase, select "Deploy from GitHub"
- Select your branch (main)
- Path: `supabase/functions/get-subscription`
- Click Deploy

### Method 2: Deploy from CLI (alternative)
If you have Supabase CLI access configured:

```bash
npx supabase functions deploy get-subscription --project-ref likkskifwsrvszxdvufw
```

---

## After Deployment

Once deployed, you should see `get-subscription` appear in the functions list with:
- Status: Active
- URL: `https://likkskifwsrvszxdvufw.supabase.co/functions/v1/get-subscription`

Then:
1. Go back to billing page: http://localhost:8080/settings
2. Hard refresh (Cmd+Shift+R)
3. Check console - errors should be gone!

---

## Alternative: Test without deploying

The main issue was the missing table, which we fixed. Let's test if the billing page works now even without redeploying the function.

**Try this:**
1. Go to: http://localhost:8080/settings (Billing tab)
2. Hard refresh: Cmd+Shift+R
3. Check browser console (F12)

If the only error is about the function not existing, we can deploy it. If the page loads the 3 plans, we might not need to deploy it at all!
















