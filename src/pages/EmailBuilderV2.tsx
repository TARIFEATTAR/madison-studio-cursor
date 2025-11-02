import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { useBrandColor } from "@/hooks/useBrandColor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { BlockEditor } from "@/components/email-builder/BlockEditor";
import { EmailPreview } from "@/components/email-composer/EmailPreview";
import { ESPExport } from "@/components/email-builder/ESPExport";
import { TestSend } from "@/components/email-builder/TestSend";
import { ContentPicker } from "@/components/email-composer/ContentPicker";
import { MadisonSuggestions } from "@/components/email-composer/MadisonSuggestions";
import { LUXURY_TEMPLATES } from "@/utils/luxuryEmailTemplates";
import { EmailBlock, EmailComposition, HeadlineBlock, ImageBlock, TextBlock, ButtonBlock, DividerBlock, SpacerBlock } from "@/types/emailBlocks";
import { compositionToHtml, compositionToPlainText } from "@/utils/blockToHtml";
import { ArrowLeft, Download, Check, Monitor, Smartphone, FileText, Plus } from "lucide-react";
import { toast } from "sonner";
import { embedImagesInHtml } from "@/utils/emailImageEmbedder";
import { supabase } from "@/integrations/supabase/client";

export default function EmailBuilderV2() {
  const { user } = useAuth();
  const { organizationId } = useOrganization();
  const { brandColor } = useBrandColor();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"template" | "compose" | "preview">("template");
  const [emailSubject, setEmailSubject] = useState("");
  
  const [composition, setComposition] = useState<EmailComposition>({
    templateId: "",
    globalStyles: {
      fontFamily: "Georgia, serif",
      backgroundColor: "#F4F4F4",
      brandColor: brandColor || "#1A1A1A",
      padding: 20
    },
    blocks: []
  });

  const [viewMode, setViewMode] = useState<"desktop" | "mobile" | "plain">("desktop");
  const [generatedHtml, setGeneratedHtml] = useState("");

  const handleSelectTemplate = (templateId: string) => {
    setComposition(prev => ({ ...prev, templateId }));
    setActiveTab("compose");
  };

  const addBlock = (type: EmailBlock['type']) => {
    const newBlock: EmailBlock = (() => {
      const id = `block-${Date.now()}`;
      switch (type) {
        case 'headline':
          return { id, type: 'headline', text: '', size: 'medium', alignment: 'center' } as HeadlineBlock;
        case 'image':
          return { id, type: 'image', url: '', alt: '', alignment: 'center' } as ImageBlock;
        case 'text':
          return { id, type: 'text', content: '', alignment: 'left' } as TextBlock;
        case 'button':
          return { id, type: 'button', text: 'Click Here', url: '', style: 'rounded', alignment: 'center' } as ButtonBlock;
        case 'divider':
          return { id, type: 'divider', color: '#DDDDDD', thickness: 1 } as DividerBlock;
        case 'spacer':
          return { id, type: 'spacer', height: 40 } as SpacerBlock;
        default:
          throw new Error(`Unknown block type: ${type}`);
      }
    })();
    
    setComposition(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
    }));
  };

  const updateBlock = (id: string, updated: EmailBlock) => {
    setComposition(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => b.id === id ? updated : b)
    }));
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    setComposition(prev => {
      const index = prev.blocks.findIndex(b => b.id === id);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.blocks.length) return prev;

      const newBlocks = [...prev.blocks];
      [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
      
      return { ...prev, blocks: newBlocks };
    });
  };

  const deleteBlock = (id: string) => {
    setComposition(prev => ({
      ...prev,
      blocks: prev.blocks.filter(b => b.id !== id)
    }));
  };

  const handleGeneratePreview = () => {
    if (composition.blocks.length === 0) {
      toast.error("Please add at least one content block");
      return;
    }

    const html = compositionToHtml(composition);
    setGeneratedHtml(html);
    setActiveTab("preview");
  };

  const handleDownloadHtml = async () => {
    try {
      const result = await embedImagesInHtml(generatedHtml);
      const blob = new Blob([result.html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${emailSubject || "email"}.html`;
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
        title: emailSubject || "Untitled Email",
        full_content: JSON.stringify({ composition, html: generatedHtml }),
        collection: composition.templateId,
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

        {activeTab === "preview" && (
          <div className="flex items-center gap-2">
            <TestSend html={generatedHtml} subject={emailSubject} />
            <Button variant="outline" size="sm" onClick={handleDownloadHtml}>
              <Download className="w-4 h-4 mr-2" />
              Download HTML
            </Button>
            <ESPExport html={generatedHtml} subject={emailSubject} />
            <Button size="sm" onClick={handleSaveToLibrary}>
              Save to Library
            </Button>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container max-w-6xl mx-auto px-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="w-full max-w-md mx-auto">
              <TabsTrigger value="template" className="flex-1">1. Template</TabsTrigger>
              <TabsTrigger value="compose" className="flex-1" disabled={!composition.templateId}>
                2. Compose
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex-1" disabled={!generatedHtml}>
                3. Preview
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "template" && (
          <div className="h-full overflow-auto p-8">
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Choose Your Template</h2>
                <p className="text-muted-foreground">Select from luxury ecommerce or minimalist founder styles</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {LUXURY_TEMPLATES.map((template) => (
                  <Card
                    key={template.id}
                    className={`p-6 cursor-pointer transition-all hover:shadow-lg relative ${
                      composition.templateId === template.id ? "border-2 border-primary" : ""
                    }`}
                    onClick={() => handleSelectTemplate(template.id)}
                  >
                    {composition.templateId === template.id && (
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

        {activeTab === "compose" && (
          <div className="h-full flex">
            {/* Sidebar */}
            <div className="w-80 border-r border-border bg-muted/30 overflow-auto">
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Add Content Blocks</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={() => addBlock('headline')}>
                      📝 Headline
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addBlock('image')}>
                      🖼️ Image
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addBlock('text')}>
                      📄 Text
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addBlock('button')}>
                      🔘 Button
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addBlock('divider')}>
                      ➖ Divider
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addBlock('spacer')}>
                      ⬛ Spacer
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Tabs defaultValue="archive">
                    <TabsList className="w-full">
                      <TabsTrigger value="archive" className="flex-1">Archive</TabsTrigger>
                      <TabsTrigger value="madison" className="flex-1">Madison</TabsTrigger>
                    </TabsList>
                    <TabsContent value="archive" className="mt-4">
                      {organizationId && (
                        <ContentPicker
                          organizationId={organizationId}
                          onSelect={(content) => {
                            addBlock('headline');
                            const lastBlock = composition.blocks[composition.blocks.length - 1];
                            if (lastBlock?.type === 'headline') {
                              updateBlock(lastBlock.id, { ...lastBlock, text: content.title });
                            }
                            addBlock('text');
                            const textBlock = composition.blocks[composition.blocks.length - 1];
                            if (textBlock?.type === 'text') {
                              updateBlock(textBlock.id, { ...textBlock, content: content.content });
                            }
                          }}
                        />
                      )}
                    </TabsContent>
                    <TabsContent value="madison" className="mt-4">
                      <MadisonSuggestions
                        onSelectHeadline={(headline) => {
                          addBlock('headline');
                          const lastBlock = composition.blocks[composition.blocks.length - 1];
                          if (lastBlock?.type === 'headline') {
                            updateBlock(lastBlock.id, { ...lastBlock, text: headline });
                          }
                        }}
                        onSelectCTA={(cta) => {
                          addBlock('button');
                          const lastBlock = composition.blocks[composition.blocks.length - 1];
                          if (lastBlock?.type === 'button') {
                            updateBlock(lastBlock.id, { ...lastBlock, text: cta });
                          }
                        }}
                        currentContent={composition.blocks.map(b => 
                          b.type === 'text' ? b.content : 
                          b.type === 'headline' ? b.text : ''
                        ).join(' ')}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>

            {/* Main Editor */}
            <div className="flex-1 overflow-auto p-6">
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Subject</label>
                  <Input
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Enter email subject line"
                  />
                </div>

                {composition.blocks.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Plus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Start Building Your Email</h3>
                    <p className="text-muted-foreground">
                      Add content blocks from the sidebar to compose your email
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {composition.blocks.map((block, index) => (
                      <BlockEditor
                        key={block.id}
                        block={block}
                        onUpdate={(updated) => updateBlock(block.id, updated)}
                        onMoveUp={() => moveBlock(block.id, 'up')}
                        onMoveDown={() => moveBlock(block.id, 'down')}
                        onDelete={() => deleteBlock(block.id)}
                        canMoveUp={index > 0}
                        canMoveDown={index < composition.blocks.length - 1}
                      />
                    ))}
                  </div>
                )}

                <Button onClick={handleGeneratePreview} className="w-full" size="lg">
                  Generate Preview
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "preview" && (
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
                <Button
                  variant={viewMode === "plain" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("plain")}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Plain Text
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-muted/30 p-8">
              {viewMode === "plain" ? (
                <Card className="max-w-2xl mx-auto p-8">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {compositionToPlainText(composition)}
                  </pre>
                </Card>
              ) : (
                <EmailPreview html={generatedHtml} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
