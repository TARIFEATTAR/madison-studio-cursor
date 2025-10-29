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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          dark: "hsl(var(--primary-dark))",
          light: "hsl(var(--primary-light))",
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
        'ink-black': "hsl(var(--ink-black))",
        'charcoal': "hsl(var(--charcoal))",
        'warm-gray': "hsl(var(--warm-gray))",
        'vellum-cream': "hsl(var(--vellum-cream))",
        'parchment-white': "hsl(var(--parchment-white))",
        'aged-brass': "hsl(var(--aged-brass))",
        'brass': "hsl(var(--brass))",
        'brass-glow': "hsl(var(--brass-glow))",
        'antique-gold': "hsl(var(--antique-gold))",
        'deep-burgundy': "hsl(var(--deep-burgundy))",
        'forest-ink': "hsl(var(--forest-ink))",
        'midnight-blue': "hsl(var(--midnight-blue))",
        'derivative-email': "hsl(var(--derivative-email))",
        'derivative-instagram': "hsl(var(--derivative-instagram))",
        'derivative-twitter': "hsl(var(--derivative-twitter))",
        'derivative-product': "hsl(var(--derivative-product))",
        'derivative-sms': "hsl(var(--derivative-sms))",
        'derivative-linkedin': "hsl(var(--derivative-linkedin))",
        studio: {
          charcoal: '#252220',
          card: '#2F2A26',
          border: '#3D3935',
          text: {
            primary: '#FFFCF5',
            secondary: '#D4CFC8',
            muted: '#A8A39E',
          },
          accent: {
            brass: '#B8956A',
            glow: 'rgba(184, 149, 106, 0.15)',
          }
        },
        'aged-paper': '#F5F1E8',
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
        'saffron-glow': 'var(--shadow-saffron-glow)',
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
