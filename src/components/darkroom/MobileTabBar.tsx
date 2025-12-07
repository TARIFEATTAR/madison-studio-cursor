import { Image, Sparkles, Camera, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export type MobileTab = "canvas" | "inputs" | "madison" | "settings";

interface MobileTabBarProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  hasInputs?: boolean;
  isGenerating?: boolean;
}

export function MobileTabBar({
  activeTab,
  onTabChange,
  hasInputs = false,
  isGenerating = false,
}: MobileTabBarProps) {
  const tabs: Array<{
    id: MobileTab;
    label: string;
    icon: React.ReactNode;
    showBadge?: boolean;
  }> = [
    {
      id: "canvas",
      label: "Canvas",
      icon: <Camera />,
    },
    {
      id: "inputs",
      label: "Inputs",
      icon: <Image />,
      showBadge: hasInputs,
    },
    {
      id: "madison",
      label: "Madison",
      icon: <Sparkles />,
    },
  ];

  return (
    <div className="mobile-tab-bar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={cn(
            "mobile-tab-button",
            activeTab === tab.id && "active"
          )}
          onClick={() => onTabChange(tab.id)}
          disabled={isGenerating && tab.id !== "canvas"}
        >
          <div className="relative">
            {tab.icon}
            {tab.showBadge && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--darkroom-accent)] rounded-full" />
            )}
          </div>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
