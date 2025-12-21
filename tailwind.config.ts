import type { Config } from "tailwindcss";
import { DesignTokens } from "./src/design/tokens";
import tailwindcssAnimate from "tailwindcss-animate";
import tailwindcssTypography from "@tailwindcss/typography";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // ═══════════════════════════════════════════════════════════════
      // COLORS - Imported from Design Tokens + Shadcn/UI CSS Variables
      // ═══════════════════════════════════════════════════════════════
      colors: {
        // Shadcn/UI semantic tokens (mapped via CSS variables in index.css)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // ───────────────────────────────────────────────────────────────
        // BRAND PALETTE - From Design Tokens (Single Source of Truth)
        // ───────────────────────────────────────────────────────────────
        brand: {
          ink: DesignTokens.colors.neutral.ink,
          charcoal: DesignTokens.colors.neutral.charcoal,
          vellum: DesignTokens.colors.neutral.vellum,
          parchment: DesignTokens.colors.neutral.parchment,
          brass: DesignTokens.colors.brand.brass,
          stone: DesignTokens.colors.support.stone,
        },
        brass: {
          light: '#D4AF37', // Classic gold/brass
          DEFAULT: '#B59410',
          dark: '#7A6305',
        },
        steel: {
          light: '#E5E7EB',
          DEFAULT: '#9CA3AF',
          dark: '#4B5563',
        },

        // ───────────────────────────────────────────────────────────────
        // LEGACY / COMPATIBILITY ALIASES (For existing code)
        // ───────────────────────────────────────────────────────────────
        'ink-black': {
          DEFAULT: DesignTokens.colors.neutral.ink,
        },
        'charcoal': {
          DEFAULT: DesignTokens.colors.neutral.charcoal,
        },
        'vellum-cream': {
          DEFAULT: DesignTokens.colors.neutral.vellum,
        },
        'parchment-white': {
          DEFAULT: DesignTokens.colors.neutral.parchment,
        },
        'aged-brass': {
          DEFAULT: DesignTokens.colors.brand.brass,
        },
        'brass-glow': {
          DEFAULT: DesignTokens.colors.brand.brass,
        },

        // ───────────────────────────────────────────────────────────────
        // FUNCTIONAL COLORS - From Design Tokens
        // ───────────────────────────────────────────────────────────────
        'muted-sage': {
          DEFAULT: DesignTokens.colors.semantic.success,
        },
        'aged-amber': {
          DEFAULT: DesignTokens.colors.semantic.warning,
        },
        'faded-rust': {
          DEFAULT: DesignTokens.colors.semantic.error,
        },

        // ───────────────────────────────────────────────────────────────
        // FORM/UI SUPPORT COLOR - From Design Tokens
        // ───────────────────────────────────────────────────────────────
        'stone': {
          DEFAULT: DesignTokens.colors.support.stone,
          dark: DesignTokens.colors.support['stone-dark'],
        },

        // ───────────────────────────────────────────────────────────────
        // PLATFORM BADGES - From Design Tokens
        // ───────────────────────────────────────────────────────────────
        'derivative-email': {
          DEFAULT: DesignTokens.colors.platform.email,
        },
        'derivative-instagram': {
          DEFAULT: DesignTokens.colors.platform.instagram,
        },
        'derivative-twitter': {
          DEFAULT: DesignTokens.colors.platform.twitter,
        },
        'derivative-product': {
          DEFAULT: DesignTokens.colors.platform.product,
        },
        'derivative-sms': {
          DEFAULT: DesignTokens.colors.platform.sms,
        },
        'derivative-blog': {
          DEFAULT: DesignTokens.colors.platform.blog,
        },
        'derivative-linkedin': {
          DEFAULT: DesignTokens.colors.platform.linkedin,
        },

        // Platform colors object for direct access
        platform: DesignTokens.colors.platform,
      },

      // ═══════════════════════════════════════════════════════════════
      // TYPOGRAPHY - From Design Tokens
      // ═══════════════════════════════════════════════════════════════
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Lato', '-apple-system', 'system-ui', 'sans-serif'],
        accent: ['Crimson Text', 'Georgia', 'serif'],
      },
      fontSize: {
        'tiny': '0.6875rem', // 11px - legacy
        ...DesignTokens.typography.sizes,
      },
      fontWeight: DesignTokens.typography.weights,
      lineHeight: DesignTokens.typography.leading,

      // ═══════════════════════════════════════════════════════════════
      // SHADOWS - From Design Tokens (via CSS variables for complex shadows)
      // ═══════════════════════════════════════════════════════════════
      boxShadow: {
        'level-1': 'var(--shadow-level-1)',
        'level-2': 'var(--shadow-level-2)',
        'level-3': 'var(--shadow-level-3)',
        'level-4': 'var(--shadow-level-4)',
        'brass-glow': 'var(--shadow-brass-glow)',
      },

      // ═══════════════════════════════════════════════════════════════
      // BORDERS - From Design Tokens
      // ═══════════════════════════════════════════════════════════════
      borderRadius: {
        ...DesignTokens.borders.radius,
      },
      borderWidth: DesignTokens.borders.width,

      // ═══════════════════════════════════════════════════════════════
      // SPACING - From Design Tokens
      // ═══════════════════════════════════════════════════════════════
      spacing: DesignTokens.spacing,

      // ═══════════════════════════════════════════════════════════════
      // ANIMATIONS - From Design Tokens
      // ═══════════════════════════════════════════════════════════════
      transitionDuration: DesignTokens.animations.duration,
      transitionTimingFunction: {
        ...DesignTokens.animations.easing,
        'vault-mechanism': 'cubic-bezier(0.25, 1, 0.5, 1)',
      },

      // ═══════════════════════════════════════════════════════════════
      // Z-INDEX - From Design Tokens
      // ═══════════════════════════════════════════════════════════════
      zIndex: DesignTokens.zIndex,

      // ═══════════════════════════════════════════════════════════════
      // KEYFRAMES & ANIMATIONS (Component-specific)
      // ═══════════════════════════════════════════════════════════════
      keyframes: {
        "accordion-down": {
          from: { height: "0", opacity: "0" },
          to: { height: "var(--radix-accordion-content-height)", opacity: "1" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)", opacity: "1" },
          to: { height: "0", opacity: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(10px)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "modal-fade-in": {
          from: { opacity: "0", transform: "scale(0.95) translateY(10px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 400ms cubic-bezier(0.4, 0, 0.2, 1)",
        "accordion-up": "accordion-up 400ms cubic-bezier(0.4, 0, 0.2, 1)",
        "fade-in": "fade-in 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        "fade-out": "fade-out 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        "scale-in": "scale-in 200ms cubic-bezier(0.4, 0, 0.2, 1)",
        "modal-enter": "modal-fade-in 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        "shimmer": "shimmer 1.5s infinite",
      },

      // ═══════════════════════════════════════════════════════════════
      // BACKGROUND IMAGES
      // ═══════════════════════════════════════════════════════════════
      backgroundImage: {
        'brass-gradient': DesignTokens.colors.brand['brass-gradient'],
      },
    },
  },
  plugins: [tailwindcssAnimate, tailwindcssTypography],
} satisfies Config;
