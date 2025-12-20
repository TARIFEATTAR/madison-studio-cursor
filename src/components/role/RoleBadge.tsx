import React from "react";
import {
  Crown,
  Palette,
  Shield,
  Megaphone,
  Settings,
  DollarSign,
  User,
} from "lucide-react";
import { useUserRole, TeamRole, TEAM_ROLE_CONFIG } from "@/hooks/useUserRole";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

// Icon mapping for team roles
const ROLE_ICONS: Record<TeamRole, React.ComponentType<{ className?: string }>> = {
  founder: Crown,
  creative: Palette,
  compliance: Shield,
  marketing: Megaphone,
  operations: Settings,
  finance: DollarSign,
  general: User,
};

interface RoleBadgeProps {
  /** Optional override for role (defaults to current user's role) */
  role?: TeamRole;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Whether to show the icon */
  showIcon?: boolean;
  /** Whether to show the label */
  showLabel?: boolean;
  /** Additional className */
  className?: string;
  /** Whether to show tooltip with more info */
  showTooltip?: boolean;
}

/**
 * RoleBadge - Displays a user's team role with icon and label
 */
export function RoleBadge({
  role: overrideRole,
  size = "md",
  showIcon = true,
  showLabel = true,
  className,
  showTooltip = true,
}: RoleBadgeProps) {
  const { teamRole: currentRole, capabilities } = useUserRole();
  const role = overrideRole ?? currentRole;
  const config = TEAM_ROLE_CONFIG[role];
  const Icon = ROLE_ICONS[role];

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5 gap-1",
    md: "text-sm px-2 py-1 gap-1.5",
    lg: "text-base px-3 py-1.5 gap-2",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const badge = (
    <Badge
      variant="outline"
      className={cn(
        "font-medium transition-colors border",
        config.color,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {showLabel && <span>{config.label}</span>}
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        <div className="space-y-1">
          <p className="font-medium">{config.label} Role</p>
          <p className="text-xs text-muted-foreground">
            {getRoleDescription(role)}
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * RoleIndicator - Compact role indicator for headers
 */
export function RoleIndicator({ className }: { className?: string }) {
  const { teamRole, capabilities } = useUserRole();
  const config = TEAM_ROLE_CONFIG[teamRole];
  const Icon = ROLE_ICONS[teamRole];

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full border",
        config.color,
        className
      )}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{config.label}</span>
      <span className="text-xs opacity-70">View</span>
    </div>
  );
}

/**
 * YourSectionsHighlight - Shows which sections belong to the user's role
 */
export function YourSectionsHighlight() {
  const { capabilities, teamRole } = useUserRole();
  
  // Get sections where user has full access
  const yourSections = Object.entries(capabilities.sections)
    .filter(([_, access]) => access === "full")
    .map(([section]) => section);

  if (yourSections.length === 0) return null;

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Your sections:</span>
      <div className="flex gap-1">
        {yourSections.map((section) => (
          <Badge
            key={section}
            variant="secondary"
            className="text-xs capitalize"
          >
            {section}
          </Badge>
        ))}
      </div>
    </div>
  );
}

// Helper function for role descriptions
function getRoleDescription(role: TeamRole): string {
  const descriptions: Record<TeamRole, string> = {
    founder: "Full access to all sections. Focus on business growth and brand health.",
    creative: "Focus on media and marketing content. View access to product details.",
    compliance: "Focus on regulatory, ingredients, and safety documentation.",
    marketing: "Focus on campaigns, social media, and analytics.",
    operations: "Focus on packaging, inventory, and logistics.",
    finance: "Focus on pricing, costs, and financial metrics.",
    general: "Balanced access across all sections.",
  };
  return descriptions[role];
}
