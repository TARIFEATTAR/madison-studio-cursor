import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlatformBadgesProps {
  duration: number;
  aspectRatio: "9:16" | "16:9" | "1:1";
}

interface PlatformSpec {
  name: string;
  icon: React.ReactNode;
  aspectRatios: string[];
  maxDuration: number;
  minDuration: number;
  idealDuration: number[];
}

// Elegant minimal SVG icons for each platform
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="18" cy="6" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#1a1816"/>
  </svg>
);

const PLATFORM_SPECS: Record<string, PlatformSpec> = {
  instagram_reels: {
    name: "Instagram Reels",
    icon: <InstagramIcon />,
    aspectRatios: ["9:16", "1:1"],
    maxDuration: 90,
    minDuration: 3,
    idealDuration: [15, 30, 60],
  },
  tiktok: {
    name: "TikTok",
    icon: <TikTokIcon />,
    aspectRatios: ["9:16"],
    maxDuration: 180,
    minDuration: 5,
    idealDuration: [15, 30, 60],
  },
  facebook_reels: {
    name: "Facebook Reels",
    icon: <FacebookIcon />,
    aspectRatios: ["9:16", "1:1"],
    maxDuration: 90,
    minDuration: 3,
    idealDuration: [15, 30, 60],
  },
  youtube_shorts: {
    name: "YouTube Shorts",
    icon: <YouTubeIcon />,
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
              <Check className="w-3.5 h-3.5 platform-status-icon" />
            ) : (
              <span className="platform-issue">{platform.issue}</span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
