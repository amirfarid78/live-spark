import React, { useEffect, useState } from "react";
import { Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { FlyingGift } from "./LiveRoomViewer";

interface LiveGiftAnimationProps {
  gift: FlyingGift;
}

export function LiveGiftAnimation({ gift }: LiveGiftAnimationProps) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Stage progression for animation
    const timers = [
      setTimeout(() => setStage(1), 100),
      setTimeout(() => setStage(2), 500),
      setTimeout(() => setStage(3), 2500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="fixed inset-0 z-[95] pointer-events-none overflow-hidden">
      {/* Sparkle burst effect */}
      <div className={cn(
        "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500",
        stage >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-0"
      )}>
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "absolute h-2 w-2 rounded-full bg-stream-gold transition-all",
              stage >= 2 ? "opacity-0" : "opacity-100"
            )}
            style={{
              transform: `rotate(${i * 30}deg) translateY(${stage >= 1 ? -80 : 0}px)`,
              transitionDelay: `${i * 30}ms`,
              transitionDuration: "600ms",
            }}
          />
        ))}
      </div>

      {/* Main gift display */}
      <div className={cn(
        "absolute left-1/2 top-1/3 -translate-x-1/2 flex flex-col items-center transition-all duration-700",
        stage >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-50",
        stage >= 3 ? "opacity-0 translate-y-[-100px]" : ""
      )}>
        {/* Glow ring */}
        <div className="relative">
          <div className="absolute -inset-8 rounded-full bg-gradient-to-r from-stream-gold via-yellow-400 to-orange-500 opacity-30 blur-xl animate-pulse" />
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-stream-gold to-orange-500 opacity-20 blur-md" />
          
          {/* Gift icon container */}
          <div className={cn(
            "relative h-28 w-28 rounded-full bg-gradient-to-br from-[#2a1f4e] to-[#1a1030] flex items-center justify-center",
            "border-4 border-stream-gold/50 shadow-2xl shadow-stream-gold/30",
            stage >= 1 && "animate-bounce-in"
          )}>
            {/* Rotating sparkle ring */}
            <div className="absolute inset-0 rounded-full animate-spin-slow">
              <Sparkles className="absolute -top-2 left-1/2 -translate-x-1/2 h-4 w-4 text-stream-gold" />
              <Star className="absolute top-1/2 -right-2 -translate-y-1/2 h-3 w-3 text-yellow-400 fill-yellow-400" />
              <Sparkles className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-4 w-4 text-orange-400" />
              <Star className="absolute top-1/2 -left-2 -translate-y-1/2 h-3 w-3 text-stream-gold fill-stream-gold" />
            </div>
            
            {/* Gift emoji */}
            <span className="text-6xl animate-pulse drop-shadow-[0_0_20px_rgba(255,200,50,0.5)]">
              {gift.icon}
            </span>
          </div>
        </div>

        {/* Gift name badge */}
        <div className={cn(
          "mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-stream-gold via-yellow-400 to-orange-500 transition-all duration-500",
          stage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <span className="text-sm font-bold text-black">{gift.name}</span>
        </div>

        {/* Sender info */}
        <div className={cn(
          "mt-2 text-white/80 text-sm transition-all duration-500",
          stage >= 2 ? "opacity-100" : "opacity-0"
        )}>
          <span className="font-medium text-stream-cyan">{gift.sender}</span>
          <span className="text-white/60"> sent a gift!</span>
        </div>
      </div>

      {/* Flying particles */}
      {stage >= 1 && stage < 3 && (
        <>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-gift-particle"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 40}%`,
                animationDelay: `${Math.random() * 1000}ms`,
                animationDuration: `${1500 + Math.random() * 1000}ms`,
              }}
            >
              <span className="text-2xl opacity-80">
                {["✨", "⭐", "💫", "🌟"][Math.floor(Math.random() * 4)]}
              </span>
            </div>
          ))}
        </>
      )}

      {/* Bottom ribbon effect */}
      <div className={cn(
        "absolute bottom-32 left-0 right-0 flex items-center justify-center transition-all duration-700",
        stage >= 2 && stage < 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}>
        <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-stream-purple/90 via-stream-coral/90 to-stream-purple/90 backdrop-blur-xl border border-white/20 shadow-2xl">
          <span className="text-3xl">{gift.icon}</span>
          <div className="flex flex-col">
            <span className="text-xs text-white/70">Gift Received!</span>
            <span className="text-sm font-bold text-white">{gift.name}</span>
          </div>
          <div className="ml-2 flex items-center gap-1">
            <span className="text-stream-gold font-bold">x1</span>
            <Sparkles className="h-4 w-4 text-stream-gold animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
