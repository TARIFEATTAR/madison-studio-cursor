# Billing Migration Steps

## Quick Method: Use Supabase Dashboard SQL Editor

### Step 1: Open SQL Editor
1. Go to: https://supabase.com/dashboard/project/likkskifwsrvszxdvufw
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New query"** button

### Step 2: Run the Migration
1. Copy the entire contents of: `supabase/migrations/20251105103711_add_billing_tables.sql`
2. Paste it into the SQL Editor
3. Click **"Run"** button (or press `Cmd+Enter` / `Ctrl+Enter`)

### Step 3: Verify Success
You should see:
- ✅ "Success. No rows returned"
- Check the Table Editor to see the new tables:
  - `subscription_plans`
  - `subscriptions`
  - `payment_methods`
  - `invoices`

## What This Migration Creates

- **4 new tables** for billing and subscriptions
- **RLS policies** for security
- **Indexes** for performance
- **Default plans** (Free, Premium, Enterprise)
- **Updates** to `organizations` table

## Next Steps After Migration

1. Set up Stripe API keys in Supabase secrets
2. Create Edge Functions for Stripe integration
3. Update BillingTab component to use real data



