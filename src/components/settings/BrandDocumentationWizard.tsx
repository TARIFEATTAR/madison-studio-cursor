import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Save, BookOpen, Palette, MessageSquare, Target, Ruler, Globe } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface BrandDocumentation {
  // Core Identity
  brandName: string;
  tagline: string;
  missionStatement: string;
  brandStory: string;
  targetAudience: string;
  brandValues: string[];
  positioning: string;

  // Voice & Tone
  voiceCharacteristics: string[];
  toneSpectrum: string;
  sentenceStructure: string;
  perspective: string;
  formalityLevel: string;

  // Lexical Library
  approvedVocabulary: string[];
  preferredSemanticFields: Record<string, string[]>;
  forbiddenPhrases: string[];
  competitorLanguageToAvoid: string[];

  // Industry Knowledge
  productCategories: string[];
  technicalTerminology: string[];
  industryRegulations: string;
  categoryConventions: string;

  // Semantic Variety Rules
  emotionCategories: Record<string, string>;
  sensoryLanguageGuidelines: string;
  metaphorFrameworks: string[];
  culturalReferences: string;

  // Structural Mandates
  sentenceLengthRanges: string;
  paragraphStructure: string;
  hookFormulas: string[];
  ctaPatterns: string[];
  rhythmPreferences: string;

  // Content Pillars
  contentPillars: Array<{
    name: string;
    subTopics: string[];
    keyMessages: string[];
    vocabulary: string[];
  }>;

  // Editorial Standards
  claimsRequiringSubstantiation: string[];
  hyperboleBoundaries: string;
  comparisonGuidelines: string;
  testimonialUsage: string;

  // Channel-Specific Rules
  channelRules: Record<string, {
    captionStyle?: string;
    hashtagStrategy?: string;
    emojiUsage?: string;
    subjectLineFormulas?: string[];
    structureRules?: string;
  }>;

  // Visual-Verbal Alignment
  visualCopyAlignment: string;
  colorMoodLanguage: string;
  typographyVoiceMatching: string;
}

const STEPS = [
  { id: "identity", label: "Brand Identity", icon: BookOpen },
  { id: "voice", label: "Voice & Tone", icon: MessageSquare },
  { id: "lexical", label: "Lexical Library", icon: Palette },
  { id: "semantic", label: "Semantic Rules", icon: Target },
  { id: "structure", label: "Structure", icon: Ruler },
  { id: "channels", label: "Channels", icon: Globe },
];

