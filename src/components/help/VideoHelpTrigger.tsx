import { useState } from "react";
import { Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VideoModal } from "./VideoModal";
import { helpVideos, HelpVideo } from "@/config/helpVideos";

interface VideoHelpTriggerProps {
  videoId: string;
  className?: string;
  variant?: "icon" | "button";
}

export const VideoHelpTrigger = ({
  videoId,
  className = "",
  variant = "icon",
}: VideoHelpTriggerProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const video = helpVideos.find((v) => v.id === videoId);

  if (!video) {
    console.warn(`Video with id "${videoId}" not found in helpVideos config`);
    return null;
  }

  const handleClick = () => {
    setIsModalOpen(true);
  };

  if (variant === "button") {
    return (
      <>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClick}
                className={className}
              >
                <Video className="w-4 h-4 mr-2" />
                Watch Tutorial
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{video.title}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <VideoModal
          video={video}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onVideoSelect={(selectedVideo: HelpVideo) => {
            setIsModalOpen(false);
            // Could open the new video, but for now just close
            setTimeout(() => {
              const newVideo = helpVideos.find((v) => v.id === selectedVideo.id);
              if (newVideo) {
                setIsModalOpen(true);
              }
            }, 100);
          }}
        />
      </>
    );
  }

  // Icon variant (default)
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleClick}
              className={`inline-flex items-center justify-center text-[hsl(var(--aged-brass))] opacity-60 hover:opacity-100 transition-all duration-200 hover:scale-110 ${className}`}
              aria-label="Watch tutorial video"
            >
              <Video className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Watch tutorial</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <VideoModal
        video={video}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onVideoSelect={(selectedVideo: HelpVideo) => {
          setIsModalOpen(false);
          // Could open the new video, but for now just close
          setTimeout(() => {
            const newVideo = helpVideos.find((v) => v.id === selectedVideo.id);
            if (newVideo) {
              setIsModalOpen(true);
            }
          }, 100);
        }}
      />
    </>
  );
};
