import { useState, useMemo, useEffect } from "react";
import { Sparkles, Copy, Check, Loader2, Archive, Wand2, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useProducts } from "@/hooks/useProducts";
import { useCollections } from "@/hooks/useCollections";
import { useWeekNames } from "@/hooks/useWeekNames";
import type { IndustryConfig } from "@/hooks/usePromptGeneration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import QualityRating from "@/components/QualityRating";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronsUpDown } from "lucide-react";
import { IMAGE_PROMPT_TEMPLATES, type ImagePromptType } from "@/config/imagePromptGuidelines";
import { BLOG_POST_TYPES, BLOG_REPURPOSE_TARGETS, generateBlogPrompt, type BlogPostType } from "@/config/blogPostGuidelines";
import { ContentEditor } from "@/components/ContentEditor";
import { EditorialAssistantPanel } from "@/components/assistant/EditorialAssistantPanel";
import { ForgeOnboardingGuide } from "@/components/forge/ForgeOnboardingGuide";

// Helpers to map display labels to database enum values
const toEnum = (v?: string | null) => (v ? v.toLowerCase().replace(/\s+/g, '_') : null);

const mapCollectionToEnum = (label?: string | null) => {
  if (!label) return null;
  if (label.includes('Cadence')) return 'cadence';
  if (label.includes('Reserve')) return 'reserve';
  if (label.includes('Purity')) return 'purity';
  if (label.includes('Sacred')) return 'sacred_space';
  return toEnum(label);
};

const mapScentFamilyToEnum = (label?: string | null) => {
  if (!label) return null;
  const v = label.toLowerCase();
  if (['warm', 'fresh', 'woody', 'floral'].includes(v)) return v as 'warm' | 'fresh' | 'woody' | 'floral';
  return toEnum(label) as any;
};

const mapPillarToEnum = (label?: string | null) => {
  if (!label) return null;
  const v = label.toLowerCase();
  if (['identity', 'memory', 'remembrance', 'cadence'].includes(v)) return v as any;
  return toEnum(label) as any;
};

const stripMarkdown = (text: string): string => {
  return text
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/#{1,6}\s?/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/^[\s-]*[-*+]\s/gm, '')
    .replace(/^\d+\.\s/gm, '')
    .replace(/^\>\s/gm, '')
    .trim();
};

