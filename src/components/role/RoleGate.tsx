import React from "react";
import { Eye, Lock } from "lucide-react";
import { useUserRole, AccessLevel, RoleCapabilities } from "@/hooks/useUserRole";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type SectionKey = keyof RoleCapabilities["sections"];

interface RoleGateProps {
  /** The section to check access for */
  section: SectionKey;
  /** Content to render when user has access */
  children: React.ReactNode;
  /** Optional fallback for "view" access (read-only mode) */
  viewFallback?: React.ReactNode;
  /** Optional fallback for "hidden" access */
  hiddenFallback?: React.ReactNode;
  /** If true, shows a "view only" indicator for read-only sections */
  showViewIndicator?: boolean;
  /** If true, completely hides the content when hidden (no fallback) */
  hideCompletely?: boolean;
}

/**
 * RoleGate - Conditionally renders content based on user's role capabilities
 * 
 * Usage:
 * ```tsx
 * <RoleGate section="formulation" showViewIndicator>
 *   <FormulationEditor />
 * </RoleGate>
 * ```
 */
export function RoleGate({
  section,
  children,
  viewFallback,
  hiddenFallback,
  showViewIndicator = false,
  hideCompletely = false,
}: RoleGateProps) {
  const { getAccessLevel, teamRole } = useUserRole();
  const accessLevel = getAccessLevel(section);

  // Hidden - don't render anything or show fallback
  if (accessLevel === "hidden") {
    if (hideCompletely) return null;
    return hiddenFallback ? <>{hiddenFallback}</> : null;
  }

  // View only - render with indicator or fallback
  if (accessLevel === "view") {
    if (viewFallback) {
      return <>{viewFallback}</>;
    }
    
    if (showViewIndicator) {
      return (
        <div className="relative">
          <ViewOnlyIndicator section={section} />
          <div className="pointer-events-none opacity-90">
            {children}
          </div>
        </div>
      );
    }
    
    return <>{children}</>;
  }

  // Full access - render normally
  return <>{children}</>;
}

/**
 * ViewOnlyIndicator - Shows a badge indicating view-only access
 */
function ViewOnlyIndicator({ section }: { section: SectionKey }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 bg-muted/80 backdrop-blur-sm rounded-md text-xs text-muted-foreground border border-border">
          <Eye className="w-3 h-3" />
          <span>View Only</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>You have read-only access to this section</p>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * RoleEditLock - Wraps editable content and shows lock for view-only users
 */
interface RoleEditLockProps {
  section: SectionKey;
  children: React.ReactNode;
  className?: string;
}

export function RoleEditLock({ section, children, className }: RoleEditLockProps) {
  const { canEdit } = useUserRole();
  const hasEditAccess = canEdit(section);

  if (hasEditAccess) {
    return <>{children}</>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn("relative cursor-not-allowed", className)}>
          <div className="pointer-events-none opacity-60">
            {children}
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <Lock className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>You don't have edit access to this section</p>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * useCanEditSection - Simple hook to check if user can edit a section
 */
export function useCanEditSection(section: SectionKey): boolean {
  const { canEdit } = useUserRole();
  return canEdit(section);
}

/**
 * useCanViewSection - Simple hook to check if user can view a section
 */
export function useCanViewSection(section: SectionKey): boolean {
  const { canView } = useUserRole();
  return canView(section);
}

/**
 * useSectionAccess - Returns the access level for a section
 */
export function useSectionAccess(section: SectionKey): AccessLevel {
  const { getAccessLevel } = useUserRole();
  return getAccessLevel(section);
}
