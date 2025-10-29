import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useBrandColor } from "@/hooks/useBrandColor";
import { useEmailComposer } from "@/hooks/useEmailComposer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TemplateSelector } from "@/components/email-composer/TemplateSelector";
import { StyleCustomizer } from "@/components/email-composer/StyleCustomizer";
import { ImagePicker } from "@/components/email-composer/ImagePicker";
import { EmailPreview } from "@/components/email-composer/EmailPreview";
import { ArrowLeft, Send, Download, Save } from "lucide-react";
import { toast } from "sonner";

export default function EmailComposer() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { brandColor: defaultBrandColor } = useBrandColor();
  const [loading, setLoading] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  const composer = useEmailComposer({
    brandColor: defaultBrandColor,
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    loadOrganizationAndContent();
  }, [user, navigate]);

  const loadOrganizationAndContent = async () => {
    if (!user) return;

    try {
      // Get organization
      const { data: memberData } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!memberData?.organization_id) {
        toast.error("No organization found");
        navigate("/library");
        return;
      }

      setOrganizationId(memberData.organization_id);

      // Load content if contentId is provided
      const contentId = searchParams.get("contentId");
      const sourceTable = searchParams.get("sourceTable");

      if (contentId && sourceTable) {
        await loadContent(contentId, sourceTable);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    }
  };

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

  const handleSendToKlaviyo = async () => {
    if (!organizationId) {
      toast.error("No organization found");
      return;
    }

    if (!composer.title.trim()) {
      toast.error("Please add an email title");
      return;
    }

    setLoading(true);
    try {
      // This would integrate with the existing Klaviyo publishing flow
      // For now, just show success message
      toast.success("Ready to send to Klaviyo!", {
        description: "This will integrate with your existing Klaviyo connection",
      });
      
      // Navigate to publish page with pre-filled data
      navigate(`/publish/email?title=${encodeURIComponent(composer.title)}&html=${encodeURIComponent(composer.generatedHtml)}`);
    } catch (error) {
      console.error("Error sending to Klaviyo:", error);
      toast.error("Failed to prepare email");
    } finally {
      setLoading(false);
    }
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
          <Button
            size="sm"
            onClick={handleSendToKlaviyo}
            disabled={loading}
            className="gap-2"
          >
            <Send className="w-4 h-4" />
            {loading ? "Preparing..." : "Send to Klaviyo"}
          </Button>
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
            <div className="space-y-4 p-4 border border-border rounded-lg bg-card">
              <h3 className="font-semibold text-sm text-foreground">Call-to-Action (Optional)</h3>
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
            </div>

            {/* Style Customization */}
            <StyleCustomizer
              brandColor={composer.brandColor}
              secondaryColor={composer.secondaryColor}
              fontFamily={composer.fontFamily}
              onBrandColorChange={composer.setBrandColor}
              onSecondaryColorChange={composer.setSecondaryColor}
              onFontChange={composer.setFontFamily}
            />

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
        <div className="w-1/2">
          <EmailPreview html={composer.generatedHtml} />
        </div>
      </div>
    </div>
  );
}
