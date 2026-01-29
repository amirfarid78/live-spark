import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster"; // App entry
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Onboarding } from "@/components/onboarding/Onboarding";
import { AuthProvider } from "@/contexts/AuthContext";
import Live from "./pages/Live";
import Discover from "./pages/Discover";
import Feed from "./pages/Feed";
import Create from "./pages/Create";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
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

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-primary animate-pulse" />
          <div className="h-2 w-24 rounded-full bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
          <BrowserRouter>
            <Routes>
              {/* Auth routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Feed is the default home - full screen like TikTok */}
              <Route path="/" element={<Feed />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/create" element={<Create />} />
              
              {/* Pages with bottom navigation */}
              <Route element={<MainLayout />}>
                <Route path="/live" element={<Live />} />
                <Route path="/discover" element={<Discover />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
