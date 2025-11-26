import { useEffect, useState } from "react";
import { X, ArrowRight, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTooltipAnalytics } from "@/hooks/useTooltipAnalytics";
import { getTooltipConfig } from "@/config/tooltipConfig";

interface ContextualTooltipProps {
    id: string;
    targetSelector: string; // CSS selector for the element to highlight
    title: string;
    description: string;
    position?: "top" | "bottom" | "left" | "right";
    action?: {
        label: string;
        onClick: () => void;
    };
    onDismiss: () => void;
    onComplete?: () => void;
    showOnce?: boolean; // Only show once per user
}

export function ContextualTooltip({
    id,
    targetSelector,
    title,
    description,
    position = "bottom",
    action,
    onDismiss,
    onComplete,
    showOnce = true,
}: ContextualTooltipProps) {
    const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const [isVisible, setIsVisible] = useState(false);
    const { trackView, trackDismiss, trackComplete, trackActionClick } = useTooltipAnalytics();

    useEffect(() => {
        // Check if tooltip has been shown before
        if (showOnce) {
            const hasBeenShown = localStorage.getItem(`tooltip_shown_${id}`);
            if (hasBeenShown) {
                return;
            }
        }

        // Get configuration
        const config = getTooltipConfig();

        // Find target element with retry logic (element might not be rendered yet)
        let retryCount = 0;
        const maxRetries = config.MAX_RETRIES;
        const retryInterval = config.RETRY_INTERVAL;

        const findTarget = () => {
            const element = document.querySelector(targetSelector) as HTMLElement;
            if (element) {
                setTargetElement(element);
                setIsVisible(true);
                calculatePosition(element);

                // Track that tooltip was viewed
                trackView(id, { targetSelector, position });
            } else if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(findTarget, retryInterval);
            }
        };

        // Start looking for target after configured delay
        const initialDelay = setTimeout(findTarget, config.INITIAL_DELAY);

        return () => {
            clearTimeout(initialDelay);
        };
    }, [targetSelector, id, showOnce]);

    const calculatePosition = (element: HTMLElement) => {
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        let top = 0;
        let left = 0;

        switch (position) {
            case "bottom":
                top = rect.bottom + scrollTop + 12;
                left = rect.left + scrollLeft + rect.width / 2;
                break;
            case "top":
                top = rect.top + scrollTop - 12;
                left = rect.left + scrollLeft + rect.width / 2;
                break;
            case "left":
                top = rect.top + scrollTop + rect.height / 2;
                left = rect.left + scrollLeft - 12;
                break;
            case "right":
                top = rect.top + scrollTop + rect.height / 2;
                left = rect.right + scrollLeft + 12;
                break;
        }

        setTooltipPosition({ top, left });
    };

    const handleDismiss = () => {
        if (showOnce) {
            localStorage.setItem(`tooltip_shown_${id}`, "true");
        }
        trackDismiss(id, { targetSelector });
        setIsVisible(false);
        onDismiss();
    };

    const handleComplete = () => {
        if (showOnce) {
            localStorage.setItem(`tooltip_shown_${id}`, "true");
        }
        trackComplete(id, { targetSelector });
        setIsVisible(false);
        onComplete?.();
    };

    useEffect(() => {
        if (targetElement && isVisible) {
            // Add highlight effect to target element
            targetElement.classList.add("tooltip-highlight");

            // Add pulsing animation
            targetElement.style.position = "relative";
            targetElement.style.zIndex = "1000";

            return () => {
                targetElement.classList.remove("tooltip-highlight");
                targetElement.style.zIndex = "";
            };
        }
    }, [targetElement, isVisible]);

    if (!isVisible || !targetElement) {
        return null;
    }

    return (
        <>
            {/* Backdrop overlay */}
            <div
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[999]"
                onClick={handleDismiss}
            />

            {/* Spotlight effect on target element */}
            <div
                className="fixed z-[1000] pointer-events-none"
                style={{
                    top: targetElement.getBoundingClientRect().top - 4,
                    left: targetElement.getBoundingClientRect().left - 4,
                    width: targetElement.getBoundingClientRect().width + 8,
                    height: targetElement.getBoundingClientRect().height + 8,
                    boxShadow: "0 0 0 4px rgba(184, 149, 106, 0.4), 0 0 0 9999px rgba(0, 0, 0, 0.5)",
                    borderRadius: "8px",
                    animation: "pulse 2s ease-in-out infinite",
                }}
            />

            {/* Tooltip card */}
            <Card
                className={cn(
                    "fixed z-[1001] max-w-sm bg-card border-primary/40 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300",
                    position === "bottom" && "slide-in-from-top-4",
                    position === "top" && "slide-in-from-bottom-4",
                    position === "left" && "slide-in-from-right-4",
                    position === "right" && "slide-in-from-left-4"
                )}
                style={{
                    top: position === "bottom" || position === "top"
                        ? `${tooltipPosition.top}px`
                        : `${tooltipPosition.top}px`,
                    left: position === "bottom" || position === "top"
                        ? `${tooltipPosition.left}px`
                        : `${tooltipPosition.left}px`,
                    transform: position === "bottom" || position === "top"
                        ? "translateX(-50%)"
                        : position === "left"
                            ? "translateX(-100%) translateY(-50%)"
                            : "translateY(-50%)",
                }}
            >
                <div className="p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 text-base leading-tight">
                            {title}
                        </h3>
                        <button
                            onClick={handleDismiss}
                            className="flex-shrink-0 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </button>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-700 leading-relaxed">
                        {description}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                        {action && (
                            <Button
                                onClick={() => {
                                    trackActionClick(id, action.label, { targetSelector });
                                    action.onClick();
                                    handleComplete();
                                }}
                                size="sm"
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                {action.label}
                                <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                        )}
                        <Button
                            onClick={handleComplete}
                            variant="ghost"
                            size="sm"
                            className="text-gray-700"
                        >
                            <Check className="w-3 h-3 mr-1" />
                            Got it
                        </Button>
                    </div>
                </div>

                {/* Arrow pointer */}
                <div
                    className={cn(
                        "absolute w-3 h-3 bg-card border-primary/40 rotate-45",
                        position === "bottom" && "-top-1.5 left-1/2 -translate-x-1/2 border-t border-l",
                        position === "top" && "-bottom-1.5 left-1/2 -translate-x-1/2 border-b border-r",
                        position === "left" && "-right-1.5 top-1/2 -translate-y-1/2 border-t border-r",
                        position === "right" && "-left-1.5 top-1/2 -translate-y-1/2 border-b border-l"
                    )}
                />
            </Card>

            {/* Add CSS for pulse animation */}
            <style>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(184, 149, 106, 0.4), 0 0 0 9999px rgba(0, 0, 0, 0.5);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(184, 149, 106, 0.6), 0 0 0 9999px rgba(0, 0, 0, 0.5);
          }
        }
        
        .tooltip-highlight {
          animation: highlight-pulse 2s ease-in-out infinite;
        }
        
        @keyframes highlight-pulse {
          0%, 100% {
            filter: brightness(1);
          }
          50% {
            filter: brightness(1.1);
          }
        }
      `}</style>
        </>
    );
}
