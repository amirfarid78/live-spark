import React, { useState } from "react";
import { ChevronRight, Radio, Video, Users, Gift, Sparkles, Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    id: 1,
    icon: Video,
    title: "Live Streaming",
    description: "Watch live streams from creators worldwide. Share your moments and connect with millions of viewers in real-time.",
    gradient: "from-stream-purple via-primary to-stream-coral",
    iconBg: "from-stream-purple to-primary",
    bgImage: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80",
    accentColor: "text-stream-purple",
  },
  {
    id: 2,
    icon: Users,
    title: "Meet New Friends",
    description: "Connect with people from around the globe. Join voice rooms, chat live, and build your community.",
    gradient: "from-stream-cyan via-blue-500 to-primary",
    iconBg: "from-stream-cyan to-blue-500",
    bgImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80",
    accentColor: "text-stream-cyan",
  },
  {
    id: 3,
    icon: Gift,
    title: "Give & Receive Gifts",
    description: "Support your favorite creators with virtual gifts. Earn diamonds and convert them to real rewards.",
    gradient: "from-stream-gold via-yellow-500 to-orange-500",
    iconBg: "from-stream-gold to-orange-500",
    bgImage: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80",
    accentColor: "text-stream-gold",
  },
  {
    id: 4,
    icon: Heart,
    title: "From Strangers to Friends",
    description: "Start your journey today. Create unforgettable moments and find your tribe on Snap Live.",
    gradient: "from-stream-coral via-pink-500 to-stream-purple",
    iconBg: "from-stream-coral to-pink-500",
    bgImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80",
    accentColor: "text-stream-coral",
  },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide(currentSlide + 1);
        setIsAnimating(false);
      }, 200);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide(currentSlide - 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    setTouchStart(null);
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div 
      className="fixed inset-0 z-[100] flex flex-col overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Image */}
      <div 
        className={cn(
          "absolute inset-0 bg-cover bg-center transition-opacity duration-500",
          isAnimating ? "opacity-0" : "opacity-100"
        )}
        style={{ backgroundImage: `url('${slide.bgImage}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/80" />
      </div>

      {/* Animated Background Gradient */}
      <div className={cn(
        "absolute inset-0 opacity-40 transition-all duration-500",
        `bg-gradient-to-br ${slide.gradient}`
      )} />

      {/* Skip Button */}
      <div className="relative z-20 flex justify-end p-4 pt-safe">
        <Button 
          variant="ghost" 
          onClick={handleSkip}
          className="text-white/80 hover:text-white hover:bg-white/10 font-medium press-effect"
        >
          Skip
        </Button>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 md:px-8">
        {/* Floating Icon */}
        <div className={cn(
          "relative mb-8 md:mb-12 transition-all duration-300 transform",
          isAnimating ? "opacity-0 scale-75 rotate-12" : "opacity-100 scale-100 rotate-0"
        )}>
          {/* Glow Effect */}
          <div className={cn(
            "absolute inset-0 rounded-[40px] blur-3xl opacity-60 scale-150 bg-gradient-to-br",
            slide.iconBg
          )} />
          
          {/* Icon Container */}
          <div className={cn(
            "relative flex h-28 w-28 md:h-36 md:w-36 items-center justify-center rounded-[36px] md:rounded-[44px] bg-gradient-to-br shadow-2xl animate-float",
            slide.iconBg
          )}>
            {currentSlide === slides.length - 1 ? (
              <img src={logo} alt="Snap Live" className="h-full w-full rounded-[36px] md:rounded-[44px] object-cover" />
            ) : (
              <Icon className="h-14 w-14 md:h-18 md:w-18 text-white drop-shadow-lg" strokeWidth={1.5} />
            )}
          </div>
          
          {/* Floating particles */}
          <div className="absolute -top-6 -right-6 h-8 w-8 rounded-full bg-white/30 backdrop-blur-sm animate-float shadow-lg" style={{ animationDelay: '0s' }} />
          <div className="absolute -bottom-4 -left-8 h-6 w-6 rounded-full bg-white/20 backdrop-blur-sm animate-float" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-1/2 -right-10 h-4 w-4 rounded-full bg-white/25 backdrop-blur-sm animate-float" style={{ animationDelay: '1s' }} />
        </div>

        {/* Text Content */}
        <div className={cn(
          "text-center max-w-sm md:max-w-md transition-all duration-300",
          isAnimating ? "opacity-0 translate-y-8" : "opacity-100 translate-y-0"
        )}>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight text-white drop-shadow-lg">
            {slide.title}
          </h1>
          <p className="text-white/85 text-base md:text-lg leading-relaxed">
            {slide.description}
          </p>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="relative z-20 px-6 md:px-8 pb-8 pb-safe">
        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (index !== currentSlide) {
                  setIsAnimating(true);
                  setTimeout(() => {
                    setCurrentSlide(index);
                    setIsAnimating(false);
                  }, 200);
                }
              }}
              className={cn(
                "h-2.5 rounded-full transition-all duration-300",
                index === currentSlide 
                  ? "w-10 bg-white shadow-lg" 
                  : "w-2.5 bg-white/40 hover:bg-white/60"
              )}
            />
          ))}
        </div>

        {/* Action Button */}
        <Button 
          onClick={handleNext}
          className={cn(
            "w-full h-14 md:h-16 rounded-2xl font-semibold text-lg shadow-2xl press-effect transition-all duration-300",
            currentSlide === slides.length - 1
              ? "bg-white text-gray-900 hover:bg-white/95"
              : "bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30"
          )}
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

        {/* Swipe hint */}
        <p className="text-center text-sm text-white/50 mt-4 md:hidden">
          Swipe to navigate
        </p>
      </div>
    </div>
  );
}
