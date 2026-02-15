import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Onboarding } from "@/components/onboarding/Onboarding";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useCartSync } from "@/hooks/useCartSync";
import { Sparkles } from "lucide-react";
import Live from "./pages/Live";
import Discover from "./pages/Discover";
import Feed from "./pages/Feed";
import Create from "./pages/Create";
import VideoRecorder from "./pages/VideoRecorder";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import CreatorStudio from "./pages/CreatorStudio";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Agency from "./pages/Agency";
import StoreManagement from "./pages/StoreManagement";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center animate-pulse">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <div className="h-2 w-24 rounded-full bg-muted animate-pulse" />
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Auth Route wrapper (redirect to app if already logged in)
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center animate-pulse">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <div className="h-2 w-24 rounded-full bg-muted animate-pulse" />
        </div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function AppContent() {
  useCartSync();

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem("streamverse_onboarding_complete");
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
    setIsLoading(false);
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem("streamverse_onboarding_complete", "true");
    setShowOnboarding(false);
  };

  // Show loading while checking initial state
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-20 w-20 rounded-2xl bg-gradient-primary flex items-center justify-center animate-pulse shadow-2xl shadow-primary/30">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gradient">Snap Live</h1>
          <div className="h-1.5 w-32 rounded-full bg-muted overflow-hidden">
            <div className="h-full w-1/2 rounded-full bg-gradient-primary animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Show onboarding for first-time users
  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes - redirect to app if logged in */}
        <Route path="/login" element={
          <AuthRoute>
            <Login />
          </AuthRoute>
        } />
        <Route path="/signup" element={
          <AuthRoute>
            <Signup />
          </AuthRoute>
        } />
        
        {/* Feed page - uses AppShell without right sidebar */}
        <Route element={<AppShell showRightSidebar={false} />}>
          <Route path="/" element={<Feed />} />
          <Route path="/feed" element={<Feed />} />
        </Route>

        {/* Other pages with full AppShell */}
        <Route element={<AppShell />}>
          <Route path="/discover" element={<Discover />} />
          <Route path="/live" element={<Live />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/messages" element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={<Profile />} />
          <Route path="/creator-studio" element={
            <ProtectedRoute>
              <CreatorStudio />
            </ProtectedRoute>
          } />
          <Route path="/agency" element={<Agency />} />
          <Route path="/store-management" element={
            <ProtectedRoute>
              <StoreManagement />
            </ProtectedRoute>
          } />
        </Route>
        
        {/* Settings - no shell, full page */}
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />

        {/* Admin panel - no shell, full page */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } />

        {/* Shop product detail - no shell */}
        <Route path="/shop/product/:handle" element={<ProductDetail />} />
        
        {/* Protected routes without shell */}
        <Route path="/create" element={
          <ProtectedRoute>
            <Create />
          </ProtectedRoute>
        } />
        <Route path="/record" element={
          <ProtectedRoute>
            <VideoRecorder />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
