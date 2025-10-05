import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-br from-deep-charcoal to-[hsl(20,10%,12%)] text-white shadow-level-1 hover:from-[hsl(20,10%,20%)] hover:to-[hsl(20,10%,15%)] hover:shadow-level-2 hover:-translate-y-0.5 hover:ring-1 hover:ring-saffron-gold/30 active:translate-y-0",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-level-2 hover:-translate-y-0.5 active:translate-y-0",
        outline: "border-[1.5px] border-deep-charcoal/30 bg-background text-foreground hover:bg-deep-charcoal/5 hover:border-deep-charcoal hover:shadow-sm",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0",
        ghost: "hover:bg-saffron-gold/10 hover:text-saffron-gold hover:shadow-sm",
        link: "text-deep-charcoal underline-offset-4 hover:underline hover:text-saffron-gold",
        saffron: "bg-gradient-to-br from-saffron-gold to-[hsl(43,55%,48%)] text-deep-charcoal font-semibold shadow-level-1 hover:from-[hsl(43,70%,58%)] hover:to-saffron-gold hover:shadow-level-2 hover:-translate-y-0.5 active:translate-y-0",
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
