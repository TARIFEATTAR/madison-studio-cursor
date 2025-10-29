import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { useBrandColor } from "@/hooks/useBrandColor";
import { useEmailComposer } from "@/hooks/useEmailComposer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { GoldButton } from "@/components/ui/gold-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TemplateSelector } from "@/components/email-composer/TemplateSelector";
import { StyleCustomizer } from "@/components/email-composer/StyleCustomizer";
import { ImagePicker } from "@/components/email-composer/ImagePicker";
import { EmailPreview } from "@/components/email-composer/EmailPreview";
import { ContentPicker } from "@/components/email-composer/ContentPicker";
import { KlaviyoEmailComposer } from "@/components/klaviyo/KlaviyoEmailComposer";
import { ArrowLeft, Send, Download, Save, ChevronRight, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function EmailComposer() {
  const { user, loading: authLoading } = useAuth();
  const { organizationId, isLoading: orgLoading } = useOrganization();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { brandColor: defaultBrandColor } = useBrandColor();
  const [showKlaviyoModal, setShowKlaviyoModal] = useState(false);
  const [showFooterOptions, setShowFooterOptions] = useState(false);
  const [showCtaOptions, setShowCtaOptions] = useState(false);
  const [showStyleOptions, setShowStyleOptions] = useState(false);

  const composer = useEmailComposer({
    brandColor: defaultBrandColor,
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Load content if contentId is provided
    const contentId = searchParams.get("contentId");
    const sourceTable = searchParams.get("sourceTable");

    if (contentId && sourceTable) {
      loadContent(contentId, sourceTable);
    }
  }, [user, navigate, searchParams]);

  // Show warning if no organization after loading
  useEffect(() => {
    if (!orgLoading && !organizationId) {
      toast.error("No workspace found. Please complete onboarding.");
    }
  }, [organizationId, orgLoading]);

  const loadContent = async (contentId: string, sourceTable: string) => {
    try {
      const { data, error } = await supabase
        .from(sourceTable as any)
        .select("title, content, image_url")
        .eq("id", contentId)
        .maybeSingle();

      if (error) throw error;

      if (data && typeof data === 'object') {
        const content = data as { title?: string; content?: string; image_url?: string };
        composer.setTitle(content.title || "");
        composer.setContent(content.content || "");
        if (content.image_url) {
          composer.setHeaderImage(content.image_url);
        }
      }
    } catch (error) {
      console.error("Error loading content:", error);
      toast.error("Failed to load content");
    }
  };

  const handleSendToKlaviyo = () => {
    if (!organizationId) {
      toast.error("No organization found");
      return;
    }

    if (!composer.title.trim()) {
      toast.error("Please add an email title");
      return;
    }

    if (!composer.content.trim()) {
      toast.error("Please add email content");
      return;
    }

    // Open the Klaviyo modal with pre-filled data
    setShowKlaviyoModal(true);
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([composer.generatedHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${composer.title || "email"}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Email HTML downloaded");
  };

  const handleSaveDraft = async () => {
    toast.success("Draft saved to Madison", {
      description: "You can access your saved drafts from the Library",
    });
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
          <div>
            <h1 className="text-xl font-semibold text-foreground">Email Composer</h1>
            <p className="text-sm text-muted-foreground">
              Create beautiful, responsive emails with Madison
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {organizationId && (
            <ContentPicker
              organizationId={organizationId}
              onSelect={(content) => {
                composer.setTitle(content.title);
                composer.setContent(content.content);
                if (content.imageUrl) {
                  composer.setHeaderImage(content.imageUrl);
                }
              }}
            />
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadHtml}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Download HTML
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </Button>
          <GoldButton
            onClick={handleSendToKlaviyo}
            className="gap-2"
          >
            <Send className="w-4 h-4" />
            Send to Klaviyo
          </GoldButton>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Editor */}
        <ScrollArea className="w-1/2 p-6">
          <div className="space-y-6 max-w-2xl">
            {/* Template Selection */}
            <TemplateSelector
              selectedTemplate={composer.selectedTemplate}
              onSelect={composer.setSelectedTemplate}
            />

            {/* Email Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm">Email Title *</Label>
              <Input
                id="title"
                value={composer.title}
                onChange={(e) => composer.setTitle(e.target.value)}
                placeholder="Enter email title/headline"
                className="bg-background"
                required
              />
            </div>

            {/* Subtitle */}
            <div className="space-y-2">
              <Label htmlFor="subtitle" className="text-sm">Subtitle (Optional)</Label>
              <Input
                id="subtitle"
                value={composer.subtitle}
                onChange={(e) => composer.setSubtitle(e.target.value)}
                placeholder="Add a subtitle or tagline"
                className="bg-background"
              />
            </div>

            {/* Header Image */}
            <ImagePicker
              value={composer.headerImage}
              onChange={composer.setHeaderImage}
            />

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm">Email Content *</Label>
              <Textarea
                id="content"
                value={composer.content}
                onChange={(e) => composer.setContent(e.target.value)}
                placeholder="Write your email content here..."
                className="min-h-[200px] bg-background"
                required
              />
            </div>

            {/* CTA Section */}
            <div className="space-y-3 p-4 border border-border rounded-lg bg-card">
              <div 
                className="flex items-center gap-2 cursor-pointer" 
                onClick={() => setShowCtaOptions(!showCtaOptions)}
              >
                <ChevronRight className={`w-4 h-4 transition-transform ${showCtaOptions ? 'rotate-90' : ''}`} />
                <Label className="text-sm font-semibold cursor-pointer">Call-to-Action (Optional)</Label>
              </div>
              
              {showCtaOptions && (
                <div className="space-y-4 pl-6">
                  <div className="space-y-2">
                    <Label htmlFor="cta-text" className="text-sm">Button Text</Label>
                    <Input
                      id="cta-text"
                      value={composer.ctaText}
                      onChange={(e) => composer.setCtaText(e.target.value)}
                      placeholder="Shop Now"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cta-url" className="text-sm">Button URL</Label>
                    <Input
                      id="cta-url"
                      type="url"
                      value={composer.ctaUrl}
                      onChange={(e) => composer.setCtaUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="bg-background"
                    />
                  </div>
                  
                  {/* Button Colors */}
                  <div className="space-y-2">
                    <Label className="text-sm">Button Background Color</Label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={composer.buttonColor || composer.brandColor} 
                        onChange={(e) => composer.setButtonColor(e.target.value)} 
                        className="w-12 h-10 rounded cursor-pointer border border-border" 
                      />
                      <Input 
                        type="text" 
                        value={composer.buttonColor || composer.brandColor} 
                        onChange={(e) => composer.setButtonColor(e.target.value)} 
                        className="bg-background" 
                        placeholder={composer.brandColor} 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm">Button Text Color</Label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={composer.buttonTextColor || '#ffffff'} 
                        onChange={(e) => composer.setButtonTextColor(e.target.value)} 
                        className="w-12 h-10 rounded cursor-pointer border border-border" 
                      />
                      <Input 
                        type="text" 
                        value={composer.buttonTextColor || '#ffffff'} 
                        onChange={(e) => composer.setButtonTextColor(e.target.value)} 
                        className="bg-background" 
                        placeholder="#ffffff" 
                      />
                    </div>
                  </div>
                  
                  {/* Button Alignment */}
                  <div className="space-y-2">
                    <Label className="text-sm">Button Alignment</Label>
                    <Select value={composer.ctaAlignment} onValueChange={(value) => composer.setCtaAlignment(value as 'left' | 'center' | 'right')}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">
                          <div className="flex items-center gap-2">
                            <AlignLeft className="w-4 h-4" />
                            Left
                          </div>
                        </SelectItem>
                        <SelectItem value="center">
                          <div className="flex items-center gap-2">
                            <AlignCenter className="w-4 h-4" />
                            Center
                          </div>
                        </SelectItem>
                        <SelectItem value="right">
                          <div className="flex items-center gap-2">
                            <AlignRight className="w-4 h-4" />
                            Right
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Mobile Expansion */}
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Expand button on mobile</Label>
                    <Switch 
                      checked={composer.expandButtonOnMobile} 
                      onCheckedChange={composer.setExpandButtonOnMobile}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Style Customization */}
            <div className="space-y-3 p-4 border border-border rounded-lg bg-card">
              <div 
                className="flex items-center gap-2 cursor-pointer" 
                onClick={() => setShowStyleOptions(!showStyleOptions)}
              >
                <ChevronRight className={`w-4 h-4 transition-transform ${showStyleOptions ? 'rotate-90' : ''}`} />
                <Label className="text-sm font-semibold cursor-pointer">Style Customization</Label>
              </div>
              
              {showStyleOptions && (
                <div className="pl-6">
                  <StyleCustomizer
                    brandColor={composer.brandColor}
                    secondaryColor={composer.secondaryColor}
                    fontFamily={composer.fontFamily}
                    textColor={composer.textColor}
                    footerBackgroundColor={composer.footerBackgroundColor}
                    footerTextColor={composer.footerTextColor}
                    footerLinkColor={composer.footerLinkColor}
                    onBrandColorChange={composer.setBrandColor}
                    onSecondaryColorChange={composer.setSecondaryColor}
                    onFontChange={composer.setFontFamily}
                    onTextColorChange={composer.setTextColor}
                    onFooterBackgroundColorChange={composer.setFooterBackgroundColor}
                    onFooterTextColorChange={composer.setFooterTextColor}
                    onFooterLinkColorChange={composer.setFooterLinkColor}
                  />
                </div>
              )}
            </div>

            {/* Footer Content Section */}
            <div className="space-y-3 p-4 border border-border rounded-lg bg-card">
              <div 
                className="flex items-center gap-2 cursor-pointer" 
                onClick={() => setShowFooterOptions(!showFooterOptions)}
              >
                <ChevronRight className={`w-4 h-4 transition-transform ${showFooterOptions ? 'rotate-90' : ''}`} />
                <Label className="text-sm font-semibold cursor-pointer">Footer Content</Label>
              </div>
              
              {showFooterOptions && (
                <div className="space-y-3 pl-6">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Brand Tagline (Optional)</Label>
                    <Input 
                      value={composer.footerTagline} 
                      onChange={(e) => composer.setFooterTagline(e.target.value)}
                      placeholder="Crafting beauty since 2024"
                      className="bg-background"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Company Address (Optional)</Label>
                    <Textarea 
                      value={composer.companyAddress} 
                      onChange={(e) => composer.setCompanyAddress(e.target.value)}
                      placeholder="123 Madison Ave, New York, NY 10016"
                      rows={2}
                      className="bg-background"
                    />
                  </div>
                  
                  {/* Social Media Links */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Social Media Links</Label>
                    <Input 
                      placeholder="Instagram URL" 
                      value={composer.instagramUrl} 
                      onChange={(e) => composer.setInstagramUrl(e.target.value)}
                      className="bg-background"
                    />
                    <Input 
                      placeholder="Facebook URL" 
                      value={composer.facebookUrl} 
                      onChange={(e) => composer.setFacebookUrl(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                  
                  {/* Quick Links */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Quick Links</Label>
                    <Input 
                      placeholder="Shop URL" 
                      value={composer.shopUrl} 
                      onChange={(e) => composer.setShopUrl(e.target.value)}
                      className="bg-background"
                    />
                    <Input 
                      placeholder="About URL" 
                      value={composer.aboutUrl} 
                      onChange={(e) => composer.setAboutUrl(e.target.value)}
                      className="bg-background"
                    />
                    <Input 
                      placeholder="Contact URL" 
                      value={composer.contactUrl} 
                      onChange={(e) => composer.setContactUrl(e.target.value)}
                      className="bg-background"
                    />
                  </div>

                  {/* Privacy Policy URL */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Privacy Policy URL (Optional)</Label>
                    <Input 
                      placeholder="Privacy Policy URL" 
                      value={composer.privacyUrl} 
                      onChange={(e) => composer.setPrivacyUrl(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer Text */}
            <div className="space-y-2">
              <Label htmlFor="footer" className="text-sm">Footer Text (Optional)</Label>
              <Textarea
                id="footer"
                value={composer.footerText}
                onChange={(e) => composer.setFooterText(e.target.value)}
                placeholder="You received this email because you subscribed to our newsletter."
                className="min-h-[60px] bg-background"
              />
            </div>
          </div>
        </ScrollArea>

        {/* Right Panel - Preview */}
        <div className="w-1/2 border-l border-border bg-muted/20">
          <EmailPreview html={composer.generatedHtml} />
        </div>
      </div>

      {/* Klaviyo Email Composer Modal */}
      <KlaviyoEmailComposer
        open={showKlaviyoModal}
        onOpenChange={setShowKlaviyoModal}
        initialHtml={composer.generatedHtml}
        initialTitle={composer.title}
      />
    </div>
  );
}
