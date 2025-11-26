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

    // ------------------------------------------------------------------
    // 1. PREDEFINED BRANDS (Bypass AI/Scraping for perfect demos)
    // ------------------------------------------------------------------
    const PREDEFINED_BRANDS: Record<string, any> = {
      "drunkelephant": {
        brandName: "Drunk Elephant",
        primaryColor: "#EB008B", // Hot Pink
        colorPalette: [
          { hex: "#EB008B", name: "Hot Pink", usage: "Accents & CTAs" },
          { hex: "#FFF200", name: "Neon Yellow", usage: "Highlights" },
          { hex: "#00A99D", name: "Teal", usage: "Secondary accents" },
          { hex: "#333333", name: "Charcoal", usage: "Primary Text" },
          { hex: "#FFFFFF", name: "White", usage: "Backgrounds" }
        ],
        fonts: {
          headline: "Verlag, sans-serif",
          body: "Vulf Mono, monospace"
        },
        logo: {
          detected: true,
          description: "Simple elephant line drawing",
          url: "https://logo.clearbit.com/drunkelephant.com"
        },
        visualStyle: {
          mood: "Playful, Clinical, Colorful",
          photography: "Bright, high-contrast product shots",
          composition: "Clean layouts with neon pops"
        },
        brandMission: "To deliver clinically-effective, biocompatible skincare that supports skin's health and eliminates the 'Suspicious 6' ingredients.",
        brandEssence: "Clean, Playful, Clinical, Transparent, Colorful"
      },
      "nike": {
        brandName: "Nike",
        primaryColor: "#000000",
        colorPalette: [
          { hex: "#000000", name: "Black", usage: "Primary" },
          { hex: "#FFFFFF", name: "White", usage: "Background" },
          { hex: "#F5F5F5", name: "Light Grey", usage: "UI Elements" }
        ],
        fonts: {
          headline: "Futura, sans-serif",
          body: "Helvetica Now, sans-serif"
        },
        logo: {
          detected: true,
          description: "The Swoosh",
          url: "https://logo.clearbit.com/nike.com"
        },
        visualStyle: {
          mood: "Athletic, Bold, Inspirational",
          photography: "High-energy action shots",
          composition: "Dynamic and bold"
        },
        brandMission: "To bring inspiration and innovation to every athlete in the world. If you have a body, you are an athlete.",
        brandEssence: "Athletic, Inspirational, Bold, Innovative, Performance"
      }
    };

    // Check if URL matches a predefined brand
    const urlLower = websiteUrl.toLowerCase();
    for (const [key, data] of Object.entries(PREDEFINED_BRANDS)) {
      if (urlLower.includes(key)) {
        console.log(`🎯 Predefined brand match found for: ${key}`);

        // Save to Supabase (reusing existing logic structure)
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        await supabase.from("organizations").update({ brand_config: data }).eq("id", organizationId);
        await supabase.from("brand_knowledge").insert({
          organization_id: organizationId,
          knowledge_type: "brand_dna_scan",
          content: { ...data, sourceUrl: websiteUrl, scannedAt: new Date().toISOString(), method: "predefined" },
        });

        return new Response(
          JSON.stringify(data),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

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

    // ------------------------------------------------------------------
    // 2. LOGO EXTRACTION (Clearbit → Google Favicon fallback)
    // ------------------------------------------------------------------
    let logoUrl = "";
    const hostname = new URL(websiteUrl).hostname.replace('www.', '');

    try {
      // Try Clearbit first (best quality)
      const clearbitUrl = `https://logo.clearbit.com/${hostname}`;
      console.log(`Attempting Clearbit logo fetch: ${clearbitUrl}`);

      const clearbitResponse = await fetch(clearbitUrl, { method: 'HEAD' });
      if (clearbitResponse.ok) {
        logoUrl = clearbitUrl;
        console.log("✅ Clearbit logo found");
      } else {
        throw new Error("Clearbit logo not found");
      }
    } catch (clearbitError) {
      console.log("Clearbit failed, trying Google Favicon...");

      try {
        // Fallback to Google Favicon (lower quality but more reliable)
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=256`;
        const faviconResponse = await fetch(faviconUrl, { method: 'HEAD' });

        if (faviconResponse.ok) {
          logoUrl = faviconUrl;
          console.log("✅ Google Favicon found");
        }
      } catch (faviconError) {
        console.warn("Both logo services failed, will use placeholder");
      }
    }

    const userPrompt = fetchSuccess
      ? `Analyze this website for Brand DNA:

TEXT CONTENT:
${textContent}

CSS CONTENT:
${cssContent}

Extract the visual brand identity AND brand essence/mission as structured JSON.`
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
  },
  "brandMission": "1-2 sentence brand mission or purpose",
  "brandEssence": "3-5 keywords that capture the brand essence (e.g., 'Clean, Clinical, Playful')"
}

Focus on extracting actual colors from CSS (hex, rgb values), real font families used, and observable visual patterns.
For brandMission, extract from About sections, hero text, or taglines.
For brandEssence, identify the core personality traits of the brand.`,
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

        // Add the extracted logo URL
        if (logoUrl) {
          brandDNA.logo = {
            ...brandDNA.logo,
            url: logoUrl,
            detected: true
          };
        }
      } catch (parseError) {
        console.error("Failed to parse AI response as JSON:", parseError);
        throw new Error("Invalid JSON from AI");
      }

    } catch (aiError) {
      console.error("AI Generation failed, attempting Knowledge Scan fallback:", aiError);

      try {
        // Knowledge Scan Fallback: Ask AI to guess based on brand name/URL
        const hostname = new URL(websiteUrl).hostname.replace('www.', '');
        const brandName = hostname.split('.')[0].charAt(0).toUpperCase() + hostname.split('.')[0].slice(1);

        console.log(`Attempting Knowledge Scan for ${brandName}...`);

        const fallbackAiData = await generateGeminiContent({
          systemPrompt: `You are a brand expert. I cannot access the website for ${brandName} (${websiteUrl}).
          
Please generate a comprehensive visual Brand DNA for this brand based on your INTERNAL KNOWLEDGE.
If you know the brand (e.g. Drunk Elephant, Nike, Apple), use their real colors, fonts, and style.
If you don't know it, infer a likely style based on the name and industry.

Return ONLY valid JSON with this structure:
{
  "brandName": "${brandName}",
  "primaryColor": "#HEX",
  "colorPalette": [{ "hex": "#HEX", "name": "Name", "usage": "Usage" }],
  "fonts": { "headline": "Font Name", "body": "Font Name" },
  "logo": { "detected": false, "description": "Description of logo" },
  "visualStyle": { "mood": "Mood", "photography": "Style", "composition": "Layout" },
  "brandMission": "1-2 sentence mission",
  "brandEssence": "3-5 keywords"
}`,
          messages: [{ role: "user", content: `Generate Brand DNA for ${brandName}` }],
          responseMimeType: "application/json",
          maxOutputTokens: 1024,
          temperature: 0.4
        });

        const fallbackText = extractTextFromGeminiResponse(fallbackAiData);
        const cleanedFallbackText = fallbackText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        brandDNA = JSON.parse(cleanedFallbackText);

        // Add logo URL if we found one
        if (logoUrl) {
          brandDNA.logo = {
            ...brandDNA.logo,
            url: logoUrl,
            detected: true
          };
        }

        brandDNA.fallback = true; // Mark as fallback but AI-generated
        console.log("Knowledge Scan successful");

      } catch (knowledgeError) {
        console.error("Knowledge Scan failed, using ultimate safety net:", knowledgeError);

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
            detected: logoUrl ? true : false,
            description: logoUrl ? "Logo fetched from external service" : "Logo extraction failed, please upload manually",
            url: logoUrl || undefined
          },
          visualStyle: {
            mood: "Clean and professional",
            photography: "Standard web imagery",
            composition: "Standard layout"
          },
          brandMission: `${brandName} is committed to delivering quality products and services.`,
          brandEssence: "Professional, Reliable, Quality",
          fallback: true
        };
      }
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
