import { Navigate } from "react-router-dom";
import { useIsEcommerceOrg } from "@/hooks/useIndustryConfig";
import { Loader2 } from "lucide-react";

export function EcommerceGuard({ children }: { children: React.ReactNode }) {
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
