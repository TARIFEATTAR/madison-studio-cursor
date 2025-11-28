import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useBrandHealth } from "@/hooks/useBrandHealth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Essential5Card } from "@/components/brand-builder/Essential5Card";
import { Progress } from "@/components/ui/progress";

interface Essential5Data {
  target_audience?: string;
  brand_voice?: string;
  mission?: string;
  usp?: string;
  key_messages?: string[];
}

export default function BrandBuilder() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { brandHealth } = useBrandHealth();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [essential5, setEssential5] = useState<Essential5Data>({});
  const [completedFields, setCompletedFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadBrandData();
  }, [user]);

  const loadBrandData = async () => {
    if (!user) return;

    try {
      // Get organization
      const { data: orgMember } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .single();

      if (!orgMember) {
        toast.error("Organization not found");
        navigate("/dashboard");
        return;
      }

      setOrganizationId(orgMember.organization_id);

      // Load existing brand knowledge
      const { data: knowledge } = await supabase
        .from("brand_knowledge")
        .select("*")
        .eq("organization_id", orgMember.organization_id)
        .eq("is_active", true);

      if (knowledge && knowledge.length > 0) {
        const loadedData: Essential5Data = {};
        const completed = new Set<string>();

        knowledge.forEach((k) => {
          const content = k.content as any;
          switch (k.knowledge_type) {
            case "target_audience":
              loadedData.target_audience = content.text || content.description;
              if (loadedData.target_audience) completed.add("target_audience");
              break;
            case "brand_voice":
              loadedData.brand_voice = content.text || content.voice_guidelines;
              if (loadedData.brand_voice) completed.add("brand_voice");
              break;
            case "mission":
            case "core_identity":
              loadedData.mission = content.text || content.mission;
              if (loadedData.mission) completed.add("mission");
              break;
            case "usp":
            case "differentiators":
              loadedData.usp = content.text || content.differentiator;
              if (loadedData.usp) completed.add("usp");
              break;
            case "key_messages":
              loadedData.key_messages = content.messages || content.key_messages;
              if (loadedData.key_messages && loadedData.key_messages.length > 0) {
                completed.add("key_messages");
              }
              break;
          }
        });

        setEssential5(loadedData);
        setCompletedFields(completed);
      }
    } catch (error) {
      console.error("Error loading brand data:", error);
      toast.error("Failed to load brand data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (field: keyof Essential5Data, value: string | string[]) => {
    if (!organizationId) return;

    setIsSaving(true);
    try {
      // Map field to knowledge_type
      const knowledgeTypeMap: Record<string, string> = {
        target_audience: "target_audience",
        brand_voice: "brand_voice",
        mission: "core_identity",
        usp: "differentiators",
        key_messages: "key_messages",
      };

      const knowledgeType = knowledgeTypeMap[field];

      // Check if exists
      const { data: existing } = await supabase
        .from("brand_knowledge")
        .select("id")
        .eq("organization_id", organizationId)
        .eq("knowledge_type", knowledgeType)
        .eq("is_active", true)
        .maybeSingle();

      const content =
        field === "key_messages"
          ? { messages: value }
          : field === "brand_voice"
            ? { voice_guidelines: value }
            : field === "mission"
              ? { mission: value }
              : field === "usp"
                ? { differentiator: value }
                : { text: value };

      if (existing) {
        // Update
        await supabase
          .from("brand_knowledge")
          .update({ content, updated_at: new Date().toISOString() })
          .eq("id", existing.id);
      } else {
        // Insert
        await supabase.from("brand_knowledge").insert({
          organization_id: organizationId,
          knowledge_type: knowledgeType,
          content,
        });
      }

      // Update local state
      setEssential5((prev) => ({ ...prev, [field]: value }));
      setCompletedFields((prev) => new Set([...prev, field]));

      toast.success("Saved!");

      // Trigger brand health refresh
      await supabase.functions.invoke("analyze-brand-health", {
        body: { organizationId },
      });
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const calculateScore = () => {
    // Always use comprehensive brand health score from database
    // This ensures consistency across the app
    if (brandHealth?.completeness_score !== undefined) {
      return brandHealth.completeness_score;
    }
    
    // If no comprehensive score exists yet, estimate based on Essential 5
    // But note: this is just an estimate until comprehensive analysis runs
    const baseScore = 40; // From basic onboarding
    const perFieldScore = 9; // 9% per Essential 5 field (5 * 9 = 45%, total 85%)
    return Math.min(baseScore + completedFields.size * perFieldScore, 85);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-vellum-cream">
        <Loader2 className="w-8 h-8 animate-spin text-brass" />
      </div>
    );
  }

  const score = calculateScore();
  const isComplete = completedFields.size === 5;

  return (
    <div className="min-h-screen bg-vellum-cream">
      {/* Header */}
      <div className="bg-parchment-white border-b border-charcoal/10 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="text-charcoal/70 hover:text-ink-black"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-xs text-charcoal/60">
                  {brandHealth?.completeness_score !== undefined 
                    ? "Brand Health Score" 
                    : "Essential 5 Progress"}
                </p>
                <p className="text-2xl font-serif text-brass">{score}%</p>
                {brandHealth?.completeness_score === undefined && (
                  <p className="text-xs text-charcoal/50 mt-1">
                    Run analysis for full score
                  </p>
                )}
              </div>
              {isComplete && (
                <Button
                  onClick={() => navigate("/create")}
                  className="bg-brass hover:bg-antique-gold text-ink"
                >
                  Start Creating
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Title & Progress */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-brass/10 border border-brass/20 px-4 py-2 mb-4">
            <Sparkles className="w-4 h-4 text-brass" />
            <span className="text-xs font-sans uppercase tracking-wider text-brass">
              Essential 5 Brand Builder
            </span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-ink-black mb-4">
            Complete Your Brand in 10 Minutes
          </h1>
          <p className="text-lg text-charcoal/70 max-w-2xl mx-auto mb-6">
            Madison needs these 5 key pieces to create quality content. We've pre-filled suggestions
            based on your website—just approve or edit!
          </p>
          <div className="max-w-md mx-auto">
            <Progress value={(completedFields.size / 5) * 100} className="h-2" />
            <p className="text-sm text-charcoal/60 mt-2">
              {completedFields.size} of 5 Essential fields complete
              {brandHealth?.completeness_score !== undefined && (
                <> • {score}% Brand Health</>
              )}
            </p>
          </div>
        </div>

        {/* Essential 5 Cards */}
        <div className="space-y-6">
          <Essential5Card
            title="Who You Help"
            subtitle="Target Audience"
            description="Who are your ideal customers? Be specific about demographics, needs, and pain points."
            field="target_audience"
            value={essential5.target_audience}
            isCompleted={completedFields.has("target_audience")}
            onApprove={handleApprove}
            organizationId={organizationId}
            isSaving={isSaving}
            placeholder="E.g., 'Wellness-conscious women aged 25-45 who value natural ingredients and sustainable luxury...'"
          />

          <div data-tooltip-target="brand-voice">
            <Essential5Card
              title="Your Voice"
              subtitle="Brand Voice & Tone"
              description="How does your brand communicate? Describe your personality, tone, and style."
              field="brand_voice"
              value={essential5.brand_voice}
              isCompleted={completedFields.has("brand_voice")}
              onApprove={handleApprove}
              organizationId={organizationId}
              isSaving={isSaving}
              placeholder="E.g., 'Warm, approachable, and knowledgeable. We use conversational language with occasional poetry...'"
            />
          </div>

          <Essential5Card
            title="Your Why"
            subtitle="Mission Statement"
            description="Why does your brand exist? What problem do you solve or value do you create?"
            field="mission"
            value={essential5.mission}
            isCompleted={completedFields.has("mission")}
            onApprove={handleApprove}
            organizationId={organizationId}
            isSaving={isSaving}
            placeholder="E.g., 'To help people reconnect with nature through handcrafted, sustainable products that honor the earth...'"
          />

          <Essential5Card
            title="What Makes You Different"
            subtitle="Unique Selling Proposition"
            description="What sets you apart from competitors? What do you do better or differently?"
            field="usp"
            value={essential5.usp}
            isCompleted={completedFields.has("usp")}
            onApprove={handleApprove}
            organizationId={organizationId}
            isSaving={isSaving}
            placeholder="E.g., 'The only certified organic candle brand with zero-waste packaging and hand-poured by artisans...'"
          />

          <Essential5Card
            title="Key Messages"
            subtitle="3-5 Core Messages"
            description="What are the main points you want customers to remember about your brand?"
            field="key_messages"
            value={essential5.key_messages}
            isCompleted={completedFields.has("key_messages")}
            onApprove={handleApprove}
            organizationId={organizationId}
            isSaving={isSaving}
            isArray
            placeholder="E.g., 'Handcrafted with love', 'Sustainable materials', 'Small-batch quality'..."
          />
        </div>

        {/* Completion Banner */}
        {isComplete && (
          <div className="mt-12 bg-gradient-to-r from-brass/10 to-antique-gold/10 border border-brass/20 p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-brass mx-auto mb-4" />
            <h2 className="font-serif text-3xl text-ink-black mb-3">
              Essential 5 Complete! 🎉
            </h2>
            <p className="text-charcoal/70 mb-4 max-w-2xl mx-auto">
              You've completed the Essential 5! Madison now has the core information needed to create quality,
              on-brand content.
            </p>
            {brandHealth?.completeness_score !== undefined && (
              <div className="mb-6">
                <p className="text-sm text-charcoal/60 mb-2">Your Comprehensive Brand Health Score:</p>
                <p className="text-4xl font-serif text-brass mb-2">{brandHealth.completeness_score}%</p>
                <p className="text-xs text-charcoal/50 max-w-xl mx-auto">
                  This score includes products, collections, transparency, and content beyond the Essential 5.
                  Continue building your brand to increase your score!
                </p>
              </div>
            )}
            <Button
              onClick={() => navigate("/create")}
              size="lg"
              className="bg-brass hover:bg-antique-gold text-ink"
            >
              Start Creating Content
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
