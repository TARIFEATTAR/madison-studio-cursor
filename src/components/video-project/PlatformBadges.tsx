import { motion } from "framer-motion";
import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlatformBadgesProps {
  duration: number;
  aspectRatio: "9:16" | "16:9" | "1:1";
}

interface PlatformSpec {
  name: string;
  icon: string;
  aspectRatios: string[];
  maxDuration: number;
  minDuration: number;
  idealDuration: number[];
}

const PLATFORM_SPECS: Record<string, PlatformSpec> = {
  instagram_reels: {
    name: "Instagram Reels",
    icon: "📸",
    aspectRatios: ["9:16", "1:1"],
    maxDuration: 90,
    minDuration: 3,
    idealDuration: [15, 30, 60],
  },
  tiktok: {
    name: "TikTok",
    icon: "🎵",
    aspectRatios: ["9:16"],
    maxDuration: 180,
    minDuration: 5,
    idealDuration: [15, 30, 60],
  },
  facebook_reels: {
    name: "Facebook Reels",
    icon: "👥",
    aspectRatios: ["9:16", "1:1"],
    maxDuration: 90,
    minDuration: 3,
    idealDuration: [15, 30, 60],
  },
  youtube_shorts: {
    name: "YouTube Shorts",
    icon: "▶️",
    aspectRatios: ["9:16"],
    maxDuration: 60,
    minDuration: 15,
    idealDuration: [30, 60],
  },
};

function getPlatformCompatibility(
  platform: PlatformSpec,
  duration: number,
  aspectRatio: string
): { compatible: boolean; issue?: string } {
  if (!platform.aspectRatios.includes(aspectRatio)) {
    return { compatible: false, issue: `Needs ${platform.aspectRatios[0]}` };
  }
  if (duration > platform.maxDuration) {
    return { compatible: false, issue: `Max ${platform.maxDuration}s` };
  }
  if (duration < platform.minDuration) {
    return { compatible: false, issue: `Min ${platform.minDuration}s` };
  }
  return { compatible: true };
}

export function PlatformBadges({ duration, aspectRatio }: PlatformBadgesProps) {
  const platforms = Object.entries(PLATFORM_SPECS).map(([key, spec]) => ({
    key,
    ...spec,
    ...getPlatformCompatibility(spec, duration, aspectRatio),
  }));

  const compatibleCount = platforms.filter((p) => p.compatible).length;

  return (
    <div className="platform-badges">
      <div className="platform-badges-header">
        <span className="platform-badges-title">Platform Compatibility</span>
        <span className="platform-badges-count">
          {compatibleCount}/{platforms.length} platforms
        </span>
      </div>

      <div className="platform-badges-list">
        {platforms.map((platform, index) => (
          <motion.div
            key={platform.key}
            className={cn(
              "platform-badge",
              platform.compatible
                ? "platform-badge--compatible"
                : "platform-badge--incompatible"
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <span className="platform-icon">{platform.icon}</span>
            <span className="platform-name">{platform.name}</span>
            {platform.compatible ? (
              <Check className="w-3 h-3 platform-status-icon" />
            ) : (
              <span className="platform-issue">{platform.issue}</span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