export function BrandDocumentationWizard() {
  const { user } = useAuth();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [docs, setDocs] = useState<Partial<BrandDocumentation>>({
    brandValues: [],
    voiceCharacteristics: [],
    approvedVocabulary: [],
    preferredSemanticFields: {},
    forbiddenPhrases: [],
    competitorLanguageToAvoid: [],
    productCategories: [],
    technicalTerminology: [],
    metaphorFrameworks: [],
    hookFormulas: [],
    ctaPatterns: [],
    contentPillars: [],
    claimsRequiringSubstantiation: [],
    channelRules: {},
  });

  // Fetch organization ID
  useEffect(() => {
    if (user) {
      supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.organization_id) {
            setOrganizationId(data.organization_id);
          }
        });
    }
  }, [user]);

  const handleSave = async () => {
    if (!organizationId) return;
    
    setIsSaving(true);
    try {
      // Save each section as separate brand_knowledge entries
      const knowledgeEntries = [
        {
          knowledge_type: "brand_identity_core",
          content: {
            brandName: docs.brandName,
            tagline: docs.tagline,
            missionStatement: docs.missionStatement,
            brandStory: docs.brandStory,
            targetAudience: docs.targetAudience,
            brandValues: docs.brandValues,
            positioning: docs.positioning,
          }
        },
        {
          knowledge_type: "voice_tone_mandates",
          content: {
            voiceCharacteristics: docs.voiceCharacteristics,
            toneSpectrum: docs.toneSpectrum,
            sentenceStructure: docs.sentenceStructure,
            perspective: docs.perspective,
            formalityLevel: docs.formalityLevel,
          }
        },
        {
          knowledge_type: "lexical_library",
          content: {
            approvedVocabulary: docs.approvedVocabulary,
            preferredSemanticFields: docs.preferredSemanticFields,
            forbiddenPhrases: docs.forbiddenPhrases,
            competitorLanguageToAvoid: docs.competitorLanguageToAvoid,
          }
        },
        {
          knowledge_type: "semantic_variety_rules",
          content: {
            emotionCategories: docs.emotionCategories,
            sensoryLanguageGuidelines: docs.sensoryLanguageGuidelines,
            metaphorFrameworks: docs.metaphorFrameworks,
            culturalReferences: docs.culturalReferences,
          }
        },
        {
          knowledge_type: "structural_mandates",
          content: {
            sentenceLengthRanges: docs.sentenceLengthRanges,
            paragraphStructure: docs.paragraphStructure,
            hookFormulas: docs.hookFormulas,
            ctaPatterns: docs.ctaPatterns,
            rhythmPreferences: docs.rhythmPreferences,
          }
        },
        {
          knowledge_type: "channel_specific_rules",
          content: {
            channelRules: docs.channelRules,
          }
        },
      ];

      for (const entry of knowledgeEntries) {
        // Check if entry exists
        const { data: existing } = await supabase
          .from("brand_knowledge")
          .select("id, version")
          .eq("organization_id", organizationId)
          .eq("knowledge_type", entry.knowledge_type)
          .eq("is_active", true)
          .maybeSingle();

        if (existing) {
          // Deactivate old version
          await supabase
            .from("brand_knowledge")
            .update({ is_active: false })
            .eq("id", existing.id);

          // Insert new version
          await supabase
            .from("brand_knowledge")
            .insert({
              organization_id: organizationId,
              knowledge_type: entry.knowledge_type,
              content: entry.content,
              version: existing.version + 1,
              is_active: true,
            });
        } else {
          // First time insertion
          await supabase
            .from("brand_knowledge")
            .insert({
              organization_id: organizationId,
              knowledge_type: entry.knowledge_type,
              content: entry.content,
              version: 1,
              is_active: true,
            });
        }
      }

      toast.success("Brand documentation saved successfully!");
    } catch (error) {
      console.error("Error saving brand documentation:", error);
      toast.error("Failed to save brand documentation");
    } finally {
      setIsSaving(false);
    }
  };

  const addArrayItem = (field: keyof BrandDocumentation, value: string) => {
    if (!value.trim()) return;
    setDocs(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[] || []), value.trim()]
    }));
  };

  const removeArrayItem = (field: keyof BrandDocumentation, index: number) => {
    setDocs(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  const renderStep = () => {
    const step = STEPS[currentStep];

    switch (step.id) {
      case "identity":
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="brandName">Brand Name</Label>
              <Input
                id="brandName"
                value={docs.brandName || ""}
                onChange={(e) => setDocs({ ...docs, brandName: e.target.value })}
                placeholder="e.g., Tarife Attar"
              />
            </div>

            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={docs.tagline || ""}
                onChange={(e) => setDocs({ ...docs, tagline: e.target.value })}
                placeholder="Your brand's tagline"
              />
            </div>

            <div>
              <Label htmlFor="missionStatement">Mission Statement</Label>
              <Textarea
                id="missionStatement"
                value={docs.missionStatement || ""}
                onChange={(e) => setDocs({ ...docs, missionStatement: e.target.value })}
                placeholder="What is your brand's purpose?"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="brandStory">Brand Story</Label>
              <Textarea
                id="brandStory"
                value={docs.brandStory || ""}
                onChange={(e) => setDocs({ ...docs, brandStory: e.target.value })}
                placeholder="Tell your brand's origin story"
                rows={6}
              />
            </div>

            <div>
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Textarea
                id="targetAudience"
                value={docs.targetAudience || ""}
                onChange={(e) => setDocs({ ...docs, targetAudience: e.target.value })}
                placeholder="Demographics, psychographics, behaviors"
                rows={4}
              />
            </div>

            <div>
              <Label>Brand Values (Press Enter to add)</Label>
              <Input
                placeholder="Enter a brand value"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addArrayItem("brandValues", e.currentTarget.value);
                    e.currentTarget.value = "";
                  }
                }}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {docs.brandValues?.map((value, i) => (
                  <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => removeArrayItem("brandValues", i)}>
                    {value} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="positioning">Competitive Positioning</Label>
              <Textarea
                id="positioning"
                value={docs.positioning || ""}
                onChange={(e) => setDocs({ ...docs, positioning: e.target.value })}
                placeholder="How do you differentiate from competitors?"
                rows={4}
              />
            </div>
          </div>
        );

      case "voice":
        return (
          <div className="space-y-6">
            <div>
              <Label>Voice Characteristics (Press Enter to add)</Label>
              <Input
                placeholder="e.g., warm, expert, conversational"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addArrayItem("voiceCharacteristics", e.currentTarget.value);
                    e.currentTarget.value = "";
                  }
                }}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {docs.voiceCharacteristics?.map((char, i) => (
                  <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => removeArrayItem("voiceCharacteristics", i)}>
                    {char} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="toneSpectrum">Tone Spectrum</Label>
              <Textarea
                id="toneSpectrum"
                value={docs.toneSpectrum || ""}
                onChange={(e) => setDocs({ ...docs, toneSpectrum: e.target.value })}
                placeholder="Describe how tone shifts by context (educational vs. promotional)"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="sentenceStructure">Sentence Structure Preferences</Label>
              <Textarea
                id="sentenceStructure"
                value={docs.sentenceStructure || ""}
                onChange={(e) => setDocs({ ...docs, sentenceStructure: e.target.value })}
                placeholder="Short/punchy vs. flowing/descriptive"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="perspective">Perspective</Label>
              <Input
                id="perspective"
                value={docs.perspective || ""}
                onChange={(e) => setDocs({ ...docs, perspective: e.target.value })}
                placeholder="1st person, 2nd person, 3rd person"
              />
            </div>

            <div>
              <Label htmlFor="formalityLevel">Formality Level</Label>
              <Input
                id="formalityLevel"
                value={docs.formalityLevel || ""}
                onChange={(e) => setDocs({ ...docs, formalityLevel: e.target.value })}
                placeholder="Casual, professional, formal, etc."
              />
            </div>
          </div>
        );

      case "lexical":
        return (
          <div className="space-y-6">
            <div>
              <Label>Approved Vocabulary (Press Enter to add)</Label>
              <p className="text-sm text-muted-foreground mb-2">Brand-specific terms, product names, proprietary language</p>
              <Input
                placeholder="Enter approved term"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addArrayItem("approvedVocabulary", e.currentTarget.value);
                    e.currentTarget.value = "";
                  }
                }}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {docs.approvedVocabulary?.map((term, i) => (
                  <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => removeArrayItem("approvedVocabulary", i)}>
                    {term} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Forbidden Phrases (Press Enter to add)</Label>
              <p className="text-sm text-muted-foreground mb-2">Words/phrases that conflict with brand positioning</p>
              <Input
                placeholder="Enter forbidden phrase"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addArrayItem("forbiddenPhrases", e.currentTarget.value);
                    e.currentTarget.value = "";
                  }
                }}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {docs.forbiddenPhrases?.map((phrase, i) => (
                  <Badge key={i} variant="destructive" className="cursor-pointer" onClick={() => removeArrayItem("forbiddenPhrases", i)}>
                    {phrase} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Competitor Language to Avoid (Press Enter to add)</Label>
              <p className="text-sm text-muted-foreground mb-2">Terms strongly associated with competitors</p>
              <Input
                placeholder="Enter competitor term"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addArrayItem("competitorLanguageToAvoid", e.currentTarget.value);
                    e.currentTarget.value = "";
                  }
                }}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {docs.competitorLanguageToAvoid?.map((term, i) => (
                  <Badge key={i} variant="outline" className="cursor-pointer" onClick={() => removeArrayItem("competitorLanguageToAvoid", i)}>
                    {term} ×
                  </Badge>
                ))}
              </div>
            </div>

            <Card className="p-4 bg-muted/30">
              <Label className="text-base mb-3 block">Preferred Semantic Fields</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Create collections of related words by emotion/concept (e.g., "Luxury" → opulent, sumptuous, refined)
              </p>
              <Textarea
                placeholder={`Example format:\nLuxury: opulent, sumptuous, refined, elegant\nSensory: aromatic, tactile, luminous, textured`}
                rows={6}
                className="font-mono text-sm"
                onChange={(e) => {
                  const lines = e.target.value.split('\n');
                  const fields: Record<string, string[]> = {};
                  lines.forEach(line => {
                    const [category, ...words] = line.split(':');
                    if (category && words.length > 0) {
                      fields[category.trim()] = words.join(':').split(',').map(w => w.trim()).filter(Boolean);
                    }
                  });
                  setDocs({ ...docs, preferredSemanticFields: fields });
                }}
              />
            </Card>
          </div>
        );

      case "semantic":
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="emotionCategories">Emotion Categories by Content Type</Label>
              <p className="text-sm text-muted-foreground mb-2">Which feelings should be evoked per content type</p>
              <Textarea
                id="emotionCategories"
                placeholder={`Example:\nInstagram: aspirational, intimate\nEmail: educational, nurturing\nProduct: luxurious, confident`}
                rows={6}
                className="font-mono text-sm"
              />
            </div>

            <div>
              <Label htmlFor="sensoryLanguageGuidelines">Sensory Language Guidelines</Label>
              <Textarea
                id="sensoryLanguageGuidelines"
                value={docs.sensoryLanguageGuidelines || ""}
                onChange={(e) => setDocs({ ...docs, sensoryLanguageGuidelines: e.target.value })}
                placeholder="Visual, olfactory, tactile, auditory descriptions that align with your brand"
                rows={4}
              />
            </div>

            <div>
              <Label>Metaphor Frameworks (Press Enter to add)</Label>
              <p className="text-sm text-muted-foreground mb-2">Approved imagery and analogies</p>
              <Input
                placeholder="e.g., Natural world metaphors, Artisan craft imagery"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addArrayItem("metaphorFrameworks", e.currentTarget.value);
                    e.currentTarget.value = "";
                  }
                }}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {docs.metaphorFrameworks?.map((framework, i) => (
                  <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => removeArrayItem("metaphorFrameworks", i)}>
                    {framework} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="culturalReferences">Cultural References</Label>
              <Textarea
                id="culturalReferences"
                value={docs.culturalReferences || ""}
                onChange={(e) => setDocs({ ...docs, culturalReferences: e.target.value })}
                placeholder="What cultural references are on-brand vs. off-brand?"
                rows={4}
              />
            </div>
          </div>
        );

      case "structure":
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="sentenceLengthRanges">Sentence Length Ranges</Label>
              <Input
                id="sentenceLengthRanges"
                value={docs.sentenceLengthRanges || ""}
                onChange={(e) => setDocs({ ...docs, sentenceLengthRanges: e.target.value })}
                placeholder="e.g., 8-15 words for Instagram, 12-20 for blog"
              />
            </div>

            <div>
              <Label htmlFor="paragraphStructure">Paragraph Structure Rules</Label>
              <Textarea
                id="paragraphStructure"
                value={docs.paragraphStructure || ""}
                onChange={(e) => setDocs({ ...docs, paragraphStructure: e.target.value })}
                placeholder="Preferred paragraph lengths and structures by content type"
                rows={4}
              />
            </div>

            <div>
              <Label>Hook/Opening Formulas (Press Enter to add)</Label>
              <Input
                placeholder="e.g., Question-based hooks, Story-driven opens"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addArrayItem("hookFormulas", e.currentTarget.value);
                    e.currentTarget.value = "";
                  }
                }}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {docs.hookFormulas?.map((formula, i) => (
                  <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => removeArrayItem("hookFormulas", i)}>
                    {formula} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>CTA Patterns (Press Enter to add)</Label>
              <Input
                placeholder="e.g., Soft invite patterns, Direct action phrases"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addArrayItem("ctaPatterns", e.currentTarget.value);
                    e.currentTarget.value = "";
                  }
                }}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {docs.ctaPatterns?.map((pattern, i) => (
                  <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => removeArrayItem("ctaPatterns", i)}>
                    {pattern} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="rhythmPreferences">Rhythm & Cadence Preferences</Label>
              <Textarea
                id="rhythmPreferences"
                value={docs.rhythmPreferences || ""}
                onChange={(e) => setDocs({ ...docs, rhythmPreferences: e.target.value })}
                placeholder="Flow, pacing, and rhythm guidelines"
                rows={3}
              />
            </div>
          </div>
        );

      case "channels":
        return (
          <div className="space-y-6">
            <Tabs defaultValue="instagram" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="instagram">Instagram</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="product">Product</TabsTrigger>
                <TabsTrigger value="blog">Blog</TabsTrigger>
              </TabsList>

              <TabsContent value="instagram" className="space-y-4 mt-4">
                <div>
                  <Label>Caption Style</Label>
                  <Textarea placeholder="Describe Instagram caption style" rows={3} />
                </div>
                <div>
                  <Label>Hashtag Strategy</Label>
                  <Input placeholder="e.g., 5-7 branded hashtags, no trending tags" />
                </div>
                <div>
                  <Label>Emoji Usage</Label>
                  <Input placeholder="e.g., Minimal, only gold star and sparkle" />
                </div>
              </TabsContent>

              <TabsContent value="email" className="space-y-4 mt-4">
                <div>
                  <Label>Subject Line Formulas</Label>
                  <Textarea placeholder="Preferred subject line structures" rows={3} />
                </div>
                <div>
                  <Label>Structure Rules</Label>
                  <Textarea placeholder="Intro/body/conclusion patterns" rows={4} />
                </div>
              </TabsContent>

              <TabsContent value="product" className="space-y-4 mt-4">
                <div>
                  <Label>Feature Prioritization</Label>
                  <Textarea placeholder="What features to highlight first" rows={3} />
                </div>
                <div>
                  <Label>Benefit Language</Label>
                  <Textarea placeholder="How to express product benefits" rows={3} />
                </div>
              </TabsContent>

              <TabsContent value="blog" className="space-y-4 mt-4">
                <div>
                  <Label>Structure Standards</Label>
                  <Textarea placeholder="Intro/body/conclusion patterns" rows={4} />
                </div>
                <div>
                  <Label>Sourcing Standards</Label>
                  <Textarea placeholder="How to cite sources and use data" rows={3} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Brand Documentation Center</h2>
        <p className="text-muted-foreground">
          Comprehensive brand governance to ensure consistent, on-brand content generation
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isCompleted
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs text-center ${isActive ? "font-semibold" : ""}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[400px] mb-6">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          {currentStep === STEPS.length - 1 ? (
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save All"}
            </Button>
          ) : (
            <Button onClick={() => setCurrentStep(Math.min(STEPS.length - 1, currentStep + 1))}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
