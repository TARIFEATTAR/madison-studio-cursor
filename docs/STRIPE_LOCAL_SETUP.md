# Stripe Integration - Local Environment Setup Guide

This guide walks you through setting up Stripe integration in your local development environment.

## Prerequisites

- [x] Node.js and npm installed
- [x] Supabase CLI installed (`npm install -g supabase`)
- [x] Supabase local development running (`supabase start`)
- [x] Stripe account (you already have an approved account ✅)

---

## Step 1: Install Stripe Dependencies

### Frontend Dependencies

```bash
cd asala-studio
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### Backend Dependencies (Edge Functions)

The Stripe package will be imported in edge functions. Deno (used by Supabase Edge Functions) can import npm packages directly, so no additional installation needed.

---

## Step 2: Get Your Stripe API Keys

### Login to Your Existing Stripe Account

1. Go to https://stripe.com and log in to your approved account
2. **Important**: For local development, you should use **Test Mode** keys (even though your account is approved)
   - Test Mode allows you to test without processing real payments
   - You can switch between Test Mode and Live Mode using the toggle in the top right of the dashboard

### Get Test API Keys (for Local Development)

1. In Stripe Dashboard, make sure you're in **Test Mode** (toggle in top right should say "Test mode")
2. Go to **Developers** → **API keys**
3. Copy your keys:
   - **Publishable key** (starts with `pk_test_...`) - Safe to use in frontend
   - **Secret key** (starts with `sk_test_...`) - Keep secret, use only in backend

**Note**: Even though your account is approved, use test keys for local development. You'll use live keys (`pk_live_...` and `sk_live_...`) when deploying to production.

### Test Card Numbers

Stripe provides test card numbers for testing:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires 3D Secure**: `4000 0025 0000 3155`

Use any future expiry date, any 3-digit CVC, and any ZIP code.

---

## Step 3: Set Up Environment Variables

### Frontend Environment Variables

Create or update `.env.local` in the `asala-studio` directory:

```bash
# In asala-studio/.env.local
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

**Note**: The `VITE_` prefix is required for Vite to expose the variable to your frontend code.

### Backend Environment Variables (Supabase Edge Functions)

For local development, add Stripe secret key to Supabase secrets:

```bash
# Set Stripe secret key for local Supabase
supabase secrets set STRIPE_SECRET_KEY="sk_test_your_secret_key_here" --local
```

**Alternative**: Create `supabase/.env.local`:

```bash
# In supabase/.env.local
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here  # We'll get this in Step 5
```

---

## Step 4: Install Stripe CLI (for Webhook Testing)

The Stripe CLI allows you to test webhooks locally without deploying.

### Install Stripe CLI

**macOS (using Homebrew):**
```bash
brew install stripe/stripe-cli/stripe
```

**Other platforms:**
- Download from https://stripe.com/docs/stripe-cli
- Or use: `brew install stripe/stripe-cli/stripe` (if you have Homebrew)

### Login to Stripe CLI

```bash
stripe login
```

This will open your browser to authenticate. After login, you can forward webhooks to your local server.

---

## Step 5: Set Up Database Schema

Create a migration file for Stripe-related tables:

```bash
# Create a new migration
supabase migration new create_stripe_tables
```

This will create a file like: `supabase/migrations/YYYYMMDDHHMMSS_create_stripe_tables.sql`

Add the following SQL to that file:

