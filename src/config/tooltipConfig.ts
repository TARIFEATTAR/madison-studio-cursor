/**
 * Tooltip Configuration
 * 
 * Centralized configuration for all tooltip behavior and timing.
 * Adjust these values to A/B test different tooltip strategies.
 */

export const TOOLTIP_CONFIG = {
    /**
     * Delay before showing tooltip after page load (in milliseconds)
     * 
     * Default: 800ms
     * - Lower values (300-500ms): More immediate, but may feel intrusive
     * - Higher values (1000-1500ms): Gives users time to orient, but may be missed
     * 
     * A/B Test Recommendations:
     * - Variant A: 500ms (fast)
     * - Variant B: 800ms (default)
     * - Variant C: 1200ms (patient)
     */
    INITIAL_DELAY: 800,

    /**
     * Retry interval when searching for target element (in milliseconds)
     * 
     * Default: 500ms
     * Some elements may not be rendered immediately, so we retry finding them.
     */
    RETRY_INTERVAL: 500,

    /**
     * Maximum number of retries when searching for target element
     * 
     * Default: 10 retries (5 seconds total with 500ms interval)
     */
    MAX_RETRIES: 10,

    /**
     * Whether to show tooltips only once per user
     * 
     * Default: true
     * Set to false for testing or if you want tooltips to reappear
     */
    SHOW_ONCE: true,

    /**
     * Spotlight pulse animation duration (in seconds)
     * 
     * Default: 2s
     */
    PULSE_DURATION: 2,

    /**
     * Whether to enable analytics tracking
     * 
     * Default: true
     * Set to false to disable all analytics tracking
     */
    ENABLE_ANALYTICS: true,

    /**
     * How often to sync analytics to server (in milliseconds)
     * 
     * Default: 5 minutes (300000ms)
     */
    ANALYTICS_SYNC_INTERVAL: 5 * 60 * 1000,

    /**
     * Z-index layers for tooltip components
     */
    Z_INDEX: {
        BACKDROP: 999,
        SPOTLIGHT: 1000,
        TOOLTIP: 1001,
    },

    /**
     * Animation settings
     */
    ANIMATION: {
        FADE_IN_DURATION: 300, // milliseconds
        SLIDE_IN_OFFSET: 4, // pixels
    },

    /**
     * A/B Testing Variants
     * 
     * To enable A/B testing, set ENABLE_AB_TEST to true and
     * users will be randomly assigned to a variant.
     */
    AB_TEST: {
        ENABLED: false,
        VARIANTS: {
            A: {
                name: "Fast",
                INITIAL_DELAY: 500,
            },
            B: {
                name: "Default",
                INITIAL_DELAY: 800,
            },
            C: {
                name: "Patient",
                INITIAL_DELAY: 1200,
            },
        },
    },
};

/**
 * Get the active tooltip configuration
 * 
 * If A/B testing is enabled, this will return the variant
 * assigned to the current user. Otherwise, returns default config.
 */
export function getTooltipConfig() {
    if (!TOOLTIP_CONFIG.AB_TEST.ENABLED) {
        return TOOLTIP_CONFIG;
    }

    // Check if user already has a variant assigned
    const assignedVariant = localStorage.getItem("tooltip_ab_variant");

    if (assignedVariant && TOOLTIP_CONFIG.AB_TEST.VARIANTS[assignedVariant as keyof typeof TOOLTIP_CONFIG.AB_TEST.VARIANTS]) {
        const variant = TOOLTIP_CONFIG.AB_TEST.VARIANTS[assignedVariant as keyof typeof TOOLTIP_CONFIG.AB_TEST.VARIANTS];
        return {
            ...TOOLTIP_CONFIG,
            ...variant,
        };
    }

    // Randomly assign a variant
    const variants = Object.keys(TOOLTIP_CONFIG.AB_TEST.VARIANTS);
    const randomVariant = variants[Math.floor(Math.random() * variants.length)];
    localStorage.setItem("tooltip_ab_variant", randomVariant);
    localStorage.setItem("tooltip_ab_variant_name", TOOLTIP_CONFIG.AB_TEST.VARIANTS[randomVariant as keyof typeof TOOLTIP_CONFIG.AB_TEST.VARIANTS].name);

    const variant = TOOLTIP_CONFIG.AB_TEST.VARIANTS[randomVariant as keyof typeof TOOLTIP_CONFIG.AB_TEST.VARIANTS];
    return {
        ...TOOLTIP_CONFIG,
        ...variant,
    };
}

/**
 * Get the user's A/B test variant (if any)
 */
export function getABTestVariant() {
    if (!TOOLTIP_CONFIG.AB_TEST.ENABLED) {
        return null;
    }

    return {
        id: localStorage.getItem("tooltip_ab_variant"),
        name: localStorage.getItem("tooltip_ab_variant_name"),
    };
}
