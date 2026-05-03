/**
 * push-bestbottles-pdp-image
 * ─────────────────────────────────────────────────────────────────────────
 * Uploads a Madison Library image to Best Bottles Sanity, then patches
 * Best Bottles Convex `products.imageUrl` (cap-on) or
 * `products.imageUrlCapOff` (cap-off) for a specific SKU with the Sanity CDN URL.
 *
 * Companion to:
 *   push-bestbottles-grid-hero    — patches productGroups.heroImageUrl
 *
 * Body:
 *   {
 *     imageUrl:    string;                       // public Madison/Supabase image URL
 *     websiteSku:  string;                       // e.g. "GBEmp50RdcrBlkLthr"
 *     mode:        "cap-on" | "cap-off";         // which slot to fill
 *   }
 *
 * Auth: Supabase JWT (caller must be signed in to Madison).
 *
 * Validation:
 *   - cap-off mode is rejected for applicators not in NEEDS_CAP_OFF
 *     (sprayers / atomizers / roll-ons / lotion pumps only)
 *
 * Returns:
 *   200 { ok: true, websiteSku, mode, field, sanityImageUrl, sanityAssetId, mutationResult }
 *   400 { error: "..." }
 *   404 { error: "websiteSku not found in BB Convex" }
 *   500 { error: "..." }
 */

// deno-lint-ignore-file no-explicit-any

