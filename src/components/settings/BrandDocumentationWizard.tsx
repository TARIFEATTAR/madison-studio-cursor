import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileText, Download, Upload, CheckCircle2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { BrandDocumentStatus } from "./BrandDocumentStatus";

const DOCUMENT_TEMPLATE = `# Brand Documents Template

Upload 1-2 documents with the following information. You can combine sections or split them across multiple documents.

---

## BRAND IDENTITY

**Brand Name:** Tarife Attar

**Tagline/Positioning:** [Your brand's positioning statement]

**Mission:** [Your brand's mission]

**Brand Story:** [Brief narrative about your brand's origin and purpose]

**Target Audience:** [Who are your ideal customers?]

**Brand Values:** [3-5 core values that guide your brand]

---

## VOICE & TONE

**Voice Characteristics:** [e.g., warm, sophisticated, approachable, expert]

**Tone Spectrum:** [When to be formal vs. casual, serious vs. playful]

**Writing Style:** [Sentence structure preferences, perspective (1st/2nd/3rd person), formality level]

---

## VOCABULARY & LANGUAGE

**Approved Words & Phrases:** [Brand-specific terminology you use]

**Forbidden Phrases:** [Words/phrases you never use]

**Competitor Language to Avoid:** [Terms your competitors use that you want to differentiate from]

---

## CONTENT PILLARS (Optional)

**Pillar 1:** [Topic name]
- Key messages
- Vocabulary specific to this topic

**Pillar 2:** [Topic name]
- Key messages  
- Vocabulary specific to this topic

---

## EDITORIAL STANDARDS (Optional)

**Claims Requiring Substantiation:** [What claims need evidence/disclaimers]

**Hyperbole Boundaries:** [How much exaggeration is acceptable]

**Comparison Guidelines:** [How to handle competitor comparisons]

---

## CHANNEL-SPECIFIC RULES (Optional)

**Instagram:**
- Caption style
- Hashtag strategy
- Emoji usage

**Email:**
- Subject line formulas
- Structure rules

**Blog Posts:**
- Length preferences
- SEO considerations

---

## VISUAL STANDARDS FOR AI (Optional)

**Photography Style:** [Bright, moody, minimalist, etc.]

**Lighting Preferences:** [Natural light, studio, etc.]

**Color Palette:** [Primary colors for imagery]

**Composition Rules:** [Center-focused, rule of thirds, etc.]

**Forbidden Visual Elements:** [What never to include]

---

**Note:** Not all sections are required. Start with Brand Identity, Voice & Tone, and Vocabulary - these are the most important for consistent content generation.`;

export function BrandDocumentationWizard() {
  const { user } = useAuth();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [brandDocuments, setBrandDocuments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchOrganizationId = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching organization:", error);
        return;
      }

      if (data?.organization_id) {
        setOrganizationId(data.organization_id);
      }
    };

    fetchOrganizationId();
  }, [user]);

  useEffect(() => {
    if (organizationId) {
      loadBrandDocuments();
    }
  }, [organizationId]);

  const loadBrandDocuments = async () => {
    if (!organizationId) return;

    try {
      const { data, error } = await supabase
        .from('brand_documents')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBrandDocuments(data || []);
    } catch (error) {
      console.error('Error loading brand documents:', error);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([DOCUMENT_TEMPLATE], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'brand-documents-template.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Template downloaded! Fill it out and upload when ready.");
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !organizationId) return;

    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        // Validate file type
        const validTypes = ['application/pdf', 'text/plain', 'text/markdown', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(file.type) && !file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
          toast.error(`${file.name}: Only PDF, TXT, MD, and DOCX files are supported`);
          continue;
        }

        // Upload to storage
        const fileExt = file.name.split('.').pop();
        const filePath = `${organizationId}/${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('brand-documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Create database record
        const { data: docData, error: insertError } = await supabase
          .from('brand_documents')
          .insert({
            organization_id: organizationId,
            file_name: file.name,
            file_type: file.type,
            file_url: filePath,
            processing_status: 'pending'
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Trigger processing
        const { error: processError } = await supabase.functions.invoke('process-brand-document', {
          body: { documentId: docData.id }
        });

        if (processError) {
          console.error('Processing error:', processError);
          toast.error(`${file.name}: Failed to start processing`);
        }
      }

      toast.success("Documents uploaded! Processing will begin shortly.");
      loadBrandDocuments();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Failed to upload documents");
    } finally {
      setIsUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-brass/20">
        <CardHeader>
          <CardTitle className="text-2xl font-serif text-charcoal flex items-center gap-2">
            <FileText className="w-6 h-6 text-brass" />
            Brand Documents
          </CardTitle>
          <CardDescription>
            Upload your brand guidelines to train Madison on your unique voice, vocabulary, and standards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Info Alert */}
          <Alert className="bg-amber-50 border-amber-200">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-900">
              <strong>Simple Approach:</strong> Most brands only need 1-2 documents. Download our template, fill in the sections that matter most to you, and upload. 
              Madison will extract the key information automatically.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={downloadTemplate}
              variant="outline"
              className="flex-1 border-brass/30 hover:bg-brass/5"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
            
            <label htmlFor="document-upload" className="flex-1">
              <Button
                type="button"
                onClick={() => document.getElementById('document-upload')?.click()}
                disabled={isUploading}
                className="w-full bg-brass hover:bg-brass/90 text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? "Uploading..." : "Upload Documents"}
              </Button>
              <input
                id="document-upload"
                type="file"
                accept=".pdf,.txt,.md,.docx"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <Separator />

          {/* What to Include */}
          <div>
            <h3 className="font-semibold text-charcoal mb-3">What to Include in Your Documents</h3>
            <div className="grid gap-3 text-sm">
              <div className="flex gap-2">
                <CheckCircle2 className="w-5 h-5 text-brass shrink-0 mt-0.5" />
                <div>
                  <strong>Essential:</strong> Brand name, voice characteristics, approved vocabulary, forbidden phrases
                </div>
              </div>
              <div className="flex gap-2">
                <CheckCircle2 className="w-5 h-5 text-brass shrink-0 mt-0.5" />
                <div>
                  <strong>Recommended:</strong> Brand story, target audience, mission, tone guidelines
                </div>
              </div>
              <div className="flex gap-2">
                <CheckCircle2 className="w-5 h-5 text-brass shrink-0 mt-0.5" />
                <div>
                  <strong>Optional:</strong> Channel-specific rules, content pillars, visual standards for AI images
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Document Status */}
          {organizationId && (
            <div>
              <h3 className="font-semibold text-charcoal mb-3">Your Uploaded Documents</h3>
              {brandDocuments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents uploaded yet. Start by downloading the template above.</p>
              ) : (
                <BrandDocumentStatus 
                  organizationId={organizationId}
                  documents={brandDocuments}
                  onRetry={loadBrandDocuments}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
