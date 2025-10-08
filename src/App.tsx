import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Navigation from "./components/Navigation";
import { AppSidebar } from "./components/AppSidebar";
import Index from "./pages/Index";
import Reservoir from "./pages/Reservoir";
import Forge from "./pages/Forge";
import Repurpose from "./pages/Repurpose";
import PromptLibrary from "./pages/PromptLibrary";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { ErrorBoundary } from "./components/ErrorBoundary";
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

const AppContent = () => {
  console.log("[AppContent] Rendering...");
  const location = useLocation();
  console.log("[AppContent] Current location:", location.pathname);
  
  const { user } = useAuth();
  console.log("[AppContent] User state:", user ? "logged in" : "logged out");
  
  // Show landing navigation only on landing page for non-authenticated users
  const showLandingNavigation = location.pathname === '/' && !user;
  // Show app sidebar for authenticated users on all pages except auth
  const showAppSidebar = user && location.pathname !== '/auth';
  console.log("[AppContent] Show landing navigation:", showLandingNavigation);
  console.log("[AppContent] Show app sidebar:", showAppSidebar);

  return (
    <>
      {/* Landing page navigation for unauthenticated users */}
      {showLandingNavigation && <Navigation />}
      
      {/* App layout with sidebar for authenticated users */}
      {showAppSidebar ? (
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <main className="flex-1">
              <div className="sticky top-0 z-40 bg-background border-b border-border/40 p-2">
                <SidebarTrigger />
              </div>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/library" element={<Reservoir />} />
                <Route path="/forge" element={<Forge />} />
                <Route path="/repurpose" element={<Repurpose />} />
                <Route path="/prompt-library" element={<PromptLibrary />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </SidebarProvider>
      ) : (
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Index />} />
          <Route
            path="/library"
            element={
              <ProtectedRoute>
                <Reservoir />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forge"
            element={
              <ProtectedRoute>
                <Forge />
              </ProtectedRoute>
            }
          />
          <Route
            path="/repurpose"
            element={
              <ProtectedRoute>
                <Repurpose />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prompt-library"
            element={
              <ProtectedRoute>
                <PromptLibrary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
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
