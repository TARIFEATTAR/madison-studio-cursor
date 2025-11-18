# 🚀 Quick Migration Steps - Lovable to Vercel

## ⚡ Fast Track (5 Minutes)

### Step 1: Update Supabase Redirect URLs (2 min)

**Go to:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/auth/url-configuration

**Add these redirect URLs:**
```
https://madison-studio-cursor.vercel.app/**
https://madison-studio-cursor-*.vercel.app/**
```

**Set Site URL to:**
```
https://madison-studio-cursor.vercel.app
```

**Keep Lovable URLs for now** (you can remove them later after testing)

### Step 2: Verify Google OAuth (1 min)

**Go to:** Google Cloud Console → Your Project → Credentials

**Make sure you have:**
- ✅ `https://likkskifwsrvszxdvufw.supabase.co/auth/v1/callback`
- ✅ `https://likkskifwsrvszxdvufw.supabase.co/functions/v1/google-calendar-oauth/callback`

**You don't need to add Vercel URLs here** - Google redirects to Supabase first.

### Step 3: Test (2 min)

1. **Go to your Vercel app**
2. **Try Google sign-in**
3. **Should work!** ✅

---

## 🔄 What I Fixed in Code

I updated the edge function to use your Vercel domain instead of the hardcoded Lovable URL. This will be deployed automatically.

---

## ✅ Both Can Work Simultaneously

**Good news:** Supabase supports multiple redirect URLs, so:
- ✅ Lovable can still work (if you keep its URLs)
- ✅ Vercel will work (with new URLs)
- ✅ No conflicts!

**When ready to fully migrate:**
- Remove Lovable URLs from Supabase
- Only Vercel will work

---

## 🎯 Next Steps

1. **Add Vercel URLs to Supabase** (Step 1 above)
2. **Test Google sign-in on Vercel**
3. **Once confirmed working, remove Lovable URLs** (optional)

**That's it!** The code changes are already pushed and will deploy automatically.

