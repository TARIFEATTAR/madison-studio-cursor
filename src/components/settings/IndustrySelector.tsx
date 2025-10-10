import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useOnboarding } from "@/hooks/useOnboarding";
import { toast } from "@/hooks/use-toast";
import { getIndustryOptions } from "@/config/industryTemplates";
import { Check } from "lucide-react";

export const IndustrySelector = () => {
  const { currentOrganizationId } = useOnboarding();
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const industries = getIndustryOptions();

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
        .single();

      if (error) throw error;

      const industryId = (data?.brand_config as any)?.industry_config?.id;
      if (industryId) {
        setSelectedIndustry(industryId);
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
        .single();

      if (fetchError) throw fetchError;

      const currentConfig = (orgData?.brand_config as any) || {};

      // Update with new industry config
      const { error: updateError } = await supabase
        .from("organizations")
        .update({
          brand_config: {
            ...currentConfig,
            industry_config: { id: selectedIndustry },
          },
        })
        .eq("id", currentOrganizationId);

      if (updateError) throw updateError;

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

  if (loading) {
    return (
      <Card className="bg-paper border-cream-dark">
        <CardContent className="pt-6">
          <p className="text-neutral-600">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-paper border-cream-dark">
      <CardHeader>
        <CardTitle className="text-charcoal font-serif">Industry Type</CardTitle>
        <CardDescription>
          Select your primary industry to customize collections and content templates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Select Your Industry</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {industries.map((industry) => (
              <button
                key={industry.value}
                onClick={() => setSelectedIndustry(industry.value)}
                className={`relative p-4 rounded-lg border-2 text-left transition-all hover:border-brass ${
                  selectedIndustry === industry.value
                    ? "border-brass bg-brass/10"
                    : "border-cream-dark bg-paper-light"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-charcoal">{industry.label}</span>
                  {selectedIndustry === industry.value && (
                    <Check className="w-5 h-5 text-brass" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving || !selectedIndustry}
          className="bg-brass hover:bg-brass/90 text-charcoal"
        >
          {saving ? "Saving..." : "Save Industry Selection"}
        </Button>
      </CardContent>
    </Card>
  );
};