```sql
-- Stripe Customers Table
CREATE TABLE public.stripe_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(organization_id)
);

-- Subscriptions Table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid')),
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Payment Methods Table
CREATE TABLE public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('card', 'bank_account')),
  card_brand TEXT,
  card_last4 TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Invoices Table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT NOT NULL UNIQUE,
  stripe_subscription_id TEXT,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'uncollectible', 'void')),
  invoice_pdf TEXT,
  hosted_invoice_url TEXT,
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stripe_customers
CREATE POLICY "Users can view their organization's customer"
ON public.stripe_customers
FOR SELECT
USING (is_organization_member(auth.uid(), organization_id));

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their organization's subscription"
ON public.subscriptions
FOR SELECT
USING (is_organization_member(auth.uid(), organization_id));

-- RLS Policies for payment_methods
CREATE POLICY "Users can view their organization's payment methods"
ON public.payment_methods
FOR SELECT
USING (is_organization_member(auth.uid(), organization_id));

-- RLS Policies for invoices
CREATE POLICY "Users can view their organization's invoices"
ON public.invoices
FOR SELECT
USING (is_organization_member(auth.uid(), organization_id));

-- Indexes for performance
CREATE INDEX idx_stripe_customers_org ON public.stripe_customers(organization_id);
CREATE INDEX idx_stripe_customers_stripe_id ON public.stripe_customers(stripe_customer_id);
CREATE INDEX idx_subscriptions_org ON public.subscriptions(organization_id);
CREATE INDEX idx_subscriptions_stripe_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX idx_payment_methods_org ON public.payment_methods(organization_id);
CREATE INDEX idx_invoices_org ON public.invoices(organization_id);
CREATE INDEX idx_invoices_stripe_id ON public.invoices(stripe_invoice_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stripe_customers_updated_at
BEFORE UPDATE ON public.stripe_customers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
BEFORE UPDATE ON public.payment_methods
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

Apply the migration:

```bash
supabase migration up
```

---

## Step 6: Create Stripe Edge Functions

### Function 1: Create Checkout Session

Create a new edge function:

```bash
supabase functions new create-checkout-session
```

This creates: `supabase/functions/create-checkout-session/index.ts`

Add this code:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2024-11-20.acacia",
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get user's organization
    const { data: orgMember } = await supabaseClient
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!orgMember) {
      return new Response(
        JSON.stringify({ error: "No organization found" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { planId, successUrl, cancelUrl } = await req.json();

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: planId, // e.g., "price_1234567890" from Stripe Dashboard
          quantity: 1,
        },
      ],
      success_url: successUrl || `${req.headers.get("origin")}/settings?tab=billing&success=true`,
      cancel_url: cancelUrl || `${req.headers.get("origin")}/settings?tab=billing&canceled=true`,
      customer_email: user.email,
      metadata: {
        organization_id: orgMember.organization_id,
        user_id: user.id,
      },
    });

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
```

### Function 2: Stripe Webhook Handler

Create another edge function:

```bash
supabase functions new stripe-webhook
```

Add this code to `supabase/functions/stripe-webhook/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2024-11-20.acacia",
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }
      case "invoice.paid":
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoiceUpdate(invoice);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400 }
    );
  }
});

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const orgId = session.metadata?.organization_id;
  const userId = session.metadata?.user_id;

  if (!orgId || !userId) return;

  // Get or create customer
  let customerId = session.customer as string;
  if (typeof customerId !== "string") {
    customerId = (session.customer as Stripe.Customer).id;
  }

  // Store customer
  await supabaseAdmin.from("stripe_customers").upsert({
    organization_id: orgId,
    user_id: userId,
    stripe_customer_id: customerId,
    email: session.customer_email || undefined,
  });

  // Get subscription
  const subscriptionId = session.subscription as string;
  if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await handleSubscriptionUpdate(subscription);
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  const { data: customer } = await supabaseAdmin
    .from("stripe_customers")
    .select("organization_id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (!customer) return;

  const price = subscription.items.data[0]?.price;
  
  await supabaseAdmin.from("subscriptions").upsert({
    organization_id: customer.organization_id,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: customerId,
    status: subscription.status,
    plan_id: price?.id || "",
    plan_name: price?.nickname || price?.product || "Unknown",
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
  });
}

async function handleInvoiceUpdate(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  
  const { data: customer } = await supabaseAdmin
    .from("stripe_customers")
    .select("organization_id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (!customer) return;

  await supabaseAdmin.from("invoices").upsert({
    organization_id: customer.organization_id,
    stripe_invoice_id: invoice.id,
    stripe_subscription_id: invoice.subscription as string || null,
    amount: invoice.amount_paid,
    currency: invoice.currency,
    status: invoice.status || "draft",
    invoice_pdf: invoice.invoice_pdf || null,
    hosted_invoice_url: invoice.hosted_invoice_url || null,
    period_start: invoice.period_start ? new Date(invoice.period_start * 1000).toISOString() : null,
    period_end: invoice.period_end ? new Date(invoice.period_end * 1000).toISOString() : null,
    paid_at: invoice.status === "paid" && invoice.status_transitions?.paid_at
      ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
      : null,
  });
}
```

### Update config.toml

Add these functions to `supabase/config.toml`:

```toml
[functions.create-checkout-session]
verify_jwt = true

[functions.stripe-webhook]
verify_jwt = false  # Webhooks don't use JWT auth
```

---

## Step 7: Set Up Stripe CLI Webhook Forwarding

In a separate terminal, start the Stripe CLI to forward webhooks to your local Supabase:

```bash
# Get your local Supabase function URL
# Usually: http://127.0.0.1:54321/functions/v1/stripe-webhook

stripe listen --forward-to http://127.0.0.1:54321/functions/v1/stripe-webhook
```

This will output a webhook signing secret like: `whsec_...`

**Copy this secret** and add it to your local environment:

```bash
supabase secrets set STRIPE_WEBHOOK_SECRET="whsec_..." --local
```

