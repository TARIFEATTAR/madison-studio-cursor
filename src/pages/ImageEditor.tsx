import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentOrganizationId } from "@/hooks/useIndustryConfig";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Download, Loader2, Sparkles, ArrowLeft, Save, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GoalSelector } from "@/components/image-editor/GoalSelector";
import { ExportOptions } from "@/components/image-editor/ExportOptions";

type GeneratedImage = {
  id: string;
  imageUrl: string;
  prompt: string;
  timestamp: number;
  isHero?: boolean;
};

type ImageSession = {
  id: string;
  name: string;
  images: GeneratedImage[];
  createdAt: number;
};

const MAX_IMAGES_PER_SESSION = 6;

export default function ImageEditor() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { orgId } = useCurrentOrganizationId();
  
  const [goalType, setGoalType] = useState<string>("etsy-listing");
  const [aspectRatio, setAspectRatio] = useState<string>("1:1");
  const [outputFormat, setOutputFormat] = useState<"png" | "jpeg" | "webp">("png");
  
  const [userPrompt, setUserPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Session management
  const [sessionName, setSessionName] = useState("");
  const [hasNamedSession, setHasNamedSession] = useState(false);
  const [currentSession, setCurrentSession] = useState<ImageSession>({
    id: crypto.randomUUID(),
    name: "",
    images: [],
    createdAt: Date.now()
  });

  const canGenerateMore = currentSession.images.length < MAX_IMAGES_PER_SESSION;
  const progressText = `${currentSession.images.length}/${MAX_IMAGES_PER_SESSION}`;
  const heroImage = currentSession.images.find(img => img.isHero) || currentSession.images[0];

  const handleStartSession = () => {
    if (!sessionName.trim()) {
      toast.error("Please enter a session name");
      return;
    }
    
    setCurrentSession(prev => ({ ...prev, name: sessionName }));
    setHasNamedSession(true);
    toast.success(`Session started: ${sessionName}`);
  };

  const handleGenerate = async () => {
    if (!userPrompt.trim() || !user || !orgId) {
      toast.error("Please enter a prompt to generate an image");
      return;
    }

    if (!hasNamedSession) {
      toast.error("Please start a session first");
      return;
    }

    if (!canGenerateMore) {
      toast.error("Session complete! Save this session to start a new one.");
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-madison-image", {
        body: {
          goalType,
          aspectRatio,
          outputFormat,
          prompt: userPrompt,
          organizationId: orgId,
          userId: user.id,
          selectedTemplate: null,
          userRefinements: currentSession.images.length > 0 ? userPrompt : null
        },
      });

      if (error) throw error;

      if (data?.imageUrl) {
        const newImage: GeneratedImage = {
          id: data.id || crypto.randomUUID(),
          imageUrl: data.imageUrl,
          prompt: userPrompt,
          timestamp: Date.now(),
          isHero: currentSession.images.length === 0 // First image is hero by default
        };
        
        setCurrentSession(prev => ({
          ...prev,
          images: [...prev.images, newImage]
        }));
        
        const isComplete = currentSession.images.length + 1 === MAX_IMAGES_PER_SESSION;
        
        toast.success(
          isComplete 
            ? `✨ Session complete! (${MAX_IMAGES_PER_SESSION}/${MAX_IMAGES_PER_SESSION}) Ready to save.`
            : `✨ Image generated! (${currentSession.images.length + 1}/${MAX_IMAGES_PER_SESSION})`
        );
        
        setUserPrompt("");
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

  const handleSaveSession = async () => {
    if (!user || !orgId) return;
    
    if (currentSession.images.length === 0) {
      toast.error("Generate at least one image before saving");
      return;
    }

    setIsSaving(true);

    try {
      // Save all images to the database
      const imageRecords = currentSession.images.map(img => ({
        organization_id: orgId,
        user_id: user.id,
        goal_type: goalType,
        aspect_ratio: aspectRatio,
        output_format: outputFormat,
        final_prompt: img.prompt,
        image_url: img.imageUrl,
        description: `${currentSession.name} - ${img.isHero ? 'Hero' : 'Variation'}`,
        saved_to_library: true
      }));

      const { error: saveError } = await supabase
        .from("generated_images")
        .insert(imageRecords);

      if (saveError) throw saveError;

      toast.success(`✅ Session saved to Library: "${currentSession.name}"`);
      
      // Reset for new session
      setCurrentSession({
        id: crypto.randomUUID(),
        name: "",
        images: [],
        createdAt: Date.now()
      });
      setSessionName("");
      setHasNamedSession(false);
      setUserPrompt("");
      
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save session");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadAll = () => {
    currentSession.images.forEach((image, index) => {
      const link = document.createElement('a');
      link.href = image.imageUrl;
      link.download = `${currentSession.name}-${index + 1}.${outputFormat}`;
      link.click();
    });
    toast.success(`Downloaded ${currentSession.images.length} images`);
  };

  const quickRefinements = [
    "More dramatic lighting",
    "Different angle",
    "Clean white background",
    "Add soft shadows",
    "Closer product shot"
  ];

  return (
    <div className="min-h-screen bg-vellum-cream">
      <div className="max-w-[1800px] mx-auto p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="font-serif text-3xl text-ink-black">Madison Image Studio</h1>
            </div>
            <p className="text-charcoal/70 text-sm">
              {hasNamedSession 
                ? `Session: ${currentSession.name} • ${progressText} images`
                : "E-commerce product photography sessions"
              }
            </p>
          </div>
          
          {hasNamedSession && currentSession.images.length > 0 && (
            <div className="flex gap-2">
              <Button
                onClick={handleDownloadAll}
                variant="outline"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download All
              </Button>
              <Button
                onClick={handleSaveSession}
                disabled={isSaving}
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
                    Save to Library
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Session Name Input (if not started) */}
        {!hasNamedSession && (
          <Card className="p-8 bg-parchment-white border-charcoal/10 shadow-sm mb-6 text-center max-w-2xl mx-auto">
            <Sparkles className="w-12 h-12 text-brass/50 mx-auto mb-4" />
            <h2 className="font-serif text-2xl text-ink-black mb-2">Start a New Session</h2>
            <p className="text-charcoal/60 mb-6">
              Generate up to {MAX_IMAGES_PER_SESSION} product photos, pick your hero, and save to Library
            </p>
            
            <div className="flex gap-3 max-w-md mx-auto">
              <Input
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="e.g., Jasmine Perfume Bottle Photos"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleStartSession();
                  }
                }}
              />
              <Button
                onClick={handleStartSession}
                className="bg-brass hover:bg-brass/90 text-white"
              >
                Start Session
              </Button>
            </div>
          </Card>
        )}

        {/* Main Layout: Gallery + Main Image + Chat */}
        {hasNamedSession && (
          <div className="flex gap-6">
            {/* Left Sidebar - Thumbnail Gallery */}
            <div className="w-32 flex-shrink-0 space-y-3">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-charcoal/60 tracking-wide">SESSION</p>
                <p className="text-xs font-bold text-brass">{progressText}</p>
              </div>
              
              {currentSession.images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => handleSetHero(image.id)}
                  className={`relative w-full aspect-square rounded border-2 transition-all overflow-hidden hover:scale-105 ${
                    image.isHero
                      ? "border-brass shadow-md ring-2 ring-brass/20"
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
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-1">
                    <p className="text-[10px] text-white text-center font-medium">{index + 1}</p>
                  </div>
                </button>
              ))}
              
              {/* Empty slots */}
              {Array.from({ length: Math.max(0, MAX_IMAGES_PER_SESSION - currentSession.images.length) }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="w-full aspect-square rounded border-2 border-dashed border-charcoal/10 bg-white/50 flex items-center justify-center"
                >
                  <p className="text-xs text-charcoal/30 font-medium">
                    {currentSession.images.length + i + 1}
                  </p>
                </div>
              ))}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col gap-6">
              {/* Top Controls */}
              <Card className="p-6 bg-parchment-white border-charcoal/10 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-ink-black mb-3">Image Goal</p>
                    <GoalSelector
                      selectedGoal={goalType}
                      onSelectGoal={setGoalType}
                    />
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-ink-black mb-3">Export Settings</p>
                    <ExportOptions
                      aspectRatio={aspectRatio}
                      outputFormat={outputFormat}
                      onAspectRatioChange={setAspectRatio}
                      onOutputFormatChange={(value) => setOutputFormat(value as "png" | "jpeg" | "webp")}
                    />
                  </div>
                </div>
              </Card>

              {/* Main Image Display */}
              <Card className="flex-1 p-8 bg-white border-charcoal/10 shadow-sm min-h-[500px] flex items-center justify-center">
                {isGenerating ? (
                  <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-brass animate-spin mx-auto" />
                    <p className="text-charcoal/70">Generating your image...</p>
                    <p className="text-xs text-charcoal/40">This may take 15-30 seconds</p>
                  </div>
                ) : heroImage ? (
                  <div className="w-full max-w-3xl">
                    <div className="relative">
                      <img
                        src={heroImage.imageUrl}
                        alt="Hero product image"
                        className="w-full h-auto rounded shadow-lg"
                      />
                      {heroImage.isHero && (
                        <div className="absolute top-4 right-4 bg-brass text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                          <Star className="w-3 h-3 fill-white" />
                          HERO
                        </div>
                      )}
                    </div>
                    <div className="mt-4 p-3 bg-vellum-cream/50 rounded">
                      <p className="text-xs text-charcoal/60 font-medium mb-1">PROMPT</p>
                      <p className="text-sm text-charcoal/70 italic">"{heroImage.prompt}"</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    <Sparkles className="w-16 h-16 text-brass/30 mx-auto" />
                    <p className="text-lg text-charcoal/70 font-medium">Generate your first image</p>
                    <p className="text-sm text-charcoal/50">Describe the product photo you want below</p>
                  </div>
                )}
              </Card>

              {/* Chat-Style Refinement Input */}
              <Card className="p-6 bg-parchment-white border-charcoal/10 shadow-sm">
                <div className="space-y-4">
                  <Textarea
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    placeholder={currentSession.images.length > 0
                      ? "Describe how to refine or create a variation..." 
                      : "Describe the product image you want to create..."
                    }
                    rows={3}
                    className="resize-none bg-white border-charcoal/20 focus:border-brass"
                    disabled={!canGenerateMore}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        handleGenerate();
                      }
                    }}
                  />
                  
                  {!canGenerateMore && (
                    <div className="bg-brass/10 border border-brass/20 rounded p-3 text-center">
                      <p className="text-sm text-brass font-medium">
                        Session complete! Save to Library to start a new session.
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <div className="flex flex-wrap gap-2">
                      {quickRefinements.map((refinement) => (
                        <button
                          key={refinement}
                          onClick={() => setUserPrompt(refinement)}
                          disabled={!canGenerateMore}
                          className="px-3 py-1 text-xs rounded-full bg-brass/10 text-brass hover:bg-brass/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {refinement}
                        </button>
                      ))}
                    </div>
                    
                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating || !userPrompt.trim() || !canGenerateMore}
                      className="bg-brass hover:bg-brass/90 text-white"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          {currentSession.images.length > 0 ? "Refine" : "Generate"}
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {canGenerateMore && (
                    <p className="text-xs text-charcoal/40 text-right">
                      Press ⌘+Enter to generate • {MAX_IMAGES_PER_SESSION - currentSession.images.length} remaining
                    </p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