const Forge = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { currentOrganizationId, onboardingStep, completeFirstGeneration } = useOnboarding();
  const { products } = useProducts();
  const { collections } = useCollections();
  const { getWeekName } = useWeekNames();
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState("");
  const [imageUrls, setImageUrls] = useState("");
  const [qualityRating, setQualityRating] = useState(0);
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [productSearchValue, setProductSearchValue] = useState("");
  
  // Onboarding state
  const isOnboarding = new URLSearchParams(location.search).get("onboarding") === "true" || onboardingStep === "first_generation_pending";
  const [showOnboardingGuide, setShowOnboardingGuide] = useState(isOnboarding);
  
  // Master Content Mode state
  const [contentMode, setContentMode] = useState<"single" | "master">("single");
  const [masterContentType, setMasterContentType] = useState("");
  const [masterContentText, setMasterContentText] = useState("");
  const [selectedDerivatives, setSelectedDerivatives] = useState<string[]>([]);
  const [repurposing, setRepurposing] = useState(false);
  
  // Blog Post state
  const [blogPostType, setBlogPostType] = useState<BlogPostType>("philosophy");
  const [blogSubject, setBlogSubject] = useState("");
  const [blogThemes, setBlogThemes] = useState<string[]>(["", "", ""]);
  const [blogTakeaway, setBlogTakeaway] = useState("");
  const [blogProductConnection, setBlogProductConnection] = useState("");
  const [blogWordCount, setBlogWordCount] = useState(1200);
  const [voiceValidation, setVoiceValidation] = useState<null>(null);
  
  // Style Overlay state - persist across sessions
  const [styleOverlay, setStyleOverlay] = useState<string>(() => {
    const saved = localStorage.getItem('forge_style_overlay');
    return saved || "TARIFE_NATIVE";
  });
  
  // Persist style overlay to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('forge_style_overlay', styleOverlay);
  }, [styleOverlay]);
  
  // Editorial Assistant Panel state
  const [showAssistantPanel, setShowAssistantPanel] = useState(false);
  
  // Industry configuration state
  const [industryConfig, setIndustryConfig] = useState<IndustryConfig | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    contentType: "",
    collection: "",
    dipWeek: "",
    scentFamily: "",
    pillar: "",
    customInstructions: "",
    topNotes: "",
    middleNotes: "",
    baseNotes: "",
    imageTemplate: "product-page" as ImagePromptType,
  });

  // Handle pre-populated prompt from Prompt Library
  useEffect(() => {
    const state = location.state as any;
    if (state?.prompt) {
      const prompt = state.prompt;
      setFormData({
        title: prompt.title,
        contentType: prompt.content_type,
        collection: prompt.collection?.replace("_", " ") || "",
        dipWeek: prompt.dip_week?.toString() || "",
        scentFamily: prompt.scent_family || "",
        pillar: prompt.pillar_focus || "",
        customInstructions: "",
        topNotes: "",
        middleNotes: "",
        baseNotes: "",
        imageTemplate: "product-page",
      });

      toast({
        title: "Prompt loaded",
        description: `"${prompt.title}" is ready to use.`,
      });

      // Clear the location state to avoid re-loading on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, toast]);

  // Load industry configuration from organization
  useEffect(() => {
    const loadIndustryConfig = async () => {
      if (!currentOrganizationId) return;
      
      try {
        const { data, error } = await supabase
          .from("organizations")
          .select("brand_config")
          .eq("id", currentOrganizationId)
          .single();
        
        if (error) throw error;
        
        const config = (data?.brand_config as any)?.industry_config;
        if (config) {
          setIndustryConfig(config);
        }
      } catch (error) {
        console.error("Error loading industry config:", error);
      }
    };
    
    loadIndustryConfig();
  }, [currentOrganizationId]);

  const filteredProducts = useMemo(() => {
    if (!productSearchValue) return products;
    return products.filter(product =>
      product.name.toLowerCase().includes(productSearchValue.toLowerCase())
    );
  }, [productSearchValue, products]);

  const generatePrompt = () => {
    const parts = [];
    
    // For blog posts, use specialized blog prompt generator
    if (formData.contentType === 'blog') {
      return generateBlogPrompt({
        postType: blogPostType,
        pillar: formData.pillar || 'Identity',
        wordCount: blogWordCount,
        dipWeek: formData.dipWeek ? parseInt(formData.dipWeek) : undefined,
        subject: blogSubject,
        themes: blogThemes.filter(t => t.trim().length > 0),
        takeaway: blogTakeaway,
        productConnection: blogProductConnection || undefined,
      });
    }
    
    // For visual assets, use standardized image prompt templates
    if (formData.contentType === 'visual') {
      const template = IMAGE_PROMPT_TEMPLATES[formData.imageTemplate];
      
      // Start with the base template prompt
      let visualPrompt = template.prompt;
      
      // Replace generic "attar bottle" with specific product name
      if (formData.title) {
        visualPrompt = visualPrompt.replace(/attar bottle/gi, `${formData.title} attar bottle`);
      }
      
      // Add product context
      parts.push(visualPrompt);
      
      // Add technical specifications
      parts.push(`\n--- Technical Specifications ---`);
      parts.push(`Aspect Ratio: ${template.aspectRatio}`);
      parts.push(`Use Case: ${template.useCase}`);
      parts.push(`Lighting: ${template.lighting}`);
      parts.push(`Composition: ${template.composition}`);
      parts.push(`Style: ${template.style}`);
      
      // Add fragrance context to enhance image generation
      if (formData.scentFamily) {
        parts.push(`\nScent Family Context: ${formData.scentFamily}`);
      }
      
      // Add custom visual instructions if provided
      if (formData.customInstructions) {
        parts.push(`\nAdditional Direction: ${formData.customInstructions}`);
      }
      
      return parts.join('\n');
    }
    
    // Standard prompt generation for other content types
    if (formData.title) {
      parts.push(`Product: ${formData.title}`);
    }
    
    if (formData.contentType) {
      const contentTypes: Record<string, string> = {
        product: "Product Description",
        email: "Email Campaign",
        social: "Social Media",
        visual: "Visual Asset",
        blog: "Blog Post",
      };
      parts.push(`Content Type: ${contentTypes[formData.contentType] || formData.contentType}`);
    }
    
    if (formData.collection) {
      parts.push(`Collection: ${formData.collection}`);
    }
    
    if (formData.scentFamily) {
      parts.push(`Scent Family: ${formData.scentFamily}`);
    }
    
    if (formData.pillar) {
      parts.push(`Focus on the ${formData.pillar} pillar.`);
    }

    if (formData.customInstructions) {
      parts.push(`\n\n${formData.customInstructions}`);
    }

    parts.push(`\n\nIMPORTANT: Return output as plain text only. Do not use any Markdown formatting (no asterisks, bold, italics, headers, etc.). Output should be clean copy-paste ready text.`);

    return parts.join(" ");
  };

  const generatedPrompt = generatePrompt();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    toast({
      title: "Brief archived",
      description: "The crafted brief has been copied to your clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const testWithClaude = async () => {
    if (!generatedPrompt) {
      toast({
        title: "Parameters incomplete",
        description: "Please craft a brief first before commissioning copy.",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    setGeneratedOutput("");
    setQualityRating(0); // Reset rating when generating new content

    try {
      const { data, error } = await supabase.functions.invoke('generate-with-claude', {
        body: { 
          prompt: `${generatedPrompt}\n\n[EXECUTE THIS BRIEF IMMEDIATELY. OUTPUT ONLY THE FINAL COPY. NO QUESTIONS OR ANALYSIS.]`,
          organizationId: currentOrganizationId,
          mode: "generate",
          styleOverlay: styleOverlay
        }
      });

      if (error) throw error;

      if (data?.generatedContent) {
        const cleanContent = stripMarkdown(data.generatedContent);
        setGeneratedOutput(cleanContent);
        
        toast({
          title: "Copy commissioned",
          description: "Your content has been generated successfully.",
        });

        // Complete onboarding if this is the first generation
        if (isOnboarding && onboardingStep === "first_generation_pending") {
          completeFirstGeneration();
          setShowOnboardingGuide(false);
        }
      }
    } catch (error) {
      console.error("Error generating with Claude:", error);
      toast({
        title: "Generation error",
        description: error instanceof Error ? error.message : "Failed to generate content with Claude.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };


  const archiveContent = async () => {
    if (!user) return;
    
    if (!formData.title) {
      toast({
        title: "Title required",
        description: "Please provide a subject title for your commission.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.contentType) {
      toast({
        title: "Content type required",
        description: "Please select a content type before saving.",
        variant: "destructive",
      });
      return;
    }

    if (!generatedOutput && (!imageUrls || imageUrls.trim().length === 0)) {
      toast({
        title: "No content to save",
        description: "Please generate content before saving to the library.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      // First, insert the prompt
      const { data: promptData, error: promptError } = await supabase
        .from('prompts')
        .insert({
          title: formData.title,
          content_type: formData.contentType as any,
          collection: mapCollectionToEnum(formData.collection) as any,
          scent_family: formData.scentFamily ? (mapScentFamilyToEnum(formData.scentFamily) as any) : null,
          dip_week: formData.dipWeek ? parseInt(formData.dipWeek) : null,
          pillar_focus: formData.pillar ? (mapPillarToEnum(formData.pillar) as any) : null,
          prompt_text: generatedPrompt,
          top_notes: formData.topNotes || null,
          middle_notes: formData.middleNotes || null,
          base_notes: formData.baseNotes || null,
          meta_instructions: {
            customInstructions: formData.customInstructions,
          },
          created_by: user.id,
          organization_id: currentOrganizationId!,
          is_archived: false,
        } as any)
        .select()
        .single();

      if (promptError) throw promptError;

      // Parse image URLs (one per line)
      const imageUrlsArray = imageUrls
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0);

      // Then, insert the output
      const { error: outputError } = await supabase
        .from('outputs')
        .insert({
          prompt_id: promptData.id,
          generated_content: generatedOutput,
          image_urls: imageUrlsArray,
          quality_rating: qualityRating,
          usage_context: `${formData.contentType} - ${formData.collection}`,
          created_by: user.id,
          organization_id: currentOrganizationId!,
          is_archived: false,
        } as any);

      if (outputError) throw outputError;

      toast({
        title: "Published to portfolio",
        description: "Your content has been archived in the Library.",
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/library')}
          >
            View Portfolio
          </Button>
        ),
      });

      // Reset form
      setFormData({
        title: "",
        contentType: "",
        collection: "",
        dipWeek: "",
        scentFamily: "",
        pillar: "",
        customInstructions: "",
        topNotes: "",
        middleNotes: "",
        baseNotes: "",
        imageTemplate: "product-page",
      });
      setGeneratedOutput("");
      setImageUrls("");
      setQualityRating(0);

    } catch (error) {
      console.error("Error saving content:", error);
      toast({
        title: "Save error",
        description: error instanceof Error ? error.message : "Failed to save content.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const createMasterContent = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create master content.",
        variant: "destructive",
      });
      return;
    }

    if (!masterContentText.trim()) {
      toast({
        title: "Content required",
        description: "Please enter your master content.",
        variant: "destructive",
      });
      return;
    }

    if (!masterContentType) {
      toast({
        title: "Content type required",
        description: "Please select a content type.",
        variant: "destructive",
      });
      return;
    }

    if (selectedDerivatives.length === 0) {
      toast({
        title: "No derivatives selected",
        description: "Please select at least one derivative type.",
        variant: "destructive",
      });
      return;
    }

    try {
      setRepurposing(true);

      // Calculate word count
      const wordCount = masterContentText.trim().split(/\s+/).length;

      // Save master content
      const { data: masterData, error: masterError } = await supabase
        .from('master_content')
        .insert({
          title: formData.title || `${masterContentType} - ${new Date().toLocaleDateString()}`,
          content_type: masterContentType,
          full_content: masterContentText,
          word_count: wordCount,
          collection: formData.collection ? mapCollectionToEnum(formData.collection) as any : null,
          dip_week: formData.dipWeek ? parseInt(formData.dipWeek) : null,
          pillar_focus: formData.pillar ? (mapPillarToEnum(formData.pillar) as any) : null,
          created_by: user.id,
          organization_id: currentOrganizationId!,
          is_archived: false,
        } as any)
        .select()
        .single();

      if (masterError) throw masterError;

      // Generate derivatives via edge function
      console.log('Calling repurpose-content with master content ID:', masterData.id);
      
      // Ensure we pass the user's JWT to the protected function
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.access_token) {
        throw new Error('Authentication required. Please sign in again and retry.');
      }
      
      const { data: repurposeData, error: repurposeError } = await supabase.functions.invoke(
        'repurpose-content',
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: {
            masterContentId: masterData.id,
            derivativeTypes: selectedDerivatives,
            masterContent: {
              full_content: masterContentText,
              collection: formData.collection,
              dip_week: formData.dipWeek ? parseInt(formData.dipWeek) : null,
              pillar_focus: formData.pillar,
            },
          },
        }
      );

      console.log('Repurpose response:', { data: repurposeData, error: repurposeError });

      if (repurposeError) {
        console.error('Repurpose error:', repurposeError);
        throw new Error(repurposeError.message || 'Failed to generate derivatives');
      }

      if (!repurposeData?.success) {
        throw new Error(repurposeData?.error || 'Failed to generate derivatives');
      }

      toast({
        title: "Content repurposed successfully",
        description: `Generated ${repurposeData.derivatives?.length || selectedDerivatives.length} derivative assets. View them in Repurpose.`,
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/repurpose?master=${masterData.id}`)}
          >
            View Derivatives
          </Button>
        ),
      });

      // Reset master content form
      setMasterContentText("");
      setMasterContentType("");
      setSelectedDerivatives([]);
      setFormData({
        title: "",
        contentType: "",
        collection: "",
        dipWeek: "",
        scentFamily: "",
        pillar: "",
        customInstructions: "",
        topNotes: "",
        middleNotes: "",
        baseNotes: "",
        imageTemplate: "product-page",
      });

    } catch (error) {
      console.error('Error repurposing content:', error);
      toast({
        title: "Repurposing failed",
        description: error instanceof Error ? error.message : "Failed to repurpose content.",
        variant: "destructive",
      });
    } finally {
      setRepurposing(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-6 md:px-12 paper-overlay">
      {/* Onboarding Guide */}
      {showOnboardingGuide && (
        <ForgeOnboardingGuide
          onDismiss={() => {
            setShowOnboardingGuide(false);
            if (isOnboarding) {
              // Update URL to remove onboarding param
              navigate(location.pathname, { replace: true });
            }
          }}
        />
      )}

      <div className={showAssistantPanel ? "mx-auto codex-spacing" : "max-w-7xl mx-auto codex-spacing"}>
        {/* Editorial Masthead */}
        <div className="fade-enter mb-12">
          <div className="brass-divider mb-8"></div>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-foreground mb-3 font-serif tracking-wide">The Editorial Desk</h1>
              <p className="text-muted-foreground text-lg max-w-3xl font-serif leading-relaxed">
                {contentMode === "single" 
                  ? "Craft precision copy for individual touchpoints. Select a subject from your catalogue and define the parameters of your commission."
                  : "Author foundational narratives for multi-channel deployment. Write once, repurpose strategically across all brand touchpoints."
                }
              </p>
            </div>
            <Button
              onClick={() => setShowAssistantPanel(!showAssistantPanel)}
              variant={showAssistantPanel ? "default" : "outline"}
              className="ml-4 gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              {showAssistantPanel ? "Hide" : "Show"} Editorial Director
            </Button>
          </div>
        </div>

        {/* Edition Selector */}
        <div className="fade-enter mb-10">
          <div className="inline-flex items-center">
            <Label className="text-sm text-muted-foreground mr-4 font-serif">Edition:</Label>
            <div className="flex border border-border/40 rounded-md overflow-hidden shadow-sm">
              <button
                onClick={() => setContentMode("single")}
                className={`edition-tab ${contentMode === "single" ? "edition-tab-active" : ""}`}
              >
                Single Commission
              </button>
              <button
                onClick={() => setContentMode("master")}
                className={`edition-tab ${contentMode === "master" ? "edition-tab-active" : ""}`}
              >
                Master Manuscript
              </button>
            </div>
          </div>
        </div>

        {contentMode === "single" ? (
          /* SINGLE COMMISSION MODE */
          <div className={cn(
            "grid gap-8 transition-all duration-300",
            showAssistantPanel 
              ? "grid-cols-1 xl:grid-cols-[40%_35%_25%]" 
              : "grid-cols-1 lg:grid-cols-[60%_40%]"
          )}>
            {/* Left: The Manuscript - Form Builder */}
            <div className="fade-enter space-y-6">
              <div className="card-editorial">
                <h2 className="mb-6 text-2xl font-serif">Brief Parameters</h2>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="productName" className="font-serif text-base">Subject *</Label>
                  <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        id="productName"
                        variant="outline"
                        role="combobox"
                        aria-expanded={productSearchOpen}
                        className="w-full justify-between bg-background/50"
                      >
                        {formData.title || "Select product..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput 
                          placeholder="Search products..." 
                          value={productSearchValue}
                          onValueChange={setProductSearchValue}
                        />
                        <CommandList>
                          <CommandEmpty>No product found.</CommandEmpty>
                          <CommandGroup>
                            {filteredProducts.map((product) => (
                              <CommandItem
                                key={product.name}
                                value={product.name}
                                onSelect={() => {
                                  setFormData({
                                    ...formData,
                                    title: product.name,
                                    collection: product.collection,
                                    scentFamily: product.scentFamily,
                                    topNotes: product.topNotes || "",
                                    middleNotes: product.middleNotes || "",
                                    baseNotes: product.baseNotes || "",
                                  });
                                  setProductSearchOpen(false);
                                  setProductSearchValue("");
                                }}
                              >
                                {product.name}
                                <span className="ml-auto text-xs text-muted-foreground">
                                  {product.collection}
                                </span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contentType" className="font-serif text-base">Deliverable Format *</Label>
                  <Select
                    value={formData.contentType}
                    onValueChange={(value) => setFormData({ ...formData, contentType: value })}
                  >
                    <SelectTrigger id="contentType" className="bg-background/50">
                      <SelectValue placeholder="Select format..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Product Description</SelectItem>
                      <SelectItem value="email">Email Campaign</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="visual">Visual Asset</SelectItem>
                      <SelectItem value="blog">Editorial Article</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="styleOverlay" className="font-serif text-base">Style Overlay</Label>
                  <Select
                    value={styleOverlay}
                    onValueChange={(value) => setStyleOverlay(value)}
                  >
                    <SelectTrigger id="styleOverlay" className="bg-background/50">
                      <SelectValue placeholder="Select writing style..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TARIFE_NATIVE">Tarife Native (In-house Brand Voice)</SelectItem>
                      <SelectItem value="JAY_PETERMAN">Jay Peterman (Vignette Style)</SelectItem>
                      <SelectItem value="OGILVY">Ogilvy (Benefit + Proof)</SelectItem>
                      <SelectItem value="HYBRID_JP_OGILVY">Hybrid JP × Ogilvy (Scene + Proof)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Choose the writing style that best fits your content needs
                  </p>
                </div>

                {formData.contentType === 'visual' && (
                  <div className="space-y-2">
                    <Label htmlFor="imageTemplate">Image Template</Label>
                    <Select
                      value={formData.imageTemplate}
                      onValueChange={(value: ImagePromptType) => setFormData({ ...formData, imageTemplate: value })}
                    >
                      <SelectTrigger id="imageTemplate" className="bg-background/50">
                        <SelectValue placeholder="Select image template..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="homepage-hero">Homepage Hero (21:9) - Wide banner</SelectItem>
                        <SelectItem value="product-page">Product Page (4:5/1:1) - Clean focus</SelectItem>
                        <SelectItem value="email-header">Email Header (3:1) - Newsletter</SelectItem>
                        <SelectItem value="instagram-stories">Instagram Stories (9:16) - Vertical</SelectItem>
                        <SelectItem value="ritual-process">Ritual/Process (4:5/1:1) - Educational</SelectItem>
                        <SelectItem value="seasonal-limited">Seasonal/Limited (4:5) - Campaign</SelectItem>
                        <SelectItem value="collection-overview">Collection Overview (16:9/4:3)</SelectItem>
                        <SelectItem value="social-square">Social Square (1:1) - Instagram</SelectItem>
                        <SelectItem value="behind-scenes">Behind Scenes (4:5) - Artisan</SelectItem>
                        <SelectItem value="gift-set">Gift Set (4:5) - Holiday</SelectItem>
                        <SelectItem value="macro-detail">Macro Detail (1:1/4:5) - Quality</SelectItem>
                        <SelectItem value="lifestyle-sanctuary">Lifestyle/Sanctuary (4:5)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {IMAGE_PROMPT_TEMPLATES[formData.imageTemplate].useCase}
                    </p>
                  </div>
                )}

                {formData.contentType === 'blog' && (
                  <div className="space-y-6 border-t border-border/40 pt-6 mt-6">
                    <div className="space-y-2">
                      <Label htmlFor="blogType">Blog Post Type</Label>
                      <Select
                        value={blogPostType}
                        onValueChange={(value: BlogPostType) => setBlogPostType(value)}
                      >
                        <SelectTrigger id="blogType" className="bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(BLOG_POST_TYPES).map(([key, type]) => (
                            <SelectItem key={key} value={key}>
                              {type.label} - {type.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="blogWordCount">Target Word Count</Label>
                      <Input
                        id="blogWordCount"
                        type="number"
                        value={blogWordCount}
                        onChange={(e) => setBlogWordCount(parseInt(e.target.value))}
                        className="bg-background/50"
                      />
                      <p className="text-xs text-muted-foreground">
                        Recommended: {BLOG_POST_TYPES[blogPostType].wordCountRange[0]}-{BLOG_POST_TYPES[blogPostType].wordCountRange[1]} words
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="blogSubject">Subject/Topic *</Label>
                      <Textarea
                        id="blogSubject"
                        value={blogSubject}
                        onChange={(e) => setBlogSubject(e.target.value)}
                        placeholder="Describe what the post is about in 2-3 sentences..."
                        className="bg-background/50 min-h-[100px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Key Themes (3 themes)</Label>
                      {blogThemes.map((theme, idx) => (
                        <Input
                          key={idx}
                          value={theme}
                          onChange={(e) => {
                            const newThemes = [...blogThemes];
                            newThemes[idx] = e.target.value;
                            setBlogThemes(newThemes);
                          }}
                          placeholder={`Theme ${idx + 1}...`}
                          className="bg-background/50"
                        />
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="blogTakeaway">Desired Takeaway *</Label>
                      <Textarea
                        id="blogTakeaway"
                        value={blogTakeaway}
                        onChange={(e) => setBlogTakeaway(e.target.value)}
                        placeholder="What should reader understand/feel after reading?"
                        className="bg-background/50 min-h-[80px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="blogProduct">Product Connection (Optional)</Label>
                      <Input
                        id="blogProduct"
                        value={blogProductConnection}
                        onChange={(e) => setBlogProductConnection(e.target.value)}
                        placeholder="Which collection or product relates to this topic?"
                        className="bg-background/50"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="collection">Collection (Auto-filled)</Label>
                  <Input
                    id="collection"
                    value={formData.collection}
                    readOnly
                    disabled
                    placeholder="Auto-filled from product selection..."
                    className="bg-background/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scentFamily">Scent Family (Internal Tracking)</Label>
                  <Input
                    id="scentFamily"
                    value={formData.scentFamily}
                    readOnly
                    disabled
                    placeholder="Auto-filled from product selection..."
                    className="bg-background/30"
                  />
                  <p className="text-xs text-muted-foreground">
                    For database categorization only - not included in generated prompt
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pillar">Pillar Focus (Optional)</Label>
                  <Select
                    value={formData.pillar}
                    onValueChange={(value) => setFormData({ ...formData, pillar: value })}
                  >
                    <SelectTrigger id="pillar" className="bg-background/50">
                      <SelectValue placeholder="Select pillar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Identity">Identity (Anchoring, Grounding)</SelectItem>
                      <SelectItem value="Memory">Memory (Journey, Gathering)</SelectItem>
                      <SelectItem value="Remembrance">Remembrance (Ritual, Preservation)</SelectItem>
                      <SelectItem value="Cadence">Cadence (Rhythm, Presence)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom" className="font-serif text-base">Additional Editorial Direction</Label>
                  <Textarea
                    id="custom"
                    value={formData.customInstructions}
                    onChange={(e) => setFormData({ ...formData, customInstructions: e.target.value })}
                    placeholder="Provide specific requirements or creative mandates..."
                    className="bg-background/50 min-h-[120px] input-manuscript"
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-border/40">
                  <div>
                    <Label className="text-base">{industryConfig?.section_title || "Product Details"}</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Auto-filled from product selection, editable for updates
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="topNotes" className="text-sm text-muted-foreground">
                        {industryConfig?.fields[0]?.label || "Field 1"}
                      </Label>
                      <Input
                        id="topNotes"
                        value={formData.topNotes}
                        onChange={(e) => setFormData({ ...formData, topNotes: e.target.value })}
                        placeholder={`e.g., ${industryConfig?.fields[0]?.label || "Field 1"}`}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="middleNotes" className="text-sm text-muted-foreground">
                        {industryConfig?.fields[1]?.label || "Field 2"}
                      </Label>
                      <Input
                        id="middleNotes"
                        value={formData.middleNotes}
                        onChange={(e) => setFormData({ ...formData, middleNotes: e.target.value })}
                        placeholder={`e.g., ${industryConfig?.fields[1]?.label || "Field 2"}`}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="baseNotes" className="text-sm text-muted-foreground">
                        {industryConfig?.fields[2]?.label || "Field 3"}
                      </Label>
                      <Input
                        id="baseNotes"
                        value={formData.baseNotes}
                        onChange={(e) => setFormData({ ...formData, baseNotes: e.target.value })}
                        placeholder={`e.g., ${industryConfig?.fields[2]?.label || "Field 3"}`}
                        className="bg-background/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-border/40">
                  <Label>Meta-Instructions</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="lexical" defaultChecked />
                      <label htmlFor="lexical" className="text-sm text-muted-foreground cursor-pointer">
                        Enforce Lexical Mandate (block forbidden terms)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="wordLimit" defaultChecked />
                      <label htmlFor="wordLimit" className="text-sm text-muted-foreground cursor-pointer">
                        Apply 150-word limit (product descriptions)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="redundancy" defaultChecked />
                      <label htmlFor="redundancy" className="text-sm text-muted-foreground cursor-pointer">
                        Check for redundancy vs. recent outputs
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: The Proof Sheet - Preview & Output */}
          <div className="fade-enter">
            <div className="card-editorial sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif">Crafted Brief</h2>
                <button
                  onClick={copyToClipboard}
                  className="btn-archive flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Archived
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Archive Brief
                    </>
                  )}
                </button>
              </div>

              <div className="manuscript-frame min-h-[400px] font-mono text-sm leading-relaxed">
                {generatedPrompt || (
                  <p className="text-muted-foreground italic font-serif">
                    The desk awaits your parameters. Define your commission above to preview the brief.
                  </p>
                )}
              </div>

              {generatedOutput && (
                <div className="mt-6 space-y-4">
                  <div className="brass-divider"></div>
                  <h3 className="text-lg font-serif mb-3">First Proof</h3>
                  <div className="manuscript-frame">
                    <ContentEditor
                      content={generatedOutput}
                      onChange={setGeneratedOutput}
                      placeholder="Your commissioned copy will appear here..."
                    />
                  </div>
                  
                  
                  <div className="pt-4 border-t border-border/40">
                    <div className="editorial-medallion">
                      <span className="text-xs uppercase tracking-wide">Editorial Assessment</span>
                    </div>
                    <div className="mt-3">
                      <QualityRating rating={qualityRating} onRatingChange={setQualityRating} />
                    </div>
                  </div>
                </div>
              )}

              {formData.contentType === 'visual' && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-serif">Generated Image URLs</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        After generating images in Google AI Studio with Nano Banana, paste the image URLs here (one per line)
                      </p>
                    </div>
                  </div>
                  <Textarea
                    value={imageUrls}
                    onChange={(e) => setImageUrls(e.target.value)}
                    placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                    className="bg-background/50 min-h-[120px] font-mono text-sm"
                  />
                  {imageUrls && (
                    <div className="pt-4 border-t border-border/40">
                      <QualityRating rating={qualityRating} onRatingChange={setQualityRating} />
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 flex gap-3 flex-wrap">
                {formData.contentType !== 'visual' && (
                  <button 
                    className="btn-commission flex-1 flex items-center justify-center gap-2" 
                    onClick={testWithClaude}
                    disabled={generating || !generatedPrompt}
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Composing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Commission Copy
                      </>
                    )}
                  </button>
                )}

                {formData.contentType === 'visual' && generatedPrompt && (
                  <div className="w-full p-4 bg-primary/5 border border-primary/20 rounded-md">
                    <p className="text-sm font-serif font-semibold mb-2">
                      Visual Asset Brief — Next Steps:
                    </p>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside font-serif">
                      <li>Archive the brief above using "Archive Brief"</li>
                      <li>Open <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a></li>
                      <li>Use Nano Banana model with your reference imagery</li>
                      <li>Paste generated image URLs below</li>
                      <li>Assess quality and publish to portfolio</li>
                    </ol>
                  </div>
                )}
                
                {((generatedOutput && qualityRating > 0) || (imageUrls && qualityRating > 0)) && (
                  <button 
                    className="btn-archive flex-1 flex items-center justify-center gap-2"
                    onClick={archiveContent}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Archive className="w-4 h-4" />
                        Publish to Portfolio
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Editorial Assistant Panel */}
          {showAssistantPanel && (
            <div className="fade-enter h-[calc(100vh-12rem)] sticky top-8">
              <EditorialAssistantPanel
                onClose={() => setShowAssistantPanel(false)}
                initialContent={generatedOutput}
              />
            </div>
          )}
        </div>
        ) : (
          /* MASTER CONTENT MODE */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Master Content Editor */}
            <div className="fade-enter space-y-6">
              <div className="card-matte p-8 rounded-lg border border-border/40">
                <h2 className="mb-6 text-2xl">Master Content</h2>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="masterTitle">Title *</Label>
                    <Input
                      id="masterTitle"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., 'The Quiet Rebellion'"
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="masterContentType">Primary Content Type *</Label>
                    <Select value={masterContentType} onValueChange={setMasterContentType}>
                      <SelectTrigger id="masterContentType" className="bg-background/50">
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blog_post">Blog Post (1000-2000 words)</SelectItem>
                        <SelectItem value="email_newsletter">Email Newsletter (500-800 words)</SelectItem>
                        <SelectItem value="brand_announcement">Brand Announcement</SelectItem>
                        <SelectItem value="educational_guide">Educational Guide</SelectItem>
                        <SelectItem value="product_story">Product Story</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dipWeek">DIP Week</Label>
                    <Select value={formData.dipWeek} onValueChange={(value) => setFormData({ ...formData, dipWeek: value })}>
                      <SelectTrigger id="dipWeek" className="bg-background/50">
                        <SelectValue placeholder="Select week..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Week 1: Identity / Silk Road</SelectItem>
                        <SelectItem value="2">Week 2: Memory / Maritime Voyage</SelectItem>
                        <SelectItem value="3">Week 3: Remembrance / Imperial Court</SelectItem>
                        <SelectItem value="4">Week 4: Cadence / Royal Court</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="collection">Collection (Optional)</Label>
                    <Select value={formData.collection} onValueChange={(value) => setFormData({ ...formData, collection: value })}>
                      <SelectTrigger id="collection" className="bg-background/50">
                        <SelectValue placeholder="Select collection..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cadence Collection">Cadence Collection</SelectItem>
                        <SelectItem value="Reserve Collection">Reserve Collection</SelectItem>
                        <SelectItem value="Purity Collection">Purity Collection</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pillarMaster">Pillar Focus (Optional)</Label>
                    <Select value={formData.pillar} onValueChange={(value) => setFormData({ ...formData, pillar: value })}>
                      <SelectTrigger id="pillarMaster" className="bg-background/50">
                        <SelectValue placeholder="Select pillar..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Identity">Identity / The Anchor</SelectItem>
                        <SelectItem value="Memory">Memory / The Journey</SelectItem>
                        <SelectItem value="Remembrance">Remembrance / The Craft</SelectItem>
                        <SelectItem value="Cadence">Cadence / The Practice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="masterContent">Master Content *</Label>
                    <Textarea
                      id="masterContent"
                      value={masterContentText}
                      onChange={(e) => setMasterContentText(e.target.value)}
                      placeholder="Write your master content here..."
                      rows={12}
                      className="bg-background/50 font-serif leading-relaxed"
                    />
                    <p className="text-xs text-muted-foreground">
                      {masterContentText.trim().split(/\s+/).filter(w => w.length > 0).length} words
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label>Target Derivative Assets *</Label>
                    <div className="space-y-2">
                      {BLOG_REPURPOSE_TARGETS.map((derivative) => (
                        <div key={derivative.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`derivative-${derivative.value}`}
                            checked={selectedDerivatives.includes(derivative.value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedDerivatives([...selectedDerivatives, derivative.value]);
                              } else {
                                setSelectedDerivatives(selectedDerivatives.filter(d => d !== derivative.value));
                              }
                            }}
                          />
                          <div className="flex-1">
                            <Label htmlFor={`derivative-${derivative.value}`} className="cursor-pointer font-normal">
                              {derivative.label}
                            </Label>
                            {derivative.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">{derivative.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Preview & Actions */}
            <div className="fade-enter space-y-6">
              <div className="card-matte p-8 rounded-lg border border-border/40">
                <h2 className="mb-6 text-2xl">Content Preview</h2>
                <div className="space-y-4">
                  {masterContentText ? (
                    <div className="bg-muted/20 p-6 rounded-md border border-border/20">
                      <div className="space-y-2 mb-4">
                        <p className="font-medium text-foreground">{formData.title || "Untitled"}</p>
                        <div className="flex gap-2">
                          {masterContentType && <Badge variant="outline">{masterContentType}</Badge>}
                          {formData.dipWeek && <Badge variant="secondary">Week {formData.dipWeek}</Badge>}
                          {formData.collection && <Badge variant="outline">{formData.collection}</Badge>}
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap font-serif leading-relaxed">
                          {masterContentText}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted/20 p-12 rounded-md text-center border border-border/20">
                      <p className="text-muted-foreground">
                        Your master content will appear here as you write...
                      </p>
                    </div>
                  )}

                  {selectedDerivatives.length > 0 && (
                    <div className="bg-muted/20 p-4 rounded-md border border-border/20">
                      <Label className="text-sm text-muted-foreground mb-2 block">
                        Selected Derivatives ({selectedDerivatives.length})
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedDerivatives.map((type) => (
                          <Badge key={type} variant="secondary">
                            {type === 'email' && 'Email'}
                            {type === 'instagram' && 'Instagram'}
                            {type === 'twitter' && 'Twitter'}
                            {type === 'product' && 'Product'}
                            {type === 'sms' && 'SMS'}
                            {type === 'linkedin' && 'LinkedIn'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4">
                    <Button
                      onClick={createMasterContent}
                      disabled={!masterContentText || !masterContentType || selectedDerivatives.length === 0 || repurposing}
                      className="w-full gap-2"
                      size="lg"
                    >
                      {repurposing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Repurposing Content...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4" />
                          Generate All Derivatives
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      This will create master content and generate {selectedDerivatives.length} derivative asset(s)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Forge;
