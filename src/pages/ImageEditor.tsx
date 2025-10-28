// React & Router
import { useState, useEffect, useRef, useCallback } from "react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  X,
  MessageCircle,
  Menu
} from "lucide-react";

// Feature Components
import { ReferenceUpload } from "@/components/image-editor/ReferenceUpload";
import { ImageChainBreadcrumb } from "@/components/image-editor/ImageChainBreadcrumb";
import { RefinementPanel } from "@/components/image-editor/RefinementPanel";
import { ProModePanel, ProModeControls } from "@/components/image-editor/ProModePanel";
import { GeneratingLoader } from "@/components/forge/GeneratingLoader";
import ThumbnailRibbon from "@/components/image-editor/ThumbnailRibbon";
import MadisonPanel from "@/components/image-editor/MadisonPanel";
import ShotTypeDropdown from "@/components/image-editor/ShotTypeDropdown";
import { ProductImageUpload } from "@/components/image-editor/ProductImageUpload";
import MobileShotTypeSelector from "@/components/image-editor/MobileShotTypeSelector";
import MobileAspectRatioSelector from "@/components/image-editor/MobileAspectRatioSelector";
import MobileReferenceUpload from "@/components/image-editor/MobileReferenceUpload";
import MobileGeneratedImageView from "@/components/image-editor/MobileGeneratedImageView";
import MobileCreateForm from "@/components/image-editor/MobileCreateForm";
import { ProductSelector } from "@/components/forge/ProductSelector";
import { Product } from "@/hooks/useProducts";


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
  const isMobile = useIsMobile();
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [marketplace, setMarketplace] = useState<string>("etsy");
  const [aspectRatio, setAspectRatio] = useState<string>("5:4");
  const [outputFormat, setOutputFormat] = useState<"png" | "jpeg" | "webp">("png");
  
  const [mainPrompt, setMainPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showProMode, setShowProMode] = useState(false);
  
  // Pro Mode Controls State
  const [proModeControls, setProModeControls] = useState<ProModeControls>({});
  
  // Product Context State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
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
  const [isMadisonOpen, setIsMadisonOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"create" | "gallery">("create");
  const [productImage, setProductImage] = useState<{ url: string; file: File } | null>(null);
  const [showGeneratedView, setShowGeneratedView] = useState(false);
  const [latestGeneratedImage, setLatestGeneratedImage] = useState<string | null>(null);
  
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

  const handleGenerate = async (promptOverride?: string) => {
    const effectivePrompt = (promptOverride ?? mainPrompt).trim();
    if (!effectivePrompt || !user) {
      toast.error("Please enter a prompt");
      return;
    }

    if (currentSession.images.length >= MAX_IMAGES_PER_SESSION) {
      toast.error(`Session limit reached (${MAX_IMAGES_PER_SESSION} images). Please save this session first.`);
      return;
    }

    if (promptOverride) {
      setMainPrompt(promptOverride);
    }

    setIsGenerating(true);
    
    try {
      // Don't enhance on frontend - let backend handle Pro Mode
      const finalPrompt = effectivePrompt;
      
      // Prepare reference images array based on mode
      let generationReferenceImages = [];
      
      if (productImage) {
        // Image-to-image mode: use product image as primary reference
        generationReferenceImages = [{
          url: productImage.url,
          label: 'Product' as const,
          description: 'User-uploaded product for enhancement'
        }];
      } else if (showProMode && referenceImages.length > 0) {
        // Pro Mode: use Pro Mode references
        generationReferenceImages = referenceImages.map(r => ({ 
          url: r.url, 
          description: r.description, 
          label: r.label 
        }));
      }
      
      // Determine if Pro Mode controls are active
      const hasProModeControls = Object.keys(proModeControls).length > 0;
      const proModePayload = hasProModeControls ? proModeControls : undefined;
      
      // Log generation payload for debugging
      console.log('🎨 Image Generation Payload:', {
        prompt: finalPrompt,
        aspectRatio,
        outputFormat,
        proModeEnabled: showProMode,
        proModeControls: proModePayload,
        proModeActive: hasProModeControls,
        hasReferenceImages: generationReferenceImages.length > 0,
        hasBrandContext: !!brandContext
      });
      
      // Show appropriate toast message
      if (hasProModeControls) {
        toast.success("Generating with Pro Mode settings...", {
          description: "Advanced parameters applied"
        });
      }
      
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'generate-madison-image',
        {
          body: {
            prompt: finalPrompt,
            userId: user.id,
            organizationId: orgId,
            sessionId: sessionId,
            goalType: 'product_photography',
            aspectRatio,
            outputFormat,
            referenceImages: generationReferenceImages,
            brandContext: brandContext || undefined,
            isRefinement: false,
            proModeControls: proModePayload,
            product_id: selectedProduct?.id || undefined,
            productContext: selectedProduct ? {
              name: selectedProduct.name,
              collection: selectedProduct.collection || 'Unknown',
              scent_family: selectedProduct.scentFamily || 'Unspecified',
              category: selectedProduct.category
            } : undefined
          }
        }
      );

      if (functionError) throw functionError;
      if (!functionData?.imageUrl) throw new Error("No image URL returned");
      if (!functionData?.savedImageId) {
        console.error('❌ No savedImageId returned from backend');
        throw new Error("Image generation failed: Database save unsuccessful");
      }

      // Backend already saved the image with valid ID
      const newImage: GeneratedImage = {
        id: functionData.savedImageId,
        imageUrl: functionData.imageUrl,
        prompt: effectivePrompt,
        timestamp: Date.now(),
        isHero: currentSession.images.length === 0,
        approvalStatus: "pending",
        chainDepth: 0,
        isChainOrigin: true
      };

      setCurrentSession(prev => ({
        ...prev,
        name: prev.images.length === 0 ? generateSessionName(effectivePrompt) : prev.name,
        images: [...prev.images, newImage]
      }));

      setAllPrompts(prev => [...prev, { role: 'user', content: effectivePrompt }]);
      toast.success("Image generated successfully!");
      
      // On mobile, transition to full-screen generated view
      if (isMobile) {
        setLatestGeneratedImage(newImage.imageUrl);
        setShowGeneratedView(true);
      } else {
        // Auto-switch to gallery tab on desktop
        setActiveTab("gallery");
      }
      
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
      setProductImage(null);
      
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
            sessionId: sessionId,
            goalType: 'product_photography',
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
      if (!functionData?.savedImageId) {
        console.error('❌ No savedImageId returned from refinement');
        throw new Error("Refinement failed: Database save unsuccessful");
      }

      // Backend already saved the image with valid ID
      const newImage: GeneratedImage = {
        id: functionData.savedImageId,
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

  const saveLatestImageToLibrary = async () => {
    const latestImage = currentSession.images[currentSession.images.length - 1];
    if (!latestImage || !user) {
      toast.error("No image to save");
      return;
    }
    
    setIsSaving(true);
    try {
      console.log('💾 Saving image to library:', latestImage.id);

      // Direct database update with retry logic for reliability
      let retryCount = 0;
      const maxRetries = 3;
      let updateSuccess = false;

      while (retryCount < maxRetries && !updateSuccess) {
        try {
          const { error: directError } = await supabase
            .from('generated_images')
            .update({ saved_to_library: true })
            .eq('id', latestImage.id);

          if (directError) {
            console.error(`❌ Direct update attempt ${retryCount + 1} failed:`, directError);
            
            // If RLS is blocking, try the edge function as fallback
            if (directError.code === 'PGRST301' || directError.message?.includes('policy')) {
              console.log('⚠️ RLS blocking direct update, trying edge function...');
              const { data: serverData, error: serverError } = await supabase.functions.invoke(
                'mark-generated-image-saved',
                { body: { imageId: latestImage.id, userId: user.id } }
              );

              if (serverError) throw serverError;
              if (!serverData?.success) throw new Error('Edge function save failed');
            } else {
              throw directError;
            }
          }

          updateSuccess = true;
          console.log('✅ Image saved successfully');
        } catch (attemptError) {
          retryCount++;
          if (retryCount >= maxRetries) throw attemptError;
          console.log(`⏳ Retry ${retryCount}/${maxRetries}...`);
          await new Promise(resolve => setTimeout(resolve, 500 * retryCount));
        }
      }
      
      // Update local state to mark as flagged
      setCurrentSession(prev => ({
        ...prev,
        images: prev.images.map(img => 
          img.id === latestImage.id 
            ? { ...img, approvalStatus: 'flagged' as ApprovalStatus }
            : img
        )
      }));
      
      toast.success("Image saved to library!");
      setShowGeneratedView(false);
      setActiveTab("gallery");
    } catch (error: any) {
      console.error('❌ Save error after all retries:', error);
      toast.error(error.message || "Failed to save image. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleMobileRefine = async (newPrompt: string) => {
    if (!user) {
      toast.error("Please log in to continue");
      return;
    }

    const latestImage = currentSession.images[currentSession.images.length - 1];
    
    // If no images exist, do a fresh generation
    if (!latestImage) {
      console.log('📸 No existing image, doing fresh generation');
      try {
        await handleGenerate(newPrompt);
      } catch (e) {
        console.error('Fresh generation failed:', e);
        toast.error("Unable to generate image. Please try again.");
      }
      return;
    }
    
    // Determine if this is a refinement or new generation
    const originalPrompt = latestImage.prompt.trim();
    const trimmedNewPrompt = newPrompt.trim();
    
    // If prompts are identical or new prompt is empty, treat as refinement with default instruction
    const isRefinement = originalPrompt === trimmedNewPrompt || !trimmedNewPrompt;
    
    if (isRefinement) {
      // Chain depth limit check
      if (latestImage.chainDepth >= 5) {
        toast.error("Maximum refinement depth reached (5 iterations). Please start a new generation.");
        return;
      }
      
      // Use a default refinement instruction
      const defaultInstruction = "Enhance this image with better lighting and composition";
      console.log('🔄 Refining with default instruction');
      
      setIsGenerating(true);
      
      try {
        const { data: functionData, error: functionError } = await supabase.functions.invoke(
          'generate-madison-image',
          {
            body: {
              prompt: latestImage.prompt,
              userId: user.id,
              organizationId: orgId,
              sessionId: sessionId,
              goalType: 'product_photography',
              parentPrompt: latestImage.prompt,
              aspectRatio,
              outputFormat,
              referenceImages: referenceImages.map(r => ({ url: r.url, description: r.description, label: r.label })),
              brandContext: brandContext || undefined,
              isRefinement: true,
              refinementInstruction: defaultInstruction,
              parentImageId: latestImage.id
            }
          }
        );

        if (functionError) throw functionError;
        if (!functionData?.imageUrl) throw new Error("No image returned");
        if (!functionData?.savedImageId) throw new Error("Database save failed");

        const newImage: GeneratedImage = {
          id: functionData.savedImageId,
          imageUrl: functionData.imageUrl,
          prompt: latestImage.prompt,
          timestamp: Date.now(),
          isHero: false,
          approvalStatus: "pending",
          parentImageId: latestImage.id,
          chainDepth: latestImage.chainDepth + 1,
          isChainOrigin: false,
          refinementInstruction: defaultInstruction
        };

        setCurrentSession(prev => ({
          ...prev,
          images: [...prev.images.map(img => ({ ...img, isHero: false })), { ...newImage, isHero: true }]
        }));

        setLatestGeneratedImage(newImage.imageUrl);
        toast.success(`Refinement ${latestImage.chainDepth + 1} complete!`);
        
      } catch (error: any) {
        console.error('❌ Refinement error:', error);
        toast.error(error.message || "Refinement failed. Please try again.");
      } finally {
        setIsGenerating(false);
      }
    } else {
      // New generation with modified prompt
      console.log('📸 New prompt detected, doing fresh generation');
      try {
        await handleGenerate(newPrompt);
      } catch (e) {
        console.error('New generation failed:', e);
        toast.error("Unable to generate image. Please try again.");
      }
    }
  };

  const resizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Reset height to auto to get accurate scrollHeight
    textarea.style.height = 'auto';
    
    // Calculate new height (min 48px, max 250px)
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 48), 250);
    textarea.style.height = `${newHeight}px`;
    
    // Toggle overflow based on whether content exceeds max height
    textarea.style.overflowY = textarea.scrollHeight > 250 ? 'auto' : 'hidden';
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [mainPrompt, resizeTextarea]);

  const heroImage = currentSession.images.find(img => img.isHero);
  const flaggedCount = currentSession.images.filter(img => img.approvalStatus === 'flagged').length;

  // Mobile Layout
  if (isMobile) {
    // Show full-screen generated image view after generation
    if (showGeneratedView && latestGeneratedImage) {
      return (
        <MobileGeneratedImageView
          imageUrl={latestGeneratedImage}
          prompt={mainPrompt}
          aspectRatio={aspectRatio}
          onSave={saveLatestImageToLibrary}
          onClose={() => {
            setShowGeneratedView(false);
            setActiveTab("gallery");
          }}
          onRegenerate={handleMobileRefine}
          onPromptChange={setMainPrompt}
          onAspectRatioChange={setAspectRatio}
          onShotTypeSelect={async (shotType) => {
            setMainPrompt(shotType.prompt);
            toast.success(`${shotType.label} style applied`);
          }}
          isGenerating={isGenerating}
          isSaving={isSaving}
        />
      );
    }

    return (
      <div className="flex flex-col min-h-screen bg-studio-charcoal text-aged-paper pb-16">
        {/* Mobile Header - Compact */}
        <header className="flex items-center justify-between px-4 py-2 border-b border-studio-border bg-studio-card/50 backdrop-blur-sm sticky top-0 z-20 h-10">
          <h1 className="text-sm font-semibold text-aged-brass pl-2">Image Studio</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMadisonOpen(true)}
              className="text-aged-brass hover:text-aged-brass/80 h-8 w-8 p-0"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
            {flaggedCount > 0 && (
              <Button onClick={handleSaveSession} disabled={isSaving} variant="outline" size="sm" className="h-8">
                <Save className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </header>

        {/* Mobile Tabs - Compact */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "create" | "gallery")} className="flex-1 flex flex-col">
          <TabsList className="w-full grid grid-cols-2 bg-studio-card border-b border-studio-border rounded-none h-10">
            <TabsTrigger 
              value="create" 
              className="data-[state=active]:bg-studio-charcoal data-[state=active]:text-aged-brass data-[state=active]:border-b-2 data-[state=active]:border-aged-brass rounded-none"
            >
              Create
            </TabsTrigger>
            <TabsTrigger 
              value="gallery"
              className="data-[state=active]:bg-studio-charcoal data-[state=active]:text-aged-brass data-[state=active]:border-b-2 data-[state=active]:border-aged-brass rounded-none"
            >
              Gallery ({currentSession.images.length})
            </TabsTrigger>
          </TabsList>

          {/* Create Tab - Freepik Style */}
          <TabsContent value="create" className="flex-1 flex flex-col mt-0 overflow-hidden">
            <MobileCreateForm
              prompt={mainPrompt}
              onPromptChange={setMainPrompt}
              aspectRatio={aspectRatio}
              onAspectRatioChange={setAspectRatio}
              onShotTypeSelect={async (shotType) => {
                setMainPrompt(shotType.prompt);
                toast.success(`${shotType.label} style applied`);
                
                try {
                  const { data: { session } } = await supabase.auth.getSession();
                  if (session?.access_token && user?.id && orgId) {
                    await supabase.functions.invoke('log-shot-type', {
                      body: {
                        organization_id: orgId,
                        session_id: currentSession?.id || null,
                        label: shotType.label,
                        prompt: shotType.prompt
                      }
                    });
                  }
                } catch (error) {
                  console.error('Failed to log shot type:', error);
                }
              }}
              referenceImage={productImage}
              onReferenceUpload={(file, url) => setProductImage({ file, url })}
              onReferenceRemove={() => setProductImage(null)}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              marketplace={marketplace}
              imagesCount={currentSession.images.length}
              maxImages={MAX_IMAGES_PER_SESSION}
            />
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="flex-1 px-4 py-4 overflow-y-auto mt-0">
            {currentSession.images.length > 0 ? (
              <div className="space-y-4">
                {/* Hero Image */}
                {heroImage && (
                  <div className="relative w-full rounded-lg overflow-hidden border border-studio-border bg-studio-card">
                    <div className="relative w-full" style={{ aspectRatio: aspectRatio.replace(':', '/') }}>
                      <img
                        src={heroImage.imageUrl}
                        alt="Generated"
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                    </div>
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button
                        size="sm"
                        variant={heroImage.approvalStatus === 'flagged' ? 'default' : 'secondary'}
                        onClick={() => handleToggleApproval(heroImage.id)}
                        className="bg-studio-card/90 backdrop-blur-sm h-8 w-8 p-0"
                      >
                        <Heart className={cn("w-4 h-4", heroImage.approvalStatus === 'flagged' && "fill-current")} />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={async () => {
                          try {
                            let downloadUrl = heroImage.imageUrl;
                            
                            if (heroImage.imageUrl.startsWith('data:')) {
                              downloadUrl = heroImage.imageUrl;
                            } else {
                              const response = await fetch(heroImage.imageUrl, { mode: 'cors' });
                              const blob = await response.blob();
                              downloadUrl = URL.createObjectURL(blob);
                            }
                            
                            const link = document.createElement('a');
                            link.href = downloadUrl;
                            link.download = `madison-image-${Date.now()}.webp`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            
                            if (!heroImage.imageUrl.startsWith('data:')) {
                              URL.revokeObjectURL(downloadUrl);
                            }
                            
                            toast.success("Image downloaded!");
                          } catch (error) {
                            console.error('Download failed:', error);
                            toast.error("Failed to download image");
                          }
                        }}
                        className="bg-studio-card/90 backdrop-blur-sm h-8 w-8 p-0"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Thumbnail Carousel */}
                {currentSession.images.length > 1 && (
                  <div className="space-y-2">
                    <Label className="text-studio-text-primary text-sm">All Images ({currentSession.images.length})</Label>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {currentSession.images.map((img, index) => (
                        <button
                          key={img.id}
                          onClick={() => handleSetHero(img.id)}
                          className={cn(
                            "shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all",
                            img.isHero
                              ? "border-aged-brass"
                              : "border-studio-border hover:border-studio-border/80"
                          )}
                        >
                          <img
                            src={img.imageUrl}
                            alt={`Generated ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("create")}
                    className="flex-1"
                  >
                    Create Another
                  </Button>
                  {flaggedCount > 0 && (
                    <Button
                      onClick={handleSaveSession}
                      disabled={isSaving}
                      variant="brass"
                      className="flex-1"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save ({flaggedCount})
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full space-y-4">
                <Sparkles className="w-16 h-16 text-aged-brass opacity-40" />
                <div>
                  <h3 className="text-xl font-semibold text-aged-paper mb-2">
                    No images yet
                  </h3>
                  <p className="text-studio-text-muted mb-4">
                    Create your first image in the Create tab
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("create")}
                  >
                    Go to Create
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Generating Overlay */}
        {isGenerating && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-50">
            <Loader2 className="w-12 h-12 text-aged-brass animate-spin mb-4" />
            <p className="text-aged-paper text-lg font-medium">Generating magic...</p>
            <p className="text-studio-text-muted text-sm mt-2">This may take a moment</p>
          </div>
        )}

        {/* Madison Panel (Full-Screen Bottom Sheet) */}
        <MadisonPanel
          sessionCount={currentSession.images.length}
          maxImages={MAX_IMAGES_PER_SESSION}
          isOpen={isMadisonOpen}
          onToggle={() => setIsMadisonOpen(!isMadisonOpen)}
          isMobile={true}
          productContext={selectedProduct ? {
            name: selectedProduct.name,
            collection: selectedProduct.collection || 'Unknown',
            scent_family: selectedProduct.scentFamily || 'Unspecified',
            category: selectedProduct.category
          } : null}
        />
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="flex flex-col h-screen bg-studio-charcoal text-aged-paper">
      {/* Top Toolbar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-studio-border bg-studio-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-studio-text-muted hover:text-aged-paper"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-aged-brass">Image Studio</h1>
            <p className="text-xxs text-studio-text-muted">Powered by Nano Banana</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Product Selector */}
          <ProductSelector
            value={selectedProduct?.name || ""}
            onSelect={setSelectedProduct}
            onProductDataChange={setSelectedProduct}
            showLabel={false}
            className="w-[200px]"
            buttonClassName="w-[200px] bg-studio-charcoal border-studio-border text-studio-text-primary hover:bg-studio-card transition-colors justify-between"
          />
          
          {/* Shot Type */}
          <ShotTypeDropdown
            onSelect={async (shotType) => {
              setMainPrompt(shotType.prompt);
              toast.success(`${shotType.label} style applied`);
              
              // Log shot type selection to backend
              try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.access_token && user?.id && orgId) {
                  await supabase.functions.invoke('log-shot-type', {
                    body: {
                      organization_id: orgId,
                      session_id: currentSession?.id || null,
                      label: shotType.label,
                      prompt: shotType.prompt
                    }
                  });
                }
              } catch (error) {
                console.error('Failed to log shot type:', error);
              }
            }}
            className="w-[160px] bg-studio-charcoal border-studio-border text-studio-text-primary"
          />

          {/* Aspect Ratio */}
          <Select value={aspectRatio} onValueChange={setAspectRatio}>
            <SelectTrigger className="w-[140px] bg-studio-charcoal border-studio-border text-studio-text-primary hover:bg-studio-card transition-colors">
              <SelectValue placeholder="Aspect ratio" />
            </SelectTrigger>
            <SelectContent className="bg-studio-charcoal border-studio-border text-studio-text-primary z-50 backdrop-blur-sm">
              <SelectItem value="1:1" className="hover:bg-studio-card">1:1 Square</SelectItem>
              <SelectItem value="16:9" className="hover:bg-studio-card">16:9 Landscape</SelectItem>
              <SelectItem value="9:16" className="hover:bg-studio-card">9:16 Portrait</SelectItem>
              <SelectItem value="4:3" className="hover:bg-studio-card">4:3 Classic</SelectItem>
              <SelectItem value="4:5" className="hover:bg-studio-card">4:5 Portrait</SelectItem>
              <SelectItem value="5:4" className="hover:bg-studio-card">5:4 Etsy</SelectItem>
            </SelectContent>
          </Select>

          {/* Output Format */}
          <Select value={outputFormat} onValueChange={(v: any) => setOutputFormat(v)}>
            <SelectTrigger className="w-[120px] bg-studio-charcoal border-studio-border text-studio-text-primary hover:bg-studio-card transition-colors">
              <SelectValue placeholder="Output" />
            </SelectTrigger>
            <SelectContent className="bg-studio-charcoal border-studio-border text-studio-text-primary z-50 backdrop-blur-sm">
              <SelectItem value="png" className="hover:bg-studio-card">PNG</SelectItem>
              <SelectItem value="jpeg" className="hover:bg-studio-card">JPG</SelectItem>
              <SelectItem value="webp" className="hover:bg-studio-card">WEBP</SelectItem>
            </SelectContent>
          </Select>

          {/* Pro Mode Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowProMode(!showProMode)}
            className={showProMode 
              ? 'bg-aged-brass/10 border-aged-brass text-aged-brass hover:bg-aged-brass/20' 
              : 'bg-studio-charcoal border-studio-border text-studio-text-primary hover:bg-studio-card'
            }
          >
            <Settings className="w-4 h-4 mr-2" />
            Pro mode
            {Object.keys(proModeControls).length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xxs bg-aged-brass/20 text-aged-brass border-aged-brass/30">
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
            onClick={() => handleGenerate()}
            disabled={!mainPrompt.trim() || isGenerating || currentSession.images.length >= MAX_IMAGES_PER_SESSION}
            size="lg"
            variant="brass"
            className="px-6 relative"
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
                {Object.keys(proModeControls).length > 0 && (
                  <span className="ml-1 text-xxs opacity-70">Pro</span>
                )}
              </>
            )}
          </Button>

          {/* Ask Madison Button */}
          <Button
            onClick={() => setIsMadisonOpen(!isMadisonOpen)}
            variant="outline"
            className="border-[#B8956A] bg-[#2A241C] text-[#E9E3D5] hover:bg-[#3A3228] hover:text-[#FFFCF5] font-medium px-4 transition-all duration-200 ease-in-out hover:shadow-[0_0_12px_rgba(184,149,106,0.2)]"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Ask Madison
          </Button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex flex-1 overflow-hidden relative">
        {/* Center Viewport (Fixed) */}
        <section className="flex-1 flex flex-col relative">
          {/* Image Viewport */}
          <div className="flex-1 bg-studio-card/30 flex items-center justify-center relative overflow-hidden">
            {heroImage ? (
              <div className="relative w-full h-full flex items-center justify-center p-8">
                <img 
                  src={heroImage.imageUrl} 
                  alt="Generated" 
                  className="max-w-full max-h-full object-contain rounded-lg border-2 border-studio-border"
                />
                <div className="absolute top-8 right-8 flex gap-2">
                  <Button
                    size="sm"
                    variant={heroImage.approvalStatus === 'flagged' ? 'default' : 'secondary'}
                    onClick={() => handleToggleApproval(heroImage.id)}
                    className="bg-studio-card/90 backdrop-blur-sm"
                  >
                    <Heart className={cn("w-4 h-4", heroImage.approvalStatus === 'flagged' && "fill-current")} />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      try {
                        let downloadUrl = heroImage.imageUrl;
                        
                        // If it's a base64 data URL, use it directly
                        if (heroImage.imageUrl.startsWith('data:')) {
                          downloadUrl = heroImage.imageUrl;
                        } else {
                          // For regular URLs, fetch and convert to blob URL
                          const response = await fetch(heroImage.imageUrl, { mode: 'cors' });
                          const blob = await response.blob();
                          downloadUrl = URL.createObjectURL(blob);
                        }
                        
                        const link = document.createElement('a');
                        link.href = downloadUrl;
                        link.download = `madison-image-${Date.now()}.${outputFormat}`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        
                        // Clean up blob URL if we created one
                        if (!heroImage.imageUrl.startsWith('data:')) {
                          URL.revokeObjectURL(downloadUrl);
                        }
                        
                        toast.success("Image downloaded!");
                      } catch (error) {
                        console.error('Download failed:', error);
                        toast.error("Failed to download image");
                      }
                    }}
                    className="bg-studio-card/90 backdrop-blur-sm"
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
                    Your canvas awaits
                  </h3>
                  <p className="text-studio-text-muted text-lg">
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
                <p className="text-studio-text-muted text-sm mt-2">This may take a moment</p>
              </div>
            )}
          </div>

          {/* Thumbnail Carousel - 10 Slot */}
          {currentSession.images.length > 0 && (
            <ThumbnailRibbon
              images={currentSession.images.map(img => ({
                id: img.id,
                url: img.imageUrl,
                prompt: img.prompt,
                aspectRatio: aspectRatio,
                orderIndex: currentSession.images.indexOf(img)
              }))}
              activeIndex={currentSession.images.findIndex(img => img.isHero)}
              onSelect={(index) => {
                const selectedImage = currentSession.images[index];
                if (selectedImage) {
                  handleSetHero(selectedImage.id);
                }
              }}
              onSave={async (img) => {
                try {
                  const { error } = await supabase
                    .from('generated_images')
                    .update({ saved_to_library: true })
                    .eq('id', img.id);
                  
                  if (error) throw error;
                  toast.success("Image saved to library!");
                } catch (error) {
                  console.error('Error saving image:', error);
                  toast.error("Failed to save image");
                }
              }}
              onDelete={async (img) => {
                await handleDeleteImage(img.id);
              }}
              onRefine={(img) => {
                const imageToRefine = currentSession.images.find(i => i.id === img.id);
                if (imageToRefine) {
                  handleStartRefinement(imageToRefine);
                }
              }}
              onSaveSession={handleSaveSession}
            />
          )}

          {/* Prompt Bar (Fixed Bottom) */}
          <footer className="border-t border-studio-border bg-studio-card backdrop-blur-sm sticky bottom-0 z-[15]">
            {/* Pro Mode Status Indicator */}
            {Object.keys(proModeControls).length > 0 && (
              <div className="px-6 py-2 border-b border-studio-border/50 bg-aged-brass/5">
                <div className="flex items-center gap-2 text-xxs">
                  <Settings className="w-3 h-3 text-aged-brass" />
                  <span className="text-aged-brass font-medium">Pro mode active</span>
                  <span className="text-studio-text-muted">—</span>
                  <span className="text-studio-text-muted">
                    Advanced settings applied ({Object.keys(proModeControls).length} parameter{Object.keys(proModeControls).length > 1 ? 's' : ''})
                  </span>
                </div>
              </div>
            )}
            <div className="px-6 py-4">
              {/* Horizontal Layout: Drop Zone + Prompt + Generate Button */}
              <div className="flex items-center gap-3">
                {/* Drop Zone */}
                <div className="min-w-[220px] max-w-[280px]">
                  <ProductImageUpload
                    productImage={productImage}
                    onUpload={setProductImage}
                    onRemove={() => setProductImage(null)}
                    disabled={isGenerating}
                  />
                </div>

                {/* Prompt Field */}
                <Textarea
                  ref={textareaRef}
                  value={mainPrompt}
                  onChange={(e) => setMainPrompt(e.target.value)}
                  placeholder="Describe the image you want to create..."
                  className="flex-1 resize-none bg-[#111111] border border-zinc-700 text-[#F5F1E8] placeholder:text-zinc-500 focus-visible:ring-aged-brass/50"
                  style={{ 
                    color: '#F5F1E8',
                    minHeight: '3rem',
                    maxHeight: '250px',
                    height: '3rem',
                    transition: 'height 0.2s ease',
                    overflowY: 'hidden'
                  }}
                  onInput={resizeTextarea}
                  onPaste={() => {
                    // Use setTimeout to allow paste content to render before measuring
                    setTimeout(resizeTextarea, 0);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleGenerate();
                    }
                  }}
                  disabled={isGenerating}
                />

                {/* Generate Button */}
                <Button
                  onClick={() => handleGenerate()}
                  disabled={!mainPrompt.trim() || isGenerating || currentSession.images.length >= MAX_IMAGES_PER_SESSION}
                  size="lg"
                  variant="brass"
                  className="h-12 px-8 min-w-[180px] max-w-[220px]"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      {productImage ? "Enhance This Image" : "Generate Image"}
                    </>
                  )}
                </Button>
              </div>
            </div>
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
            <aside className="fixed right-0 top-[69px] bottom-0 w-96 border-l border-studio-border bg-studio-card shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right duration-300">
              <ScrollArea className="h-full">
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-aged-brass">Pro mode settings</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowProMode(false)}
                      className="text-studio-text-muted hover:text-aged-paper"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Reference Images */}
                  <div>
                    <h3 className="text-studio-text-primary text-sm font-medium flex items-center gap-2 mb-3">
                      <span className="text-aged-brass">📸</span> Add a reference image to guide Madison's creation
                    </h3>
                    <ReferenceUpload
                      images={referenceImages}
                      onUpload={handleReferenceUpload}
                      onRemove={handleReferenceRemove}
                      maxImages={3}
                    />
                  </div>

                  {/* Pro Mode Controls */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-aged-paper">Advanced controls</h3>
                      {Object.keys(proModeControls).length > 0 && (
                        <Badge className="bg-aged-brass/20 text-aged-brass border-aged-brass/30 text-xxs">
                          {Object.keys(proModeControls).length} active
                        </Badge>
                      )}
                    </div>
                    <ProModePanel
                      onControlsChange={setProModeControls}
                      initialValues={proModeControls}
                    />
                  </div>

                  {/* Brand Context Info */}
                  {brandContext && (
                    <Card className="p-3 bg-studio-charcoal/50 border-studio-border">
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
      </main>{/* close wrapper */}


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
      <MadisonPanel
        sessionCount={currentSession.images.length}
        maxImages={MAX_IMAGES_PER_SESSION}
        isOpen={isMadisonOpen}
        onToggle={() => setIsMadisonOpen(!isMadisonOpen)}
        isMobile={false}
        productContext={selectedProduct ? {
          name: selectedProduct.name,
          collection: selectedProduct.collection || 'Unknown',
          scent_family: selectedProduct.scentFamily || 'Unspecified',
          category: selectedProduct.category
        } : null}
        onSendMessage={async (message) => {
          console.log("Madison message:", message);
          // TODO: Integrate with Madison AI backend
        }}
      />
    </div>
  );
}
