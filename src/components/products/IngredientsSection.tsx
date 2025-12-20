import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  GripVertical,
  AlertTriangle,
  Copy,
  Check,
  Sparkles,
  FlaskConical,
  Shield,
  FileText,
  ChevronDown,
  ChevronUp,
  Search,
  BookPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  useProductIngredients,
  useIngredientLibrary,
  useProductCertifications,
  detectAllergens,
  generateInciList,
  INGREDIENT_ORIGINS,
  COSMETIC_FUNCTIONS,
  CERTIFICATION_TYPES,
  type IngredientOrigin,
  type DetectedAllergen,
} from "@/hooks/useIngredients";

interface IngredientsSectionProps {
  productId: string;
  productName?: string;
  isEditing?: boolean;
}

export function IngredientsSection({
  productId,
  productName = "Product",
  isEditing = false,
}: IngredientsSectionProps) {
  const {
    ingredients,
    isLoading,
    addIngredient,
    updateIngredient,
    removeIngredient,
    addToLibrary,
  } = useProductIngredients(productId);

  const { certifications, toggleCertification, hasCertification } =
    useProductCertifications(productId);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [allergenResults, setAllergenResults] = useState<DetectedAllergen[]>([]);
  const [inciList, setInciList] = useState("");
  const [copied, setCopied] = useState(false);
  const [isCheckingAllergens, setIsCheckingAllergens] = useState(false);

  // Check allergens when ingredients change
  useEffect(() => {
    if (ingredients.length > 0) {
      checkAllergens();
    } else {
      setAllergenResults([]);
    }
  }, [ingredients]);

  const checkAllergens = async () => {
    if (ingredients.length === 0) return;

    setIsCheckingAllergens(true);
    try {
      const result = await detectAllergens(
        ingredients.map((i) => ({
          name: i.ingredient?.name || i.inci_name || "",
          inci_name: i.inci_name || i.ingredient?.inci_name,
          concentration_percent: i.concentration_percent || undefined,
        }))
      );
      setAllergenResults(result.detected_allergens);
    } catch (error) {
      console.error("Error checking allergens:", error);
    } finally {
      setIsCheckingAllergens(false);
    }
  };

  const generateINCIList = async () => {
    try {
      const result = await generateInciList(
        ingredients.map((i) => ({
          name: i.ingredient?.name || i.inci_name || "",
          inci_name: i.inci_name || i.ingredient?.inci_name,
          concentration_percent: i.concentration_percent || undefined,
          is_allergen: i.contains_allergens.length > 0,
        })),
        { format: "eu" }
      );
      setInciList(result.copy_ready);
    } catch (error) {
      console.error("Error generating INCI list:", error);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-muted rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Ingredients List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FlaskConical className="w-5 h-5 text-primary" />
                Ingredients
              </CardTitle>
              <CardDescription>
                {ingredients.length} ingredient{ingredients.length !== 1 ? "s" : ""} · 
                Sorted by concentration (highest first)
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddDialog(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Ingredient
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {ingredients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FlaskConical className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No ingredients added yet</p>
              {isEditing && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowAddDialog(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Ingredient
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {ingredients.map((ingredient, index) => (
                <IngredientRow
                  key={ingredient.id}
                  ingredient={ingredient}
                  index={index}
                  isEditing={isEditing}
                  onUpdate={(updates) =>
                    updateIngredient.mutate({ id: ingredient.id, ...updates })
                  }
                  onRemove={() => removeIngredient.mutate(ingredient.id)}
                  allergenMatch={allergenResults.find(
                    (a) =>
                      a.source_ingredient.toLowerCase() ===
                      (ingredient.ingredient?.name || ingredient.inci_name || "").toLowerCase()
                  )}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Allergen Detection */}
      {allergenResults.length > 0 && (
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-amber-800">
              <AlertTriangle className="w-5 h-5" />
              Allergen Alert ({allergenResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {allergenResults.map((allergen, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 bg-white rounded border border-amber-200"
                >
                  <div>
                    <p className="font-medium text-amber-900">{allergen.allergen_name}</p>
                    <p className="text-sm text-amber-700">
                      Found in: {allergen.source_ingredient}
                    </p>
                  </div>
                  {allergen.requires_disclosure && (
                    <Badge variant="outline" className="border-amber-500 text-amber-700">
                      Requires Disclosure
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* INCI List Generator */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-primary" />
            INCI List
          </CardTitle>
          <CardDescription>
            Copy-ready ingredient list for labels (EU compliant)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={generateINCIList} variant="outline" disabled={ingredients.length === 0}>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate INCI List
          </Button>

          {inciList && (
            <div className="relative">
              <Textarea
                value={inciList}
                readOnly
                className="min-h-[100px] font-mono text-xs"
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(inciList)}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5 text-primary" />
            Certifications
          </CardTitle>
          <CardDescription>
            Claim or display certifications for this product
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {CERTIFICATION_TYPES.map((cert) => {
              const hasCert = hasCertification(cert.value);
              return (
                <button
                  key={cert.value}
                  type="button"
                  onClick={() => isEditing && toggleCertification.mutate(cert.value)}
                  disabled={!isEditing}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg border transition-all text-left",
                    hasCert
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-muted/50 border-border text-muted-foreground hover:border-primary/50",
                    !isEditing && "cursor-default"
                  )}
                >
                  <span className="text-xl">{cert.icon}</span>
                  <span className="text-sm font-medium">{cert.label}</span>
                  {hasCert && <Check className="w-4 h-4 ml-auto" />}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Add Ingredient Dialog */}
      <AddIngredientDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAdd={(data) => {
          addIngredient.mutate(data);
          setShowAddDialog(false);
        }}
        onAddToLibrary={(data) => addToLibrary.mutate(data)}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// INGREDIENT ROW
// ═══════════════════════════════════════════════════════════════════════════════

interface IngredientRowProps {
  ingredient: any;
  index: number;
  isEditing: boolean;
  onUpdate: (updates: any) => void;
  onRemove: () => void;
  allergenMatch?: DetectedAllergen;
}

function IngredientRow({
  ingredient,
  index,
  isEditing,
  onUpdate,
  onRemove,
  allergenMatch,
}: IngredientRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const name = ingredient.ingredient?.name || ingredient.inci_name || "Unknown";
  const inciName = ingredient.inci_name || ingredient.ingredient?.inci_name;

  return (
    <div
      className={cn(
        "border rounded-lg",
        allergenMatch ? "border-amber-300 bg-amber-50" : "border-border bg-card"
      )}
    >
      <div className="flex items-center gap-3 p-3">
        {/* Drag Handle */}
        {isEditing && (
          <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
        )}

        {/* Order Number */}
        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
          {index + 1}
        </div>

        {/* Name & INCI */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{name}</span>
            {ingredient.is_hero_ingredient && (
              <Badge variant="secondary" className="text-xs">Hero</Badge>
            )}
            {allergenMatch && (
              <Badge variant="outline" className="text-xs border-amber-500 text-amber-700">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Allergen
              </Badge>
            )}
          </div>
          {inciName && inciName !== name && (
            <p className="text-xs text-muted-foreground truncate">{inciName}</p>
          )}
        </div>

        {/* Concentration */}
        <div className="text-right">
          {ingredient.concentration_percent !== null ? (
            <span className="font-medium">{ingredient.concentration_percent}%</span>
          ) : (
            <span className="text-muted-foreground text-sm">—</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
          {isEditing && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              onClick={onRemove}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-0 border-t border-border space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3">
            {/* Concentration */}
            <div>
              <Label className="text-xs">Concentration %</Label>
              {isEditing ? (
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={ingredient.concentration_percent || ""}
                  onChange={(e) =>
                    onUpdate({ concentration_percent: parseFloat(e.target.value) || null })
                  }
                  className="h-8 mt-1"
                />
              ) : (
                <p className="text-sm mt-1">
                  {ingredient.concentration_percent
                    ? `${ingredient.concentration_percent}%`
                    : "—"}
                </p>
              )}
            </div>

            {/* Origin */}
            <div>
              <Label className="text-xs">Origin</Label>
              {isEditing ? (
                <Select
                  value={ingredient.origin || ""}
                  onValueChange={(val) => onUpdate({ origin: val })}
                >
                  <SelectTrigger className="h-8 mt-1">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {INGREDIENT_ORIGINS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm mt-1">
                  {INGREDIENT_ORIGINS.find((o) => o.value === ingredient.origin)?.label || "—"}
                </p>
              )}
            </div>

            {/* Hero Ingredient */}
            <div className="flex items-center gap-2 pt-5">
              <Checkbox
                id={`hero-${ingredient.id}`}
                checked={ingredient.is_hero_ingredient}
                onCheckedChange={(checked) =>
                  isEditing && onUpdate({ is_hero_ingredient: !!checked })
                }
                disabled={!isEditing}
              />
              <Label htmlFor={`hero-${ingredient.id}`} className="text-xs">
                Hero Ingredient
              </Label>
            </div>

            {/* Highlight in Copy */}
            <div className="flex items-center gap-2 pt-5">
              <Checkbox
                id={`highlight-${ingredient.id}`}
                checked={ingredient.highlight_in_copy}
                onCheckedChange={(checked) =>
                  isEditing && onUpdate({ highlight_in_copy: !!checked })
                }
                disabled={!isEditing}
              />
              <Label htmlFor={`highlight-${ingredient.id}`} className="text-xs">
                Highlight in Copy
              </Label>
            </div>
          </div>

          {/* Role/Marketing Claim */}
          <div>
            <Label className="text-xs">Role in Product / Marketing Claim</Label>
            {isEditing ? (
              <Input
                value={ingredient.role_in_product || ingredient.marketing_claim || ""}
                onChange={(e) => onUpdate({ role_in_product: e.target.value })}
                placeholder="e.g., Provides deep hydration, Antioxidant protection"
                className="mt-1"
              />
            ) : (
              <p className="text-sm mt-1">
                {ingredient.role_in_product || ingredient.marketing_claim || "—"}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADD INGREDIENT DIALOG
// ═══════════════════════════════════════════════════════════════════════════════

interface AddIngredientDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: any) => void;
  onAddToLibrary: (data: any) => void;
}

function AddIngredientDialog({
  open,
  onClose,
  onAdd,
  onAddToLibrary,
}: AddIngredientDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mode, setMode] = useState<"search" | "manual">("search");

  // Manual entry state
  const [name, setName] = useState("");
  const [inciName, setInciName] = useState("");
  const [concentration, setConcentration] = useState("");
  const [origin, setOrigin] = useState<IngredientOrigin | "">("");
  const [isHero, setIsHero] = useState(false);
  const [addToLib, setAddToLib] = useState(false);

  const { data: libraryResults = [] } = useIngredientLibrary({
    query: searchQuery,
    enabled: open && mode === "search" && searchQuery.length > 1,
  });

  const handleSelectFromLibrary = (item: any) => {
    onAdd({
      ingredient_id: item.id,
      inci_name: item.inci_name,
      concentration_percent: concentration ? parseFloat(concentration) : undefined,
      origin: item.source || item.origin, // Use 'source' from library, fallback to 'origin'
    });
    resetForm();
  };

  const handleManualAdd = () => {
    if (!name.trim()) return;

    if (addToLib) {
      onAddToLibrary({
        name: name.trim(),
        inci_name: inciName.trim() || undefined,
        source: origin || undefined, // Use 'source' for library
      });
    }

    onAdd({
      custom_name: name.trim(),
      inci_name: inciName.trim() || name.trim(),
      concentration_percent: concentration ? parseFloat(concentration) : undefined,
      origin: origin || undefined,
      is_hero_ingredient: isHero,
    });

    resetForm();
  };

  const resetForm = () => {
    setSearchQuery("");
    setName("");
    setInciName("");
    setConcentration("");
    setOrigin("");
    setIsHero(false);
    setAddToLib(false);
    setMode("search");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={resetForm}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Ingredient</DialogTitle>
          <DialogDescription>
            Search your ingredient library or add manually
          </DialogDescription>
        </DialogHeader>

        {/* Mode Toggle */}
        <div className="flex gap-2 border-b border-border pb-4">
          <Button
            variant={mode === "search" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("search")}
          >
            <Search className="w-4 h-4 mr-2" />
            From Library
          </Button>
          <Button
            variant={mode === "manual" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("manual")}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Manually
          </Button>
        </div>

        {mode === "search" ? (
          <div className="space-y-4">
            <div>
              <Input
                placeholder="Search ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1">
              {libraryResults.length === 0 && searchQuery.length > 1 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <p>No ingredients found</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setMode("manual");
                      setName(searchQuery);
                    }}
                  >
                    Add "{searchQuery}" manually
                  </Button>
                </div>
              ) : (
                libraryResults.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectFromLibrary(item)}
                    className="w-full text-left p-3 rounded-md hover:bg-muted transition-colors"
                  >
                    <div className="font-medium">{item.name}</div>
                    {item.inci_name && (
                      <div className="text-xs text-muted-foreground">
                        INCI: {item.inci_name}
                      </div>
                    )}
                    <div className="flex gap-2 mt-1">
                      {(item.source || item.origin) && (
                        <Badge variant="outline" className="text-xs">
                          {INGREDIENT_ORIGINS.find((o) => o.value === (item.source || item.origin))?.label}
                        </Badge>
                      )}
                      {item.is_allergen && (
                        <Badge variant="outline" className="text-xs border-amber-500">
                          Allergen
                        </Badge>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Ingredient Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Hyaluronic Acid"
                  autoFocus
                />
              </div>

              <div className="col-span-2">
                <Label>INCI Name</Label>
                <Input
                  value={inciName}
                  onChange={(e) => setInciName(e.target.value)}
                  placeholder="e.g., SODIUM HYALURONATE"
                />
              </div>

              <div>
                <Label>Concentration %</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={concentration}
                  onChange={(e) => setConcentration(e.target.value)}
                  placeholder="e.g., 2.5"
                />
              </div>

              <div>
                <Label>Origin</Label>
                <Select value={origin} onValueChange={(val) => setOrigin(val as IngredientOrigin)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select origin" />
                  </SelectTrigger>
                  <SelectContent>
                    {INGREDIENT_ORIGINS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="hero"
                  checked={isHero}
                  onCheckedChange={(checked) => setIsHero(!!checked)}
                />
                <Label htmlFor="hero" className="text-sm">
                  Hero Ingredient
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="addToLib"
                  checked={addToLib}
                  onCheckedChange={(checked) => setAddToLib(!!checked)}
                />
                <Label htmlFor="addToLib" className="text-sm">
                  Add to Library
                </Label>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={resetForm}>
            Cancel
          </Button>
          {mode === "manual" && (
            <Button onClick={handleManualAdd} disabled={!name.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Ingredient
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
