import type { Config } from "tailwindcss";

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
      fontSize: {
        'xxs': '0.625rem',    // 10px
        'tiny': '0.6875rem',  // 11px
      },
      colors: {
        // ═══════════════════════════════════════════════════════════════
        // MADISON STUDIO - THE CODEX DESIGN SYSTEM
        // Core Palette: 6 colors + 3 functional + minimal platform badges
        // Philosophy: Elegant restraint, Madison Avenue sophistication
        // ═══════════════════════════════════════════════════════════════
        
        // Shadcn/UI semantic tokens (mapped to Madison palette)
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
        // CORE NEUTRALS (4 colors)
        // ───────────────────────────────────────────────────────────────
        'ink-black': {
          DEFAULT: '#1A1816',           // Primary text, headers, high contrast
          hsl: '30 3% 10%',
        },
        'charcoal': {
          DEFAULT: '#2F2A26',           // Secondary text, supporting elements
          hsl: '20 8% 17%',
        },
        'vellum-cream': {
          DEFAULT: '#F5F1E8',           // Primary background (the "paper")
          hsl: '42 38% 93%',
        },
        'parchment-white': {
          DEFAULT: '#FFFCF5',           // Cards, elevated surfaces
          hsl: '48 100% 98%',
        },

        // ───────────────────────────────────────────────────────────────
        // ACCENT COLORS (2 colors)
        // ───────────────────────────────────────────────────────────────
        'aged-brass': {
          DEFAULT: '#B8956A',           // Primary interactive elements, borders on hover
          hsl: '38 33% 56%',
        },
        'brass-glow': {
          DEFAULT: '#D4AF37',           // CTAs, active states, highlights
          hsl: '43 65% 52%',
        },

        // ───────────────────────────────────────────────────────────────
        // FUNCTIONAL COLORS (3 colors - Minimal Use)
        // ───────────────────────────────────────────────────────────────
        'muted-sage': {
          DEFAULT: '#8B9474',           // Success/Approval (not bright green)
          hsl: '90 13% 52%',
        },
        'aged-amber': {
          DEFAULT: '#C4975C',           // Warning/Attention (not bright orange)
          hsl: '38 48% 56%',
        },
        'faded-rust': {
          DEFAULT: '#A85C5C',           // Error/Deletion (not bright red)
          hsl: '0 30% 51%',
        },

        // ───────────────────────────────────────────────────────────────
        // FORM/UI SUPPORT COLOR (1 color)
        // ───────────────────────────────────────────────────────────────
        'stone': {
          DEFAULT: '#E5DFD1',           // Default input borders, subtle dividers
          hsl: '40 31% 85%',
        },

        // ───────────────────────────────────────────────────────────────
        // PLATFORM BADGES (Derivative types ONLY - Small badges/icons)
        // Use sparingly: Never for large UI elements, only tiny indicators
        // ───────────────────────────────────────────────────────────────
        'derivative-email': {
          DEFAULT: '#4A90E2',           // Muted blue (not bright)
          hsl: '210 71% 58%',
        },
        'derivative-instagram': {
          DEFAULT: '#8B5CF6',           // Muted purple (not bright)
          hsl: '258 90% 66%',
        },
        'derivative-twitter': {
          DEFAULT: '#38BDF8',           // Sky blue (muted)
          hsl: '199 89% 60%',
        },
        'derivative-product': {
          DEFAULT: '#F97316',           // Muted orange (not neon)
          hsl: '25 95% 53%',
        },
        'derivative-sms': {
          DEFAULT: '#10B981',           // Muted green (not bright)
          hsl: '160 84% 39%',
        },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'serif'],
        sans: ['Lato', 'sans-serif'],
        accent: ['Crimson Text', 'serif'],
      },
      boxShadow: {
        'level-1': 'var(--shadow-level-1)',
        'level-2': 'var(--shadow-level-2)',
        'level-3': 'var(--shadow-level-3)',
        'level-4': 'var(--shadow-level-4)',
        'brass-glow': 'var(--shadow-brass-glow)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
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
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
