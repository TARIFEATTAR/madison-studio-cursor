import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface RequestPayload {
  domain?: string;
  scanId?: string;
  html?: string;
  storeInSupabase?: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain, scanId = "latest", html, storeInSupabase = false }: RequestPayload =
      await req.json();

    if (!domain && !html) {
      return new Response(
        JSON.stringify({ error: "Either domain or html is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase credentials not configured");
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    const browserlessApiKey = Deno.env.get("BROWSERLESS_API_KEY");
    const browserlessBase = Deno.env.get("BROWSERLESS_URL") || "https://chrome.browserless.io";
    if (!browserlessApiKey) {
      throw new Error("BROWSERLESS_API_KEY is not configured");
    }

    const frontendUrl = Deno.env.get("FRONTEND_URL") || "https://mapsystem.io";

    let reportUrl: string | undefined;
    if (domain) {
      reportUrl = `${frontendUrl}/reports/${encodeURIComponent(domain)}?scanId=${scanId}`;
    }

    let htmlContent = html || "";
    if (!htmlContent && reportUrl) {
      console.log(`[generate-pdf] Fetching HTML from ${reportUrl}`);
      const pageResponse = await fetch(reportUrl, {
        headers: { "User-Agent": "MadisonPDFService/1.0" },
      });
      if (!pageResponse.ok) {
        throw new Error(`Failed to load report HTML (${pageResponse.status})`);
      }
      htmlContent = await pageResponse.text();
    }

    if (!htmlContent.trim() && !reportUrl) {
      throw new Error("Unable to resolve HTML content for Browserless");
    }

    const payload: Record<string, unknown> = {
      pdf: {
        format: "A4",
        printBackground: true,
        margin: {
          top: "1cm",
          right: "1cm",
          bottom: "1cm",
          left: "1cm",
        },
      },
      timeout: 30000,
      close: true,
    };

    if (htmlContent.trim()) {
      payload.html = htmlContent;
    }
    if (reportUrl) {
      payload.url = reportUrl;
      payload.gotoOptions = { waitUntil: "networkidle0", timeout: 30000 };
    }

    const browserlessUrl = `${browserlessBase}/pdf?token=${browserlessApiKey}`;
    console.log("[generate-pdf] Calling Browserless…");
    const browserlessResponse = await fetch(browserlessUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!browserlessResponse.ok) {
      const errorText = await browserlessResponse.text();
      throw new Error(`Browserless PDF Generation Error: ${errorText}`);
    }

    const pdfArrayBuffer = await browserlessResponse.arrayBuffer();
    if (!pdfArrayBuffer || pdfArrayBuffer.byteLength === 0) {
      throw new Error("Browserless returned an empty PDF");
    }
    const pdfBytes = new Uint8Array(pdfArrayBuffer);

    let signedUrl: string | null = null;
    if (storeInSupabase && domain) {
      const bucketName = "reports";
      const filePath = `reports/${domain}/${Date.now()}.pdf`;

      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some((bucket) => bucket.name === bucketName);
      if (!bucketExists) {
        await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 52428800,
        });
      }

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, pdfBytes, {
          contentType: "application/pdf",
          cacheControl: "3600",
          upsert: true,
        });
      if (uploadError) {
        throw uploadError;
      }

      const { data: signed } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 60 * 60);
      signedUrl = signed?.signedUrl || null;
    }

    const fileSafeName = (domain || "madison_report")
      .replace(/[^a-z0-9_-]+/gi, "_")
      .replace(/_{2,}/g, "_")
      .toLowerCase();
    const responseHeaders = new Headers({
      ...corsHeaders,
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${fileSafeName}_${Date.now()}.pdf`,
      "Content-Length": String(pdfBytes.byteLength),
      "Cache-Control": "no-store",
    });
    if (signedUrl) {
      responseHeaders.set("X-Report-Url", signedUrl);
    }

    return new Response(pdfBytes, { headers: responseHeaders });
  } catch (error) {
    console.error("[generate-pdf] Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
