import { Navigate } from "react-router-dom";
import { useIsEcommerceOrg } from "@/hooks/useIndustryConfig";
import { Loader2 } from "lucide-react";

interface EcommerceGuardProps {
  children: React.ReactNode;
}

export function EcommerceGuard({ children }: EcommerceGuardProps) {
  const { isEcommerce, loading } = useIsEcommerceOrg();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment-white">
        <Loader2 className="w-8 h-8 animate-spin text-aged-brass" />
      </div>
    );
  }

  if (!isEcommerce) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
