import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { encode as base64Encode } from "https://deno.land/std@0.190.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let docIdForFail: string | null = null;

  try {
    const { documentId } = await req.json();
    if (!documentId) throw new Error("documentId is required");
    docIdForFail = documentId;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Processing Madison training document:", documentId);

    // Fetch document
    const { data: doc, error: docErr } = await supabase
      .from("madison_training_documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (docErr || !doc) throw new Error(`Failed to load document: ${docErr?.message}`);

    // Mark as processing
    await supabase
      .from("madison_training_documents")
      .update({ processing_status: "processing" })
      .eq("id", documentId);

    // Extract the storage path from file_url (handle both full URLs and paths)
    let filePath: string = doc.file_url;
    
    // If file_url is a full URL, extract just the path after the bucket name
    if (filePath.includes('storage/v1/object/')) {
      const match = filePath.match(/madison-training-docs\/(.+)$/);
      if (match && match[1]) {
        filePath = decodeURIComponent(match[1]);
      }
    }
    
    console.log("Downloading from bucket path:", filePath);
    const { data: fileData, error: dlErr } = await supabase
      .storage
      .from("madison-training-docs")
      .download(filePath);

    if (dlErr || !fileData) {
      console.error("Download error details:", dlErr);
      throw new Error(`Failed to download file: ${dlErr?.message || JSON.stringify(dlErr)}`);
    }

    if (doc.file_type !== "application/pdf") {
      throw new Error(`Unsupported file type: ${doc.file_type}`);
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = base64Encode(arrayBuffer);

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    console.log("Calling Lovable AI gateway for text extraction...");
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a precise extractor. Return only the raw text content from the provided PDF. No commentary." },
          {
            role: "user",
            content: [
              { type: "text", text: "Extract all textual content from this PDF, preserving readable structure where possible." },
              { type: "image_url", image_url: { url: `data:application/pdf;base64,${base64}` } },
            ],
          },
        ],
      }),
    });

    if (!aiResp.ok) {
      const t = await aiResp.text();
      throw new Error(`AI extraction failed: ${aiResp.status} - ${t}`);
    }

    const aiData = await aiResp.json();
    const extracted = aiData.choices?.[0]?.message?.content as string | undefined;
    if (!extracted || extracted.length < 20) throw new Error("No text extracted from PDF");

    await supabase
      .from("madison_training_documents")
      .update({ extracted_content: extracted, processing_status: "completed", updated_at: new Date().toISOString() })
      .eq("id", documentId);

    console.log("Extraction complete. Characters:", extracted.length);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("process-madison-training-document error:", e);

    // Attempt to mark as failed
    try {
      if (docIdForFail) {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        );
        await supabase
          .from("madison_training_documents")
          .update({ processing_status: "failed" })
          .eq("id", docIdForFail);
      }
    } catch (_) {}

    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
