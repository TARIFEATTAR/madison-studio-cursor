# Direct Link to Stripe Webhook Setup

## 🔗 Direct Link (after login):

**Stripe Dashboard - Webhooks:**
https://dashboard.stripe.com/test/webhooks

## 📋 What You'll See:

After clicking the link above:
1. You'll see a list of webhooks (or empty if none exist)
2. Look for a **"+ Add endpoint"** or **"Add endpoint"** button (usually top right)
3. Click it and you'll see a form

## ✅ Form Fields to Fill:

### Endpoint URL:
```
https://likkskifwsrvszxdvufw.supabase.co/functions/v1/stripe-webhook
```

### Description:
```
Madison Studio Billing Webhook
```

### Events to Select (check all 6):
- [x] `customer.subscription.created`
- [x] `customer.subscription.updated`
- [x] `customer.subscription.deleted`
- [x] `invoice.paid`
- [x] `invoice.payment_failed`
- [x] `payment_method.attached`

### After Saving:
- Copy the **Signing secret** (starts with `whsec_`)
- Add it to Supabase secrets as `STRIPE_WEBHOOK_SECRET`










