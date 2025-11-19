# Edge Functions – Permanent Fix Plan

This repo has two user-facing features that depend on Google Gemini:

- `supabase/functions/think-mode-chat` (Think Mode chat + inline brainstorming in Create)
- `supabase/functions/generate-madison-image` (Image Studio)

Both functions read **the same Supabase edge secret**: `GEMINI_API_KEY`.

When that secret is missing/rotated/expired, both features fail at the same time, and the logs show:

```
❌ Missing GEMINI_API_KEY env variable
Gemini API error: API key not valid
```

## Permanent Fix Checklist

1. **Store secrets once in Supabase**

   ```bash
   cd "/Users/jordanrichter/Documents/Asala Project/Asala Studio"
   npx supabase secrets set \
     GEMINI_API_KEY=AIza... \
     SUPABASE_URL=https://likkskifwsrvszxdvufw.supabase.co \
     SUPABASE_SERVICE_ROLE_KEY=<service_role> \
     SUPABASE_ANON_KEY=<anon_key> \
     --project-ref likkskifwsrvszxdvufw
   ```

   > Never rely on `.env` for edge functions—only Supabase secrets are visible inside Deno.

2. **Redeploy both functions after secrets change**

   ```bash
   npx supabase functions deploy think-mode-chat --project-ref likkskifwsrvszxdvufw
   npx supabase functions deploy generate-madison-image --project-ref likkskifwsrvszxdvufw
   ```

3. **Smoke-test**

   ```bash
   # Think Mode (expects 200 + text/event-stream)
   curl -i -X POST \
     'https://likkskifwsrvszxdvufw.supabase.co/functions/v1/think-mode-chat' \
     -H 'Authorization: Bearer <anon-or-service-role>' \
     -H 'Content-Type: application/json' \
     -d '{"messages":[{"role":"user","content":"test"}]}'

   # Image gen (expects 200 JSON with imageUrl)
   curl -i -X POST \
     'https://likkskifwsrvszxdvufw.supabase.co/functions/v1/generate-madison-image' \
     -H 'Authorization: Bearer <service-role>' \
     -H 'Content-Type: application/json' \
     -d '{"prompt":"test","organizationId":"..."}'
   ```

4. **Monitor Supabase logs**

   Supabase Dashboard → Edge Functions → Select function → Logs. Any `Gemini API error` or `Missing GEMINI_API_KEY` entry means the secret is broken again.

## Optional Hardening Ideas

- Add a scheduled GitHub Action that runs the curl health checks above and alerts Slack/email on failure.
- Add a fallback provider (Anthropic/OpenAI) inside the edge functions if Gemini is unavailable.
- Store a `DEPLOY_VERSION` constant inside each function so you can confirm from logs which build is live.

Keeping the secret in Supabase and redeploying both functions immediately after changes resolves the “edge function keeps failing” report permanently. All other failures we’ve seen trace back to this configuration step.

