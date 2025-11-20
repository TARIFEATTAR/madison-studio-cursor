# Deploy Think Mode Chat Function - QUICK GUIDE

## 🎯 Your Project: Asala
**Project ID:** `likkskifwsrvszxdvufw`

---

## 🚀 QUICK FIX - Deploy Think Mode Chat

### Option 1: Deploy via Supabase Dashboard (RECOMMENDED)

1. **Go to Functions page:**
   - https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions

2. **Click "Deploy Function"** (or "Deploy a new function")

3. **Function name:** `think-mode-chat`

4. **Upload the folder:**
   - Location: `supabase/functions/think-mode-chat`
   - Upload the entire folder (including `index.ts`)

5. **Click "Deploy"** and wait 30-60 seconds

6. **Verify deployment:**
   - Should show as "Active" or "Deployed" with green status
   - Check logs for any errors

### Option 2: Deploy via CLI (if Supabase CLI is installed)

```bash
cd "/Users/jordanrichter/Documents/Asala Project/Asala Studio"
npx supabase functions deploy think-mode-chat --project-ref likkskifwsrvszxdvufw
```

---

## 🔑 CRITICAL: Set GEMINI_API_KEY Secret

This is **REQUIRED** for Think Mode to work!

1. **Go to Edge Functions Secrets:**
   - https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/settings/functions

2. **Click "Add secret"** (or "Manage secrets")

3. **Add these secrets:**

   | Secret Name | Where to Get It | Format |
   |-------------|-----------------|--------|
   | `GEMINI_API_KEY` | https://aistudio.google.com/apikey | `AIza...` |
   | `STRIPE_SECRET_KEY` | https://dashboard.stripe.com/test/apikeys | `sk_test_...` |
   | `ANTHROPIC_API_KEY` | https://console.anthropic.com/ | `sk-ant-...` |

4. **Save** and wait a few seconds for secrets to propagate

---

## ✅ Verify Deployment

### Test 1: Check Function Status

Go to: https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions

Look for:
- `think-mode-chat` - Should show "Active" with green status
- Last deployment time should be recent

### Test 2: Check Function Logs

1. Go to: https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions/think-mode-chat/logs
2. Look for any errors like:
   - "GEMINI_API_KEY is not configured"
   - "Authentication failed"
   - "Gemini API error"

### Test 3: Test in Browser

1. Open Think Mode page: `/think-mode`
2. Open browser console (F12)
3. Send a test message: "Hello Madison"
4. Check console for:
   ```
   [ThinkMode] Response status: 200
   [ThinkMode] Response content-type: text/event-stream
   [ThinkMode] Is stream: true
   ```

If you see `200` and `text/event-stream`, **it's working!**

---

## 🐛 Troubleshooting

### Issue: "Function not found" or 404 error
**Fix:** Function is not deployed. Follow deployment steps above.

### Issue: "AI service is not configured"
**Fix:** `GEMINI_API_KEY` is missing. Add it in Supabase secrets.

### Issue: "Authentication failed"
**Fix:** Check that you're logged in to the app. Try signing out and back in.

### Issue: "Stream completed but no content extracted"
**Fix:** Check function logs for errors. Might be an API quota issue with Gemini.

---

## 📋 Deployment Checklist

- [ ] Deploy `think-mode-chat` function to Supabase
- [ ] Deploy `marketplace-assistant` function (for brief chat)
- [ ] Set `GEMINI_API_KEY` in Supabase secrets
- [ ] Verify function shows "Active" status
- [ ] Test in browser (should see 200 response)
- [ ] Check function logs for errors

---

## 🎯 Also Deploy: Marketplace Assistant

The brief page also uses AI chat. Deploy this function too:

1. Go to: https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions
2. Click "Deploy Function"
3. Function name: `marketplace-assistant`
4. Upload folder: `supabase/functions/marketplace-assistant`
5. Click "Deploy"

Same GEMINI_API_KEY secret is used for both functions.

---

## 📝 Quick Reference

**Project:** Asala (`likkskifwsrvszxdvufw`)

**Functions to deploy:**
- `think-mode-chat` (standalone Think Mode page)
- `marketplace-assistant` (brief page chat)

**Required secrets:**
- `GEMINI_API_KEY` (get from https://aistudio.google.com/apikey)
- `STRIPE_SECRET_KEY` (get from https://dashboard.stripe.com/test/apikeys)

**Verify:**
- Functions page: https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions
- Secrets page: https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/settings/functions

---

## 💡 Next Steps

After deployment:
1. Refresh browser (Cmd+Shift+R)
2. Go to `/think-mode` page
3. Try sending a message
4. Check browser console for logs
5. Report back any errors you see

Good luck! 🚀



