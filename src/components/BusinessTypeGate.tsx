import { ReactNode } from "react";
import { useBusinessType } from "@/hooks/useBusinessType";

interface BusinessTypeGateProps {
  /** The section key to check (from enabled_sections) */
  section: string;
  /** Content to show if section is enabled */
  children: ReactNode;
  /** Content to show if section is disabled (optional) */
  fallback?: ReactNode;
  /** If true, shows a loading state while checking */
  showLoading?: boolean;
}

/**
 * Conditionally renders children based on whether a section is enabled
 * for the current organization's business type.
 * 
 * @example
 * <BusinessTypeGate section="ingredients">
 *   <IngredientsPanel />
 * </BusinessTypeGate>
 * 
 * @example
 * <BusinessTypeGate 
 *   section="formulations" 
 *   fallback={<p>Formulations not available for your business type</p>}
 * >
 *   <FormulationsPanel />
 * </BusinessTypeGate>
 */
export function BusinessTypeGate({
  section,
  children,
  fallback = null,
  showLoading = false,
}: BusinessTypeGateProps) {
  const { isSectionEnabled, isLoading } = useBusinessType();

  if (isLoading && showLoading) {
    return (
      <div className="animate-pulse bg-muted rounded-lg h-32" />
    );
  }

  if (!isSectionEnabled(section)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Hook version for more complex conditional logic
 * 
 * @example
 * const { shouldShow, isLoading } = useBusinessTypeGate("ingredients");
 * if (!shouldShow) return null;
 */
export function useBusinessTypeGate(section: string) {
  const { isSectionEnabled, isLoading, config } = useBusinessType();
  
  return {
    shouldShow: isSectionEnabled(section),
    isLoading,
    config,
  };
}

/**
 * Higher-order component version
 * 
 * @example
 * export default withBusinessTypeGate(IngredientsPanel, "ingredients");
 */
export function withBusinessTypeGate<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  section: string,
  FallbackComponent?: React.ComponentType
) {
  return function BusinessTypeGatedComponent(props: P) {
    return (
      <BusinessTypeGate 
        section={section} 
        fallback={FallbackComponent ? <FallbackComponent /> : null}
      >
        <WrappedComponent {...props} />
      </BusinessTypeGate>
    );
  };
}
