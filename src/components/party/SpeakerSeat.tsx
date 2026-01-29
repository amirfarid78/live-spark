import React from "react";
import { Mic, MicOff, Lock, Sofa, Crown } from "lucide-react";
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
          <div className="relative">
            {/* Speaking ring animation */}
            {seat.speaker?.isSpeaking && (
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-stream-purple via-stream-coral to-stream-purple animate-spin-slow opacity-60" />
            )}
            <div className={cn(
              "relative rounded-full p-0.5",
              seat.speaker?.isSpeaking && "bg-gradient-to-r from-stream-purple to-stream-coral"
            )}>
              <Avatar className={cn(
                "h-14 w-14 ring-2 ring-offset-2 ring-offset-background",
                seat.speaker?.isSpeaking ? "ring-stream-purple" : "ring-white/20"
              )}>
                <AvatarImage src={seat.speaker?.avatar} />
                <AvatarFallback>{seat.speaker?.name[0]}</AvatarFallback>
              </Avatar>
            </div>
            
            {/* Host crown */}
            {seat.speaker?.isHost && (
              <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                <Crown className="h-4 w-4 text-stream-gold fill-stream-gold" />
              </div>
            )}
            
            {/* Mic status */}
            <div className={cn(
              "absolute -bottom-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center",
              seat.speaker?.isMuted ? "bg-destructive" : "bg-stream-cyan"
            )}>
              {seat.speaker?.isMuted ? (
                <MicOff className="h-3 w-3 text-white" />
              ) : (
                <Mic className="h-3 w-3 text-white" />
              )}
            </div>
            
            {/* Level badge */}
            {seat.speaker?.level && (
              <div className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-gradient-gold flex items-center justify-center">
                <span className="text-[10px] font-bold text-black">{seat.speaker.level}</span>
              </div>
            )}
          </div>
        );

      case "locked":
        return (
          <div className="h-14 w-14 rounded-full bg-muted/30 border-2 border-dashed border-white/10 flex items-center justify-center">
            <Lock className="h-5 w-5 text-white/30" />
          </div>
        );

      case "requested":
        return (
          <div className="h-14 w-14 rounded-full bg-stream-purple/20 border-2 border-stream-purple border-dashed flex items-center justify-center animate-pulse">
            <span className="text-xs text-stream-purple">🙋</span>
          </div>
        );

      case "empty":
      default:
        return (
          <div className="h-14 w-14 rounded-full bg-muted/30 border-2 border-dashed border-white/20 flex items-center justify-center transition-all hover:border-stream-purple/50 hover:bg-stream-purple/10">
            <Sofa className="h-5 w-5 text-white/30" />
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
      <span className="text-[11px] text-white/70 max-w-[64px] truncate">
        {seat.speaker?.name || (seat.status === "locked" ? "Locked" : "")}
      </span>
    </button>
  );
}
