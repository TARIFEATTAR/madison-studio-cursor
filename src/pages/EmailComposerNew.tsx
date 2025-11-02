import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { useBrandColor } from "@/hooks/useBrandColor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ContentPicker } from "@/components/email-composer/ContentPicker";
import { MadisonSuggestions } from "@/components/email-composer/MadisonSuggestions";
import { EmailPreview } from "@/components/email-composer/EmailPreview";
import { ImageLibraryPicker } from "@/components/email-composer/ImageLibraryPicker";
import { LUXURY_TEMPLATES, generateLuxuryEmail } from "@/utils/luxuryEmailTemplates";
import { ArrowLeft, Download, Check, Monitor, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { embedImagesInHtml } from "@/utils/emailImageEmbedder";
import { supabase } from "@/integrations/supabase/client";

export default function EmailComposerNew() {
  const { user } = useAuth();
  const { organizationId } = useOrganization();
  const { brandColor } = useBrandColor();
  const navigate = useNavigate();

  // Step tracking
  const [activeStep, setActiveStep] = useState<"template" | "compose" | "preview">("template");

  // Email content state
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [headline, setHeadline] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [body, setBody] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaLink, setCtaLink] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [buttonStyle, setButtonStyle] = useState<"square" | "rounded" | "pill">("rounded");
  const [fontFamily, setFontFamily] = useState("Georgia, serif");

  // Preview state
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [generatedHtml, setGeneratedHtml] = useState("");

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    setActiveStep("compose");
  };

  const handleGeneratePreview = () => {
    if (!headline.trim()) {
      toast.error("Please add a headline");
      return;
    }

    const html = generateLuxuryEmail(selectedTemplate, {
      headline,
      imageUrl: imageUrl || undefined,
      body,
      ctaText: ctaText || undefined,
      ctaLink: ctaLink || undefined,
      backgroundColor,
      buttonStyle,
      brandColor: brandColor || "#1A1A1A",
      fontFamily,
    });

    setGeneratedHtml(html);
    setActiveStep("preview");
  };

  const handleDownloadHtml = async () => {
    try {
      const result = await embedImagesInHtml(generatedHtml);
      const blob = new Blob([result.html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${headline || "email"}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Email HTML downloaded");
    } catch (error) {
      console.error("Error downloading HTML:", error);
      toast.error("Failed to download HTML");
    }
  };

  const handleSaveToLibrary = async () => {
    if (!organizationId || !user) {
      toast.error("Must be logged in to save");
      return;
    }

    try {
      const { error } = await supabase.from('master_content').insert({
        title: headline,
        full_content: generatedHtml,
        collection: selectedTemplate,
        content_type: 'Email',
        organization_id: organizationId,
        created_by: user.id
      });

      if (error) throw error;
      
      toast.success("Email saved to Library");
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Failed to save email");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/library")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-xl font-semibold">Email Builder</h1>
        </div>

        {activeStep === "preview" && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadHtml}>
              <Download className="w-4 h-4 mr-2" />
              Download HTML
            </Button>
            <Button size="sm" onClick={handleSaveToLibrary}>
              Save to Library
            </Button>
          </div>
        )}
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-8 py-4 border-b border-border bg-muted/30">
        <button
          onClick={() => setActiveStep("template")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeStep === "template" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="text-sm font-medium">1. Template</span>
        </button>
        <div className="w-12 h-px bg-border" />
        <button
          onClick={() => selectedTemplate && setActiveStep("compose")}
          disabled={!selectedTemplate}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeStep === "compose" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground disabled:opacity-50"
          }`}
        >
          <span className="text-sm font-medium">2. Compose</span>
        </button>
        <div className="w-12 h-px bg-border" />
        <button
          onClick={() => generatedHtml && setActiveStep("preview")}
          disabled={!generatedHtml}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeStep === "preview" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground disabled:opacity-50"
          }`}
        >
          <span className="text-sm font-medium">3. Preview</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeStep === "template" && (
          <div className="h-full overflow-auto p-8">
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Choose Your Template</h2>
                <p className="text-muted-foreground">Select from luxury ecommerce or minimalist founder styles</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {LUXURY_TEMPLATES.map((template) => (
                  <Card
                    key={template.id}
                    className={`p-6 cursor-pointer transition-all hover:shadow-lg relative ${
                      selectedTemplate === template.id ? "border-2 border-primary" : ""
                    }`}
                    onClick={() => handleSelectTemplate(template.id)}
                  >
                    {selectedTemplate === template.id && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                    <div className="space-y-3">
                      <div className="text-3xl">{template.preview.split(' ')[0]}</div>
                      <div>
                        <h3 className="font-semibold text-lg">{template.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                      </div>
                      <div className="pt-2 text-xs text-muted-foreground">
                        {template.category === 'luxury-ecommerce' ? '🛍️ Luxury Ecommerce' : '✍️ Founder Minimalist'}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeStep === "compose" && (
          <div className="h-full flex">
            {/* Sidebar */}
            <div className="w-80 border-r border-border bg-muted/30 p-4 overflow-auto">
              <Tabs defaultValue="archive" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="archive" className="flex-1">Archive</TabsTrigger>
                  <TabsTrigger value="madison" className="flex-1">Madison</TabsTrigger>
                </TabsList>
                <TabsContent value="archive" className="mt-4">
                  {organizationId && (
                    <ContentPicker
                      organizationId={organizationId}
                      onSelect={(content) => {
                        setHeadline(content.title);
                        setBody(content.content);
                        if (content.imageUrl) setImageUrl(content.imageUrl);
                      }}
                    />
                  )}
                </TabsContent>
                <TabsContent value="madison" className="mt-4">
                  <MadisonSuggestions
                    onSelectHeadline={setHeadline}
                    onSelectCTA={setCtaText}
                    currentContent={body}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Main Editor */}
            <div className="flex-1 overflow-auto p-8">
              <div className="max-w-2xl mx-auto space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Compose Your Email</h2>
                  <p className="text-muted-foreground">Fill in your content and style options</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Headline *</Label>
                    <Input
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="Enter your email headline"
                    />
                  </div>

                  <ImageLibraryPicker
                    value={imageUrl}
                    onChange={setImageUrl}
                  />

                  <div className="space-y-2">
                    <Label>Body Text *</Label>
                    <Textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Write your email body..."
                      rows={8}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>CTA Text</Label>
                      <Input
                        value={ctaText}
                        onChange={(e) => setCtaText(e.target.value)}
                        placeholder="Shop Now"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CTA Link</Label>
                      <Input
                        value={ctaLink}
                        onChange={(e) => setCtaLink(e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <h3 className="font-semibold mb-4">Style Options</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Background Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="w-20"
                          />
                          <Input
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            placeholder="#FFFFFF"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Button Style</Label>
                        <div className="flex gap-2">
                          {(['square', 'rounded', 'pill'] as const).map((style) => (
                            <Button
                              key={style}
                              variant={buttonStyle === style ? "default" : "outline"}
                              size="sm"
                              onClick={() => setButtonStyle(style)}
                              className="capitalize"
                            >
                              {style}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleGeneratePreview} className="w-full" size="lg">
                    Generate Preview
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeStep === "preview" && (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-6 py-3 border-b border-border">
              <h2 className="text-lg font-semibold">Preview</h2>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "desktop" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("desktop")}
                >
                  <Monitor className="w-4 h-4 mr-2" />
                  Desktop
                </Button>
                <Button
                  variant={viewMode === "mobile" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("mobile")}
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  Mobile
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-muted/30 p-8">
              <EmailPreview html={generatedHtml} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
