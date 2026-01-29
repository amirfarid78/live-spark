import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { 
  Headphones, 
  Mail, 
  Smartphone, 
  User, 
  Check,
  Sparkles
} from "lucide-react";

export default function Login() {
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Welcome back!", description: "You've successfully logged in" });
      navigate("/");
    }
  };

  const handleSocialLogin = (provider: string) => {
    toast({ title: "Coming Soon", description: `${provider} login will be available soon` });
  };

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&auto=format&fit=crop&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />
      </div>

      {/* Support Button */}
      <div className="absolute top-4 right-4 z-20 pt-safe">
        <button className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center press-effect">
          <Headphones className="h-6 w-6 text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-between pt-safe pb-safe">
        {/* Logo Section */}
        <div className="px-6 pt-16 md:pt-20 lg:pt-24">
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg">
              <Sparkles className="h-7 w-7 md:h-8 md:w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                StreamVerse
              </h1>
              <p className="text-white/80 text-sm md:text-base">
                From strangers to friends
              </p>
            </div>
          </div>
        </div>

        {/* Login Options */}
        <div className="px-4 md:px-6 lg:px-8 pb-6 md:pb-10 max-w-md mx-auto w-full">
          {!showEmailLogin ? (
            <div className="space-y-3 animate-fade-in-up">
              {/* Latest Login Badge */}
              <div className="flex justify-end mb-2">
                <span className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  Latest Login
                </span>
              </div>

              {/* Google Login */}
              <Button
                onClick={() => handleSocialLogin("Google")}
                className="w-full h-14 rounded-full bg-white hover:bg-white/95 text-gray-700 font-medium shadow-lg press-effect"
              >
                <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Log in with Google
              </Button>

              {/* Apple Login */}
              <Button
                onClick={() => handleSocialLogin("Apple")}
                className="w-full h-14 rounded-full bg-white hover:bg-white/95 text-gray-700 font-medium shadow-lg press-effect"
              >
                <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Log in with Apple
              </Button>

              {/* More Login Methods Divider */}
              <div className="flex items-center gap-4 py-4">
                <div className="flex-1 h-px bg-white/30" />
                <span className="text-white/70 text-sm">More Login Methods</span>
                <div className="flex-1 h-px bg-white/30" />
              </div>

              {/* Additional Login Methods */}
              <div className="flex justify-center gap-6">
                <button 
                  onClick={() => handleSocialLogin("Phone")}
                  className="h-14 w-14 rounded-full bg-white shadow-lg flex items-center justify-center press-effect"
                >
                  <Smartphone className="h-6 w-6 text-gray-700" />
                </button>
                <button 
                  onClick={() => handleSocialLogin("Guest")}
                  className="h-14 w-14 rounded-full bg-white shadow-lg flex items-center justify-center press-effect"
                >
                  <User className="h-6 w-6 text-gray-700" />
                </button>
                <button 
                  onClick={() => setShowEmailLogin(true)}
                  className="h-14 w-14 rounded-full bg-white shadow-lg flex items-center justify-center press-effect"
                >
                  <Mail className="h-6 w-6 text-gray-700" />
                </button>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setAgreedToTerms(!agreedToTerms)}
                  className={cn(
                    "h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                    agreedToTerms 
                      ? "bg-primary border-primary" 
                      : "border-white/50 bg-white/10"
                  )}
                >
                  {agreedToTerms && <Check className="h-3 w-3 text-white" />}
                </button>
                <span className="text-sm text-white/80">
                  By using StreamVerse, you agree to the{" "}
                  <Link to="/terms" className="text-primary underline">Terms of Service</Link>
                  {" "}and{" "}
                  <Link to="/privacy" className="text-primary underline">Privacy Policy</Link>
                </span>
              </div>

              {/* Sign Up Link */}
              <p className="text-center pt-4 text-white/90">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary font-semibold underline">
                  Sign Up
                </Link>
              </p>
            </div>
          ) : (
            /* Email Login Form */
            <div className="animate-fade-in-up">
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl">
                <button 
                  onClick={() => setShowEmailLogin(false)}
                  className="text-sm text-primary mb-4 flex items-center gap-1"
                >
                  ← Back to options
                </button>
                
                <h2 className="text-xl font-bold text-gray-900 mb-4">Login with Email</h2>
                
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 rounded-xl bg-gray-100 border-0 text-gray-900 placeholder:text-gray-500"
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 rounded-xl bg-gray-100 border-0 text-gray-900 placeholder:text-gray-500"
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Link to="/forgot-password" className="text-sm text-primary">
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl bg-gradient-primary hover:opacity-90 text-white font-semibold"
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
