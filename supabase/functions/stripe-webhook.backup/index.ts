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
      case "payment_method.attached": {
        const paymentMethod = event.data.object as Stripe.PaymentMethod;
        await handlePaymentMethodAttached(paymentMethod);
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

  if (!orgId || !userId) {
    console.error("Missing metadata in checkout session:", session.id);
    return;
  }

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
    .maybeSingle();

  if (!customer) {
    console.error("Customer not found for subscription:", subscription.id);
    return;
  }

  const price = subscription.items.data[0]?.price;
  
  await supabaseAdmin.from("subscriptions").upsert({
    organization_id: customer.organization_id,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: customerId,
    status: subscription.status,
    plan_id: price?.id || "",
    plan_name: price?.nickname || (typeof price?.product === "string" ? price.product : "Unknown"),
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
    .maybeSingle();

  if (!customer) {
    console.error("Customer not found for invoice:", invoice.id);
    return;
  }

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

async function handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod) {
  const customerId = paymentMethod.customer as string;
  
  const { data: customer } = await supabaseAdmin
    .from("stripe_customers")
    .select("organization_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (!customer) {
    return;
  }

  // Get payment method details from Stripe
  const pm = await stripe.paymentMethods.retrieve(paymentMethod.id);

  await supabaseAdmin.from("payment_methods").upsert({
    organization_id: customer.organization_id,
    stripe_payment_method_id: pm.id,
    stripe_customer_id: customerId,
    type: pm.type,
    card_brand: pm.card?.brand || null,
    card_last4: pm.card?.last4 || null,
    card_exp_month: pm.card?.exp_month || null,
    card_exp_year: pm.card?.exp_year || null,
    is_default: false, // Stripe will indicate default via customer.invoice_settings
  });
}


