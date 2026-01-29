import React from "react";
import { X, Volume2, VolumeX, Users, Zap, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveTopBarProps {
  viewerCount: number;
  isMuted: boolean;
  onMuteToggle: () => void;
  onClose: () => void;
}

export function LiveTopBar({ viewerCount, isMuted, onMuteToggle, onClose }: LiveTopBarProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 pt-safe">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left - Premium Live Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-xl rounded-full pl-1.5 pr-3.5 py-1.5 border border-white/10">
            {/* Animated Live Dot */}
            <div className="relative flex items-center justify-center h-6 w-6">
              <span className="absolute h-full w-full rounded-full bg-stream-live/40 animate-ping" />
              <span className="absolute h-4 w-4 rounded-full bg-stream-live/60 animate-pulse" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-stream-live shadow-[0_0_10px_rgba(249,38,114,0.8)]" />
            </div>
            <span className="text-xs font-bold text-white tracking-wider">LIVE</span>
          </div>

          {/* Viewer Count Pill */}
          <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-xl rounded-full px-3 py-1.5 border border-white/10">
            <Users className="h-3.5 w-3.5 text-white/80" />
            <span className="text-xs font-semibold text-white">{viewerCount.toLocaleString()}</span>
          </div>

          {/* Quality Badge */}
          <div className="flex items-center gap-1 bg-gradient-to-r from-stream-purple/80 to-stream-coral/80 backdrop-blur-xl rounded-full px-2.5 py-1 border border-white/20">
            <Zap className="h-3 w-3 text-white" />
            <span className="text-[10px] font-bold text-white">HD</span>
          </div>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          {/* Report Button */}
          <button className="h-9 w-9 rounded-full bg-black/50 backdrop-blur-xl border border-white/10 flex items-center justify-center press-effect hover:bg-white/10 transition-colors">
            <Shield className="h-4 w-4 text-white/70" />
          </button>

          {/* Mute Button */}
          <button
            onClick={onMuteToggle}
            className="h-9 w-9 rounded-full bg-black/50 backdrop-blur-xl border border-white/10 flex items-center justify-center press-effect hover:bg-white/10 transition-colors"
          >
            {isMuted ? (
              <VolumeX className="h-4.5 w-4.5 text-white/70" />
            ) : (
              <Volume2 className="h-4.5 w-4.5 text-white" />
            )}
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center press-effect hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
