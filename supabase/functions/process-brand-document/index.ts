import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId } = await req.json();

    if (!documentId) {
      throw new Error('documentId is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Processing document: ${documentId}`);

    // Get document details
    const { data: document, error: docError } = await supabase
      .from('brand_documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      throw new Error(`Failed to fetch document: ${docError?.message}`);
    }

    console.log(`Document found: ${document.file_name}, type: ${document.file_type}`);

    // Update status to processing
    await supabase
      .from('brand_documents')
      .update({ processing_status: 'processing' })
      .eq('id', documentId);

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('brand-documents')
      .download(document.file_url.split('/').pop()!);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download file: ${downloadError?.message}`);
    }

    console.log(`File downloaded, size: ${fileData.size} bytes`);

    let extractedText = '';

    // Extract text based on file type
    if (document.file_type === 'application/pdf') {
      // For PDFs, we'll use a simple text extraction approach
      // In production, you might want to use a more robust PDF parser
      const arrayBuffer = await fileData.arrayBuffer();
      const decoder = new TextDecoder('utf-8');
      const text = decoder.decode(arrayBuffer);
      
      // Basic PDF text extraction (this is simplified)
      // Extract text between common PDF text markers
      const textMatches = text.match(/\(([^)]+)\)/g);
      if (textMatches) {
        extractedText = textMatches
          .map(match => match.slice(1, -1))
          .join(' ')
          .replace(/\\n/g, '\n')
          .replace(/\\/g, '');
      }

      // If basic extraction didn't work, try to get any readable text
      if (!extractedText || extractedText.length < 100) {
        extractedText = text
          .replace(/[^\x20-\x7E\n]/g, ' ')
          .split('\n')
          .filter(line => line.trim().length > 3)
          .join('\n');
      }
    } else if (document.file_type.includes('text') || document.file_type.includes('markdown')) {
      extractedText = await fileData.text();
    } else {
      throw new Error(`Unsupported file type: ${document.file_type}`);
    }

    console.log(`Extracted ${extractedText.length} characters`);

    if (!extractedText || extractedText.length < 50) {
      throw new Error('Failed to extract meaningful content from document');
    }

    // Create content preview (first 500 chars)
    const contentPreview = extractedText.slice(0, 500) + (extractedText.length > 500 ? '...' : '');

    // Save extracted content
    const { error: updateError } = await supabase
      .from('brand_documents')
      .update({
        extracted_content: extractedText,
        content_preview: contentPreview,
        processing_status: 'completed',
      })
      .eq('id', documentId);

    if (updateError) {
      throw new Error(`Failed to save extracted content: ${updateError.message}`);
    }

    console.log(`Successfully processed document: ${document.file_name}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        contentLength: extractedText.length,
        preview: contentPreview 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing document:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Update status to failed if we have documentId
    try {
      const { documentId } = await req.json();
      if (documentId) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        await supabase
          .from('brand_documents')
          .update({ processing_status: 'failed' })
          .eq('id', documentId);
      }
    } catch (e) {
      console.error('Failed to update error status:', e);
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
