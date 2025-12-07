import { motion } from "framer-motion";
import { ArrowLeft, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoProjectHeaderProps {
  step: "template" | "edit" | "preview";
  projectName?: string;
  onBack: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
  canGenerate: boolean;
}

export function VideoProjectHeader({
  step,
  projectName,
  onBack,
  onGenerate,
  isGenerating,
  canGenerate,
}: VideoProjectHeaderProps) {
  const getTitle = () => {
    switch (step) {
      case "template":
        return "New Video Project";
      case "edit":
        return projectName || "Edit Video";
      case "preview":
        return "Preview";
      default:
        return "Video Project";
    }
  };

  const getSubtitle = () => {
    switch (step) {
      case "template":
        return "Choose a template to get started";
      case "edit":
        return "Add images to your scenes";
      case "preview":
        return "Review your video";
      default:
        return "";
    }
  };

  return (
    <header className="video-project-header">
      <div className="header-left">
        <Button
          variant="ghost"
          size="icon"
          className="back-btn"
          onClick={onBack}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="header-titles">
          <motion.h1
            key={getTitle()}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="header-title"
          >
            {getTitle()}
          </motion.h1>
          <motion.p
            key={getSubtitle()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="header-subtitle"
          >
            {getSubtitle()}
          </motion.p>
        </div>
      </div>

      <div className="header-right">
        {step === "edit" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Button
              variant="brass"
              onClick={onGenerate}
              disabled={!canGenerate || isGenerating}
              className="generate-btn"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Generate Video
                </>
              )}
            </Button>
          </motion.div>
        )}
      </div>
    </header>
  );
}
