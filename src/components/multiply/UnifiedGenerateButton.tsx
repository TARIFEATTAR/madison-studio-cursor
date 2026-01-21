/**
 * UnifiedGenerateButton
 *
 * Phase 1 component for the Multiply page UX redesign.
 * Single adaptive button that handles both content and visual generation.
 * Reduces cognitive load by eliminating the two-button confusion.
 */

import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UnifiedGenerateButtonProps {
    selectedContentCount: number;
    selectedVisualCount: number;
    isGenerating: boolean;
    onGenerate: () => void;
    className?: string;
}

export function UnifiedGenerateButton({
    selectedContentCount,
    selectedVisualCount,
    isGenerating,
    onGenerate,
    className,
}: UnifiedGenerateButtonProps) {
    const totalSelected = selectedContentCount + selectedVisualCount;
    const isDisabled = isGenerating || totalSelected === 0;

    // Build dynamic label
    const buildLabel = () => {
        if (isGenerating) return "Generating...";

        const parts: string[] = [];

        if (selectedContentCount > 0) {
            parts.push(`${selectedContentCount}`);
        }

        if (selectedVisualCount > 0) {
            if (selectedContentCount > 0) {
                return `Generate (${selectedContentCount} + visuals)`;
            }
            return `Generate ${selectedVisualCount} Visual${selectedVisualCount !== 1 ? "s" : ""}`;
        }

        if (selectedContentCount > 0) {
            return `Generate (${selectedContentCount} selected)`;
        }

        return "Generate";
    };

    return (
        <Button
            onClick={onGenerate}
            disabled={isDisabled}
            size="lg"
            className={cn(
                "gap-2 min-w-[200px] transition-all",
                "bg-aged-brass hover:bg-aged-brass/90 text-white",
                isDisabled && "opacity-50 cursor-not-allowed",
                className
            )}
        >
            {isGenerating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <Sparkles className="w-5 h-5" />
            )}
            <span className="font-medium">{buildLabel()}</span>
        </Button>
    );
}
