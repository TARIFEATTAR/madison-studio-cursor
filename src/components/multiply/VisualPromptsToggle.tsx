/**
 * VisualPromptsToggle
 *
 * Phase 1 component for the Multiply page UX redesign.
 * Simplifies the Visual Prompts section into a collapsible toggle.
 * Reduces initial cognitive load while preserving all functionality.
 */

import { useState } from "react";
import { ImageIcon, Film, Layers, ChevronDown, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface VisualType {
    id: string;
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    iconColor: string;
}

const VISUAL_TYPES: VisualType[] = [
    {
        id: "image_pack",
        name: "Image Pack",
        description: "Hero + Social + Email image prompts",
        icon: ImageIcon,
        iconColor: "#B8956A",
    },
    {
        id: "video_script",
        name: "Video Script",
        description: "AI video prompts for multiple formats",
        icon: Film,
        iconColor: "#9333EA",
    },
    {
        id: "product_backgrounds",
        name: "Product Backgrounds",
        description: "Scene prompts for product photography",
        icon: Layers,
        iconColor: "#059669",
    },
];

interface VisualPromptsToggleProps {
    selectedTypes: Set<string>;
    onToggleType: (typeId: string) => void;
    className?: string;
}

export function VisualPromptsToggle({
    selectedTypes,
    onToggleType,
    className,
}: VisualPromptsToggleProps) {
    const [isEnabled, setIsEnabled] = useState(selectedTypes.size > 0);

    const handleToggleEnabled = (checked: boolean) => {
        setIsEnabled(checked);
        // If disabling, clear all visual selections
        if (!checked) {
            selectedTypes.forEach((typeId) => {
                onToggleType(typeId);
            });
        }
    };

    const selectedCount = selectedTypes.size;

    return (
        <div className={cn("space-y-3", className)}>
            {/* Main Toggle */}
            <div
                className={cn(
                    "flex items-center justify-between p-4 rounded-lg border transition-colors cursor-pointer",
                    isEnabled
                        ? "border-aged-brass/50 bg-aged-brass/5"
                        : "border-border hover:border-muted-foreground/30"
                )}
                onClick={() => handleToggleEnabled(!isEnabled)}
            >
                <div className="flex items-center gap-3">
                    <Checkbox
                        checked={isEnabled}
                        onCheckedChange={handleToggleEnabled}
                        className="mt-0.5"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">Include Visual Prompts</span>
                            {selectedCount > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                    {selectedCount} selected
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Generate Image Pack, Video Script, or Product Backgrounds
                        </p>
                    </div>
                </div>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-[200px]">
                        <p className="text-xs">
                            Visual prompts generate AI image descriptions optimized for DALL-E,
                            Midjourney, or your preferred image generator.
                        </p>
                    </TooltipContent>
                </Tooltip>
            </div>

            {/* Visual Type Cards - Shown when enabled */}
            <Collapsible open={isEnabled}>
                <CollapsibleContent>
                    <div className="grid grid-cols-3 gap-3 pt-2">
                        {VISUAL_TYPES.map((type) => {
                            const Icon = type.icon;
                            const isSelected = selectedTypes.has(type.id);

                            return (
                                <Card
                                    key={type.id}
                                    onClick={() => onToggleType(type.id)}
                                    className={cn(
                                        "p-3 cursor-pointer transition-all hover:shadow-md",
                                        isSelected && "ring-2 ring-primary bg-primary/5"
                                    )}
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-start justify-between">
                                            <Checkbox
                                                checked={isSelected}
                                                className="mt-1"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <Icon
                                                className="w-7 h-7"
                                                style={{ color: type.iconColor }}
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-sm">{type.name}</h4>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {type.description}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}
