import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-ink-black text-parchment-white border border-aged-brass/30 shadow-level-1 hover:bg-charcoal hover:border-aged-brass hover:shadow-level-2 hover:-translate-y-0.5 hover:ring-1 hover:ring-aged-brass active:translate-y-0",
        destructive: "bg-deep-burgundy text-parchment-white hover:bg-deep-burgundy/90 hover:shadow-level-2 hover:-translate-y-0.5 active:translate-y-0",
        outline: "border-[1.5px] border-charcoal/25 bg-background text-charcoal hover:bg-aged-brass/8 hover:border-aged-brass hover:text-ink-black hover:shadow-sm",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0",
        ghost: "hover:bg-aged-brass/10 hover:text-aged-brass hover:shadow-sm",
        link: "text-aged-brass underline-offset-4 hover:underline hover:text-antique-gold",
        brass: "bg-aged-brass text-parchment-white font-semibold shadow-level-1 hover:bg-antique-gold hover:shadow-level-2 hover:-translate-y-0.5 active:translate-y-0 active:bg-primary-dark",
        brassGradient: "bg-gradient-to-r from-[hsl(var(--aged-brass))] to-[hsl(var(--antique-gold))] text-parchment-white font-semibold shadow-level-1 hover:shadow-level-2 hover:-translate-y-0.5 hover:opacity-90 active:translate-y-0",
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
