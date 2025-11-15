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

    // Fetch website content
    const websiteResponse = await fetch(websiteUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MadisonBrandDNA/1.0)",
      },
    });

    if (!websiteResponse.ok) {
      throw new Error(`Failed to fetch website: ${websiteResponse.status}`);
    }

    const htmlContent = await websiteResponse.text();

    // Extract text content and preserve some structure
    const textContent = htmlContent
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 10000);

    // Extract CSS for color/font analysis
    const styleMatches = htmlContent.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
    const cssContent = styleMatches.join("\n").substring(0, 5000);

    console.log("Extracted content lengths - text:", textContent.length, "css:", cssContent.length);

    const aiData = await generateGeminiContent({
      systemPrompt: `You are a brand DNA analyst specializing in extracting visual brand identity from websites.

Analyze the provided website content and CSS to extract a comprehensive visual Brand DNA.

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
          content: `Analyze this website for Brand DNA:

TEXT CONTENT:
${textContent}

CSS CONTENT:
${cssContent}

Extract the visual brand identity as structured JSON.`,
        },
      ],
      responseMimeType: "application/json",
      maxOutputTokens: 2048,
      temperature: 0.2,
    });

    const analysisText = extractTextFromGeminiResponse(aiData);

    console.log("AI Analysis received");

    // Parse AI response
    let brandDNA;
    try {
      // Remove markdown code blocks if present
      const cleanedText = analysisText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      
      brandDNA = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      // Create fallback structure
      brandDNA = {
        brandName: "Brand",
        primaryColor: "#B8956A",
        colorPalette: [
          { hex: "#B8956A", name: "Primary", usage: "Brand color" }
        ],
        fonts: {
          headline: "Serif",
          body: "Sans-serif"
        },
        logo: { detected: false },
        visualStyle: {
          mood: "Professional and modern",
          photography: "Clean and minimal",
          composition: "Balanced"
        },
        rawAnalysis: analysisText
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
