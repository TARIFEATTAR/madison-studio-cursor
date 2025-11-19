import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary CTA: Ink Black with brass border → Brass Glow on hover
        default: "bg-ink-black text-parchment-white border border-aged-brass/30 shadow-level-1 hover:border-brass-glow hover:shadow-brass-glow hover:-translate-y-0.5 active:translate-y-0",
        
        // Destructive: Faded Rust with refined hover
        destructive: "bg-faded-rust text-parchment-white shadow-level-1 hover:bg-faded-rust/90 hover:shadow-level-2 hover:-translate-y-0.5 active:translate-y-0",
        
        // Outline: Subtle border with brass hover
        outline: "border-[1.5px] border-stone bg-background text-charcoal hover:bg-aged-brass/8 hover:border-aged-brass hover:text-ink-black hover:shadow-sm",
        
        // Secondary: Vellum Cream with subtle hover
        secondary: "bg-vellum-cream text-ink-black border border-stone shadow-level-1 hover:bg-vellum-cream/80 hover:border-aged-brass/40 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0",
        
        // Ghost: Transparent with vellum cream hover
        ghost: "hover:bg-vellum-cream/50 hover:text-aged-brass",
        
        // Link: Aged brass with brass glow hover
        link: "text-aged-brass underline-offset-4 hover:underline hover:text-brass-glow",
        
        // Brass: Primary accent button
        brass: "bg-aged-brass text-parchment-white font-semibold shadow-level-1 hover:bg-brass-glow hover:shadow-level-2 hover:-translate-y-0.5 active:translate-y-0",
        
        // Brass Gradient: Premium CTA with gradient
        brassGradient: "bg-[linear-gradient(135deg,#B8956A_0%,#D4AF37_50%,#B8956A_100%)] text-parchment-white font-semibold shadow-level-1 hover:shadow-level-2 hover:-translate-y-0.5 hover:opacity-90 active:translate-y-0",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
