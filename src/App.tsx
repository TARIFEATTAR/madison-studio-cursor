import { Toaster } from "@/components/ui/toaster";

import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "./components/Navigation";
import Index from "./pages/Index";
import Reservoir from "./pages/Reservoir";
import Forge from "./pages/Forge";
import Repurpose from "./pages/Repurpose";
import Archive from "./pages/Archive";
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
  
  // Hide global navigation on landing page for non-authenticated users
  const showNavigation = !(location.pathname === '/' && !user);
  console.log("[AppContent] Show navigation:", showNavigation);

  return (
    <> 
      {showNavigation && <Navigation />}
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<Index />} />
        <Route path="/index.html" element={<Navigate to="/" replace />} />
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
          path="/archive"
          element={
            <ProtectedRoute>
              <Archive />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
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
