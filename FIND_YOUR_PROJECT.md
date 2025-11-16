# Find Your Supabase Project - Quick Guide

## 🔍 The Issue

The project URL `https://supabase.com/dashboard/project/iflwjiwkbxuvmiviqdxv/functions` doesn't exist or you don't have access.

---

## ✅ Step 1: Find Your Correct Project

### Option A: Go to Supabase Dashboard Home

1. **Go to:** https://supabase.com/dashboard
2. **You'll see a list of all your projects**
3. **Find the project** that matches your `.env` file:
   - Your URL: `https://iflwjiwkbxuvmiviqdxv.supabase.co`
   - Look for project ID: `iflwjiwkbxuvmiviqdxv`
4. **Click on that project**

### Option B: Extract Project ID from Your URL

Your Supabase URL is: `https://iflwjiwkbxuvmiviqdxv.supabase.co`

The project ID is: `iflwjiwkbxuvmiviqdxv`

**Try this URL instead:**
- https://supabase.com/dashboard/project/iflwjiwkbxuvmiviqdxv

---

## ✅ Step 2: Access Edge Functions

Once you're in the correct project:

1. **Click "Edge Functions"** in the left sidebar
2. **Or go directly to:** https://supabase.com/dashboard/project/iflwjiwkbxuvmiviqdxv/functions

---

## ✅ Step 3: Alternative - Use Supabase CLI

If you can't access via Dashboard, use CLI:

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref iflwjiwkbxuvmiviqdxv

# Deploy function
supabase functions deploy create-checkout-session
```

---

## 🐛 If Project Still Doesn't Exist

**Possible reasons:**
1. Project was deleted
2. You don't have access to this project
3. Project ID changed
4. You're logged into a different Supabase account

**Solutions:**
1. **Check your Supabase account:** https://supabase.com/dashboard
2. **Verify the project exists** in your project list
3. **Check if you're logged into the correct account**
4. **Contact project owner** if it's a team project

---

## 💡 Quick Check

**Run this to verify your project:**
```bash
curl https://iflwjiwkbxuvmiviqdxv.supabase.co/rest/v1/ -H "apikey: YOUR_ANON_KEY"
```

If this works, the project exists and you just need to access it via Dashboard.

---

## 🎯 Next Steps

Once you can access the project:
1. Go to Edge Functions
2. Deploy `create-checkout-session`
3. Set `STRIPE_SECRET_KEY` secret
4. Test checkout







