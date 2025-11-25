import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  generateGeminiContent,
  extractTextFromGeminiResponse,
} from "../_shared/geminiClient.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { websiteUrl, organizationId } = await req.json();

    if (!websiteUrl || !organizationId) {
      return new Response(
        JSON.stringify({ error: "websiteUrl and organizationId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Analyzing Brand DNA for:", websiteUrl, "org:", organizationId);

    console.log("Analyzing Brand DNA for:", websiteUrl, "org:", organizationId);

    let textContent = "";
    let cssContent = "";
    let fetchSuccess = false;

    try {
      // Fetch website content with better headers to avoid bot detection
      // Add 10s timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const websiteResponse = await fetch(websiteUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
      });

      clearTimeout(timeoutId);

      if (websiteResponse.ok) {
        const htmlContent = await websiteResponse.text();

        // Extract text content and preserve some structure
        textContent = htmlContent
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .substring(0, 10000);

        // Extract CSS for color/font analysis
        const styleMatches = htmlContent.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
        cssContent = styleMatches.join("\n").substring(0, 5000);

        fetchSuccess = true;
        console.log("Extracted content lengths - text:", textContent.length, "css:", cssContent.length);
      } else {
        console.warn(`Failed to fetch website: ${websiteResponse.status} ${websiteResponse.statusText}`);
      }
    } catch (fetchError) {
      console.warn("Error fetching website, falling back to AI knowledge:", fetchError);
    }

    const userPrompt = fetchSuccess
      ? `Analyze this website for Brand DNA:

TEXT CONTENT:
${textContent}

CSS CONTENT:
${cssContent}

Extract the visual brand identity as structured JSON.`
      : `I could not access the website content directly (it may be protected). 
      
Please generate the Brand DNA for the brand at this URL: ${websiteUrl}

Rely on your internal knowledge about this brand. If you don't know the brand specifically, infer a likely brand identity based on the domain name and industry standards for that type of business.

Return the same JSON structure as requested.`;

    let brandDNA;

    try {
      const aiData = await generateGeminiContent({
        systemPrompt: `You are a brand DNA analyst specializing in extracting visual brand identity from websites.

Analyze the provided website content (or URL) to extract a comprehensive visual Brand DNA.

Return ONLY a valid JSON object (no markdown, no explanations) with this exact structure:
{
  "brandName": "Brand Name from website",
  "primaryColor": "#HEX color most prominent",
  "colorPalette": [
    { "hex": "#123456", "name": "Descriptive Name", "usage": "where it's used" }
  ],
  "fonts": {
    "headline": "Font Family Name, serif/sans-serif",
    "body": "Font Family Name, serif/sans-serif"
  },
  "logo": {
    "detected": true/false,
    "description": "description if found"
  },
  "visualStyle": {
    "mood": "3-5 word description of visual mood",
    "photography": "description of image style if detected",
    "composition": "layout/composition patterns"
  }
}

Focus on extracting actual colors from CSS (hex, rgb values), real font families used, and observable visual patterns.`,
        messages: [
          {
            role: "user",
            content: userPrompt,
          },
        ],
        responseMimeType: "application/json",
        maxOutputTokens: 2048,
        temperature: 0.2,
      });

      const analysisText = extractTextFromGeminiResponse(aiData);
      console.log("AI Analysis received");

      // Parse AI response
      try {
        // Remove markdown code blocks if present
        const cleanedText = analysisText
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();

        brandDNA = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error("Failed to parse AI response as JSON:", parseError);
        throw new Error("Invalid JSON from AI");
      }

    } catch (aiError) {
      console.error("AI Generation failed, using basic fallback:", aiError);

      // Ultimate Fallback: Generate basic data from URL
      const hostname = new URL(websiteUrl).hostname.replace('www.', '');
      const brandName = hostname.split('.')[0].charAt(0).toUpperCase() + hostname.split('.')[0].slice(1);

      brandDNA = {
        brandName: brandName,
        primaryColor: "#000000",
        colorPalette: [
          { hex: "#000000", name: "Primary", usage: "Main text" },
          { hex: "#FFFFFF", name: "Background", usage: "Page background" }
        ],
        fonts: {
          headline: "System UI, sans-serif",
          body: "System UI, sans-serif"
        },
        logo: {
          detected: false,
          description: "Logo extraction failed, please upload manually"
        },
        visualStyle: {
          mood: "Clean and professional",
          photography: "Standard web imagery",
          composition: "Standard layout"
        },
        fallback: true
      };
    }

    // Save to Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update organization with brand_config
    const { error: updateError } = await supabase
      .from("organizations")
      .update({
        brand_config: brandDNA
      })
      .eq("id", organizationId);

    if (updateError) {
      console.error("Error updating organization:", updateError);
      throw updateError;
    }

    // Also save to brand_knowledge for historical tracking
    const { error: insertError } = await supabase.from("brand_knowledge").insert({
      organization_id: organizationId,
      knowledge_type: "brand_dna_scan",
      content: {
        ...brandDNA,
        sourceUrl: websiteUrl,
        scannedAt: new Date().toISOString()
      },
    });

    if (insertError) {
      console.error("Error saving to brand_knowledge:", insertError);
      // Don't throw - org update succeeded
    }

    console.log("Brand DNA saved successfully");

    return new Response(
      JSON.stringify(brandDNA),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-brand-dna:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
