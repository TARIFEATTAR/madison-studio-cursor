# Supabase URL Configuration Guide

## Overview

There are **two places** where Supabase URLs need to be configured:

1. **Frontend (`.env` file)** - For your React app
2. **Edge Functions (Supabase Dashboard)** - Automatically set, but good to verify

---

## 1. Frontend Configuration (`.env` file)

Your React app needs these environment variables in a `.env` file in the project root.

### Create/Update `.env` file:

```bash
# Supabase Project URL
VITE_SUPABASE_URL=https://iflwjiwkbxuvmiviqdxv.supabase.co

# Supabase Anon/Public Key (safe to expose in frontend)
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here

# Optional: Project ID
VITE_SUPABASE_PROJECT_ID=iflwjiwkbxuvmiviqdxv
```

### Where to get these values:

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard/project/iflwjiwkbxuvmiviqdxv/settings/api

2. **Copy these values:**
   - **Project URL**: `https://iflwjiwkbxuvmiviqdxv.supabase.co` (shown at top)
   - **anon/public key**: Copy the "anon public" key (starts with `eyJhbGci...`)

3. **Create `.env` file** in your project root:
   ```bash
   # In terminal, from project root:
   touch .env
   ```

4. **Add the values** to `.env`:
   ```bash
   VITE_SUPABASE_URL=https://iflwjiwkbxuvmiviqdxv.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=paste_your_anon_key_here
   ```

5. **Restart your dev server** after creating/updating `.env`:
   ```bash
   # Stop the server (Ctrl+C), then:
   npm run dev
   ```

### Verify Frontend Config:

Open browser console (F12) and run:
```javascript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Has Key:', !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
```

Should show:
- `Supabase URL: https://iflwjiwkbxuvmiviqdxv.supabase.co`
- `Has Key: true`

---

## 2. Edge Functions Configuration (Automatic)

Edge Functions automatically get these environment variables from Supabase:
- `SUPABASE_URL` - Automatically set to your project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Automatically set (secret key)

### Verify Edge Function Environment Variables:

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard/project/iflwjiwkbxuvmiviqdxv/settings/functions

2. **Check Secrets:**
   - These are automatically set by Supabase
   - You don't need to manually configure them
   - They're available to all Edge Functions

3. **Optional: View in Function Code:**
   - Edge Functions access them via: `Deno.env.get('SUPABASE_URL')`
   - This is already configured in your function code ✅

---

## Quick Checklist

- [ ] `.env` file exists in project root
- [ ] `VITE_SUPABASE_URL` is set to `https://iflwjiwkbxuvmiviqdxv.supabase.co`
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` is set (your anon key)
- [ ] Dev server restarted after creating `.env`
- [ ] Browser console shows correct URL when testing

---

## Troubleshooting

### Issue: "Cannot read property 'VITE_SUPABASE_URL'"
**Fix:** 
- Make sure `.env` file is in the project root (same folder as `package.json`)
- Restart dev server after creating/updating `.env`
- Check that variable names start with `VITE_` (required for Vite)

### Issue: "Invalid API key"
**Fix:**
- Verify you copied the **anon/public** key (not the service_role key)
- Check for extra spaces or quotes in `.env` file
- Make sure the key starts with `eyJhbGci...`

### Issue: Edge Function can't connect
**Fix:**
- Edge Functions automatically get `SUPABASE_URL` - no action needed
- If issues persist, check function logs in Supabase Dashboard

---

## Your Current Configuration

Based on your project:
- **Project URL**: `https://iflwjiwkbxuvmiviqdxv.supabase.co`
- **Project ID**: `iflwjiwkbxuvmiviqdxv`
- **Frontend needs**: `.env` file with `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
- **Edge Functions**: Automatically configured ✅

---

## Next Steps

1. **Check if `.env` exists:**
   ```bash
   ls -la .env
   ```

2. **If it doesn't exist, create it:**
   ```bash
   echo "VITE_SUPABASE_URL=https://iflwjiwkbxuvmiviqdxv.supabase.co" > .env
   echo "VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here" >> .env
   ```

3. **Get your anon key from Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard/project/iflwjiwkbxuvmiviqdxv/settings/api
   - Copy the "anon public" key
   - Replace `your_anon_key_here` in `.env`

4. **Restart dev server:**
   ```bash
   npm run dev
   ```

5. **Test:**
   - Open browser console
   - Run: `console.log(import.meta.env.VITE_SUPABASE_URL)`
   - Should show your Supabase URL



