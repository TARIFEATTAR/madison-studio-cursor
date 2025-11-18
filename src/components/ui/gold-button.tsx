import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface GoldButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const GoldButton = forwardRef<HTMLButtonElement, GoldButtonProps>(
  ({ className, children, type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "group relative flex items-center justify-center gap-2 whitespace-nowrap",
          "bg-[hsl(var(--aged-brass))] text-[hsl(var(--ink-black))]",
          "px-6 md:px-7 h-10 rounded-md",
          "font-serif font-semibold text-base leading-none",
          "border-none cursor-pointer",
          "transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--aged-brass))] focus-visible:ring-offset-2 focus-visible:ring-offset-card",
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
            "transition-all ease-out",
            "group-hover:left-[125%]"
          )}
          style={{ transitionDuration: "1200ms" }}
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
