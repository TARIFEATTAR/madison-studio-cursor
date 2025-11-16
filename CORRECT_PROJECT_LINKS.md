# Correct Project Links - likkskifwsrvszxdvufw

## 🎯 Your Actual Project

**Project ID:** `likkskifwsrvszxdvufw`

---

## 📋 Quick Links

### Edge Functions
**Deploy functions here:**
https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions

### Secrets (Set Stripe Key)
**Set environment variables here:**
https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/settings/functions

### SQL Editor (Update Price IDs)
**Run SQL queries here:**
https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/sql/new

### Project Settings
https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/settings/general

---

## 🚀 Deploy Functions Now

### Option 1: Via Dashboard (Easiest)

1. **Go to:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions
2. **Click "Deploy Function"** or **"Deploy a new function"**
3. **For each function:**
   - `create-checkout-session`
   - `create-portal-session`
   - `get-subscription`
   - `stripe-webhook`
4. **Upload each folder** from `supabase/functions/`

### Option 2: Via CLI

```bash
cd "/Users/jordanrichter/Documents/Asala Projects/Asala Studio/asala-studio"

# Login first
supabase login

# Deploy all functions
./DEPLOY_FUNCTIONS_CORRECT_PROJECT.sh
```

---

## ✅ Step-by-Step Deployment

### 1. Deploy `create-checkout-session`

**Go to:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions

- Click "Deploy Function"
- Name: `create-checkout-session`
- Upload: `supabase/functions/create-checkout-session` folder
- Wait for deployment

### 2. Set Stripe Secret

**Go to:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/settings/functions

- Scroll to "Secrets"
- Add: `STRIPE_SECRET_KEY` = `sk_test_...` (from Stripe Dashboard)

### 3. Test!

- Refresh browser
- Go to Settings → Billing
- Click "Subscribe"
- Should work! 🎉

---

## ⚠️ Note About Project IDs

Your `.env` file shows: `iflwjiwkbxuvmiviqdxv`
But your actual project is: `likkskifwsrvszxdvufw`

**This is OK** - you might have multiple projects or switched projects. Just make sure you're deploying to the correct one!







