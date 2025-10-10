import { createPortal } from "react-dom";
import { PenTool } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, transition: { duration: 0.3 } }
};

const contentVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.4 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 0.2 }
  }
};

const iconVariants = {
  pulse: {
    scale: [0.95, 1.0, 0.95],
    transition: {
      duration: 2,
      repeat: Infinity
    }
  }
};

interface TransitionLoaderProps {
  onComplete?: () => void;
}

export function TransitionLoader({ onComplete }: TransitionLoaderProps) {
  useEffect(() => {
    // Auto-dismiss after 800ms
    const timer = setTimeout(() => {
      onComplete?.();
    }, 800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return createPortal(
    <motion.div
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: "rgba(184, 149, 106, 0.08)" }}
    >
      <motion.div 
        variants={contentVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="text-center"
      >
        <motion.div 
          variants={iconVariants}
          animate="pulse"
          className="relative mb-6"
        >
          <PenTool 
            className="w-12 h-12 mx-auto" 
            style={{ color: "#B8956A" }} 
          />
        </motion.div>

        <h2 
          className="text-2xl font-serif" 
          style={{ color: "#1A1816" }}
        >
          Preparing your content...
        </h2>
      </motion.div>
    </motion.div>,
    document.body
  );
}
