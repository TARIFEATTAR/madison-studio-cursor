import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface GoldButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const GoldButton = forwardRef<HTMLButtonElement, GoldButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "group relative overflow-hidden",
          "bg-[hsl(var(--aged-brass))] text-[hsl(var(--ink-black))]",
          "px-7 py-3 rounded-md min-h-[44px]",
          "font-serif font-semibold tracking-wide text-base",
          "border-none cursor-pointer",
          "flex items-center justify-center",
          "transition-all duration-300 ease-out",
          "hover:-translate-y-0.5",
          "hover:shadow-[0_4px_14px_rgba(184,149,106,0.4)]",
          className
        )}
        {...props}
      >
        {/* Shimmer effect */}
        <span 
          className={cn(
            "absolute inset-0 -left-[75%] w-1/2 h-full",
            "bg-gradient-to-r from-white/30 via-white/20 to-transparent",
            "skew-x-[-20deg]",
            "transition-all duration-[1200ms] ease-out",
            "group-hover:left-[125%]"
          )}
          aria-hidden="true"
        />
        
        {/* Button content */}
        <span className="relative z-10">{children}</span>
      </button>
    );
  }
);

GoldButton.displayName = "GoldButton";

export { GoldButton };
