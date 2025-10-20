import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentOrganizationId } from "@/hooks/useIndustryConfig";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Download, Loader2, Sparkles, ArrowLeft, Save, Star, Wand2, CheckCircle, XCircle, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EditorialAssistantPanel } from "@/components/assistant/EditorialAssistantPanel";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { MadisonVerticalTab } from "@/components/assistant/MadisonVerticalTab";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReferenceUpload } from "@/components/image-editor/ReferenceUpload";
import { Badge } from "@/components/ui/badge";

type ApprovalStatus = "pending" | "flagged" | "rejected";

type GeneratedImage = {
  id: string;
  imageUrl: string;
  prompt: string;
  timestamp: number;
  isHero?: boolean;
  approvalStatus: ApprovalStatus;
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
  const { user } = useAuth();
  const { orgId } = useCurrentOrganizationId();
  
  const [aspectRatio, setAspectRatio] = useState<string>("1:1");
  const [outputFormat, setOutputFormat] = useState<"png" | "jpeg" | "webp">("png");
  const [libraryCategory, setLibraryCategory] = useState<"content" | "marketplace" | "both">("content");
  
  const [userPrompt, setUserPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [madisonOpen, setMadisonOpen] = useState(false);
  
  // Reference image state (per-session) - now stores URL instead of base64
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null);
  const [referenceDescription, setReferenceDescription] = useState("");
  const [brandContext, setBrandContext] = useState<any>(null);
  
  // Fetch brand context on mount
  useEffect(() => {
    const fetchBrandContext = async () => {
      if (!orgId) return;

      try {
        // Fetch brand configuration for colors
        const { data: brandConfig } = await supabase
          .from('organizations')
          .select('brand_config')
          .eq('id', orgId)
          .single();

        // Fetch brand knowledge for voice/tone and style
        const { data: brandKnowledge } = await supabase
          .from('brand_knowledge')
          .select('content, knowledge_type')
          .eq('organization_id', orgId)
          .eq('is_active', true)
          .in('knowledge_type', ['brand_voice', 'brand_style']);

        const voiceKnowledge = brandKnowledge?.find(k => k.knowledge_type === 'brand_voice');
        const styleKnowledge = brandKnowledge?.find(k => k.knowledge_type === 'brand_style');

        setBrandContext({
          colors: (brandConfig?.brand_config as any)?.colors || [],
          voiceTone: (voiceKnowledge?.content as any)?.tone || '',
          styleKeywords: (styleKnowledge?.content as any)?.keywords || []
        });
      } catch (error) {
        console.error('Error fetching brand context:', error);
      }
    };

    fetchBrandContext();
  }, [orgId]);
  
  // Session management - Conversational start
  const [sessionId] = useState(crypto.randomUUID());
  const [sessionStarted, setSessionStarted] = useState(false);
  const [awaitingSessionName, setAwaitingSessionName] = useState(true);
  const [currentSession, setCurrentSession] = useState<ImageSession>({
    id: sessionId,
    name: "",
    images: [],
    createdAt: Date.now()
  });
  const [allPrompts, setAllPrompts] = useState<string[]>([]); // Track conversation

  const canGenerateMore = currentSession.images.length < MAX_IMAGES_PER_SESSION;
  const progressText = `${currentSession.images.length}/${MAX_IMAGES_PER_SESSION}`;
  const heroImage = currentSession.images.find(img => img.isHero) || currentSession.images[0];
  
  // Approval stats
  const flaggedCount = currentSession.images.filter(img => img.approvalStatus === "flagged").length;
  const rejectedCount = currentSession.images.filter(img => img.approvalStatus === "rejected").length;
  const pendingCount = currentSession.images.filter(img => img.approvalStatus === "pending").length;

  // Badge indicator for Madison
  const [showMadisonBadge, setShowMadisonBadge] = useState(false);

  useEffect(() => {
    if (currentSession.images.length >= 3 && !madisonOpen) {
      setShowMadisonBadge(true);
    }
    if (madisonOpen) {
      setShowMadisonBadge(false);
    }
  }, [currentSession.images.length, madisonOpen]);

  // Smart session name generator
  const generateSessionName = (prompt: string): string => {
    // Extract key nouns/concepts (basic implementation)
    const cleanPrompt = prompt.toLowerCase()
      .replace(/\b(generate|create|make|show|image|photo|picture|of|a|an|the)\b/gi, '')
      .trim();
    
    const words = cleanPrompt.split(/\s+/).filter(w => w.length > 3);
    const keyWords = words.slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1));
    
    return keyWords.length > 0 
      ? `${keyWords.join(' ')} Photography`
      : `Product Session ${new Date().toLocaleDateString()}`;
  };

  // Handle first message - auto-name from prompt or use as session name
  const handleFirstMessage = (message: string) => {
    const looksLikePrompt = /\b(bottle|product|perfume|candle|desert|photo|light|background|show|generate|create)\b/i.test(message);
    
    let finalSessionName: string;
    
    if (looksLikePrompt || message.length > 50) {
      // Auto-generate session name from prompt
      finalSessionName = generateSessionName(message);
      setCurrentSession(prev => ({ ...prev, name: finalSessionName }));
      setAwaitingSessionName(false);
      setSessionStarted(true);
      
      // Generate image directly
      handleGenerate(message);
    } else {
      // User provided a session name
      finalSessionName = message;
      setCurrentSession(prev => ({ ...prev, name: finalSessionName }));
      setAwaitingSessionName(false);
      setSessionStarted(true);
      
      toast.success(`Session "${finalSessionName}" started! Describe your first image.`);
    }
  };

  const handleGenerate = async (promptOverride?: string) => {
    const prompt = promptOverride || userPrompt;
    
    if (!prompt.trim() || !user || !orgId) {
      toast.error("Please enter a prompt to generate an image");
      return;
    }

    if (!sessionStarted) {
      toast.error("Please start a session first");
      return;
    }

    if (!canGenerateMore) {
      toast.error("Session complete! Save this session to start a new one.");
      return;
    }

    setIsGenerating(true);
    setAllPrompts(prev => [...prev, prompt]); // Track prompts

    try {
      const { data, error } = await supabase.functions.invoke("generate-madison-image", {
        body: {
          goalType: "product-photography",
          aspectRatio,
          outputFormat,
          prompt,
          organizationId: orgId,
          userId: user.id,
          selectedTemplate: null,
          userRefinements: currentSession.images.length > 0 ? prompt : null,
          referenceImageUrl: referenceImageUrl || undefined,
          referenceDescription: referenceDescription || undefined,
          brandContext: brandContext || undefined
        },
      });

      if (error) throw error;

      if (data?.imageUrl) {
        const newImage: GeneratedImage = {
          id: data.id || crypto.randomUUID(),
          imageUrl: data.imageUrl,
          prompt,
          timestamp: Date.now(),
          isHero: currentSession.images.length === 0,
          approvalStatus: "pending"
        };
        
        const imageOrder = currentSession.images.length;
        
        setCurrentSession(prev => ({
          ...prev,
          images: [...prev.images, newImage]
        }));
        
        // Auto-save to DB with saved_to_library: false
        const { error: insertError } = await supabase.from("generated_images").insert({
          id: data.savedImageId || newImage.id,
          organization_id: orgId,
          user_id: user.id,
          session_id: sessionId,
          session_name: currentSession.name,
          goal_type: "product-photography",
          aspect_ratio: aspectRatio,
          output_format: outputFormat,
          final_prompt: prompt,
          image_url: data.imageUrl,
          image_order: imageOrder,
          is_hero_image: imageOrder === 0,
          saved_to_library: false, // Not saved until user explicitly saves
        });
        
        if (insertError) {
          console.error("Failed to save image to DB:", insertError);
          toast.error("Image generated but not saved to database");
        }
        
        const isComplete = currentSession.images.length + 1 === MAX_IMAGES_PER_SESSION;
        
        toast.success(
          isComplete 
            ? `✨ Session complete! (${MAX_IMAGES_PER_SESSION}/${MAX_IMAGES_PER_SESSION}) Ready to save.`
            : `✨ Image generated! (${currentSession.images.length + 1}/${MAX_IMAGES_PER_SESSION})`
        );
        
        if (!promptOverride) setUserPrompt("");
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate image");
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
    toast.success("Hero image updated");
  };

  const handleToggleApproval = (imageId: string) => {
    setCurrentSession(prev => ({
      ...prev,
      images: prev.images.map(img => {
        if (img.id === imageId) {
          // Cycle: pending -> flagged -> rejected -> pending
          const nextStatus: ApprovalStatus = 
            img.approvalStatus === "pending" ? "flagged" :
            img.approvalStatus === "flagged" ? "rejected" : "pending";
          return { ...img, approvalStatus: nextStatus };
        }
        return img;
      })
    }));
  };

  const handleSaveSession = async () => {
    if (!user || !orgId) return;
    
    const flaggedImages = currentSession.images.filter(img => img.approvalStatus === "flagged");
    
    if (flaggedImages.length === 0) {
      toast.error("Please flag at least one image to save (click ✓ on thumbnails)");
      return;
    }

    setIsSaving(true);

    try {
      // Get IDs of flagged images
      const flaggedIds = flaggedImages.map(img => img.id);
      
      // Determine library category value
      const libraryCategoryValue = libraryCategory === "both" ? "content,marketplace" : libraryCategory;
      
      // Update only flagged images to saved_to_library: true
      const { error: updateError } = await supabase
        .from("generated_images")
        .update({ 
          saved_to_library: true,
          library_category: libraryCategoryValue
        })
        .in('id', flaggedIds);

      if (updateError) throw updateError;

      toast.success(`✅ Saved ${flaggedImages.length} approved images to ${libraryCategory === "both" ? "both libraries" : libraryCategory + " library"}`);
      
      // Reset for new session
      window.location.reload();
      
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save session");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadAll = () => {
    const flaggedImages = currentSession.images.filter(img => img.approvalStatus === "flagged");
    
    if (flaggedImages.length === 0) {
      toast.error("No approved images to download. Flag images first (✓).");
      return;
    }
    
    flaggedImages.forEach((image, index) => {
      const link = document.createElement('a');
      link.href = image.imageUrl;
      link.download = `${currentSession.name}-${index + 1}.${outputFormat}`;
      link.click();
    });
    toast.success(`Downloaded ${flaggedImages.length} approved images`);
  };
  
  const handleReferenceUpload = async (imageData: string, description: string) => {
    if (!user?.id) return;

    try {
      setIsGenerating(true);
      
      // Convert base64 to blob
      const base64Response = await fetch(imageData);
      const blob = await base64Response.blob();
      
      // Upload to storage
      const fileName = `${user.id}/${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('reference-images')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('reference-images')
        .getPublicUrl(fileName);

      setReferenceImageUrl(publicUrl);
      setReferenceDescription(description);
      toast.success("Reference image uploaded to session");
    } catch (error) {
      console.error('Error uploading reference image:', error);
      toast.error("Failed to upload reference image");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReferenceRemove = async () => {
    if (referenceImageUrl && user?.id) {
      try {
        // Extract file path from URL
        const urlParts = referenceImageUrl.split('/reference-images/');
        if (urlParts.length === 2) {
          await supabase.storage
            .from('reference-images')
            .remove([urlParts[1]]);
        }
      } catch (error) {
        console.error('Error deleting reference image:', error);
      }
    }
    
    setReferenceImageUrl(null);
    setReferenceDescription("");
    toast.success("Reference image removed");
  };

  const handleRefineImage = () => {
    if (!heroImage) return;
    setUserPrompt(`Refine the current image: `);
  };

  const quickRefinements = [
    "More dramatic lighting",
    "Different angle",
    "Clean white background",
    "Add soft shadows",
    "Closer product shot"
  ];

  return (
    <div className="min-h-screen bg-[#252220] flex">
      {/* Madison Vertical Tab - Always Visible */}
      <MadisonVerticalTab 
        isOpen={madisonOpen}
        onClick={() => setMadisonOpen(!madisonOpen)}
        hasSuggestions={showMadisonBadge}
      />

      {/* Madison Drawer - Slides from Right */}
      <Sheet open={madisonOpen} onOpenChange={setMadisonOpen}>
        <SheetContent 
          side="right" 
          className="w-[300px] p-0 border-l border-[#3D3935]"
          style={{ backgroundColor: '#2F2A26' }}
        >
          <EditorialAssistantPanel
            onClose={() => setMadisonOpen(false)}
            initialContent=""
            sessionContext={{
              sessionId: sessionId,
              sessionName: currentSession.name || "New Session",
              imagesGenerated: currentSession.images.length,
              maxImages: MAX_IMAGES_PER_SESSION,
              heroImage: heroImage ? {
                imageUrl: heroImage.imageUrl,
                prompt: heroImage.prompt
              } : undefined,
              allPrompts: allPrompts,
              aspectRatio: aspectRatio,
              outputFormat: outputFormat,
              isImageStudio: true
            }}
          />
        </SheetContent>
      </Sheet>

      <div className="flex-1 overflow-auto">
        <div className="max-w-[1800px] mx-auto p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="text-[#FFFCF5] hover:bg-[#3D3935]">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <h1 className="font-serif text-3xl text-[#FFFCF5]">Madison Image Studio</h1>
              </div>
              <p className="text-[#D4CFC8] text-sm">
                {sessionStarted 
                  ? `Session: ${currentSession.name} • ${progressText} images`
                  : "AI-powered product photography sessions"
                }
              </p>
            </div>
            
            <div className="flex gap-2 items-center">
              {sessionStarted && currentSession.images.length > 0 && (
                <>
                  <div className="flex gap-2 text-xs text-[#D4CFC8] mr-2">
                    <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {flaggedCount} Approved
                    </Badge>
                    {rejectedCount > 0 && (
                      <Badge variant="secondary" className="bg-red-500/20 text-red-300 border-red-500/30">
                        <XCircle className="w-3 h-3 mr-1" />
                        {rejectedCount} Rejected
                      </Badge>
                    )}
                  </div>
                  <Button
                    onClick={handleDownloadAll}
                    variant="outline"
                    size="sm"
                    className="border-[#3D3935] text-[#D4CFC8] hover:bg-[#3D3935] hover:text-[#FFFCF5]"
                    disabled={flaggedCount === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Approved
                  </Button>
                  <Button
                    onClick={handleSaveSession}
                    disabled={isSaving || flaggedCount === 0}
                    size="sm"
                    className="bg-brass hover:bg-brass/90 text-white"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save to Library ({flaggedCount})
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Conversational Session Start */}
          {!sessionStarted && (
            <Card className="p-8 bg-[#2F2A26] border-[#3D3935] shadow-sm mb-6 max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <Sparkles className="w-12 h-12 text-brass/50 mx-auto mb-4" />
                <h2 className="font-serif text-2xl text-[#FFFCF5] mb-2">Madison Image Studio</h2>
                <p className="text-[#D4CFC8]">
                  Let's create something beautiful. Describe the product image you want, or name your session first.
                </p>
              </div>
              
              <div className="space-y-3">
                <Textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="e.g., 'Desert Perfume Campaign' or 'Show a perfume bottle on desert sand at sunset'"
                  rows={3}
                  className="bg-[#252220] border-[#3D3935] text-[#FFFCF5] placeholder:text-[#A8A39E]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleFirstMessage(userPrompt);
                    }
                  }}
                />
                <Button
                  onClick={() => handleFirstMessage(userPrompt)}
                  disabled={!userPrompt.trim()}
                  className="w-full bg-brass hover:bg-brass/90 text-white"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Creating
                </Button>
                <p className="text-xs text-[#A8A39E] text-center">
                  Up to {MAX_IMAGES_PER_SESSION} images per session • Auto-saved as you create
                </p>
              </div>
            </Card>
          )}

          {/* Main Layout: 3-Column Layout - Gallery + Image + Chat Sidebar */}
          {sessionStarted && (
            <div className="flex gap-6 h-[calc(100vh-180px)]">
              {/* Left Sidebar - Thumbnail Gallery */}
              <div className="w-32 flex-shrink-0 space-y-3 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-[#D4CFC8] tracking-wide">SESSION</p>
                  <p className="text-xs font-bold text-brass">{progressText}</p>
                </div>
                
                {currentSession.images.map((image, index) => (
                  <div key={image.id} className="relative">
                    <button
                      onClick={() => handleSetHero(image.id)}
                      className={`relative w-full aspect-square rounded border-2 transition-all overflow-hidden hover:scale-105 ${
                        image.isHero
                          ? "border-brass shadow-md ring-2 ring-brass/20"
                          : image.approvalStatus === "flagged"
                          ? "border-green-500 ring-2 ring-green-500/20"
                          : image.approvalStatus === "rejected"
                          ? "border-red-500 ring-2 ring-red-500/20 opacity-50"
                          : "border-charcoal/20 hover:border-brass/50"
                      }`}
                    >
                      <img
                        src={image.imageUrl}
                        alt={`Generation ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {image.isHero && (
                        <div className="absolute top-1 right-1 bg-brass text-white rounded-full p-1">
                          <Star className="w-3 h-3 fill-white" />
                        </div>
                      )}
                      {image.approvalStatus === "flagged" && (
                        <div className="absolute top-1 left-1 bg-green-500 text-white rounded-full p-1">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                      {image.approvalStatus === "rejected" && (
                        <div className="absolute top-1 left-1 bg-red-500 text-white rounded-full p-1">
                          <X className="w-3 h-3" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-1">
                        <p className="text-[10px] text-white text-center font-medium">{index + 1}</p>
                      </div>
                    </button>
                    <button
                      onClick={() => handleToggleApproval(image.id)}
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#252220] border border-[#3D3935] rounded-full p-1 hover:bg-[#3D3935] transition-colors z-10"
                      title={`Approval status: ${image.approvalStatus}`}
                    >
                      {image.approvalStatus === "pending" && <Check className="w-3 h-3 text-[#A8A39E]" />}
                      {image.approvalStatus === "flagged" && <Check className="w-3 h-3 text-green-500" />}
                      {image.approvalStatus === "rejected" && <X className="w-3 h-3 text-red-500" />}
                    </button>
                  </div>
                ))}
                
                {/* Empty slots */}
                {Array.from({ length: Math.max(0, MAX_IMAGES_PER_SESSION - currentSession.images.length) }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="w-full aspect-square rounded border-2 border-dashed border-[#3D3935] bg-[#2F2A26]/50 flex items-center justify-center"
                  >
                    <p className="text-xs text-[#A8A39E] font-medium">
                      {currentSession.images.length + i + 1}
                    </p>
                  </div>
                ))}
              </div>

              {/* Center - Main Image Display */}
              <div className="flex-1 min-w-0">
                <Card className="h-full p-6 bg-[#2F2A26] border-[#3D3935] shadow-lg flex flex-col items-center justify-center overflow-auto">
                  {isGenerating ? (
                    <div className="text-center space-y-4">
                      <Loader2 className="w-12 h-12 text-brass animate-spin mx-auto" />
                      <p className="text-[#D4CFC8]">Generating your image...</p>
                      <p className="text-xs text-[#A8A39E]">This may take 15-30 seconds</p>
                    </div>
                  ) : heroImage ? (
                    <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                      <div className="relative flex items-center justify-center max-h-[450px]">
                        <img
                          src={heroImage.imageUrl}
                          alt="Generated Product"
                          className="max-h-[450px] w-auto object-contain rounded shadow-lg"
                        />
                        {heroImage.isHero && (
                          <div className="absolute top-4 right-4 bg-brass text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                            <Star className="w-3 h-3 fill-white" />
                            HERO
                          </div>
                        )}
                        <Button
                          onClick={handleRefineImage}
                          size="sm"
                          variant="secondary"
                          className="absolute top-4 left-4 bg-[#2F2A26]/90 hover:bg-[#2F2A26] border-[#3D3935] text-[#FFFCF5]"
                        >
                          <Wand2 className="w-4 h-4 mr-2" />
                          Refine This
                        </Button>
                      </div>
                      
                      <div className="text-center max-w-md px-4">
                        <p className="text-xs text-[#A8A39E] font-medium mb-2">GENERATION PROMPT</p>
                        <p className="text-sm text-[#D4CFC8] italic line-clamp-3">"{heroImage.prompt}"</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-3">
                      <Sparkles className="w-16 h-16 text-brass/30 mx-auto" />
                      <p className="text-lg text-[#FFFCF5] font-medium">Generate your first image</p>
                      <p className="text-sm text-[#D4CFC8]">Describe the product photo you want in the chat</p>
                    </div>
                  )}
                </Card>
              </div>

              {/* Right Sidebar - Export Settings + Chat */}
              <div className="w-80 flex-shrink-0 flex flex-col gap-4">
                {/* Export Settings - Compact Card */}
                <Card className="p-4 bg-[#2F2A26] border-[#3D3935] shadow-sm">
                  <h3 className="text-xs font-semibold text-[#D4CFC8] tracking-wide mb-3">EXPORT SETTINGS</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-[#A8A39E] mb-1.5 block">Aspect Ratio</Label>
                      <Select value={aspectRatio} onValueChange={setAspectRatio}>
                        <SelectTrigger className="bg-[#252220] border-[#3D3935] text-[#FFFCF5] h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1:1">Square (1:1)</SelectItem>
                          <SelectItem value="4:5">Portrait (4:5)</SelectItem>
                          <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                          <SelectItem value="9:16">Vertical (9:16)</SelectItem>
                          <SelectItem value="21:9">Ultra-wide (21:9)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-[#A8A39E] mb-1.5 block">Format</Label>
                      <Select value={outputFormat} onValueChange={(value: "png" | "jpeg" | "webp") => setOutputFormat(value)}>
                        <SelectTrigger className="bg-[#252220] border-[#3D3935] text-[#FFFCF5] h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="png">PNG</SelectItem>
                          <SelectItem value="jpeg">JPEG</SelectItem>
                          <SelectItem value="webp">WebP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-[#A8A39E] mb-1.5 block">Save to Library</Label>
                      <Select value={libraryCategory} onValueChange={(v) => setLibraryCategory(v as any)}>
                        <SelectTrigger className="bg-[#252220] border-[#3D3935] text-[#FFFCF5] h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="content">Content Library</SelectItem>
                          <SelectItem value="marketplace">Marketplace Library</SelectItem>
                          <SelectItem value="both">Both Libraries</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] text-[#A8A39E] mt-1 leading-tight">
                        {libraryCategory === "content" && "For social media & content"}
                        {libraryCategory === "marketplace" && "For product listings"}
                        {libraryCategory === "both" && "Save to both libraries"}
                      </p>
                    </div>
                  </div>
                </Card>
                
                {/* Reference Image Upload */}
                <ReferenceUpload
                  currentImage={referenceImageUrl}
                  description={referenceDescription}
                  onUpload={handleReferenceUpload}
                  onRemove={handleReferenceRemove}
                />

                {/* Chat Input Card - Takes remaining space */}
                <Card className="flex-1 p-4 bg-[#2F2A26] border-[#3D3935] shadow-sm flex flex-col min-h-0">
                  <h3 className="text-xs font-semibold text-[#D4CFC8] tracking-wide mb-3">CREATE & REFINE</h3>
                  
                  <div className="flex-1 flex flex-col gap-3 min-h-0">
                    {/* Textarea - Grows to fill space */}
                    <Textarea
                      value={userPrompt}
                      onChange={(e) => setUserPrompt(e.target.value)}
                      placeholder="Describe changes or a new image..."
                      disabled={!canGenerateMore}
                      className="flex-1 resize-none bg-[#252220] border-[#3D3935] text-[#FFFCF5] placeholder:text-[#A8A39E] min-h-[100px]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && canGenerateMore) {
                          e.preventDefault();
                          handleGenerate();
                        }
                      }}
                    />
                    
                    {/* Quick Refinements - Compact */}
                    <div className="flex-shrink-0">
                      <p className="text-xs text-[#A8A39E] mb-2 font-medium">QUICK REFINEMENTS</p>
                      <div className="flex flex-wrap gap-1.5">
                        {quickRefinements.map((refinement) => (
                          <button
                            key={refinement}
                            onClick={() => {
                              setUserPrompt(refinement);
                              handleGenerate(refinement);
                            }}
                            disabled={!canGenerateMore}
                            className="px-2 py-1 text-xs bg-[#252220] text-[#D4CFC8] border border-[#3D3935] rounded hover:bg-[#3D3935] hover:text-[#FFFCF5] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            <Wand2 className="w-3 h-3 inline mr-1" />
                            {refinement}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Generate Button + Progress */}
                    <div className="flex-shrink-0 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#A8A39E]">
                          <span className={canGenerateMore ? "text-brass font-semibold" : "text-orange-400 font-semibold"}>
                            {MAX_IMAGES_PER_SESSION - currentSession.images.length}
                          </span>
                          {" / "}{MAX_IMAGES_PER_SESSION} remaining
                        </span>
                      </div>
                      
                      <Button
                        onClick={() => handleGenerate()}
                        disabled={isGenerating || !userPrompt.trim() || !canGenerateMore}
                        className="w-full bg-brass hover:bg-brass/90 text-white disabled:opacity-50"
                        size="sm"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            {currentSession.images.length === 0 ? "Generate" : "Generate"}
                          </>
                        )}
                      </Button>

                      {!canGenerateMore && (
                        <p className="text-xs text-orange-400 bg-orange-400/10 border border-orange-400/20 rounded p-2">
                          ✅ Session complete! Save to library to start a new session.
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
