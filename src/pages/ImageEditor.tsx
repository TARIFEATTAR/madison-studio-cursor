// React & Router
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// External Libraries
import { toast } from "sonner";

// Supabase & Hooks
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentOrganizationId } from "@/hooks/useIndustryConfig";
import { useIsMobile } from "@/hooks/use-mobile";

// UI Components
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

// Icons
import { 
  Download, 
  Loader2, 
  Sparkles, 
  ArrowLeft, 
  Save, 
  Heart,
  Wand2, 
  Settings,
  Info,
  Trash2,
  ImageIcon,
  ChevronDown,
  Upload
} from "lucide-react";

// Feature Components
import { EditorialAssistantPanel } from "@/components/assistant/EditorialAssistantPanel";
import { ReferenceUpload } from "@/components/image-editor/ReferenceUpload";
import { ImageChainBreadcrumb } from "@/components/image-editor/ImageChainBreadcrumb";
import { RefinementPanel } from "@/components/image-editor/RefinementPanel";

type ApprovalStatus = "pending" | "flagged" | "rejected";

type GeneratedImage = {
  id: string;
  imageUrl: string;
  prompt: string;
  timestamp: number;
  isHero?: boolean;
  approvalStatus: ApprovalStatus;
  parentImageId?: string;
  chainDepth: number;
  isChainOrigin: boolean;
  refinementInstruction?: string;
};

type ImageSession = {
  id: string;
  name: string;
  images: GeneratedImage[];
  createdAt: number;
};

const MAX_IMAGES_PER_SESSION = 10;

