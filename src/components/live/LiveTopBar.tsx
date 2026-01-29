import React from "react";
import { X, Users, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface TopViewer {
  id: string;
  avatar: string;
  isVIP: boolean;
  level: number;
}

interface LiveTopBarProps {
  hostName: string;
  hostAvatar: string;
  viewerCount: number;
  topViewers: TopViewer[];
  isMuted: boolean;
  onMuteToggle: () => void;
  onClose: () => void;
}

export function LiveTopBar({ hostName, hostAvatar, viewerCount, topViewers, isMuted, onMuteToggle, onClose }: LiveTopBarProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 pt-safe">
      <div className="flex items-center justify-between px-3 py-3">
        {/* Left - Host Info with Viewer Count */}
        <div className="flex items-center gap-2 animate-fade-in-left">
          {/* Host Avatar with Ring */}
          <div className="relative">
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-stream-purple via-stream-coral to-stream-gold animate-spin-slow opacity-75" />
            <Avatar className="relative h-10 w-10 ring-2 ring-black">
              <AvatarImage src={hostAvatar} />
              <AvatarFallback className="text-xs bg-neutral-800">{hostName[0]}</AvatarFallback>
            </Avatar>
          </div>

          {/* Host Name & Viewer Count */}
          <div className="bg-black/50 backdrop-blur-xl rounded-full pl-2 pr-3 py-1.5 border border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white truncate max-w-[70px]">{hostName}</span>
              <div className="flex items-center gap-1 text-white/70">
                <Users className="h-3 w-3" />
                <span className="text-[10px] font-medium">{viewerCount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center - Top Viewers Row */}
        <div className="flex items-center -space-x-1.5 animate-fade-in-up">
          {topViewers.slice(0, 5).map((viewer, index) => (
            <div key={viewer.id} className="relative" style={{ zIndex: 5 - index }}>
              {/* VIP Frame */}
              {viewer.isVIP && viewer.level >= 2 && (
                <div className={cn(
                  "absolute -inset-1 rounded-full",
                  viewer.level === 3 
                    ? "bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500" 
                    : "bg-gradient-to-r from-stream-purple to-stream-coral"
                )}>
                  {/* Crown decoration for level 3 */}
                  {viewer.level === 3 && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                      <span className="text-[10px]">👑</span>
                    </div>
                  )}
                </div>
              )}
              <Avatar className={cn(
                "relative h-8 w-8 ring-2",
                viewer.isVIP ? "ring-black" : "ring-white/20"
              )}>
                <AvatarImage src={viewer.avatar} />
                <AvatarFallback className="text-[8px] bg-neutral-800">U</AvatarFallback>
              </Avatar>
            </div>
          ))}
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2 animate-fade-in-right">
          {/* Add User Button */}
          <button className="h-9 w-9 rounded-full bg-black/50 backdrop-blur-xl border border-white/10 flex items-center justify-center press-effect hover:bg-white/10 transition-colors">
            <UserPlus className="h-4 w-4 text-white/80" />
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full bg-white/15 backdrop-blur-xl border border-white/20 flex items-center justify-center press-effect hover:bg-white/25 transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
