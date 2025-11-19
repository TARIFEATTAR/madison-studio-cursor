# Quick Copy - Stripe Webhook Setup

## Copy These Exactly:

### Webhook URL (paste into Stripe):
```
https://likkskifwsrvszxdvufw.supabase.co/functions/v1/stripe-webhook
```

### Events to Select (check all 6):
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.paid
- invoice.payment_failed
- payment_method.attached

### Supabase Secret to Add:
**Name:** `STRIPE_WEBHOOK_SECRET`  
**Value:** `whsec_...` (copy from Stripe after creating webhook)

---

## Quick Steps:

1. **Stripe Dashboard** → **Developers** → **Webhooks** → **"+ Add endpoint"**
2. **Paste webhook URL** (above)
3. **Select all 6 events** (above)
4. **Save** → **Copy signing secret** (`whsec_...`)
5. **Supabase Dashboard** → **Settings** → **Edge Functions** → **Secrets**
6. **Add secret**: `STRIPE_WEBHOOK_SECRET` = `whsec_...`
7. **Done!** ✅
















