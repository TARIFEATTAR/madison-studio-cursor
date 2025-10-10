import { createPortal } from "react-dom";
import { Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function GeneratingLoader() {
  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: "rgba(184, 149, 106, 0.15)" }}
    >
      <div className="text-center">
        {/* Brass-colored spinning loader */}
        <div className="relative mb-6">
          <Loader2 
            className="w-16 h-16 animate-spin mx-auto" 
            style={{ color: "#B8956A" }} 
          />
          <Sparkles 
            className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" 
            style={{ color: "#D4AF37" }} 
          />
        </div>

        {/* Main text */}
        <h2 
          className="text-3xl font-serif mb-3" 
          style={{ color: "#1A1816" }}
        >
          Generating your content...
        </h2>

        {/* Subtext */}
        <p 
          className="text-base" 
          style={{ color: "#6B6560" }}
        >
          This will only take a moment
        </p>
      </div>
    </motion.div>,
    document.body
  );
}
