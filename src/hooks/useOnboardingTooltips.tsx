import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { useLocation } from "react-router-dom";

interface TooltipStep {
    id: string;
    route: string; // Which route this tooltip should appear on
    targetSelector: string;
    title: string;
    description: string;
    position?: "top" | "bottom" | "left" | "right";
    triggerOnChecklistTask?: string; // Which checklist task triggers this
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function useOnboardingTooltips() {
    const { user } = useAuth();
    const location = useLocation();
    const [activeTooltip, setActiveTooltip] = useState<TooltipStep | null>(null);

    // Define all tooltip steps in the onboarding tour
    const tooltipSteps: TooltipStep[] = [
        {
            id: "library_content_type_filter",
            route: "/library",
            targetSelector: '[data-tooltip-target="content-type-filter"]', // You'll need to add this data attribute to your filter dropdown
            title: "Explore Content Types",
            description: "Click this dropdown to see how your content is organized by type. You can filter by Social Posts, Blog Articles, Product Descriptions, and more.",
            position: "bottom",
            triggerOnChecklistTask: "explore_library",
        },
        {
            id: "library_search",
            route: "/library",
            targetSelector: '[data-tooltip-target="library-search"]',
            title: "Search Your Archive",
            description: "Use the search bar to quickly find any piece of content. Search by title, keywords, or content type.",
            position: "bottom",
            triggerOnChecklistTask: "explore_library",
        },
        {
            id: "calendar_schedule_button",
            route: "/calendar",
            targetSelector: '[data-tooltip-target="schedule-button"]',
            title: "Schedule Your Content",
            description: "Click here to schedule a post for publishing. You can set the date, time, and platform.",
            position: "left",
            triggerOnChecklistTask: "schedule_content",
        },
        {
            id: "brand_builder_voice",
            route: "/brand-builder",
            targetSelector: '[data-tooltip-target="brand-voice"]',
            title: "Define Your Brand Voice",
            description: "Customize your brand's tone, style, and personality. Madison will use this to ensure all content stays on-brand.",
            position: "right",
            triggerOnChecklistTask: "customize_brand",
        },
        {
            id: "multiply_master_content",
            route: "/multiply",
            targetSelector: '[data-tooltip-target="master-content-selector"]',
            title: "Select Master Content",
            description: "Choose a piece of content to multiply into different formats. One blog post can become social posts, emails, and more.",
            position: "bottom",
            triggerOnChecklistTask: "try_multiply",
        },
        {
            id: "editor_refine_content",
            route: "/editor",
            targetSelector: '[data-tooltip-target="content-editor-area"]',
            title: "Refine Your Content",
            description: "You can edit and refine your generated content here. Make it perfect before you multiply it into social posts and emails.",
            position: "top",
            triggerOnChecklistTask: "create_first_content",
        },
    ];

    useEffect(() => {
        if (!user) return;

        // Get checklist progress to know which task was just completed
        const checklistProgress = localStorage.getItem(`checklist_progress_${user.id}`);
        if (!checklistProgress) return;

        const progress = JSON.parse(checklistProgress);

        // Find tooltips for current route that should be shown
        const currentRouteTooltips = tooltipSteps.filter(
            (step) => step.route === location.pathname
        );

        // Check if any tooltip should be triggered based on recently completed tasks
        for (const tooltip of currentRouteTooltips) {
            if (tooltip.triggerOnChecklistTask) {
                const taskCompleted = progress[tooltip.triggerOnChecklistTask];
                const tooltipShown = localStorage.getItem(`tooltip_shown_${tooltip.id}`);

                // Show tooltip if task was just completed and tooltip hasn't been shown
                if (taskCompleted && !tooltipShown) {
                    // Small delay to let page render
                    setTimeout(() => {
                        setActiveTooltip(tooltip);
                    }, 800);
                    break; // Only show one tooltip at a time
                }
            }
        }
    }, [location.pathname, user]);

    const dismissTooltip = () => {
        setActiveTooltip(null);
    };

    const completeTooltip = () => {
        if (activeTooltip) {
            localStorage.setItem(`tooltip_shown_${activeTooltip.id}`, "true");
        }
        setActiveTooltip(null);
    };

    return {
        activeTooltip,
        dismissTooltip,
        completeTooltip,
    };
}
