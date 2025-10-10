import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

import Navigation from "./components/Navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";

import Index from "./pages/Index";
import DashboardNew from "./pages/DashboardNew";
import Reservoir from "./pages/Reservoir";
import Forge from "./pages/Forge";
import ForgeNew from "./pages/ForgeNew";
import ContentEditor from "./pages/ContentEditor";
import Repurpose from "./pages/Repurpose";
import Templates from "./pages/Templates";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import MeetMadison from "./pages/MeetMadison";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
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
  console.log("[App-Con]");
  const { user } = useAuth();
  const location = useLocation();

  // Show sidebar for authenticated users on all pages except /auth, /editor, and /onboarding
  const showSidebar = user && location.pathname !== "/auth" && location.pathname !== "/editor" && location.pathname !== "/onboarding";

  return (
    <>
      {!showSidebar && user && location.pathname !== "/editor" && <Navigation />}
      
      {showSidebar ? (
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            <main className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<ProtectedRoute><DashboardNew /></ProtectedRoute>} />
                <Route path="/library" element={<ProtectedRoute><Reservoir /></ProtectedRoute>} />
                <Route path="/create" element={<ProtectedRoute><ForgeNew /></ProtectedRoute>} />
                <Route path="/editor" element={<ProtectedRoute><ContentEditor /></ProtectedRoute>} />
                <Route path="/multiply" element={<ProtectedRoute><Repurpose /></ProtectedRoute>} />
                <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
                <Route path="/schedule" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/meet-madison" element={<ProtectedRoute><MeetMadison /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </SidebarProvider>
      ) : (
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/" element={<Index />} />
          <Route path="/library" element={<ProtectedRoute><Reservoir /></ProtectedRoute>} />
          <Route path="/create" element={<ProtectedRoute><ForgeNew /></ProtectedRoute>} />
          <Route path="/editor" element={<ProtectedRoute><ContentEditor /></ProtectedRoute>} />
          <Route path="/multiply" element={<ProtectedRoute><Repurpose /></ProtectedRoute>} />
          <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
          <Route path="/schedule" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
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
