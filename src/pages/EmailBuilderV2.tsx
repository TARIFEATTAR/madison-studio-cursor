import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { useBrandColor } from "@/hooks/useBrandColor";
import { useEmailHistory } from "@/hooks/useEmailHistory";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useEmailBuilderAutosave } from "@/hooks/useEmailBuilderAutosave";
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
import { ComposeSidebar } from "@/components/email-builder/ComposeSidebar";
import { AutosaveIndicator } from "@/components/ui/autosave-indicator";
import { LUXURY_TEMPLATES } from "@/utils/luxuryEmailTemplates";
import { EmailBlock, EmailComposition, HeadlineBlock, ImageBlock, TextBlock, ButtonBlock, DividerBlock, SpacerBlock } from "@/types/emailBlocks";
import { compositionToHtml, compositionToPlainText } from "@/utils/blockToHtml";
import { ArrowLeft, Download, Check, Monitor, Smartphone, FileText, Plus, Undo2, Redo2 } from "lucide-react";
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
  const [emailId, setEmailId] = useState<string | null>(null);

  // History & Autosave
  const { pushToHistory, undo, redo, canUndo, canRedo } = useEmailHistory(composition.blocks);
  const { saveStatus, lastSavedAt } = useEmailBuilderAutosave({
    composition,
    emailSubject,
    organizationId: organizationId || "",
    emailId: emailId || undefined,
  });

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onUndo: () => {
      const undoneBlocks = undo();
      if (undoneBlocks) {
        setComposition(prev => ({ ...prev, blocks: undoneBlocks }));
        toast.success("Undone");
      }
    },
    onRedo: () => {
      const redoneBlocks = redo();
      if (redoneBlocks) {
        setComposition(prev => ({ ...prev, blocks: redoneBlocks }));
        toast.success("Redone");
      }
    },
    onSave: async () => {
      await handleSaveToLibrary();
    },
    onPreview: () => {
      if (activeTab === "compose") {
        handleGeneratePreview();
      }
    },
    enabled: activeTab === "compose",
  });

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
    
    setComposition(prev => {
      const newBlocks = [...prev.blocks, newBlock];
      pushToHistory(newBlocks);
      return { ...prev, blocks: newBlocks };
    });
  };

  const addBlockTemplate = (blocks: EmailBlock[]) => {
    setComposition(prev => {
      const newBlocks = [...prev.blocks, ...blocks];
      pushToHistory(newBlocks);
      return { ...prev, blocks: newBlocks };
    });
    toast.success("Template added");
  };

  const updateBlock = (id: string, updated: EmailBlock) => {
    setComposition(prev => {
      const newBlocks = prev.blocks.map(b => b.id === id ? updated : b);
      pushToHistory(newBlocks);
      return { ...prev, blocks: newBlocks };
    });
  };

  const duplicateBlock = (id: string) => {
    setComposition(prev => {
      const index = prev.blocks.findIndex(b => b.id === id);
      if (index === -1) return prev;
      
      const blockToDuplicate = prev.blocks[index];
      const duplicatedBlock = {
        ...blockToDuplicate,
        id: `block-${Date.now()}`,
      };
      
      const newBlocks = [
        ...prev.blocks.slice(0, index + 1),
        duplicatedBlock,
        ...prev.blocks.slice(index + 1),
      ];
      
      pushToHistory(newBlocks);
      return { ...prev, blocks: newBlocks };
    });
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    setComposition(prev => {
      const index = prev.blocks.findIndex(b => b.id === id);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.blocks.length) return prev;

      const newBlocks = [...prev.blocks];
      [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
      
      pushToHistory(newBlocks);
      return { ...prev, blocks: newBlocks };
    });
  };

  const deleteBlock = (id: string) => {
    setComposition(prev => {
      const newBlocks = prev.blocks.filter(b => b.id !== id);
      pushToHistory(newBlocks);
      return { ...prev, blocks: newBlocks };
    });
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
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold">Email Builder</h1>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Step {activeTab === "template" ? "1" : activeTab === "compose" ? "2" : "3"} of 3</span>
              {activeTab === "compose" && <AutosaveIndicator saveStatus={saveStatus} lastSavedAt={lastSavedAt} />}
            </div>
          </div>
        </div>

        {activeTab === "compose" && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => { const undoneBlocks = undo(); if (undoneBlocks) setComposition(prev => ({ ...prev, blocks: undoneBlocks })); }} disabled={!canUndo}>
              <Undo2 className="w-4 h-4 mr-2" />
              Undo
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { const redoneBlocks = redo(); if (redoneBlocks) setComposition(prev => ({ ...prev, blocks: redoneBlocks })); }} disabled={!canRedo}>
              <Redo2 className="w-4 h-4 mr-2" />
              Redo
            </Button>
          </div>
        )}

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
            <ComposeSidebar 
              onAddBlock={addBlock}
              onAddBlockTemplate={addBlockTemplate}
              currentBlocks={composition.blocks}
            />

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
                        onDuplicate={() => duplicateBlock(block.id)}
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
