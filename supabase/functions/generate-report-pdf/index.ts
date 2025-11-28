import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Generate PDF from report URL using headless browser
 * 
 * Route: /api/reports/[domain]/pdf
 * 
 * Uses browserless.io or similar service for PDF generation.
 * Falls back to browser print instructions if service unavailable.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain, scanId = 'latest' } = await req.json();

    if (!domain) {
      return new Response(
        JSON.stringify({ error: "Domain parameter required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[generate-pdf] Generating PDF for domain: ${domain}, scanId: ${scanId}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the report URL (frontend URL)
    const frontendUrl = Deno.env.get("FRONTEND_URL") || "https://mapsystem.io";
    const reportUrl = `${frontendUrl}/reports/${encodeURIComponent(domain)}?scanId=${scanId}`;

    console.log(`[generate-pdf] Report URL: ${reportUrl}`);

    // Try browserless.io first (if API key available)
    const BROWSERLESS_API_KEY = Deno.env.get("BROWSERLESS_API_KEY");
    const BROWSERLESS_URL = Deno.env.get("BROWSERLESS_URL") || "https://chrome.browserless.io";

    if (BROWSERLESS_API_KEY) {
      try {
        console.log(`[generate-pdf] Using browserless.io for PDF generation...`);
        
        // Call browserless.io PDF API
        const browserlessResponse = await fetch(`${BROWSERLESS_URL}/pdf?token=${BROWSERLESS_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: reportUrl,
            options: {
              format: 'A4',
              printBackground: true,
              margin: {
                top: '1cm',
                right: '1cm',
                bottom: '1cm',
                left: '1cm',
              },
              waitUntil: 'networkidle0',
            },
          }),
        });

        if (browserlessResponse.ok) {
          const pdfBuffer = await browserlessResponse.arrayBuffer();
          console.log(`[generate-pdf] PDF generated via browserless.io, size: ${pdfBuffer.byteLength} bytes`);
          
          // Upload to Supabase Storage
          const timestamp = Date.now();
          const fileName = `reports/${domain}/${timestamp}.pdf`;
          const latestFileName = `reports/${domain}/latest.pdf`;
          
          // Ensure reports bucket exists
          const { data: buckets } = await supabase.storage.listBuckets();
          const reportsBucketExists = buckets?.some(b => b.name === 'reports');
          
          if (!reportsBucketExists) {
            console.log(`[generate-pdf] Creating reports bucket...`);
            await supabase.storage.createBucket('reports', {
              public: true,
              fileSizeLimit: 52428800, // 50MB
            }).catch(() => {
              // Bucket might already exist, ignore error
            });
          }
          
          // Upload PDF files
          const { error: uploadError } = await supabase.storage
            .from('reports')
            .upload(fileName, pdfBuffer, {
              contentType: 'application/pdf',
              upsert: true,
            });
          
          if (uploadError) {
            console.error(`[generate-pdf] Upload error:`, uploadError);
            throw new Error(`Failed to upload PDF: ${uploadError.message}`);
          }
          
          // Also save as latest.pdf
          await supabase.storage
            .from('reports')
            .upload(latestFileName, pdfBuffer, {
              contentType: 'application/pdf',
              upsert: true,
            }).catch(err => {
              console.warn(`[generate-pdf] Failed to upload latest.pdf:`, err);
            });
          
          // Get public URLs
          const { data: { publicUrl } } = supabase.storage
            .from('reports')
            .getPublicUrl(fileName);
          
          const { data: { publicUrl: latestUrl } } = supabase.storage
            .from('reports')
            .getPublicUrl(latestFileName);
          
          console.log(`[generate-pdf] ✅ PDF generated successfully`);
          
          return new Response(
            JSON.stringify({
              pdfUrl: publicUrl,
              latestPdfUrl: latestUrl,
              generatedAt: new Date().toISOString(),
              size: pdfBuffer.byteLength,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } else {
          const errorText = await browserlessResponse.text();
          console.warn(`[generate-pdf] Browserless.io failed: ${browserlessResponse.status} - ${errorText}`);
        }
      } catch (browserlessError) {
        console.error(`[generate-pdf] Browserless.io error:`, browserlessError);
        // Fall through to alternative methods
      }
    }

    // Alternative: Try Playwright via esm.sh (may not work in Supabase Edge Functions)
    try {
      console.log(`[generate-pdf] Attempting Playwright via esm.sh...`);
      
      // Note: This may not work in Supabase Edge Functions due to browser binary requirements
      // But we'll try it as a fallback
      const playwright = await import("https://esm.sh/playwright@1.40.0");
      
      const browser = await playwright.chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      
      const page = await browser.newPage();
      await page.setViewportSize({ width: 1200, height: 1600 });
      
      await page.goto(reportUrl, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });
      
      await page.waitForSelector('.brand-report', { timeout: 10000 });
      await page.waitForTimeout(2000);
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '1cm',
          right: '1cm',
          bottom: '1cm',
          left: '1cm',
        },
      });
      
      await browser.close();
      
      // Upload to storage (same as above)
      const timestamp = Date.now();
      const fileName = `reports/${domain}/${timestamp}.pdf`;
      const latestFileName = `reports/${domain}/latest.pdf`;
      
      await supabase.storage.createBucket('reports', {
        public: true,
        fileSizeLimit: 52428800,
      }).catch(() => {});
      
      await supabase.storage
        .from('reports')
        .upload(fileName, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: true,
        });
      
      await supabase.storage
        .from('reports')
        .upload(latestFileName, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: true,
        }).catch(() => {});
      
      const { data: { publicUrl } } = supabase.storage
        .from('reports')
        .getPublicUrl(fileName);
      
      const { data: { publicUrl: latestUrl } } = supabase.storage
        .from('reports')
        .getPublicUrl(latestFileName);
      
      return new Response(
        JSON.stringify({
          pdfUrl: publicUrl,
          latestPdfUrl: latestUrl,
          generatedAt: new Date().toISOString(),
          size: pdfBuffer.length,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
      
    } catch (playwrightError) {
      console.error(`[generate-pdf] Playwright error:`, playwrightError);
      // Fall through to fallback
    }

    // Fallback: Return instructions for browser print-to-PDF
    console.log(`[generate-pdf] Falling back to browser print instructions`);
    
    return new Response(
      JSON.stringify({
        message: "PDF generation service not available",
        reportUrl: reportUrl,
        fallback: {
          instructions: [
            "1. Visit the report URL above",
            "2. Use browser print functionality (Cmd/Ctrl + P)",
            "3. Select 'Save as PDF'",
            "4. Choose A4 paper size",
            "5. Enable 'Background graphics'",
          ],
        },
        note: "To enable automatic PDF generation, configure BROWSERLESS_API_KEY in Supabase secrets or use a headless browser service.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[generate-pdf] Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : String(error),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
