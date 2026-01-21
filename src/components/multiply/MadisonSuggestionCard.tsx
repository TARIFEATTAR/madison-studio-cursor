/**
 * MadisonSuggestionCard
 *
 * Phase 3 component for the Multiply page UX redesign.
 * Provides AI-guided one-click path for users who don't know what they want.
 * Surfaces existing Smart Amplify analysis in a user-friendly format.
 */

import { useState } from "react";
import { Sparkles, Check, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface SuggestedType {
    id: string;
    name: string;
    reason: string;
}

interface MadisonSuggestionCardProps {
    contentTitle: string;
    contentType?: string;
    suggestions: SuggestedType[];
    onUseSuggestions: (typeIds: string[]) => void;
    isLoading?: boolean;
    className?: string;
}

// Default suggestions based on content type
const DEFAULT_SUGGESTIONS: Record<string, SuggestedType[]> = {
    "Blog Post": [
        { id: "instagram", name: "Instagram Carousel", reason: "High visual appeal for this topic" },
        { id: "email_3part", name: "3-Part Email Sequence", reason: "Perfect for nurturing your list" },
        { id: "linkedin", name: "LinkedIn Post", reason: "Matches professional audience" },
    ],
    "Product Description": [
        { id: "email", name: "Email", reason: "Direct product announcement" },
        { id: "instagram", name: "Instagram", reason: "Visual product showcase" },
        { id: "sms", name: "SMS", reason: "Quick promotional reach" },
    ],
    "Newsletter": [
        { id: "linkedin", name: "LinkedIn", reason: "Professional thought leadership" },
        { id: "facebook", name: "Facebook", reason: "Community engagement" },
        { id: "instagram", name: "Instagram", reason: "Visual story excerpt" },
    ],
    default: [
        { id: "instagram", name: "Instagram", reason: "Wide audience reach" },
        { id: "email_3part", name: "3-Part Email Sequence", reason: "Engage your subscribers" },
        { id: "linkedin", name: "LinkedIn", reason: "Professional visibility" },
    ],
};

export function MadisonSuggestionCard({
    contentTitle,
    contentType,
    suggestions,
    onUseSuggestions,
    isLoading = false,
    className,
}: MadisonSuggestionCardProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    // Use provided suggestions or fall back to defaults
    const displaySuggestions =
        suggestions.length > 0
            ? suggestions
            : DEFAULT_SUGGESTIONS[contentType || ""] || DEFAULT_SUGGESTIONS.default;

    const handleUsePicks = () => {
        const typeIds = displaySuggestions.map((s) => s.id);
        onUseSuggestions(typeIds);

        // Scroll to generate button
        setTimeout(() => {
            const generateBtn = document.querySelector('[data-generate-button]');
            if (generateBtn) {
                generateBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    };

    return (
        <Card
            className={cn(
                "overflow-hidden border-aged-brass/30 bg-gradient-to-br from-aged-brass/5 to-transparent",
                className
            )}
        >
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-aged-brass/5 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-aged-brass/20 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-aged-brass" />
                            </div>
                            <div>
                                <h3 className="font-serif font-medium text-lg">
                                    Madison's Suggestion
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    AI-recommended derivatives for your content
                                </p>
                            </div>
                        </div>
                        <ChevronDown
                            className={cn(
                                "w-5 h-5 text-muted-foreground transition-transform",
                                isExpanded && "rotate-180"
                            )}
                        />
                    </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <CardContent className="pt-0 pb-4 px-4">
                        <div className="border-t pt-4">
                            <p className="text-sm text-muted-foreground mb-4">
                                Based on{" "}
                                <span className="font-medium text-foreground">
                                    {contentTitle || "your content"}
                                </span>
                                , I recommend:
                            </p>

                            <ul className="space-y-3 mb-6">
                                {displaySuggestions.map((suggestion) => (
                                    <li key={suggestion.id} className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-aged-brass/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Check className="w-3 h-3 text-aged-brass" />
                                        </div>
                                        <div>
                                            <span className="font-medium text-sm">
                                                {suggestion.name}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                {" "}
                                                — {suggestion.reason}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                onClick={handleUsePicks}
                                disabled={isLoading}
                                className="w-full gap-2 bg-aged-brass hover:bg-aged-brass/90"
                            >
                                <Check className="w-4 h-4" />
                                Use Madison's Picks
                            </Button>

                            <p className="text-xs text-center text-muted-foreground mt-3">
                                Or choose your own below ↓
                            </p>
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}

// Export default suggestions for testing/preview
export { DEFAULT_SUGGESTIONS };
