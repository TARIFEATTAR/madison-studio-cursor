import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MadisonFloatingButtonProps {
  onClick: () => void;
  className?: string;
}

export default function MadisonFloatingButton({ onClick, className }: MadisonFloatingButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="icon"
      className={cn(
        "fixed bottom-20 right-4 z-40",
        "w-12 h-12 rounded-full shadow-lg",
        "bg-aged-brass/90 hover:bg-aged-brass backdrop-blur-sm",
        "text-studio-bg",
        "transition-all duration-200",
        "hover:scale-110 active:scale-95",
        className
      )}
    >
      <MessageCircle className="w-5 h-5" />
    </Button>
  );
}
