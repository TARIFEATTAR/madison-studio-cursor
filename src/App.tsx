import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import React from "react";
import { supabase } from "@/integrations/supabase/client";

import Navigation from "./components/Navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";

import Index from "./pages/Index";
import DashboardNew from "./pages/DashboardNew";
import Library from "./pages/Library";
import Create from "./pages/Create";
import ContentEditor from "./pages/ContentEditor";
import Repurpose from "./pages/Repurpose";
import Multiply from "./pages/Multiply";
import Templates from "./pages/Templates";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import MeetMadison from "./pages/MeetMadison";
import HelpCenter from "./pages/HelpCenter";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Marketplace from "./pages/Marketplace";
import MarketplaceLibrary from "./pages/MarketplaceLibrary";
import CreateEtsyListing from "./pages/marketplace/CreateEtsyListing";
import CreateTikTokShopListing from "./pages/marketplace/CreateTikTokShopListing";
import CreateShopifyListing from "./pages/marketplace/CreateShopifyListing";
import BrandHealth from "./pages/BrandHealth";
import ImageEditor from "./pages/ImageEditor";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useOnboarding } from "@/hooks/useOnboarding";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EcommerceGuard } from "./components/guards/EcommerceGuard";

const queryClient = new QueryClient();

const RouteErrorBoundary = ({ children, routeName }: { children: React.ReactNode; routeName: string }) => {
  const navigate = useNavigate();
  
  return (
    <ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h2 className="text-2xl font-bold">Error in {routeName}</h2>
          <p className="text-muted-foreground">Something went wrong on this page.</p>
          <div className="flex gap-3">
            <Button onClick={() => window.location.reload()}>Reload Page</Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground text-lg font-serif">Loading The Codex...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const RootRoute = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) return;
    
    const checkOnboardingStatus = async () => {
      // Check database for organization with brand_config
      const { data: orgMember } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (!orgMember?.organization_id) {
        navigate('/onboarding', { replace: true });
        return;
      }

      const { data: org } = await supabase
        .from("organizations")
        .select("brand_config")
        .eq("id", orgMember.organization_id)
        .single();

      // If organization has brand info, consider onboarding complete
      const hasBrandInfo = org?.brand_config && 
        typeof org.brand_config === 'object' && 
        'industry' in org.brand_config;

      if (!hasBrandInfo) {
        navigate('/onboarding', { replace: true });
      } else {
        // Sync localStorage with database state
        localStorage.setItem(`onboarding_completed_${user.id}`, "true");
      }
    };

    checkOnboardingStatus();
  }, [user, navigate]);
  
  return <DashboardNew />;
};

