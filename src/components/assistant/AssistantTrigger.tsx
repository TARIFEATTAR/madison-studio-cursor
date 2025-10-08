import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditorialAssistant } from "./EditorialAssistant";
import { cn } from "@/lib/utils";

export function AssistantTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full shadow-2xl",
          "bg-gradient-to-br from-primary to-primary/80",
          "hover:shadow-primary/50 hover:scale-110",
          "transition-all duration-300",
          "border-2 border-primary-foreground/10"
        )}
        size="icon"
      >
        <Sparkles className="w-6 h-6 text-primary-foreground" />
      </Button>

      <EditorialAssistant isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
