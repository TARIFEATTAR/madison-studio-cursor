import { Navigate, useNavigate } from "react-router-dom";
import { useIsEcommerceOrg } from "@/hooks/useIndustryConfig";
import { Loader2, ShoppingBag, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

export function EcommerceGuard({ children }: { children: React.ReactNode }) {
  const { isEcommerce, loading } = useIsEcommerceOrg();
  const navigate = useNavigate();
  const [maxWaitReached, setMaxWaitReached] = useState(false);

  // Add a max wait timeout (2 seconds)
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.log("⏰ EcommerceGuard: Max wait reached, checking last known state");
        setMaxWaitReached(true);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [loading]);

  // Show loading for up to 2 seconds
  if (loading && !maxWaitReached) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment-white">
        <Loader2 className="w-8 h-8 animate-spin text-aged-brass" />
      </div>
    );
  }

  // If not e-commerce, show access denied message
  if (!isEcommerce) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment-white p-6">
        <Card className="max-w-md w-full border-aged-brass/20">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-aged-brass/10 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-aged-brass" />
            </div>
            <CardTitle className="text-2xl font-serif">Marketplace Access</CardTitle>
            <CardDescription>
              The Marketplace feature is only available for e-commerce organizations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-charcoal/70 text-center">
              To access Marketplace features, your organization's industry must be set to an e-commerce category (e.g., fragrance, skincare, cosmetics).
            </p>
            <div className="flex flex-col gap-2">
              <Button 
                onClick={() => navigate('/settings')}
                className="w-full bg-aged-brass hover:bg-aged-brass/90"
              >
                <Settings className="w-4 h-4 mr-2" />
                Go to Settings
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="w-full"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