const AppContent = () => {
  console.log("[App-Con]");
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize onboarding for org creation only (no modals shown globally)
  useOnboarding();
  
  // Show sidebar for authenticated users on all pages except /auth, /editor, and /onboarding
  const showSidebar = user && location.pathname !== "/auth" && location.pathname !== "/editor" && location.pathname !== "/onboarding";

  return (
    <>
      {showSidebar ? (
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            <main className="flex-1 overflow-auto pt-0">
              <div className="pt-16 md:pt-0">
                <Routes>
                  <Route path="/" element={<ProtectedRoute><RouteErrorBoundary routeName="Dashboard"><RootRoute /></RouteErrorBoundary></ProtectedRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute><RouteErrorBoundary routeName="Dashboard"><DashboardNew /></RouteErrorBoundary></ProtectedRoute>} />
                  <Route path="/library" element={<ProtectedRoute><RouteErrorBoundary routeName="Library"><Library /></RouteErrorBoundary></ProtectedRoute>} />
                  <Route path="/create" element={<ProtectedRoute><RouteErrorBoundary routeName="Create"><Create /></RouteErrorBoundary></ProtectedRoute>} />
                  <Route path="/editor" element={<ProtectedRoute><RouteErrorBoundary routeName="Editor"><ContentEditor /></RouteErrorBoundary></ProtectedRoute>} />
                  <Route path="/multiply" element={<ProtectedRoute><RouteErrorBoundary routeName="Multiply"><Multiply /></RouteErrorBoundary></ProtectedRoute>} />
                  <Route path="/marketplace" element={<ProtectedRoute><EcommerceGuard><RouteErrorBoundary routeName="Marketplace"><Marketplace /></RouteErrorBoundary></EcommerceGuard></ProtectedRoute>} />
                  <Route path="/marketplace-library" element={<ProtectedRoute><EcommerceGuard><RouteErrorBoundary routeName="Listing Templates"><MarketplaceLibrary /></RouteErrorBoundary></EcommerceGuard></ProtectedRoute>} />
                  <Route path="/marketplace/etsy" element={<ProtectedRoute><EcommerceGuard><RouteErrorBoundary routeName="Create Etsy Listing"><CreateEtsyListing /></RouteErrorBoundary></EcommerceGuard></ProtectedRoute>} />
                  <Route path="/marketplace/tiktok_shop" element={<ProtectedRoute><EcommerceGuard><RouteErrorBoundary routeName="Create TikTok Shop Listing"><CreateTikTokShopListing /></RouteErrorBoundary></EcommerceGuard></ProtectedRoute>} />
                  <Route path="/marketplace/shopify" element={<ProtectedRoute><EcommerceGuard><RouteErrorBoundary routeName="Create Shopify Listing"><CreateShopifyListing /></RouteErrorBoundary></EcommerceGuard></ProtectedRoute>} />
                  <Route path="/templates" element={<ProtectedRoute><RouteErrorBoundary routeName="Templates"><Templates /></RouteErrorBoundary></ProtectedRoute>} />
                  <Route path="/image-editor" element={<ProtectedRoute><RouteErrorBoundary routeName="Image Editor"><ImageEditor /></RouteErrorBoundary></ProtectedRoute>} />
                  <Route path="/schedule" element={<ProtectedRoute><RouteErrorBoundary routeName="Calendar"><Calendar /></RouteErrorBoundary></ProtectedRoute>} />
                  <Route path="/calendar" element={<ProtectedRoute><RouteErrorBoundary routeName="Calendar"><Calendar /></RouteErrorBoundary></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><RouteErrorBoundary routeName="Settings"><Settings /></RouteErrorBoundary></ProtectedRoute>} />
                  <Route path="/meet-madison" element={<ProtectedRoute><RouteErrorBoundary routeName="Meet Madison"><MeetMadison /></RouteErrorBoundary></ProtectedRoute>} />
                  <Route path="/help-center" element={<ProtectedRoute><RouteErrorBoundary routeName="Help Center"><HelpCenter /></RouteErrorBoundary></ProtectedRoute>} />
                  <Route path="/brand-health" element={<ProtectedRoute><RouteErrorBoundary routeName="Brand Health"><BrandHealth /></RouteErrorBoundary></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </main>
          </div>
        </SidebarProvider>
      ) : (
        <>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<ProtectedRoute><RouteErrorBoundary routeName="Onboarding"><Onboarding /></RouteErrorBoundary></ProtectedRoute>} />
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<ProtectedRoute><RouteErrorBoundary routeName="Dashboard"><DashboardNew /></RouteErrorBoundary></ProtectedRoute>} />
            <Route path="/library" element={<ProtectedRoute><RouteErrorBoundary routeName="Library"><Library /></RouteErrorBoundary></ProtectedRoute>} />
            <Route path="/create" element={<ProtectedRoute><RouteErrorBoundary routeName="Create"><Create /></RouteErrorBoundary></ProtectedRoute>} />
            <Route path="/editor" element={<ProtectedRoute><RouteErrorBoundary routeName="Editor"><ContentEditor /></RouteErrorBoundary></ProtectedRoute>} />
            <Route path="/multiply" element={<ProtectedRoute><RouteErrorBoundary routeName="Multiply"><Multiply /></RouteErrorBoundary></ProtectedRoute>} />
            <Route path="/marketplace" element={<ProtectedRoute><EcommerceGuard><RouteErrorBoundary routeName="Marketplace"><Marketplace /></RouteErrorBoundary></EcommerceGuard></ProtectedRoute>} />
            <Route path="/marketplace-library" element={<ProtectedRoute><EcommerceGuard><RouteErrorBoundary routeName="Listing Templates"><MarketplaceLibrary /></RouteErrorBoundary></EcommerceGuard></ProtectedRoute>} />
            <Route path="/marketplace/etsy" element={<ProtectedRoute><EcommerceGuard><RouteErrorBoundary routeName="Create Etsy Listing"><CreateEtsyListing /></RouteErrorBoundary></EcommerceGuard></ProtectedRoute>} />
            <Route path="/marketplace/tiktok_shop" element={<ProtectedRoute><EcommerceGuard><RouteErrorBoundary routeName="Create TikTok Shop Listing"><CreateTikTokShopListing /></RouteErrorBoundary></EcommerceGuard></ProtectedRoute>} />
            <Route path="/marketplace/shopify" element={<ProtectedRoute><EcommerceGuard><RouteErrorBoundary routeName="Create Shopify Listing"><CreateShopifyListing /></RouteErrorBoundary></EcommerceGuard></ProtectedRoute>} />
            <Route path="/templates" element={<ProtectedRoute><RouteErrorBoundary routeName="Templates"><Templates /></RouteErrorBoundary></ProtectedRoute>} />
            <Route path="/schedule" element={<ProtectedRoute><RouteErrorBoundary routeName="Calendar"><Calendar /></RouteErrorBoundary></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><RouteErrorBoundary routeName="Calendar"><Calendar /></RouteErrorBoundary></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><RouteErrorBoundary routeName="Settings"><Settings /></RouteErrorBoundary></ProtectedRoute>} />
            <Route path="/meet-madison" element={<ProtectedRoute><RouteErrorBoundary routeName="Meet Madison"><MeetMadison /></RouteErrorBoundary></ProtectedRoute>} />
            <Route path="/help-center" element={<ProtectedRoute><RouteErrorBoundary routeName="Help Center"><HelpCenter /></RouteErrorBoundary></ProtectedRoute>} />
            <Route path="/brand-health" element={<ProtectedRoute><RouteErrorBoundary routeName="Brand Health"><BrandHealth /></RouteErrorBoundary></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </>
      )}
    </>
  );
};

const App = () => {
  console.log("[App] App component rendering...");
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
