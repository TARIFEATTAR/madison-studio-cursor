import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Sparkles, Loader2 } from "lucide-react";

interface DerivativeType {
  id: string;
  name: string;
  description: string;
  icon: any;
  iconColor: string;
  charLimit?: number;
  isSequence?: boolean;
  iconImage?: string;
}

interface DerivativeTypeSelectorProps {
  topTypes: DerivativeType[];
  additionalTypes: DerivativeType[];
  selectedTypes: Set<string>;
  onToggleType: (typeId: string) => void;
  onSelectAll: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
  showMoreOptions: boolean;
  onToggleMoreOptions: (open: boolean) => void;
}

export function DerivativeTypeSelector({
  topTypes,
  additionalTypes,
  selectedTypes,
  onToggleType,
  onSelectAll,
  onGenerate,
  isGenerating,
  showMoreOptions,
  onToggleMoreOptions,
}: DerivativeTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Select derivative types to generate:</h3>
      
      {/* Most Popular */}
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-3">MOST POPULAR</p>
        <div className="grid grid-cols-3 gap-3">
          {topTypes.map((type) => (
            <Card 
              key={type.id} 
              onClick={() => onToggleType(type.id)} 
              className={`p-4 cursor-pointer transition-all hover:shadow-md ${selectedTypes.has(type.id) ? "ring-2 ring-brass bg-brass/5" : ""}`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <Checkbox checked={selectedTypes.has(type.id)} className="mt-1" />
                  {type.iconImage ? (
                    <img src={type.iconImage} alt={type.name} className="w-8 h-8" />
                  ) : type.icon && (
                    <type.icon className="w-8 h-8" style={{ color: type.iconColor }} />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-sm">{type.name}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{type.description}</p>
                  {type.charLimit && (
                    <p className="text-xs text-muted-foreground mt-1">Max: {type.charLimit} chars</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* More Options - Collapsible */}
      <Collapsible open={showMoreOptions} onOpenChange={onToggleMoreOptions}>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          {showMoreOptions ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          MORE OPTIONS
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <div className="grid grid-cols-3 gap-3">
            {additionalTypes.map((type) => (
              <Card 
                key={type.id} 
                onClick={() => onToggleType(type.id)} 
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${selectedTypes.has(type.id) ? "ring-2 ring-brass bg-brass/5" : ""}`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <Checkbox checked={selectedTypes.has(type.id)} className="mt-1" />
                    {type.iconImage ? (
                      <img src={type.iconImage} alt={type.name} className="w-8 h-8" />
                    ) : type.icon && (
                      <type.icon className="w-8 h-8" style={{ color: type.iconColor }} />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{type.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">{type.description}</p>
                    {type.charLimit && (
                      <p className="text-xs text-muted-foreground mt-1">Max: {type.charLimit} chars</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" size="sm" onClick={onSelectAll}>
          Select All
        </Button>
        <Button 
          onClick={onGenerate} 
          disabled={isGenerating || selectedTypes.size === 0} 
          size="lg" 
          className="gap-2"
        >
          {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {isGenerating ? "Generating..." : `Generate ${selectedTypes.size} Derivative${selectedTypes.size !== 1 ? "s" : ""}`}
        </Button>
      </div>
    </div>
  );
}
