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
import { CollapsibleTrigger, Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
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
  ChevronUp,
  Upload
} from "lucide-react";

// Feature Components
import { EditorialAssistantPanel } from "@/components/assistant/EditorialAssistantPanel";
import { MadisonVerticalTab } from "@/components/assistant/MadisonVerticalTab";
import { ReferenceUpload } from "@/components/image-editor/ReferenceUpload";
import { ImageChainBreadcrumb } from "@/components/image-editor/ImageChainBreadcrumb";
import { RefinementPanel } from "@/components/image-editor/RefinementPanel";
import { ProModePanel, ProModeControls } from "@/components/image-editor/ProModePanel";
import { GeneratingLoader } from "@/components/forge/GeneratingLoader";

// Prompt Formula Utilities
import { CAMERA_LENS, LIGHTING, ENVIRONMENTS } from "@/utils/promptFormula";

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
  
  // Pro Mode Controls State
  const [proModeControls, setProModeControls] = useState<ProModeControls>({});
  
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
  const [madisonOpen, setMadisonOpen] = useState(false);
  
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

  /**
   * Enhance user prompt with Pro Mode controls
   */
  const enhancePromptWithControls = (basePrompt: string): string => {
    let enhanced = basePrompt;
    
    // Apply Pro Mode camera/lens preset
    if (proModeControls.camera) {
      const [category, key] = proModeControls.camera.split('.');
      const cameraPreset = CAMERA_LENS[category as keyof typeof CAMERA_LENS]?.[key as any];
      if (cameraPreset) {
        enhanced += `, ${cameraPreset}`;
      }
    }
    
    // Apply lighting preset
    if (proModeControls.lighting) {
      const [category, key] = proModeControls.lighting.split('.');
      const lightingPreset = LIGHTING[category as keyof typeof LIGHTING]?.[key as any];
      if (lightingPreset) {
        enhanced += `, ${lightingPreset}`;
      }
    }
    
    // Apply environment preset
    if (proModeControls.environment) {
      const [category, key] = proModeControls.environment.split('.');
      const environmentPreset = ENVIRONMENTS[category as keyof typeof ENVIRONMENTS]?.[key as any];
      if (environmentPreset) {
        enhanced += `, ${environmentPreset}`;
      }
    }
    
    return enhanced;
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
      // Call the edge function with enhanced prompt - backend handles ALL persistence
      const enhancedPrompt = enhancePromptWithControls(mainPrompt);
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'generate-madison-image',
        {
          body: {
            prompt: enhancedPrompt,
            userId: user.id,
            organizationId: orgId,
            goalType: 'product_photography', // Pass goalType for backend insert
            aspectRatio,
            outputFormat,
            referenceImages: referenceImages.map(r => ({ url: r.url, description: r.description, label: r.label })),
            brandContext: brandContext || undefined,
            isRefinement: false,
            proModeControls: Object.keys(proModeControls).length > 0 ? proModeControls : undefined
          }
        }
      );

      if (functionError) throw functionError;
      if (!functionData?.imageUrl) throw new Error("No image URL returned");

      // Backend already saved the image - just update UI with returned data
      const newImage: GeneratedImage = {
        id: functionData.savedImageId || crypto.randomUUID(),
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
      console.error('User ID:', user?.id);
      console.error('Organization ID:', orgId);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        functionError: error.context
      });
      toast.error(error.message || "Failed to generate image. Check console for details.");
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
            userId: user.id,
            organizationId: orgId,
            goalType: 'product_photography', // Pass goalType for backend insert
            parentPrompt: selectedForRefinement.prompt,
            aspectRatio,
            outputFormat,
            referenceImages: referenceImages.map(r => ({ url: r.url, description: r.description, label: r.label })),
            brandContext: brandContext || undefined,
            isRefinement: true,
            refinementInstruction,
            parentImageId: selectedForRefinement.id
          }
        }
      );

      if (functionError) throw functionError;
      if (!functionData?.imageUrl) throw new Error("No image returned");

      // Backend already saved the image - just update UI with returned data
      const newImage: GeneratedImage = {
        id: functionData.savedImageId || crypto.randomUUID(),
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
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-zinc-100">Image Studio</h1>
              <p className="text-xs text-zinc-400">Powered by Nano Banana</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400">
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

      {/* Main Content - Improved Layout */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-[280px_1fr] gap-4 p-6 max-w-[1500px] mx-auto">
          {/* Left Sidebar: Controls */}
          <div className="relative z-10 space-y-3 overflow-y-auto pr-2 pb-32">
            {/* Reference Images */}
            <Card className="p-4 bg-zinc-900/50 border-zinc-800 hover:border-aged-brass/30 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon className="w-4 h-4 text-aged-brass" />
                <h3 className="font-medium text-sm text-zinc-100">Reference Images</h3>
              </div>
              <ReferenceUpload
                images={referenceImages}
                onUpload={handleReferenceUpload}
                onRemove={handleReferenceRemove}
                maxImages={3}
              />
            </Card>

            {/* Pro Mode Collapsible */}
            <Collapsible open={showProMode} onOpenChange={setShowProMode}>
              <CollapsibleContent>
                <Card className="p-4 bg-zinc-900/50 border-zinc-800">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm text-zinc-100">Pro Mode</h3>
                      {(Object.keys(proModeControls).length > 0) && (
                        <Badge variant="secondary" className="text-xs">
                          {Object.keys(proModeControls).length} active
                        </Badge>
                      )}
                    </div>
                    <ProModePanel
                      onControlsChange={setProModeControls}
                      initialValues={proModeControls}
                    />
                  </div>
                </Card>
              </CollapsibleContent>
            </Collapsible>

            {/* Output Settings */}
            <Card className="p-4 bg-zinc-900/50 border-zinc-800">
              <h3 className="font-medium text-sm text-zinc-100 mb-3">Output Settings</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs text-zinc-400">Aspect Ratio</Label>
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger className="bg-zinc-900/90 border-zinc-700 text-zinc-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-zinc-900 text-zinc-100 border border-zinc-700 shadow-xl">
                      <SelectItem value="1:1" className="text-zinc-100 data-[highlighted]:bg-zinc-700 data-[highlighted]:text-zinc-100">Square (1:1)</SelectItem>
                      <SelectItem value="4:5" className="text-zinc-100 data-[highlighted]:bg-zinc-700 data-[highlighted]:text-zinc-100">Portrait (4:5)</SelectItem>
                      <SelectItem value="5:4" className="text-zinc-100 data-[highlighted]:bg-zinc-700 data-[highlighted]:text-zinc-100">Etsy (5:4)</SelectItem>
                      <SelectItem value="2:3" className="text-zinc-100 data-[highlighted]:bg-zinc-700 data-[highlighted]:text-zinc-100">Pinterest (2:3)</SelectItem>
                      <SelectItem value="3:2" className="text-zinc-100 data-[highlighted]:bg-zinc-700 data-[highlighted]:text-zinc-100">Email/Web (3:2)</SelectItem>
                      <SelectItem value="16:9" className="text-zinc-100 data-[highlighted]:bg-zinc-700 data-[highlighted]:text-zinc-100">Landscape (16:9)</SelectItem>
                      <SelectItem value="9:16" className="text-zinc-100 data-[highlighted]:bg-zinc-700 data-[highlighted]:text-zinc-100">Vertical (9:16)</SelectItem>
                      <SelectItem value="21:9" className="text-zinc-100 data-[highlighted]:bg-zinc-700 data-[highlighted]:text-zinc-100">Ultra-wide (21:9)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-zinc-400">Output Format</Label>
                  <Select value={outputFormat} onValueChange={(v: any) => setOutputFormat(v)}>
                    <SelectTrigger className="bg-zinc-900/90 border-zinc-700 text-zinc-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-zinc-900 text-zinc-100 border border-zinc-700 shadow-xl">
                      <SelectItem value="png" className="text-zinc-100 data-[highlighted]:bg-zinc-700 data-[highlighted]:text-zinc-100">PNG</SelectItem>
                      <SelectItem value="jpeg" className="text-zinc-100 data-[highlighted]:bg-zinc-700 data-[highlighted]:text-zinc-100">JPEG</SelectItem>
                      <SelectItem value="webp" className="text-zinc-100 data-[highlighted]:bg-zinc-700 data-[highlighted]:text-zinc-100">WebP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Brand Context Info */}
            {brandContext && (
              <Card className="p-3 bg-zinc-900/30 border-zinc-800">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5 text-zinc-400 flex-shrink-0" />
                  <div className="text-xs text-zinc-400">
                    <p className="font-medium mb-1 text-zinc-300">Brand Context Active</p>
                    <p>Images will align with your brand guidelines</p>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Right: Canvas Display */}
          <div className="relative z-0 space-y-3 overflow-y-auto">
            {/* Hero Image Display */}
            {heroImage ? (
              <Card className="overflow-hidden border-2 border-zinc-800 bg-zinc-900/50 max-w-[800px]">
                <div className="relative w-full" style={{ maxHeight: '50vh' }}>
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
                <div className="p-4 space-y-2">
                  {heroImage.chainDepth > 0 && (
                    <ImageChainBreadcrumb
                      currentImage={heroImage}
                      allImages={currentSession.images}
                      onImageClick={handleJumpToChainImage}
                    />
                  )}
                  <p className="text-sm text-zinc-400">{heroImage.prompt}</p>
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
              <Card className="aspect-video max-w-[800px] flex items-center justify-center border-2 border-dashed border-zinc-700 bg-zinc-900/50">
                <div className="text-center p-8">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
                  <h3 className="text-lg font-medium mb-2 text-zinc-100">No images yet</h3>
                  <p className="text-sm text-zinc-400">Generate your first image to get started</p>
                </div>
              </Card>
            )}

            {/* Thumbnail Gallery */}
            {currentSession.images.length > 1 && (
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2 max-w-[800px]">
                {currentSession.images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => handleSetHero(img.id)}
                    className={cn(
                      "relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105",
                      img.isHero ? "border-primary ring-2 ring-primary" : "border-zinc-700"
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

            {/* Bottom Action Bar - Part of Right Column */}
            <div className="mt-6 w-full max-w-[800px]">
              <div className="bg-zinc-900/95 backdrop-blur-md border border-zinc-800 rounded-lg p-4">
                {/* Main Prompt Input */}
                <div className="mb-3">
                  <Textarea
                    placeholder="Describe the image you want to create... (Cmd+Enter to generate)"
                    value={mainPrompt}
                    onChange={(e) => setMainPrompt(e.target.value)}
                    className="min-h-[70px] max-h-[100px] bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        handleGenerate();
                      }
                    }}
                  />
                </div>

                {/* Control Strip */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setShowProMode(!showProMode)}
                    className={cn(
                      "h-11 border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700",
                      showProMode && "border-aged-brass bg-aged-brass/10 text-aged-brass hover:bg-aged-brass/20"
                    )}
                  >
                    <Settings className="w-4 h-4" />
                    Pro Mode
                    {Object.keys(proModeControls).length > 0 && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {Object.keys(proModeControls).length}
                      </Badge>
                    )}
                  </Button>

                  <Button
                    variant="brass"
                    size="lg"
                    onClick={handleGenerate}
                    disabled={isGenerating || !mainPrompt.trim() || currentSession.images.length >= MAX_IMAGES_PER_SESSION}
                    className="flex-1 h-11"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : currentSession.images.length >= MAX_IMAGES_PER_SESSION ? (
                      `Session Full (${MAX_IMAGES_PER_SESSION}/${MAX_IMAGES_PER_SESSION})`
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Refinement Modal Overlay */}
      {refinementMode && selectedForRefinement && (
        <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-sm z-30 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl bg-zinc-900 border-zinc-800">
            <RefinementPanel
              baseImage={selectedForRefinement}
              onRefine={handleRefine}
              onCancel={() => {
                setRefinementMode(false);
                setSelectedForRefinement(null);
              }}
            />
          </Card>
        </div>
      )}

      {/* Madison Panel */}
      <MadisonVerticalTab 
        isOpen={madisonOpen}
        onClick={() => setMadisonOpen(!madisonOpen)}
      />
      
      {madisonOpen && (
        <div className="fixed right-0 top-0 bottom-0 w-[320px] z-50 bg-zinc-900 border-l border-zinc-800 shadow-2xl">
          <EditorialAssistantPanel 
            onClose={() => setMadisonOpen(false)}
            initialContent=""
            darkMode={true}
            sessionContext={{
              sessionId,
              sessionName: currentSession.name,
              imagesGenerated: currentSession.images.length,
              maxImages: MAX_IMAGES_PER_SESSION,
              heroImage: heroImage ? {
                imageUrl: heroImage.imageUrl,
                prompt: heroImage.prompt
              } : undefined,
              allPrompts: allPrompts.filter(p => p.role === 'user').map(p => p.content),
              aspectRatio,
              outputFormat,
              isImageStudio: true,
              visualStandards: brandContext?.knowledge?.filter((k: any) => k.knowledge_type === 'visual_standards')
            }}
          />
        </div>
      )}

      {/* Global Generating Overlay */}
      {isGenerating && <GeneratingLoader />}
    </div>
  );
}
