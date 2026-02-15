import React from "react";
import { Mic, MicOff, Lock, Armchair, Crown, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface Speaker {
  id: string;
  name: string;
  avatar: string;
  isSpeaking: boolean;
  isMuted: boolean;
  isHost?: boolean;
  level?: number;
}

export type SeatStatus = "occupied" | "empty" | "locked" | "requested";

interface SpeakerSeatProps {
  seat: {
    id: number;
    status: SeatStatus;
    speaker?: Speaker;
  };
  onSeatClick: (seatId: number) => void;
  isHost?: boolean;
}

export function SpeakerSeat({ seat, onSeatClick, isHost }: SpeakerSeatProps) {
  const getSeatContent = () => {
    switch (seat.status) {
      case "occupied":
        return (
          <div className="relative group">
            {/* Speaking ring animation - 3D glow effect */}
            {seat.speaker?.isSpeaking && (
              <>
                <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-stream-purple via-stream-coral to-stream-purple animate-spin-slow opacity-40 blur-md" />
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-stream-purple to-stream-coral opacity-60 animate-pulse" />
              </>
            )}
            
            {/* Avatar container with 3D depth */}
            <div className={cn(
              "relative rounded-full p-0.5 transition-all duration-300",
              seat.speaker?.isSpeaking 
                ? "bg-gradient-to-r from-stream-purple to-stream-coral shadow-lg shadow-stream-purple/40" 
                : "bg-white/20"
            )}>
              <Avatar className={cn(
                "h-14 w-14 ring-2 ring-offset-2 ring-offset-transparent transition-all",
                seat.speaker?.isSpeaking ? "ring-white/50" : "ring-white/20",
                "shadow-xl"
              )}>
                <AvatarImage src={seat.speaker?.avatar} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-stream-purple to-stream-coral text-white">
                  {seat.speaker?.name[0]}
                </AvatarFallback>
              </Avatar>
            </div>
            
            {/* Host crown with sparkle effect */}
            {seat.speaker?.isHost && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="relative">
                  <Crown className="h-5 w-5 text-stream-gold fill-stream-gold drop-shadow-lg" />
                  <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-stream-gold animate-pulse" />
                </div>
              </div>
            )}
            
            {/* Mic status with 3D button effect */}
            <div className={cn(
              "absolute -bottom-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center",
              "shadow-lg transform-gpu transition-all",
              seat.speaker?.isMuted 
                ? "bg-gradient-to-br from-red-400 to-red-600" 
                : "bg-gradient-to-br from-stream-cyan to-teal-500"
            )}>
              {seat.speaker?.isMuted ? (
                <MicOff className="h-3.5 w-3.5 text-white" />
              ) : (
                <Mic className="h-3.5 w-3.5 text-white" />
              )}
            </div>
            
            {/* Level badge with 3D effect */}
            {seat.speaker?.level && (
              <div className="absolute -top-1 -right-1 h-6 min-w-6 px-1 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
                <span className="text-[10px] font-bold text-black">{seat.speaker.level}</span>
              </div>
            )}

            {/* Hover glow effect */}
            <div className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/10 transition-all duration-300" />
          </div>
        );

      case "locked":
        return (
          <div className="relative group">
            {/* 3D locked seat */}
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-900/40 to-purple-800/30 border border-white/10 flex items-center justify-center backdrop-blur-sm shadow-inner transition-all group-hover:scale-105">
              <Lock className="h-5 w-5 text-purple-300/60" />
            </div>
            {/* Glossy overlay */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
          </div>
        );

      case "requested":
        return (
          <div className="relative">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-stream-purple/30 to-stream-coral/20 border-2 border-stream-purple border-dashed flex items-center justify-center animate-pulse backdrop-blur-sm">
              <span className="text-lg">🙋</span>
            </div>
          </div>
        );

      case "empty":
      default:
        return (
          <div className="relative group cursor-pointer">
            {/* Empty seat with 3D couch icon */}
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-white/10 flex items-center justify-center backdrop-blur-sm transition-all duration-300 group-hover:scale-105 group-hover:border-stream-purple/50 group-hover:bg-stream-purple/20 shadow-inner">
              <Armchair className="h-6 w-6 text-purple-300/50 group-hover:text-stream-purple transition-colors" />
            </div>
            {/* Hover effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          </div>
        );
    }
  };

  return (
    <button
      onClick={() => onSeatClick(seat.id)}
      className="flex flex-col items-center gap-1.5 press-effect"
    >
      {getSeatContent()}
      <span className="text-[11px] text-white/80 max-w-[64px] truncate font-medium">
        {seat.speaker?.name || (seat.status === "locked" ? "" : "")}
      </span>
    </button>
  );
}
