import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useOnboarding } from "@/hooks/useOnboarding";
import { toast } from "@/hooks/use-toast";
import { getIndustryList, getIndustryById, IndustryId } from "@/config/industries";
import { migrateLegacyIndustry } from "@/config/industryTemplates";
import { Check, ChevronUp, Pencil } from "lucide-react";

export const IndustrySelector = () => {
  const { currentOrganizationId } = useOnboarding();
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedSubIndustry, setSelectedSubIndustry] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const industries = getIndustryList();

  useEffect(() => {
    loadCurrentIndustry();
  }, [currentOrganizationId]);

  const loadCurrentIndustry = async () => {
    if (!currentOrganizationId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("organizations")
        .select("brand_config")
        .eq("id", currentOrganizationId)
        .maybeSingle();

      if (error) throw error;

      const brandConfig = (data?.brand_config as any) || {};
      let industryId = brandConfig.industry_config?.id;
      const subIndustryId = brandConfig.industry_config?.subIndustry;
      
      // Migrate legacy industry values
      if (industryId && !getIndustryById(industryId)) {
        industryId = migrateLegacyIndustry(industryId);
      }
      
      if (industryId) {
        setSelectedIndustry(industryId);
      }
      if (subIndustryId) {
        setSelectedSubIndustry(subIndustryId);
      }
    } catch (error: any) {
      console.error("Error loading industry:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentOrganizationId || !selectedIndustry) return;

    try {
      setSaving(true);

      // Get current brand_config
      const { data: orgData, error: fetchError } = await supabase
        .from("organizations")
        .select("brand_config")
        .eq("id", currentOrganizationId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      const currentConfig = (orgData?.brand_config as any) || {};

      // Update with new industry config including sub-industry
      const { error: updateError } = await supabase
        .from("organizations")
        .update({
          brand_config: {
            ...currentConfig,
            industry_config: { 
              id: selectedIndustry,
              subIndustry: selectedSubIndustry,
            },
            // Also set top-level industry for backwards compatibility
            industry: selectedIndustry,
          },
        })
        .eq("id", currentOrganizationId);

      if (updateError) throw updateError;

      setIsExpanded(false);

      toast({
        title: "Industry updated",
        description: "Your organization's industry has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Handle industry selection - reset sub-industry when main industry changes
  const handleIndustrySelect = (industryId: string) => {
    setSelectedIndustry(industryId);
    setSelectedSubIndustry(null);
  };

  // Get the display label for the selected industry
  const getIndustryLabel = (value: string | null) => {
    if (!value) return null;
    const industry = getIndustryById(value);
    return industry?.name || value;
  };
  
  // Get sub-industry label
  const getSubIndustryLabel = (industryId: string | null, subId: string | null) => {
    if (!industryId || !subId) return null;
    const industry = getIndustryById(industryId);
    const sub = industry?.subIndustries.find(s => s.id === subId);
    return sub?.name || null;
  };
  
  // Get the current industry config for showing icon
  const currentIndustryConfig = selectedIndustry ? getIndustryById(selectedIndustry) : null;

  if (loading) {
    return (
      <Card className="bg-paper border-cream-dark">
        <CardContent className="pt-6">
          <p className="text-neutral-600">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  // If industry is already set, show a compact view by default
  if (selectedIndustry && !isExpanded) {
    const IconComponent = currentIndustryConfig?.icon;
    const subLabel = getSubIndustryLabel(selectedIndustry, selectedSubIndustry);
    
    return (
      <Card className="bg-paper border-cream-dark">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brass/10 flex items-center justify-center">
                {IconComponent ? <IconComponent className="w-4 h-4 text-brass" /> : <Check className="w-4 h-4 text-brass" />}
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal">{getIndustryLabel(selectedIndustry)}</p>
                {subLabel && (
                  <p className="text-xs text-muted-foreground">{subLabel}</p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="text-muted-foreground hover:text-charcoal"
            >
              <Pencil className="w-4 h-4 mr-1" />
              Change
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-paper border-cream-dark">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-charcoal font-serif">Industry Type</CardTitle>
            <CardDescription>
              Select your primary industry to customize collections and content templates
            </CardDescription>
          </div>
          {selectedIndustry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="text-muted-foreground"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Industry Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Select Your Industry</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {industries.map((industry) => {
              const IconComponent = industry.icon;
              return (
              <button
                  key={industry.id}
                  onClick={() => handleIndustrySelect(industry.id)}
                className={`relative p-4 rounded-lg border-2 text-left transition-all hover:border-brass ${
                    selectedIndustry === industry.id
                      ? "border-brass bg-brass/5"
                      : "border-stone/30 bg-white hover:bg-parchment/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      selectedIndustry === industry.id ? "bg-brass/20" : "bg-stone/10"
                    }`}>
                      <IconComponent className={`w-4 h-4 ${
                        selectedIndustry === industry.id ? "text-brass" : "text-charcoal/60"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-charcoal">{industry.name}</span>
                        {selectedIndustry === industry.id && (
                          <Check className="w-4 h-4 text-brass flex-shrink-0" />
                  )}
                      </div>
                      <p className="text-xs text-charcoal/60 mt-0.5 line-clamp-2">
                        {industry.description}
                      </p>
                    </div>
                </div>
              </button>
              );
            })}
          </div>
        </div>

        {/* Sub-Industry Selection */}
        {selectedIndustry && currentIndustryConfig && (
          <div className="space-y-3 pt-2">
            <Label className="text-sm font-medium">
              Specific Focus <span className="text-charcoal/50 font-normal">(optional)</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {currentIndustryConfig.subIndustries.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubIndustry(
                    selectedSubIndustry === sub.id ? null : sub.id
                  )}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    selectedSubIndustry === sub.id
                      ? "bg-brass text-white"
                      : "bg-stone/10 text-charcoal/70 hover:bg-stone/20"
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleSave}
            disabled={saving || !selectedIndustry}
            className="bg-brass hover:bg-brass/90 text-white"
          >
            {saving ? "Saving..." : "Save Industry"}
          </Button>
          {selectedIndustry && (
            <Button
              variant="outline"
              onClick={() => setIsExpanded(false)}
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
