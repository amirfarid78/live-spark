import React from "react";
import { Users, Lock, Volume2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface PartyRoom {
  id: string;
  name: string;
  hostName: string;
  hostAvatar: string;
  coverImage?: string;
  viewerCount: number;
  speakerCount: number;
  maxSpeakers: number;
  isPrivate: boolean;
  isLive: boolean;
  category: string;
  tags?: string[];
  topViewers?: string[];
}

interface PartyRoomCardProps {
  room: PartyRoom;
  onClick: () => void;
  index?: number;
}

const categoryGradients: Record<string, string> = {
  Chat: "from-pink-200 via-pink-100 to-pink-50",
  Dating: "from-rose-200 via-rose-100 to-orange-50",
  Music: "from-emerald-200 via-green-100 to-lime-50",
  Gaming: "from-violet-200 via-purple-100 to-indigo-50",
  Talent: "from-cyan-200 via-teal-100 to-emerald-50",
  Chill: "from-amber-200 via-yellow-100 to-orange-50",
  default: "from-blue-200 via-sky-100 to-cyan-50",
};

const categoryColors: Record<string, string> = {
  Chat: "bg-pink-400 text-white",
  Dating: "bg-rose-400 text-white",
  Music: "bg-emerald-500 text-white",
  Gaming: "bg-violet-500 text-white",
  Talent: "bg-cyan-500 text-white",
  Chill: "bg-amber-500 text-white",
  default: "bg-blue-500 text-white",
};

const mockViewerAvatars: string[] = [];

export function PartyRoomCard({ room, onClick, index = 0 }: PartyRoomCardProps) {
  const gradient = categoryGradients[room.category] || categoryGradients.default;
  const categoryColor = categoryColors[room.category] || categoryColors.default;
  const viewers = room.topViewers || mockViewerAvatars;

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-3xl cursor-pointer transition-all duration-500",
        "hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98]",
        "animate-fade-in-up",
        "shadow-lg hover:shadow-2xl",
        // 3D effect
        "transform-gpu perspective-1000",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/40 before:to-transparent before:rounded-3xl before:opacity-60"
      )}
      style={{
        animationDelay: `${index * 80}ms`,
        transform: "translateZ(0)",
      }}
    >
      {/* Gradient Background */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-90",
        gradient
      )} />
      
      {/* Glossy overlay for 3D depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-black/5 rounded-3xl" />
      
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Content */}
      <div className="relative p-4 flex items-center gap-3">
        {/* Host Avatar with 3D ring */}
        <div className="relative flex-shrink-0">
          {/* Animated glow ring */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-stream-purple via-stream-coral to-stream-purple opacity-40 blur-sm animate-spin-slow" />
          <div className="relative">
            <Avatar className="h-16 w-16 rounded-2xl ring-4 ring-white shadow-xl">
              <AvatarImage src={room.hostAvatar} className="object-cover" />
              <AvatarFallback className="rounded-2xl bg-gradient-to-br from-stream-purple to-stream-coral text-white text-lg">
                {room.hostName[0]}
              </AvatarFallback>
            </Avatar>
            {room.isLive && (
              <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-stream-live ring-3 ring-white flex items-center justify-center">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              </span>
            )}
          </div>
        </div>

        {/* Room Info */}
        <div className="flex-1 min-w-0">
          {/* Name with emoji */}
          <h3 className="text-base font-bold text-gray-800 truncate flex items-center gap-1">
            {room.name}
          </h3>
          
          {/* Category Badge */}
          <Badge className={cn(
            "mt-1 text-[10px] font-semibold border-0 rounded-full px-2.5 py-0.5 shadow-sm",
            categoryColor
          )}>
            {room.category}
          </Badge>

          {/* Viewer Avatars */}
          <div className="flex items-center mt-2 -space-x-2">
            {viewers.slice(0, 4).map((avatar, i) => (
              <Avatar 
                key={i} 
                className={cn(
                  "h-6 w-6 ring-2 ring-white shadow-sm transition-transform",
                  "hover:scale-110 hover:z-10"
                )}
                style={{ zIndex: 4 - i }}
              >
                <AvatarImage src={avatar} />
                <AvatarFallback className="text-[8px] bg-gray-200">U</AvatarFallback>
              </Avatar>
            ))}
            {room.viewerCount > 4 && (
              <span className="ml-2 text-[11px] font-medium text-gray-600">
                +{room.viewerCount - 4}
              </span>
            )}
          </div>
        </div>

        {/* Right Side - Viewer Count with Sound Wave */}
        <div className="flex flex-col items-end gap-2">
          {room.isPrivate && (
            <Lock className="h-4 w-4 text-gray-500" />
          )}
          
          {/* Sound Wave Animation */}
          <div className="flex items-center gap-1 bg-white/60 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-inner">
            <div className="flex items-end gap-0.5 h-4">
              {[0.6, 1, 0.7, 0.9, 0.5].map((height, i) => (
                <div
                  key={i}
                  className="w-0.5 bg-stream-purple rounded-full animate-sound-wave"
                  style={{
                    height: `${height * 100}%`,
                    animationDelay: `${i * 100}ms`,
                  }}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-gray-700 ml-1">
              {room.viewerCount}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom shine effect */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
    </div>
  );
}
