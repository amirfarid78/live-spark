import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { 
  Camera, 
  Check, 
  ChevronDown,
  ArrowLeft,
  User
} from "lucide-react";
import logo from "@/assets/logo.png";

export default function Signup() {
  const [step, setStep] = useState<'initial' | 'profile'>('initial');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  // Password strength
  const hasMinLength = password.length >= 8;

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    if (!hasMinLength) {
      toast({ title: "Error", description: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }

    if (!agreedToTerms) {
      toast({ title: "Error", description: "Please agree to the terms", variant: "destructive" });
      return;
    }

    setStep('profile');
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nickname) {
      toast({ title: "Error", description: "Please enter a nickname", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, { 
      username: nickname.toLowerCase().replace(/\s/g, '_'),
      display_name: nickname 
    });
    setLoading(false);

    if (error) {
      toast({ title: "Signup Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Welcome to Snap Live!", description: "Your account has been created" });
      navigate("/");
    }
  };

  if (step === 'profile') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Purple Header with Illustration */}
        <div className="relative bg-gradient-to-br from-primary via-primary to-stream-purple-light overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 left-1/4 w-20 h-20 bg-white/20 rounded-full blur-xl" />
            <div className="absolute top-8 right-1/4 w-32 h-32 bg-stream-coral/20 rounded-full blur-xl" />
          </div>
          
          <div className="relative pt-safe px-4 pb-8">
            <button 
              onClick={() => setStep('initial')}
              className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center mt-4 press-effect"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>
            
            {/* Logo Characters */}
            <div className="flex justify-center items-end gap-4 mt-4 mb-2">
              <img 
                src={logo} 
                alt="Snap Live" 
                className="w-32 h-32 md:w-40 md:h-40 rounded-3xl shadow-2xl object-cover"
              />
            </div>
            
            {/* Brand Badge */}
            <div className="absolute bottom-6 right-6 text-white/60 font-medium text-sm tracking-wide rotate-[-15deg]">
              SNAP LIVE
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="flex-1 bg-background rounded-t-[2rem] -mt-4 relative z-10 px-6 py-8 md:px-8">
          <form onSubmit={handleProfileSubmit} className="max-w-md mx-auto">
            {/* Header with Avatar */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold">Complete personal data</h1>
                <p className="text-muted-foreground mt-1">Let everyone know you better</p>
              </div>
              
              {/* Profile Photo */}
              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <button 
                  type="button"
                  className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <p className="text-xs text-muted-foreground text-center mt-2">Profile</p>
              </div>
            </div>

            {/* Nickname */}
            <div className="space-y-2 mb-6">
              <Label className="text-muted-foreground">Nickname</Label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Enter your nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="h-14 rounded-xl bg-secondary border-0 pr-10 text-lg"
                />
                {nickname && (
                  <button 
                    type="button"
                    onClick={() => setNickname("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-muted-foreground/20 flex items-center justify-center"
                  >
                    <span className="text-muted-foreground text-sm">×</span>
                  </button>
                )}
              </div>
            </div>

            {/* Date of Birth */}
            <div className="space-y-2 mb-6">
              <Label className="text-muted-foreground">Date of Birth</Label>
              <Input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="h-14 rounded-xl bg-secondary border-0 text-lg"
              />
            </div>

            {/* Country */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2">
                <Label className="text-muted-foreground">Country</Label>
                <span className="text-destructive text-xs">* Not to be altered once set</span>
              </div>
              <button
                type="button"
                className="w-full h-14 rounded-xl bg-secondary border-0 px-4 flex items-center justify-between text-lg"
              >
                <span className="flex items-center gap-2">
                  <span>🇵🇰</span>
                  <span>Pakistan</span>
                </span>
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {/* Gender Selection */}
            <div className="space-y-2 mb-8">
              <div className="flex items-center gap-2">
                <Label className="text-muted-foreground">Gender</Label>
                <span className="text-destructive text-xs">* Not to be altered once set</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={cn(
                    "h-14 rounded-xl border-2 flex items-center justify-center gap-2 font-medium transition-all press-effect",
                    gender === 'male' 
                      ? "border-primary bg-primary/10 text-primary" 
                      : "border-border bg-secondary text-foreground"
                  )}
                >
                  <span>Male</span>
                  <span className="text-2xl">👨</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={cn(
                    "h-14 rounded-xl border-2 flex items-center justify-center gap-2 font-medium transition-all press-effect",
                    gender === 'female' 
                      ? "border-primary bg-primary/10 text-primary" 
                      : "border-border bg-secondary text-foreground"
                  )}
                >
                  <span>Female</span>
                  <span className="text-2xl">👩</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !nickname}
              className="w-full h-14 rounded-xl bg-gradient-primary hover:opacity-90 text-white font-semibold text-lg"
            >
              {loading ? "Creating account..." : "Complete Registration"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Initial Step - Email & Password
  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1523365280197-f1783db9fe62?w=1200&auto=format&fit=crop&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/70" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4 pt-safe">
        <Link 
          to="/login" 
          className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center press-effect"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </Link>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-end pb-safe">
        <div className="px-4 md:px-6 lg:px-8 pb-6 md:pb-10 max-w-md mx-auto w-full">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl animate-fade-in-up">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-6">
              <img 
                src={logo} 
                alt="Snap Live" 
                className="h-12 w-12 rounded-xl shadow-lg object-cover"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Create Account</h1>
                <p className="text-gray-500 text-sm">Join Snap Live today</p>
              </div>
            </div>

            <form onSubmit={handleInitialSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <Label className="text-gray-600 text-sm">Email</Label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl bg-gray-100 border-0 mt-1.5 text-gray-900 placeholder:text-gray-500"
                />
              </div>

              {/* Password */}
              <div>
                <Label className="text-gray-600 text-sm">Password</Label>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl bg-gray-100 border-0 mt-1.5 text-gray-900 placeholder:text-gray-500"
                />
                {password && (
                  <div className="flex items-center gap-2 mt-2">
                    <Check className={cn("h-4 w-4", hasMinLength ? "text-green-500" : "text-gray-400")} />
                    <span className={cn("text-xs", hasMinLength ? "text-green-500" : "text-gray-400")}>
                      At least 8 characters
                    </span>
                  </div>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAgreedToTerms(!agreedToTerms)}
                  className={cn(
                    "h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                    agreedToTerms 
                      ? "bg-primary border-primary" 
                      : "border-gray-300"
                  )}
                >
                  {agreedToTerms && <Check className="h-3 w-3 text-white" />}
                </button>
                <span className="text-sm text-gray-600">
                  I agree to the{" "}
                  <Link to="/terms" className="text-primary underline">Terms of Service</Link>
                  {" "}and{" "}
                  <Link to="/privacy" className="text-primary underline">Privacy Policy</Link>
                </span>
              </div>

              <Button
                type="submit"
                disabled={!agreedToTerms}
                className="w-full h-12 rounded-xl bg-gradient-primary hover:opacity-90 text-white font-semibold"
              >
                Continue
              </Button>
            </form>

            {/* Sign In Link */}
            <p className="text-center mt-4 text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-semibold">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
