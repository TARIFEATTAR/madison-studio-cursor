import { motion, AnimatePresence } from "framer-motion";
import { Camera, Loader2, Aperture } from "lucide-react";
import { cn } from "@/lib/utils";
import { LEDIndicator } from "./LEDIndicator";

interface GenerateButtonProps {
  hasProduct: boolean;
  hasBackground: boolean;
  hasStyle: boolean;
  proSettingsCount?: number;
  onGenerate: () => void;
  isGenerating: boolean;
  disabled?: boolean;
  sessionCount?: number;
  maxImages?: number;
}

export function GenerateButton({
  hasProduct,
  hasBackground,
  hasStyle,
  proSettingsCount = 0,
  onGenerate,
  isGenerating,
  disabled = false,
  sessionCount = 0,
  maxImages = 10,
}: GenerateButtonProps) {
  const activeFeatures = [
    hasProduct && "Product",
    hasBackground && "Background",
    hasStyle && "Style",
  ].filter(Boolean);

  const canGenerate = !disabled && !isGenerating && sessionCount < maxImages;
  const atLimit = sessionCount >= maxImages;
  
  // Determine LED state
  const ledState = isGenerating ? "processing" : canGenerate ? "ready" : "off";

  // Generate contextual tip
  const getTip = () => {
    if (atLimit) {
      return `Session limit reached (${maxImages} images). Save to continue.`;
    }
    if (!hasProduct && !hasBackground) {
      return "Upload a product image to begin";
    }
    if (hasProduct && !hasBackground) {
      return "Try adding a background scene for composition";
    }
    if (hasProduct && hasBackground && !hasStyle) {
      return "Add a style reference for matching lighting";
    }
    if (proSettingsCount === 0 && (hasProduct || hasBackground)) {
      return "Expand Pro Settings for camera & lighting control";
    }
    return null;
  };

  const tip = getTip();

  return (
    <div className="generate-button-container">
      {/* Status Bar with LED */}
      <div className="flex items-center justify-center gap-3 mb-3">
        <LEDIndicator state={ledState} size="md" />
        <AnimatePresence mode="wait">
          {activeFeatures.length > 0 ? (
            <motion.div
              key="features"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-[10px] font-mono uppercase tracking-[0.1em] text-[var(--led-ready)]"
              style={{ textShadow: '0 0 8px rgba(0, 255, 102, 0.3)' }}
            >
              {activeFeatures.join(" + ")}
              {proSettingsCount > 0 && ` • PRO (${proSettingsCount})`}
            </motion.div>
          ) : (
            <motion.div
              key="standby"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-[10px] font-mono uppercase tracking-[0.1em] text-[var(--darkroom-text-dim)]"
            >
              Standby
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Button - Shutter Release Style */}
      <motion.button
        className={cn(
          "generate-button",
          isGenerating && "generate-button--generating"
        )}
        onClick={onGenerate}
        disabled={!canGenerate}
        whileHover={canGenerate ? { y: -1 } : {}}
        whileTap={canGenerate ? { y: 2 } : {}}
      >
        <AnimatePresence mode="wait">
          {!isGenerating ? (
            <motion.div
              key="ready"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="button-content"
            >
              <Aperture size={18} />
              <span>
                {hasProduct ? "Capture" : "Generate"}
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="button-content"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 size={18} />
              </motion.div>
              <span>Exposing...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Glow Pulse on Hover (when ready) */}
        {canGenerate && !isGenerating && (
          <motion.div
            className="button-glow"
            animate={{
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </motion.button>

      {/* Contextual Tip */}
      <AnimatePresence>
        {tip && !isGenerating && (
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className={cn(
              "generate-tip",
              atLimit && "text-[var(--led-error)]"
            )}
          >
            {tip}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
