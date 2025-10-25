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
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Upload,
  X
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
    <div className="flex flex-col h-screen bg-zinc-950 text-aged-paper">
      {/* Top Toolbar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-zinc-400 hover:text-aged-paper"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-aged-brass">Image Studio</h1>
            <p className="text-xs text-zinc-500">Powered by Nano Banana</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Aspect Ratio */}
          <Select value={aspectRatio} onValueChange={setAspectRatio}>
            <SelectTrigger className="w-40 bg-zinc-800 border-zinc-700 text-zinc-100">
              <SelectValue placeholder="Aspect Ratio" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700">
              <SelectItem value="1:1">1:1 Square</SelectItem>
              <SelectItem value="16:9">16:9 Landscape</SelectItem>
              <SelectItem value="9:16">9:16 Portrait</SelectItem>
              <SelectItem value="4:3">4:3 Classic</SelectItem>
              <SelectItem value="4:5">4:5 Portrait</SelectItem>
              <SelectItem value="5:4">5:4 Etsy</SelectItem>
            </SelectContent>
          </Select>

          {/* Output Format */}
          <Select value={outputFormat} onValueChange={(v: any) => setOutputFormat(v)}>
            <SelectTrigger className="w-32 bg-zinc-800 border-zinc-700 text-zinc-100">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700">
              <SelectItem value="png">PNG</SelectItem>
              <SelectItem value="jpeg">JPG</SelectItem>
              <SelectItem value="webp">WEBP</SelectItem>
            </SelectContent>
          </Select>

          {/* Pro Mode Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowProMode(!showProMode)}
            className={showProMode 
              ? 'bg-aged-brass/10 border-aged-brass text-aged-brass hover:bg-aged-brass/20' 
              : 'bg-zinc-800 border-zinc-700 text-zinc-100 hover:bg-zinc-700'
            }
          >
            <Settings className="w-4 h-4 mr-2" />
            Pro Mode
            {Object.keys(proModeControls).length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {Object.keys(proModeControls).length}
              </Badge>
            )}
          </Button>

          {/* Save Button */}
          {flaggedCount > 0 && (
            <Button onClick={handleSaveSession} disabled={isSaving} variant="outline">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save ({flaggedCount})
            </Button>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!mainPrompt.trim() || isGenerating || currentSession.images.length >= MAX_IMAGES_PER_SESSION}
            size="lg"
            variant="brass"
            className="px-6"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex flex-1 overflow-hidden relative">
        {/* Center Viewport (Fixed) */}
        <section className="flex-1 flex flex-col relative">
          {/* Image Viewport */}
          <div className="flex-1 bg-zinc-900/30 flex items-center justify-center relative overflow-hidden">
            {heroImage ? (
              <div className="relative w-full h-full flex items-center justify-center p-8">
                <img 
                  src={heroImage.imageUrl} 
                  alt="Generated" 
                  className="max-w-full max-h-full object-contain rounded-lg border-2 border-zinc-800"
                />
                <div className="absolute top-8 right-8 flex gap-2">
                  <Button
                    size="sm"
                    variant={heroImage.approvalStatus === 'flagged' ? 'default' : 'secondary'}
                    onClick={() => handleToggleApproval(heroImage.id)}
                    className="bg-zinc-900/90 backdrop-blur-sm"
                  >
                    <Heart className={cn("w-4 h-4", heroImage.approvalStatus === 'flagged' && "fill-current")} />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => window.open(heroImage.imageUrl, '_blank')}
                    className="bg-zinc-900/90 backdrop-blur-sm"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center space-y-4 p-8">
                <Sparkles className="w-20 h-20 text-aged-brass opacity-40" />
                <div>
                  <h3 className="text-2xl font-semibold text-aged-paper mb-2">
                    Your Canvas Awaits
                  </h3>
                  <p className="text-zinc-400 text-lg">
                    Describe your vision below and watch Madison bring it to life
                  </p>
                </div>
              </div>
            )}

            {/* Generating Overlay */}
            {isGenerating && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                <Loader2 className="w-12 h-12 text-aged-brass animate-spin mb-4" />
                <p className="text-aged-paper text-lg font-medium">Generating magic...</p>
                <p className="text-zinc-400 text-sm mt-2">This may take a moment</p>
              </div>
            )}
          </div>

          {/* Thumbnail Carousel */}
          {currentSession.images.length > 0 && (
            <div className="flex gap-2 p-3 overflow-x-auto border-t border-zinc-800 bg-zinc-900/50 scrollbar-thin scrollbar-thumb-zinc-700">
              {currentSession.images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => handleSetHero(img.id)}
                  className={`w-24 h-24 rounded-md overflow-hidden shrink-0 border-2 transition-all ${
                    heroImage?.imageUrl === img.imageUrl
                      ? 'border-aged-brass shadow-lg scale-105'
                      : 'border-zinc-700 hover:border-zinc-600 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={img.imageUrl} 
                    alt={`Generation ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {img.approvalStatus === 'flagged' && (
                    <Heart className="absolute top-1 right-1 w-3 h-3 fill-aged-brass text-aged-brass" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Prompt Bar (Fixed Bottom) */}
          <footer className="flex items-center gap-3 px-6 py-4 border-t border-zinc-800 bg-zinc-900/80 backdrop-blur-sm sticky bottom-0">
            <Textarea
              value={mainPrompt}
              onChange={(e) => setMainPrompt(e.target.value)}
              placeholder="Describe the image you want to create..."
              className="flex-1 min-h-[60px] max-h-[120px] resize-none bg-zinc-800 border-zinc-700 text-aged-paper placeholder:text-zinc-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />
            <Button
              onClick={handleGenerate}
              disabled={!mainPrompt.trim() || isGenerating || currentSession.images.length >= MAX_IMAGES_PER_SESSION}
              size="lg"
              variant="brass"
              className="h-[60px] px-6"
            >
              {isGenerating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Wand2 className="w-5 h-5" />
              )}
            </Button>
          </footer>
        </section>

        {/* Pro Mode Drawer (Overlay) */}
        {showProMode && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setShowProMode(false)}
            />
            
            {/* Drawer */}
            <aside className="fixed right-0 top-[69px] bottom-0 w-96 border-l border-zinc-800 bg-zinc-900 shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right duration-300">
              <ScrollArea className="h-full">
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-aged-brass">Pro Mode Settings</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowProMode(false)}
                      className="text-zinc-400 hover:text-aged-paper"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Reference Images */}
                  <div>
                    <h3 className="text-sm font-medium text-aged-paper mb-3">Reference Images</h3>
                    <ReferenceUpload
                      images={referenceImages}
                      onUpload={handleReferenceUpload}
                      onRemove={handleReferenceRemove}
                      maxImages={3}
                    />
                  </div>

                  {/* Pro Mode Controls */}
                  <div>
                    <h3 className="text-sm font-medium text-aged-paper mb-3">Advanced Controls</h3>
                    <ProModePanel
                      onControlsChange={setProModeControls}
                      initialValues={proModeControls}
                    />
                  </div>

                  {/* Brand Context Info */}
                  {brandContext && (
                    <Card className="p-3 bg-zinc-800/50 border-zinc-700">
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
              </ScrollArea>
            </aside>
          </>
        )}
      </main>

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
    </div>
  );
}
