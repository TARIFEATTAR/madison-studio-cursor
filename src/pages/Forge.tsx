import { useState, useMemo } from "react";
import { Sparkles, Copy, Check, Loader2, Archive, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import QualityRating from "@/components/QualityRating";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronsUpDown } from "lucide-react";
import { IMAGE_PROMPT_TEMPLATES, type ImagePromptType } from "@/config/imagePromptGuidelines";

// Product catalogue with collection and scent family mappings
const PRODUCTS = [
  { 
    name: "Aged Mysore Sandalwood", 
    collection: "Purity Collection", 
    scentFamily: "Woody",
    topNotes: "Sandalwood (Santalum Album)",
    middleNotes: "Sandalwood (Santalum Album)",
    baseNotes: "Sandalwood (Santalum Album)"
  },
  { 
    name: "Aseel", 
    collection: "Cadence Collection", 
    scentFamily: "Fresh",
    topNotes: "Fresh and vibrant citrus",
    middleNotes: "A blend of floral and spicy undertones",
    baseNotes: "Rich, woody accords combined with a touch of musk"
  },
  { 
    name: "Black Musk", 
    collection: "Cadence Collection", 
    scentFamily: "Warm",
    topNotes: "Ambrette",
    middleNotes: "Plant Resins",
    baseNotes: "Labdanum"
  },
  { 
    name: "Black Oudh", 
    collection: "Cadence Collection", 
    scentFamily: "Woody",
    topNotes: "Bergamot, and Lime",
    middleNotes: "Cedarwood, Rose",
    baseNotes: "Oud, Cedar, and Amber"
  },
  { 
    name: "China Rain", 
    collection: "Cadence Collection", 
    scentFamily: "Fresh",
    topNotes: "Nectarine, green notes",
    middleNotes: "White lilies, Chinese roses",
    baseNotes: "Clean musk, sandalwood, moss"
  },
  { 
    name: "Egyptian Musk", 
    collection: "Cadence Collection", 
    scentFamily: "Warm",
    topNotes: "Light Musk",
    middleNotes: "Florals",
    baseNotes: "Musk"
  },
  { 
    name: "Floral Dew", 
    collection: "Cadence Collection", 
    scentFamily: "Fresh",
    topNotes: "White Musk",
    middleNotes: "Light Florals",
    baseNotes: "Ylang Ylang"
  },
  { 
    name: "Frankincense & Myrrh", 
    collection: "Cadence Collection", 
    scentFamily: "Woody",
    topNotes: "Frankincense",
    middleNotes: "Myrrh, Indian Frankincense",
    baseNotes: "Myrrh Essential Oil"
  },
  { 
    name: "Granada Amber", 
    collection: "Cadence Collection", 
    scentFamily: "Warm",
    topNotes: "Amber",
    middleNotes: "Vanilla, Amber Liquid",
    baseNotes: "Labdanum, Amber"
  },
  { 
    name: "Himalayan Musk", 
    collection: "Cadence Collection", 
    scentFamily: "Warm",
    topNotes: "Florals",
    middleNotes: "Light Florals",
    baseNotes: "Musk"
  },
  { 
    name: "Hojari Frankincense & Yemeni Myrrh", 
    collection: "Reserve Collection", 
    scentFamily: "Woody",
    topNotes: "Citrusy Freshness, Piney",
    middleNotes: "Balsamic, Earthy",
    baseNotes: "Resinous quality"
  },
  { 
    name: "Honey Oudh", 
    collection: "Cadence Collection", 
    scentFamily: "Warm",
    topNotes: "Honey & Bergamot",
    middleNotes: "Agarwood (Oud) & Sumatran Patchouli",
    baseNotes: "Agarwood (Oud), Amber, Leather, Madagascar Vanilla, Labdanum, and Musk"
  },
  { 
    name: "Indonesian Patchouli", 
    collection: "Purity Collection", 
    scentFamily: "Woody",
    topNotes: "Indian Patchouli",
    middleNotes: "Indian Patchouli",
    baseNotes: "Indian Patchouli"
  },
  { 
    name: "Jannatul Firdaus", 
    collection: "Cadence Collection", 
    scentFamily: "Floral",
    topNotes: "Rose and Lotus",
    middleNotes: "Jasmine, Geranium",
    baseNotes: "Earthy, Woody, and Herbal Notes"
  },
  { 
    name: "Kush", 
    collection: "Cadence Collection", 
    scentFamily: "Woody",
    topNotes: "Cinnamon, Spices",
    middleNotes: "Incense, Myrrh",
    baseNotes: "Patchouli, Musk Myrrh"
  },
  { 
    name: "Majmua Attar", 
    collection: "Cadence Collection", 
    scentFamily: "Floral",
    topNotes: "",
    middleNotes: "",
    baseNotes: ""
  },
  { 
    name: "Musk Tahara", 
    collection: "Cadence Collection", 
    scentFamily: "Warm",
    topNotes: "Floral Musk",
    middleNotes: "Musk, Powdery, Light Florals",
    baseNotes: "Musk"
  },
  { 
    name: "Red Musk", 
    collection: "Cadence Collection", 
    scentFamily: "Warm",
    topNotes: "Nutmeg, Geraniol",
    middleNotes: "Ambrette, Spice",
    baseNotes: "Neem Oil, Myrrh, Patchouli"
  },
  { 
    name: "Royal Green Frankincense", 
    collection: "Sacred Space", 
    scentFamily: "Woody",
    topNotes: "",
    middleNotes: "",
    baseNotes: ""
  },
  { 
    name: "Royal Tahara", 
    collection: "Cadence Collection", 
    scentFamily: "Warm",
    topNotes: "Light Florals",
    middleNotes: "Powdery Notes",
    baseNotes: "Musk"
  },
  { 
    name: "Sandalwood Rose", 
    collection: "Cadence Collection", 
    scentFamily: "Floral",
    topNotes: "Rose Otto",
    middleNotes: "Damascus Rose",
    baseNotes: "Sandalwood"
  },
  { 
    name: "Seville", 
    collection: "Cadence Collection", 
    scentFamily: "Woody",
    topNotes: "",
    middleNotes: "",
    baseNotes: ""
  },
  { 
    name: "Turkish Rose", 
    collection: "Cadence Collection", 
    scentFamily: "Floral",
    topNotes: "Rose Otto",
    middleNotes: "Damascus Rose",
    baseNotes: "Light Woody Notes"
  },
  { 
    name: "Vanilla Sands", 
    collection: "Cadence Collection", 
    scentFamily: "Warm",
    topNotes: "Musk",
    middleNotes: "Vanilla, Caramel",
    baseNotes: "Musk, Woody Notes"
  },
  { 
    name: "White Amber", 
    collection: "Cadence Collection", 
    scentFamily: "Warm",
    topNotes: "Amber",
    middleNotes: "Amber",
    baseNotes: "Amber"
  },
].sort((a, b) => a.name.localeCompare(b.name));

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
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState("");
  const [imageUrls, setImageUrls] = useState("");
  const [qualityRating, setQualityRating] = useState(0);
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [productSearchValue, setProductSearchValue] = useState("");
  
  // Master Content Mode state
  const [contentMode, setContentMode] = useState<"single" | "master">("single");
  const [masterContentType, setMasterContentType] = useState("");
  const [masterContentText, setMasterContentText] = useState("");
  const [selectedDerivatives, setSelectedDerivatives] = useState<string[]>([]);
  const [repurposing, setRepurposing] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    contentType: "",
    collection: "",
    dipWeek: "",
    scentFamily: "",
    pillar: "",
    transparencyStatement: "",
    customInstructions: "",
    topNotes: "",
    middleNotes: "",
    baseNotes: "",
    imageTemplate: "product-page" as ImagePromptType,
  });

  const filteredProducts = useMemo(() => {
    if (!productSearchValue) return PRODUCTS;
    return PRODUCTS.filter(product =>
      product.name.toLowerCase().includes(productSearchValue.toLowerCase())
    );
  }, [productSearchValue]);

  const generatePrompt = () => {
    const parts = [];
    
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

    if (formData.transparencyStatement && formData.transparencyStatement !== "none") {
      const statements: Record<string, string> = {
        cadence: "From the Cadence Collection—blended with natural ingredients and modern aromachemicals for balanced complexity.",
        reserve: "From the Reserve Collection—crafted with 90-98% natural essences, minimal aromachemicals for refinement.",
        purity: "From the Purity Collection—100% natural, no aromachemicals. Traditional attar art in its purest form.",
        sacred: "From Sacred Space—ceremonial blends honoring ritual and reverence.",
      };
      if (statements[formData.transparencyStatement]) {
        parts.push(`\n\n${statements[formData.transparencyStatement]}`);
      }
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
      title: "Prompt copied",
      description: "The crafted prompt has been copied to your clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const testWithClaude = async () => {
    if (!generatedPrompt) {
      toast({
        title: "This vessel requires refinement",
        description: "Please craft a prompt first before testing with Claude.",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    setGeneratedOutput("");
    setQualityRating(0); // Reset rating when generating new content

    try {
      const { data, error } = await supabase.functions.invoke('generate-with-claude', {
        body: { prompt: generatedPrompt }
      });

      if (error) throw error;

      if (data?.generatedContent) {
        const cleanContent = stripMarkdown(data.generatedContent);
        setGeneratedOutput(cleanContent);
        toast({
          title: "Content crafted",
          description: "Claude has generated your content successfully.",
        });
      }
    } catch (error) {
      console.error('Error generating with Claude:', error);
      toast({
        title: "This vessel requires refinement",
        description: error instanceof Error ? error.message : "Failed to generate content with Claude.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };


  const archiveVessel = async () => {
    if (!user) return;
    
    if (!formData.title) {
      toast({
        title: "This vessel requires refinement",
        description: "Please provide a title for your prompt.",
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
          transparency_statement: formData.transparencyStatement,
          top_notes: formData.topNotes || null,
          middle_notes: formData.middleNotes || null,
          base_notes: formData.baseNotes || null,
          meta_instructions: {
            customInstructions: formData.customInstructions,
          },
          created_by: user.id,
        })
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
        });

      if (outputError) throw outputError;

      toast({
        title: "Vessel archived successfully",
        description: "Your prompt and output have been saved to the Archive.",
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/archive')}
          >
            View in Archive
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
        transparencyStatement: "",
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
      console.error('Error archiving vessel:', error);
      toast({
        title: "This vessel requires refinement",
        description: error instanceof Error ? error.message : "Failed to archive the vessel.",
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
        })
        .select()
        .single();

      if (masterError) throw masterError;

      // Generate derivatives via edge function
      const { data: repurposeData, error: repurposeError } = await supabase.functions.invoke(
        'repurpose-content',
        {
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

      if (repurposeError) throw repurposeError;

      toast({
        title: "Content repurposed successfully",
        description: `Generated ${selectedDerivatives.length} derivative assets. View them in Repurpose.`,
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/repurpose')}
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
        transparencyStatement: "",
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
    <div className="min-h-screen py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto codex-spacing">
        <div className="fade-enter mb-12">
          <h1 className="text-foreground mb-3">The Forge</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            {contentMode === "single" 
              ? "Select a product from your catalogue and craft content with brand guardrails."
              : "Create master content and repurpose it into multi-channel derivative assets."
            }
          </p>
        </div>

        {/* Content Mode Toggle */}
        <div className="fade-enter mb-8">
          <div className="card-matte p-6 rounded-lg border border-border/40 inline-block">
            <Label className="text-sm text-muted-foreground mb-3 block">Content Mode</Label>
            <div className="flex gap-2">
              <Button
                variant={contentMode === "single" ? "default" : "outline"}
                onClick={() => setContentMode("single")}
                className="transition-all"
              >
                Single Asset
              </Button>
              <Button
                variant={contentMode === "master" ? "default" : "outline"}
                onClick={() => setContentMode("master")}
                className="transition-all"
              >
                Master Content (Multi-Channel)
              </Button>
            </div>
          </div>
        </div>

        {contentMode === "single" ? (
          /* EXISTING SINGLE ASSET MODE */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Form Builder */}
            <div className="fade-enter space-y-6">
              <div className="card-matte p-8 rounded-lg border border-border/40">
                <h2 className="mb-6 text-2xl">Prompt Elements</h2>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Product Name *</Label>
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
                  <Label htmlFor="contentType">Content Type</Label>
                  <Select
                    value={formData.contentType}
                    onValueChange={(value) => setFormData({ ...formData, contentType: value })}
                  >
                    <SelectTrigger id="contentType" className="bg-background/50">
                      <SelectValue placeholder="Select content type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Product Description</SelectItem>
                      <SelectItem value="email">Email Campaign</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="visual">Visual Asset</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Label htmlFor="transparency">Transparency Statement (Optional)</Label>
                  <Select
                    value={formData.transparencyStatement || "none"}
                    onValueChange={(value) => setFormData({ ...formData, transparencyStatement: value })}
                  >
                    <SelectTrigger id="transparency" className="bg-background/50">
                      <SelectValue placeholder="None (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="cadence">Cadence Collection Statement</SelectItem>
                      <SelectItem value="reserve">Reserve Collection Statement</SelectItem>
                      <SelectItem value="purity">Purity Collection Statement</SelectItem>
                      <SelectItem value="sacred">Sacred Space Statement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom">Custom Instructions</Label>
                  <Textarea
                    id="custom"
                    value={formData.customInstructions}
                    onChange={(e) => setFormData({ ...formData, customInstructions: e.target.value })}
                    placeholder="Add specific requirements or creative direction..."
                    className="bg-background/50 min-h-[120px]"
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-border/40">
                  <div>
                    <Label className="text-base">Fragrance Notes</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Auto-filled from product selection, editable for updates
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="topNotes" className="text-sm text-muted-foreground">Top Notes</Label>
                      <Input
                        id="topNotes"
                        value={formData.topNotes}
                        onChange={(e) => setFormData({ ...formData, topNotes: e.target.value })}
                        placeholder="e.g., Bergamot, Lemon, Fresh Citrus"
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="middleNotes" className="text-sm text-muted-foreground">Middle Notes</Label>
                      <Input
                        id="middleNotes"
                        value={formData.middleNotes}
                        onChange={(e) => setFormData({ ...formData, middleNotes: e.target.value })}
                        placeholder="e.g., Rose, Jasmine, Floral Bouquet"
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="baseNotes" className="text-sm text-muted-foreground">Base Notes</Label>
                      <Input
                        id="baseNotes"
                        value={formData.baseNotes}
                        onChange={(e) => setFormData({ ...formData, baseNotes: e.target.value })}
                        placeholder="e.g., Sandalwood, Musk, Woody Accord"
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

          {/* Right: Live Preview */}
          <div className="fade-enter">
            <div className="card-matte p-8 rounded-lg border border-border/40 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl">Crafted Prompt</h2>
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-background/50 rounded-md p-6 min-h-[400px] font-mono text-sm leading-relaxed border border-border/30">
                {generatedPrompt || (
                  <p className="text-muted-foreground italic">
                    Your prompt will materialize here as you craft it...
                  </p>
                )}
              </div>

              {generatedOutput && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-serif mb-3">Generated Output</h3>
                  <div className="bg-background/50 rounded-md p-6 min-h-[200px] leading-relaxed border border-border/30">
                    <p className="text-foreground whitespace-pre-wrap">{generatedOutput}</p>
                  </div>
                  
                  <div className="pt-4 border-t border-border/40">
                    <QualityRating rating={qualityRating} onRatingChange={setQualityRating} />
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
                  <Button 
                    className="btn-craft flex-1" 
                    onClick={testWithClaude}
                    disabled={generating || !generatedPrompt}
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Crafting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Test with Claude
                      </>
                    )}
                  </Button>
                )}

                {formData.contentType === 'visual' && generatedPrompt && (
                  <div className="w-full p-4 bg-primary/5 border border-primary/20 rounded-md">
                    <p className="text-sm text-foreground mb-2">
                      <strong>Next Steps:</strong>
                    </p>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Copy the prompt above using the "Copy" button</li>
                      <li>Open <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a></li>
                      <li>Use Nano Banana model with your bottle reference images</li>
                      <li>Paste the generated image URLs in the field above</li>
                      <li>Rate the quality and archive</li>
                    </ol>
                  </div>
                )}
                
                {((generatedOutput && qualityRating > 0) || (imageUrls && qualityRating > 0)) && (
                  <Button 
                    variant="outline" 
                    className="flex-1 gap-2"
                    onClick={archiveVessel}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Archiving...
                      </>
                    ) : (
                      <>
                        <Archive className="w-4 h-4" />
                        Archive This Vessel
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
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
                        <SelectItem value="blog">Blog Post (1000-2000 words)</SelectItem>
                        <SelectItem value="newsletter">Email Newsletter (500-800 words)</SelectItem>
                        <SelectItem value="announcement">Brand Announcement</SelectItem>
                        <SelectItem value="guide">Educational Guide</SelectItem>
                        <SelectItem value="story">Product Story</SelectItem>
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
                      {[
                        { value: 'email', label: 'Email Newsletter Version' },
                        { value: 'instagram', label: 'Instagram Carousel (5 slides)' },
                        { value: 'twitter', label: 'Twitter/X Thread (8-12 tweets)' },
                        { value: 'product', label: 'Product Description' },
                        { value: 'sms', label: 'SMS/Short Message (160 chars)' },
                      ].map((derivative) => (
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
                          <Label htmlFor={`derivative-${derivative.value}`} className="cursor-pointer font-normal">
                            {derivative.label}
                          </Label>
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
