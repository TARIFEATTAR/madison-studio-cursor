import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

// ══════════════════════════════════════════════════════════════════════════════
// DEVELOPING ANIMATION - Chemical Bath Photo Development Effect
// 
// A beautiful darkroom-inspired animation that simulates a photograph
// developing in a chemical bath. Features:
// - Liquid surface with realistic ripples
// - Caustic light patterns (shimmering water reflections)
// - Image emerging through the liquid
// - Rise-from-bath reveal with drip effects
// ══════════════════════════════════════════════════════════════════════════════

type DevelopingPhase = "submerged" | "emerging" | "revealed";

interface DevelopingAnimationProps {
  /** The image URL to reveal */
  imageUrl?: string;
  /** Current phase of the animation */
  phase: DevelopingPhase;
  /** Duration of the developing phase in ms (default: 3000) */
  developDuration?: number;
  /** Callback when reveal is complete */
  onRevealComplete?: () => void;
  /** Optional className for the container */
  className?: string;
  /** Show in compact mode (for thumbnails/grid) */
  compact?: boolean;
  /** Custom developing text */
  developingText?: string;
}

// Caustic light pattern - simulates underwater light refraction
function CausticOverlay({ intensity = 1 }: { intensity?: number }) {
  return (
    <div className="caustic-layer">
      {/* Multiple caustic patterns for depth */}
      <motion.div
        className="caustic-pattern caustic-1"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
          opacity: [0.15 * intensity, 0.25 * intensity, 0.15 * intensity],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.div
        className="caustic-pattern caustic-2"
        animate={{
          backgroundPosition: ["100% 0%", "0% 100%", "100% 0%"],
          opacity: [0.1 * intensity, 0.2 * intensity, 0.1 * intensity],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.div
        className="caustic-pattern caustic-3"
        animate={{
          backgroundPosition: ["50% 100%", "50% 0%", "50% 100%"],
          opacity: [0.08 * intensity, 0.15 * intensity, 0.08 * intensity],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}

// Liquid surface with ripple effect
function LiquidSurface({ isActive = true }: { isActive?: boolean }) {
  return (
    <div className="liquid-surface-container">
      {/* Main liquid surface */}
      <motion.div
        className="liquid-surface"
        animate={isActive ? {
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        } : {}}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Ripple rings - radiating from center */}
      {isActive && (
        <>
          <motion.div
            className="ripple-ring"
            initial={{ scale: 0.3, opacity: 0.6 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeOut",
              repeatDelay: 0.5,
            }}
          />
          <motion.div
            className="ripple-ring"
            initial={{ scale: 0.3, opacity: 0.6 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeOut",
              delay: 1.5,
              repeatDelay: 0.5,
            }}
          />
        </>
      )}
    </div>
  );
}

// Film grain overlay for authentic darkroom feel
function FilmGrain() {
  return <div className="film-grain-overlay" aria-hidden="true" />;
}

// Drip effect when image rises from bath
function DripsEffect({ isActive }: { isActive: boolean }) {
  const drips = useMemo(() => 
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: `${10 + (i * 12)}%`,
      delay: Math.random() * 0.5,
      duration: 0.6 + Math.random() * 0.4,
    })), []
  );

  return (
    <AnimatePresence>
      {isActive && (
        <div className="drips-container">
          {drips.map((drip) => (
            <motion.div
              key={drip.id}
              className="drip"
              style={{ left: drip.left }}
              initial={{ height: 0, opacity: 0.8 }}
              animate={{ height: "30px", opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: drip.duration,
                delay: drip.delay,
                ease: "easeIn",
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

// Safe light glow effect (darkroom red light)
function SafeLightGlow({ phase }: { phase: DevelopingPhase }) {
  return (
    <motion.div
      className="safelight-glow"
      animate={{
        opacity: phase === "submerged" ? [0.03, 0.06, 0.03] : 0,
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

// Main developing animation component
export function DevelopingAnimation({
  imageUrl,
  phase,
  developDuration = 3000,
  onRevealComplete,
  className,
  compact = false,
  developingText = "Developing...",
}: DevelopingAnimationProps) {
  const [showDrips, setShowDrips] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Handle phase transitions
  useEffect(() => {
    if (phase === "emerging") {
      // Show drips during emergence
      setShowDrips(true);
      const timer = setTimeout(() => setShowDrips(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === "revealed" && !animationComplete) {
      setAnimationComplete(true);
      onRevealComplete?.();
    }
  }, [phase, animationComplete, onRevealComplete]);

  // Animation variants for the image
  const imageVariants: Variants = {
    submerged: {
      opacity: 0,
      filter: "blur(20px) saturate(0.3)",
      y: 20,
      scale: 0.95,
    },
    emerging: {
      opacity: 0.7,
      filter: "blur(8px) saturate(0.7)",
      y: 10,
      scale: 0.98,
      transition: {
        duration: developDuration / 1000 * 0.5,
        ease: "easeOut",
      },
    },
    revealed: {
      opacity: 1,
      filter: "blur(0px) saturate(1)",
      y: 0,
      scale: 1,
      transition: {
        duration: developDuration / 1000 * 0.5,
        ease: "easeOut",
      },
    },
  };

  // Container animation for the rise effect
  const containerVariants: Variants = {
    submerged: { y: 0 },
    emerging: { y: -5, transition: { duration: 0.8, ease: "easeOut" } },
    revealed: { y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <div className={cn(
      "developing-animation",
      compact && "developing-animation--compact",
      `developing-animation--${phase}`,
      className
    )}>
      {/* Safe light ambient glow */}
      <SafeLightGlow phase={phase} />

      {/* Chemical bath container */}
      <motion.div
        className="chemical-bath"
        variants={containerVariants}
        initial="submerged"
        animate={phase}
      >
        {/* The developing image */}
        {imageUrl && (
          <motion.div
            className="developing-image-container"
            variants={imageVariants}
            initial="submerged"
            animate={phase}
          >
            <img
              src={imageUrl}
              alt="Developing"
              className="developing-image"
            />
          </motion.div>
        )}

        {/* Caustic light patterns (visible during submerged/emerging) */}
        <AnimatePresence>
          {(phase === "submerged" || phase === "emerging") && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.5 } }}
            >
              <CausticOverlay intensity={phase === "submerged" ? 1 : 0.5} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Liquid surface (fades out as image rises) */}
        <AnimatePresence>
          {phase !== "revealed" && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.6 } }}
            >
              <LiquidSurface isActive={phase === "submerged"} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Drip effect when rising */}
        <DripsEffect isActive={showDrips} />

        {/* Film grain for authentic feel */}
        <FilmGrain />

        {/* Developing text indicator */}
        <AnimatePresence>
          {phase === "submerged" && !compact && (
            <motion.div
              className="developing-text"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                {developingText}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Frame border with brass accent */}
      <motion.div
        className="developing-frame-border"
        animate={{
          borderColor: phase === "revealed"
            ? "rgba(184, 149, 106, 0.4)"
            : ["rgba(184, 149, 106, 0.15)", "rgba(184, 149, 106, 0.3)", "rgba(184, 149, 106, 0.15)"],
        }}
        transition={phase !== "revealed" ? {
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        } : { duration: 0.5 }}
      />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PRESET ANIMATION CONFIGURATIONS
// ══════════════════════════════════════════════════════════════════════════════

export const DEVELOPING_PRESETS = {
  /** Quick reveal for already-generated images */
  quick: { developDuration: 1500 },
  /** Standard developing time */
  standard: { developDuration: 3000 },
  /** Slow, dramatic reveal */
  dramatic: { developDuration: 5000 },
  /** Extra slow for high-impact reveals */
  cinematic: { developDuration: 7000 },
} as const;

// ══════════════════════════════════════════════════════════════════════════════
// HOOK FOR MANAGING DEVELOPING STATE
// ══════════════════════════════════════════════════════════════════════════════

export function useDevelopingAnimation(
  imageUrl: string | null,
  options: {
    autoStart?: boolean;
    developDuration?: number;
    onComplete?: () => void;
  } = {}
) {
  const { autoStart = true, developDuration = 3000, onComplete } = options;
  const [phase, setPhase] = useState<DevelopingPhase>("submerged");

  // Start the developing sequence
  const startDeveloping = () => {
    setPhase("submerged");
    
    // Transition to emerging after a brief pause
    setTimeout(() => {
      setPhase("emerging");
    }, developDuration * 0.3);
    
    // Transition to revealed
    setTimeout(() => {
      setPhase("revealed");
      onComplete?.();
    }, developDuration);
  };

  // Reset to initial state
  const reset = () => {
    setPhase("submerged");
  };

  // Auto-start when image changes
  useEffect(() => {
    if (autoStart && imageUrl) {
      startDeveloping();
    }
  }, [imageUrl, autoStart]);

  return {
    phase,
    startDeveloping,
    reset,
    isComplete: phase === "revealed",
    isAnimating: phase !== "revealed",
  };
}

export default DevelopingAnimation;
