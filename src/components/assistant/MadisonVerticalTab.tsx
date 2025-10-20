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
        // Fixed positioning - right edge, full height
        "fixed right-0 top-0 h-screen z-40",
        "w-10 md:flex items-center justify-center hidden",
        
        // Styling - brass gradient with subtle border
        "bg-gradient-to-b from-brass via-aged-brass to-antique-gold",
        "border-l border-brass/30 shadow-2xl",
        
        // Hover effects
        "hover:w-12 transition-all duration-300 ease-out",
        "hover:shadow-brass/40",
        
        // Active/open state
        isOpen && "bg-opacity-90"
      )}
      aria-label={isOpen ? "Close Madison panel" : "Open Madison panel"}
    >
      {/* Vertical Text - Top to Bottom */}
      <span 
        className="text-parchment-white font-serif font-semibold tracking-[0.2em] text-sm"
        style={{
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          transform: 'rotate(180deg)',
        }}
      >
        MADISON
      </span>
      
      {/* Optional: Badge indicator for suggestions */}
      {hasSuggestions && !isOpen && (
        <div 
          className="absolute top-4 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
