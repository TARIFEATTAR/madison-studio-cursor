import { useMemo } from "react";
import { useDashboardStats } from "./useDashboardStats";
import { useBrandHealth } from "./useBrandHealth";
import { useNavigate } from "react-router-dom";

export interface DashboardInsight {
  message: string;
  primaryAction: {
    label: string;
    handler: () => void;
  };
  secondaryAction: {
    label: string;
    handler: () => void;
  };
  priorityRoute?: string;
}

export function useSmartDashboardInsights(): DashboardInsight {
  const { data: stats } = useDashboardStats();
  const { brandHealth } = useBrandHealth();
  const navigate = useNavigate();

  const insight = useMemo(() => {
    const drafts = stats?.totalDrafts || 0;
    const scheduled = stats?.piecesScheduled || 0;
    const publishedThisWeek = stats?.piecesPublished || 0;
    const brandScore = brandHealth?.completeness_score || 0;

    const dayOfWeek = new Date().getDay(); // 0 = Sunday, 3 = Wednesday

    // Priority 1: Many drafts ready
    if (drafts >= 3) {
      return {
        message: `You have ${drafts} draft${drafts > 1 ? 's' : ''} ready. Review and schedule them?`,
        primaryAction: {
          label: "Review Drafts",
          handler: () => navigate("/library?status=draft"),
        },
        secondaryAction: {
          label: "View Calendar",
          handler: () => navigate("/calendar"),
        },
        priorityRoute: "library",
      };
    }

    // Priority 2: Nothing scheduled this week
    if (scheduled === 0) {
      return {
        message: "Nothing scheduled yet. Let's plan your week.",
        primaryAction: {
          label: "View Calendar",
          handler: () => navigate("/calendar"),
        },
        secondaryAction: {
          label: "Create Content",
          handler: () => navigate("/create"),
        },
        priorityRoute: "calendar",
      };
    }

    // Priority 3: Low brand health
    if (brandScore < 80 && brandScore > 0) {
      return {
        message: `Your brand health is at ${brandScore}%. Fix gaps to improve AI quality.`,
        primaryAction: {
          label: "Fix Top Gap",
          handler: () => navigate("/brand-health"),
        },
        secondaryAction: {
          label: "View Health Report",
          handler: () => navigate("/brand-health"),
        },
        priorityRoute: "library",
      };
    }

    // Priority 4: Mid-week with no published content
    if (publishedThisWeek === 0 && dayOfWeek >= 3) {
      return {
        message: "No content published yet this week. Need help?",
        primaryAction: {
          label: "View Calendar",
          handler: () => navigate("/calendar"),
        },
        secondaryAction: {
          label: "Create New",
          handler: () => navigate("/create"),
        },
        priorityRoute: "calendar",
      };
    }

    // Priority 5: No content at all
    if (drafts === 0 && scheduled === 0) {
      return {
        message: "Let's create your first content piece.",
        primaryAction: {
          label: "Start Creating",
          handler: () => navigate("/create"),
        },
        secondaryAction: {
          label: "Upload Brand Docs",
          handler: () => navigate("/settings?tab=brand"),
        },
        priorityRoute: "create",
      };
    }

    // Default: Healthy state
    const compliments = [
      "Your editorial studio is running smoothly.",
      "Great work! Your content pipeline is flowing.",
      "Excellent momentum. Keep creating!",
    ];
    const randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];

    return {
      message: randomCompliment,
      primaryAction: {
        label: "Create New Content",
        handler: () => navigate("/create"),
      },
      secondaryAction: {
        label: "View Library",
        handler: () => navigate("/library"),
      },
      priorityRoute: "create",
    };
  }, [stats, brandHealth, navigate]);

  return insight;
}
