# Setup Verification Guide

## ✅ Quick Verification Steps

### Step 1: Test the App
1. **Start the dev server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Open your browser** to: `http://localhost:8080`

3. **What you should see:**
   - Landing page loads (no errors)
   - Can navigate to `/auth`
   - Google sign-in button works

### Step 2: Test Authentication
1. **Go to** `/auth` page
2. **Click "Continue with Google"**
3. **What should happen:**
   - Redirects to Google
   - You authorize the app
   - Redirects back to your app
   - You're signed in ✅

### Step 3: Test Database Connection
1. **After signing in**, you should:
   - Be redirected to `/dashboard` or `/onboarding`
   - If you see onboarding, complete it (creates your organization)
   - If you see dashboard, database is working ✅

### Step 4: Test Key Features
Navigate to these pages and verify they load:
- `/dashboard` - Main dashboard
- `/library` - Content library
- `/create` - Create content
- `/image-editor` - Image editor
- `/settings` - Settings page

**If all pages load without errors** → Database setup is working! ✅

---

## 🔍 How to Check Everything is Connected

### Check 1: Verify Environment Variables
Open browser DevTools (F12) → Console tab, run:
```javascript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
```
Should show: `https://likkskifwsrvszxdvufw.supabase.co`

### Check 2: Verify Supabase Connection
In DevTools → Network tab:
1. Filter by: `likkskifwsrvszxdvufw.supabase.co`
2. Sign in or navigate pages
3. You should see requests to your Supabase project ✅

### Check 3: Verify Database Tables
In Supabase Dashboard:
1. Go to: `https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/editor`
2. Check "Table Editor"
3. You should see tables like:
   - `organizations`
   - `master_content`
   - `prompts`
   - `outputs`
   - etc.

If tables exist → Migrations worked! ✅

---

## 🚨 Common Issues & Fixes

### Issue: "Provider is not enabled"
**Fix:** 
- Go to Supabase → Settings → Authentication → Providers
- Make sure Google is enabled and saved

### Issue: Redirect loop or stuck on loading
**Fix:**
- Check browser console for errors
- Verify `.env.local` has correct values
- Restart dev server

### Issue: Database errors
**Fix:**
- Check Supabase dashboard → Logs for errors
- Verify migrations completed successfully
- Check RLS policies are set correctly

---

## ✅ Everything Works If...

- [x] App loads at `http://localhost:8080`
- [x] Can sign in with Google
- [x] Redirects to dashboard after sign-in
- [x] Can navigate between pages
- [x] No console errors (except harmless warnings)
- [x] Database tables exist in Supabase
- [x] Can create/view content in the app

---

## 🎯 Next: Start Rebranding!

Once everything works, follow the **REBRAND_CHECKLIST.md** file to start rebranding!

**Recommended order:**
1. Update `index.html` (title, meta tags)
2. Replace logo files
3. Update colors in `src/index.css`
4. Search & replace "Madison" references
5. Update export filenames
6. Test everything

---

## 📞 Need Help?

If something doesn't work:
1. Check browser console for errors
2. Check Supabase dashboard → Logs
3. Verify environment variables are correct
4. Restart dev server








