import { useState, useEffect } from "react";
import {
  Beaker,
  Droplets,
  Clock,
  Wind,
  Sun,
  Calendar,
  Sparkles,
  Save,
  FlaskConical,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ScentProfileEditor } from "./ScentNoteInput";
import {
  useProductFormulation,
  getDefaultFormulation,
  getScentProfileSummary,
  CONCENTRATION_OPTIONS,
  BASE_CARRIER_OPTIONS,
  LONGEVITY_OPTIONS,
  SILLAGE_OPTIONS,
  SEASON_OPTIONS,
  OCCASION_OPTIONS,
  SKIN_TYPE_OPTIONS,
  SKIN_CONCERN_OPTIONS,
  SCENT_FAMILY_OPTIONS,
  type ScentProfile,
  type ConcentrationType,
  type BaseCarrier,
  type Longevity,
  type Sillage,
  type Season,
  type Occasion,
  type SkinType,
  type SkinConcern,
} from "@/hooks/useFormulation";

interface FormulationSectionProps {
  productId: string;
  productCategory?: string | null;
  isEditing?: boolean;
}

export function FormulationSection({
  productId,
  productCategory,
  isEditing = false,
}: FormulationSectionProps) {
  const { formulation, isLoading, saveFormulation } = useProductFormulation(productId);
  
  // Local state for editing
  const [localFormulation, setLocalFormulation] = useState(getDefaultFormulation());
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize local state when formulation loads
  useEffect(() => {
    if (formulation) {
      setLocalFormulation(formulation);
    } else {
      setLocalFormulation(getDefaultFormulation());
    }
    setHasChanges(false);
  }, [formulation]);

  // Check if this is a fragrance product
  const isFragrance = productCategory === "Fragrance" || 
    ["Attär", "Eau de Parfum", "Eau de Toilette", "Perfume Oil", "Body Mist", "Solid Perfume"].includes(productCategory || "");
  
  // Check if this is skincare
  const isSkincare = productCategory === "Skincare" || 
    ["Serum", "Moisturizer", "Cleanser", "Toner", "Mask", "Oil"].includes(productCategory || "");

  const handleChange = <K extends keyof typeof localFormulation>(
    field: K,
    value: typeof localFormulation[K]
  ) => {
    setLocalFormulation((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    await saveFormulation.mutateAsync({
      product_id: productId,
      ...localFormulation,
    });
    setHasChanges(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-muted rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Save Button */}
      {isEditing && hasChanges && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saveFormulation.isPending}>
            <Save className="w-4 h-4 mr-2" />
            {saveFormulation.isPending ? "Saving..." : "Save Formulation"}
          </Button>
        </div>
      )}

      {/* Fragrance Section */}
      {isFragrance && (
        <>
          {/* Scent Profile */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FlaskConical className="w-5 h-5 text-primary" />
                Scent Profile
              </CardTitle>
              <CardDescription>
                Build the fragrance pyramid with top, heart, and base notes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScentProfileEditor
                profile={localFormulation.scent_profile as ScentProfile || { top: [], heart: [], base: [] }}
                onChange={(profile) => handleChange("scent_profile", profile)}
                disabled={!isEditing}
              />
            </CardContent>
          </Card>

          {/* Concentration & Base */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Droplets className="w-5 h-5 text-primary" />
                Concentration & Base
              </CardTitle>
              <CardDescription>
                Define the fragrance strength and carrier
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Concentration Type */}
                <div className="space-y-2">
                  <Label>Concentration Type</Label>
                  {isEditing ? (
                    <Select
                      value={localFormulation.concentration_type || ""}
                      onValueChange={(val) => handleChange("concentration_type", val as ConcentrationType)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select concentration" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONCENTRATION_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div className="flex items-center justify-between gap-4">
                              <span>{opt.label}</span>
                              <span className="text-xs text-muted-foreground">{opt.range}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-foreground">
                      {CONCENTRATION_OPTIONS.find((o) => o.value === localFormulation.concentration_type)?.label || "—"}
                    </p>
                  )}
                </div>

                {/* Base Carrier */}
                <div className="space-y-2">
                  <Label>Base Carrier</Label>
                  {isEditing ? (
                    <Select
                      value={localFormulation.base_carrier || ""}
                      onValueChange={(val) => handleChange("base_carrier", val as BaseCarrier)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select carrier" />
                      </SelectTrigger>
                      <SelectContent>
                        {BASE_CARRIER_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div>
                              <span>{opt.label}</span>
                              <p className="text-xs text-muted-foreground">{opt.description}</p>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-foreground">
                      {BASE_CARRIER_OPTIONS.find((o) => o.value === localFormulation.base_carrier)?.label || "—"}
                    </p>
                  )}
                </div>

                {/* Scent Family */}
                <div className="space-y-2">
                  <Label>Scent Family</Label>
                  {isEditing ? (
                    <Select
                      value={localFormulation.scent_family || ""}
                      onValueChange={(val) => handleChange("scent_family", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select family" />
                      </SelectTrigger>
                      <SelectContent>
                        {SCENT_FAMILY_OPTIONS.map((family) => (
                          <SelectItem key={family} value={family}>
                            {family}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-foreground">{localFormulation.scent_family || "—"}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-primary" />
                Performance
              </CardTitle>
              <CardDescription>
                How the fragrance performs on skin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Longevity */}
                <div className="space-y-2">
                  <Label>Longevity</Label>
                  {isEditing ? (
                    <Select
                      value={localFormulation.longevity || ""}
                      onValueChange={(val) => handleChange("longevity", val as Longevity)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select longevity" />
                      </SelectTrigger>
                      <SelectContent>
                        {LONGEVITY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div className="flex items-center justify-between gap-4">
                              <span>{opt.label}</span>
                              <span className="text-xs text-muted-foreground">{opt.duration}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-foreground">
                      {LONGEVITY_OPTIONS.find((o) => o.value === localFormulation.longevity)?.label || "—"}
                    </p>
                  )}
                </div>

                {/* Sillage */}
                <div className="space-y-2">
                  <Label>Sillage (Projection)</Label>
                  {isEditing ? (
                    <Select
                      value={localFormulation.sillage || ""}
                      onValueChange={(val) => handleChange("sillage", val as Sillage)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sillage" />
                      </SelectTrigger>
                      <SelectContent>
                        {SILLAGE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div>
                              <span>{opt.label}</span>
                              <p className="text-xs text-muted-foreground">{opt.description}</p>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-foreground">
                      {SILLAGE_OPTIONS.find((o) => o.value === localFormulation.sillage)?.label || "—"}
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Season Suitability */}
              <div className="space-y-3">
                <Label>Best Seasons</Label>
                <div className="flex flex-wrap gap-2">
                  {SEASON_OPTIONS.map((season) => {
                    const isSelected = (localFormulation.season_suitability as Season[] || []).includes(season.value);
                    return isEditing ? (
                      <Button
                        key={season.value}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const current = localFormulation.season_suitability as Season[] || [];
                          const updated = isSelected
                            ? current.filter((s) => s !== season.value)
                            : [...current, season.value];
                          handleChange("season_suitability", updated);
                        }}
                        className="gap-1"
                      >
                        <span>{season.icon}</span>
                        {season.label}
                      </Button>
                    ) : isSelected ? (
                      <Badge key={season.value} variant="secondary">
                        {season.icon} {season.label}
                      </Badge>
                    ) : null;
                  })}
                  {!isEditing && (!localFormulation.season_suitability || (localFormulation.season_suitability as Season[]).length === 0) && (
                    <span className="text-muted-foreground text-sm">No seasons selected</span>
                  )}
                </div>
              </div>

              {/* Occasion Suitability */}
              <div className="space-y-3">
                <Label>Best Occasions</Label>
                <div className="flex flex-wrap gap-2">
                  {OCCASION_OPTIONS.map((occasion) => {
                    const isSelected = (localFormulation.occasion_suitability as Occasion[] || []).includes(occasion.value);
                    return isEditing ? (
                      <Button
                        key={occasion.value}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const current = localFormulation.occasion_suitability as Occasion[] || [];
                          const updated = isSelected
                            ? current.filter((o) => o !== occasion.value)
                            : [...current, occasion.value];
                          handleChange("occasion_suitability", updated);
                        }}
                      >
                        {occasion.label}
                      </Button>
                    ) : isSelected ? (
                      <Badge key={occasion.value} variant="secondary">
                        {occasion.label}
                      </Badge>
                    ) : null;
                  })}
                  {!isEditing && (!localFormulation.occasion_suitability || (localFormulation.occasion_suitability as Occasion[]).length === 0) && (
                    <span className="text-muted-foreground text-sm">No occasions selected</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Skincare Section */}
      {isSkincare && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="w-5 h-5 text-primary" />
              Skin Profile
            </CardTitle>
            <CardDescription>
              Define target skin types and concerns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Skin Types */}
            <div className="space-y-3">
              <Label>Suitable Skin Types</Label>
              <div className="flex flex-wrap gap-2">
                {SKIN_TYPE_OPTIONS.map((type) => {
                  const isSelected = (localFormulation.skin_types as SkinType[] || []).includes(type.value);
                  return isEditing ? (
                    <Button
                      key={type.value}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const current = localFormulation.skin_types as SkinType[] || [];
                        const updated = isSelected
                          ? current.filter((t) => t !== type.value)
                          : [...current, type.value];
                        handleChange("skin_types", updated);
                      }}
                    >
                      {type.label}
                    </Button>
                  ) : isSelected ? (
                    <Badge key={type.value} variant="secondary">
                      {type.label}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>

            {/* Skin Concerns */}
            <div className="space-y-3">
              <Label>Targets These Concerns</Label>
              <div className="flex flex-wrap gap-2">
                {SKIN_CONCERN_OPTIONS.map((concern) => {
                  const isSelected = (localFormulation.skin_concerns as SkinConcern[] || []).includes(concern.value);
                  return isEditing ? (
                    <Button
                      key={concern.value}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const current = localFormulation.skin_concerns as SkinConcern[] || [];
                        const updated = isSelected
                          ? current.filter((c) => c !== concern.value)
                          : [...current, concern.value];
                        handleChange("skin_concerns", updated);
                      }}
                    >
                      {concern.label}
                    </Button>
                  ) : isSelected ? (
                    <Badge key={concern.value} variant="secondary">
                      {concern.label}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulation Preview Card */}
      <FormulationPreviewCard
        formulation={localFormulation}
        isFragrance={isFragrance}
        isSkincare={isSkincare}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FORMULATION PREVIEW CARD
// ═══════════════════════════════════════════════════════════════════════════════

interface FormulationPreviewCardProps {
  formulation: ReturnType<typeof getDefaultFormulation>;
  isFragrance: boolean;
  isSkincare: boolean;
}

function FormulationPreviewCard({
  formulation,
  isFragrance,
  isSkincare,
}: FormulationPreviewCardProps) {
  const profile = formulation.scent_profile as ScentProfile || { top: [], heart: [], base: [] };
  const hasContent = isFragrance
    ? profile.top.length > 0 || profile.heart.length > 0 || profile.base.length > 0
    : (formulation.skin_types as string[] || []).length > 0;

  if (!hasContent) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-primary" />
          Formulation Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isFragrance && (
          <div className="space-y-4">
            {/* Scent Pyramid Visual */}
            <div className="flex flex-col items-center">
              {/* Top */}
              {profile.top.length > 0 && (
                <div className="w-24 h-8 bg-amber-200 rounded-t-lg flex items-center justify-center text-xs font-medium text-amber-800 border border-amber-300">
                  Top
                </div>
              )}
              {/* Heart */}
              {profile.heart.length > 0 && (
                <div className="w-32 h-10 bg-rose-200 flex items-center justify-center text-xs font-medium text-rose-800 border-x border-rose-300">
                  Heart
                </div>
              )}
              {/* Base */}
              {profile.base.length > 0 && (
                <div className="w-40 h-12 bg-stone-300 rounded-b-lg flex items-center justify-center text-xs font-medium text-stone-800 border border-stone-400">
                  Base
                </div>
              )}
            </div>

            {/* Notes Summary */}
            <div className="text-sm text-center text-muted-foreground">
              {getScentProfileSummary(profile)}
            </div>

            {/* Quick Stats */}
            <div className="flex justify-center gap-4 text-xs">
              {formulation.concentration_type && (
                <div className="flex items-center gap-1">
                  <Droplets className="w-3 h-3" />
                  {CONCENTRATION_OPTIONS.find((o) => o.value === formulation.concentration_type)?.label}
                </div>
              )}
              {formulation.longevity && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {LONGEVITY_OPTIONS.find((o) => o.value === formulation.longevity)?.duration}
                </div>
              )}
              {formulation.sillage && (
                <div className="flex items-center gap-1">
                  <Wind className="w-3 h-3" />
                  {SILLAGE_OPTIONS.find((o) => o.value === formulation.sillage)?.label}
                </div>
              )}
            </div>
          </div>
        )}

        {isSkincare && (
          <div className="space-y-3">
            {(formulation.skin_types as string[] || []).length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">For Skin Types:</p>
                <p className="text-sm font-medium">
                  {(formulation.skin_types as string[]).map((t) => 
                    SKIN_TYPE_OPTIONS.find((o) => o.value === t)?.label
                  ).join(", ")}
                </p>
              </div>
            )}
            {(formulation.skin_concerns as string[] || []).length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Targets:</p>
                <p className="text-sm font-medium">
                  {(formulation.skin_concerns as string[]).map((c) =>
                    SKIN_CONCERN_OPTIONS.find((o) => o.value === c)?.label
                  ).join(", ")}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
