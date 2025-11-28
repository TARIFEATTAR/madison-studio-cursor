import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Generate PDF from report URL
 * 
 * Route: /api/reports/[domain]/pdf
 * 
 * This endpoint generates a PDF from the report page URL.
 * For now, returns a URL to the report page (PDF generation via Playwright/Puppeteer to be implemented).
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const domainIndex = pathParts.indexOf('reports');
    
    if (domainIndex === -1 || !pathParts[domainIndex + 1]) {
      return new Response(
        JSON.stringify({ error: "Domain parameter required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const domain = decodeURIComponent(pathParts[domainIndex + 1]);
    const scanId = url.searchParams.get('scanId') || 'latest';
    
    console.log(`[generate-pdf] Generating PDF for domain: ${domain}, scanId: ${scanId}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the report URL (frontend URL)
    const frontendUrl = Deno.env.get("FRONTEND_URL") || "https://mapsystem.io";
    const reportUrl = `${frontendUrl}/reports/${encodeURIComponent(domain)}?scanId=${scanId}`;

    console.log(`[generate-pdf] Report URL: ${reportUrl}`);

    // TODO: Implement actual PDF generation using Playwright/Puppeteer
    // For now, return instructions and the URL
    
    // Option 1: Use Playwright MCP tool (when available)
    // Option 2: Use Puppeteer/Playwright directly
    // Option 3: Use external service (browserless.io, etc.)
    
    // Example implementation structure:
    /*
    const browser = await playwright.chromium.launch();
    const page = await browser.newPage();
    await page.goto(reportUrl, { waitUntil: 'networkidle0' });
    
    // Wait for report to load
    await page.waitForSelector('.brand-report', { timeout: 10000 });
    
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
    
    // Upload to Supabase Storage
    const fileName = `reports/${domain}/${Date.now()}.pdf`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('reports')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });
    
    if (uploadError) throw uploadError;
    
    // Also save as latest.pdf
    const latestFileName = `reports/${domain}/latest.pdf`;
    await supabase.storage
      .from('reports')
      .upload(latestFileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });
    
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
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    */

    // Temporary response until PDF generation is implemented
    return new Response(
      JSON.stringify({
        message: "PDF generation not yet implemented",
        reportUrl: reportUrl,
        note: "Use browser print-to-PDF functionality for now. PDF generation via Playwright/Puppeteer will be implemented.",
        instructions: [
          "1. Visit the report URL above",
          "2. Use browser print functionality (Cmd/Ctrl + P)",
          "3. Select 'Save as PDF'",
          "4. Choose A4 paper size",
          "5. Enable 'Background graphics'",
        ],
      }),
      { status: 501, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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

