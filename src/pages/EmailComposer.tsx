import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { useBrandColor } from "@/hooks/useBrandColor";
import { useEmailComposer } from "@/hooks/useEmailComposer";
import { useAutoSave } from "@/hooks/useAutoSave";
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
import { AutosaveIndicator } from "@/components/ui/autosave-indicator";
import { ArrowLeft, Send, Download, Save, ChevronRight, AlignLeft, AlignCenter, AlignRight, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { serializeEmailState, deserializeEmailState } from "@/utils/emailStateSerializer";

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
  const [contentId, setContentId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const composer = useEmailComposer({
    brandColor: defaultBrandColor,
  });

  // Serialize email state for auto-save
  const serializedContent = serializeEmailState({
    ...composer,
    template: composer.selectedTemplate,
    generatedHtml: composer.generatedHtml
  });

  // Auto-save integration
  const { saveStatus, lastSavedAt, forceSave } = useAutoSave({
    content: serializedContent,
    contentId: contentId || undefined,
    contentName: composer.title || "Untitled Email",
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
      // For master_content, load the full serialized state
      if (sourceTable === 'master_content') {
        const { data, error } = await supabase
          .from('master_content')
          .select('id, title, full_content, collection')
          .eq('id', contentId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setContentId(data.id);
          
          // Deserialize the full email state
          if (data.full_content) {
            const emailState = deserializeEmailState(data.full_content);
            
            // Restore all composer state
            if (emailState.title) composer.setTitle(emailState.title);
            if (emailState.subtitle) composer.setSubtitle(emailState.subtitle);
            if (emailState.bodyHeader) composer.setBodyHeader(emailState.bodyHeader);
            if (emailState.content) composer.setContent(emailState.content);
            if (emailState.ctaText) composer.setCtaText(emailState.ctaText);
            if (emailState.ctaUrl) composer.setCtaUrl(emailState.ctaUrl);
            if (emailState.ctaAlignment) composer.setCtaAlignment(emailState.ctaAlignment);
            if (emailState.expandButtonOnMobile !== undefined) composer.setExpandButtonOnMobile(emailState.expandButtonOnMobile);
            if (emailState.headerImage) composer.setHeaderImage(emailState.headerImage);
            if (emailState.brandColor) composer.setBrandColor(emailState.brandColor);
            if (emailState.secondaryColor) composer.setSecondaryColor(emailState.secondaryColor);
            if (emailState.fontFamily) composer.setFontFamily(emailState.fontFamily);
            if (emailState.buttonColor) composer.setButtonColor(emailState.buttonColor);
            if (emailState.buttonTextColor) composer.setButtonTextColor(emailState.buttonTextColor);
            if (emailState.textColor) composer.setTextColor(emailState.textColor);
            if (emailState.contentAlignment) composer.setContentAlignment(emailState.contentAlignment);
            if (emailState.footerText) composer.setFooterText(emailState.footerText);
            if (emailState.footerBackgroundColor) composer.setFooterBackgroundColor(emailState.footerBackgroundColor);
            if (emailState.footerTextColor) composer.setFooterTextColor(emailState.footerTextColor);
            if (emailState.footerLinkColor) composer.setFooterLinkColor(emailState.footerLinkColor);
            if (emailState.footerTagline) composer.setFooterTagline(emailState.footerTagline);
            if (emailState.companyAddress) composer.setCompanyAddress(emailState.companyAddress);
            if (emailState.instagramUrl) composer.setInstagramUrl(emailState.instagramUrl);
            if (emailState.facebookUrl) composer.setFacebookUrl(emailState.facebookUrl);
            if (emailState.shopUrl) composer.setShopUrl(emailState.shopUrl);
            if (emailState.aboutUrl) composer.setAboutUrl(emailState.aboutUrl);
            if (emailState.contactUrl) composer.setContactUrl(emailState.contactUrl);
            if (emailState.privacyUrl) composer.setPrivacyUrl(emailState.privacyUrl);
            if (emailState.template) composer.setSelectedTemplate(emailState.template);
          }
          
          toast.success("Email loaded from Library");
        }
      } else {
        // Legacy support for other tables
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
      }
    } catch (error) {
      console.error("Error loading content:", error);
      toast.error("Failed to load content");
    }
  };

  const handleSendToKlaviyo = async () => {
    if (!organizationId || !user) {
      toast.error("Must be logged in to send");
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

    // Save email first before sending
    if (!contentId) {
      try {
        const serializedState = serializeEmailState({
          ...composer,
          template: composer.selectedTemplate,
          generatedHtml: composer.generatedHtml
        });

        const { data, error } = await supabase
          .from('master_content')
          .insert({
            title: composer.title,
            full_content: serializedState,
            collection: composer.selectedTemplate,
            content_type: 'Email',
            organization_id: organizationId,
            created_by: user.id,
            status: 'ready'
          })
          .select()
          .single();

        if (error) throw error;
        setContentId(data.id);
      } catch (error) {
        console.error("Error saving email before send:", error);
        toast.error("Failed to save email");
        return;
      }
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
    if (!organizationId || !user) {
      toast.error("Must be logged in to save");
      return;
    }

    if (!composer.title.trim()) {
      toast.error("Please add an email title before saving");
      return;
    }

    setIsSaving(true);

    try {
      const serializedState = serializeEmailState({
        ...composer,
        template: composer.selectedTemplate,
        generatedHtml: composer.generatedHtml
      });

      if (contentId) {
        // Update existing email
        const { error } = await supabase
          .from('master_content')
          .update({
            title: composer.title,
            full_content: serializedState,
            collection: composer.selectedTemplate,
            content_type: 'Email',
            updated_at: new Date().toISOString()
          })
          .eq('id', contentId);

        if (error) throw error;

        await forceSave(); // Trigger auto-save to sync
        
        toast.success("Email updated", {
          description: "Changes saved successfully",
          action: {
            label: "View in Library",
            onClick: () => navigate('/library?type=Email')
          }
        });
      } else {
        // Create new email
        const { data, error } = await supabase
          .from('master_content')
          .insert({
            title: composer.title,
            full_content: serializedState,
            collection: composer.selectedTemplate,
            content_type: 'Email',
            organization_id: organizationId,
            created_by: user.id,
            status: 'draft'
          })
          .select()
          .single();

        if (error) throw error;

        setContentId(data.id);
        
        toast.success("Email saved to Library", {
          description: "You can access it anytime from the Library",
          action: {
            label: "View in Library",
            onClick: () => navigate('/library?type=Email')
          }
        });
      }
    } catch (error) {
      console.error("Error saving email:", error);
      toast.error("Failed to save email");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 md:px-6 py-3 md:py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3 md:gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/library")}
            className="gap-2 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-semibold text-foreground truncate">Email Composer</h1>
              <AutosaveIndicator 
                saveStatus={saveStatus} 
                lastSavedAt={lastSavedAt}
                className="hidden md:flex"
              />
            </div>
            <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
              Create beautiful, responsive emails with Madison
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
            className="gap-2 text-xs md:text-sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            className="gap-2 text-xs md:text-sm"
            disabled={isSaving}
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save'}</span>
          </Button>
          {contentId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/library?highlight=${contentId}`)}
              className="gap-2 text-xs md:text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">View in Library</span>
            </Button>
          )}
          <GoldButton
            onClick={handleSendToKlaviyo}
            className="gap-2 text-xs md:text-sm px-4 md:px-6"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send to Klaviyo</span>
            <span className="sm:hidden">Send</span>
          </GoldButton>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel - Editor (Full width on mobile, half on desktop) */}
        <div className="flex-1 overflow-auto">
          <ScrollArea className="h-full">
            <div className="p-4 md:p-6">
              <div className="space-y-4 md:space-y-6 max-w-2xl mx-auto lg:mx-0">
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

                {/* Body Header */}
                <div className="space-y-2">
                  <Label htmlFor="bodyHeader" className="text-sm">Body Header (Optional)</Label>
                  <Input
                    id="bodyHeader"
                    value={composer.bodyHeader}
                    onChange={(e) => composer.setBodyHeader(e.target.value)}
                    placeholder="Section heading above the body copy"
                    className="bg-background"
                  />
                </div>

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

                {/* Text Alignment */}
                <div className="space-y-2">
                  <Label className="text-sm">Text Alignment</Label>
                  <Select value={composer.contentAlignment} onValueChange={(v) => composer.setContentAlignment(v as 'left' | 'center' | 'right')}>
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
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - Preview (Hidden on mobile, visible on lg+) */}
        <div className="hidden lg:block lg:w-1/2 border-l border-border bg-muted/20">
          <EmailPreview html={composer.generatedHtml} />
        </div>
      </div>

      {/* Klaviyo Email Composer Modal */}
      <KlaviyoEmailComposer
        open={showKlaviyoModal}
        onOpenChange={setShowKlaviyoModal}
        initialHtml={composer.generatedHtml}
        initialTitle={composer.title}
        contentId={contentId || undefined}
        onSendSuccess={async () => {
          // Mark as sent in database
          if (contentId) {
            await supabase
              .from('master_content')
              .update({
                status: 'sent',
                published_at: new Date().toISOString(),
              })
              .eq('id', contentId);
            
            toast.success("Email status updated");
          }
        }}
      />
    </div>
  );
}
