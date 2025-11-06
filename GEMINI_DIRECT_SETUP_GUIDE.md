# Gemini Direct API Setup Guide

## Step 1: Get Your Gemini API Key

### Option A: Google AI Studio (Recommended for Workspace Subscriptions)

1. **Go to Google AI Studio**
   - Visit: https://aistudio.google.com/
   - Sign in with your Google account (the one with Gemini Workspace subscription)

2. **Get Your API Key**
   - Click on **"Get API Key"** in the left sidebar
   - If you see a workspace subscription, select it
   - Click **"Create API Key"**
   - Copy the API key (it starts with `AIza...`)

### Option B: Google Cloud Console (For Workspace/Enterprise)

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project (or create one)

2. **Enable Gemini API**
   - Navigate to **APIs & Services** → **Library**
   - Search for "Generative Language API"
   - Click **Enable**

3. **Create API Credentials**
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **API Key**
   - Copy the API key

### Important Notes:
- **Workspace Subscription**: If you have a Gemini Workspace/Ultra subscription, your API key should automatically use your subscription quota
- **Rate Limits**: Check your subscription tier for rate limits (requests per minute)
- **Keep it Secret**: Never commit API keys to git!

---

## Step 2: Add API Key to Supabase

### Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** → **Edge Functions** → **Secrets**
3. Click **Add new secret**
4. Add:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Your Gemini API key (starts with `AIza...`)
   - Click **Save**

### Using Supabase CLI

```bash
supabase secrets set GEMINI_API_KEY="AIzaSy..."
```

### For Local Development

```bash
# Add to supabase/.env.local
echo 'GEMINI_API_KEY=AIzaSy...' >> supabase/.env.local
```

Or use CLI:
```bash
supabase secrets set GEMINI_API_KEY="AIzaSy..." --local
```

---

## Step 3: Verify Your Setup

After adding the API key:

1. **Check the logs** when generating content
2. You should see: `"Using Gemini Direct API as primary"`
3. If you see errors, check:
   - API key is correct (starts with `AIza`)
   - API key has proper permissions
   - Gemini API is enabled in your Google Cloud project

---

## Step 4: Understanding the Priority Order

After setup, the system will use APIs in this order:

1. **Gemini Direct API** (if `GEMINI_API_KEY` is set) ← **NEW!**
2. **Anthropic Claude** (if `ANTHROPIC_API_KEY` is set)
3. **Lovable AI Gateway** (if `LOVABLE_API_KEY` is set)

**Why this order?**
- Gemini Direct is most cost-effective (your subscription)
- Claude is high quality but expensive
- Lovable is fallback for flexibility

---

## Troubleshooting

### "API key not found"
- Make sure you added `GEMINI_API_KEY` (not `GOOGLE_API_KEY` or similar)
- Check Supabase Edge Functions → Secrets

### "403 Forbidden" or "401 Unauthorized"
- Verify API key is correct
- Check if Gemini API is enabled in Google Cloud
- Ensure your subscription is active

### "429 Rate Limit Exceeded"
- Check your subscription tier limits
- You may need to upgrade your Gemini Workspace plan
- Consider implementing request queuing

### "Quota Exceeded"
- Your monthly quota may be used up
- Check Google Cloud Console → APIs & Services → Quotas
- Consider upgrading your subscription tier

---

## Cost Monitoring

### Check Your Usage

1. **Google Cloud Console**
   - Go to **APIs & Services** → **Dashboard**
   - Select "Generative Language API"
   - View usage metrics

2. **Google AI Studio**
   - Check your workspace dashboard
   - View API usage and quotas

### Expected Costs

- **Gemini Workspace Subscription**: Fixed monthly fee (check your tier)
- **Pay-per-use**: If you exceed quota, you may be charged per token
- **Recommended**: Monitor usage for first month to understand patterns

---

## Next Steps

After setup, you can:
- Monitor usage in Google Cloud Console
- Adjust API priority in code if needed
- Set up alerts for quota limits
- Optimize prompts to reduce token usage

---

## Support

If you encounter issues:
1. Check Supabase Edge Function logs
2. Verify API key in Google AI Studio
3. Check Google Cloud Console for quota limits
4. Review error messages in browser console





