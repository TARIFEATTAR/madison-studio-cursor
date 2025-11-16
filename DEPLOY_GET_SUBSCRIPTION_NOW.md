# Deploy get-subscription Function - Quick Guide

## 🎯 Your New Project
**Project ID:** `likkskifwsrvszxdvufw`  
**Project URL:** `https://likkskifwsrvszxdvufw.supabase.co`

---

## 🚀 Option 1: Deploy via Supabase Dashboard (Easiest)

### Step 1: Go to Functions Page
**Direct link:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions

### Step 2: Check if Function Exists
- Look for `get-subscription` in the functions list
- ✅ **If it exists:** Click on it → Check if it's active → If errors, click "Redeploy"
- ❌ **If it doesn't exist:** Continue to Step 3

### Step 3: Deploy the Function

**If function doesn't exist:**
1. Click **"Deploy Function"** or **"Deploy a new function"** button
2. **Function name:** `get-subscription`
3. **Upload method:**
   - Option A: Click **"Upload folder"** → Navigate to `supabase/functions/get-subscription` → Select the folder
   - Option B: Click **"Edit code"** → Paste the code below → Click **"Deploy"**

**If function exists but has errors:**
1. Click on `get-subscription`
2. Click **"Edit"** or **"View Source"**
3. Replace ALL code with the code below
4. Click **"Save"** then **"Deploy"**

### Step 4: Wait for Deployment
- Usually takes 30-60 seconds
- Status should show "Active" or "Deployed"
- No red error indicators

---

## 💻 Option 2: Deploy via CLI

### Step 1: Login to Supabase CLI
```bash
cd "/Users/jordanrichter/Documents/Asala Projects/Asala Studio/asala-studio"
supabase login
```
This will open your browser to authenticate.

### Step 2: Deploy Function
```bash
supabase functions deploy get-subscription --project-ref likkskifwsrvszxdvufw
```

---

## ✅ Verify Deployment

1. **Go to:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions
2. **Check:** `get-subscription` should appear in the list
3. **Status:** Should show "Active" or "Deployed"
4. **Test:** Refresh your billing page (hard refresh: Cmd+Shift+R)

---

## 📝 Function Code (if deploying manually)

```typescript
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  // Handle CORS preflight - return 204 No Content
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get organization for user
    const { data: orgMember } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .maybeSingle();

    // If no organization, return empty data (not an error - user may not have completed onboarding)
    if (!orgMember) {
      return new Response(
        JSON.stringify({
          subscription: null,
          paymentMethods: [],
          invoices: [],
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const organizationId = orgMember.organization_id;

    // Get subscription with plan details
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select(`
        *,
        subscription_plans (
          id,
          name,
          slug,
          description,
          price_monthly,
          price_yearly,
          features
        )
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Get payment methods
    const { data: paymentMethods } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('organization_id', organizationId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    // Get recent invoices
    const { data: invoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(10);

    return new Response(
      JSON.stringify({
        subscription: subscription || null,
        paymentMethods: paymentMethods || [],
        invoices: invoices || [],
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

---

## 🔍 Troubleshooting

**Error: "Edge Function returned a non-2xx status code"**
- Function might not be deployed → Deploy it using steps above
- Function might be returning an error → Check function logs in Supabase Dashboard

**Error: "Function not found"**
- Function definitely not deployed → Deploy it now

**After deployment, still getting errors:**
- Hard refresh browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Check browser console for specific error messages
- Check function logs in Supabase Dashboard → Edge Functions → get-subscription → Logs


