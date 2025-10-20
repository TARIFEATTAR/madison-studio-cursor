import { cn } from "@/lib/utils";

interface MadisonVerticalTabProps {
  isOpen: boolean;
  onClick: () => void;
  hasSuggestions?: boolean;
}

export function MadisonVerticalTab({ isOpen, onClick, hasSuggestions }: MadisonVerticalTabProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        // Fixed positioning - bottom-right, small tab
        "fixed right-0 bottom-0 h-[100px] z-40",
        "w-20 md:flex items-center justify-center hidden",
        
        // Styling - brass gradient with subtle border
        "bg-gradient-to-r from-brass via-aged-brass to-antique-gold",
        "border-t border-l border-brass/30 shadow-2xl rounded-tl-lg",
        
        // Hover effects
        "hover:h-[110px] transition-all duration-300 ease-out",
        "hover:shadow-brass/40",
        
        // Active/open state
        isOpen && "bg-opacity-90"
      )}
      aria-label={isOpen ? "Close Madison panel" : "Open Madison panel"}
    >
      {/* Horizontal Text */}
      <span 
        className="text-parchment-white font-serif font-semibold tracking-[0.15em] text-xs"
      >
        MADISON
      </span>
      
      {/* Optional: Badge indicator for suggestions */}
      {hasSuggestions && !isOpen && (
        <div 
          className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
