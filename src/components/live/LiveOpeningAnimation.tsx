import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, Zap, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveOpeningAnimationProps {
  hostName: string;
  hostAvatar: string;
  thumbnail: string;
}

export function LiveOpeningAnimation({ hostName, hostAvatar, thumbnail }: LiveOpeningAnimationProps) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 200),
      setTimeout(() => setStage(2), 600),
      setTimeout(() => setStage(3), 1000),
      setTimeout(() => setStage(4), 1400),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden">
      {/* Background with blur effect */}
      <div className="absolute inset-0">
        <img
          src={thumbnail}
          alt=""
          className={cn(
            "h-full w-full object-cover transition-all duration-1000",
            stage >= 1 ? "scale-100 blur-0" : "scale-125 blur-xl"
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/80" />
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "absolute h-1 w-1 bg-stream-gold rounded-full transition-all duration-1000",
              stage >= 2 ? "opacity-100" : "opacity-0"
            )}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animation: stage >= 2 ? "float-particle 3s ease-in-out infinite" : "none",
            }}
          />
        ))}
      </div>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Animated rings */}
        <div className="relative">
          {/* Outer ring */}
          <div className={cn(
            "absolute -inset-8 rounded-full border-2 border-stream-purple/50 transition-all duration-700",
            stage >= 1 ? "scale-100 opacity-100" : "scale-0 opacity-0"
          )}>
            <div className="absolute inset-0 rounded-full animate-spin-slow">
              <Sparkles className="absolute -top-2 left-1/2 -translate-x-1/2 h-4 w-4 text-stream-purple" />
            </div>
          </div>

          {/* Middle ring */}
          <div className={cn(
            "absolute -inset-5 rounded-full border border-stream-coral/50 transition-all duration-700 delay-100",
            stage >= 1 ? "scale-100 opacity-100" : "scale-0 opacity-0"
          )}>
            <div className="absolute inset-0 rounded-full animate-spin-reverse-slow">
              <Star className="absolute -right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-stream-coral fill-stream-coral" />
            </div>
          </div>

          {/* Inner glow ring */}
          <div className={cn(
            "absolute -inset-2 rounded-full bg-gradient-to-br from-stream-purple via-stream-coral to-stream-gold blur-md transition-all duration-500",
            stage >= 2 ? "opacity-60" : "opacity-0"
          )} />

          {/* Avatar */}
          <Avatar className={cn(
            "h-28 w-28 ring-4 ring-white/30 ring-offset-4 ring-offset-black/50 transition-all duration-700 shadow-2xl shadow-stream-purple/50",
            stage >= 1 ? "scale-100 opacity-100" : "scale-50 opacity-0"
          )}>
            <AvatarImage src={hostAvatar} className="object-cover" />
            <AvatarFallback className="text-2xl bg-gradient-to-br from-stream-purple to-stream-coral text-white">
              {hostName[0]}
            </AvatarFallback>
          </Avatar>

          {/* Live badge on avatar */}
          <div className={cn(
            "absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-stream-live px-3 py-1 rounded-full transition-all duration-500",
            stage >= 3 ? "scale-100 opacity-100" : "scale-0 opacity-0"
          )}>
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] font-bold text-white tracking-wider">LIVE</span>
          </div>
        </div>

        {/* Host name */}
        <h2 className={cn(
          "mt-8 text-2xl font-bold text-white transition-all duration-500",
          stage >= 3 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        )}>
          {hostName}
        </h2>

        {/* Subtitle */}
        <p className={cn(
          "mt-2 text-sm text-white/60 transition-all duration-500 delay-100",
          stage >= 3 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        )}>
          is now streaming
        </p>

        {/* Joining indicator */}
        <div className={cn(
          "mt-8 flex items-center gap-2 transition-all duration-500",
          stage >= 4 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        )}>
          <div className="flex gap-1">
            <span className="h-2 w-2 rounded-full bg-stream-cyan animate-bounce" style={{ animationDelay: "0s" }} />
            <span className="h-2 w-2 rounded-full bg-stream-cyan animate-bounce" style={{ animationDelay: "0.1s" }} />
            <span className="h-2 w-2 rounded-full bg-stream-cyan animate-bounce" style={{ animationDelay: "0.2s" }} />
          </div>
          <span className="text-xs text-stream-cyan font-medium">Joining stream...</span>
        </div>

        {/* Bottom flash effects */}
        <div className={cn(
          "absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-2 transition-all duration-300",
          stage >= 4 ? "opacity-100" : "opacity-0"
        )}>
          <Zap className="h-4 w-4 text-stream-gold animate-pulse" />
          <span className="text-xs text-stream-gold font-medium">HD Quality</span>
          <Zap className="h-4 w-4 text-stream-gold animate-pulse" />
        </div>
      </div>

      {/* Corner decorations */}
      <div className={cn(
        "absolute top-10 left-10 transition-all duration-700 delay-300",
        stage >= 2 ? "opacity-100" : "opacity-0"
      )}>
        <Sparkles className="h-6 w-6 text-stream-gold/50 animate-pulse" />
      </div>
      <div className={cn(
        "absolute top-20 right-14 transition-all duration-700 delay-500",
        stage >= 2 ? "opacity-100" : "opacity-0"
      )}>
        <Star className="h-4 w-4 text-stream-coral/50 fill-stream-coral/50 animate-pulse" />
      </div>
      <div className={cn(
        "absolute bottom-32 left-8 transition-all duration-700 delay-400",
        stage >= 2 ? "opacity-100" : "opacity-0"
      )}>
        <Star className="h-5 w-5 text-stream-purple/50 fill-stream-purple/50 animate-pulse" />
      </div>
    </div>
  );
}
