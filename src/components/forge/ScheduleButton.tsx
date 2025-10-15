import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ScheduleModal } from "@/components/calendar/ScheduleModal";

interface ScheduleButtonProps {
  contentId?: string;
  contentTitle: string;
  contentType: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  derivativeAsset?: {
    id: string;
    master_content_id: string;
    asset_type: string;
    generated_content: string;
    platform_specs: any;
  };
  masterContent?: {
    id: string;
    title: string;
    content_type: string;
  };
}

export const ScheduleButton = ({ 
  contentId,
  contentTitle, 
  contentType,
  variant = "outline",
  size = "default",
  className = "",
  derivativeAsset,
  masterContent
}: ScheduleButtonProps) => {
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  const handleScheduleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScheduleModalOpen(true);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleScheduleClick}
      >
        <Calendar className="w-4 h-4 mr-2" />
        Schedule
      </Button>

      <ScheduleModal
        open={scheduleModalOpen}
        onOpenChange={setScheduleModalOpen}
        selectedDate={new Date()}
        onSuccess={() => {
          setScheduleModalOpen(false);
        }}
        derivativeAsset={derivativeAsset}
        masterContent={masterContent}
      />
    </>
  );
};
