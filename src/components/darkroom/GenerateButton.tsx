import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

  // Generate contextual tip
  const getTip = () => {
    if (atLimit) {
      return `Session limit reached (${maxImages} images). Save to continue.`;
    }
    if (!hasProduct && !hasBackground) {
      return "💡 Upload a product image to begin";
    }
    if (hasProduct && !hasBackground) {
      return "💡 Try adding a background scene for composition";
    }
    if (hasProduct && hasBackground && !hasStyle) {
      return "💡 Add a style reference for matching lighting";
    }
    if (proSettingsCount === 0 && (hasProduct || hasBackground)) {
      return "💡 Expand Pro Settings for camera & lighting control";
    }
    return null;
  };

  const tip = getTip();

  return (
    <div className="generate-button-container">
      {/* Active Features Indicator */}
      <AnimatePresence>
        {activeFeatures.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="active-features"
          >
            {activeFeatures.join(" + ")}
            {proSettingsCount > 0 && ` • Pro Mode (${proSettingsCount})`}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <motion.button
        className={cn(
          "generate-button",
          isGenerating && "generate-button--generating"
        )}
        onClick={onGenerate}
        disabled={!canGenerate}
        whileHover={canGenerate ? { scale: 1.02 } : {}}
        whileTap={canGenerate ? { scale: 0.98 } : {}}
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
              <Sparkles size={18} />
              <span>
                {hasProduct ? "Enhance Image" : "Generate Image"}
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
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
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
              atLimit && "text-[var(--darkroom-error)]"
            )}
          >
            {tip}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