Or add to `supabase/.env.local`:

```
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Step 8: Create Products and Prices in Stripe Dashboard

Since you already have an approved Stripe account, you may already have products set up. You can either:

### Option A: Use Existing Products (if you have them)

1. Go to Stripe Dashboard → **Products** (make sure you're in **Test Mode**)
2. Find your existing product
3. Click on it to view the **Price ID** (starts with `price_...`)
4. Copy the Price ID - you'll need this in your frontend

### Option B: Create New Test Products

1. Go to Stripe Dashboard → **Products** (make sure you're in **Test Mode**)
2. Click **+ Add product**
3. Create a product (e.g., "Premium Plan")
4. Set pricing:
   - **Recurring**: Monthly
   - **Price**: $99.00
5. **Copy the Price ID** (starts with `price_...`) - you'll need this in your frontend

**Note**: Products in Test Mode are separate from Live Mode products. You can create test products without affecting your live products.

---

## Step 9: Test Your Setup

### Start Local Supabase

```bash
supabase start
```

### Start Frontend Dev Server

```bash
npm run dev
```

### Test Checkout Flow

1. Navigate to Settings → Billing
2. Click "Manage Plan" or "Subscribe"
3. You should be redirected to Stripe Checkout
4. Use test card: `4242 4242 4242 4242`
5. Complete the checkout
6. Check your Stripe Dashboard → Customers to see the test customer
7. Check your database to see the subscription record

---

## Step 10: Verify Everything Works

### Check Database

```bash
# Connect to local Supabase
supabase db reset  # If you want to start fresh
```

Or query via Supabase Studio (usually at http://localhost:54323)

### Check Logs

```bash
# View edge function logs
supabase functions logs create-checkout-session
supabase functions logs stripe-webhook
```

### Test Webhooks

The Stripe CLI terminal should show webhook events as they come in. You should see events like:
- `checkout.session.completed`
- `customer.subscription.created`
- `invoice.paid`

---

## Troubleshooting

### "STRIPE_SECRET_KEY not found"
- Make sure you set the secret: `supabase secrets set STRIPE_SECRET_KEY="sk_test_..." --local`
- Restart Supabase: `supabase stop && supabase start`

### Webhook signature verification fails
- Make sure `STRIPE_WEBHOOK_SECRET` matches what Stripe CLI shows
- Restart the Stripe CLI listener

### CORS errors
- Check that `corsHeaders` are included in edge function responses
- Verify your frontend URL matches the `origin` header

### Database errors
- Make sure migrations are applied: `supabase migration up`
- Check RLS policies allow your user to access the data

---

## Next Steps

Once local setup is working:

1. **Update BillingTab.tsx** to connect to real API endpoints
2. **Add subscription management** (cancel, update plan)
3. **Add payment method management**
4. **Style the checkout flow** to match your design system
5. **Deploy to production** (see Production Deployment section below)

---

## Production Deployment

Since you already have an approved Stripe account, when you're ready to deploy:

### 1. Get Live Mode API Keys

1. In Stripe Dashboard, switch to **Live Mode** (toggle in top right)
2. Go to **Developers** → **API keys**
3. Copy your **Live keys**:
   - **Publishable key** (starts with `pk_live_...`)
   - **Secret key** (starts with `sk_live_...`)

### 2. Set Production Environment Variables

**Frontend** (production environment):
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

**Backend** (Supabase production secrets):
```bash
supabase secrets set STRIPE_SECRET_KEY="sk_live_..." --project-ref your-project-ref
```

### 3. Set Up Production Webhooks

1. In Stripe Dashboard (Live Mode), go to **Developers** → **Webhooks**
2. Click **+ Add endpoint**
3. Enter your production webhook URL: `https://your-project.supabase.co/functions/v1/stripe-webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_...`)
6. Set it in Supabase production secrets:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET="whsec_..." --project-ref your-project-ref
   ```

### 4. Use Live Mode Products

Make sure you have products created in **Live Mode** (separate from test mode products). Use the Live Mode Price IDs in your production code.

---

## Quick Reference

### Environment Variables Needed

**Frontend** (`.env.local`):
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Backend** (`supabase/.env.local` or via `supabase secrets set`):
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Useful Commands

```bash
# Start Supabase locally
supabase start

# View logs
supabase functions logs <function-name>

# Apply migrations
supabase migration up

# Set secrets
supabase secrets set KEY="value" --local

# Forward webhooks
stripe listen --forward-to http://127.0.0.1:54321/functions/v1/stripe-webhook
```

---

## Resources

- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Stripe CLI Docs](https://stripe.com/docs/stripe-cli)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)