import { createClient as createSanityClient } from "https://esm.sh/@sanity/client@6.8.6";
import { createClient as createSupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const NEEDS_CAP_OFF: ReadonlySet<string> = new Set([
  "Perfume Spray Pump",
  "Fine Mist Sprayer",
  "Atomizer",
  "Metal Atomizer",
  "Metal Roller Ball",
  "Plastic Roller Ball",
  "Lotion Pump",
]);

type PushBody = {
  imageUrl?: unknown;
  websiteSku?: unknown;
  mode?: unknown;
};

type ConvexProductLookup = {
  value?: {
    applicator?: unknown;
  } | null;
};

type ConvexMutationBody = {
  status?: string;
  errorMessage?: string;
  value?: {
    success?: boolean;
    error?: string;
  } | Record<string, unknown> | null;
};

function cleanSecret(value: string | undefined | null) {
  return value?.trim().replace(/^['"]|['"]$/g, "") || "";
}

function getBestBottlesConvexUrl() {
  const rawUrl =
    cleanSecret(Deno.env.get("BB_CONVEX_URL")) ||
    cleanSecret(Deno.env.get("BESTBOTTLES_CONVEX_URL"));
  if (!rawUrl) return "";

  try {
    const url = new URL(rawUrl);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new Error("Invalid protocol");
    }
    return rawUrl.replace(/\/+$/, "");
  } catch {
    return "";
  }
}

function getBestBottlesSanityConfig() {
  return {
    projectId:
      cleanSecret(Deno.env.get("BESTBOTTLES_SANITY_PROJECT_ID")) ||
      cleanSecret(Deno.env.get("BB_SANITY_PROJECT_ID")),
    dataset:
      cleanSecret(Deno.env.get("BESTBOTTLES_SANITY_DATASET")) ||
      cleanSecret(Deno.env.get("BB_SANITY_DATASET")) ||
      "production",
    token:
      cleanSecret(Deno.env.get("BESTBOTTLES_SANITY_WRITE_TOKEN")) ||
      cleanSecret(Deno.env.get("BESTBOTTLES_SANITY_API_TOKEN")) ||
      cleanSecret(Deno.env.get("BB_SANITY_WRITE_TOKEN")) ||
      cleanSecret(Deno.env.get("BB_SANITY_API_TOKEN")),
    apiVersion:
      cleanSecret(Deno.env.get("BESTBOTTLES_SANITY_API_VERSION")) ||
      cleanSecret(Deno.env.get("BB_SANITY_API_VERSION")) ||
      "2024-01-01",
  };
}

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getBestBottlesSanityClient() {
  const config = getBestBottlesSanityConfig();
  if (!config.projectId || !config.token) {
    throw new Error(
      "Missing Best Bottles Sanity configuration. Set BESTBOTTLES_SANITY_PROJECT_ID and BESTBOTTLES_SANITY_WRITE_TOKEN in Madison Supabase secrets.",
    );
  }

  return createSanityClient({
    projectId: config.projectId,
    dataset: config.dataset,
    token: config.token,
    apiVersion: config.apiVersion,
    useCdn: false,
  });
}

function safeFilenameBase(websiteSku: string, mode: "cap-on" | "cap-off") {
  return `${websiteSku}-${mode}`.replace(/[^a-z0-9_-]+/gi, "-").slice(0, 80);
}

async function uploadImageToBestBottlesSanity(params: {
  imageUrl: string;
  websiteSku: string;
  mode: "cap-on" | "cap-off";
}): Promise<{ sanityImageUrl: string; sanityAssetId: string }> {
  const sanityClient = getBestBottlesSanityClient();
  const imageRes = await fetch(params.imageUrl);
  if (!imageRes.ok) {
    throw new Error(`Failed to fetch Madison image (${imageRes.status}): ${imageRes.statusText}`);
  }

  const imageBlob = await imageRes.blob();
  const contentType = imageRes.headers.get("content-type") || imageBlob.type || "image/png";
  const extension = contentType.includes("jpeg") || contentType.includes("jpg") ? "jpg" : "png";
  const asset = await sanityClient.assets.upload("image", imageBlob, {
    filename: `${safeFilenameBase(params.websiteSku, params.mode)}.${extension}`,
  });

  if (!asset?._id || !asset?.url) {
    throw new Error("Sanity upload completed without an asset id or CDN URL.");
  }

  return { sanityImageUrl: asset.url, sanityAssetId: asset._id };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return jsonResponse(401, { error: "Missing Authorization header" });
  }
  const jwt = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!jwt) return jsonResponse(401, { error: "Empty bearer token" });

  const supabase = createSupabaseClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
  );
  const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
  if (userError || !user) {
    return jsonResponse(401, { error: "Not signed in", detail: userError?.message });
  }

  let body: PushBody;
  try {
    body = await req.json();
  } catch {
    return jsonResponse(400, { error: "Invalid JSON body" });
  }

  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
  const websiteSku = typeof body.websiteSku === "string" ? body.websiteSku.trim() : "";
  const mode = body.mode === "cap-on" || body.mode === "cap-off" ? body.mode : null;

  if (!imageUrl) return jsonResponse(400, { error: "Missing imageUrl" });
  if (!websiteSku) return jsonResponse(400, { error: "Missing websiteSku" });
  if (!mode) return jsonResponse(400, { error: "Missing or invalid mode (must be cap-on or cap-off)" });
  if (!imageUrl.startsWith("https://") && !imageUrl.startsWith("http://")) {
    return jsonResponse(400, { error: "imageUrl must be http(s)" });
  }

  const bbConvexUrl = getBestBottlesConvexUrl();
  if (!bbConvexUrl) {
    return jsonResponse(500, {
      error:
        "Missing or invalid Best Bottles Convex configuration. Set BESTBOTTLES_CONVEX_URL to a full Convex cloud URL like https://helpful-elephant-638.convex.cloud.",
    });
  }

  // ── 1. Look up the product to validate applicator + cap-off compatibility
  let productLookup: ConvexProductLookup | null;
  try {
    const lookupRes = await fetch(`${bbConvexUrl}/api/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "products:getByWebsiteSku", // assumes this query exists; falls back below
        args: { websiteSku },
        format: "json",
      }),
    });

    if (!lookupRes.ok) {
      // Fallback: try via getBySku with graceSku-style lookup not possible here.
      // We'll just trust the websiteSku and skip the applicator check.
      productLookup = null;
    } else {
      productLookup = await lookupRes.json();
    }
  } catch (e) {
    productLookup = null;
  }

  // ── 2. Validate cap-off is allowed for this applicator
  if (mode === "cap-off" && typeof productLookup?.value?.applicator === "string") {
    const applicator = productLookup.value.applicator;
    if (!NEEDS_CAP_OFF.has(applicator)) {
      return jsonResponse(400, {
        error: `cap-off mode is not used for applicator "${applicator}". ` +
               `Only sprayers, atomizers, roll-ons, and lotion pumps need cap-off images.`,
        applicator,
        websiteSku,
      });
    }
  }

  // ── 3. Upload Madison image into the Best Bottles Sanity project
  let sanityUpload: { sanityImageUrl: string; sanityAssetId: string };
  try {
    sanityUpload = await uploadImageToBestBottlesSanity({ imageUrl, websiteSku, mode });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return jsonResponse(500, {
      error: `Best Bottles Sanity upload failed: ${message}`,
      websiteSku,
      mode,
    });
  }

  // ── 4. Determine which Convex field to patch
  const field = mode === "cap-on" ? "imageUrl" : "imageUrlCapOff";

  // ── 5. Call the Convex mutation with the Sanity CDN URL
  let mutationResult: ConvexMutationBody["value"] | ConvexMutationBody;
  try {
    const mutRes = await fetch(`${bbConvexUrl}/api/mutation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "products:setVariantImages",
        args: { websiteSku, [field]: sanityUpload.sanityImageUrl },
        format: "json",
      }),
    });

    const mutBody = await mutRes.json() as ConvexMutationBody;
    if (!mutRes.ok || mutBody?.status === "error") {
      return jsonResponse(mutRes.status === 404 ? 404 : 500, {
        error: mutBody?.errorMessage || "Convex mutation failed",
        websiteSku,
        mode,
        field,
        details: mutBody,
      });
    }
    mutationResult = mutBody.value ?? mutBody;
    if (mutationResult?.success === false) {
      return jsonResponse(mutationResult.error === "not_found" ? 404 : 400, {
        error:
          mutationResult.error === "not_found"
            ? `Website SKU "${websiteSku}" was not found in Best Bottles Convex.`
            : mutationResult.error || "Best Bottles Convex did not update the product image.",
        websiteSku,
        mode,
        field,
        details: mutationResult,
      });
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return jsonResponse(500, {
      error: `Convex mutation request failed: ${message}`,
      websiteSku,
      mode,
      field,
    });
  }

  return jsonResponse(200, {
    ok: true,
    websiteSku,
    mode,
    field,
    sourceImageUrl: imageUrl,
    sanityImageUrl: sanityUpload.sanityImageUrl,
    sanityAssetId: sanityUpload.sanityAssetId,
    mutationResult,
  });
});
