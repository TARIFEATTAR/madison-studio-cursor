import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import React from "react";

import Navigation from "./components/Navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";

import Index from "./pages/Index";
import DashboardNew from "./pages/DashboardNew";
import Library from "./pages/Library";
import ForgeNew from "./pages/ForgeNew";
import ContentEditor from "./pages/ContentEditor";
import Repurpose from "./pages/Repurpose";
import Multiply from "./pages/Multiply";
import Templates from "./pages/Templates";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import MeetMadison from "./pages/MeetMadison";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useOnboarding } from "@/hooks/useOnboarding";

const queryClient = new QueryClient();

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
  const { isLoading, onboardingStep } = useOnboarding();
  
  // Show loading state while checking onboarding
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-xl">Loading...</div>
      </div>
    );
  }
  
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
            <main className="flex-1 overflow-auto pt-0 md:pt-0">
              <div className="pt-16 md:pt-0">
                <Routes>
                  <Route path="/" element={<ProtectedRoute><RootRoute /></ProtectedRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute><DashboardNew /></ProtectedRoute>} />
                  <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
                  <Route path="/create" element={<ProtectedRoute><ForgeNew /></ProtectedRoute>} />
                  <Route path="/editor" element={<ProtectedRoute><ContentEditor /></ProtectedRoute>} />
                  <Route path="/multiply" element={<ProtectedRoute><Multiply /></ProtectedRoute>} />
                  <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
                  <Route path="/schedule" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  <Route path="/meet-madison" element={<ProtectedRoute><MeetMadison /></ProtectedRoute>} />
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
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardNew /></ProtectedRoute>} />
            <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
            <Route path="/create" element={<ProtectedRoute><ForgeNew /></ProtectedRoute>} />
            <Route path="/editor" element={<ProtectedRoute><ContentEditor /></ProtectedRoute>} />
            <Route path="/multiply" element={<ProtectedRoute><Multiply /></ProtectedRoute>} />
            <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
            <Route path="/schedule" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/meet-madison" element={<ProtectedRoute><MeetMadison /></ProtectedRoute>} />
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