export default function ImageEditor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { orgId } = useCurrentOrganizationId();
  
  const [aspectRatio, setAspectRatio] = useState<string>("1:1");
  const [outputFormat, setOutputFormat] = useState<"png" | "jpeg" | "webp">("png");
  
  const [mainPrompt, setMainPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showProMode, setShowProMode] = useState(false);
  
  // Chain prompting state
  const [selectedForRefinement, setSelectedForRefinement] = useState<GeneratedImage | null>(null);
  const [refinementMode, setRefinementMode] = useState(false);

  // Session state
  const [sessionId] = useState(() => crypto.randomUUID());
  const [currentSession, setCurrentSession] = useState<ImageSession>({
    id: sessionId,
    name: "New Session",
    images: [],
    createdAt: Date.now()
  });
  const [allPrompts, setAllPrompts] = useState<Array<{role: string, content: string}>>([]);
  
  type ReferenceImage = {
    url: string;
    description: string;
    label: "Background" | "Product" | "Style Reference";
  };
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const [brandContext, setBrandContext] = useState<any>(null);
  
  // Load prompt from navigation state if present
  useEffect(() => {
    if (location.state?.loadedPrompt) {
      setMainPrompt(location.state.loadedPrompt);
      if (location.state.aspectRatio) setAspectRatio(location.state.aspectRatio);
      if (location.state.outputFormat) setOutputFormat(location.state.outputFormat);
      toast.success("Image recipe loaded!");
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  
  // Fetch brand context
  useEffect(() => {
    const fetchBrandContext = async () => {
      if (!orgId) return;
      try {
        const { data: brandConfig } = await supabase
          .from('organizations')
          .select('brand_config')
          .eq('id', orgId)
          .single();

        const { data: brandKnowledge } = await supabase
          .from('brand_knowledge')
          .select('content, knowledge_type')
          .eq('organization_id', orgId)
          .eq('is_active', true)
          .in('knowledge_type', ['brand_voice', 'brand_style', 'visual_standards']);

        if (brandConfig || brandKnowledge?.length) {
          setBrandContext({
            config: brandConfig,
            knowledge: brandKnowledge
          });
        }
      } catch (error) {
        console.error('Error fetching brand context:', error);
      }
    };

    fetchBrandContext();
  }, [orgId]);
  
  // Cleanup reference images on unmount
  useEffect(() => {
    return () => {
      referenceImages.forEach(ref => {
        if (ref.url.includes('image-editor-reference')) {
          supabase.storage.from('images').remove([ref.url]);
        }
      });
    };
  }, []);

  const generateSessionName = (prompt: string) => {
    const words = prompt.split(' ').slice(0, 4).join(' ');
    return words.length > 30 ? words.substring(0, 30) + '...' : words;
  };

  const handleGenerate = async () => {
    if (!mainPrompt.trim() || !user) {
      toast.error("Please enter a prompt");
      return;
    }

    if (currentSession.images.length >= MAX_IMAGES_PER_SESSION) {
      toast.error(`Session limit reached (${MAX_IMAGES_PER_SESSION} images). Please save this session first.`);
      return;
    }

    setIsGenerating(true);
    
    try {
      // Call the edge function
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'generate-madison-image',
        {
          body: {
            prompt: mainPrompt,
            aspectRatio,
            outputFormat,
            referenceImages: referenceImages.map(r => ({ url: r.url, description: r.description })),
            brandContext: brandContext || undefined,
            isRefinement: false,
            organizationId: orgId
          }
        }
      );

      if (functionError) throw functionError;
      if (!functionData?.imageUrl) throw new Error("No image URL returned");

      // Save to database
      const imageId = crypto.randomUUID();
      const { error: insertError } = await supabase
        .from('generated_images')
        .insert({
          image_url: functionData.imageUrl,
          final_prompt: mainPrompt,
          prompt: mainPrompt,
          goal_type: 'product_photography',
          session_id: sessionId,
          user_id: user?.id || '',
          organization_id: orgId || '',
          aspect_ratio: aspectRatio,
          output_format: outputFormat,
          chain_depth: 0,
          is_chain_origin: true
        });

      if (insertError) throw insertError;

      const newImage: GeneratedImage = {
        id: imageId,
        imageUrl: functionData.imageUrl,
        prompt: mainPrompt,
        timestamp: Date.now(),
        isHero: currentSession.images.length === 0,
        approvalStatus: "pending",
        chainDepth: 0,
        isChainOrigin: true
      };

      setCurrentSession(prev => ({
        ...prev,
        name: prev.images.length === 0 ? generateSessionName(mainPrompt) : prev.name,
        images: [...prev.images, newImage]
      }));

      setAllPrompts(prev => [...prev, { role: 'user', content: mainPrompt }]);
      toast.success("Image generated successfully!");
      
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || "Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSetHero = (imageId: string) => {
    setCurrentSession(prev => ({
      ...prev,
      images: prev.images.map(img => ({
        ...img,
        isHero: img.id === imageId
      }))
    }));
  };

  const handleToggleApproval = (imageId: string) => {
    setCurrentSession(prev => ({
      ...prev,
      images: prev.images.map(img => {
        if (img.id !== imageId) return img;
        const nextStatus: ApprovalStatus = 
          img.approvalStatus === "pending" ? "flagged" :
          img.approvalStatus === "flagged" ? "rejected" : "pending";
        return { ...img, approvalStatus: nextStatus };
      })
    }));
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await supabase.from('generated_images').delete().eq('id', imageId);
      
      setCurrentSession(prev => {
        const newImages = prev.images.filter(img => img.id !== imageId);
        if (newImages.length > 0 && !newImages.some(img => img.isHero)) {
          newImages[0].isHero = true;
        }
        return { ...prev, images: newImages };
      });
      
      toast.success("Image deleted");
    } catch (error) {
      toast.error("Failed to delete image");
    }
  };

  const handleSaveSession = async () => {
    const flaggedImages = currentSession.images.filter(img => img.approvalStatus === 'flagged');
    if (flaggedImages.length === 0) {
      toast.error("Please flag at least one image to save");
      return;
    }

    setIsSaving(true);
    try {
      // Update generated_images to mark as saved
      for (const image of flaggedImages) {
        const { error } = await supabase
          .from('generated_images')
          .update({ saved_to_library: true })
          .eq('id', image.id);
        
        if (error) throw error;
      }

      // Cleanup references
      for (const ref of referenceImages) {
        if (ref.url.includes('image-editor-reference')) {
          await supabase.storage.from('images').remove([ref.url]);
        }
      }

      toast.success(`Saved ${flaggedImages.length} images to library!`);
      
      // Reset session
      setCurrentSession({
        id: crypto.randomUUID(),
        name: "New Session",
        images: [],
        createdAt: Date.now()
      });
      setReferenceImages([]);
      setMainPrompt("");
      
    } catch (error) {
      console.error('Save error:', error);
      toast.error("Failed to save session");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReferenceUpload = (url: string, description: string, label: "Background" | "Product" | "Style Reference") => {
    setReferenceImages(prev => [...prev, { url, description, label }]);
    toast.success("Reference added");
  };

  const handleReferenceRemove = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
    toast.success("Reference removed");
  };

  const handleStartRefinement = (image: GeneratedImage) => {
    if (image.chainDepth >= 5) {
      toast.error("Maximum refinement depth reached");
      return;
    }
    setSelectedForRefinement(image);
    setRefinementMode(true);
  };

  const handleRefine = async (refinementInstruction: string) => {
    if (!selectedForRefinement || !user) return;
    
    setIsGenerating(true);
    setRefinementMode(false);
    
    try {
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'generate-madison-image',
        {
          body: {
            prompt: selectedForRefinement.prompt,
            parentPrompt: selectedForRefinement.prompt,
            aspectRatio,
            outputFormat,
            referenceImages: referenceImages.map(r => ({ url: r.url, description: r.description })),
            brandContext: brandContext || undefined,
            isRefinement: true,
            refinementInstruction,
            parentImageId: selectedForRefinement.id,
            organizationId: orgId
          }
        }
      );

      if (functionError) throw functionError;
      if (!functionData?.imageUrl) throw new Error("No image returned");

      const newImageId = crypto.randomUUID();
      const { error: insertError } = await supabase
        .from('generated_images')
        .insert({
          image_url: functionData.imageUrl,
          final_prompt: selectedForRefinement.prompt,
          prompt: selectedForRefinement.prompt,
          goal_type: 'product_photography',
          session_id: sessionId,
          user_id: user?.id || '',
          organization_id: orgId || '',
          aspect_ratio: aspectRatio,
          output_format: outputFormat,
          parent_image_id: selectedForRefinement.id,
          chain_depth: selectedForRefinement.chainDepth + 1,
          is_chain_origin: false,
          refinement_instruction: refinementInstruction
        });

      if (insertError) throw insertError;

      const newImage: GeneratedImage = {
        id: newImageId,
        imageUrl: functionData.imageUrl,
        prompt: selectedForRefinement.prompt,
        timestamp: Date.now(),
        isHero: true,
        approvalStatus: "pending",
        parentImageId: selectedForRefinement.id,
        chainDepth: selectedForRefinement.chainDepth + 1,
        isChainOrigin: false,
        refinementInstruction
      };

      setCurrentSession(prev => ({
        ...prev,
        images: prev.images.map(img => ({ ...img, isHero: false })).concat({ ...newImage, isHero: true })
      }));

      toast.success("Refinement complete!");
      setSelectedForRefinement(null);
      
    } catch (error: any) {
      console.error('Refinement error:', error);
      toast.error(error.message || "Failed to refine image");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleJumpToChainImage = (imageId: string) => {
    handleSetHero(imageId);
  };

  const heroImage = currentSession.images.find(img => img.isHero);
  const flaggedCount = currentSession.images.filter(img => img.approvalStatus === 'flagged').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Image Studio</h1>
              <p className="text-xs text-muted-foreground">Powered by Nano Banana</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {currentSession.images.length} / {MAX_IMAGES_PER_SESSION}
            </span>
            {flaggedCount > 0 && (
              <Button onClick={handleSaveSession} disabled={isSaving} size="sm">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save ({flaggedCount})
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Image Display & Chain (2 columns) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Hero Image Display */}
            {heroImage ? (
              <Card className="overflow-hidden border-2">
                <div className="relative aspect-square bg-muted">
                  <img 
                    src={heroImage.imageUrl} 
                    alt="Generated" 
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                      size="sm"
                      variant={heroImage.approvalStatus === 'flagged' ? 'default' : 'secondary'}
                      onClick={() => handleToggleApproval(heroImage.id)}
                    >
                      <Heart className={cn("w-4 h-4", heroImage.approvalStatus === 'flagged' && "fill-current")} />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => window.open(heroImage.imageUrl, '_blank')}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {heroImage.chainDepth > 0 && (
                    <ImageChainBreadcrumb
                      currentImage={heroImage}
                      allImages={currentSession.images}
                      onImageClick={handleJumpToChainImage}
                    />
                  )}
                  <p className="text-sm text-muted-foreground">{heroImage.prompt}</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleStartRefinement(heroImage)}
                      variant="outline"
                      size="sm"
                      disabled={heroImage.chainDepth >= 5}
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      Refine This
                    </Button>
                    <Button
                      onClick={() => handleDeleteImage(heroImage.id)}
                      variant="ghost"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="aspect-square flex items-center justify-center border-2 border-dashed">
                <div className="text-center p-8">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No images yet</h3>
                  <p className="text-sm text-muted-foreground">Generate your first image to get started</p>
                </div>
              </Card>
            )}

            {/* Thumbnail Gallery */}
            {currentSession.images.length > 0 && (
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {currentSession.images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => handleSetHero(img.id)}
                    className={cn(
                      "relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105",
                      img.isHero ? "border-primary ring-2 ring-primary" : "border-transparent"
                    )}
                  >
                    <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                    {img.chainDepth > 0 && (
                      <div className="absolute bottom-1 right-1 bg-background/90 text-xs px-1.5 py-0.5 rounded">
                        +{img.chainDepth}
                      </div>
                    )}
                    {img.approvalStatus === 'flagged' && (
                      <Heart className="absolute top-1 right-1 w-4 h-4 fill-primary text-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Controls (1 column) */}
          <div className="space-y-4">
            {/* Reference Upload */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Upload className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-medium text-sm">Reference Images</h3>
              </div>
              <ReferenceUpload
                images={referenceImages}
                onUpload={handleReferenceUpload}
                onRemove={handleReferenceRemove}
                maxImages={3}
              />
            </Card>

            {/* Refinement or Generation */}
            {refinementMode && selectedForRefinement ? (
              <RefinementPanel
                baseImage={selectedForRefinement}
                onRefine={handleRefine}
                onCancel={() => {
                  setRefinementMode(false);
                  setSelectedForRefinement(null);
                }}
              />
            ) : (
              <Card className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Create Image</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowProMode(!showProMode)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    {showProMode ? 'Simple' : 'Pro'}
                  </Button>
                </div>

                <Textarea
                  value={mainPrompt}
                  onChange={(e) => setMainPrompt(e.target.value)}
                  placeholder="Describe the image you want to create..."
                  className="min-h-[120px] resize-none"
                />

                <Collapsible open={showProMode}>
                  <CollapsibleContent className="space-y-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label className="text-xs">Aspect Ratio</Label>
                      <Select value={aspectRatio} onValueChange={setAspectRatio}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1:1">Square (1:1)</SelectItem>
                          <SelectItem value="4:3">Standard (4:3)</SelectItem>
                          <SelectItem value="16:9">Widescreen (16:9)</SelectItem>
                          <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Output Format</Label>
                      <Select value={outputFormat} onValueChange={(v: any) => setOutputFormat(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="png">PNG</SelectItem>
                          <SelectItem value="jpeg">JPEG</SelectItem>
                          <SelectItem value="webp">WebP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !mainPrompt.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Image
                    </>
                  )}
                </Button>
              </Card>
            )}

            {/* Brand Context Info */}
            {brandContext && (
              <Card className="p-3 bg-accent/20">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div className="text-xs text-muted-foreground">
                    <p className="font-medium mb-1">Brand Context Active</p>
                    <p>Images will align with your brand guidelines</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Editorial Assistant */}
      <EditorialAssistantPanel 
        onClose={() => {}}
        initialContent=""
      />
    </div>
  );
}
