import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
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
  // Sync cart with Shopify when user returns from checkout
  useCartSync();
  // PWA update notification
  const [waitingWorker, setWaitingWorker] = useState(null);
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg && reg.waiting) {
          setWaitingWorker(reg.waiting);
          setShowUpdate(true);
        }
      });
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
      navigator.serviceWorker.addEventListener('updatefound', () => {
        const reg = navigator.serviceWorker.ready;
        reg.then(r => {
          if (r.installing) {
            r.installing.addEventListener('statechange', () => {
              if (r.waiting) {
                setWaitingWorker(r.waiting);
                setShowUpdate(true);
              }
            });
          }
        });
      });
    }
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    setShowUpdate(false);
  };

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem("streamverse_onboarding_complete");
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
    setIsLoading(false);

    // Listen for beforeinstallprompt event
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem("streamverse_onboarding_complete", "true");
    setShowOnboarding(false);
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstall(false);
      }
      setDeferredPrompt(null);
    }
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
      {/* PWA Update Notification */}
      {showUpdate && (
        <div style={{
          position: 'fixed',
          bottom: 90,
          right: 24,
          zIndex: 1001,
          background: '#18181B',
          color: '#fff',
          borderRadius: 16,
          padding: '16px 24px',
          boxShadow: '0 4px 16px rgba(124,58,237,0.15)',
          fontWeight: 600,
        }}>
          <span style={{marginRight: 16}}>A new version is available.</span>
          <button
            onClick={handleUpdate}
            style={{
              background: 'linear-gradient(90deg,#7C3AED,#F97316)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '8px 16px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Update Now
          </button>
        </div>
      )}
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
      {/* Floating Install PWA Button */}
      {showInstall && (
        <button
          onClick={handleInstallClick}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
            background: 'linear-gradient(90deg,#7C3AED,#F97316)',
            color: '#fff',
            border: 'none',
            borderRadius: 16,
            padding: '12px 24px',
            fontWeight: 700,
            fontSize: 18,
            boxShadow: '0 4px 16px rgba(124,58,237,0.15)',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          Install StreamVerse App
        </button>
      )}
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
