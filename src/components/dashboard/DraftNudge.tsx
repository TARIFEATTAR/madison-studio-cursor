import { AlertCircle, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface DraftNudgeProps {
  draftCount: number;
}

export function DraftNudge({ draftCount }: DraftNudgeProps) {
  const navigate = useNavigate();

  // Don't show if drafts are under threshold
  if (draftCount < 10) return null;

  const isCritical = draftCount >= 20;
  const severity = isCritical ? "critical" : "moderate";

  const messages = {
    moderate: {
      title: "Time to tidy up?",
      description: `You have ${draftCount} drafts waiting. Consider reviewing and publishing your best work, or archiving what's no longer needed.`,
      icon: FileCheck,
      gradient: "from-amber-500/10 to-orange-500/10",
      borderColor: "border-amber-500/30",
      textColor: "text-amber-700",
      buttonText: "Review Drafts"
    },
    critical: {
      title: "Your drafts need attention",
      description: `${draftCount} drafts are piling up! Time to finish what you started. Pick your favorites, publish them, and archive the rest.`,
      icon: AlertCircle,
      gradient: "from-red-500/10 to-orange-600/10",
      borderColor: "border-red-500/30",
      textColor: "text-red-700",
      buttonText: "Clean Up Drafts"
    }
  };

  const config = messages[severity];
  const Icon = config.icon;

  return (
    <Card 
      className={`col-span-1 md:col-span-12 p-4 border-2 ${config.borderColor} overflow-hidden rounded-xl animate-fade-in bg-gradient-to-br ${config.gradient}`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${config.textColor} bg-white/80`}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-semibold ${config.textColor} mb-1`}>
            {config.title}
          </h3>
          <p className="text-xs text-[#1C150D]/70 leading-relaxed mb-3">
            {config.description}
          </p>
          <Button
            size="sm"
            onClick={() => navigate("/library?status=draft")}
            className="bg-[#1C150D] hover:bg-[#2F2A26] text-white"
          >
            {config.buttonText}
          </Button>
        </div>
      </div>
    </Card>
  );
}
