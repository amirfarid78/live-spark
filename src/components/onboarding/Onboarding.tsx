import React, { useState, useEffect } from "react";
import { ChevronRight, Radio, Video, Users, Gift, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    id: 1,
    icon: Video,
    title: "Endless Entertainment",
    description: "Discover millions of short videos from creators around the world. Swipe to explore content tailored just for you.",
    gradient: "from-purple-500 via-pink-500 to-orange-500",
    iconBg: "from-purple-500 to-pink-500",
  },
  {
    id: 2,
    icon: Radio,
    title: "Go Live Anytime",
    description: "Share your moments live with fans worldwide. Host streams, join battles, and connect in real-time.",
    gradient: "from-red-500 via-orange-500 to-yellow-500",
    iconBg: "from-red-500 to-orange-500",
  },
  {
    id: 3,
    icon: Users,
    title: "Build Your Community",
    description: "Follow creators, chat with friends, and join audio rooms. Your community is waiting for you.",
    gradient: "from-blue-500 via-cyan-500 to-teal-500",
    iconBg: "from-blue-500 to-cyan-500",
  },
  {
    id: 4,
    icon: Gift,
    title: "Support & Earn",
    description: "Send virtual gifts to your favorite creators or receive them from your fans. Turn your passion into rewards.",
    gradient: "from-yellow-500 via-orange-500 to-red-500",
    iconBg: "from-yellow-500 to-orange-500",
  },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide(currentSlide + 1);
        setIsAnimating(false);
      }, 150);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col">
      {/* Skip Button */}
      <div className="absolute top-4 right-4 pt-safe z-10">
        <Button 
          variant="ghost" 
          onClick={handleSkip}
          className="text-muted-foreground font-medium press-effect"
        >
          Skip
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Animated Icon */}
        <div className={cn(
          "relative mb-12 transition-all duration-300",
          isAnimating ? "opacity-0 scale-90" : "opacity-100 scale-100"
        )}>
          {/* Glow Effect */}
          <div className={cn(
            "absolute inset-0 rounded-[40px] bg-gradient-to-br blur-3xl opacity-40 scale-150",
            slide.iconBg
          )} />
          
          {/* Icon Container */}
          <div className={cn(
            "relative flex h-32 w-32 items-center justify-center rounded-[40px] bg-gradient-to-br shadow-2xl",
            slide.iconBg
          )}>
            <Icon className="h-16 w-16 text-white" strokeWidth={1.5} />
          </div>
          
          {/* Floating particles */}
          <div className="absolute -top-4 -right-4 h-6 w-6 rounded-full bg-gradient-to-br from-white/40 to-white/10 animate-float" style={{ animationDelay: '0s' }} />
          <div className="absolute -bottom-2 -left-6 h-4 w-4 rounded-full bg-gradient-to-br from-white/30 to-white/10 animate-float" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-1/2 -right-8 h-3 w-3 rounded-full bg-gradient-to-br from-white/20 to-white/5 animate-float" style={{ animationDelay: '1s' }} />
        </div>

        {/* Text Content */}
        <div className={cn(
          "text-center max-w-sm transition-all duration-300",
          isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        )}>
          <h1 className="text-3xl font-bold mb-4 tracking-tight">{slide.title}</h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            {slide.description}
          </p>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="px-8 pb-12 pb-safe">
        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAnimating(true);
                setTimeout(() => {
                  setCurrentSlide(index);
                  setIsAnimating(false);
                }, 150);
              }}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentSlide 
                  ? "w-8 bg-gradient-to-r from-primary to-stream-coral" 
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>

        {/* Action Button */}
        <Button 
          onClick={handleNext}
          className="w-full h-14 rounded-2xl bg-gradient-primary hover:opacity-90 text-white font-semibold text-lg shadow-xl shadow-primary/30 press-effect"
        >
          {currentSlide === slides.length - 1 ? (
            <>
              Get Started
              <Sparkles className="ml-2 h-5 w-5" />
            </>
          ) : (
            <>
              Continue
              <ChevronRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>

        {/* Terms Text */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          By continuing, you agree to our{" "}
          <span className="text-primary">Terms of Service</span> and{" "}
          <span className="text-primary">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
