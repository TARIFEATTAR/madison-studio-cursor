/**
 * Thin proxy from madison-app → Best Bottles Convex HTTP API.
 *
 * Madison consumes the Best Bottles Convex project but doesn't define its
 * schema. To avoid adding the `convex` client as a browser dependency and
 * to keep the deployment URL server-side, every Convex read from madison-app
 * flows through this function.
 *
 * Body shape:
 *   { "path": "products:getProductGroup", "args": { "slug": "cylinder-9ml-clear" } }
 *
 * Env required:
 *   BESTBOTTLES_CONVEX_URL — e.g. "https://precise-raccoon-123.convex.cloud"
 *
 * Requires a signed-in Supabase user (Authorization bearer token).
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const convexUrl = Deno.env.get("BESTBOTTLES_CONVEX_URL");
  if (!convexUrl) {
    return json(
      { error: "BESTBOTTLES_CONVEX_URL is not configured in the edge function environment." },
      500,
    );
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return json({ error: "Missing Authorization header" }, 401);
  }
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return json({ error: "Empty bearer token" }, 401);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
  );
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    console.log("auth validation failed", {
      userError: userError?.message,
      tokenPrefix: token.slice(0, 12) + "…",
      tokenLength: token.length,
    });
    return json(
      {
        error: "Not signed in",
        detail: userError?.message || "auth.getUser returned no user",
      },
      401,
    );
  }

  let parsed: { path?: unknown; args?: unknown };
  try {
    parsed = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  const path = typeof parsed.path === "string" ? parsed.path.trim() : "";
  if (!path || !path.includes(":")) {
    return json({ error: "Body.path must be a string like 'module:function'" }, 400);
  }
  const args =
    parsed.args && typeof parsed.args === "object" && !Array.isArray(parsed.args)
      ? (parsed.args as Record<string, unknown>)
      : {};

  const target = `${convexUrl.replace(/\/$/, "")}/api/query`;
  let convexResponse: Response;
  try {
    convexResponse = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, args, format: "json" }),
    });
  } catch (e) {
    return json(
      { error: `Upstream fetch failed: ${e instanceof Error ? e.message : String(e)}` },
      502,
    );
  }

  let convexBody: unknown;
  try {
    convexBody = await convexResponse.json();
  } catch {
    return json({ error: "Upstream returned non-JSON response" }, 502);
  }

  if (!convexResponse.ok) {
    return json(
      {
        error: `Convex ${convexResponse.status}`,
        upstream: convexBody,
      },
      502,
    );
  }

  const body = convexBody as { status?: string; value?: unknown; errorMessage?: string };
  if (body?.status === "error") {
    return json({ error: body.errorMessage || "Convex returned error" }, 400);
  }

  return json({ value: body?.value ?? null }, 200);
});
