# Gemini Direct API - Quick Start

## ✅ What I've Done

I've integrated Gemini Direct API into your codebase. Here's what changed:

1. **Added Gemini Direct API support** to `generate-with-claude` edge function
2. **Set priority order**: Gemini Direct → Claude → Lovable AI
3. **Updated API_KEY_SETUP.md** with Gemini instructions
4. **Created detailed setup guide** in `GEMINI_DIRECT_SETUP_GUIDE.md`

## 🚀 What You Need to Do (3 Steps)

### Step 1: Get Your Gemini API Key (5 minutes)

1. Go to https://aistudio.google.com
2. Sign in with your Google account (the one with Gemini Workspace subscription)
3. Click **"Get API Key"** in the left sidebar
4. Create a new API key or select your workspace
5. Copy the key (starts with `AIza...`)

### Step 2: Add to Supabase (2 minutes)

**Option A: Dashboard (Easiest)**
1. Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets
2. Click **Add new secret**
3. Name: `GEMINI_API_KEY`
4. Value: Your API key
5. Click **Save**

**Option B: CLI**
```bash
supabase secrets set GEMINI_API_KEY="AIzaSy..."
```

### Step 3: Test It! (1 minute)

1. Generate some content in your app
2. Check the browser console - you should see:
   - "Using Gemini Direct API as primary (cost-effective subscription)"
3. Content should generate successfully

## ✅ Verify It's Working

After adding the API key:

1. **Check logs**: Look in Supabase Edge Function logs for:
   ```
   Using API priority: Gemini Direct → Claude → Lovable AI
   Using Gemini Direct API as primary (cost-effective subscription)
   Sending request to Gemini Direct API
   ```

2. **Test generation**: Try generating content - it should work!

3. **Monitor costs**: Check Google Cloud Console to see usage

## 🎯 Expected Results

- **Cost**: Should use your Gemini Workspace subscription (fixed monthly cost)
- **Performance**: Similar or faster than current setup
- **Quality**: Gemini 2.0 Flash is excellent for content generation
- **Fallback**: If Gemini has issues, automatically falls back to Claude or Lovable

## ⚠️ Troubleshooting

### "API key not found"
- Make sure you added `GEMINI_API_KEY` (not `GOOGLE_API_KEY`)
- Check Supabase Edge Functions → Secrets

### "403 Forbidden"
- Verify API key is correct
- Check if Gemini API is enabled in Google Cloud
- Ensure your subscription is active

### "Model not found"
- The code uses `gemini-2.0-flash-exp` (experimental)
- If that doesn't work, we can change to `gemini-1.5-flash` or `gemini-1.5-pro`

### Still using Claude/Lovable?
- Check that `GEMINI_API_KEY` is set correctly
- Look at Edge Function logs to see why it's falling back

## 📊 Next Steps

Once it's working:
1. Monitor usage for 1 week
2. Compare costs (should be much lower!)
3. Check quality vs. Claude
4. Adjust if needed

## 💡 Pro Tips

- **Keep Claude as backup**: Quality is excellent, but expensive
- **Monitor quotas**: Check Google Cloud Console for usage
- **Adjust model**: Can switch to `gemini-1.5-pro` for better quality if needed

---

## Need Help?

If you run into issues:
1. Check `GEMINI_DIRECT_SETUP_GUIDE.md` for detailed troubleshooting
2. Review Supabase Edge Function logs
3. Verify API key in Google AI Studio

Good luck! 🚀





