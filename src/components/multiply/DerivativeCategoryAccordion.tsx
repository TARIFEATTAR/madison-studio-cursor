/**
 * DerivativeCategoryAccordion
 *
 * Phase 2 component for the Multiply page UX redesign.
 * Groups 12+ derivative types into 3 mental categories to reduce decision paralysis.
 * Uses accordion pattern - only one category open at a time.
 */

import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface DerivativeType {
    id: string;
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> | null;
    iconColor: string;
    charLimit?: number;
    isSequence?: boolean;
    iconImage?: string;
}

interface CategoryConfig {
    id: string;
    icon: string;
    label: string;
    description: string;
    typeIds: string[];
}

// Category groupings per UX spec
const DERIVATIVE_CATEGORIES: CategoryConfig[] = [
    {
        id: "social",
        icon: "📱",
        label: "Social Media",
        description: "Instagram, LinkedIn, Facebook, Pinterest, TikTok",
        typeIds: ["instagram", "linkedin", "facebook", "pinterest", "tiktok"],
    },
    {
        id: "email",
        icon: "✉️",
        label: "Email",
        description: "Single Email, 3-Part, 5-Part, 7-Part Sequences",
        typeIds: ["email", "email_3part", "email_5part", "email_7part"],
    },
    {
        id: "commerce",
        icon: "🛍️",
        label: "Product & Commerce",
        description: "Product Description, SMS, YouTube Description",
        typeIds: ["product", "sms", "youtube"],
    },
];

interface DerivativeCategoryAccordionProps {
    allTypes: DerivativeType[];
    selectedTypes: Set<string>;
    onToggleType: (typeId: string) => void;
    className?: string;
}

export function DerivativeCategoryAccordion({
    allTypes,
    selectedTypes,
    onToggleType,
    className,
}: DerivativeCategoryAccordionProps) {
    // Build a map of typeId -> DerivativeType for quick lookup
    const typeMap = new Map(allTypes.map((t) => [t.id, t]));

    return (
        <Accordion type="single" collapsible className={cn("space-y-2", className)}>
            {DERIVATIVE_CATEGORIES.map((category) => {
                // Get the types that exist in this category
                const categoryTypes = category.typeIds
                    .map((id) => typeMap.get(id))
                    .filter(Boolean) as DerivativeType[];

                // Count selected in this category
                const selectedCount = category.typeIds.filter((id) =>
                    selectedTypes.has(id)
                ).length;

                return (
                    <AccordionItem
                        key={category.id}
                        value={category.id}
                        className="border rounded-lg overflow-hidden"
                    >
                        <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 hover:no-underline [&[data-state=open]]:bg-muted/30">
                            <div className="flex items-center gap-3 flex-1 text-left">
                                <span className="text-xl">{category.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-serif font-medium">
                                            {category.label}
                                        </span>
                                        {selectedCount > 0 && (
                                            <Badge
                                                variant="secondary"
                                                className="bg-aged-brass/20 text-aged-brass border-aged-brass/30"
                                            >
                                                {selectedCount} selected
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {category.description}
                                    </p>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4 pt-2">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {categoryTypes.map((type) => {
                                    const Icon = type.icon;
                                    const isSelected = selectedTypes.has(type.id);

                                    return (
                                        <Card
                                            key={type.id}
                                            onClick={() => onToggleType(type.id)}
                                            className={cn(
                                                "p-3 cursor-pointer transition-all hover:shadow-md",
                                                isSelected && "ring-2 ring-aged-brass bg-aged-brass/5"
                                            )}
                                        >
                                            <div className="space-y-2">
                                                <div className="flex items-start justify-between">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => onToggleType(type.id)}
                                                        className="mt-1"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                    {type.iconImage ? (
                                                        <img
                                                            src={type.iconImage}
                                                            alt={type.name}
                                                            className="w-7 h-7"
                                                        />
                                                    ) : Icon ? (
                                                        <Icon
                                                            className="w-7 h-7"
                                                            style={{ color: type.iconColor }}
                                                        />
                                                    ) : null}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-sm">{type.name}</h4>
                                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                                        {type.description}
                                                    </p>
                                                    {type.charLimit && (
                                                        <p className="text-xs text-muted-foreground/70 mt-1">
                                                            Max: {type.charLimit.toLocaleString()} chars
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                );
            })}
        </Accordion>
    );
}

// Export categories for use in other components
export { DERIVATIVE_CATEGORIES };
